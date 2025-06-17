import React from 'react';
import { AppointmentTicket, Language, AppointmentStatus } from "../src/types/types";

interface AppointmentTicketCardProps {
  ticket: AppointmentTicket;
  showAdminActions?: boolean;
  onApprove?: (ticketId: string) => void;
  onReject?: (ticketId: string) => void;
}

const AppointmentTicketCard: React.FC<AppointmentTicketCardProps> = ({
  ticket,
  showAdminActions = false,
  onApprove,
  onReject
}) => {
  const lang = ticket.language === Language.HINDI ? 'हिन्दी' : 'English';

  const getStatusClass = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.APPROVED:
        return 'bg-green-100 text-green-700';
      case AppointmentStatus.REJECTED:
        return 'bg-red-100 text-red-700';
      case AppointmentStatus.PENDING:
      default:
        return 'bg-yellow-100 text-yellow-700';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-xl font-semibold text-indigo-700">Appointment Details</h2>
          <p className="text-xs text-gray-500">Ticket ID: {ticket.id}</p>
        </div>
        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusClass(ticket.status)}`}>
          {ticket.status.toUpperCase()}
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm text-gray-700 mb-4">
        <p><strong className="font-medium text-gray-900">Name:</strong> {ticket.patientData.name || 'N/A'}</p>
        <p><strong className="font-medium text-gray-900">Age:</strong> {ticket.patientData.age || 'N/A'}</p>
        <p><strong className="font-medium text-gray-900">Gender:</strong> {ticket.patientData.gender || 'N/A'}</p>
        <p><strong className="font-medium text-gray-900">Phone:</strong> {ticket.patientData.phone || 'N/A'}</p>
        <p className="md:col-span-2"><strong className="font-medium text-gray-900">Symptoms:</strong> {ticket.patientData.symptoms || 'N/A'}</p>
        <p><strong className="font-medium text-gray-900">Language:</strong> {lang}</p>
        <p><strong className="font-medium text-gray-900">Slot:</strong> {ticket.appointmentTime}</p>
        <p><strong className="font-medium text-gray-900">Booked:</strong> {new Date(ticket.bookedAt).toLocaleString()}</p>
        {ticket.updatedAt && <p><strong className="font-medium text-gray-900">Last Update:</strong> {new Date(ticket.updatedAt).toLocaleString()}</p>}
         {showAdminActions && ticket.userId && <p className="md:col-span-2"><strong className="font-medium text-gray-900">User ID:</strong> {ticket.userId}</p>}
      </div>

      <div className="text-xs text-gray-500 mt-4 border-t pt-3">
        <p>Please arrive 15 minutes before your scheduled time.</p>
        {ticket.language === Language.HINDI && <p>कृपया अपने निर्धारित समय से 15 मिनट पहले पहुंचें।</p>}
      </div>

      {showAdminActions && onApprove && onReject && ticket.status === AppointmentStatus.PENDING && (
        <div className="mt-4 pt-4 border-t flex space-x-2 justify-end">
          <button
            onClick={() => onApprove(ticket.id)}
            className="px-4 py-2 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            <i className="fas fa-check mr-1"></i> Approve
          </button>
          <button
            onClick={() => onReject(ticket.id)}
            className="px-4 py-2 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            <i className="fas fa-times mr-1"></i> Reject
          </button>
        </div>
      )}
    </div>
  );
};

export default AppointmentTicketCard;