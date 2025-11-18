import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Auth.css";

function Signup() {
  const [role, setRole] = useState("user");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    age: "",
    gender: "",
    location: "",
    address: "",
    password: "",
    specialization: "",
    license_number: "",
    experience_years: "",
    qualifications: "",
    bio: "",
    hospital_id: "",
    consultation_fee: "",
    availability: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (e) => {
    setRole(e.target.value);
    setFormData({
      name: "",
      email: "",
      phone: "",
      age: "",
      gender: "",
      location: "",
      address: "",
      password: "",
      specialization: "",
      license_number: "",
      experience_years: "",
      qualifications: "",
      bio: "",
      hospital_id: "",
      consultation_fee: "",
      availability: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let endpoint = "";
      let body = {};

      if (role === "user") {
        endpoint = "http://localhost:8000/users/";
        body = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          age: parseInt(formData.age),
          gender: formData.gender,
          location: formData.location,
          address: formData.address,
          password: formData.password,
        };
      } else if (role === "doctor") {
        endpoint = "http://localhost:8000/doctors/";
        body = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          specialization: formData.specialization,
          license_number: formData.license_number,
          experience_years: parseInt(formData.experience_years),
          qualifications: formData.qualifications,
          bio: formData.bio,
          hospital_id: parseInt(formData.hospital_id),
          consultation_fee: parseFloat(formData.consultation_fee),
          availability: formData.availability,
          password: formData.password,
        };
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (res.ok) {
        alert(`${role} signup successful! Please login.`);
        navigate("/login");
      } else {
        alert(data.detail || "Signup failed");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Sign Up</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>I am a</label>
            <select value={role} onChange={handleRoleChange}>
              <option value="user">Patient</option>
              <option value="doctor">Doctor</option>
              <option value="admin" disabled>
                Admin (Cannot signup)
              </option>
            </select>
          </div>

          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Phone</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          {role === "user" && (
            <>
              <div className="form-group">
                <label>Age</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="">Select</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="O">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
            </>
          )}

          {role === "doctor" && (
            <>
              <div className="form-group">
                <label>Specialization</label>
                <input
                  type="text"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>License Number</label>
                <input
                  type="text"
                  name="license_number"
                  value={formData.license_number}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Experience Years</label>
                <input
                  type="number"
                  name="experience_years"
                  value={formData.experience_years}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Qualifications</label>
                <input
                  type="text"
                  name="qualifications"
                  value={formData.qualifications}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Bio</label>
                <input
                  type="text"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Hospital ID</label>
                <input
                  type="number"
                  name="hospital_id"
                  value={formData.hospital_id}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Consultation Fee</label>
                <input
                  type="number"
                  name="consultation_fee"
                  value={formData.consultation_fee}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Availability</label>
                <input
                  type="text"
                  name="availability"
                  value={formData.availability}
                  onChange={handleChange}
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>
        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
