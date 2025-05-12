import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../../contexts/AuthContext';

function BookingList() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userRole } = useContext(AuthContext);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await axios.get('http://localhost:8000/api/bookings');
        setBookings(res.data);
      } catch (err) {
        console.error('Error fetching bookings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.put(`http://localhost:8000/api/bookings/${id}`, { status: newStatus });
      setBookings(bookings.map(booking => 
        booking._id === id ? { ...booking, status: newStatus } : booking
      ));
    } catch (err) {
      console.error('Error updating booking status:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      try {
        await axios.delete(`http://localhost:8000/api/bookings/${id}`);
        setBookings(bookings.filter(booking => booking._id !== id));
      } catch (err) {
        console.error('Error deleting booking:', err);
      }
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'approved': return 'bg-success';
      case 'rejected': return 'bg-danger';
      default: return 'bg-warning';
    }
  };

  const mockBookings = [
    {
      _id: '1',
      roomId: 'A101',
      purpose: 'Study Group',
      date: new Date(),
      startTime: '10:00',
      endTime: '12:00',
      status: 'pending',
      createdAt: new Date()
    },
    {
      _id: '2',
      roomId: 'B202',
      purpose: 'Club Meeting',
      date: new Date(),
      startTime: '14:00',
      endTime: '16:00',
      status: 'approved',
      createdAt: new Date(Date.now() - 86400000)
    },
    {
      _id: '3',
      roomId: 'C303',
      purpose: 'Workshop',
      date: new Date(Date.now() + 86400000),
      startTime: '09:00',
      endTime: '11:00',
      status: 'rejected',
      createdAt: new Date(Date.now() - 172800000)
    }
  ];

  const displayBookings = bookings.length > 0 ? bookings : mockBookings;

  return (
    <div className="container mt-4">
      <div className="row mb-4">
        <div className="col-md-8">
          <h2>Room Bookings</h2>
        </div>
        <div className="col-md-4 text-end">
          <Link to="/bookings/new" className="btn btn-primary">
            <i className="fas fa-plus-circle"></i> New Booking
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
          {displayBookings.length === 0 ? (
            <div className="alert alert-info">
              No bookings found. Click "New Booking" to create one.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Room</th>
                    <th>Purpose</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayBookings.map(booking => (
                    <tr key={booking._id}>
                      <td>{booking.roomId}</td>
                      <td>{booking.purpose}</td>
                      <td>{new Date(booking.date).toLocaleDateString()}</td>
                      <td>{booking.startTime} - {booking.endTime}</td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(booking.status)}`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </td>
                      <td>
                        {(userRole === 'admin' || userRole === 'faculty') && booking.status === 'pending' && (
                          <>
                            <button
                              className="btn btn-sm btn-success me-1"
                              onClick={() => handleStatusChange(booking._id, 'approved')}
                            >
                              <i className="fas fa-check"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-danger me-1"
                              onClick={() => handleStatusChange(booking._id, 'rejected')}
                            >
                              <i className="fas fa-times"></i>
                            </button>
                          </>
                        )}
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(booking._id)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default BookingList;
