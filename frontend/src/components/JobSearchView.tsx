import { useState } from 'react';
import { 
  Search, 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Building2, 
  Sparkles, 
  Mail, 
  ExternalLink,
  Download,
  Table,
  LayoutGrid,
  RefreshCw,
  Send
} from 'lucide-react';
import type { Job, UserProfile } from '../types';
import { HROverviewTable } from './HROverviewTable';

interface JobSearchViewProps {
  jobs: Job[];
  profile: UserProfile;
  onGenerateAndApply: (job: Job) => void;
  onTriggerScrape: (query?: string, location?: string) => void;
  onExportExcel: () => void;
  onExportCSV: () => void;
  onBulkAutoSend: (selectedJobIds: number[]) => void;
  onReviewEmails?: (selectedJobIds: number[]) => void;
  onApplySingle: (jobId: number) => void;
  isApplyingId: number | null;
  isLoading: boolean;
}

export const JobSearchView = ({
  jobs,
  profile,
  onGenerateAndApply,
  onTriggerScrape,
  onExportExcel,
  onExportCSV,
  onBulkAutoSend,
  onReviewEmails,
  onApplySingle,
  isApplyingId,
  isLoading
}: JobSearchViewProps) => {

  const [viewMode, setViewMode] = useState<'overview' | 'grid'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('All Locations');
  const [workTypeFilter, setWorkTypeFilter] = useState('All');
  const [jobTypeFilter, setJobTypeFilter] = useState('All');
  const [minMatchFilter, setMinMatchFilter] = useState<number>(40);
  const [sortBy, setSortBy] = useState<'match' | 'salary' | 'newest'>('match');
  const [linkedinInputUrl, setLinkedinInputUrl] = useState('');
  const [isMiningLinkedin, setIsMiningLinkedin] = useState(false);

  const handleMineLinkedinUrl = async () => {
    if (!linkedinInputUrl.trim()) return;
    setIsMiningLinkedin(true);
    try {
      const res = await fetch(`/api/linkedin/scrape-hr?linkedin_url=${encodeURIComponent(linkedinInputUrl)}`, {
        method: 'POST'
      });
      if (res.ok) {
        setLinkedinInputUrl('');
        onTriggerScrape();
      }
    } catch (e) {
      console.error('LinkedIn extraction failed:', e);
    } finally {
      setIsMiningLinkedin(false);
    }
  };

  // Filter jobs
  const filteredJobs = jobs.filter((job) => {
    const matchesQuery = searchQuery === '' || 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (job.recruiter_name && job.recruiter_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (job.recruiter_email && job.recruiter_email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      job.required_skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesLocation = locationQuery === 'All Locations' || 
      job.location.toLowerCase().includes(locationQuery.toLowerCase());

    const matchesWorkType = workTypeFilter === 'All' || job.work_type === workTypeFilter;
    const matchesJobType = jobTypeFilter === 'All' || job.job_type === jobTypeFilter;
    const matchesMatch = (job.match_score || 0) >= minMatchFilter;

    return matchesQuery && matchesLocation && matchesWorkType && matchesJobType && matchesMatch;
  });

  // Sort jobs
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    if (sortBy === 'match') return (b.match_score || 0) - (a.match_score || 0);
    if (sortBy === 'salary') return b.salary.localeCompare(a.salary);
    return (b.id || 0) - (a.id || 0);
  });

  const handleRunScrape = () => {
    onTriggerScrape(searchQuery, locationQuery);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & View Switcher */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Search className="w-5 h-5 text-indigo-400" />
              India Job Scraper & HR Contact Aggregator
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Live web scraping across Naukri, Instahyre, LinkedIn India, Cutshort, Foundit & Indian Tech Hubs
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-1 flex items-center gap-1">
              <button
                onClick={() => setViewMode('overview')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'overview'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Table className="w-3.5 h-3.5" />
                HR Overview Table
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'grid'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Job Cards Grid
              </button>
            </div>

            {/* Quick Export & Scrape */}
            <button
              onClick={onExportExcel}
              className="flex items-center gap-1.5 bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-all shadow-md active:scale-95"
              title="Download Excel (.xlsx) file"
            >
              <Download className="w-3.5 h-3.5" />
              Excel Export
            </button>

            <button
              onClick={handleRunScrape}
              disabled={isLoading}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-all shadow-md active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              Scrape Jobs India
            </button>
          </div>
        </div>

        {/* LinkedIn Link Scraper Box */}
        <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2.5 w-full sm:w-auto">
            <span className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 font-bold border border-sky-500/20">in</span>
            <div>
              <p className="text-white font-semibold">LinkedIn Link HR Extractor</p>
              <p className="text-[10px] text-slate-400">Paste recruiter, hiring profile, or LinkedIn job link to extract direct HR contact details</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder="https://linkedin.com/in/recruiter-profile..."
              value={linkedinInputUrl}
              onChange={(e) => setLinkedinInputUrl(e.target.value)}
              className="w-full sm:w-64 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-400"
            />
            <button
              onClick={handleMineLinkedinUrl}
              disabled={isMiningLinkedin || !linkedinInputUrl.trim()}
              className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold rounded-lg text-xs transition shrink-0"
            >
              {isMiningLinkedin ? 'Extracting...' : 'Extract HR Contact'}
            </button>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 pt-2">
          {/* Query Input */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search Indian jobs, roles, or HR contacts (e.g. SDE, Python)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-400"
            />
          </div>

          {/* India Location Selector */}
          <div>
            <select
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-400"
            >
              <option value="All Locations">Location: All Locations</option>
              <option value="Bangalore">Bangalore, KA</option>
              <option value="Gurgaon">Gurgaon / NCR, HR</option>
              <option value="Noida">Noida, UP</option>
              <option value="Delhi">Delhi, NCR</option>
              <option value="Mumbai">Mumbai, MH</option>
              <option value="Hyderabad">Hyderabad, TS</option>
              <option value="Pune">Pune, MH</option>
              <option value="Chennai">Chennai, TN</option>
              <option value="Kolkata">Kolkata, WB</option>
              <option value="Ahmedabad">Ahmedabad, GJ</option>
              <option value="Remote">Remote (India)</option>
              <option value="Global Remote">Global Remote</option>
            </select>
          </div>

          {/* Work Type */}
          <div>
            <select
              value={workTypeFilter}
              onChange={(e) => setWorkTypeFilter(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-400"
            >
              <option value="All">Work Type: All</option>
              <option value="Remote">Remote Only</option>
              <option value="Hybrid">Hybrid</option>
              <option value="On-site">On-site</option>
            </select>
          </div>

          {/* Job Type */}
          <div>
            <select
              value={jobTypeFilter}
              onChange={(e) => setJobTypeFilter(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-400"
            >
              <option value="All">Job Type: All</option>
              <option value="Full-Time">Full-Time</option>
              <option value="Internship">Internship</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-400"
            >
              <option value="match">Sort: Match %</option>
              <option value="salary">Sort: Salary / LPA</option>
              <option value="newest">Sort: Newest</option>
            </select>
          </div>

          {/* Min Match Slider */}
          <div className="flex items-center space-x-2 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 sm:col-span-2 lg:col-span-1">
            <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">Min: {minMatchFilter}%</span>
            <input
              type="range"
              min="0"
              max="90"
              step="5"
              value={minMatchFilter}
              onChange={(e) => setMinMatchFilter(Number(e.target.value))}
              className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-400"
            />
          </div>
        </div>
      </div>



      {/* Main Content Area */}
      {viewMode === 'overview' ? (
        <HROverviewTable
          jobs={sortedJobs}
          onOpenStudio={onGenerateAndApply}
          onApplySingle={onApplySingle}
          onExportExcel={onExportExcel}
          onExportCSV={onExportCSV}
          onBulkAutoSend={onBulkAutoSend}
          onReviewEmails={onReviewEmails}
          isApplyingId={isApplyingId}
        />

      ) : (
        /* Jobs Grid View */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sortedJobs.map((job) => {
            const isHighMatch = (job.match_score || 0) >= 70;
            return (
              <div
                key={job.id}
                className={`glass-panel p-6 rounded-2xl border transition-all duration-300 glass-panel-hover space-y-4 relative overflow-hidden flex flex-col justify-between ${
                  isHighMatch ? 'border-indigo-500/30' : 'border-slate-800'
                }`}
              >
                {/* Top Card Header */}
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                          {job.source_portal || 'Naukri'}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">{job.company}</span>
                      </div>
                      <h3 className="text-lg font-bold text-white mt-1 leading-snug">{job.title}</h3>
                    </div>

                    {/* AI Match Score Badge */}
                    <div className={`px-3 py-1.5 rounded-xl flex flex-col items-center justify-center border shadow-lg ${
                      isHighMatch 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 glow-emerald' 
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    }`}>
                      <span className="text-lg font-extrabold leading-none">{job.match_score || 85}%</span>
                      <span className="text-[9px] uppercase font-bold text-slate-400 mt-0.5">Match</span>
                    </div>
                  </div>

                  {/* Meta Attributes Chips */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mb-3">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                      {job.salary}
                    </span>
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-purple-400" />
                      {job.company_size}
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5 text-amber-400" />
                      {job.job_type}
                    </span>
                  </div>

                  {/* Job Description Snippet */}
                  <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed mb-4">
                    {job.description}
                  </p>

                  {/* Skill Match Comparison Badges */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-medium">Matching Candidate Skills:</span>
                      <span className="text-emerald-400 font-bold">{job.required_skills.filter(s => profile.skills.includes(s)).length} / {job.required_skills.length}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {job.required_skills.map((skill, sIdx) => {
                        const isMatch = profile.skills.includes(skill);
                        return (
                          <span
                            key={sIdx}
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg border ${
                              isMatch
                                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                                : 'bg-slate-800/80 text-slate-400 border-slate-700/60 line-through opacity-75'
                            }`}
                          >
                            {isMatch ? '✓ ' : ''}{skill}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Verified Recruiter Contact Indicator */}
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <Mail className={`w-4 h-4 ${job.recruiter_email ? 'text-indigo-400' : 'text-slate-500'}`} />
                      <div>
                        <p className="text-[10px] text-slate-400">Recruiter Contact ({job.recruiter_name || 'Hiring Team'})</p>
                        <p className="font-semibold text-slate-200 text-[11px]">
                          {job.recruiter_email || 'No Public Email Found'}
                        </p>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                      job.recruiter_status === 'Verified'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {job.recruiter_status === 'Verified' ? 'Verified Contact' : 'Manual Review'}
                    </span>
                  </div>
                </div>

                {/* Action Buttons Footer */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
                  <a
                    href={job.source_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-slate-400 hover:text-indigo-400 transition flex items-center gap-1"
                  >
                    <span>View Post</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onApplySingle(job.id)}
                      disabled={isApplyingId === job.id}
                      className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-3 py-2 rounded-xl text-xs transition border border-slate-700"
                    >
                      <Send className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Auto-Send</span>
                    </button>

                    <button
                      onClick={() => onGenerateAndApply(job)}
                      className="flex items-center space-x-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold px-4 py-2 rounded-xl text-xs transition shadow-md"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Customize & Apply</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
