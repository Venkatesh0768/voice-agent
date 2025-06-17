import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white p-6 relative overflow-hidden">
      {/* Background shapes for decoration */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"></div>
      
      <div className="text-center space-y-8 max-w-3xl z-10">
        <div className="mb-8 transform transition-transform duration-500 hover:scale-110">
            <i className="fas fa-clinic-medical text-8xl md:text-9xl opacity-90 text-pink-300"></i>
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-pink-300 via-white to-sky-300">
          AI Clinic Assistant
        </h1>
        <p className="text-xl md:text-2xl text-indigo-100 leading-relaxed max-w-xl mx-auto">
          Intelligent voice-powered booking and health information management.
          Supports English & Hindi.
        </p>
        <div>
          <button
            onClick={() => navigate('/login')} // Navigate to login first
            className="mt-10 bg-white text-indigo-700 font-bold py-4 px-12 rounded-lg shadow-2xl text-lg
                       transform transition-all duration-300 ease-in-out hover:scale-105 hover:bg-indigo-50 
                       focus:outline-none focus:ring-4 focus:ring-white/50"
          >
            Get Started <i className="fas fa-arrow-right ml-2 transition-transform group-hover:translate-x-1"></i>
          </button>
        </div>
      </div>
      <footer className="absolute bottom-8 text-center text-indigo-200 text-sm w-full z-10">
        <p>Experience seamless healthcare interaction.</p>
      </footer>
    </div>
  );
};

export default LandingPage;