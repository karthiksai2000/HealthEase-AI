import React, { useEffect, useState } from "react";
import axios from "axios";
import "./DoctorPatients.css"; // Import the CSS file

function DoctorPatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const BASE_URL = "http://localhost:8000";

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("access_token");
        if (!token) throw new Error("No access token found");

        // 1. Get doctor info
        const doctorRes = await axios.get(`${BASE_URL}/doctors/me/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const doctorId = doctorRes.data.doctor_id;

        // 2. Get appointments for this doctor
        const appointmentsRes = await axios.get(`${BASE_URL}/appointments/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Filter appointments for this doctor
        const doctorAppointments = appointmentsRes.data.filter(
          (appt) => appt.doctor_id === doctorId
        );

        // 3. Get unique patient user_ids
        const patientIds = [
          ...new Set(doctorAppointments.map((appt) => appt.user_id)),
        ];

        // 4. Fetch each patient's info
        const patientPromises = patientIds.map((id) =>
          axios.get(`${BASE_URL}/users/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        );
        const patientResponses = await Promise.all(patientPromises);
        setPatients(patientResponses.map((res) => res.data));
      } catch (err) {
        console.error(err);
        setError("Failed to fetch patients.");
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const getGenderClass = (gender) => {
    if (!gender) return '';
    const genderLower = gender.toLowerCase();
    if (genderLower.includes('male')) return 'gender-male';
    if (genderLower.includes('female')) return 'gender-female';
    return 'gender-other';
  };

  if (loading) return <p className="loading-text">Loading patients...</p>;
  if (error) return <p className="error-text">{error}</p>;
  if (patients.length === 0) return <div className="no-patients">No patients found.</div>;

  return (
    <div className="patients-container">
      <h2 className="patients-header">My Patients</h2>
      
      <div className="patients-grid">
        {patients.map((patient) => (
          <div key={patient.user_id} className="patient-card">
            <div className="patient-header">
              <h3 className="patient-name">{patient.name}</h3>
              <span className="patient-id">ID: #{patient.user_id}</span>
            </div>
            
            <div className="patient-info">
              <div className={`info-row ${getGenderClass(patient.gender)}`}>
                <span className="info-icon">👤</span>
                <span className="info-label">Gender:</span>
                <span className="info-value">
                  {patient.gender || <span className="not-available">Not specified</span>}
                </span>
              </div>
              
              <div className="info-row">
                <span className="info-icon">🎂</span>
                <span className="info-label">Age:</span>
                <span className="info-value">
                  {patient.age || <span className="not-available">Not specified</span>}
                </span>
              </div>
              
              <div className="info-row contact-info">
                <span className="info-icon">📧</span>
                <span className="info-label">Email:</span>
                <span className="info-value">{patient.email}</span>
              </div>
              
              <div className="info-row contact-info">
                <span className="info-icon">📞</span>
                <span className="info-label">Phone:</span>
                <span className="info-value">
                  {patient.phone || <span className="not-available">Not provided</span>}
                </span>
              </div>
              
              <div className="info-row location-info">
                <span className="info-icon">🏠</span>
                <span className="info-label">Address:</span>
                <span className="info-value">
                  {patient.address || <span className="not-available">Not provided</span>}
                </span>
              </div>
              
              <div className="info-row location-info">
                <span className="info-icon">📍</span>
                <span className="info-label">Location:</span>
                <span className="info-value">
                  {patient.location || <span className="not-available">Not provided</span>}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DoctorPatients;