
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

export const firebaseConfig = {
  apiKey: "AIzaSyBCBzidQybmv8MPRiPAqSGUHKaEutfGlho",
  authDomain: "tucancha-1dfe2.firebaseapp.com",
  projectId: "tucancha-1dfe2",
  storageBucket: "tucancha-1dfe2.firebasestorage.app",
  messagingSenderId: "664108191627",
  appId: "1:664108191627:web:3e0eac4be17ac4c4aae98e",
  measurementId: "G-G7B47GVKMN"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
