import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../contexts/AuthContext';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

function AdminDashboard() {
  const navigate = useNavigate();
  const { user, token, userRole } = useContext(AuthContext);
  
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalBookings, setTotalBookings] = useState(0);
  const [totalMaintenance, setTotalMaintenance] = useState(0);
  const [totalAnnouncements, setTotalAnnouncements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);
  
  const [bookingsByMonth, setBookingsByMonth] = useState([]);
  const [maintenanceByStatus, setMaintenanceByStatus] = useState([]);
  const [bookingsByRoom, setBookingsByRoom] = useState([]);
  const [usersByRole, setUsersByRole] = useState([]);
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (userRole !== 'admin') {
      navigate('/dashboard');
      return;
    }
  }, [user, userRole, navigate]);
  
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      if (!token) return;
      
      setLoading(true);
      
      try {
        const summaryResponse = await fetch('http://localhost:8000/api/analytics/summary', {
          headers: {
            'x-auth-token': token
          }
        });
        
        if (!summaryResponse.ok) {
          throw new Error('Failed to load summary data');
        }
        
        const summaryData = await summaryResponse.json();
        setTotalUsers(summaryData.users);
        setTotalBookings(summaryData.bookings);
        setTotalMaintenance(summaryData.maintenanceRequests);
        setTotalAnnouncements(summaryData.announcements);
        
        const usersResponse = await fetch('http://localhost:8000/api/analytics/users', {
          headers: {
            'x-auth-token': token
          }
        });
        
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          setUsersByRole(usersData);
        }
        
        const monthlyResponse = await fetch('http://localhost:8000/api/analytics/bookings/monthly', {
          headers: {
            'x-auth-token': token
          }
        });
        
        if (monthlyResponse.ok) {
          const monthlyData = await monthlyResponse.json();
          setBookingsByMonth(monthlyData);
        }
        
        const roomsResponse = await fetch('http://localhost:8000/api/analytics/bookings/rooms', {
          headers: {
            'x-auth-token': token
          }
        });
        
        if (roomsResponse.ok) {
          const roomsData = await roomsResponse.json();
          setBookingsByRoom(roomsData);
        }
        
        const maintenanceResponse = await fetch('http://localhost:8000/api/analytics/maintenance/status', {
          headers: {
            'x-auth-token': token
          }
        });
        
        if (maintenanceResponse.ok) {
          const maintenanceData = await maintenanceResponse.json();
          setMaintenanceByStatus(maintenanceData);
        }
      } catch (err) {
        console.error('Error fetching analytics data:', err);
        setError('Failed to load analytics data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalyticsData();
  }, [token]);
  
  function calculatePercentage(value, total) {
    var percentage = (value / total) * 100;
    return percentage.toFixed(1) + '%';
  };
  
  function getStatusColor(status) {
    if (status === 'pending') {
      return 'warning';
    } else if (status === 'in-progress') {
      return 'primary';
    } else if (status === 'completed') {
      return 'success';
    } else if (status === 'cancelled') {
      return 'secondary';
    } else {
      return 'info';
    }
  };
  
  function getRandomChartColor() {
    var r = Math.floor(Math.random() * 200) + 55;
    var g = Math.floor(Math.random() * 200) + 55;
    var b = Math.floor(Math.random() * 200) + 55;
    
    return `rgba(${r}, ${g}, ${b}, 0.8)`;
  };
  
  function renderBarChart(data, valueKey, labelKey, title, subtitle) {
    const maxValue = Math.max(...data.map(item => item[valueKey]));
    
    return (
      <div className="card h-100">
        <div className="card-header bg-light">
          <h5 className="card-title mb-0">{title}</h5>
          {subtitle && <small className="text-muted">{subtitle}</small>}
        </div>
        <div className="card-body">
          {data.map((item, index) => (
            <div key={index} className="mb-3">
              <div className="d-flex justify-content-between mb-1">
                <span>{item[labelKey]}</span>
                <span>{item[valueKey]}</span>
              </div>
              <div className="progress" style={{ height: '25px' }}>
                <div 
                  className="progress-bar" 
                  role="progressbar" 
                  style={{ 
                    width: `${(item[valueKey] / maxValue) * 100}%`,
                    backgroundColor: getRandomChartColor()
                  }}
                  aria-valuenow={item[valueKey]}
                  aria-valuemin="0"
                  aria-valuemax={maxValue}
                >
                  {item[valueKey]}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  function renderDonutChart(data, valueKey, labelKey, title) {
    const total = data.reduce((sum, item) => sum + item[valueKey], 0);
    
    let cumulativePercentage = 0;
    
    const segments = data.map((item, index) => {
      const percentage = (item[valueKey] / total) * 100;
      const startPercentage = cumulativePercentage;
      cumulativePercentage += percentage;
      
      return {
        color: getRandomChartColor(),
        start: startPercentage,
        end: cumulativePercentage,
        item
      };
    });
    
    return (
      <div className="card h-100">
        <div className="card-header bg-light">
          <h5 className="card-title mb-0">{title}</h5>
        </div>
        <div className="card-body">
          <div className="position-relative" style={{ width: '200px', height: '200px', margin: '0 auto' }}>
            <div 
              className="rounded-circle position-relative overflow-hidden" 
              style={{ width: '100%', height: '100%', background: '#f0f0f0' }}
            >
              {segments.map((segment, index) => (
                <div
                  key={index}
                  className="position-absolute"
                  style={{
                    width: '100%',
                    height: '100%',
                    background: segment.color,
                    clipPath: `polygon(50% 50%, 50% 0%, ${segment.end > 25 ? '100% 0%' : `${50 + 50 * Math.tan((segment.end/100) * Math.PI * 2)}% ${50 - 50 * Math.tan((segment.end/100) * Math.PI * 2)}%`}, ${segment.end > 50 ? '100% 100%' : `${50 + 50 * Math.tan((segment.end/100) * Math.PI * 2)}% ${50 + 50 * Math.tan((segment.end/100) * Math.PI * 2)}%`}, ${segment.end > 75 ? '0% 100%' : `${50 - 50 * Math.tan((segment.end/100) * Math.PI * 2)}% ${50 + 50 * Math.tan((segment.end/100) * Math.PI * 2)}%`}, ${segment.end > 99 ? '0% 0%' : `${50 - 50 * Math.tan((segment.end/100) * Math.PI * 2)}% ${50 - 50 * Math.tan((segment.end/100) * Math.PI * 2)}%`})`,
                    opacity: segment.item[valueKey] === 0 ? 0 : 1,
                  }}
                ></div>
              ))}
              <div 
                className="position-absolute top-50 start-50 translate-middle rounded-circle bg-white"
                style={{ width: '60%', height: '60%' }}
              ></div>
            </div>
            <div className="position-absolute top-50 start-50 translate-middle text-center">
              <h3 className="mb-0">{total}</h3>
              <small>Total</small>
            </div>
          </div>
          
          <div className="mt-4">
            {data.map((item, index) => (
              <div key={index} className="d-flex align-items-center mb-2">
                <div 
                  className="me-2" 
                  style={{ 
                    width: '15px', 
                    height: '15px', 
                    backgroundColor: segments[index].color,
                    borderRadius: '3px'
                  }}
                ></div>
                <div className="d-flex justify-content-between w-100">
                  <span className="text-capitalize">{item[labelKey]}</span>
                  <span>{item[valueKey]} ({calculatePercentage(item[valueKey], total)}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };
  
  function formatDate() {
    var today = new Date();
    
    var months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    var day = today.getDate();
    var month = months[today.getMonth()]; 
    var year = today.getFullYear();
    
    var suffix;
    if (day === 1 || day === 21 || day === 31) {
      suffix = 'st';
    } else if (day === 2 || day === 22) {
      suffix = 'nd';
    } else if (day === 3 || day === 23) {
      suffix = 'rd';
    } else {
      suffix = 'th';
    }
    
    return month + ' ' + day + suffix + ', ' + year;
  };
  
  function generatePDFReport() {
    setExportLoading(true);
    
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('Smart Campus Services Portal', 105, 15, { align: 'center' });
    doc.setFontSize(16);
    doc.text('Analytics Report', 105, 25, { align: 'center' });
    
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, 35, { align: 'center' });
    
    doc.setFontSize(14);
    doc.text('System Summary', 14, 45);
    
    const summaryData = [
      ['Total Users', totalUsers],
      ['Total Bookings', totalBookings],
      ['Total Maintenance Requests', totalMaintenance],
      ['Total Announcements', totalAnnouncements]
    ];
    
    doc.autoTable({
      startY: 50,
      head: [['Metric', 'Value']],
      body: summaryData,
    });
    
    doc.setFontSize(14);
    doc.text('User Role Distribution', 14, doc.lastAutoTable.finalY + 15);
    
    const userRoleData = usersByRole.map(item => [
      item.role,
      item.count,
      `${((item.count / totalUsers) * 100).toFixed(1)}%`
    ]);
    
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 20,
      head: [['Role', 'Count', 'Percentage']],
      body: userRoleData,
    });
    
    doc.setFontSize(14);
    doc.text('Booking Trends', 14, doc.lastAutoTable.finalY + 15);
    
    const bookingTrendData = bookingsByMonth.map(item => [
      item.month,
      item.count
    ]);
    
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 20,
      head: [['Month', 'Bookings']],
      body: bookingTrendData,
    });
    
    doc.setFontSize(14);
    doc.text('Room Usage', 14, doc.lastAutoTable.finalY + 15);
    
    const roomUsageData = bookingsByRoom.map(item => [
      item.room,
      item.count
    ]);
    
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 20,
      head: [['Room', 'Bookings']],
      body: roomUsageData,
    });
    
    doc.setFontSize(14);
    doc.text('Maintenance Status', 14, doc.lastAutoTable.finalY + 15);
    
    const maintenanceData = maintenanceByStatus.map(item => [
      item.status,
      item.count
    ]);
    
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 20,
      head: [['Status', 'Count']],
      body: maintenanceData,
    });
    
    doc.save('campus-analytics-report.pdf');
    
    setTimeout(() => {
      setExportLoading(false);
    }, 500);
  };
  
  async function downloadServerReport(reportType) {
    try {
      setExportLoading(true);
      
      const response = await fetch(`http://localhost:8000/api/reports/${reportType}`, {
        headers: {
          'x-auth-token': token
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error downloading ${reportType} report`);
      }
      
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      
      let a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${reportType}-report.pdf`;
      document.body.appendChild(a);
      a.click();
      
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error(`Error downloading report: ${err.message}`);
      setError(`Error downloading report: ${err.message}`);
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <div className="container-fluid mt-4">
      <div className="row mb-4">
        <div className="col-md-6">
          <h2>Admin Analytics Dashboard</h2>
          <p className="text-muted">Overview of campus services and usage statistics as of {formatDate()}</p>
        </div>
        <div className="col-md-6 text-end">
          <div className="btn-group">
            <button 
              className="btn btn-outline-primary dropdown-toggle" 
              type="button" 
              data-bs-toggle="dropdown" 
              aria-expanded="false"
              disabled={loading || exportLoading}
            >
              {exportLoading ? 'Generating...' : 'Export Reports'}
            </button>
            <ul className="dropdown-menu dropdown-menu-end">
              <li><button className="dropdown-item" onClick={() => generatePDFReport()}>Client-side Report</button></li>
              <li><button className="dropdown-item" onClick={() => downloadServerReport('analytics')}>Full Analytics Report</button></li>
              <li><button className="dropdown-item" onClick={() => downloadServerReport('users')}>User List</button></li>
              <li><button className="dropdown-item" onClick={() => downloadServerReport('bookings')}>Room Bookings</button></li>
              <li><button className="dropdown-item" onClick={() => downloadServerReport('maintenance')}>Maintenance Requests</button></li>
            </ul>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="d-flex justify-content-center my-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : (
        <>
          <div className="row mb-4">
            <div className="col-md-3 mb-3">
              <div className="card text-white bg-primary h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="card-title">Total Users</h6>
                      <h2 className="mb-0">{totalUsers}</h2>
                    </div>
                    <i className="fas fa-users fa-2x opacity-50"></i>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-md-3 mb-3">
              <div className="card text-white bg-success h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="card-title">Room Bookings</h6>
                      <h2 className="mb-0">{totalBookings}</h2>
                    </div>
                    <i className="fas fa-calendar-check fa-2x opacity-50"></i>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-md-3 mb-3">
              <div className="card text-white bg-warning h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="card-title">Maintenance Requests</h6>
                      <h2 className="mb-0">{totalMaintenance}</h2>
                    </div>
                    <i className="fas fa-wrench fa-2x opacity-50"></i>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-md-3 mb-3">
              <div className="card text-white bg-danger h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="card-title">Announcements</h6>
                      <h2 className="mb-0">{totalAnnouncements}</h2>
                    </div>
                    <i className="fas fa-bullhorn fa-2x opacity-50"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="row mb-4">
            <div className="col-md-6 mb-4">
              {renderBarChart(
                bookingsByMonth, 
                'count', 
                'month', 
                'Bookings by Month', 
                'Number of room bookings over time'
              )}
            </div>
            
            <div className="col-md-6 mb-4">
              {renderDonutChart(
                usersByRole,
                'count',
                'role',
                'Users by Role'
              )}
            </div>
          </div>
          
          <div className="row mb-4">
            <div className="col-md-6 mb-4">
              {renderBarChart(
                bookingsByRoom,
                'count',
                'room',
                'Room Popularity',
                'Number of bookings per room'
              )}
            </div>
            
            <div className="col-md-6 mb-4">
              <div className="card h-100">
                <div className="card-header bg-light">
                  <h5 className="card-title mb-0">Maintenance Status</h5>
                </div>
                <div className="card-body">
                  {maintenanceByStatus.map((item, index) => (
                    <div key={index} className="mb-3">
                      <div className="d-flex justify-content-between">
                        <span className="text-capitalize">{item.status} ({item.count})</span>
                        <span>{calculatePercentage(item.count, totalMaintenance)}%</span>
                      </div>
                      <div className="progress">
                        <div 
                          className={`progress-bar bg-${getStatusColor(item.status)}`} 
                          role="progressbar" 
                          style={{ width: `${(item.count / totalMaintenance) * 100}%` }}
                          aria-valuenow={item.count}
                          aria-valuemin="0"
                          aria-valuemax={totalMaintenance}
                        >
                          {item.count}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-header bg-light">
                  <h5 className="card-title mb-0">Recent Activity</h5>
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>User</th>
                          <th>Action</th>
                          <th>Details</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loading ? (
                          <tr>
                            <td colSpan="4" className="text-center">Loading activity data...</td>
                          </tr>
                        ) : (
                          <>
                            <tr>
                              <td>John Doe</td>
                              <td>Room Booking</td>
                              <td>Booked Room A101 for Study Group</td>
                              <td>{new Date().toLocaleString()}</td>
                            </tr>
                            <tr>
                              <td>Jane Smith</td>
                              <td>Maintenance Request</td>
                              <td>Reported broken projector in Room B202</td>
                              <td>{new Date(Date.now() - 86400000).toLocaleString()}</td>
                            </tr>
                            <tr>
                              <td>Dr. Wilson</td>
                              <td>Announcement</td>
                              <td>Posted announcement about campus closure</td>
                              <td>{new Date(Date.now() - 172800000).toLocaleString()}</td>
                            </tr>
                          </>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default AdminDashboard;
