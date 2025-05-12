import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../contexts/AuthContext';

function NotificationCenter() {
  const [myNotifications, setMyNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const navigate = useNavigate();
  
  const { token, isAuthenticated } = useContext(AuthContext);
  
  useEffect(() => {
    if (!isAuthenticated && !token) {
      navigate('/login');
    }
  }, [isAuthenticated, token, navigate]);
  
  useEffect(() => {
    if (!token) return;
    
    async function fetchNotifications() {
      setIsLoading(true);
      try {
        let endpoint;
        if (showAll) {
          endpoint = '/api/notifications';
        } else {
          endpoint = '/api/notifications/unread';
        }
        
        const response = await fetch(`http://localhost:8000${endpoint}`, {
          headers: {
            'x-auth-token': token
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch notifications');
        }
        
        const data = await response.json();
        setMyNotifications(data);
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setError('Failed to load notifications. Please try again.');
        setIsLoading(false);
      }
    };
    
    fetchNotifications();
  }, [token, showAll]);
  
  function handleFilterToggle() {
    setShowAll(!showAll);
  }
  
  async function markAsRead(notificationId) {
    try {
      const response = await fetch(`http://localhost:8000/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'x-auth-token': token
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }
      
      setMyNotifications(prevNotifications => {
        return prevNotifications.map(notification => {
          if (notification._id === notificationId) {
            return { ...notification, isRead: true };
          } else {
            return notification;
          }
        });
      });
    } catch (err) {
      console.error('Error marking notification as read:', err);
      setError('Failed to update notification. Please try again.');
    }
  }
  
  async function markAllAsRead() {
    try {
      const response = await fetch('http://localhost:8000/api/notifications/read-all', {
        method: 'PUT',
        headers: {
          'x-auth-token': token
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read');
      }
      
      setMyNotifications(prevNotifications => {
        return prevNotifications.map(notification => ({
          ...notification,
          isRead: true
        }));
      });
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      setError('Failed to update notifications. Please try again.');
    }
  }
  
  const deleteNotification = async (notificationId) => {
    if (!token) return;
    
    try {
      const response = await fetch(`http://localhost:8000/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'x-auth-token': token
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete notification');
      }
      
      const updatedNotifications = myNotifications.filter(notification => 
        notification._id !== notificationId);
      
      setMyNotifications(updatedNotifications);
    } catch (err) {
      console.error('Error deleting notification:', err);
      setError('Failed to delete notification. Please try again.');
    }
  };
  
  const unreadCount = myNotifications.filter(notification => !notification.isRead).length;
  
  function getNotificationIcon(type) {
    if (type === 'booking') {
      return 'fa-calendar-check';
    } else if (type === 'announcement') {
      return 'fa-bullhorn';
    } else if (type === 'maintenance') {
      return 'fa-wrench';
    } else if (type === 'schedule') {
      return 'fa-clock';
    } else {
      return 'fa-bell';
    }
  }
  
  function getNotificationClass(isRead) {
    return isRead ? 'bg-light' : 'bg-info bg-opacity-10 fw-bold';
  }
  
  const filteredNotifications = showAll ? myNotifications : 
    myNotifications.filter(notification => !notification.isRead);
  
  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-header bg-light d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Notifications</h5>
          <div>
            <button 
              className="btn btn-sm btn-outline-secondary me-2" 
              onClick={handleFilterToggle}
            >
              {showAll ? 'Show Unread Only' : 'Show All Notifications'}
            </button>
            
            {myNotifications.some(n => !n.isRead) && (
              <button 
                className="btn btn-sm btn-outline-primary" 
                onClick={markAllAsRead}
              >
                Mark All as Read
              </button>
            )}
          </div>
        </div>
        
        <div className="card-body">
          {isLoading ? (
            <div className="text-center py-3">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : error ? (
            <div className="alert alert-danger">{error}</div>
          ) : myNotifications.length === 0 ? (
            <p className="text-center text-muted py-3">
              {showAll 
                ? 'You have no notifications.' 
                : 'You have no unread notifications.'}
            </p>
          ) : (
            <ul className="list-group list-group-flush">
              {myNotifications.map(notification => (
                <li 
                  key={notification._id} 
                  className={`list-group-item ${!notification.isRead ? 'bg-light' : ''}`}
                >
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <p className="mb-1">{notification.message}</p>
                      <small className="text-muted">
                        {new Date(notification.createdAt).toLocaleString()}
                      </small>
                    </div>
                    
                    <div>
                      {!notification.isRead && (
                        <button 
                          className="btn btn-sm btn-light" 
                          onClick={() => markAsRead(notification._id)}
                        >
                          Mark Read
                        </button>
                      )}
                      <button 
                        className="btn btn-sm btn-link text-danger ms-2" 
                        onClick={() => deleteNotification(notification._id)}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default NotificationCenter;
