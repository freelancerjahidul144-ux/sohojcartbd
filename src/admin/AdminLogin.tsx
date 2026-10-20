import React, { useState } from 'react';
import {
  ShieldCheck,
  User as UserIcon,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowLeft,
  Loader2,
  KeyRound,
  HelpCircle,
  CheckCircle2,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../services/firebase';
import { useAuth, ADMIN_USERNAMES, ADMIN_PASSWORD } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { BrandLogo } from '../components/common/BrandLogo';

interface AdminLoginProps {
  onSuccess: () => void;
  onBackToStore: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onBackToStore }) => {
  const { loginWithAdminCredentials, loginWithGoogle } = useAuth();
  const { addToast } = useStore();

  const [identifier, setIdentifier] = useState('SOHOJCARTBDADMIN');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showHelpGuide, setShowHelpGuide] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!identifier.trim() || !password) {
      setErrorMessage('অনুগ্রহ করে অ্যাডমিন ইউজারনেম এবং পাসওয়ার্ড উভয়ই লিখুন।');
      return;
    }

    setLoading(true);
    try {
      await loginWithAdminCredentials(identifier.trim(), password);
      addToast('success', 'অ্যাডমিন লগইন সফল হয়েছে! ড্যাশবোর্ডে স্বাগতম।');
      onSuccess();
    } catch (err: any) {
      console.error('Admin login error:', err);
      let message = 'লগইন ব্যর্থ হয়েছে। ইউজারনেম অথবা পাসওয়ার্ড সঠিক কি না যাচাই করুন।';
      if (err?.message) {
        message = err.message;
      }
      setErrorMessage(message);
      addToast('error', message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = () => {
    setIdentifier('SOHOJCARTBDADMIN');
    setPassword('95335JAHIDULADMIN@@$$');
    setErrorMessage(null);
    setSuccessMessage('ইউজারনেম ও পাসওয়ার্ড পূরণ করা হয়েছে! এখন Sign In বাটনে চাপ দিন।');
  };

  const handleGoogleLogin = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setGoogleLoading(true);

    try {
      await loginWithGoogle();
      addToast('success', 'Google দিয়ে সফলভাবে অ্যাডমিন যাচাই সম্পন্ন হয়েছে!');
      onSuccess();
    } catch (err: any) {
      console.error('Admin Google signin error:', err);
      if (err?.code !== 'auth/popup-closed-by-user') {
        setErrorMessage(err?.message || 'Google দিয়ে সাইন-ইন সম্পন্ন করা যায়নি।');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const targetEmail = identifier.includes('@') ? identifier.trim() : 'freelancerjahidul144@gmail.com';
    setResetLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await sendPasswordResetEmail(auth, targetEmail);
      setSuccessMessage(`পাসওয়ার্ড রিসেট লিংকটি ${targetEmail}-এ পাঠানো হয়েছে। ইনবক্স অথবা স্প্যাম ফোল্ডার চেক করুন।`);
      addToast('success', 'Password reset email sent successfully.');
    } catch (err: any) {
      console.warn('Password reset notice:', err);
      setShowHelpGuide(true);
      setErrorMessage(
        'ইমেইলে রিসেট লিংক পাঠানো যায়নি। কোনো চিন্তা নেই! নিচের "স্বয়ংক্রিয় পূরণ" বাটন অথবা "Google দিয়ে লগইন" ব্যবহার করুন।'
      );
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B192C] flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-orange-500 selection:text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        {/* Header Official Brand Logo */}
        <div className="text-center space-y-4 flex flex-col items-center">
          <button
            onClick={onBackToStore}
            className="hover:opacity-95 transition-opacity"
            title="Sohoj Cart BD"
          >
            <BrandLogo variant="white" size="xl" />
          </button>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700/60 text-xs text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-orange-400" />
            <span className="font-semibold text-white">Official Admin Portal</span>
            <span className="text-slate-500">|</span>
            <span className="font-mono text-emerald-400">/admin/dashboard</span>
          </div>
        </div>

        {/* Login Card */}
        <div className="mt-6 bg-[#0f213a] border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
          {/* Error Banner if any */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {/* Success Banner if any */}
          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs flex items-start gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{successMessage}</div>
            </div>
          )}

          {/* Preset Fill Option */}
          <div className="bg-slate-950/80 border border-slate-700/80 rounded-2xl p-3 flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <p className="text-[11px] font-bold text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                <span>নির্ধারিত অ্যাডমিন ক্রেডেনশিয়াল</span>
              </p>
              <p className="text-[10px] text-slate-400 font-mono">
                Username: <span className="text-orange-400 font-bold">SOHOJCARTBDADMIN</span>
              </p>
            </div>
            <button
              type="button"
              onClick={handleQuickFill}
              className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold text-[11px] rounded-lg transition shrink-0 cursor-pointer shadow-sm"
            >
              স্বয়ংক্রিয় পূরণ
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Admin Username অথবা Email
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  autoComplete="username"
                  placeholder="SOHOJCARTBDADMIN"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 text-xs bg-slate-900/90 border border-slate-700 text-white rounded-xl focus:border-orange-500 focus:bg-slate-900 outline-hidden transition font-medium"
                />
                <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Password
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] text-slate-400 hover:text-orange-400 flex items-center gap-1 transition cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showPassword ? 'Hide' : 'Show'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={resetLoading}
                    className="text-[11px] text-orange-400 hover:underline font-semibold cursor-pointer"
                  >
                    {resetLoading ? 'পাঠানো হচ্ছে...' : 'পাসওয়ার্ড ভুলে গেছেন?'}
                  </button>
                </div>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="95335JAHIDULADMIN@@$$"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-900/90 border border-slate-700 text-white rounded-xl focus:border-orange-500 focus:bg-slate-900 outline-hidden transition"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs sm:text-sm rounded-xl transition shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2 active:scale-98 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>যাচাই করা হচ্ছে...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Sign In to Admin Dashboard</span>
                </>
              )}
            </button>
          </form>

          <div className="relative flex py-1 items-center">
            <div className="grow border-t border-slate-700/80"></div>
            <span className="shrink mx-3 text-[11px] text-slate-400 uppercase font-semibold">অথবা বিকল্প লগইন</span>
            <div className="grow border-t border-slate-700/80"></div>
          </div>

          {/* Fast Google Sign-in Option */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              className="w-full py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs sm:text-sm rounded-xl transition shadow-md flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
            >
              {googleLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
                  <span>Google এর মাধ্যমে যাচাই করা হচ্ছে...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                  <span>Google দিয়ে ১-ক্লিকে লগইন</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Help Guide Accordion */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowHelpGuide(!showHelpGuide)}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-700 text-xs text-slate-200 hover:bg-slate-800 transition cursor-pointer"
            >
              <span className="flex items-center gap-2 font-medium">
                <HelpCircle className="w-4 h-4 text-orange-400" />
                <span>লগইন তথ্য ও নিরাপত্তা নির্দেশনা</span>
              </span>
              <span className="text-orange-400 font-bold text-xs">
                {showHelpGuide ? 'লুকান ▲' : 'দেখুন ▼'}
              </span>
            </button>

            {showHelpGuide && (
              <div className="mt-2 p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2.5 animate-in fade-in">
                <p className="font-bold text-orange-400">আপনার অনুমোদিত অ্যাডমিন তথ্য:</p>
                <div className="space-y-1.5 text-[11px] text-slate-300 font-mono bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <p>
                    <span className="text-slate-400">Username: </span>
                    <strong className="text-white">SOHOJCARTBDADMIN</strong>
                  </p>
                  <p>
                    <span className="text-slate-400">Password: </span>
                    <strong className="text-emerald-400">95335JAHIDULADMIN@@$$</strong>
                  </p>
                  <p>
                    <span className="text-slate-400">Admin Email: </span>
                    <strong className="text-orange-300">freelancerjahidul144@gmail.com</strong>
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="text-center pt-1 border-t border-slate-800">
            <button
              type="button"
              onClick={onBackToStore}
              className="text-xs text-slate-400 hover:text-white transition inline-flex items-center gap-1.5 font-medium cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-orange-400" />
              <span>Return to Sohoj Cart BD Storefront</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
