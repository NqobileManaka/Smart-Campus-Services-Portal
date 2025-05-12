import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../../contexts/AuthContext';

function ScheduleList() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userRole } = useContext(AuthContext);
  const [currentSemester, setCurrentSemester] = useState('Spring 2025');

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const res = await axios.get('http://localhost:8000/api/schedules');
        setSchedules(res.data);
      } catch (err) {
        console.error('Error fetching schedules:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this schedule?')) {
      try {
        await axios.delete(`http://localhost:8000/api/schedules/${id}`);
        setSchedules(schedules.filter(schedule => schedule._id !== id));
      } catch (err) {
        console.error('Error deleting schedule:', err);
      }
    }
  };

  // For demonstration purposes, let's create some mock data if no schedules exist
  const mockSchedules = [
    {
      _id: '1',
      courseCode: 'CS101',
      courseName: 'Introduction to Computer Science',
      dayOfWeek: 'Monday',
      startTime: '09:00',
      endTime: '10:30',
      room: 'A101',
      semester: 'Spring 2025'
    },
    {
      _id: '2',
      courseCode: 'MATH201',
      courseName: 'Calculus II',
      dayOfWeek: 'Tuesday',
      startTime: '11:00',
      endTime: '12:30',
      room: 'B202',
      semester: 'Spring 2025'
    },
    {
      _id: '3',
      courseCode: 'ENG105',
      courseName: 'English Composition',
      dayOfWeek: 'Wednesday',
      startTime: '14:00',
      endTime: '15:30',
      room: 'C303',
      semester: 'Spring 2025'
    }
  ];

  const displaySchedules = schedules.length > 0 ? schedules : mockSchedules;
  
  // Get unique days of the week to display in schedule
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  // Define time slots for the schedule
  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', 
    '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  // Filter schedules by semester
  const filteredSchedules = displaySchedules.filter(schedule => 
    schedule.semester === currentSemester
  );

  // Find schedule for a specific day and time
  const findSchedule = (day, timeSlot) => {
    return filteredSchedules.find(schedule => {
      const startHour = parseInt(schedule.startTime.split(':')[0]);
      const endHour = parseInt(schedule.endTime.split(':')[0]);
      const slotHour = parseInt(timeSlot.split(':')[0]);
      
      return schedule.dayOfWeek === day && 
             slotHour >= startHour && 
             slotHour < endHour;
    });
  };

  return (
    <div className="container mt-4">
      <div className="row mb-4">
        <div className="col-md-6">
          <h2>Class Schedules</h2>
          <p className="text-muted">Current Semester: {currentSemester}</p>
        </div>
        <div className="col-md-6 text-end">
          {(userRole === 'admin' || userRole === 'faculty') && (
            <Link to="/schedules/new" className="btn btn-primary">
              <i className="fas fa-plus-circle"></i> Add Class
            </Link>
          )}
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
          <div className="card mb-4">
            <div className="card-header bg-light">
              <ul className="nav nav-tabs card-header-tabs">
                <li className="nav-item">
                  <button 
                    className="nav-link active" 
                    onClick={() => setCurrentSemester('Spring 2025')}
                  >
                    Spring 2025
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className="nav-link" 
                    onClick={() => setCurrentSemester('Fall 2025')}
                  >
                    Fall 2025
                  </button>
                </li>
              </ul>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-bordered">
                  <thead>
                    <tr className="bg-light">
                      <th style={{ width: '10%' }}>Time</th>
                      {days.map(day => (
                        <th key={day} style={{ width: '18%' }}>{day}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {timeSlots.map(timeSlot => (
                      <tr key={timeSlot}>
                        <td className="bg-light">
                          <strong>{timeSlot}</strong>
                        </td>
                        {days.map(day => {
                          const schedule = findSchedule(day, timeSlot);
                          return (
                            <td key={`${day}-${timeSlot}`} className={schedule ? 'bg-info bg-opacity-25' : ''}>
                              {schedule && (
                                <div className="small">
                                  <div><strong>{schedule.courseCode}</strong></div>
                                  <div>{schedule.courseName}</div>
                                  <div>Room: {schedule.room}</div>
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* List of all classes */}
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">All Classes</h5>
            </div>
            <div className="card-body">
              {filteredSchedules.length === 0 ? (
                <div className="alert alert-info">
                  No classes found for this semester.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>Course Code</th>
                        <th>Course Name</th>
                        <th>Day</th>
                        <th>Time</th>
                        <th>Room</th>
                        {(userRole === 'admin' || userRole === 'faculty') && (
                          <th>Actions</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSchedules.map(schedule => (
                        <tr key={schedule._id}>
                          <td>{schedule.courseCode}</td>
                          <td>{schedule.courseName}</td>
                          <td>{schedule.dayOfWeek}</td>
                          <td>{schedule.startTime} - {schedule.endTime}</td>
                          <td>{schedule.room}</td>
                          {(userRole === 'admin' || userRole === 'faculty') && (
                            <td>
                              <Link to={`/schedules/edit/${schedule._id}`} className="btn btn-sm btn-secondary me-1">
                                <i className="fas fa-edit"></i>
                              </Link>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => handleDelete(schedule._id)}
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ScheduleList;
