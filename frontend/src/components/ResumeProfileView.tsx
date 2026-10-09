import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  FileText,
  User,
  Mail,
  Phone,
  Briefcase,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  X,
  Save,
  Edit3,
  Star,
  Award,
  Target
} from 'lucide-react';
import type { UserProfile } from '../types';

interface ResumeProfileViewProps {
  profile: UserProfile;
  onUploadResume: (file: File) => Promise<void>;
  onUpdateProfile: (updated: Partial<UserProfile>) => Promise<void>;
  onTriggerScrape?: (query?: string, location?: string, roles?: string[], locations?: string[]) => void;
  isUploading: boolean;
}

export const PREDEFINED_JOB_ROLES = [
  'Software Engineer',
  'Software Development Engineer (SDE-1)',
  'Software Development Engineer (SDE-2)',
  'Senior Software Engineer',
  'Staff / Principal Software Engineer',
  'Full Stack Developer',
  'Software Engineer Intern',
  'Backend Engineer',
  'Frontend Developer',
  'React / Next.js Developer',
  'Node.js Developer',
  'Python Developer',
  'Java Developer',
  'Golang Backend Engineer',
  'Rust Systems Developer',
  'C++ Systems / Low-Latency Engineer',
  'AI / ML Engineer',
  'Generative AI / LLM Engineer',
  'MLOps Engineer',
  'Computer Vision Engineer',
  'NLP / Natural Language Processing Specialist',
  'Data Scientist',
  'Data Engineer',
  'Big Data Engineer',
  'Data Analyst / BI Engineer',
  'DevOps Engineer',
  'Kubernetes / Platform Engineer',
  'Cloud Engineer (AWS / GCP / Azure)',
  'Site Reliability Engineer (SRE)',
  'Cloud Solutions Architect',
  'Cybersecurity / Security Engineer',
  'Cloud Security Architect',
  'SOC Analyst / Incident Response',
  'Android Developer (Kotlin / Jetpack)',
  'iOS Developer (Swift / SwiftUI)',
  'Mobile App Developer (Flutter / React Native)',
  'QA / Automation Engineer (SDET)',
  'Database Administrator (DBA)',
  'Product Manager / APM',
  'Technical Product Manager (TPM)',
  'UI / UX Product Designer',
  'UX Researcher',
  'Blockchain / Web3 Engineer',
  'Embedded Systems / IoT Engineer',
  'Solutions Architect / Consultant',
  'Technical Writer / Developer Advocate',
  'System Administrator / IT Engineer'
];

import { INDIAN_CITIES, LOCATION_SCOPES } from '../utils/locations';

export const PREDEFINED_LOCATIONS = [
  ...LOCATION_SCOPES,
  ...INDIAN_CITIES.filter(c => !c.startsWith('All'))
];

// ATS Score circular ring component
const ATSScoreRing: React.FC<{ score: number }> = ({ score }) => {
  const [displayScore, setDisplayScore] = useState(0);
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const safeScore = Math.min(100, Math.max(0, score));

  useEffect(() => {
    const timer = setTimeout(() => setDisplayScore(safeScore), 100);
    return () => clearTimeout(timer);
  }, [safeScore]);

  const color = safeScore >= 80 ? '#10b981' : safeScore >= 60 ? '#f59e0b' : '#ef4444';
  const glow = safeScore >= 80 ? 'rgba(16,185,129,0.4)' : safeScore >= 60 ? 'rgba(245,158,11,0.4)' : 'rgba(239,68,68,0.4)';
  const label = safeScore >= 80 ? 'Excellent' : safeScore >= 60 ? 'Good' : 'Needs Work';

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="ats-ring-container" style={{ width: 130, height: 130 }}>
        <svg className="ats-ring-svg" width="130" height="130">
          <circle className="ats-ring-track" cx="65" cy="65" r={radius} />
          <circle
            className="ats-ring-fill"
            cx="65"
            cy="65"
            r={radius}
            stroke={color}
            strokeDasharray={circumference}
            strokeDashoffset={circumference - (displayScore / 100) * circumference}
            style={{ filter: `drop-shadow(0 0 8px ${glow})` }}
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-3xl font-black text-white" style={{ fontFamily: 'Plus Jakarta Sans, Inter, sans-serif', letterSpacing: '-0.04em' }}>
            {displayScore}
          </span>
          <span className="text-[10px] font-bold text-slate-400 -mt-0.5">ATS Score</span>
        </div>
      </div>
      <span
        className="text-[11px] font-bold px-3 py-1 rounded-full"
        style={{ background: `${glow.replace('0.4', '0.15')}`, color, border: `1px solid ${glow.replace('0.4', '0.4')}` }}
      >
        {label}
      </span>
    </div>
  );
};

