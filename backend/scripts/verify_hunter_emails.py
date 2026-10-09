import os
import sys
import time
from dotenv import load_dotenv

backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

load_dotenv(os.path.join(backend_dir, ".env"), override=True)

from mongo_db import mongo_handler
from services.hr_finder import verify_email_with_hunter

def verify_and_sync_all_jobs():
    print(f"Connecting to MongoDB Atlas...")
    if not mongo_handler.is_connected():
        print("Failed to connect to MongoDB")
        return
        
    jobs = mongo_handler.get_all_jobs()
    print(f"Loaded {len(jobs)} total jobs.")
    
    unique_emails = list(set([j.get("recruiter_email", "").strip().lower() for j in jobs if j.get("recruiter_email")]))
    print(f"Found {len(unique_emails)} unique recruiter emails to verify.")
    
    verification_map = {}
    for idx, email in enumerate(unique_emails, 1):
        res = verify_email_with_hunter(email)
        verification_map[email] = res
        print(f"[{idx}/{len(unique_emails)}] {email} -> {'VERIFIED' if res.get('is_verified') else 'UNVERIFIED'} (status: {res.get('status')}, score: {res.get('score')})")
        sys.stdout.flush()
        time.sleep(0.2)
        
    verified_emails_set = {e for e, r in verification_map.items() if r.get("is_verified")}
    print(f"\nHunter.io Verification Summary: {len(verified_emails_set)} / {len(unique_emails)} emails verified.")
    
    # Update jobs in database
    updated_jobs = []
    for j in jobs:
        email = (j.get("recruiter_email") or "").strip().lower()
        if email:
            is_ver = email in verified_emails_set
            ver_info = verification_map.get(email, {})
            j["is_verified"] = is_ver
            j["recruiter_status"] = "Verified" if is_ver else "Unable to Verify"
            j["verification_details"] = ver_info.get("details", "Hunter.io verified")
            j["hunter_score"] = ver_info.get("score", 0)
            j["hunter_status"] = ver_info.get("status", "")
            j["hunter_result"] = ver_info.get("result", "")
        else:
            j["is_verified"] = False
            j["recruiter_status"] = "Unlisted / Direct Apply"
            
        updated_jobs.append(j)
        
    print(f"Saving updated job records to MongoDB Atlas...")
    mongo_handler.save_jobs_batch(updated_jobs)
    print("Database sync complete!")

if __name__ == "__main__":
    verify_and_sync_all_jobs()
