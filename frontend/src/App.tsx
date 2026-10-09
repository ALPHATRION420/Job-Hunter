import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { DashboardView } from './components/DashboardView';
import { ResumeProfileView } from './components/ResumeProfileView';
import { JobPortalsView } from './components/JobPortalsView';
import { HRContactsView } from './components/HRContactsView';
import { ApplicationQueueView } from './components/ApplicationQueueView';
import { AnalyticsView } from './components/AnalyticsView';
import { SettingsView } from './components/SettingsView';
import { AdminView } from './components/AdminView';
import { MailView } from './components/MailView';
import { EmailStudioModal } from './components/EmailStudioModal';
import { AutoSendModal } from './components/AutoSendModal';
import { AuthModal } from './components/AuthModal';
import { LoginPage } from './components/LoginPage';
import { EmailReviewFlow } from './components/EmailReviewFlow';
import { AutoApplyStudioView } from './components/AutoApplyStudioView';


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
  verified_contacts: 16,
  unverified_contacts: 5,
  unable_to_verify_contacts: 3,
  emails_sent: 12,
  recent_logs: [
    { id: 1, log_type: 'SUCCESS', title: 'Outreach Dispatched - Razorpay', message: 'Personalized application email sent to careers@razorpay.com with resume attachment.', timestamp: new Date().toISOString() },
    { id: 2, log_type: 'INFO', title: 'Authentic HR Contact Scrape', message: 'Discovered and verified 30 HR contacts across Naukri, Instahyre, and LinkedIn India.', timestamp: new Date().toISOString() }
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
  const [activeTab, setActiveTab] = useState('job-portals');
  const [hrCompanyFilter, setHrCompanyFilter] = useState<string>('');

  const handleNavigateToHRContacts = (companyName?: string) => {
    if (companyName) {
      setHrCompanyFilter(companyName);
    }
    setActiveTab('hr-contacts');
  };

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
  const [loadedCampaignJobs, setLoadedCampaignJobs] = useState<Job[]>([]);
  const [selectedJobForStudio, setSelectedJobForStudio] = useState<Job | null>(null);
  const [isAutoSendModalOpen, setIsAutoSendModalOpen] = useState(false);
  const [selectedJobsForAutoSend, setSelectedJobsForAutoSend] = useState<Job[]>([]);
  const [isEmailReviewOpen, setIsEmailReviewOpen] = useState(false);
  const [jobsForReview, setJobsForReview] = useState<Job[]>([]);
  const [isApplyingId, setIsApplyingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('jobhunter_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('jobhunter_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };


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

  const handleTriggerScrape = async (
    query?: string, 
    location?: string, 
    roles?: string[], 
    locations?: string[]
  ) => {
    setIsLoading(true);
    const targetRoles = roles && roles.length > 0 ? roles : (profile.preferred_roles || []);
    const targetLocations = locations && locations.length > 0 ? locations : (profile.preferred_locations || []);
    const res = await api.triggerScrapeLocation(query, location, targetRoles, targetLocations, user?.email);
    await loadAllData();
    showToast(res ? res.message : 'Scraped jobs & enriched HR recruiter contacts across target roles & locations!');
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

  const handleLoadAutoApplyChamber = (specificJobIds?: number[]) => {
    const appliedJobIds = new Set(applications.map(a => a.job_id));
    let candidates: Job[] = [];

    if (specificJobIds && specificJobIds.length > 0) {
      candidates = jobs.filter(j => specificJobIds.includes(j.id) && !appliedJobIds.has(j.id));
    } else {
      candidates = jobs.filter(j =>
        !appliedJobIds.has(j.id) &&
        j.match_score >= 70 &&
        j.recruiter_email &&
        j.recruiter_email.includes('@')
      );
    }

    if (candidates.length === 0) {
      candidates = jobs.filter(j => !appliedJobIds.has(j.id) && j.recruiter_email && j.recruiter_email.includes('@'));
    }

    setLoadedCampaignJobs(candidates);
    setSelectedJobsForAutoSend(candidates);
    setActiveTab('auto-apply-studio');
    showToast(`Loaded ${candidates.length} fresh unapplied HR contacts into Auto-Apply Chamber!`);
  };

  const handleRemoveFromChamber = (jobId: number) => {
    setLoadedCampaignJobs(prev => prev.filter(j => j.id !== jobId));
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

  const handleSendCustomApplication = async (jobId: number, subject: string, body: string) => {
    setIsLoading(true);
    const res = await api.sendCustomApplication(jobId, subject, body, user?.email || profile.email);
    await loadAllData();
    setIsLoading(false);
    if (res && res.status === 'Applied') {
      showToast(res.message);
      return true;
    }
    return false;
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
    <div className="min-h-screen flex font-sans" style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className="fixed bottom-6 right-6 z-[100] animate-in slide-in-from-bottom-2 duration-150"
          style={{ minWidth: 280, maxWidth: 420 }}
        >
          <div className="glass-panel rounded-xl p-3.5 flex items-center justify-between gap-3 shadow-lg">
            <span className="text-xs font-medium leading-relaxed" style={{ color: 'var(--text-primary)' }}>
              {toastMessage}
            </span>
            <button
              onClick={() => setToastMessage(null)}
              className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              aria-label="Close notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Left Sidebar Navigation (Fixed on desktop, drawer on mobile) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        autoApply={autoApply}
        setAutoApply={(val) => {
          setAutoApply(val);
          handleSaveSettings({ auto_apply_enabled: val });
          if (val) {
            handleLoadAutoApplyChamber();
          }
        }}
        user={user}
        onLogout={handleLogout}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-[padding-left] duration-200 ease-out ${
          isSidebarCollapsed ? 'md:pl-[72px]' : 'md:pl-[260px]'
        }`}
      >
        {/* Slim Top Bar */}
        <TopBar
          activeTab={activeTab}
          onOpenMobile={() => setMobileMenuOpen(true)}
          onTriggerScrape={() => handleTriggerScrape()}
          onExportExcel={handleExportExcel}
          isLoading={isLoading}
        />

        {/* Main Content Area */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 min-w-0" key={activeTab}>
        {activeTab === 'dashboard' && (
          <DashboardView
            stats={stats}
            applications={applications}
            jobs={jobs}
            onTriggerScrape={() => handleTriggerScrape()}
            onNavigate={setActiveTab}
            onBulkAutoSend={handleLoadAutoApplyChamber}
            isLoading={isLoading}
          />
        )}

        {activeTab === 'auto-apply-studio' && (
          <AutoApplyStudioView
            loadedJobs={loadedCampaignJobs}
            profile={profile}
            userEmail={user?.email || profile.email}
            onRemoveJob={handleRemoveFromChamber}
            onReloadChamber={() => handleLoadAutoApplyChamber()}
            onConfirmAutoSend={handleConfirmAutoSend}
            onNavigate={setActiveTab}
            isLoading={isLoading}
          />
        )}

        {activeTab === 'resume' && (
          <ResumeProfileView
            profile={profile}
            onUploadResume={handleUploadResume}
            onUpdateProfile={handleUpdateProfile}
            onTriggerScrape={handleTriggerScrape}
            isUploading={isLoading}
          />
        )}

        {(activeTab === 'job-portals' || activeTab === 'jobs') && (
          <JobPortalsView
            jobs={jobs}
            profile={profile}
            onGenerateAndApply={handleGenerateAndApply}
            onApplySingle={handleApplySingle}
            onTriggerScrape={handleTriggerScrape}
            onBulkAutoSend={handleLoadAutoApplyChamber}
            onNavigateToHRContacts={handleNavigateToHRContacts}
            isApplyingId={isApplyingId}
            isLoading={isLoading}
          />
        )}

        {activeTab === 'hr-contacts' && (
          <HRContactsView
            jobs={jobs}
            profile={profile}
            initialCompanySearch={hrCompanyFilter}
            onClearCompanySearch={() => setHrCompanyFilter('')}
            onGenerateAndApply={handleGenerateAndApply}
            onApplySingle={handleApplySingle}
            onExportExcel={handleExportExcel}
            onExportCSV={handleExportCSV}
            onBulkAutoSend={handleLoadAutoApplyChamber}
            onReviewEmails={handleOpenReviewFlow}
            onTriggerScrape={handleTriggerScrape}
            onNavigateToJobs={() => setActiveTab('job-portals')}
            isApplyingId={isApplyingId}
            isLoading={isLoading}
          />
        )}

        {activeTab === 'mail' && (
          <MailView
            jobs={jobs}
            profile={profile}
            userEmail={user?.email || profile.email}
            onSendCustomApplication={handleSendCustomApplication}
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
      </div>

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
