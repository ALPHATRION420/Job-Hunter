import type { Job } from '../types';
import { matchesLocationFilter } from './locations';
import { parseSalary, parseMatch } from './salaryParser';

export interface JobFilters {
  locationScope: string;
  selectedCity: string;
  workType: string;
  jobType: string;
  minMatch: number;
  minSalaryLpa: number;
  maxSalaryLpa: number;
  verifiedHrOnly: boolean;
  verification: string;
  sourcePortal: string;
  companySize: string;
  maxExp: number;
}

export type SortField = 'match_score' | 'salary' | 'company' | 'title' | 'verification' | 'date_added' | 'id';
export type SortDirection = 'asc' | 'desc';

export interface JobSortConfig {
  field: SortField;
  direction: SortDirection;
}

export const DEFAULT_FILTERS: JobFilters = {
  locationScope: 'India',
  selectedCity: 'All Cities in India',
  workType: 'All',
  jobType: 'All',
  minMatch: 0,
  minSalaryLpa: 0,
  maxSalaryLpa: 100,
  verifiedHrOnly: false,
  verification: 'All',
  sourcePortal: 'All',
  companySize: 'All',
  maxExp: 10,
};

export const DEFAULT_SORT: JobSortConfig = {
  field: 'match_score',
  direction: 'desc',
};

/**
 * Returns verification tier score for sorting:
 * Verified (2) > Direct (1) > Unverified / None (0)
 */
export const getVerificationTier = (job: Job): number => {
  const status = (job.recruiter_status || '').toLowerCase();
  const hasEmail = Boolean(job.recruiter_email && job.recruiter_email.includes('@'));
  const isVerified = Boolean(job.is_verified || status === 'verified');

  if (hasEmail && isVerified) return 2;
  if (hasEmail && (status === 'direct' || status.includes('hunter'))) return 1;
  if (hasEmail) return 1;
  return 0;
};

/**
 * Filters jobs based on active search text and criteria.
 *
 * SALARY FILTER OVERLAP SEMANTICS:
 * - A job's compensation range is [job.salary_min, job.salary_max].
 * - The user's active filter range is [filter.minSalaryLpa * 100,000, filter.maxSalaryLpa * 100,000].
 * - Overlap condition:
 *     jobLow <= filterHigh && jobHigh >= filterLow
 *   meaning a job is included if ANY part of its compensation range falls within the chosen filter range.
 * - Single-value salaries are treated as [val, val].
 * - Null-salary jobs ("As per market standards", "Not disclosed") are EXCLUDED ONLY when
 *   an active salary filter is set (minSalaryLpa > 0 or maxSalaryLpa < 100).
 *   When no salary filter is active, null-salary jobs remain visible.
 */
