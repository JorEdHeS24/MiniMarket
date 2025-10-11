
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAZM5hlZaDXdb8GJ3N3eTxAIXZg0QEVyhw",
  authDomain: "minimarketfinal.firebaseapp.com",
  projectId: "minimarketfinal",
  storageBucket: "minimarketfinal.firebasestorage.app",
  messagingSenderId: "603402302869",
  appId: "1:603402302869:web:0717dab3208164350bf29c",
  measurementId: "G-D4R5XVG1PK"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
