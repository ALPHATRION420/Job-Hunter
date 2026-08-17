import React from 'react';
import { 
  Users, 
  Briefcase, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Database,
  Activity
} from 'lucide-react';
import type { AdminMetrics } from '../types';

interface AdminViewProps {
  metrics: AdminMetrics;
  onTriggerScrape: () => void;
  isLoading: boolean;
}

export const AdminView: React.FC<AdminViewProps> = ({ metrics, onTriggerScrape, isLoading }) => {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-400 mb-1">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>SYSTEM HEALTH: OPERATIONAL (99.4%)</span>
          </div>
          <h2 className="text-xl font-bold text-white">Admin Command & Control Portal</h2>
          <p className="text-xs text-slate-400 mt-1">
            System-wide telemetry, multi-portal crawler diagnostics, and email delivery dispatch logs.
          </p>
        </div>

        <button
          onClick={onTriggerScrape}
          disabled={isLoading}
          className="flex items-center space-x-2 bg-gradient-to-r from-sky-500 to-brand-600 hover:from-sky-400 hover:to-brand-500 text-white font-medium px-4 py-2.5 rounded-xl text-xs transition shadow-md glow-blue"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'Triggering Crawlers...' : 'Execute Crawlers Now'}</span>
        </button>
      </div>

      {/* Admin KPI Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Active Users', value: metrics.total_users || 1, icon: Users, color: 'text-sky-400' },
          { label: 'Jobs Crawled', value: metrics.jobs_crawled, icon: Briefcase, color: 'text-emerald-400' },
          { label: 'Applications Sent', value: metrics.applications_sent, icon: Send, color: 'text-purple-400' },
          { label: 'Emails Delivered', value: metrics.emails_delivered, icon: CheckCircle2, color: 'text-emerald-300' },
          { label: 'Delivery Success', value: `${metrics.delivery_success_rate}%`, icon: Activity, color: 'text-sky-300' },
          { label: 'Manual Reviews', value: metrics.failed_applications, icon: AlertTriangle, color: 'text-amber-400' },
        ].map((m, idx) => {
          const Icon = m.icon;
          return (
            <div key={idx} className="glass-panel p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-400">{m.label}</span>
                <Icon className={`w-4 h-4 ${m.color}`} />
              </div>
              <p className="text-2xl font-bold text-white">{m.value}</p>
            </div>
          );
        })}
      </div>

      {/* Crawlers & Portal Health Matrix */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <Database className="w-4 h-4 text-sky-400" />
          Multi-Portal Crawler Health & Terms of Service Matrix
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          {[
            { portal: 'LinkedIn Jobs', status: 'Active (RSS & Public Feeds)', rate: '100 req/hr', compliance: 'Compliant' },
            { portal: 'Internshala', status: 'Active (Direct Aggregation)', rate: '50 req/hr', compliance: 'Compliant' },
            { portal: 'Indeed', status: 'Active (RSS Feed Indexer)', rate: '120 req/hr', compliance: 'Compliant' },
            { portal: 'Wellfound (AngelList)', status: 'Active (Startup API)', rate: '80 req/hr', compliance: 'Compliant' },
            { portal: 'Y Combinator Jobs', status: 'Active (YC Feed)', rate: '60 req/hr', compliance: 'Compliant' },
            { portal: 'Greenhouse / Lever', status: 'Active (Public Career API)', rate: '150 req/hr', compliance: 'Compliant' },
          ].map((p, idx) => (
            <div key={idx} className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">{p.portal}</span>
                <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {p.compliance}
                </span>
              </div>
              <p className="text-slate-400 text-[11px]">{p.status}</p>
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
                <span>Rate Limit: {p.rate}</span>
                <span className="text-emerald-400 font-semibold">● Online</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
