import requests
import json
from datetime import datetime, timedelta
from typing import Optional
import schemas
from fastapi import HTTPException
import os
from dotenv import load_dotenv
from google.oauth2 import service_account
import google.auth.transport.requests
import googleapiclient.discovery

# Load environment variables
load_dotenv()

# Google Meet API configuration
GOOGLE_SERVICE_ACCOUNT_FILE = os.getenv("GOOGLE_SERVICE_ACCOUNT_FILE")
GOOGLE_CALENDAR_ID = os.getenv("GOOGLE_CALENDAR_ID", "primary")

# Fallback video service
FALLBACK_VIDEO_SERVICE = os.getenv("FALLBACK_VIDEO_SERVICE", "zoom")
ZOOM_API_KEY = os.getenv("ZOOM_API_KEY")
ZOOM_API_SECRET = os.getenv("ZOOM_API_SECRET")

def create_google_meet_link(appointment: schemas.Appointment) -> str:
    """
    Create a Google Meet link for a video consultation
    """
    try:
        if GOOGLE_SERVICE_ACCOUNT_FILE:
            # Authenticate with service account
            credentials = service_account.Credentials.from_service_account_file(
                GOOGLE_SERVICE_ACCOUNT_FILE,
                scopes=['https://www.googleapis.com/auth/calendar']
            )
            
            # Create calendar service
            service = googleapiclient.discovery.build('calendar', 'v3', credentials=credentials)
            
            # Create calendar event with Google Meet
            event = {
                'summary': f'Medical Consultation - Appointment #{appointment.appointment_id}',
                'description': f'Video consultation between doctor and patient.',
                'start': {
                    'dateTime': appointment.appointment_time.isoformat(),
                    'timeZone': 'UTC',
                },
                'end': {
                    'dateTime': (appointment.appointment_time + timedelta(minutes=appointment.duration or 30)).isoformat(),
                    'timeZone': 'UTC',
                },
                'conferenceData': {
                    'createRequest': {
                        'requestId': f'appointment-{appointment.appointment_id}',
                        'conferenceSolutionKey': {
                            'type': 'hangoutsMeet'
                        }
                    }
                },
                'attendees': [
                    {'email': appointment.user.email},
                    {'email': appointment.doctor.email}
                ]
            }
            
            # Create event
            created_event = service.events().insert(
                calendarId=GOOGLE_CALENDAR_ID,
                body=event,
                conferenceDataVersion=1
            ).execute()
            
            # Return the meet link
            return created_event.get('hangoutLink', created_event['conferenceData']['entryPoints'][0]['uri'])
        
        else:
            # Fallback: generate a mock Google Meet link
            return f"https://meet.google.com/mock-{appointment.appointment_id}"
            
    except Exception as e:
        # If Google Meet fails, try fallback service
        return create_fallback_video_link(appointment)

def create_fallback_video_link(appointment: schemas.Appointment) -> str:
    """
    Create a fallback video link using Zoom or other service
    """
    if FALLBACK_VIDEO_SERVICE == "zoom" and ZOOM_API_KEY and ZOOM_API_SECRET:
        try:
            # This would be the actual Zoom API integration
            # For now, we'll return a mock link
            return f"https://zoom.us/j/mock-{appointment.appointment_id}"
        except Exception:
            # If Zoom fails too, return a generic link
            return f"https://video-consultation.example.com/{appointment.appointment_id}"
    
    # Default fallback
    return f"https://video-consultation.example.com/{appointment.appointment_id}"

def send_video_consultation_emails(appointment: schemas.Appointment, video_link: str):
    """
    Send emails to doctor and patient with video consultation details
    """
    # This would integrate with your email service
    # For now, we'll just print the details
    print(f"Video consultation scheduled:")
    print(f"Appointment ID: {appointment.appointment_id}")
    print(f"Patient: {appointment.user.name} ({appointment.user.email})")
    print(f"Doctor: {appointment.doctor.name} ({appointment.doctor.email})")
    print(f"Time: {appointment.appointment_time}")
    print(f"Video Link: {video_link}")
    
    # In a real implementation, you would:
    # 1. Send email to patient with joining instructions
    # 2. Send email to doctor with appointment details
    # 3. Maybe send calendar invites
    
    return True