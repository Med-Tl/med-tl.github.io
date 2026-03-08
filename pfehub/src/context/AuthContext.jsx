import { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);       // Firebase user
  const [profile, setProfile] = useState(null); // Firestore profile (name, role, etc.)
  const [loading, setLoading] = useState(true);

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        await fetchProfile(firebaseUser.uid);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const fetchProfile = async (uid) => {
    try {
      const snap = await getDoc(doc(db, "users", uid));
      if (snap.exists()) {
        setProfile({ id: snap.id, ...snap.data() });
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  };

  // Register new user
  const register = async ({ name, email, password, role }) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });

    // Store extended profile in Firestore
    await setDoc(doc(db, "users", cred.user.uid), {
      name,
      email,
      role: role || "student",
      avatar: name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2),
      createdAt: serverTimestamp(),
    });

    await fetchProfile(cred.user.uid);
    return cred.user;
  };

  // Login
  const login = async ({ email, password }) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    await fetchProfile(cred.user.uid);
    return cred.user;
  };

  // Logout
  const logout = () => signOut(auth);

  // Password reset
  const resetPassword = (email) => sendPasswordResetEmail(auth, email);

  const value = {
    user,
    profile,
    loading,
    register,
    login,
    logout,
    resetPassword,
    isAdmin: profile?.role === "admin",
    isStudent: profile?.role === "student",
    refreshProfile: () => user && fetchProfile(user.uid),
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
