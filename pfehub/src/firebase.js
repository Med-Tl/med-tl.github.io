import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBJUIJPsO2xbafv0-LygN7Zo3n9NcwgI6Y",
  authDomain: "pfe26-41918.firebaseapp.com",
  projectId: "pfe26-41918",
  storageBucket: "pfe26-41918.firebasestorage.app",
  messagingSenderId: "790173347722",
  appId: "1:790173347722:web:7b53b6897f7266130a2273",
  measurementId: "G-ET85C0TF37",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

export default app;
