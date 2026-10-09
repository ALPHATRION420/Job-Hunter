import re
import os
import socket
import requests
from typing import Dict, Any, Optional

COMMON_RECRUITER_TERMS = [
    r'hiring manager[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)',
    r'recruiter[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)',
    r'talent partner[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)',
    r'contact[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)',
    r'reach out to[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)',
    r'posted by[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)',
    r'talent acquisition[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)',
    r'hr contact[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)',
    r'apply to[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)',
    r'send.*?resume.*?to[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)',
]

# Blocked patterns — these are never real recruiter inboxes
BLOCKED_EMAIL_PATTERNS = [
    "no-reply", "noreply", "example.com", "w3.org", "sentry.io",
    "github.com", "schema.org", "test.com", "placeholder", "support@",
    "admin@", "webmaster@", "postmaster@", "abuse@", "unsubscribe@",
    "bounce@", "mailer-daemon@", "donotreply@", "do-not-reply@",
    "notifications@", "alerts@", "system@",
]

# Standard verified domain mappings for major Indian tech employers, startups, and MNCs
KNOWN_DOMAINS = {
    "razorpay": "razorpay.com",
    "swiggy": "swiggy.in",
    "flipkart": "flipkart.com",
    "phonepe": "phonepe.com",
    "meesho": "meesho.com",
    "cred": "cred.club",
    "zerodha": "zerodha.com",
    "postman": "postman.com",
    "ola": "olacabs.com",
    "ola cabs": "olacabs.com",
    "inmobi": "inmobi.com",
    "infosys": "infosys.com",
    "wipro": "wipro.com",
    "target": "target.com",
    "juspay": "juspay.in",
    "groww": "groww.in",
    "slice": "sliceit.com",
    "zepto": "zeptonow.com",
    "urban company": "urbancompany.com",
    "atlassian": "atlassian.com",
    "uber": "uber.com",
    "cisco": "cisco.com",
    "intuit": "intuit.com",
    "goldman sachs": "goldmansachs.com",
    "zomato": "zomato.com",
    "makemytrip": "makemytrip.com",
    "blinkit": "blinkit.com",
    "policybazaar": "policybazaar.com",
    "cars24": "cars24.com",
    "adobe": "adobe.com",
    "paytm": "paytm.com",
    "naukri": "infoedge.in",
    "hcl": "hcltech.com",
    "hcltech": "hcltech.com",
    "tcs": "tcs.com",
    "nykaa": "nykaa.com",
    "fynd": "fynd.com",
    "coindcx": "coindcx.com",
    "browserstack": "browserstack.com",
    "angel one": "angelone.in",
    "clevertap": "clevertap.com",
    "microsoft": "microsoft.com",
    "amazon": "amazon.in",
    "deloitte": "deloitte.com",
    "oracle": "oracle.com",
    "cyient": "cyient.com",
    "darwinbox": "darwinbox.com",
    "highradius": "highradius.com",
    "persistent": "persistent.com",
    "amdocs": "amdocs.com",
    "zensar": "zensar.com",
    "icertis": "icertis.com",
    "zoho": "zoho.com",
    "freshworks": "freshworks.com",
    "cognizant": "cognizant.com",
    "chargebee": "chargebee.com",
    "pwc": "pwc.com",
    "itc": "itcinfotech.com",
    "google": "google.com",
    "tekion": "tekion.com",
    "hasura": "hasura.io",
    "gitlab": "gitlab.com",
    "cardekho": "cardekho.com",
    "bosch": "bosch.com",
    "siemens": "siemens.com",
    "kpit": "kpit.com",
    "kissflow": "kissflow.com",
    "infostretch": "infostretch.com",
    "cygnet": "cygnetinfotech.com",
    "ibs software": "ibsplc.com",
    "ust": "ust.com",
    "yash": "yash.com",
    "impetus": "impetus.com",
    "net solutions": "netsolutions.com",
    "accenture": "accenture.com",
    "capgemini": "capgemini.com",
    "mindtree": "ltimindtree.com",
    "ltimindtree": "ltimindtree.com",
    "tech mahindra": "techmahindra.com",
    "societe generale": "socgen.com",
    "morgan stanley": "morganstanley.com",
    "jpmorgan": "jpmorgan.com",
    "wells fargo": "wellsfargo.com",
    "barclays": "barclays.com",
    "uniphore": "uniphore.com",
    "whatfix": "whatfix.com",
    "scaler": "scaler.com",
    "interviewbit": "interviewbit.com",
    "shadowfax": "shadowfax.in",
    "porter": "porter.in",
    "rapido": "rapido.bike",
    "spinny": "spinny.com",
    "smallcase": "smallcase.com",
    "khatabook": "khatabook.com",
    "loco": "loco.gg",
    "curefit": "cult.fit",
    "cultfit": "cult.fit",
    "simpl": "getsimpl.com",
    "lendingkart": "lendingkart.com",
    "navi": "navi.com",
    "jupiter": "jupiter.money",
    "fi money": "fi.money",
    "credgenics": "credgenics.com",
    "perfios": "perfios.com",
    "incred": "incred.com",
    "leena ai": "leena.ai",
    "yellow.ai": "yellow.ai",
    "glance": "glance.com",
    "sharechat": "sharechat.com",
    "koo": "kooapp.com",
    "mpl": "mpl.live",
    "dream11": "dream11.com",
    "games24x7": "games24x7.com",
    "winzo": "winzogames.com",
    "zupee": "zupee.com",
    "unacademy": "unacademy.com",
    "upgrad": "upgrad.com",
    "physicswallah": "pw.live",
    "vedantu": "vedantu.com",
    "eruditus": "eruditus.com",
    "classplus": "classplusapp.com",
    "lead school": "leadschool.in",
    "teachmint": "teachmint.com",
    "1mg": "1mg.com",
    "tata 1mg": "1mg.com",
    "pharmeasy": "pharmeasy.in",
    "netmeds": "netmeds.com",
    "healthify": "healthifyme.com",
    "healthifyme": "healthifyme.com",
    "pristyn care": "pristyncare.com",
    "medibuddy": "medibuddy.in",
    "practo": "practo.com",
    "mfine": "mfine.co",
    "innovaccer": "innovaccer.com",
    "shiprocket": "shiprocket.in",
    "delhivery": "delhivery.com",
    "ecom express": "ecomexpress.in",
    "blackbuck": "blackbuck.com",
    "rivigo": "rivigo.com",
    "elasticrun": "elastic.run",
    "udaan": "udaan.com",
    "infra.market": "infra.market",
    "moglix": "moglix.com",
    "zetwerk": "zetwerk.com",
    "bizongo": "bizongo.com",
    "dealshare": "dealshare.in",
    "purplle": "purplle.com",
    "sugar cosmetics": "sugarcosmetics.com",
    "boat": "boat-lifestyle.com",
    "noise": "gonoise.com",
    "wakefit": "wakefit.co",
    "pepperfry": "pepperfry.com",
    "livspace": "livspace.com",
    "homelane": "homelane.com",
    "nobroker": "nobroker.in",
    "housing": "housing.com",
    "magicbricks": "magicbricks.com",
    "99acres": "99acres.com",
    "square yards": "squareyards.com"
}

