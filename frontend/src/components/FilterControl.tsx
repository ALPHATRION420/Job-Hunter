import React, { useState, useRef, useEffect } from 'react';
import {
  SlidersHorizontal,
  X,
  RotateCcw,
  ShieldCheck,
  Building2,
  DollarSign,
  MapPin,
  Globe,
  Target,
} from 'lucide-react';
import type { JobFilters } from '../utils/jobFilterSort';
import { LOCATION_SCOPES, INDIAN_CITIES } from '../utils/locations';

interface FilterControlProps {
  filters: JobFilters;
  onFilterChange: (newFilters: JobFilters) => void;
  onResetFilters: () => void;
}

export const FilterControl: React.FC<FilterControlProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close popover when clicking outside
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutside);
    }
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [isOpen]);

  const update = <K extends keyof JobFilters>(key: K, value: JobFilters[K]) => {
    onFilterChange({ ...filters, [key]: value });
  };

  // Build active filter chips
  const activeChips: { id: string; label: string; onRemove: () => void }[] = [];

  if (filters.minMatch > 0) {
    activeChips.push({
      id: 'minMatch',
      label: `Match ≥ ${filters.minMatch}%`,
      onRemove: () => update('minMatch', 0),
    });
  }

  if (filters.verifiedHrOnly) {
    activeChips.push({
      id: 'verifiedHrOnly',
      label: 'Verified HR Only',
      onRemove: () => update('verifiedHrOnly', false),
    });
  }

  if (filters.minSalaryLpa > 0 || filters.maxSalaryLpa < 100) {
    activeChips.push({
      id: 'salary',
      label: `Salary: ₹${filters.minSalaryLpa}–₹${filters.maxSalaryLpa} LPA`,
      onRemove: () => {
        onFilterChange({ ...filters, minSalaryLpa: 0, maxSalaryLpa: 100 });
      },
    });
  }

  if (filters.workType !== 'All') {
    activeChips.push({
      id: 'workType',
      label: `Work: ${filters.workType}`,
      onRemove: () => update('workType', 'All'),
    });
  }

  if (filters.locationScope !== 'India') {
    activeChips.push({
      id: 'locationScope',
      label: `Region: ${filters.locationScope}`,
      onRemove: () => update('locationScope', 'India'),
    });
  }

  if (filters.selectedCity !== 'All Cities in India') {
    activeChips.push({
      id: 'selectedCity',
      label: `City: ${filters.selectedCity}`,
      onRemove: () => update('selectedCity', 'All Cities in India'),
    });
  }

  if (filters.companySize !== 'All') {
    activeChips.push({
      id: 'companySize',
      label: `Size: ${filters.companySize}`,
      onRemove: () => update('companySize', 'All'),
    });
  }

  const activeCount = activeChips.length;

  return (
    <div className="flex flex-wrap items-center gap-2 relative" ref={containerRef}>
      {/* ── Filter Trigger Button ── */}
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="btn-secondary text-xs py-2 px-3.5 flex items-center gap-2 select-none"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        <SlidersHorizontal className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
        <span>Filters</span>
        {activeCount > 0 && (
          <span
            className="w-5 h-5 rounded-full text-[10px] font-semibold flex items-center justify-center tabular-nums"
            style={{
              backgroundColor: 'var(--accent)',
              color: 'var(--accent-contrast)',
            }}
          >
            {activeCount}
          </span>
        )}
      </button>

      {/* ── Active Filter Removable Chips ── */}
      <div className="flex flex-wrap items-center gap-1.5 min-w-0">
        {activeChips.map((chip) => (
          <span
            key={chip.id}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium animate-in fade-in duration-150"
            style={{
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-secondary)',
            }}
          >
            <span>{chip.label}</span>
            <button
              type="button"
              onClick={chip.onRemove}
              className="p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors focus-visible:ring-1"
              aria-label={`Remove filter ${chip.label}`}
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}

        {activeCount > 0 && (
          <button
            type="button"
            onClick={onResetFilters}
            className="text-xs font-medium px-2 py-1 rounded hover:underline focus-visible:ring-1 transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            Clear all
          </button>
        )}
      </div>

      {/* ── Glass Popover / Drawer Panel ── */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Filter Options"
          className="absolute left-0 top-full mt-2 w-[340px] sm:w-[420px] max-w-[95vw] rounded-xl glass-panel p-5 z-40 shadow-xl animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="flex items-center justify-between pb-3 border-b mb-4" style={{ borderColor: 'var(--border-subtle)' }}>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4" style={{ color: 'var(--accent)' }} />
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                Filter Jobs & HRs
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              aria-label="Close filters"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
            {/* Match Score Threshold Presets & Slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                  <Target className="w-3.5 h-3.5" />
                  Minimum Match Score
                </label>
                <span className="text-xs font-semibold tabular-nums" style={{ color: 'var(--accent)' }}>
                  {filters.minMatch > 0 ? `≥ ${filters.minMatch}%` : 'Any match'}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 mb-2">
                {[
                  { label: 'All', val: 0 },
                  { label: '≥ 70%', val: 70 },
                  { label: '≥ 80%', val: 80 },
                  { label: '≥ 90%', val: 90 },
                ].map(({ label, val }) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => update('minMatch', val)}
                    className="py-1.5 text-xs rounded font-medium transition-colors"
                    style={{
                      backgroundColor: filters.minMatch === val ? 'var(--accent)' : 'var(--bg-subtle)',
                      color: filters.minMatch === val ? 'var(--accent-contrast)' : 'var(--text-secondary)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <input
                type="range"
                min="0"
                max="95"
                step="5"
                value={filters.minMatch}
                onChange={(e) => update('minMatch', Number(e.target.value))}
                className="w-full accent-[var(--accent)] cursor-pointer"
              />
            </div>

            {/* Verified HR Only Toggle */}
            <div
              className="flex items-center justify-between p-3 rounded-lg"
              style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)' }}
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <div>
                  <div className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                    Verified HR Only
                  </div>
                  <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                    Filter exclusively verified direct contacts
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={filters.verifiedHrOnly}
                onChange={(e) => update('verifiedHrOnly', e.target.checked)}
                className="w-4 h-4 rounded cursor-pointer accent-[var(--accent)]"
              />
            </div>

            {/* Work Mode */}
            <div>
              <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Work Mode
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {['All', 'Remote', 'Hybrid', 'On-site'].map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => update('workType', mode)}
                    className="py-1.5 text-xs rounded font-medium transition-colors"
                    style={{
                      backgroundColor: filters.workType === mode ? 'var(--accent)' : 'var(--bg-subtle)',
                      color: filters.workType === mode ? 'var(--accent-contrast)' : 'var(--text-secondary)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Salary Range (LPA) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                  <DollarSign className="w-3.5 h-3.5" />
                  Salary Range (LPA)
                </label>
                <span className="text-xs font-semibold tabular-nums" style={{ color: 'var(--accent)' }}>
                  ₹{filters.minSalaryLpa} – ₹{filters.maxSalaryLpa} LPA
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-slate-500 block mb-0.5">Min (LPA)</span>
                  <input
                    type="number"
                    min="0"
                    max={filters.maxSalaryLpa}
                    value={filters.minSalaryLpa}
                    onChange={(e) => update('minSalaryLpa', Math.max(0, Number(e.target.value)))}
                    className="w-full text-xs p-2 rounded border outline-none bg-transparent tabular-nums"
                    style={{ borderColor: 'var(--border-default)' }}
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block mb-0.5">Max (LPA)</span>
                  <input
                    type="number"
                    min={filters.minSalaryLpa}
                    max="100"
                    value={filters.maxSalaryLpa}
                    onChange={(e) => update('maxSalaryLpa', Math.min(100, Math.max(filters.minSalaryLpa, Number(e.target.value))))}
                    className="w-full text-xs p-2 rounded border outline-none bg-transparent tabular-nums"
                    style={{ borderColor: 'var(--border-default)' }}
                  />
                </div>
              </div>
            </div>

            {/* Location & City Selector */}
            <div className="space-y-2">
              <div>
                <label className="text-xs font-medium flex items-center gap-1.5 mb-1" style={{ color: 'var(--text-secondary)' }}>
                  <Globe className="w-3.5 h-3.5" />
                  Region
                </label>
                <select
                  value={filters.locationScope}
                  onChange={(e) => {
                    const newScope = e.target.value;
                    onFilterChange({
                      ...filters,
                      locationScope: newScope,
                      selectedCity: newScope === 'India' ? filters.selectedCity : 'All Cities in India',
                    });
                  }}
                  className="w-full text-xs p-2 rounded border outline-none bg-transparent"
                  style={{ borderColor: 'var(--border-default)' }}
                >
                  {LOCATION_SCOPES.map((scope) => (
                    <option key={scope} value={scope} className="bg-slate-900 text-slate-200">
                      {scope}
                    </option>
                  ))}
                </select>
              </div>

              {filters.locationScope === 'India' && (
                <div>
                  <label className="text-xs font-medium flex items-center gap-1.5 mb-1" style={{ color: 'var(--text-secondary)' }}>
                    <MapPin className="w-3.5 h-3.5" />
                    City in India
                  </label>
                  <select
                    value={filters.selectedCity}
                    onChange={(e) => update('selectedCity', e.target.value)}
                    className="w-full text-xs p-2 rounded border outline-none bg-transparent truncate"
                    style={{ borderColor: 'var(--border-default)' }}
                  >
                    {INDIAN_CITIES.map((city) => (
                      <option key={city} value={city} className="bg-slate-900 text-slate-200">
                        {city}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Company Size */}
            <div>
              <label className="text-xs font-medium flex items-center gap-1.5 mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                <Building2 className="w-3.5 h-3.5" />
                Company Size
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {['All', 'Startup', 'Mid-Market', 'Enterprise'].map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => update('companySize', size)}
                    className="py-1.5 text-xs rounded font-medium transition-colors"
                    style={{
                      backgroundColor: filters.companySize === size ? 'var(--accent)' : 'var(--bg-subtle)',
                      color: filters.companySize === size ? 'var(--accent-contrast)' : 'var(--text-secondary)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t mt-4" style={{ borderColor: 'var(--border-subtle)' }}>
            <button
              type="button"
              onClick={onResetFilters}
              className="text-xs font-medium flex items-center gap-1 hover:underline"
              style={{ color: 'var(--text-muted)' }}
            >
              <RotateCcw className="w-3 h-3" />
              Reset all
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="btn-primary text-xs py-1.5 px-4"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
