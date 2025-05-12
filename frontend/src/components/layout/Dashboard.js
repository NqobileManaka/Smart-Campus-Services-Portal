import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../../contexts/AuthContext';
import axios from 'axios';

function Dashboard() {
  const { user, userRole } = useContext(AuthContext);
  const [stats, setStats] = useState({
    bookings: 0,
    schedules: 0,
    maintenance: 0,
    announcements: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const bookingsRes = await axios.get('http://localhost:8000/api/bookings');
        const schedulesRes = await axios.get('http://localhost:8000/api/schedules');
        const maintenanceRes = await axios.get('http://localhost:8000/api/maintenance');
        const announcementsRes = await axios.get('http://localhost:8000/api/announcements');
        
        setStats({
          bookings: bookingsRes.data.length,
          schedules: schedulesRes.data.length,
          maintenance: maintenanceRes.data.length,
          announcements: announcementsRes.data.length
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        setStats({
          bookings: 3,
          schedules: 5,
          maintenance: 2,
          announcements: 4
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const services = [
    {
      title: 'Room Bookings',
      description: 'Book rooms for meetings, events, or study sessions',
      icon: 'fa-door-open',
      link: '/bookings',
      count: stats.bookings,
      color: 'primary'
    },
    {
      title: 'Class Schedules',
      description: 'View and manage class timetables',
      icon: 'fa-calendar-alt',
      link: '/schedules',
      count: stats.schedules,
      color: 'success'
    },
    {
      title: 'Maintenance Requests',
      description: 'Submit and track maintenance issues',
      icon: 'fa-wrench',
      link: '/maintenance',
      count: stats.maintenance,
      color: 'warning'
    },
    {
      title: 'Announcements',
      description: 'Stay updated with campus announcements',
      icon: 'fa-bullhorn',
      link: '/announcements',
      count: stats.announcements,
      color: 'danger'
    }
  ];

  return (
    <div className="container mt-4">
      <div className="row mb-4">
        <div className="col">
          <h2>Welcome, {user?.name}!</h2>
          <p className="text-muted">Role: {userRole && userRole.charAt(0).toUpperCase() + userRole.slice(1)}</p>
        </div>
      </div>

      <div className="row">
        {services.map((service, index) => (
          <div key={index} className="col-md-6 col-lg-3 mb-4">
            <div className={`card border-${service.color} h-100`}>
              <div className={`card-header bg-${service.color} text-white`}>
                <h5 className="card-title mb-0">
                  <i className={`fas ${service.icon} me-2`}></i>
                  {service.title}
                </h5>
              </div>
              <div className="card-body">
                <p className="card-text">{service.description}</p>
                {loading ? (
                  <div className="d-flex justify-content-center">
                    <div className="spinner-border spinner-border-sm" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : (
                  <p className="badge bg-secondary">{service.count} Items</p>
                )}
              </div>
              <div className="card-footer bg-light">
                <Link to={service.link} className="btn btn-sm btn-outline-secondary w-100">
                  View <i className="fas fa-arrow-right"></i>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {userRole === 'admin' && (
        <div className="row mt-4">
          <div className="col-12">
            <div className="card">
              <div className="card-header bg-dark text-white">
                <h5 className="mb-0">Admin Actions</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-4">
                    <div className="d-grid">
                      <Link to="/bookings" className="btn btn-outline-primary mb-2">
                        <i className="fas fa-check-circle me-2"></i> Approve Bookings
                      </Link>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="d-grid">
                      <Link to="/maintenance" className="btn btn-outline-warning mb-2">
                        <i className="fas fa-tools me-2"></i> Manage Maintenance
                      </Link>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="d-grid">
                      <Link to="/announcements" className="btn btn-outline-danger mb-2">
                        <i className="fas fa-plus-circle me-2"></i> Post Announcement
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
