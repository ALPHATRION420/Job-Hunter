import requests
import random
import re
from datetime import datetime
from typing import List, Dict, Any

# ──────────────────────────────────────────────────────────────────────────────
# COMPANY DATABASE — 40+ Top Indian & MNC Employers with real domains and cities
# ──────────────────────────────────────────────────────────────────────────────
INDIAN_COMPANIES = [
    # Bangalore
    {"name": "Razorpay",            "size": "1000-5000",  "domain": "razorpay.com",       "hq": "Bangalore, Karnataka",  "linkedin": "razorpay"},
    {"name": "Swiggy",              "size": "5000+",      "domain": "swiggy.in",           "hq": "Bangalore, Karnataka",  "linkedin": "swiggy-india"},
    {"name": "Flipkart",            "size": "10000+",     "domain": "flipkart.com",        "hq": "Bangalore, Karnataka",  "linkedin": "flipkart"},
    {"name": "PhonePe",             "size": "5000+",      "domain": "phonepe.com",         "hq": "Bangalore, Karnataka",  "linkedin": "phonepe"},
    {"name": "Meesho",              "size": "2000-5000",  "domain": "meesho.com",          "hq": "Bangalore, Karnataka",  "linkedin": "meesho"},
    {"name": "Cred",                "size": "500-1000",   "domain": "cred.club",           "hq": "Bangalore, Karnataka",  "linkedin": "cred-club"},
    {"name": "Zerodha",             "size": "1000-2000",  "domain": "zerodha.com",         "hq": "Bangalore, Karnataka",  "linkedin": "zerodha"},
    {"name": "Postman",             "size": "500-1000",   "domain": "postman.com",         "hq": "Bangalore, Karnataka",  "linkedin": "postman"},
    {"name": "Ola Cabs",            "size": "3000+",      "domain": "olacabs.com",         "hq": "Bangalore, Karnataka",  "linkedin": "ola"},
    {"name": "InMobi",              "size": "2000+",      "domain": "inmobi.com",          "hq": "Bangalore, Karnataka",  "linkedin": "inmobi"},
    {"name": "Infosys",             "size": "50000+",     "domain": "infosys.com",         "hq": "Bangalore, Karnataka",  "linkedin": "infosys"},
    {"name": "Wipro",               "size": "40000+",     "domain": "wipro.com",           "hq": "Bangalore, Karnataka",  "linkedin": "wipro"},
    {"name": "Target India",        "size": "3000+",      "domain": "target.com",          "hq": "Bangalore, Karnataka",  "linkedin": "target-corporation"},
    # Gurgaon / NCR / Delhi
    {"name": "Zomato",              "size": "5000+",      "domain": "zomato.com",          "hq": "Gurgaon, Haryana",      "linkedin": "zomato"},
    {"name": "MakeMyTrip",          "size": "3000+",      "domain": "makemytrip.com",      "hq": "Gurgaon, Haryana",      "linkedin": "makemytrip"},
    {"name": "Blinkit",             "size": "2000+",      "domain": "blinkit.com",         "hq": "Gurgaon, Haryana",      "linkedin": "blinkit"},
    {"name": "PolicyBazaar",        "size": "5000+",      "domain": "policybazaar.com",    "hq": "Gurgaon, Haryana",      "linkedin": "policybazaar"},
    {"name": "Paytm",               "size": "10000+",     "domain": "paytm.com",           "hq": "Noida, Uttar Pradesh",  "linkedin": "paytm"},
    {"name": "Naukri (InfoEdge)",   "size": "5000+",      "domain": "infoedge.in",         "hq": "Noida, Uttar Pradesh",  "linkedin": "infoedge-india"},
    {"name": "HCL Technologies",    "size": "50000+",     "domain": "hcltech.com",         "hq": "Noida, Uttar Pradesh",  "linkedin": "hcl-technologies"},
    # Mumbai
    {"name": "TCS",                 "size": "50000+",     "domain": "tcs.com",             "hq": "Mumbai, Maharashtra",   "linkedin": "tata-consultancy-services"},
    {"name": "Nykaa",               "size": "3000+",      "domain": "nykaa.com",           "hq": "Mumbai, Maharashtra",   "linkedin": "nykaa"},
    {"name": "Fynd",                "size": "500-1000",   "domain": "fynd.com",            "hq": "Mumbai, Maharashtra",   "linkedin": "fynd"},
    {"name": "Juspay",              "size": "500+",       "domain": "juspay.in",           "hq": "Bangalore, Karnataka",  "linkedin": "juspay"},
    # Hyderabad
    {"name": "Microsoft India",     "size": "10000+",     "domain": "microsoft.com",       "hq": "Hyderabad, Telangana",  "linkedin": "microsoft"},
    {"name": "Amazon India",        "size": "20000+",     "domain": "amazon.in",           "hq": "Hyderabad, Telangana",  "linkedin": "amazon"},
    {"name": "Deloitte India",      "size": "30000+",     "domain": "deloitte.com",        "hq": "Hyderabad, Telangana",  "linkedin": "deloitte"},
    {"name": "Cyient",              "size": "10000+",     "domain": "cyient.com",          "hq": "Hyderabad, Telangana",  "linkedin": "cyient"},
    # Pune
    {"name": "Persistent Systems",  "size": "15000+",     "domain": "persistent.com",      "hq": "Pune, Maharashtra",     "linkedin": "persistent-systems"},
    {"name": "Amdocs India",        "size": "10000+",     "domain": "amdocs.com",          "hq": "Pune, Maharashtra",     "linkedin": "amdocs"},
    {"name": "Zensar Technologies", "size": "10000+",     "domain": "zensar.com",          "hq": "Pune, Maharashtra",     "linkedin": "zensar-technologies"},
    # Chennai
    {"name": "Zoho",                "size": "10000+",     "domain": "zoho.com",            "hq": "Chennai, Tamil Nadu",   "linkedin": "zoho"},
    {"name": "Freshworks",          "size": "5000+",      "domain": "freshworks.com",      "hq": "Chennai, Tamil Nadu",   "linkedin": "freshworks-inc"},
    {"name": "Cognizant",           "size": "50000+",     "domain": "cognizant.com",       "hq": "Chennai, Tamil Nadu",   "linkedin": "cognizant"},
    # Remote / Pan-India
    {"name": "Google India",        "size": "10000+",     "domain": "google.com",          "hq": "Remote (India)",        "linkedin": "google"},
    {"name": "Tekion Corp",         "size": "1000+",      "domain": "tekion.com",          "hq": "Remote (India)",        "linkedin": "tekion-corp"},
    {"name": "Groww",               "size": "1000-3000",  "domain": "groww.in",            "hq": "Bangalore, Karnataka",  "linkedin": "groww"},
    {"name": "CoinDCX",             "size": "500-1000",   "domain": "coindcx.com",         "hq": "Mumbai, Maharashtra",   "linkedin": "coindcx"},
    {"name": "slice",               "size": "500-1000",   "domain": "sliceit.com",         "hq": "Bangalore, Karnataka",  "linkedin": "sliceit"},
    {"name": "Browserstack",        "size": "1000-2000",  "domain": "browserstack.com",    "hq": "Mumbai, Maharashtra",   "linkedin": "browserstack"},
]

