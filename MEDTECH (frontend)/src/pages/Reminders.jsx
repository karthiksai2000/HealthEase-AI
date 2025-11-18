// src/pages/Reminders.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Reminders.css";

const API_BASE = "http://localhost:8000";

const Reminders = () => {
  const token = localStorage.getItem("access_token");
  const [reminders, setReminders] = useState(
    JSON.parse(localStorage.getItem("reminders")) || []
  );
  const [text, setText] = useState("");
  const [time, setTime] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("custom");

  // Save reminders to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("reminders", JSON.stringify(reminders));
  }, [reminders]);

  // Fetch upcoming appointments
  useEffect(() => {
    if (!token) return;

    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE}/appointments/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAppointments(res.data);

        // Set reminders for upcoming appointments (30 min before)
        res.data.forEach((appt) => {
          const apptTime = new Date(appt.appointment_time).getTime();
          const reminderTime = apptTime - 30 * 60 * 1000; // 30 min before
          const now = new Date().getTime();

          if (reminderTime > now) {
            setTimeout(() => {
              showNotification(
                `Upcoming appointment with ${appt.doctor_name || appt.hospital_name} in 30 minutes!`,
                "info"
              );
            }, reminderTime - now);
          }
        });
      } catch (err) {
        console.error("Failed to fetch appointments:", err);
        showNotification("Failed to load appointments", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [token]);

  // Add a custom reminder
  const handleAddReminder = (e) => {
    e.preventDefault();
    if (!text || !time) {
      showNotification("Please fill in all fields", "error");
      return;
    }

    const newReminder = {
      id: Date.now(),
      text,
      time: new Date(time),
    };

    setReminders([...reminders, newReminder]);

    const delay = newReminder.time.getTime() - new Date().getTime();
    if (delay > 0) {
      setTimeout(() => showNotification(`Reminder: ${newReminder.text}`, "reminder"), delay);
    }

    setText("");
    setTime("");
    showNotification("Reminder added successfully", "success");
  };

  const handleDelete = (id) => {
    const updated = reminders.filter((r) => r.id !== id);
    setReminders(updated);
    showNotification("Reminder deleted", "success");
  };

  // Notification function
  const showNotification = (message, type = "success") => {
    // Remove any existing notifications
    const existingNotifications = document.querySelectorAll(".custom-notification");
    existingNotifications.forEach(notification => notification.remove());
    
    const notification = document.createElement("div");
    notification.className = `custom-notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add("show");
    }, 10);
    
    setTimeout(() => {
      notification.classList.remove("show");
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 3000);
  };

  const formatDateTime = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getTimeDifference = (dateTime) => {
    const now = new Date();
    const diffMs = new Date(dateTime) - now;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffDays > 0) return `in ${diffDays} day${diffDays > 1 ? 's' : ''}`;
    if (diffHours > 0) return `in ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    return 'soon';
  };

  return (
    <div className="reminders-container">
      <div className="reminders-header">
        <div className="header-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18 17v-6c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v6H4v2h16v-2h-2zm-6 0c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1z"/>
          </svg>
        </div>
        <h2>Medication & Appointment Reminders</h2>
        <p>Never miss a dose or appointment with timely reminders</p>
      </div>

      <div className="reminders-content">
        <div className="add-reminder-section">
          <h3>Add New Reminder</h3>
          <form onSubmit={handleAddReminder} className="reminder-form">
            <div className="form-group">
              <label htmlFor="reminder-text">Reminder Text</label>
              <input
                id="reminder-text"
                type="text"
                placeholder="e.g., Take medication, Doctor appointment, etc."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="reminder-time">Date & Time</label>
              <input
                id="reminder-time"
                type="datetime-local"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
            
            <button type="submit" className="btn-primary">
              Add Reminder
            </button>
          </form>
        </div>

        <div className="reminders-list-section">
          <div className="section-tabs">
            <button 
              className={`tab ${activeTab === 'custom' ? 'active' : ''}`}
              onClick={() => setActiveTab('custom')}
            >
              Custom Reminders
            </button>
            <button 
              className={`tab ${activeTab === 'appointments' ? 'active' : ''}`}
              onClick={() => setActiveTab('appointments')}
            >
              Appointment Reminders
            </button>
          </div>

          {activeTab === 'custom' ? (
            <div className="tab-content">
              <h3>Your Custom Reminders</h3>
              {reminders.length === 0 ? (
                <div className="empty-state">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  <h4>No custom reminders yet</h4>
                  <p>Add your first reminder to get started</p>
                </div>
              ) : (
                <div className="reminders-grid">
                  {reminders.map((reminder) => (
                    <div key={reminder.id} className="reminder-card">
                      <div className="reminder-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                        </svg>
                      </div>
                      <div className="reminder-details">
                        <h4>{reminder.text}</h4>
                        <p className="reminder-time">{formatDateTime(reminder.time)}</p>
                        <p className="reminder-eta">Reminder set for {getTimeDifference(reminder.time)}</p>
                      </div>
                      <button 
                        onClick={() => handleDelete(reminder.id)}
                        className="delete-btn"
                        title="Delete reminder"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="tab-content">
              <h3>Appointment Reminders</h3>
              {loading ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Loading your appointments...</p>
                </div>
              ) : appointments.length === 0 ? (
                <div className="empty-state">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                  </svg>
                  <h4>No upcoming appointments</h4>
                  <p>You don't have any scheduled appointments</p>
                </div>
              ) : (
                <div className="appointments-grid">
                  {appointments.map((appt) => (
                    <div key={appt.appointment_id} className="appointment-reminder-card">
                      <div className="reminder-icon appointment">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-3 10h-3v3c0 .55-.45 1-1 1h-2c-.55 0-1-.45-1-1v-3H8c-.55 0-1-.45-1-1v-2c0-.55.45-1 1-1h3V6c0-.55.45-1 1-1h2c.55 0 1 .45 1 1v3h3c.55 0 1 .45 1 1v2c0 .55-.45 1-1 1z"/>
                        </svg>
                      </div>
                      <div className="reminder-details">
                        <h4>{appt.doctor_name || appt.hospital_name}</h4>
                        <p className="reminder-time">{formatDateTime(appt.appointment_time)}</p>
                        <div className="appointment-meta">
                          <span className="mode-badge">{appt.mode}</span>
                          <span className="reminder-note">You'll be reminded 30 minutes before</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reminders;