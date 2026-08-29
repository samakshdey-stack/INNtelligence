import React, { useRef, useState } from 'react';
import {
  X,
  Download,
  Printer,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Wrench,
  Wifi,
  Thermometer,
  Utensils,
  Droplets,
  Users,
  FileCheck,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Building2,
  DollarSign,
  Award,
} from 'lucide-react';
import jsPDF from 'jspdf';
import { toCanvas } from 'html-to-image';
import { GuestFeedbackRecord, CustomerProblemStat, RoomProblemStat } from '../types';

interface FeedbackActionPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  feedbackRecords?: GuestFeedbackRecord[];
  customerProblemsStats?: CustomerProblemStat[];
  roomProblemsStats?: RoomProblemStat[];
  propertyName?: string;
}

export const FeedbackActionPlanModal: React.FC<FeedbackActionPlanModalProps> = ({
  isOpen,
  onClose,
  feedbackRecords = [],
  customerProblemsStats = [],
  roomProblemsStats = [],
  propertyName = 'The Meridian Kolkata',
}) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleDownloadPdf = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);
    try {
      const element = reportRef.current;
      const canvas = await toCanvas(element, {
        quality: 0.98,
        pixelRatio: 2.5,
        backgroundColor: '#0D0E11',
        cacheBust: true,
        skipFonts: true,
        fontEmbedCSS: '',
        style: {
          transform: 'none',
          borderRadius: '0px',
          margin: '0px',
        },
      });

      const pdfWidthMm = 210; // A4 standard width in mm
      // Exact aspect-ratio preservation to prevent any squeezing
      const pdfHeightMm = (canvas.height * pdfWidthMm) / canvas.width;

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [pdfWidthMm, Math.max(297, pdfHeightMm)],
        compress: true,
      });

      const pageDataUrl = canvas.toDataURL('image/jpeg', 0.95);
      pdf.addImage(pageDataUrl, 'JPEG', 0, 0, pdfWidthMm, pdfHeightMm, undefined, 'FAST');

      const timestamp = new Date().toISOString().slice(0, 10);
      const propertySlug = propertyName.replace(/\s+/g, '_');
      pdf.save(`INNtelligence_Guest_Feedback_Action_Plan_${propertySlug}_${timestamp}.pdf`);

      showToast('Guest Feedback Action Plan PDF downloaded successfully!');
    } catch (error) {
      console.error('Failed to export Feedback Action Plan PDF:', error);
      window.print();
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="bg-[#0D0E11] border border-amber-500/30 w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col relative">
        {/* Top Gold Accent Bar */}
        <div className="h-1.5 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600 shrink-0" />

        {/* Modal Toolbar Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/[0.02] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-lg shadow-amber-500/10">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-serif italic font-bold text-white">
                  Guest Feedback Strategic Action Plan & Next Steps
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  Q3/Q4 2026 Mandate
                </span>
              </div>
              <p className="text-xs text-white/50">
                In-depth corrective roadmap, departmental SLAs, and capital interventions synthesized from 314 guest reviews.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button
              onClick={handleDownloadPdf}
              disabled={isExporting}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all shadow-lg shadow-amber-500/20 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isExporting ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>{isExporting ? 'Generating PDF...' : 'Download Action Plan (PDF)'}</span>
            </button>

            <button
              onClick={() => window.print()}
              className="p-2 rounded-2xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition-all cursor-pointer"
              title="Print Action Plan"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-2xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition-all cursor-pointer"
              title="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Toast Notification */}
        {toastMessage && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between shadow-lg shrink-0">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{toastMessage}</span>
            </div>
            <button onClick={() => setToastMessage(null)} className="text-emerald-400 hover:text-white font-bold ml-2">
              Dismiss
            </button>
          </div>
        )}

        {/* Scrollable Printable Document Container */}
        <div className="p-4 sm:p-8 overflow-y-auto space-y-6">
          {/* THE AUDIT DOCUMENT SHEET (To be rendered to PDF) */}
          <div
            ref={reportRef}
            id="feedback-action-plan-sheet"
            className="w-full max-w-4xl mx-auto rounded-3xl bg-[#0D0E11] border border-white/10 p-6 sm:p-10 space-y-8 text-white relative font-sans shadow-2xl"
          >
            {/* Top Accent Strip */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-amber-400 to-cyan-500 rounded-t-3xl" />

            {/* Document Header & Metadata */}
            <div className="border-b border-white/10 pb-6 space-y-4 relative z-10">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-widest uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                      Official Executive Directive &bull; Quality Assurance
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-serif italic font-bold text-white tracking-tight">
                    Guest Feedback Diagnostic & Strategic Next Steps Roadmap
                  </h1>
                  <p className="text-xs text-white/50 font-mono">
                    {propertyName} &bull; Operational Corrective Action Matrix & Departmental SLAs (2026–2027)
                  </p>
                </div>

                {/* Metadata Box */}
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 text-right space-y-1 font-mono text-[11px] shrink-0 min-w-[210px]">
                  <div className="flex justify-between gap-3 text-white/40">
                    <span>Document Ref:</span>
                    <span className="text-amber-400 font-bold">INN-QA-2026-ACT</span>
                  </div>
                  <div className="flex justify-between gap-3 text-white/40">
                    <span>Audit Scope:</span>
                    <span className="text-white">314 Guest Reviews</span>
                  </div>
                  <div className="flex justify-between gap-3 text-white/40">
                    <span>Effective Date:</span>
                    <span className="text-white">22 August 2026</span>
                  </div>
                  <div className="flex justify-between gap-3 text-white/40">
                    <span>Authority:</span>
                    <span className="text-emerald-400 font-bold">GM & Quality Director</span>
                  </div>
                </div>
              </div>

              {/* KPI Summary Ribbon */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
                <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
                  <span className="text-[10px] font-mono uppercase text-white/40 block">Current CSAT Index</span>
                  <span className="text-xl font-serif font-bold text-amber-400">4.80 / 5.0</span>
                  <span className="text-[10px] text-emerald-400 font-mono block">Target: 4.95 (+0.15 pts)</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
                  <span className="text-[10px] font-mono uppercase text-white/40 block">Audited Reviews</span>
                  <span className="text-xl font-serif font-bold text-white">314 Stays</span>
                  <span className="text-[10px] text-white/40 font-mono block">92.4% Positive Sentiment</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
                  <span className="text-[10px] font-mono uppercase text-white/40 block">Core Vulnerability Area</span>
                  <span className="text-xl font-serif font-bold text-rose-400">Wi-Fi & HVAC</span>
                  <span className="text-[10px] text-rose-300 font-mono block">50.9% of Total Friction</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
                  <span className="text-[10px] font-mono uppercase text-white/40 block">Resolution SLA Target</span>
                  <span className="text-xl font-serif font-bold text-cyan-400">&lt; 8.0 mins</span>
                  <span className="text-[10px] text-emerald-400 font-mono block">Down from 12.4 mins</span>
                </div>
              </div>
            </div>

            {/* Section 1: Executive Diagnostic on Guest Feedback & Root Causes */}
            <div className="space-y-3 relative z-10">
              <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm sm:text-base font-serif italic font-bold text-white">
                  1. Executive Review Analysis & Primary Friction Root Causes
                </h2>
              </div>
              <p className="text-xs text-white/70 leading-relaxed">
                Analysis of verified guest feedback collected throughout 2026 indicates outstanding guest satisfaction in culinary butler service, concierge recommendations, and housekeeping courtesy. However, recurring operational friction points have been isolated across 5 specific operational domains that directly impact ADR yield and repeat corporate reservations:
              </p>

              {/* 5 Friction Points Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1.5">
                  <div className="flex items-center gap-2 text-amber-400 font-bold">
                    <Wifi className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>1. Executive Wing Wi-Fi Video Call Drops (28.3% Friction)</span>
                  </div>
                  <p className="text-white/60 text-[11px] leading-relaxed">
                    <strong>Root Cause:</strong> High-bandwidth load on 3rd floor wing access points during peak corporate prep hours (08:00–10:00 AM) causing jitter on Microsoft Teams & Zoom calls (e.g. Rm 319).
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1.5">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold">
                    <Thermometer className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>2. Heritage Suite Thermostat Auto-Reset (22.6% Friction)</span>
                  </div>
                  <p className="text-white/60 text-[11px] leading-relaxed">
                    <strong>Root Cause:</strong> Analog HVAC thermostat firmware in Heritage Suites automatically resets to 25°C at 03:00 AM, causing guest discomfort and nocturnal service calls (e.g. Rm 412).
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1.5">
                  <div className="flex items-center gap-2 text-rose-400 font-bold">
                    <Utensils className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>3. In-Room Dining Peak Hour Delays (17.5% Friction)</span>
                  </div>
                  <p className="text-white/60 text-[11px] leading-relaxed">
                    <strong>Root Cause:</strong> Banquet service overlap between 19:30–21:30 causing service elevator bottlenecks and delayed delivery times averaging 31.5 minutes.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1.5">
                  <div className="flex items-center gap-2 text-blue-400 font-bold">
                    <Droplets className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>4. Morning Peak Plumbing & Water Pressure (11.5% Friction)</span>
                  </div>
                  <p className="text-white/60 text-[11px] leading-relaxed">
                    <strong>Root Cause:</strong> Simultaneous 08:00 AM shower demand on 1st & 2nd floor risers causes temporary pressure dips and 5-minute delays in hot water delivery (e.g. Rm 118).
                  </p>
                </div>
              </div>
            </div>

            {/* Section 2: In-Depth Strategic Next Steps & Corrective Roadmap */}
            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <h2 className="text-sm sm:text-base font-serif italic font-bold text-white">
                    2. Strategic Phased Implementation Roadmap (Action Items)
                  </h2>
                </div>
                <span className="text-[11px] font-mono text-emerald-400">Target Completion: Q4 2026</span>
              </div>

              {/* Phase 1: Immediate Rapid Remediation (0 - 7 Days) */}
              <div className="p-4 rounded-2xl bg-amber-500/[0.04] border border-amber-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-amber-500 text-black font-bold text-xs flex items-center justify-center">
                      1
                    </span>
                    <h3 className="font-serif italic font-bold text-amber-300 text-sm">
                      Phase 1: Immediate Rapid Remediation (0 – 7 Days)
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase">
                    Immediate Action
                  </span>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div className="flex items-start gap-2.5 bg-black/30 p-2.5 rounded-xl border border-white/5">
                    <span className="text-amber-400 font-bold">1.1</span>
                    <div>
                      <strong className="text-white">Wi-Fi Mesh Rapid Boost:</strong> Deploy 8x dedicated Tri-Band Wi-Fi 6 repeaters across 3rd & 4th floor corridors and executive suites; rebalance SSID bandwidth for corporate VPNs.
                      <div className="text-[10px] text-white/40 mt-0.5">Owner: R. Mukherjee (Lead IT) &bull; Target: 48 Hours</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 bg-black/30 p-2.5 rounded-xl border border-white/5">
                    <span className="text-amber-400 font-bold">1.2</span>
                    <div>
                      <strong className="text-white">Thermostat Override in Heritage Suites:</strong> Override nocturnal 25°C auto-reset firmware on all 5 Heritage Suite analog thermostats and recalibrate temperature sensors.
                      <div className="text-[10px] text-white/40 mt-0.5">Owner: T. Ghosh (Chief Engineer) &bull; Target: 72 Hours</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 bg-black/30 p-2.5 rounded-xl border border-white/5">
                    <span className="text-amber-400 font-bold">1.3</span>
                    <div>
                      <strong className="text-white">In-Room Dining Express Priority Elevator:</strong> Reserve Service Elevator #2 strictly for In-Room Dining carts between 19:30–22:00 to reduce delivery SLA to &lt; 20 minutes.
                      <div className="text-[10px] text-white/40 mt-0.5">Owner: Executive Chef & F&B Manager &bull; Target: Day 1</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Phase 2: Medium-Term SOP & Infrastructure Overhaul (8 - 30 Days) */}
              <div className="p-4 rounded-2xl bg-cyan-500/[0.04] border border-cyan-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-cyan-500 text-black font-bold text-xs flex items-center justify-center">
                      2
                    </span>
                    <h3 className="font-serif italic font-bold text-cyan-300 text-sm">
                      Phase 2: Tactical SOP & Infrastructure Upgrades (8 – 30 Days)
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase">
                    30-Day Milestone
                  </span>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div className="flex items-start gap-2.5 bg-black/30 p-2.5 rounded-xl border border-white/5">
                    <span className="text-cyan-400 font-bold">2.1</span>
                    <div>
                      <strong className="text-white">Plumbing Manifold Variable Booster Pump:</strong> Install automatic variable-frequency drive (VFD) pressure booster pumps on Risers 1 & 2 to prevent 08:00 AM shower pressure dips.
                      <div className="text-[10px] text-white/40 mt-0.5">Owner: T. Ghosh (Engineering) &bull; Target: 15 Days</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 bg-black/30 p-2.5 rounded-xl border border-white/5">
                    <span className="text-cyan-400 font-bold">2.2</span>
                    <div>
                      <strong className="text-white">Lobby Express Mobile Check-In:</strong> Equip Front Desk duty managers with 3 iPads for roaming curb-side check-in during 14:00 corporate arrival peaks.
                      <div className="text-[10px] text-white/40 mt-0.5">Owner: Priya Dasgupta (Front Desk Lead) &bull; Target: 10 Days</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 bg-black/30 p-2.5 rounded-xl border border-white/5">
                    <span className="text-cyan-400 font-bold">2.3</span>
                    <div>
                      <strong className="text-white">6-Minute Linen & Pillow Protocol:</strong> Establish dedicated floor pantries stocked with feather/hypoallergenic pillow varieties and extra linen for sub-6 minute dispatch.
                      <div className="text-[10px] text-white/40 mt-0.5">Owner: Sunil Mondal (Executive Housekeeper) &bull; Target: 20 Days</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Phase 3: Long-Term Quality Assurance & Capital Enhancements (30 - 90 Days) */}
              <div className="p-4 rounded-2xl bg-emerald-500/[0.04] border border-emerald-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-500 text-black font-bold text-xs flex items-center justify-center">
                      3
                    </span>
                    <h3 className="font-serif italic font-bold text-emerald-300 text-sm">
                      Phase 3: Strategic Quality Assurance & Capital Enhancements (30 – 90 Days)
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                    Long-Term Quality
                  </span>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div className="flex items-start gap-2.5 bg-black/30 p-2.5 rounded-xl border border-white/5">
                    <span className="text-emerald-400 font-bold">3.1</span>
                    <div>
                      <strong className="text-white">Smart IoT Climate Control Retrofit:</strong> Complete conversion of all 24 keys to smart digital wall thermostats with central engineering telemetry and pre-arrival auto-cooling.
                      <div className="text-[10px] text-white/40 mt-0.5">Capex: ₹3.5 Lakhs &bull; Owner: General Manager & Chief Engineer</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 bg-black/30 p-2.5 rounded-xl border border-white/5">
                    <span className="text-emerald-400 font-bold">3.2</span>
                    <div>
                      <strong className="text-white">Closed-Loop 2-Hour In-Stay Feedback Check:</strong> Automated WhatsApp/SMS micro-check sent at Hour 2 of stay to capture any friction before check-out review stage.
                      <div className="text-[10px] text-white/40 mt-0.5">Owner: Guest Relations & IT Team &bull; Target: 45 Days</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 bg-black/30 p-2.5 rounded-xl border border-white/5">
                    <span className="text-emerald-400 font-bold">3.3</span>
                    <div>
                      <strong className="text-white">Departmental CSAT Performance Incentive Bonus:</strong> Monthly team bonus pool tied to sub-8 min resolution SLAs and zero unresolved negative reviews.
                      <div className="text-[10px] text-white/40 mt-0.5">Budget: ₹50,000 / month &bull; Owner: HR & General Manager</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Departmental Responsibility & SLA Accountability Matrix */}
            <div className="space-y-3 relative z-10">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-400" />
                  <h2 className="text-sm sm:text-base font-serif italic font-bold text-white">
                    3. Departmental Responsibility, SLA Targets & Accountability Matrix
                  </h2>
                </div>
                <span className="text-[11px] font-mono text-white/40">Mandatory Service Standards</span>
              </div>

              <div className="rounded-2xl border border-white/10 overflow-hidden bg-white/[0.01]">
                <table className="w-full text-left font-mono text-[11px]">
                  <thead className="bg-white/5 border-b border-white/10 text-amber-400 font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Department</th>
                      <th className="py-2.5 px-3">Lead Owner</th>
                      <th className="py-2.5 px-3">Core Directive</th>
                      <th className="py-2.5 px-3 text-center">Baseline SLA</th>
                      <th className="py-2.5 px-3 text-center">Target SLA</th>
                      <th className="py-2.5 px-3 text-right">CSAT Impact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    <tr className="bg-transparent">
                      <td className="py-2 px-3 font-medium text-white">IT & Telecommunications</td>
                      <td className="py-2 px-3 text-white/70">R. Mukherjee</td>
                      <td className="py-2 px-3 text-white/60">Wi-Fi 6 Mesh Repeaters on 3rd/4th Floor</td>
                      <td className="py-2 px-3 text-center text-rose-400 tabular-nums">14.2 min</td>
                      <td className="py-2 px-3 text-center text-emerald-400 font-bold tabular-nums">&lt; 5.0 min</td>
                      <td className="py-2 px-3 text-right font-bold text-amber-400 tabular-nums">+0.22 pts</td>
                    </tr>
                    <tr className="bg-white/[0.01]">
                      <td className="py-2 px-3 font-medium text-white">HVAC & Engineering</td>
                      <td className="py-2 px-3 text-white/70">T. Ghosh</td>
                      <td className="py-2 px-3 text-white/60">Thermostat Sensor Overhaul & IoT Retrofit</td>
                      <td className="py-2 px-3 text-center text-rose-400 tabular-nums">18.5 min</td>
                      <td className="py-2 px-3 text-center text-emerald-400 font-bold tabular-nums">&lt; 8.0 min</td>
                      <td className="py-2 px-3 text-right font-bold text-amber-400 tabular-nums">+0.18 pts</td>
                    </tr>
                    <tr className="bg-transparent">
                      <td className="py-2 px-3 font-medium text-white">Food & Beverage (In-Room)</td>
                      <td className="py-2 px-3 text-white/70">Executive Chef</td>
                      <td className="py-2 px-3 text-white/60">Dedicated Service Lift & Express Hot Tray</td>
                      <td className="py-2 px-3 text-center text-rose-400 tabular-nums">31.5 min</td>
                      <td className="py-2 px-3 text-center text-emerald-400 font-bold tabular-nums">&lt; 18.0 min</td>
                      <td className="py-2 px-3 text-right font-bold text-amber-400 tabular-nums">+0.15 pts</td>
                    </tr>
                    <tr className="bg-white/[0.01]">
                      <td className="py-2 px-3 font-medium text-white">Housekeeping & Linen</td>
                      <td className="py-2 px-3 text-white/70">Sunil Mondal</td>
                      <td className="py-2 px-3 text-white/60">Floor Pantry Stocking & Turnaround Protocol</td>
                      <td className="py-2 px-3 text-center text-amber-400 tabular-nums">9.4 min</td>
                      <td className="py-2 px-3 text-center text-emerald-400 font-bold tabular-nums">&lt; 6.0 min</td>
                      <td className="py-2 px-3 text-right font-bold text-amber-400 tabular-nums">+0.10 pts</td>
                    </tr>
                    <tr className="bg-transparent">
                      <td className="py-2 px-3 font-medium text-white">Front Desk & Concierge</td>
                      <td className="py-2 px-3 text-white/70">Priya Dasgupta</td>
                      <td className="py-2 px-3 text-white/60">iPad Curb-side Check-in & VIP Pre-profiling</td>
                      <td className="py-2 px-3 text-center text-amber-400 tabular-nums">6.5 min</td>
                      <td className="py-2 px-3 text-center text-emerald-400 font-bold tabular-nums">&lt; 2.0 min</td>
                      <td className="py-2 px-3 text-right font-bold text-amber-400 tabular-nums">+0.08 pts</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 4: Projected Business Impact & Financial ROI */}
            <div className="space-y-3 pt-2 border-t border-white/10 relative z-10">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm sm:text-base font-serif italic font-bold text-white">
                  4. Anticipated Business Impact & Revenue Preservation
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                  <span className="text-emerald-400 font-bold block text-[11px]">CSAT Index Uplift:</span>
                  <p className="text-[10px] text-white/60">
                    Target increase from <strong>4.80</strong> to <strong>4.95 / 5.0</strong>, solidifying TripAdvisor Top 1% Heritage Hotel ranking in Eastern India.
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                  <span className="text-amber-400 font-bold block text-[11px]">GOP & Voucher Protection:</span>
                  <p className="text-[10px] text-white/60">
                    Elimination of complaint compensation waivers and comped meal vouchers saves an estimated <strong>₹4.2 Lakhs annually</strong>.
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                  <span className="text-cyan-400 font-bold block text-[11px]">Corporate Re-Booking Rate:</span>
                  <p className="text-[10px] text-white/60">
                    High-speed Wi-Fi & instant check-in projected to lift Q4 corporate repeated stays from 62% to <strong>76%</strong>.
                  </p>
                </div>
              </div>

              {/* Executive Validation & Sign-off Box */}
              <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-white/10 text-xs font-mono">
                <div className="space-y-0.5">
                  <div className="text-white/40 text-[9px] uppercase tracking-wider">Quality Assurance Seal</div>
                  <div className="text-emerald-400 flex items-center gap-1.5 font-bold text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>CORRECTIVE ACTION PLAN RATIFIED & DISTRIBUTED</span>
                  </div>
                  <div className="text-white/30 text-[9px]">SOP Mandate Ref: INN-2026-QA-SOP-V4</div>
                </div>

                <div className="text-right space-y-0.5 border-t sm:border-t-0 pt-2 sm:pt-0">
                  <div className="font-serif italic font-bold text-amber-400 text-sm">Amit Sen</div>
                  <div className="text-white/60 text-[10px]">General Manager & Director of Hospitality</div>
                  <div className="text-white/30 text-[9px]">{propertyName}</div>
                </div>
              </div>
            </div>

            {/* Running Footer */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-white/40">
              <span>INNtelligence Executive Suite &bull; Guest Feedback Diagnostic & Action Plan</span>
              <span className="font-bold text-amber-400">Confidential QA Document</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
