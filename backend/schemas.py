from typing import Optional
from pydantic import BaseModel, ConfigDict


class UserResponse(BaseModel):
    id: int
    name: str
    role: str

    model_config = ConfigDict(from_attributes=True)


class ApplicationCreate(BaseModel):
    citizen_id: int
    pdf_url: str


class ApplicationResponse(BaseModel):
    id: int
    citizen_id: int
    officer_id: Optional[int] = None
    status: str
    pdf_url: str

    model_config = ConfigDict(from_attributes=True)
