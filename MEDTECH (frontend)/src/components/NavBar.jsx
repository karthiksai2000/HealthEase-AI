import { Link } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo">HealthCare</div>
      <ul className="nav-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/doctors">Doctors</Link></li>
        <li><Link to="/dashboard">Dashboard</Link></li>
        <li><Link to="/login">Login</Link></li>
        <li><Link to="/signup" className="btn">Sign Up</Link></li>
      </ul>
    </nav>
  );
}
