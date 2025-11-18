import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "./Appointments.css";

const API_BASE = "http://localhost:8000";

const Appointments = ({ currentUser }) => {
  const token = localStorage.getItem("access_token");
  const user = currentUser;

  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [activeTab, setActiveTab] = useState("doctors");
  const [bookingLoading, setBookingLoading] = useState(null);

  // Form state for booking
  const [appointmentTime, setAppointmentTime] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [notes, setNotes] = useState("");
const fetchAppointmentStatus = async (appointmentId) => {
  if (!token) return;

  try {
    const res = await axios.get(`${API_BASE}/appointments/${appointmentId}/`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const updatedStatus = res.data.status;

    // Update the specific appointment in state
    setAppointments(prev =>
      prev.map(appt =>
        appt.appointment_id === appointmentId
          ? { ...appt, status: updatedStatus }
          : appt
      )
    );

    showNotification(`Status updated: ${updatedStatus}`, "success");
  } catch (err) {
    console.error(err);
    showNotification("Failed to update status", "error");
  }
};

  // Fetch appointments
  const fetchAppointments = useCallback(async () => {
    if (!token) return;
    try {
      setLoadingAppointments(true);
      const res = await axios.get(`${API_BASE}/appointments/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAppointments(res.data || []);
    } catch (err) {
      console.error(err);
      showNotification("Failed to load appointments", "error");
    } finally {
      setLoadingAppointments(false);
    }
  }, [token]);

  // Fetch doctors and hospitals
  const fetchDoctorsAndHospitals = useCallback(async () => {
    if (!token) return;
    try {
      setLoadingData(true);
      const [docsRes, hospsRes] = await Promise.all([
        axios.get(`${API_BASE}/doctors/`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE}/hospitals/`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setDoctors(docsRes.data || []);
      setHospitals(hospsRes.data || []);
    } catch (err) {
      console.error(err);
      showNotification("Failed to load doctors or hospitals", "error");
    } finally {
      setLoadingData(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAppointments();
    fetchDoctorsAndHospitals();
  }, [fetchAppointments, fetchDoctorsAndHospitals]);

  // Book appointment
  const bookAppointment = async (type, entityId, mode) => {
    if (!user) {
      alert("User not logged in");
      return;
    }
    console.log("User object:", user);

    if (!appointmentTime) {
      alert("Please select an appointment time");
      return;
    }

    try {
      setBookingLoading(`${type}-${entityId}-${mode}`);

      const payload = {
  user_id: user.user_id,
  appointment_type: mode === "offline" ? "IN_PERSON" : "VIDEO",
  appointment_time: new Date(appointmentTime).toISOString(),
  duration: 30,
  symptoms,
  notes,
};

// add doctor_id or hospital_id only if needed
if (type === "doctor") {
  payload.doctor_id = Number(entityId);
}
if (type === "hospital") {
  payload.hospital_id = Number(entityId);
}

console.log("Final payload:", payload);

      await axios.post(`${API_BASE}/appointments/`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      showNotification("Appointment booked successfully!", "success");
      fetchAppointments();

      // Reset form
      setAppointmentTime("");
      setSymptoms("");
      setNotes("");
    } catch (err) {
      console.error("Booking error:", err.response?.data || err);
      showNotification(
        err.response?.data?.detail || "Failed to book appointment",
        "error"
      );
    } finally {
      setBookingLoading(null);
    }
  };

  const showNotification = (message, type = "success") => {
    const existing = document.querySelectorAll(".custom-notification");
    existing.forEach((n) => n.remove());

    const notification = document.createElement("div");
    notification.className = `custom-notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => notification.classList.add("show"), 10);
    setTimeout(() => {
      notification.classList.remove("show");
      setTimeout(() => {
        if (document.body.contains(notification)) document.body.removeChild(notification);
      }, 300);
    }, 3000);
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed": return "status-confirmed";
      case "pending": return "status-pending";
      case "cancelled": return "status-cancelled";
      case "completed": return "status-completed";
      default: return "status-pending";
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    const options = { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="appointments-container">
      <div className="appointments-header">
        <h2>Medical Appointments</h2>
        <p>Book and manage your medical appointments</p>
      </div>

      <div className="appointments-content">
        {/* Booking Section */}
        <div className="booking-section">
          <div className="section-tabs">
            <button className={`tab ${activeTab === "doctors" ? "active" : ""}`} onClick={() => setActiveTab("doctors")}>Doctors</button>
            <button className={`tab ${activeTab === "hospitals" ? "active" : ""}`} onClick={() => setActiveTab("hospitals")}>Hospitals</button>
          </div>

          {/* Appointment Form */}
          <div className="appointment-form">
            <label>
              Appointment Time:
              <input type="datetime-local" value={appointmentTime} onChange={(e) => setAppointmentTime(e.target.value)} />
            </label>
            <label>
              Symptoms:
              <input type="text" value={symptoms} onChange={(e) => setSymptoms(e.target.value)} placeholder="Describe your symptoms" />
            </label>
            <label>
              Notes:
              <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Additional notes (optional)" />
            </label>
          </div>

          {loadingData ? (
            <p>Loading available doctors and hospitals...</p>
          ) : (
            <>
              {activeTab === "doctors" && (
                <div className="cards-container">
                  {doctors.length === 0 ? <p>No doctors available.</p> : doctors.map((doc) => (
                    <div key={doc.doctor_id} className="option-card">
                      <h4>{doc.name}</h4>
                      <p>{doc.specialization}</p>
                      <p>{doc.experience} yrs experience</p>
                      <div className="booking-actions">
                        <button disabled={bookingLoading} onClick={() => bookAppointment("doctor", doc.doctor_id, "offline")}>
                          {bookingLoading === `doctor-${doc.doctor_id}-offline` ? "Booking..." : "Book In-Person"}
                        </button>
                        <button disabled={bookingLoading} onClick={() => bookAppointment("doctor", doc.doctor_id, "online")}>
                          {bookingLoading === `doctor-${doc.doctor_id}-online` ? "Booking..." : "Book Online"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "hospitals" && (
                <div className="cards-container">
                  {hospitals.length === 0 ? <p>No hospitals available.</p> : hospitals.map((hosp) => (
                    <div key={hosp.hospital_id} className="option-card">
                      <h4>{hosp.name}</h4>
                      <p>{hosp.location}</p>
                      <p>{hosp.contact}</p>
                      <div className="booking-actions">
                        <button disabled={bookingLoading} onClick={() => bookAppointment("hospital", hosp.hospital_id, "offline")}>
                          {bookingLoading === `hospital-${hosp.hospital_id}-offline` ? "Booking..." : "Book In-Person"}
                        </button>
                        <button disabled={bookingLoading} onClick={() => bookAppointment("hospital", hosp.hospital_id, "online")}>
                          {bookingLoading === `hospital-${hosp.hospital_id}-online` ? "Booking..." : "Book Online"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* My Appointments Section */}
        <div className="appointments-section">
          <h3>My Appointments ({appointments.length})</h3>
          {loadingAppointments ? (
            <p>Loading appointments...</p>
          ) : appointments.length === 0 ? (
            <p>No appointments scheduled.</p>
          ) : (
            <div className="appointments-list">
              {appointments.map((appt) => (
                <div key={appt.appointment_id} className="appointment-card">
  <h4>{appt.doctor_name || appt.hospital_name}</h4>
  <span className={`status-badge ${getStatusBadge(appt.status)}`}>{appt.status}</span>
  <p>Date & Time: {formatDateTime(appt.appointment_time)}</p>
  <p>Mode: {appt.appointment_type}</p>
  <p className="symptoms">Symptoms: {appt.symptoms || "N/A"}</p>
  <p className="notes">Notes: {appt.notes || "None"}</p>
  {appt.video_link && <a href={appt.video_link} target="_blank" rel="noreferrer">Join Video</a>}

  {/* Check Status Button */}
  <button
  onClick={() => fetchAppointmentStatus(appt.appointment_id)}
  style={{
    background: "linear-gradient(135deg, #3498db, #2980b9)",
    color: "white",
    padding: "0.5rem 1rem",
    border: "none",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "0.8rem",
    transition: "all 0.3s ease"
  }}
  onMouseEnter={(e) => e.target.style.transform = "translateY(-2px)"}
  onMouseLeave={(e) => e.target.style.transform = "translateY(0)"}
>
  Check Status
</button>

</div>

              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Appointments;
