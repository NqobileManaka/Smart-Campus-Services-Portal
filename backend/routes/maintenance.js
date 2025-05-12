const express = require('express');
const router = express.Router();
const db = require('../db/db');
const dbUtils = require('../db/utils');
const { auth, isAdmin } = require('../middleware/auth');

// @route   GET /api/maintenance
// @desc    Get all maintenance requests
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    let requests = db.get('maintenanceRequests').value();
    
    // If user is a student, only show their requests
    if (req.user.role === 'student') {
      requests = requests.filter(request => request.requestedBy === req.user.id);
    }
    
    // Sort requests by priority (high to low) and then by creation date (newest first)
    const priorityOrder = { 'urgent': 3, 'high': 2, 'medium': 1, 'low': 0 };
    
    requests.sort((a, b) => {
      // First sort by priority
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      // Then by creation date (newest first)
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    
    res.json(requests);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/maintenance
// @desc    Create a maintenance request
// @access  Private
router.post('/', auth, async (req, res) => {
  const { title, description, location, priority } = req.body;

  try {
    const newRequest = dbUtils.createItem('maintenanceRequests', {
      title,
      description,
      location,
      requestedBy: req.user.id,
      priority: priority || 'medium',
      status: 'pending'
    });

    res.json(newRequest);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/maintenance/:id
// @desc    Update maintenance request status
// @access  Private (Admin only)
router.put('/:id', [auth, isAdmin], async (req, res) => {
  const { status, assignedTo } = req.body;

  try {
    const request = dbUtils.getItemById('maintenanceRequests', req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Maintenance request not found' });
    }

    const updates = {};
    
    // Update status if provided
    if (status) {
      updates.status = status;
    }
    
    // Update assignedTo if provided
    if (assignedTo) {
      updates.assignedTo = assignedTo;
    }
    
    // If status is completed, set completedAt date
    if (status === 'completed' && request.status !== 'completed') {
      updates.completedAt = new Date().toISOString();
    }

    const updatedRequest = dbUtils.updateItem('maintenanceRequests', req.params.id, updates);
    res.json(updatedRequest);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/maintenance/:id
// @desc    Delete a maintenance request
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const request = dbUtils.getItemById('maintenanceRequests', req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Maintenance request not found' });
    }

    // Check user authorization (only admin can delete any request, others can only delete their own)
    if (request.requestedBy !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to delete this request' });
    }

    dbUtils.deleteItem('maintenanceRequests', req.params.id);
    res.json({ message: 'Maintenance request removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
