import React from 'react';
import {
  UserCheck,
  Send,
  RefreshCw,
  Zap,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Mail,
  ShieldCheck,
  Activity,
  Info,
  ArrowUpRight,
  Phone
} from 'lucide-react';
import type { DashboardStats, Application, Job } from '../types';
import { getGmailComposeUrl, isEmailVerified } from '../utils/gmail';

interface DashboardViewProps {
  stats: DashboardStats;
  applications: Application[];
  jobs: Job[];
  onTriggerScrape: () => void;
  onNavigate: (tab: string) => void;
  onBulkAutoSend?: (jobIds?: number[]) => void;
  isLoading: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  applications,
  jobs,
  onTriggerScrape,
  onNavigate,
  onBulkAutoSend,
  isLoading,
}) => {
  const verifiedCount = stats.verified_contacts ?? jobs.filter(j => isEmailVerified(j)).length;
  const unverifiedCount = stats.unverified_contacts ?? jobs.filter(j => !isEmailVerified(j) && Boolean(j.recruiter_email)).length;
  const unableToVerifyCount = stats.unable_to_verify_contacts ?? jobs.filter(j => !j.recruiter_email || j.recruiter_status === 'Unable to Verify').length;
  const emailsSentCount = stats.emails_sent ?? applications.length;

  const kpiCards = [
    {
      label: 'HR Contacts Found',
      value: jobs.length || stats.jobs_found || 0,
      icon: UserCheck,
      color: '#38bdf8',
      bg: 'rgba(56, 189, 248, 0.1)',
      accent: '#38bdf8',
      desc: 'Total recruiter records discovered',
    },
    {
      label: 'Verified Contacts',
      value: verifiedCount,
      icon: CheckCircle2,
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.1)',
      accent: '#10b981',
      desc: 'Authentic verified HR mailboxes',
    },
    {
      label: 'Unverified Contacts',
      value: unverifiedCount,
      icon: AlertCircle,
      color: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.1)',
      accent: '#f59e0b',
      desc: 'Discovered emails pending identity check',
    },
    {
      label: 'Unable to Verify',
      value: unableToVerifyCount,
      icon: XCircle,
      color: '#94a3b8',
      bg: 'rgba(148, 163, 184, 0.1)',
      accent: '#64748b',
      desc: 'No direct contact email found',
    },
    {
      label: 'Outreach Sent',
      value: emailsSentCount,
      icon: Send,
      color: '#8b5cf6',
      bg: 'rgba(139, 92, 246, 0.1)',
      accent: '#8b5cf6',
      desc: 'Total emails delivered to HRs',
    },
  ];

  const getLogIcon = (type: string) => {
    if (type === 'SUCCESS') return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
    if (type === 'WARNING') return <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
    return <Info className="w-3.5 h-3.5 text-sky-400 shrink-0" />;
  };

  const getLogBorderColor = (type: string) => {
    if (type === 'SUCCESS') return '#10b981';
    if (type === 'WARNING') return '#f59e0b';
    return '#0ea5e9';
  };

  return (
    <div className="space-y-6 page-enter">

      {/* ── Welcome Banner ── */}
      <div
        className="relative overflow-hidden p-6 rounded-2xl"
        style={{
          background: 'linear-gradient(135deg, rgba(12,16,24,0.95) 0%, rgba(7,11,28,0.9) 50%, rgba(17,10,35,0.85) 100%)',
          border: '1px solid rgba(56,189,248,0.12)',
          boxShadow: '0 20px 48px -12px rgba(0,0,0,0.5)',
        }}
      >
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(56,189,248,0.15)' }}
              >
                <Zap className="w-3.5 h-3.5 text-sky-400" />
              </div>
              <span className="text-[11px] font-bold text-sky-400 tracking-widest uppercase">
                Authentic HR Contact Scraper Active
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-glow" />
            </div>
            <h2
              className="text-2xl font-black text-white"
              style={{ fontFamily: 'Plus Jakarta Sans, Inter, sans-serif', letterSpacing: '-0.03em' }}
            >
              HR Contacts &amp; Outreach Hub
            </h2>
            <p className="text-sm text-slate-400 mt-1.5 max-w-lg leading-relaxed">
              Search for authentic HR/recruiter contacts, verify their details, and send customized cold outreach emails with attached resumes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {onBulkAutoSend && (
              <button
                onClick={() => onBulkAutoSend()}
                className="flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl transition-all duration-200 shadow-lg active:scale-95 cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  boxShadow: '0 8px 24px -4px rgba(16,185,129,0.4)',
                  color: '#ffffff',
                }}
              >
                <Zap className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                Auto-Apply (≥70% Match)
              </button>
            )}

            <button
              onClick={onTriggerScrape}
              disabled={isLoading}
              className="btn-primary text-xs"
              style={{
                background: 'linear-gradient(135deg, #0369a1, #0ea5e9)',
                boxShadow: '0 8px 24px -4px rgba(14,165,233,0.5)',
              }}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Searching...' : 'Search HR Contacts'}
            </button>

            <button
              onClick={() => onNavigate('mail')}
              className="flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all duration-200"
              style={{
                background: 'rgba(99,102,241,0.15)',
                border: '1px solid rgba(99,102,241,0.3)',
                color: '#a78bfa',
              }}
            >
              <Mail className="w-3.5 h-3.5" />
              Open Mail Composer
            </button>
          </div>
        </div>
      </div>

      {/* ── KPI Stats Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {kpiCards.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="glass-panel rounded-xl p-4 flex flex-col justify-between transition-all duration-300 cursor-default group"
              style={{
                borderTop: `2px solid ${kpi.accent}`,
                border: `1px solid rgba(255,255,255,0.06)`,
                borderTopColor: kpi.accent,
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = `0 16px 32px -8px rgba(0,0,0,0.4), 0 0 0 1px ${kpi.accent}22`;
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = '';
                (e.currentTarget as HTMLElement).style.transform = '';
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  {kpi.label}
                </span>
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
                  style={{ background: kpi.bg }}
                >
                  <Icon className="w-3.5 h-3.5" style={{ color: kpi.color }} />
                </div>
              </div>
              <div>
                <h3
                  className="text-2xl font-black text-white"
                  style={{ fontFamily: 'Plus Jakarta Sans, Inter, sans-serif', letterSpacing: '-0.03em' }}
                >
                  {kpi.value}
                </h3>
                <p className="text-[10px] text-slate-500 mt-1">{kpi.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Discovered HR Contacts Table + System Logs ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Authentic HR Contacts Overview */}
        <div
          className="lg:col-span-2 glass-panel p-6 rounded-2xl"
          style={{ border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Authentic Discovered HR Contacts
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Real contact information collected from legitimate sources</p>
            </div>

            <button
              onClick={() => onNavigate('hr-contacts')}
              className="text-[11px] text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1 transition-colors"
            >
              View All HR Contacts
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {jobs.length === 0 ? (
            <div className="text-center py-12">
              <UserCheck className="w-8 h-8 text-slate-700 mx-auto mb-3" />
              <p className="text-sm text-slate-500">No HR contacts discovered yet.</p>
              <p className="text-xs text-slate-600 mt-1">Click 'Search HR Contacts' to begin scraping.</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-2">
              <table className="w-full text-left text-xs min-w-[500px]">
                <thead>
                  <tr
                    style={{ background: 'rgba(15, 23, 42, 0.6)' }}
                    className="text-slate-500 uppercase text-[10px] tracking-wider"
                  >
                    <th className="py-2.5 px-3 rounded-l-lg font-semibold">Company</th>
                    <th className="py-2.5 px-3 font-semibold">HR Recruiter</th>
                    <th className="py-2.5 px-3 font-semibold">Email</th>
                    <th className="py-2.5 px-3 font-semibold">Status</th>
                    <th className="py-2.5 px-3 rounded-r-lg font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: 'rgba(30,41,59,0.4)' }}>
                  {jobs.slice(0, 6).map((j) => (
                    <tr key={j.id} className="table-row-hover">
                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-100 block">{j.company}</span>
                        <span className="text-[10px] text-slate-500 truncate max-w-[120px] block">{j.title}</span>
                      </td>
                      <td className="py-3 px-3 text-slate-300 font-medium">
                        {j.recruiter_name || 'Hiring Manager'}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex flex-col gap-0.5">
                          {isEmailVerified(j) && j.recruiter_email ? (
                            <a
                              href={getGmailComposeUrl(j.recruiter_email, `Job Application: ${j.title || 'Technical Role'} at ${j.company}`)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-mono text-emerald-400 hover:text-emerald-300 hover:underline text-[11px] truncate max-w-[150px] inline-flex items-center gap-1"
                              title={`Open Gmail compose to ${j.recruiter_email} (Hunter.io Verified)`}
                            >
                              <Mail className="w-2.5 h-2.5 shrink-0" />
                              <span className="truncate">{j.recruiter_email}</span>
                            </a>
                          ) : (
                            <span className="text-slate-500 italic text-[11px]">No verified email</span>
                          )}
                          {j.recruiter_phone && (
                            <span className="text-[10px] font-mono text-emerald-400/80 flex items-center gap-1">
                              <Phone className="w-2.5 h-2.5 text-emerald-400" />
                              {j.recruiter_phone}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        {isEmailVerified(j) ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="w-2.5 h-2.5" /> Hunter Verified
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 bg-slate-800 text-slate-500 border border-slate-700">
                            <XCircle className="w-2.5 h-2.5" /> Unverified
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => onNavigate('mail')}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-sky-400 hover:text-white transition"
                          style={{ background: 'rgba(14,165,233,0.12)', border: '1px solid rgba(14,165,233,0.3)' }}
                        >
                          Outreach
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* System Activity Log */}
        <div
          className="glass-panel p-6 rounded-2xl"
          style={{ border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-400" />
            Live Scraper &amp; Activity Log
          </h3>

          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {(stats.recent_logs || []).length > 0 ? (
              stats.recent_logs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl text-xs flex gap-2.5"
                  style={{
                    background: 'rgba(12, 16, 24, 0.8)',
                    border: '1px solid rgba(30,41,59,0.6)',
                    borderLeft: `3px solid ${getLogBorderColor(log.log_type)}`,
                  }}
                >
                  <div className="mt-0.5">{getLogIcon(log.log_type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <span
                        className="font-bold text-[11px] truncate"
                        style={{ color: getLogBorderColor(log.log_type) }}
                      >
                        {log.title}
                      </span>
                      <span className="text-[10px] text-slate-600 shrink-0">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">{log.message}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-slate-600 py-10 text-xs">
                <Activity className="w-7 h-7 mx-auto mb-2 opacity-30" />
                No recent system events.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
