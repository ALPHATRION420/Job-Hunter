import React from 'react';
import {
  Filter,
  SlidersHorizontal,
  X,
  Target,
  DollarSign,
  ShieldCheck,
  Building2,
  Briefcase,
  Laptop,
  GraduationCap,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import type { JobFilters } from '../utils/jobFilterSort';

interface FilterToolbarProps {
  filters: JobFilters;
  onFilterChange: (newFilters: JobFilters) => void;
  onResetFilters: () => void;
  totalCount: number;
  filteredCount: number;
  showDrawer: boolean;
  onToggleDrawer: () => void;
}

const MATCH_THRESHOLDS = [
  { value: 0, label: 'All Matches' },
  { value: 50, label: '≥ 50%' },
  { value: 60, label: '≥ 60%' },
  { value: 70, label: '≥ 70%' },
  { value: 80, label: '≥ 80%' },
  { value: 90, label: '≥ 90%' },
];

const SALARY_THRESHOLDS = [
  { value: 0, label: 'Any Salary' },
  { value: 5, label: '≥ ₹5 LPA' },
  { value: 10, label: '≥ ₹10 LPA' },
  { value: 15, label: '≥ ₹15 LPA' },
  { value: 25, label: '≥ ₹25 LPA' },
  { value: 40, label: '≥ ₹40 LPA' },
];

const EXP_OPTIONS = [
  { value: 10, label: 'Any Experience' },
  { value: 2, label: 'Fresher / Entry (≤ 2 yrs)' },
  { value: 5, label: 'Mid-Level (≤ 5 yrs)' },
  { value: 8, label: 'Senior (≤ 8 yrs)' },
];

export const FilterToolbar: React.FC<FilterToolbarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  totalCount,
  filteredCount,
  showDrawer,
  onToggleDrawer,
}) => {
  const updateFilter = <K extends keyof JobFilters>(key: K, value: JobFilters[K]) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const activeFilterList: { id: string; label: string; onRemove: () => void }[] = [];

  if (filters.minMatch > 0) {
    activeFilterList.push({
      id: 'minMatch',
      label: `Match ≥ ${filters.minMatch}%`,
      onRemove: () => updateFilter('minMatch', 0),
    });
  }
  if (filters.minSalaryLpa > 0) {
    activeFilterList.push({
      id: 'minSalaryLpa',
      label: `Salary ≥ ₹${filters.minSalaryLpa} LPA`,
      onRemove: () => updateFilter('minSalaryLpa', 0),
    });
  }
  if (filters.verification !== 'All') {
    activeFilterList.push({
      id: 'verification',
      label: `HR: ${filters.verification}`,
      onRemove: () => updateFilter('verification', 'All'),
    });
  }
  if (filters.workType !== 'All') {
    activeFilterList.push({
      id: 'workType',
      label: `Work: ${filters.workType}`,
      onRemove: () => updateFilter('workType', 'All'),
    });
  }
  if (filters.jobType !== 'All') {
    activeFilterList.push({
      id: 'jobType',
      label: `Type: ${filters.jobType}`,
      onRemove: () => updateFilter('jobType', 'All'),
    });
  }
  if (filters.sourcePortal !== 'All') {
    activeFilterList.push({
      id: 'sourcePortal',
      label: `Portal: ${filters.sourcePortal}`,
      onRemove: () => updateFilter('sourcePortal', 'All'),
    });
  }
  if (filters.companySize !== 'All') {
    activeFilterList.push({
      id: 'companySize',
      label: `Size: ${filters.companySize}`,
      onRemove: () => updateFilter('companySize', 'All'),
    });
  }
  if (filters.maxExp < 10) {
    activeFilterList.push({
      id: 'maxExp',
      label: `Exp ≤ ${filters.maxExp} yrs`,
      onRemove: () => updateFilter('maxExp', 10),
    });
  }

  // Quick preset toggles
  const isTopMatch = filters.minMatch === 70;
  const isVerifiedOnly = filters.verification === 'Verified';
  const isRemoteOnly = filters.workType === 'Remote';
  const isHighSalary = filters.minSalaryLpa === 15;

  return (
    <div className="space-y-3">
      {/* Top Filter Bar with Presets & Drawer Toggle */}
      <div
        className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all"
        style={{
          background: 'rgba(8, 12, 22, 0.9)',
          border: '1px solid rgba(255, 255, 255, 0.07)',
          backdropFilter: 'blur(12px)',
        }}
      >
        {/* Left: Quick Filter Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 mr-1">
            <Filter className="w-3.5 h-3.5 text-emerald-400" />
            <span>Quick Filters:</span>
          </div>

          {/* Preset 1: Top Match */}
          <button
            onClick={() => updateFilter('minMatch', isTopMatch ? 0 : 70)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
            style={{
              background: isTopMatch
                ? 'rgba(16, 185, 129, 0.25)'
                : 'rgba(15, 23, 42, 0.6)',
              border: isTopMatch
                ? '1px solid rgba(16, 185, 129, 0.5)'
                : '1px solid rgba(30, 41, 59, 0.6)',
              color: isTopMatch ? '#34d399' : '#94a3b8',
            }}
          >
            <Target className="w-3 h-3 text-emerald-400" />
            <span>Top Match (≥70%)</span>
          </button>

          {/* Preset 2: Verified HR */}
          <button
            onClick={() => updateFilter('verification', isVerifiedOnly ? 'All' : 'Verified')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
            style={{
              background: isVerifiedOnly
                ? 'rgba(99, 102, 241, 0.25)'
                : 'rgba(15, 23, 42, 0.6)',
              border: isVerifiedOnly
                ? '1px solid rgba(99, 102, 241, 0.5)'
                : '1px solid rgba(30, 41, 59, 0.6)',
              color: isVerifiedOnly ? '#a5b4fc' : '#94a3b8',
            }}
          >
            <ShieldCheck className="w-3 h-3 text-indigo-400" />
            <span>Verified HRs Only</span>
          </button>

          {/* Preset 3: Remote Only */}
          <button
            onClick={() => updateFilter('workType', isRemoteOnly ? 'All' : 'Remote')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
            style={{
              background: isRemoteOnly
                ? 'rgba(14, 165, 233, 0.25)'
                : 'rgba(15, 23, 42, 0.6)',
              border: isRemoteOnly
                ? '1px solid rgba(14, 165, 233, 0.5)'
                : '1px solid rgba(30, 41, 59, 0.6)',
              color: isRemoteOnly ? '#38bdf8' : '#94a3b8',
            }}
          >
            <Laptop className="w-3 h-3 text-sky-400" />
            <span>Remote Only</span>
          </button>

          {/* Preset 4: High Salary */}
          <button
            onClick={() => updateFilter('minSalaryLpa', isHighSalary ? 0 : 15)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
            style={{
              background: isHighSalary
                ? 'rgba(245, 158, 11, 0.25)'
                : 'rgba(15, 23, 42, 0.6)',
              border: isHighSalary
                ? '1px solid rgba(245, 158, 11, 0.5)'
                : '1px solid rgba(30, 41, 59, 0.6)',
              color: isHighSalary ? '#fbbf24' : '#94a3b8',
            }}
          >
            <DollarSign className="w-3 h-3 text-amber-400" />
            <span>Salary ≥ ₹15 LPA</span>
          </button>
        </div>

        {/* Right: Counter & More Filters Button */}
        <div className="flex items-center gap-3">
          {/* Result Counter Badge */}
          <div
            className="px-3 py-1.5 rounded-lg text-xs font-bold font-mono"
            style={{
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: filteredCount < totalCount ? '#38bdf8' : '#94a3b8',
            }}
          >
            Showing <span className="text-white font-black">{filteredCount}</span> of {totalCount}
          </div>

          {/* Detailed Filters Drawer Button */}
          <button
            onClick={onToggleDrawer}
            className="relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
            style={{
              background: showDrawer ? 'rgba(99, 102, 241, 0.2)' : 'rgba(15, 23, 42, 0.8)',
              border: showDrawer ? '1px solid rgba(99, 102, 241, 0.45)' : '1px solid rgba(30, 41, 59, 0.8)',
              color: showDrawer ? '#a5b4fc' : '#cbd5e1',
            }}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
            <span>All Filters</span>
            {activeFilterList.length > 0 && (
              <span
                className="w-4 h-4 rounded-full text-[10px] font-black flex items-center justify-center ml-0.5"
                style={{ background: '#6366f1', color: 'white' }}
              >
                {activeFilterList.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Active Filter Chips Bar */}
      {activeFilterList.length > 0 && (
        <div
          className="flex flex-wrap items-center gap-2 px-3.5 py-2 rounded-xl"
          style={{
            background: 'rgba(15, 23, 42, 0.5)',
            border: '1px solid rgba(56, 189, 248, 0.1)',
          }}
        >
          <span className="text-[11px] font-bold text-slate-400 mr-1">Active filters:</span>
          {activeFilterList.map((chip) => (
            <span
              key={chip.id}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold"
              style={{
                background: 'rgba(14, 165, 233, 0.12)',
                border: '1px solid rgba(14, 165, 233, 0.3)',
                color: '#7dd3fc',
              }}
            >
              <span>{chip.label}</span>
              <button
                onClick={chip.onRemove}
                className="hover:text-white transition-colors cursor-pointer"
                title={`Remove ${chip.label}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          <button
            onClick={onResetFilters}
            className="flex items-center gap-1 text-[11px] font-bold text-rose-400 hover:text-rose-300 ml-auto transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear All</span>
          </button>
        </div>
      )}

      {/* Expandable Detailed Filter Panel */}
      {showDrawer && (
        <div
          className="p-5 rounded-2xl space-y-5 animate-slide-down"
          style={{
            background: 'rgba(6, 10, 20, 0.95)',
            border: '1px solid rgba(56, 189, 248, 0.2)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          }}
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-sky-400" />
              <h4 className="text-xs font-bold text-slate-200">Detailed Filter Criteria</h4>
            </div>
            {activeFilterList.length > 0 && (
              <button
                onClick={onResetFilters}
                className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset to Default
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Minimum ATS Match % */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-emerald-400" />
                <span>Min ATS Match Score</span>
              </label>
              <select
                value={filters.minMatch}
                onChange={(e) => updateFilter('minMatch', Number(e.target.value))}
                className="w-full text-xs font-semibold text-emerald-300 px-3 py-2 rounded-xl outline-none cursor-pointer"
                style={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(16, 185, 129, 0.3)' }}
              >
                {MATCH_THRESHOLDS.map((t) => (
                  <option key={t.value} value={t.value} className="bg-slate-900 text-slate-200">
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Minimum Salary Floor */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                <span>Minimum Salary Floor</span>
              </label>
              <select
                value={filters.minSalaryLpa}
                onChange={(e) => updateFilter('minSalaryLpa', Number(e.target.value))}
                className="w-full text-xs font-semibold text-amber-300 px-3 py-2 rounded-xl outline-none cursor-pointer"
                style={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(245, 158, 11, 0.3)' }}
              >
                {SALARY_THRESHOLDS.map((t) => (
                  <option key={t.value} value={t.value} className="bg-slate-900 text-slate-200">
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. HR Verification Status */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span>HR Verification Status</span>
              </label>
              <select
                value={filters.verification}
                onChange={(e) => updateFilter('verification', e.target.value)}
                className="w-full text-xs font-semibold text-indigo-300 px-3 py-2 rounded-xl outline-none cursor-pointer"
                style={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(99, 102, 241, 0.3)' }}
              >
                <option value="All" className="bg-slate-900 text-slate-200">All Contacts</option>
                <option value="Verified" className="bg-slate-900 text-slate-200">Verified HR Only</option>
                <option value="Direct" className="bg-slate-900 text-slate-200">Direct Recruiter Email Available</option>
                <option value="Unverified" className="bg-slate-900 text-slate-200">Unverified Contacts</option>
              </select>
            </div>

            {/* 4. Work Arrangement */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Laptop className="w-3.5 h-3.5 text-sky-400" />
                <span>Work Arrangement</span>
              </label>
              <select
                value={filters.workType}
                onChange={(e) => updateFilter('workType', e.target.value)}
                className="w-full text-xs font-semibold text-sky-300 px-3 py-2 rounded-xl outline-none cursor-pointer"
                style={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(56, 189, 248, 0.3)' }}
              >
                <option value="All" className="bg-slate-900 text-slate-200">All Arrangements</option>
                <option value="Remote" className="bg-slate-900 text-slate-200">Remote</option>
                <option value="Hybrid" className="bg-slate-900 text-slate-200">Hybrid</option>
                <option value="On-site" className="bg-slate-900 text-slate-200">On-site</option>
              </select>
            </div>

            {/* 5. Job Commitment */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-purple-400" />
                <span>Job Commitment</span>
              </label>
              <select
                value={filters.jobType}
                onChange={(e) => updateFilter('jobType', e.target.value)}
                className="w-full text-xs font-semibold text-purple-300 px-3 py-2 rounded-xl outline-none cursor-pointer"
                style={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(168, 85, 247, 0.3)' }}
              >
                <option value="All" className="bg-slate-900 text-slate-200">All Types</option>
                <option value="Full-time" className="bg-slate-900 text-slate-200">Full-time</option>
                <option value="Internship" className="bg-slate-900 text-slate-200">Internship</option>
                <option value="Contract" className="bg-slate-900 text-slate-200">Contract</option>
              </select>
            </div>

            {/* 6. Experience Level */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-teal-400" />
                <span>Max Experience Cap</span>
              </label>
              <select
                value={filters.maxExp}
                onChange={(e) => updateFilter('maxExp', Number(e.target.value))}
                className="w-full text-xs font-semibold text-teal-300 px-3 py-2 rounded-xl outline-none cursor-pointer"
                style={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(20, 184, 166, 0.3)' }}
              >
                {EXP_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-200">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 7. Source Portal */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                <span>Source Platform</span>
              </label>
              <select
                value={filters.sourcePortal}
                onChange={(e) => updateFilter('sourcePortal', e.target.value)}
                className="w-full text-xs font-semibold text-pink-300 px-3 py-2 rounded-xl outline-none cursor-pointer"
                style={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(236, 72, 153, 0.3)' }}
              >
                <option value="All" className="bg-slate-900 text-slate-200">All Platforms</option>
                <option value="LinkedIn" className="bg-slate-900 text-slate-200">LinkedIn</option>
                <option value="Naukri" className="bg-slate-900 text-slate-200">Naukri</option>
                <option value="Indeed" className="bg-slate-900 text-slate-200">Indeed</option>
                <option value="Foundit" className="bg-slate-900 text-slate-200">Foundit</option>
                <option value="Hunter" className="bg-slate-900 text-slate-200">Hunter.io Verified</option>
              </select>
            </div>

            {/* 8. Company Size */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                <span>Company Scale</span>
              </label>
              <select
                value={filters.companySize}
                onChange={(e) => updateFilter('companySize', e.target.value)}
                className="w-full text-xs font-semibold text-blue-300 px-3 py-2 rounded-xl outline-none cursor-pointer"
                style={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(59, 130, 246, 0.3)' }}
              >
                <option value="All" className="bg-slate-900 text-slate-200">All Scales</option>
                <option value="Startup" className="bg-slate-900 text-slate-200">Startup (1–100)</option>
                <option value="Mid-Market" className="bg-slate-900 text-slate-200">Mid-Market (100–500)</option>
                <option value="Enterprise" className="bg-slate-900 text-slate-200">Enterprise (500+)</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
