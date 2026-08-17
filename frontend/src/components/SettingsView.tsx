import React, { useState } from 'react';
import { 
  Settings, 
  Zap, 
  Mail, 
  Save, 
  CheckCircle2 
} from 'lucide-react';
import type { AppSettings } from '../types';

interface SettingsViewProps {
  settings: AppSettings;
  onSaveSettings: (updated: Partial<AppSettings>) => Promise<void>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ settings, onSaveSettings }) => {
  const [autoApply, setAutoApply] = useState(settings.auto_apply_enabled || false);
  const [maxApps, setMaxApps] = useState(settings.max_apps_per_day || 15);
  const [matchThreshold, setMatchThreshold] = useState(settings.match_threshold || 70);
  const [minSalary, setMinSalary] = useState(settings.min_salary || 1200000);
  const [minSalaryPeriod, setMinSalaryPeriod] = useState<'month' | 'year'>(settings.min_salary_period || 'year');
  const [remoteOnly, setRemoteOnly] = useState(settings.remote_only || false);
  const [internshipOnly, setInternshipOnly] = useState(settings.internship_only || false);
  const [smtpHost, setSmtpHost] = useState(settings.smtp_host || 'smtp.gmail.com');
  const [smtpPort, setSmtpPort] = useState(settings.smtp_port || 587);
  const [senderEmail, setSenderEmail] = useState(settings.sender_email || '');
  const [senderPassword, setSenderPassword] = useState(settings.sender_password || '');
  const [openaiKey, setOpenaiKey] = useState(settings.openai_api_key || '');
  const [allowProfileScraping, setAllowProfileScraping] = useState(settings.allow_profile_scraping !== false);
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSaveSettings({
      auto_apply_enabled: autoApply,
      max_apps_per_day: Number(maxApps),
      match_threshold: Number(matchThreshold),
      min_salary: Number(minSalary),
      min_salary_period: minSalaryPeriod,
      remote_only: remoteOnly,
      internship_only: internshipOnly,
      allow_profile_scraping: allowProfileScraping,
      smtp_host: smtpHost,
      smtp_port: Number(smtpPort),
      sender_email: senderEmail,
      sender_password: senderPassword || undefined,
      openai_api_key: openaiKey || undefined
    });
    setIsSaved(true);

    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Top Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-sky-400" />
            User Preferences & Automation Controls
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure daily dispatch limits, AI match threshold %, email dispatch credentials, and target roles.
          </p>
        </div>

        <button
          type="submit"
          className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-4 py-2 rounded-xl text-xs transition shadow-md glow-emerald"
        >
          {isSaved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span>{isSaved ? 'Settings Saved!' : 'Save Controls'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Automation Controls */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Zap className="w-4 h-4 text-emerald-400" />
            Auto-Apply Engine Parameters
          </h3>

          <div className="flex items-center justify-between p-3 bg-slate-900/60 rounded-xl border border-slate-800">
            <div>
              <p className="text-xs font-bold text-white">Autonomous Dispatch Mode</p>
              <p className="text-[11px] text-slate-400">Automatically send emails for jobs exceeding match threshold</p>
            </div>
            <button
              type="button"
              onClick={() => setAutoApply(!autoApply)}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                autoApply ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            >
              <div className={`bg-white w-4 h-4 rounded-full shadow transform transition-transform ${
                autoApply ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-900/60 rounded-xl border border-slate-800">
            <div>
              <p className="text-xs font-bold text-white">Browser Profile Scraping Permission</p>
              <p className="text-[11px] text-slate-400">Allow headless browser to open LinkedIn profiles to extract HR contacts</p>
            </div>
            <button
              type="button"
              onClick={() => setAllowProfileScraping(!allowProfileScraping)}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                allowProfileScraping ? 'bg-sky-500' : 'bg-slate-700'
              }`}
            >
              <div className={`bg-white w-4 h-4 rounded-full shadow transform transition-transform ${
                allowProfileScraping ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-400 font-medium">Max Applications / Day</label>
              <input
                type="number"
                min="1"
                max="50"
                value={maxApps}
                onChange={(e) => setMaxApps(Number(e.target.value))}
                className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
              />
            </div>

            <div>
              <label className="text-slate-400 font-medium">Auto-Apply Match Threshold %</label>
              <input
                type="number"
                min="50"
                max="95"
                value={matchThreshold}
                onChange={(e) => setMatchThreshold(Number(e.target.value))}
                className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="text-slate-400 font-medium">Minimum Salary Floor</label>
                <select
                  value={minSalaryPeriod}
                  onChange={(e) => setMinSalaryPeriod(e.target.value as any)}
                  className="bg-slate-900 border border-slate-700 text-xs text-indigo-400 px-2 py-0.5 rounded-lg focus:outline-none"
                >
                  <option value="year">Per Year (LPA)</option>
                  <option value="month">Per Month (₹/mo)</option>
                </select>
              </div>
              <input
                type="number"
                step={minSalaryPeriod === 'month' ? 5000 : 50000}
                placeholder={minSalaryPeriod === 'month' ? "e.g. 100000 for ₹1 Lakh/mo" : "e.g. 1200000 for ₹12 LPA"}
                value={minSalary}
                onChange={(e) => setMinSalary(Number(e.target.value))}
                className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white text-xs"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                {minSalaryPeriod === 'month' ? (
                  <>Floor: ₹{(minSalary || 0).toLocaleString('en-IN')} / month (₹{((minSalary * 12) / 100000).toFixed(1)} LPA)</>
                ) : (
                  <>Floor: ₹{(minSalary || 0).toLocaleString('en-IN')} / year ({(minSalary / 100000).toFixed(1)} LPA • ₹{Math.round((minSalary || 0) / 12).toLocaleString('en-IN')}/mo)</>
                )}
              </p>
            </div>



            <div className="flex flex-col justify-end space-y-2 pt-2">
              <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remoteOnly}
                  onChange={(e) => setRemoteOnly(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-sky-400"
                />
                <span>Remote Positions Only</span>
              </label>

              <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={internshipOnly}
                  onChange={(e) => setInternshipOnly(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-sky-400"
                />
                <span>Internships Only</span>
              </label>
            </div>
          </div>
        </div>

        {/* Email & API Credentials */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Mail className="w-4 h-4 text-sky-400" />
            Email Dispatcher & AI Credentials
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400">Sender Email Address</label>
              <input
                type="email"
                placeholder="your.email@gmail.com"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400">SMTP Host</label>
                <input
                  type="text"
                  value={smtpHost}
                  onChange={(e) => setSmtpHost(e.target.value)}
                  className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400">SMTP Port</label>
                <input
                  type="number"
                  value={smtpPort}
                  onChange={(e) => setSmtpPort(Number(e.target.value))}
                  className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400">App Password / SMTP Password</label>
              <input
                type="password"
                placeholder="••••••••••••••••"
                value={senderPassword}
                onChange={(e) => setSenderPassword(e.target.value)}
                className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
              />
            </div>

            <div>
              <label className="text-slate-400">OpenAI API Key (Optional)</label>
              <input
                type="password"
                placeholder="sk-proj-..."
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};
