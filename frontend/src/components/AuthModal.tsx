import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, Sparkles, X, Zap } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string, password: string) => Promise<boolean>;
  onSignup: (name: string, email: string, password: string) => Promise<boolean>;
  isLoading: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  onSignup,
  isLoading
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Please provide a valid email and password.');
      return;
    }

    if (mode === 'signup' && !name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    let success = false;
    if (mode === 'signup') {
      success = await onSignup(name.trim(), email.trim(), password.trim());
    } else {
      success = await onLogin(email.trim(), password.trim());
    }

    if (success) {
      onClose();
    } else {
      setError(mode === 'signup' ? 'Signup failed. Email may already be registered.' : 'Invalid email or password.');
    }
  };

  const handleQuickDemoLogin = async () => {
    setError(null);
    const success = await onLogin('alex.morgan@techdev.io', 'password123');
    if (success) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="glass-panel w-full max-w-md rounded-2xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col bg-cyber-card">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 to-brand-950/60 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/30 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-sky-400" />
              </div>
              <h2 className="text-lg font-bold text-white">
                {mode === 'signup' ? 'Create JobHunter AI Account' : 'Sign In to JobHunter AI'}
              </h2>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <span>🍃</span> MongoDB Database
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Register your email address to store your candidate profile in MongoDB and dispatch targeted application emails to recruiters.
          </p>
        </div>

        {/* Auth Mode Toggle Tabs */}
        <div className="grid grid-cols-2 p-2 bg-slate-900/80 border-b border-slate-800 text-xs">
          <button
            onClick={() => { setMode('signup'); setError(null); }}
            className={`py-2 rounded-xl font-bold transition ${
              mode === 'signup' ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign Up
          </button>
          <button
            onClick={() => { setMode('login'); setError(null); }}
            className={`py-2 rounded-xl font-bold transition ${
              mode === 'login' ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-[11px] font-medium">
              {error}
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <label className="text-slate-300 font-medium">Full Name</label>
              <div className="relative mt-1">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Morgan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-white focus:outline-none focus:border-sky-400"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-slate-300 font-medium">User Email Address</label>
            <div className="relative mt-1">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                placeholder="your.name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-white focus:outline-none focus:border-sky-400"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              ✓ This email address will be used to send application emails to target recruiters & HRs.
            </p>
          </div>

          <div>
            <label className="text-slate-300 font-medium">Password</label>
            <div className="relative mt-1">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-white focus:outline-none focus:border-sky-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 flex items-center justify-center space-x-2 bg-gradient-to-r from-sky-500 to-brand-600 hover:from-sky-400 hover:to-brand-500 text-white font-bold py-3 rounded-xl transition shadow-lg glow-blue text-xs"
          >
            <span>{isLoading ? 'Processing...' : mode === 'signup' ? 'Create Account & Start' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Quick Demo Login */}
          <div className="pt-3 border-t border-slate-800 text-center">
            <button
              type="button"
              onClick={handleQuickDemoLogin}
              className="text-[11px] text-sky-400 hover:text-sky-300 font-medium flex items-center justify-center gap-1 mx-auto"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Use Demo Account (alex.morgan@techdev.io)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
