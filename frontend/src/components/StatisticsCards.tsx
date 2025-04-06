import React from "react";
import "../styles/StatisticsCards.css";

const StatisticsCards = () => {
  const statsData = [
    {
      title: "Applications",
      value: "50",
      subtext: "New Applications",
      icon: "description",
      color: "#4caf50"
    },
    {
      title: "Loans",
      value: "120",
      subtext: "Active Loans",
      icon: "account_balance",
      color: "#2196f3"
    },
    {
      title: "Disbursed",
      value: "$65,000",
      subtext: "Total Disbursed",
      icon: "payments",
      color: "#ff9800"
    },
    {
      title: "Collected",
      value: "$40,000",
      subtext: "Cash Received",
      icon: "attach_money",
      color: "#4caf50"
    }
  ];

  return (
    <div className="statistics-cards">
      {statsData.map((stat, index) => (
        <div key={index} className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: stat.color }}>
            <span className="material-icons">{stat.icon}</span>
          </div>
          <div className="stat-content">
            <h3 className="stat-value">{stat.value}</h3>
            <p className="stat-title">{stat.title}</p>
            <p className="stat-subtext">{stat.subtext}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatisticsCards;