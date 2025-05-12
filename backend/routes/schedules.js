const express = require('express');
const router = express.Router();
const db = require('../db/db');
const dbUtils = require('../db/utils');
const { auth, isFaculty } = require('../middleware/auth');

// @route   GET /api/schedules
// @desc    Get all schedules
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const schedules = db.get('schedules').value();
    
    // Sort by day of week and start time
    const sortedSchedules = [...schedules].sort((a, b) => {
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      const dayA = days.indexOf(a.dayOfWeek);
      const dayB = days.indexOf(b.dayOfWeek);
      
      if (dayA !== dayB) return dayA - dayB;
      return a.startTime.localeCompare(b.startTime);
    });
    
    res.json(sortedSchedules);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/schedules
// @desc    Create a schedule
// @access  Private (Faculty/Admin only)
router.post('/', [auth, isFaculty], async (req, res) => {
  const { courseCode, courseName, dayOfWeek, startTime, endTime, room, semester } = req.body;

  try {
    // Check if room is already scheduled for this time
    const existingSchedule = db.get('schedules')
      .find(schedule => {
        return schedule.room === room &&
               schedule.dayOfWeek === dayOfWeek &&
               schedule.semester === semester &&
               ((startTime <= schedule.endTime && endTime >= schedule.startTime));
      })
      .value();

    if (existingSchedule) {
      return res.status(400).json({ 
        message: 'Room is already scheduled for this time slot' 
      });
    }

    const newSchedule = dbUtils.createItem('schedules', {
      courseCode,
      courseName,
      instructor: req.user.id,
      dayOfWeek,
      startTime,
      endTime,
      room,
      semester
    });

    res.json(newSchedule);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/schedules/:id
// @desc    Update a schedule
// @access  Private (Faculty/Admin only)
router.put('/:id', [auth, isFaculty], async (req, res) => {
  const { courseCode, courseName, dayOfWeek, startTime, endTime, room, semester } = req.body;

  try {
    const schedule = dbUtils.getItemById('schedules', req.params.id);

    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    // Only instructor or admin can update
    if (schedule.instructor !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to update this schedule' });
    }

    // Check for conflicts with other schedules
    if (dayOfWeek !== schedule.dayOfWeek || startTime !== schedule.startTime || 
        endTime !== schedule.endTime || room !== schedule.room) {
      const existingSchedule = db.get('schedules')
        .find(s => {
          return s._id !== req.params.id &&
                 s.room === room &&
                 s.dayOfWeek === dayOfWeek &&
                 s.semester === semester &&
                 ((startTime <= s.endTime && endTime >= s.startTime));
        })
        .value();

      if (existingSchedule) {
        return res.status(400).json({ 
          message: 'Room is already scheduled for this time slot' 
        });
      }
    }

    // Update schedule
    const updatedSchedule = dbUtils.updateItem('schedules', req.params.id, {
      courseCode,
      courseName,
      dayOfWeek,
      startTime,
      endTime,
      room,
      semester
    });
    
    res.json(updatedSchedule);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/schedules/:id
// @desc    Delete a schedule
// @access  Private (Faculty/Admin only)
router.delete('/:id', [auth, isFaculty], async (req, res) => {
  try {
    const schedule = dbUtils.getItemById('schedules', req.params.id);

    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    // Only instructor or admin can delete
    if (schedule.instructor !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to delete this schedule' });
    }

    dbUtils.deleteItem('schedules', req.params.id);
    res.json({ message: 'Schedule removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
