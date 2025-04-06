// Unauthorized.tsx
// import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized = () => {
  return (
    <div className="unauthorized-container">
      <h1>Access Denied</h1>
      <p>You don't have permission to access this page.</p>
      <Link to="/login" className="login-link">Back to Login</Link>
    </div>
  );
};

export default Unauthorized;
