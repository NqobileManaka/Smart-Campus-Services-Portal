const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');

const app = express();
const PORT = 8000;

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Welcome route
app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to Smart Campus Services Portal API' });
});

// Define Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/schedules', require('./routes/schedules'));
app.use('/api/maintenance', require('./routes/maintenance'));
app.use('/api/announcements', require('./routes/announcements'));
app.use('/api/notifications', require('./routes/notifications').router);
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/reports', require('./routes/reports'));

// Database access (for development/debugging only)
if (process.env.NODE_ENV !== 'production') {
  app.get('/api/database', (req, res) => {
    const db = require('./db/db');
    res.json(db.getState());
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT}/api to test the API`);
  console.log(`Local JSON database located at: ${path.join(__dirname, 'db', 'db.json')}`);
});