export const applyJobFilters = (
  jobs: Job[],
  filters: JobFilters,
  searchQuery: string = ''
): Job[] => {
  const q = (searchQuery || '').trim().toLowerCase();
  const isSalaryFilterActive = filters.minSalaryLpa > 0 || filters.maxSalaryLpa < 100;
  const filterMinRupees = filters.minSalaryLpa * 100_000;
  const filterMaxRupees = filters.maxSalaryLpa * 100_000;

  return jobs.filter((job) => {
    // 1. Text Search Filter (title, company, skills, recruiter name/email/phone)
    if (q) {
      const title = (job.title || '').toLowerCase();
      const company = (job.company || '').toLowerCase();
      const recName = (job.recruiter_name || '').toLowerCase();
      const recEmail = (job.recruiter_email || '').toLowerCase();
      const recPhone = (job.recruiter_phone || '').toLowerCase();
      const skills = (job.required_skills || []).map((s) => s.toLowerCase());

      const matchesText =
        title.includes(q) ||
        company.includes(q) ||
        recName.includes(q) ||
        recEmail.includes(q) ||
        recPhone.includes(q) ||
        skills.some((s) => s.includes(q));

      if (!matchesText) return false;
    }

    // 2. Location & Cascading City Filter
    if (!matchesLocationFilter(job.location, filters.locationScope, filters.selectedCity)) {
      return false;
    }

    // 3. Work Type Filter (Remote, Hybrid, On-site)
    if (filters.workType !== 'All' && job.work_type !== filters.workType) {
      return false;
    }

    // 4. Job Type Filter (Full-time, Internship, Contract)
    if (filters.jobType !== 'All' && job.job_type !== filters.jobType) {
      return false;
    }

    // 5. ATS Match Score Threshold (Hard Minimum)
    const match = job.match_score !== undefined && job.match_score !== null
      ? job.match_score
      : (parseMatch((job as any).match_score) ?? 0);
    if (filters.minMatch > 0 && match < filters.minMatch) {
      return false;
    }

    // 6. Overlap Salary Filter
    if (isSalaryFilterActive) {
      let sMin = job.salary_min;
      let sMax = job.salary_max;

      if (sMin === undefined || sMin === null || sMax === undefined || sMax === null) {
        const parsed = parseSalary(job.salary);
        sMin = parsed.salary_min;
        sMax = parsed.salary_max;
      }

      // If job has no known salary and user set a salary constraint -> exclude
      if (sMin === null && sMax === null) {
        return false;
      }

      const jobLow = sMin ?? sMax!;
      const jobHigh = sMax ?? sMin!;

      // Overlap evaluation: job range must intersect [filterMinRupees, filterMaxRupees]
      const overlaps = jobLow <= filterMaxRupees && jobHigh >= filterMinRupees;
      if (!overlaps) {
        return false;
      }
    }

    // 7. Verified HR Toggle & Status Filter
    if (filters.verifiedHrOnly) {
      const isVerified = (Boolean(job.is_verified) || (job.recruiter_status || '').toLowerCase() === 'verified') &&
        Boolean(job.recruiter_email && job.recruiter_email.includes('@'));
      if (!isVerified) return false;
    }

    if (filters.verification !== 'All') {
      const status = (job.recruiter_status || '').toLowerCase();
      const hasEmail = Boolean(job.recruiter_email && job.recruiter_email.includes('@'));
      const isVerified = (Boolean(job.is_verified) || status === 'verified') && hasEmail;

      if (filters.verification === 'Verified' && !isVerified) {
        return false;
      }
      if (filters.verification === 'Direct' && !hasEmail) {
        return false;
      }
      if (filters.verification === 'Unverified' && isVerified) {
        return false;
      }
    }

    // 8. Source Portal Filter
    if (
      filters.sourcePortal !== 'All' &&
      !(job.source_portal || '').toLowerCase().includes(filters.sourcePortal.toLowerCase())
    ) {
      return false;
    }

    // 9. Company Size Filter
    if (filters.companySize !== 'All') {
      const sizeStr = job.company_size || '';
      if (filters.companySize === 'Startup' && !(sizeStr.includes('50') || sizeStr.includes('100') || sizeStr.includes('1-50'))) {
        return false;
      }
      if (filters.companySize === 'Mid-Market' && !sizeStr.includes('500')) {
        return false;
      }
      if (filters.companySize === 'Enterprise' && !(sizeStr.includes('1000') || sizeStr.includes('5000') || sizeStr.includes('1000+'))) {
        return false;
      }
    }

    // 10. Max Experience Level
    if (filters.maxExp < 10) {
      const expMatch = (job.experience_level || '').match(/(\d+)/);
      const jobExp = expMatch ? parseInt(expMatch[1], 10) : 0;
      if (jobExp > filters.maxExp) {
        return false;
      }
    }

    return true;
  });
};