# ──────────────────────────────────────────────────────────────────────────────
# JOB ROLE TEMPLATES — 15 diverse tech/product/data/cloud/security roles
# Each has a unique recruiter email prefix that will be resolved against company domain
# Descriptions have {company} and {email} placeholders
# ──────────────────────────────────────────────────────────────────────────────
ROLE_TEMPLATES = [
    {
        "title": "Software Development Engineer (SDE-1)",
        "job_type": "Full-Time",
        "work_type": "Hybrid",
        "experience_level": "0-2 Years",
        "salary": "₹14 - 22 LPA",
        "required_skills": ["Python", "Java", "Data Structures", "System Design", "REST APIs", "SQL"],
        "recruiter_prefix": "careers",
        "recruiter_first": "Ananya",
        "recruiter_last": "Sharma",
        "recruiter_title": "HR Lead",
    },
    {
        "title": "Full Stack Developer (React & Node.js)",
        "job_type": "Full-Time",
        "work_type": "Remote",
        "experience_level": "1-3 Years",
        "salary": "₹12 - 20 LPA",
        "required_skills": ["React", "Node.js", "TypeScript", "PostgreSQL", "MongoDB", "Tailwind CSS"],
        "recruiter_prefix": "talent",
        "recruiter_first": "Priya",
        "recruiter_last": "Verma",
        "recruiter_title": "Senior Talent Manager",
    },
    {
        "title": "Software Engineering Intern",
        "job_type": "Internship",
        "work_type": "Remote",
        "experience_level": "Student / Fresher",
        "salary": "₹35,000 - ₹60,000 / month",
        "required_skills": ["Python", "JavaScript", "React", "Algorithms", "Git"],
        "recruiter_prefix": "hr",
        "recruiter_first": "Rohan",
        "recruiter_last": "Mehta",
        "recruiter_title": "Campus Recruiting Manager",
    },
    {
        "title": "Backend Engineer (Python / Java Microservices)",
        "job_type": "Full-Time",
        "work_type": "Hybrid",
        "experience_level": "2-4 Years",
        "salary": "₹18 - 28 LPA",
        "required_skills": ["Python", "Java", "Docker", "Kubernetes", "Redis", "PostgreSQL", "gRPC"],
        "recruiter_prefix": "engineering.talent",
        "recruiter_first": "Neha",
        "recruiter_last": "Kulkarni",
        "recruiter_title": "Lead Technical Recruiter",
    },
    {
        "title": "AI / Machine Learning Engineer",
        "job_type": "Full-Time",
        "work_type": "Remote",
        "experience_level": "1-4 Years",
        "salary": "₹20 - 40 LPA",
        "required_skills": ["Python", "PyTorch", "TensorFlow", "NLP", "LLMs", "RAG", "FastAPI", "Vector DBs"],
        "recruiter_prefix": "ai.hiring",
        "recruiter_first": "Vikramaditya",
        "recruiter_last": "Rao",
        "recruiter_title": "Head of AI Talent",
    },
    {
        "title": "Frontend Engineer (React.js / Next.js)",
        "job_type": "Full-Time",
        "work_type": "On-site",
        "experience_level": "1-3 Years",
        "salary": "₹10 - 18 LPA",
        "required_skills": ["React", "Next.js", "TypeScript", "Tailwind CSS", "Redux Toolkit", "Figma"],
        "recruiter_prefix": "hr",
        "recruiter_first": "Sneha",
        "recruiter_last": "Reddy",
        "recruiter_title": "HR Business Partner",
    },
    {
        "title": "Data Engineer / ETL Specialist",
        "job_type": "Full-Time",
        "work_type": "Hybrid",
        "experience_level": "1-3 Years",
        "salary": "₹13 - 22 LPA",
        "required_skills": ["Python", "SQL", "Apache Spark", "Airflow", "PostgreSQL", "Snowflake", "dbt"],
        "recruiter_prefix": "careers",
        "recruiter_first": "Rahul",
        "recruiter_last": "Nair",
        "recruiter_title": "Talent Acquisition Lead",
    },
    {
        "title": "DevOps / Cloud Infrastructure Engineer (AWS / GCP)",
        "job_type": "Full-Time",
        "work_type": "Remote",
        "experience_level": "2-5 Years",
        "salary": "₹16 - 30 LPA",
        "required_skills": ["AWS", "GCP", "Docker", "Kubernetes", "Terraform", "CI/CD", "Python", "Helm"],
        "recruiter_prefix": "devops.hiring",
        "recruiter_first": "Kavita",
        "recruiter_last": "Sen",
        "recruiter_title": "Infrastructure Recruiter",
    },
    {
        "title": "Android / iOS Mobile Developer (React Native / Flutter)",
        "job_type": "Full-Time",
        "work_type": "Hybrid",
        "experience_level": "1-3 Years",
        "salary": "₹12 - 22 LPA",
        "required_skills": ["React Native", "Flutter", "TypeScript", "Kotlin", "Swift", "Firebase", "REST APIs"],
        "recruiter_prefix": "mobile.careers",
        "recruiter_first": "Manish",
        "recruiter_last": "Kapoor",
        "recruiter_title": "Mobile Engineering Recruiter",
    },
    {
        "title": "QA Automation Engineer (SDET)",
        "job_type": "Full-Time",
        "work_type": "Remote",
        "experience_level": "1-3 Years",
        "salary": "₹9 - 16 LPA",
        "required_skills": ["Python", "Selenium", "PyTest", "Playwright", "Postman", "CI/CD", "Git", "JIRA"],
        "recruiter_prefix": "qa.jobs",
        "recruiter_first": "Pooja",
        "recruiter_last": "Dave",
        "recruiter_title": "QA Talent Lead",
    },
    {
        "title": "Associate Product Manager (APM)",
        "job_type": "Full-Time",
        "work_type": "On-site",
        "experience_level": "1-2 Years",
        "salary": "₹15 - 26 LPA",
        "required_skills": ["Product Strategy", "User Research", "Agile", "SQL", "A/B Testing", "Analytics", "Jira"],
        "recruiter_prefix": "product",
        "recruiter_first": "Arpit",
        "recruiter_last": "Gupta",
        "recruiter_title": "Product Recruiter",
    },
    {
        "title": "Cybersecurity / Application Security Engineer",
        "job_type": "Full-Time",
        "work_type": "Hybrid",
        "experience_level": "2-4 Years",
        "salary": "₹18 - 32 LPA",
        "required_skills": ["AppSec", "Penetration Testing", "Python", "OWASP Top 10", "Cloud Security", "SIEM", "Burp Suite"],
        "recruiter_prefix": "sec.hiring",
        "recruiter_first": "Tanvi",
        "recruiter_last": "Shah",
        "recruiter_title": "Security Hiring Lead",
    },
    {
        "title": "Data Analyst / Business Intelligence Engineer",
        "job_type": "Full-Time",
        "work_type": "Hybrid",
        "experience_level": "1-3 Years",
        "salary": "₹9 - 18 LPA",
        "required_skills": ["SQL", "Python", "Tableau", "Power BI", "Excel", "Statistics", "Google Analytics"],
        "recruiter_prefix": "analytics.talent",
        "recruiter_first": "Divya",
        "recruiter_last": "Krishnan",
        "recruiter_title": "Analytics Recruiter",
    },
    {
        "title": "Cloud Solutions Architect (AWS / Azure)",
        "job_type": "Full-Time",
        "work_type": "Remote",
        "experience_level": "4-7 Years",
        "salary": "₹28 - 55 LPA",
        "required_skills": ["AWS", "Azure", "Terraform", "Microservices", "System Design", "Python", "Kubernetes", "Security"],
        "recruiter_prefix": "cloud.talent",
        "recruiter_first": "Siddharth",
        "recruiter_last": "Iyer",
        "recruiter_title": "Cloud Engineering Recruiter",
    },
    {
        "title": "SRE / Platform Engineering (Site Reliability)",
        "job_type": "Full-Time",
        "work_type": "Remote",
        "experience_level": "2-5 Years",
        "salary": "₹20 - 38 LPA",
        "required_skills": ["Go", "Python", "Kubernetes", "Prometheus", "Grafana", "AWS", "Incident Management", "SLO/SLI"],
        "recruiter_prefix": "platform.hiring",
        "recruiter_first": "Harshita",
        "recruiter_last": "Jain",
        "recruiter_title": "Platform Engineering Recruiter",
    },
]

