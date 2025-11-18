import requests
import json
from typing import List, Optional
from fastapi import HTTPException
import schemas
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Notification services configuration
EMAIL_SERVICE_URL = os.getenv("EMAIL_SERVICE_URL")
SMS_SERVICE_URL = os.getenv("SMS_SERVICE_URL")
PUSH_SERVICE_URL = os.getenv("PUSH_SERVICE_URL")

# Template IDs
APPOINTMENT_CONFIRMATION_TEMPLATE = os.getenv("APPOINTMENT_CONFIRMATION_TEMPLATE")
APPOINTMENT_REMINDER_TEMPLATE = os.getenv("APPOINTMENT_REMINDER_TEMPLATE")
PRESCRIPTION_READY_TEMPLATE = os.getenv("PRESCRIPTION_READY_TEMPLATE")

def send_email(to_email: str, subject: str, template_id: str, template_data: dict) -> bool:
    """
    Send email using email service
    """
    if not EMAIL_SERVICE_URL:
        # Fallback: print email details
        print(f"Email to: {to_email}")
        print(f"Subject: {subject}")
        print(f"Template: {template_id}")
        print(f"Data: {json.dumps(template_data, indent=2)}")
        return True
    
    try:
        payload = {
            "to": to_email,
            "subject": subject,
            "template_id": template_id,
            "template_data": template_data
        }
        
        response = requests.post(EMAIL_SERVICE_URL, json=payload, timeout=10)
        return response.status_code == 200
    except Exception as e:
        print(f"Email service error: {e}")
        return False

def send_sms(to_phone: str, message: str) -> bool:
    """
    Send SMS using SMS service
    """
    if not SMS_SERVICE_URL:
        # Fallback: print SMS details
        print(f"SMS to: {to_phone}")
        print(f"Message: {message}")
        return True
    
    try:
        payload = {
            "to": to_phone,
            "message": message
        }
        
        response = requests.post(SMS_SERVICE_URL, json=payload, timeout=10)
        return response.status_code == 200
    except Exception as e:
        print(f"SMS service error: {e}")
        return False

def send_push_notification(user_id: int, title: str, message: str, data: Optional[dict] = None) -> bool:
    """
    Send push notification
    """
    if not PUSH_SERVICE_URL:
        # Fallback: print push notification details
        print(f"Push to user: {user_id}")
        print(f"Title: {title}")
        print(f"Message: {message}")
        print(f"Data: {data}")
        return True
    
    try:
        payload = {
            "user_id": user_id,
            "title": title,
            "message": message,
            "data": data or {}
        }
        
        response = requests.post(PUSH_SERVICE_URL, json=payload, timeout=10)
        return response.status_code == 200
    except Exception as e:
        print(f"Push service error: {e}")
        return False

def send_appointment_confirmation(appointment: schemas.Appointment, video_link: Optional[str] = None):
    """
    Send appointment confirmation to patient and doctor
    """
    # Patient notification
    patient_data = {
        "patient_name": appointment.user.name,
        "doctor_name": appointment.doctor.name,
        "appointment_time": appointment.appointment_time.strftime("%Y-%m-%d %H:%M"),
        "hospital_name": appointment.hospital.name if appointment.hospital else "Clinic",
        "appointment_type": appointment.appointment_type.value,
        "video_link": video_link or "N/A"
    }
    
    # Send email to patient
    send_email(
        appointment.user.email,
        "Appointment Confirmation",
        APPOINTMENT_CONFIRMATION_TEMPLATE,
        patient_data
    )
    
    # Send SMS to patient
    sms_message = f"Your appointment with Dr. {appointment.doctor.name} is confirmed for {appointment.appointment_time.strftime('%Y-%m-%d %H:%M')}"
    send_sms(appointment.user.phone, sms_message)
    
    # Doctor notification
    doctor_data = {
        "doctor_name": appointment.doctor.name,
        "patient_name": appointment.user.name,
        "appointment_time": appointment.appointment_time.strftime("%Y-%m-%d %H:%M"),
        "symptoms": appointment.symptoms or "Not specified",
        "appointment_type": appointment.appointment_type.value,
        "video_link": video_link or "N/A"
    }
    
    # Send email to doctor
    send_email(
        appointment.doctor.email,
        "New Appointment Scheduled",
        APPOINTMENT_CONFIRMATION_TEMPLATE,
        doctor_data
    )
    
    return True

def send_appointment_reminder(appointment: schemas.Appointment, hours_before: int = 24):
    """
    Send appointment reminder
    """
    reminder_data = {
        "patient_name": appointment.user.name,
        "doctor_name": appointment.doctor.name,
        "appointment_time": appointment.appointment_time.strftime("%Y-%m-%d %H:%M"),
        "hospital_name": appointment.hospital.name if appointment.hospital else "Clinic",
        "appointment_type": appointment.appointment_type.value,
        "hours_before": hours_before
    }
    
    # Send email reminder
    send_email(
        appointment.user.email,
        f"Appointment Reminder - {hours_before} hours",
        APPOINTMENT_REMINDER_TEMPLATE,
        reminder_data
    )
    
    # Send SMS reminder
    sms_message = f"Reminder: Your appointment with Dr. {appointment.doctor.name} is in {hours_before} hours ({appointment.appointment_time.strftime('%Y-%m-%d %H:%M')})"
    send_sms(appointment.user.phone, sms_message)
    
    # Send push notification
    send_push_notification(
        appointment.user.user_id,
        "Appointment Reminder",
        f"Your appointment is in {hours_before} hours",
        {"appointment_id": appointment.appointment_id}
    )
    
    return True

def send_prescription_ready_notification(prescription: schemas.Prescription):
    """
    Send notification that prescription is ready
    """
    prescription_data = {
        "patient_name": prescription.user.name,
        "doctor_name": prescription.doctor.name,
        "diagnosis": prescription.diagnosis,
        "medications_count": len(json.loads(prescription.medications)) if prescription.medications else 0
    }
    
    # Send email
    send_email(
        prescription.user.email,
        "Your Prescription is Ready",
        PRESCRIPTION_READY_TEMPLATE,
        prescription_data
    )
    
    # Send SMS
    send_sms(
        prescription.user.phone,
        f"Your prescription from Dr. {prescription.doctor.name} is ready. Check your email or app for details."
    )
    
    # Send push notification
    send_push_notification(
        prescription.user.user_id,
        "Prescription Ready",
        "Your prescription is now available",
        {"prescription_id": prescription.prescription_id}
    )
    
    return True