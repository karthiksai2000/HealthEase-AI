import React, { useEffect, useState } from "react";
import axios from "axios";
import "./DoctorHospitalInfo.css"; // Import the CSS file

function DoctorHospitalInfo() {
  const [doctor, setDoctor] = useState(null);
  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const BASE_URL = "http://localhost:8000";

  useEffect(() => {
    const fetchDoctorInfo = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("access_token");

        const doctorRes = await axios.get(`${BASE_URL}/doctors/me/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDoctor(doctorRes.data);

        if (doctorRes.data.hospital_id) {
          try {
            const hospitalRes = await axios.get(
              `${BASE_URL}/hospitals/${doctorRes.data.hospital_id}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            setHospital(hospitalRes.data);
          } catch (err) {
            console.warn(
              `Hospital with ID ${doctorRes.data.hospital_id} not found.`
            );
            setHospital(null);
          }
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load doctor or hospital information.");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorInfo();
  }, []);

  if (loading) return <p className="loading-text">Loading information...</p>;
  if (error) return <p className="error-text">{error}</p>;

  return (
    <div className="hospital-info-container">
      {doctor && (
        <div className="info-section doctor-info">
          <h2 className="info-header">Doctor Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Full Name</span>
              <span className="info-value">{doctor.name}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Email Address</span>
              <span className="info-value">{doctor.email}</span>
            </div>
            {doctor.address && (
              <div className="info-item">
                <span className="info-label">Address</span>
                <span className="info-value">{doctor.address}</span>
              </div>
            )}
            <div className="info-item">
              <span className="info-label">Specialization</span>
              <span className="info-value">{doctor.specialization}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Experience</span>
              <span className="info-value experience-value">
                {doctor.experience_years} years
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Consultation Fee</span>
              <span className="info-value fee-value">
                ${doctor.consultation_fee}
              </span>
            </div>
          </div>
        </div>
      )}
      
      {hospital ? (
        <div className="info-section hospital-info">
          <h2 className="info-header">Hospital Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Hospital Name</span>
              <span className="info-value">{hospital.name}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Address</span>
              <span className="info-value">{hospital.address}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Contact Number</span>
              <span className="info-value">{hospital.contact_number}</span>
            </div>
          </div>
        </div>
      ) : doctor?.hospital_id ? (
        <div className="hospital-not-available">
          Hospital information not available.
        </div>
      ) : null}
    </div>
  );
}

export default DoctorHospitalInfo;