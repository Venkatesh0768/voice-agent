import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { AppointmentTicket, AppointmentStatus, UserRole } from '../src/types/types';
import AppointmentTicketCard from '../components/AppointmentTicketCard';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import { getAllAppointments, updateAppointmentStatus } from "../src/services/firebaseService";

const AdminDashboardPage: React.FC = () => {
  const auth = useContext(AuthContext);
  const [appointments, setAppointments] = useState<AppointmentTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllAppointments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    console.log("AuthContext currentUser in AdminDashboardPage:", auth?.currentUser);

    try {
      const allAppointments = await getAllAppointments();
      setAppointments(allAppointments);
    } catch (err) {
      console.error("Failed to load appointments:", err);
      setError("Failed to load appointments. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [auth?.currentUser]);

  useEffect(() => {
    fetchAllAppointments();
  }, [fetchAllAppointments]);

  const handleApprove = useCallback(async (ticketId: string) => {
    try {
      await updateAppointmentStatus(ticketId, AppointmentStatus.APPROVED);
      await fetchAllAppointments(); // Refresh the list after update
    } catch (err) {
      console.error("Failed to approve appointment:", err);
      setError("Failed to approve appointment. Please try again.");
    }
  }, [fetchAllAppointments]);

  const handleReject = useCallback(async (ticketId: string) => {
    try {
      await updateAppointmentStatus(ticketId, AppointmentStatus.REJECTED);
      await fetchAllAppointments(); // Refresh the list after update
    } catch (err) {
      console.error("Failed to reject appointment:", err);
      setError("Failed to reject appointment. Please try again.");
    }
  }, [fetchAllAppointments]);

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
          <p className="text-xl text-gray-700">No appointments found.</p>
          <p className="text-md text-gray-500 mt-2">Patients can book appointments from the dashboard.</p>
        </div>
      );
    }

    // Separate pending, approved, and rejected appointments for display
    const pendingAppointments = appointments.filter(a => a.status === AppointmentStatus.PENDING);
    const approvedAppointments = appointments.filter(a => a.status === AppointmentStatus.APPROVED);
    const rejectedAppointments = appointments.filter(a => a.status === AppointmentStatus.REJECTED);

    return (
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-bold text-yellow-700 mb-4">Pending Appointments ({pendingAppointments.length})</h2>
          {pendingAppointments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingAppointments.map((ticket) => (
                <AppointmentTicketCard
                  key={ticket.id}
                  ticket={ticket}
                  showAdminActions={true}
                  onApprove={handleApprove}
                  onReject={handleReject}
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No pending appointments.</p>
          )}
        </section>

        <section>
          <h2 className="text-2xl font-bold text-green-700 mb-4">Approved Appointments ({approvedAppointments.length})</h2>
          {approvedAppointments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {approvedAppointments.map((ticket) => (
                <AppointmentTicketCard key={ticket.id} ticket={ticket} />
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No approved appointments.</p>
          )}
        </section>

        <section>
          <h2 className="text-2xl font-bold text-red-700 mb-4">Rejected Appointments ({rejectedAppointments.length})</h2>
          {rejectedAppointments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rejectedAppointments.map((ticket) => (
                <AppointmentTicketCard key={ticket.id} ticket={ticket} />
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No rejected appointments.</p>
          )}
        </section>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 flex-grow max-h-[80vh] overflow-y-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Admin Dashboard</h1>
      {renderContent()}
    </div>
  );
};

export default AdminDashboardPage;
