// ApplicationDetail.tsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { ApplicationStatus } from '../types';

const ApplicationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [application, setApplication] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userString = localStorage.getItem('user');
    if (userString) {
      setUser(JSON.parse(userString));
    }

    const fetchApplication = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `https://mern-backend-vs.onrender.com/api/applications/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setApplication(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch application');
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [id]);

  const handleVerify = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `https://mern-backend-vs.onrender.com/api/applications/${id}/verify`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setApplication(response.data.application);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to verify application');
    }
  };

  const handleReject = async () => {
    if (!rejectionReason) {
      alert('Please provide a reason for rejection');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `https://mern-backend-vs.onrender.com/api/applications/${id}/reject`,
        { rejectionReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setApplication(response.data.application);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to reject application');
    }
  };

  const handleApprove = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `https://mern-backend-vs.onrender.com/api/applications/${id}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setApplication(response.data.application);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to approve application');
    }
  };

  if (loading) return <div>Loading application details...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!application) return <div>Application not found</div>;

  return (
    <div className="application-detail">
      <button className="back-btn" onClick={() => navigate(-1)}>
        &larr; Back
      </button>
      
      <h1>Loan Application Details</h1>
      
      <div className="status-banner">
        <span className={`status-badge status-${application.status}`}>
          {application.status}
        </span>
      </div>
      
      <div className="detail-section">
        <h2>Applicant Information</h2>
        <div className="detail-grid">
          <div className="detail-item">
            <label>Name:</label>
            <p>{application.applicantName}</p>
          </div>
          <div className="detail-item">
            <label>Email:</label>
            <p>{application.email}</p>
          </div>
          <div className="detail-item">
            <label>Phone:</label>
            <p>{application.phone}</p>
          </div>
        </div>
      </div>
      
      <div className="detail-section">
        <h2>Loan Details</h2>
        <div className="detail-grid">
          <div className="detail-item">
            <label>Amount:</label>
            <p>${application.loanAmount.toLocaleString()}</p>
          </div>
          <div className="detail-item">
            <label>Purpose:</label>
            <p>{application.purpose}</p>
          </div>
          <div className="detail-item">
            <label>Application Date:</label>
            <p>{new Date(application.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
      
      {application.status === ApplicationStatus.REJECTED && (
        <div className="detail-section">
          <h2>Rejection Details</h2>
          <div className="detail-grid">
            <div className="detail-item">
              <label>Reason:</label>
              <p>{application.rejectionReason}</p>
            </div>
            <div className="detail-item">
              <label>Rejected By:</label>
              <p>{application.rejectedBy?.username || 'Unknown'}</p>
            </div>
          </div>
        </div>
      )}
      
      {application.verifiedBy && (
        <div className="detail-item">
          <label>Verified By:</label>
          <p>{application.verifiedBy.username}</p>
        </div>
      )}
      
      {application.approvedBy && (
        <div className="detail-item">
          <label>Approved By:</label>
          <p>{application.approvedBy.username}</p>
        </div>
      )}
      
      {/* Action buttons based on role and current status */}
      <div className="action-buttons">
        {application.status === ApplicationStatus.PENDING && (
          <>
            <button 
              className="verify-btn" 
              onClick={handleVerify}
            >
              Verify Application
            </button>
            <div className="reject-container">
            // ApplicationDetail.tsx (continued)
              <textarea
                placeholder="Reason for rejection"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
              <button 
                className="reject-btn" 
                onClick={handleReject}
              >
                Reject Application
              </button>
            </div>
          </>
        )}
        
        {application.status === ApplicationStatus.VERIFIED && user?.role === 'admin' && (
          <>
            <button 
              className="approve-btn" 
              onClick={handleApprove}
            >
              Approve Application
            </button>
            <div className="reject-container">
              <textarea
                placeholder="Reason for rejection"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
              <button 
                className="reject-btn" 
                onClick={handleReject}
              >
                Reject Application
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ApplicationDetail;

