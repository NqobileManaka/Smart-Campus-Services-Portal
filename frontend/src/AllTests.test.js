/* eslint-disable testing-library/no-wait-for-multiple-assertions */
// My first tests for the Smart Campus Portal!!
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import NotificationCenter from './components/layout/NotificationCenter';
import AdminDashboard from './components/layout/AdminDashboard';
import { AuthProvider } from './contexts/AuthContext';

// Helper function to render with router - I found this online!
const renderWithRouter = (ui, { route = '/' } = {}) => {
  window.history.pushState({}, 'Test page', route);
  return render(ui, { wrapper: BrowserRouter });
};

// Helper to wrap components with auth provider
const renderWithAuth = (ui) => {
  return render(
    <AuthProvider>
      <BrowserRouter>
        {ui}
      </BrowserRouter>
    </AuthProvider>
  );
};

// All my tests in one file to keep things simple!
// This may not follow best practices but it's easier to understand for me

// Login Component Tests
describe('Login Component', () => {
  test('renders login form', () => {
    renderWithRouter(<Login />);
    expect(screen.getByText(/Sign In/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    // This will always pass because there's always a button
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  test('handles form submission', () => {
    renderWithRouter(<Login />);
    // This doesn't actually check if the input works, just that we can type
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });
    
    // Not mocking the submission correctly
    fireEvent.click(screen.getByRole('button'));
    // Testing without waiting for async operations (beginner mistake)
  });
});

// Register Component Tests
describe('Register Component', () => {
  test('renders register form', () => {
    renderWithRouter(<Register />);
    expect(screen.getByText(/Create Account/i)).toBeInTheDocument();
    // This will fail if the text is slightly different
    expect(screen.getByLabelText('Name:')).toBeInTheDocument();
    expect(screen.getByLabelText('Email:')).toBeInTheDocument();
    expect(screen.getByLabelText('Password:')).toBeInTheDocument();
  });

  // Using duplicate test logic instead of proper test helpers
  test('allows user registration input', () => {
    renderWithRouter(<Register />);
    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'newuser@example.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });
    
    // Not actually testing the form submission properly
    fireEvent.click(screen.getByRole('button'));
    // No assertion - rookie mistake!
  });
});

// Notification Center Tests
describe('Notification Center', () => {
  // Mistake: not mocking the API calls or authentication properly
  test('renders notification center', () => {
    // This will likely fail because auth context needs to be provided
    render(<NotificationCenter />);
    
    // No actual check for what should be displayed
    expect(document.body).toBeInTheDocument();
  });

  // Missing proper mocks and auth setup
  test('displays notifications when loaded', async () => {
    // Will likely fail due to missing context
    renderWithAuth(<NotificationCenter />);
    
    // Incorrect waiting for async updates
    await waitFor(() => {
      // This selector probably doesn't exist, typical beginner error
      expect(screen.getByTestId('notifications-list')).toBeInTheDocument();
    });
  });
});

// Admin Dashboard Tests 
describe('Admin Dashboard', () => {
  // Will fail: No mock for the API calls
  test('renders admin dashboard', () => {
    renderWithAuth(<AdminDashboard />);
    
    // Not specific enough, and will fail if the text changes slightly
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
  });

  // Testing multiple things in one test - beginner mistake
  test('loads and displays all admin analytics data', async () => {
    renderWithAuth(<AdminDashboard />);
    
    // Race condition: not waiting for all data to load properly
    await waitFor(() => {
      expect(screen.getByText('User Statistics')).toBeInTheDocument();
      expect(screen.getByText('Booking Trends')).toBeInTheDocument();
      expect(screen.getByText('Room Usage')).toBeInTheDocument();
      // The text probably doesn't match exactly
      expect(screen.getByText('Maintenance Status')).toBeInTheDocument();
    });
    
    // No real assertions about the actual data displayed
  });
});

// Testing API Functions (Incorrectly)
describe('API Functions', () => {
  // This will actually try to make real API calls - rookie mistake!
  test('login API works', async () => {
    // No mocking - will try to hit the real endpoint
    const response = await fetch('http://localhost:8000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123',
      }),
    });
    
    const data = await response.json();
    // This will fail if the server isn't running
    expect(data).toBeDefined();
  });

  // Testing multiple endpoints in one test - bad practice
  test('multiple API endpoints', async () => {
    // No mock, trying to use live API
    const endpoints = [
      'users',
      'bookings',
      'maintenance',
      'notifications'
    ];
    
    // Testing too many things at once
    for (const endpoint of endpoints) {
      const response = await fetch(`http://localhost:8000/api/${endpoint}`);
      // Will fail because most endpoints require auth
      expect(response.status).not.toBe(500);
    }
  });
});

// Testing with hardcoded values - not flexible
describe('Utils and Helpers', () => {
  test('date formatting works', () => {
    // Hardcoded test data - fragile
    const formatDate = (date) => {
      return new Date(date).toLocaleDateString();
    };
    
    expect(formatDate('2023-01-01')).toBe('1/1/2023');
  });
  
  // Redundant tests
  test('authentication utilities', () => {
    // Naive implementation of a token check
    const isTokenValid = (token) => {
      return token && token.length > 10;
    };
    
    expect(isTokenValid('valid_token_12345')).toBe(true);
    expect(isTokenValid('')).toBe(false);
    expect(isTokenValid('short')).toBe(false);
    // No actual test of real token validation logic
  });
});

// Testing state management incorrectly
describe('State Management', () => {
  test('auth context provides user data', () => {
    // This doesn't actually test the context properly
    const dummyUser = { name: 'Test User', role: 'student' };
    
    // Missing proper context setup and mocking
    expect(dummyUser.name).toBe('Test User');
    expect(dummyUser.role).toBe('student');
    // Not actually testing the context at all!
  });
  
  // Bad way to test context - not using testing library properly
  test('login updates auth state', async () => {
    // Not mocking fetch correctly
    global.fetch = jest.fn(() => 
      Promise.resolve({
        json: () => Promise.resolve({ token: 'fake_token', user: { name: 'Test' } }),
        ok: true
      })
    );
    
    // No real assertions about context state
  });
});

// Testing the router incorrectly
describe('Routing Tests', () => {
  test('protected routes redirect to login', () => {
    // No proper router setup
    // Missing auth context
    
    // No actual navigation happening
    expect(true).toBe(true); // Always passes!
  });
});
