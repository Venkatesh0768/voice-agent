import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { UserRole } from '../types';

const Navbar: React.FC = () => {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    auth?.logout();
    navigate('/login');
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
            <NavLink to={auth?.currentUser ? (auth.isAdmin() ? "/admin/dashboard" : "/dashboard") : "/"} className="text-2xl font-bold tracking-tight hover:text-sky-400 transition-colors">
              <i className="fas fa-clinic-medical mr-2"></i>Clinic AI
            </NavLink>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
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
          <div className="md:hidden">
            {/* Mobile menu button could be added here */}
          </div>
        </div>
      </div>
    </nav>
  );
};

interface NavLinkItemProps {
  to: string;
  children: React.ReactNode;
}
const NavLinkItem: React.FC<NavLinkItemProps> = ({ to, children }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        isActive ? 'bg-sky-500 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'
      }`
    }
  >
    {children}
  </NavLink>
);


export default Navbar;
