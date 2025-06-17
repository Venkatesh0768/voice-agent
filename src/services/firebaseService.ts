import { User, UserRole, AppointmentTicket, AppointmentStatus } from '../types/types';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  query,
  where,
  Timestamp
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const convertFirestoreTimestampToISOString = (timestamp: any): string => {
  if (timestamp && typeof timestamp.toDate === 'function') {
    return timestamp.toDate().toISOString();
  }
  return timestamp || new Date().toISOString();
};

// Auth functions
export const signUp = async (email: string, password: string, role: UserRole, name: string): Promise<User> => {
  try {
    // Prevent admin signup
    if (role === UserRole.ADMIN) {
      throw new Error('Admin accounts cannot be created through signup');
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user: User = {
      id: userCredential.user.uid,
      email: userCredential.user.email || '',
      role: UserRole.PATIENT,
      createdAt: new Date().toISOString(),
      name: name
    };
    
    console.log("User object before adding to Firestore:", user);
    
    // Store additional user data in Firestore
    await addDoc(collection(db, 'users'), user);
    return user;
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
};

export const signIn = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userDoc = await getDocs(query(collection(db, 'users'), where('id', '==', userCredential.user.uid)));
    
    if (userDoc.empty) {
      throw new Error('User data not found');
    }
    
    const userData = userDoc.docs[0].data();
    console.log("User data fetched from Firestore in firebaseService.ts signIn:", userData);
    
    return {
      id: userCredential.user.uid,
      email: userData.email || '',
      role: userData.role || UserRole.PATIENT,
      createdAt: userData.createdAt || new Date().toISOString(),
      name: userData.name || '',
    } as User;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};

export const fetchUserData = async (uid: string): Promise<User | null> => {
  try {
    const userDoc = await getDocs(query(collection(db, 'users'), where('id', '==', uid)));
    if (userDoc.empty) {
      return null;
    }
    const userData = userDoc.docs[0].data();
    return {
      id: uid,
      email: userData.email || '',
      role: userData.role || UserRole.PATIENT,
      createdAt: userData.createdAt || new Date().toISOString(),
      name: userData.name || '',
    } as User;
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
};

export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Appointment functions
export const createAppointment = async (appointment: Omit<AppointmentTicket, 'id'>): Promise<AppointmentTicket> => {
  try {
    const docRef = await addDoc(collection(db, 'appointments'), {
      ...appointment,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    
    return {
      ...appointment,
      id: docRef.id
    };
  } catch (error) {
    console.error('Error creating appointment:', error);
    throw error;
  }
};

export const updateAppointmentStatus = async (
  appointmentId: string,
  status: AppointmentStatus
): Promise<void> => {
  try {
    const appointmentRef = doc(db, 'appointments', appointmentId);
    await updateDoc(appointmentRef, {
      status,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating appointment status:', error);
    throw error;
  }
};

export const getUserAppointments = async (userId: string): Promise<AppointmentTicket[]> => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const appointmentsQuery = query(
      collection(db, 'appointments'),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(appointmentsQuery);
    return querySnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      createdAt: convertFirestoreTimestampToISOString(doc.data().createdAt),
      updatedAt: convertFirestoreTimestampToISOString(doc.data().updatedAt),
      bookedAt: convertFirestoreTimestampToISOString(doc.data().bookedAt),
    })) as AppointmentTicket[];
  } catch (error) {
    console.error('Error fetching user appointments:', error);
    throw error;
  }
};

export const getAllAppointments = async (): Promise<AppointmentTicket[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'appointments'));
    return querySnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      createdAt: convertFirestoreTimestampToISOString(doc.data().createdAt),
      updatedAt: convertFirestoreTimestampToISOString(doc.data().updatedAt),
      bookedAt: convertFirestoreTimestampToISOString(doc.data().bookedAt),
    })) as AppointmentTicket[];
  } catch (error) {
    console.error('Error fetching all appointments:', error);
    throw error;
  }
}; 