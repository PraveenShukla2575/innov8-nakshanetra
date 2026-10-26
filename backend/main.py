import os
import shutil
import uuid
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, status, Query, UploadFile, File, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, text, inspect

from database import engine, Base, get_db, SessionLocal
import models
import schemas
import mimetypes
from gemini_service import extract_naksha_data
from rule_engine import evaluate_compliance
from tinyfish_service import fetch_regulatory_citation, verify_architect_license
from auth import hash_password, verify_password, create_access_token, decode_access_token

app = FastAPI(
    title="NakshaNetra API",
    description="GovTech Building Plan Compliance & Scrutiny Engine",
    version="1.0.0",
)

frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# CORS configuration
origins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:5175",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Local uploads directory for storing submitted architectural drawings
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


def migrate_and_seed_db(db: Session):
    """
    Ensures that the users table schema has all required columns:
    full_name, email, hashed_password, role, zone, status.
    Safely migrates SQLite or PostgreSQL tables and seeds default demo users.
    """
    Base.metadata.create_all(bind=engine)
    inspector = inspect(engine)
    tables = inspector.get_table_names()

    if "users" in tables:
        columns = [c["name"] for c in inspector.get_columns("users")]
        with engine.connect() as conn:
            if "full_name" not in columns:
                conn.execute(text("ALTER TABLE users ADD COLUMN full_name VARCHAR(255)"))
                if "name" in columns:
                    conn.execute(text("UPDATE users SET full_name = name WHERE full_name IS NULL"))
            if "email" not in columns:
                conn.execute(text("ALTER TABLE users ADD COLUMN email VARCHAR(255)"))
            if "hashed_password" not in columns:
                conn.execute(text("ALTER TABLE users ADD COLUMN hashed_password VARCHAR(255)"))
            if "zone" not in columns:
                conn.execute(text("ALTER TABLE users ADD COLUMN zone VARCHAR(255) DEFAULT 'Delhi (MCD)'"))
            if "status" not in columns:
                conn.execute(text("ALTER TABLE users ADD COLUMN status VARCHAR(50) DEFAULT 'APPROVED'"))
            if "name" in columns:
                try:
                    conn.execute(text("ALTER TABLE users ALTER COLUMN name DROP NOT NULL"))
                except Exception:
                    pass
            conn.commit()

    # Seed / ensure default demo users with correct hashed passwords and roles
    demo_users = [
        {
            "id": 1,
            "full_name": "Ravi Kumar",
            "email": "citizen.ravi@gmail.com",
            "password": "Citizen@Naksha2026",
            "role": "CITIZEN",
            "zone": "Delhi (MCD)",
            "status": "APPROVED",
        },
        {
            "id": 2,
            "full_name": "Priya Sharma",
            "email": "officer.priya@mcd.gov.in",
            "password": "Officer@Naksha2026",
            "role": "OFFICER",
            "zone": "South Delhi Division",
            "status": "APPROVED",
        },
        {
            "id": 3,
            "full_name": "Amit Verma",
            "email": "admin@nakshanetra.gov.in",
            "password": "Admin@Naksha2026",
            "role": "ADMIN",
            "zone": "Central Command HQ",
            "status": "APPROVED",
        },
    ]

    for u_data in demo_users:
        user = (
            db.query(models.User)
            .filter(
                (models.User.id == u_data["id"])
                | (func.lower(models.User.email) == u_data["email"].lower())
            )
            .first()
        )
        if user:
            user.full_name = user.full_name or u_data["full_name"]
            user.email = user.email or u_data["email"]
            if not user.hashed_password:
                user.hashed_password = hash_password(u_data["password"])
            user.role = user.role or u_data["role"]
            user.zone = user.zone or u_data["zone"]
            user.status = user.status or u_data["status"]
        else:
            new_user = models.User(
                id=u_data["id"],
                full_name=u_data["full_name"],
                email=u_data["email"],
                hashed_password=hash_password(u_data["password"]),
                role=u_data["role"],
                zone=u_data["zone"],
                status=u_data["status"],
            )
            db.add(new_user)

    # Seed default rules if empty
    if db.query(models.Rule).count() == 0:
        default_rules = [
            models.Rule(
                rule_code="BL-001",
                parameter="rear_setback_meters",
                operator=">=",
                required_value=3.0,
            ),
            models.Rule(
                rule_code="BL-002",
                parameter="ground_coverage_percent",
                operator="<=",
                required_value=50.0,
            ),
        ]
        db.add_all(default_rules)

    db.commit()


