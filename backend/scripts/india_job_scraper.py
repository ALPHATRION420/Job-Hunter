import sys
import os
import argparse
from datetime import datetime
from typing import List, Optional

# Configure UTF-8 encoding for stdout on Windows terminals
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Add parent directory to python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from mongo_db import mongo_handler
from services.job_crawler import fetch_jobs_from_crawlers
from services.ai_matcher import calculate_job_match
from services.hr_finder import find_recruiter_contact
from services.email_generator import generate_personalized_email
from services.mailer import send_application_email
from services.excel_exporter import generate_excel_bytes, generate_csv_bytes

def run_scraper_agent(
    keyword: Optional[str] = None,
    location: Optional[str] = None,
    roles: Optional[List[str]] = None,
    locations: Optional[List[str]] = None,
    count: int = 30,
    export_excel: bool = True,
    export_csv: bool = True,
    auto_email: bool = False
):
    print("=" * 75)
    print("🚀 JobHunter AI Agent - Autonomous Multi-Role & Multi-Location HR Contact Scraper")
    print("=" * 75)

    # 1. Fetch profile to read preferred roles & locations if not explicitly passed
    profile = mongo_handler.get_first_profile() if mongo_handler.is_connected() else {}
    if not profile:
        profile = {
            "name": "Candidate",
            "email": "candidate@techdev.io",
            "skills": ["Python", "React", "FastAPI", "TypeScript", "SQL"],
            "preferred_roles": ["Software Engineer", "Full Stack Developer"],
            "preferred_locations": ["Bangalore, KA", "Remote (India)"]
        }

    cand_skills = profile.get("skills", ["Python", "React", "FastAPI", "TypeScript", "SQL"])
    saved_roles = profile.get("preferred_roles", ["Software Engineer", "Full Stack Developer"])
    saved_locations = profile.get("preferred_locations", ["Bangalore, KA", "Remote (India)"])
    sender_email = profile.get("email", "candidate@techdev.io")

    # Combine passed arguments with profile preferences
    target_roles = roles if (roles and len(roles) > 0) else ([keyword] if keyword else saved_roles)
    target_locations = locations if (locations and len(locations) > 0) else ([location] if location else saved_locations)

    print(f"🎯 Target Roles ({len(target_roles)}): {', '.join(target_roles)}")
    print(f"📍 Target Locations ({len(target_locations)}): {', '.join(target_locations)}")
    print(f"👤 Candidate Profile: {profile.get('name', 'Candidate')} <{sender_email}>")
    print("-" * 75)

    all_scraped_jobs = []
    print("\n[1/4] Crawling Multi-Portal Indian Job Feeds (Naukri, Instahyre, LinkedIn India, Cutshort, RemoteOK)...")
    
    # Query crawler for each combination of target role and location
    for loc in target_locations:
        for r in target_roles:
            batch = fetch_jobs_from_crawlers(
                query_title=r,
                location_filter=loc,
                preferred_roles=target_roles,
                preferred_locations=target_locations
            )
            for j in batch:
                if not any(existing["title"] == j["title"] and existing["company"] == j["company"] for existing in all_scraped_jobs):
                    all_scraped_jobs.append(j)

    # Fallback to general crawl if empty
    if not all_scraped_jobs:
        all_scraped_jobs = fetch_jobs_from_crawlers(preferred_roles=target_roles, preferred_locations=target_locations)

    print(f"✓ Discovered {len(all_scraped_jobs)} relevant job postings across target roles and hubs.")

    print("\n[2/4] Enriching Direct HR Contacts & Computing Candidate ATS Match %...")
    new_jobs = []
    existing_mongo_jobs = { (j.get("title"), j.get("company")): j for j in mongo_handler.get_all_jobs() } if mongo_handler.is_connected() else {}

    for idx, j in enumerate(all_scraped_jobs[:count], start=1):
        # Enforce HR contact extraction with role and location context
        hr_info = find_recruiter_contact(
            job_description=j.get("description", ""),
            company_name=j.get("company", ""),
            source_url=j.get("source_url", ""),
            job_title=j.get("title", ""),
            target_location=j.get("location", "")
        )

        recruiter_name = j.get("recruiter_name") or hr_info["recruiter_name"]
        recruiter_email = j.get("recruiter_email") or hr_info["recruiter_email"]
        recruiter_phone = j.get("recruiter_phone") or hr_info.get("recruiter_phone", "")
        recruiter_status = j.get("recruiter_status") or hr_info["status"]

        # Compute AI Match score
        match_res = calculate_job_match(
            cand_skills, target_roles, j["title"], j["description"], j["required_skills"]
        )

        doc = {
            "id": idx + len(existing_mongo_jobs),
            "title": j["title"],
            "company": j["company"],
            "location": j["location"],
            "work_type": j["work_type"],
            "job_type": j["job_type"],
            "salary": j["salary"],
            "experience_level": j["experience_level"],
            "company_size": j["company_size"],
            "match_score": match_res["match_score"],
            "description": j["description"],
            "required_skills": j["required_skills"],
            "missing_skills": match_res["missing_skills"],
            "recruiter_name": recruiter_name,
            "recruiter_email": recruiter_email,
            "recruiter_phone": recruiter_phone,
            "recruiter_status": recruiter_status,
            "source_portal": j["source_portal"],
            "source_url": j["source_url"]
        }

        # Save in MongoDB Atlas if connected
        if mongo_handler.is_connected():
            key = (j["title"], j["company"])
            if key not in existing_mongo_jobs:
                mongo_handler.save_jobs_batch([doc])
                existing_mongo_jobs[key] = doc

        new_jobs.append(doc)
        print(f"   [{idx}/{min(len(all_scraped_jobs), count)}] {j['company']} ({j['location']}) - {j['title']} | Match: {match_res['match_score']}% | HR: {recruiter_name} <{recruiter_email}>")

    # Fetch all jobs to prepare comprehensive export
    all_export_jobs = mongo_handler.get_all_jobs() if mongo_handler.is_connected() else new_jobs
    if not all_export_jobs:
        all_export_jobs = new_jobs

    print("\n[3/4] Generating Excel (.xlsx) & CSV Data Reports...")
    output_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    if export_excel:
        excel_bytes = generate_excel_bytes(all_export_jobs)
        excel_path = os.path.join(output_dir, "HR_Contacts_India.xlsx")
        with open(excel_path, "wb") as f:
            f.write(excel_bytes)
        print(f"  ✓ Native Excel spreadsheet generated: {excel_path}")

    if export_csv:
        csv_bytes = generate_csv_bytes(all_export_jobs)
        csv_path = os.path.join(output_dir, "HR_Contacts_India.csv")
        with open(csv_path, "wb") as f:
            f.write(csv_bytes)
        print(f"  ✓ CSV spreadsheet generated: {csv_path}")

    log_summary = f"Scraped and verified HR contacts across {len(target_roles)} roles and {len(target_locations)} locations. {len(new_jobs)} authentic contacts saved."
    if mongo_handler.is_connected():
        mongo_handler.add_log("SUCCESS", "HR Contacts Scrape & Verification Complete", log_summary)

    print("\n" + "=" * 75)
    print(f"🎉 SUCCESS! Discovered & verified {len(new_jobs)} authentic HR contacts.")
    print("=" * 75)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Autonomous Indian Job & Authentic HR Contact Extractor Script")
    parser.add_argument("--keyword", type=str, default=None, help="Job position or skill keyword")
    parser.add_argument("--location", type=str, default=None, help="Target Indian city/location")
    parser.add_argument("--roles", nargs="+", default=None, help="List of multiple target job roles")
    parser.add_argument("--locations", nargs="+", default=None, help="List of multiple target locations")
    parser.add_argument("--count", type=int, default=30, help="Max number of HR contacts to scrape")
    parser.add_argument("--no-excel", action="store_true", help="Disable Excel export")
    parser.add_argument("--no-csv", action="store_true", help="Disable CSV export")

    args = parser.parse_args()

    run_scraper_agent(
        keyword=args.keyword,
        location=args.location,
        roles=args.roles,
        locations=args.locations,
        count=args.count,
        export_excel=not args.no_excel,
        export_csv=not args.no_csv
    )
