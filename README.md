# Smart Campus Services Portal

A role-based web portal for managing core campus services including room bookings, class schedules, maintenance requests, and announcements.

## Features

- **User Authentication**: Role-based access for students, faculty, and administrators
- **Room Bookings**: Reserve rooms for meetings, events, or study sessions
- **Class Schedules**: View and manage class timetables
- **Maintenance Requests**: Submit and track maintenance issues
- **Announcements**: Post and view campus announcements

## Technology Stack

- **Frontend**: React with Bootstrap for styling
- **Backend**: Express.js REST API
- **Database**: Local JSON file (using lowdb)
- **Authentication**: JWT-based authentication

## Project Structure

```
smart-campus-services-portal/
├── backend/                  # API server
│   ├── config/               # Configuration files
│   ├── db/                   # Database related files
│   ├── middleware/           # Express middleware
│   ├── routes/               # API endpoints
│   └── index.js              # Main server file
├── frontend/                 # React client
│   ├── public/               # Static files
│   └── src/                  # React source code
│       ├── components/       # React components
│       │   ├── announcements/# Announcement components
│       │   ├── auth/         # Authentication components
│       │   ├── bookings/     # Booking components
│       │   ├── layout/       # Layout components
│       │   ├── maintenance/  # Maintenance components
│       │   └── schedules/    # Schedule components
│       ├── contexts/         # React context providers
│       └── App.js            # Main application component
└── package.json              # Project dependencies and scripts
```

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   cd frontend && npm install
   cd backend && npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

   This will start both the backend server (port 8000) and frontend development server (port 3000).

4. The application will be available at:
   - Frontend: http://localhost:3000
   - API: http://localhost:8000/api

## User Roles

- **Student**: Can view schedules, make room bookings, and submit maintenance requests
- **Faculty**: Can manage schedules, approve bookings, and post announcements
- **Admin**: Has full control over all features

## Database

This project uses a local JSON file for the database (located at `backend/db/db.json`). The data is structured into collections:

- users
- bookings
- schedules
- maintenanceRequests
- announcements

No external database setup is required - ideal for small in-house projects!

## License

This project is for educational purposes only.
