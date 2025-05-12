const express = require('express');
const router = express.Router();
const db = require('../db/db');
const dbUtils = require('../db/utils');
const { auth, isFaculty } = require('../middleware/auth');

// @route   GET /api/announcements
// @desc    Get all announcements
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    // Get announcements for user's role
    const userRole = req.user.role;
    
    const allAnnouncements = db.get('announcements').value();
    
    // Filter announcements for user's role
    const filteredAnnouncements = allAnnouncements.filter(announcement => {
      return announcement.targetAudience.includes('all') || 
             announcement.targetAudience.includes(userRole);
    });
    
    // Filter out expired announcements
    const now = new Date();
    const validAnnouncements = filteredAnnouncements.filter(announcement => {
      if (!announcement.expiresAt) return true;
      return new Date(announcement.expiresAt) > now;
    });
    
    // Sort by importance and creation date
    validAnnouncements.sort((a, b) => {
      if (a.isImportant !== b.isImportant) {
        return b.isImportant ? 1 : -1;
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    
    res.json(validAnnouncements);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/announcements
// @desc    Create an announcement
// @access  Private (Faculty/Admin only)
router.post('/', [auth, isFaculty], async (req, res) => {
  const { title, content, category, targetAudience, isImportant, expiresAt } = req.body;

  try {
    const newAnnouncement = dbUtils.createItem('announcements', {
      title,
      content,
      postedBy: req.user.id,
      category: category || 'general',
      targetAudience: targetAudience || ['all'],
      isImportant: isImportant || false,
      expiresAt: expiresAt || null
    });

    res.json(newAnnouncement);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/announcements/:id
// @desc    Update an announcement
// @access  Private (Faculty/Admin only)
router.put('/:id', [auth, isFaculty], async (req, res) => {
  const { title, content, category, targetAudience, isImportant, expiresAt } = req.body;

  try {
    const announcement = dbUtils.getItemById('announcements', req.params.id);

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    // Only creator or admin can update
    if (announcement.postedBy !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to update this announcement' });
    }

    // Prepare updates object
    const updates = {};
    if (title) updates.title = title;
    if (content) updates.content = content;
    if (category) updates.category = category;
    if (targetAudience) updates.targetAudience = targetAudience;
    if (isImportant !== undefined) updates.isImportant = isImportant;
    if (expiresAt) updates.expiresAt = expiresAt;

    const updatedAnnouncement = dbUtils.updateItem('announcements', req.params.id, updates);
    res.json(updatedAnnouncement);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/announcements/:id
// @desc    Delete an announcement
// @access  Private (Faculty/Admin only)
router.delete('/:id', [auth, isFaculty], async (req, res) => {
  try {
    const announcement = dbUtils.getItemById('announcements', req.params.id);

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    // Only creator or admin can delete
    if (announcement.postedBy !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to delete this announcement' });
    }

    dbUtils.deleteItem('announcements', req.params.id);
    res.json({ message: 'Announcement removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
