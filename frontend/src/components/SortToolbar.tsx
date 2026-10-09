import React from 'react';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Target,
  DollarSign,
  ShieldCheck,
  Building2,
  Briefcase,
  Clock,
} from 'lucide-react';
import type { JobSortConfig, SortField } from '../utils/jobFilterSort';

interface SortToolbarProps {
  sortConfig: JobSortConfig;
  onSortChange: (newConfig: JobSortConfig) => void;
}

interface SortOptionDef {
  field: SortField;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  descSub: string;
  ascSub: string;
}

const SORT_OPTIONS: SortOptionDef[] = [
  {
    field: 'match_score',
    label: 'Match Score',
    icon: Target,
    descSub: 'High → Low',
    ascSub: 'Low → High',
  },
  {
    field: 'salary',
    label: 'Salary (LPA)',
    icon: DollarSign,
    descSub: 'Highest 1st',
    ascSub: 'Lowest 1st',
  },
  {
    field: 'company',
    label: 'Company Name',
    icon: Building2,
    descSub: 'Z → A',
    ascSub: 'A → Z',
  },
  {
    field: 'title',
    label: 'Job Title',
    icon: Briefcase,
    descSub: 'Z → A',
    ascSub: 'A → Z',
  },
  {
    field: 'verification',
    label: 'Verified HR',
    icon: ShieldCheck,
    descSub: 'Verified 1st',
    ascSub: 'Unverified 1st',
  },
  {
    field: 'id',
    label: 'Date Added',
    icon: Clock,
    descSub: 'Newest 1st',
    ascSub: 'Oldest 1st',
  },
];

export const SortToolbar: React.FC<SortToolbarProps> = ({ sortConfig, onSortChange }) => {
  const handleFieldChange = (field: SortField) => {
    if (sortConfig.field === field) {
      // If clicking already active field, flip direction
      onSortChange({
        field,
        direction: sortConfig.direction === 'asc' ? 'desc' : 'asc',
      });
    } else {
      // Default directions: A-Z (asc) for company/title, desc for score/salary/hr/id
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

  const activeOption = SORT_OPTIONS.find((o) => o.field === sortConfig.field);

  return (
    <div
      className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all"
      style={{
        background: 'rgba(8, 12, 22, 0.9)',
        border: '1px solid rgba(56, 189, 248, 0.2)',
        backdropFilter: 'blur(16px)',
      }}
    >
      {/* Left: Label & Sort Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 mr-1 shrink-0">
          <ArrowUpDown className="w-3.5 h-3.5 text-sky-400" />
          <span>Sort By:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {SORT_OPTIONS.map(({ field, label, icon: Icon, descSub, ascSub }) => {
            const isActive = sortConfig.field === field;
            const subText = sortConfig.direction === 'asc' ? ascSub : descSub;

            return (
              <button
                key={field}
                type="button"
                onClick={() => handleFieldChange(field)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer active:scale-95"
                style={{
                  background: isActive
                    ? 'linear-gradient(135deg, rgba(14, 165, 233, 0.28), rgba(99, 102, 241, 0.28))'
                    : 'rgba(15, 23, 42, 0.65)',
                  border: isActive
                    ? '1px solid rgba(56, 189, 248, 0.6)'
                    : '1px solid rgba(30, 41, 59, 0.7)',
                  color: isActive ? '#38bdf8' : '#94a3b8',
                  boxShadow: isActive ? '0 0 12px rgba(56, 189, 248, 0.25)' : 'none',
                }}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-sky-300' : 'text-slate-500'}`} />
                <span>{label}</span>
                {isActive && (
                  <span
                    className="ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded font-mono"
                    style={{
                      background: 'rgba(56, 189, 248, 0.2)',
                      color: '#7dd3fc',
                    }}
                  >
                    {subText}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right: Direction Flip Button with Active Summary */}
      <button
        type="button"
        onClick={toggleDirection}
        title="Click to flip sort direction"
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer shrink-0 active:scale-95"
        style={{
          background: 'rgba(15, 23, 42, 0.9)',
          border: '1px solid rgba(56, 189, 248, 0.35)',
          color: '#f8fafc',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        }}
      >
        {sortConfig.direction === 'asc' ? (
          <>
            <ArrowUp className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] text-emerald-300">
              Ascending ({activeOption?.ascSub || 'Low → High'})
            </span>
          </>
        ) : (
          <>
            <ArrowDown className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-[11px] text-sky-300">
              Descending ({activeOption?.descSub || 'High → Low'})
            </span>
          </>
        )}
      </button>
    </div>
  );
};
