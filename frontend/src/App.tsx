import { useState, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { ResumeProfileView } from './components/ResumeProfileView';
import { JobSearchView } from './components/JobSearchView';
import { ApplicationQueueView } from './components/ApplicationQueueView';
import { AnalyticsView } from './components/AnalyticsView';
import { SettingsView } from './components/SettingsView';
import { AdminView } from './components/AdminView';
import { EmailStudioModal } from './components/EmailStudioModal';
import { AutoSendModal } from './components/AutoSendModal';
import { AuthModal } from './components/AuthModal';
import { LoginPage } from './components/LoginPage';
import { EmailReviewFlow } from './components/EmailReviewFlow';


import type { UserProfile, Job, Application, DashboardStats, AppSettings, AdminMetrics } from './types';
import { api } from './services/api';

const defaultProfile: UserProfile = {
  name: 'Alex Morgan',
  email: 'alex.morgan@techdev.io',
  phone: '+1 (555) 345-6789',
  linkedin: 'https://linkedin.com/in/alexmorgan-dev',
  github: 'https://github.com/alexmorgan-dev',
  portfolio: 'https://alexmorgan.dev',
  skills: ['Python', 'React', 'Java', 'Flask', 'Machine Learning', 'FastAPI', 'TypeScript', 'PostgreSQL', 'Docker', 'Tailwind CSS'],
  programming_languages: ['Python', 'Java', 'TypeScript', 'SQL'],
  frameworks: ['React', 'Flask', 'FastAPI', 'Next.js', 'Tailwind CSS'],
  tools: ['Git', 'Docker', 'VS Code', 'Postman'],
  cgpa: '3.85 / 4.0',
  education: [{ degree: 'B.S. in Computer Science', institution: 'Stanford University', year: '2021 - 2025', cgpa: '3.85 / 4.0' }],
  projects: [
    { title: 'AI Autonomous Job Dispatcher', description: 'Full-stack application using React, FastAPI, PostgreSQL, and OpenAI API.', tech_stack: ['Python', 'FastAPI', 'React', 'OpenAI'] },
    { title: 'Distributed Multi-Source Data Crawler', description: 'Real-time crawler and analytics engine with Redis and SQLAlchemy.', tech_stack: ['Python', 'Redis', 'PostgreSQL', 'BeautifulSoup'] }
  ],
  certifications: ['AWS Certified Cloud Practitioner', 'Meta Front-End Developer Specialization'],
  experience: [{ role: 'Software Engineering Intern', company: 'CloudScale Systems', duration: 'Jun 2024 - Aug 2024', description: 'Built asynchronous microservices and optimized query speeds by 40%.' }],
  preferred_roles: ['Software Engineer Intern', 'Full Stack Developer', 'Backend Engineer'],
  preferred_locations: ['Remote', 'Bangalore, KA', 'Gurgaon, HR'],
  min_salary: 1200000,
  min_salary_period: 'year',
  ats_score: 88
};

const defaultStats: DashboardStats = {
  jobs_found: 24,
  jobs_applied: 12,
  pending_approval: 4,
  shortlisted: 6,
  interviews: 3,
  rejected: 1,
  offers: 1,
  response_rate_pct: 33.3,
  interview_rate_pct: 25.0,
  top_skills: [
    { skill: 'Python', demand_count: 18, match_rate: 96 },
    { skill: 'React', demand_count: 15, match_rate: 92 },
    { skill: 'FastAPI', demand_count: 12, match_rate: 88 }
  ],
  recent_logs: [
    { id: 1, log_type: 'SUCCESS', title: 'Application Dispatched - Razorpay', message: 'Personalized application email sent to careers@razorpay.com with resume attachment.', timestamp: new Date().toISOString() },
    { id: 2, log_type: 'INFO', title: 'Multi-Portal India Scrape', message: 'Crawled 30 jobs across Naukri, Instahyre, and LinkedIn India.', timestamp: new Date().toISOString() }
  ]
};

const defaultSettings: AppSettings = {
  auto_apply_enabled: false,
  max_apps_per_day: 15,
  match_threshold: 70,
  preferred_roles: ['Software Engineer Intern', 'Full Stack Developer'],
  preferred_locations: ['Remote', 'Bangalore'],
  remote_only: false,
  internship_only: false,
  min_salary: 1200000,
  min_salary_period: 'year',
  smtp_host: 'smtp.gmail.com',

  smtp_port: 587,
  sender_email: 'alex.morgan@techdev.io'
};

const defaultAdminMetrics: AdminMetrics = {
  total_users: 1,
  jobs_crawled: 30,
  applications_sent: 14,
  emails_delivered: 14,
  delivery_success_rate: 99.4,
  failed_applications: 0,
  system_status: 'Healthy / Operational'
};

export function App() {
  const [activeTab, setActiveTab] = useState('jobs');

  const [user, setUser] = useState<{ id?: number; name: string; email: string } | null>(() => {
    const isExplicitlyLoggedOut = localStorage.getItem('jobhunter_logged_out') === 'true';
    if (isExplicitlyLoggedOut) return null;

    const saved = localStorage.getItem('jobhunter_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return { name: 'Alex Morgan', email: 'alex.morgan@techdev.io' };
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState<DashboardStats>(defaultStats);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [adminMetrics, setAdminMetrics] = useState<AdminMetrics>(defaultAdminMetrics);
  
  const [autoApply, setAutoApply] = useState(false);
  const [selectedJobForStudio, setSelectedJobForStudio] = useState<Job | null>(null);
  const [isAutoSendModalOpen, setIsAutoSendModalOpen] = useState(false);
  const [selectedJobsForAutoSend, setSelectedJobsForAutoSend] = useState<Job[]>([]);
  const [isEmailReviewOpen, setIsEmailReviewOpen] = useState(false);
  const [jobsForReview, setJobsForReview] = useState<Job[]>([]);
  const [isApplyingId, setIsApplyingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);


  useEffect(() => {
    if (user) {
      localStorage.setItem('jobhunter_user', JSON.stringify(user));
      localStorage.removeItem('jobhunter_logged_out');
      loadAllData();
    } else {
      localStorage.removeItem('jobhunter_user');
    }
  }, [user?.email]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadAllData = async () => {
    if (localStorage.getItem('jobhunter_logged_out') === 'true' && !user) {
      return;
    }
    setIsLoading(true);
    try {
      const activeEmail = user?.email;
      if (activeEmail) {
        const me = await api.getMe(activeEmail);
        if (me && me.user) {
          setUser(me.user);
        }

        const p = await api.getProfile(activeEmail);
        if (p) setProfile(p);
      }

      const j = await api.getJobs();
      if (j && j.length > 0) setJobs(j);

      const a = await api.getApplications(activeEmail);
      if (a && a.length > 0) setApplications(a);

      const s = await api.getDashboardStats();
      if (s) setStats(s);

      const st = await api.getSettings();
      if (st) {
        setSettings(st);
        setAutoApply(st.auto_apply_enabled);
      }

      const m = await api.getAdminMetrics();
      if (m) setAdminMetrics(m);
    } catch (e) {
      console.warn('Backend load note:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    const res = await api.signup(name, email, password);
    if (res && res.user) {
      localStorage.removeItem('jobhunter_logged_out');
      localStorage.setItem('jobhunter_user', JSON.stringify(res.user));
      setUser(res.user);
      if (res.profile) setProfile(res.profile);
      showToast(`Account created for ${res.user.email}! Target application emails will be sent from this email.`);
      await loadAllData();
      setIsLoading(false);
      return true;
    }
    setIsLoading(false);
    return false;
  };

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    const res = await api.login(email, password);
    if (res && res.user) {
      localStorage.removeItem('jobhunter_logged_out');
      localStorage.setItem('jobhunter_user', JSON.stringify(res.user));
      setUser(res.user);
      if (res.profile) setProfile(res.profile);
      showToast(`Signed in as ${res.user.email}`);
      await loadAllData();
      setIsLoading(false);
      return true;
    }
    setIsLoading(false);
    return false;
  };

  const handleLogout = () => {
    localStorage.removeItem('jobhunter_user');
    localStorage.setItem('jobhunter_logged_out', 'true');
    setUser(null);
    showToast('Signed out successfully.');
  };

  const handleUploadResume = async (file: File) => {
    setIsLoading(true);
    const res = await api.uploadResume(file, user?.email);
    if (res && res.parsed_profile) {
      setProfile((prev) => ({
        ...prev,
        ...res.parsed_profile
      }));
      showToast(`Resume "${file.name}" uploaded! ATS Score computed: ${res.parsed_profile.ats_score}%`);
    } else {
      showToast(`Uploaded ${file.name}. Profile updated.`);
    }
    setIsLoading(false);
  };

  const handleUpdateProfile = async (updated: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...updated }));
    await api.updateProfile({ ...updated, email: user?.email || profile.email });
    showToast('Candidate profile updated successfully.');
  };

  const handleTriggerScrape = async (query?: string, location?: string) => {
    setIsLoading(true);
    const res = await api.triggerScrapeLocation(query, location);
    await loadAllData();
    showToast(res ? res.message : 'Scraped Indian job portals and updated HR contacts!');
    setIsLoading(false);
  };

  const handleExportExcel = () => {
    api.exportJobsExcel();
    showToast('Downloading HR Contacts & Jobs Excel file (.xlsx)...');
  };

  const handleExportCSV = () => {
    api.exportJobsCSV();
    showToast('Downloading HR Contacts CSV file...');
  };

  const handleOpenBulkAutoSendModal = (selectedIds: number[]) => {
    if (selectedIds.length > 0) {
      const selected = jobs.filter(j => selectedIds.includes(j.id));
      setSelectedJobsForAutoSend(selected);
    } else {
      setSelectedJobsForAutoSend(jobs);
    }
    setIsAutoSendModalOpen(true);
  };

  const handleOpenReviewFlow = (selectedIds: number[]) => {
    if (selectedIds.length > 0) {
      const selected = jobs.filter(j => selectedIds.includes(j.id));
      setJobsForReview(selected);
    } else {
      setJobsForReview(jobs);
    }
    setIsEmailReviewOpen(true);
  };


  const handleConfirmAutoSend = async (jobIds: number[]) => {
    const res = await api.bulkAutoSendEmails(user?.email, jobIds);
    await loadAllData();
    if (res) {
      showToast(`Auto-sent cold application emails to ${res.dispatched_count} HR contacts!`);
    }
  };

  const handleApplySingle = async (jobId: number) => {
    setIsApplyingId(jobId);
    const res = await api.applyToJob(jobId, user?.email);
    await loadAllData();
    setIsApplyingId(null);
    if (res) {
      showToast(res.message);
    }
  };

  const handleGenerateAndApply = (job: Job) => {
    setSelectedJobForStudio(job);
  };

  const handleSendApplication = async (jobId: number) => {
    setIsLoading(true);
    const res = await api.applyToJob(jobId, user?.email);
    setSelectedJobForStudio(null);
    await loadAllData();
    showToast(res ? res.message : `Application sent via registered user email ${user?.email || profile.email}!`);
    setIsLoading(false);
  };

  const handleUpdateAppStatus = async (appId: number, status: string) => {
    await api.updateAppStatus(appId, status);
    setApplications((prev) =>
      prev.map((app) => (app.id === appId ? { ...app, status: status as any } : app))
    );
    showToast(`Application status updated to "${status}".`);
  };

  const handleSaveSettings = async (updated: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...updated }));
    if (updated.auto_apply_enabled !== undefined) {
      setAutoApply(updated.auto_apply_enabled);
    }
    await api.updateSettings(updated);
    showToast('Application control settings updated.');
  };

  // If user is not authenticated, render dedicated Login / Registration Page
  if (!user) {
    return (
      <LoginPage
        onLogin={handleLogin}
        onSignup={handleSignup}
        isLoading={isLoading}
      />
    );
  }

  return (
    <div className="min-h-screen bg-cyber-bg text-slate-100 flex flex-col font-sans">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[100] bg-slate-900/95 border border-slate-700/80 text-white font-medium text-xs px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-md flex items-center justify-between gap-3 max-w-md animate-fadeIn">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
            <span className="text-slate-200">{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}


      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        autoApply={autoApply}
        setAutoApply={(val) => {
          setAutoApply(val);
          handleSaveSettings({ auto_apply_enabled: val });
        }}
        pendingCount={stats.pending_approval || 0}
        user={user}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            stats={stats}
            applications={applications}
            jobs={jobs}
            onTriggerScrape={() => handleTriggerScrape()}
            onNavigate={setActiveTab}
            isLoading={isLoading}
          />
        )}

        {activeTab === 'resume' && (
          <ResumeProfileView
            profile={profile}
            onUploadResume={handleUploadResume}
            onUpdateProfile={handleUpdateProfile}
            isUploading={isLoading}
          />
        )}

        {activeTab === 'jobs' && (
          <JobSearchView
            jobs={jobs}
            profile={profile}
            onGenerateAndApply={handleGenerateAndApply}
            onTriggerScrape={handleTriggerScrape}
            onExportExcel={handleExportExcel}
            onExportCSV={handleExportCSV}
            onBulkAutoSend={handleOpenBulkAutoSendModal}
            onReviewEmails={handleOpenReviewFlow}
            onApplySingle={handleApplySingle}
            isApplyingId={isApplyingId}
            isLoading={isLoading}
          />
        )}

        {activeTab === 'applications' && (
          <ApplicationQueueView
            applications={applications}
            onUpdateStatus={handleUpdateAppStatus}
            onApproveAndSend={handleSendApplication}
            isLoading={isLoading}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView stats={stats} jobs={jobs} profile={profile} />
        )}


        {activeTab === 'settings' && (
          <SettingsView
            settings={settings}
            onSaveSettings={handleSaveSettings}
          />
        )}

        {activeTab === 'admin' && (
          <AdminView
            metrics={adminMetrics}
            onTriggerScrape={() => handleTriggerScrape()}
            isLoading={isLoading}
          />
        )}
      </main>

      {/* AI Email Studio Modal */}
      {selectedJobForStudio && (
        <EmailStudioModal
          job={selectedJobForStudio}
          profile={profile}
          onClose={() => setSelectedJobForStudio(null)}
          onSendApplication={handleSendApplication}
          isLoading={isLoading}
        />
      )}

      {/* Auto Send Cold Emails Modal */}
      <AutoSendModal
        isOpen={isAutoSendModalOpen}
        onClose={() => setIsAutoSendModalOpen(false)}
        selectedJobs={selectedJobsForAutoSend}
        onConfirmAutoSend={handleConfirmAutoSend}
        userEmail={user?.email || profile.email}
      />

      {/* Chronological Email Review & Edit Flow Modal */}
      <EmailReviewFlow
        isOpen={isEmailReviewOpen}
        onClose={() => setIsEmailReviewOpen(false)}
        jobsToReview={jobsForReview}
        profile={profile}
        userEmail={user?.email || profile.email}
        onComplete={(count) => {
          showToast(`Chronological review complete! Dispatched ${count} personalized emails.`);
          loadAllData();
        }}
      />

      {/* Sign In / Sign Up Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={handleLogin}
        onSignup={handleSignup}
        isLoading={isLoading}

      />
    </div>
  );
}

export default App;