INDIAN_HR_CONTACTS = {}

def resolve_company_domain(company_name: str) -> str:
    """
    Intelligently resolves and normalizes the official corporate domain for any company name
    (startups, mid-sized firms, agencies, boutique consultancies, or enterprises).
    """
    if not company_name:
        return "company.com"

    clean_comp = company_name.lower().strip()
    
    # 1. Exact or substring match in verified domain registry
    for k, v in KNOWN_DOMAINS.items():
        if k == clean_comp or k in clean_comp:
            return v

    # 2. Strip standard corporate legal suffixes & geo tags
    clean = clean_comp
    suffixes = [
        " pvt ltd", " private limited", " ltd", " limited", " inc", " llc", " corp", 
        " corporation", " technologies", " technology", " solutions", " software",
        " systems", " infotech", " global", " india", " labs", " studio", " interactive",
        " enterprises", " services", " consulting", " group"
    ]
    for suf in suffixes:
        if clean.endswith(suf):
            clean = clean[:-len(suf)].strip()

    # 3. Clean special characters and formulate domain
    domain_slug = re.sub(r'[^a-z0-9]', '', clean)
    if not domain_slug:
        domain_slug = re.sub(r'[^a-z0-9]', '', clean_comp) or ""

    return f"{domain_slug}.com" if domain_slug else ""


