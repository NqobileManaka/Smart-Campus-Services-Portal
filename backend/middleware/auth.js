const jwt = require('jsonwebtoken');
const db = require('../db/db');

// Secret key for JWT - in a real application this would be in an environment variable
const JWT_SECRET = 'campus_portal_secret_key_123';

// Middleware to verify the user's token
const auth = (req, res, next) => {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if no token
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Verify user exists in database
    const user = db.get('users')
      .find({ _id: decoded.user.id })
      .value();
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Middleware to check for admin role
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
  next();
};

// Middleware to check for faculty role (faculty or admin can access)
const isFaculty = (req, res, next) => {
  if (req.user.role !== 'faculty' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Faculty privileges required.' });
  }
  next();
};

module.exports = { auth, isAdmin, isFaculty, JWT_SECRET };
