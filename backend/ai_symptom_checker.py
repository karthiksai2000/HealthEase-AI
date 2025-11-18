import requests
import json
from typing import List, Dict, Any
from fastapi import HTTPException
import schemas
from database import get_db
from sqlalchemy.orm import Session
import crud
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# AI Service configuration
AI_SERVICE_URL = os.getenv("AI_SERVICE_URL", "http://localhost:8001/analyze-symptoms")
FALLBACK_AI_ENABLED = os.getenv("FALLBACK_AI_ENABLED", "true").lower() == "true"

# Simple symptom to specialization mapping (fallback)
SYMPTOM_SPECIALIZATION_MAP = {
    "heart": "Cardiologist",
    "chest": "Cardiologist",
    "cardiac": "Cardiologist",
    "head": "Neurologist",
    "brain": "Neurologist",
    "nerve": "Neurologist",
    "stomach": "Gastroenterologist",
    "digest": "Gastroenterologist",
    "gut": "Gastroenterologist",
    "bone": "Orthopedist",
    "joint": "Orthopedist",
    "muscle": "Orthopedist",
    "skin": "Dermatologist",
    "rash": "Dermatologist",
    "child": "Pediatrician",
    "baby": "Pediatrician",
    "kid": "Pediatrician",
    "eye": "Ophthalmologist",
    "vision": "Ophthalmologist",
    "see": "Ophthalmologist",
    "ear": "ENT Specialist",
    "nose": "ENT Specialist",
    "throat": "ENT Specialist",
    "teeth": "Dentist",
    "tooth": "Dentist",
    "mental": "Psychiatrist",
    "depress": "Psychiatrist",
    "anxiety": "Psychiatrist",
    "cancer": "Oncologist",
    "tumor": "Oncologist",
}

# Urgency keywords
URGENCY_KEYWORDS = {
    "emergency": schemas.UrgencyLevel.EMERGENCY,
    "severe": schemas.UrgencyLevel.HIGH,
    "critical": schemas.UrgencyLevel.HIGH,
    "pain": schemas.UrgencyLevel.HIGH,
    "bleeding": schemas.UrgencyLevel.HIGH,
    "broken": schemas.UrgencyLevel.HIGH,
    "fracture": schemas.UrgencyLevel.HIGH,
    "moderate": schemas.UrgencyLevel.MEDIUM,
    "mild": schemas.UrgencyLevel.LOW,
    "routine": schemas.UrgencyLevel.LOW,
}

def analyze_symptoms(symptoms: str, db: Session) -> schemas.SymptomAnalysisResponse:
    """
    Analyze symptoms using AI service or fallback rules
    """
    try:
        # Try to use AI service first
        response = requests.post(
            AI_SERVICE_URL,
            json={"symptoms": symptoms},
            timeout=10  # 10 second timeout
        )
        
        if response.status_code == 200:
            ai_data = response.json()
            return schemas.SymptomAnalysisResponse(
                suggested_specialization=ai_data.get("specialization", "General Physician"),
                urgency=ai_data.get("urgency", schemas.UrgencyLevel.MEDIUM),
                recommended_doctors=ai_data.get("recommended_doctors", []),
                advice=ai_data.get("advice")
            )
    except (requests.RequestException, requests.Timeout):
        # AI service failed, use fallback if enabled
        if FALLBACK_AI_ENABLED:
            return analyze_symptoms_fallback(symptoms, db)
        else:
            raise HTTPException(status_code=503, detail="AI service unavailable")
    
    # If all else fails, return general physician
    return schemas.SymptomAnalysisResponse(
        suggested_specialization="General Physician",
        urgency=schemas.UrgencyLevel.MEDIUM,
        recommended_doctors=[],
        advice="Please consult with a doctor for proper diagnosis"
    )

def analyze_symptoms_fallback(symptoms: str, db: Session) -> schemas.SymptomAnalysisResponse:
    """
    Fallback symptom analysis using simple keyword matching
    """
    symptoms_lower = symptoms.lower()
    
    # Determine specialization based on keywords
    specialization = "General Physician"
    for keyword, spec in SYMPTOM_SPECIALIZATION_MAP.items():
        if keyword in symptoms_lower:
            specialization = spec
            break
    
    # Determine urgency based on keywords
    urgency = schemas.UrgencyLevel.MEDIUM
    for keyword, urg_level in URGENCY_KEYWORDS.items():
        if keyword in symptoms_lower:
            urgency = urg_level
            break
    
    # Find doctors with the suggested specialization
    doctors = crud.get_doctors_by_specialization(db, specialization)
    recommended_doctors = [doctor.doctor_id for doctor in doctors[:3]]  # Top 3 doctors
    
    # Generate advice based on urgency
    advice = "Please schedule an appointment with a specialist."
    if urgency == schemas.UrgencyLevel.EMERGENCY:
        advice = "This appears to be an emergency. Please go to the nearest emergency room or call emergency services immediately."
    elif urgency == schemas.UrgencyLevel.HIGH:
        advice = "Your symptoms suggest a condition that requires prompt medical attention. Please schedule an appointment as soon as possible."
    
    return schemas.SymptomAnalysisResponse(
        suggested_specialization=specialization,
        urgency=urgency,
        recommended_doctors=recommended_doctors,
        advice=advice
    )

def analyze_symptoms_from_call(symptoms: str, db: Session) -> schemas.SymptomAnalysisResponse:
    """
    Analyze symptoms from phone call (simplified version)
    """
    # Use the same analysis as regular symptoms
    return analyze_symptoms(symptoms, db)