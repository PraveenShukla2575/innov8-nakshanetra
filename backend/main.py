from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import os

from database import engine, Base, get_db
import models

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


@app.get("/api/users")
def get_users(db: Session = Depends(get_db)):
    users = db.query(models.User).all()
    return [{"id": u.id, "name": u.name, "role": u.role} for u in users]


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
