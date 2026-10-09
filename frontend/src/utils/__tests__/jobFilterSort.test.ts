import { describe, it, expect } from 'vitest';
import type { Job } from '../../types';
import {
  applyJobSort,
  applyJobFilters,
  DEFAULT_FILTERS,
  type JobFilters,
  type JobSortConfig,
} from '../jobFilterSort';

import { parseSalary } from '../salaryParser';

const createMockJob = (id: number, salary: string, match_score: number, company = `Company ${id}`): Job => {
  const parsed = parseSalary(salary);
  return {
    id,
    title: `Software Engineer ${id}`,
    company,
    location: 'Bangalore, KA',
    work_type: 'Remote',
    job_type: 'Full-time',
    salary,
    salary_min: parsed.salary_min,
    salary_max: parsed.salary_max,
    experience_level: '2 years',
    company_size: '50-200',
    match_score,
    description: 'Great opportunity',
    required_skills: ['Python', 'React'],
    missing_skills: [],
    deadline: '2026-12-31',
    recruiter_name: 'Recruiter Name',
    recruiter_email: `hr${id}@company.com`,
    recruiter_status: 'Verified',
    source_portal: 'LinkedIn',
    source_url: 'https://example.com',
  };
};

describe('Job Sorting Logic Tests', () => {
  it('asserts match score sorting desc and asc', () => {
    const jobs = [
      createMockJob(1, '10 LPA', 75),
      createMockJob(2, '10 LPA', 95),
      createMockJob(3, '10 LPA', 60),
    ];

    const desc = applyJobSort(jobs, { field: 'match_score', direction: 'desc' });
    expect(desc.map((j) => j.match_score)).toEqual([95, 75, 60]);

    const asc = applyJobSort(jobs, { field: 'match_score', direction: 'asc' });
    expect(asc.map((j) => j.match_score)).toEqual([60, 75, 95]);
  });

  it('asserts salary sorting with nulls ALWAYS going to bottom for both asc and desc', () => {
    const jobs = [
      createMockJob(1, 'As per market standards', 80, 'Alpha'),
      createMockJob(2, '₹10.0 LPA', 80, 'Beta'),
      createMockJob(3, 'Not disclosed', 80, 'Gamma'),
      createMockJob(4, '₹5.0 LPA', 80, 'Delta'),
    ];

    // Descending: 10 LPA -> 5 LPA -> nulls at bottom
    const desc = applyJobSort(jobs, { field: 'salary', direction: 'desc' });
    expect(desc[0].salary).toBe('₹10.0 LPA');
    expect(desc[1].salary).toBe('₹5.0 LPA');
    expect(desc[2].salary).toBe('As per market standards');
    expect(desc[3].salary).toBe('Not disclosed');

    // Ascending: 5 LPA -> 10 LPA -> nulls at bottom (NEVER at top!)
    const asc = applyJobSort(jobs, { field: 'salary', direction: 'asc' });
    expect(asc[0].salary).toBe('₹5.0 LPA');
    expect(asc[1].salary).toBe('₹10.0 LPA');
    expect(asc[2].salary).toBe('As per market standards');
    expect(asc[3].salary).toBe('Not disclosed');
  });

  it('correctly sorts mixed-format salaries (["3 lakh to 15 lakh", "₹1.0 - 6.0 LPA", "As per market standards", "12 LPA"])', () => {
    const jobs = [
      createMockJob(1, '3 lakh to 15 lakh', 85, 'A'), // min: 300,000, max: 1,500,000
      createMockJob(2, '₹1.0 - 6.0 LPA', 85, 'B'),    // min: 100,000, max: 600,000
      createMockJob(3, 'As per market standards', 85, 'C'), // null
      createMockJob(4, '12 LPA', 85, 'D'),             // min: 1,200,000, max: 1,200,000
    ];

    // Ascending salary order by salary_min:
    // 1. "₹1.0 - 6.0 LPA" (100,000)
    // 2. "3 lakh to 15 lakh" (300,000)
    // 3. "12 LPA" (1,200,000)
    // 4. "As per market standards" (null, at bottom)
    const asc = applyJobSort(jobs, { field: 'salary', direction: 'asc' });
    expect(asc[0].salary).toBe('₹1.0 - 6.0 LPA');
    expect(asc[1].salary).toBe('3 lakh to 15 lakh');
    expect(asc[2].salary).toBe('12 LPA');
    expect(asc[3].salary).toBe('As per market standards');

    // Descending salary order by salary_min:
    // 1. "12 LPA" (1,200,000)
    // 2. "3 lakh to 15 lakh" (300,000)
    // 3. "₹1.0 - 6.0 LPA" (100,000)
    // 4. "As per market standards" (null, at bottom)
    const desc = applyJobSort(jobs, { field: 'salary', direction: 'desc' });
    expect(desc[0].salary).toBe('12 LPA');
    expect(desc[1].salary).toBe('3 lakh to 15 lakh');
    expect(desc[2].salary).toBe('₹1.0 - 6.0 LPA');
    expect(desc[3].salary).toBe('As per market standards');
  });

  it('asserts that toggling sort does not change active filters, and vice versa', () => {
    const jobs = [
      createMockJob(1, '₹5 LPA', 92, 'Google'),
      createMockJob(2, '₹15 LPA', 65, 'Microsoft'),
      createMockJob(3, '₹20 LPA', 88, 'Amazon'),
    ];

    // Active filter: minMatch >= 70
    const filterState: JobFilters = {
      ...DEFAULT_FILTERS,
      minMatch: 70,
    };

    // Filter pipeline
    const filtered = applyJobFilters(jobs, filterState);
    expect(filtered.map((j) => j.id)).toEqual([1, 3]); // Job 2 (65% match) excluded

    // Sort 1: by match_score desc
    let sortState: JobSortConfig = { field: 'match_score', direction: 'desc' };
    let sorted = applyJobSort(filtered, sortState);
    expect(sorted.map((j) => j.id)).toEqual([1, 3]); // 92% then 88%

    // Toggle sort to salary asc
    sortState = { field: 'salary', direction: 'asc' };
    sorted = applyJobSort(filtered, sortState);
    expect(sorted.map((j) => j.id)).toEqual([1, 3]); // ₹5 LPA then ₹20 LPA

    // Filter state is completely untouched and independent
    expect(filterState.minMatch).toBe(70);
    expect(filtered.length).toBe(2);

    // Now update filter state to minMatch: 90
    const updatedFilter: JobFilters = { ...filterState, minMatch: 90 };
    const filtered2 = applyJobFilters(jobs, updatedFilter);
    expect(filtered2.map((j) => j.id)).toEqual([1]); // Only Job 1 (92%)

    // Sort config remains completely untouched
    expect(sortState.field).toBe('salary');
    expect(sortState.direction).toBe('asc');
  });

  it('tests overlap salary filter semantics', () => {
    const jobs = [
      createMockJob(1, '₹4.0 - 8.0 LPA', 80),   // 400,000 - 800,000
      createMockJob(2, '₹10.0 - 15.0 LPA', 80), // 1,000,000 - 1,500,000
      createMockJob(3, 'As per market standards', 80),
    ];

    // Filter for ₹5 to ₹12 LPA:
    // Job 1 (4-8 LPA) overlaps with [5, 12] LPA -> matches
    // Job 2 (10-15 LPA) overlaps with [5, 12] LPA -> matches
    // Job 3 (null) -> excluded because active salary filter is set
    const filterRange: JobFilters = {
      ...DEFAULT_FILTERS,
      minSalaryLpa: 5,
      maxSalaryLpa: 12,
    };
    const res = applyJobFilters(jobs, filterRange);
    expect(res.map((j) => j.id)).toEqual([1, 2]);

    // When NO salary filter is active, null-salary jobs ARE included:
    const noSalFilter: JobFilters = {
      ...DEFAULT_FILTERS,
      minSalaryLpa: 0,
      maxSalaryLpa: 100,
    };
    const resAll = applyJobFilters(jobs, noSalFilter);
    expect(resAll.length).toBe(3);
  });
});
