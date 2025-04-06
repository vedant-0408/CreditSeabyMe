// ApplicationsList.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const ApplicationsList = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const token = localStorage.getItem('token');
        const url = filter === 'all' 
          ? 'https://mern-backend-vs.onrender.com/api/applications'
          : `https://mern-backend-vs.onrender.com/api/applications?status=${filter}`;
          
        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setApplications(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch applications');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [filter]);

  if (loading) return <div>Loading applications...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="applications-list-container">
      <h1>Loan Applications</h1>
      
      <div className="filter-controls">
        <label>Filter by status:</label>
        <select 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All Applications</option>
          <option value="pending">Pending</option>
          <option value="verified">Verified</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
      
      {applications.length === 0 ? (
        <div className="no-applications">
          No applications found.
        </div>
      ) : (
        <div className="applications-table">
          <table>
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Email</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app: any) => (
                <tr key={app._id}>
                  <td>{app.applicantName}</td>
                  <td>{app.email}</td>
                  <td>${app.loanAmount.toLocaleString()}</td>
                  <td>
                    <span className={`status-badge status-${app.status}`}>
                      {app.status}
                    </span>
                  </td>
                  <td>{new Date(app.createdAt).toLocaleDateString()}</td>
                  <td>
                    <Link to={`/applications/${app._id}`} className="view-btn">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ApplicationsList;
