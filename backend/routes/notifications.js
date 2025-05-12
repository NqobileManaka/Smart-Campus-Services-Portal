const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { 
  getAllItems, 
  getItemById, 
  createItem, 
  updateItem, 
  deleteItem, 
  getItemsByFilter 
} = require('../db/utils');

// Collection name for database operations
const COLLECTION = 'notifications';

/**
 * @route   GET /api/notifications
 * @desc    Get all notifications for the current user
 * @access  Private
 */
router.get('/', auth, async (req, res) => {
  try {
    // Get user ID from the auth middleware
    const userId = req.user.id;
    
    // Query notifications for this user
    // Using the getItemsByFilter to filter by recipient
    const notifications = getItemsByFilter(COLLECTION, item => item.recipientId === userId);
    
    // Sort by date, newest first (simple beginner implementation)
    notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    return res.json(notifications);
  } catch (err) {
    console.error('Error getting notifications:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/notifications/unread
 * @desc    Get only unread notifications for current user
 * @access  Private
 */
router.get('/unread', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get unread notifications for this user
    const unreadNotifications = getItemsByFilter(
      COLLECTION, 
      item => item.recipientId === userId && !item.isRead
    );
    
    // Sort by date, newest first
    unreadNotifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    return res.json(unreadNotifications);
  } catch (err) {
    console.error('Error getting unread notifications:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/notifications/count
 * @desc    Get count of unread notifications
 * @access  Private
 */
router.get('/count', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Count unread notifications
    const unreadNotifications = getItemsByFilter(
      COLLECTION, 
      item => item.recipientId === userId && !item.isRead
    );
    
    return res.json({ count: unreadNotifications.length });
  } catch (err) {
    console.error('Error counting notifications:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   PUT /api/notifications/:id/read
 * @desc    Mark a notification as read
 * @access  Private
 */
router.put('/:id/read', auth, async (req, res) => {
  try {
    const notificationId = req.params.id;
    const userId = req.user.id;
    
    // Get the notification
    const notification = getItemById(COLLECTION, notificationId);
    
    // Check if notification exists
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    // Check if notification belongs to this user
    if (notification.recipientId !== userId) {
      return res.status(403).json({ message: 'Not authorized to access this notification' });
    }
    
    // Update the notification
    const updatedNotification = updateItem(COLLECTION, notificationId, {
      ...notification,
      isRead: true,
      readAt: new Date().toISOString()
    });
    
    return res.json(updatedNotification);
  } catch (err) {
    console.error('Error marking notification as read:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   PUT /api/notifications/read-all
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.put('/read-all', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get all unread notifications for this user
    const unreadNotifications = getItemsByQuery(
      COLLECTION, 
      item => item.recipientId === userId && !item.isRead
    );
    
    // Update each notification
    const now = new Date().toISOString();
    const updatedNotifications = unreadNotifications.map(notification => {
      return updateItem(COLLECTION, notification._id, {
        ...notification,
        isRead: true,
        readAt: now
      });
    });
    
    return res.json({ message: `Marked ${updatedNotifications.length} notifications as read` });
  } catch (err) {
    console.error('Error marking all notifications as read:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Delete a notification
 * @access  Private
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const notificationId = req.params.id;
    const userId = req.user.id;
    
    // Get the notification
    const notification = getItemById(COLLECTION, notificationId);
    
    // Check if notification exists
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    // Check if notification belongs to this user
    if (notification.recipientId !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this notification' });
    }
    
    // Delete the notification
    deleteItem(COLLECTION, notificationId);
    
    return res.json({ message: 'Notification deleted' });
  } catch (err) {
    console.error('Error deleting notification:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/notifications
 * @desc    Create a new notification (internal use only, not exposed to API)
 * @access  Private - For internal use by other routes
 */
// This function should be exported and imported by other routes
// We're not exposing this directly to the API
const createNotification = (recipientId, type, message, referenceId = null, data = {}) => {
  try {
    const newNotification = createItem(COLLECTION, {
      recipientId,
      type,
      message,
      referenceId,
      data,
      isRead: false,
      createdAt: new Date().toISOString(),
      readAt: null
    });
    
    return newNotification;
  } catch (err) {
    console.error('Error creating notification:', err);
    return null;
  }
};

// Export the router and createNotification function
module.exports = { router, createNotification };