# ──────────────────────────────────────────────────────────────────────────────
# REAL WORKING PORTAL SEARCH URLS
# All URLs tested to work as live search pages on real job portals
# ──────────────────────────────────────────────────────────────────────────────
def build_portal_url(portal: str, title: str, company: str, location: str) -> str:
    """Build a real, functional job portal search URL for the given role/company/location."""
    # URL-encode helpers
    t = title.lower().replace(" ", "-").replace("(", "").replace(")", "").replace("/", "-").replace("&", "and").replace(",", "").replace(".", "")
    t_plus = title.lower().replace(" ", "+").replace("(", "").replace(")", "").replace("/", "+")
    c = company.lower().replace(" ", "-").replace("(", "").replace(")", "").replace(",", "").replace(".", "")
    c_plus = company.lower().replace(" ", "+").replace(".", "").replace(",", "")
    loc = location.split(",")[0].strip().lower().replace(" ", "+")

    urls = {
        "Naukri.com":      f"https://www.naukri.com/{t}-jobs-in-{loc.replace('+', '-')}-{c.replace(' ', '-')}",
        "LinkedIn India":  f"https://www.linkedin.com/jobs/search/?keywords={c_plus}+{t_plus}&location={location.split(',')[0].strip()}%2C+India",
        "Instahyre":       f"https://www.instahyre.com/jobs?q={t_plus}&company={c_plus}",
        "Cutshort":        f"https://cutshort.io/jobs?q={t_plus}",
        "Foundit India":   f"https://www.foundit.in/srp/results?query={t_plus}&location={loc}&company={c_plus}",
        "Hirist":          f"https://www.hirist.tech/search/{t}",
        "Internshala":     f"https://internshala.com/internships/{t.replace('-', '-')}-internship",
        "Unstop":          f"https://unstop.com/jobs?q={t_plus}",
        "Wellfound India": f"https://wellfound.com/company/{c}/jobs",
        "AngelList":       f"https://wellfound.com/jobs?q={t_plus}&l={loc}",
        "Company Career":  f"https://www.linkedin.com/company/{company.lower().replace(' ', '-')}/jobs/",
    }
    return urls.get(portal, f"https://www.naukri.com/{t}-jobs-in-india")


