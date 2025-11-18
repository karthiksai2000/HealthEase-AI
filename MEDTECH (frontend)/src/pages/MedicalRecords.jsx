// src/pages/MedicalRecords.jsx
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./MedicalRecords.css";

const MedicalRecords = () => {
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState("");
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // Fetch records on mount
  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");
      const response = await axios.get("http://localhost:8000/medical-records", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRecords(response.data);
    } catch (error) {
      console.error("Error fetching records:", error);
      showNotification("Failed to load medical records", "error");
    } finally {
      setLoading(false);
    }
  };

const handleUpload = async (e) => {
  e.preventDefault();
  if (!file) {
    showNotification("Please select a file first", "error");
    return;
  }

  const formData = new FormData();
  formData.append("file", file); // file object
  formData.append("file_type", "OTHER"); // must match FastAPI enum
  formData.append("description", description);

  try {
    setUploading(true);
    const token = localStorage.getItem("access_token");

    const response = await axios.post(
      "http://localhost:8000/medical-records/",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`, // must include token
        },
      }
    );

    showNotification("File uploaded successfully!", "success");
    setFile(null);
    setDescription("");
    fetchRecords(); // refresh list
  } catch (error) {
    console.error("Upload error:", error.response?.data || error.message);
    showNotification(
      error.response?.data?.detail || "Failed to upload file",
      "error"
    );
  } finally {
    setUploading(false);
  }
};


  // Drag and drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const showNotification = (message, type = "success") => {
    const existing = document.querySelectorAll(".custom-notification");
    existing.forEach((n) => n.remove());

    const notification = document.createElement("div");
    notification.className = `custom-notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => notification.classList.add("show"), 10);
    setTimeout(() => {
      notification.classList.remove("show");
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 3000);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (filename) => {
    const ext = filename.split(".").pop().toLowerCase();
    switch (ext) {
      case "pdf": return "📄";
      case "doc":
      case "docx": return "📝";
      case "jpg":
      case "jpeg":
      case "png":
      case "gif": return "🖼️";
      case "xls":
      case "xlsx": return "📊";
      default: return "📁";
    }
  };

  return (
    <div className="medical-records-container">
      <div className="medical-records-header">
        <h2>Medical Records</h2>
        <p>Upload and manage your medical documents and prescriptions</p>
      </div>

      <div className="upload-section">
        <h3>Upload New Document</h3>
        <form onSubmit={handleUpload} className="upload-form">
          <div
            className={`file-dropzone ${dragActive ? "active" : ""} ${file ? "has-file" : ""}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="file-input"
            />
            <div className="dropzone-content">
              {file ? (
                <>
                  <div className="file-preview">
                    <span className="file-icon">{getFileIcon(file.name)}</span>
                    <div className="file-info">
                      <div className="file-name">{file.name}</div>
                      <div className="file-size">{formatFileSize(file.size)}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="change-file-btn"
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  >
                    Change File
                  </button>
                </>
              ) : (
                <>
                  <p>Drag & drop your file here or click to browse</p>
                  <p className="dropzone-subtext">Supports PDF, DOC, JPG, PNG (Max 10MB)</p>
                </>
              )}
            </div>
          </div>

          <div className="description-input">
            <label htmlFor="description">Document Description (Optional)</label>
            <input
              type="text"
              id="description"
              placeholder="e.g., Blood Test Results, Doctor Prescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <button type="submit" className="upload-btn" disabled={!file || uploading}>
            {uploading ? "Uploading..." : "Upload Document"}
          </button>
        </form>
      </div>

      <div className="records-section">
        <div className="section-header">
          <h3>Your Medical Documents</h3>
          <span className="records-count">{records.length} documents</span>
        </div>

        {loading ? (
          <div className="loading-records">Loading...</div>
        ) : records.length === 0 ? (
          <div className="empty-state">No documents uploaded yet</div>
        ) : (
          <div className="records-list">
            {records.map((record) => (
              <div key={record.record_id} className="record-card">
                <div className="record-icon">{getFileIcon(record.file_name)}</div>
                <div className="record-details">
                  <h4 className="record-title">{record.file_name}</h4>
                  {record.description && <p className="record-description">{record.description}</p>}
                  <div className="record-meta">
                    <span className="upload-date">
                      Uploaded: {new Date(record.uploaded_at).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="record-actions">
                  <a
                    href={record.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="download-btn"
                  >
                    Download
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicalRecords;
