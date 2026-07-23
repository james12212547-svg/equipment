import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../utils/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null); // 'admin' | 'technician'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Safety fallback timeout: Never stay in loading state forever if Firebase hangs
    const fallbackTimer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      clearTimeout(fallbackTimer);
      if (user) {
        setCurrentUser(user);
        try {
          // Fetch user role from Firestore (try 'users' first, then 'user')
          let userDoc = await getDoc(doc(db, 'users', user.uid));
          if (!userDoc.exists()) {
            userDoc = await getDoc(doc(db, 'user', user.uid));
          }
          
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role);
          } else {
            // Document doesn't exist, create it in 'users' collection as technician
            const newUserDoc = {
              email: user.email,
              role: 'technician',
              createdAt: new Date().toISOString()
            };
            await setDoc(doc(db, 'users', user.uid), newUserDoc);
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

    return () => {
      clearTimeout(fallbackTimer);
      unsubscribe();
    };
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
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-primary, #0F172A)',
          color: 'var(--text-primary, #F8FAFC)'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid rgba(255,255,255,0.1)',
            borderTop: '4px solid #0080FF',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          <p style={{ marginTop: '1rem', color: '#94A3B8', fontSize: '0.9rem' }}>กำลังโหลดระบบวิศวกรรม...</p>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};