/**
 * Stable, mathematically correct sort adhering strictly to Task 7 specifications:
 *
 * - Salary sorts by `salary_min`, tie-break by `salary_max`, then company name.
 * - Records with null values ALWAYS go to the bottom, for BOTH ascending and descending!
 * - Text fields use localeCompare with { sensitivity: 'base', numeric: true }.
 * - Verified HR sorts verified first when descending.
 * - Date Added sorts on real timestamps.
 */
export const applyJobSort = (jobs: Job[], sortConfig: JobSortConfig): Job[] => {
  const { field, direction } = sortConfig;
  const isAsc = direction === 'asc';

  return [...jobs].sort((a, b) => {
    switch (field) {
      case 'salary': {
        const parsedA = (a.salary_min !== undefined && a.salary_min !== null)
          ? { salary_min: a.salary_min, salary_max: a.salary_max ?? a.salary_min }
          : parseSalary(a.salary);
        const parsedB = (b.salary_min !== undefined && b.salary_min !== null)
          ? { salary_min: b.salary_min, salary_max: b.salary_max ?? b.salary_min }
          : parseSalary(b.salary);

        const minA = parsedA.salary_min;
        const maxA = parsedA.salary_max;
        const minB = parsedB.salary_min;
        const maxB = parsedB.salary_max;

        const isNullA = minA === null && maxA === null;
        const isNullB = minB === null && maxB === null;

        // CRITICAL RULE: Nulls ALWAYS go to bottom, for both asc and desc
        if (isNullA && !isNullB) return 1;
        if (!isNullA && isNullB) return -1;
        if (isNullA && isNullB) {
          return (a.company || '').trim().localeCompare((b.company || '').trim(), undefined, { sensitivity: 'base', numeric: true });
        }

        const effectiveMinA = minA ?? maxA!;
        const effectiveMinB = minB ?? maxB!;

        if (effectiveMinA !== effectiveMinB) {
          return isAsc ? effectiveMinA - effectiveMinB : effectiveMinB - effectiveMinA;
        }

        const effectiveMaxA = maxA ?? minA!;
        const effectiveMaxB = maxB ?? minB!;
        if (effectiveMaxA !== effectiveMaxB) {
          return isAsc ? effectiveMaxA - effectiveMaxB : effectiveMaxB - effectiveMaxA;
        }

        return (a.company || '').trim().localeCompare((b.company || '').trim(), undefined, { sensitivity: 'base', numeric: true });
      }

      case 'match_score': {
        const scoreA = parseMatch(a.match_score) ?? 0;
        const scoreB = parseMatch(b.match_score) ?? 0;

        if (scoreA !== scoreB) {
          return isAsc ? scoreA - scoreB : scoreB - scoreA;
        }
        return (a.company || '').trim().localeCompare((b.company || '').trim(), undefined, { sensitivity: 'base', numeric: true });
      }

      case 'company': {
        const cA = (a.company || '').trim();
        const cB = (b.company || '').trim();
        const comp = cA.localeCompare(cB, undefined, { sensitivity: 'base', numeric: true });
        if (comp !== 0) return isAsc ? comp : -comp;
        return (b.id || 0) - (a.id || 0);
      }

      case 'title': {
        const tA = (a.title || '').trim();
        const tB = (b.title || '').trim();
        const comp = tA.localeCompare(tB, undefined, { sensitivity: 'base', numeric: true });
        if (comp !== 0) return isAsc ? comp : -comp;
        return (a.company || '').trim().localeCompare((b.company || '').trim(), undefined, { sensitivity: 'base', numeric: true });
      }

      case 'verification': {
        const tierA = getVerificationTier(a);
        const tierB = getVerificationTier(b);
        if (tierA !== tierB) {
          return isAsc ? tierA - tierB : tierB - tierA;
        }
        const scoreA = parseMatch(a.match_score) ?? 0;
        const scoreB = parseMatch(b.match_score) ?? 0;
        return scoreB - scoreA;
      }

      case 'date_added': {
        const timeA = a.created_at ? new Date(a.created_at).getTime() : a.id || 0;
        const timeB = b.created_at ? new Date(b.created_at).getTime() : b.id || 0;
        if (timeA !== timeB) {
          return isAsc ? timeA - timeB : timeB - timeA;
        }
        return (b.id || 0) - (a.id || 0);
      }

      case 'id':
      default: {
        const idA = Number(a.id) || 0;
        const idB = Number(b.id) || 0;
        return isAsc ? idA - idB : idB - idA;
      }
    }
  });
};

