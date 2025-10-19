import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export const firebaseConfig = {
  "projectId": "studio-4940927620-c4e90",
  "appId": "1:424747215465:web:4ca1009750bc6fc50650f8",
  "apiKey": "AIzaSyAqfhoMTXk1wx57snyYUCOypdAhBS9X5pg",
  "authDomain": "studio-4940927620-c4e90.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "424747215465"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;
