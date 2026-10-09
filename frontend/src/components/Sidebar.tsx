import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  Zap,
  FileText,
  Send,
  BarChart3,
  Settings,
  Sun,
  Moon,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Briefcase,
  X,
} from 'lucide-react';
import { useTheme } from '../utils/theme';

export interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  autoApply: boolean;
  setAutoApply: (val: boolean) => void;
  user: { name: string; email: string } | null;
  onLogout: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  pendingCount?: number;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'job-portals', label: 'Job Portals', icon: Briefcase },
  { id: 'hr-contacts', label: 'HR Contacts', icon: Users },
  { id: 'auto-apply-studio', label: 'Auto-Apply', icon: Zap },
  { id: 'resume', label: 'Resumes', icon: FileText },
  { id: 'mail', label: 'Mail', icon: Send },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  autoApply,
  setAutoApply,
  user,
  onLogout,
  mobileOpen,
  onCloseMobile,
  isCollapsed: controlledCollapsed,
  onToggleCollapse: controlledToggle,
}) => {
  const { theme, toggleTheme } = useTheme();

  // Collapsed state persisted in localStorage
  const [internalCollapsed, setInternalCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('jobhunter_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const isCollapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;

  const toggleCollapse = () => {
    if (controlledToggle) {
      controlledToggle();
    } else {
      setInternalCollapsed((prev) => {
        const next = !prev;
        try {
          localStorage.setItem('jobhunter_sidebar_collapsed', String(next));
        } catch {}
        return next;
      });
    }
  };

  // Close mobile drawer on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileOpen) {
        onCloseMobile();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileOpen, onCloseMobile]);

  const userName = user?.name || 'Alex Morgan';
  const userEmail = user?.email || 'alex.morgan@techdev.io';
  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    if (mobileOpen) {
      onCloseMobile();
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full select-none">
      {/* ── Brand / Header ── */}
      <div className="h-16 flex items-center justify-between px-4 border-b shrink-0" style={{ borderColor: 'var(--border-subtle)' }}>
        <button
          onClick={() => handleNavClick('dashboard')}
          className="flex items-center gap-3 text-left focus-visible:ring-2 rounded-lg"
          title="JobHunter AI Dashboard"
        >
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 font-bold"
            style={{
              backgroundColor: 'var(--accent)',
              color: 'var(--accent-contrast)',
            }}
          >
            <Briefcase className="w-5 h-5" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0 transition-opacity duration-200">
              <span className="font-semibold text-sm tracking-tight block truncate" style={{ color: 'var(--text-primary)' }}>
                JobHunter AI
              </span>
              <span className="text-[11px] block truncate" style={{ color: 'var(--text-muted)' }}>
                HR & Job Aggregator
              </span>
            </div>
          )}
        </button>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={toggleCollapse}
          className="hidden md:flex p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors focus-visible:ring-2"
          style={{ color: 'var(--text-muted)' }}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>

        {/* Mobile Close Button */}
        <button
          onClick={onCloseMobile}
          className="flex md:hidden p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors focus-visible:ring-2"
          style={{ color: 'var(--text-muted)' }}
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* ── Navigation Items ── */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <div key={item.id} className="relative group">
              <button
                onClick={() => handleNavClick(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors duration-150 text-left relative focus-visible:ring-2"
                style={{
                  backgroundColor: isActive ? 'var(--accent-subtle)' : 'transparent',
                  color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                }}
              >
                {/* Active Indicator Bar (Clean, subtle indicator on left, not glowing pill) */}
                {isActive && (
                  <div
                    className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r"
                    style={{ backgroundColor: 'var(--accent)' }}
                  />
                )}

                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'stroke-[2.2]' : 'stroke-[1.8]'}`} />

                {!isCollapsed && (
                  <span className="truncate flex-1">{item.label}</span>
                )}
              </button>

              {/* Tooltip on collapsed desktop view */}
              {isCollapsed && (
                <div
                  className="hidden md:group-hover:block absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1 text-xs font-medium rounded shadow-lg whitespace-nowrap z-50 pointer-events-none"
                  style={{
                    backgroundColor: 'var(--bg-subtle)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  {item.label}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* ── Footer Controls ── */}
      <div className="p-3 border-t space-y-2 shrink-0" style={{ borderColor: 'var(--border-subtle)' }}>
        {/* Auto-Apply Toggle */}
        <div
          className={`flex items-center rounded-lg p-2 transition-colors ${
            isCollapsed ? 'justify-center' : 'justify-between'
          }`}
          style={{ backgroundColor: 'var(--bg-subtle)' }}
        >
          {!isCollapsed && (
            <div className="min-w-0 pr-2">
              <div className="text-[11px] font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                Auto-Apply
              </div>
              <div className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>
                ≥70% match
              </div>
            </div>
          )}
          <label className="relative inline-flex items-center cursor-pointer shrink-0" title="Auto-Apply ≥70% match">
            <input
              type="checkbox"
              checked={autoApply}
              onChange={(e) => setAutoApply(e.target.checked)}
              className="sr-only peer"
              aria-label="Toggle Auto-Apply for ≥70% matches"
            />
            <div
              className="w-8 h-4 rounded-full transition-colors duration-200 peer-checked:bg-[var(--accent)]"
              style={{ backgroundColor: 'var(--border-default)' }}
            />
            <div className="w-3 h-3 bg-white rounded-full absolute left-0.5 top-0.5 transition-transform duration-200 peer-checked:translate-x-4 shadow-sm" />
          </label>
        </div>

        {/* Theme Toggle & Settings */}
        <div className={`flex items-center gap-1 ${isCollapsed ? 'flex-col' : 'justify-between'}`}>
          {/* Theme Switcher Button */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 p-2 rounded-lg text-xs font-medium w-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors focus-visible:ring-2"
            style={{ color: 'var(--text-secondary)' }}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 shrink-0 transition-transform duration-200 rotate-0 hover:rotate-45" />
            ) : (
              <Moon className="w-4 h-4 text-sky-600 shrink-0 transition-transform duration-200 rotate-0 hover:-rotate-12" />
            )}
            {!isCollapsed && (
              <span className="truncate">{theme === 'dark' ? 'Light Theme' : 'Dark Theme'}</span>
            )}
          </button>

          {/* Settings Button */}
          <button
            onClick={() => handleNavClick('settings')}
            className="flex items-center gap-2 p-2 rounded-lg text-xs font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors focus-visible:ring-2 shrink-0"
            style={{
              color: activeTab === 'settings' ? 'var(--accent)' : 'var(--text-secondary)',
              backgroundColor: activeTab === 'settings' ? 'var(--accent-subtle)' : 'transparent',
            }}
            title="Settings"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span className="hidden">Settings</span>}
          </button>
        </div>

        {/* User Profile Card (Alex Morgan) */}
        <div
          className={`flex items-center rounded-lg p-2 gap-2.5 transition-colors ${
            isCollapsed ? 'justify-center' : ''
          }`}
          style={{ backgroundColor: 'var(--bg-subtle)' }}
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center font-semibold text-[11px] shrink-0"
            style={{
              backgroundColor: 'var(--accent)',
              color: 'var(--accent-contrast)',
            }}
          >
            {initials}
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate leading-tight" style={{ color: 'var(--text-primary)' }}>
                {userName}
              </p>
              <p className="text-[10px] truncate leading-tight" style={{ color: 'var(--text-muted)' }}>
                {userEmail}
              </p>
            </div>
          )}
          {!isCollapsed && (
            <button
              onClick={onLogout}
              className="p-1 rounded text-slate-400 hover:text-red-500 transition-colors focus-visible:ring-2"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Desktop Fixed Sidebar ── */}
      <aside
        className={`hidden md:flex flex-col fixed top-0 bottom-0 left-0 z-40 transition-[width] duration-200 ease-out glass`}
        style={{
          width: isCollapsed ? '72px' : '260px',
          borderRight: '1px solid var(--border-subtle)',
        }}
        aria-label="Primary Navigation"
      >
        {sidebarContent}
      </aside>

      {/* ── Mobile Off-Canvas Drawer (<768px) ── */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 flex"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation Drawer"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-200"
            onClick={onCloseMobile}
          />
          {/* Off-canvas Panel */}
          <aside
            className="relative w-72 max-w-[80vw] h-full flex flex-col z-10 glass shadow-2xl animate-in slide-in-from-left duration-200"
            style={{ borderRight: '1px solid var(--border-subtle)' }}
          >
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};
