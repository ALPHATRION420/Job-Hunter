import { useState, useMemo, useEffect, useRef } from 'react';
import {
  Briefcase,
  Search,
  Table as TableIcon,
  LayoutGrid,
  RefreshCw,
  X as XIcon,
  Send,
  Zap,
  MapPin,
  Building2,
  ExternalLink,
  ChevronRight,
  Globe,
  ChevronDown,
  ChevronUp,
  Mail,
} from 'lucide-react';
import type { Job, UserProfile } from '../types';
import { FilterControl } from './FilterControl';
import { SortControl } from './SortControl';
import type { JobFilters, JobSortConfig } from '../utils/jobFilterSort';
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
import { getGmailComposeUrl, isEmailVerified } from '../utils/gmail';

interface JobPortalsViewProps {
  jobs: Job[];
  profile: UserProfile;
  onGenerateAndApply: (job: Job) => void;
  onApplySingle: (jobId: number) => void;
  onTriggerScrape: (query?: string, location?: string) => void;
  onBulkAutoSend: (selectedJobIds: number[]) => void;
  onNavigateToHRContacts?: (companyName?: string) => void;
  isApplyingId: number | null;
  isLoading: boolean;
}

export const JobPortalsView = ({
  jobs,
  profile,
  onGenerateAndApply,
  onApplySingle,
  onTriggerScrape,
  onBulkAutoSend,
  onNavigateToHRContacts,
  isApplyingId,
  isLoading,
}: JobPortalsViewProps) => {
  // ── URL Query Param Initialization ──
  const searchParams = useMemo(() => new URLSearchParams(window.location.search), []);

  const [rawSearchInput, setRawSearchInput] = useState<string>(() => searchParams.get('q') || '');
  const [debouncedSearch, setDebouncedSearch] = useState<string>(() => searchParams.get('q') || '');
  const [selectedPortal, setSelectedPortal] = useState<string>('all');
  const [expandedJobId, setExpandedJobId] = useState<number | null>(null);

  const [filters, setFilters] = useState<JobFilters>(() => ({
    ...DEFAULT_FILTERS,
    ...parseFiltersFromSearchParams(searchParams),
  }));

  const [sortConfig, setSortConfig] = useState<JobSortConfig>(() => ({
    ...DEFAULT_SORT,
    ...parseSortFromSearchParams(searchParams),
  }));

  const [viewMode, setViewMode] = useState<'grid' | 'table'>(() => {
    try {
      return (localStorage.getItem('jobhunter_portal_view_mode') as 'grid' | 'table') || 'grid';
    } catch {
      return 'grid';
    }
  });

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

  // ── Sync URL Search Params ──
  useEffect(() => {
    const qs = syncStateToSearchParams(filters, sortConfig, debouncedSearch);
    const newUrl = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
    window.history.replaceState(null, '', newUrl);
  }, [filters, sortConfig, debouncedSearch]);

  // ── Persist View Mode ──
  useEffect(() => {
    try {
      localStorage.setItem('jobhunter_portal_view_mode', viewMode);
    } catch {}
  }, [viewMode]);

  // ── Portal Stream Counts ──
  const portalStats = useMemo(() => {
    const counts: Record<string, number> = { all: jobs.length };
    jobs.forEach((j) => {
      const src = (j.source_portal || 'Direct Careers').trim();
      counts[src] = (counts[src] || 0) + 1;
    });
    return counts;
  }, [jobs]);

  // ── Companies with Verified HR Contacts ──
  const companiesWithVerifiedHR = useMemo(() => {
    const set = new Set<string>();
    jobs.forEach((j) => {
      if (isEmailVerified(j) && j.company) {
        set.add(j.company.trim().toLowerCase());
      }
    });
    return set;
  }, [jobs]);

  // ── Filter pipeline ──
  const filteredJobs = useMemo(() => {
    let result = applyJobFilters(jobs, filters, debouncedSearch);
    if (selectedPortal !== 'all') {
      result = result.filter(
        (j) => (j.source_portal || 'Direct Careers').toLowerCase() === selectedPortal.toLowerCase()
      );
    }
    return result;
  }, [jobs, filters, debouncedSearch, selectedPortal]);

  // ── Sort pipeline ──
  const sortedJobs = useMemo(() => {
    return applyJobSort(filteredJobs, sortConfig);
  }, [filteredJobs, sortConfig]);

  const handleResetFilters = () => {
    setRawSearchInput('');
    setDebouncedSearch('');
    setSelectedPortal('all');
    setFilters(DEFAULT_FILTERS);
    setSortConfig(DEFAULT_SORT);
  };

  const getPortalBadgeColor = (portal: string = '') => {
    const p = portal.toLowerCase();
    if (p.includes('linkedin')) return 'bg-[#0A66C2]/15 text-[#0A66C2] border-[#0A66C2]/30';
    if (p.includes('naukri')) return 'bg-blue-600/15 text-blue-500 border-blue-600/30';
    if (p.includes('indeed')) return 'bg-indigo-600/15 text-indigo-400 border-indigo-600/30';
    if (p.includes('instahyre')) return 'bg-emerald-600/15 text-emerald-400 border-emerald-600/30';
    return 'bg-purple-600/15 text-purple-400 border-purple-600/30';
  };

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-blue-500/10 text-blue-500 border border-blue-500/20">
              <Briefcase className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Job Portals &amp; Openings
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-500 border border-blue-500/20">
              Multi-Source Live Feed
            </span>
          </div>
          <p className="text-xs max-w-2xl" style={{ color: 'var(--text-secondary)' }}>
            Tech job opportunities aggregated from LinkedIn, Naukri, Indeed, Instahyre, and direct company careers portals. Discover listings with ATS match scoring, salary insights, and verified recruiter links.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* View Mode Switcher */}
          <div
            className="flex items-center p-1 rounded-lg border"
            style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-subtle)' }}
          >
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md text-xs flex items-center gap-1 transition-colors ${
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cards</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md text-xs flex items-center gap-1 transition-colors ${
                viewMode === 'table'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Compact Table View"
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Table</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => onBulkAutoSend(sortedJobs.slice(0, 10).map((j) => j.id))}
            className="btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5"
            title="Auto-apply to top matching roles"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Auto-Apply Top 10</span>
          </button>

          <button
            type="button"
            onClick={() => onTriggerScrape()}
            disabled={isLoading}
            className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5"
            title="Run multi-portal job crawlers"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Crawling...' : 'Crawl Portals'}</span>
          </button>
        </div>
      </div>

      {/* ── Portal Source Badges Bar ── */}
      <div className="glass-panel p-3.5 rounded-xl flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-[11px] font-semibold text-slate-400 shrink-0 flex items-center gap-1 mr-1">
          <Globe className="w-3.5 h-3.5 text-blue-400" />
          Portals:
        </span>

        <button
          type="button"
          onClick={() => setSelectedPortal('all')}
          className={`px-3 py-1 rounded-lg text-xs font-medium shrink-0 transition-colors ${
            selectedPortal === 'all'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white/5 hover:bg-white/10 text-slate-300'
          }`}
        >
          All Portals ({jobs.length})
        </button>

        {Object.entries(portalStats)
          .filter(([portal]) => portal !== 'all')
          .map(([portal, count]) => (
            <button
              key={portal}
              type="button"
              onClick={() => setSelectedPortal(portal)}
              className={`px-3 py-1 rounded-lg text-xs font-medium shrink-0 transition-colors border ${
                selectedPortal === portal
                  ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/5'
              }`}
            >
              {portal} ({count})
            </button>
          ))}
      </div>

      {/* ── Search Bar ── */}
      <div className="glass-panel p-4 rounded-xl space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search job titles, company names, skills (e.g. Python, React, AWS, Docker), or keywords..."
            value={rawSearchInput}
            onChange={(e) => setRawSearchInput(e.target.value)}
            className="w-full pl-9 pr-8 py-2.5 text-xs rounded-lg border outline-none bg-transparent transition-colors"
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
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <XIcon className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* ── Independent Filter & Sort Control Bar ── */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="flex flex-wrap items-center gap-3">
            <FilterControl
              filters={filters}
              onFilterChange={setFilters}
              onResetFilters={handleResetFilters}
            />

            <span className="text-xs tabular-nums" style={{ color: 'var(--text-muted)' }}>
              Showing{' '}
              <strong className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                {sortedJobs.length}
              </strong>{' '}
              of {jobs.length} open positions
            </span>
          </div>

          <SortControl sortConfig={sortConfig} onSortChange={setSortConfig} />
        </div>
      </div>

      {/* ── Listings Container ── */}
      {sortedJobs.length === 0 ? (
        <div className="py-16 text-center table-surface rounded-xl p-8 space-y-3">
          <Building2 className="w-10 h-10 text-slate-500 mx-auto opacity-40" />
          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            No job postings match your active search and filter criteria.
          </p>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try loosening the salary slider, broadening the city selection, or clearing keywords.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="btn-secondary text-xs py-1.5 px-3.5 mt-2"
          >
            Clear all filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* ── Card Grid View ── */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
          {sortedJobs.map((j) => {
            const sal = formatSalaryDisplay(j.salary_min ?? null, j.salary_max ?? null, j.salary);
            const score = j.match_score ?? 0;
            const portalSource = j.source_portal || 'Company Portal';
            const isExpanded = expandedJobId === j.id;

            // Highlight candidate matching skills vs missing
            const candSkillsLower = new Set((profile.skills || []).map((s) => s.toLowerCase()));
            const reqSkills = j.required_skills || [];

            return (
              <div
                key={j.id}
                className="table-surface rounded-xl p-4.5 flex flex-col justify-between space-y-3.5 transition-all duration-150 hover:shadow-md hover:border-blue-500/30 border border-white/5"
              >
                <div className="space-y-2.5">
                  {/* Top Bar: Company, Title & Match Score */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1.5 min-w-0">
                        <span
                          className="text-xs font-semibold text-slate-400 truncate max-w-[130px] sm:max-w-[160px]"
                          title={j.company}
                        >
                          {j.company}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border shrink-0 whitespace-nowrap inline-flex items-center gap-1 ${getPortalBadgeColor(
                            portalSource
                          )}`}
                        >
                          <Globe className="w-2.5 h-2.5 shrink-0" />
                          <span>{portalSource}</span>
                        </span>
                      </div>
                      <h3
                        className="text-sm font-bold truncate leading-snug"
                        style={{ color: 'var(--text-primary)' }}
                        title={j.title}
                      >
                        {j.title}
                      </h3>
                    </div>

                    <div
                      className="px-2.5 py-1.5 rounded-xl text-xs font-bold tabular-nums shrink-0 flex flex-col items-center leading-none"
                      style={{
                        backgroundColor:
                          score >= 80 ? 'rgba(16,185,129,0.15)' : score >= 60 ? 'rgba(59,130,246,0.15)' : 'rgba(148,163,184,0.15)',
                        color:
                          score >= 80 ? '#10b981' : score >= 60 ? '#3b82f6' : '#94a3b8',
                        border: `1px solid ${
                          score >= 80 ? 'rgba(16,185,129,0.3)' : score >= 60 ? 'rgba(59,130,246,0.3)' : 'rgba(148,163,184,0.3)'
                        }`,
                      }}
                    >
                      <span>{score}%</span>
                      <span className="text-[9px] font-normal uppercase opacity-75 mt-0.5">Match</span>
                    </div>
                  </div>

                  {/* Location & Compensation */}
                  <div className="flex items-center gap-2 text-xs flex-wrap" style={{ color: 'var(--text-secondary)' }}>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {cleanDisplayLocation(j.location)}
                    </span>
                    <span>•</span>
                    <span className="font-semibold tabular-nums text-emerald-400">
                      {sal.compact}
                    </span>
                    {j.work_type && (
                      <>
                        <span>•</span>
                        <span className="text-slate-400 text-[11px]">{j.work_type}</span>
                      </>
                    )}
                  </div>

                  {/* Required Skills Badges */}
                  {reqSkills.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {reqSkills.slice(0, 4).map((sk) => {
                        const isMatched = candSkillsLower.has(sk.toLowerCase());
                        return (
                          <span
                            key={sk}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                              isMatched
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : 'bg-slate-800 text-slate-400 border border-slate-700/50'
                            }`}
                          >
                            {sk}
                          </span>
                        );
                      })}
                      {reqSkills.length > 4 && (
                        <span className="text-[10px] text-slate-500 self-center">
                          +{reqSkills.length - 4} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Job Description Preview */}
                  {j.description && (
                    <div className="text-[11px] text-slate-400 bg-black/20 p-2.5 rounded-lg border border-white/5 leading-relaxed">
                      <p className={isExpanded ? '' : 'line-clamp-2'}>{j.description}</p>
                      {j.description.length > 100 && (
                        <button
                          type="button"
                          onClick={() => setExpandedJobId(isExpanded ? null : j.id)}
                          className="text-[10px] text-blue-400 hover:underline mt-1 font-semibold flex items-center gap-0.5"
                        >
                          {isExpanded ? (
                            <>
                              Show less <ChevronUp className="w-2.5 h-2.5" />
                            </>
                          ) : (
                            <>
                              Read more <ChevronDown className="w-2.5 h-2.5" />
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Recruiter Cross-Reference Card */}
                  {(() => {
                    const hasHR = companiesWithVerifiedHR.has((j.company || '').trim().toLowerCase());
                    return (
                      <div
                        className="p-2 rounded-lg flex items-center justify-between text-xs"
                        style={{ backgroundColor: 'var(--bg-subtle)' }}
                      >
                        <div className="min-w-0 pr-2">
                          <span className="text-[10px] text-slate-500 block">Assigned Recruiter</span>
                          <span className="font-semibold text-slate-200 truncate block text-[11px]">
                            {j.recruiter_name || 'Hiring Team'}
                          </span>
                        </div>

                        {hasHR && onNavigateToHRContacts ? (
                          <button
                            type="button"
                            onClick={() => onNavigateToHRContacts(j.company)}
                            className="text-[10px] font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1 shrink-0 transition-colors px-2 py-0.5 rounded bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20"
                            title={`View HR contact for ${j.company} in directory`}
                          >
                            <span>View in HR Directory</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        ) : hasHR && isEmailVerified(j) ? (
                          <a
                            href={getGmailComposeUrl(j.recruiter_email, `Job Application: ${j.title} at ${j.company}`)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] font-mono text-sky-400 hover:underline truncate max-w-[120px] flex items-center gap-1"
                            title={`Open Gmail compose to ${j.recruiter_email}`}
                          >
                            <Mail className="w-2.5 h-2.5 shrink-0" />
                            <span className="truncate">{j.recruiter_email}</span>
                          </a>
                        ) : (
                          <span className="text-[10px] text-slate-500 italic">No HR on file</span>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* Bottom Actions */}
                <div
                  className="flex items-center justify-between gap-2 pt-2.5 border-t"
                  style={{ borderColor: 'var(--border-subtle)' }}
                >
                  {j.source_url ? (
                    <a
                      href={j.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 font-medium transition-colors"
                      title="View original listing on job portal"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Portal Link</span>
                    </a>
                  ) : (
                    <span className="text-[10px] text-slate-500">Direct Post</span>
                  )}

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onGenerateAndApply(j)}
                      className="btn-secondary text-[11px] py-1.5 px-2.5"
                      title="Preview personalized application in studio"
                    >
                      Studio
                    </button>
                    <button
                      type="button"
                      onClick={() => onApplySingle(j.id)}
                      disabled={isApplyingId === j.id}
                      className="btn-primary text-[11px] py-1.5 px-3 flex items-center gap-1"
                    >
                      <Send className="w-3 h-3" />
                      <span>{isApplyingId === j.id ? 'Sending...' : 'Auto-Apply'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── Compact Table View ── */
        <div className="table-surface rounded-xl overflow-hidden border border-white/5 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-subtle)' }}>
                  <th className="py-3 px-4 font-semibold text-slate-400">Position &amp; Company</th>
                  <th className="py-3 px-3 font-semibold text-slate-400 whitespace-nowrap">Portal Source</th>
                  <th className="py-3 px-3 font-semibold text-slate-400">Location</th>
                  <th className="py-3 px-3 font-semibold text-slate-400">Compensation</th>
                  <th className="py-3 px-3 font-semibold text-slate-400">Match</th>
                  <th className="py-3 px-3 font-semibold text-slate-400">Recruiter</th>
                  <th className="py-3 px-4 font-semibold text-slate-400 text-right">Outreach</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
                {sortedJobs.map((j) => {
                  const sal = formatSalaryDisplay(j.salary_min ?? null, j.salary_max ?? null, j.salary);
                  const score = j.match_score ?? 0;
                  const portal = j.source_portal || 'Direct Careers';
                  const hasHR = companiesWithVerifiedHR.has((j.company || '').trim().toLowerCase());

                  return (
                    <tr key={j.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-100 block text-xs">{j.title}</span>
                        <span className="text-[11px] text-slate-400">{j.company}</span>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border whitespace-nowrap inline-flex items-center gap-1 ${getPortalBadgeColor(
                            portal
                          )}`}
                        >
                          <Globe className="w-2.5 h-2.5 shrink-0" />
                          <span>{portal}</span>
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-300">
                        {cleanDisplayLocation(j.location)}
                      </td>
                      <td className="py-3 px-3 font-semibold text-emerald-400 tabular-nums">
                        {sal.compact}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`font-bold tabular-nums ${
                            score >= 80 ? 'text-emerald-400' : score >= 60 ? 'text-blue-400' : 'text-slate-400'
                          }`}
                        >
                          {score}%
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-300">
                        <div className="flex flex-col">
                          <span className="font-medium text-[11px]">{j.recruiter_name || 'Hiring Team'}</span>
                          {hasHR && onNavigateToHRContacts && (
                            <button
                              type="button"
                              onClick={() => onNavigateToHRContacts(j.company)}
                              className="text-[10px] text-sky-400 hover:text-sky-300 hover:underline text-left mt-0.5 font-medium transition-colors"
                              title={`View HR contacts for ${j.company}`}
                            >
                              View in HR Directory ➔
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onGenerateAndApply(j)}
                            className="btn-secondary text-[11px] py-1 px-2.5"
                          >
                            Studio
                          </button>
                          <button
                            type="button"
                            onClick={() => onApplySingle(j.id)}
                            disabled={isApplyingId === j.id}
                            className="btn-primary text-[11px] py-1 px-2.5 flex items-center gap-1"
                          >
                            <Send className="w-2.5 h-2.5" />
                            <span>Apply</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