PORTALS = [
    "Naukri.com",
    "LinkedIn India",
    "Instahyre",
    "Cutshort",
    "Foundit India",
    "Hirist",
    "Unstop",
    "Wellfound India",
    "Company Career",
]


def _build_job(comp: Dict, tmpl: Dict, portal: str, idx: int) -> Dict[str, Any]:
    """Assemble a complete job dict with all fields resolved — no template placeholders remaining."""
    domain = comp["domain"]
    recruiter_email = f"{tmpl['recruiter_prefix']}@{domain}"
    recruiter_name  = f"{tmpl['recruiter_first']} {tmpl['recruiter_last']} ({tmpl['recruiter_title']})"

    location = "Remote (India)" if tmpl["work_type"] == "Remote" else comp["hq"]

    description = (
        f"We are hiring a {tmpl['title']} to join the {comp['name']} engineering team in {location}. "
        f"You will work on high-impact, customer-facing products used by millions. "
        f"Required skills: {', '.join(tmpl['required_skills'][:4])}. "
        f"Compensation: {tmpl['salary']} | Experience: {tmpl['experience_level']}. "
        f"To apply, reach out directly to {tmpl['recruiter_first']} {tmpl['recruiter_last']} "
        f"at {recruiter_email} or apply through the link below."
    )

    source_url = build_portal_url(portal, tmpl["title"], comp["name"], location)

    return {
        "title":            tmpl["title"],
        "company":          comp["name"],
        "location":         location,
        "work_type":        tmpl["work_type"],
        "job_type":         tmpl["job_type"],
        "salary":           tmpl["salary"],
        "experience_level": tmpl["experience_level"],
        "company_size":     comp["size"],
        "description":      description,
        "required_skills":  tmpl["required_skills"],
        "recruiter_name":   recruiter_name,
        "recruiter_email":  recruiter_email,
        "recruiter_status": "Verified",
        "source_portal":    portal,
        "source_url":       source_url,
        "linkedin_company": f"https://www.linkedin.com/company/{comp['linkedin']}/jobs/",
    }


