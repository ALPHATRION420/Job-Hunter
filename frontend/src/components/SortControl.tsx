import React from 'react';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Target,
  DollarSign,
  Building2,
  Briefcase,
  ShieldCheck,
  Clock,
} from 'lucide-react';
import type { JobSortConfig, SortField } from '../utils/jobFilterSort';

interface SortControlProps {
  sortConfig: JobSortConfig;
  onSortChange: (newConfig: JobSortConfig) => void;
}

const SORT_OPTIONS: { field: SortField; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { field: 'match_score', label: 'Match Score', icon: Target },
  { field: 'salary', label: 'Salary', icon: DollarSign },
  { field: 'company', label: 'Company Name', icon: Building2 },
  { field: 'title', label: 'Job Title', icon: Briefcase },
  { field: 'verification', label: 'Verified HR', icon: ShieldCheck },
  { field: 'date_added', label: 'Date Added', icon: Clock },
];

export const SortControl: React.FC<SortControlProps> = ({ sortConfig, onSortChange }) => {
  const handleSelectField = (field: SortField) => {
    if (field === sortConfig.field) {
      onSortChange({
        field,
        direction: sortConfig.direction === 'asc' ? 'desc' : 'asc',
      });
    } else {
      const defaultDir = field === 'company' || field === 'title' ? 'asc' : 'desc';
      onSortChange({ field, direction: defaultDir });
    }
  };

  const toggleDirection = () => {
    onSortChange({
      ...sortConfig,
      direction: sortConfig.direction === 'asc' ? 'desc' : 'asc',
    });
  };

  return (
    <div className="flex items-center gap-1.5 select-none">
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs" style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-default)' }}>
        <ArrowUpDown className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
        <span className="font-medium text-slate-500 hidden sm:inline">Sort:</span>
        <select
          value={sortConfig.field}
          onChange={(e) => handleSelectField(e.target.value as SortField)}
          className="bg-transparent text-xs font-semibold outline-none cursor-pointer pr-1"
          style={{ color: 'var(--text-primary)' }}
          aria-label="Sort by field"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.field} value={opt.field} className="bg-slate-900 text-slate-100">
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <button
        type="button"
        onClick={toggleDirection}
        className="btn-secondary text-xs py-1.5 px-2.5 flex items-center gap-1"
        title={`Sort ${sortConfig.direction === 'asc' ? 'Ascending' : 'Descending'} (Click to toggle)`}
        aria-label={`Sort direction: currently ${sortConfig.direction}`}
      >
        {sortConfig.direction === 'asc' ? (
          <>
            <ArrowUp className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-[11px] font-medium hidden md:inline">Asc</span>
          </>
        ) : (
          <>
            <ArrowDown className="w-3.5 h-3.5 text-sky-500" />
            <span className="text-[11px] font-medium hidden md:inline">Desc</span>
          </>
        )}
      </button>
    </div>
  );
};
