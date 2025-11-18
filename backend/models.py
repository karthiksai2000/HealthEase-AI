from sqlalchemy import Column, Integer, String, DateTime, Float, Enum, Text, ForeignKey, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum

Base = declarative_base()

# Enums for various status types
class UserRole(str, enum.Enum):
    USER = "USER"
    DOCTOR = "DOCTOR"
    ADMIN = "ADMIN"

class DoctorStatus(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    SUSPENDED = "SUSPENDED"

class HospitalStatus(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"

class AppointmentType(str, enum.Enum):
    IN_PERSON = "IN_PERSON"
    VIDEO = "VIDEO"

class AppointmentStatus(str, enum.Enum):
    REQUESTED = "REQUESTED"
    CONFIRMED = "CONFIRMED"
    CANCELLED = "CANCELLED"
    COMPLETED = "COMPLETED"
    NO_SHOW = "NO_SHOW"

class FileType(str, enum.Enum):
    PRESCRIPTION = "PRESCRIPTION"
    LAB_REPORT = "LAB_REPORT"
    SCAN = "SCAN"
    MEDICAL_HISTORY = "MEDICAL_HISTORY"
    OTHER = "OTHER"

class Gender(str, enum.Enum):
    M = "M"
    F = "F"
    O = "O"

class UrgencyLevel(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    EMERGENCY = "EMERGENCY"

# Users Table (Patients)
class User(Base):
    __tablename__ = "users"
    
    user_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    phone = Column(String(15), unique=True)
    password_hash = Column(String(255), nullable=False)
    age = Column(Integer)
    gender = Column(Enum(Gender))
    location = Column(String(255))
    address = Column(Text)
    is_verified = Column(Boolean, default=False)
    role = Column(Enum(UserRole), default=UserRole.USER)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    medical_records = relationship("MedicalRecord", back_populates="user")
    appointments = relationship("Appointment", back_populates="user")
    symptoms = relationship("SymptomCheck", back_populates="user")

# Doctors Table
class Doctor(Base):
    __tablename__ = "doctors"
    
    doctor_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    phone = Column(String(15))
    password_hash = Column(String(255), nullable=False)
    specialization = Column(String(100))
    license_number = Column(String(50))
    experience_years = Column(Integer)
    qualifications = Column(Text)
    bio = Column(Text)
    status = Column(Enum(DoctorStatus), default=DoctorStatus.PENDING)
    hospital_id = Column(Integer, ForeignKey("hospitals.hospital_id"))
    consultation_fee = Column(Float)
    availability = Column(Text)  # JSON string of available times
    is_online = Column(Boolean, default=False)
    role = Column(Enum(UserRole), default=UserRole.DOCTOR)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    hospital = relationship("Hospital", back_populates="doctors")
    appointments = relationship("Appointment", back_populates="doctor")
    documents = relationship("DoctorDocument", back_populates="doctor")

# Hospitals/Clinics Table
class Hospital(Base):
    __tablename__ = "hospitals"
    
    hospital_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    address = Column(Text)
    location_lat = Column(Float)
    location_long = Column(Float)
    contact_number = Column(String(15))
    email = Column(String(100))
    website = Column(String(200))
    status = Column(Enum(HospitalStatus), default=HospitalStatus.PENDING)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    doctors = relationship("Doctor", back_populates="hospital")
    appointments = relationship("Appointment", back_populates="hospital")

# Appointments Table
class Appointment(Base):
    __tablename__ = "appointments"
    
    appointment_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"))
    doctor_id = Column(Integer, ForeignKey("doctors.doctor_id"))
    hospital_id = Column(Integer, ForeignKey("hospitals.hospital_id"))
    appointment_type = Column(Enum(AppointmentType))
    video_link = Column(String(255))
    appointment_time = Column(DateTime)
    duration = Column(Integer, default=30)  # in minutes
    symptoms = Column(Text)
    urgency = Column(Enum(UrgencyLevel), default=UrgencyLevel.MEDIUM)
    status = Column(Enum(AppointmentStatus), default=AppointmentStatus.REQUESTED)
    notes = Column(Text)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="appointments")
    doctor = relationship("Doctor", back_populates="appointments")
    hospital = relationship("Hospital", back_populates="appointments")
    prescription = relationship("Prescription", back_populates="appointment", uselist=False)

# Medical Records Table
class MedicalRecord(Base):
    __tablename__ = "medical_records"
    
    record_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"))
    file_url = Column(String(255))
    file_name = Column(String(200))
    file_type = Column(Enum(FileType))
    description = Column(Text)
    uploaded_at = Column(DateTime, default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="medical_records")

# Prescriptions Table
class Prescription(Base):
    __tablename__ = "prescriptions"
    
    prescription_id = Column(Integer, primary_key=True, index=True)
    appointment_id = Column(Integer, ForeignKey("appointments.appointment_id"))
    doctor_id = Column(Integer, ForeignKey("doctors.doctor_id"))
    user_id = Column(Integer, ForeignKey("users.user_id"))
    diagnosis = Column(Text)
    medications = Column(Text)  # JSON string of medications
    instructions = Column(Text)
    follow_up_date = Column(DateTime)
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    appointment = relationship("Appointment", back_populates="prescription")
    doctor = relationship("Doctor")
    user = relationship("User")

# Doctor Documents Table (for verification)
class DoctorDocument(Base):
    __tablename__ = "doctor_documents"
    
    document_id = Column(Integer, primary_key=True, index=True)
    doctor_id = Column(Integer, ForeignKey("doctors.doctor_id"))
    document_type = Column(String(100))  # license, id_proof, degree, etc.
    file_url = Column(String(255))
    verified = Column(Boolean, default=False)
    uploaded_at = Column(DateTime, default=func.now())
    
    # Relationships
    doctor = relationship("Doctor", back_populates="documents")

# Symptom Check Table (AI Chatbot results)
class SymptomCheck(Base):
    __tablename__ = "symptom_checks"
    
    check_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"))
    symptoms = Column(Text)
    suggested_specialization = Column(String(100))
    urgency = Column(Enum(UrgencyLevel))
    recommended_doctors = Column(Text)  # JSON array of doctor IDs
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="symptoms")

# Admins Table
class Admin(Base):
    __tablename__ = "admins"
    
    admin_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.ADMIN)
    created_at = Column(DateTime, default=func.now())
    
# Call Bookings Table
class CallBooking(Base):
    __tablename__ = "call_bookings"
    
    call_id = Column(Integer, primary_key=True, index=True)
    caller_number = Column(String(15))
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=True)
    symptoms = Column(Text)
    suggested_specialization = Column(String(100))
    urgency = Column(Enum(UrgencyLevel))
    booked_appointment_id = Column(Integer, ForeignKey("appointments.appointment_id"), nullable=True)
    call_timestamp = Column(DateTime, default=func.now())
    call_duration = Column(Integer)  # in seconds
    status = Column(String(50), default="COMPLETED")  # COMPLETED, FAILED, etc.
    
    # Relationships
    user = relationship("User")
    appointment = relationship("Appointment")