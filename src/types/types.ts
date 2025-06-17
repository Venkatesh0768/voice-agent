export enum UserRole {
  PATIENT = 'PATIENT',
  ADMIN = 'ADMIN'
}

export enum Language {
  ENGLISH = 'ENGLISH',
  HINDI = 'HINDI'
}

export enum AppointmentStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface User {
  id: string;
  name?: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface PatientData {
  name: string;
  email: string;
  phone: string;
  age: number;
  gender: string;
  symptoms: string;
  severity: string;
}

export interface AppointmentTicket {
  id: string;
  userId: string;
  patientData: PatientData;
  appointmentTime: string;
  language: string;
  status: AppointmentStatus;
  bookedAt: string;
  createdAt: string;
  updatedAt: string;
} 