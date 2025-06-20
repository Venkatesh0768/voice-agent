import { User, AppointmentTicket } from '../src/types/types';

// Keep keys consistent but their usage changes
export const LOCAL_STORAGE_USER_KEY = 'clinicCurrentUser_v2';
export const LOCAL_STORAGE_TOKEN_KEY = 'clinicAuthToken_v2';
export const LOCAL_STORAGE_APPOINTMENTS_KEY = 'clinicAppointments_v2';

// --- Auth Session Management ---

export const saveAuthSession = (user: User, token: string): void => {
  try {
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(user));
    localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, token);
  } catch (error) {
    console.error("Error saving auth session to localStorage:", error);
  }
};

export const getAuthSession = (): { user: User | null; token: string | null } => {
  try {
    const user = JSON.parse(localStorage.getItem(LOCAL_STORAGE_USER_KEY) || 'null');
    const token = localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY);
    return { user, token };
  } catch (error) {
    console.error("Error retrieving auth session from localStorage:", error);
    return { user: null, token: null };
  }
};

export const clearAuthSession = (): void => {
  try {
    localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
    localStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY);
  } catch (error) {
    console.error("Error clearing auth session from localStorage:", error);
  }
};

export const saveAppointmentTickets = (appointments: AppointmentTicket[]): void => {
  localStorage.setItem(LOCAL_STORAGE_APPOINTMENTS_KEY, JSON.stringify(appointments));
};

export const getAppointmentTickets = (): AppointmentTicket[] => {
  const appointments = localStorage.getItem(LOCAL_STORAGE_APPOINTMENTS_KEY);
  return appointments ? JSON.parse(appointments) : [];
};

// Note: The previous functions for managing all users (getUsers, saveUsers) and 
// all appointments (getAppointmentTickets, saveAppointmentTicket, updateAppointmentTicketInStorage)
// are removed from here. That data will now be managed by the backend and accessed 
// via apiService.ts. This service solely focuses on client-side session persistence.
// The initial default admin creation logic is also removed as user creation will be handled by the backend.
