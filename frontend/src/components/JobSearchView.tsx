import { useState, useMemo, useEffect, useRef } from 'react';
import {
  Search,
  Table as TableIcon,
  LayoutGrid,
  RefreshCw,
  X as XIcon,
  Send,
  Zap,
  MapPin,
  Building2,
  CheckCircle2,
  Mail,
} from 'lucide-react';
import type { Job, UserProfile } from '../types';
import { HROverviewTable } from './HROverviewTable';
import { FilterControl } from './FilterControl';
import { SortControl } from './SortControl';
import type { JobFilters, JobSortConfig } from '../utils/jobFilterSort';
import { getGmailComposeUrl, isEmailVerified } from '../utils/gmail';
import {
  DEFAULT_FILTERS,
  DEFAULT_SORT,
  applyJobFilters,
  applyJobSort,
  parseFiltersFromSearchParams,
  parseSortFromSearchParams,
  syncStateToSearchParams,
} from '../utils/jobFilterSort';
import { cleanDisplayLocation } from '../utils/locations';
import { formatSalaryDisplay } from '../utils/salaryParser';

interface JobSearchViewProps {
  jobs: Job[];
  profile: UserProfile;
  onGenerateAndApply: (job: Job) => void;
  onTriggerScrape: (query?: string, location?: string) => void;
  onExportExcel: () => void;
  onExportCSV: () => void;
  onBulkAutoSend: (selectedJobIds: number[]) => void;
  onReviewEmails?: (selectedJobIds: number[]) => void;
  onApplySingle: (jobId: number) => void;
  isApplyingId: number | null;
  isLoading: boolean;
}

