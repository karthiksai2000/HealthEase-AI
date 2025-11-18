import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

function Login() {
  const [role, setRole] = useState("user"); // kept for UI only (dummy)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:8000/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          username: email,
          password: password,
          grant_type: "password",
        }),
      });

      const data = await res.json();

      if (res.ok && data.access_token) {
        // Decode JWT payload
        const payload = JSON.parse(atob(data.access_token.split(".")[1]));
        const userRole = payload.role?.toLowerCase(); // e.g. ADMIN → admin

        // Save token and user info
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem(
          "user",
          JSON.stringify({ 
            role: userRole, 
            email: payload.email 
          })
        );

        alert(`${userRole} login successful!`);

        // Redirect based on real role from backend
        if (userRole === "admin") {
          navigate("/admin-dashboard");
        } else if (userRole === "doctor") {
          navigate("/doctor-dashboard");
        } else if (userRole === "user") {
          navigate("/user-dashboard");
        } else {
          alert("Unknown role, cannot redirect.");
        }
      } else {
        alert(data.detail || "Login failed. Please check your credentials.");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          {/* Dummy dropdown, only for UI */}
          <div className="form-group">
            <label>I am a</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="user">Patient</option>
              <option value="doctor">Doctor</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </button>

          <div className="form-footer">
            <span>
              Not signed up? <a href="/signup">Register here</a>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
