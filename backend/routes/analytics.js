const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { getAllItems, getItemsByFilter } = require('../db/utils');

const adminAuth = (req, res, next) => {
  auth(req, res, () => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    next();
  });
};

router.get('/summary', adminAuth, async (req, res) => {
  try {
    const users = getAllItems('users');
    const bookings = getAllItems('bookings');
    const schedules = getAllItems('schedules');
    const maintenanceRequests = getAllItems('maintenanceRequests');
    const announcements = getAllItems('announcements');
    
    res.json({
      users: users.length,
      bookings: bookings.length,
      maintenanceRequests: maintenanceRequests.length,
      announcements: announcements.length,
      schedules: schedules.length
    });
  } catch (err) {
    console.error('Error getting analytics summary:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = getAllItems('users');
    
    const usersByRole = [];
    const roleCounts = {};
    
    users.forEach(user => {
      if (!roleCounts[user.role]) {
        roleCounts[user.role] = 0;
      }
      roleCounts[user.role]++;
    });
    
    for (const role in roleCounts) {
      usersByRole.push({
        role,
        count: roleCounts[role]
      });
    }
    
    res.json(usersByRole);
  } catch (err) {
    console.error('Error getting user analytics:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/bookings/monthly', adminAuth, async (req, res) => {
  try {
    const bookings = getAllItems('bookings');
    
    const monthlyCounts = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    months.forEach(month => {
      monthlyCounts[month] = 0;
    });
    
    bookings.forEach(booking => {
      const date = new Date(booking.createdAt);
      const month = months[date.getMonth()];
      monthlyCounts[month]++;
    });
    
    const bookingsByMonth = [];
    for (const month in monthlyCounts) {
      bookingsByMonth.push({
        month,
        count: monthlyCounts[month]
      });
    }
    
    bookingsByMonth.sort((a, b) => {
      return months.indexOf(a.month) - months.indexOf(b.month);
    });
    
    res.json(bookingsByMonth);
  } catch (err) {
    console.error('Error getting booking trends:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/bookings/rooms', adminAuth, async (req, res) => {
  try {
    const bookings = getAllItems('bookings');
    
    const roomCounts = {};
    
    bookings.forEach(booking => {
      const { roomNumber } = booking;
      if (!roomCounts[roomNumber]) {
        roomCounts[roomNumber] = 0;
      }
      roomCounts[roomNumber]++;
    });
    
    const bookingsByRoom = [];
    for (const room in roomCounts) {
      bookingsByRoom.push({
        room,
        count: roomCounts[room]
      });
    }
    
    bookingsByRoom.sort((a, b) => b.count - a.count);
    
    res.json(bookingsByRoom);
  } catch (err) {
    console.error('Error getting room bookings:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/maintenance/status', adminAuth, async (req, res) => {
  try {
    const maintenanceRequests = getAllItems('maintenanceRequests');
    
    const statusCounts = {};
    
    const allStatuses = ['pending', 'in-progress', 'completed', 'cancelled'];
    allStatuses.forEach(status => {
      statusCounts[status] = 0;
    });
    
    maintenanceRequests.forEach(request => {
      if (statusCounts[request.status] !== undefined) {
        statusCounts[request.status]++;
      } else {
        statusCounts[request.status] = 1;
      }
    });
    
    const maintenanceByStatus = [];
    for (const status in statusCounts) {
      maintenanceByStatus.push({
        status,
        count: statusCounts[status]
      });
    }
    
    res.json(maintenanceByStatus);
  } catch (err) {
    console.error('Error getting maintenance status counts:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/activity', adminAuth, async (req, res) => {
  try {
    const bookings = getAllItems('bookings').map(item => ({
      ...item,
      type: 'booking',
      action: 'Room Booking',
      user: item.userId,
      date: item.createdAt,
      details: `Booked Room ${item.roomNumber} for ${item.purpose}`
    }));
    
    const maintenanceRequests = getAllItems('maintenanceRequests').map(item => ({
      ...item,
      type: 'maintenance',
      action: 'Maintenance Request',
      user: item.userId,
      date: item.createdAt,
      details: `Reported issue: ${item.description} (${item.location})`
    }));
    
    const announcements = getAllItems('announcements').map(item => ({
      ...item,
      type: 'announcement',
      action: 'Announcement',
      user: item.createdBy,
      date: item.createdAt,
      details: `Posted announcement: ${item.title}`
    }));
    
    let allActivity = [
      ...bookings, 
      ...maintenanceRequests, 
      ...announcements
    ];
    
    allActivity.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    allActivity = allActivity.slice(0, 20);
    
    const users = getAllItems('users');
    const usersMap = {};
    
    users.forEach(user => {
      usersMap[user._id] = user.name;
    });
    
    allActivity = allActivity.map(activity => ({
      ...activity,
      userName: usersMap[activity.user] || 'Unknown User'
    }));
    
    res.json(allActivity);
  } catch (err) {
    console.error('Error getting activity log:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
