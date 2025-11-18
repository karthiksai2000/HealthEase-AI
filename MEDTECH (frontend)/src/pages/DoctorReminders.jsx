import React, { useState, useEffect } from "react";
import axios from "axios";
import "./DoctorReminders.css"; // Import the CSS file

function DoctorReminders() {
  const [appointments, setAppointments] = useState([]);
  const [customHoursBefore, setCustomHoursBefore] = useState(1);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/appointments", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const videoAppointments = response.data.filter(
        (appt) => appt.appointment_type === "VIDEO"
      );
      setAppointments(videoAppointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendReminder = async (hoursBefore) => {
    try {
      setSending(true);
      await axios.post(
        "/appointments/send-reminders",
        {},
        {
          params: { hours_before: hoursBefore },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      alert(`Reminders sent for ${hoursBefore} hour(s) before appointment`);
    } catch (error) {
      console.error("Error sending reminders:", error);
      alert("Failed to send reminders. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="reminders-container">
      <h2 className="reminders-header">Doctor Reminders</h2>
      <p style={{textAlign: 'center', color: '#7f8c8d', marginBottom: '2rem'}}>
        Manage reminders for upcoming video appointments
      </p>

      <div className="reminder-controls">
        <h3 className="controls-title">Send Custom Reminders</h3>
        <div className="custom-reminder">
          <span className="reminder-label">Send reminder (hours before appointment):</span>
          <input
            type="number"
            value={customHoursBefore}
            min="0"
            max="24"
            onChange={(e) => setCustomHoursBefore(Number(e.target.value))}
            className="reminder-input"
          />
          <button
            onClick={() => sendReminder(customHoursBefore)}
            disabled={sending}
            className="send-btn"
          >
            {sending ? "Sending..." : "Send Reminder"}
          </button>
        </div>
      </div>

      <div className="appointments-section">
        <h3 className="section-title">Upcoming Video Appointments</h3>
        
        {loading ? (
          <div className="no-appointments loading">Loading appointments...</div>
        ) : appointments.length === 0 ? (
          <div className="no-appointments">No video appointments found.</div>
        ) : (
          <div className="appointments-list">
            {appointments.map((appt) => (
              <div key={appt.appointment_id} className="appointment-item">
                <div className="appointment-info">
                  <div className="info-item">
                    <span className="info-label">Patient ID</span>
                    <span className="info-value">#{appt.user_id}</span>
                  </div>
                  
                  <div className="info-item">
                    <span className="info-label">Appointment Time</span>
                    <span className="info-value">
                      {new Date(appt.appointment_time).toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="info-item">
                    <span className="info-label">Duration</span>
                    <span className="info-value">{appt.duration || 30} minutes</span>
                  </div>
                  
                  {appt.status && (
                    <div className="info-item">
                      <span className="info-label">Status</span>
                      <span className="info-value">{appt.status}</span>
                    </div>
                  )}
                </div>
                
                {appt.video_link && (
                  <a
                    href={appt.video_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="video-link"
                  >
                    Join Video Call
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default DoctorReminders;