@app.on_event("startup")
def on_startup():
    """Ensure database schema tables are initialized and migrated on startup."""
    with SessionLocal() as db:
        migrate_and_seed_db(db)


async def process_naksha_file(filename: str, file_bytes: bytes, mime_type: str, db: Session) -> dict:
    """
    Processes building plan using Gemini Multimodal AI extraction and
    deterministic Bye-Law Rule Engine evaluation against PostgreSQL/SQLite rules.
    """
    # 1. Extract architectural metrics using Gemini Vision (non-blocking async)
    extracted_data = await extract_naksha_data(file_bytes, mime_type=mime_type)

    # 2. Query active Bye-Law Rules from Database
    db_rules = db.query(models.Rule).all()

    # 3. Evaluate compliance against rules
    compliance = evaluate_compliance(extracted_data, db_rules)

    # 4. Construct Scrutiny Report payloads
    gemini_raw_json = {
        "document_name": filename,
        "mime_type": mime_type,
        "rear_setback_meters": extracted_data.get("rear_setback_meters"),
        "ground_coverage_percent": extracted_data.get("ground_coverage_percent"),
        "raw_model": extracted_data.get("raw_model"),
        "status": compliance["overall_status"],
        "overall_status": compliance["overall_status"],
        "penalty_score": compliance.get("penalty_score", compliance["risk_score"]),
        "risk_score": compliance["risk_score"],
        "summary": compliance["summary"],
        "evaluations": compliance["evaluations"]
    }
    if "error" in extracted_data:
        gemini_raw_json["gemini_error"] = extracted_data["error"]

    return {
        "status": compliance["overall_status"],
        "overall_status": compliance["overall_status"],
        "penalty_score": compliance.get("penalty_score", compliance["risk_score"]),
        "risk_score": compliance["risk_score"],
        "gemini_raw_json": gemini_raw_json,
        "rule_violations": compliance["violations"] if compliance["violations"] else compliance["evaluations"]
    }


def process_naksha_pdf(filename: str, file_bytes: bytes) -> dict:
    """Compatibility fallback stub for legacy tests/calls."""
    return {
        "gemini_raw_json": {
            "document_name": filename,
            "rear_setback_meters": 4.0,
            "ground_coverage_percent": 45.0,
            "overall_status": "APPROVED",
            "risk_score": 0.0,
            "summary": "Plan satisfies standard bye-law limits."
        },
        "rule_violations": []
    }


@app.get("/")
def read_root():
    return {
        "engine": "NakshaNetra",
        "description": "Civic Tech Building Plan Compliance Engine",
        "status": "operational",
        "health_check": "/api/health",
        "setup_endpoint": "/api/setup",
        "docs": "/docs",
    }


@app.get("/api/health")
async def health_check():
    return {
        "status": "ok",
        "message": "NakshaNetra API is running on Supabase",
    }


@app.post("/api/setup")
def setup_database(db: Session = Depends(get_db)):
    """
    Initializes database tables, verifies columns, and seeds demo users and rules.
    """
    try:
        migrate_and_seed_db(db)
        users_count = db.query(models.User).count()
        rules_count = db.query(models.Rule).count()
        return {
            "status": "success",
            "message": "Tables created, schema verified, and seeded successfully.",
            "seeded": True,
            "users_count": users_count,
            "rules_count": rules_count,
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database setup failed: {str(e)}",
        )


