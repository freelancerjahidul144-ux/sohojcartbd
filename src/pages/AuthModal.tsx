import React, { useState } from 'react';
import { X, Mail, Lock, User, ShieldCheck, Smartphone, KeyRound, CheckCircle2, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateAdmin?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onNavigateAdmin }) => {
  const { loginWithGoogle, loginWithEmail, registerWithEmail, sendPhoneOtp, loginWithPhone } = useAuth();
  const { addToast } = useStore();

  // Auth Method: 'phone' or 'email'
  const [authMethod, setAuthMethod] = useState<'phone' | 'email'>('phone');

  // Phone Auth State
  const [phone, setPhone] = useState('');
  const [phoneName, setPhoneName] = useState('');
  const [phoneOtp, setPhoneOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [simulatedSms, setSimulatedSms] = useState<string | null>(null);

  // Email Auth State
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // Handle Google Login
  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      addToast('success', 'গুগল দিয়ে সফলভাবে সাইন ইন হয়েছে (Signed in with Google)!');
      onClose();
    } catch (err: any) {
      addToast('error', err.message || 'গুগল সাইন-ইন সম্পন্ন হয়নি।');
    } finally {
      setLoading(false);
    }
  };

  // Handle Phone OTP Request
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.trim().replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      addToast('error', 'অনুগ্রহ করে সঠিক ১০/১১ ডিজিটের মোবাইল নাম্বার দিন (যেমন: 01712345678)');
      return;
    }

    setLoading(true);
    try {
      const res = await sendPhoneOtp(phone);
      setIsOtpSent(true);
      setSimulatedSms(res.otp);
      addToast('success', `আপনার নাম্বারে ৬ ডিজিটের ওটিপি কোড পাঠানো হয়েছে: ${res.otp}`);
    } catch (err: any) {
      addToast('error', err.message || 'ওটিপি পাঠাতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  // Handle Phone OTP Verification & Login
  const handleVerifyPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneOtp.trim()) {
      addToast('error', 'অনুগ্রহ করে আপনার ফোনে পাঠানো ৬ ডিজিটের ওটিপি কোড লিখুন।');
      return;
    }

    setLoading(true);
    try {
      const user = await loginWithPhone(phone, phoneOtp, phoneName);
      addToast('success', `স্বাগতম ${user.displayName || phone}! ফোন নাম্বার দিয়ে সফলভাবে লগইন হয়েছে।`);
      onClose();
    } catch (err: any) {
      addToast('error', err.message || 'ভুল ওটিপি কোড। অনুগ্রহ করে সঠিক কোড দিন।');
    } finally {
      setLoading(false);
    }
  };

  // Handle Email / Password Login & Register
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'register') {
        if (!name.trim()) throw new Error('Please enter your full name');
        await registerWithEmail(name, email, password);
        addToast('success', `স্বাগতম ${name}! একাউন্ট তৈরি সম্পন্ন হয়েছে।`);
      } else {
        await loginWithEmail(email, password);
        addToast('success', 'সফলভাবে লগইন হয়েছে!');
      }
      onClose();
    } catch (err: any) {
      addToast('error', err.message || 'ইমেইল অথবা পাসওয়ার্ড ভুল হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  const handleGoToAdmin = () => {
    onClose();
    if (onNavigateAdmin) onNavigateAdmin();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/70 backdrop-blur-xs">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-amber-400/20 text-amber-300 rounded-full text-[11px] font-bold mb-2">
            <span>সহজকার্ট বিডি কাস্টমার পোর্টাল</span>
          </div>
          <h2 className="text-xl font-black tracking-tight text-white">
            কাস্টমার একাউন্ট সাইন-ইন
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            গুগল, ফোন নাম্বার অথবা ইমেইল দিয়ে সহজে লগইন করুন।
          </p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
          {/* 1. Google Sign-in Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-2xl text-xs font-black text-slate-800 transition shadow-2xs cursor-pointer group"
          >
            <svg className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>গুগল দিয়ে ১-ক্লিকে সাইন ইন (Continue with Google)</span>
          </button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full"></div>
            <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              অথবা সরাসরি সাইন ইন
            </span>
          </div>

          {/* Auth Method Selector Tabs: Phone vs Email */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setAuthMethod('phone');
                setIsOtpSent(false);
              }}
              className={`py-2 text-xs font-black rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
                authMethod === 'phone'
                  ? 'bg-white text-slate-950 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 text-amber-500" />
              <span>ফোন নাম্বার (Phone)</span>
            </button>

            <button
              type="button"
              onClick={() => setAuthMethod('email')}
              className={`py-2 text-xs font-black rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
                authMethod === 'email'
                  ? 'bg-white text-slate-950 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Mail className="w-3.5 h-3.5 text-blue-500" />
              <span>ইমেইল ও পাসওয়ার্ড</span>
            </button>
          </div>

          {/* A. PHONE NUMBER SIGN-IN FLOW */}
          {authMethod === 'phone' && (
            <div className="space-y-3.5">
              {!isOtpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      আপনার নাম (নতুন কাস্টমারদের জন্য)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="যেমন: তানভীর আহমেদ"
                        value={phoneName}
                        onChange={(e) => setPhoneName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-300 text-slate-900 rounded-xl focus:border-amber-500 outline-hidden font-medium"
                      />
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      মোবাইল নাম্বার (Phone Number) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs font-bold text-slate-600 font-mono border-r border-slate-300 pr-2">
                        <span>🇧🇩</span>
                        <span>+880</span>
                      </div>
                      <input
                        type="tel"
                        required
                        autoFocus
                        placeholder="01712-345678"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-22 pr-3 py-2.5 text-xs bg-slate-50 border-2 border-slate-300 text-slate-900 rounded-xl focus:border-amber-500 outline-hidden font-mono font-bold"
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 font-medium">
                      এই নাম্বারে ৬ ডিজিটের তাৎক্ষণিক ভেরিফিকেশন ওটিপি কোড পাঠানো হবে।
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-amber-400 hover:bg-amber-500 active:scale-98 text-slate-950 font-black text-xs rounded-xl transition shadow-md shadow-amber-400/20 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>{loading ? 'কোড পাঠানো হচ্ছে...' : 'ওটিপি কোড পাঠান (Send OTP)'}</span>
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyPhoneOtp} className="space-y-3 animate-in fade-in">
                  {/* Simulated Incoming SMS Alert Banner */}
                  {simulatedSms && (
                    <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-3 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black text-amber-900 flex items-center gap-1.5">
                          <Smartphone className="w-3.5 h-3.5 text-amber-600" />
                          <span>আপনার ফোনে প্রাপ্ত SMS ভেরিফিকেশন কোড:</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setPhoneOtp(simulatedSms)}
                          className="text-[10px] bg-amber-200 hover:bg-amber-300 text-amber-900 font-black px-2 py-0.5 rounded cursor-pointer"
                        >
                          কোড বসান (Auto Fill)
                        </button>
                      </div>
                      <div className="flex items-center justify-between bg-white px-3 py-1.5 rounded-lg border border-amber-200">
                        <span className="font-mono font-black text-sm text-slate-950 tracking-widest">{simulatedSms}</span>
                        <span className="text-[10px] text-slate-500 font-medium">{phone} নাম্বারে প্রেরিত</span>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      ফোনে প্রাপ্ত ৬-ডিজিটের কোড দিন (Enter OTP)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        maxLength={6}
                        required
                        autoFocus
                        placeholder="••••••"
                        value={phoneOtp}
                        onChange={(e) => setPhoneOtp(e.target.value.replace(/\D/g, ''))}
                        className="w-full text-center tracking-[0.5em] text-lg font-mono font-black py-2.5 bg-slate-50 border-2 border-slate-300 text-slate-950 rounded-xl focus:border-amber-500 outline-hidden"
                      />
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black text-xs rounded-xl transition shadow-md shadow-emerald-600/30 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{loading ? 'যাচাই করা হচ্ছে...' : 'লগইন নিশ্চিত করুন (Verify & Login)'}</span>
                  </button>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => setIsOtpSent(false)}
                      className="text-xs text-slate-500 hover:text-slate-800 font-bold cursor-pointer"
                    >
                      ← নাম্বার পরিবর্তন করুন
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleSendOtp(e)}
                      className="text-xs text-amber-600 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>পুনরায় পাঠান</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* B. EMAIL & PASSWORD FLOW */}
          {authMethod === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-3">
              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">পুরো নাম (Full Name)</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="e.g. Tanvir Ahmed"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 text-slate-900 rounded-xl focus:border-amber-500 outline-hidden font-medium"
                    />
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">ইমেইল এড্রেস (Email / Gmail)</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="name@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 text-slate-900 rounded-xl focus:border-amber-500 outline-hidden font-medium"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">পাসওয়ার্ড (Password)</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 text-slate-900 rounded-xl focus:border-amber-500 outline-hidden font-mono"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl transition shadow-md cursor-pointer"
              >
                {loading ? 'অপেক্ষা করুন...' : mode === 'login' ? 'ইমেইল দিয়ে সাইন ইন' : 'নতুন একাউন্ট তৈরি করুন'}
              </button>

              {/* Toggle mode */}
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                  className="text-xs text-amber-700 hover:underline font-bold cursor-pointer"
                >
                  {mode === 'login'
                    ? "একাউন্ট নেই? নতুন একাউন্ট খুলতে এখানে ক্লিক করুন"
                    : 'ইতিমধ্যে একাউন্ট আছে? সাইন ইন করতে ক্লিক করুন'}
                </button>
              </div>
            </form>
          )}

          {/* Admin Portal Link */}
          <div className="pt-3 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={handleGoToAdmin}
              className="text-xs font-black text-slate-600 hover:text-amber-600 transition flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-amber-500" />
              <span>স্টোর অ্যাডমিনিস্ট্রেটর পোর্টাল সাইন-ইন (Admin Panel)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
