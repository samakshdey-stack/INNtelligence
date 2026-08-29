import React, { useState } from 'react';
import {
  FileSpreadsheet,
  FileText,
  HardDrive,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  ShieldCheck,
  KeyRound,
  Copy,
  Check,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { WorkspaceExportResult } from '../../lib/googleWorkspace';
import { isAuthCancelledError } from '../../lib/firebase';

interface WorkspaceExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: 'sheet' | 'doc';
  title: string;
  description: string;
  itemSummary?: {
    label: string;
    value: string | number;
  }[];
  onPerformExport: (accessToken: string) => Promise<WorkspaceExportResult>;
}

export const WorkspaceExportModal: React.FC<WorkspaceExportModalProps> = ({
  isOpen,
  onClose,
  targetType,
  title,
  description,
  itemSummary = [],
  onPerformExport,
}) => {
  const { user, requireGoogleAuth, accessToken } = useAuth();
  const [status, setStatus] = useState<'idle' | 'authorizing' | 'exporting' | 'success' | 'error'>('idle');
  const [exportResult, setExportResult] = useState<WorkspaceExportResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleStartExport = async () => {
    setErrorMessage(null);
    try {
      setStatus('authorizing');
      // Ensure we have a valid token
      const token = await requireGoogleAuth();
      
      setStatus('exporting');
      const result = await onPerformExport(token);
      setExportResult(result);
      setStatus('success');
    } catch (err: any) {
      if (isAuthCancelledError(err)) {
        setErrorMessage('Google authorization popup was closed before completing. Please click below to authorize and save the file to your Google Drive.');
      } else {
        console.error('Workspace export error:', err);
        setErrorMessage(err.message || 'Failed to complete export to Google Workspace.');
      }
      setStatus('error');
    }
  };

  const handleCopyLink = () => {
    if (exportResult?.fileUrl) {
      navigator.clipboard.writeText(exportResult.fileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleReset = () => {
    setStatus('idle');
    setExportResult(null);
    setErrorMessage(null);
    onClose();
  };

  const isSheet = targetType === 'sheet';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#0D0F14] border border-white/15 p-6 sm:p-8 shadow-2xl space-y-6 text-white">
        {/* Close Button */}
        <button
          onClick={handleReset}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* 1. Modal Header */}
        <div className="flex items-center gap-3.5 border-b border-white/10 pb-5">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-lg ${
              isSheet
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-emerald-500/10'
                : 'bg-blue-500/10 border-blue-500/30 text-blue-400 shadow-blue-500/10'
            }`}
          >
            {isSheet ? <FileSpreadsheet className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400">
                Google Workspace Cloud Sync
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-serif italic text-white tracking-tight">{title}</h3>
          </div>
        </div>

        {/* 2. State Content */}
        {status === 'idle' && (
          <div className="space-y-5">
            <p className="text-xs text-white/70 leading-relaxed">{description}</p>

            {/* Item Summary Details */}
            {itemSummary.length > 0 && (
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                <p className="text-[11px] font-mono font-bold text-white/40 uppercase tracking-wider">
                  Export Parameters & Scope
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {itemSummary.map((item, idx) => (
                    <div key={idx} className="bg-black/30 p-2.5 rounded-xl border border-white/5">
                      <span className="text-white/40 text-[10px] block font-mono">{item.label}</span>
                      <span className="text-white/90 font-medium font-mono">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Connected Account Badge */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 text-xs">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-amber-400" />
                <span className="text-white/70">Destination:</span>
                <span className="text-white font-medium">Google Drive</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{user?.email || 'OAuth Ready'}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-mono transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStartExport}
                className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-lg active:scale-98 cursor-pointer ${
                  isSheet
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20'
                    : 'bg-blue-500 hover:bg-blue-400 text-white shadow-blue-500/20'
                }`}
              >
                {isSheet ? <FileSpreadsheet className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                <span>Confirm & Upload to Google {isSheet ? 'Sheets' : 'Docs'}</span>
              </button>
            </div>
          </div>
        )}

        {(status === 'authorizing' || status === 'exporting') && (
          <div className="py-8 flex flex-col items-center justify-center space-y-4 text-center">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-2 border-amber-500/20 border-t-amber-400 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                {isSheet ? (
                  <FileSpreadsheet className="w-6 h-6 text-emerald-400" />
                ) : (
                  <FileText className="w-6 h-6 text-blue-400" />
                )}
              </div>
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-white">
                {status === 'authorizing'
                  ? 'Requesting Google Workspace Token...'
                  : `Generating & Uploading to Google ${isSheet ? 'Sheets' : 'Docs'}...`}
              </h4>
              <p className="text-xs text-white/50 font-mono">
                Communicating with Google Drive and {isSheet ? 'Sheets' : 'Docs'} API v4...
              </p>
            </div>
          </div>
        )}

        {status === 'success' && exportResult && (
          <div className="space-y-5 animate-fadeIn">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <p className="font-bold text-emerald-300">Export Successfully Created!</p>
                <p className="text-emerald-100/80">
                  Your document has been compiled and saved directly into your Google Drive root directory.
                </p>
              </div>
            </div>

            {/* File Details Box */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
              <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Document Title</p>
              <p className="text-sm font-medium text-white font-mono break-all">{exportResult.fileTitle}</p>
              <div className="pt-2 flex items-center justify-between text-[11px] text-white/50 font-mono border-t border-white/5">
                <span>Created: Just now</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Live on Google Cloud
                </span>
              </div>
            </div>

            {/* Direct Open Links */}
            <div className="space-y-2.5 pt-1">
              <a
                href={exportResult.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-lg active:scale-98 ${
                  isSheet
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20'
                    : 'bg-blue-500 hover:bg-blue-400 text-white shadow-blue-500/20'
                }`}
              >
                <span>Open in Google {isSheet ? 'Sheets' : 'Docs'}</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <div className="flex gap-2">
                <button
                  onClick={handleCopyLink}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white text-xs font-mono flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Link Copied!' : 'Copy Direct Link'}</span>
                </button>
                <button
                  onClick={handleReset}
                  className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-mono transition-all cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-5 animate-fadeIn">
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <p className="font-bold text-rose-300">Google Workspace Sync Error</p>
                <p className="text-rose-100/80 leading-relaxed font-mono text-[11px]">
                  {errorMessage || 'Failed to authenticate with Google Drive / Docs APIs.'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-mono transition-all cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleStartExport}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                Retry Export
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
