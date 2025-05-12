const db = require('./db');
const { v4: uuidv4 } = require('uuid');

// Function to initialize notifications collection
function initNotifications() {
  console.log('Initializing notifications collection...');
  
  // Check if notifications collection already exists
  if (!db.has('notifications').value()) {
    // Create the collection if it doesn't exist
    db.set('notifications', []).write();
    console.log('Created notifications collection');
  } else {
    console.log('Notifications collection already exists');
  }
  
  // Get all users to create sample notifications for
  const users = db.get('users').value();
  
  // Sample notification types and templates
  const notificationTypes = [
    {
      type: 'booking',
      templates: [
        'Your booking for room {room} has been approved',
        'Your booking for room {room} has been rejected',
        'Reminder: You have a booking for room {room} tomorrow'
      ]
    },
    {
      type: 'maintenance',
      templates: [
        'Your maintenance request for {issue} has been received',
        'Maintenance request status updated to: {status}',
        'Your maintenance request has been completed'
      ]
    },
    {
      type: 'announcement',
      templates: [
        'New announcement: {title}',
        'Important: {title}',
        'Announcement expiring soon: {title}'
      ]
    },
    {
      type: 'schedule',
      templates: [
        'Your class schedule has been updated',
        'New class added to your schedule: {class}',
        'Reminder: {class} starts in 30 minutes'
      ]
    }
  ];
  
  // Sample data to fill in templates
  const sampleData = {
    room: ['A101', 'B202', 'C303', 'D404', 'E505'],
    issue: ['broken projector', 'AC not working', 'leaking roof', 'flickering lights', 'broken chair'],
    status: ['received', 'in progress', 'scheduled', 'completed'],
    title: ['Campus Closure', 'Holiday Schedule', 'Tuition Due Date', 'New COVID Guidelines', 'Career Fair'],
    class: ['Introduction to Programming', 'Advanced Calculus', 'History 101', 'Chemistry Lab', 'Physics II']
  };
  
  // Get random item from array
  const getRandomItem = (array) => array[Math.floor(Math.random() * array.length)];
  
  // Create sample notifications
  const notifications = [];
  
  // For each user, create 3-7 notifications
  users.forEach(user => {
    const notificationCount = Math.floor(Math.random() * 5) + 3; // 3-7 notifications per user
    
    for (let i = 0; i < notificationCount; i++) {
      // Pick a random notification type
      const notificationType = getRandomItem(notificationTypes);
      const template = getRandomItem(notificationType.templates);
      
      // Replace placeholders with random data
      let message = template;
      Object.keys(sampleData).forEach(key => {
        const placeholder = `{${key}}`;
        if (message.includes(placeholder)) {
          message = message.replace(placeholder, getRandomItem(sampleData[key]));
        }
      });
      
      // Create random timestamp within last 30 days
      const daysAgo = Math.floor(Math.random() * 30);
      const hoursAgo = Math.floor(Math.random() * 24);
      const timestamp = new Date();
      timestamp.setDate(timestamp.getDate() - daysAgo);
      timestamp.setHours(timestamp.getHours() - hoursAgo);
      
      // 70% chance notification is unread
      const isRead = Math.random() > 0.7;
      
      // Create the notification
      const notification = {
        _id: uuidv4(),
        recipientId: user._id,
        type: notificationType.type,
        message: message,
        referenceId: uuidv4(), // Fake reference ID
        data: {}, // Empty data object
        isRead: isRead,
        createdAt: timestamp.toISOString(),
        readAt: isRead ? new Date().toISOString() : null
      };
      
      notifications.push(notification);
    }
  });
  
  // Insert notifications into database
  const existingNotifications = db.get('notifications').value();
  if (existingNotifications.length === 0) {
    db.set('notifications', notifications).write();
    console.log(`Added ${notifications.length} sample notifications`);
  } else {
    console.log(`Skipped adding sample notifications (${existingNotifications.length} already exist)`);
  }
}

// Initialize notifications when this script is required directly
if (require.main === module) {
  initNotifications();
}

module.exports = initNotifications;
