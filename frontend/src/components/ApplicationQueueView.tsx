import React, { useState } from 'react';
import { 
  Send, 
  ChevronRight,
  FileText,
  Mail
} from 'lucide-react';
import type { Application } from '../types';
import { getGmailComposeUrl } from '../utils/gmail';

interface ApplicationQueueViewProps {
  applications: Application[];
  onUpdateStatus: (appId: number, status: string) => Promise<void>;
  onApproveAndSend: (appId: number) => Promise<void>;
  isLoading: boolean;
}

export const ApplicationQueueView: React.FC<ApplicationQueueViewProps> = ({
  applications,
  onUpdateStatus,
  onApproveAndSend,
  isLoading
}) => {
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredApps = applications.filter((app) => {
    if (statusFilter === 'All') return true;
    return app.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Send className="w-5 h-5 text-emerald-400" />
            Application Queue & Dispatch Tracker
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Track application statuses, view generated emails & cover letters, and execute 1-click manual approvals.
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs">
          {['All', 'Pending', 'Applied', 'Shortlisted', 'Interview', 'Offer', 'Rejected'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                statusFilter === st ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table & Preview Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Applications Table */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 bg-slate-900/80 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3">Company & Role</th>
                  <th className="py-3 px-3">Recruiter Email</th>
                  <th className="py-3 px-3">Match</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredApps.map((app) => (
                  <tr
                    key={app.id}
                    onClick={() => setSelectedApp(app)}
                    className={`hover:bg-slate-800/50 transition cursor-pointer ${
                      selectedApp?.id === app.id ? 'bg-slate-800/80' : ''
                    }`}
                  >
                    <td className="py-3.5 px-3">
                      <p className="font-bold text-white text-sm">{app.company}</p>
                      <p className="text-slate-400 text-xs">{app.role}</p>
                    </td>

                    <td className="py-3.5 px-3 text-slate-300">
                      {app.recruiter_email ? (
                        <a
                          href={getGmailComposeUrl(app.recruiter_email, `Application for ${app.role} at ${app.company}`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-sky-300 hover:text-sky-200 underline decoration-sky-400/40 hover:decoration-sky-300 font-mono text-[11px] inline-flex items-center gap-1.5"
                          title={`Open Gmail compose to ${app.recruiter_email}`}
                        >
                          <Mail className="w-3 h-3 text-sky-400 shrink-0" />
                          <span>{app.recruiter_email}</span>
                        </a>
                      ) : (
                        <span className="text-amber-400 italic text-[11px]">Manual Review Needed</span>
                      )}
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="bg-sky-500/10 text-sky-400 font-bold px-2 py-1 rounded text-[11px]">
                        {app.match_score || 90}%
                      </span>
                    </td>

                    <td className="py-3.5 px-3">
                      <select
                        value={app.status}
                        onChange={(e) => {
                          e.stopPropagation();
                          onUpdateStatus(app.id, e.target.value);
                        }}
                        className={`text-[10px] font-bold uppercase px-2 py-1 rounded border bg-slate-900 focus:outline-none ${
                          app.status === 'Applied' ? 'text-emerald-400 border-emerald-500/30' :
                          app.status === 'Interview' ? 'text-amber-400 border-amber-500/30' :
                          app.status === 'Offer' ? 'text-pink-400 border-pink-500/30' :
                          app.status === 'Pending' ? 'text-sky-400 border-sky-500/30' :
                          'text-slate-400 border-slate-700'
                        }`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Applied">Applied</option>
                        <option value="Shortlisted">Shortlisted</option>
                        <option value="Interview">Interview</option>
                        <option value="Offer">Offer</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </td>

                    <td className="py-3.5 px-3 text-right">
                      {app.status === 'Pending' ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onApproveAndSend(app.job_id);
                          }}
                          disabled={isLoading}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-3 py-1.5 rounded-lg text-xs transition shadow-md"
                        >
                          Approve & Send
                        </button>
                      ) : (
                        <button
                          onClick={() => setSelectedApp(app)}
                          className="text-sky-400 hover:text-sky-300 font-medium text-xs flex items-center gap-1 ml-auto"
                        >
                          <span>View Preview</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Detailed Application & Email Body Preview */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          {selectedApp ? (
            <>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white">{selectedApp.company}</h3>
                  <p className="text-xs text-sky-400">{selectedApp.role}</p>
                </div>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                  Resume v1.0 Attached
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">Email Subject</p>
                  <p className="text-white font-medium mt-0.5 p-2 bg-slate-900 rounded-lg border border-slate-800">
                    {selectedApp.email_subject || `Application for ${selectedApp.role}`}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">Generated Email Body</p>
                  <div className="mt-0.5 p-3 bg-slate-900 rounded-lg border border-slate-800 text-slate-300 leading-relaxed font-sans text-[11px] whitespace-pre-line max-h-52 overflow-y-auto">
                    {selectedApp.email_body || 'Email content generated for candidate review.'}
                  </div>
                </div>

                <div>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">Custom Cover Letter</p>
                  <div className="mt-0.5 p-3 bg-slate-900 rounded-lg border border-slate-800 text-slate-300 leading-relaxed font-sans text-[11px] whitespace-pre-line max-h-40 overflow-y-auto">
                    {selectedApp.cover_letter || 'Cover letter customized for company position.'}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-16 text-slate-500 text-xs">
              <FileText className="w-8 h-8 mx-auto text-slate-600 mb-2" />
              Select an application record to preview generated email content & cover letter.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
