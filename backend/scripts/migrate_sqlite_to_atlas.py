import sys
import os
import sqlite3
import json
import logging
from typing import Dict, Any, List
from dotenv import load_dotenv

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
from mongo_db import mongo_handler

load_dotenv()
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

logger = logging.getLogger("migration")
logging.basicConfig(level=logging.INFO)

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "jobhunter.db")

def parse_json_field(val: Any) -> Any:
    if isinstance(val, str):
        try:
            return json.loads(val)
        except Exception:
            return val
    return val or []

def migrate_sqlite_to_mongodb():
    """
    Migrates all legacy data from local SQLite database (jobhunter.db)
    to MongoDB Atlas cloud collections.
    """
    if not os.path.exists(DB_PATH):
        logger.info(f"No SQLite database found at {DB_PATH}. Ready for fresh MongoDB Atlas usage.")
        return

    logger.info(f"Connecting to SQLite database at: {DB_PATH}")
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    if not mongo_handler.is_connected():
        logger.warning("MongoDB Atlas is not connected yet! Please verify MONGODB_URI in backend/.env")
        return

    stats = {"users": 0, "profiles": 0, "jobs": 0, "applications": 0, "settings": 0, "logs": 0}

    # 1. Migrate Users
    try:
        cursor.execute("SELECT * FROM user_accounts")
        rows = cursor.fetchall()
        for r in rows:
            user_doc = {
                "id": r["id"],
                "name": r["name"] or "",
                "email": (r["email"] or "").strip().lower(),
                "hashed_password": r["hashed_password"],
                "created_at": str(r["created_at"]) if r["created_at"] else ""
            }
            mongo_handler.db.users.update_one({"email": user_doc["email"]}, {"$set": user_doc}, upsert=True)
            stats["users"] += 1
    except Exception as e:
        logger.warning(f"Error migrating users: {e}")

    # 2. Migrate User Profiles
    try:
        cursor.execute("SELECT * FROM user_profiles")
        rows = cursor.fetchall()
        for r in rows:
            row_dict = dict(r)
            profile_doc = {
                "id": row_dict.get("id"),
                "name": row_dict.get("name", ""),
                "email": (row_dict.get("email") or "").strip().lower(),
                "phone": row_dict.get("phone", ""),
                "linkedin": row_dict.get("linkedin", ""),
                "github": row_dict.get("github", ""),
                "portfolio": row_dict.get("portfolio", ""),
                "skills": parse_json_field(row_dict.get("skills")),
                "programming_languages": parse_json_field(row_dict.get("programming_languages")),
                "frameworks": parse_json_field(row_dict.get("frameworks")),
                "tools": parse_json_field(row_dict.get("tools")),
                "education": parse_json_field(row_dict.get("education")),
                "projects": parse_json_field(row_dict.get("projects")),
                "certifications": parse_json_field(row_dict.get("certifications")),
                "experience": parse_json_field(row_dict.get("experience")),
                "preferred_roles": parse_json_field(row_dict.get("preferred_roles")),
                "preferred_locations": parse_json_field(row_dict.get("preferred_locations")),
                "min_salary": row_dict.get("min_salary", 1200000),
                "min_salary_period": row_dict.get("min_salary_period", "year"),
                "cgpa": row_dict.get("cgpa", ""),
                "ats_score": row_dict.get("ats_score", 85),
                "resume_filename": row_dict.get("resume_filename", ""),
                "resume_file_path": row_dict.get("resume_file_path", ""),
                "resume_text": row_dict.get("resume_text", ""),
                "updated_at": str(row_dict.get("updated_at", ""))
            }
            if profile_doc["email"]:
                mongo_handler.db.user_profiles.update_one({"email": profile_doc["email"]}, {"$set": profile_doc}, upsert=True)
                stats["profiles"] += 1
    except Exception as e:
        logger.warning(f"Error migrating user profiles: {e}")

    # 3. Migrate Jobs
    try:
        cursor.execute("SELECT * FROM jobs")
        rows = cursor.fetchall()
        for r in rows:
            row_dict = dict(r)
            job_doc = {
                "id": row_dict.get("id"),
                "title": row_dict.get("title", ""),
                "company": row_dict.get("company", ""),
                "location": row_dict.get("location", "Remote"),
                "work_type": row_dict.get("work_type", "Remote"),
                "job_type": row_dict.get("job_type", "Full-Time"),
                "salary": row_dict.get("salary", ""),
                "experience_level": row_dict.get("experience_level", ""),
                "company_size": row_dict.get("company_size", ""),
                "match_score": float(row_dict.get("match_score") or 0.0),
                "description": row_dict.get("description", ""),
                "required_skills": parse_json_field(row_dict.get("required_skills")),
                "missing_skills": parse_json_field(row_dict.get("missing_skills")),
                "deadline": row_dict.get("deadline", ""),
                "recruiter_name": row_dict.get("recruiter_name", ""),
                "recruiter_email": row_dict.get("recruiter_email", ""),
                "recruiter_status": row_dict.get("recruiter_status", "Verified"),
                "source_portal": row_dict.get("source_portal", "LinkedIn"),
                "source_url": row_dict.get("source_url", ""),
                "created_at": str(row_dict.get("created_at", ""))
            }
            mongo_handler.db.jobs.update_one({"id": job_doc["id"]}, {"$set": job_doc}, upsert=True)
            stats["jobs"] += 1
    except Exception as e:
        logger.warning(f"Error migrating jobs: {e}")

    # 4. Migrate Applications
    try:
        cursor.execute("SELECT * FROM applications")
        rows = cursor.fetchall()
        for r in rows:
            row_dict = dict(r)
            app_doc = {
                "id": row_dict.get("id"),
                "user_email": (row_dict.get("user_email") or "").strip().lower(),
                "job_id": row_dict.get("job_id"),
                "company": row_dict.get("company", ""),
                "role": row_dict.get("role", ""),
                "match_score": float(row_dict.get("match_score") or 0.0),
                "recruiter_email": row_dict.get("recruiter_email", ""),
                "email_subject": row_dict.get("email_subject", ""),
                "email_body": row_dict.get("email_body", ""),
                "cover_letter": row_dict.get("cover_letter", ""),
                "resume_version": row_dict.get("resume_version", "v1.0"),
                "status": row_dict.get("status", "Pending"),
                "applied_at": str(row_dict.get("applied_at", "")),
                "updated_at": str(row_dict.get("updated_at", ""))
            }
            mongo_handler.db.applications.update_one({"id": app_doc["id"]}, {"$set": app_doc}, upsert=True)
            stats["applications"] += 1
    except Exception as e:
        logger.warning(f"Error migrating applications: {e}")

    # 5. Migrate Settings
    try:
        cursor.execute("SELECT * FROM app_settings")
        r = cursor.fetchone()
        if r:
            row_dict = dict(r)
            settings_doc = {
                "auto_apply_enabled": bool(row_dict.get("auto_apply_enabled")),
                "max_apps_per_day": int(row_dict.get("max_apps_per_day") or 15),
                "match_threshold": float(row_dict.get("match_threshold") or 70.0),
                "preferred_roles": parse_json_field(row_dict.get("preferred_roles")),
                "preferred_locations": parse_json_field(row_dict.get("preferred_locations")),
                "remote_only": bool(row_dict.get("remote_only")),
                "internship_only": bool(row_dict.get("internship_only")),
                "min_salary": int(row_dict.get("min_salary") or 1200000),
                "min_salary_period": row_dict.get("min_salary_period", "year"),
                "smtp_host": row_dict.get("smtp_host", "smtp.gmail.com"),
                "smtp_port": int(row_dict.get("smtp_port") or 587),
                "sender_email": row_dict.get("sender_email", ""),
                "sender_password": row_dict.get("sender_password", ""),
                "openai_api_key": row_dict.get("openai_api_key", ""),
                "allow_profile_scraping": bool(row_dict.get("allow_profile_scraping", True))
            }
            mongo_handler.db.app_settings.update_one({}, {"$set": settings_doc}, upsert=True)
            stats["settings"] += 1
    except Exception as e:
        logger.warning(f"Error migrating settings: {e}")

    # 6. Migrate System Logs
    try:
        cursor.execute("SELECT * FROM system_logs")
        rows = cursor.fetchall()
        for r in rows:
            row_dict = dict(r)
            log_doc = {
                "id": row_dict.get("id"),
                "log_type": row_dict.get("log_type", "INFO"),
                "title": row_dict.get("title", ""),
                "message": row_dict.get("message", ""),
                "timestamp": str(row_dict.get("timestamp", ""))
            }
            mongo_handler.db.system_logs.update_one({"id": log_doc["id"]}, {"$set": log_doc}, upsert=True)
            stats["logs"] += 1
    except Exception as e:
        logger.warning(f"Error migrating system logs: {e}")

    conn.close()
    logger.info("==================================================")
    logger.info("✅ SQLite to MongoDB Atlas Migration Complete!")
    logger.info(f"   Users Migrated: {stats['users']}")
    logger.info(f"   Profiles Migrated: {stats['profiles']}")
    logger.info(f"   Jobs Migrated: {stats['jobs']}")
    logger.info(f"   Applications Migrated: {stats['applications']}")
    logger.info(f"   Settings Migrated: {stats['settings']}")
    logger.info(f"   Logs Migrated: {stats['logs']}")
    logger.info("==================================================")

if __name__ == "__main__":
    migrate_sqlite_to_mongodb()