# ============================================================================
# AUTHENTICATION & ACCESS CONTROL ENDPOINTS
# ============================================================================

@app.post("/api/auth/register", status_code=status.HTTP_201_CREATED)
def register(
    payload: schemas.UserRegister,
    db: Session = Depends(get_db),
):
    """
    Register new Citizen, Officer, or Admin:
    - If email exists -> HTTP 400: 'User already exists. Please log in.'
    - If role == 'OFFICER' -> status = 'PENDING'
    - If role == 'CITIZEN' or 'ADMIN' -> status = 'APPROVED'
    """
    if not payload.email or not payload.password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email and password are required.",
        )

    normalized_email = payload.email.strip().lower()
    existing_user = (
        db.query(models.User)
        .filter(func.lower(models.User.email) == normalized_email)
        .first()
    )
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already exists. Please log in.",
        )

    role_str = (payload.role or "CITIZEN").strip().upper()
    if role_str == "OFFICER":
        user_status = "PENDING"
    else:
        user_status = "APPROVED"

    hashed = hash_password(payload.password)

    display_name = (payload.full_name or payload.name or "").strip()
    if not display_name:
        display_name = payload.email.split("@")[0].title()

    new_user = models.User(
        name=display_name,
        full_name=display_name,
        email=normalized_email,
        hashed_password=hashed,
        role=role_str,
        zone=payload.zone or "Delhi (MCD)",
        status=user_status,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token(
        data={"sub": new_user.email, "id": new_user.id, "role": new_user.role}
    )

    return {
        "message": (
            "Registration successful. Details sent to Admin for approval."
            if user_status == "PENDING"
            else "Registration successful."
        ),
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": new_user.id,
            "full_name": new_user.full_name,
            "name": new_user.full_name,
            "email": new_user.email,
            "role": new_user.role,
            "zone": new_user.zone,
            "status": new_user.status,
        },
    }


@app.post("/api/auth/login")
async def login(
    request: Request,
    db: Session = Depends(get_db),
):
    """
    Authenticate user via JSON body or OAuth2 form:
    - If credentials invalid -> HTTP 401: 'Invalid email or password.'
    - If status == 'PENDING' -> HTTP 403: 'Account pending Admin approval.'
    - If valid -> returns access_token and user profile.
    """
    email = None
    password = None

    content_type = request.headers.get("content-type", "")
    if "application/json" in content_type:
        try:
            body = await request.json()
            email = body.get("email") or body.get("username")
            password = body.get("password")
        except Exception:
            pass

    if not email or not password:
        try:
            form = await request.form()
            email = email or form.get("username") or form.get("email")
            password = password or form.get("password")
        except Exception:
            pass

    if not email or not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email and password are required.",
        )

    normalized_email = email.strip().lower()
    user = (
        db.query(models.User)
        .filter(func.lower(models.User.email) == normalized_email)
        .first()
    )

    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    if user.status and user.status.upper() == "PENDING":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account pending Admin approval.",
        )

    token = create_access_token(
        data={"sub": user.email, "id": user.id, "role": user.role}
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "name": user.full_name,
            "email": user.email,
            "role": user.role,
            "zone": user.zone,
            "status": user.status,
        },
    }


# ============================================================================
# ADMIN OFFICER APPROVAL WORKFLOW ENDPOINTS
# ============================================================================

@app.get("/api/admin/pending-officers", response_model=List[schemas.UserAuthResponse])
def get_pending_officers(db: Session = Depends(get_db)):
    """
    Fetches all officer accounts awaiting administrator approval.
    """
    officers = (
        db.query(models.User)
        .filter(
            func.upper(models.User.role) == "OFFICER",
            func.upper(models.User.status) == "PENDING",
        )
        .order_by(models.User.id.desc())
        .all()
    )
    return officers


