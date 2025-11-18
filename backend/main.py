from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form, Query, APIRouter
from fastapi.responses import FileResponse
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
import os
import shutil
import json

# Import our modules
import models, schemas, crud, auth
from database import SessionLocal, engine, get_db
from ai_symptom_checker import analyze_symptoms
from video_consultation import create_google_meet_link, send_video_consultation_emails
from notifications import send_appointment_confirmation, send_appointment_reminder, send_prescription_ready_notification
from telephony import handle_incoming_call, schedule_appointment_from_call
from config import settings
from fastapi.middleware.cors import CORSMiddleware
from dashboard_api import dashboard_router

origins = [
    "http://localhost:5173",  # your frontend URL
]

# Create database tables
models.Base.metadata.create_all(bind=engine)

# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)


# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(dashboard_router)

# Create upload directory if it doesn't exist
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Welcome to Healthcare Booking System API",
        "version": settings.APP_VERSION,
        "docs": "/docs"
    }

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now()}

# Authentication endpoints
@app.post("/token", response_model=schemas.Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = crud.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Determine role for token
    if hasattr(user, 'role'):
        role = user.role
    else:
        # Default role based on model type
        if isinstance(user, models.Doctor):
            role = schemas.UserRole.DOCTOR
        elif isinstance(user, models.Admin):
            role = schemas.UserRole.ADMIN
        else:
            role = schemas.UserRole.USER
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
    data={"email": user.email, "role": user.role},
    expires_delta=access_token_expires
)

    return {"access_token": access_token, "token_type": "bearer"}

