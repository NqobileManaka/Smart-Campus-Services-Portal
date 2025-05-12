const express = require('express');
const router = express.Router();
const db = require('../db/db');
const dbUtils = require('../db/utils');
const { auth, isAdmin, isFaculty } = require('../middleware/auth');

// @route   GET /api/bookings
// @desc    Get all bookings
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    let bookings = db.get('bookings').value();
    
    // If user is a student, only show their bookings
    if (req.user.role === 'student') {
      bookings = bookings.filter(booking => booking.userId === req.user.id);
    } 
    
    // Sort by date
    bookings.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    res.json(bookings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/bookings
// @desc    Create a booking
// @access  Private
router.post('/', auth, async (req, res) => {
  const { roomId, purpose, date, startTime, endTime } = req.body;

  try {
    // Check if room is already booked for this time
    const existingBooking = db.get('bookings')
      .find(booking => {
        return booking.roomId === roomId &&
               booking.date === date &&
               booking.status === 'approved' &&
               ((startTime <= booking.endTime && endTime >= booking.startTime));
      })
      .value();

    if (existingBooking) {
      return res.status(400).json({ message: 'Room is already booked for this time slot' });
    }

    const newBooking = dbUtils.createItem('bookings', {
      roomId,
      userId: req.user.id,
      purpose,
      date,
      startTime,
      endTime,
      status: req.user.role === 'admin' ? 'approved' : 'pending' // Auto-approve for admins
    });

    res.json(newBooking);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/bookings/:id
// @desc    Update booking status
// @access  Private (Admin/Faculty only)
router.put('/:id', [auth, isFaculty], async (req, res) => {
  const { status } = req.body;

  try {
    const booking = dbUtils.getItemById('bookings', req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Update status
    const updatedBooking = dbUtils.updateItem('bookings', req.params.id, { status });
    res.json(updatedBooking);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/bookings/:id
// @desc    Delete a booking
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const booking = dbUtils.getItemById('bookings', req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check user authorization (only admin can delete any booking, others can only delete their own)
    if (booking.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to delete this booking' });
    }

    dbUtils.deleteItem('bookings', req.params.id);
    res.json({ message: 'Booking removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
