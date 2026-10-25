from typing import Optional, List, Any
from pydantic import BaseModel, ConfigDict


class UserRegister(BaseModel):
    full_name: Optional[str] = None
    name: Optional[str] = None
    email: str
    password: str
    role: Optional[str] = "CITIZEN"
    zone: Optional[str] = "Delhi (MCD)"


class UserLogin(BaseModel):
    email: str
    password: str


class UserAuthResponse(BaseModel):
    id: int
    full_name: str
    name: Optional[str] = None
    email: str
    role: str
    zone: Optional[str] = None
    status: str

    model_config = ConfigDict(from_attributes=True)


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserAuthResponse


class UserResponse(BaseModel):
    id: int
    full_name: Optional[str] = None
    name: Optional[str] = None
    email: Optional[str] = None
    role: str
    zone: Optional[str] = None
    status: Optional[str] = None

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

