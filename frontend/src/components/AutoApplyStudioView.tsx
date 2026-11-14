import React, { useState } from 'react';
import {
  Zap,
  Crosshair,
  Trash2,
  Send,
  CheckCircle2,
  RefreshCw,
  Building2,
  FileText,
  Paperclip,
  ShieldCheck,
  X,
  ChevronRight,
  Mail,
  ExternalLink,
} from 'lucide-react';
import type { Job, UserProfile } from '../types';
import { getGmailComposeUrl, isEmailVerified } from '../utils/gmail';

interface AutoApplyStudioViewProps {
  loadedJobs: Job[];
  profile: UserProfile;
  userEmail: string;
  onRemoveJob: (jobId: number) => void;
  onReloadChamber: () => void;
  onConfirmAutoSend: (jobIds: number[]) => Promise<void>;
  onNavigate: (tab: string) => void;
  isLoading: boolean;
}

export const AutoApplyStudioView: React.FC<AutoApplyStudioViewProps> = ({
  loadedJobs,
  profile,
  userEmail,
  onRemoveJob,
  onReloadChamber,
  onConfirmAutoSend,
  onNavigate,
  isLoading,
}) => {
  const [selectedPreviewIndex, setSelectedPreviewIndex] = useState(0);
  const [isFiring, setIsFiring] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [sentCount, setSentCount] = useState(0);
  const [deletedToast, setDeletedToast] = useState<string | null>(null);

  const activeJob = loadedJobs[selectedPreviewIndex] || loadedJobs[0];

  const handleRemoveContact = (e: React.MouseEvent, job: Job) => {
    e.stopPropagation();
    onRemoveJob(job.id);
    setDeletedToast(`Ejected ${job.company} (${job.recruiter_email || 'HR'}) from chamber!`);
    setTimeout(() => setDeletedToast(null), 3500);
    if (selectedPreviewIndex >= loadedJobs.length - 1) {
      setSelectedPreviewIndex(Math.max(0, loadedJobs.length - 2));
    }
  };

  const handleShoot = async () => {
    if (loadedJobs.length === 0) return;
    setIsFiring(true);
    try {
      const ids = loadedJobs.map((j) => j.id);
      await onConfirmAutoSend(ids);
      setSentCount(ids.length);
      setIsFinished(true);
    } catch (err) {
      console.error('Shoot execution failed:', err);
    } finally {
      setIsFiring(false);
    }
  };

  // Generate dynamic email body preview for selected job
  const getEmailPreview = (job: Job) => {
    if (!job) return { subject: '', body: '' };
    const candidateName = profile.name || 'Candidate';
    const topSkills = (profile.skills || ['Python', 'React', 'FastAPI']).slice(0, 4).join(', ');
    const company = job.company || 'your team';
    const role = job.title || 'the open position';
    const recruiter = job.recruiter_name || 'Hiring Team';

    const subject = `Application for ${role} — ${candidateName}`;
    const body = `Dear ${recruiter},

I am writing to express my strong interest in the ${role} position at ${company}.

With hands-on expertise in ${topSkills}, I have designed and delivered performant applications and distributed data workflows. Having reviewed ${company}'s current technology stack and job requirements, I am confident that my technical skills match your team's objectives.

I have attached my resume for your review. I would welcome the opportunity to discuss how my background aligns with your hiring goals.

Best regards,
${candidateName}
${profile.email || userEmail} | ${profile.phone || ''}
${profile.linkedin || ''}`;

    return { subject, body };
  };

  const previewContent = activeJob ? getEmailPreview(activeJob) : { subject: '', body: '' };

  return (
    <div className="space-y-6 page-enter pb-24 relative">
      {/* ── Top Chamber Header Banner ── */}
      <div
        className="relative overflow-hidden p-6 rounded-2xl glass-panel"
        style={{
          background: 'linear-gradient(135deg, rgba(16,185,129,0.12) 0%, var(--bg-surface) 60%)',
          border: '1px solid rgba(16,185,129,0.3)',
          boxShadow: '0 20px 50px -10px rgba(16,185,129,0.15)',
        }}
      >
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-xl flex items-center justify-center shadow-lg"
                style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
              >
                <Crosshair className="w-4 h-4 text-white animate-spin-slow" />
              </div>
              <span className="text-[11px] font-black tracking-widest uppercase text-emerald-600 dark:text-emerald-400">
                Auto-Apply Chamber Loaded
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                Deduplicated • Fresh HRs Only
              </span>
            </div>
            <h1
              className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white"
              style={{ fontFamily: 'Plus Jakarta Sans, Inter, sans-serif', letterSpacing: '-0.03em' }}
            >
              Auto-Apply Campaign Studio
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              Review target HR recruiter contacts loaded into the chamber, inspect personalized cold email previews, remove unwanted recipients, and hit <strong className="text-emerald-600 dark:text-emerald-400">SHOOT 🚀</strong> to fire outreach.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={onReloadChamber}
              disabled={isLoading || isFiring}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 transition-all duration-200 cursor-pointer"
              style={{
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-default)',
              }}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              Re-load Chamber
            </button>

            <div
              className="px-4 py-2.5 rounded-xl text-center"
              style={{
                background: 'rgba(16,185,129,0.12)',
                border: '1px solid rgba(16,185,129,0.3)',
              }}
            >
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 block">Loaded in Chamber</span>
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">{loadedJobs.length} HR Contacts</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Studio Grid (HR Queue + Transparent Preview Pane) ── */}
      {loadedJobs.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* ── Left Column: Loaded HR Queue (7 Cols) ── */}
          <div className="lg:col-span-6 space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                Target Recipients ({loadedJobs.length})
              </h3>
              <span className="text-[11px] text-slate-500">Click entry to preview email</span>
            </div>

            <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1 custom-scrollbar">
              {loadedJobs.map((job, idx) => {
                const isSelected = selectedPreviewIndex === idx;
                return (
                  <div
                    key={job.id}
                    onClick={() => setSelectedPreviewIndex(idx)}
                    className="p-3.5 rounded-2xl transition-all duration-200 cursor-pointer relative group flex items-center justify-between gap-3"
                    style={{
                      background: isSelected
                        ? 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, var(--bg-subtle) 100%)'
                        : 'var(--bg-subtle)',
                      border: isSelected
                        ? '1px solid rgba(16,185,129,0.5)'
                        : '1px solid var(--border-subtle)',
                      boxShadow: isSelected ? '0 8px 24px -4px rgba(16,185,129,0.2)' : 'none',
                    }}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* Match Score Badge */}
                      <div
                        className="w-10 h-10 rounded-xl flex flex-col items-center justify-center shrink-0 font-black text-xs"
                        style={{
                          background: job.match_score >= 80 ? 'rgba(16,185,129,0.15)' : 'rgba(56,189,248,0.15)',
                          color: job.match_score >= 80 ? '#059669' : '#0284c7',
                          border: job.match_score >= 80 ? '1px solid rgba(16,185,129,0.4)' : '1px solid rgba(56,189,248,0.4)',
                        }}
                      >
                        <span>{Math.round(job.match_score)}%</span>
                        <span className="text-[8px] font-semibold text-slate-500 dark:text-slate-400 leading-none">MATCH</span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{job.company}</h4>
                          {job.recruiter_status === 'Verified' && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 shrink-0">
                              Verified
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 truncate">{job.title}</p>
                        {isEmailVerified(job) && job.recruiter_email ? (
                          <a
                            href={getGmailComposeUrl(job.recruiter_email, `Job Application: ${job.title} at ${job.company}`)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-[10px] text-sky-600 dark:text-sky-400 hover:underline font-mono truncate mt-0.5 inline-flex items-center gap-1"
                            title={`Open Gmail compose to ${job.recruiter_email} (Hunter.io Verified)`}
                          >
                            <Mail className="w-2.5 h-2.5 shrink-0" />
                            <span className="truncate">{job.recruiter_email}</span>
                          </a>
                        ) : job.source_url ? (
                          <a
                            href={job.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-[10px] text-sky-600 dark:text-sky-400 hover:underline font-mono truncate mt-0.5 inline-flex items-center gap-1"
                            title={`Direct ${job.source_portal || 'Adzuna'} portal listing`}
                          >
                            <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                            <span className="truncate">{job.source_portal || 'Adzuna'} Portal</span>
                          </a>
                        ) : (
                          <p className="text-[10px] text-slate-500 italic truncate mt-0.5">
                            ✉️ Direct Apply
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions: Remove Button */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={(e) => handleRemoveContact(e, job)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all cursor-pointer"
                        title="Remove from campaign"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <ChevronRight
                        className={`w-4 h-4 transition-transform ${isSelected ? 'text-emerald-500 translate-x-0.5' : 'text-slate-400 dark:text-slate-600'}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Right Column: Transparent Cold Email Preview Pane (6 Cols) ── */}
          <div className="lg:col-span-6 space-y-3 sticky top-20">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-sky-500 dark:text-sky-400" />
                Transparent Email Preview
              </h3>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> AI Tailored Cold Outreach
              </span>
            </div>

            {activeJob ? (
              <div
                className="rounded-2xl p-5 space-y-4 relative overflow-hidden backdrop-blur-xl glass-panel"
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  boxShadow: '0 20px 50px -10px rgba(0,0,0,0.1), inset 0 0 30px rgba(56,189,248,0.03)',
                }}
              >
                {/* Meta Header */}
                <div className="space-y-2 pb-3.5 border-b border-slate-200 dark:border-slate-800/80 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-semibold">To Recruiter:</span>
                    {isEmailVerified(activeJob) && activeJob.recruiter_email ? (
                      <a
                        href={getGmailComposeUrl(activeJob.recruiter_email, `Job Application: ${activeJob.title} at ${activeJob.company}`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-emerald-600 dark:text-emerald-400 hover:underline font-medium truncate max-w-[260px] inline-flex items-center gap-1"
                        title={`Open Gmail compose to ${activeJob.recruiter_email} (Hunter.io Verified)`}
                      >
                        <Mail className="w-3 h-3 text-emerald-500 shrink-0" />
                        <span className="truncate">{activeJob.recruiter_email}</span>
                      </a>
                    ) : activeJob.source_url ? (
                      <a
                        href={activeJob.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-sky-600 dark:text-sky-400 hover:underline font-medium truncate max-w-[260px] inline-flex items-center gap-1"
                        title={`Open official listing on ${activeJob.source_portal || 'Adzuna'}`}
                      >
                        <ExternalLink className="w-3 h-3 text-sky-500 shrink-0" />
                        <span>{activeJob.source_portal || 'Adzuna'} Portal Link</span>
                      </a>
                    ) : (
                      <span className="font-mono text-slate-500 italic text-xs">Direct Portal Apply</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-semibold">Sender Email:</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                      {userEmail || profile.email}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-semibold">Subject Line:</span>
                    <span className="font-bold text-slate-900 dark:text-slate-200 truncate max-w-[260px]">
                      {previewContent.subject}
                    </span>
                  </div>
                </div>

                {/* Body Text */}
                <div
                  className="rounded-xl p-4 text-xs leading-relaxed font-sans whitespace-pre-line max-h-[300px] overflow-y-auto custom-scrollbar"
                  style={{
                    backgroundColor: 'var(--bg-subtle)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  {previewContent.body}
                </div>

                {/* Candidate Skill Injection Pills */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Injected Candidate Skills:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {(profile.skills || ['Python', 'React']).slice(0, 6).map((skill, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md text-[10px] font-semibold text-indigo-700 dark:text-indigo-300"
                        style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)' }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Attached Resume Badge */}
                <div
                  className="p-2.5 rounded-xl flex items-center justify-between text-xs"
                  style={{
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Paperclip className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                    <span className="text-slate-700 dark:text-slate-300 font-medium">Attached Resume Document:</span>
                  </div>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold text-[11px] truncate max-w-[180px]">
                    {profile.resume_filename || 'Dhruv_Saxena_Resume.pdf'}
                  </span>
                </div>

                {/* Direct to Portal Link (e.g. Adzuna India) */}
                {activeJob.source_url && (
                  <div className="pt-1">
                    <a
                      href={activeJob.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-2 text-sky-700 dark:text-sky-300 hover:opacity-90 transition-opacity"
                      style={{ background: 'rgba(56, 189, 248, 0.12)', border: '1px solid rgba(56, 189, 248, 0.3)' }}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Direct to {activeJob.source_portal || 'Adzuna'} Job Portal ➔</span>
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div
                className="p-8 text-center text-slate-500 glass-panel rounded-2xl"
                style={{ border: '1px solid var(--border-subtle)' }}
              >
                No HR selected for preview
              </div>
            )}
          </div>

        </div>
      ) : (
        /* Empty Chamber State */
        <div
          className="glass-panel rounded-3xl p-12 text-center space-y-4 max-w-lg mx-auto"
          style={{ border: '1px solid var(--border-subtle)' }}
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto text-slate-400"
            style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)' }}
          >
            <Zap className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Chamber Empty — All Eligible HRs Contacted!</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              All high-match HR contacts have already been sent outreach emails. Scrape new job postings to load fresh target HR emails into the chamber.
            </p>
          </div>
          <button
            onClick={() => onNavigate('jobs')}
            className="btn-primary text-xs px-6 py-2.5"
          >
            Find & Scrape New Jobs
          </button>
        </div>
      )}

      {/* ── Small Ejected / Deleted Pop-up Toast (Bottom Centered) ── */}
      {deletedToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 animate-slide-up pointer-events-auto">
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-xl border glass-panel"
            style={{
              background: 'var(--bg-surface)',
              borderColor: 'rgba(239, 68, 68, 0.4)',
              boxShadow: '0 10px 30px -5px rgba(239, 68, 68, 0.2)',
            }}
          >
            <div className="w-7 h-7 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 shrink-0">
              <Trash2 className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{deletedToast}</span>
            <button
              onClick={() => setDeletedToast(null)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ── 🚀 STICKY BOTTOM-RIGHT "SHOOT" ACTION BAR ── */}
      {loadedJobs.length > 0 && !isFinished && (
        <div className="fixed bottom-6 right-6 lg:right-12 z-40 animate-slide-up">
          <div
            className="flex items-center gap-4 p-3 pr-4 rounded-2xl backdrop-blur-2xl shadow-2xl glass-panel"
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid rgba(16,185,129,0.5)',
              boxShadow: '0 20px 50px -10px rgba(16,185,129,0.3)',
            }}
          >
            <div className="hidden sm:flex flex-col px-2">
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 leading-none">Ready to Fire</span>
              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {loadedJobs.length} Unapplied Cold Emails
              </span>
            </div>

            <button
              onClick={handleShoot}
              disabled={isFiring || isLoading}
              className="flex items-center gap-3 font-black text-sm text-white px-7 py-3.5 rounded-xl shadow-2xl transition-all duration-300 active:scale-95 cursor-pointer disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                boxShadow: '0 8px 30px -4px rgba(16,185,129,0.5)',
                letterSpacing: '0.05em',
              }}
            >
              {isFiring ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin text-white" />
                  <span>FIRING CAMPAIGN...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 text-amber-300 animate-pulse" />
                  <span>SHOOT 🚀 ({loadedJobs.length})</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── Finished Confirmation Overlay ── */}
      {isFinished && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
          <div
            className="glass-panel p-8 rounded-3xl max-w-md w-full text-center space-y-5 border border-emerald-500/40 shadow-2xl"
            style={{ background: 'var(--bg-surface)' }}
          >
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-500">
              <CheckCircle2 className="w-9 h-9 animate-bounce" />
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">Campaign Dispatched Successfully!</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                Shot and delivered cold application emails to <span className="text-emerald-600 dark:text-emerald-400 font-bold">{sentCount}</span> HR recruiter contacts with your attached resume document.
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => {
                  setIsFinished(false);
                  onNavigate('applications');
                }}
                className="btn-primary text-xs py-3 font-bold"
              >
                View Sent Applications Queue
              </button>
              <button
                onClick={() => {
                  setIsFinished(false);
                  onReloadChamber();
                }}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white py-2 transition-colors"
              >
                Done & Return to Studio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
