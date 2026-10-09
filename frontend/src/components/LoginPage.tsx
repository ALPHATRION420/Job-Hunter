import { useState, useEffect } from 'react';
import {
  Briefcase,
  Mail,
  Lock,
  User,
  ArrowRight,
  Building2,
  Send,
  Download,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  Shield,
  Globe
} from 'lucide-react';

interface LoginPageProps {
  onLogin: (email: string, password: string) => Promise<boolean>;
  onSignup: (name: string, email: string, password: string) => Promise<boolean>;
  isLoading: boolean;
}

const features = [
  {
    icon: Building2,
    title: 'Multi-Portal India Scraper',
    desc: 'Crawls Naukri, Instahyre, LinkedIn India & more — live and real-time.',
    gradient: 'from-violet-500/20 to-violet-900/10',
    iconBg: 'rgba(139, 92, 246, 0.15)',
    iconColor: '#a78bfa',
    border: 'rgba(139, 92, 246, 0.25)',
    accentBar: '#8b5cf6',
  },
  {
    icon: Download,
    title: 'HR Contacts & Excel Export',
    desc: 'Extract verified recruiter emails and download styled Excel sheets in one click.',
    gradient: 'from-emerald-500/20 to-emerald-900/10',
    iconBg: 'rgba(16, 185, 129, 0.15)',
    iconColor: '#34d399',
    border: 'rgba(16, 185, 129, 0.25)',
    accentBar: '#10b981',
  },
  {
    icon: Send,
    title: 'AI Cold Email Engine',
    desc: 'Auto-send personalized applications with your resume attached — instantly.',
    gradient: 'from-sky-500/20 to-sky-900/10',
    iconBg: 'rgba(14, 165, 233, 0.15)',
    iconColor: '#38bdf8',
    border: 'rgba(14, 165, 233, 0.25)',
    accentBar: '#0ea5e9',
  },
];

const stats = [
  { value: '500+', label: 'Job seekers', icon: TrendingUp },
  { value: '99%', label: 'Email delivery', icon: Shield },
  { value: '40+', label: 'Company portals', icon: Globe },
];