# User endpoints
@app.post("/users/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db=db, user=user)

@app.get("/users/", response_model=List[schemas.User])
def read_users(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(auth.get_current_user)
):
    # Only admins can list all users
    if not hasattr(current_user, 'role') or current_user.role != schemas.UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
    return crud.get_users(db, skip=skip, limit=limit)

@app.get("/users/me/", response_model=schemas.User)
async def read_users_me(current_user: schemas.User = Depends(auth.get_current_user)):
    return current_user

@app.put("/users/me/", response_model=schemas.User)
def update_user_me(
    user_update: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(auth.get_current_user)
):
    return crud.update_user(db, current_user.user_id, user_update)

# Doctor endpoints
@app.post("/doctors/", response_model=schemas.Doctor)
def create_doctor(doctor: schemas.DoctorCreate, db: Session = Depends(get_db)):
    db_doctor = crud.get_doctor_by_email(db, email=doctor.email)
    if db_doctor:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_doctor(db=db, doctor=doctor)

@app.get("/doctors/", response_model=List[schemas.Doctor])
def read_doctors(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    # Only return approved doctors for public access
    return crud.get_approved_doctors(db)[skip:skip+limit]

@app.get("/doctors/{doctor_id}", response_model=schemas.Doctor)
def read_doctor(doctor_id: int, db: Session = Depends(get_db)):
    db_doctor = crud.get_doctor(db, doctor_id=doctor_id)
    if db_doctor is None:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return db_doctor

@app.get("/doctors/me/", response_model=schemas.Doctor)
async def read_doctors_me(current_doctor: schemas.Doctor = Depends(auth.get_current_doctor)):
    return current_doctor

@app.put("/doctors/me/", response_model=schemas.Doctor)
def update_doctor_me(
    doctor_update: schemas.DoctorUpdate,
    db: Session = Depends(get_db),
    current_doctor: schemas.Doctor = Depends(auth.get_current_doctor)
):
    return crud.update_doctor(db, current_doctor.doctor_id, doctor_update)

# Hospital endpoints
@app.post("/hospitals/", response_model=schemas.Hospital)
def create_hospital(
    hospital: schemas.HospitalCreate, 
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(auth.get_current_user)
):
    # Only admins and doctors can create hospitals
    if not hasattr(current_user, 'role') or (
        current_user.role != schemas.UserRole.ADMIN and 
        current_user.role != schemas.UserRole.DOCTOR
    ):
        raise HTTPException(status_code=403, detail="Not authorized")
    return crud.create_hospital(db=db, hospital=hospital)

@app.get("/hospitals/", response_model=List[schemas.Hospital])
def read_hospitals(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    # Only return approved hospitals for public access
    return crud.get_approved_hospitals(db)[skip:skip+limit]

@app.get("/hospitals/{hospital_id}", response_model=schemas.Hospital)
def read_hospital(hospital_id: int, db: Session = Depends(get_db)):
    db_hospital = crud.get_hospital(db, hospital_id=hospital_id)
    if db_hospital is None:
        raise HTTPException(status_code=404, detail="Hospital not found")
    return db_hospital

# Appointment endpoints
# -------------------------------
# GET all appointments
# -------------------------------
@app.get("/appointments", response_model=List[schemas.Appointment])
def get_appointments(db: Session = Depends(get_db), current_user: schemas.User = Depends(auth.get_current_user)):
    if current_user.role == schemas.UserRole.USER:
        appointments = db.query(models.Appointment).filter(models.Appointment.user_id == current_user.user_id).all()
    elif current_user.role == schemas.UserRole.DOCTOR:
        appointments = db.query(models.Appointment).filter(models.Appointment.doctor_id == current_user.doctor_id).all()
    else:  # Admin
        appointments = db.query(models.Appointment).all()

    result = []
    for a in appointments:
        user = db.query(models.User).filter(models.User.user_id == a.user_id).first()
        result.append(schemas.Appointment(
            appointment_id=a.appointment_id,
            user=schemas.UserInfo(user_id=user.user_id, full_name=user.name),
            appointment_time=a.appointment_time.isoformat(),
            status=a.status,
            appointment_type=a.appointment_type,
            duration=a.duration,
            symptoms=a.symptoms,
            notes=a.notes,
            video_link=a.video_link
        ))
    return result

# -------------------------------
# CREATE appointment
# -------------------------------
@app.post("/appointments", response_model=schemas.Appointment)
def create_appointment(appointment_create: schemas.AppointmentCreate,
                       db: Session = Depends(get_db),
                       current_user: schemas.User = Depends(auth.get_current_user)):
    # Users can only create for themselves
    if current_user.role == schemas.UserRole.USER and appointment_create.user_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    new_appt = crud.create_appointment(db, appointment_create)
    user = db.query(models.User).filter(models.User.user_id == new_appt.user_id).first()

    return schemas.Appointment(
        appointment_id=new_appt.appointment_id,
        user=schemas.UserInfo(user_id=user.user_id, full_name=user.name),
        appointment_time=new_appt.appointment_time.isoformat(),
        status=new_appt.status,
        appointment_type=new_appt.appointment_type,
        duration=new_appt.duration,
        symptoms=new_appt.symptoms,
        notes=new_appt.notes,
        video_link=new_appt.video_link
    )

# -------------------------------


# -----------------------------
# Get appointment by ID
# -----------------------------
@app.put("/appointments/{appointment_id}")
def update_appointment(appointment_id: int, appointment_update: schemas.AppointmentUpdate, db: Session = Depends(get_db)):
    updated_appointment = crud.update_appointment(db, appointment_id, appointment_update)  # ✅ pass id, not object
    if not updated_appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return updated_appointment



# -----------------------------
# Update full appointment (partial updates allowed)
# -----------------------------
@app.put("/appointments/{appointment_id}", response_model=schemas.Appointment)
def update_appointment(appointment_id: int,
                       appointment_update: schemas.AppointmentUpdate,
                       db: Session = Depends(get_db),
                       current_user: schemas.User = Depends(auth.get_current_user)):
    appointment = crud.get_appointment(db, appointment_id)
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    # Authorization
    if current_user.role == schemas.UserRole.USER and appointment.user_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    if current_user.role == schemas.UserRole.DOCTOR and appointment.doctor_id != current_user.doctor_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    updated_appointment = crud.update_appointment(db, appointment, appointment_update)
    return updated_appointment


# -----------------------------
# Update only appointment status
# -----------------------------
@app.patch("/appointments/{appointment_id}/status", response_model=schemas.Appointment)
def update_appointment_status(appointment_id: int,
                              status_update: schemas.AppointmentStatus,
                              db: Session = Depends(get_db),
                              current_user: schemas.User = Depends(auth.get_current_user)):
    appointment = crud.get_appointment(db, appointment_id)
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    # Authorization
    if current_user.role == schemas.UserRole.DOCTOR and appointment.doctor_id != current_user.doctor_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    updated_appointment = crud.update_appointment_status(db, appointment_id, status_update)
    return updated_appointment


# -----------------------------
# Delete appointment
# -----------------------------
@app.delete("/appointments/{appointment_id}")
def delete_appointment(appointment_id: int, db: Session = Depends(get_db)):
    deleted = crud.delete_appointment(db, appointment_id)   # ✅ pass ID, not object
    if not deleted:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return {"message": "Appointment deleted successfully"}

# Get all medical records for current user
@app.get("/medical-records", response_model=List[schemas.MedicalRecord])
def get_medical_records(
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(auth.get_current_user)
):
    records = crud.get_user_medical_records(db, current_user.user_id)
    return records

@app.post("/prescriptions/", response_model=schemas.Prescription)
def create_prescription(
    prescription: schemas.PrescriptionCreate,
    db: Session = Depends(get_db),
    current_doctor: schemas.Doctor = Depends(auth.get_current_doctor)
):
    # Check if doctor is associated with the appointment
    appointment = crud.get_appointment(db, prescription.appointment_id)
    if appointment.doctor_id != current_doctor.doctor_id:
        raise HTTPException(status_code=403, detail="Not authorized to create prescription for this appointment")
    
    created_prescription = crud.create_prescription(db=db, prescription=prescription)
    
    # Send notification to patient
    send_prescription_ready_notification(created_prescription)
    
    return created_prescription

@app.get("/prescriptions/", response_model=List[schemas.Prescription])
def read_prescriptions(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(auth.get_current_user)
):
    # Users can only see their own prescriptions
    return crud.get_user_prescriptions(db, current_user.user_id)[skip:skip+limit]

@app.get("/prescriptions/{prescription_id}", response_model=schemas.Prescription)
def read_prescription(
    prescription_id: int, 
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(auth.get_current_user)
):
    db_prescription = crud.get_prescription(db, prescription_id=prescription_id)
    if db_prescription is None:
        raise HTTPException(status_code=404, detail="Prescription not found")
    
    # Check if user has access to this prescription
    if db_prescription.user_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    return db_prescription

# AI Symptom Checker endpoint
@app.post("/symptom-check", response_model=schemas.SymptomAnalysisResponse)
def check_symptoms(
    symptom_request: schemas.SymptomAnalysisRequest,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(auth.get_current_user)
):
    # Analyze symptoms using AI service
    analysis = analyze_symptoms(symptom_request.symptoms, db)
    
    # Save symptom check to database
    symptom_check_data = schemas.SymptomCheckCreate(
        user_id=current_user.user_id,
        symptoms=symptom_request.symptoms
    )
    
    crud.create_symptom_check(
        db, symptom_check_data,
        analysis.suggested_specialization,
        analysis.urgency,
        analysis.recommended_doctors
    )
    
    return analysis

# Doctor search endpoint
@app.post("/doctors/search", response_model=List[schemas.Doctor])
def search_doctors(
    search: schemas.DoctorSearch,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    doctors = crud.search_doctors(db, search)
    return doctors[skip:skip+limit]

# Hospital search endpoint
@app.post("/hospitals/search", response_model=List[schemas.Hospital])
def search_hospitals(
    search: schemas.HospitalSearch,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    hospitals = crud.search_hospitals(db, search)
    return hospitals[skip:skip+limit]

# Admin endpoints
@app.get("/admin/pending-doctors", response_model=List[schemas.Doctor])
def get_pending_doctors(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_admin: schemas.Admin = Depends(auth.get_current_admin)
):
    # Get doctors with pending status
    pending_doctors = db.query(models.Doctor).filter(
        models.Doctor.status == models.DoctorStatus.PENDING
    ).offset(skip).limit(limit).all()
    
    return pending_doctors

@app.get("/admin/pending-hospitals", response_model=List[schemas.Hospital])
def get_pending_hospitals(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_admin: schemas.Admin = Depends(auth.get_current_admin)
):
    # Get hospitals with pending status
    pending_hospitals = db.query(models.Hospital).filter(
        models.Hospital.status == models.HospitalStatus.PENDING
    ).offset(skip).limit(limit).all()
    
    return pending_hospitals

@app.post("/admin/approve-doctor/{doctor_id}", response_model=schemas.Doctor)
def approve_doctor(
    doctor_id: int,
    db: Session = Depends(get_db),
    current_admin: schemas.Admin = Depends(auth.get_current_admin)
):
    return crud.update_doctor_status(db, doctor_id, models.DoctorStatus.APPROVED)

@app.post("/admin/reject-doctor/{doctor_id}", response_model=schemas.Doctor)
def reject_doctor(
    doctor_id: int,
    db: Session = Depends(get_db),
    current_admin: schemas.Admin = Depends(auth.get_current_admin)
):
    return crud.update_doctor_status(db, doctor_id, models.DoctorStatus.REJECTED)

@app.post("/admin/approve-hospital/{hospital_id}", response_model=schemas.Hospital)
def approve_hospital(
    hospital_id: int,
    db: Session = Depends(get_db),
    current_admin: schemas.Admin = Depends(auth.get_current_admin)
):
    return crud.update_hospital_status(db, hospital_id, models.HospitalStatus.APPROVED)

@app.post("/admin/reject-hospital/{hospital_id}", response_model=schemas.Hospital)
def reject_hospital(
    hospital_id: int,
    db: Session = Depends(get_db),
    current_admin: schemas.Admin = Depends(auth.get_current_admin)
):
    return crud.update_hospital_status(db, hospital_id, models.HospitalStatus.REJECTED)

# Telephony endpoints
@app.post("/telephony/incoming-call")
def handle_incoming_call_endpoint(
    caller_number: str = Query(...),
    speech_text: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    return handle_incoming_call(caller_number, speech_text)

@app.post("/telephony/schedule-from-call/{call_id}")
def schedule_from_call_endpoint(
    call_id: int,
    preferred_time: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(auth.get_current_user)
):
    return schedule_appointment_from_call(call_id, preferred_time)

# File upload endpoint (for doctor documents)
@app.post("/doctor-documents/", response_model=schemas.DoctorDocument)
def upload_doctor_document(
    file: UploadFile = File(...),
    document_type: str = Form(...),
    db: Session = Depends(get_db),
    current_doctor: schemas.Doctor = Depends(auth.get_current_doctor)
):
    # Check file size
    file.file.seek(0, 2)  # Seek to end of file
    file_size = file.file.tell()
    file.file.seek(0)  # Reset file pointer
    
    if file_size > settings.MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large")
    
    # Check file type
    file_extension = file.filename.split('.')[-1].lower()
    if file_extension not in settings.ALLOWED_FILE_TYPES:
        raise HTTPException(status_code=400, detail="File type not allowed")
    
    # Save file
    filename = f"doctor_{current_doctor.doctor_id}_{document_type}_{datetime.now().timestamp()}.{file_extension}"
    file_path = os.path.join(settings.UPLOAD_DIR, filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Create doctor document in database
    document_data = schemas.DoctorDocumentCreate(
        doctor_id=current_doctor.doctor_id,
        document_type=document_type,
        file_name=file.filename
    )
    
    file_url = f"/uploads/{filename}"  # Cloud storage URL in production
    
    return crud.create_doctor_document(db, document_data, file_url)

# Serve uploaded files (in production, use a proper web server or cloud storage)
@app.get("/uploads/{filename}")
def serve_file(filename: str):
    file_path = os.path.join(settings.UPLOAD_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(file_path)

# Appointment reminders endpoint (would be called by a scheduler/cron job)
@app.post("/appointments/send-reminders")
def send_appointment_reminders(
    hours_before: int = Query(24),
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(auth.get_current_admin)  # Only admins can trigger this
):
    # Get appointments happening in the next {hours_before} hours
    from datetime import datetime, timedelta
    now = datetime.now()
    reminder_time = now + timedelta(hours=hours_before)
    
    appointments = db.query(models.Appointment).filter(
        models.Appointment.appointment_time >= now,
        models.Appointment.appointment_time <= reminder_time,
        models.Appointment.status == models.AppointmentStatus.CONFIRMED
    ).all()
    
    results = []
    for appointment in appointments:
        try:
            send_appointment_reminder(appointment, hours_before)
            results.append({
                "appointment_id": appointment.appointment_id,
                "status": "success"
            })
        except Exception as e:
            results.append({
                "appointment_id": appointment.appointment_id,
                "status": "error",
                "error": str(e)
            })
    
    return {"results": results}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)