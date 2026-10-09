import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Search, 
  Send, 
  FileText,
  Zap,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  BarChart3,
  Settings,
  Menu,
  X
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

const NAV_ITEMS = [
  { id: 'dashboard',         label: 'Dashboard',   icon: LayoutDashboard },
  { id: 'jobs',              label: 'HR Contacts', icon: Search },
  { id: 'auto-apply-studio', label: 'Auto-Apply',  icon: Zap, highlight: true },
  { id: 'resume',            label: 'Resumes',     icon: FileText },
  { id: 'mail',              label: 'Mail',        icon: Send },
  { id: 'analytics',         label: 'Analytics',  icon: BarChart3 },
];

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  autoApply,
  setAutoApply,
  pendingCount,
  user,
  onLogout
}) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menus on outside click
  useEffect(() => {
    const close = () => { setUserMenuOpen(false); setMobileMenuOpen(false); };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  const getBadge = (id: string) => {
    if (id === 'applications' && pendingCount > 0) return pendingCount;
    return undefined;
  };

  return (
    <>
      <header
        className="sticky top-0 z-50 transition-all duration-300"
        style={{
          background: scrolled
            ? 'rgba(6, 8, 16, 0.97)'
            : 'rgba(6, 8, 16, 0.88)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderBottom: scrolled
            ? '1px solid rgba(56, 189, 248, 0.12)'
            : '1px solid rgba(255, 255, 255, 0.05)',
          boxShadow: scrolled
            ? '0 4px 24px -4px rgba(0,0,0,0.6), 0 1px 0 0 rgba(56,189,248,0.08)'
            : '0 1px 0 0 rgba(255,255,255,0.04)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-14 gap-3">

            {/* ── Brand Logo ── */}
            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2.5 shrink-0 group"
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                  boxShadow: '0 0 20px -2px rgba(99, 102, 241, 0.6)',
                }}
              >
                <Briefcase className="w-4 h-4 text-white" />
              </div>
              <div className="hidden sm:block">
                <span
                  className="text-[15px] font-black tracking-tight text-white"
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
                </span>
              </div>
            </button>

            {/* ── Desktop Navigation Tabs ── */}
            <nav
              className="hidden md:flex items-center gap-0.5 rounded-xl p-1 flex-1 max-w-[520px] mx-auto"
              style={{
                background: 'rgba(10, 14, 24, 0.8)',
                border: '1px solid rgba(30, 41, 59, 0.6)',
              }}
            >
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                const badge = getBadge(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={(e) => { e.stopPropagation(); setActiveTab(item.id); }}
                    className="relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-200 flex-1 justify-center whitespace-nowrap"
                    style={
                      isActive
                        ? {
                            background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.22), rgba(99, 102, 241, 0.18))',
                            color: '#e0f2fe',
                            boxShadow: '0 0 0 1px rgba(56, 189, 248, 0.3), inset 0 1px 0 rgba(255,255,255,0.08)',
                          }
                        : { color: '#475569' }
                    }
                    onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.color = '#94a3b8'; }}
                    onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.color = '#475569'; }}
                  >
                    <Icon
                      className="w-3.5 h-3.5 shrink-0"
                      style={{ color: isActive ? '#38bdf8' : 'currentColor' }}
                    />
                    <span className="hidden lg:inline">{item.label}</span>
                    {badge !== undefined && (
                      <span
                        className="inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full text-[9px] font-bold"
                        style={{
                          background: 'rgba(16, 185, 129, 0.25)',
                          color: '#34d399',
                          border: '1px solid rgba(16, 185, 129, 0.4)',
                        }}
                      >
                        {badge}
                      </span>
                    )}
                    {/* Active indicator dot */}
                    {isActive && (
                      <span
                        className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                        style={{ background: '#38bdf8', boxShadow: '0 0 6px #38bdf8' }}
                      />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* ── Right Controls ── */}
            <div className="flex items-center gap-2 shrink-0">

              {/* Auto-Apply Toggle */}
              <div
                className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl cursor-pointer transition-all duration-200"
                style={{
                  background: autoApply
                    ? 'rgba(16, 185, 129, 0.08)'
                    : 'rgba(10, 14, 24, 0.8)',
                  border: autoApply
                    ? '1px solid rgba(16, 185, 129, 0.25)'
                    : '1px solid rgba(30, 41, 59, 0.6)',
                }}
                onClick={(e) => { e.stopPropagation(); setAutoApply(!autoApply); }}
              >
                <Zap
                  className="w-3.5 h-3.5 shrink-0 transition-all duration-300"
                  style={{
                    color: autoApply ? '#34d399' : '#475569',
                    filter: autoApply ? 'drop-shadow(0 0 6px #34d399)' : 'none',
                  }}
                />
                <div className="flex flex-col">
                  <span className="text-[10px] font-semibold text-slate-300 leading-none">Auto-Apply</span>
                  <span
                    className="text-[9px] leading-none mt-0.5 font-medium"
                    style={{ color: autoApply ? '#34d399' : '#475569' }}
                  >
                    {autoApply ? '≥70% match' : 'Manual'}
                  </span>
                </div>
                {/* Toggle */}
                <div className="relative ml-1" style={{ width: 34, height: 18 }}>
                  <span
                    className="absolute inset-0 rounded-full transition-all duration-300"
                    style={{
                      background: autoApply
                        ? 'linear-gradient(135deg, #10b981, #059669)'
                        : '#1e293b',
                      boxShadow: autoApply ? '0 0 12px rgba(16, 185, 129, 0.5)' : 'none',
                    }}
                  />
                  <span
                    className="absolute w-3.5 h-3.5 rounded-full bg-white shadow-md transition-all duration-300"
                    style={{ left: autoApply ? 16 : 2, top: 2 }}
                  />
                </div>
              </div>

              {/* Settings shortcut */}
              <button
                onClick={(e) => { e.stopPropagation(); setActiveTab('settings'); }}
                className="hidden sm:flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200"
                style={{
                  background: activeTab === 'settings' ? 'rgba(56,189,248,0.12)' : 'rgba(10,14,24,0.8)',
                  border: '1px solid rgba(30,41,59,0.6)',
                  color: activeTab === 'settings' ? '#38bdf8' : '#475569',
                }}
                title="Settings"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>

              {/* User Menu */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={(e) => { e.stopPropagation(); setUserMenuOpen(v => !v); }}
                    className="flex items-center gap-2 px-2 py-1 rounded-xl transition-all duration-200"
                    style={{
                      background: 'rgba(10, 14, 24, 0.8)',
                      border: userMenuOpen
                        ? '1px solid rgba(56, 189, 248, 0.3)'
                        : '1px solid rgba(30, 41, 59, 0.6)',
                    }}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 font-black text-[11px]"
                      style={{
                        background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                        color: 'white',
                        letterSpacing: '0.03em',
                        boxShadow: '0 0 12px rgba(99,102,241,0.4)',
                      }}
                    >
                      {initials}
                    </div>
                    <div className="hidden lg:flex flex-col text-left">
                      <span className="text-[11px] font-semibold text-slate-200 leading-tight max-w-[90px] truncate">
                        {user.name}
                      </span>
                      <span className="text-[9px] text-sky-400/80 leading-tight max-w-[90px] truncate">
                        {user.email}
                      </span>
                    </div>
                    <ChevronDown
                      className="w-3 h-3 text-slate-500 shrink-0 transition-transform duration-200"
                      style={{ transform: userMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    />
                  </button>

                  {/* Dropdown */}
                  {userMenuOpen && (
                    <div
                      className="absolute right-0 mt-2 w-52 rounded-2xl overflow-hidden animate-scale-in"
                      style={{
                        background: 'rgba(8, 12, 22, 0.99)',
                        border: '1px solid rgba(30, 41, 59, 0.9)',
                        boxShadow: '0 20px 48px -8px rgba(0,0,0,0.7), 0 0 0 1px rgba(56,189,248,0.06)',
                        zIndex: 100,
                      }}
                    >
                      {/* User info */}
                      <div className="px-4 py-3.5" style={{ borderBottom: '1px solid rgba(30,41,59,0.5)' }}>
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm"
                            style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', color: 'white' }}
                          >
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[12px] font-bold text-slate-100 truncate">{user.name}</p>
                            <p className="text-[10px] text-sky-400/70 truncate mt-0.5">{user.email}</p>
                          </div>
                        </div>
                      </div>
                      {/* Menu items */}
                      <div className="p-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); setUserMenuOpen(false); setActiveTab('settings'); }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-all duration-150"
                        >
                          <Settings className="w-3.5 h-3.5" />
                          <span>Settings & SMTP</span>
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setUserMenuOpen(false); onLogout(); }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150 mt-0.5"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  className="flex items-center gap-2 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all duration-200 hover:scale-[1.02]"
                  style={{
                    background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                    boxShadow: '0 4px 16px -4px rgba(99, 102, 241, 0.6)',
                  }}
                >
                  <span>Sign In</span>
                </button>
              )}

              {/* Mobile hamburger */}
              <button
                className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg transition-colors"
                style={{ background: 'rgba(10,14,24,0.8)', border: '1px solid rgba(30,41,59,0.6)', color: '#94a3b8' }}
                onClick={(e) => { e.stopPropagation(); setMobileMenuOpen(v => !v); }}
              >
                {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Mobile Menu Drawer ── */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-40"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} />
          <div
            className="absolute top-14 left-0 right-0 animate-slide-down"
            style={{
              background: 'rgba(8, 12, 22, 0.99)',
              borderBottom: '1px solid rgba(30,41,59,0.8)',
              boxShadow: '0 20px 40px -8px rgba(0,0,0,0.7)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 space-y-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                const badge = getBadge(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150"
                    style={
                      isActive
                        ? {
                            background: 'rgba(14,165,233,0.15)',
                            color: '#e0f2fe',
                            border: '1px solid rgba(56,189,248,0.2)',
                          }
                        : { color: '#64748b', border: '1px solid transparent' }
                    }
                  >
                    <Icon className="w-4 h-4" style={{ color: isActive ? '#38bdf8' : 'currentColor' }} />
                    <span>{item.label}</span>
                    {badge !== undefined && (
                      <span className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: 'rgba(16,185,129,0.2)', color: '#34d399' }}>
                        {badge}
                      </span>
                    )}
                  </button>
                );
              })}
              {/* Mobile auto-apply */}
              <div className="pt-2 border-t" style={{ borderColor: 'rgba(30,41,59,0.5)' }}>
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4" style={{ color: autoApply ? '#34d399' : '#475569' }} />
                    <span className="text-sm font-semibold text-slate-300">Auto-Apply</span>
                    <span className="text-xs text-slate-500">{autoApply ? '(Active)' : '(Off)'}</span>
                  </div>
                  <button onClick={() => setAutoApply(!autoApply)} className="relative" style={{ width: 36, height: 20 }}>
                    <span className="absolute inset-0 rounded-full" style={{ background: autoApply ? '#10b981' : '#1e293b' }} />
                    <span className="absolute w-4 h-4 rounded-full bg-white" style={{ left: autoApply ? 18 : 2, top: 2 }} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