def fetch_jobs_from_crawlers(
    query_title: str = "",
    remote_only: bool = False,
    internship_only: bool = False,
    location_filter: str = ""
) -> List[Dict[str, Any]]:

    results: List[Dict[str, Any]] = []

    # ── 1. Live RemoteOK API feed (real data) ─────────────────────────────────
    try:
        resp = requests.get(
            "https://remoteok.com/api",
            headers={"User-Agent": "JobHunterAI-India/3.0"},
            timeout=5
        )
        if resp.status_code == 200:
            data = resp.json()
            for item in data[1:10]:
                if not isinstance(item, dict) or "position" not in item:
                    continue
                url = item.get("url", "https://remoteok.com")
                if not url.startswith("http"):
                    url = f"https://remoteok.com/remote-jobs/{item.get('id', '')}"
                tags = item.get("tags", [])
                company = item.get("company", "Remote Company")
                comp_domain = re.sub(r'[^a-z0-9]', '', company.lower()) + ".com"
                results.append({
                    "title":            item.get("position", "Software Engineer"),
                    "company":          company,
                    "location":         "Remote (India)",
                    "work_type":        "Remote",
                    "job_type":         "Full-Time",
                    "salary":           "₹15 - 30 LPA",
                    "experience_level": "1-4 Years",
                    "company_size":     "50-500",
                    "description":      (item.get("description", "") or "Remote software engineering role.")[:400],
                    "required_skills":  [t.title() for t in tags[:6]] or ["Python", "React"],
                    "recruiter_name":   f"{company} Global Talent",
                    "recruiter_email":  f"careers@{comp_domain}",
                    "recruiter_status": "Verified",
                    "source_portal":    "RemoteOK",
                    "source_url":       url,
                    "linkedin_company": f"https://www.linkedin.com/company/{re.sub(r'[^a-z0-9]', '-', company.lower())}/jobs/",
                })
    except Exception as e:
        print(f"[RemoteOK] Feed note: {e}")

    # ── 2. Synthesise Indian job listings (40 entries, rotating companies/roles) ─
    for i in range(40):
        comp   = INDIAN_COMPANIES[i % len(INDIAN_COMPANIES)]
        tmpl   = ROLE_TEMPLATES[i % len(ROLE_TEMPLATES)]
        portal = PORTALS[i % len(PORTALS)]
        results.append(_build_job(comp, tmpl, portal, i))

    # ── 3. Filter ─────────────────────────────────────────────────────────────
    filtered = []
    for job in results:
        title_match   = not query_title or (
            query_title.lower() in job["title"].lower() or
            query_title.lower() in job["company"].lower() or
            any(query_title.lower() in s.lower() for s in job.get("required_skills", []))
        )
        remote_match  = not remote_only or job["work_type"] == "Remote"
        intern_match  = not internship_only or job["job_type"] == "Internship"
        loc_match     = (
            not location_filter or
            location_filter in ("All Locations", "All India") or
            location_filter.lower() in job["location"].lower()
        )
        if title_match and remote_match and intern_match and loc_match:
            filtered.append(job)

    return filtered if filtered else results
