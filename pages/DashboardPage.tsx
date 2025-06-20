import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { UserRole } from "../src/types/types";

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const auth = useContext(AuthContext);

  if (!auth || !auth.currentUser) {
    // This should ideally be handled by ProtectedRoute, but as a fallback:
    return <p className="p-8 text-center text-red-500">User not authenticated.</p>;
  }

  const { name, role } = auth.currentUser;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="w-full px-2 sm:px-4 py-8 max-h-[85vh] overflow-y-auto">
        <header className="mb-8 sm:mb-10 text-center">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-pink-500 to-sky-500 drop-shadow-lg mb-2">
            Welcome{auth.currentUser?.name ? `, ${auth.currentUser.name}` : ","}!
          </h1>
          <p className="text-lg sm:text-2xl text-slate-700 font-medium shadow-sm bg-white/60 rounded px-4 py-2 inline-block">
            {role === UserRole.ADMIN ? "Admin Dashboard" : "Your Health Dashboard"}
          </p>
        </header>
        <section className="w-full max-w-6xl mx-auto bg-white/80 rounded-2xl shadow-xl p-4 sm:p-8 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <OptionCard
              icon="fas fa-calendar-plus"
              iconBg="bg-sky-100 text-sky-500"
              title="Book New Appointment"
              description="Schedule a new visit with our voice-guided system."
              onClick={() => navigate('/book-appointment')}
              color="sky"
            />
            <OptionCard
              icon="fas fa-tasks"
              iconBg="bg-green-100 text-green-500"
              title="My Appointments"
              description="View and manage your upcoming and past appointments."
              onClick={() => navigate('/my-appointments')}
              color="green"
            />
            {role === UserRole.ADMIN && (
              <OptionCard
                icon="fas fa-user-shield"
                iconBg="bg-red-100 text-red-500"
                title="Admin Panel"
                description="Manage all appointments, users, and system settings."
                onClick={() => navigate('/admin')}
                color="red"
              />
            )}
            <OptionCard
              icon="fas fa-file-pdf"
              iconBg="bg-purple-100 text-purple-500"
              title="Chat with PDF"
              description="Get insights from medical documents."
              onClick={() => alert('Chat with PDF feature is coming soon!')}
              color="purple"
              disabled
            />
            <OptionCard
              icon="fas fa-user-cog"
              iconBg="bg-yellow-100 text-yellow-500"
              title="Profile Settings"
              description="Update your personal information and preferences."
              onClick={() => alert('Profile Settings feature is coming soon!')}
              color="yellow"
              disabled
            />
          </div>
        </section>
        <footer className="mt-8 text-center text-slate-400 text-xs sm:text-sm pb-4">
          <p>&copy; {new Date().getFullYear()} Clinic AI Assistant. All rights reserved.</p>
          <p className="mt-1">Powered by <span className="font-semibold text-indigo-500">Gemini AI</span></p>
        </footer>
      </div>
    </div>
  );
};

interface OptionCardProps {
  icon: string;
  iconBg?: string;
  title: string;
  description: string;
  onClick: () => void;
  color: 'sky' | 'purple' | 'green' | 'red' | 'yellow';
  disabled?: boolean;
}

const OptionCard: React.FC<OptionCardProps> = ({ icon, iconBg = '', title, description, onClick, color, disabled }) => {
  const baseClasses = "bg-white p-6 rounded-2xl shadow-lg border border-gray-200 transition-all duration-300 ease-in-out";
  const hoverClasses = disabled ? "opacity-60 cursor-not-allowed" : `hover:shadow-2xl hover:scale-105 group hover:border-${color}-400`;
  const colorVariants = {
    sky: { button: 'text-sky-600 hover:text-sky-700' },
    purple: { button: 'text-purple-600 hover:text-purple-700' },
    green: { button: 'text-green-600 hover:text-green-700' },
    red: { button: 'text-red-600 hover:text-red-700' },
    yellow: { button: 'text-yellow-600 hover:text-yellow-700' },
  };
  const selectedColor = colorVariants[color];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${hoverClasses} flex flex-col items-start text-left group w-full h-full`}
      aria-label={`Action: ${title}`}
    >
      <div className={`p-4 mb-4 rounded-full ${iconBg} shadow-sm flex items-center justify-center text-3xl`}>
        <i className={`${icon}`}></i>
      </div>
      <h2 className="text-lg sm:text-xl font-bold mb-2 text-slate-800 group-hover:text-black transition-colors">{title}</h2>
      <p className="text-slate-600 text-sm mb-4 flex-grow">{description}</p>
      {!disabled && (
        <span className={`mt-auto text-sm font-semibold ${selectedColor.button} group-hover:underline transition-colors flex items-center`}>
          Proceed <i className="fas fa-arrow-right ml-1 text-xs"></i>
        </span>
      )}
    </button>
  );
};

export default DashboardPage;
