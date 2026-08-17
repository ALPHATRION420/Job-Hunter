import sys
import os
import argparse
from datetime import datetime

# Configure UTF-8 encoding for stdout on Windows terminals
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Add parent directory to python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


from database import SessionLocal, engine, Base
import models
from services.job_crawler import fetch_jobs_from_crawlers
from services.ai_matcher import calculate_job_match
from services.hr_finder import find_recruiter_contact
from services.email_generator import generate_personalized_email
from services.mailer import send_application_email
from services.excel_exporter import generate_excel_bytes, generate_csv_bytes

# Ensure DB tables exist
Base.metadata.create_all(bind=engine)

def run_scraper_agent(
    keyword: str = "Software Engineer",
    location: str = "Bangalore",
    count: int = 25,
    export_excel: bool = True,
    export_csv: bool = True,
    auto_email: bool = False
):
    print("=" * 70)
    print(f"🚀 JobHunter AI Agent - Autonomous Indian Job & HR Contact Scraper")
    print(f"📍 Location Target: {location} | Keyword: {keyword}")
    print("=" * 70)

    db = SessionLocal()
    try:
        # Get active profile
        profile = db.query(models.UserProfile).first()
        cand_skills = profile.skills if profile else ["Python", "React", "FastAPI"]
        cand_roles = profile.preferred_roles if profile else ["Software Engineer"]
        sender_email = profile.email if profile else "candidate@techdev.io"

        print(f"\n[1/4] Crawling Indian job portals (Naukri, Instahyre, LinkedIn India, Cutshort, RemoteOK)...")
        scraped_jobs = fetch_jobs_from_crawlers(
            query_title=keyword,
            location_filter=location
        )

        print(f"✓ Discovered {len(scraped_jobs)} raw job postings.")

        print("\n[2/4] Enriching HR Contacts & Computing Candidate ATS Match %...")
        new_jobs = []
        for idx, j in enumerate(scraped_jobs[:count], start=1):
            # Enforce HR contact extraction
            hr_info = find_recruiter_contact(
                job_description=j["description"],
                company_name=j["company"],
                source_url=j.get("source_url", "")
            )

            recruiter_name = j.get("recruiter_name") or hr_info["recruiter_name"]
            recruiter_email = j.get("recruiter_email") or hr_info["recruiter_email"]
            recruiter_status = j.get("recruiter_status") or hr_info["status"]

            # Compute AI Match
            match_res = calculate_job_match(
                cand_skills, cand_roles, j["title"], j["description"], j["required_skills"]
            )

            # Check if job already exists in DB
            existing = db.query(models.Job).filter(
                models.Job.title == j["title"], 
                models.Job.company == j["company"]
            ).first()

            if not existing:
                job_obj = models.Job(
                    title=j["title"],
                    company=j["company"],
                    location=j["location"],
                    work_type=j["work_type"],
                    job_type=j["job_type"],
                    salary=j["salary"],
                    experience_level=j["experience_level"],
                    company_size=j["company_size"],
                    match_score=match_res["match_score"],
                    description=j["description"],
                    required_skills=j["required_skills"],
                    missing_skills=match_res["missing_skills"],
                    recruiter_name=recruiter_name,
                    recruiter_email=recruiter_email,
                    recruiter_status=recruiter_status,
                    source_portal=j["source_portal"],
                    source_url=j["source_url"]
                )
                db.add(job_obj)
                db.commit()
                db.refresh(job_obj)
                new_jobs.append(job_obj)
            else:
                new_jobs.append(existing)

            print(f"   [{idx}/{min(len(scraped_jobs), count)}] {j['company']} - {j['title']} | Match: {match_res['match_score']}% | HR: {recruiter_name} ({recruiter_email})")

        # Fetch all jobs in DB to prepare export
        all_db_jobs = db.query(models.Job).all()
        job_dicts = []
        for bj in all_db_jobs:
            job_dicts.append({
                "id": bj.id,
                "company": bj.company,
                "title": bj.title,
                "location": bj.location,
                "work_type": bj.work_type,
                "job_type": bj.job_type,
                "salary": bj.salary,
                "experience_level": bj.experience_level,
                "recruiter_name": bj.recruiter_name,
                "recruiter_email": bj.recruiter_email,
                "recruiter_status": bj.recruiter_status,
                "match_score": bj.match_score,
                "required_skills": bj.required_skills,
                "source_portal": bj.source_portal,
                "source_url": bj.source_url
            })

        print("\n[3/4] Generating Excel (.xlsx) & CSV Data Reports...")
        output_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        
        if export_excel:
            excel_bytes = generate_excel_bytes(job_dicts)
            excel_path = os.path.join(output_dir, "HR_Contacts_India.xlsx")
            with open(excel_path, "wb") as f:
                f.write(excel_bytes)
            print(f"  ✓ Native Excel spreadsheet generated: {excel_path}")

        if export_csv:
            csv_bytes = generate_csv_bytes(job_dicts)
            csv_path = os.path.join(output_dir, "HR_Contacts_India.csv")
            with open(csv_path, "wb") as f:
                f.write(csv_bytes)
            print(f"  ✓ CSV spreadsheet generated: {csv_path}")

        # Auto Email Dispatcher
        if auto_email:
            print("\n[4/4] Triggering Autonomous Cold Email Outreach to Verified HR Contacts...")
            dispatched = 0
            for job in new_jobs:
                if not job.recruiter_email:
                    continue

                email_content = generate_personalized_email(
                    candidate_name=profile.name if profile else "Candidate",
                    candidate_skills=cand_skills,
                    candidate_projects=profile.projects if profile else [],
                    candidate_experience=profile.experience if profile else [],
                    company_name=job.company,
                    job_title=job.title,
                    recruiter_name=job.recruiter_name,
                    desired_role=keyword
                )


                resume_path = profile.resume_file_path if (profile and hasattr(profile, 'resume_file_path') and profile.resume_file_path and os.path.exists(profile.resume_file_path)) else None

                res = send_application_email(
                    to_email=job.recruiter_email,
                    subject=email_content["subject"],
                    body=email_content["body"],
                    sender_email=sender_email,
                    resume_file_path=resume_path
                )


                app_record = models.Application(
                    user_email=sender_email,
                    job_id=job.id,
                    company=job.company,
                    role=job.title,
                    match_score=job.match_score,
                    recruiter_email=job.recruiter_email,
                    email_subject=email_content["subject"],
                    email_body=email_content["body"],
                    cover_letter=email_content["cover_letter"],
                    status=res["status"]
                )
                db.add(app_record)
                dispatched += 1
                print(f"  ✉️ Email dispatched to {job.company} HR ({job.recruiter_email}) - Status: {res['status']}")

            db.commit()
            print(f"  ✓ Sent personalized cold application emails to {dispatched} HR contacts.")
        else:
            print("\n[4/4] Auto-Email is OFF (run with --auto-email to dispatch emails automatically).")

        print("\n" + "=" * 70)
        print("🎉 SUCCESS! Scraping and report generation completed cleanly.")
        print("=" * 70)

    finally:
        db.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Autonomous Indian Job Scraper & HR Contact Extractor Script")
    parser.add_argument("--keyword", type=str, default="Software Engineer", help="Job position or skill keyword")
    parser.add_argument("--location", type=str, default="Bangalore", help="Target Indian city/location")
    parser.add_argument("--count", type=int, default=20, help="Max number of jobs to scrape")
    parser.add_argument("--no-excel", action="store_true", help="Disable Excel export")
    parser.add_argument("--no-csv", action="store_true", help="Disable CSV export")
    parser.add_argument("--auto-email", action="store_true", help="Automatically send cold emails to HR contacts")

    args = parser.parse_args()

    run_scraper_agent(
        keyword=args.keyword,
        location=args.location,
        count=args.count,
        export_excel=not args.no_excel,
        export_csv=not args.no_csv,
        auto_email=args.auto_email
    )
