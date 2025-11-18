import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminDashboard.css"; // your styles
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const API_BASE = "http://localhost:8000";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [appointmentsOverview, setAppointmentsOverview] = useState(null);

  const token = localStorage.getItem("access_token");

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_BASE}/admin/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(res.data);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const res = await axios.get(
        `${API_BASE}/admin/dashboard/recent-activity?limit=10`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRecentActivity(res.data);
    } catch (err) {
      console.error("Error fetching recent activity:", err);
    }
  };

  const fetchAppointmentsOverview = async () => {
    try {
      const res = await axios.get(
        `${API_BASE}/admin/dashboard/appointments-overview`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAppointmentsOverview(res.data);
    } catch (err) {
      console.error("Error fetching appointments overview:", err);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchRecentActivity();
    fetchAppointmentsOverview();
  }, []);

  if (!stats || !appointmentsOverview) return <p>Loading...</p>;

  const systemHealth = stats.system;

  // Chart Options
  const appointmentStatusOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        labels: { color: "#ffffff", font: { size: 14, weight: "600" } },
      },
      title: {
        display: true,
        text: "Appointments by Status",
        color: "#ffffff",
        font: { size: 18, weight: "700" },
      },
      tooltip: {
        enabled: true,
        backgroundColor: "#1e293b",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        borderColor: "#4caf50",
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        ticks: { color: "#ffffff", font: { size: 12, weight: "500" } },
        grid: { color: "rgba(255,255,255,0.15)" },
      },
      y: {
        ticks: { color: "#ffffff", font: { size: 12, weight: "500" } },
        grid: { color: "rgba(255,255,255,0.15)" },
      },
    },
  };

  const appointmentTypeOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
        labels: { color: "#ffffff", font: { size: 14, weight: "600" } },
      },
      title: {
        display: true,
        text: "Appointments by Type",
        color: "#ffffff",
        font: { size: 18, weight: "700" },
      },
      tooltip: {
        enabled: true,
        backgroundColor: "#1e293b",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        borderColor: "#3f51b5",
        borderWidth: 1,
      },
    },
  };

  // Chart data
  const appointmentStatusData = {
    labels: Object.keys(appointmentsOverview.by_status),
    datasets: [
      {
        label: "Appointments",
        data: Object.values(appointmentsOverview.by_status),
        backgroundColor: ["#4caf50", "#ff9800", "#2196f3", "#f44336"],
      },
    ],
  };

  const appointmentTypeData = {
    labels: Object.keys(appointmentsOverview.by_type),
    datasets: [
      {
        label: "Appointment Type",
        data: Object.values(appointmentsOverview.by_type),
        backgroundColor: ["#3f51b5", "#e91e63"],
      },
    ],
  };

  return (
    <div className="dashboard-container">
      <h1>Admin Dashboard</h1>

      <section className="stats-section">
        <h2>System Stats</h2>
        <div className="stats-cards">
          <div className="card">
            <h3>Users</h3>
            <p>Total: {stats.users.total}</p>
            <p>New this month: {stats.users.new_this_month}</p>
            <p>Active today: {stats.users.active_today}</p>
          </div>
          <div className="card">
            <h3>Doctors</h3>
            <p>Total: {stats.doctors.total}</p>
            <p>Approved: {stats.doctors.approved}</p>
            <p>Approval Rate: {stats.doctors.approval_rate}%</p>
          </div>
          <div className="card">
            <h3>Hospitals</h3>
            <p>Total: {stats.hospitals.total}</p>
            <p>Approved: {stats.hospitals.approved}</p>
            <p>Approval Rate: {stats.hospitals.approval_rate}%</p>
          </div>
          <div className="card">
            <h3>Appointments</h3>
            <p>Total: {stats.appointments.total}</p>
            <p>Today: {stats.appointments.today}</p>
            <p>Upcoming: {stats.appointments.upcoming}</p>
          </div>
        </div>
      </section>

      <section className="charts-section">
        <h2>Appointments Overview</h2>
        <div className="charts">
          <div className="chart">
            <h4>By Status</h4>
            <Bar data={appointmentStatusData} options={appointmentStatusOptions} />
          </div>
          <div className="chart">
            <h4>By Type</h4>
            <Pie data={appointmentTypeData} options={appointmentTypeOptions} />
          </div>
        </div>
      </section>

      <section className="recent-activity-section">
        <h2>Recent Activity</h2>
        <ul>
          {recentActivity.map((act, idx) => (
            <li key={idx}>
              <strong>{act.type.replace("_", " ")}:</strong> {act.message}{" "}
              <em>({new Date(act.timestamp).toLocaleString()})</em>
            </li>
          ))}
        </ul>
      </section>

      <section className="system-health-section">
        <h2>System Health</h2>
        <p>Status: {systemHealth.status}</p>
        <p>Last Check: {new Date(systemHealth.last_updated).toLocaleString()}</p>
      </section>
    </div>
  );
};

export default Dashboard;