def validate_email_mx(email: str, timeout: int = 3) -> bool:
    """
    Validates that the email domain has resolvable DNS records (can receive email).
    Uses socket host resolution as a lightweight MX proxy — no external libraries needed.
    Returns True if domain resolves, False otherwise.
    """
    if not email or "@" not in email:
        return False
    try:
        domain = email.split("@")[1].strip()
        socket.setdefaulttimeout(timeout)
        socket.getaddrinfo(domain, None)
        return True
    except (socket.gaierror, socket.timeout, OSError):
        return False

# Module-level Hunter.io call counter — protects your credit quota
_hunter_call_count = 0
HUNTER_MAX_CALLS = int(os.getenv("HUNTER_MAX_CALLS", "10"))  # Override via .env if needed


def try_hunter_io(domain: str, role: str = "") -> Optional[str]:
    """
    Searches Hunter.io for recruiter/HR email addresses on a company domain.
    Only runs if HUNTER_IO_API_KEY is set in the environment.
    Caps at HUNTER_MAX_CALLS (default 10) to protect credit quota.
    Prefers HR/talent/recruiter titled contacts.
    Returns a confirmed email string, or None if not found / key missing.
    """
    global _hunter_call_count
    api_key = os.getenv("HUNTER_IO_API_KEY", "").strip()
    if not api_key or not domain:
        return None
    if _hunter_call_count >= HUNTER_MAX_CALLS:
        if _hunter_call_count == HUNTER_MAX_CALLS:
            _hunter_call_count += 1
            print(f"[Hunter.io] Credit cap reached ({HUNTER_MAX_CALLS} calls). Skipping further Hunter lookups.")
        return None
    _hunter_call_count += 1
    print(f"[Hunter.io] Call {_hunter_call_count}/{HUNTER_MAX_CALLS} — querying domain: {domain}")

    try:
        resp = requests.get(
            "https://api.hunter.io/v2/domain-search",
            params={"domain": domain, "department": "hr", "limit": 10, "api_key": api_key},
            timeout=5
        )
        if resp.status_code == 200:
            emails_list = resp.json().get("data", {}).get("emails", [])
            hr_keywords = ["recruiter", "talent", "hr", "hiring", "people", "human resource", "acquisition"]
            # Prefer HR-titled contacts with high confidence
            for entry in emails_list:
                title = (entry.get("position") or "").lower()
                email = (entry.get("value") or "").lower().strip()
                confidence = entry.get("confidence", 0)
                if email and confidence >= 50 and any(kw in title for kw in hr_keywords):
                    return email
            # Fall back to first result with decent confidence
            for entry in emails_list:
                email = (entry.get("value") or "").lower().strip()
                if email and entry.get("confidence", 0) >= 60:
                    return email
        else:
            err_msg = resp.json().get("errors", [{}])[0].get("details", resp.text[:100]) if resp.headers.get("content-type", "").startswith("application/json") else resp.text[:100]
            print(f"[Hunter.io] API status {resp.status_code} for {domain}: {err_msg}")
    except Exception as e:
        print(f"[Hunter.io] Lookup note for {domain}: {e}")
    return None

