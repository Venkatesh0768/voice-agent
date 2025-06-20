import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import LandingPage from './components/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage'; // Main page after login
import BookAppointmentPage from './components/BookAppointmentPage';
import UserAppointmentsPage from './pages/UserAppointmentsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import Navbar from './components/Navbar'; 
import { UserRole } from './types';


const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />

              {/* User Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute userOnly>
                  <DashboardPage />
                </ProtectedRoute>
              } />
              <Route path="/book-appointment" element={
                <ProtectedRoute userOnly>
                  <BookAppointmentPage />
                </ProtectedRoute>
              } />
              <Route path="/my-appointments" element={
                <ProtectedRoute userOnly>
                  <UserAppointmentsPage />
                </ProtectedRoute>
              } />

              {/* Admin Routes */}
              <Route path="/admin/dashboard" element={
                <ProtectedRoute adminOnly>
                  <AdminDashboardPage />
                </ProtectedRoute>
              } />
              <Route path="/admin" element={
                <ProtectedRoute adminOnly>
                  <AdminDashboardPage />
                </ProtectedRoute>
              } />
              
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      </HashRouter>
    </AuthProvider>
  );
};

export default App;