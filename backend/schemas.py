from typing import Optional, List, Any
from pydantic import BaseModel, ConfigDict


class UserResponse(BaseModel):
    id: int
    name: str
    role: str

    model_config = ConfigDict(from_attributes=True)


class ApplicationCreate(BaseModel):
    citizen_id: int
    pdf_url: str


class ScrutinyReportResponse(BaseModel):
    id: int
    application_id: int
    gemini_raw_json: Optional[Any] = None
    rule_violations: Optional[Any] = None

    model_config = ConfigDict(from_attributes=True)


class ApplicationResponse(BaseModel):
    id: int
    citizen_id: int
    officer_id: Optional[int] = None
    status: str
    pdf_url: str
    scrutiny_reports: Optional[List[ScrutinyReportResponse]] = []

    model_config = ConfigDict(from_attributes=True)


class ApplicationDetailResponse(BaseModel):
    id: int
    citizen_id: int
    officer_id: Optional[int] = None
    status: str
    pdf_url: str
    scrutiny_reports: List[ScrutinyReportResponse] = []

    model_config = ConfigDict(from_attributes=True)


class StatusUpdateRequest(BaseModel):
    status: str


class VerifyRuleRequest(BaseModel):
    rule_code: str
    parameter: Optional[str] = None


class VerifyRuleResponse(BaseModel):
    citation: str
    url: str

