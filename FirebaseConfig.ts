import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDiX9rqHOTAlQMMQuv8AP2rrCSZYvSX_Qc",
    authDomain: "personal-finance-b80ef.firebaseapp.com",
    projectId: "personal-finance-b80ef",
    storageBucket: "personal-finance-b80ef.firebasestorage.app",
    messagingSenderId: "872443799852",
    appId: "1:872443799852:web:ed7a0e04b2d0591108a489",
    measurementId: "G-TNH822382E"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const fireStoreDB = getFirestore(app);