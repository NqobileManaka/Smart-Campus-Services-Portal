import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function BookingForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    roomId: '',
    purpose: '',
    date: '',
    startTime: '',
    endTime: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const availableRooms = [
    { id: 'A101', name: 'Classroom A101' },
    { id: 'A102', name: 'Classroom A102' },
    { id: 'B201', name: 'Lab B201' },
    { id: 'B202', name: 'Lab B202' },
    { id: 'C301', name: 'Conference Room C301' },
    { id: 'C302', name: 'Conference Room C302' },
    { id: 'D401', name: 'Auditorium D401' }
  ];

  const { roomId, purpose, date, startTime, endTime } = formData;

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async e => {
    e.preventDefault();
    
    if (!roomId || !purpose || !date || !startTime || !endTime) {
      setError('Please fill in all fields');
      return;
    }
    
    if (startTime >= endTime) {
      setError('End time must be after start time');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await axios.post('http://localhost:8000/api/bookings', formData);
      navigate('/bookings');
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-md-8 mx-auto">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">New Room Booking</h4>
            </div>
            <div className="card-body">
              {error && <div className="alert alert-danger">{error}</div>}
              <form onSubmit={onSubmit}>
                <div className="mb-3">
                  <label htmlFor="roomId" className="form-label">Room</label>
                  <select
                    className="form-select"
                    id="roomId"
                    name="roomId"
                    value={roomId}
                    onChange={onChange}
                    required
                  >
                    <option value="">Select a room</option>
                    {availableRooms.map(room => (
                      <option key={room.id} value={room.id}>{room.name}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label htmlFor="purpose" className="form-label">Purpose</label>
                  <input
                    type="text"
                    className="form-control"
                    id="purpose"
                    name="purpose"
                    value={purpose}
                    onChange={onChange}
                    placeholder="Study session, club meeting, etc."
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="date" className="form-label">Date</label>
                  <input
                    type="date"
                    className="form-control"
                    id="date"
                    name="date"
                    value={date}
                    onChange={onChange}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="startTime" className="form-label">Start Time</label>
                    <input
                      type="time"
                      className="form-control"
                      id="startTime"
                      name="startTime"
                      value={startTime}
                      onChange={onChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="endTime" className="form-label">End Time</label>
                    <input
                      type="time"
                      className="form-control"
                      id="endTime"
                      name="endTime"
                      value={endTime}
                      onChange={onChange}
                      required
                    />
                  </div>
                </div>

                <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                  <button
                    type="button"
                    className="btn btn-secondary me-md-2"
                    onClick={() => navigate('/bookings')}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Submitting...
                      </>
                    ) : 'Submit Booking'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookingForm;
