const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const path = require('path');

// Create database directory if it doesn't exist
const fs = require('fs');
const dbDir = path.join(__dirname);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Set up the database with absolute path
const dbPath = path.resolve(__dirname, 'db.json');
console.log(`Database file path: ${dbPath}`);

try {
  // Test file write access
  fs.accessSync(dbDir, fs.constants.W_OK);
  console.log(`Write permission confirmed for directory: ${dbDir}`);
} catch (err) {
  console.error(`❌ ERROR: No write permission for directory: ${dbDir}`);
  console.error(err);
}

const adapter = new FileSync(dbPath);
const db = low(adapter);

// Set default data structure
db.defaults({
  users: [],
  bookings: [],
  schedules: [],
  maintenanceRequests: [],
  announcements: [],
  notifications: []
}).write();

// Add synchronous write helper method
db.writeSync = function() {
  try {
    this.write();
    return true;
  } catch (err) {
    console.error('Error writing to database:', err);
    return false;
  }
};

module.exports = db;
