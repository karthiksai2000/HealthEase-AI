from pydantic import BaseModel, EmailStr, Field
from datetime import datetime, date
from typing import Optional, List
from enum import Enum

# --------------------
# Enums
# --------------------
class UserRole(str, Enum):
    USER = "USER"
    DOCTOR = "DOCTOR"
    ADMIN = "ADMIN"

class DoctorStatus(str, Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    SUSPENDED = "SUSPENDED"

class HospitalStatus(str, Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"

class AppointmentType(str, Enum):
    IN_PERSON = "IN_PERSON"
    VIDEO = "VIDEO"

class AppointmentStatus(str, Enum):
    REQUESTED = "REQUESTED"
    CONFIRMED = "CONFIRMED"
    CANCELLED = "CANCELLED"
    COMPLETED = "COMPLETED"
    NO_SHOW = "NO_SHOW"

class FileType(str, Enum):
    PRESCRIPTION = "PRESCRIPTION"
    LAB_REPORT = "LAB_REPORT"
    SCAN = "SCAN"
    MEDICAL_HISTORY = "MEDICAL_HISTORY"
    OTHER = "OTHER"

class Gender(str, Enum):
    M = "M"
    F = "F"
    O = "O"

class UrgencyLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    EMERGENCY = "EMERGENCY"

# --------------------
# User Schemas
# --------------------
class UserBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    age: Optional[int] = Field(None, ge=0, le=150)
    gender: Optional[Gender] = None
    location: Optional[str] = None
    address: Optional[str] = None

class UserCreate(UserBase):
    password: str

class User(UserBase):
    user_id: int
    is_verified: bool
    role: UserRole
    created_at: datetime
    updated_at: datetime

    class Config:
         from_attributes = True

class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    age: Optional[int] = Field(None, ge=0, le=150)
    gender: Optional[Gender] = None
    location: Optional[str] = None
    address: Optional[str] = None

# --------------------
# Doctor Schemas
# --------------------
class DoctorBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    specialization: str
    license_number: str
    experience_years: int
    qualifications: Optional[str] = None
    bio: Optional[str] = None
    hospital_id: Optional[int] = None
    consultation_fee: float
    availability: Optional[str] = None  # JSON string

class DoctorCreate(DoctorBase):
    password: str

class Doctor(DoctorBase):
    doctor_id: int
    status: DoctorStatus
    is_online: bool
    role: UserRole
    created_at: datetime
    updated_at: datetime

    class Config:
         from_attributes = True

class DoctorUpdate(BaseModel):
    phone: Optional[str] = None
    specialization: Optional[str] = None
    qualifications: Optional[str] = None
    bio: Optional[str] = None
    consultation_fee: Optional[float] = None
    availability: Optional[str] = None
    is_online: Optional[bool] = None

# --------------------
# Hospital Schemas
# --------------------
class HospitalBase(BaseModel):
    name: str
    address: str
    location_lat: float
    location_long: float
    contact_number: str
    email: Optional[EmailStr] = None
    website: Optional[str] = None

class HospitalCreate(HospitalBase):
    pass

class Hospital(HospitalBase):
    hospital_id: int
    status: HospitalStatus
    created_at: datetime
    updated_at: datetime

    class Config:
         from_attributes = True

# --------------------
# Appointment Schemas
# --------------------
class AppointmentBase(BaseModel):
    user_id: int
    doctor_id: Optional[int] = None
    hospital_id: Optional[int] = None
    appointment_type: AppointmentType
    appointment_time: datetime
    duration: Optional[int] = 30
    symptoms: Optional[str] = None
    notes: Optional[str] = None

class AppointmentCreate(AppointmentBase):
    pass

class UserInfo(BaseModel):
    user_id: int
    full_name: str

    class Config:
         from_attributes = True

class Appointment(BaseModel):
    appointment_id: int
    user: UserInfo
    appointment_time: datetime
    status: AppointmentStatus
    appointment_type: AppointmentType
    duration: Optional[int]
    symptoms: Optional[str]
    notes: Optional[str]
    video_link: Optional[str]

    class Config:
         from_attributes = True

class AppointmentUpdate(BaseModel):
    appointment_time: Optional[datetime] = None
    duration: Optional[int] = None
    status: Optional[AppointmentStatus] = None
    notes: Optional[str] = None
    video_link: Optional[str] = None

# --------------------
# Medical Records
# --------------------
class MedicalRecordBase(BaseModel):
    user_id: int
    file_name: str
    file_type: FileType
    description: Optional[str] = None

class MedicalRecordCreate(MedicalRecordBase):
    pass

class MedicalRecord(MedicalRecordBase):
    record_id: int
    file_url: str
    uploaded_at: datetime

    class Config:
         from_attributes = True

# --------------------
# Prescription
# --------------------
class Medication(BaseModel):
    name: str
    dosage: str
    frequency: str
    duration: str

class PrescriptionBase(BaseModel):
    appointment_id: int
    doctor_id: int
    user_id: int
    diagnosis: str
    instructions: Optional[str] = None
    follow_up_date: Optional[date] = None

class PrescriptionCreate(PrescriptionBase):
    medications: List[Medication]

class Prescription(PrescriptionBase):
    prescription_id: int
    medications: str  # JSON string
    created_at: datetime

    class Config:
         from_attributes = True

# --------------------
# Doctor Documents
# --------------------
class DoctorDocumentBase(BaseModel):
    doctor_id: int
    file_name: str
    file_type: FileType
    description: Optional[str] = None

class DoctorDocumentCreate(DoctorDocumentBase):
    pass

class DoctorDocument(DoctorDocumentBase):
    document_id: int
    file_url: str
    uploaded_at: datetime

    class Config:
         from_attributes = True

# --------------------
# Symptom Check Schemas
# --------------------
class SymptomCheckBase(BaseModel):
    user_id: int
    symptoms: List[str]  # or str if you store as comma-separated
    severity: Optional[UrgencyLevel] = UrgencyLevel.LOW
    notes: Optional[str] = None

class SymptomCheckCreate(SymptomCheckBase):
    pass

class SymptomCheck(SymptomCheckBase):
    check_id: int
    created_at: datetime

    class Config:
         from_attributes = True  # or from_attributes=True if Pydantic v2
# --------------------
# Admin Schemas
# --------------------
class AdminBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None

class AdminCreate(AdminBase):
    password: str

class Admin(AdminBase):
    admin_id: int
    role: UserRole = UserRole.ADMIN
    created_at: datetime
    updated_at: datetime

    class Config:
         from_attributes = True  # or from_attributes=True if using Pydantic v2
# --------------------
# Call Booking Schemas
# --------------------
class CallBookingBase(BaseModel):
    user_id: int
    doctor_id: int
    call_time: datetime
    duration: Optional[int] = 30
    notes: Optional[str] = None

class CallBookingCreate(CallBookingBase):
    pass

class CallBooking(CallBookingBase):
    booking_id: int
    created_at: datetime

    class Config:
         from_attributes = True  # or from_attributes=True if using Pydantic v2
# --------------------
# Doctor Search Schema
# --------------------
class DoctorSearch(BaseModel):
    name: Optional[str] = None
    specialization: Optional[str] = None
    hospital_id: Optional[int] = None
    min_experience: Optional[int] = None
    max_fee: Optional[float] = None

    class Config:
         from_attributes = True  # or from_attributes=True for Pydantic v2
# --------------------
# Hospital Search Schema
# --------------------
class HospitalSearch(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None
    min_rating: Optional[float] = None  # if you have ratings
    max_distance: Optional[float] = None  # if you calculate distance from user

    class Config:
        from_attributes = True  # Pydantic v2
# --------------------
# Symptom Analysis Response Schema
# --------------------
class SymptomAnalysisResponse(BaseModel):
    probable_conditions: List[str]  # List of possible diseases or conditions
    urgency_level: UrgencyLevel
    recommended_action: Optional[str] = None  # e.g., "See a doctor", "Home care"
    notes: Optional[str] = None

    class Config:
        from_attributes = True  # for Pydantic v2
# --------------------
# Token Schema for authentication
# --------------------
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

    class Config:
        from_attributes = True
        # --------------------
# Symptom Analysis Request Schema
# --------------------
class SymptomAnalysisRequest(BaseModel):
    user_id: int
    symptoms: List[str]

    class Config:
        from_attributes = True  # Pydantic v2


