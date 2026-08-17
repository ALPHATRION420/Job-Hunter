import React from 'react';
import { 
  Briefcase, 
  Search, 
  Send, 
  FileText,
  Zap,
  UserCheck,
  LogOut,
  LogIn
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  autoApply: boolean;
  setAutoApply: (val: boolean) => void;
  pendingCount: number;
  user: { name: string; email: string } | null;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  autoApply,
  setAutoApply,
  pendingCount,
  user,
  onOpenAuth,
  onLogout
}) => {
  const navItems = [
    { id: 'jobs', label: 'Find Jobs & HRs', icon: Search },
    { id: 'resume', label: 'My Resume & Profile', icon: FileText },
    { id: 'applications', label: 'Sent Outreach Emails', icon: Send, badge: pendingCount > 0 ? pendingCount : undefined },
  ];

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Minimalist Brand Header */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('jobs')}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 p-0.5 shadow-md">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-sky-400" />
            </div>
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-white tracking-tight">
              JobHunter <span className="text-sky-400">AI</span>
            </h1>
          </div>
        </div>


        {/* Navigation Tabs */}
        <nav className="flex items-center space-x-1 bg-slate-900/60 p-1.5 rounded-xl border border-slate-800/60 overflow-x-auto max-w-full">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? 'bg-brand-600/90 text-white shadow-md glow-blue'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className="ml-1 bg-emerald-500/20 text-emerald-400 font-bold px-1.5 py-0.5 rounded-full text-[10px] border border-emerald-500/30">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Controls: Auto-Apply Mode Switch & User Auth Profile */}
        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center space-x-3 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
            <div className="flex items-center space-x-2">
              <Zap className={`w-4 h-4 ${autoApply ? 'text-emerald-400 animate-bounce' : 'text-slate-400'}`} />
              <div className="text-left">
                <p className="text-[11px] font-semibold text-slate-200">Auto-Apply Engine</p>
                <p className="text-[9px] text-slate-400">
                  {autoApply ? 'Autonomous (>70%)' : 'Manual 1-Click'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setAutoApply(!autoApply)}
              className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors duration-300 ${
                autoApply ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                  autoApply ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* User Account Chip */}
          {user ? (
            <div className="flex items-center space-x-2 bg-slate-900/90 border border-slate-800 p-1.5 pl-3 rounded-xl text-xs">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <div className="text-left hidden lg:block">
                <p className="font-semibold text-white text-[11px] leading-tight truncate max-w-[120px]">{user.name}</p>
                <p className="text-[9px] text-sky-400 truncate max-w-[120px]">{user.email}</p>
              </div>
              <button
                onClick={onLogout}
                title="Sign Out"
                className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center space-x-2 bg-gradient-to-r from-sky-500 to-brand-600 hover:from-sky-400 hover:to-brand-500 text-white font-bold px-3.5 py-2 rounded-xl text-xs transition shadow-md glow-blue"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In / Sign Up</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