@app.patch("/api/admin/approve-officer/{user_id}", response_model=schemas.UserAuthResponse)
def approve_officer(user_id: int, db: Session = Depends(get_db)):
    """
    Approves a pending officer, allowing them to authenticate and access the officer portal.
    """
    officer = db.query(models.User).filter(models.User.id == user_id).first()
    if not officer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Officer with ID {user_id} not found.",
        )
    officer.status = "APPROVED"
    db.commit()
    db.refresh(officer)
    return officer


@app.get("/api/users", response_model=List[schemas.UserResponse])
def get_users(db: Session = Depends(get_db)):
    """
    Returns all registered users to populate the Role Switcher dropdown.
    """
    return db.query(models.User).all()


@app.post(
    "/api/applications/upload",
    response_model=schemas.ApplicationDetailResponse,
    status_code=status.HTTP_201_CREATED,
)
async def upload_application(
    file: UploadFile = File(...),
    citizen_id: Optional[int] = Form(None),
    db: Session = Depends(get_db),
):
    """
    Citizen upload endpoint: Accepts Naksha PDF, saves it, creates an Application
    with status 'PENDING_OFFICER', and attaches an initial ScrutinyReport.
    """
    # Ensure citizen exists or default to first citizen
    if citizen_id is not None:
        citizen = db.query(models.User).filter(models.User.id == citizen_id).first()
        if not citizen:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Citizen with id {citizen_id} not found",
            )
    else:
        citizen = db.query(models.User).filter(func.lower(models.User.role) == "citizen").first()
        if not citizen:
            citizen = models.User(
                full_name="Ravi Kumar",
                email="citizen.ravi@gmail.com",
                hashed_password=hash_password("Citizen@Naksha2026"),
                role="CITIZEN",
                zone="Delhi (MCD)",
                status="APPROVED",
            )
            db.add(citizen)
            db.commit()
            db.refresh(citizen)
        citizen_id = citizen.id

    # Read and persist file locally
    file_bytes = await file.read()
    safe_filename = f"{uuid.uuid4().hex[:8]}_{file.filename or 'naksha.pdf'}"
    local_file_path = os.path.join(UPLOAD_DIR, safe_filename)
    with open(local_file_path, "wb") as f:
        f.write(file_bytes)

    # Determine mime type
    content_type = file.content_type
    if not content_type or content_type == "application/octet-stream":
        guessed_type, _ = mimetypes.guess_type(file.filename or "")
        content_type = guessed_type or "image/jpeg"

    # Process file with Gemini Multimodal Vision & Rule Engine (non-blocking)
    report_dict = await process_naksha_file(file.filename or "naksha.pdf", file_bytes, content_type, db)
    application_status = report_dict["overall_status"]

    # Create new application with evaluated compliance status (APPROVED, REJECTED, PENDING_REVIEW)
    new_application = models.Application(
        citizen_id=citizen_id,
        pdf_url=f"/uploads/{safe_filename}",
        status=application_status,
        officer_id=None,
    )
    db.add(new_application)
    db.commit()
    db.refresh(new_application)

    # Attach ScrutinyReport with extracted metrics and rule evaluations
    scrutiny_report = models.ScrutinyReport(
        application_id=new_application.id,
        gemini_raw_json=report_dict["gemini_raw_json"],
        rule_violations=report_dict["rule_violations"],
    )
    db.add(scrutiny_report)
    db.commit()
    db.refresh(scrutiny_report)
    db.refresh(new_application)

    return new_application


