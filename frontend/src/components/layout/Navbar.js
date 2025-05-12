import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../../contexts/AuthContext';

function Navbar() {
  const { isAuthenticated, logout, userRole, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const guestLinks = (
    <>
      <li className="nav-item">
        <Link className="nav-link" to="/login">Login</Link>
      </li>
      <li className="nav-item">
        <Link className="nav-link" to="/register">Register</Link>
      </li>
    </>
  );

  const authLinks = (
    <>
      <li className="nav-item">
        <Link className="nav-link" to="/dashboard">Dashboard</Link>
      </li>
      <li className="nav-item">
        <Link className="nav-link" to="/bookings">Room Bookings</Link>
      </li>
      <li className="nav-item">
        <Link className="nav-link" to="/schedules">Class Schedules</Link>
      </li>
      <li className="nav-item">
        <Link className="nav-link" to="/maintenance">Maintenance</Link>
      </li>
      <li className="nav-item">
        <Link className="nav-link" to="/announcements">Announcements</Link>
      </li>
      <li className="nav-item">
        <Link className="nav-link" to="/notifications">
          Notifications
          <span className="position-relative">
            <i className="fas fa-bell ms-1"></i>
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{fontSize: '0.5rem'}}>
              5
            </span>
          </span>
        </Link>
      </li>
      {userRole === 'admin' && (
        <li className="nav-item">
          <Link className="nav-link" to="/admin/analytics">
            <i className="fas fa-chart-line me-1"></i>
            Analytics
          </Link>
        </li>
      )}
      <li className="nav-item dropdown">
        <button className="nav-link dropdown-toggle btn btn-link text-white" id="navbarDropdown" data-bs-toggle="dropdown" aria-expanded="false">
          {user && user.name}
        </button>
        <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
          <li><span className="dropdown-item-text text-muted">{userRole && userRole.charAt(0).toUpperCase() + userRole.slice(1)}</span></li>
          <li><hr className="dropdown-divider" /></li>
          <li><button className="dropdown-item" onClick={handleLogout}>Logout</button></li>
        </ul>
      </li>
    </>
  );

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container">
        <Link className="navbar-brand" to="/">
          Smart Campus Portal
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
          <ul className="navbar-nav">
            {isAuthenticated ? authLinks : guestLinks}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
