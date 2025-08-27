import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCpYlBn1tz2vIm3RRs--a8UOVBdFMsWb0A",
  authDomain: "proibe-notes.firebaseapp.com",
  projectId: "proibe-notes",
  storageBucket: "proibe-notes.firebasestorage.app",
  messagingSenderId: "1072957935503",
  appId: "1:1072957935503:web:425d6854d238ef9de585fa"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
