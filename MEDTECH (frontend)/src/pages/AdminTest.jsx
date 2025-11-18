import React from 'react';

const AdminTest = () => {
  return (
    <div style={{ 
      padding: '2rem', 
      background: '#f0f0f0', 
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column'
    }}>
      <h1 style={{ color: '#333', marginBottom: '1rem' }}>Admin Test Page</h1>
      <p style={{ color: '#666' }}>If you can see this, the routing is working!</p>
      <div style={{ marginTop: '2rem' }}>
        <a href="/admin/dashboard" style={{ 
          padding: '0.75rem 1.5rem', 
          background: '#667eea', 
          color: 'white', 
          textDecoration: 'none',
          borderRadius: '8px',
          marginRight: '1rem'
        }}>
          Go to Dashboard
        </a>
        <a href="/admin/management" style={{ 
          padding: '0.75rem 1.5rem', 
          background: '#764ba2', 
          color: 'white', 
          textDecoration: 'none',
          borderRadius: '8px'
        }}>
          Go to Management
        </a>
      </div>
    </div>
  );
};

export default AdminTest;