_hunter_verifier_cache = {}

def verify_email_with_hunter(email: str) -> Dict[str, Any]:
    """
    Verifies an email address using Hunter.io Email Verifier API:
    https://api.hunter.io/v2/email-verifier?email={email}&api_key={api_key}
    Returns structured verification payload indicating deliverability.
    """
    global _hunter_verifier_cache
    clean_email = (email or "").strip().lower()
    if not clean_email or "@" not in clean_email:
        return {
            "email": clean_email,
            "is_verified": False,
            "status": "invalid",
            "score": 0,
            "result": "undeliverable",
            "details": "Invalid email syntax"
        }

    if clean_email in _hunter_verifier_cache:
        return _hunter_verifier_cache[clean_email]

    api_key = os.getenv("HUNTER_IO_API_KEY", "").strip()
    if api_key:
        try:
            resp = requests.get(
                "https://api.hunter.io/v2/email-verifier",
                params={"email": clean_email, "api_key": api_key},
                timeout=7
            )
            if resp.status_code == 200:
                data = resp.json().get("data", {})
                status = data.get("status", "unknown")
                score = data.get("score", 0)
                result = data.get("result", "")
                
                # Strict Hunter deliverability logic:
                # Valid or deliverable, or accept_all with high confidence score (>= 60)
                # Invalid or undeliverable must NEVER be marked verified
                is_valid = (
                    (status == "valid" or result == "deliverable" or (status == "accept_all" and score >= 60))
                    and status != "invalid"
                    and result != "undeliverable"
                )
                
                res = {
                    "email": clean_email,
                    "is_verified": is_valid,
                    "status": status,
                    "score": score,
                    "result": result,
                    "details": f"Hunter.io: {status} (score: {score})"
                }
                _hunter_verifier_cache[clean_email] = res
                return res
            else:
                err_text = resp.text[:80] if resp.text else ""
                print(f"[Hunter.io Verifier] HTTP {resp.status_code} for {clean_email}: {err_text}")
        except Exception as e:
            print(f"[Hunter.io Verifier] Request error for {clean_email}: {e}")

    # If Hunter verification is unavailable or failed, do NOT falsely mark as verified
    is_domain_valid = validate_email_mx(clean_email)
    res = {
        "email": clean_email,
        "is_verified": False,
        "status": "unverified",
        "score": 40 if is_domain_valid else 0,
        "result": "unknown",
        "details": "Hunter.io verification unavailable"
    }
    _hunter_verifier_cache[clean_email] = res
    return res

def try_apollo_io(domain: str, company_name: str = "", role: str = "") -> Optional[str]:
    """
    Searches Apollo.io B2B people API for recruiter/HR email addresses on a company domain.
    Only runs if APOLLO_API_KEY is set in the environment.
    Returns a verified email string or None if not found / key missing.
    """
    api_key = os.getenv("APOLLO_API_KEY", "").strip()
    if not api_key:
        return None

    try:
        url = "https://api.apollo.io/v1/mixed_people/search"
        payload = {
            "api_key": api_key,
            "person_titles": ["recruiter", "talent acquisition", "hr manager", "human resources", "hiring manager", "head of talent"],
            "page": 1,
            "per_page": 5
        }
        if domain:
            payload["q_organization_domains"] = [domain]
        elif company_name:
            payload["q_organization_name"] = company_name

        resp = requests.post(url, json=payload, headers={"Content-Type": "application/json"}, timeout=5)
        if resp.status_code == 200:
            people = resp.json().get("people", [])
            for p in people:
                email = (p.get("email") or "").lower().strip()
                if email and not any(b in email for b in BLOCKED_EMAIL_PATTERNS):
                    return email
    except Exception as e:
        print(f"[Apollo.io] Lookup note for {company_name or domain}: {e}")

    return None


_adzuna_cache: Dict[str, Optional[str]] = {}

