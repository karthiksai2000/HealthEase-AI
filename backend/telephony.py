import requests
import json
from typing import Optional, Dict, Any
from fastapi import HTTPException
import models
import schemas
from database import get_db
from sqlalchemy.orm import Session
import crud
from ai_symptom_checker import analyze_symptoms_from_call
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Telephony service configuration
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")

VONAGE_API_KEY = os.getenv("VONAGE_API_KEY")
VONAGE_API_SECRET = os.getenv("VONAGE_API_SECRET")
VONAGE_PHONE_NUMBER = os.getenv("VONAGE_PHONE_NUMBER")

# Dialogflow configuration
DIALOGFLOW_PROJECT_ID = os.getenv("DIALOGFLOW_PROJECT_ID")
DIALOGFLOW_LANGUAGE_CODE = os.getenv("DIALOGFLOW_LANGUAGE_CODE", "en-US")

def handle_incoming_call(caller_number: str, speech_text: Optional[str] = None) -> Dict[str, Any]:
    """
    Handle incoming phone call from patient
    """
    # For now, we'll simulate the call handling
    # In a real implementation, this would integrate with Twilio/Vonage webhooks
    
    response = {
        "caller_number": caller_number,
        "status": "handled",
        "message": "Call received successfully"
    }
    
    # If speech text is provided (from speech-to-text), analyze symptoms
    if speech_text:
        # Get database session
        db = next(get_db())
        try:
            # Analyze symptoms
            analysis = analyze_symptoms_from_call(speech_text, db)
            
            # Find user by phone number
            user = db.query(models.User).filter(models.User.phone == caller_number).first()
            user_id = user.user_id if user else None
            
            # Create call booking record
            call_booking = schemas.CallBookingCreate(
                caller_number=caller_number,
                user_id=user_id,
                symptoms=speech_text,
                status="ANALYZED"
            )
            
            db_call_booking = crud.create_call_booking(db, call_booking)
            
            # Update with analysis results
            crud.update_call_booking_with_analysis(
                db, db_call_booking.call_id,
                analysis.suggested_specialization,
                analysis.urgency
            )
            
            response["analysis"] = analysis.dict()
            response["call_booking_id"] = db_call_booking.call_id
            
            # If it's an emergency, provide immediate guidance
            if analysis.urgency == schemas.UrgencyLevel.EMERGENCY:
                response["emergency_advice"] = "Please go to the nearest emergency room immediately or call emergency services."
            
        except Exception as e:
            response["error"] = str(e)
            response["status"] = "error"
    
    return response

def text_to_speech(text: str, language: str = "en-US") -> Optional[bytes]:
    """
    Convert text to speech audio
    """
    # This would integrate with a TTS service like Google TTS or Amazon Polly
    # For now, we'll return None as this is a simulation
    return None

def speech_to_text(audio_data: bytes, language: str = "en-US") -> Optional[str]:
    """
    Convert speech audio to text
    """
    # This would integrate with a STT service like Google Speech-to-Text
    # For now, we'll return a mock response
    mock_responses = [
        "I have a severe headache and dizziness",
        "I'm experiencing chest pain and shortness of breath",
        "I have a fever and cough for three days",
        "I fell and hurt my arm, I think it might be broken",
        "I have abdominal pain and nausea"
    ]
    
    # Return a random mock response for simulation
    import random
    return random.choice(mock_responses)

def schedule_appointment_from_call(call_booking_id: int, preferred_time: Optional[str] = None) -> Dict[str, Any]:
    """
    Schedule an appointment based on a phone call analysis
    """
    db = next(get_db())
    
    # Get call booking details
    call_booking = crud.get_call_booking(db, call_booking_id)
    if not call_booking:
        raise HTTPException(status_code=404, detail="Call booking not found")
    
    # Find available doctors for the suggested specialization
    doctors = crud.get_doctors_by_specialization(db, call_booking.suggested_specialization)
    if not doctors:
        # Fallback to general physicians
        doctors = crud.get_doctors_by_specialization(db, "General Physician")
    
    if not doctors:
        raise HTTPException(status_code=404, detail="No available doctors found")
    
    # For simplicity, pick the first available doctor
    doctor = doctors[0]
    
    # Find a hospital associated with the doctor
    hospital_id = doctor.hospital_id
    
    # Create appointment
    appointment_time = preferred_time or "2024-01-15T10:00:00"  # In real implementation, would find actual available slot
    
    appointment_data = schemas.AppointmentCreate(
        user_id=call_booking.user_id or 1,  # Default user if not registered
        doctor_id=doctor.doctor_id,
        hospital_id=hospital_id,
        appointment_type=schemas.AppointmentType.IN_PERSON,  # Phone calls only book in-person
        appointment_time=appointment_time,
        symptoms=call_booking.symptoms,
        urgency=call_booking.urgency
    )
    
    appointment = crud.create_appointment(db, appointment_data)
    
    # Update call booking with appointment ID
    call_booking.booked_appointment_id = appointment.appointment_id
    db.commit()
    
    # Send confirmation (would be via phone call in real implementation)
    response = {
        "appointment_id": appointment.appointment_id,
        "doctor_name": doctor.name,
        "hospital_name": doctor.hospital.name if doctor.hospital else "Clinic",
        "appointment_time": appointment_time,
        "message": "Appointment scheduled successfully"
    }
    
    return response