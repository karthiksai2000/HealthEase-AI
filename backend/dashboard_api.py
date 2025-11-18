from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from datetime import datetime, timedelta
from typing import Dict, Any, List
import models
import schemas
from auth import get_current_admin
from database import get_db

# Create router for dashboard endpoints
dashboard_router = APIRouter(prefix="/admin/dashboard", tags=["admin-dashboard"])

@dashboard_router.get("/stats")
async def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_admin: schemas.Admin = Depends(get_current_admin)
) -> Dict[str, Any]:
    """Get comprehensive dashboard statistics for admin overview"""
    
    # User statistics
    total_users = db.query(models.User).count()
    new_users_this_month = db.query(models.User).filter(
        models.User.created_at >= datetime.now() - timedelta(days=30)
    ).count()
    
    # Doctor statistics
    total_doctors = db.query(models.Doctor).count()
    pending_doctors = db.query(models.Doctor).filter(
        models.Doctor.status == models.DoctorStatus.PENDING
    ).count()
    approved_doctors = db.query(models.Doctor).filter(
        models.Doctor.status == models.DoctorStatus.APPROVED
    ).count()
    
    # Hospital statistics
    total_hospitals = db.query(models.Hospital).count()
    pending_hospitals = db.query(models.Hospital).filter(
        models.Hospital.status == models.HospitalStatus.PENDING
    ).count()
    approved_hospitals = db.query(models.Hospital).filter(
        models.Hospital.status == models.HospitalStatus.APPROVED
    ).count()
    
    # Appointment statistics
    total_appointments = db.query(models.Appointment).count()
    today_appointments = db.query(models.Appointment).filter(
        func.date(models.Appointment.appointment_time) == datetime.now().date()
    ).count()
    
    upcoming_appointments = db.query(models.Appointment).filter(
        and_(
            models.Appointment.appointment_time >= datetime.now(),
            models.Appointment.status == models.AppointmentStatus.CONFIRMED
        )
    ).count()
    
    # Prescription statistics
    total_prescriptions = db.query(models.Prescription).count()
    recent_prescriptions = db.query(models.Prescription).filter(
        models.Prescription.created_at >= datetime.now() - timedelta(days=7)
    ).count()
    
    # System health metrics
    active_users_today = db.query(models.User).filter(
        models.User.last_login >= datetime.now() - timedelta(days=1)
    ).count() if hasattr(models.User, 'last_login') else 0
    
    return {
        "users": {
            "total": total_users,
            "new_this_month": new_users_this_month,
            "active_today": active_users_today
        },
        "doctors": {
            "total": total_doctors,
            "pending": pending_doctors,
            "approved": approved_doctors,
            "approval_rate": round((approved_doctors / max(total_doctors, 1)) * 100, 1)
        },
        "hospitals": {
            "total": total_hospitals,
            "pending": pending_hospitals,
            "approved": approved_hospitals,
            "approval_rate": round((approved_hospitals / max(total_hospitals, 1)) * 100, 1)
        },
        "appointments": {
            "total": total_appointments,
            "today": today_appointments,
            "upcoming": upcoming_appointments
        },
        "prescriptions": {
            "total": total_prescriptions,
            "recent": recent_prescriptions
        },
        "system": {
            "status": "healthy",
            "last_updated": datetime.now().isoformat()
        }
    }

@dashboard_router.get("/recent-activity")
async def get_recent_activity(
    limit: int = 10,
    db: Session = Depends(get_db),
    current_admin: schemas.Admin = Depends(get_current_admin)
) -> List[Dict[str, Any]]:
    """Get recent system activity for admin monitoring"""
    
    activities = []
    
    # Recent user registrations
    recent_users = db.query(models.User).order_by(
        models.User.created_at.desc()
    ).limit(5).all()
    
    for user in recent_users:
        activities.append({
            "type": "user_registration",
            "message": f"New user registered: {user.name}",
            "timestamp": user.created_at.isoformat(),
            "entity_id": user.user_id
        })
    
    # Recent doctor applications
    recent_doctors = db.query(models.Doctor).filter(
        models.Doctor.status == models.DoctorStatus.PENDING
    ).order_by(models.Doctor.created_at.desc()).limit(5).all()
    
    for doctor in recent_doctors:
        activities.append({
            "type": "doctor_application",
            "message": f"New doctor application: Dr. {doctor.name}",
            "timestamp": doctor.created_at.isoformat(),
            "entity_id": doctor.doctor_id
        })
    
    # Recent appointments
    recent_appointments = db.query(models.Appointment).order_by(
        models.Appointment.created_at.desc()
    ).limit(5).all()
    
    for appointment in recent_appointments:
        user = db.query(models.User).filter(
            models.User.user_id == appointment.user_id
        ).first()
        activities.append({
            "type": "appointment_created",
            "message": f"New appointment scheduled by {user.name if user else 'Unknown'}",
            "timestamp": appointment.created_at.isoformat(),
            "entity_id": appointment.appointment_id
        })
    
    # Sort by timestamp and return limited results
    # Sort by timestamp and return limited results
    activities.sort(key=lambda x: x["timestamp"], reverse=True)
    return activities[:limit]


@dashboard_router.get("/appointments-overview")
async def get_appointments_overview(
    db: Session = Depends(get_db),
    current_admin: schemas.Admin = Depends(get_current_admin)
) -> Dict[str, Any]:
    """Get detailed appointments overview for admin dashboard"""

    # Appointments by status
    confirmed = db.query(models.Appointment).filter(
        models.Appointment.status == models.AppointmentStatus.CONFIRMED
    ).count()

    requested = db.query(models.Appointment).filter(
        models.Appointment.status == models.AppointmentStatus.REQUESTED
    ).count()

    completed = db.query(models.Appointment).filter(
        models.Appointment.status == models.AppointmentStatus.COMPLETED
    ).count()

    cancelled = db.query(models.Appointment).filter(
        models.Appointment.status == models.AppointmentStatus.CANCELLED
    ).count()

    # Appointments by type
    in_person = db.query(models.Appointment).filter(
    models.Appointment.appointment_type == models.AppointmentType.IN_PERSON
    ).count()

    video = db.query(models.Appointment).filter(
    models.Appointment.appointment_type == models.AppointmentType.VIDEO
    ).count()


    # Today's appointments
    today_start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    today_end = today_start + timedelta(days=1)

    todays_appointments = db.query(models.Appointment).filter(
        and_(
            models.Appointment.appointment_time >= today_start,
            models.Appointment.appointment_time < today_end
        )
    ).all()

    return {
        "by_status": {
            "confirmed": confirmed,
            "requested": requested,
            "completed": completed,
            "cancelled": cancelled
        },
        "by_type": {
    "in_person": in_person,
    "video": video
},

        "today": {
            "count": len(todays_appointments),
            "appointments": [
                {
                    "id": apt.appointment_id,
                    "time": apt.appointment_time.strftime("%H:%M"),
                    "type": apt.appointment_type.value,
                    "status": apt.status.value
                }
                for apt in todays_appointments
            ]
        }
    }
