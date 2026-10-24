from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import os

from database import engine, Base, get_db
import models
import schemas

app = FastAPI(
    title="NakshaNetra API",
    description="GovTech Building Plan Compliance & Scrutiny Engine",
    version="1.0.0",
)

# CORS configuration
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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
        # Create all tables defined in models
        Base.metadata.create_all(bind=engine)

        # Check if users already exist
        existing_users_count = db.query(models.User).count()

        if existing_users_count == 0:
            # Seed default users
            default_users = [
                models.User(name="Ravi", role="citizen"),
                models.User(name="Priya", role="officer"),
                models.User(name="Amit", role="admin"),
            ]
            db.add_all(default_users)

            # Seed compliance rules
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


@app.get("/api/applications", response_model=List[schemas.ApplicationResponse])
def get_applications(
    user_id: int = Query(..., description="ID of the user requesting applications"),
    role: str = Query(..., description="Role of the user: citizen, officer, or admin"),
    db: Session = Depends(get_db),
):
    """
    Fetches the application queue dynamically based on role:
    - citizen: returns applications submitted by citizen_id == user_id
    - officer: returns applications where status == 'pending_officer'
    - admin: returns applications where status == 'pending_admin'
    """
    normalized_role = role.strip().lower()

    if normalized_role == "citizen":
        return (
            db.query(models.Application)
            .filter(models.Application.citizen_id == user_id)
            .all()
        )
    elif normalized_role == "officer":
        return (
            db.query(models.Application)
            .filter(models.Application.status == "pending_officer")
            .all()
        )
    elif normalized_role == "admin":
        return (
            db.query(models.Application)
            .filter(models.Application.status == "pending_admin")
            .all()
        )
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role '{role}'. Expected 'citizen', 'officer', or 'admin'.",
        )


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
    Stub route that accepts citizen_id and pdf_url,
    creates a new Application with status='pending_officer', and returns it.
    """
    # Verify citizen exists
    citizen = db.query(models.User).filter(models.User.id == app_in.citizen_id).first()
    if not citizen:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {app_in.citizen_id} not found",
        )

    new_application = models.Application(
        citizen_id=app_in.citizen_id,
        pdf_url=app_in.pdf_url,
        status="pending_officer",
        officer_id=None,
    )
    db.add(new_application)
    db.commit()
    db.refresh(new_application)
    return new_application


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
