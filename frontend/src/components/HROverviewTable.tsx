import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { Job } from '../types';
import {
  Building2,
  Mail,
  MapPin,
  Download,
  Send,
  CheckCircle2,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  X,
  Phone,
  MessageCircle,
  Copy,
  Check,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
} from 'lucide-react';
import { cleanDisplayLocation } from '../utils/locations';
import type { JobSortConfig, SortField } from '../utils/jobFilterSort';
import { formatSalaryDisplay } from '../utils/salaryParser';
import { getGmailComposeUrl, isEmailVerified } from '../utils/gmail';

interface HROverviewTableProps {
  jobs: Job[];
  onOpenStudio: (job: Job) => void;
  onApplySingle: (jobId: number) => void;
  onExportExcel: () => void;
  onExportCSV: () => void;
  onBulkAutoSend: (selectedJobIds: number[]) => void;
  onReviewEmails?: (selectedJobIds: number[]) => void;
  onResetFilters?: () => void;
  isApplyingId: number | null;
  isLoading?: boolean;
  sortConfig?: JobSortConfig;
  onSortChange?: (newConfig: JobSortConfig) => void;
  showToast?: (msg: string) => void;
}

export function HROverviewTable({
  jobs,
  onOpenStudio,
  onApplySingle,
  onExportExcel,
  onExportCSV,
  onBulkAutoSend,
  onReviewEmails,
  onResetFilters,
  isApplyingId,
  isLoading,
  sortConfig,
  onSortChange,
  showToast,
}: HROverviewTableProps) {
  const [selectedJobIds, setSelectedJobIds] = useState<number[]>([]);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [sentJobIds, setSentJobIds] = useState<number[]>([]);

  // ── Universal Horizontal Scroll State & Synchronization ──
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const topScrollRef = useRef<HTMLDivElement>(null);

  const [scrollInfo, setScrollInfo] = useState({
    canScrollLeft: false,
    canScrollRight: false,
    scrollLeft: 0,
    scrollWidth: 0,
    clientWidth: 0,
    hasOverflow: false,
    percentage: 0,
  });

  const updateScrollInfo = useCallback(() => {
    const el = tableContainerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const maxScroll = Math.max(0, scrollWidth - clientWidth);
    const hasOverflow = maxScroll > 8;
    const percentage = maxScroll > 0 ? Math.min(100, Math.max(0, Math.round((scrollLeft / maxScroll) * 100))) : 0;

    setScrollInfo({
      canScrollLeft: scrollLeft > 8,
      canScrollRight: scrollLeft < maxScroll - 8,
      scrollLeft,
      scrollWidth,
      clientWidth,
      hasOverflow,
      percentage,
    });
  }, []);

  useEffect(() => {
    updateScrollInfo();
    const el = tableContainerRef.current;
    if (!el) return;

    const handleResize = () => updateScrollInfo();
    window.addEventListener('resize', handleResize);

    const observer = new ResizeObserver(() => updateScrollInfo());
    observer.observe(el);

    return () => {
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
    };
  }, [jobs, updateScrollInfo]);

  // Sync top scrollbar track with table container
  const handleTableScroll = () => {
    updateScrollInfo();
    if (tableContainerRef.current && topScrollRef.current) {
      if (Math.abs(topScrollRef.current.scrollLeft - tableContainerRef.current.scrollLeft) > 2) {
        topScrollRef.current.scrollLeft = tableContainerRef.current.scrollLeft;
      }
    }
  };

  const handleTopScroll = () => {
    if (tableContainerRef.current && topScrollRef.current) {
      if (Math.abs(tableContainerRef.current.scrollLeft - topScrollRef.current.scrollLeft) > 2) {
        tableContainerRef.current.scrollLeft = topScrollRef.current.scrollLeft;
      }
    }
  };

  const scrollByAmount = (delta: number) => {
    if (!tableContainerRef.current) return;
    tableContainerRef.current.scrollBy({ left: delta, behavior: 'smooth' });
  };

  const scrollToPercent = (percent: number) => {
    if (!tableContainerRef.current) return;
    const { scrollWidth, clientWidth } = tableContainerRef.current;
    const maxScroll = Math.max(0, scrollWidth - clientWidth);
    tableContainerRef.current.scrollTo({
      left: (maxScroll * percent) / 100,
      behavior: 'smooth',
    });
  };

  const handleSliderDrag = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (!tableContainerRef.current) return;
    const { scrollWidth, clientWidth } = tableContainerRef.current;
    const maxScroll = Math.max(0, scrollWidth - clientWidth);
    tableContainerRef.current.scrollLeft = (maxScroll * val) / 100;
  };

  const handleHeaderSort = (field: SortField) => {
    if (!onSortChange) return;
    if (sortConfig && sortConfig.field === field) {
      onSortChange({
        field,
        direction: sortConfig.direction === 'asc' ? 'desc' : 'asc',
      });
    } else {
      const defaultDir = field === 'company' || field === 'title' ? 'asc' : 'desc';
      onSortChange({ field, direction: defaultDir });
    }
  };

  const toggleSelectAll = () => {
    if (selectedJobIds.length === jobs.length) {
      setSelectedJobIds([]);
    } else {
      setSelectedJobIds(jobs.map((j) => j.id));
    }
  };

  const toggleSelectJob = (id: number) => {
    setSelectedJobIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleCopyEmail = (email: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    if (showToast) {
      showToast(`Copied ${email} to clipboard`);
    }
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  const handleSingleSend = async (jobId: number) => {
    onApplySingle(jobId);
    setSentJobIds((prev) => [...prev, jobId]);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (!sortConfig || sortConfig.field !== field) {
      return <ChevronDown className="w-3 h-3 opacity-25" />;
    }
    return sortConfig.direction === 'asc' ? (
      <ChevronUp className="w-3 h-3 text-[var(--accent)]" />
    ) : (
      <ChevronDown className="w-3 h-3 text-[var(--accent)]" />
    );
  };

  return (
    <div className="table-surface rounded-xl overflow-hidden relative shadow-sm">
      {/* ── Floating Bulk Action Bar ── */}
      {selectedJobIds.length > 0 && (
        <div
          className="sticky top-2 z-30 mx-4 my-2 px-4 py-2.5 rounded-lg flex flex-wrap items-center justify-between gap-3 glass shadow-lg animate-in slide-in-from-top-2 duration-150"
          style={{ border: '1px solid var(--accent-border)' }}
        >
          <div className="flex items-center gap-3">
            <span
              className="px-2.5 py-0.5 rounded-md text-xs font-semibold tabular-nums"
              style={{
                backgroundColor: 'var(--accent-subtle)',
                color: 'var(--accent)',
              }}
            >
              {selectedJobIds.length} selected
            </span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Bulk actions ready
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onReviewEmails && (
              <button
                type="button"
                onClick={() => onReviewEmails(selectedJobIds)}
                className="btn-secondary text-xs py-1.5 px-3"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Review ({selectedJobIds.length})</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onBulkAutoSend(selectedJobIds)}
              className="btn-primary text-xs py-1.5 px-3"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Selected ({selectedJobIds.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedJobIds([])}
              className="p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              style={{ color: 'var(--text-muted)' }}
              title="Clear selection"
              aria-label="Clear selection"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── Table Top Toolbar / Header ── */}
      <div
        className="p-4 border-b flex flex-wrap items-center justify-between gap-3 shrink-0"
        style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-subtle)' }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{
              backgroundColor: 'var(--accent-subtle)',
              color: 'var(--accent)',
            }}
          >
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>
              Target Recruiter &amp; HR Database
            </h2>
            <p className="text-[11px] leading-tight mt-0.5" style={{ color: 'var(--text-muted)' }}>
              <span className="font-semibold tabular-nums" style={{ color: 'var(--text-secondary)' }}>
                {jobs.length}
              </span>{' '}
              contacts matching criteria
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onExportExcel}
            className="btn-secondary text-xs py-1.5 px-3"
            title="Download Excel spreadsheet"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Excel</span>
          </button>
          <button
            type="button"
            onClick={onExportCSV}
            className="btn-secondary text-xs py-1.5 px-3"
            title="Download CSV spreadsheet"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
          <button
            type="button"
            onClick={() => onBulkAutoSend(selectedJobIds)}
            className="btn-primary text-xs py-1.5 px-3.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>
              Portal Links / Apply {selectedJobIds.length > 0 ? `(${selectedJobIds.length})` : '(All Filtered)'}
            </span>
          </button>
        </div>
      </div>

      {/* ── UNIVERSAL HORIZONTAL SCROLL TAB (Slide Left & Right) ── */}
      {jobs.length > 0 && (
        <div
          className="px-4 py-2.5 border-b flex flex-wrap items-center justify-between gap-3 text-xs sticky top-14 z-20 backdrop-blur-md transition-colors"
          style={{
            backgroundColor: 'var(--bg-subtle)',
            borderColor: 'var(--border-subtle)',
          }}
        >
          {/* Left: Slide Controls + Draggable Slider */}
          <div className="flex items-center gap-2 min-w-0 flex-wrap">
            <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300 shrink-0">
              <SlidersHorizontal className="w-3.5 h-3.5 text-sky-500" />
              <span className="hidden sm:inline">Table Slide:</span>
            </div>

            {/* Step Left */}
            <button
              type="button"
              onClick={() => scrollByAmount(-280)}
              disabled={!scrollInfo.canScrollLeft}
              className="px-2.5 py-1 rounded-lg border flex items-center gap-1 font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer text-xs"
              style={{ borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
              title="Slide table left (reveals Company)"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Left</span>
            </button>

            {/* Interactive Range Slider */}
            <div className="flex items-center gap-2 w-28 sm:w-44 lg:w-56 shrink-0" title={`Slide table position: ${scrollInfo.percentage}%`}>
              <input
                type="range"
                min="0"
                max="100"
                value={scrollInfo.percentage}
                onChange={handleSliderDrag}
                disabled={!scrollInfo.hasOverflow}
                className="w-full accent-sky-500 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg disabled:opacity-40"
                aria-label="Universal horizontal scroll slider"
              />
            </div>

            {/* Step Right */}
            <button
              type="button"
              onClick={() => scrollByAmount(280)}
              disabled={!scrollInfo.canScrollRight}
              className="px-2.5 py-1 rounded-lg border flex items-center gap-1 font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer text-xs"
              style={{ borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
              title="Slide table right (reveals Salary & Actions)"
            >
              <span>Right</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            {/* Position Percentage Badge */}
            <span
              className="px-2 py-0.5 rounded-full text-[10px] font-bold tabular-nums shrink-0"
              style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}
            >
              {scrollInfo.percentage}%
            </span>
          </div>

          {/* Right: Quick Jump Column Shortcuts */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden lg:inline">Quick Jump:</span>
            <button
              type="button"
              onClick={() => scrollToPercent(0)}
              className={`px-2 py-0.5 rounded-md text-[11px] font-medium border transition-colors cursor-pointer ${
                scrollInfo.percentage < 20
                  ? 'bg-sky-500/15 border-sky-500/40 text-sky-600 dark:text-sky-400 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Company
            </button>
            <button
              type="button"
              onClick={() => scrollToPercent(35)}
              className={`px-2 py-0.5 rounded-md text-[11px] font-medium border transition-colors cursor-pointer ${
                scrollInfo.percentage >= 20 && scrollInfo.percentage < 55
                  ? 'bg-sky-500/15 border-sky-500/40 text-sky-600 dark:text-sky-400 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Contact
            </button>
            <button
              type="button"
              onClick={() => scrollToPercent(70)}
              className={`px-2 py-0.5 rounded-md text-[11px] font-medium border transition-colors cursor-pointer ${
                scrollInfo.percentage >= 55 && scrollInfo.percentage < 85
                  ? 'bg-sky-500/15 border-sky-500/40 text-sky-600 dark:text-sky-400 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Salary
            </button>
            <button
              type="button"
              onClick={() => scrollToPercent(100)}
              className={`px-2 py-0.5 rounded-md text-[11px] font-medium border transition-colors cursor-pointer ${
                scrollInfo.percentage >= 85
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Actions ⚡
            </button>
          </div>
        </div>
      )}

      {/* ── Synchronized Native Top Scrollbar Track ── */}
      {scrollInfo.hasOverflow && (
        <div
          ref={topScrollRef}
          onScroll={handleTopScroll}
          className="overflow-x-auto w-full custom-scrollbar border-b"
          style={{
            backgroundColor: 'var(--bg-subtle)',
            borderColor: 'var(--border-subtle)',
            height: '14px',
          }}
          title="Slide horizontal scrollbar"
        >
          <div style={{ width: scrollInfo.scrollWidth || '100%', height: '1px' }} />
        </div>
      )}

      {/* ── Scrollable Table Container (Guaranteed Min-width, No horizontal clipping) ── */}
      <div
        ref={tableContainerRef}
        onScroll={handleTableScroll}
        className="overflow-x-auto w-full custom-scrollbar"
      >
        <table className="w-full min-w-[1050px] text-left border-collapse text-xs">
          <thead>
            <tr
              className="border-b text-[11px] font-semibold uppercase tracking-wider sticky top-0 z-20"
              style={{
                borderColor: 'var(--border-subtle)',
                backgroundColor: 'var(--bg-subtle)',
                color: 'var(--text-muted)',
              }}
            >
              <th className="py-3.5 px-4 w-12 text-center">
                <input
                  type="checkbox"
                  checked={jobs.length > 0 && selectedJobIds.length === jobs.length}
                  onChange={toggleSelectAll}
                  className="rounded cursor-pointer accent-[var(--accent)]"
                  aria-label="Select all jobs"
                />
              </th>
              <th
                className="py-3.5 px-4 cursor-pointer hover:text-[var(--text-primary)] transition-colors select-none w-48 min-w-[150px]"
                onClick={() => handleHeaderSort('company')}
              >
                <div className="flex items-center gap-1.5">
                  <span>Company</span>
                  <SortIcon field="company" />
                </div>
              </th>
              <th
                className="py-3.5 px-4 cursor-pointer hover:text-[var(--text-primary)] transition-colors select-none w-52 min-w-[160px]"
                onClick={() => handleHeaderSort('title')}
              >
                <div className="flex items-center gap-1.5">
                  <span>Position</span>
                  <SortIcon field="title" />
                </div>
              </th>
              <th className="py-3.5 px-4 w-36 min-w-[120px]">HR Recruiter</th>
              <th
                className="py-3.5 px-4 cursor-pointer hover:text-[var(--text-primary)] transition-colors select-none w-64 min-w-[220px]"
                onClick={() => handleHeaderSort('verification')}
              >
                <div className="flex items-center gap-1.5">
                  <span>Email &amp; Contact</span>
                  <SortIcon field="verification" />
                </div>
              </th>
              <th className="py-3.5 px-4 w-32 min-w-[100px]">Location</th>
              <th
                className="py-3.5 px-4 cursor-pointer hover:text-[var(--text-primary)] transition-colors select-none w-32 min-w-[100px]"
                onClick={() => handleHeaderSort('salary')}
              >
                <div className="flex items-center gap-1.5">
                  <span>Salary</span>
                  <SortIcon field="salary" />
                </div>
              </th>
              <th
                className="py-3.5 px-4 cursor-pointer hover:text-[var(--text-primary)] transition-colors select-none text-center w-24 min-w-[70px]"
                onClick={() => handleHeaderSort('match_score')}
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span>Match</span>
                  <SortIcon field="match_score" />
                </div>
              </th>
              <th
                className="py-3.5 px-4 text-right w-36 min-w-[120px]"
                style={{ backgroundColor: 'var(--bg-subtle)' }}
              >
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
            {isLoading ? (
              // Skeleton Loaders while scraping or loading
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={`skeleton-${i}`} className="animate-pulse">
                  <td className="py-3.5 px-4 text-center">
                    <div className="w-4 h-4 rounded bg-slate-300 dark:bg-slate-700 mx-auto" />
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-md bg-slate-300 dark:bg-slate-700 shrink-0" />
                      <div className="space-y-1.5">
                        <div className="h-3 w-24 rounded bg-slate-300 dark:bg-slate-700" />
                        <div className="h-2.5 w-16 rounded bg-slate-200 dark:bg-slate-800" />
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="h-3 w-36 rounded bg-slate-300 dark:bg-slate-700" />
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="h-3 w-24 rounded bg-slate-300 dark:bg-slate-700" />
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="h-3 w-40 rounded bg-slate-300 dark:bg-slate-700" />
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="h-3 w-20 rounded bg-slate-300 dark:bg-slate-700" />
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="h-3 w-20 rounded bg-slate-300 dark:bg-slate-700" />
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="h-3 w-12 rounded bg-slate-300 dark:bg-slate-700 mx-auto" />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="h-6 w-16 rounded bg-slate-300 dark:bg-slate-700 ml-auto" />
                  </td>
                </tr>
              ))
            ) : jobs.length === 0 ? (
              // Designed Empty State
              <tr>
                <td colSpan={9} className="py-16 text-center">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                    style={{ backgroundColor: 'var(--bg-subtle)', color: 'var(--text-muted)' }}
                  >
                    <Building2 className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    No jobs match these filters
                  </p>
                  <p className="text-xs mt-1 mb-4" style={{ color: 'var(--text-muted)' }}>
                    Try relaxing your match threshold, salary range, or location criteria.
                  </p>
                  {onResetFilters && (
                    <button
                      type="button"
                      onClick={onResetFilters}
                      className="btn-secondary text-xs py-1.5 px-3"
                    >
                      Clear filters
                    </button>
                  )}
                </td>
              </tr>
            ) : (
              jobs.map((j) => {
                const isSelected = selectedJobIds.includes(j.id);
                const isApplying = isApplyingId === j.id;
                const isSent = sentJobIds.includes(j.id);

                // Match score normalization & color thresholds (≥90 strong, 70–89 good, <70 muted)
                const score = j.match_score ?? 0;
                let scoreColor = 'var(--text-muted)';
                let scoreBg = 'var(--bg-subtle)';
                if (score >= 90) {
                  scoreColor = 'var(--success-text)';
                  scoreBg = 'var(--success-subtle)';
                } else if (score >= 70) {
                  scoreColor = 'var(--accent)';
                  scoreBg = 'var(--accent-subtle)';
                }

                // Salary display via Indian number grouping & compact fallback
                const salDisplay = formatSalaryDisplay(j.salary_min ?? null, j.salary_max ?? null, j.salary);

                const isVerified = isEmailVerified(j);
                const email = isVerified ? (j.recruiter_email || '').trim() : '';

                return (
                  <tr
                    key={j.id}
                    className="transition-colors duration-150 group"
                    style={{
                      backgroundColor: isSelected
                        ? 'var(--accent-subtle)'
                        : undefined,
                    }}
                  >
                    {/* Checkbox */}
                    <td className="py-3.5 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectJob(j.id)}
                        className="rounded cursor-pointer accent-[var(--accent)]"
                        aria-label={`Select job at ${j.company}`}
                      />
                    </td>

                    {/* Company */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="w-7 h-7 rounded-md flex items-center justify-center font-bold text-[10px] shrink-0 uppercase"
                          style={{
                            backgroundColor: 'var(--bg-subtle)',
                            color: 'var(--text-secondary)',
                            border: '1px solid var(--border-subtle)',
                          }}
                        >
                          {j.company.slice(0, 2)}
                        </div>
                        <div className="min-w-0 truncate">
                          <span className="font-semibold block truncate leading-tight" style={{ color: 'var(--text-primary)' }}>
                            {j.company}
                          </span>
                          <span className="text-[10px] block truncate leading-tight mt-0.5" style={{ color: 'var(--text-muted)' }}>
                            {j.company_size || 'Company'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Position */}
                    <td className="py-3.5 px-4 max-w-[210px]">
                      <div className="min-w-0">
                        <span
                          className="font-medium text-slate-800 dark:text-slate-200 block truncate"
                          title={j.title}
                        >
                          {j.title}
                        </span>
                        {j.work_type && (
                          <span
                            className="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium"
                            style={{
                              backgroundColor: 'var(--bg-subtle)',
                              color: 'var(--text-muted)',
                            }}
                          >
                            {j.work_type}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* HR Recruiter */}
                    <td className="py-3.5 px-4 font-medium" style={{ color: 'var(--text-secondary)' }}>
                      <span className="truncate block max-w-[130px]" title={j.recruiter_name || 'Hiring Lead'}>
                        {j.recruiter_name || 'Hiring Lead'}
                      </span>
                    </td>

                    {/* HR Contact (Email + Copy action + Verification badge) */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-1 min-w-[200px] max-w-[240px]">
                        {isVerified && email ? (
                          <>
                            <div className="flex items-center gap-1.5">
                              <a
                                href={getGmailComposeUrl(email, `Job Application: ${j.title || 'Technical Role'} at ${j.company}`)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-mono text-xs hover:underline flex items-center gap-1 group/mail font-medium max-w-[180px] truncate"
                                style={{ color: 'var(--accent)' }}
                                title={`Open Gmail compose to ${email}`}
                              >
                                <Mail className="w-3.5 h-3.5 text-sky-400 shrink-0 group-hover/mail:scale-110 transition-transform" />
                                <span className="truncate select-all">{email}</span>
                              </a>
                              <button
                                type="button"
                                onClick={(e) => handleCopyEmail(email, e)}
                                className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors shrink-0"
                                title="Copy recruiter email"
                                aria-label="Copy recruiter email"
                              >
                                {copiedEmail === email ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" />
                                )}
                              </button>
                            </div>

                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold shrink-0"
                                style={{
                                  backgroundColor: 'var(--success-subtle)',
                                  color: 'var(--success-text)',
                                  border: '1px solid var(--success-border)',
                                }}
                                title="Verified deliverable via Hunter.io"
                              >
                                <CheckCircle2 className="w-2.5 h-2.5" />
                                Hunter Verified
                              </span>

                              {/* Phone / WhatsApp if available */}
                              {j.recruiter_phone && (
                                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                                  <a
                                    href={`tel:${j.recruiter_phone.replace(/\s+/g, '')}`}
                                    className="flex items-center gap-1 hover:text-[var(--accent)]"
                                  >
                                    <Phone className="w-2.5 h-2.5" />
                                    {j.recruiter_phone}
                                  </a>
                                  <a
                                    href={`https://wa.me/${j.recruiter_phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                                      `Hi ${j.recruiter_name || 'Hiring Team'}, I am reaching out regarding the ${j.title} opening at ${j.company}.`
                                    )}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 text-emerald-600 hover:underline"
                                  >
                                    <MessageCircle className="w-2.5 h-2.5" />
                                    WhatsApp
                                  </a>
                                </div>
                              )}
                            </div>
                          </>
                        ) : (
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 italic">
                            <ShieldAlert className="w-3.5 h-3.5 text-amber-500/70 shrink-0" />
                            <span>No verified email</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Location */}
                    <td className="py-3.5 px-4">
                      <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[110px]" title={cleanDisplayLocation(j.location)}>
                          {cleanDisplayLocation(j.location)}
                        </span>
                      </span>
                    </td>

                    {/* Salary (Formatted with Indian grouping system, tabular numerals) */}
                    <td className="py-3.5 px-4 font-medium tabular-nums">
                      {salDisplay.isKnown ? (
                        <div title={salDisplay.full}>
                          <span className="font-semibold text-slate-900 dark:text-slate-100">
                            {salDisplay.compact}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-500 truncate block max-w-[100px]" title={salDisplay.full}>
                          {salDisplay.compact || salDisplay.full}
                        </span>
                      )}
                    </td>

                    {/* Match Score (Progress bar with thresholds: ≥90 strong, 70–89 good, <70 muted) */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex flex-col items-center gap-1 w-14">
                        <span
                          className="text-[11px] font-semibold tabular-nums px-1.5 py-0.5 rounded"
                          style={{
                            backgroundColor: scoreBg,
                            color: scoreColor,
                          }}
                        >
                          {score}%
                        </span>
                        <div
                          className="w-full h-1 rounded-full overflow-hidden"
                          style={{ backgroundColor: 'var(--border-subtle)' }}
                        >
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${Math.min(100, Math.max(5, score))}%`,
                              backgroundColor: scoreColor,
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Actions Column */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onOpenStudio(j)}
                          className="p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                          style={{ color: 'var(--text-secondary)' }}
                          title="Preview email"
                          aria-label="Preview email"
                        >
                          <Mail className="w-3.5 h-3.5" />
                        </button>

                        {j.source_url && (!j.recruiter_email || !j.recruiter_email.includes('@')) ? (
                          <a
                            href={j.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => handleSingleSend(j.id)}
                            className="btn-primary text-[11px] py-1 px-2.5 flex items-center gap-1 shrink-0"
                            title={`Open portal listing on ${j.source_portal || 'portal'}`}
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Portal Link</span>
                          </a>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSingleSend(j.id)}
                            disabled={isApplying || isSent}
                            className="btn-primary text-[11px] py-1 px-2.5 gap-1 shrink-0"
                            style={
                              isSent
                                ? {
                                    backgroundColor: 'var(--success)',
                                    color: '#ffffff',
                                  }
                                : undefined
                            }
                          >
                            {isApplying ? (
                              <div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                            ) : isSent ? (
                              <Check className="w-3 h-3" />
                            ) : (
                              <Send className="w-3 h-3" />
                            )}
                            <span>{isApplying ? '...' : isSent ? 'Sent' : 'Send'}</span>
                          </button>
                        )}

                        {j.source_url && j.recruiter_email && j.recruiter_email.includes('@') && (
                          <a
                            href={j.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            title="Open portal link"
                            aria-label="Open portal link"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Floating Universal Bottom Slide Tab (When table overflows horizontally) ── */}
      {scrollInfo.hasOverflow && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-auto shadow-2xl rounded-full glass border px-3 py-1.5 flex items-center gap-2 animate-slide-up"
          style={{ borderColor: 'var(--border-default)', backgroundColor: 'var(--bg-surface)' }}
        >
          <button
            type="button"
            onClick={() => scrollByAmount(-260)}
            disabled={!scrollInfo.canScrollLeft}
            className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-30 cursor-pointer text-sky-500"
            title="Slide Left"
            aria-label="Slide Left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 px-1 select-none whitespace-nowrap">
            Slide Columns ({scrollInfo.percentage}%)
          </span>
          <button
            type="button"
            onClick={() => scrollByAmount(260)}
            disabled={!scrollInfo.canScrollRight}
            className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-30 cursor-pointer text-sky-500"
            title="Slide Right"
            aria-label="Slide Right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => scrollToPercent(100)}
            className="ml-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25 transition-colors cursor-pointer whitespace-nowrap"
            title="Jump to Actions column"
          >
            ⚡ Actions
          </button>
        </div>
      )}
    </div>
  );
}
