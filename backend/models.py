from sqlalchemy import Column, Integer, String, Float, Boolean, Text, DateTime, JSON
from datetime import datetime
from database import Base

class UserAccount(Base):
    __tablename__ = "user_accounts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, default="")
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=True)
    name = Column(String, default="")
    email = Column(String, default="")
    phone = Column(String, default="")
    linkedin = Column(String, default="")
    github = Column(String, default="")
    portfolio = Column(String, default="")
    
    # Skills stored as JSON lists
    skills = Column(JSON, default=list) # e.g. ["Python", "React", "Java", "Flask", "Machine Learning"]
    programming_languages = Column(JSON, default=list)
    frameworks = Column(JSON, default=list)
    tools = Column(JSON, default=list)
    
    education = Column(JSON, default=list) # [{ degree, institution, year, cgpa }]
    projects = Column(JSON, default=list)   # [{ title, description, tech_stack }]
    certifications = Column(JSON, default=list)
    experience = Column(JSON, default=list)
    
    preferred_roles = Column(JSON, default=list) # ["Software Engineer", "Full Stack Developer"]
    preferred_locations = Column(JSON, default=list)
    min_salary = Column(Integer, default=1200000)
    min_salary_period = Column(String, default="year")
    cgpa = Column(String, default="")

    ats_score = Column(Integer, default=85)
    
    resume_filename = Column(String, default="")
    resume_file_path = Column(String, default="")
    resume_text = Column(Text, default="")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    company = Column(String, index=True)
    location = Column(String, default="Remote")
    work_type = Column(String, default="Remote") # Remote, Hybrid, On-site
    job_type = Column(String, default="Full-Time") # Internship, Full-Time
    salary = Column(String, default="$80,000 - $110,000")
    experience_level = Column(String, default="Entry Level")
    company_size = Column(String, default="50-200")
    
    match_score = Column(Float, default=0.0) # 0 to 100
    description = Column(Text, default="")
    required_skills = Column(JSON, default=list)
    missing_skills = Column(JSON, default=list)
    deadline = Column(String, default="Open until filled")
    
    recruiter_name = Column(String, default="")
    recruiter_email = Column(String, default="") # Verified email or empty
    recruiter_status = Column(String, default="Verified") # Verified, Manual Review Needed
    
    source_portal = Column(String, default="LinkedIn")
    source_url = Column(String, default="")
    created_at = Column(DateTime, default=datetime.utcnow)

class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    user_email = Column(String, default="") # Candidate email sending the mail
    job_id = Column(Integer, index=True)
    company = Column(String)
    role = Column(String)
    match_score = Column(Float, default=0.0)
    recruiter_email = Column(String, default="")
    
    email_subject = Column(String, default="")
    email_body = Column(Text, default="")
    cover_letter = Column(Text, default="")
    resume_version = Column(String, default="v1.0")
    
    # Statuses: Pending, Applied, Viewed, Shortlisted, Interview, Rejected, Offer
    status = Column(String, default="Pending")
    applied_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    notes = Column(Text, default="")

class AppSettings(Base):
    __tablename__ = "app_settings"

    id = Column(Integer, primary_key=True, index=True)
    auto_apply_enabled = Column(Boolean, default=False)
    max_apps_per_day = Column(Integer, default=15)
    match_threshold = Column(Float, default=70.0)
    
    preferred_roles = Column(JSON, default=list)
    preferred_locations = Column(JSON, default=list)
    remote_only = Column(Boolean, default=False)
    internship_only = Column(Boolean, default=False)
    min_salary = Column(Integer, default=1200000)
    min_salary_period = Column(String, default="year")

    
    smtp_host = Column(String, default="smtp.gmail.com")
    smtp_port = Column(Integer, default=587)
    sender_email = Column(String, default="")
    sender_password = Column(String, default="")
    openai_api_key = Column(String, default="")
    allow_profile_scraping = Column(Boolean, default=True)

class SystemLog(Base):
    __tablename__ = "system_logs"

    id = Column(Integer, primary_key=True, index=True)
    log_type = Column(String, default="INFO") # INFO, SUCCESS, WARNING, ERROR
    title = Column(String, default="")
    message = Column(Text, default="")
    timestamp = Column(DateTime, default=datetime.utcnow)