export const JobSearchView = ({
  jobs,
  profile: _profile,
  onGenerateAndApply,
  onTriggerScrape,
  onExportExcel,
  onExportCSV,
  onBulkAutoSend,
  onReviewEmails,
  onApplySingle,
  isApplyingId,
  isLoading,
}: JobSearchViewProps) => {
  // ── URL Query Param Initialization ──
  const searchParams = useMemo(() => new URLSearchParams(window.location.search), []);

  const [rawSearchInput, setRawSearchInput] = useState<string>(() => searchParams.get('q') || '');
  const [debouncedSearch, setDebouncedSearch] = useState<string>(() => searchParams.get('q') || '');

  const [filters, setFilters] = useState<JobFilters>(() => ({
    ...DEFAULT_FILTERS,
    ...parseFiltersFromSearchParams(searchParams),
  }));

  const [sortConfig, setSortConfig] = useState<JobSortConfig>(() => ({
    ...DEFAULT_SORT,
    ...parseSortFromSearchParams(searchParams),
  }));

  const [viewMode, setViewMode] = useState<'overview' | 'grid'>(() => {
    try {
      return (localStorage.getItem('jobhunter_view_mode') as 'overview' | 'grid') || 'overview';
    } catch {
      return 'overview';
    }
  });

  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [isMiningLinkedin, setIsMiningLinkedin] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── 250ms Search Debounce ──
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearch(rawSearchInput);
    }, 250);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [rawSearchInput]);

  // ── Sync Filters & Sort to URL query params without reloading ──
  useEffect(() => {
    const qs = syncStateToSearchParams(filters, sortConfig, debouncedSearch);
    const newUrl = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
    window.history.replaceState(null, '', newUrl);
  }, [filters, sortConfig, debouncedSearch]);

  const handleViewModeChange = (mode: 'overview' | 'grid') => {
    setViewMode(mode);
    try {
      localStorage.setItem('jobhunter_view_mode', mode);
    } catch {}
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setRawSearchInput('');
    setDebouncedSearch('');
  };

  const handleToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // ── Pipeline: Filter first, then sort ──
  const filteredJobs = useMemo(
    () => applyJobFilters(jobs, filters, debouncedSearch),
    [jobs, filters, debouncedSearch]
  );

  const sortedJobs = useMemo(
    () => applyJobSort(filteredJobs, sortConfig),
    [filteredJobs, sortConfig]
  );

  const handleMineLinkedin = async () => {
    if (!linkedinUrl.trim()) return;
    setIsMiningLinkedin(true);
    try {
      const res = await fetch(
        `/api/linkedin/scrape-hr?linkedin_url=${encodeURIComponent(linkedinUrl)}`,
        { method: 'POST' }
      );
      if (res.ok) {
        setLinkedinUrl('');
        handleToast('LinkedIn HR contact extracted successfully');
        onTriggerScrape(debouncedSearch, filters.locationScope);
      } else {
        handleToast('Could not extract HR contact from this URL');
      }
    } catch {
      handleToast('Error reaching LinkedIn extractor service');
    } finally {
      setIsMiningLinkedin(false);
    }
  };

  const eligibleAutoApplyCount = filteredJobs.filter(
    (j) => (j.match_score ?? 0) >= 70 && j.recruiter_email && j.recruiter_email.includes('@')
  ).length;

  return (
    <div className="space-y-4">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-lg glass shadow-lg text-xs font-medium animate-in slide-in-from-bottom-2 duration-150">
          {toastMessage}
        </div>
      )}

      {/* ── Top Header & Search Area ── */}
      <div className="glass-panel rounded-xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>
              India Job Scraper &amp; Recruiter Aggregator
            </h2>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Automated extraction across Naukri, Instahyre, LinkedIn India, and Cutshort
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Table / Cards View Switch */}
            <div
              className="flex items-center p-0.5 rounded-lg border text-xs"
              style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-default)' }}
            >
              <button
                type="button"
                onClick={() => handleViewModeChange('overview')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md font-medium transition-colors ${
                  viewMode === 'overview'
                    ? 'bg-[var(--accent)] text-[var(--accent-contrast)] shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
                title="Table view"
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Table</span>
              </button>
              <button
                type="button"
                onClick={() => handleViewModeChange('grid')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md font-medium transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-[var(--accent)] text-[var(--accent-contrast)] shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
                title="Cards view"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cards</span>
              </button>
            </div>

            {/* Auto Apply Button */}
            <button
              type="button"
              onClick={() => {
                const eligible = filteredJobs
                  .filter((j) => (j.match_score ?? 0) >= 70 && j.recruiter_email && j.recruiter_email.includes('@'))
                  .map((j) => j.id);
                onBulkAutoSend(eligible);
              }}
              className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Auto-Apply ({eligibleAutoApplyCount})</span>
            </button>

            {/* Scrape Jobs Button */}
            <button
              type="button"
              onClick={() => onTriggerScrape(debouncedSearch, filters.locationScope)}
              disabled={isLoading}
              className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Scraping...' : 'Scrape jobs'}</span>
            </button>
          </div>
        </div>

        {/* ── Search Input (Debounced ~250ms) ── */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search positions, companies, skills (e.g. Python, React), or recruiter emails..."
            value={rawSearchInput}
            onChange={(e) => setRawSearchInput(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 text-xs rounded-lg border outline-none bg-transparent transition-colors"
            style={{
              borderColor: 'var(--border-default)',
              color: 'var(--text-primary)',
            }}
          />
          {rawSearchInput && (
            <button
              type="button"
              onClick={() => {
                setRawSearchInput('');
                setDebouncedSearch('');
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              aria-label="Clear search query"
            >
              <XIcon className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* ── Optional LinkedIn HR Extractor ── */}
        <div
          className="flex flex-col sm:flex-row items-center gap-2 p-2.5 rounded-lg border text-xs"
          style={{
            backgroundColor: 'var(--bg-subtle)',
            borderColor: 'var(--border-subtle)',
          }}
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span
              className="w-5 h-5 rounded flex items-center justify-center font-bold text-[10px]"
              style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-contrast)' }}
            >
              in
            </span>
            <span className="font-medium truncate" style={{ color: 'var(--text-secondary)' }}>
              LinkedIn HR Extractor
            </span>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Paste LinkedIn recruiter or job URL..."
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded border outline-none bg-transparent flex-1 sm:w-64"
              style={{ borderColor: 'var(--border-default)' }}
            />
            <button
              type="button"
              onClick={handleMineLinkedin}
              disabled={isMiningLinkedin || !linkedinUrl.trim()}
              className="btn-secondary text-xs py-1.5 px-3 shrink-0"
            >
              {isMiningLinkedin ? 'Extracting...' : 'Extract HR'}
            </button>
          </div>
        </div>
      </div>

      {/* ── TOOLBAR: TWO SEPARATE, INDEPENDENT CONTROLS (Filter & Sort) ── */}
      <div
        className="glass-panel rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-3"
      >
        {/* Left: Independent Filter Control + Showing Count */}
        <div className="flex flex-wrap items-center gap-3">
          <FilterControl
            filters={filters}
            onFilterChange={setFilters}
            onResetFilters={handleResetFilters}
          />

          <span className="text-xs tabular-nums" style={{ color: 'var(--text-muted)' }}>
            Showing{' '}
            <strong className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              {filteredJobs.length}
            </strong>{' '}
            of {jobs.length} jobs
          </span>
        </div>

        {/* Right: Independent Sort Control */}
        <SortControl sortConfig={sortConfig} onSortChange={setSortConfig} />
      </div>

      {/* ── Content View: HR Table or Grid ── */}
      {viewMode === 'overview' ? (
        <HROverviewTable
          jobs={sortedJobs}
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
      ) : (
        /* Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedJobs.length === 0 ? (
            <div className="col-span-full py-16 text-center table-surface rounded-xl p-8">
              <Building2 className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                No jobs match these filters
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="btn-secondary text-xs mt-3 py-1.5 px-3"
              >
                Clear filters
              </button>
            </div>
          ) : (
            sortedJobs.map((j) => {
              const sal = formatSalaryDisplay(j.salary_min ?? null, j.salary_max ?? null, j.salary);
              const score = j.match_score ?? 0;
              const isVerified = isEmailVerified(j);

              return (
                <div
                  key={j.id}
                  className="table-surface rounded-xl p-4 flex flex-col justify-between space-y-3 transition-shadow duration-150 hover:shadow-md"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>
                          {j.company}
                        </span>
                        <h4 className="text-sm font-semibold truncate leading-tight" style={{ color: 'var(--text-primary)' }}>
                          {j.title}
                        </h4>
                      </div>
                      <span
                        className="px-2 py-0.5 rounded text-xs font-semibold tabular-nums shrink-0"
                        style={{
                          backgroundColor: score >= 90 ? 'var(--success-subtle)' : score >= 70 ? 'var(--accent-subtle)' : 'var(--bg-subtle)',
                          color: score >= 90 ? 'var(--success-text)' : score >= 70 ? 'var(--accent)' : 'var(--text-muted)',
                        }}
                      >
                        {score}%
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs flex-wrap" style={{ color: 'var(--text-secondary)' }}>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {cleanDisplayLocation(j.location)}
                      </span>
                      <span>·</span>
                      <span className="font-semibold tabular-nums" style={{ color: 'var(--text-primary)' }}>
                        {sal.compact}
                      </span>
                    </div>

                    <div
                      className="p-2.5 rounded-lg text-xs space-y-1"
                      style={{ backgroundColor: 'var(--bg-subtle)' }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>
                          {j.recruiter_name || 'Hiring Team'}
                        </span>
                        {isVerified && (
                          <span
                            className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            Hunter Verified
                          </span>
                        )}
                      </div>
                      {isVerified ? (
                        <a
                          href={getGmailComposeUrl(j.recruiter_email, `Job Application: ${j.title} at ${j.company}`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-[11px] truncate hover:underline flex items-center gap-1"
                          style={{ color: 'var(--accent)' }}
                          title={`Open Gmail compose to ${j.recruiter_email}`}
                        >
                          <Mail className="w-3 h-3 shrink-0" />
                          <span className="truncate">{j.recruiter_email}</span>
                        </a>
                      ) : (
                        <p className="text-[11px] text-slate-500 italic">No verified email</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                    <button
                      type="button"
                      onClick={() => onGenerateAndApply(j)}
                      className="btn-secondary text-xs py-1.5 px-3"
                    >
                      Preview
                    </button>
                    <button
                      type="button"
                      onClick={() => onApplySingle(j.id)}
                      className="btn-primary text-xs py-1.5 px-3"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
