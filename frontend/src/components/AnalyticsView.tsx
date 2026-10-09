import React from 'react';
import {
  BarChart3,
  Target,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  PieChart as PieIcon
} from 'lucide-react';
import {
  ResponsiveContainer,
  Pie,
  Cell,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  PieChart as RechartsPieChart,
  Tooltip,
} from 'recharts';
import type { DashboardStats, Job, UserProfile } from '../types';

interface AnalyticsViewProps {
  stats: DashboardStats;
  jobs: Job[];
  profile: UserProfile;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div
      className="rounded-xl p-3 text-xs"
      style={{
        background: 'rgba(8, 12, 22, 0.98)',
        border: '1px solid rgba(30,41,59,0.9)',
        boxShadow: '0 16px 32px -8px rgba(0,0,0,0.7)',
      }}
    >
      <p className="text-slate-400 mb-2 font-semibold">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="font-bold" style={{ color: p.color || p.fill }}>
          {p.name || 'Value'}: {p.value}
        </p>
      ))}
    </div>
  );
};

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ stats, jobs, profile }) => {
  // Portal distribution
  const portalCounts: Record<string, number> = {};
  (jobs || []).forEach(j => {
    const portal = j.source_portal || 'Direct Crawl';
    portalCounts[portal] = (portalCounts[portal] || 0) + 1;
  });

  const sortedPortals = Object.entries(portalCounts).sort((a, b) => b[1] - a[1]);
  const total = jobs.length || 1;
  const colors = ['#38bdf8', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b'];

  let portalYieldData: Array<{ name: string; value: number; color: string }> = [];
  if (sortedPortals.length === 0) {
    portalYieldData = [{ name: 'Direct Crawl', value: 100, color: '#38bdf8' }];
  } else {
    const top5 = sortedPortals.slice(0, 5);
    const othersCount = sortedPortals.slice(5).reduce((acc, curr) => acc + curr[1], 0);
    portalYieldData = [
      ...top5.map(([name, count], idx) => ({
        name,
        value: Math.round((count / total) * 100),
        color: colors[idx],
      })),
      ...(othersCount > 0 ? [{ name: 'Others', value: Math.round((othersCount / total) * 100), color: colors[5] }] : []),
    ];
  }

  // Radar chart data
  const candidateSkills = profile?.skills?.length ? profile.skills.slice(0, 6) : ['Python', 'React', 'FastAPI', 'PostgreSQL', 'Docker', 'Git'];
  const skillRadarData = candidateSkills.map((skill) => {
    const matchingJobs = jobs.filter(j =>
      (j.required_skills || []).some(s => s.toLowerCase().includes(skill.toLowerCase())) ||
      j.title.toLowerCase().includes(skill.toLowerCase()) ||
      j.description.toLowerCase().includes(skill.toLowerCase())
    );
    const matchPct = jobs.length > 0 ? Math.min(100, Math.round((matchingJobs.length / jobs.length) * 100) + 50) : 80;
    return { subject: skill, A: matchPct, fullMark: 100 };
  });

  const verifiedCount = stats.verified_contacts ?? jobs.filter(j => j.recruiter_status === 'Verified').length;
  const unverifiedCount = stats.unverified_contacts ?? jobs.filter(j => j.recruiter_status === 'Unverified').length;
  const sentCount = stats.emails_sent ?? 0;

  // KPI summary metrics
  const kpiMetrics = [
    { label: 'Discovered Contacts', value: jobs.length || stats.jobs_found || 0, color: '#38bdf8', icon: UserCheck, sub: 'total HR records' },
    { label: 'Verified Mailboxes', value: verifiedCount, color: '#10b981', icon: CheckCircle2, sub: 'authentic & active' },
    { label: 'Unverified Contacts', value: unverifiedCount, color: '#f59e0b', icon: AlertCircle, sub: 'pending verification' },
    { label: 'Outreach Emails Sent', value: sentCount, color: '#8b5cf6', icon: Target, sub: 'dispatched from Gmail' },
  ];

  return (
    <div className="space-y-5 page-enter">

      {/* ── Top Banner ── */}
      <div
        className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4"
        style={{ border: '1px solid rgba(255,255,255,0.06)', borderTop: '2px solid #8b5cf6' }}
      >
        <div>
          <h2
            className="text-xl font-black text-white flex items-center gap-2"
            style={{ fontFamily: 'Plus Jakarta Sans, Inter, sans-serif', letterSpacing: '-0.025em' }}
          >
            <BarChart3 className="w-5 h-5 text-violet-400" />
            HR Discovery &amp; Outreach Analytics Hub
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time analytics for authentic HR contacts, verification distributions, and outreach email volume.
          </p>
        </div>

        {/* Quick summary pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
            style={{ background: 'rgba(10,14,24,0.8)', border: '1px solid rgba(30,41,59,0.6)' }}
          >
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            <span className="text-slate-400">Total Contacts:</span>
            <span className="font-bold text-sky-400">{jobs.length}</span>
          </div>
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
            style={{ background: 'rgba(10,14,24,0.8)', border: '1px solid rgba(30,41,59,0.6)' }}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-slate-400">Verified:</span>
            <span className="font-bold text-emerald-400">{verifiedCount}</span>
          </div>
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
            style={{ background: 'rgba(10,14,24,0.8)', border: '1px solid rgba(30,41,59,0.6)' }}
          >
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            <span className="text-slate-400">Emails Sent:</span>
            <span className="font-bold text-purple-400">{sentCount}</span>
          </div>
        </div>
      </div>

      {/* ── KPI Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiMetrics.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div
              key={i}
              className="glass-panel p-4 rounded-xl flex items-center gap-4 transition-all duration-300 group cursor-default"
              style={{ border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110"
                style={{ background: `${kpi.color}15` }}
              >
                <Icon className="w-5 h-5" style={{ color: kpi.color }} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{kpi.label}</p>
                <p className="text-xl font-black text-white font-mono mt-0.5">{kpi.value}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{kpi.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Portal Yield Pie */}
        <div
          className="glass-panel p-6 rounded-2xl"
          style={{ border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-sky-400" />
                Portal &amp; Source Distribution
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Percentage of HR contacts discovered per platform</p>
            </div>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={portalYieldData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {portalYieldData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(6,8,16,0.8)" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-800">
            {portalYieldData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: item.color }} />
                <span className="text-xs text-slate-400 truncate">{item.name}</span>
                <span className="text-xs font-bold text-slate-200 ml-auto">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Skill Competency Radar */}
        <div
          className="glass-panel p-6 rounded-2xl"
          style={{ border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-purple-400" />
              Skill Competency &amp; Demand Radar
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Candidate skill alignment with discovered HR job requisitions</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="72%" data={skillRadarData}>
                <PolarGrid stroke="rgba(30,41,59,0.6)" />
                <PolarAngleAxis
                  dataKey="subject"
                  stroke="#475569"
                  fontSize={11}
                  fontWeight={600}
                  tick={{ fill: '#94a3b8' }}
                />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#1e293b" fontSize={9} tickCount={4} />
                <Radar
                  name="Skill Match"
                  dataKey="A"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  fill="#8b5cf6"
                  fillOpacity={0.25}
                  dot={{ fill: '#8b5cf6', r: 3 }}
                />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