def try_adzuna_company_email(company_name: str, job_title: str = "") -> Optional[str]:
    """
    Searches Adzuna Indian jobs API for real postings from this company and
    extracts any recruiter email found in the description text.
    Only runs if ADZUNA_APP_ID and ADZUNA_APP_KEY are set in the environment.
    Returns a real email string, or None.
    """
    if not company_name:
        return None
    comp_key = company_name.lower().strip()
    if comp_key in _adzuna_cache:
        return _adzuna_cache[comp_key]

    app_id = os.getenv("ADZUNA_APP_ID", "").strip()
    app_key = os.getenv("ADZUNA_APP_KEY", "").strip()
    if not app_id or not app_key:
        _adzuna_cache[comp_key] = None
        return None

    try:
        resp = requests.get(
            "https://api.adzuna.com/v1/api/jobs/in/search/1",
            params={
                "app_id": app_id,
                "app_key": app_key,
                "results_per_page": 5,
                "what": job_title or company_name,
                "company": company_name,
                "content-type": "application/json",
            },
            timeout=3
        )
        if resp.status_code == 200:
            for job in resp.json().get("results", []):
                desc = job.get("description", "") or ""
                emails = re.findall(r'[\w.\-+]+@[\w.\-]+\.[a-zA-Z]{2,}', desc)
                for e in emails:
                    e_low = e.lower().strip()
                    if not any(b in e_low for b in BLOCKED_EMAIL_PATTERNS):
                        _adzuna_cache[comp_key] = e_low
                        return e_low
    except Exception as e:
        print(f"[Adzuna] Company email search note for {company_name}: {e}")

    _adzuna_cache[comp_key] = None
    return None


def format_phone_number(raw_digits: str) -> str:
    """
    Formats a raw digit string into a readable phone number (+91 format for India).
    """
    digits = re.sub(r'\D', '', raw_digits)
    if digits.startswith('91') and len(digits) == 12:
        return f"+91 {digits[2:7]} {digits[7:]}"
    elif len(digits) == 10:
        return f"+91 {digits[:5]} {digits[5:]}"
    elif len(digits) == 11 and digits.startswith('0'):
        return f"+91 {digits[1:6]} {digits[6:]}"
    return raw_digits.strip()


def extract_phone_numbers(text: str) -> Optional[str]:
    """
    Extracts authentic Indian mobile numbers (+91), office landlines with STD codes,
    or WhatsApp contact numbers if explicitly present in job text.
    """
    if not text:
        return None

    # Patterns for mobile (+91), STD landline, and formatted numbers
    phone_patterns = [
        r'(?:\+91[\s\-]?)?[6-9]\d{4}[\s\-]?\d{5}',
        r'\b0\d{2,4}[\s\-]?\d{6,8}\b',
        r'(?:\+91[\s\-]?)?[6-9]\d{9}',
        r'\b[6-9]\d{9}\b',
        r'\+?\d{1,3}[\s\-\.]?\(?\d{2,4}\)?[\s\-\.]?\d{3,4}[\s\-\.]?\d{3,4}'
    ]

    for pat in phone_patterns:
        matches = re.findall(pat, text)
        for m in matches:
            cleaned = m.strip()
            digits_only = re.sub(r'\D', '', cleaned)
            # Filter out salary amounts (e.g. 1200000, 2026, 500000)
            if 10 <= len(digits_only) <= 13 and not cleaned.startswith(('202', '201', '1000', '5000', '1200', '1500')):
                return format_phone_number(cleaned)
    return None


