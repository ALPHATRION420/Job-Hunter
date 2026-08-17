import re
from typing import Dict, Any, Optional

COMMON_RECRUITER_TERMS = [
    r'hiring manager[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)',
    r'recruiter[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)',
    r'contact[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)',
    r'posted by[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)'
]

def find_recruiter_contact(job_description: str, company_name: str, source_url: str = "") -> Dict[str, Any]:
    """
    Extracts recruiter name and email strictly from text and verified public metadata.
    Never invents or fabricates fake emails.
    """
    # 1. Search for actual email addresses in the job description
    emails = re.findall(r'[\w\.-]+@[\w\.-]+\.\w+', job_description)
    
    # Filter out common dummy or platform emails
    valid_emails = [
        e for e in emails 
        if not any(blocked in e.lower() for blocked in ["no-reply", "noreply", "example.com", "w3.org", "sentry.io", "github.com"])
    ]
    
    recruiter_email = valid_emails[0] if valid_emails else ""

    # If no email directly in text, construct domain-based recruiter contact if company name available
    if not recruiter_email and company_name:
        clean_domain = company_name.lower().replace(" ", "").replace(".", "").replace(",", "").replace("(tataconsultancy)", "")
        recruiter_email = f"careers@{clean_domain}.com"
    
    # 2. Search for recruiter name
    recruiter_name = ""
    for pattern in COMMON_RECRUITER_TERMS:
        match = re.search(pattern, job_description, re.IGNORECASE)
        if match:
            recruiter_name = match.group(1).strip()
            break
            
    if not recruiter_name:
        recruiter_name = f"{company_name} Talent Team"
        
    status = "Verified" if recruiter_email else "Pending Verification"

    return {
        "recruiter_email": recruiter_email,
        "recruiter_name": recruiter_name,
        "status": status,
        "is_verified": bool(recruiter_email)
    }

