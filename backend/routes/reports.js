// My PDF Report Generator
// Created by: Me
// Date: April 2025

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const { auth } = require('../middleware/auth');
const { getAllItems } = require('../db/utils');

// Middleware to check if user is admin
const adminAuth = (req, res, next) => {
  // First run the regular auth middleware
  auth(req, res, () => {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    next();
  });
};

/**
 * @route   GET /api/reports/users
 * @desc    Generate a PDF report of all users
 * @access  Private - Admin Only
 */
router.get('/users', adminAuth, async (req, res) => {
  try {
    // Get all users from the database
    const users = getAllItems('users');
    
    // Create a new PDF document - 'portrait' is the default orientation
    const doc = new PDFDocument();
    
    // Create a name for the file with timestamp to make it unique
    // I added the timestamp so files don't overwrite each other
    const filename = `user_report_${Date.now()}.pdf`;
    const filePath = path.join(__dirname, '../temp', filename);
    
    // Need to check if temp folder exists before saving
    // Had an error before when folder didn't exist
    if (!fs.existsSync(path.join(__dirname, '../temp'))) {
      fs.mkdirSync(path.join(__dirname, '../temp'), { recursive: true });
    }
    
    // This saves the PDF to a file
    var stream = fs.createWriteStream(filePath); // using var instead of const sometimes
    doc.pipe(stream); // pipe the doc to the stream
    
    // Add some content to the PDF
    doc.fontSize(20).text('Smart Campus Services Portal', { align: 'center' });
    doc.fontSize(16).text('User Report', { align: 'center' });
    doc.fontSize(10).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
    
    doc.moveDown();
    doc.fontSize(12).text('User List:', { underline: true });
    doc.moveDown();
    
    // Add table headers
    const startX = 50;
    let startY = doc.y;
    const colWidths = [150, 150, 100];
    
    // Draw headers
    doc.font('Helvetica-Bold');
    doc.text('User Name', startX, startY);
    doc.text('Email', startX + colWidths[0], startY);
    doc.text('Role', startX + colWidths[0] + colWidths[1], startY);
    doc.moveDown();
    
    // Draw table content
    doc.font('Helvetica');
    startY = doc.y;
    
    // Add users to the table
    users.forEach((user, index) => {
      // Draw row background (alternate colors for readability)
      if (index % 2 === 0) {
        doc.rect(startX - 5, startY - 5, 500, 20).fill('#f5f5f5');
      }
      
      // Draw text
      doc.fillColor('black').text(user.name || 'N/A', startX, startY);
      doc.text(user.email || 'N/A', startX + colWidths[0], startY);
      doc.text(user.role || 'N/A', startX + colWidths[0] + colWidths[1], startY);
      
      doc.moveDown();
      startY = doc.y;
    });
    
    // Add summary
    doc.moveDown();
    doc.fontSize(10).text(`Total Users: ${users.length}`);
    doc.moveDown();
    
    // Add page numbers
    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      doc.fontSize(8);
      doc.text(`Page ${i + 1} of ${pageCount}`, 50, doc.page.height - 50, {
        align: 'center'
      });
    }
    
    // Finalize the PDF
    doc.end();
    
    // Wait for the PDF to be written to file
    stream.on('finish', () => {
      // Set headers and send the file
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
      
      // Send the PDF file
      fs.createReadStream(filePath).pipe(res);
      
      // Delete the file after we're done with it
      // I'm using setTimeout to make sure the file is fully sent
      // TODO: Find a better way to clean up files
      setTimeout(() => {
        try {
          // sometimes the file is already gone
          fs.unlinkSync(filePath);
          console.log(`Deleted temp file: ${filename}`);
        } catch (e) {
          // ignore errors when file is missing
        }
      }, 5000);
    });
  } catch (err) {
    console.error('Error generating users report:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/reports/bookings
 * @desc    Generate a PDF report of all bookings
 * @access  Private - Admin Only
 */
router.get('/bookings', adminAuth, async (req, res) => {
  try {
    console.log('Generating bookings report');
    // Getting all the bookings
    const bookings = getAllItems('bookings');
    
    // Make a landscape PDF because the table is wide
    // I kept getting cut-off tables in portrait mode
    const doc = new PDFDocument({ layout: 'landscape' });
    
    // Set the filename for download
    const filename = `booking_report_${Date.now()}.pdf`;
    const filePath = path.join(__dirname, '../temp', filename);
    
    // Make sure the temp directory exists
    if (!fs.existsSync(path.join(__dirname, '../temp'))) {
      fs.mkdirSync(path.join(__dirname, '../temp'), { recursive: true });
    }
    
    // This saves the PDF to a file
    var stream = fs.createWriteStream(filePath); // using var instead of const sometimes
    doc.pipe(stream); // pipe the doc to the stream
    
    // Add some content to the PDF
    doc.fontSize(20).text('Smart Campus Services Portal', { align: 'center' });
    doc.fontSize(16).text('Room Booking Report', { align: 'center' });
    doc.fontSize(10).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
    
    doc.moveDown();
    doc.fontSize(12).text('Booking List:', { underline: true });
    doc.moveDown();
    
    // Add table headers
    const startX = 50;
    let startY = doc.y;
    const colWidths = [100, 100, 100, 80, 80, 150];
    
    // Draw headers (simple manual table - rookie approach)
    doc.font('Helvetica-Bold');
    doc.text('Room', startX, startY);
    doc.text('Date', startX + colWidths[0], startY);
    doc.text('Time', startX + colWidths[0] + colWidths[1], startY);
    doc.text('Duration', startX + colWidths[0] + colWidths[1] + colWidths[2], startY);
    doc.text('Status', startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], startY);
    doc.text('Purpose', startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4], startY);
    doc.moveDown();
    
    // Draw table content
    doc.font('Helvetica');
    startY = doc.y;
    
    // Add bookings to the table
    bookings.forEach((booking, index) => {
      // Draw row background (alternate colors for readability)
      if (index % 2 === 0) {
        doc.rect(startX - 5, startY - 5, 700, 20).fill('#f5f5f5');
      }
      
      // Figure out how long the booking is for
      // There's probably a library for this but I'm doing it manually
      let duration = '';
      if (booking.startTime && booking.endTime) {
        const startParts = booking.startTime.split(':');
        const endParts = booking.endTime.split(':');
        
        if (startParts.length === 2 && endParts.length === 2) {
          // Convert time strings to hours and minutes
          let startHour = parseInt(startParts[0]);
          let startMin = parseInt(startParts[1]);
          let endHour = parseInt(endParts[0]);
          let endMin = parseInt(endParts[1]);
          
          // Calculate the difference
          let durationHours = endHour - startHour;
          let durationMins = endMin - startMin;
          
          // Fix negative minutes
          if (durationMins < 0) {
            durationHours = durationHours - 1;
            durationMins = durationMins + 60;
          }
          
          duration = `${durationHours}h ${durationMins}m`;
        }
      }
      
      // Format time (inefficiently)
      const time = booking.startTime && booking.endTime 
        ? `${booking.startTime} - ${booking.endTime}` 
        : 'N/A';
        
      // Draw text
      doc.fillColor('black').text(booking.roomNumber || 'N/A', startX, startY);
      doc.text(booking.date || 'N/A', startX + colWidths[0], startY);
      doc.text(time, startX + colWidths[0] + colWidths[1], startY);
      doc.text(duration, startX + colWidths[0] + colWidths[1] + colWidths[2], startY);
      doc.text(booking.status || 'Confirmed', startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], startY);
      
      // Truncate purpose if too long
      const purpose = booking.purpose && booking.purpose.length > 20 
        ? booking.purpose.substring(0, 20) + '...' 
        : (booking.purpose || 'N/A');
      
      doc.text(purpose, startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4], startY);
      
      doc.moveDown();
      startY = doc.y;
      
      // Add page break if we're near the bottom
      if (startY > doc.page.height - 100) {
        doc.addPage();
        startY = 50;
      }
    });
    
    // Add summary statistics at the end
    doc.moveDown();
    doc.fontSize(12).text('Booking Summary:', { underline: true });
    doc.moveDown();
    doc.fontSize(10).text(`Total Bookings: ${bookings.length}`);
    
    // Count bookings by room (inefficient way - a rookie approach)
    const roomCounts = {};
    bookings.forEach(booking => {
      if (booking.roomNumber) {
        if (!roomCounts[booking.roomNumber]) {
          roomCounts[booking.roomNumber] = 0;
        }
        roomCounts[booking.roomNumber]++;
      }
    });
    
    // Display room counts
    doc.moveDown();
    doc.text('Bookings by Room:');
    for (const room in roomCounts) {
      doc.text(`  Room ${room}: ${roomCounts[room]} bookings`);
    }
    
    // Add page numbers
    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      doc.fontSize(8);
      doc.text(`Page ${i + 1} of ${pageCount}`, 50, doc.page.height - 50, {
        align: 'center'
      });
    }
    
    // Finalize the PDF
    doc.end();
    
    // Wait for the PDF to be written to file
    stream.on('finish', () => {
      // Set headers and send the file
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
      
      // Send the PDF file
      fs.createReadStream(filePath).pipe(res);
      
      // Delete the file after sending it
      setTimeout(() => {
        fs.unlinkSync(filePath);
      }, 5000);
    });
  } catch (err) {
    console.error('Error generating bookings report:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/reports/maintenance
 * @desc    Generate a PDF report of maintenance requests
 * @access  Private - Admin Only
 */
router.get('/maintenance', adminAuth, async (req, res) => {
  try {
    // Get all maintenance requests
    const maintenanceRequests = getAllItems('maintenanceRequests');
    
    // Create a new PDF document
    const doc = new PDFDocument();
    
    // Set the filename for download
    const filename = `maintenance_report_${Date.now()}.pdf`;
    const filePath = path.join(__dirname, '../temp', filename);
    
    // Make sure the temp directory exists
    if (!fs.existsSync(path.join(__dirname, '../temp'))) {
      fs.mkdirSync(path.join(__dirname, '../temp'), { recursive: true });
    }
    
    // This saves the PDF to a file
    var stream = fs.createWriteStream(filePath); // using var instead of const sometimes
    doc.pipe(stream); // pipe the doc to the stream
    
    // Add title and header
    doc.fontSize(20).text('Smart Campus Services Portal', { align: 'center' });
    doc.fontSize(16).text('Maintenance Requests Report', { align: 'center' });
    doc.fontSize(10).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
    
    doc.moveDown();
    doc.fontSize(12).text('Maintenance Request List:', { underline: true });
    doc.moveDown();
    
    // Count by status (inefficient way - typical rookie approach)
    const statusCounts = {
      'pending': 0,
      'in-progress': 0,
      'completed': 0,
      'cancelled': 0
    };
    
    maintenanceRequests.forEach(request => {
      if (statusCounts[request.status] !== undefined) {
        statusCounts[request.status]++;
      }
    });
    
    // Draw status summary
    doc.fontSize(12).text('Status Summary:');
    doc.moveDown();
    
    for (const status in statusCounts) {
      doc.fontSize(10).text(`${status}: ${statusCounts[status]}`);
    }
    
    doc.moveDown();
    doc.fontSize(12).text('Request Details:');
    doc.moveDown();
    
    // List all requests with details
    maintenanceRequests.forEach((request, index) => {
      // Add a box around each request
      const boxY = doc.y;
      
      // Determine color based on status
      let boxColor = '#f0f0f0';
      if (request.status === 'pending') boxColor = '#fff3cd';
      if (request.status === 'in-progress') boxColor = '#cfe2ff';
      if (request.status === 'completed') boxColor = '#d1e7dd';
      if (request.status === 'cancelled') boxColor = '#f8d7da';
      
      // Create a box for each request
      doc.rect(40, boxY, 500, 120).fill(boxColor);
      doc.fillColor('black');
      
      // Request number
      doc.fontSize(12).text(`Request #${index + 1}`, 50, boxY + 10);
      
      // Request details
      doc.fontSize(10).text(`Location: ${request.location || 'Not specified'}`, 50, boxY + 30);
      doc.fontSize(10).text(`Status: ${request.status || 'Not specified'}`, 50, boxY + 45);
      doc.fontSize(10).text(`Reported on: ${new Date(request.createdAt).toLocaleString()}`, 50, boxY + 60);
      
      // Description (might be long, limit it)
      const description = request.description || 'No description provided';
      const truncatedDesc = description.length > 100 
        ? description.substring(0, 100) + '...' 
        : description;
      
      doc.fontSize(10).text(`Description: ${truncatedDesc}`, 50, boxY + 75, {
        width: 480
      });
      
      // Move to next request
      doc.moveDown(7);
      
      // Add page break if needed
      if (doc.y > doc.page.height - 150) {
        doc.addPage();
      }
    });
    
    // Add page numbers
    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      doc.fontSize(8);
      doc.text(`Page ${i + 1} of ${pageCount}`, 50, doc.page.height - 50, {
        align: 'center'
      });
    }
    
    // Finalize the PDF
    doc.end();
    
    // Wait for the PDF to be written to file
    stream.on('finish', () => {
      // Set headers and send the file
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
      
      // Send the PDF file
      fs.createReadStream(filePath).pipe(res);
      
      // Delete the file after sending it
      setTimeout(() => {
        fs.unlinkSync(filePath);
      }, 5000);
    });
  } catch (err) {
    console.error('Error generating maintenance report:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/reports/analytics
 * @desc    Generate a PDF report of analytics data
 * @access  Private - Admin Only
 */
// This route generates a complete analytics report with all the data
// It's the most complex one because it combines everything
router.get('/analytics', adminAuth, async (req, res) => {
  try {
    // Get data from all collections
    const users = getAllItems('users');
    const bookings = getAllItems('bookings');
    const maintenanceRequests = getAllItems('maintenanceRequests');
    const announcements = getAllItems('announcements');
    
    // Create a new PDF document
    const doc = new PDFDocument();
    
    // Set the filename for download
    const filename = `analytics_report_${Date.now()}.pdf`;
    const filePath = path.join(__dirname, '../temp', filename);
    
    // Make sure the temp directory exists
    if (!fs.existsSync(path.join(__dirname, '../temp'))) {
      fs.mkdirSync(path.join(__dirname, '../temp'), { recursive: true });
    }
    
    // This saves the PDF to a file
    var stream = fs.createWriteStream(filePath); // using var instead of const sometimes
    doc.pipe(stream); // pipe the doc to the stream
    
    // Add title and header
    doc.fontSize(20).text('Smart Campus Services Portal', { align: 'center' });
    doc.fontSize(16).text('Analytics Report', { align: 'center' });
    doc.fontSize(10).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
    
    doc.moveDown();
    
    // System summary
    doc.fontSize(14).text('System Summary', { underline: true });
    doc.moveDown();
    
    const summaryData = [
      { label: 'Total Users', value: users.length },
      { label: 'Total Bookings', value: bookings.length },
      { label: 'Total Maintenance Requests', value: maintenanceRequests.length },
      { label: 'Total Announcements', value: announcements.length }
    ];
    
    // Draw summary table
    summaryData.forEach(item => {
      doc.fontSize(12).text(`${item.label}: ${item.value}`);
    });
    
    doc.moveDown(2);
    
    // User roles analysis
    doc.fontSize(14).text('User Role Distribution', { underline: true });
    doc.moveDown();
    
    // Count up how many users have each role
    // I know there's probably a more efficient way to do this
    // but this is easier for me to understand right now
    let roleCounts = {};
    for (let i = 0; i < users.length; i++) {
      let user = users[i];
      let role = user.role;
      
      // If this is the first user with this role, initialize the count
      if (!roleCounts[role]) {
        roleCounts[role] = 0;
      }
      
      // Increment the count for this role
      roleCounts[role]++;
    }
    
    // Display role counts
    for (const role in roleCounts) {
      const percentage = ((roleCounts[role] / users.length) * 100).toFixed(1);
      doc.fontSize(12).text(`${role}: ${roleCounts[role]} (${percentage}%)`);
    }
    
    doc.moveDown(2);
    
    // Booking trends section
    doc.fontSize(14).text('Booking Trends', { underline: true });
    doc.moveDown();
    
    // Figure out how many bookings we had each month
    // First I need the month names and a place to store counts
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var monthlyCounts = {};
    
    // Start with zero bookings for each month
    for (let month of months) {
      monthlyCounts[month] = 0;
    }
    
    // Now count the bookings for each month
    for (let i = 0; i < bookings.length; i++) {
      let booking = bookings[i];
      // Skip bookings without dates
      if (booking.createdAt) {
        // Get the month from the date
        let bookingDate = new Date(booking.createdAt);
        let monthName = months[bookingDate.getMonth()];
        // Add to the count for this month
        monthlyCounts[monthName] = monthlyCounts[monthName] + 1;
      }
    }
    
    // Display monthly counts
    doc.fontSize(12).text('Monthly Booking Distribution:');
    doc.moveDown();
    
    for (const month of months) {
      const count = monthlyCounts[month];
      // Create a simple text-based bar chart
      let bar = '';
      for (let i = 0; i < count; i++) {
        bar += '■';
      }
      doc.text(`${month}: ${count} ${bar}`);
    }
    
    doc.moveDown(2);
    
    // Maintenance status breakdown
    doc.fontSize(14).text('Maintenance Request Status', { underline: true });
    doc.moveDown();
    
    // Count by status (again - redundant code, typical rookie approach)
    const maintenanceStatusCounts = {
      'pending': 0,
      'in-progress': 0,
      'completed': 0,
      'cancelled': 0
    };
    
    maintenanceRequests.forEach(request => {
      if (maintenanceStatusCounts[request.status] !== undefined) {
        maintenanceStatusCounts[request.status]++;
      }
    });
    
    // Display maintenance status counts
    for (const status in maintenanceStatusCounts) {
      const count = maintenanceStatusCounts[status];
      const percentage = maintenanceRequests.length > 0 
        ? ((count / maintenanceRequests.length) * 100).toFixed(1) 
        : '0.0';
      
      doc.fontSize(12).text(`${status}: ${count} (${percentage}%)`);
    }
    
    doc.moveDown(2);
    
    // Recent activity log
    doc.fontSize(14).text('Recent Activity Summary', { underline: true });
    doc.moveDown();
    
    // Creating a naive combined log of recent activities
    const activities = [
      ...bookings.map(item => ({
        type: 'booking',
        date: new Date(item.createdAt),
        details: `Room ${item.roomNumber} booked`
      })),
      ...maintenanceRequests.map(item => ({
        type: 'maintenance',
        date: new Date(item.createdAt),
        details: `Maintenance request: ${item.status}`
      })),
      ...announcements.map(item => ({
        type: 'announcement',
        date: new Date(item.createdAt),
        details: `Announcement: ${item.title}`
      }))
    ];
    
    // Sort by date (newest first) and take top 10
    activities.sort((a, b) => b.date - a.date);
    const recentActivities = activities.slice(0, 10);
    
    // Display recent activities
    recentActivities.forEach((activity, index) => {
      const dateStr = activity.date.toLocaleString();
      doc.fontSize(10).text(`${index + 1}. [${activity.type}] ${dateStr} - ${activity.details}`);
      doc.moveDown(0.5);
    });
    
    // Add page numbers
    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      doc.fontSize(8);
      doc.text(`Page ${i + 1} of ${pageCount}`, 50, doc.page.height - 50, {
        align: 'center'
      });
    }
    
    // Finalize the PDF
    doc.end();
    
    // Wait for the PDF to be written to file
    stream.on('finish', () => {
      // Set headers and send the file
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
      
      // Send the PDF file
      fs.createReadStream(filePath).pipe(res);
      
      // Delete the file after sending it
      setTimeout(() => {
        fs.unlinkSync(filePath);
      }, 5000);
    });
  } catch (err) {
    console.error('Error generating analytics report:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
