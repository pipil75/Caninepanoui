// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDdBy7wigBeXHbL4o9_2Q9Lcl1Tcbrnsto",
  authDomain: "april-cfce5.firebaseapp.com",
  databaseURL:
    "https://april-cfce5-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "april-cfce5",
  storageBucket: "april-cfce5.appspot.com",
  messagingSenderId: "859419938124",
  appId: "1:859419938124:web:9d8874f74610938477d3e9",
  measurementId: "G-274LZXS5W8",
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
export const database = getDatabase(app);
export const auth = getAuth(app);
