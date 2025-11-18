import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, 
  UserCheck, 
  Building2, 
  CheckCircle, 
  XCircle, 
  Clock,
  Search,
  Filter,
  Eye,
  Mail,
  Phone
} from 'lucide-react';
import './AdminManagement.css';

const AdminManagement = () => {
  const [activeSection, setActiveSection] = useState('users');
  const [users, setUsers] = useState([]);
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [pendingHospitals, setPendingHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    fetchData();
  }, [activeSection]);

  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem('access_token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    try {
      switch (activeSection) {
        case 'users':
          const usersRes = await axios.get('http://localhost:8000/users/', config);
          setUsers(usersRes.data);
          break;
        case 'doctors':
          const doctorsRes = await axios.get('http://localhost:8000/admin/pending-doctors', config);
          setPendingDoctors(doctorsRes.data);
          break;
        case 'hospitals':
          const hospitalsRes = await axios.get('http://localhost:8000/admin/pending-hospitals', config);
          setPendingHospitals(hospitalsRes.data);
          break;
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (type, id, action) => {
    const token = localStorage.getItem('access_token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    try {
      await axios.post(`http://localhost:8000/admin/${action}-${type}/${id}`, {}, config);
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const filteredData = () => {
    const term = searchTerm.toLowerCase();
    switch (activeSection) {
      case 'users':
        return users.filter(user => 
          user.name?.toLowerCase().includes(term) || 
          user.email?.toLowerCase().includes(term)
        );
      case 'doctors':
        return pendingDoctors.filter(doctor => 
          doctor.name?.toLowerCase().includes(term) || 
          doctor.specialization?.toLowerCase().includes(term)
        );
      case 'hospitals':
        return pendingHospitals.filter(hospital => 
          hospital.name?.toLowerCase().includes(term) || 
          hospital.location?.toLowerCase().includes(term)
        );
      default:
        return [];
    }
  };

  const UserCard = ({ user }) => (
    <div className="management-card">
      <div className="card-header">
        <div className="user-info">
          <h3>{user.name}</h3>
          <p className="user-email">{user.email}</p>
        </div>
        <div className="user-status">
          <span className="status-badge active">Active</span>
        </div>
      </div>
      <div className="card-details">
        <div className="detail-item">
          <Mail className="detail-icon" />
          <span>{user.email}</span>
        </div>
        {user.phone && (
          <div className="detail-item">
            <Phone className="detail-icon" />
            <span>{user.phone}</span>
          </div>
        )}
        <div className="detail-item">
          <Clock className="detail-icon" />
          <span>Joined: {new Date(user.created_at).toLocaleDateString()}</span>
        </div>
      </div>
      <div className="card-actions">
        <button 
          className="action-button view"
          onClick={() => setSelectedItem(user)}
        >
          <Eye className="button-icon" />
          View Details
        </button>
      </div>
    </div>
  );

  const DoctorCard = ({ doctor }) => (
    <div className="management-card">
      <div className="card-header">
        <div className="user-info">
          <h3>Dr. {doctor.name}</h3>
          <p className="user-specialization">{doctor.specialization}</p>
        </div>
        <div className="user-status">
          <span className="status-badge pending">Pending</span>
        </div>
      </div>
      <div className="card-details">
        <div className="detail-item">
          <Mail className="detail-icon" />
          <span>{doctor.email}</span>
        </div>
        <div className="detail-item">
          <UserCheck className="detail-icon" />
          <span>{doctor.experience_years} years experience</span>
        </div>
        <div className="detail-item">
          <Clock className="detail-icon" />
          <span>Applied: {new Date(doctor.created_at).toLocaleDateString()}</span>
        </div>
      </div>
      <div className="card-actions">
        <button 
          className="action-button approve"
          onClick={() => handleApproval('doctor', doctor.doctor_id, 'approve')}
        >
          <CheckCircle className="button-icon" />
          Approve
        </button>
        <button 
          className="action-button reject"
          onClick={() => handleApproval('doctor', doctor.doctor_id, 'reject')}
        >
          <XCircle className="button-icon" />
          Reject
        </button>
        <button 
          className="action-button view"
          onClick={() => setSelectedItem(doctor)}
        >
          <Eye className="button-icon" />
          View Details
        </button>
      </div>
    </div>
  );

  const HospitalCard = ({ hospital }) => (
    <div className="management-card">
      <div className="card-header">
        <div className="user-info">
          <h3>{hospital.name}</h3>
          <p className="user-location">{hospital.location}</p>
        </div>
        <div className="user-status">
          <span className="status-badge pending">Pending</span>
        </div>
      </div>
      <div className="card-details">
        <div className="detail-item">
          <Mail className="detail-icon" />
          <span>{hospital.email}</span>
        </div>
        <div className="detail-item">
          <Building2 className="detail-icon" />
          <span>{hospital.type || 'General Hospital'}</span>
        </div>
        <div className="detail-item">
          <Clock className="detail-icon" />
          <span>Applied: {new Date(hospital.created_at).toLocaleDateString()}</span>
        </div>
      </div>
      <div className="card-actions">
        <button 
          className="action-button approve"
          onClick={() => handleApproval('hospital', hospital.hospital_id, 'approve')}
        >
          <CheckCircle className="button-icon" />
          Approve
        </button>
        <button 
          className="action-button reject"
          onClick={() => handleApproval('hospital', hospital.hospital_id, 'reject')}
        >
          <XCircle className="button-icon" />
          Reject
        </button>
        <button 
          className="action-button view"
          onClick={() => setSelectedItem(hospital)}
        >
          <Eye className="button-icon" />
          View Details
        </button>
      </div>
    </div>
  );

  return (
    <div className="admin-management">
      <div className="management-header">
        <h1>Management Console</h1>
        <div className="section-tabs">
          <button 
            className={`section-tab ${activeSection === 'users' ? 'active' : ''}`}
            onClick={() => setActiveSection('users')}
          >
            <Users className="tab-icon" />
            Users
          </button>
          <button 
            className={`section-tab ${activeSection === 'doctors' ? 'active' : ''}`}
            onClick={() => setActiveSection('doctors')}
          >
            <UserCheck className="tab-icon" />
            Doctor Approvals
          </button>
          <button 
            className={`section-tab ${activeSection === 'hospitals' ? 'active' : ''}`}
            onClick={() => setActiveSection('hospitals')}
          >
            <Building2 className="tab-icon" />
            Hospital Approvals
          </button>
        </div>
      </div>

      <div className="management-controls">
        <div className="search-bar">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder={`Search ${activeSection}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="controls-actions">
          <button className="control-button" onClick={fetchData}>
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading {activeSection}...</p>
        </div>
      ) : (
        <div className="management-grid">
          {filteredData().map((item, index) => {
            switch (activeSection) {
              case 'users':
                return <UserCard key={item.user_id || index} user={item} />;
              case 'doctors':
                return <DoctorCard key={item.doctor_id || index} doctor={item} />;
              case 'hospitals':
                return <HospitalCard key={item.hospital_id || index} hospital={item} />;
              default:
                return null;
            }
          })}
        </div>
      )}

      {filteredData().length === 0 && !loading && (
        <div className="empty-state">
          <p>No {activeSection} found</p>
        </div>
      )}

      {/* Detail Modal */}
      {selectedItem && (
        <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Details</h2>
              <button 
                className="modal-close"
                onClick={() => setSelectedItem(null)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <pre>{JSON.stringify(selectedItem, null, 2)}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManagement;
