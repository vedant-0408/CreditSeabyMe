import React, { useState, useEffect } from "react";
import "../styles/AdminDashboard.css";
import axios from "axios";
import { Plus, Trash2 } from "lucide-react";
// Import icons
import { Users, User, DollarSign, PiggyBank, CheckSquare, Briefcase, Bell, MessageSquare, ChevronDown, MoreVertical, ArrowLeft, ArrowRight, Filter, SortAsc, User2 } from "lucide-react";
import Sidebar from "./Sidebar";

// Define TypeScript interfaces
interface Verifier {
  _id: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
}

interface Application {
  _id: string;
  applicantName: string;
  email: string;
  phone: string;
  loanAmount: number;
  purpose: string;
  status: 'PENDING' | 'VERIFIED' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
  verifiedBy?: {
    _id: string;
    username: string;
  };
  approvedBy?: {
    _id: string;
    username: string;
  };
  rejectedBy?: {
    _id: string;
    username: string;
  };
  rejectionReason?: string;
}

interface DashboardData {
  totalApplications: number;
  pendingApplications: number;
  verifiedApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  totalApprovedAmount: number;
  recentApplications: Application[];
}

interface PaginatedResponse {
  applications: Application[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

interface StatItem {
  label: string;
  value: string;
  icon: React.ReactNode;
}

const AdminDashboard: React.FC = () => {
  const [dashboardStats, setDashboardStats] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    verifiedApplications: 0,
    approvedApplications: 0,
    rejectedApplications: 0,
    totalApprovedAmount: 0
  });
  const [activeOptionsId, setActiveOptionsId] = useState<string | null>(null);
  const [recentApplications, setRecentApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(7);
  const [totalRows, setTotalRows] = useState<number>(0);
  const [sortField, setSortField] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [showFilterDropdown, setShowFilterDropdown] = useState<boolean>(false);
  const [verifiers, setVerifiers] = useState<Verifier[]>([]);
  const [showVerifierForm, setShowVerifierForm] = useState<boolean>(false);
  const [newVerifier, setNewVerifier] = useState({
    username: "",
    email: "",
    password: ""
  });
  const [verifierError, setVerifierError] = useState<string | null>(null);
  const [verifierSuccess, setVerifierSuccess] = useState<string | null>(null);
  const [loadingVerifiers, setLoadingVerifiers] = useState<boolean>(false);

  useEffect(() => {
    fetchVerifiers();
  }, []);

  const fetchVerifiers = async (): Promise<void> => {
    try {
      setLoadingVerifiers(true);
      const token = localStorage.getItem("token");

      const response = await axios.get("http://localhost:5000/api/auth/users?role=verifier", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setVerifiers(response.data.filter((user: any) => user.role === 'verifier'));
      setLoadingVerifiers(false);
    } catch (err: any) {
      console.error("Error fetching verifiers:", err);
      setVerifierError(err.response?.data?.message || "Error fetching verifiers");
      setLoadingVerifiers(false);
    }
  };

  const handleVerifierInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setNewVerifier(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddVerifier = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setVerifierError(null);
    setVerifierSuccess(null);

    try {
      setLoadingVerifiers(true);
      const token = localStorage.getItem("token");

      await axios.post("http://localhost:5000/api/auth/create-user", {
        ...newVerifier,
        role: "verifier"
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setVerifierSuccess("Verifier added successfully");
      setNewVerifier({
        username: "",
        email: "",
        password: ""
      });
      setShowVerifierForm(false);
      fetchVerifiers();
    } catch (err: any) {
      console.error("Error adding verifier:", err);
      setVerifierError(err.response?.data?.message || "Error adding verifier");
    } finally {
      setLoadingVerifiers(false);
    }
  };

  const handleRemoveVerifier = async (verifierId: string): Promise<void> => {
    try {
      setLoadingVerifiers(true);
      const token = localStorage.getItem("token");

      await axios.delete(`http://localhost:5000/api/auth/users/${verifierId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setVerifierSuccess("Verifier removed successfully");
      fetchVerifiers();
    } catch (err: any) {
      console.error("Error removing verifier:", err);
      setVerifierError(err.response?.data?.message || "Error removing verifier");
    } finally {
      setLoadingVerifiers(false);
    }
  };


  // Fetch dashboard data from API
  useEffect(() => {
    const fetchDashboardData = async (): Promise<void> => {
      try {
        console.log("hi");
        setLoading(true);
        const token = localStorage.getItem("token"); // Assuming token is stored in localStorage
        const response = await axios.get<DashboardData>("http://localhost:5000/api/applications/stats/dashboard", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log("Dashboard data:", response.data);

        // Update dashboard stats separately from applications
        setDashboardStats({
          totalApplications: response.data.totalApplications || 0,
          pendingApplications: response.data.pendingApplications || 0,
          verifiedApplications: response.data.verifiedApplications || 0,
          approvedApplications: response.data.approvedApplications || 0,
          rejectedApplications: response.data.rejectedApplications || 0,
          totalApprovedAmount: response.data.totalApprovedAmount || 0
        });

        setTotalRows(response.data.totalApplications || 0);

        // Only set recent applications if they're included in the dashboard response
        if (response.data.recentApplications && Array.isArray(response.data.recentApplications)) {
          setRecentApplications(response.data.recentApplications);
        }

        setLoading(false);
      } catch (err: any) {
        console.error("Error fetching dashboard data:", err);
        setError(err.response?.data?.message || "Error fetching dashboard data");
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Fetch loan applications with pagination, sorting, and filtering
  const fetchApplications = async (): Promise<void> => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      let url = `http://localhost:5000/api/applications?page=${currentPage}&limit=${rowsPerPage}&sort=${sortField}&order=${sortOrder}`;
      if (filterStatus) {
        url += `&status=${filterStatus}`;
      }

      console.log("Fetching applications with URL:", url);
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Check the structure of the response and extract the applications array
      if (response.data.applications && Array.isArray(response.data.applications)) {
        setRecentApplications(response.data.applications);
        if (response.data.pagination) {
          setTotalRows(response.data.pagination.total);
        }
      } else if (Array.isArray(response.data)) {
        setRecentApplications(response.data);
      } else {
        console.error("Unexpected response format:", response.data);
        setRecentApplications([]);
      }

      setLoading(false);
    } catch (err: any) {
      console.error("Error fetching applications:", err);
      setError(err.response?.data?.message || "Error fetching applications");
      setLoading(false);
    }
  };

  // Update the useEffect to use this function
  useEffect(() => {
    fetchApplications();
  }, [currentPage, rowsPerPage, sortField, sortOrder, filterStatus]);

  const toggleOptionsMenu = (applicationId: string): void => {
    if (activeOptionsId === applicationId) {
      setActiveOptionsId(null);
    } else {
      setActiveOptionsId(applicationId);
    }
  };


  const updateApplicationStatus = async (applicationId: string, newStatus: string): Promise<void> => {
    try {

      console.log("Updating application with ID:", applicationId); // Add this to debug
    if (!applicationId) {
      console.error("Application ID is undefined");
      setError("Application ID is missing");
      return;
    }
    
      const token = localStorage.getItem("token");
      let endpoint = '';
      let data = {};

      // Determine the appropriate endpoint based on the new status
      switch (newStatus) {
        case 'VERIFIED':
          endpoint = `http://localhost:5000/api/applications/${applicationId}/verify`;
          break;
        case 'APPROVED':
          endpoint = `http://localhost:5000/api/applications/${applicationId}/approve`;
          break;
        case 'REJECTED':
          endpoint = `http://localhost:5000/api/applications/${applicationId}/reject`;
          data = { rejectionReason: "Application rejected by admin" };
          break;
        default:
          console.error("Invalid status update requested");
          return;
      }

      await axios.patch(endpoint, data, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Refresh the applications list
      fetchApplications();
      // Close the options menu
      setActiveOptionsId(null);

    } catch (err: any) {
      console.error("Error updating application status:", err);
      setError(err.response?.data?.message || "Error updating application status");
    }
  };

  // Format date and time for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' });
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const formatTimestamp = (dateString: string): string => {
    const date = new Date(dateString);
    return `at ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}`;
  };

  // Handle pagination
  const handleNextPage = (): void => {
    if (currentPage * rowsPerPage < totalRows) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = (): void => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  // Handle sorting
  const handleSort = (): void => {
    setSortOrder(prev => prev === "asc" ? "desc" : "asc");
  };

  // Handle filtering
  const handleFilter = (status: string): void => {
    console.log("Filtering by status:", status);
    setFilterStatus(status);
    setCurrentPage(1); // Reset to first page when filtering
    setShowFilterDropdown(false); // Close dropdown after selection
  };

  // Toggle filter dropdown
  const toggleFilterDropdown = (): void => {
    setShowFilterDropdown(prev => !prev);
  };

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.filter-btn-container') && showFilterDropdown) {
        setShowFilterDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFilterDropdown]);

  // Map dashboard data to stats format
  const stats = [
    { label: "TOTAL APPLICATIONS", value: dashboardStats.totalApplications.toString(), icon: <Users size={24} /> },
    { label: "PENDING APPLICATIONS", value: dashboardStats.pendingApplications.toString(), icon: <User size={24} /> },
    { label: "APPROVED LOANS", value: dashboardStats.approvedApplications.toString(), icon: <CheckSquare size={24} /> },
    { label: "CASH DISBURSED", value: dashboardStats.totalApprovedAmount.toLocaleString(), icon: <DollarSign size={24} /> },
    { label: "VERIFIED APPLICATIONS", value: dashboardStats.verifiedApplications.toString(), icon: <PiggyBank size={24} /> },
    { label: "REJECTED APPLICATIONS", value: dashboardStats.rejectedApplications.toString(), icon: <Briefcase size={24} /> },
  ];

  // Get time ago string
  const getTimeAgo = (dateString: string): string => {
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now.getTime() - past.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHrs < 1) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return `Updated ${diffMins} minutes ago`;
    } else if (diffHrs < 24) {
      return `Updated ${diffHrs} hours ago`;
    } else {
      const diffDays = Math.floor(diffHrs / 24);
      return `Updated ${diffDays} days ago`;
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />

      {/* Main Content */}
      <main className="main-content">
        <header className="dashboard-header">
          <div className="header-right">
            <div className="notifications">
              <Bell size={20} />
            </div>
            <div className="messages">
              <MessageSquare size={20} />
            </div>
            <div className="admin-dropdown">
              <span>Admin</span>
              <ChevronDown size={16} />
            </div>
          </div>
        </header>

        <div className="dashboard-title">
          <h2>Dashboard</h2>
        </div>

        {/* Statistics Cards */}
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div className="stat-card" key={index}>
              <div className="stat-icon">
                {stat.icon}
              </div>
              <div className="stat-info">
                <h3>{stat.value}</h3>
                <p>{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Loans */}
        <div className="recent-loans-section">
          <div className="section-header">
            <h3>Recent Loan Applications</h3>
            <div className="section-actions">
              <button className="sort-btn" onClick={handleSort}>
                <SortAsc size={16} />
                <span>Sort {sortOrder === "asc" ? "↑" : "↓"}</span>
              </button>
              <div className="filter-btn-container">
                <button className="filter-btn" onClick={toggleFilterDropdown}>
                  <Filter size={16} />
                  <span>Filter {filterStatus ? `(${filterStatus})` : ''}</span>
                </button>
                {showFilterDropdown && (
                  <div className="filter-dropdown" style={{ display: 'block', position: 'absolute', zIndex: 1000 }}>
                    <div onClick={() => handleFilter("")}>All</div>
                    <div onClick={() => handleFilter("PENDING")}>Pending</div>
                    <div onClick={() => handleFilter("VERIFIED")}>Verified</div>
                    <div onClick={() => handleFilter("APPROVED")}>Approved</div>
                    <div onClick={() => handleFilter("REJECTED")}>Rejected</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="loading">Loading...</div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : (
            <table className="loans-table">
              <thead>
                <tr>
                  <th>Application details</th>
                  <th>Applicant name</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {recentApplications && recentApplications.length > 0 ? (
                  recentApplications.map((application, index) => (
                    <tr key={index}>
                      <td className="user-details">
                        <div className="user-activity">
                          <div className="user-avatar">
                            <User2 />
                          </div>
                          <div className="activity-details">
                            <p className="activity">{application.purpose || "Loan Application"}</p>
                            <p className="time-ago">{getTimeAgo(application.createdAt)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="customer-name">{application.applicantName}</td>
                      <td className="date-column">
                        <div className="date-info">
                          <p className="date">{formatDate(application.createdAt)}</p>
                          <p className="time">{formatTime(application.createdAt)}</p>
                          <p className="timestamp">{formatTimestamp(application.createdAt)}</p>
                        </div>
                      </td>
                      <td className="status-column">
                        <span className={`status-badge ${application.status?.toLowerCase()}`} style={{
                          display: 'inline-block',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontWeight: 'bold',
                          textTransform: 'capitalize',
                          backgroundColor:
                            application.status === 'PENDING' ? '#FFF4DE' :
                              application.status === 'VERIFIED' ? '#DCFCE7' :
                                application.status === 'APPROVED' ? '#D1E9FF' :
                                  application.status === 'REJECTED' ? '#FFE2E5' : '#f0f0f0',
                          color:
                            application.status === 'PENDING' ? '#FF9500' :
                              application.status === 'VERIFIED' ? '#22C55E' :
                                application.status === 'APPROVED' ? '#3B82F6' :
                                  application.status === 'REJECTED' ? '#F43F5E' : '#666666'
                        }}>
                          {application.status}
                        </span>
                      </td>
                      <td className="options-column">
                        <div className="options-menu-container">
                          <button
                            className="options-btn"
                            onClick={() => toggleOptionsMenu(application._id)}
                          >
                            <MoreVertical size={16} />
                          </button>

                          {activeOptionsId === application._id && (
                            <div className="options-dropdown" style={{
                              display: 'block',
                              position: 'absolute',
                              zIndex: 1000,
                              right: '0',
                              backgroundColor: 'white',
                              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                              borderRadius: '4px',
                              padding: '8px 0'
                            }}>
                              {application.status !== 'VERIFIED' && application.status === 'PENDING' && (
                                <div
                                  className="option-item"
                                  onClick={() => updateApplicationStatus(application._id, 'VERIFIED')}
                                  style={{ padding: '8px 16px', cursor: 'pointer', hoverBackgroundColor: '#f5f5f5' }}
                                >
                                  Verify Application
                                </div>
                              )}

                              {application.status !== 'APPROVED' && application.status === 'VERIFIED' && (
                                <div
                                  className="option-item"
                                  onClick={() => updateApplicationStatus(application._id, 'APPROVED')}
                                  style={{ padding: '8px 16px', cursor: 'pointer', hoverBackgroundColor: '#f5f5f5' }}
                                >
                                  Approve Application
                                </div>
                              )}

                              {application.status !== 'REJECTED' && (application.status === 'PENDING' || application.status === 'VERIFIED') && (
                                <div
                                  className="option-item"
                                  onClick={() => updateApplicationStatus(application._id, 'REJECTED')}
                                  style={{ padding: '8px 16px', cursor: 'pointer', hoverBackgroundColor: '#f5f5f5' }}
                                >
                                  Reject Application
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </td>

                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="no-data">No applications found</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          <div className="table-pagination">
            <div className="pagination-info">
              <span>Rows per page: {rowsPerPage}</span>
              <span>
                {totalRows > 0 ? `${(currentPage - 1) * rowsPerPage + 1}-${Math.min(currentPage * rowsPerPage, totalRows)} of ${totalRows}` : '0-0 of 0'}
              </span>
            </div>
            <div className="pagination-controls">
              <button
                className="prev-page"
                onClick={handlePrevPage}
                disabled={currentPage === 1}
              >
                <ArrowLeft size={16} />
              </button>
              <button
                className="next-page"
                onClick={handleNextPage}
                disabled={currentPage * rowsPerPage >= totalRows}
              >
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
        {/* Verifier Management Section */}
<div className="verifier-management-section">
  <div className="section-header">
    <h3>Verifier Management</h3>
    <button 
      className="add-verifier-btn"
      onClick={() => setShowVerifierForm(prev => !prev)}
    >
      <Plus size={16} />
      <span>{showVerifierForm ? "Cancel" : "Add Verifier"}</span>
    </button>
  </div>

  {verifierError && <div className="error-message">{verifierError}</div>}
  {verifierSuccess && <div className="success-message">{verifierSuccess}</div>}

  {showVerifierForm && (
    <div className="verifier-form">
      <form onSubmit={handleAddVerifier}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={newVerifier.username}
            onChange={handleVerifierInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={newVerifier.email}
            onChange={handleVerifierInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={newVerifier.password}
            onChange={handleVerifierInputChange}
            required
          />
        </div>
        <button 
          type="submit" 
          className="submit-btn"
          disabled={loadingVerifiers}
        >
          {loadingVerifiers ? "Adding..." : "Add Verifier"}
        </button>
      </form>
    </div>
  )}

  <div className="verifiers-list">
    <h4>Current Verifiers</h4>
    {loadingVerifiers && !showVerifierForm ? (
      <div className="loading">Loading verifiers...</div>
    ) : verifiers.length === 0 ? (
      <div className="no-data">No verifiers found</div>
    ) : (
      <table className="verifiers-table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {verifiers.map(verifier => (
            <tr key={verifier._id}>
              <td>{verifier.username}</td>
              <td>{verifier.email}</td>
              <td>{formatDate(verifier.createdAt)}</td>
              <td>
                <button 
                  className="remove-btn"
                  onClick={() => handleRemoveVerifier(verifier._id)}
                  disabled={loadingVerifiers}
                >
                  <Trash2 size={16} />
                  <span>Remove</span>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
</div>

      </main>
    </div>
  );
};

export default AdminDashboard;
