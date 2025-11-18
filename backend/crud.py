from http.client import HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List
from datetime import datetime
import json

import models, schemas
from auth import get_password_hash, verify_password


# -----------------------------
# User CRUD
# -----------------------------
def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.user_id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        name=user.name,
        email=user.email,
        phone=user.phone,
        password_hash=hashed_password,
        age=user.age,
        gender=user.gender,
        location=user.location,
        address=user.address
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, user_id: int, user_update: schemas.UserUpdate):
    db_user = get_user(db, user_id)
    if not db_user:
        return None
    update_data = user_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_user, field, value)
    db.commit()
    db.refresh(db_user)
    return db_user

def delete_user(db: Session, user_id: int):
    db_user = get_user(db, user_id)
    if not db_user:
        return None
    db.delete(db_user)
    db.commit()
    return db_user


# -----------------------------
# Doctor CRUD
# -----------------------------
def get_doctor(db: Session, doctor_id: int):
    return db.query(models.Doctor).filter(models.Doctor.doctor_id == doctor_id).first()

def get_doctor_by_email(db: Session, email: str):
    return db.query(models.Doctor).filter(models.Doctor.email == email).first()

def get_doctors(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Doctor).offset(skip).limit(limit).all()

def get_doctors_by_specialization(db: Session, specialization: str):
    return db.query(models.Doctor).filter(
        models.Doctor.specialization.ilike(f"%{specialization}%")
    ).all()

def get_approved_doctors(db: Session):
    return db.query(models.Doctor).filter(models.Doctor.status == models.DoctorStatus.APPROVED).all()

def create_doctor(db: Session, doctor: schemas.DoctorCreate):
    hashed_password = get_password_hash(doctor.password)
    db_doctor = models.Doctor(
        name=doctor.name,
        email=doctor.email,
        phone=doctor.phone,
        password_hash=hashed_password,
        specialization=doctor.specialization,
        license_number=doctor.license_number,
        experience_years=doctor.experience_years,
        qualifications=doctor.qualifications,
        bio=doctor.bio,
        hospital_id=doctor.hospital_id,
        consultation_fee=doctor.consultation_fee,
        availability=doctor.availability
    )
    db.add(db_doctor)
    db.commit()
    db.refresh(db_doctor)
    return db_doctor

def update_doctor(db: Session, doctor_id: int, doctor_update: schemas.DoctorUpdate):
    db_doctor = get_doctor(db, doctor_id)
    if not db_doctor:
        return None
    update_data = doctor_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_doctor, field, value)
    db.commit()
    db.refresh(db_doctor)
    return db_doctor

def update_doctor_status(db: Session, doctor_id: int, status: models.DoctorStatus):
    db_doctor = get_doctor(db, doctor_id)
    if not db_doctor:
        return None
    db_doctor.status = status
    db.commit()
    db.refresh(db_doctor)
    return db_doctor


# -----------------------------
# Hospital CRUD
# -----------------------------
def get_hospital(db: Session, hospital_id: int):
    return db.query(models.Hospital).filter(models.Hospital.hospital_id == hospital_id).first()

def get_hospitals(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Hospital).offset(skip).limit(limit).all()

def get_approved_hospitals(db: Session):
    return db.query(models.Hospital).filter(models.Hospital.status == models.HospitalStatus.APPROVED).all()

def create_hospital(db: Session, hospital: schemas.HospitalCreate):
    db_hospital = models.Hospital(
        name=hospital.name,
        address=hospital.address,
        location_lat=hospital.location_lat,
        location_long=hospital.location_long,
        contact_number=hospital.contact_number,
        email=hospital.email,
        website=hospital.website
    )
    db.add(db_hospital)
    db.commit()
    db.refresh(db_hospital)
    return db_hospital

def update_hospital_status(db: Session, hospital_id: int, status: models.HospitalStatus):
    db_hospital = get_hospital(db, hospital_id)
    if not db_hospital:
        return None
    db_hospital.status = status
    db.commit()
    db.refresh(db_hospital)
    return db_hospital


# -----------------------------
# Appointment CRUD
# -----------------------------
def get_appointment(db: Session, appointment_id: int):
    return db.query(models.Appointment).filter(
        models.Appointment.appointment_id == appointment_id
    ).first()

def get_appointments(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Appointment).offset(skip).limit(limit).all()

