import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../../contexts/AuthContext';

function MaintenanceList() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userRole } = useContext(AuthContext);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await axios.get('http://localhost:8000/api/maintenance');
        setRequests(res.data);
      } catch (err) {
        console.error('Error fetching maintenance requests:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      await axios.put(`http://localhost:8000/api/maintenance/${id}`, { status });
      
      // Update the local state to reflect the change
      setRequests(requests.map(request => 
        request._id === id ? { ...request, status } : request
      ));
    } catch (err) {
      console.error('Error updating request status:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this maintenance request?')) {
      try {
        await axios.delete(`http://localhost:8000/api/maintenance/${id}`);
        setRequests(requests.filter(request => request._id !== id));
      } catch (err) {
        console.error('Error deleting maintenance request:', err);
      }
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'completed': return 'bg-success';
      case 'in-progress': return 'bg-primary';
      case 'cancelled': return 'bg-secondary';
      default: return 'bg-warning';
    }
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-danger';
      case 'high': return 'bg-warning';
      case 'low': return 'bg-info';
      default: return 'bg-secondary';
    }
  };

  // For demonstration purposes, let's create some mock data if no requests exist
  const mockRequests = [
    {
      _id: '1',
      title: 'Broken Projector',
      description: 'The projector in room A101 is not working properly.',
      location: 'Room A101',
      priority: 'high',
      status: 'pending',
      createdAt: new Date()
    },
    {
      _id: '2',
      title: 'Air Conditioning Issue',
      description: 'The AC in the library is too cold.',
      location: 'Main Library',
      priority: 'medium',
      status: 'in-progress',
      createdAt: new Date(Date.now() - 86400000)
    },
    {
      _id: '3',
      title: 'Water Leak',
      description: 'There is a water leak in the men\'s bathroom on the 2nd floor.',
      location: 'Men\'s Bathroom, 2nd Floor',
      priority: 'urgent',
      status: 'completed',
      createdAt: new Date(Date.now() - 172800000),
      completedAt: new Date(Date.now() - 86400000)
    }
  ];

  const displayRequests = requests.length > 0 ? requests : mockRequests;

  return (
    <div className="container mt-4">
      <div className="row mb-4">
        <div className="col-md-8">
          <h2>Maintenance Requests</h2>
        </div>
        <div className="col-md-4 text-end">
          <Link to="/maintenance/new" className="btn btn-primary">
            <i className="fas fa-plus-circle"></i> New Request
          </Link>
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
          {displayRequests.length === 0 ? (
            <div className="alert alert-info">
              No maintenance requests found. Click "New Request" to create one.
            </div>
          ) : (
            <div className="row">
              {displayRequests.map(request => (
                <div key={request._id} className="col-md-6 col-lg-4 mb-4">
                  <div className="card h-100">
                    <div className="card-header d-flex justify-content-between align-items-center">
                      <span className={`badge ${getPriorityBadgeClass(request.priority)}`}>
                        {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)} Priority
                      </span>
                      <span className={`badge ${getStatusBadgeClass(request.status)}`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </div>
                    <div className="card-body">
                      <h5 className="card-title">{request.title}</h5>
                      <h6 className="card-subtitle mb-2 text-muted">{request.location}</h6>
                      <p className="card-text">{request.description}</p>
                      <p className="card-text">
                        <small className="text-muted">
                          Submitted: {new Date(request.createdAt).toLocaleDateString()}
                        </small>
                      </p>
                      {request.completedAt && (
                        <p className="card-text">
                          <small className="text-muted">
                            Completed: {new Date(request.completedAt).toLocaleDateString()}
                          </small>
                        </p>
                      )}
                    </div>
                    <div className="card-footer bg-transparent">
                      {userRole === 'admin' && request.status !== 'completed' && request.status !== 'cancelled' && (
                        <div className="btn-group me-2" role="group">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleStatusChange(request._id, 'in-progress')}
                          >
                            Mark In Progress
                          </button>
                          <button
                            className="btn btn-sm btn-outline-success"
                            onClick={() => handleStatusChange(request._id, 'completed')}
                          >
                            Mark Completed
                          </button>
                        </div>
                      )}
                      <button
                        className="btn btn-sm btn-danger float-end"
                        onClick={() => handleDelete(request._id)}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
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

export default MaintenanceList;
