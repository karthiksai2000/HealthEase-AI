import React, { useState } from "react";
import DoctorProfile from "./DoctorProfile";
import DoctorAppointments from "./DoctorAppointments";
import DoctorPatients from "./DoctorPatients";
import DoctorMedicalRecords from "./DoctorMedicalRecords";
import DoctorReminders from "./DoctorReminders";
import DoctorHospitalInfo from "./DoctorHospitalInfo";
import "./DoctorDashboard.css";

const DoctorDashboard = () => {
  const [activePage, setActivePage] = useState("Profile");

  const renderPage = () => {
    switch (activePage) {
      case "Profile":
        return <DoctorProfile />;
      case "Appointments":
        return <DoctorAppointments />;
      case "Patients":
        return <DoctorPatients />;
      case "Medical Records":
        return <DoctorMedicalRecords />;
      case "Reminders":
        return <DoctorReminders />;
      case "Hospital Info":
        return <DoctorHospitalInfo />;
      default:
        return <DoctorProfile />;
    }
  };

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <h2>Doctor Dashboard</h2>
        <ul>
          {[
            "Profile",
            "Appointments",
            "Patients",
            "Medical Records",
            "Reminders",
            "Hospital Info",
          ].map((tab) => (
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
      <main className="content">
        <div className="page-content">
          {renderPage()}
        </div>
      </main>
    </div>
  );
};

export default DoctorDashboard;