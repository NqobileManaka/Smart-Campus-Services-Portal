const db = require('../db/db');

// Simple function to check if the database is available
const connectDB = () => {
  // Initialize collections if they don't exist
  if (!db.has('users').value()) {
    db.set('users', []).write();
    console.log('Created users collection');
  }
  
  if (!db.has('bookings').value()) {
    db.set('bookings', []).write();
    console.log('Created bookings collection');
  }
  
  if (!db.has('schedules').value()) {
    db.set('schedules', []).write();
    console.log('Created schedules collection');
  }
  
  if (!db.has('maintenanceRequests').value()) {
    db.set('maintenanceRequests', []).write();
    console.log('Created maintenanceRequests collection');
  }
  
  if (!db.has('announcements').value()) {
    db.set('announcements', []).write();
    console.log('Created announcements collection');
  }
  
  if (!db.has('notifications').value()) {
    db.set('notifications', []).write();
    console.log('Created notifications collection');
    
    // Initialize notifications with sample data
    // Import here to avoid circular dependencies
    const initNotifications = require('../db/initNotifications');
    initNotifications();
  }

  try {
    // Check if we can read from the database
    const users = db.get('users').value();
    console.log(`Local JSON database connected. Users: ${users.length}`);
    return true;
  } catch (error) {
    console.error(`Error connecting to local database: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
