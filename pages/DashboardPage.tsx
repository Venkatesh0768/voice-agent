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
    <div className="container mx-auto px-4 py-8">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-slate-800">Welcome, {name}!</h1>
        <p className="text-xl text-slate-600 mt-2">
          {role === UserRole.ADMIN ? "Admin Dashboard" : "Your Health Dashboard"}
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        <OptionCard
          icon="fas fa-calendar-plus"
          title="Book New Appointment"
          description="Schedule a new visit with our voice-guided system."
          onClick={() => navigate('/book-appointment')}
          color="sky"
        />
        <OptionCard
          icon="fas fa-tasks"
          title="My Appointments"
          description="View and manage your upcoming and past appointments."
          onClick={() => navigate('/my-appointments')}
          color="green"
        />
        
        {role === UserRole.ADMIN && (
          <OptionCard
            icon="fas fa-user-shield"
            title="Admin Panel"
            description="Manage all appointments, users, and system settings."
            onClick={() => navigate('/admin')}
            color="red"
          />
        )}

        <OptionCard
          icon="fas fa-file-pdf"
          title="Chat with PDF"
          description="Get insights from medical documents."
          onClick={() => alert('Chat with PDF feature is coming soon!')}
          color="purple"
          disabled
        />
         <OptionCard
          icon="fas fa-user-cog"
          title="Profile Settings"
          description="Update your personal information and preferences."
          onClick={() => alert('Profile Settings feature is coming soon!')}
          color="yellow"
          disabled
        />
      </div>
       <footer className="mt-16 text-center text-slate-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Clinic AI Assistant. All rights reserved.</p>
          <p>Powered by Gemini AI</p>
        </footer>
    </div>
  );
};

interface OptionCardProps {
  icon: string;
  title: string;
  description: string;
  onClick: () => void;
  color: 'sky' | 'purple' | 'green' | 'red' | 'yellow';
  disabled?: boolean;
}

const OptionCard: React.FC<OptionCardProps> = ({ icon, title, description, onClick, color, disabled }) => {
  const baseClasses = "bg-white p-6 rounded-xl shadow-lg border border-gray-200 transition-all duration-300 ease-in-out";
  const hoverClasses = disabled ? "opacity-60 cursor-not-allowed" : `hover:shadow-xl hover:scale-105 group hover:border-${color}-500`;
  
  const colorVariants = {
    sky: { icon: 'text-sky-500', border: 'border-sky-500', button: 'text-sky-600 hover:text-sky-700' },
    purple: { icon: 'text-purple-500', border: 'border-purple-500', button: 'text-purple-600 hover:text-purple-700' },
    green: { icon: 'text-green-500', border: 'border-green-500', button: 'text-green-600 hover:text-green-700' },
    red: { icon: 'text-red-500', border: 'border-red-500', button: 'text-red-600 hover:text-red-700' },
    yellow: { icon: 'text-yellow-500', border: 'border-yellow-500', button: 'text-yellow-600 hover:text-yellow-700' },
  };
  const selectedColor = colorVariants[color];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${hoverClasses} flex flex-col items-start text-left`}
      aria-label={`Action: ${title}`}
    >
      <div className={`p-3 mb-4 rounded-full bg-slate-100 group-hover:bg-slate-200 transition-colors ${selectedColor.icon}`}>
        <i className={`${icon} text-3xl w-8 h-8 text-center`}></i>
      </div>
      <h2 className="text-xl font-semibold mb-2 text-slate-800">{title}</h2>
      <p className="text-slate-600 text-sm mb-4 flex-grow">{description}</p>
      {!disabled && (
          <span className={`mt-auto text-sm font-semibold ${selectedColor.button} group-hover:underline transition-colors`}>
            Proceed <i className="fas fa-arrow-right ml-1 text-xs"></i>
          </span>
        )}
    </button>
  );
};

export default DashboardPage;
