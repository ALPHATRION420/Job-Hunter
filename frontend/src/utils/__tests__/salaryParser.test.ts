import { describe, it, expect } from 'vitest';
import { parseSalary, parseMatch, formatSalaryDisplay, formatRupees } from '../salaryParser';

describe('parseSalary Unit Tests', () => {
  it('handles standard LPA ranges with ₹ symbol ("₹3.0 - 5.0 LPA")', () => {
    const res = parseSalary('₹3.0 - 5.0 LPA');
    expect(res).toEqual({ salary_min: 300_000, salary_max: 500_000 });
  });

  it('handles "3 lakh to 15 lakh" and variants ("3 Lakhs - 15 Lakhs", "3L-15L")', () => {
    expect(parseSalary('3 lakh to 15 lakh')).toEqual({ salary_min: 300_000, salary_max: 1_500_000 });
    expect(parseSalary('3 Lakhs - 15 Lakhs')).toEqual({ salary_min: 300_000, salary_max: 1_500_000 });
    expect(parseSalary('3L-15L')).toEqual({ salary_min: 300_000, salary_max: 1_500_000 });
  });

  it('handles single LPA value ("12 LPA")', () => {
    expect(parseSalary('12 LPA')).toEqual({ salary_min: 1_200_000, salary_max: 1_200_000 });
  });

  it('handles monthly salary and multiplies by 12 ("₹50,000 - 80,000 per month")', () => {
    expect(parseSalary('₹50,000 - 80,000 per month')).toEqual({
      salary_min: 600_000, // 50,000 * 12
      salary_max: 960_000, // 80,000 * 12
    });
  });

  it('handles Crore / Cr notation ("1.2 Cr", "1 crore")', () => {
    expect(parseSalary('1.2 Cr')).toEqual({ salary_min: 12_000_000, salary_max: 12_000_000 });
    expect(parseSalary('1 crore')).toEqual({ salary_min: 10_000_000, salary_max: 10_000_000 });
  });

  it('handles plain integer strings ("300000")', () => {
    expect(parseSalary('300000')).toEqual({ salary_min: 300_000, salary_max: 300_000 });
  });

  it('handles reversed ranges and automatically swaps them ("15-3 LPA")', () => {
    expect(parseSalary('15-3 LPA')).toEqual({ salary_min: 300_000, salary_max: 1_500_000 });
  });

  it('maps unparseable strings to null, null', () => {
    expect(parseSalary('As per market standards')).toEqual({ salary_min: null, salary_max: null });
    expect(parseSalary('Not disclosed')).toEqual({ salary_min: null, salary_max: null });
    expect(parseSalary('Unlisted')).toEqual({ salary_min: null, salary_max: null });
    expect(parseSalary('')).toEqual({ salary_min: null, salary_max: null });
    expect(parseSalary(null)).toEqual({ salary_min: null, salary_max: null });
    expect(parseSalary(undefined)).toEqual({ salary_min: null, salary_max: null });
    expect(parseSalary('N/A')).toEqual({ salary_min: null, salary_max: null });
    expect(parseSalary('Competitive salary')).toEqual({ salary_min: null, salary_max: null });
  });
});

describe('parseMatch Unit Tests', () => {
  it('parses percentage strings ("98%")', () => {
    expect(parseMatch('98%')).toBe(98);
  });

  it('parses plain strings ("98")', () => {
    expect(parseMatch('98')).toBe(98);
  });

  it('parses plain numbers (98)', () => {
    expect(parseMatch(98)).toBe(98);
  });

  it('parses decimal values representing percentage (0.98 -> 98)', () => {
    expect(parseMatch(0.98)).toBe(98);
    expect(parseMatch('0.85')).toBe(85);
  });

  it('clamps numbers outside 0-100 range', () => {
    expect(parseMatch(120)).toBe(100);
    expect(parseMatch(-10)).toBe(0);
  });

  it('returns null for invalid inputs', () => {
    expect(parseMatch(null)).toBeNull();
    expect(parseMatch(undefined)).toBeNull();
    expect(parseMatch('invalid')).toBeNull();
    expect(parseMatch('')).toBeNull();
  });
});

describe('Salary formatting helper Tests', () => {
  it('formats rupees in Indian grouping system', () => {
    expect(formatRupees(300_000)).toBe('₹3,00,000');
    expect(formatRupees(1_500_000)).toBe('₹15,00,000');
  });

  it('returns full and compact formatted ranges', () => {
    const formatted = formatSalaryDisplay(300_000, 500_000);
    expect(formatted.full).toBe('₹3,00,000 – ₹5,00,000');
    expect(formatted.compact).toBe('3–5 LPA');
    expect(formatted.isKnown).toBe(true);
  });

  it('handles null salaries gracefully with muted fallback', () => {
    const formatted = formatSalaryDisplay(null, null, 'Competitive');
    expect(formatted.full).toBe('Competitive');
    expect(formatted.isKnown).toBe(false);
  });
});
