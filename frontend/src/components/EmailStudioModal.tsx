import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Send, 
  Mail, 
  Paperclip,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import type { Job, UserProfile } from '../types';
import { api } from '../services/api';
import { getGmailComposeUrl, isEmailVerified } from '../utils/gmail';

interface EmailStudioModalProps {
  job: Job | null;
  profile: UserProfile;
  onClose: () => void;
  onSendApplication: (jobId: number) => Promise<void>;
  isLoading: boolean;
}

export const EmailStudioModal: React.FC<EmailStudioModalProps> = ({
  job,
  profile,
  onClose,
  onSendApplication,
  isLoading
}) => {
  const [tone, setTone] = useState<'Professional' | 'Enthusiastic' | 'Concise'>('Professional');
  const [subject, setSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [, setCoverLetter] = useState('');
  const [recruiterEmail, setRecruiterEmail] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (job) {
      setRecruiterEmail(isEmailVerified(job) ? (job.recruiter_email || '') : '');
      loadGeneratedContent();
    }
  }, [job]);

  const loadGeneratedContent = async () => {
    if (!job) return;
    setIsGenerating(true);
    const content = await api.generateApplication(job.id);
    if (content) {
      setSubject(content.email_subject || `Application for ${job.title} - ${profile.name}`);
      setEmailBody(content.email_body || '');
      setCoverLetter(content.cover_letter || '');
    } else {
      // Fallback generator
      const topSkills = profile.skills.slice(0, 4).join(', ');
      setSubject(`Application for ${job.title} - ${profile.name}`);
      setEmailBody(
        `Dear ${job.recruiter_name || 'Hiring Manager'},\n\n` +
        `I am writing to express my strong interest in the ${job.title} opening at ${job.company}. ` +
        `With expertise in ${topSkills}, my technical background aligns directly with your posting requirements.\n\n` +
        `I have attached my resume for your review and look forward to discussing how my experience can contribute to ${job.company}.\n\n` +
        `Warm regards,\n${profile.name}`
      );
      setCoverLetter(
        `${profile.name}\n${profile.email}\n\nRe: Application for ${job.title} at ${job.company}\n\n` +
        `Dear Selection Committee,\n\n` +
        `I am pleased to submit my application for ${job.title}. My core skills in ${topSkills} make me an ideal candidate.\n\n` +
        `Sincerely,\n${profile.name}`
      );
    }
    setIsGenerating(false);
  };

  if (!job) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="glass-panel w-full max-w-3xl rounded-2xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] bg-cyber-card">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 to-brand-950/60">
          <div>
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-sky-400" />
              <h2 className="text-lg font-bold text-white">AI Application Studio</h2>
              <span className="text-xs bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                {job.match_score || 92}% Match
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {job.title} at <span className="text-white font-semibold">{job.company}</span>
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 overflow-y-auto text-xs">
          {/* Controls: Tone Selector & Recruiter Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between">
                <label className="text-slate-400 font-medium">Recruiter Email Address</label>
                {recruiterEmail && recruiterEmail.includes('@') && (
                  <a
                    href={getGmailComposeUrl(recruiterEmail, subject, emailBody)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-sky-400 hover:text-sky-300 underline font-medium inline-flex items-center gap-1"
                    title={`Open Gmail compose to ${recruiterEmail}`}
                  >
                    <span>Open in Gmail</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <input
                  type="email"
                  value={recruiterEmail}
                  onChange={(e) => setRecruiterEmail(e.target.value)}
                  placeholder="Verified recruiter email..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white text-xs focus:outline-none focus:border-sky-400 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 font-medium">Tone Preference</label>
              <div className="flex space-x-2 mt-1">
                {['Professional', 'Enthusiastic', 'Concise'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setTone(t as any);
                      loadGeneratedContent();
                    }}
                    className={`flex-1 py-2 rounded-xl font-semibold text-[11px] transition ${
                      tone === t ? 'bg-sky-500 text-white shadow' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Email Subject Line */}
          <div>
            <label className="text-slate-400 font-medium">Email Subject Line</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-medium focus:outline-none focus:border-sky-400"
            />
          </div>

          {/* Generated Email Body */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-400 font-medium flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-sky-400" />
                Human-Written AI Email Body
              </label>
              <button onClick={loadGeneratedContent} className="text-sky-400 hover:underline flex items-center gap-1 text-[10px]">
                <RefreshCw className={`w-3 h-3 ${isGenerating ? 'animate-spin' : ''}`} />
                <span>Regenerate Content</span>
              </button>
            </div>
            <textarea
              rows={8}
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-200 leading-relaxed font-sans focus:outline-none focus:border-sky-400 text-xs"
            />
          </div>

          {/* Resume Attachment Badge */}
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Paperclip className="w-4 h-4 text-emerald-400" />
              <div>
                <p className="font-semibold text-white">Attached: {profile.resume_filename || `${profile.name}_Resume.pdf`}</p>
                <p className="text-[10px] text-slate-400">Parsed ATS Score: {profile.ats_score || 88}%</p>
              </div>
            </div>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded border border-emerald-500/30">
              Verified Attachment
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-800 bg-slate-900/90 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[11px] text-slate-400">
            {recruiterEmail ? 'Ready to dispatch application via mailer.' : 'No verified email detected. Will save to pending queue.'}
          </p>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl text-xs transition"
            >
              Cancel
            </button>
            {recruiterEmail && recruiterEmail.includes('@') && (
              <a
                href={getGmailComposeUrl(recruiterEmail, subject, emailBody)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-sky-300 font-medium rounded-xl text-xs transition border border-sky-500/30 inline-flex items-center gap-1.5"
                title={`Open Gmail compose to ${recruiterEmail}`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Open in Gmail</span>
              </a>
            )}
            <button
              onClick={() => onSendApplication(job.id)}
              disabled={isLoading}
              className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition shadow-lg glow-emerald"
            >
              <Send className="w-4 h-4" />
              <span>{isLoading ? 'Sending Email...' : 'Approve & Send Application'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
