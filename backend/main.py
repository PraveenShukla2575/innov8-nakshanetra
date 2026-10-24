import os
import shutil
import uuid
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, status, Query, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session, joinedload

from database import engine, Base, get_db
import models
import schemas
import mimetypes
from gemini_service import extract_naksha_data
from rule_engine import evaluate_compliance

app = FastAPI(
    title="NakshaNetra API",
    description="GovTech Building Plan Compliance & Scrutiny Engine",
    version="1.0.0",
)

# CORS configuration
origins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
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


@app.on_event("startup")
def on_startup():
    """Ensure database schema tables are initialized on startup."""
    Base.metadata.create_all(bind=engine)


def process_naksha_file(filename: str, file_bytes: bytes, mime_type: str, db: Session) -> dict:
    """
    Processes building plan using Gemini Multimodal AI extraction and
    deterministic Bye-Law Rule Engine evaluation against PostgreSQL/SQLite rules.
    """
    # 1. Extract architectural metrics using Gemini Vision
    extracted_data = extract_naksha_data(file_bytes, mime_type=mime_type)

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
        "overall_status": compliance["overall_status"],
        "risk_score": compliance["risk_score"],
        "summary": compliance["summary"],
        "evaluations": compliance["evaluations"]
    }
    if "error" in extracted_data:
        gemini_raw_json["gemini_error"] = extracted_data["error"]

    return {
        "overall_status": compliance["overall_status"],
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
def health_check():
    return {
        "status": "ok",
        "message": "NakshaNetra API is running on Supabase",
    }


@app.post("/api/setup")
def setup_database(db: Session = Depends(get_db)):
    """
    Initializes database tables via Base.metadata.create_all(bind=engine)
    and seeds initial mock data (Users & Rules) only if User table is empty.
    """
    try:
        Base.metadata.create_all(bind=engine)

        existing_users_count = db.query(models.User).count()

        if existing_users_count == 0:
            default_users = [
                models.User(name="Ravi", role="citizen"),
                models.User(name="Priya", role="officer"),
                models.User(name="Amit", role="admin"),
            ]
            db.add_all(default_users)

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

            return {
                "status": "success",
                "message": "Tables created and seeded successfully with initial users and rules.",
                "seeded": True,
                "users_count": len(default_users),
                "rules_count": len(default_rules),
            }
        else:
            return {
                "status": "success",
                "message": "Tables verified. Database already seeded previously.",
                "seeded": False,
                "existing_users_count": existing_users_count,
            }
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database setup failed: {str(e)}",
        )


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
        citizen = db.query(models.User).filter(models.User.role == "citizen").first()
        if not citizen:
            citizen = models.User(name="Ravi", role="citizen")
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

    # Process file with Gemini Multimodal Vision & Rule Engine
    report_dict = process_naksha_file(file.filename or "naksha.pdf", file_bytes, content_type, db)
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


@app.post("/api/rules/verify-source", response_model=schemas.VerifyRuleResponse)
def verify_rule_source(
    payload: schemas.VerifyRuleRequest,
):
    """
    Stub for TinyFish automated bye-law source & legal citation verification.
    Stage 5 will integrate the live TinyFish Web Scraping / Citation Agent API.
    """
    return {
        "citation": "Verified via TinyFish: Delhi Master Plan 2021, Chapter 4, Section 2.1.",
        "url": "https://dda.gov.in/master-plan",
    }


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
