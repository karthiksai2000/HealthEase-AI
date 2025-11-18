import React, { useState, useEffect } from "react";
import Profile from "./Profile";
import Appointments from "./Appointments";
import MedicalRecords from "./MedicalRecords";
import Reminders from "./Reminders";
import SymptomChecker from "./SymptomChecker";
import "./UserDashboard.css";

const UserDashboard = () => {
  const [activePage, setActivePage] = useState("Profile");
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      try {
        const res = await fetch("http://localhost:8000/users/me/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 401) {
          // Token invalid or expired
          localStorage.removeItem("access_token");
          localStorage.removeItem("user");
          window.location.href = "/login";
          return;
        }

        const data = await res.json();
        setUserProfile(data);
       

// also save in localStorage for reuse
localStorage.setItem("user", JSON.stringify(data));

        setLoading(false);
      } catch (err) {
        console.error("Error fetching user profile:", err);
        alert("Failed to fetch profile. Please try again.");
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const renderPage = () => {
    switch (activePage) {
     case "Profile":
  return <Profile userProfile={userProfile} setUserProfile={setUserProfile} />;

      case "Appointments":
        return <Appointments currentUser={userProfile} />
;
      case "Medical Records":
        return <MedicalRecords />;
      case "Reminders":
        return <Reminders />;
      case "Symptom Checker":
        return <SymptomChecker />;
      default:
        return <Profile userProfile={userProfile} />;
    }
  };

  if (loading) return <div>Loading user dashboard...</div>;

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2>User Dashboard</h2>
        <ul>
          {["Profile", "Appointments", "Medical Records", "Reminders", "Symptom Checker"].map((tab) => (
            <li
              key={tab}
              className={activePage === tab ? "active" : ""}
              onClick={() => setActivePage(tab)}
            >
              {tab}
            </li>
          ))}
        </ul>
      </aside>

      {/* Main Content */}
      <main className="content">{renderPage()}</main>
    </div>
  );
};

export default UserDashboard;
