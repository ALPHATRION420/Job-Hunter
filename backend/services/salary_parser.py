"""
salary_parser.py

Backend normalization utility for job compensation and ATS match scores.
Handles Indian salary patterns (LPA, lakhs, crores, monthly, reverse ranges)
and normalizes records into integer rupees.
"""

import re
from typing import Optional, Tuple, Any, Dict

def parse_match(val: Any) -> Optional[int]:
    """
    Normalizes a match score (string, float, or int) into an integer between 0 and 100.
    Handles '98%', '98', 98, 0.98 -> 98.
    Returns None for invalid or missing values.
    """
    if val is None:
        return None

    if isinstance(val, (int, float)):
        if 0 < val <= 1.0:
            return round(val * 100)
        return max(0, min(100, round(val)))

    if isinstance(val, str):
        val_str = val.strip()
        if not val_str:
            return None
        has_percent = "%" in val_str
        cleaned = val_str.replace("%", "").strip()
        try:
            num = float(cleaned)
            if 0 < num <= 1.0 and not has_percent:
                return round(num * 100)
            return max(0, min(100, round(num)))
        except ValueError:
            return None

    return None


def parse_salary(val: Optional[str]) -> Tuple[Optional[int], Optional[int]]:
    """
    Parses diverse salary strings into integer rupees (salary_min, salary_max).
    Handles:
    - '₹3.0 - 5.0 LPA' -> (300000, 500000)
    - '3 lakh to 15 lakh' / '3 Lakhs - 15 Lakhs' / '3L-15L' -> (300000, 1500000)
    - '12 LPA' -> (1200000, 1200000)
    - '₹50,000 - 80,000 per month' -> (600000, 960000)
    - '1.2 Cr' / '1 crore' -> (12000000, 12000000) / (10000000, 10000000)
    - '300000' -> (300000, 300000)
    - '15-3 LPA' (reversed) -> swapped to (300000, 1500000)
    - 'As per market standards' / 'Not disclosed' / empty -> (None, None)
    """
    if not val or not isinstance(val, str):
        return (None, None)

    raw = val.replace("\u00a0", " ").strip()
    # Normalize dashes
    raw = re.sub(r"[–—−]", "-", raw)

    if not raw:
        return (None, None)

    lower = raw.lower()

    unparseable_keywords = [
        "as per market", "market standard", "not disclosed", "unlisted",
        "competitive", "undisclosed", "best in industry", "negotiable",
        "tbd", "n/a", "na", "none"
    ]
    if any(k in lower for k in unparseable_keywords):
        return (None, None)

    if not re.search(r"\d", raw):
        return (None, None)

    is_monthly = bool(re.search(r"\b(per\s*month|month|pm|p\.m\.|\/mo|\/m)\b", lower))

    # Strip currency signs & common words
    cleaned = re.sub(r"[₹$€£]", "", lower)
    cleaned = re.sub(r"\b(inr|rs\.?|rupees)\b", "", cleaned)
    cleaned = re.sub(r"\b(per\s*annum|per\s*year|annum|pa|p\.a\.|\/yr|\/year)\b", "", cleaned)
    cleaned = re.sub(r"\b(per\s*month|month|pm|p\.m\.|\/mo|\/m)\b", "", cleaned)
    cleaned = re.sub(r"\s+", " ", cleaned).strip()

    # Normalize 'to' to '-'
    cleaned = re.sub(r"\s+to\s+", " - ", cleaned)

    def get_multiplier(token: str) -> int:
        if re.search(r"\b(cr|crore|crores)\b", token):
            return 10_000_000
        if re.search(r"\b(lpa|lakh|lakhs|lac|lacs|l)\b", token):
            return 100_000
        if re.search(r"\b(k|thousand)\b", token):
            return 1_000
        return 1

    def parse_token(token: str, fallback_mult: int) -> Optional[int]:
        m = re.search(r"(\d[\d,]*(?:\.\d+)?)", token)
        if not m:
            return None
        try:
            num = float(m.group(1).replace(",", ""))
        except ValueError:
            return None

        mult = get_multiplier(token)
        if mult == 1 and fallback_mult != 1:
            mult = fallback_mult

        res = num * mult
        if mult == 1 and num < 100 and not is_monthly:
            # Tech salaries < 100 without units in Indian market are generally in LPA
            res = num * 100_000

        if is_monthly:
            res = res * 12

        return round(res)

    if "-" in cleaned:
        parts = [p.strip() for p in cleaned.split("-") if p.strip()]
        if len(parts) >= 2:
            part_a = parts[0]
            part_b = " ".join(parts[1:])
            mult_b = get_multiplier(part_b)
            mult_a = get_multiplier(part_a)
            effective_a = mult_a if mult_a != 1 else mult_b

            val_a = parse_token(part_a, effective_a)
            val_b = parse_token(part_b, mult_b)

            if val_a is not None and val_b is not None:
                if val_a > val_b:
                    val_a, val_b = val_b, val_a
                return (val_a, val_b)
            elif val_a is not None:
                return (val_a, val_a)
            elif val_b is not None:
                return (val_b, val_b)

    mult = get_multiplier(cleaned)
    single = parse_token(cleaned, mult)
    if single is not None:
        return (single, single)

    return (None, None)


def normalize_job_doc(job_doc: Dict[str, Any]) -> Dict[str, Any]:
    """
    Ensures a job record has normalized numeric fields:
    - salary_min: Optional[int]
    - salary_max: Optional[int]
    - match_score: Optional[int]
    Preserves original 'salary' display string.
    """
    raw_salary = job_doc.get("salary")
    s_min, s_max = parse_salary(raw_salary)
    job_doc["salary_min"] = s_min
    job_doc["salary_max"] = s_max

    raw_match = job_doc.get("match_score")
    job_doc["match_score"] = parse_match(raw_match) or 0

    # Deliverability verification flag from Hunter.io
    rec_email = (job_doc.get("recruiter_email") or "").strip()
    is_ver = bool(job_doc.get("is_verified", False) and rec_email)
    if job_doc.get("recruiter_status") == "Verified" and rec_email:
        is_ver = True
    job_doc["is_verified"] = is_ver
    if not is_ver and job_doc.get("recruiter_status") == "Verified":
        job_doc["recruiter_status"] = "Unable to Verify"

    return job_doc
