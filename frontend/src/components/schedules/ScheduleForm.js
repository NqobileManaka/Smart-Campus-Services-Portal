import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../../contexts/AuthContext';

function ScheduleForm() {
  const navigate = useNavigate();
  const { userRole } = useContext(AuthContext);

  // Redirect if not faculty or admin
  if (userRole !== 'faculty' && userRole !== 'admin') {
    navigate('/dashboard');
  }

  const [formData, setFormData] = useState({
    courseCode: '',
    courseName: '',
    dayOfWeek: '',
    startTime: '',
    endTime: '',
    room: '',
    semester: 'Spring 2025'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Available rooms (in a real app, this would come from an API)
  const availableRooms = [
    { id: 'A101', name: 'Classroom A101' },
    { id: 'A102', name: 'Classroom A102' },
    { id: 'B201', name: 'Lab B201' },
    { id: 'B202', name: 'Lab B202' },
    { id: 'C301', name: 'Conference Room C301' },
    { id: 'C302', name: 'Conference Room C302' },
    { id: 'D401', name: 'Auditorium D401' }
  ];

  // Days of the week
  const daysOfWeek = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'
  ];

  // Semesters
  const semesters = [
    'Spring 2025', 'Fall 2025'
  ];

  const { courseCode, courseName, dayOfWeek, startTime, endTime, room, semester } = formData;

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async e => {
    e.preventDefault();
    
    // Basic validation
    if (!courseCode || !courseName || !dayOfWeek || !startTime || !endTime || !room || !semester) {
      setError('Please fill in all fields');
      return;
    }
    
    // Check that end time is after start time
    if (startTime >= endTime) {
      setError('End time must be after start time');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await axios.post('http://localhost:8000/api/schedules', formData);
      navigate('/schedules');
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating schedule');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-md-8 mx-auto">
          <div className="card">
            <div className="card-header bg-success text-white">
              <h4 className="mb-0">Add Class Schedule</h4>
            </div>
            <div className="card-body">
              {error && <div className="alert alert-danger">{error}</div>}
              <form onSubmit={onSubmit}>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="courseCode" className="form-label">Course Code</label>
                    <input
                      type="text"
                      className="form-control"
                      id="courseCode"
                      name="courseCode"
                      value={courseCode}
                      onChange={onChange}
                      placeholder="e.g., CS101"
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="courseName" className="form-label">Course Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="courseName"
                      name="courseName"
                      value={courseName}
                      onChange={onChange}
                      placeholder="e.g., Introduction to Computer Science"
                      required
                    />
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="semester" className="form-label">Semester</label>
                    <select
                      className="form-select"
                      id="semester"
                      name="semester"
                      value={semester}
                      onChange={onChange}
                      required
                    >
                      {semesters.map(sem => (
                        <option key={sem} value={sem}>{sem}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="dayOfWeek" className="form-label">Day of Week</label>
                    <select
                      className="form-select"
                      id="dayOfWeek"
                      name="dayOfWeek"
                      value={dayOfWeek}
                      onChange={onChange}
                      required
                    >
                      <option value="">Select a day</option>
                      {daysOfWeek.map(day => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="room" className="form-label">Room</label>
                    <select
                      className="form-select"
                      id="room"
                      name="room"
                      value={room}
                      onChange={onChange}
                      required
                    >
                      <option value="">Select a room</option>
                      {availableRooms.map(room => (
                        <option key={room.id} value={room.id}>{room.name}</option>
                      ))}
                    </select>
                  </div>
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
                    onClick={() => navigate('/schedules')}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-success"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Submitting...
                      </>
                    ) : 'Add Schedule'}
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

export default ScheduleForm;
