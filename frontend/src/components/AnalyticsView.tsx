import React from 'react';
import { 
  BarChart3, 
  PieChart, 
  Target
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
  Tooltip
} from 'recharts';
import type { DashboardStats, Job, UserProfile } from '../types';

interface AnalyticsViewProps {
  stats: DashboardStats;
  jobs: Job[];
  profile: UserProfile;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ stats, jobs, profile }) => {
  // Compute real portal distribution from live crawled jobs
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
  } else if (sortedPortals.length <= 5) {
    portalYieldData = sortedPortals.map(([name, count], idx) => ({
      name,
      value: Math.round((count / total) * 100),
      color: colors[idx % colors.length]
    }));
  } else {
    const top5 = sortedPortals.slice(0, 5);
    const othersCount = sortedPortals.slice(5).reduce((acc, curr) => acc + curr[1], 0);
    portalYieldData = [
      ...top5.map(([name, count], idx) => ({
        name,
        value: Math.round((count / total) * 100),
        color: colors[idx]
      })),
      {
        name: 'Other Portals',
        value: Math.round((othersCount / total) * 100),
        color: colors[5]
      }
    ];
  }

  // Compute skill matrix radar from candidate profile skills and live job demands
  const candidateSkills = profile?.skills && profile.skills.length > 0 
    ? profile.skills.slice(0, 6) 
    : ["Python", "React", "FastAPI", "PostgreSQL", "Docker", "Git"];

  const skillRadarData = candidateSkills.map((skill) => {
    const matchingJobs = jobs.filter(j => 
      (j.required_skills || []).some(s => s.toLowerCase().includes(skill.toLowerCase())) ||
      j.title.toLowerCase().includes(skill.toLowerCase()) ||
      j.description.toLowerCase().includes(skill.toLowerCase())
    );
    const matchPct = jobs.length > 0 ? Math.min(100, Math.round((matchingJobs.length / jobs.length) * 100) + 50) : 80;
    return {
      subject: skill,
      A: matchPct,
      fullMark: 100
    };
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-sky-400" />
            Career & Application Analytics Hub
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Detailed metrics on outreach performance, platform yield, response rates ({stats.response_rate_pct || 0}%), and skill market alignment.
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs bg-slate-900/60 p-3 rounded-xl border border-slate-800">
          <div>
            <p className="text-[10px] text-slate-400">Total Crawled</p>
            <p className="font-bold text-sky-400 text-sm">{jobs.length}</p>
          </div>
          <div className="h-6 w-px bg-slate-800" />
          <div>
            <p className="text-[10px] text-slate-400">Sent Applications</p>
            <p className="font-bold text-emerald-400 text-sm">{stats.jobs_applied || 0}</p>
          </div>
        </div>
      </div>

      {/* Grid Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Portal Yield Pie Chart */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-emerald-400" />
              Job Portal Outreach Yield Distribution
            </h3>
            <p className="text-xs text-slate-400 mb-4">Percentage of high-matching opportunities discovered by platform</p>
          </div>

          <div className="w-full">
            <RechartPieChart data={portalYieldData} />
          </div>
        </div>

        {/* Candidate Skill Alignment Radar Chart */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <Target className="w-4 h-4 text-sky-400" />
              Top Matching Skill Competency Matrix
            </h3>
            <p className="text-xs text-slate-400 mb-4">Candidate profile skill score alignment with active employer requisitions</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={skillRadarData}>
                <PolarGrid stroke="#1f293d" />
                <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={11} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" />
                <Radar name="Candidate" dataKey="A" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper pie rendering
const RechartPieChart: React.FC<{ data: any[] }> = ({ data }) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full py-2">
      <div className="w-44 h-44 shrink-0 mx-auto sm:mx-0">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsPieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={42} outerRadius={68} paddingAngle={4} dataKey="value">
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#1f293d', borderRadius: '8px', fontSize: '11px' }} />
          </RechartsPieChart>
        </ResponsiveContainer>
      </div>

      <div className="flex-1 w-full max-h-48 overflow-y-auto pr-2 space-y-2 text-xs">
        {data.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-slate-900/40 border border-slate-800/60">
            <div className="flex items-center space-x-2 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-slate-300 font-medium truncate max-w-[140px]">{item.name}</span>
            </div>
            <span className="text-sky-400 font-bold shrink-0">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

