/**
 * salaryParser.ts
 *
 * Robust, production-grade salary and match score parser for Indian and Global job listings.
 * Handles diverse compensation patterns, normalization to integer rupees, and WCAG AA display formatting.
 */

export interface ParsedSalary {
  salary_min: number | null;
  salary_max: number | null;
}

/**
 * Normalizes any text or numeric match score into an integer clamped between 0 and 100.
 * Handles "98%", "98", 98, 0.98 -> 98.
 * Returns null for invalid or missing values.
 */
export function parseMatch(val: unknown): number | null {
  if (val === null || val === undefined) return null;

  if (typeof val === 'number') {
    if (isNaN(val)) return null;
    // Handle decimal representation (e.g., 0.98 -> 98)
    if (val > 0 && val <= 1) {
      return Math.round(val * 100);
    }
    return Math.round(Math.min(100, Math.max(0, val)));
  }

  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (!trimmed) return null;

    const hasPercent = trimmed.includes('%');
    const cleanStr = trimmed.replace(/%/g, '').trim();
    const num = parseFloat(cleanStr);
    if (isNaN(num)) return null;

    if (num > 0 && num <= 1 && !hasPercent) {
      return Math.round(num * 100);
    }
    return Math.round(Math.min(100, Math.max(0, num)));
  }

  return null;
}

/**
 * Parses diverse salary strings into integer rupees ({ salary_min, salary_max }).
 *
 * Supported formats:
 * - "₹3.0 - 5.0 LPA" -> 300,000 to 500,000
 * - "3 lakh to 15 lakh" / "3 Lakhs - 15 Lakhs" / "3L-15L" -> 300,000 to 1,500,000
 * - "12 LPA" -> 1,200,000 to 1,200,000
 * - "₹50,000 - 80,000 per month" -> multiply by 12 -> 600,000 to 960,000
 * - "1.2 Cr" / "1 crore" -> 12,000,000 / 10,000,000
 * - Plain integers such as "300000" -> 300,000 to 300,000
 * - Reversed ranges such as "15-3 LPA" -> swapped to 300,000 to 1,500,000
 * - Unparseable ("As per market standards", "Not disclosed", "Unlisted", empty) -> null, null
 */
