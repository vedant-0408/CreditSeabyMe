import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/UserDashboard.css";

interface LoanApplication {
  _id: string;
  applicantName: string;
  email: string;
  loanAmount: number;
  loanTenure: number;
  employmentStatus: string;
  purpose: string;
  employmentAddress: string;
  status: 'PENDING' | 'VERIFIED' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
  verifiedBy?: {
    username: string;
  };
  approvedBy?: {
    username: string;
  };
  rejectedBy?: {
    username: string;
  };
  rejectionReason?: string;
}

interface NewLoanApplication {
  applicantName: string;
  email: string;
  loanAmount: number;
  loanTenure: number;
  employmentStatus: string;
  purpose: string;
  employmentAddress: string;
}

const UserDashboardLoans = () => {
  const { email } = useParams<{ email: string }>();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewLoanForm, setShowNewLoanForm] = useState<boolean>(false);
  const [newLoan, setNewLoan] = useState<NewLoanApplication>({
    applicantName: "",
    email: email || "", // Pre-fill with the email from URL params
    loanAmount: 0,
    loanTenure: 0,
    employmentStatus: "",
    purpose: "",
    employmentAddress: ""
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchUserApplications();
  }, [email, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewLoan(prev => ({
      ...prev,
      [name]: name === "loanAmount" || name === "loanTenure" ? parseInt(value) : value
    }));
  };

  const handleSubmitNewLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        navigate("/login");
        return;
      }
      
      if (!newLoan.applicantName || !newLoan.email || !newLoan.loanAmount || !newLoan.loanTenure || !newLoan.employmentStatus || !newLoan.purpose || !newLoan.employmentAddress) {
        setFormError("Please fill in all fields");
        return;
      }
      
      const response = await axios.post("http://localhost:5000/api/applications", newLoan, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setFormSuccess("Loan application submitted successfully!");
      
      setNewLoan({
        applicantName: "",
        email: email || "",
        loanAmount: 0,
        loanTenure: 0,
        employmentStatus: "",
        purpose: "",
        employmentAddress: ""
      });
      
      setTimeout(() => {
        setShowNewLoanForm(false);
        fetchUserApplications();
      }, 2000);
      
    } catch (err: any) {
      console.error("Error submitting application:", err);
      setFormError(err.response?.data?.message || "Error submitting your loan application");
    }
  };

  const fetchUserApplications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      if (!token) {
        navigate("/login");
        return;
      }
      
      const response = await axios.get(`http://localhost:5000/api/applications/user/${email}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setApplications(response.data);
      setLoading(false);
    } catch (err: any) {
      console.error("Error fetching applications:", err);
      setError(err.response?.data?.message || "Error fetching your loan applications");
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const totalApprovedAmount = applications
    .filter(app => app.status === 'APPROVED')
    .reduce((sum, app) => sum + app.loanAmount, 0);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="user-dashboard">
      <header className="user-dashboard-header">
        <h2>CREDIT SEA</h2>
        <nav>
          <a href="#" className="active">Home</a>
          <a href="#">Applications</a>
          <a href="#">Payments</a>
          <a href="#">Profile</a>
        </nav>
        <div className="header-actions">
          <i className="icon-notifications">🔔</i>
          <i className="icon-chat">💬</i>
          <div className="user-menu">
            <span>{email}</span>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        </div>
      </header>

      <main className="dashboard-content">
        <section className="loan-summary">
          <div className="summary-card">
            <h3>{formatCurrency(totalApprovedAmount)}</h3>
            <p>TOTAL APPROVED LOANS</p>
          </div>
          <div className="action-buttons">
            <button onClick={() => setShowNewLoanForm(true)}>Apply for Loan</button>
            <button>View Payments</button>
            <button>View Profile</button>
          </div>
          <input
            type="text"
            placeholder="Search for loans"
            className="search-bar"
          />
        </section>

        {showNewLoanForm && (
          <section className="new-loan-form">
            <div className="form-header">
              <h3>APPLY FOR A LOAN</h3>
              <button onClick={() => setShowNewLoanForm(false)} className="close-btn">×</button>
            </div>
            
            {formError && <div className="error-message">{formError}</div>}
            {formSuccess && <div className="success-message">{formSuccess}</div>}
            
            <form onSubmit={handleSubmitNewLoan}>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="applicantName">Full name as it appears on bank account</label>
          <input
            type="text"
            id="applicantName"
            name="applicantName"
            value={newLoan.applicantName}
            onChange={handleInputChange}
            placeholder="Full name as it appears on bank account"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="loanAmount">How much do you need?</label>
          <input
            type="number"
            id="loanAmount"
            name="loanAmount"
            value={newLoan.loanAmount || ""}
            onChange={handleInputChange}
            placeholder="How much do you need?"
            required
          />
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="loanTenure">Loan tenure (in months)</label>
          <input
            type="number"
            id="loanTenure"
            name="loanTenure"
            value={newLoan.loanTenure || ""}
            onChange={handleInputChange}
            placeholder="Loan tenure (in months)"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="employmentStatus">Employment status</label>
          <input
            type="text"
            id="employmentStatus"
            name="employmentStatus"
            value={newLoan.employmentStatus}
            onChange={handleInputChange}
            placeholder="Employment status"
            required
          />
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-group full-width">
          <label htmlFor="purpose">Reason for loan</label>
          <textarea
            id="purpose"
            name="purpose"
            value={newLoan.purpose}
            onChange={handleInputChange}
            placeholder="Reason for loan"
            required
          />
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-group full-width">
          <label htmlFor="employmentAddress">Employment address</label>
          <input
            type="text"
            id="employmentAddress"
            name="employmentAddress"
            value={newLoan.employmentAddress}
            onChange={handleInputChange}
            placeholder="Employment address"
            required
          />
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-group full-width">
          <label htmlFor="email">Email address</label>
          <input
            type="email"
            id="email"
            name="email"
            value={newLoan.email}
            readOnly
            className="readonly-input"
          />
        </div>
      </div>
      
      <div className="form-actions">
        <button type="button" onClick={() => setShowNewLoanForm(false)} className="cancel-btn">Cancel</button>
        <button type="submit" className="submit-btn">Submit Application</button>
      </div>
    </form>
          </section>
        )}

        <section className="applied-loans">
          <div className="table-header">
            <h3>My Loan Applications</h3>
            <div className="table-actions">
              <button>Sort</button>
              <button>Filter</button>
            </div>
          </div>

          {loading ? (
            <div className="loading">Loading your applications...</div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : applications.length === 0 ? (
            <div className="no-applications">
              <p>You haven't applied for any loans yet.</p>
              <button onClick={() => setShowNewLoanForm(true)}>Apply Now</button>
            </div>
          ) : (
            <>
              <table className="loans-table">
                <thead>
                  <tr>
                    <th>Purpose</th>
                    <th>Amount</th>
                    <th>Date Applied</th>
                    <th>Status</th>
                    <th>Handled By</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((application) => (
                    <tr key={application._id}>
                      <td className="purpose-cell">
                        {application.purpose}
                      </td>
                      <td>{formatCurrency(application.loanAmount)}</td>
                      <td>{`${formatDate(application.createdAt)} ${formatTime(application.createdAt)}`}</td>
                      <td>
                        <span className={`status-badge ${application.status.toLowerCase()}`}>
                          {application.status}
                        </span>
                      </td>
                      <td>
                        {application.status === 'VERIFIED' && application.verifiedBy 
                          ? application.verifiedBy.username 
                          : application.status === 'APPROVED' && application.approvedBy 
                          ? application.approvedBy.username 
                          : application.status === 'REJECTED' && application.rejectedBy 
                          ? application.rejectedBy.username 
                          : 'Pending Review'}
                      </td>
                      <td><button className="options-button">⋮</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="table-pagination">
                Rows per page:&nbsp;7 &nbsp;|&nbsp; 1-{applications.length} of {applications.length}
                &nbsp;
                <button className="pagination-arrow" disabled>←</button>
                &nbsp;
                <button className="pagination-arrow" disabled>→</button>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
};

export default UserDashboardLoans;
