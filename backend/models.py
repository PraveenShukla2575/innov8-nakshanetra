from sqlalchemy import Column, Integer, String, Float, ForeignKey, JSON
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False)  # 'citizen', 'officer', 'admin'

    # Relationships
    submitted_applications = relationship(
        "Application",
        foreign_keys="Application.citizen_id",
        back_populates="citizen",
        cascade="all, delete-orphan",
    )
    reviewed_applications = relationship(
        "Application",
        foreign_keys="Application.officer_id",
        back_populates="officer",
    )

    def __repr__(self):
        return f"<User(id={self.id}, name='{self.name}', role='{self.role}')>"


class Rule(Base):
    __tablename__ = "rules"

    id = Column(Integer, primary_key=True, index=True)
    rule_code = Column(String(100), unique=True, index=True, nullable=False)
    parameter = Column(String(255), nullable=False)
    operator = Column(String(10), nullable=False)  # '>=', '<=', '==', etc.
    required_value = Column(Float, nullable=False)

    def __repr__(self):
        return f"<Rule(code='{self.rule_code}', {self.parameter} {self.operator} {self.required_value})>"


class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    citizen_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    officer_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    status = Column(String(50), default="pending", nullable=False)
    pdf_url = Column(String(1024), nullable=False)

    # Relationships
    citizen = relationship("User", foreign_keys=[citizen_id], back_populates="submitted_applications")
    officer = relationship("User", foreign_keys=[officer_id], back_populates="reviewed_applications")
    scrutiny_reports = relationship("ScrutinyReport", back_populates="application", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Application(id={self.id}, citizen_id={self.citizen_id}, status='{self.status}')>"


class ScrutinyReport(Base):
    __tablename__ = "scrutiny_reports"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id"), nullable=False)
    gemini_raw_json = Column(JSON, nullable=True)
    rule_violations = Column(JSON, nullable=True)

    # Relationships
    application = relationship("Application", back_populates="scrutiny_reports")

    def __repr__(self):
        return f"<ScrutinyReport(id={self.id}, application_id={self.application_id})>"