export function parseSalary(str: string | null | undefined): ParsedSalary {
  if (!str || typeof str !== 'string') {
    return { salary_min: null, salary_max: null };
  }

  const raw = str
    .replace(/\u00a0/g, ' ') // non-breaking spaces
    .replace(/[–—−]/g, '-') // normalize en-dash, em-dash, minus to hyphen
    .trim();

  if (!raw) {
    return { salary_min: null, salary_max: null };
  }

  const lower = raw.toLowerCase();

  // Explicit unparseable keywords
  const unparseableWords = [
    'as per market',
    'market standard',
    'not disclosed',
    'unlisted',
    'competitive',
    'undisclosed',
    'best in industry',
    'negotiable',
    'tbd',
    'n/a',
    'na',
    'none',
  ];
  if (unparseableWords.some((word) => lower.includes(word))) {
    return { salary_min: null, salary_max: null };
  }

  // Must contain at least one digit
  if (!/\d/.test(raw)) {
    return { salary_min: null, salary_max: null };
  }

  // Detect monthly compensation
  const isMonthly = /\b(per\s*month|month|pm|p\.m\.|\/mo|\/m)\b/i.test(lower);

  // Remove currency signs & noise words
  let sanitized = lower
    .replace(/[₹$€£]/g, '')
    .replace(/\b(inr|rs\.?|rupees)\b/gi, '')
    .replace(/\b(per\s*annum|per\s*year|annum|pa|p\.a\.|\/yr|\/year)\b/gi, '')
    .replace(/\b(per\s*month|month|pm|p\.m\.|\/mo|\/m)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Normalize "to" into a hyphen range separator
  sanitized = sanitized.replace(/\s+to\s+/gi, ' - ');

  // Helper to extract unit multiplier from a string token
  const getMultiplier = (token: string): number => {
    if (/\b(cr|crore|crores)\b/i.test(token)) return 10_000_000;
    if (/\b(lpa|lakh|lakhs|lac|lacs|l)\b/i.test(token)) return 100_000;
    if (/\b(k|thousand)\b/i.test(token)) return 1_000;
    return 1;
  };

  // Helper to parse a single number + optional multiplier
  const parseSingleToken = (token: string, fallbackMultiplier: number): number | null => {
    // Match number like 3, 3.5, 50,000, 1.2
    const m = token.match(/(\d[\d,]*(?:\.\d+)?)/);
    if (!m) return null;

    const numVal = parseFloat(m[1].replace(/,/g, ''));
    if (isNaN(numVal) || numVal < 0) return null;

    let mult = getMultiplier(token);
    if (mult === 1 && fallbackMultiplier !== 1) {
      mult = fallbackMultiplier;
    }

    let result = numVal * mult;

    // If unit was not explicitly mentioned:
    // If the number is very small (< 100) and not monthly and no unit, in Indian context it's typically in LPA
    if (mult === 1 && numVal < 100 && !isMonthly) {
      // E.g., "12" in tech salaries without unit is 12 LPA
      result = numVal * 100_000;
    }

    if (isMonthly) {
      result = result * 12;
    }

    return Math.round(result);
  };

  // Check if string contains a range separator (" - ")
  if (sanitized.includes('-')) {
    const parts = sanitized.split('-').map((p) => p.trim());
    if (parts.length >= 2) {
      const partA = parts[0];
      const partB = parts.slice(1).join(' '); // in case of extra hyphens

      // Check if unit is on Part B and should be inherited by Part A (e.g., "3 - 5 LPA")
      const multB = getMultiplier(partB);
      const multA = getMultiplier(partA);
      const effectiveMultA = multA !== 1 ? multA : multB;

      let valA = parseSingleToken(partA, effectiveMultA);
      let valB = parseSingleToken(partB, multB);

      if (valA !== null && valB !== null) {
        // Handle reversed ranges (e.g. "15-3 LPA" -> swapped to 3 LPA and 15 LPA)
        if (valA > valB) {
          const temp = valA;
          valA = valB;
          valB = temp;
        }
        return { salary_min: valA, salary_max: valB };
      } else if (valA !== null) {
        return { salary_min: valA, salary_max: valA };
      } else if (valB !== null) {
        return { salary_min: valB, salary_max: valB };
      }
    }
  }

  // Single value case
  const mult = getMultiplier(sanitized);
  const singleVal = parseSingleToken(sanitized, mult);
  if (singleVal !== null) {
    return { salary_min: singleVal, salary_max: singleVal };
  }

  return { salary_min: null, salary_max: null };
}

/**
 * Formats a rupee number using the Indian number grouping system:
 * 300000 -> "₹3,00,000"
 */
export function formatRupees(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

/**
 * Formats salary for display.
 * Returns both a full Indian grouping representation ("₹3,00,000 – ₹5,00,000")
 * and a compact representation ("3.0–5.0 LPA").
 */
export function formatSalaryDisplay(
  min: number | null,
  max: number | null,
  fallbackRaw: string = 'Not Disclosed'
): { full: string; compact: string; isKnown: boolean } {
  if (min === null && max === null) {
    return {
      full: fallbackRaw || 'Not Disclosed',
      compact: fallbackRaw || 'Not Disclosed',
      isKnown: false,
    };
  }

  const effectiveMin = min ?? max!;
  const effectiveMax = max ?? min!;

  const toLpaStr = (val: number): string => {
    if (val >= 10_000_000) {
      const cr = val / 10_000_000;
      return `${cr.toFixed(1).replace(/\.0$/, '')} Cr`;
    }
    const lpa = val / 100_000;
    return `${lpa.toFixed(1).replace(/\.0$/, '')} LPA`;
  };

  if (effectiveMin === effectiveMax) {
    return {
      full: formatRupees(effectiveMin),
      compact: toLpaStr(effectiveMin),
      isKnown: true,
    };
  }

  return {
    full: `${formatRupees(effectiveMin)} – ${formatRupees(effectiveMax)}`,
    compact: `${(effectiveMin / 100_000).toFixed(1).replace(/\.0$/, '')}–${toLpaStr(effectiveMax)}`,
    isKnown: true,
  };
}
