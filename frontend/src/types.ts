export interface Education {
  degree: string;
  institution: string;
  year: string;
  cgpa: string;
}

export interface Project {
  title: string;
  description: string;
  tech_stack: string[];
}

export interface Experience {
  role: string;
  company: string;
  duration: string;
  description: string;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  portfolio: string;
  skills: string[];
  programming_languages: string[];
  frameworks: string[];
  tools: string[];
  cgpa: string;
  education: Education[];
  projects: Project[];
  certifications: string[];
  experience: Experience[];
  preferred_roles: string[];
  preferred_locations: string[];
  min_salary: number;
  min_salary_period?: 'month' | 'year';
  ats_score: number;
  resume_filename?: string;
  resume_text?: string;
}


export interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  work_type: string;
  job_type: string;
  salary: string;
  salary_min?: number | null;
  salary_max?: number | null;
  experience_level: string;
  company_size: string;
  match_score: number;
  description: string;
  required_skills: string[];
  missing_skills: string[];
  deadline: string;
  recruiter_name: string;
  recruiter_email: string;
  recruiter_phone?: string;
  recruiter_status: 'Verified' | 'Unverified' | 'Unable to Verify' | string;
  is_verified?: boolean;
  verification_details?: string;
  source_portal: string;
  source_url: string;
  created_at?: string;
}

export interface Application {
  id: number;
  job_id: number;
  company: string;
  role: string;
  match_score: number;
  recruiter_email: string;
  recruiter_phone?: string;
  email_subject: string;
  email_body: string;
  cover_letter: string;
  status: 'Pending' | 'Applied' | 'Viewed' | 'Shortlisted' | 'Interview' | 'Rejected' | 'Offer';
  applied_at: string;
  updated_at: string;
}

export interface SystemLog {
  id: number;
  log_type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  title: string;
  message: string;
  timestamp: string;
}

export interface AppSettings {
  auto_apply_enabled: boolean;
  max_apps_per_day: number;
  match_threshold: number;
  preferred_roles: string[];
  preferred_locations: string[];
  remote_only: boolean;
  internship_only: boolean;
  min_salary: number;
  min_salary_period?: 'month' | 'year';
  smtp_host: string;
  smtp_port: number;
  sender_email: string;
  sender_password?: string;
  openai_api_key?: string;
  allow_profile_scraping?: boolean;
}

export interface DashboardStats {
  jobs_found: number;
  verified_contacts: number;
  unverified_contacts: number;
  unable_to_verify_contacts: number;
  emails_sent: number;
  recent_logs: SystemLog[];
}

export interface AdminMetrics {
  total_users: number;
  jobs_crawled: number;
  applications_sent: number;
  emails_delivered: number;
  delivery_success_rate: number;
  failed_applications: number;
  system_status: string;
}