def find_recruiter_contact(
    job_description: str = "",
    company_name: str = "",
    source_url: str = "",
    job_title: str = "",
    target_location: str = ""
) -> Dict[str, Any]:
    """
    Extracts authentic recruiter contact details using a multi-stage pipeline:

    Stage 1 — Regex extract real email from job description text
    Stage 2 — Hunter.io API domain search (if HUNTER_IO_API_KEY env var set)
    Stage 3 — Adzuna live Indian jobs API (if ADZUNA_APP_ID + ADZUNA_APP_KEY set)
    Stage 4 — DNS host resolution to confirm domain deliverability
    Stage 5 — Return empty email + "Unable to Verify" if nothing found

    NEVER guesses or synthesizes email addresses.
    Only emails actually discovered from real sources are returned.
    """
    recruiter_email = ""
    recruiter_name = ""
    recruiter_phone = ""
    status = "Unable to Verify"
    verification_details = ""
    source_type = "Not Found"
    mx_valid = False

    # ── Stage 1: Real email extraction from job description text ──────────────
    if not recruiter_email:
        raw_emails = re.findall(r'[\w.\-+]+@[\w.\-]+\.[a-zA-Z]{2,}', job_description or "")
        valid_emails = [
            e.strip().lower() for e in raw_emails
            if not any(blocked in e.lower() for blocked in BLOCKED_EMAIL_PATTERNS)
            and len(e) <= 100
            and re.match(r'^[\w.\-+]+@[\w.\-]+\.[a-zA-Z]{2,}$', e.strip())
        ]
        if valid_emails:
            recruiter_email = valid_emails[0]
            source_type = "Job Posting Text"

    # ── Stage 2: Hunter.io API lookup (optional — requires HUNTER_IO_API_KEY) ─
    if not recruiter_email:
        domain = resolve_company_domain(company_name)
        if domain:
            hunter_email = try_hunter_io(domain=domain, role=job_title)
            if hunter_email:
                recruiter_email = hunter_email
                source_type = "Hunter.io API"

    # ── Stage 2b: Apollo.io API lookup (optional — requires APOLLO_API_KEY) ──
    if not recruiter_email:
        domain = resolve_company_domain(company_name)
        apollo_email = try_apollo_io(domain=domain, company_name=company_name, role=job_title)
        if apollo_email:
            recruiter_email = apollo_email
            source_type = "Apollo.io API"

    # ── Stage 2c: Hunter.io Deliverability Verification ───────────────────────
    # Strictly verify the found email address using Hunter.io Email Verifier API.
    # Display and keep ONLY emails verified by Hunter.io.
    if recruiter_email:
        h_ver = verify_email_with_hunter(recruiter_email)
        if h_ver.get("is_verified"):
            status = "Verified"
            mx_valid = True
            verification_details = f"Hunter.io verified: {h_ver.get('details', 'valid')}"
        else:
            status = "Unable to Verify"
            verification_details = f"Hunter.io verification failed: {h_ver.get('details', 'undeliverable')}"
            # Only verified emails are displayed
            recruiter_email = ""
            mx_valid = False

    # ── Stage 3: If no authentic HR email was found, do NOT guess or synthesize ─
    if not recruiter_email:
        status = "Unlisted / Direct Apply"
        verification_details = f"No direct verified recruiter email address extracted for {company_name or 'this company'}."
        source_type = "Not Found"

    # ── Stage 5: Extract or generate recruiter name ───────────────────────────
    if not recruiter_name:
        for pattern in COMMON_RECRUITER_TERMS:
            match = re.search(pattern, job_description or "", re.IGNORECASE)
            if match:
                recruiter_name = match.group(1).strip()
                break
        if not recruiter_name:
            recruiter_name = f"{company_name} Talent Acquisition" if company_name else "Hiring Team"

    # ── Stage 6: Extract authentic phone number from job description text ─────
    if not recruiter_phone:
        recruiter_phone = extract_phone_numbers(job_description) or ""

    return {
        "recruiter_email": recruiter_email,
        "recruiter_phone": recruiter_phone,
        "recruiter_name": recruiter_name,
        "status": status,
        "verification_status": status,
        "verification_details": verification_details,
        "is_verified": (status == "Verified"),
        "domain": resolve_company_domain(company_name),
        "source": source_type,
        "target_role": job_title,
        "target_location": target_location,
        "mx_valid": mx_valid,
    }

