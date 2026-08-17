import React from 'react';
import { 
  Briefcase, 
  Send, 
  Clock, 
  Calendar, 
  Award, 
  TrendingUp, 
  RefreshCw, 
  Zap, 
  ArrowUpRight,
  ShieldCheck,
  Building2,
  FileCheck
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  BarChart, 
  Bar, 
  Cell 
} from 'recharts';
import type { DashboardStats, Application, Job } from '../types';

interface DashboardViewProps {
  stats: DashboardStats;
  applications: Application[];
  jobs: Job[];
  onTriggerScrape: () => void;
  onNavigate: (tab: string) => void;
  isLoading: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  applications,
  jobs,
  onTriggerScrape,
  onNavigate,
  isLoading
}) => {
  // Dynamically compute 7-day application timeline from real application records
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  
  const timelineData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(today.getDate() - (6 - i));
    const dayName = daysOfWeek[d.getDay()];
    const dateStr = d.toISOString().split('T')[0];
    
    const dayApps = (applications || []).filter(app => {
      if (!app.applied_at) return false;
      return app.applied_at.startsWith(dateStr);
    });
    
    return {
      day: dayName,
      applications: dayApps.length,
      views: dayApps.filter(a => a.status === 'Viewed' || a.status === 'Shortlisted').length,
      interviews: dayApps.filter(a => a.status === 'Interview' || a.status === 'Offer').length,
    };
  });

  // Calculate real funnel metrics from live database statistics
  const funnelData = [
    { name: 'Crawled', count: jobs.length || stats.jobs_found || 0, color: '#38bdf8' },
    { name: 'Applied', count: stats.jobs_applied ?? 0, color: '#10b981' },
    { name: 'Viewed', count: stats.shortlisted ?? 0, color: '#8b5cf6' },
    { name: 'Interview', count: stats.interviews ?? 0, color: '#f59e0b' },
    { name: 'Offers', count: stats.offers ?? 0, color: '#ec4899' },
  ];


  return (
    <div className="space-y-6">
      {/* Top Welcome & Quick Actions Bar */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-brand-950/40">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-sky-400 mb-1">
            <Zap className="w-4 h-4 text-sky-400" />
            <span>AI CAREER COPILOT ACTIVE</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">Application Command Hub</h2>
          <p className="text-sm text-slate-400 mt-1">
            Real-time job matching, verified recruiter contact detection, and automated application tracking.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onTriggerScrape}
            disabled={isLoading}
            className="flex items-center space-x-2 bg-gradient-to-r from-sky-500 to-brand-600 hover:from-sky-400 hover:to-brand-500 text-white font-medium px-4 py-2.5 rounded-xl transition-all shadow-lg glow-blue text-xs"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Crawling Portals...' : 'Scrape Jobs Now'}</span>
          </button>
          <button
            onClick={() => onNavigate('resume')}
            className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium px-4 py-2.5 rounded-xl border border-slate-700 text-xs transition"
          >
            <FileCheck className="w-4 h-4 text-emerald-400" />
            <span>Upload Resume</span>
          </button>
          <button
            onClick={() => onNavigate('applications')}
            className="flex items-center space-x-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 font-medium px-4 py-2.5 rounded-xl border border-emerald-500/30 text-xs transition"
          >
            <Send className="w-4 h-4 text-emerald-400" />
            <span>View Queue ({stats.pending_approval || 0})</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Jobs Found', value: stats.jobs_found || jobs.length, icon: Briefcase, color: 'text-sky-400', bg: 'bg-sky-500/10' },
          { label: 'Applications Sent', value: stats.jobs_applied, icon: Send, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Pending Approval', value: stats.pending_approval, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { label: 'Response Rate', value: `${stats.response_rate_pct}%`, icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-500/10' },
          { label: 'Interviews', value: stats.interviews, icon: Calendar, color: 'text-sky-300', bg: 'bg-sky-400/10' },
          { label: 'Offers Received', value: stats.offers, icon: Award, color: 'text-pink-400', bg: 'bg-pink-500/10' },
        ].map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="glass-panel p-4 rounded-xl border border-slate-800 glass-panel-hover flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-400">{kpi.label}</span>
                <div className={`p-2 rounded-lg ${kpi.bg}`}>
                  <Icon className={`w-4 h-4 ${kpi.color}`} />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-2xl font-bold text-white">{kpi.value}</h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Charts & Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Applications Over Time Line Chart */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-sky-400" />
                Applications & Outreach Velocity
              </h3>
              <p className="text-xs text-slate-400">Weekly breakdown of applications dispatched vs candidate profile views</p>
            </div>
            <span className="text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded-full border border-slate-700">
              Last 7 Days
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData}>

                <defs>
                  <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0c8de9" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#0c8de9" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#1f293d', borderRadius: '12px', color: '#fff' }}
                />
                <Area type="monotone" dataKey="applications" stroke="#0c8de9" strokeWidth={2} fillOpacity={1} fill="url(#colorApps)" />
                <Area type="monotone" dataKey="views" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorViews)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Application Conversion Funnel */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Conversion Funnel
          </h3>
          <p className="text-xs text-slate-400 mb-4">Stage progress from search to offer</p>
          
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={funnelData} margin={{ left: -10, right: 10 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#1f293d', borderRadius: '8px' }} />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Applications & Live Crawler Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Applications Table Snippet */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-sky-400" />
              Recent Application Dispatches
            </h3>
            <button 
              onClick={() => onNavigate('applications')}
              className="text-xs text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 bg-slate-900/60 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-2.5 px-3 rounded-l-lg">Company</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Match</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 rounded-r-lg">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {applications.slice(0, 5).map((app) => (
                  <tr key={app.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3 font-semibold text-white">{app.company}</td>
                    <td className="py-3 px-3 text-slate-300">{app.role}</td>
                    <td className="py-3 px-3">
                      <span className="bg-sky-500/10 text-sky-400 font-bold px-2 py-0.5 rounded text-[11px]">
                        {app.match_score || 92}%
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        app.status === 'Applied' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        app.status === 'Interview' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        app.status === 'Pending' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-400 text-[11px]">
                      {new Date(app.applied_at || Date.now()).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live System Activity Logs */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-400" />
            Live System Activity Log
          </h3>

          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {(stats.recent_logs || []).length > 0 ? (
              stats.recent_logs.map((log) => (
                <div key={log.id} className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-semibold ${
                      log.log_type === 'SUCCESS' ? 'text-emerald-400' :
                      log.log_type === 'WARNING' ? 'text-amber-400' : 'text-sky-400'
                    }`}>
                      {log.title}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-tight">{log.message}</p>
                </div>
              ))
            ) : (
              <div className="text-center text-slate-500 py-8 text-xs">
                No recent system log events.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
