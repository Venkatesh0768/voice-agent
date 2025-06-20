import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { AppointmentTicket } from '../src/types/types'; // AppointmentStatus not used, can be removed
import AppointmentTicketCard from '../components/AppointmentTicketCard';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import { getUserAppointments } from "../src/services/firebaseService";

const UserAppointmentsPage: React.FC = () => {
  const auth = useContext(AuthContext);
  const [appointments, setAppointments] = useState<AppointmentTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- NEW: STATE FOR SCROLL-TO-TOP BUTTON VISIBILITY ---
  const [showScrollButton, setShowScrollButton] = useState(false);

  // --- NEW: EFFECT TO HANDLE SCROLL LISTENER ---
  useEffect(() => {
    const checkScrollTop = () => {
      // Show button if user has scrolled down more than 300px
      if (!showScrollButton && window.pageYOffset > 300) {
        setShowScrollButton(true);
      } else if (showScrollButton && window.pageYOffset <= 300) {
        setShowScrollButton(false);
      }
    };

    window.addEventListener('scroll', checkScrollTop);
    // Cleanup function to remove the listener when the component unmounts
    return () => window.removeEventListener('scroll', checkScrollTop);
  }, [showScrollButton]);

  // --- NEW: FUNCTION TO SCROLL TO THE TOP OF THE PAGE ---
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth' // for a smooth scrolling experience
    });
  };
  
  // Using the original data fetching logic
  const fetchUserAppointments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    if (!auth?.currentUser?.id) {
      setError("Please log in to view your appointments.");
      setIsLoading(false);
      return;
    }

    try {
      const userAppointments = await getUserAppointments(auth.currentUser.id);
      // Sort appointments by date here to ensure they are in sequence
      const sortedAppointments = userAppointments.sort(
        (a, b) => new Date(a.bookedAt).getTime() - new Date(b.bookedAt).getTime()
      );
      setAppointments(sortedAppointments);
    } catch (err) {
      console.error("Failed to load appointments:", err);
      setError(err instanceof Error ? err.message : "Failed to load your appointments. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [auth?.currentUser?.id]);

  useEffect(() => {
    fetchUserAppointments();
  }, [fetchUserAppointments]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-40">
          <LoadingSpinner size="lg" />
        </div>
      );
    }

    if (error) {
      return (
        <Modal isOpen={!!error} onClose={() => setError(null)} title="Error">
          <p className="text-red-600 text-center text-lg">{error}</p>
          <button onClick={() => setError(null)} className="mt-4 px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">Close</button>
        </Modal>
      );
    }

    if (appointments.length === 0) {
      return (
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <p className="text-xl text-gray-700">You have no appointments yet.</p>
          <p className="text-md text-gray-500 mt-2">Book a new appointment to get started!</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {appointments.map((ticket) => (
          <AppointmentTicketCard 
            key={ticket.id} 
            ticket={ticket}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-100">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 max-h-[85vh] overflow-y-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 text-center">My Appointments</h1>
        {renderContent()}
      </div>

      {/* --- NEW: SCROLL-TO-TOP BUTTON --- */}
      {showScrollButton && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 p-3 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition-transform transform hover:scale-110"
          aria-label="Scroll to top"
        >
          {/* Arrow Up Icon */}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default UserAppointmentsPage;