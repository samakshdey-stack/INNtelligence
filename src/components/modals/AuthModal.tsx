import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Shield, 
  ShieldCheck, 
  Lock, 
  UserCheck, 
  LogOut, 
  CheckCircle2, 
  Sparkles, 
  Building2, 
  KeyRound,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { isAuthCancelledError, formatAuthErrorMessage } from '../../lib/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onProceedToOperations?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onProceedToOperations,
}) => {
  const { user, userProfile, role, setRole, loginWithGoogle, logout, loading } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleProceed = () => {
    if (onProceedToOperations) {
      onProceedToOperations();
    } else if (onSuccess) {
      onSuccess();
    } else {
      onClose();
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoggingIn(true);
      setErrorMsg(null);
      await loginWithGoogle();
      if (onProceedToOperations) {
        onProceedToOperations();
      } else if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      if (isAuthCancelledError(err)) {
        setErrorMsg('Google sign-in was closed before completion. Click below whenever you want to try again.');
      } else {
        console.error('Login error:', err);
        setErrorMsg(formatAuthErrorMessage(err));
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err: any) {
      console.error('Logout error:', err);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', duration: 0.35, bounce: 0.1 }}
          className="relative w-full max-w-md bg-[#0F1015] border border-amber-500/30 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden z-10 text-white"
        >
          {/* Top Gold Accent Bar */}
          <div className="h-1 w-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/40 hover:text-white rounded-full hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Header / Brand */}
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(212,158,55,0.2)]">
                <KeyRound className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-serif font-bold text-white tracking-wide">
                Staff Authentication
              </h2>
              <p className="text-xs font-mono uppercase tracking-widest text-amber-300/80">
                INNtelligence Identity Portal
              </p>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {user ? (
              /* Authenticated View */
              <div className="space-y-5">
                <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 flex items-center gap-3.5">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'Staff'}
                      className="w-12 h-12 rounded-full border border-amber-500/40 object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center font-bold text-base">
                      {(user.displayName || user.email || 'U')[0].toUpperCase()}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-sm text-white truncate">
                        {user.displayName || 'Staff Member'}
                      </h4>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Verified
                      </span>
                    </div>
                    <p className="text-xs text-white/50 truncate font-mono">
                      {user.email}
                    </p>
                  </div>
                </div>

                {/* Role Switcher */}
                <div className="space-y-2">
                  <label className="block text-xs font-mono uppercase tracking-wider text-white/60">
                    Hospitality Clearance Level
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['General Manager', 'Front Desk', 'Owner', 'Department Head'] as UserRole[]).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRole(r)}
                        className={`p-2.5 rounded-xl border text-xs font-medium text-left transition-all cursor-pointer flex items-center justify-between ${
                          role === r
                            ? 'bg-amber-500/15 border-amber-500 text-amber-300 font-semibold'
                            : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                        }`}
                      >
                        <span className="truncate">{r}</span>
                        {role === r && <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 flex flex-col gap-2.5">
                  <button
                    onClick={handleProceed}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-mono font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-amber-500/20 active:scale-98 cursor-pointer"
                  >
                    Proceed to Operations
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-rose-500/10 border border-white/10 hover:border-rose-500/30 text-white/60 hover:text-rose-300 font-mono text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Unauthenticated Login Options */
              <div className="space-y-4">
                <p className="text-xs text-white/70 text-center leading-relaxed">
                  Sign in with your verified hotel management credentials to access live PMS room telemetry, predictive guest intelligence, and executive auditing.
                </p>

                <button
                  onClick={handleGoogleLogin}
                  disabled={isLoggingIn}
                  className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-gray-100 text-black font-medium text-xs flex items-center justify-center gap-3 transition-all shadow-lg shadow-white/5 active:scale-98 cursor-pointer disabled:opacity-50"
                >
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-black" />
                      <span>Authenticating with Firebase...</span>
                    </>
                  ) : (
                    <>
                      {/* Google G Logo SVG */}
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
                      <span className="font-semibold">Sign in with Google</span>
                    </>
                  )}
                </button>

                <div className="pt-2 text-center">
                  <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest flex items-center justify-center gap-1.5">
                    <Shield className="w-3 h-3 text-amber-400/70" />
                    Secured by Firebase Auth & ABAC Rules
                  </span>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