@app.get("/api/applications", response_model=List[schemas.ApplicationDetailResponse])
def get_applications(
    role: Optional[str] = Query(None, description="Role filter: officer, admin, or citizen"),
    user_id: Optional[int] = Query(None, description="ID of the user requesting applications"),
    db: Session = Depends(get_db),
):
    """
    Fetches the application queue dynamically:
    - role=officer: returns applications with status PENDING_OFFICER
    - role=admin: returns applications with status PENDING_ADMIN
    - role=citizen (optional user_id): returns applications submitted by citizen
    - no role: returns all applications
    """
    query = db.query(models.Application).options(joinedload(models.Application.scrutiny_reports))

    if role:
        normalized_role = role.strip().lower()
        if normalized_role == "officer":
            query = query.filter(
                models.Application.status.in_(["PENDING_OFFICER", "pending_officer"])
            )
        elif normalized_role == "admin":
            query = query.filter(
                models.Application.status.in_(["PENDING_ADMIN", "pending_admin"])
            )
        elif normalized_role == "citizen":
            if user_id is not None:
                query = query.filter(models.Application.citizen_id == user_id)
        else:
            query = query.filter(models.Application.status.ilike(normalized_role))
    elif user_id is not None:
        query = query.filter(models.Application.citizen_id == user_id)

    return query.order_by(models.Application.id.desc()).all()


@app.get("/api/applications/{app_id}", response_model=schemas.ApplicationDetailResponse)
def get_application(
    app_id: int,
    db: Session = Depends(get_db),
):
    """
    Fetch a specific application along with its associated ScrutinyReport.
    """
    app_record = (
        db.query(models.Application)
        .options(joinedload(models.Application.scrutiny_reports))
        .filter(models.Application.id == app_id)
        .first()
    )
    if not app_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Application with id {app_id} not found",
        )
    return app_record


@app.patch("/api/applications/{app_id}/status", response_model=schemas.ApplicationDetailResponse)
def update_application_status(
    app_id: int,
    status_update: schemas.StatusUpdateRequest,
    db: Session = Depends(get_db),
):
    """
    Update application status (e.g. APPROVED, REJECTED, PENDING_ADMIN, PENDING_OFFICER).
    """
    app_record = (
        db.query(models.Application)
        .options(joinedload(models.Application.scrutiny_reports))
        .filter(models.Application.id == app_id)
        .first()
    )
    if not app_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Application with id {app_id} not found",
        )
    app_record.status = status_update.status
    db.commit()
    db.refresh(app_record)
    return app_record


@app.post(
    "/api/applications",
    response_model=schemas.ApplicationResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_application(
    app_in: schemas.ApplicationCreate,
    db: Session = Depends(get_db),
):
    """
    JSON stub route for manual application creation.
    """
    citizen = db.query(models.User).filter(models.User.id == app_in.citizen_id).first()
    if not citizen:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {app_in.citizen_id} not found",
        )

    new_application = models.Application(
        citizen_id=app_in.citizen_id,
        pdf_url=app_in.pdf_url,
        status="PENDING_OFFICER",
        officer_id=None,
    )
    db.add(new_application)
    db.commit()
    db.refresh(new_application)
    return new_application


@app.post("/api/applications/verify-architect", response_model=schemas.VerifyArchitectResponse)
def verify_architect(
    request: schemas.VerifyArchitectRequest,
):
    """
    Performs real-time background and license status verification on the architect/builder
    using the TinyFish Web Agent against Council of Architecture (CoA) India and RERA registries.
    """
    reg_number = request.reg_number or request.registration_number or "CA/2015/64321"
    result = verify_architect_license(
        architect_name=request.architect_name,
        registration_number=reg_number
    )
    return result


@app.post("/api/rules/verify-source", response_model=schemas.VerifyRuleResponse)
def verify_rule_source(
    request: schemas.VerifyRuleRequest,
):
    """
    Compatibility alias: Scrapes and verifies live regulatory citations for building bye-laws
    using the TinyFish Web Agent API.
    """
    result = fetch_regulatory_citation(rule_code=request.rule_code, parameter=request.parameter)
    return result


@app.get("/api/rules")
def get_rules(db: Session = Depends(get_db)):
    rules = db.query(models.Rule).all()
    return [
        {
            "id": r.id,
            "rule_code": r.rule_code,
            "parameter": r.parameter,
            "operator": r.operator,
            "required_value": r.required_value,
        }
        for r in rules
    ]
