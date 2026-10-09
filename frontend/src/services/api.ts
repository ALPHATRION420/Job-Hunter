import type { UserProfile, Job, Application, DashboardStats, AppSettings, AdminMetrics } from '../types';
import { parseSalary, parseMatch } from '../utils/salaryParser';

export const normalizeJob = (job: any): Job => {
  const parsed = parseSalary(job.salary);
  const normalizedMatch = parseMatch(job.match_score);
  return {
    ...job,
    salary_min: job.salary_min !== undefined && job.salary_min !== null ? Number(job.salary_min) : parsed.salary_min,
    salary_max: job.salary_max !== undefined && job.salary_max !== null ? Number(job.salary_max) : parsed.salary_max,
    match_score: normalizedMatch ?? (Number(job.match_score) || 0),
  };
};

const rawApiUrl = import.meta.env.VITE_API_URL || '';
const API_BASE = rawApiUrl ? `${rawApiUrl.replace(/\/+$/, '')}/api` : '/api';

async function fetchJson(url: string, options?: RequestInit) {
  try {
    const res = await fetch(url, options);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`API call failed for ${url}, fallback to mock state:`, err);
    return null;
  }
}

export const api = {
  signup: async (name: string, email: string, password: string) => {
    return await fetchJson(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
  },

  login: async (email: string, password: string) => {
    return await fetchJson(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
  },

  getMe: async (email?: string) => {
    const url = email ? `${API_BASE}/auth/me?email=${encodeURIComponent(email)}` : `${API_BASE}/auth/me`;
    return await fetchJson(url);
  },

  getProfile: async (email?: string): Promise<UserProfile | null> => {
    const url = email ? `${API_BASE}/profile?email=${encodeURIComponent(email)}` : `${API_BASE}/profile`;
    return await fetchJson(url);
  },
  
  updateProfile: async (data: Partial<UserProfile>): Promise<UserProfile | null> => {
    return await fetchJson(`${API_BASE}/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  uploadResume: async (file: File, userEmail?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (userEmail) formData.append('user_email', userEmail);
    return await fetchJson(`${API_BASE}/resume/upload`, {
      method: 'POST',
      body: formData,
    });
  },

  getJobs: async (query = '', workType = '', jobType = '', minMatch = 0): Promise<Job[] | null> => {
    const params = new URLSearchParams({
      query,
      work_type: workType,
      job_type: jobType,
      min_match: minMatch.toString()
    });
    const res = await fetchJson(`${API_BASE}/jobs?${params.toString()}`);
    if (Array.isArray(res)) {
      return res.map(normalizeJob);
    }
    return res;
  },

  triggerScrape: async () => {
    return await fetchJson(`${API_BASE}/jobs/scrape`, { method: 'POST' });
  },

  triggerScrapeLocation: async (
    query = '', 
    location = '', 
    roles?: string[], 
    locations?: string[], 
    userEmail?: string,
    remoteOnly = false, 
    internshipOnly = false
  ) => {
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    if (location && location !== 'All Locations' && location !== 'All') params.append('location', location);
    if (userEmail) params.append('user_email', userEmail);
    if (remoteOnly) params.append('remote_only', 'true');
    if (internshipOnly) params.append('internship_only', 'true');
    if (roles && roles.length > 0) {
      roles.forEach(r => params.append('roles', r));
    }
    if (locations && locations.length > 0) {
      locations.forEach(l => params.append('locations', l));
    }
    return await fetchJson(`${API_BASE}/jobs/scrape?${params.toString()}`, { method: 'POST' });
  },

  exportJobsExcel: async () => {
    try {
      const res = await fetch(`${API_BASE}/jobs/export/excel`);
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'HR_Contacts_Jobs_India.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('[Excel Export] Failed:', err);
      alert('Excel download failed. Make sure the backend is running.');
    }
  },

  exportJobsCSV: async () => {
    try {
      const res = await fetch(`${API_BASE}/jobs/export/csv`);
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'HR_Contacts_Jobs_India.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('[CSV Export] Failed:', err);
      alert('CSV download failed. Make sure the backend is running.');
    }
  },

  bulkAutoSendEmails: async (userEmail?: string, jobIds?: number[], minMatch = 70) => {
    return await fetchJson(`${API_BASE}/applications/bulk-auto-send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_email: userEmail, job_ids: jobIds || [], min_match: minMatch }),
    });
  },

  generateApplication: async (jobId: number, userEmail?: string) => {
    const url = userEmail ? `${API_BASE}/applications/generate/${jobId}?user_email=${encodeURIComponent(userEmail)}` : `${API_BASE}/applications/generate/${jobId}`;
    return await fetchJson(url, { method: 'POST' });
  },


  applyToJob: async (jobId: number, userEmail?: string) => {
    const url = userEmail ? `${API_BASE}/applications/apply/${jobId}?user_email=${encodeURIComponent(userEmail)}` : `${API_BASE}/applications/apply/${jobId}`;
    return await fetchJson(url, { method: 'POST' });
  },

  getApplications: async (userEmail?: string): Promise<Application[] | null> => {
    const url = userEmail ? `${API_BASE}/applications?user_email=${encodeURIComponent(userEmail)}` : `${API_BASE}/applications`;
    return await fetchJson(url);
  },

  updateAppStatus: async (appId: number, status: string) => {
    return await fetchJson(`${API_BASE}/applications/${appId}/status?status=${status}`, {
      method: 'PATCH'
    });
  },

  getDashboardStats: async (): Promise<DashboardStats | null> => {
    return await fetchJson(`${API_BASE}/dashboard/stats`);
  },

  getAdminMetrics: async (): Promise<AdminMetrics | null> => {
    return await fetchJson(`${API_BASE}/admin/metrics`);
  },

  getSettings: async (): Promise<AppSettings | null> => {
    return await fetchJson(`${API_BASE}/settings`);
  },

  updateSettings: async (data: Partial<AppSettings>) => {
    return await fetchJson(`${API_BASE}/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  },

  scrapeLinkedInHR: async (company: string, jobTitle = 'HR Recruiter') => {
    const params = new URLSearchParams({ company, job_title: jobTitle });
    return await fetchJson(`${API_BASE}/linkedin/scrape-hr?${params.toString()}`, { method: 'POST' });
  },

  sendCustomApplication: async (jobId: number, subject: string, body: string, userEmail?: string) => {
    return await fetchJson(`${API_BASE}/applications/send-custom`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        job_id: jobId,
        subject,
        body,
        user_email: userEmail
      })
    });
  },

  verifyEmailWithHunter: async (email: string) => {
    return await fetchJson(`${API_BASE}/hunter/verify-email?email=${encodeURIComponent(email)}`);
  },

  verifyAllJobsWithHunter: async () => {
    return await fetchJson(`${API_BASE}/hunter/verify-jobs`, {
      method: 'POST',
    });
  }
};

