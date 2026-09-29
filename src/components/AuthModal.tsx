import React, { useState } from 'react';
import { ShieldCheck, User, Mail, Lock, Sparkles, Check, ArrowRight, BookOpen } from 'lucide-react';
import type { UserProfile, UserRole } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onLogin: (user: UserProfile) => void;
  onVerifyHostCode: (code: string) => Promise<boolean>;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onLogin,
  onVerifyHostCode
}) => {
  const [role, setRole] = useState<UserRole>('STUDENT');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [hostCode, setHostCode] = useState('13189');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      let isHostVerified = false;
      if (role === 'HOST') {
        const ok = await onVerifyHostCode(hostCode.trim());
        if (!ok) {
          setError('Invalid Host Code. For development testing, use 13189.');
          setIsSubmitting(false);
          return;
        }
        isHostVerified = true;
      }

      const uid = `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      onLogin({
        uid,
        displayName: name.trim(),
        email: email.trim() || undefined,
        role,
        isHostVerified
      });
    } catch (err: any) {
      setError(err?.message || 'Login error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemoLogin = async (demoRole: UserRole, demoName: string) => {
    let isHostVerified = false;
    if (demoRole === 'HOST') {
      await onVerifyHostCode('13189');
      isHostVerified = true;
    }

    onLogin({
      uid: `demo_${demoRole.toLowerCase()}_${Math.random().toString(36).substring(2, 5)}`,
      displayName: demoName,
      email: `${demoName.toLowerCase().replace(/\s+/g, '.')}@studylive.edu`,
      role: demoRole,
      isHostVerified
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Brand Logo & Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-indigo-600/30">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Welcome to <span className="text-cyan-400">StudyLive</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time live interactive classroom & study platform
          </p>
        </div>

        {/* Role Switcher */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-900 rounded-2xl border border-zinc-800 mb-6">
          <button
            type="button"
            onClick={() => setRole('STUDENT')}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              role === 'STUDENT'
                ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700/80'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Student</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('HOST')}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              role === 'HOST'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Teacher / Host</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1">Your Full Name</label>
            <input
              type="text"
              placeholder={role === 'HOST' ? 'e.g. Prof. R. K. Sharma' : 'e.g. Aryan Gupta'}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1">Email (Optional)</label>
            <input
              type="email"
              placeholder="student@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Host Access Code Field if Teacher selected */}
          {role === 'HOST' && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
              <label className="text-xs font-bold text-amber-300 block mb-1">
                Teacher Access Code (Dev default: 13189)
              </label>
              <input
                type="password"
                value={hostCode}
                onChange={(e) => setHostCode(e.target.value)}
                className="w-full bg-zinc-950 border border-amber-500/40 rounded-lg px-3 py-2 text-xs text-white font-mono"
                required
              />
            </div>
          )}

          {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-950 transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <span>{isSubmitting ? 'Verifying...' : `Enter as ${role === 'HOST' ? 'Host' : 'Student'}`}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Switcher */}
        <div className="mt-6 pt-5 border-t border-zinc-800/80 text-center">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-2.5">
            Quick 1-Click Profile Test
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleQuickDemoLogin('HOST', 'Prof. R. K. Sharma')}
              className="py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-amber-300 border border-zinc-800 hover:border-amber-500/30 text-xs font-medium transition-colors cursor-pointer"
            >
              👑 Host (Prof. Sharma)
            </button>
            <button
              onClick={() => handleQuickDemoLogin('STUDENT', 'Aryan (Student)')}
              className="py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 hover:border-zinc-700 text-xs font-medium transition-colors cursor-pointer"
            >
              🎓 Student (Aryan)
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
