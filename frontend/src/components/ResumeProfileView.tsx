import React, { useState, useRef } from 'react';
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
  Edit3
} from 'lucide-react';

import type { UserProfile } from '../types';

interface ResumeProfileViewProps {
  profile: UserProfile;
  onUploadResume: (file: File) => Promise<void>;
  onUpdateProfile: (updated: Partial<UserProfile>) => Promise<void>;
  isUploading: boolean;
}

export const PREDEFINED_JOB_ROLES = [
  'Software Engineer',
  'Full Stack Developer',
  'Backend Engineer',
  'Frontend Developer',
  'Python Developer',
  'Java Developer',
  'React Developer',
  'Node.js Developer',
  'AI / ML Engineer',
  'Data Engineer',
  'Data Scientist',
  'DevOps Engineer',
  'Cloud Engineer',
  'Mobile App Developer (Android/iOS)',
  'Software Engineer Intern',
  'QA / Test Automation Engineer',
  'Cyber Security Analyst',
  'Product Manager',
  'System Administrator'
];

export const PREDEFINED_LOCATIONS = [
  'Remote (India)',
  'Bangalore, KA',
  'Gurgaon / NCR, HR',
  'Noida, UP',
  'Mumbai, MH',
  'Hyderabad, TS',
  'Pune, MH',
  'Chennai, TN',
  'Kolkata, WB',
  'Ahmedabad, GJ'
];

