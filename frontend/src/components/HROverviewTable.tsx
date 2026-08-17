import { useState } from 'react';
import type { Job } from '../types';
import { 
  Building2, 
  Mail, 
  MapPin, 
  Download, 
  Send, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  Search, 
  Filter, 
  Sparkles,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

interface HROverviewTableProps {
  jobs: Job[];
  onOpenStudio: (job: Job) => void;
  onApplySingle: (jobId: number) => void;
  onExportExcel: () => void;
  onExportCSV: () => void;
  onBulkAutoSend: (selectedJobIds: number[]) => void;
  onReviewEmails?: (selectedJobIds: number[]) => void;
  isApplyingId: number | null;
}

export function HROverviewTable({
  jobs,
  onOpenStudio,
  onApplySingle,
  onExportExcel,
  onExportCSV,
  onBulkAutoSend,
  onReviewEmails,
  isApplyingId
}: HROverviewTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedJobIds, setSelectedJobIds] = useState<number[]>([]);
  const [sortField, setSortField] = useState<'match_score' | 'company' | 'title'>('match_score');
  const [sortAsc, setSortAsc] = useState(false);

  const filteredJobs = jobs.filter(j => {

    const matchesSearch = 
      j.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (j.recruiter_name && j.recruiter_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (j.recruiter_email && j.recruiter_email.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesLocation = locationFilter === 'All' || j.location.toLowerCase().includes(locationFilter.toLowerCase());
    const matchesStatus = statusFilter === 'All' || (statusFilter === 'Verified' ? j.recruiter_status === 'Verified' : j.recruiter_status !== 'Verified');

    return matchesSearch && matchesLocation && matchesStatus;
  }).sort((a, b) => {
    let comp = 0;
    if (sortField === 'match_score') comp = a.match_score - b.match_score;
    else if (sortField === 'company') comp = a.company.localeCompare(b.company);
    else if (sortField === 'title') comp = a.title.localeCompare(b.title);
    return sortAsc ? comp : -comp;
  });

  const toggleSelectAll = () => {
    if (selectedJobIds.length === filteredJobs.length) {
      setSelectedJobIds([]);
    } else {
      setSelectedJobIds(filteredJobs.map(j => j.id));
    }
  };

  const toggleSelectJob = (id: number) => {
    setSelectedJobIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden transition-all duration-300">
      {/* Table Action Header */}
      <div className="p-5 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-400" />
            HR Contacts & Companies Overview
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Displaying <span className="font-semibold text-slate-200">{filteredJobs.length}</span> companies & verified HR contacts in India
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onExportExcel}
            className="flex items-center gap-2 bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-all shadow-lg shadow-emerald-950/40 active:scale-95"
          >
            <Download className="w-4 h-4" />
            Export Excel (.xlsx)
          </button>
          
          <button
            onClick={onExportCSV}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium px-3 py-2 rounded-xl border border-slate-700 transition-all active:scale-95"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            CSV
          </button>

          {onReviewEmails && (
            <button
              onClick={() => onReviewEmails(selectedJobIds)}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs font-bold px-3.5 py-2 rounded-xl border border-sky-500/30 transition-all active:scale-95"
            >
              <Send className="w-3.5 h-3.5 text-sky-400" />
              Review & Edit Emails {selectedJobIds.length > 0 ? `(${selectedJobIds.length})` : ''}
            </button>
          )}

          <button
            onClick={() => onBulkAutoSend(selectedJobIds)}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg shadow-indigo-950/50 transition-all active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            Auto-Send Emails {selectedJobIds.length > 0 ? `(${selectedJobIds.length})` : '(All)'}
          </button>
        </div>
      </div>


      {/* Filter and Search Bar */}
      <div className="p-4 bg-slate-950/40 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search company, HR name, email, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3">
          {/* Location Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <MapPin className="w-3.5 h-3.5 text-indigo-400" />
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All India Locations</option>
              <option value="Bangalore">Bangalore</option>
              <option value="Gurgaon">Gurgaon / NCR</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Hyderabad">Hyderabad</option>
              <option value="Pune">Pune</option>
              <option value="Chennai">Chennai</option>
              <option value="Remote">Remote (India)</option>
            </select>
          </div>

          {/* HR Status Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5 text-indigo-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All HR Status</option>
              <option value="Verified">Verified Emails Only</option>
              <option value="Pending">Pending Verification</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-950/60 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <th className="p-3.5 pl-5 w-10 text-center">
                <input
                  type="checkbox"
                  checked={filteredJobs.length > 0 && selectedJobIds.length === filteredJobs.length}
                  onChange={toggleSelectAll}
                  className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </th>
              <th 
                className="p-3.5 cursor-pointer hover:text-white transition-colors"
                onClick={() => { setSortField('company'); setSortAsc(!sortAsc); }}
              >
                <div className="flex items-center gap-1">
                  Company
                  {sortField === 'company' && (sortAsc ? <ChevronUp className="w-3 h-3"/> : <ChevronDown className="w-3 h-3"/>)}
                </div>
              </th>
              <th 
                className="p-3.5 cursor-pointer hover:text-white transition-colors"
                onClick={() => { setSortField('title'); setSortAsc(!sortAsc); }}
              >
                <div className="flex items-center gap-1">
                  Job Position
                  {sortField === 'title' && (sortAsc ? <ChevronUp className="w-3 h-3"/> : <ChevronDown className="w-3 h-3"/>)}
                </div>
              </th>
              <th className="p-3.5">Location</th>
              <th className="p-3.5">Salary (LPA / Stipend)</th>
              <th className="p-3.5">HR Recruiter Contact</th>
              <th className="p-3.5">HR Email</th>
              <th 
                className="p-3.5 text-center cursor-pointer hover:text-white transition-colors"
                onClick={() => { setSortField('match_score'); setSortAsc(!sortAsc); }}
              >
                <div className="flex items-center justify-center gap-1">
                  Match %
                  {sortField === 'match_score' && (sortAsc ? <ChevronUp className="w-3 h-3"/> : <ChevronDown className="w-3 h-3"/>)}
                </div>
              </th>
              <th className="p-3.5 pr-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/70 text-xs">
            {filteredJobs.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Building2 className="w-8 h-8 text-slate-600" />
                    <p className="font-medium text-slate-400">No matching HR contacts or jobs found.</p>
                    <p className="text-xs text-slate-600">Try adjusting your location or search filter above.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredJobs.map((j) => {
                const isSelected = selectedJobIds.includes(j.id);
                const isVerified = j.recruiter_status === 'Verified';

                return (
                  <tr 
                    key={j.id} 
                    className={`hover:bg-slate-800/50 transition-colors ${isSelected ? 'bg-indigo-950/20' : ''}`}
                  >
                    <td className="p-3.5 pl-5 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectJob(j.id)}
                        className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                    </td>
                    <td className="p-3.5 font-semibold text-white">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-indigo-950 border border-indigo-800/50 flex items-center justify-center text-indigo-400 font-bold text-xs">
                          {j.company.charAt(0)}
                        </div>
                        <div>
                          <span>{j.company}</span>
                          <span className="block text-[10px] font-normal text-slate-400">{j.company_size || '100+'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 text-slate-200 font-medium">
                      <div>
                        {j.title}
                        <span className="inline-block ml-2 px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400">
                          {j.work_type}
                        </span>
                      </div>
                    </td>
                    <td className="p-3.5 text-slate-300">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {j.location}
                      </span>
                    </td>
                    <td className="p-3.5 text-emerald-400 font-semibold">
                      {j.salary || 'Competitive LPA'}
                    </td>
                    <td className="p-3.5 text-slate-200">
                      {j.recruiter_name || 'Hiring Team'}
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5">
                        {j.recruiter_email ? (
                          <a 
                            href={`mailto:${j.recruiter_email}`}
                            className="font-mono text-sky-400 hover:underline"
                            title="Click to email recruiter directly"
                          >
                            {j.recruiter_email}
                          </a>
                        ) : (
                          <span className="font-mono text-slate-500">N/A</span>
                        )}
                        {isVerified ? (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/50" title="Verified Recruiter Contact">
                            <CheckCircle2 className="w-3 h-3" />
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-950/80 text-amber-400 border border-amber-800/50" title="Pending Verification">
                            <Clock className="w-3 h-3" />
                            Pending
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3.5 text-center font-bold">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${
                        j.match_score >= 85 ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60' :
                        j.match_score >= 70 ? 'bg-indigo-950 text-indigo-400 border border-indigo-800/60' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {j.match_score}%
                      </span>
                    </td>
                    <td className="p-3.5 pr-5 text-right space-x-1.5">
                      <button
                        onClick={() => onOpenStudio(j)}
                        title="Customize & Preview Email"
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition-all"
                      >
                        <Mail className="w-3.5 h-3.5 inline" />
                      </button>

                      <button
                        onClick={() => onApplySingle(j.id)}
                        disabled={isApplyingId === j.id}
                        title="Auto-Send Cold Email to HR"
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-md transition-all inline-flex items-center gap-1"
                      >
                        {isApplyingId === j.id ? (
                          <span className="animate-spin text-white">🌀</span>
                        ) : (
                          <>
                            <Send className="w-3 h-3" />
                            Send
                          </>
                        )}
                      </button>

                      <a
                        href={j.source_url}
                        target="_blank"
                        rel="noreferrer"
                        title="View Job Portal"
                        className="px-2 py-1.5 text-slate-400 hover:text-slate-200 inline-block"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
