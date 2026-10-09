import { useState } from 'react';
import { X, Send, Sparkles, CheckCircle2, RefreshCw, ShieldCheck } from 'lucide-react';
import type { Job } from '../types';


interface AutoSendModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedJobs: Job[];
  onConfirmAutoSend: (jobIds: number[]) => Promise<void>;
  userEmail: string;
}

export function AutoSendModal({
  isOpen,
  onClose,
  selectedJobs,
  onConfirmAutoSend,
  userEmail
}: AutoSendModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [sentCount, setSentCount] = useState(0);

  if (!isOpen) return null;

  const handleCloseModal = () => {
    setIsFinished(false);
    setIsProcessing(false);
    onClose();
  };

  const targetJobsCount = selectedJobs.length > 0 ? selectedJobs.length : 'All (≥70% Match)';

  const handleStartCampaign = async () => {
    setIsProcessing(true);
    try {
      const ids = selectedJobs.map(j => j.id);
      await onConfirmAutoSend(ids);
      setSentCount(selectedJobs.length || 1);
      setIsFinished(true);
    } catch (err) {
      console.error('Auto send campaign failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl transition-all">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-indigo-950/50 via-slate-900 to-violet-950/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Auto-Send Cold Emails to HR</h3>
              <p className="text-xs text-slate-400">Automated Outreach Campaign for India</p>
            </div>
          </div>
          <button 
            onClick={handleCloseModal} 
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {!isFinished ? (
            <>
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Target Recipients:</span>
                  <span className="font-semibold text-indigo-400">{targetJobsCount} HR Recruiter Contacts</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Sender Account:</span>
                  <span className="font-mono text-slate-200">{userEmail || 'alex.morgan@techdev.io'}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Email Format:</span>
                  <span className="font-semibold text-emerald-400">AI Tailored Cold Email + Resume</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Delivery Gateway:</span>
                  <span className="font-semibold text-slate-300">Verified SMTP / Dispatcher</span>
                </div>
              </div>

              <div className="bg-indigo-950/30 border border-indigo-800/40 rounded-2xl p-4 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <p className="text-xs text-indigo-200/90 leading-relaxed">
                  Each email is dynamically personalized with candidate skills, experience, and target company details to maximize response rate from Indian recruiters.
                </p>
              </div>

              {isProcessing && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-indigo-400 font-medium flex items-center gap-1.5">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Dispatching emails in sequence...
                    </span>
                    <span className="text-slate-400 font-mono">Processing...</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full rounded-full animate-pulse w-3/4"></div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="py-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-950 border border-emerald-800 flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-white">Campaign Dispatched Successfully!</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Sent personalized cold application emails to <span className="text-emerald-400 font-semibold">{sentCount}</span> HR contacts in India.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-800 bg-slate-950/50 flex items-center justify-end gap-3">
          {!isFinished ? (
            <>
              <button
                onClick={handleCloseModal}
                disabled={isProcessing}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleStartCampaign}
                disabled={isProcessing}
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Sending Emails...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Start Auto-Send Campaign
                  </>
                )}
              </button>
            </>
          ) : (
            <button
              onClick={handleCloseModal}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-lg transition-all cursor-pointer"
            >
              Done & Return to Overview
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