def get_user_appointments(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return (
        db.query(models.Appointment)
        .options(joinedload(models.Appointment.doctor))
        .filter(models.Appointment.user_id == user_id)
        .offset(skip)
        .limit(limit)
        .all()
    )

def get_doctor_appointments(db: Session, doctor_id: int):
    doctor = db.query(models.Doctor).filter(models.Doctor.doctor_id == doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    # Get appointments either directly assigned OR hospital-wide
    appointments = (
        db.query(models.Appointment)
        .filter(
            (models.Appointment.doctor_id == doctor_id) |
            (models.Appointment.hospital_id == doctor.hospital_id)
        )
        .all()
    )
    return appointments

def get_upcoming_appointments(db: Session, user_id: int):
    now = datetime.now()
    return (
        db.query(models.Appointment)
        .filter(models.Appointment.user_id == user_id)
        .filter(models.Appointment.appointment_time > now)
        .all()
    )

def create_appointment(db: Session, appointment: schemas.AppointmentCreate):
    db_appointment = models.Appointment(**appointment.dict())
    db.add(db_appointment)
    db.commit()
    db.refresh(db_appointment)
    return db_appointment

def update_appointment(db: Session, appointment_id: int, appointment_update: schemas.AppointmentUpdate):
    appointment = get_appointment(db, appointment_id)
    if not appointment:
        return None
    update_data = appointment_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(appointment, field, value)
    db.commit()
    db.refresh(appointment)
    return appointment

def update_appointment_status(db: Session, appointment_id: int, status: schemas.AppointmentStatus):
    appointment = get_appointment(db, appointment_id)
    if not appointment:
        return None
    appointment.status = status.status
    db.commit()
    db.refresh(appointment)
    return appointment

def delete_appointment(db: Session, appointment_id: int):
    appointment = get_appointment(db, appointment_id)
    if not appointment:
        return None
    db.delete(appointment)
    db.commit()
    return True



# -----------------------------
# Prescription CRUD
# -----------------------------
def get_prescription(db: Session, prescription_id: int):
    return db.query(models.Prescription).filter(
        models.Prescription.prescription_id == prescription_id
    ).first()

def get_user_prescriptions(db: Session, user_id: int):
    return db.query(models.Prescription).filter(models.Prescription.user_id == user_id).all()

def create_prescription(db: Session, prescription: schemas.PrescriptionCreate):
    medications_json = json.dumps([med.dict() for med in prescription.medications])
    db_prescription = models.Prescription(
        appointment_id=prescription.appointment_id,
        doctor_id=prescription.doctor_id,
        user_id=prescription.user_id,
        diagnosis=prescription.diagnosis,
        medications=medications_json,
        instructions=prescription.instructions,
        follow_up_date=prescription.follow_up_date
    )
    db.add(db_prescription)
    db.commit()
    db.refresh(db_prescription)
    return db_prescription


# -----------------------------
# Medical Records CRUD
# -----------------------------
def get_medical_record(db: Session, record_id: int):
    return db.query(models.MedicalRecord).filter(models.MedicalRecord.record_id == record_id).first()

def get_user_medical_records(db: Session, user_id: int):
    return db.query(models.MedicalRecord).filter(models.MedicalRecord.user_id == user_id).all()

def create_medical_record(db: Session, medical_record: schemas.MedicalRecordCreate, file_url: str):
    db_medical_record = models.MedicalRecord(
        user_id=medical_record.user_id,
        file_url=file_url,
        file_name=medical_record.file_name,
        file_type=medical_record.file_type,
        description=medical_record.description
    )
    db.add(db_medical_record)
    db.commit()
    db.refresh(db_medical_record)
    return db_medical_record


# -----------------------------
# Doctor Document CRUD
# -----------------------------
def get_doctor_document(db: Session, document_id: int):
    return db.query(models.DoctorDocument).filter(models.DoctorDocument.document_id == document_id).first()

def get_doctor_documents(db: Session, doctor_id: int):
    return db.query(models.DoctorDocument).filter(models.DoctorDocument.doctor_id == doctor_id).all()

def create_doctor_document(db: Session, document: schemas.DoctorDocumentCreate, file_url: str):
    db_document = models.DoctorDocument(
        doctor_id=document.doctor_id,
        document_type=document.document_type,
        file_url=file_url
    )
    db.add(db_document)
    db.commit()
    db.refresh(db_document)
    return db_document

def verify_doctor_document(db: Session, document_id: int):
    db_document = get_doctor_document(db, document_id)
    if db_document:
        db_document.verified = True
        db.commit()
        db.refresh(db_document)
    return db_document


# -----------------------------
# Symptom Check CRUD
# -----------------------------
def get_symptom_check(db: Session, check_id: int):
    return db.query(models.SymptomCheck).filter(models.SymptomCheck.check_id == check_id).first()

def get_user_symptom_checks(db: Session, user_id: int):
    return db.query(models.SymptomCheck).filter(models.SymptomCheck.user_id == user_id).all()

def create_symptom_check(db: Session, symptom_check: schemas.SymptomCheckCreate, 
                        suggested_specialization: str, urgency: models.UrgencyLevel, 
                        recommended_doctors: List[int]):
    doctors_json = json.dumps(recommended_doctors)
    db_symptom_check = models.SymptomCheck(
        user_id=symptom_check.user_id,
        symptoms=symptom_check.symptoms,
        suggested_specialization=suggested_specialization,
        urgency=urgency,
        recommended_doctors=doctors_json
    )
    db.add(db_symptom_check)
    db.commit()
    db.refresh(db_symptom_check)
    return db_symptom_check


# -----------------------------
# Admin CRUD
# -----------------------------
def get_admin_by_email(db: Session, email: str):
    return db.query(models.Admin).filter(models.Admin.email == email).first()

def create_admin(db: Session, admin: schemas.AdminCreate):
    hashed_password = get_password_hash(admin.password)
    db_admin = models.Admin(
        name=admin.name,
        email=admin.email,
        password_hash=hashed_password
    )
    db.add(db_admin)
    db.commit()
    db.refresh(db_admin)
    return db_admin


# -----------------------------
# Call Booking CRUD
# -----------------------------
def get_call_booking(db: Session, call_id: int):
    return db.query(models.CallBooking).filter(models.CallBooking.call_id == call_id).first()

def get_call_bookings(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.CallBooking).offset(skip).limit(limit).all()

def create_call_booking(db: Session, call_booking: schemas.CallBookingCreate):
    db_call_booking = models.CallBooking(
        caller_number=call_booking.caller_number,
        user_id=call_booking.user_id,
        symptoms=call_booking.symptoms,
        booked_appointment_id=call_booking.booked_appointment_id,
        call_duration=call_booking.call_duration,
        status=call_booking.status
    )
    db.add(db_call_booking)
    db.commit()
    db.refresh(db_call_booking)
    return db_call_booking

def update_call_booking_with_analysis(db: Session, call_id: int, suggested_specialization: str, urgency: models.UrgencyLevel):
    db_call_booking = get_call_booking(db, call_id)
    if db_call_booking:
        db_call_booking.suggested_specialization = suggested_specialization
        db_call_booking.urgency = urgency
        db.commit()
        db.refresh(db_call_booking)
    return db_call_booking


# -----------------------------
# Search
# -----------------------------
def search_doctors(db: Session, search: schemas.DoctorSearch):
    query = db.query(models.Doctor).filter(models.Doctor.status == models.DoctorStatus.APPROVED)
    
    if search.specialization:
        query = query.filter(models.Doctor.specialization.ilike(f"%{search.specialization}%"))
    if search.min_experience:
        query = query.filter(models.Doctor.experience_years >= search.min_experience)
    if search.max_fee:
        query = query.filter(models.Doctor.consultation_fee <= search.max_fee)
    return query.all()

def search_hospitals(db: Session, search: schemas.HospitalSearch):
    query = db.query(models.Hospital).filter(models.Hospital.status == models.HospitalStatus.APPROVED)
    
    if search.name:
        query = query.filter(models.Hospital.name.ilike(f"%{search.name}%"))
    if search.location:
        query = query.filter(models.Hospital.address.ilike(f"%{search.location}%"))
    return query.all()


# -----------------------------
# Authentication
# -----------------------------
def authenticate_user(db: Session, username: str, password: str):
    user = get_user_by_email(db, username)
    if user and verify_password(password, user.password_hash):
        return user

    doctor = get_doctor_by_email(db, username)
    if doctor and verify_password(password, doctor.password_hash):
        return doctor

    admin = get_admin_by_email(db, username)
    if admin and verify_password(password, admin.password_hash):
        return admin

    return False
