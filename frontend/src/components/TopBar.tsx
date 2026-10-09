import React from 'react';
import { Menu, RefreshCw, Download, Database } from 'lucide-react';

interface TopBarProps {
  activeTab: string;
  onOpenMobile: () => void;
  onTriggerScrape?: () => void;
  onExportExcel?: () => void;
  isLoading?: boolean;
}

const TAB_TITLES: Record<string, { title: string; category: string }> = {
  dashboard: { title: 'Dashboard', category: 'Overview' },
  'job-portals': { title: 'Job Portals & Openings', category: 'Aggregator' },
  'hr-contacts': { title: 'HR & Recruiter Directory', category: 'Contacts' },
  jobs: { title: 'Job Portals & Openings', category: 'Aggregator' },
  'auto-apply-studio': { title: 'Auto-Apply Studio', category: 'Outreach Engine' },
  resume: { title: 'Resume & Profile', category: 'Candidate Profile' },
  mail: { title: 'Cold Mail Dispatcher', category: 'Outreach' },
  analytics: { title: 'Analytics & Metrics', category: 'Reporting' },
  settings: { title: 'System Settings', category: 'Configuration' },
  admin: { title: 'Administration', category: 'System Status' },
};

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  onOpenMobile,
  onTriggerScrape,
  onExportExcel,
  isLoading,
}) => {
  const meta = TAB_TITLES[activeTab] || { title: 'Dashboard', category: 'Overview' };

  return (
    <header
      className="sticky top-0 z-30 h-14 flex items-center justify-between px-4 sm:px-6 lg:px-8 glass border-b shrink-0 transition-colors"
      style={{ borderColor: 'var(--border-subtle)' }}
    >
      {/* Left: Mobile Toggle & Breadcrumb Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobile}
          className="md:hidden p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors focus-visible:ring-2"
          style={{ color: 'var(--text-secondary)' }}
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-medium hidden sm:inline" style={{ color: 'var(--text-muted)' }}>
            JobHunter
          </span>
          <span className="text-xs hidden sm:inline" style={{ color: 'var(--border-default)' }}>
            /
          </span>
          <span className="text-xs font-medium hidden sm:inline" style={{ color: 'var(--text-muted)' }}>
            {meta.category}
          </span>
          <span className="text-xs hidden sm:inline" style={{ color: 'var(--border-default)' }}>
            /
          </span>
          <h1 className="text-sm font-semibold truncate leading-none" style={{ color: 'var(--text-primary)' }}>
            {meta.title}
          </h1>
        </div>
      </div>

      {/* Right: Global Actions & Status */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* DB Status Badge */}
        <div
          className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium"
          style={{
            backgroundColor: 'var(--success-subtle)',
            color: 'var(--success-text)',
            border: '1px solid var(--success-border)',
          }}
        >
          <Database className="w-3 h-3" />
          <span>MongoDB Atlas Connected</span>
        </div>

        {/* Export Excel (if provided) */}
        {onExportExcel && (
          <button
            onClick={onExportExcel}
            className="btn-secondary text-xs hidden sm:inline-flex py-1.5 px-3"
            title="Export Excel report"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        )}

        {/* Global Scrape Trigger (if provided) */}
        {onTriggerScrape && (
          <button
            onClick={onTriggerScrape}
            disabled={isLoading}
            className="btn-primary text-xs py-1.5 px-3"
            title="Run scraper across portals"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Scraping...' : 'Scrape'}</span>
          </button>
        )}
      </div>
    </header>
  );
};
