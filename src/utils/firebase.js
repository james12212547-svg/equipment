import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDgjuwXGDk8ciAhSd27SN9H6-ognZZX-F8",
  authDomain: "engineering-hub-6fe27.firebaseapp.com",
  databaseURL: "https://engineering-hub-6fe27-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "engineering-hub-6fe27",
  storageBucket: "engineering-hub-6fe27.firebasestorage.app",
  messagingSenderId: "901955401455",
  appId: "1:901955401455:web:5acb4d35ee2783289c0d1a",
  measurementId: "G-1FXMYQ4D6C"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
