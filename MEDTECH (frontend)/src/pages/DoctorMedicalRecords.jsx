import React, { useEffect, useState } from "react";
import axios from "axios";

function DoctorMedicalRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const BASE_URL = "http://localhost:8000"; // Backend URL

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("access_token"); // OAuth2 token

        const response = await axios.get(`${BASE_URL}/medical-records/`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { skip: 0, limit: 100 }, // Optional: default params from OpenAPI
        });

        setRecords(response.data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch medical records.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, []);

  if (loading) return <p>Loading medical records...</p>;
  if (error) return <p>{error}</p>;
  if (!records || records.length === 0) return <p>No medical records found.</p>;

  return (
    <div>
      <h2>Medical Records</h2>
      {records.map((record) => (
        <div
          key={record.record_id}
          style={{ border: "1px solid #ccc", margin: "10px", padding: "10px" }}
        >
          <p>Patient ID: {record.user_id}</p>
          <p>File Name: {record.file_name}</p>
          <p>File Type: {record.file_type}</p>
          <p>Description: {record.description || "N/A"}</p>
          <p>Uploaded At: {new Date(record.uploaded_at).toLocaleString()}</p>
          {record.file_url && (
            <p>
              File:{" "}
              <a href={record.file_url} target="_blank" rel="noopener noreferrer">
                View
              </a>
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

export default DoctorMedicalRecords;
