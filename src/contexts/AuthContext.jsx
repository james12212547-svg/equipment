import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../utils/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null); // 'admin' | 'technician'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        try {
          // Fetch user role from Firestore (users collection)
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role);
          } else {
            // Default role if not found
            setUserRole('technician');
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
          setUserRole('technician'); // Fallback
        }
      } else {
        setCurrentUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('เข้าสู่ระบบสำเร็จ');
    } catch (error) {
      console.error(error);
      toast.error('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      toast.success('ออกจากระบบแล้ว');
    } catch (error) {
      console.error(error);
    }
  };

  const value = {
    currentUser,
    userRole,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
