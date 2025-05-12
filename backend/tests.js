// My first backend tests for Smart Campus Services Portal!
// Not using proper test framework, just a simple script with console.logs

const db = require('./db/db');
const { getAllItems, getItemById, createItem, updateItem, deleteItem } = require('./db/utils');
const jwt = require('jsonwebtoken');

console.log('Starting tests... 🧪');

// Global success/fail counters
let passed = 0;
let failed = 0;

// Simple test wrapper to count passes/fails
function test(name, callback) {
  console.log(`\nRunning test: ${name}`);
  try {
    callback();
    console.log('✅ PASSED');
    passed++;
  } catch (error) {
    console.log(`❌ FAILED: ${error.message}`);
    failed++;
  }
}

// Simple assertion functions (rookie implementation)
function assertEquals(actual, expected) {
  if (actual !== expected) {
    throw new Error(`Expected ${expected} but got ${actual}`);
  }
}

function assertTrue(value) {
  if (!value) {
    throw new Error(`Expected true but got ${value}`);
  }
}

function assertNotNull(value) {
  if (value === null || value === undefined) {
    throw new Error('Expected non-null value');
  }
}

// Database Tests
console.log('\n=== DATABASE TESTS ===');

test('Database should be initialized with users collection', () => {
  const users = db.get('users').value();
  assertNotNull(users);
  // Not checking anything about the users, just that the array exists
});

test('Database should have required collections', () => {
  // Naively test each collection instead of using a loop
  assertNotNull(db.get('users').value());
  assertNotNull(db.get('bookings').value());
  assertNotNull(db.get('schedules').value());
  assertNotNull(db.get('maintenanceRequests').value());
  assertNotNull(db.get('announcements').value());
  assertNotNull(db.get('notifications').value());
  // Missing some assertions about the structure of each collection
});

// Database Utils Tests
console.log('\n=== DATABASE UTILS TESTS ===');

// Testing with a temporary item - not cleaning up afterward (rookie mistake)
test('createItem should add a new item', () => {
  const testItem = { name: 'Test Item', test: true };
  const newItem = createItem('announcements', testItem);
  
  assertNotNull(newItem._id);
  assertEquals(newItem.name, 'Test Item');
  
  // Not cleaning up the test data!
});

test('getAllItems should return array', () => {
  const items = getAllItems('users');
  assertTrue(Array.isArray(items));
  // Not testing the actual contents
});

// Using a hardcoded ID that might not exist (rookie mistake)
test('getItemById should return an item', () => {
  // This will fail if the ID doesn't exist!
  const userId = '1'; // Assuming this ID exists
  const user = getItemById('users', userId);
  
  // This could fail if user doesn't exist
  assertNotNull(user);
});

// Auth Middleware Tests
console.log('\n=== AUTH MIDDLEWARE TESTS ===');

test('JWT should work properly', () => {
  // Bad test setup: hardcoded secret that might not match actual secret
  const payload = { id: '123', role: 'admin' };
  const secret = 'campus_portal_secret_key_123';
  
  const token = jwt.sign(payload, secret, { expiresIn: '1d' });
  const decoded = jwt.verify(token, secret);
  
  assertEquals(decoded.id, '123');
  assertEquals(decoded.role, 'admin');
  // Not testing the actual middleware, just the JWT library
});

// API Route Tests - Directly testing functions instead of actual HTTP endpoints
console.log('\n=== API ROUTE TESTS (MANUAL MOCK) ===');

test('Auth login route should validate credentials', () => {
  // Mock objects (not using actual request/response objects)
  const req = {
    body: {
      email: 'admin@example.com',
      password: 'admin123'
    }
  };
  
  const res = {
    status: function(code) {
      this.statusCode = code;
      return this;
    },
    json: function(data) {
      this.data = data;
      return this;
    }
  };
  
  // Manual function instead of testing the actual route handler
  function loginHandler(req, res) {
    // Hardcoded check - not testing the real route
    if (req.body.email === 'admin@example.com' && req.body.password === 'admin123') {
      return res.status(200).json({
        token: 'fake_token_123',
        user: { id: '1', name: 'Admin', role: 'admin' }
      });
    }
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  
  loginHandler(req, res);
  assertEquals(res.statusCode, 200);
  assertNotNull(res.data.token);
  // Not testing invalid credentials case
});

// Notification Route Tests
console.log('\n=== NOTIFICATION ROUTE TESTS ===');

test('Notifications endpoints should work', () => {
  // Incorrect test - creating an actual item in the database for a test
  const notificationData = {
    recipientId: '1',
    message: 'Test notification',
    type: 'test',
    isRead: false
  };
  
  const notification = createItem('notifications', notificationData);
  assertNotNull(notification._id);
  
  // No cleanup of test data (rookie mistake)
  // Not testing the actual API endpoint, just the database functions
});

// Booking Route Tests
console.log('\n=== BOOKING ROUTE TESTS ===');

test('Booking validation should work', () => {
  // Simple validation function 
  function validateBooking(booking) {
    return booking.roomNumber && 
           booking.userId && 
           booking.date && 
           booking.startTime &&
           booking.endTime;
  }
  
  // Test data
  const validBooking = {
    roomNumber: '101',
    userId: '1',
    date: '2023-05-01',
    startTime: '10:00',
    endTime: '11:00',
    purpose: 'Meeting'
  };
  
  const invalidBooking = {
    roomNumber: '101',
    // Missing userId
    date: '2023-05-01',
    startTime: '10:00',
    endTime: '11:00'
  };
  
  assertTrue(validateBooking(validBooking));
  assertTrue(!validateBooking(invalidBooking));
  // Not testing the actual booking route or logic, just a simplified validation
});

// Permission Check Tests
console.log('\n=== PERMISSION TESTS ===');

test('Admin should have all permissions', () => {
  // Naive permission check
  function hasPermission(user, action) {
    if (user.role === 'admin') return true;
    
    // Simple mapping of roles to permissions
    const permissions = {
      'student': ['book_room', 'view_schedule', 'create_maintenance_request'],
      'staff': ['book_room', 'view_schedule', 'create_maintenance_request', 'view_all_bookings'],
      'maintenance': ['view_maintenance_requests', 'update_maintenance_request']
    };
    
    return permissions[user.role]?.includes(action) || false;
  }
  
  // Test data
  const adminUser = { id: '1', role: 'admin' };
  const studentUser = { id: '2', role: 'student' };
  
  // Admin permissions
  assertTrue(hasPermission(adminUser, 'book_room'));
  assertTrue(hasPermission(adminUser, 'view_all_bookings'));
  assertTrue(hasPermission(adminUser, 'delete_user'));
  
  // Student permissions
  assertTrue(hasPermission(studentUser, 'book_room'));
  assertTrue(!hasPermission(studentUser, 'view_all_bookings'));
  // Not testing edge cases or actual middleware
});

// Print test summary
console.log(`\n===== TEST SUMMARY =====`);
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`Total: ${passed + failed}`);

if (failed > 0) {
  console.log('\n⚠️ Some tests failed! Please fix the issues.');
} else {
  console.log('\n🎉 All tests passed!');
}

// Run tests with: node tests.js
