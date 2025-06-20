import React, { useContext, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { UserRole } from '../types';

const Navbar: React.FC = () => {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    auth?.logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  if (auth?.isLoading) {
    return (
      <nav className="bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-lg p-4">
        <div className="container mx-auto flex justify-between items-center">
          <NavLink to="/" className="text-2xl font-bold tracking-tight hover:text-sky-400 transition-colors">
            <i className="fas fa-clinic-medical mr-2"></i>Clinic AI
          </NavLink>
          <div>Loading...</div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <NavLink to={auth?.currentUser ? (auth.isAdmin() ? "/admin/dashboard" : "/dashboard") : "/"} className="text-xl sm:text-2xl font-bold tracking-tight hover:text-sky-400 transition-colors">
              <i className="fas fa-clinic-medical mr-2"></i>Clinic AI
            </NavLink>
          </div>
          <div className="hidden md:block">
            <div className="ml-6 flex items-baseline space-x-2 sm:space-x-4">
              {auth?.currentUser ? (
                <>
                  {auth.isAdmin() ? (
                    // Admin Navigation
                    <>
                      <NavLinkItem to="/admin/dashboard">Admin Dashboard</NavLinkItem>
                      <NavLinkItem to="/admin">Manage Appointments</NavLinkItem>
                    </>
                  ) : (
                    // User Navigation
                    <>
                      <NavLinkItem to="/dashboard">Dashboard</NavLinkItem>
                      <NavLinkItem to="/book-appointment">Book Appointment</NavLinkItem>
                      <NavLinkItem to="/my-appointments">My Appointments</NavLinkItem>
                    </>
                  )}
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-slate-400 px-2 py-1 bg-slate-700 rounded">
                      {auth.currentUser.name} ({auth.currentUser.role})
                    </span>
                    <button
                      onClick={handleLogout}
                      className="text-slate-300 hover:bg-slate-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <NavLinkItem to="/login">Login</NavLinkItem>
                  <NavLinkItem to="/signup">Sign Up</NavLinkItem>
                </>
              )}
            </div>
          </div>
          <div className="md:hidden flex items-center">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white" aria-label="Open main menu">
              {mobileMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
        {/* Mobile menu overlay */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute left-0 right-0 top-16 bg-slate-900 bg-opacity-95 z-50 shadow-lg rounded-b-xl animate-fade-in flex flex-col items-center py-4 space-y-2">
            {auth?.currentUser ? (
              <>
                {auth.isAdmin() ? (
                  <>
                    <NavLinkItem to="/admin/dashboard" onClick={() => setMobileMenuOpen(false)}>Admin Dashboard</NavLinkItem>
                    <NavLinkItem to="/admin" onClick={() => setMobileMenuOpen(false)}>Manage Appointments</NavLinkItem>
                  </>
                ) : (
                  <>
                    <NavLinkItem to="/dashboard" onClick={() => setMobileMenuOpen(false)}>Dashboard</NavLinkItem>
                    <NavLinkItem to="/book-appointment" onClick={() => setMobileMenuOpen(false)}>Book Appointment</NavLinkItem>
                    <NavLinkItem to="/my-appointments" onClick={() => setMobileMenuOpen(false)}>My Appointments</NavLinkItem>
                  </>
                )}
                <div className="flex flex-col items-center space-y-2">
                  <span className="text-xs text-slate-400 px-2 py-1 bg-slate-700 rounded">
                    {auth.currentUser.name} ({auth.currentUser.role})
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-slate-300 hover:bg-slate-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <NavLinkItem to="/login" onClick={() => setMobileMenuOpen(false)}>Login</NavLinkItem>
                <NavLinkItem to="/signup" onClick={() => setMobileMenuOpen(false)}>Sign Up</NavLinkItem>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

interface NavLinkItemProps {
  to: string;
  children: React.ReactNode;
  onClick?: () => void;
}
const NavLinkItem: React.FC<NavLinkItemProps> = ({ to, children, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        isActive ? 'bg-sky-500 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'
      }`
    }
  >
    {children}
  </NavLink>
);

export default Navbar;
