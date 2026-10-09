import React, { useState, useEffect } from 'react';
import {
  Mail,
  Send,
  Lock,
  FileText,
  User,
  CheckCircle2,
  XCircle,
  Search,
  CheckSquare,
  Square,
  Eye,
  Edit3,
  AlertCircle,
  Phone,
  MessageCircle
} from 'lucide-react';
import type { Job, UserProfile } from '../types';
import { getGmailComposeUrl, isEmailVerified } from '../utils/gmail';

interface MailViewProps {
  jobs: Job[];
  profile: UserProfile;
  userEmail: string;
  onSendCustomApplication: (jobId: number, subject: string, body: string) => Promise<boolean>;
  isLoading: boolean;
}

export const MailView: React.FC<MailViewProps> = ({
  jobs,
  profile,
  userEmail,
  onSendCustomApplication,
  isLoading
}) => {
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [selectedJobIds, setSelectedJobIds] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Verified' | 'Unverified' | 'Unable to Verify'>('All');

  const [subjectTemplate, setSubjectTemplate] = useState('Application for {{ROLE}} Opportunity at {{COMPANY}}');
  const [greetingTemplate, setGreetingTemplate] = useState('Dear {{HR_NAME}},');
  const [messageBody, setMessageBody] = useState(
    `I am writing to express my enthusiasm for potential {{ROLE}} opportunities at {{COMPANY}}.\n\nWith extensive experience in ${
      profile.skills?.slice(0, 5).join(', ') || 'software development'
    }, I have built scalable web applications and technical solutions.\n\nI have attached my resume for your consideration. I would welcome the opportunity to connect and discuss how my background aligns with {{COMPANY}}'s hiring needs.`
  );
  const [closingSignature, setClosingSignature] = useState(
    `Best regards,\n{{USER_NAME}}\n${userEmail}`
  );

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [statusNotification, setStatusNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Filter contacts
  const filteredJobs = jobs.filter((j) => {
    const matchesSearch =
      j.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (j.recruiter_name && j.recruiter_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (j.recruiter_email && j.recruiter_email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (j.recruiter_phone && j.recruiter_phone.toLowerCase().includes(searchTerm.toLowerCase()));

    const isVer = isEmailVerified(j);
    const matchesStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Verified' && isVer) ||
      (statusFilter === 'Unverified' && !isVer && Boolean(j.recruiter_email)) ||
      (statusFilter === 'Unable to Verify' && !isVer);

    return matchesSearch && matchesStatus;
  });

  // Select first valid job by default
  useEffect(() => {
    if (filteredJobs.length > 0 && (!selectedJobId || !jobs.some(j => j.id === selectedJobId))) {
      const valid = filteredJobs.find(j => j.recruiter_email) || filteredJobs[0];
      setSelectedJobId(valid.id);
      if (!selectedJobIds.includes(valid.id)) {
        setSelectedJobIds([valid.id]);
      }
    }
  }, [jobs, filteredJobs]);

  const activeJob = jobs.find((j) => j.id === selectedJobId) || filteredJobs[0];

  const handleToggleSelectJob = (id: number) => {
    setSelectedJobId(id);
    setSelectedJobIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedJobIds.length === filteredJobs.length) {
      setSelectedJobIds([]);
    } else {
      setSelectedJobIds(filteredJobs.map((j) => j.id));
    }
  };

  const insertPlaceholder = (tag: string, target: 'subject' | 'body') => {
    if (target === 'subject') {
      setSubjectTemplate((prev) => prev + ` ${tag}`);
    } else {
      setMessageBody((prev) => prev + ` ${tag}`);
    }
  };

  // Helper to replace placeholders safely
  const resolveTemplate = (template: string, job?: Job) => {
    if (!job) return template;

    // Recruiter name fallback
    let hrNameResolved = job.recruiter_name?.trim();
    if (!hrNameResolved || hrNameResolved.toLowerCase().includes('talent acquisition') || hrNameResolved.toLowerCase().includes('hiring team')) {
      hrNameResolved = 'Hiring Manager';
    }

    const companyResolved = job.company || 'your organization';
    const roleResolved = job.title || 'Software Engineering';
    const userNameResolved = profile.name || 'Candidate';

    return template
      .replace(/\{\{HR_NAME\}\}/g, hrNameResolved)
      .replace(/\{\{COMPANY\}\}/g, companyResolved)
      .replace(/\{\{ROLE\}\}/g, roleResolved)
      .replace(/\{\{USER_NAME\}\}/g, userNameResolved);
  };

  const resolvedSubject = resolveTemplate(subjectTemplate, activeJob);
  const resolvedGreeting = resolveTemplate(greetingTemplate, activeJob);
  const resolvedBody = resolveTemplate(messageBody, activeJob);
  const resolvedClosing = resolveTemplate(closingSignature, activeJob);

  const fullRenderedEmail = `${resolvedGreeting}\n\n${resolvedBody}\n\n${resolvedClosing}`;

  // Send single outreach email
  const handleSendSingleEmail = async () => {
    if (!activeJob) return;

    if (!activeJob.recruiter_email || !activeJob.recruiter_email.includes('@')) {
      setStatusNotification({
        type: 'error',
        message: `Cannot send email: Recruiter contact for ${activeJob.company} has no valid email address.`
      });
      return;
    }

    if (!profile.resume_filename) {
      setStatusNotification({
        type: 'error',
        message: 'Cannot send email: No resume uploaded. Please upload a resume before sending outreach.'
      });
      return;
    }

    setShowConfirmModal(false);
    const success = await onSendCustomApplication(activeJob.id, resolvedSubject, fullRenderedEmail);
    if (success) {
      setStatusNotification({
        type: 'success',
        message: `Email successfully sent to ${activeJob.recruiter_email} with resume '${profile.resume_filename}' attached!`
      });
    }
  };

  const getVerificationBadge = (status: string, email: string) => {
    const isVer = (status === 'Verified' || status === 'valid') && Boolean(email && email.includes('@'));
    if (isVer) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)' }} title="Hunter.io Deliverability Verified">
          <CheckCircle2 className="w-3 h-3" /> Hunter Verified
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}>
        <XCircle className="w-3 h-3" /> Unverified
      </span>
    );
  };

  return (
    <div className="space-y-6 page-enter max-w-7xl mx-auto">
      {/* ── Header Bar ── */}
      <div
        className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4"
        style={{ border: '1px solid rgba(255,255,255,0.06)', borderTop: '2px solid #6366f1' }}
      >
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)' }}>
              <Mail className="w-4 h-4 text-indigo-400" />
            </div>
            <h2 className="text-xl font-black text-white" style={{ fontFamily: 'Plus Jakarta Sans, Inter, sans-serif', letterSpacing: '-0.03em' }}>
              Outreach Email Composer &amp; Live Studio
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-xl">
            Select verified HR contacts, customize subject and message content, and preview personalized emails before sending.
          </p>
        </div>

        {/* Locked Sender Identity & Attached Resume Indicators */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Sender Identity */}
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
            style={{ background: 'rgba(10,14,24,0.9)', border: '1px solid rgba(56,189,248,0.25)' }}
          >
            <Lock className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span className="text-slate-400">Sending from:</span>
            <span className="font-bold text-sky-300 font-mono">{userEmail || profile.email}</span>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">(Locked)</span>
          </div>

          {/* Resume Indicator */}
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
            style={{
              background: profile.resume_filename ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
              border: profile.resume_filename ? '1px solid rgba(16,185,129,0.25)' : '1px solid rgba(239,68,68,0.25)',
            }}
          >
            <FileText className={`w-3.5 h-3.5 ${profile.resume_filename ? 'text-emerald-400' : 'text-red-400'}`} />
            <span className="text-slate-400">Attached Resume:</span>
            <span className={`font-bold ${profile.resume_filename ? 'text-emerald-300' : 'text-red-300'}`}>
              {profile.resume_filename || 'No resume attached'}
            </span>
          </div>
        </div>
      </div>

      {/* Notification toast */}
      {statusNotification && (
        <div
          className="p-4 rounded-xl flex items-center justify-between text-xs font-semibold animate-slide-down"
          style={{
            background: statusNotification.type === 'success' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
            border: statusNotification.type === 'success' ? '1px solid rgba(16,185,129,0.35)' : '1px solid rgba(239,68,68,0.35)',
            color: statusNotification.type === 'success' ? '#34d399' : '#f87171',
          }}
        >
          <div className="flex items-center gap-2">
            {statusNotification.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{statusNotification.message}</span>
          </div>
          <button onClick={() => setStatusNotification(null)} className="opacity-70 hover:opacity-100">
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Main Layout: Contact Picker (Left) + Mail Editor/Preview (Right) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ── Left Column: HR Contacts Selector (4 Cols) ── */}
        <div className="lg:col-span-5 space-y-4">
          <div
            className="glass-panel p-4 rounded-2xl space-y-3"
            style={{ border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <User className="w-4 h-4 text-sky-400" />
                Select Recipient ({filteredJobs.length})
              </h3>
              <div className="flex items-center gap-2 text-[10px]">
                <button
                  onClick={handleSelectAll}
                  className="text-sky-400 hover:underline font-bold"
                >
                  {selectedJobIds.length === filteredJobs.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
            </div>

            {/* Search & Filter */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter company, HR name, or role..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 rounded-xl outline-none"
                  style={{ background: 'rgba(6,8,16,0.9)', border: '1px solid rgba(30,41,59,0.8)' }}
                />
              </div>

              {/* Status pills */}
              <div className="flex items-center gap-1.5">
                {(['All', 'Verified', 'Unverified', 'Unable to Verify'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-semibold transition"
                    style={
                      statusFilter === st
                        ? { background: 'rgba(99,102,241,0.2)', color: '#a78bfa', border: '1px solid rgba(99,102,241,0.4)' }
                        : { background: 'rgba(10,14,24,0.6)', color: '#64748b', border: '1px solid transparent' }
                    }
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Contacts list */}
            <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
              {filteredJobs.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-xs">
                  No HR contacts match your search or filter.
                </div>
              ) : (
                filteredJobs.map((j) => {
                  const isSelected = activeJob?.id === j.id;
                  const isChecked = selectedJobIds.includes(j.id);

                  return (
                    <div
                      key={j.id}
                      onClick={() => setSelectedJobId(j.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                        isSelected ? 'ring-1 ring-sky-400' : ''
                      }`}
                      style={{
                        background: isSelected ? 'rgba(14,165,233,0.12)' : 'rgba(10,14,24,0.7)',
                        borderColor: isSelected ? 'rgba(56,189,248,0.4)' : 'rgba(30,41,59,0.6)',
                      }}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleSelectJob(j.id);
                        }}
                        className="mt-0.5 text-slate-500 hover:text-sky-400 shrink-0"
                      >
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-sky-400" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <span className="font-bold text-xs text-white truncate">{j.company}</span>
                          {getVerificationBadge(j.recruiter_status, j.recruiter_email)}
                        </div>
                        <p className="text-[11px] text-slate-300 font-medium truncate">{j.title}</p>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                          <span className="truncate">{j.recruiter_name || 'Hiring Team'}</span>
                          <span>•</span>
                          {isEmailVerified(j) ? (
                            <a
                              href={getGmailComposeUrl(j.recruiter_email, `Job Application: ${j.title} at ${j.company}`)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-mono text-sky-400/90 hover:underline hover:text-sky-300 truncate flex items-center gap-1"
                              title={`Open Gmail compose to ${j.recruiter_email}`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Mail className="w-2.5 h-2.5 shrink-0" />
                              <span className="truncate">{j.recruiter_email}</span>
                            </a>
                          ) : (
                            <span className="text-slate-600 italic">No verified email</span>
                          )}
                        </div>
                        {j.recruiter_phone && (
                          <div className="flex items-center gap-1.5 mt-0.5 text-[9px] font-mono text-emerald-400/80">
                            <Phone className="w-2.5 h-2.5 text-emerald-400" />
                            <span>{j.recruiter_phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* ── Right Column: Email Editor + Live Preview (7 Cols) ── */}
        <div className="lg:col-span-7 space-y-6">

          {/* Editor Card */}
          <div
            className="glass-panel p-6 rounded-2xl space-y-5"
            style={{ border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-indigo-400" />
                Customize Email Content
              </h3>
              {/* Insert variable helper tags */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Insert Tag:</span>
                {[
                  { tag: '{{HR_NAME}}', label: 'HR Name' },
                  { tag: '{{COMPANY}}', label: 'Company' },
                  { tag: '{{ROLE}}', label: 'Role' },
                  { tag: '{{USER_NAME}}', label: 'My Name' },
                ].map(({ tag, label }) => (
                  <button
                    key={tag}
                    onClick={() => insertPlaceholder(tag, 'body')}
                    className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold transition"
                    style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.3)' }}
                    title={`Click to insert ${tag} into message`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Subject Input */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Subject Line
              </label>
              <input
                type="text"
                value={subjectTemplate}
                onChange={(e) => setSubjectTemplate(e.target.value)}
                placeholder="Subject line with {{COMPANY}} or {{ROLE}}..."
                className="w-full px-4 py-2.5 text-xs text-white rounded-xl outline-none transition"
                style={{ background: 'rgba(6,8,16,0.9)', border: '1px solid rgba(30,41,59,0.8)' }}
                onFocus={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = 'rgba(30,41,59,0.8)'; }}
              />
            </div>

            {/* Greeting Input */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Salutation / Greeting
              </label>
              <input
                type="text"
                value={greetingTemplate}
                onChange={(e) => setGreetingTemplate(e.target.value)}
                placeholder="Dear {{HR_NAME}},"
                className="w-full px-4 py-2 text-xs text-white rounded-xl outline-none transition"
                style={{ background: 'rgba(6,8,16,0.9)', border: '1px solid rgba(30,41,59,0.8)' }}
              />
            </div>

            {/* Main Message Input */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Main Message Body
              </label>
              <textarea
                rows={6}
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                placeholder="Write your email body here..."
                className="w-full px-4 py-3 text-xs text-slate-100 rounded-xl outline-none transition font-sans leading-relaxed resize-y"
                style={{ background: 'rgba(6,8,16,0.9)', border: '1px solid rgba(30,41,59,0.8)' }}
              />
            </div>

            {/* Closing Signature */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Closing / Signature
              </label>
              <textarea
                rows={3}
                value={closingSignature}
                onChange={(e) => setClosingSignature(e.target.value)}
                className="w-full px-4 py-2 text-xs text-slate-200 rounded-xl outline-none transition font-sans"
                style={{ background: 'rgba(6,8,16,0.9)', border: '1px solid rgba(30,41,59,0.8)' }}
              />
            </div>
          </div>

          {/* ── Live Rendered Email Preview Panel ── */}
          <div
            className="glass-panel p-6 rounded-2xl space-y-4"
            style={{ border: '1px solid rgba(56,189,248,0.2)' }}
          >
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'rgba(30,41,59,0.6)' }}>
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-bold text-white">Live Email Preview</h3>
                <span className="text-[10px] text-slate-500 font-semibold">(Updates in real time)</span>
              </div>
              {activeJob && getVerificationBadge(activeJob.recruiter_status, activeJob.recruiter_email)}
            </div>

            {/* Rendered Email Details */}
            <div
              className="p-5 rounded-xl space-y-4 text-xs font-sans"
              style={{ background: 'rgba(6,8,16,0.95)', border: '1px solid rgba(30,41,59,0.8)' }}
            >
              {/* Header Info */}
              <div className="space-y-1.5 border-b pb-3 text-slate-400" style={{ borderColor: 'rgba(30,41,59,0.6)' }}>
                <div className="flex items-center justify-between">
                  <span>
                    <strong className="text-slate-200">From:</strong> {userEmail || profile.email} 🔒
                  </span>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <strong className="text-slate-200">To:</strong>{' '}
                    {isEmailVerified(activeJob) ? (
                      <a
                        href={getGmailComposeUrl(activeJob.recruiter_email, `Job Application: ${activeJob.title} at ${activeJob.company}`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-sky-300 font-bold hover:underline inline-flex items-center gap-1"
                        title={`Open Gmail compose to ${activeJob.recruiter_email}`}
                      >
                        <Mail className="w-3.5 h-3.5 text-sky-400" />
                        <span>{activeJob.recruiter_email}</span>
                      </a>
                    ) : (
                      <span className="text-red-400 font-bold">No verified email available</span>
                    )}
                    {activeJob?.recruiter_name && ` (${activeJob.recruiter_name})`}
                  </div>
                  {activeJob?.recruiter_phone && (
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <a href={`tel:${activeJob.recruiter_phone.replace(/\s+/g, '')}`} className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors">
                        <Phone className="w-3 h-3" />
                        {activeJob.recruiter_phone}
                      </a>
                      <a 
                        href={`https://wa.me/${activeJob.recruiter_phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${activeJob.recruiter_name || 'Hiring Team'}, I am reaching out regarding the ${activeJob.title} opening at ${activeJob.company}.`)}`} 
                        target="_blank" 
                        rel="noreferrer" 
                        title="Chat on WhatsApp"
                        className="text-emerald-400 hover:text-emerald-300 transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>
                <div>
                  <strong className="text-slate-200">Subject:</strong>{' '}
                  <span className="text-white font-semibold">{resolvedSubject}</span>
                </div>
                <div className="pt-1 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold" style={{ background: 'rgba(16,185,129,0.12)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)' }}>
                    <FileText className="w-3.5 h-3.5" />
                    Attachment: {profile.resume_filename || 'No resume attached'}
                  </span>
                </div>
              </div>

              {/* Rendered Body Text */}
              <div className="text-slate-200 whitespace-pre-line leading-relaxed text-xs">
                {fullRenderedEmail}
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="text-xs text-slate-400">
                {activeJob ? (
                  <span>
                    Sending to <strong className="text-white">{activeJob.company}</strong> ({activeJob.recruiter_email || 'No email'})
                  </span>
                ) : (
                  <span>Select an HR contact from the list</span>
                )}
              </div>

              <button
                onClick={() => setShowConfirmModal(true)}
                disabled={isLoading || !activeJob || !activeJob.recruiter_email}
                className="btn-primary text-xs w-full sm:w-auto px-6 py-2.5 justify-center"
                style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Outreach Email</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* ── Confirmation Modal ── */}
      {showConfirmModal && activeJob && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div
            className="glass-panel w-full max-w-md p-6 rounded-2xl border space-y-4 animate-scale-in"
            style={{ background: 'rgba(8,12,22,0.98)', borderColor: 'rgba(56,189,248,0.3)' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(16,185,129,0.15)' }}>
                <Send className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Confirm Outreach Email</h3>
                <p className="text-xs text-slate-400">Review dispatch details before sending</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs">
              <p><strong className="text-slate-300">Recipient:</strong> {activeJob.recruiter_name} ({activeJob.recruiter_email})</p>
              <p><strong className="text-slate-300">Company:</strong> {activeJob.company}</p>
              <p><strong className="text-slate-300">From Account:</strong> {userEmail} 🔒</p>
              <p><strong className="text-slate-300">Attached Resume:</strong> {profile.resume_filename || 'None'} 📎</p>
              <p><strong className="text-slate-300">Subject:</strong> {resolvedSubject}</p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSendSingleEmail}
                disabled={isLoading}
                className="btn-primary text-xs px-5 py-2"
                style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}
              >
                <Send className="w-3.5 h-3.5" />
                {isLoading ? 'Sending...' : 'Confirm & Dispatch'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
