"""
test_salary_parser.py

Pytest suite for backend salary and match score normalization.
"""

import pytest
import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from services.salary_parser import parse_salary, parse_match, normalize_job_doc

def test_parse_salary_lpa_ranges():
    s_min, s_max = parse_salary("₹3.0 - 5.0 LPA")
    assert s_min == 300_000
    assert s_max == 500_000

def test_parse_salary_lakh_variants():
    assert parse_salary("3 lakh to 15 lakh") == (300_000, 1_500_000)
    assert parse_salary("3 Lakhs - 15 Lakhs") == (300_000, 1_500_000)
    assert parse_salary("3L-15L") == (300_000, 1_500_000)

def test_parse_salary_single_lpa():
    assert parse_salary("12 LPA") == (1_200_000, 1_200_000)

def test_parse_salary_monthly():
    assert parse_salary("₹50,000 - 80,000 per month") == (600_000, 960_000)

def test_parse_salary_crore():
    assert parse_salary("1.2 Cr") == (12_000_000, 12_000_000)
    assert parse_salary("1 crore") == (10_000_000, 10_000_000)

def test_parse_salary_plain_integer():
    assert parse_salary("300000") == (300_000, 300_000)

def test_parse_salary_reversed_range():
    assert parse_salary("15-3 LPA") == (300_000, 1_500_000)

def test_parse_salary_unparseable():
    assert parse_salary("As per market standards") == (None, None)
    assert parse_salary("Not disclosed") == (None, None)
    assert parse_salary("Unlisted") == (None, None)
    assert parse_salary("") == (None, None)
    assert parse_salary(None) == (None, None)
    assert parse_salary("N/A") == (None, None)

def test_parse_match():
    assert parse_match("98%") == 98
    assert parse_match("98") == 98
    assert parse_match(98) == 98
    assert parse_match(0.98) == 98
    assert parse_match("0.85") == 85
    assert parse_match(150) == 100
    assert parse_match(-10) == 0
    assert parse_match(None) is None
    assert parse_match("invalid") is None

def test_normalize_job_doc():
    doc = {
        "id": 1,
        "title": "Software Engineer",
        "company": "Swiggy",
        "salary": "₹3.0 - 5.0 LPA",
        "match_score": "95%",
    }
    norm = normalize_job_doc(doc)
    assert norm["salary_min"] == 300_000
    assert norm["salary_max"] == 500_000
    assert norm["match_score"] == 95
    assert norm["salary"] == "₹3.0 - 5.0 LPA"  # Keeps original string for display
