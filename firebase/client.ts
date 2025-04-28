import {initializeApp, getApp, getApps} from "firebase/app";
import {getAuth} from "firebase/auth";
import {getFirestore} from "firebase/firestore";


// Import the functions you need from the SDKs you need
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDqsIi44mKWQeg8euj-KHcV4zCJuHACqk4",
    authDomain: "ai-interviewer-d87be.firebaseapp.com",
    projectId: "ai-interviewer-d87be",
    storageBucket: "ai-interviewer-d87be.firebasestorage.app",
    messagingSenderId: "503235690196",
    appId: "1:503235690196:web:32e0352d3fc9dd51cb4541",
    measurementId: "G-RKQL76CYV3"
};

// Initialize Firebase
const app = !getApps.length? initializeApp(firebaseConfig): getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);