export const ResumeProfileView: React.FC<ResumeProfileViewProps> = ({
  profile,
  onUploadResume,
  onUpdateProfile,
  onTriggerScrape,
  isUploading
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(profile.name);
  const [editedPhone, setEditedPhone] = useState(profile.phone);
  const [isDragOver, setIsDragOver] = useState(false);

  const [roles, setRoles] = useState<string[]>(profile.preferred_roles || ['Software Engineer', 'Full Stack Developer']);
  const [selectedRoleOption, setSelectedRoleOption] = useState('');
  const [customRoleInput, setCustomRoleInput] = useState('');
  const [showCustomRole, setShowCustomRole] = useState(false);

  const [locations, setLocations] = useState<string[]>(profile.preferred_locations || ['India', 'Remote (India)', 'Bangalore, KA']);
  const [selectedLocationOption, setSelectedLocationOption] = useState('');
  const [customLocationInput, setCustomLocationInput] = useState('');
  const [showCustomLocation, setShowCustomLocation] = useState(false);

  const [isScrapingTargets, setIsScrapingTargets] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files?.[0]) onUploadResume(e.dataTransfer.files[0]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      onUploadResume(e.target.files[0]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddSelectedRole = (roleToAdd: string) => {
    const trimmed = roleToAdd.trim();
    if (trimmed && !roles.includes(trimmed)) {
      const updated = [...roles, trimmed];
      setRoles(updated);
      onUpdateProfile({ preferred_roles: updated });
      setSelectedRoleOption('');
      setCustomRoleInput('');
      setShowCustomRole(false);
    }
  };

  const handleRemoveRole = (roleToRemove: string) => {
    const updated = roles.filter(r => r !== roleToRemove);
    setRoles(updated);
    onUpdateProfile({ preferred_roles: updated });
  };

  const handleAddSelectedLocation = (locToAdd: string) => {
    const trimmed = locToAdd.trim();
    if (trimmed && !locations.includes(trimmed)) {
      const updated = [...locations, trimmed];
      setLocations(updated);
      onUpdateProfile({ preferred_locations: updated });
      setSelectedLocationOption('');
      setCustomLocationInput('');
      setShowCustomLocation(false);
    }
  };

  const handleRemoveLocation = (locToRemove: string) => {
    const updated = locations.filter(l => l !== locToRemove);
    setLocations(updated);
    onUpdateProfile({ preferred_locations: updated });
  };

  const handleSaveProfile = () => {
    onUpdateProfile({ name: editedName, email: profile.email, phone: editedPhone, preferred_roles: roles, preferred_locations: locations });
    setIsEditing(false);
  };

  const handleTriggerTargetScrape = async () => {
    if (!onTriggerScrape) return;
    setIsScrapingTargets(true);
    try {
      await onTriggerScrape('', '', roles, locations);
    } finally {
      setIsScrapingTargets(false);
    }
  };

  const availableRolesToSelect = PREDEFINED_JOB_ROLES.filter(r => !roles.includes(r));
  const availableLocationsToSelect = PREDEFINED_LOCATIONS.filter(l => !locations.includes(l));
  const atsScore = profile.ats_score || 0;

  // Skill colors cycling
  const SKILL_COLORS = [
    { bg: 'rgba(56,189,248,0.1)', border: 'rgba(56,189,248,0.25)', color: '#7dd3fc' },
    { bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.25)', color: '#c4b5fd' },
    { bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.25)', color: '#6ee7b7' },
    { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)', color: '#fcd34d' },
    { bg: 'rgba(236,72,153,0.1)', border: 'rgba(236,72,153,0.25)', color: '#f9a8d4' },
    { bg: 'rgba(99,102,241,0.1)', border: 'rgba(99,102,241,0.25)', color: '#a5b4fc' },
  ];

  return (
    <div className="space-y-5 max-w-5xl mx-auto page-enter">
      <input
        type="file"
        ref={fileInputRef}
        accept=".pdf,.docx,.txt"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* ── Header ── */}
      <div
        className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4"
        style={{ border: '1px solid rgba(255,255,255,0.06)', borderTop: '2px solid #0ea5e9' }}
      >
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2" style={{ fontFamily: 'Plus Jakarta Sans, Inter, sans-serif', letterSpacing: '-0.025em' }}>
            <FileText className="w-5 h-5 text-sky-400" />
            Resume & Candidate Profile
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-lg">
            Manage your resume document and candidate profile used for automated cold outreach emails.
          </p>
        </div>
        <button
          onClick={() => { if (isEditing) handleSaveProfile(); else setIsEditing(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all"
          style={isEditing ? {
            background: 'rgba(16,185,129,0.15)',
            border: '1px solid rgba(16,185,129,0.35)',
            color: '#34d399',
          } : {
            background: 'rgba(10,14,24,0.8)',
            border: '1px solid rgba(30,41,59,0.7)',
            color: '#94a3b8',
          }}
        >
          {isEditing ? <Save className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5 text-sky-400" />}
          {isEditing ? 'Save Profile' : 'Edit Profile'}
        </button>
      </div>

      {/* ── ATS Score + Resume Upload ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* ATS Score Panel */}
        <div
          className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center gap-4"
          style={{ border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <ATSScoreRing score={atsScore} />
          <div className="text-center">
            <p className="text-xs font-semibold text-slate-400">AI-computed ATS compatibility score</p>
            <p className="text-[10px] text-slate-600 mt-0.5">Upload resume to update</p>
          </div>
          {/* Quick stats */}
          <div className="w-full grid grid-cols-2 gap-2">
            {[
              { icon: Star, label: 'Skills', value: (profile.skills || []).length, color: '#38bdf8' },
              { icon: Award, label: 'Certs', value: (profile.certifications || []).length, color: '#a78bfa' },
              { icon: Target, label: 'Roles', value: (profile.preferred_roles || []).length, color: '#10b981' },
              { icon: MapPin, label: 'Locations', value: (profile.preferred_locations || []).length, color: '#f59e0b' },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <div
                  key={i}
                  className="flex flex-col items-center justify-center p-2.5 rounded-xl"
                  style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(30,41,59,0.5)' }}
                >
                  <Icon className="w-3.5 h-3.5 mb-1" style={{ color: s.color }} />
                  <span className="text-base font-black text-white">{s.value}</span>
                  <span className="text-[9px] text-slate-500">{s.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Resume Upload Area */}
        <div className="md:col-span-2 glass-panel p-6 rounded-2xl flex flex-col gap-4" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Upload className="w-4 h-4 text-emerald-400" />
              Resume Document
            </h3>
            {profile.resume_filename ? (
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399' }}>
                <CheckCircle2 className="w-3 h-3" />
                Auto-attached to all emails
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', color: '#fbbf24' }}>
                <AlertTriangle className="w-3 h-3" />
                No resume attached
              </span>
            )}
          </div>

          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleFileDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`upload-zone p-10 text-center cursor-pointer flex flex-col items-center gap-4 transition-all ${isDragOver ? 'drag-over' : ''}`}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300"
              style={{
                background: isDragOver ? 'rgba(56,189,248,0.2)' : 'rgba(56,189,248,0.08)',
                border: `1px solid ${isDragOver ? 'rgba(56,189,248,0.5)' : 'rgba(56,189,248,0.15)'}`,
              }}
            >
              <Upload className="w-7 h-7 text-sky-400" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">
                {isUploading ? 'Uploading...' : profile.resume_filename ? 'Replace Resume' : 'Upload Resume (PDF / DOCX)'}
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Your document is stored securely and attached automatically to all outgoing cold emails.
              </p>
            </div>
            {isUploading ? (
              <div className="flex items-center gap-2 text-xs text-sky-400">
                <div className="w-4 h-4 border-2 border-sky-400/30 border-t-sky-400 rounded-full animate-spin" />
                Processing resume...
              </div>
            ) : (
              <button
                type="button"
                onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}
                className="btn-primary text-xs"
                style={{ background: 'linear-gradient(135deg, #0369a1, #0ea5e9)' }}
              >
                <Upload className="w-3.5 h-3.5" />
                {profile.resume_filename ? 'Choose New File' : 'Browse & Upload'}
              </button>
            )}
            {profile.resume_filename && (
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono"
                  style={{ background: 'rgba(12,16,24,0.8)', border: '1px solid rgba(30,41,59,0.8)' }}
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-slate-300">Resume: {profile.resume_filename}</span>
                </div>
                <div
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono"
                  style={{ background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.25)' }}
                >
                  <Mail className="w-3.5 h-3.5 text-sky-400" />
                  <span className="text-sky-300 font-bold">Sending from: {profile.email} 🔒</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Profile Info ── */}
      <div className="glass-panel p-6 rounded-2xl space-y-6" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <User className="w-4 h-4 text-sky-400" />
          Candidate Profile Info
        </h3>

        {isEditing ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-sky-400" /> Full Name
              </label>
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="w-full px-4 py-3 text-sm text-white placeholder-slate-600 rounded-xl outline-none transition-all"
                style={{ background: 'rgba(6,8,16,0.9)', border: '1px solid rgba(30,41,59,0.9)' }}
              />
            </div>

            {/* Read-Only Locked Gmail ID */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-sky-400" /> Sending Email Account 🔒
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  readOnly
                  className="w-full px-4 py-3 text-sm text-sky-300 font-bold font-mono rounded-xl outline-none cursor-not-allowed opacity-80"
                  style={{ background: 'rgba(10,14,24,0.9)', border: '1px solid rgba(56,189,248,0.3)' }}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-sky-400">🔒 Locked</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Permanent email sender bound to your login session</p>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-sky-400" /> Phone Number
              </label>
              <input
                type="text"
                value={editedPhone}
                onChange={(e) => setEditedPhone(e.target.value)}
                className="w-full px-4 py-3 text-sm text-white placeholder-slate-600 rounded-xl outline-none transition-all"
                style={{ background: 'rgba(6,8,16,0.9)', border: '1px solid rgba(30,41,59,0.9)' }}
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Full Name', icon: User, value: profile.name, color: '#38bdf8' },
              { label: 'Email Address', icon: Mail, value: profile.email, color: '#10b981' },
              { label: 'Phone Number', icon: Phone, value: profile.phone || '+91 (555) 019-2831', color: '#a78bfa' },
            ].map(({ label, icon: Icon, value, color }) => (
              <div
                key={label}
                className="flex items-center gap-3 p-4 rounded-xl"
                style={{ background: 'rgba(12,16,24,0.8)', border: '1px solid rgba(30,41,59,0.6)' }}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}18` }}>
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</p>
                  <p className="font-semibold text-slate-100 text-sm truncate">{value}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Skills */}
        {(profile.skills || []).length > 0 && (
          <div className="pt-4" style={{ borderTop: '1px solid rgba(30,41,59,0.5)' }}>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">Technical Skills</p>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill, i) => {
                const c = SKILL_COLORS[i % SKILL_COLORS.length];
                return (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all duration-200 cursor-default"
                    style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.color }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.05)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
                  >
                    {skill}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Preferred Roles */}
        <div className="pt-4" style={{ borderTop: '1px solid rgba(30,41,59,0.5)' }}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
              Target Job Roles ({roles.length})
            </label>
            <div className="flex items-center gap-2">
              {showCustomRole ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    placeholder="Type custom role..."
                    value={customRoleInput}
                    onChange={(e) => setCustomRoleInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && customRoleInput.trim()) handleAddSelectedRole(customRoleInput); }}
                    className="px-3 py-1.5 text-xs text-white placeholder-slate-500 rounded-xl outline-none"
                    style={{ background: 'rgba(6,8,16,0.9)', border: '1px solid rgba(16,185,129,0.5)' }}
                    autoFocus
                  />
                  <button
                    onClick={() => { if (customRoleInput.trim()) handleAddSelectedRole(customRoleInput); }}
                    className="px-2.5 py-1.5 text-xs font-bold rounded-xl"
                    style={{ background: 'rgba(16,185,129,0.2)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)' }}
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setShowCustomRole(false)}
                    className="px-2 py-1.5 text-xs text-slate-500 hover:text-slate-300"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <select
                    value={selectedRoleOption}
                    onChange={(e) => { if (e.target.value) handleAddSelectedRole(e.target.value); }}
                    className="px-3 py-2 text-xs text-slate-300 rounded-xl outline-none cursor-pointer sm:w-64"
                    style={{ background: 'rgba(6,8,16,0.9)', border: '1px solid rgba(30,41,59,0.8)' }}
                  >
                    <option value="">+ Add target role</option>
                    {availableRolesToSelect.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <button
                    onClick={() => setShowCustomRole(true)}
                    className="text-[11px] font-bold px-2.5 py-2 rounded-xl text-slate-400 hover:text-emerald-400 transition"
                    style={{ background: 'rgba(10,14,24,0.8)', border: '1px solid rgba(30,41,59,0.8)' }}
                    title="Add custom role"
                  >
                    + Custom
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {roles.map((r, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold"
                style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: '#6ee7b7' }}
              >
                {r}
                <button onClick={() => handleRemoveRole(r)} className="text-emerald-600 hover:text-red-400 transition-colors ml-0.5">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Preferred Locations */}
        <div className="pt-4" style={{ borderTop: '1px solid rgba(30,41,59,0.5)' }}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-sky-400" />
              Target Locations ({locations.length})
            </label>
            <div className="flex items-center gap-2">
              {showCustomLocation ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    placeholder="Type city or location..."
                    value={customLocationInput}
                    onChange={(e) => setCustomLocationInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && customLocationInput.trim()) handleAddSelectedLocation(customLocationInput); }}
                    className="px-3 py-1.5 text-xs text-white placeholder-slate-500 rounded-xl outline-none"
                    style={{ background: 'rgba(6,8,16,0.9)', border: '1px solid rgba(14,165,233,0.5)' }}
                    autoFocus
                  />
                  <button
                    onClick={() => { if (customLocationInput.trim()) handleAddSelectedLocation(customLocationInput); }}
                    className="px-2.5 py-1.5 text-xs font-bold rounded-xl"
                    style={{ background: 'rgba(14,165,233,0.2)', color: '#38bdf8', border: '1px solid rgba(14,165,233,0.3)' }}
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setShowCustomLocation(false)}
                    className="px-2 py-1.5 text-xs text-slate-500 hover:text-slate-300"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <select
                    value={selectedLocationOption}
                    onChange={(e) => { if (e.target.value) handleAddSelectedLocation(e.target.value); }}
                    className="px-3 py-2 text-xs text-slate-300 rounded-xl outline-none cursor-pointer sm:w-64"
                    style={{ background: 'rgba(6,8,16,0.9)', border: '1px solid rgba(30,41,59,0.8)' }}
                  >
                    <option value="">+ Add target location</option>
                    {availableLocationsToSelect.map((loc) => <option key={loc} value={loc}>{loc}</option>)}
                  </select>
                  <button
                    onClick={() => setShowCustomLocation(true)}
                    className="text-[11px] font-bold px-2.5 py-2 rounded-xl text-slate-400 hover:text-sky-400 transition"
                    style={{ background: 'rgba(10,14,24,0.8)', border: '1px solid rgba(30,41,59,0.8)' }}
                    title="Add custom location"
                  >
                    + Custom
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {locations.map((loc, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold"
                style={{ background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.25)', color: '#7dd3fc' }}
              >
                <MapPin className="w-3 h-3" />
                {loc}
                <button onClick={() => handleRemoveLocation(loc)} className="text-sky-600 hover:text-red-400 transition-colors ml-0.5">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* 1-Click Action to Connect Target Roles & Locations to HR Contact Finder */}
        <div
          className="p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 mt-4"
          style={{ background: 'linear-gradient(135deg, rgba(14,165,233,0.08), rgba(99,102,241,0.08))', border: '1px solid rgba(99,102,241,0.2)' }}
        >
          <div>
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-sky-400" />
              Connect Targets to Autonomous HR Scraper
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Crawl job feeds and mine verified recruiter contact details across your {roles.length} target roles and {locations.length} locations.
            </p>
          </div>
          <button
            onClick={handleTriggerTargetScrape}
            disabled={isScrapingTargets}
            className="btn-primary text-xs shrink-0 py-2.5 px-4"
            style={{ background: 'linear-gradient(135deg, #0284c7, #6366f1)' }}
          >
            {isScrapingTargets ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Mining HR Contacts...</span>
              </>
            ) : (
              <>
                <Target className="w-3.5 h-3.5" />
                <span>Find HR Contacts for My Targets</span>
              </>
            )}
          </button>
        </div>

        {/* Save button */}
        {isEditing && (
          <button
            onClick={handleSaveProfile}
            className="w-full btn-primary py-3 justify-center text-sm mt-2"
            style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}
          >
            <Save className="w-4 h-4" />
            Save Profile Changes
          </button>
        )}
      </div>
    </div>
  );
};
