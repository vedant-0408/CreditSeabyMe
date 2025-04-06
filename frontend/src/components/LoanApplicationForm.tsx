import React, { useState } from "react";
import "../styles/LoanApplicationForm.css";

const LoanApplicationForm = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    loanAmount: "",
    loanTenure: "",
    employmentStatus: "",
    employmentAddress: "",
    reasonForLoan: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Loan Application Submitted:", formData);
  };

  return (
    <div className="loan-application-page">
      {/* Header */}
      <header className="loan-application-header">
        <h1>CREDIT SEA</h1>
        <nav>
          <a href="#">Home</a>
          <a href="#">Payments</a>
          <a href="#">Budget</a>
          <a href="#">Card</a>
        </nav>
        <div className="header-actions">
          <i className="icon-notifications"></i>
          <i className="icon-chat"></i>
          <span>User</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="loan-application-content">
        <div className="form-container">
          <h2>APPLY FOR A LOAN</h2>
          <form onSubmit={handleSubmit}>
            {/* Full Name */}
            <div className="form-group">
              <label htmlFor="fullName">Full name as it appears on bank account</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                placeholder="Full name as it appears on bank account"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>

            {/* Loan Amount */}
            <div className="form-group">
              <label htmlFor="loanAmount">How much do you need?</label>
              <input
                type="number"
                id="loanAmount"
                name="loanAmount"
                placeholder="How much do you need?"
                value={formData.loanAmount}
                onChange={handleChange}
                required
              />
            </div>

            {/* Loan Tenure */}
            <div className="form-group">
              <label htmlFor="loanTenure">Loan tenure (in months)</label>
              <input
                type="number"
                id="loanTenure"
                name="loanTenure"
                placeholder="Loan tenure (in months)"
                value={formData.loanTenure}
                onChange={handleChange}
                required
              />
            </div>

            {/* Employment Status */}
            <div className="form-group">
              <label htmlFor="employmentStatus">Employment status</label>
              <input
                type="text"
                id="employmentStatus"
                name="employmentStatus"
                placeholder="Employment status"
                value={formData.employmentStatus}
                onChange={handleChange}
                required
              />
            </div>

            {/* Reason for Loan */}
            <div className="form-group">
              <label htmlFor="reasonForLoan">Reason for loan</label>
              <textarea
                id="reasonForLoan"
                name="reasonForLoan"
                placeholder="Reason for loan"
                value={formData.reasonForLoan}
                onChange={handleChange}
                rows={5}
              />
            </div>

            {/* Employment Address */}
            <div className="form-group employment-address">
              <label htmlFor="employmentAddress">Employment address</label>
              <input
                type="text"
                id="employmentAddress"
                name="employmentAddress"
                placeholder="Employment address"
                value={formData.employmentAddress}
                onChange={handleChange}
              />
              <div style={{ marginTop: "10px" }}></div>
              <label htmlFor="employmentAddress2">Employment address</label>
              <input
                type="text"
                id="employmentAddress2"
                name="employmentAddress2"
                placeholder="Employment address"
              />
            </div>

            {/* Chart */}
            <div className="chart-container">
              <div className="chart-title">Chart</div>
              {/* Chart would go here in a real implementation */}
            </div>

            {/* Disclaimer */}
            <div className="disclaimer">
              I have read the important information and accept that by completing this application I will be bound by the terms.
            </div>

            {/* Credit Info */}
            <div className="credit-info">
              Any personal and credit information collected may be disclosed from time to time to other lenders, credit bureaus or other credit reporting agencies.
            </div>

            {/* Submit Button */}
            <div className="submit-button-container">
              <button type="submit" className="submit-button">
                Submit
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default LoanApplicationForm;