import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDZB8VfSe90M_JJoZe2GbZtk9j9gW3oQo4",
  authDomain: "encurtador-links-senai-jd.firebaseapp.com",
  projectId: "encurtador-links-senai-jd",
  storageBucket: "encurtador-links-senai-jd.firebasestorage.app",
  messagingSenderId: "482821299608",
  appId: "1:482821299608:web:865be815bc58bb82e75fed"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
