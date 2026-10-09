import { useState, useMemo, useEffect, useRef } from 'react';
import {
  Users,
  ShieldCheck,
  CheckCircle2,
  Search,
  Download,
  RefreshCw,
  X as XIcon,
  Filter,
  Check,
  Building2,
  MessageCircle,
} from 'lucide-react';
import type { Job, UserProfile } from '../types';
import { HROverviewTable } from './HROverviewTable';
import type { JobSortConfig } from '../utils/jobFilterSort';
import { DEFAULT_SORT } from '../utils/jobFilterSort';
import { isEmailVerified } from '../utils/gmail';

interface HRContactsViewProps {
  jobs: Job[];
  profile: UserProfile;
  initialCompanySearch?: string;
  onClearCompanySearch?: () => void;
  onGenerateAndApply: (job: Job) => void;
  onApplySingle: (jobId: number) => void;
  onExportExcel: () => void;
  onExportCSV: () => void;
  onBulkAutoSend: (selectedJobIds: number[]) => void;
  onReviewEmails?: (selectedJobIds: number[]) => void;
  onTriggerScrape: (query?: string, location?: string) => void;
  onNavigateToJobs?: () => void;
  isApplyingId: number | null;
  isLoading: boolean;
}

export const HRContactsView = ({
  jobs,
  profile: _profile,
  initialCompanySearch,
  onClearCompanySearch,
  onGenerateAndApply,
  onApplySingle,
  onExportExcel,
  onExportCSV,
  onBulkAutoSend,
  onReviewEmails,
  onTriggerScrape,
  onNavigateToJobs: _onNavigateToJobs,
  isApplyingId,
  isLoading,
}: HRContactsViewProps) => {
  const [searchInput, setSearchInput] = useState(initialCompanySearch || '');
  const [debouncedSearch, setDebouncedSearch] = useState(initialCompanySearch || '');
  const [statusFilter, setStatusFilter] = useState<'all' | 'verified' | 'unverified' | 'unable'>('all');
  const [channelFilter, setChannelFilter] = useState<'all' | 'email' | 'phone'>('all');
  const [minMatchThreshold, setMinMatchThreshold] = useState<number>(0);
  
  const [sortConfig, setSortConfig] = useState<JobSortConfig>({
    field: 'verification',
    direction: 'asc',
  });

  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [isMiningLinkedin, setIsMiningLinkedin] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync external company search navigation
  useEffect(() => {
    if (initialCompanySearch) {
      setSearchInput(initialCompanySearch);
      setDebouncedSearch(initialCompanySearch);
    }
  }, [initialCompanySearch]);

  // 250ms Search Debounce
  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 250);
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [searchInput]);

  const handleToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // LinkedIn Extractor
  const handleMineLinkedin = async () => {
    if (!linkedinUrl.trim()) return;
    setIsMiningLinkedin(true);
    try {
      const res = await fetch(
        `/api/linkedin/scrape-hr?linkedin_url=${encodeURIComponent(linkedinUrl.trim())}`,
        { method: 'POST' }
      );
      if (res.ok) {
        setLinkedinUrl('');
        handleToast('LinkedIn HR contact extracted successfully');
        onTriggerScrape();
      } else {
        handleToast('Could not extract HR from that LinkedIn URL. Try another company/recruiter URL.');
      }
    } catch {
      handleToast('Error reaching LinkedIn extractor service');
    } finally {
      setIsMiningLinkedin(false);
    }
  };

  // Metrics (Verified by Hunter.io)
  const metrics = useMemo(() => {
    const total = jobs.length;
    const verified = jobs.filter((j) => isEmailVerified(j)).length;
    const withPhone = jobs.filter((j) => Boolean(j.recruiter_phone && j.recruiter_phone.trim())).length;
    const withEmail = verified;
    const highMatch = jobs.filter((j) => (j.match_score ?? 0) >= 70).length;

    return { total, verified, withPhone, withEmail, highMatch };
  }, [jobs]);

  // Filtering
  const filteredHRs = useMemo(() => {
    return jobs.filter((j) => {
      // 1. Text Search
      if (debouncedSearch.trim()) {
        const query = debouncedSearch.toLowerCase();
        const comp = (j.company || '').toLowerCase();
        const name = (j.recruiter_name || '').toLowerCase();
        const email = (j.recruiter_email || '').toLowerCase();
        const role = (j.title || '').toLowerCase();
        const phone = (j.recruiter_phone || '').toLowerCase();
        const loc = (j.location || '').toLowerCase();

        if (
          !comp.includes(query) &&
          !name.includes(query) &&
          !email.includes(query) &&
          !role.includes(query) &&
          !phone.includes(query) &&
          !loc.includes(query)
        ) {
          return false;
        }
      }

      // 2. Status Filter
      const isVer = isEmailVerified(j);
      if (statusFilter === 'verified' && !isVer) return false;
      if (statusFilter === 'unverified' && isVer) return false;
      if (statusFilter === 'unable' && isVer) return false;

      // 3. Channel Filter
      if (channelFilter === 'email' && !isVer) return false;
      if (channelFilter === 'phone' && (!j.recruiter_phone || !j.recruiter_phone.trim())) return false;

      // 4. Min Match Threshold
      if (minMatchThreshold > 0 && (j.match_score ?? 0) < minMatchThreshold) return false;

      return true;
    });
  }, [jobs, debouncedSearch, statusFilter, channelFilter, minMatchThreshold]);

  // Sorting
  const sortedHRs = useMemo(() => {
    const list = [...filteredHRs];
    const { field, direction } = sortConfig;
    const mul = direction === 'asc' ? 1 : -1;

    list.sort((a, b) => {
      if (field === 'company') {
        return mul * (a.company || '').localeCompare(b.company || '');
      }
      if (field === 'title') {
        return mul * (a.title || '').localeCompare(b.title || '');
      }
      if (field === 'match_score') {
        return mul * ((a.match_score ?? 0) - (b.match_score ?? 0));
      }
      if (field === 'verification') {
        const order = (s: string) => (s?.toLowerCase() === 'verified' ? 1 : s?.toLowerCase() === 'unverified' ? 2 : 3);
        return mul * (order(a.recruiter_status) - order(b.recruiter_status));
      }
      return 0;
    });

    return list;
  }, [filteredHRs, sortConfig]);

  const handleResetFilters = () => {
    setSearchInput('');
    setDebouncedSearch('');
    setStatusFilter('all');
    setChannelFilter('all');
    setMinMatchThreshold(0);
    setSortConfig(DEFAULT_SORT);
    onClearCompanySearch?.();
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl glass shadow-lg flex items-center gap-2 text-xs font-semibold animate-in slide-in-from-bottom-2 duration-150 border border-emerald-500/30 text-emerald-400">
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── Active Company Filter Banner ── */}
      {initialCompanySearch && (
        <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-sky-500/10 border border-sky-500/25 text-xs text-sky-300">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-sky-400 shrink-0" />
            <span>
              Targeting HR contacts for company: <strong className="text-white font-semibold">{initialCompanySearch}</strong>
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              onClearCompanySearch?.();
              setSearchInput('');
              setDebouncedSearch('');
            }}
            className="text-xs text-sky-400 hover:text-white underline font-semibold flex items-center gap-1"
          >
            <XIcon className="w-3 h-3" />
            <span>Show all companies</span>
          </button>
        </div>
      )}

      {/* ── Page Header ── */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-blue-500/10 text-blue-500 border border-blue-500/20">
              <Users className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              HR &amp; Recruiter Directory
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              Verified Contacts
            </span>
          </div>
          <p className="text-xs max-w-2xl" style={{ color: 'var(--text-secondary)' }}>
            Direct recruiter emails verified via Hunter.io API, talent acquisition leads, and HR telephone/WhatsApp contacts discovered across tech companies. Reach decision-makers directly without generic portal forms.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={onExportExcel}
            className="btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5"
            title="Download formatted Excel workbook"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Excel</span>
          </button>
          <button
            type="button"
            onClick={onExportCSV}
            className="btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5"
            title="Download CSV spreadsheet"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
          <button
            type="button"
            onClick={() => onTriggerScrape()}
            disabled={isLoading}
            className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5"
            title="Run recruiter discovery crawler"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Scanning...' : 'Mine Contacts'}</span>
          </button>
        </div>
      </div>

      {/* ── Key Metrics KPI Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="glass-panel p-4 rounded-xl border border-white/5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-sky-500/10 text-sky-400">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-medium block" style={{ color: 'var(--text-muted)' }}>
              Total HR Contacts
            </span>
            <span className="text-lg font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>
              {metrics.total}
            </span>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-white/5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-emerald-500/10 text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-medium block" style={{ color: 'var(--text-muted)' }}>
              Verified Direct Emails
            </span>
            <span className="text-lg font-bold tabular-nums text-emerald-500">
              {metrics.verified}
            </span>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-white/5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-teal-500/10 text-teal-400">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-medium block" style={{ color: 'var(--text-muted)' }}>
              Phone &amp; WhatsApp Ready
            </span>
            <span className="text-lg font-bold tabular-nums text-teal-400">
              {metrics.withPhone}
            </span>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-white/5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-indigo-500/10 text-indigo-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-medium block" style={{ color: 'var(--text-muted)' }}>
              High ATS Match (≥70%)
            </span>
            <span className="text-lg font-bold tabular-nums text-indigo-400">
              {metrics.highMatch}
            </span>
          </div>
        </div>
      </div>

      {/* ── Search Bar, Quick Filters & LinkedIn Tool ── */}
      <div className="glass-panel p-4 rounded-xl space-y-3.5">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by recruiter name, company, email, job title, or phone number..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs rounded-lg border outline-none bg-transparent transition-colors"
              style={{
                borderColor: 'var(--border-default)',
                color: 'var(--text-primary)',
              }}
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  setDebouncedSearch('');
                  onClearCompanySearch?.();
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <XIcon className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* LinkedIn HR Mining Input */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-subtle)' }}>
              <span className="w-4 h-4 rounded bg-[#0A66C2] text-white flex items-center justify-center font-bold text-[9px]">
                in
              </span>
              <input
                type="text"
                placeholder="LinkedIn recruiter / job URL..."
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                className="text-xs px-2 py-0.5 bg-transparent outline-none w-44 sm:w-56"
              />
              <button
                type="button"
                onClick={handleMineLinkedin}
                disabled={isMiningLinkedin || !linkedinUrl.trim()}
                className="btn-secondary text-[11px] py-1 px-2.5 shrink-0"
              >
                {isMiningLinkedin ? 'Mining...' : 'Extract'}
              </button>
            </div>
          </div>
        </div>

        {/* Quick Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
              <Filter className="w-3 h-3" />
              Status:
            </span>

            {[
              { id: 'all', label: 'All Contacts' },
              { id: 'verified', label: 'Verified Only 🟢' },
              { id: 'unverified', label: 'Unverified 🟡' },
              { id: 'unable', label: 'Needs Review 🔴' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id as any)}
                className={`text-[11px] px-2.5 py-1 rounded-md font-medium transition-colors ${
                  statusFilter === tab.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'hover:bg-white/5 text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}

            <div className="h-3 w-px bg-slate-700/50 mx-1 hidden sm:block" />

            <span className="text-[11px] font-semibold flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
              Channel:
            </span>
            {[
              { id: 'all', label: 'All' },
              { id: 'email', label: 'With Email ✉️' },
              { id: 'phone', label: 'With Phone 📱' },
            ].map((ch) => (
              <button
                key={ch.id}
                type="button"
                onClick={() => setChannelFilter(ch.id as any)}
                className={`text-[11px] px-2.5 py-1 rounded-md font-medium transition-colors ${
                  channelFilter === ch.id
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'hover:bg-white/5 text-slate-400 hover:text-slate-200'
                }`}
              >
                {ch.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs tabular-nums" style={{ color: 'var(--text-muted)' }}>
              Showing <strong className="font-semibold" style={{ color: 'var(--text-primary)' }}>{sortedHRs.length}</strong> of {jobs.length} HRs
            </span>

            {(searchInput || statusFilter !== 'all' || channelFilter !== 'all' || minMatchThreshold > 0) && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs text-blue-400 hover:underline"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Main HR Overview Table ── */}
      <HROverviewTable
        jobs={sortedHRs}
        onOpenStudio={onGenerateAndApply}
        onApplySingle={onApplySingle}
        onExportExcel={onExportExcel}
        onExportCSV={onExportCSV}
        onBulkAutoSend={onBulkAutoSend}
        onReviewEmails={onReviewEmails}
        onResetFilters={handleResetFilters}
        isApplyingId={isApplyingId}
        isLoading={isLoading}
        sortConfig={sortConfig}
        onSortChange={setSortConfig}
        showToast={handleToast}
      />
    </div>
  );
};
