// Simple test to verify Firebase configuration
import { auth, db } from '../../firebaseConfig.js';

console.log('Firebase auth initialized:', auth !== undefined);
console.log('Firebase db initialized:', db !== undefined);

// This file can be run with Node.js to verify the Firebase configuration
// is working correctly. It should output true for both checks if the
// configuration is valid.