/**
 * URL Query parameter synchronization helpers to preserve filter and sort on reload.
 */
export const parseFiltersFromSearchParams = (params: URLSearchParams): Partial<JobFilters> => {
  const parsed: Partial<JobFilters> = {};

  if (params.has('locScope')) parsed.locationScope = params.get('locScope')!;
  if (params.has('city')) parsed.selectedCity = params.get('city')!;
  if (params.has('work')) parsed.workType = params.get('work')!;
  if (params.has('type')) parsed.jobType = params.get('type')!;
  if (params.has('minMatch')) parsed.minMatch = Number(params.get('minMatch')) || 0;
  if (params.has('minSal')) parsed.minSalaryLpa = Number(params.get('minSal')) || 0;
  if (params.has('maxSal')) parsed.maxSalaryLpa = Number(params.get('maxSal')) || 100;
  if (params.has('verifiedOnly')) parsed.verifiedHrOnly = params.get('verifiedOnly') === 'true';
  if (params.has('portal')) parsed.sourcePortal = params.get('portal')!;
  if (params.has('size')) parsed.companySize = params.get('size')!;
  if (params.has('maxExp')) parsed.maxExp = Number(params.get('maxExp')) || 10;

  return parsed;
};

export const parseSortFromSearchParams = (params: URLSearchParams): Partial<JobSortConfig> => {
  const parsed: Partial<JobSortConfig> = {};
  if (params.has('sortField')) parsed.field = params.get('sortField') as SortField;
  if (params.has('sortDir')) parsed.direction = params.get('sortDir') as SortDirection;
  return parsed;
};

export const syncStateToSearchParams = (
  filters: JobFilters,
  sortConfig: JobSortConfig,
  searchQuery: string
): string => {
  const params = new URLSearchParams();

  if (searchQuery.trim()) params.set('q', searchQuery.trim());
  if (filters.locationScope !== DEFAULT_FILTERS.locationScope) params.set('locScope', filters.locationScope);
  if (filters.selectedCity !== DEFAULT_FILTERS.selectedCity) params.set('city', filters.selectedCity);
  if (filters.workType !== DEFAULT_FILTERS.workType) params.set('work', filters.workType);
  if (filters.jobType !== DEFAULT_FILTERS.jobType) params.set('type', filters.jobType);
  if (filters.minMatch !== DEFAULT_FILTERS.minMatch) params.set('minMatch', String(filters.minMatch));
  if (filters.minSalaryLpa !== DEFAULT_FILTERS.minSalaryLpa) params.set('minSal', String(filters.minSalaryLpa));
  if (filters.maxSalaryLpa !== DEFAULT_FILTERS.maxSalaryLpa) params.set('maxSal', String(filters.maxSalaryLpa));
  if (filters.verifiedHrOnly) params.set('verifiedOnly', 'true');
  if (filters.sourcePortal !== DEFAULT_FILTERS.sourcePortal) params.set('portal', filters.sourcePortal);
  if (filters.companySize !== DEFAULT_FILTERS.companySize) params.set('size', filters.companySize);
  if (filters.maxExp !== DEFAULT_FILTERS.maxExp) params.set('maxExp', String(filters.maxExp));

  if (sortConfig.field !== DEFAULT_SORT.field) params.set('sortField', sortConfig.field);
  if (sortConfig.direction !== DEFAULT_SORT.direction) params.set('sortDir', sortConfig.direction);

  return params.toString();
};
