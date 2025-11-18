import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./DoctorProfile.css"; // Import the CSS file

function DoctorProfile() {
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [updateLoading, setUpdateLoading] = useState(false);

  const BASE_URL = "http://localhost:8000";
  const navigate = useNavigate();

  useEffect(() => {
  const fetchDoctorProfile = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(`${BASE_URL}/doctors/me/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Doctor profile:", response.data);
      setDoctor(response.data);          // ✅ set doctor state
      setFormData(response.data);        // ✅ initialize formData for editing
    } catch (error) {
      console.error("Failed to fetch doctor profile:", error);
      setError("Failed to load profile"); // show error if fetch fails
    } finally {
      setLoading(false);
    }
  };

  fetchDoctorProfile();
}, []);


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    try {
      setUpdateLoading(true);
      const token = localStorage.getItem("access_token");
      const res = await axios.put(`${BASE_URL}/doctors/me/`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDoctor(res.data);
      setEditMode(false);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update profile.");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  if (loading) return <p className="loading-text">Loading profile...</p>;
  if (error) return <p className="error-text">{error}</p>;
  if (!doctor) return <p className="error-text">No profile data available.</p>;

  return (
    <div className="profile-container">
      <h2 className="profile-header">My Profile</h2>
      
      <div className="profile-card">
        {editMode ? (
          <form className="edit-form" onSubmit={(e) => e.preventDefault()}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name || ""}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter your full name"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email || ""}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter your email"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="text"
                name="phone"
                value={formData.phone || ""}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter your phone number"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Specialization</label>
              <input
                type="text"
                name="specialization"
                value={formData.specialization || ""}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter your specialization"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Experience (Years)</label>
              <input
                type="number"
                name="experience_years"
                value={formData.experience_years || ""}
                onChange={handleChange}
                className="form-input"
                placeholder="Years of experience"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Qualifications</label>
              <input
                type="text"
                name="qualifications"
                value={formData.qualifications || ""}
                onChange={handleChange}
                className="form-input"
                placeholder="Your qualifications"
              />
            </div>

            <div className="form-group">
              <label className="form-label">License Number</label>
              <input
                type="text"
                name="license_number"
                value={formData.license_number || ""}
                onChange={handleChange}
                className="form-input"
                placeholder="Medical license number"
              />
            </div>

            <div className="form-group full-width">
              <label className="form-label">Bio</label>
              <textarea
                name="bio"
                value={formData.bio || ""}
                onChange={handleChange}
                className="form-textarea"
                placeholder="Tell us about yourself and your expertise..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">Consultation Fee ($)</label>
              <input
                type="number"
                name="consultation_fee"
                value={formData.consultation_fee || ""}
                onChange={handleChange}
                className="form-input"
                placeholder="Consultation fee"
              />
            </div>

            <div className="form-group full-width">
              <label className="form-label">Availability</label>
              <input
                type="text"
                name="availability"
                value={formData.availability || ""}
                onChange={handleChange}
                className="form-input"
                placeholder="Your working hours and availability"
              />
            </div>

            <div className="button-group">
              <button 
                onClick={handleUpdate} 
                disabled={updateLoading}
                className="btn btn-primary"
              >
                {updateLoading ? "Updating..." : "Save Changes"}
              </button>
              <button 
                onClick={() => setEditMode(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="profile-view">
              <div className="profile-field">
                <span className="field-label">Full Name</span>
                <span className="field-value">{doctor.name}</span>
              </div>

              <div className="profile-field">
                <span className="field-label">Email Address</span>
                <span className="field-value">{doctor.email}</span>
              </div>

              <div className="profile-field">
                <span className="field-label">Phone Number</span>
                <span className="field-value">{doctor.phone}</span>
              </div>

              <div className="profile-field">
                <span className="field-label">Specialization</span>
                <span className="field-value">{doctor.specialization}</span>
              </div>

              <div className="profile-field experience-field">
                <span className="field-label">Experience</span>
                <span className="field-value experience-value">
                  {doctor.experience_years} years
                </span>
              </div>

              <div className="profile-field">
                <span className="field-label">Qualifications</span>
                <span className="field-value">{doctor.qualifications}</span>
              </div>

              <div className="profile-field">
                <span className="field-label">License Number</span>
                <span className="field-value">{doctor.license_number}</span>
              </div>

              <div className="profile-field bio-field">
                <span className="field-label">Bio</span>
                <span className="field-value">{doctor.bio}</span>
              </div>

              <div className="profile-field fee-field">
                <span className="field-label">Consultation Fee</span>
                <span className="field-value fee-value">
                  ${doctor.consultation_fee}
                </span>
              </div>

              <div className="profile-field">
                <span className="field-label">Availability</span>
                <span className="field-value">{doctor.availability}</span>
              </div>
            </div>

            <div className="button-group">
              <button 
                onClick={() => setEditMode(true)}
                className="btn btn-primary"
              >
                Edit Profile
              </button>
              <button 
                onClick={handleLogout}
                className="btn btn-danger"
              >
                Logout
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default DoctorProfile;