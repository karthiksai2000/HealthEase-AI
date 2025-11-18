import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Profile.css";

const API_BASE = "http://localhost:8000";

const Profile = () => {
  const token = localStorage.getItem("access_token");

  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    age: "",
    gender: "",
    location: "",
    address: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!token) {
      window.location.href = "/login";
      return;
    }

    axios
      .get(`${API_BASE}/users/me/`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        setProfile(res.data);

        // Map backend gender ("M","F","O") -> frontend dropdown
        const genderMap = { M: "Male", F: "Female", O: "Other" };
        setForm({
          name: res.data.name || "",
          phone: res.data.phone || "",
          age: res.data.age || "",
          gender: genderMap[res.data.gender] || "",
          location: res.data.location || "",
          address: res.data.address || "",
        });

        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        if (err.response && err.response.status === 401) {
          localStorage.clear();
          window.location.href = "/login";
        } else {
          setLoading(false);
        }
      });
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.phone.trim()) newErrors.phone = "Phone number is required";
    if (!form.age || form.age < 0 || form.age > 120) newErrors.age = "Enter valid age";
    if (!form.gender.trim()) newErrors.gender = "Gender is required";
    if (!form.location.trim()) newErrors.location = "Location is required";
    if (!form.address.trim()) newErrors.address = "Address is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setSaving(true);

    // Map frontend gender -> backend enum
    const genderMap = { Male: "M", Female: "F", Other: "O" };
    const payload = {
      name: form.name,
      phone: form.phone,
      age: Number(form.age),
      gender: genderMap[form.gender] || "O",
      location: form.location,
      address: form.address,
    };

    try {
      const res = await axios.put(`${API_BASE}/users/me/`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(res.data);
      setEditing(false);
      setSaving(false);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      setSaving(false);
      alert("Failed to update profile");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  if (loading) return <div className="profile-container">Loading profile...</div>;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          {profile?.name ? profile.name.charAt(0).toUpperCase() : "U"}
        </div>
        <h2>User Profile</h2>
        <p>Manage your personal information</p>
      </div>

      {editing ? (
        <div className="profile-form">
          <div className="form-grid">
            <div className="form-group">
              <label>Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className={errors.name ? "error" : ""}
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>
            <div className="form-group">
              <label>Email</label>
              <input value={profile.email} disabled />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className={errors.phone ? "error" : ""}
              />
              {errors.phone && <span className="error-text">{errors.phone}</span>}
            </div>
            <div className="form-group">
              <label>Age</label>
              <input
                type="number"
                name="age"
                value={form.age}
                onChange={handleChange}
                min="1"
                max="120"
                className={errors.age ? "error" : ""}
              />
              {errors.age && <span className="error-text">{errors.age}</span>}
            </div>
            <div className="form-group">
              <label>Gender</label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className={errors.gender ? "error" : ""}
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {errors.gender && <span className="error-text">{errors.gender}</span>}
            </div>
            <div className="form-group">
              <label>Location</label>
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                className={errors.location ? "error" : ""}
              />
              {errors.location && <span className="error-text">{errors.location}</span>}
            </div>
            <div className="form-group full-width">
              <label>Address</label>
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                rows="3"
                className={errors.address ? "error" : ""}
              />
              {errors.address && <span className="error-text">{errors.address}</span>}
            </div>
          </div>

          <div className="form-actions">
            <button onClick={handleSave} className="btn-primary" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button
              onClick={() => setEditing(false)}
              className="btn-secondary"
              disabled={saving}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="profile-details">
          <div className="details-grid">
            <div className="detail-item"><span>Name:</span> {profile.name || "Not provided"}</div>
            <div className="detail-item"><span>Email:</span> {profile.email}</div>
            <div className="detail-item"><span>Phone:</span> {profile.phone || "Not provided"}</div>
            <div className="detail-item"><span>Age:</span> {profile.age || "Not provided"}</div>
            <div className="detail-item"><span>Gender:</span> {profile.gender || "Not provided"}</div>
            <div className="detail-item"><span>Location:</span> {profile.location || "Not provided"}</div>
            <div className="detail-item full-width"><span>Address:</span> {profile.address || "Not provided"}</div>
          </div>
          <div className="profile-actions">
            <button onClick={() => setEditing(true)} className="btn-primary">Edit Profile</button>
            <button onClick={handleLogout} className="btn-logout">Logout</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
