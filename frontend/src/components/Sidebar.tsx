import React from "react";
import "../styles/Sidebar.css";
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();
  
  const menuItems = [
    { name: "Dashboard", icon: "dashboard", active: true },
    { name: "Applications", icon: "description" },
    { name: "Loans", icon: "account_balance" },
    { name: "Customers", icon: "group" },
    { name: "Reports", icon: "bar_chart" },
    { name: "Collection", icon: "payments" },
    { name: "Settings", icon: "settings" },
    { name: "Notifications", icon: "notifications" },
  ];

  const handleLogout = () => {
    // Clear authentication token from localStorage
    localStorage.removeItem("token");
    
    // Clear any other user-related data from localStorage if present
    localStorage.removeItem("user");
    
    // Redirect to login page
    navigate("/login");
    
    // Optional: You can also add a notification here
    console.log("User logged out successfully");
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h1>CREDIT SEA</h1>
        <div className="sidebar-toggle">
          <span className="material-icons">menu</span>
        </div>
      </div>

      <div className="sidebar-menu">
        {menuItems.map((item, index) => (
          <div key={index} className={`menu-item ${item.active ? "active" : ""}`}>
            <span className="material-icons">{item.icon}</span>
            <span className="menu-text">{item.name}</span>
            {item.active && <div className="active-indicator"></div>}
          </div>
        ))}
      </div>

      <div className="sidebar-footer">
        <div className="menu-item">
          <span className="material-icons">help</span>
          <span className="menu-text">Help</span>
        </div>
        <div className="menu-item" onClick={handleLogout} style={{ cursor: 'pointer' }}>
          <span className="material-icons">logout</span>
          <span className="menu-text">Log Out</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
