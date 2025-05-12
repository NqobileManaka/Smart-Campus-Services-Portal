import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../../contexts/AuthContext';

function AnnouncementList() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userRole } = useContext(AuthContext);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await axios.get('http://localhost:8000/api/announcements');
        setAnnouncements(res.data);
      } catch (err) {
        console.error('Error fetching announcements:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      try {
        await axios.delete(`http://localhost:8000/api/announcements/${id}`);
        setAnnouncements(announcements.filter(announcement => announcement._id !== id));
      } catch (err) {
        console.error('Error deleting announcement:', err);
      }
    }
  };

  // For demonstration purposes, let's create some mock data if no announcements exist
  const mockAnnouncements = [
    {
      _id: '1',
      title: 'Campus Closed for Maintenance',
      content: 'The campus will be closed on Sunday, May 5th for scheduled maintenance work.',
      category: 'general',
      isImportant: true,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 86400000 * 10)
    },
    {
      _id: '2',
      title: 'Final Exams Schedule Released',
      content: 'The schedule for final exams has been released. Please check your student portal for details.',
      category: 'academic',
      isImportant: false,
      createdAt: new Date(Date.now() - 86400000 * 2),
      expiresAt: new Date(Date.now() + 86400000 * 14)
    },
    {
      _id: '3',
      title: 'Campus Sports Day',
      content: 'Join us for our annual campus sports day event on Saturday, May 10th.',
      category: 'events',
      isImportant: false,
      createdAt: new Date(Date.now() - 86400000 * 5),
      expiresAt: new Date(Date.now() + 86400000 * 7)
    },
    {
      _id: '4',
      title: 'Library Hours Extended',
      content: 'The library will be open 24 hours during finals week.',
      category: 'academic',
      isImportant: true,
      createdAt: new Date(Date.now() - 86400000),
      expiresAt: new Date(Date.now() + 86400000 * 21)
    }
  ];

  const displayAnnouncements = announcements.length > 0 ? announcements : mockAnnouncements;

  // Filter by category
  const filteredAnnouncements = activeCategory === 'all' 
    ? displayAnnouncements 
    : displayAnnouncements.filter(announcement => announcement.category === activeCategory);

  // Sort by importance and date
  const sortedAnnouncements = [...filteredAnnouncements].sort((a, b) => {
    if (a.isImportant !== b.isImportant) {
      return a.isImportant ? -1 : 1;
    }
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  // Categories
  const categories = [
    { id: 'all', name: 'All', icon: 'fa-list' },
    { id: 'general', name: 'General', icon: 'fa-info-circle' },
    { id: 'academic', name: 'Academic', icon: 'fa-graduation-cap' },
    { id: 'events', name: 'Events', icon: 'fa-calendar-alt' },
    { id: 'emergency', name: 'Emergency', icon: 'fa-exclamation-triangle' }
  ];

  // Get category icon
  const getCategoryIcon = (category) => {
    const cat = categories.find(c => c.id === category);
    return cat ? cat.icon : 'fa-info-circle';
  };

  return (
    <div className="container mt-4">
      <div className="row mb-4">
        <div className="col-md-8">
          <h2>Announcements</h2>
        </div>
        <div className="col-md-4 text-end">
          {(userRole === 'admin' || userRole === 'faculty') && (
            <Link to="/announcements/new" className="btn btn-primary">
              <i className="fas fa-plus-circle"></i> New Announcement
            </Link>
          )}
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header bg-white">
              <ul className="nav nav-pills">
                {categories.map(category => (
                  <li className="nav-item" key={category.id}>
                    <button
                      className={`nav-link ${activeCategory === category.id ? 'active' : ''}`}
                      onClick={() => setActiveCategory(category.id)}
                    >
                      <i className={`fas ${category.icon} me-2`}></i>
                      {category.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="d-flex justify-content-center mt-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          {sortedAnnouncements.length === 0 ? (
            <div className="alert alert-info">
              No announcements found in this category.
            </div>
          ) : (
            <div className="row">
              {sortedAnnouncements.map(announcement => (
                <div key={announcement._id} className="col-md-6 mb-4">
                  <div className={`card h-100 ${announcement.isImportant ? 'border-danger' : ''}`}>
                    <div className={`card-header ${announcement.isImportant ? 'bg-danger text-white' : 'bg-light'}`}>
                      <div className="d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">
                          {announcement.isImportant && (
                            <i className="fas fa-exclamation-circle me-2"></i>
                          )}
                          {announcement.title}
                        </h5>
                        <span className="badge bg-secondary">
                          <i className={`fas ${getCategoryIcon(announcement.category)} me-1`}></i>
                          {announcement.category.charAt(0).toUpperCase() + announcement.category.slice(1)}
                        </span>
                      </div>
                    </div>
                    <div className="card-body">
                      <p className="card-text">{announcement.content}</p>
                    </div>
                    <div className="card-footer bg-transparent d-flex justify-content-between align-items-center">
                      <small className="text-muted">
                        Posted: {new Date(announcement.createdAt).toLocaleDateString()}
                      </small>
                      {(userRole === 'admin' || userRole === 'faculty') && (
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(announcement._id)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default AnnouncementList;
