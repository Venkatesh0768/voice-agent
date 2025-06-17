import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { AppointmentTicket, AppointmentStatus } from '../types';
import AppointmentTicketCard from '../components/AppointmentTicketCard';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import { getUserAppointments } from "../src/services/firebaseService";

const UserAppointmentsPage: React.FC = () => {
  const auth = useContext(AuthContext);
  const [appointments, setAppointments] = useState<AppointmentTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserAppointments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    if (!auth?.currentUser) {
      setError("Please log in to view your appointments.");
      setIsLoading(false);
      return;
    }

    if (!auth.currentUser.id) {
      setError("User ID not found. Please try logging in again.");
      setIsLoading(false);
      return;
    }

    try {
      const userAppointments = await getUserAppointments(auth.currentUser.id);
      setAppointments(userAppointments);
    } catch (err) {
      console.error("Failed to load appointments:", err);
      setError(err instanceof Error ? err.message : "Failed to load your appointments. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [auth?.currentUser]);

  useEffect(() => {
    fetchUserAppointments();
  }, [fetchUserAppointments]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-full">
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
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 flex-grow">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">My Appointments</h1>
      {renderContent()}
    </div>
  );
};

export default UserAppointmentsPage;