export const ResumeProfileView: React.FC<ResumeProfileViewProps> = ({
  profile,
  onUploadResume,
  onUpdateProfile,
  isUploading
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(profile.name);
  const [editedEmail, setEditedEmail] = useState(profile.email);
  const [editedPhone, setEditedPhone] = useState(profile.phone);

  const [roles, setRoles] = useState<string[]>(profile.preferred_roles || ['Software Engineer', 'Full Stack Developer']);
  const [selectedRoleOption, setSelectedRoleOption] = useState('');

  const [locations, setLocations] = useState<string[]>(profile.preferred_locations || ['Remote (India)', 'Bangalore, KA']);
  const [selectedLocationOption, setSelectedLocationOption] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onUploadResume(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUploadResume(e.target.files[0]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleTriggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAddSelectedRole = (roleToAdd: string) => {
    if (roleToAdd && !roles.includes(roleToAdd)) {
      const updated = [...roles, roleToAdd];
      setRoles(updated);
      onUpdateProfile({ preferred_roles: updated });
      setSelectedRoleOption('');
    }
  };

  const handleRemoveRole = (roleToRemove: string) => {
    const updated = roles.filter(r => r !== roleToRemove);
    setRoles(updated);
    onUpdateProfile({ preferred_roles: updated });
  };

  const handleAddSelectedLocation = (locToAdd: string) => {
    if (locToAdd && !locations.includes(locToAdd)) {
      const updated = [...locations, locToAdd];
      setLocations(updated);
      onUpdateProfile({ preferred_locations: updated });
      setSelectedLocationOption('');
    }
  };

  const handleRemoveLocation = (locToRemove: string) => {
    const updated = locations.filter(l => l !== locToRemove);
    setLocations(updated);
    onUpdateProfile({ preferred_locations: updated });
  };

  const handleSaveProfile = () => {
    onUpdateProfile({
      name: editedName,
      email: editedEmail,
      phone: editedPhone,
      preferred_roles: roles,
      preferred_locations: locations
    });
    setIsEditing(false);
  };

  // Filter out roles that are already selected
  const availableRolesToSelect = PREDEFINED_JOB_ROLES.filter(r => !roles.includes(r));
  const availableLocationsToSelect = PREDEFINED_LOCATIONS.filter(l => !locations.includes(l));

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Hidden File Input with Ref for 100% Reliable Triggering */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".pdf,.docx,.txt"
        onChange={handleFileChange}
        className="hidden"
        id="resume-file-input-main"
      />

      {/* Top Header */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-sky-400" />
            My Resume Document & Essential Candidate Profile
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage your uploaded resume attachment file and essential candidate contact details used for cold outreach.
          </p>
        </div>
        <button
          onClick={() => {
            if (isEditing) {
              handleSaveProfile();
            } else {
              setIsEditing(true);
            }
          }}
          className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-4 py-2 rounded-xl border border-slate-700 transition"
        >
          {isEditing ? <Save className="w-4 h-4 text-emerald-400" /> : <Edit3 className="w-4 h-4 text-sky-400" />}
          <span>{isEditing ? 'Save Essential Profile' : 'Edit Profile Info'}</span>
        </button>
      </div>

      {/* 1. Document-Centric Resume Attachment Section */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            Resume Document Attachment Management
          </h3>
          {profile.resume_filename ? (
            <span className="inline-flex items-center gap-1.5 text-xs bg-emerald-950 text-emerald-300 font-semibold px-3 py-1.5 rounded-xl border border-emerald-800/60">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Attached to 100% Outgoing Outreach Emails
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs bg-amber-950 text-amber-300 font-semibold px-3 py-1.5 rounded-xl border border-amber-800/60">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              No Resume Uploaded
            </span>
          )}
        </div>

        {/* File Drag & Drop Card & Interactive Button */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleFileDrop}
          onClick={handleTriggerFileInput}
          className="p-8 rounded-2xl border-2 border-dashed border-sky-500/30 hover:border-sky-400 transition-all text-center group cursor-pointer bg-slate-900/60 space-y-3"
        >
          <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform border border-indigo-500/20 shadow-lg">
            <Upload className="w-7 h-7 text-sky-400" />
          </div>

          <div>
            <h4 className="text-base font-bold text-white">
              {isUploading ? 'Uploading Resume File...' : (profile.resume_filename ? 'Replace Current Resume Document' : 'Upload Candidate Resume (PDF / DOCX)')}
            </h4>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Upload your latest PDF or DOCX resume. The document is stored securely and attached automatically to all cold application emails sent to HR recruiters.
            </p>
          </div>

          <div className="pt-2 flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleTriggerFileInput();
              }}
              disabled={isUploading}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition shadow-lg glow-blue disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              <span>{isUploading ? 'Uploading...' : (profile.resume_filename ? 'Choose New Resume File' : 'Browse & Upload Resume')}</span>
            </button>

            {profile.resume_filename ? (
              <div className="inline-flex items-center gap-2 bg-slate-800 text-slate-200 text-xs px-4 py-2 rounded-xl border border-slate-700 font-mono">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>Current File: <strong>{profile.resume_filename}</strong></span>
              </div>
            ) : (
              <p className="text-[11px] text-sky-400 font-medium">Click anywhere in box or drag and drop file here</p>
            )}
          </div>
        </div>
      </div>

      {/* 2. Essential-Only User Profile Data Section */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <User className="w-5 h-5 text-sky-400" />
          Essential Candidate Profile Info
        </h3>

        {isEditing ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="text-slate-400 text-[11px] font-medium flex items-center gap-1.5 mb-1">
                <User className="w-3.5 h-3.5 text-sky-400" /> Full Name
              </label>
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-sky-400"
              />
            </div>

            <div>
              <label className="text-slate-400 text-[11px] font-medium flex items-center gap-1.5 mb-1">
                <Mail className="w-3.5 h-3.5 text-sky-400" /> Email Address
              </label>
              <input
                type="email"
                value={editedEmail}
                onChange={(e) => setEditedEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-sky-400"
              />
            </div>

            <div>
              <label className="text-slate-400 text-[11px] font-medium flex items-center gap-1.5 mb-1">
                <Phone className="w-3.5 h-3.5 text-sky-400" /> Phone Number
              </label>
              <input
                type="text"
                value={editedPhone}
                onChange={(e) => setEditedPhone(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-sky-400"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center space-x-3">
              <User className="w-5 h-5 text-sky-400 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Full Name</p>
                <p className="font-bold text-white text-sm">{profile.name}</p>
              </div>
            </div>

            <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center space-x-3">
              <Mail className="w-5 h-5 text-sky-400 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Email Address</p>
                <p className="font-bold text-white text-xs">{profile.email}</p>
              </div>
            </div>

            <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center space-x-3">
              <Phone className="w-5 h-5 text-sky-400 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Phone Number</p>
                <p className="font-bold text-white text-xs">{profile.phone || '+91 (555) 019-2831'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Preferred Target Roles (Restricted Predefined Dropdown Selection Only) */}
        <div className="space-y-2 pt-2 border-t border-slate-800/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-xs text-slate-300 font-semibold flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-emerald-400" />
              Preferred Target Roles (Select from list)
            </label>

            {/* Select Dropdown strictly allowing choice from predefined list */}
            <div className="flex items-center space-x-2">
              <select
                value={selectedRoleOption}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val) {
                    handleAddSelectedRole(val);
                  }
                }}
                className="bg-slate-900 border border-slate-700 text-xs text-white px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-400 w-64"
              >
                <option value="">-- Choose Target Job Role --</option>
                {availableRolesToSelect.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {roles.map((r, i) => (
              <span
                key={i}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
              >
                <span>{r}</span>
                <button
                  onClick={() => handleRemoveRole(r)}
                  className="text-slate-400 hover:text-red-400 transition"
                  title={`Remove ${r}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Preferred Target Locations (Restricted Predefined Dropdown Selection Only) */}
        <div className="space-y-2 pt-2 border-t border-slate-800/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-xs text-slate-300 font-semibold flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-sky-400" />
              Target Locations (Select from list)
            </label>

            {/* Select Dropdown strictly allowing choice from predefined list */}
            <div className="flex items-center space-x-2">
              <select
                value={selectedLocationOption}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val) {
                    handleAddSelectedLocation(val);
                  }
                }}
                className="bg-slate-900 border border-slate-700 text-xs text-white px-3 py-2 rounded-xl focus:outline-none focus:border-sky-400 w-64"
              >
                <option value="">-- Choose Target Location --</option>
                {availableLocationsToSelect.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {locations.map((loc, i) => (
              <span
                key={i}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-sky-500/10 text-sky-300 border border-sky-500/20"
              >
                <span>{loc}</span>
                <button
                  onClick={() => handleRemoveLocation(loc)}
                  className="text-slate-400 hover:text-red-400 transition"
                  title={`Remove ${loc}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Save button footer when editing */}
        {isEditing && (
          <button
            onClick={handleSaveProfile}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl text-xs transition shadow-lg flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Essential Profile Changes</span>
          </button>
        )}
      </div>
    </div>
  );
};
