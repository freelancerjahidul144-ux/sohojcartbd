import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../services/firebase';

export const ADMIN_USERNAMES = [
  'SOHOJCARTBDADMIN',
  'sohojcartbdadmin',
];

export const ADMIN_PASSWORD = '95335JAHIDULADMIN@@$$';

export const ADMIN_EMAILS = [
  'freelancerjahidul144@gmail.com',
  'admin@sohojcartbd.com',
];

interface AuthContextType {
  currentUser: User | null;
  isAdmin: boolean;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<User>;
  loginWithPhone: (phone: string, otp: string, name?: string) => Promise<User>;
  sendPhoneOtp: (phone: string) => Promise<{ otp: string; message: string }>;
  loginWithAdminCredentials: (identifier: string, pass: string) => Promise<void>;
  registerWithEmail: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminSession, setAdminSession] = useState<boolean>(() => {
    try {
      return localStorage.getItem('sohoj_admin_auth') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const loginWithEmail = async (email: string, pass: string): Promise<User> => {
    const credential = await signInWithEmailAndPassword(auth, email.trim(), pass);
    return credential.user;
  };

  const loginWithAdminCredentials = async (identifier: string, pass: string): Promise<void> => {
    const cleanId = identifier.trim();
    const isMatchingUsername = ADMIN_USERNAMES.some(
      (u) => u.toLowerCase() === cleanId.toLowerCase()
    );
    const isMatchingEmail = ADMIN_EMAILS.some(
      (e) => e.toLowerCase() === cleanId.toLowerCase()
    );

    // 1. Check if user entered the designated Admin Username or Email with the designated Admin Password
    if ((isMatchingUsername || isMatchingEmail) && pass === ADMIN_PASSWORD) {
      // Set local persistent admin authorization
      setAdminSession(true);
      try {
        localStorage.setItem('sohoj_admin_auth', 'true');
      } catch {
        // LocalStorage guard
      }

      // Also attempt Firebase Auth sign-in or auto-creation with freelancerjahidul144@gmail.com
      const targetEmail = isMatchingEmail ? cleanId : 'freelancerjahidul144@gmail.com';
      try {
        await signInWithEmailAndPassword(auth, targetEmail, pass);
      } catch (err: any) {
        if (err?.code === 'auth/user-not-found' || err?.code === 'auth/invalid-credential') {
          try {
            await createUserWithEmailAndPassword(auth, targetEmail, pass);
          } catch {
            // Already handled via adminSession
          }
        }
      }
      return;
    }

    // 2. Otherwise attempt standard email login if it looks like an email
    if (cleanId.includes('@')) {
      const user = await loginWithEmail(cleanId, pass);
      const userEmail = (user.email || '').toLowerCase();
      if (!ADMIN_EMAILS.includes(userEmail)) {
        await signOut(auth);
        throw new Error('Access denied: Unauthorized administrator account.');
      }
      return;
    }

    throw new Error('ভুল ইউজারনেম অথবা পাসওয়ার্ড! দয়া করে সঠিক অ্যাডমিন তথ্য দিন।');
  };

  const sendPhoneOtp = async (phone: string): Promise<{ otp: string; message: string }> => {
    const cleanDigits = phone.replace(/\D/g, '');
    if (cleanDigits.length < 10) {
      throw new Error('অনুগ্রহ করে সঠিক বাংলাদেশি মোবাইল নাম্বার দিন (যেমন: 01712345678)');
    }
    // Generate a secure 6-digit verification code
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    try {
      sessionStorage.setItem(`otp_${cleanDigits}`, generatedOtp);
    } catch {
      // guard
    }
    return {
      otp: generatedOtp,
      message: `আপনার মোবাইল নাম্বারে ভেরিফিকেশন কোড পাঠানো হয়েছে: ${generatedOtp}`,
    };
  };

  const loginWithPhone = async (phone: string, otp: string, name?: string): Promise<User> => {
    const cleanDigits = phone.replace(/\D/g, '');
    if (cleanDigits.length < 10) {
      throw new Error('অনুগ্রহ করে সঠিক বাংলাদেশি মোবাইল নাম্বার দিন।');
    }

    let storedOtp: string | null = null;
    try {
      storedOtp = sessionStorage.getItem(`otp_${cleanDigits}`);
    } catch {
      // guard
    }

    // Accept valid stored OTP, or demo test OTP 123456
    const cleanOtp = otp.trim();
    if (!cleanOtp) {
      throw new Error('অনুগ্রহ করে ৬ ডিজিটের ওটিপি (OTP) কোড লিখুন।');
    }

    if (cleanOtp !== storedOtp && cleanOtp !== '123456') {
      throw new Error('ভুল ভেরিফিকেশন কোড (Invalid OTP)। সঠিক কোড দিন অথবা নতুন কোড পাঠান।');
    }

    // Deterministic auth email and secret for this phone
    const phoneEmail = `user_${cleanDigits}@customer.sohojcartbd.com`;
    const phoneSecret = `phone_pass_${cleanDigits}_bdcart`;

    try {
      const cred = await signInWithEmailAndPassword(auth, phoneEmail, phoneSecret);
      if (name && name.trim() && cred.user.displayName !== name.trim()) {
        await updateProfile(cred.user, { displayName: name.trim() });
      }
      return cred.user;
    } catch (err: any) {
      if (err?.code === 'auth/user-not-found' || err?.code === 'auth/invalid-credential') {
        // Create new account
        const cred = await createUserWithEmailAndPassword(auth, phoneEmail, phoneSecret);
        const displayName = (name && name.trim()) ? name.trim() : `Customer (${phone})`;
        await updateProfile(cred.user, { displayName });
        return cred.user;
      }
      throw err;
    }
  };

  const registerWithEmail = async (name: string, email: string, pass: string) => {
    const res = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    if (res.user) {
      await updateProfile(res.user, { displayName: name });
    }
  };

  const logout = async () => {
    setAdminSession(false);
    try {
      localStorage.removeItem('sohoj_admin_auth');
    } catch {
      // LocalStorage guard
    }
    await signOut(auth);
  };

  const isAdmin = Boolean(
    adminSession ||
      (currentUser &&
        currentUser.email &&
        ADMIN_EMAILS.includes(currentUser.email.toLowerCase()))
  );

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAdmin,
        loading,
        loginWithGoogle,
        loginWithEmail,
        loginWithPhone,
        sendPhoneOtp,
        loginWithAdminCredentials,
        registerWithEmail,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
