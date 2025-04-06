// import React from "react";
import "../styles/AppliedLoansTable.css";

const AppliedLoansTable = () => {
  const loans = [
    {
      id: 1,
      customerName: "James Cook",
      avatar: "/api/placeholder/32/32",
      loanType: "Personal Loan",
      amount: "$500",
      status: "Approved",
      date: "Jun 30, 2025",
      statusColor: "#ffc107"
    },
    {
      id: 2,
      customerName: "Sarah Roberts",
      avatar: "/api/placeholder/32/32",
      loanType: "Auto Loan",
      amount: "$5,000",
      status: "Pending",
      date: "Jun 30, 2025",
      statusColor: "#ff9800"
    },
    {
      id: 3,
      customerName: "Michael Lee",
      avatar: "/api/placeholder/32/32",
      loanType: "Business Loan",
      amount: "$15,000",
      status: "Declined",
      date: "Jun 29, 2025",
      statusColor: "#f44336"
    },
    {
      id: 4,
      customerName: "Jessica Williams",
      avatar: "/api/placeholder/32/32",
      loanType: "Home Loan",
      amount: "$200,000",
      status: "Approved",
      date: "Jun 29, 2025",
      statusColor: "#4caf50"
    },
    {
      id: 5,
      customerName: "David Miller",
      avatar: "/api/placeholder/32/32",
      loanType: "Personal Loan",
      amount: "$1,000",
      status: "Approved",
      date: "Jun 28, 2025",
      statusColor: "#4caf50"
    }
  ];

  return (
    <div className="applied-loans-section">
      <h2 className="section-title">Applied Loans</h2>
      <div className="loans-table-container">
        <table className="loans-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Loan Type</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loans.map((loan) => (
              <tr key={loan.id}>
                <td className="customer-cell">
                  <div className="customer-info">
                    <div className="customer-avatar">
                      <img src={loan.avatar} alt={loan.customerName} />
                    </div>
                    <span className="customer-name">{loan.customerName}</span>
                  </div>
                </td>
                <td>{loan.loanType}</td>
                <td>{loan.amount}</td>
                <td>{loan.date}</td>
                <td>
                  <span 
                    className="status-badge" 
                    style={{ backgroundColor: loan.statusColor }}
                  >
                    {loan.status}
                  </span>
                </td>
                <td>
                  <button className="action-button">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="table-footer">
        <div className="showing-entries">
          Showing 1 to 5 of 25 entries
        </div>
        <div className="pagination">
          <button className="page-button active">1</button>
          <button className="page-button">2</button>
          <button className="page-button">3</button>
          <button className="page-button">
            <span className="material-icons">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppliedLoansTable;