import React, { useEffect, useState } from "react";
import axios from "axios";
import "./DoctorAppointments.css";

function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const BASE_URL = "http://localhost:8000";

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setError("You are not logged in!");
      setLoading(false);
      return;
    }

    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${BASE_URL}/appointments`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAppointments(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch appointments.");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
    const interval = setInterval(fetchAppointments, 10000);
    return () => clearInterval(interval);
  }, []);

 const handleUpdateStatus = async (appointmentId, status) => {
  const token = localStorage.getItem("access_token");
  if (!token) return alert("Not authenticated!");

  try {
    await axios.put(
      `${BASE_URL}/appointments/${appointmentId}`,
      { status }, // only send what backend needs
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setAppointments(prev =>
      prev.map(a => a.appointment_id === appointmentId ? { ...a, status } : a)
    );
  } catch (err) {
    console.error(err);
    alert("Failed to update appointment. Check console for details.");
  }
};

  const handleDeleteAppointment = async (appointmentId) => {
    const token = localStorage.getItem("access_token");
    if (!window.confirm("Are you sure you want to delete this appointment?")) return;

    try {
      await axios.delete(`${BASE_URL}/appointments/${appointmentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAppointments(prev => prev.filter(a => a.appointment_id !== appointmentId));
    } catch (err) {
      console.error(err);
      alert("Failed to delete appointment.");
    }
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed": return "status-confirmed";
      case "requested": return "status-requested";
      case "cancelled": return "status-cancelled";
      case "pending": return "status-pending";
      default: return "status-requested";
    }
  };

  const getTypeClass = (type) => {
    switch (type?.toUpperCase()) {
      case "IN_PERSON": return "type-in-person";
      case "VIDEO": return "type-video";
      case "PHONE": return "type-phone";
      default: return "type-in-person";
    }
  };

  if (loading) return <p className="loading-text">Loading appointments...</p>;
  if (error) return <p className="error-text">{error}</p>;

  return (
    <div className="appointments-container">
      <h2 className="appointments-header">My Appointments</h2>
      {appointments.length === 0 ? (
        <div className="no-appointments">No appointments scheduled.</div>
      ) : (
        <div className="appointments-grid">
          {appointments.map(appt => (
            <div key={appt.appointment_id} className="appointment-card">
              <span className={`status-badge ${getStatusClass(appt.status)}`}>{appt.status}</span>
              <div className="card-header">
                <span className="patient-name">
                  Patient: {appt.user?.full_name ?? `#${appt.user_id}`}
                </span>
                <span className={`appointment-type ${getTypeClass(appt.appointment_type)}`}>
                  {appt.appointment_type}
                </span>
              </div>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Time:</span>
                  <span className="info-value">{new Date(appt.appointment_time).toLocaleString()}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Duration:</span>
                  <span className="info-value">{appt.duration ?? 30} mins</span>
                </div>
              </div>
              {appt.symptoms && <div className="symptoms"><strong>Symptoms:</strong> {appt.symptoms}</div>}
              {appt.notes && <div className="notes"><strong>Notes:</strong> {appt.notes}</div>}
              {appt.video_link && (
                <a href={appt.video_link} target="_blank" rel="noopener noreferrer" className="video-link">
                  Join Video Call
                </a>
              )}

              <div className="booking-actions">
                {["PENDING", "REQUESTED"].includes(appt.status?.toUpperCase()) && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(appt.appointment_id, "CONFIRMED")}
                      className="accept-btn"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(appt.appointment_id, "CANCELLED")}
                      className="reject-btn"
                    >
                      Reject
                    </button>
                  </>
                )}
                <button
                  onClick={() => handleDeleteAppointment(appt.appointment_id)}
                  className="delete-btn"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DoctorAppointments;
