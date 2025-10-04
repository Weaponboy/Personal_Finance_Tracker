import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDiX9rqHOTAlQMMQuv8AP2rrCSZYvSX_Qc",
    authDomain: "personal-finance-b80ef.firebaseapp.com",
    projectId: "personal-finance-b80ef",
    storageBucket: "personal-finance-b80ef.firebasestorage.app",
    messagingSenderId: "872443799852",
    appId: "1:872443799852:web:ed7a0e04b2d0591108a489",
    measurementId: "G-TNH822382E"
};

export const app = initializeApp(firebaseConfig);
export const fireStoreDB = getFirestore(app);

const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
});

export { auth };

