import React from "react";
import "../styles/Header.css";

const Header = () => {
  return (
    <header className="dashboard-header">
      <div className="search-container">
        <span className="material-icons search-icon">search</span>
        <input type="text" placeholder="Search" className="search-input" />
      </div>
      
      <div className="header-actions">
        <div className="header-icon">
          <span className="material-icons">notifications</span>
          <span className="badge">3</span>
        </div>
        <div className="header-icon">
          <span className="material-icons">chat</span>
          <span className="badge">5</span>
        </div>
        <div className="user-profile">
          <div className="user-avatar">
            <img src="/api/placeholder/32/32" alt="User" />
          </div>
          <span className="user-name">Admin</span>
          <span className="material-icons">keyboard_arrow_down</span>
        </div>
      </div>
    </header>
  );
};

export default Header;