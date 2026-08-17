import React, { useState, useEffect } from 'react';
import { 
  X, 
  Send, 
  ChevronRight, 
  ChevronLeft, 
  Edit3, 
  Sparkles, 
  Mail, 
  Building2, 
  Briefcase,
  FileText,
  SkipForward
} from 'lucide-react';

import type { Job, UserProfile } from '../types';
import { api } from '../services/api';

interface EmailReviewFlowProps {
  isOpen: boolean;
  onClose: () => void;
  jobsToReview: Job[];
  profile: UserProfile;
  userEmail?: string;
  onComplete: (dispatchedCount: number) => void;
}

export const EmailReviewFlow: React.FC<EmailReviewFlowProps> = ({
  isOpen,
  onClose,
  jobsToReview,
  profile,
  userEmail,
  onComplete
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [dispatchedCount, setDispatchedCount] = useState(0);

  const currentJob = jobsToReview[currentIndex];

  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');

  useEffect(() => {
    if (currentJob && isOpen) {
      generateContentForCurrentJob();
    }
  }, [currentIndex, currentJob?.id, isOpen]);

  const generateContentForCurrentJob = async () => {
    if (!currentJob) return;
    setIsGenerating(true);
    try {
      const res = await api.generateApplication(currentJob.id, userEmail);
      if (res && res.email_subject && res.email_body) {
        setSubject(res.email_subject);
        setBody(res.email_body);
      } else {
        // Fallback default format
        setSubject(`Application for ${currentJob.title} role at ${currentJob.company} - ${profile.name}`);

        setBody(
          `Hi ${currentJob.recruiter_name || 'Hiring Manager'},\n\nI came across the ${currentJob.title} position at ${currentJob.company} and wanted to express my strong interest in joining your team.\n\nWith hands-on experience in ${profile.skills.slice(0, 5).join(', ')}, I have built scalable full-stack software applications and optimized database performance.\n\nI have attached my updated resume for your review. I would welcome the opportunity to discuss how my skill set aligns with ${currentJob.company}'s goals.\n\nBest regards,\n${profile.name}\n${profile.phone || ''}\n${userEmail || profile.email}`
        );
      }
    } catch (err) {
      console.warn('Error generating application content:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen || !currentJob) return null;

  const totalCount = jobsToReview.length;
  const isLast = currentIndex === totalCount - 1;

  const handleSendAndAdvance = async () => {
    setIsSending(true);
    try {
      await api.sendCustomApplication(currentJob.id, subject, body, userEmail);
      setDispatchedCount((prev) => prev + 1);

      if (isLast) {
        onComplete(dispatchedCount + 1);
        onClose();
      } else {
        setCurrentIndex((prev) => prev + 1);
      }
    } catch (err) {
      console.error('Failed sending email:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleSkipAndAdvance = () => {
    if (isLast) {
      onComplete(dispatchedCount);
      onClose();
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const insertVariable = (varName: string) => {
    setBody((prev) => prev + ` ${varName}`);
  };

  return (
    <div className="fixed inset-0 z-[110] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-3xl rounded-3xl border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-fadeIn">
        {/* Modal Header & Progress Bar */}
        <div className="p-6 border-b border-slate-800 bg-slate-900/90 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  Chronological Email Review & Edit Studio
                </h3>
                <p className="text-xs text-slate-400">
                  Review pre-generated cold emails, customize subject/body, and confirm outreach prior to dispatch.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mode Switcher & Progress Bar */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('edit')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  viewMode === 'edit' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Edit Mode
              </button>
              <button
                onClick={() => setViewMode('preview')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  viewMode === 'preview' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Live Preview
              </button>
            </div>

            <div className="text-xs text-slate-300 font-semibold">
              Email {currentIndex + 1} of {totalCount} | <span className="text-emerald-400">{dispatchedCount} Sent</span>
            </div>
          </div>

          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-sky-500 to-emerald-400 h-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / totalCount) * 100}%` }}
            />
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Target Job & HR Details Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center space-x-2.5">
              <Building2 className="w-4 h-4 text-sky-400 shrink-0" />
              <div className="truncate">
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Company</p>
                <p className="font-bold text-white truncate">{currentJob.company}</p>
              </div>
            </div>

            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center space-x-2.5">
              <Briefcase className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="truncate">
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Role</p>
                <p className="font-bold text-white truncate">{currentJob.title}</p>
              </div>
            </div>

            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center space-x-2.5">
              <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
              <div className="truncate">
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Recruiter Contact</p>
                <p className="font-bold text-sky-300 font-mono text-[11px] truncate">
                  {currentJob.recruiter_email || 'careers@company.com'}
                </p>
              </div>
            </div>
          </div>

          {viewMode === 'edit' ? (
            /* Edit Mode */
            <div className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold flex items-center justify-between mb-1">
                  <span>Email Subject Line</span>
                  <span className="text-[10px] text-slate-400 font-normal">Editable</span>
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  disabled={isGenerating}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white font-medium focus:outline-none focus:border-sky-400 text-xs"
                />
              </div>

              {/* Template Tags Quick Bar */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] text-slate-400 font-semibold mr-1">Insert Variable:</span>
                {['{candidate_name}', '{company}', '{job_title}', '{recruiter_name}', '{skills}'].map((v) => (
                  <button
                    key={v}
                    onClick={() => insertVariable(v)}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono border border-slate-700 transition"
                  >
                    {v}
                  </button>
                ))}
              </div>

              <div>
                <label className="text-slate-300 font-semibold flex items-center justify-between mb-1">
                  <span className="flex items-center gap-1.5">
                    <Edit3 className="w-3.5 h-3.5 text-sky-400" />
                    Personalized Email Body Content
                  </span>
                  <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                    <FileText className="w-3 h-3" /> {profile.resume_filename || 'Candidate_Resume.pdf'} Attached
                  </span>
                </label>
                <textarea
                  rows={9}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  disabled={isGenerating}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3.5 text-slate-200 font-sans leading-relaxed focus:outline-none focus:border-sky-400 text-xs whitespace-pre-line"
                />
              </div>
            </div>
          ) : (
            /* Live Rendered Email Preview Mode */
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 text-xs font-sans">
              <div className="border-b border-slate-800 pb-3 space-y-1.5">
                <p className="text-slate-400"><span className="font-bold text-slate-200">From:</span> {userEmail || profile.email}</p>
                <p className="text-slate-400"><span className="font-bold text-slate-200">To:</span> {currentJob.recruiter_email} ({currentJob.recruiter_name || 'Hiring Manager'})</p>
                <p className="text-slate-400"><span className="font-bold text-slate-200">Subject:</span> <span className="text-white font-semibold">{subject}</span></p>
                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 font-medium text-[11px] border border-emerald-500/20">
                  <FileText className="w-3.5 h-3.5" /> Attachment: {profile.resume_filename || 'Candidate_Resume.pdf'}
                </div>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl text-slate-200 whitespace-pre-line leading-relaxed border border-slate-800/80">
                {body}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0 || isSending}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold disabled:opacity-40 transition flex items-center space-x-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <button
              onClick={handleSkipAndAdvance}
              disabled={isSending}
              className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-medium transition flex items-center space-x-1"
            >
              <SkipForward className="w-3.5 h-3.5" />
              <span>Skip Job</span>
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleSendAndAdvance}
              disabled={isSending || isGenerating}
              className="flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition shadow-lg glow-green disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isSending ? 'Sending...' : (isLast ? 'Confirm & Send Final Email' : 'Confirm & Send Email')}</span>
              {!isLast && <ChevronRight className="w-4 h-4 ml-1" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
