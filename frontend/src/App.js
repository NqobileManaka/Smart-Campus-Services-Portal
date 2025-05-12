import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import AuthContext from './contexts/AuthContext';

import Navbar from './components/layout/Navbar';
import Dashboard from './components/layout/Dashboard';
import NotificationCenter from './components/layout/NotificationCenter';
import AdminDashboard from './components/layout/AdminDashboard';

import Login from './components/auth/Login';
import Register from './components/auth/Register';

import BookingList from './components/bookings/BookingList';
import BookingForm from './components/bookings/BookingForm';
import ScheduleList from './components/schedules/ScheduleList';
import ScheduleForm from './components/schedules/ScheduleForm';
import MaintenanceList from './components/maintenance/MaintenanceList';
import MaintenanceForm from './components/maintenance/MaintenanceForm';
import AnnouncementList from './components/announcements/AnnouncementList';
import AnnouncementForm from './components/announcements/AnnouncementForm';

import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" />;
  }
  return children;
};

const AppRoutes = () => {
  const { isAuthenticated } = useContext(AuthContext);
  
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route path="/" element={
        isAuthenticated ? <Dashboard /> : <Navigate to="/login" />
      } />
      
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/bookings" element={
        <ProtectedRoute>
          <BookingList />
        </ProtectedRoute>
      } />
      <Route path="/bookings/new" element={
        <ProtectedRoute>
          <BookingForm />
        </ProtectedRoute>
      } />
      
      <Route path="/schedules" element={
        <ProtectedRoute>
          <ScheduleList />
        </ProtectedRoute>
      } />
      <Route path="/schedules/new" element={
        <ProtectedRoute>
          <ScheduleForm />
        </ProtectedRoute>
      } />
      
      <Route path="/maintenance" element={
        <ProtectedRoute>
          <MaintenanceList />
        </ProtectedRoute>
      } />
      <Route path="/maintenance/new" element={
        <ProtectedRoute>
          <MaintenanceForm />
        </ProtectedRoute>
      } />
      
      <Route path="/announcements" element={
        <ProtectedRoute>
          <AnnouncementList />
        </ProtectedRoute>
      } />
      <Route path="/announcements/new" element={
        <ProtectedRoute>
          <AnnouncementForm />
        </ProtectedRoute>
      } />
      
      <Route path="/notifications" element={
        <ProtectedRoute>
          <NotificationCenter />
        </ProtectedRoute>
      } />
      
      <Route path="/admin/analytics" element={
        <ProtectedRoute>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="d-flex flex-column min-vh-100">
          <Navbar />
          <main className="flex-grow-1 pb-4">
            <AppRoutes />
          </main>
          <footer className="bg-dark text-light py-3 mt-auto">
            <div className="container text-center">
              <p className="mb-0">Smart Campus Services Portal {new Date().getFullYear()}</p>
            </div>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
