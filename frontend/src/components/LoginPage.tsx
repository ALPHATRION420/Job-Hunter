import { useState } from 'react';
import { 
  Briefcase, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  Building2, 
  Send, 
  Download, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  Zap 
} from 'lucide-react';


interface LoginPageProps {
  onLogin: (email: string, password: string) => Promise<boolean>;
  onSignup: (name: string, email: string, password: string) => Promise<boolean>;
  isLoading: boolean;
}

export function LoginPage({ onLogin, onSignup, isLoading }: LoginPageProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setError(mode === 'signup' 
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decorative Glow Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-5xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10">
        
        {/* Left Side: Hero Features Showcase */}
        <div className="lg:col-span-6 space-y-6 text-left">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-sky-500 to-emerald-400 p-0.5 shadow-xl shadow-indigo-950/50">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-indigo-400" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-black bg-gradient-to-r from-white via-slate-100 to-indigo-400 bg-clip-text text-transparent">
                JobHunter <span className="text-indigo-400">AI</span>
              </h1>
              <p className="text-xs text-indigo-300/80 font-medium">India Job Search & HR Outreach Engine</p>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold text-white leading-tight">
              Scrape Jobs in India & Auto-Send Emails to HR Contacts
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Automated Job Copilot built for candidates in Bangalore, Gurgaon, Mumbai, Hyderabad, Pune, Chennai, and Remote India.
            </p>
          </div>

          {/* Value Proposition Badges */}
          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
              <div className="p-2 rounded-xl bg-indigo-950 text-indigo-400 shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">Multi-Portal India Scraper</h4>
                <p className="text-[11px] text-slate-400">Crawls Naukri, Instahyre, LinkedIn India, Cutshort, and tech career sites.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
              <div className="p-2 rounded-xl bg-emerald-950 text-emerald-400 shrink-0">
                <Download className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">HR Contacts & Excel Export</h4>
                <p className="text-[11px] text-slate-400">Extract verified recruiter emails and download styled Excel (.xlsx) spreadsheets.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
              <div className="p-2 rounded-xl bg-violet-950 text-violet-400 shrink-0">
                <Send className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">Automated Cold Email Dispatch</h4>
                <p className="text-[11px] text-slate-400">Auto-send personalized AI-generated cold emails with attached resume.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Authentication Card */}
        <div className="lg:col-span-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
            
            {/* Header / Mode Toggle */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">
                  {mode === 'login' ? 'Sign In to Your Account' : 'Create New Candidate Account'}
                </h3>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/50">
                  <CheckCircle2 className="w-3 h-3" />
                  MongoDB Auth
                </span>
              </div>

              {/* Toggle Buttons */}
              <div className="grid grid-cols-2 p-1 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold">
                <button
                  onClick={() => { setMode('login'); setError(null); }}
                  className={`py-2 rounded-lg transition-all ${
                    mode === 'login' 
                      ? 'bg-indigo-600 text-white shadow-md' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => { setMode('signup'); setError(null); }}
                  className={`py-2 rounded-lg transition-all ${
                    mode === 'signup' 
                      ? 'bg-indigo-600 text-white shadow-md' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Create Account
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-800/60 text-red-300 text-xs font-medium leading-relaxed">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {mode === 'signup' && (
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Morgan"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-300 mb-1">User Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="alex.morgan@techdev.io"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  ✓ Applications sent to HR recruiters will be dispatched using this email.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-10 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-indigo-950/50 text-xs active:scale-95 disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>{mode === 'login' ? 'Sign In to Dashboard' : 'Create Account & Start'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Quick Demo Credentials Button */}
              <div className="pt-4 border-t border-slate-800/80 text-center">
                <button
                  type="button"
                  onClick={handleDemoLogin}
                  disabled={isLoading}
                  className="w-full py-2 bg-slate-950 hover:bg-slate-800 text-indigo-400 hover:text-indigo-300 font-semibold rounded-xl border border-slate-800 transition-all text-xs flex items-center justify-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                  <span>Use Quick Demo Account (alex.morgan@techdev.io)</span>
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