export function LoginPage({ onLogin, onSignup, isLoading }: LoginPageProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password.trim()) {
      setError('Please enter a valid email address and password.');
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
    if (!success) {
      setError(
        mode === 'signup'
          ? 'Registration failed. An account with this email may already exist.'
          : 'Invalid email or password. Please try again.'
      );
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    setEmail('alex.morgan@techdev.io');
    setPassword('password123');
    await onLogin('alex.morgan@techdev.io', 'password123');
  };

  return (
    <div
      className="min-h-screen flex flex-col lg:flex-row relative overflow-hidden"
      style={{ background: '#060810' }}
    >
      {/* ── Animated Background ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        {/* Orbs */}
        <div
          className="absolute top-[-20%] left-[15%] w-[700px] h-[700px] rounded-full animate-float-slow"
          style={{
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.14) 0%, transparent 70%)',
            filter: 'blur(50px)',
          }}
        />
        <div
          className="absolute bottom-[-15%] right-[5%] w-[600px] h-[600px] rounded-full animate-float-medium"
          style={{
            background: 'radial-gradient(circle, rgba(14, 165, 233, 0.12) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        <div
          className="absolute top-[40%] left-[-15%] w-[500px] h-[500px] rounded-full animate-float-fast"
          style={{
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 70%)',
            filter: 'blur(70px)',
          }}
        />
        {/* Grid */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(rgba(56, 189, 248, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(56, 189, 248, 0.03) 1px, transparent 1px)`,
            backgroundSize: '64px 64px',
          }}
        />
        {/* Radial vignette */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, rgba(6,8,16,0.8) 100%)',
          }}
        />
      </div>

      {/* ── Left Panel: Hero ── */}
      <div className="relative z-10 flex flex-col lg:w-[55%] p-8 lg:p-16 lg:min-h-screen">
        {/* Brand */}
        <div className={`flex items-center gap-3 ${mounted ? 'animate-slide-left' : 'opacity-0'}`}>
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
            style={{
              background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
              boxShadow: '0 0 30px rgba(99, 102, 241, 0.6)',
            }}
          >
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1
              className="text-xl font-black text-white"
              style={{ fontFamily: 'Plus Jakarta Sans, Inter, sans-serif', letterSpacing: '-0.035em' }}
            >
              JobHunter{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #38bdf8, #818cf8)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                AI
              </span>
            </h1>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              India Job Search & HR Outreach Engine
            </p>
          </div>
        </div>

        {/* Hero section */}
        <div className="mt-14 lg:mt-0 flex-1 flex flex-col justify-center space-y-8">
          {/* Badge */}
          <div
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full w-fit ${mounted ? 'animate-slide-up anim-delay-100' : 'opacity-0'}`}
            style={{
              background: 'rgba(99, 102, 241, 0.12)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse-glow-strong"
              style={{ background: '#818cf8', boxShadow: '0 0 8px #818cf8' }}
            />
            <span className="text-[11px] font-bold text-violet-300 tracking-wide uppercase">
              Autonomous AI-Powered Job Hunter
            </span>
          </div>

          {/* Headline */}
          <div className={`space-y-3 ${mounted ? 'animate-slide-up anim-delay-200' : 'opacity-0'}`}>
            <h2
              className="text-4xl lg:text-5xl xl:text-6xl font-black leading-[1.1]"
              style={{ fontFamily: 'Plus Jakarta Sans, Inter, sans-serif', letterSpacing: '-0.04em' }}
            >
              <span className="text-white">Scrape Jobs &</span>
              <br />
              <span
                style={{
                  background: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 50%, #c4b5fd 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Auto-Apply
              </span>
              <br />
              <span className="text-white">to HRs Directly</span>
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed max-w-md">
              Built for candidates targeting companies in{' '}
              <span className="text-sky-400 font-semibold">Bangalore, Gurgaon, Mumbai, Hyderabad</span>,{' '}
              Pune, and Remote India.
            </p>
          </div>

          {/* Feature Cards */}
          <div className={`space-y-3 ${mounted ? 'animate-slide-up anim-delay-300' : 'opacity-0'}`}>
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="flex items-center gap-4 p-4 rounded-2xl card-lift group cursor-default"
                  style={{
                    background: 'rgba(12, 16, 24, 0.8)',
                    border: `1px solid ${f.border}`,
                    borderLeft: `3px solid ${f.accentBar}`,
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: f.iconBg }}
                  >
                    <Icon className="w-5 h-5" style={{ color: f.iconColor }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-slate-100">{f.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{f.desc}</p>
                  </div>
                  <CheckCircle2
                    className="w-4 h-4 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity"
                    style={{ color: f.accentBar }}
                  />
                </div>
              );
            })}
          </div>

          {/* Stats row */}
          <div
            className={`flex items-center gap-8 pt-2 ${mounted ? 'animate-slide-up anim-delay-400' : 'opacity-0'}`}
          >
            {stats.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <Icon className="w-3.5 h-3.5 text-sky-400" />
                    <p
                      className="text-2xl font-black text-white"
                      style={{ fontFamily: 'Plus Jakarta Sans, Inter, sans-serif', letterSpacing: '-0.04em' }}
                    >
                      {s.value}
                    </p>
                  </div>
                  <p className="text-[11px] text-slate-500">{s.label}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer credit */}
        <p className="text-[11px] text-slate-700 mt-10 lg:mt-0">
          © 2025 JobHunter AI · FastAPI + MongoDB Atlas
        </p>
      </div>

      {/* ── Right Panel: Auth Form ── */}
      <div className="relative z-10 flex items-center justify-center lg:w-[45%] p-6 lg:p-12 lg:min-h-screen">
        <div className={`w-full max-w-md ${mounted ? 'animate-slide-up anim-delay-200' : 'opacity-0'}`}>

          {/* Card */}
          <div
            className="rounded-3xl overflow-hidden"
            style={{
              background: 'rgba(10, 14, 24, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.07)',
              boxShadow:
                '0 40px 80px -20px rgba(0,0,0,0.8), 0 0 0 1px rgba(56, 189, 248, 0.06), inset 0 1px 0 rgba(255,255,255,0.04)',
              backdropFilter: 'blur(32px)',
            }}
          >
            {/* Gradient top strip */}
            <div
              className="h-0.5 w-full"
              style={{ background: 'linear-gradient(90deg, #0ea5e9, #6366f1, #10b981)' }}
            />

            {/* Card Header */}
            <div className="p-7 pb-0">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3
                    className="text-xl font-black text-white"
                    style={{ fontFamily: 'Plus Jakarta Sans, Inter, sans-serif', letterSpacing: '-0.025em' }}
                  >
                    {mode === 'login' ? 'Welcome back 👋' : 'Create account'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {mode === 'login'
                      ? 'Sign in to your AI-powered dashboard'
                      : 'Start your automated job hunt today'}
                  </p>
                </div>
                {/* Live indicator */}
                <div
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full"
                  style={{
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                  }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-bold text-emerald-400">Live</span>
                </div>
              </div>

              {/* Mode Toggle */}
              <div
                className="grid grid-cols-2 p-1 rounded-xl mb-6"
                style={{
                  background: 'rgba(6, 8, 16, 0.9)',
                  border: '1px solid rgba(30, 41, 59, 0.7)',
                }}
              >
                {(['login', 'signup'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => { setMode(m); setError(null); }}
                    className="py-2.5 rounded-lg text-xs font-bold transition-all duration-250"
                    style={
                      mode === m
                        ? {
                            background: 'linear-gradient(135deg, rgba(14,165,233,0.28), rgba(99,102,241,0.22))',
                            color: '#e0f2fe',
                            boxShadow: '0 0 0 1px rgba(56,189,248,0.25), inset 0 1px 0 rgba(255,255,255,0.08)',
                          }
                        : { color: '#475569' }
                    }
                  >
                    {m === 'login' ? '  Sign In' : '  Create Account'}
                  </button>
                ))}
              </div>
            </div>

            {/* Form Body */}
            <div className="px-7 pb-7">
              {/* Error */}
              {error && (
                <div
                  className="mb-5 px-4 py-3 rounded-xl text-xs font-medium text-red-300 leading-relaxed flex items-start gap-2"
                  style={{
                    background: 'rgba(127, 29, 29, 0.25)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                  }}
                >
                  <span className="shrink-0 mt-0.5">⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name (signup only) */}
                {mode === 'signup' && (
                  <div className="animate-slide-down">
                    <label className="block text-xs font-semibold text-slate-400 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-600 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Alex Morgan"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 rounded-xl transition-all outline-none"
                        style={{
                          background: 'rgba(6, 8, 16, 0.9)',
                          border: '1px solid rgba(30, 41, 59, 0.9)',
                        }}
                        onFocus={e => {
                          e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.6)';
                          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(56,189,248,0.1), 0 0 20px -4px rgba(56,189,248,0.15)';
                        }}
                        onBlur={e => {
                          e.currentTarget.style.borderColor = 'rgba(30, 41, 59, 0.9)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-600 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 rounded-xl transition-all outline-none"
                      style={{
                        background: 'rgba(6, 8, 16, 0.9)',
                        border: '1px solid rgba(30, 41, 59, 0.9)',
                      }}
                      onFocus={e => {
                        e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.6)';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(56,189,248,0.1), 0 0 20px -4px rgba(56,189,248,0.15)';
                      }}
                      onBlur={e => {
                        e.currentTarget.style.borderColor = 'rgba(30, 41, 59, 0.9)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-600 mt-1.5 ml-1">
                    Applications will be dispatched from this email address.
                  </p>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-600 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-12 py-3 text-sm text-white placeholder-slate-600 rounded-xl transition-all outline-none"
                      style={{
                        background: 'rgba(6, 8, 16, 0.9)',
                        border: '1px solid rgba(30, 41, 59, 0.9)',
                      }}
                      onFocus={e => {
                        e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.6)';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(56,189,248,0.1), 0 0 20px -4px rgba(56,189,248,0.15)';
                      }}
                      onBlur={e => {
                        e.currentTarget.style.borderColor = 'rgba(30, 41, 59, 0.9)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1 rounded-lg"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-white transition-all duration-200 mt-2 relative overflow-hidden group"
                  style={{
                    background: isLoading
                      ? 'rgba(30, 41, 59, 0.8)'
                      : 'linear-gradient(135deg, #0369a1 0%, #4f46e5 100%)',
                    boxShadow: isLoading
                      ? 'none'
                      : '0 8px 28px -4px rgba(99, 102, 241, 0.6), 0 0 0 1px rgba(99,102,241,0.2)',
                    opacity: isLoading ? 0.6 : 1,
                  }}
                >
                  {!isLoading && (
                    <span
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.1), transparent)' }}
                    />
                  )}
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <span>{mode === 'login' ? 'Sign In to Dashboard' : 'Create Account & Start'}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px" style={{ background: 'rgba(30,41,59,0.6)' }} />
                <span className="text-[10px] text-slate-600 font-medium">or</span>
                <div className="flex-1 h-px" style={{ background: 'rgba(30,41,59,0.6)' }} />
              </div>

              {/* Demo Button */}
              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all duration-200 relative overflow-hidden group"
                style={{
                  background: 'rgba(99, 102, 241, 0.09)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  color: '#a78bfa',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(99, 102, 241, 0.16)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99, 102, 241, 0.5)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(99, 102, 241, 0.09)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99, 102, 241, 0.3)';
                }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Try Demo Account</span>
                <span className="text-violet-500 font-normal">·</span>
                <span className="text-violet-500/70 font-normal text-[10px] truncate max-w-[160px]">alex.morgan@techdev.io</span>
              </button>

              {/* Trust badges */}
              <div className="flex items-center justify-center gap-4 mt-5">
                {[
                  { icon: Shield, label: 'Secure SMTP' },
                  { icon: CheckCircle2, label: 'No spam' },
                  { icon: TrendingUp, label: '500+ users' },
                ].map((b, i) => {
                  const Icon = b.icon;
                  return (
                    <div key={i} className="flex items-center gap-1.5">
                      <Icon className="w-3 h-3 text-slate-600" />
                      <span className="text-[10px] text-slate-600">{b.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
