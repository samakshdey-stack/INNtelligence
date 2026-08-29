import React, { useState, useRef } from 'react';
import {
  FileText,
  Download,
  Printer,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  PieChart as PieChartIcon,
  DollarSign,
  ChevronDown,
  RefreshCw,
  SlidersHorizontal,
  Activity,
  ThumbsUp,
  FileCheck,
  Building2,
  TrendingUp,
  Wrench,
  Layers,
  Calendar,
  HardDrive,
} from 'lucide-react';
import jsPDF from 'jspdf';
import { toCanvas } from 'html-to-image';
import { Property, Room, Guest, Reservation, HotelKPIs } from '../types';
import {
  initialMonthlyRevenueData,
  initialRoomCategoryBookingStats,
  initialRoomProblemsStats,
  initialCustomerProblemsStats,
  initialGuestFeedbackRecords,
} from '../data/analyticsData';
import { exportReportToGoogleDocs } from '../lib/googleWorkspace';
import { WorkspaceExportModal } from './modals/WorkspaceExportModal';

interface OverviewReportProps {
  property: Property | null;
  rooms?: Room[];
  guests?: Guest[];
  reservations?: Reservation[];
  kpis?: HotelKPIs | null;
}

type ReportTab = 'financial' | 'operations' | 'both';

export const OverviewReport: React.FC<OverviewReportProps> = ({
  property,
  rooms = [],
  guests = [],
  reservations = [],
  kpis,
}) => {
  const financialReportRef = useRef<HTMLDivElement>(null);
  const operationsReportRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState<ReportTab>('financial');
  const [downloadingType, setDownloadingType] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [docsModalConfig, setDocsModalConfig] = useState<{
    isOpen: boolean;
    type: 'financial' | 'operations' | 'both';
    title: string;
  }>({
    isOpen: false,
    type: 'financial',
    title: 'Export Financial & Yield Audit to Google Docs',
  });

  // Financial & Operational Data from Analytics
  const monthlyData = initialMonthlyRevenueData;
  const categoryStats = initialRoomCategoryBookingStats;
  const roomProblems = initialRoomProblemsStats;
  const customerProblems = initialCustomerProblemsStats;
  const feedbacks = initialGuestFeedbackRecords;

  // Key Calculations
  const totalYTDRevenue = monthlyData.reduce((acc, curr) => acc + curr.totalRevenue, 0);
  const totalBudget = monthlyData.reduce((acc, curr) => acc + curr.budgetRevenue, 0);
  const budgetVariance = ((totalYTDRevenue - totalBudget) / totalBudget) * 100;
  const totalBookings = categoryStats.reduce((acc, curr) => acc + curr.bookings, 0);
  const totalIncidents = customerProblems.reduce((acc, curr) => acc + curr.count, 0);
  const avgResolutionTime = (
    customerProblems.reduce((acc, curr) => acc + curr.avgResolutionMins * curr.count, 0) / totalIncidents
  ).toFixed(1);

  // Show Toast Helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Dedicated High-Resolution Aspect-Preserving PDF Generator (Zero Squeezing)
  const exportElementToPdf = async (element: HTMLElement, filename: string) => {
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
    // Preserve natural aspect ratio without squeezing or vertical distortion
    const pdfHeightMm = (canvas.height * pdfWidthMm) / canvas.width;

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [pdfWidthMm, Math.max(297, pdfHeightMm)],
      compress: true,
    });

    const pageDataUrl = canvas.toDataURL('image/jpeg', 0.95);
    pdf.addImage(pageDataUrl, 'JPEG', 0, 0, pdfWidthMm, pdfHeightMm, undefined, 'FAST');
    pdf.save(filename);
  };

  // 1. Download Financial & Yield Report Separately
  const handleDownloadFinancialReport = async () => {
    if (!financialReportRef.current) return;
    setDownloadingType('financial');
    try {
      const timestamp = new Date().toISOString().slice(0, 10);
      const propertySlug = property?.name?.replace(/\s+/g, '_') || 'Meridian';
      const filename = `INNtelligence_Financial_Audit_Report_${propertySlug}_${timestamp}.pdf`;
      await exportElementToPdf(financialReportRef.current, filename);
      showToast('Financial Performance & Yield Audit Report successfully downloaded!');
    } catch (err) {
      console.error('Failed to export Financial PDF:', err);
      window.print();
    } finally {
      setDownloadingType(null);
    }
  };

  // 2. Download Operations & Engineering Report Separately
  const handleDownloadOperationsReport = async () => {
    if (!operationsReportRef.current) return;
    setDownloadingType('operations');
    try {
      const timestamp = new Date().toISOString().slice(0, 10);
      const propertySlug = property?.name?.replace(/\s+/g, '_') || 'Meridian';
      const filename = `INNtelligence_Operations_Diagnostics_Report_${propertySlug}_${timestamp}.pdf`;
      await exportElementToPdf(operationsReportRef.current, filename);
      showToast('Operations, Engineering & Guest Diagnostics Report successfully downloaded!');
    } catch (err) {
      console.error('Failed to export Operations PDF:', err);
      window.print();
    } finally {
      setDownloadingType(null);
    }
  };

  // 3. Download Both Reports Sequentially
  const handleDownloadBoth = async () => {
    setDownloadingType('both');
    try {
      const timestamp = new Date().toISOString().slice(0, 10);
      const propertySlug = property?.name?.replace(/\s+/g, '_') || 'Meridian';

      if (financialReportRef.current) {
        const fn1 = `1_INNtelligence_Financial_Report_${propertySlug}_${timestamp}.pdf`;
        await exportElementToPdf(financialReportRef.current, fn1);
      }

      // Small pause between downloads to ensure smooth browser handling
      await new Promise((res) => setTimeout(res, 800));

      if (operationsReportRef.current) {
        const fn2 = `2_INNtelligence_Operations_Report_${propertySlug}_${timestamp}.pdf`;
        await exportElementToPdf(operationsReportRef.current, fn2);
      }

      showToast('Both Financial and Operations Executive Reports have been downloaded separately!');
    } catch (err) {
      console.error('Failed to export both PDFs:', err);
      window.print();
    } finally {
      setDownloadingType(null);
    }
  };

  return (
    <div className="space-y-6 pb-16 animate-fadeIn">
      {/* 1. Control Header & Separate Report Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-lg shadow-amber-500/10">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-serif italic font-bold text-white tracking-tight">
                Executive Audit Reports
              </h1>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <FileCheck className="w-3 h-3 text-emerald-400" />
              Audited 2026
            </span>
          </div>
          <p className="text-xs sm:text-sm text-white/50 max-w-3xl">
            Split into two independent, uncompressed executive dossiers for high-resolution review and discrete PDF downloads.
          </p>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Google Docs Export Button (Active Report) */}
          <button
            onClick={() =>
              setDocsModalConfig({
                isOpen: true,
                type: activeTab,
                title:
                  activeTab === 'financial'
                    ? 'Export Financial & Yield Audit to Google Docs'
                    : activeTab === 'operations'
                    ? 'Export Operational & SLA Report to Google Docs'
                    : 'Export Master Executive Dossier to Google Docs',
              })
            }
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 text-xs font-bold font-mono uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-lg shadow-blue-500/10"
            title="Upload currently active report to Google Docs in Google Drive"
          >
            <FileText className="w-3.5 h-3.5 text-blue-400" />
            <span>
              Export {activeTab === 'financial' ? 'Financial' : activeTab === 'operations' ? 'Operations' : 'Master'}{' '}
              to Docs
            </span>
          </button>

          {/* Export All 3 Reports to Google Docs */}
          <button
            onClick={() =>
              setDocsModalConfig({
                isOpen: true,
                type: 'both',
                title: 'Export Master Hospitality Audit (All 3 Reports) to Google Docs',
              })
            }
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/15 text-xs font-mono transition-all active:scale-95 cursor-pointer"
            title="Export complete 360-degree audit dossiers to Google Docs"
          >
            <HardDrive className="w-3.5 h-3.5 text-amber-400" />
            <span>Export All to Docs</span>
          </button>

          {/* Download Report 1 (Financial) */}
          <button
            onClick={handleDownloadFinancialReport}
            disabled={downloadingType !== null}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            title="Download Financial & Yield Audit as PDF"
          >
            {downloadingType === 'financial' ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span>PDF 1</span>
          </button>

          {/* Download Report 2 (Operations) */}
          <button
            onClick={handleDownloadOperationsReport}
            disabled={downloadingType !== null}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            title="Download Engineering & SLA Diagnostics as PDF"
          >
            {downloadingType === 'operations' ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Wrench className="w-3.5 h-3.5 text-cyan-400" />
            )}
            <span>PDF 2</span>
          </button>

          {/* Download Both */}
          <button
            onClick={handleDownloadBoth}
            disabled={downloadingType !== null}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/10 hover:bg-white/15 text-white border border-white/20 text-xs font-medium transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            title="Download both individual PDFs sequentially"
          >
            {downloadingType === 'both' ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span>Both PDFs</span>
          </button>

          {/* Native Print */}
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 text-xs font-medium transition-all active:scale-95 cursor-pointer"
            title="Open browser print dialog"
          >
            <Printer className="w-3.5 h-3.5 text-white/60" />
          </button>
        </div>
      </div>

      {/* Success Notification Toast */}
      {toastMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between shadow-xl animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-400 hover:text-white text-xs font-bold cursor-pointer ml-4">
            Dismiss
          </button>
        </div>
      )}

      {/* 2. Interactive Report Selector Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-1.5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('financial')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'financial'
                ? 'bg-amber-500 text-black font-bold shadow-lg shadow-amber-500/20'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Report 1: Financial & Yield Audit</span>
          </button>

          <button
            onClick={() => setActiveTab('operations')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'operations'
                ? 'bg-cyan-500 text-black font-bold shadow-lg shadow-cyan-500/20'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Report 2: Operations & Guest Diagnostics</span>
          </button>

          <button
            onClick={() => setActiveTab('both')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'both'
                ? 'bg-white/20 text-white font-bold'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>View Both Reports</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 text-[11px] font-mono text-white/40">
          <span>Property: {property?.name || 'The Meridian Kolkata'}</span>
          <span>&bull;</span>
          <span>Fiscal 2026</span>
        </div>
      </div>

      {/* 3. REPORT DOCUMENTS CONTAINER */}
      <div className="space-y-12">
        {/* ========================================================================= */}
        {/* REPORT 1: FINANCIAL PERFORMANCE & YIELD AUDIT DOSSIER                    */}
        {/* ========================================================================= */}
        {(activeTab === 'financial' || activeTab === 'both') && (
          <div className="space-y-3">
            {/* Quick Header Bar with Standalone Action */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                <h2 className="text-sm font-serif italic font-bold text-amber-400 uppercase tracking-wider">
                  Report 1: Executive Financial & Yield Performance Dossier
                </h2>
              </div>
              <button
                onClick={handleDownloadFinancialReport}
                disabled={downloadingType !== null}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-medium transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save Financial PDF</span>
              </button>
            </div>

            {/* Rendered Financial Report Document Sheet */}
            <div
              ref={financialReportRef}
              id="financial-report-sheet"
              className="pdf-page-sheet w-full max-w-5xl mx-auto rounded-3xl bg-[#0D0E11] border border-white/10 shadow-2xl p-6 sm:p-10 space-y-7 text-white relative font-sans overflow-hidden"
            >
              {/* Top Gold Accent Bar */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600" />

              {/* Dossier Header */}
              <div className="border-b border-white/10 pb-6 space-y-4 relative z-10">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-widest uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                        Confidential &bull; Financial Operations & Yield Dossier
                      </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-serif italic font-bold text-white tracking-tight">
                      {property?.name || 'The Meridian Kolkata'}
                    </h1>
                    <p className="text-xs text-white/50 font-mono">
                      {property?.location || 'Ballygunge Circular Road, Kolkata, West Bengal'} &bull; 5-Star Heritage Luxury &bull; 24 Keys Inventory
                    </p>
                  </div>

                  {/* Document Meta Box */}
                  <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 text-right space-y-1 font-mono text-[11px] shrink-0 min-w-[210px]">
                    <div className="flex justify-between gap-3 text-white/40">
                      <span>Report ID:</span>
                      <span className="text-amber-400 font-bold">INN-FIN-2026-08</span>
                    </div>
                    <div className="flex justify-between gap-3 text-white/40">
                      <span>Audit Scope:</span>
                      <span className="text-white">YTD Jan - Aug 2026</span>
                    </div>
                    <div className="flex justify-between gap-3 text-white/40">
                      <span>Generated:</span>
                      <span className="text-white">22 Aug 2026</span>
                    </div>
                    <div className="flex justify-between gap-3 text-white/40">
                      <span>Sign-off:</span>
                      <span className="text-emerald-400 font-bold">CFO & General Manager</span>
                    </div>
                  </div>
                </div>

                {/* Financial KPI Highlights Ribbon */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
                  <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
                    <span className="text-[10px] font-mono uppercase text-white/40 block">YTD Gross Revenue</span>
                    <span className="text-xl font-serif font-bold text-amber-400">₹{(totalYTDRevenue / 100).toFixed(2)} Cr</span>
                    <span className="text-[10px] text-emerald-400 font-mono block font-semibold">+13.5% vs Budget</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
                    <span className="text-[10px] font-mono uppercase text-white/40 block">Annual Budget Target</span>
                    <span className="text-xl font-serif font-bold text-white">₹{(totalBudget / 100).toFixed(2)} Cr</span>
                    <span className="text-[10px] text-cyan-400 font-mono block">Variance: +₹1.76 Cr</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
                    <span className="text-[10px] font-mono uppercase text-white/40 block">Average Daily Rate (ADR)</span>
                    <span className="text-xl font-serif font-bold text-white">₹8,850</span>
                    <span className="text-[10px] text-amber-300 font-mono block">RevPAR: ₹6,885</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
                    <span className="text-[10px] font-mono uppercase text-white/40 block">Average Occupancy</span>
                    <span className="text-xl font-serif font-bold text-emerald-400">77.8%</span>
                    <span className="text-[10px] text-white/40 font-mono block">Peak Proj: 96.5% (Oct-Dec)</span>
                  </div>
                </div>
              </div>

              {/* Section 1: Executive Financial Commentary */}
              <div className="space-y-2.5 relative z-10">
                <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <h2 className="text-sm sm:text-base font-serif italic font-bold text-white">
                    1. Executive Financial Summary & Yield Commentary
                  </h2>
                </div>
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2 text-xs text-white/70 leading-relaxed">
                  <p>
                    Through the first eight months of 2026, <strong>The Meridian Kolkata</strong> achieved exceptional revenue pacing, generating <strong className="text-amber-400">₹14.82 Crores</strong> against a scheduled budget of ₹13.06 Crores (<strong className="text-emerald-400">+13.5% positive variance</strong>). Room tariff contributions represented 61.2% of top-line earnings, while Food & Beverage (24.8%) and Banqueting/Spa (14.0%) experienced accelerated yields during regional business symposia and wedding seasons.
                  </p>
                  <p>
                    Occupancy remained resilient at an average of <strong>77.8%</strong>, with ADR closing at <strong>₹8,850</strong>. Strategic forward bookings for the Q4 Durga Puja and winter tourism window indicate robust demand, supporting a dynamic yield uplift (+25%) across all suite classes.
                  </p>
                </div>
              </div>

              {/* Section 2: 12-Month Financial Performance & Revenue Audit Table */}
              <div className="space-y-2.5 relative z-10">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-amber-400" />
                    <h2 className="text-sm sm:text-base font-serif italic font-bold text-white">
                      2. 12-Month Financial Performance & Departmental Revenue Audit
                    </h2>
                  </div>
                  <span className="text-[11px] font-mono text-white/40">Figures in ₹ Lakhs</span>
                </div>

                <div className="rounded-2xl border border-white/10 overflow-hidden bg-white/[0.01]">
                  <table className="w-full text-left font-mono text-[11px]">
                    <thead className="bg-white/5 border-b border-white/10 text-amber-400 font-semibold">
                      <tr>
                        <th className="py-2.5 px-3">Month</th>
                        <th className="py-2.5 px-3 text-right">Room Tariff</th>
                        <th className="py-2.5 px-3 text-right">F&B Dining</th>
                        <th className="py-2.5 px-3 text-right">Banquet/Spa</th>
                        <th className="py-2.5 px-3 text-right">Total Actual</th>
                        <th className="py-2.5 px-3 text-right">Budget</th>
                        <th className="py-2.5 px-3 text-right">Variance</th>
                        <th className="py-2.5 px-3 text-right">Occ %</th>
                        <th className="py-2.5 px-3 text-right">ADR</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {monthlyData.map((row, idx) => {
                        const diff = row.totalRevenue - row.budgetRevenue;
                        const isPositive = diff >= 0;
                        return (
                          <tr key={row.month} className={idx % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.01]'}>
                            <td className="py-2 px-3 font-medium text-white">{row.month}</td>
                            <td className="py-2 px-3 text-right text-white/70 tabular-nums">₹{row.roomRevenue.toFixed(1)}L</td>
                            <td className="py-2 px-3 text-right text-white/70 tabular-nums">₹{row.foodBeverageRevenue.toFixed(1)}L</td>
                            <td className="py-2 px-3 text-right text-white/70 tabular-nums">₹{row.banquetSpaRevenue.toFixed(1)}L</td>
                            <td className="py-2 px-3 text-right font-bold text-amber-400 tabular-nums">₹{row.totalRevenue.toFixed(1)}L</td>
                            <td className="py-2 px-3 text-right text-white/40 tabular-nums">₹{row.budgetRevenue.toFixed(1)}L</td>
                            <td className={`py-2 px-3 text-right font-bold tabular-nums ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {isPositive ? `+₹${diff.toFixed(1)}L` : `-₹${Math.abs(diff).toFixed(1)}L`}
                            </td>
                            <td className="py-2 px-3 text-right text-cyan-400 tabular-nums">{row.occupancyRate}%</td>
                            <td className="py-2 px-3 text-right text-white tabular-nums">₹{row.adr.toLocaleString('en-IN')}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-white/5 border-t border-white/10 font-bold text-white text-[11px]">
                      <tr>
                        <td className="py-2.5 px-3">Annual / YTD Total</td>
                        <td className="py-2.5 px-3 text-right tabular-nums">₹{monthlyData.reduce((a, b) => a + b.roomRevenue, 0).toFixed(1)}L</td>
                        <td className="py-2.5 px-3 text-right tabular-nums">₹{monthlyData.reduce((a, b) => a + b.foodBeverageRevenue, 0).toFixed(1)}L</td>
                        <td className="py-2.5 px-3 text-right tabular-nums">₹{monthlyData.reduce((a, b) => a + b.banquetSpaRevenue, 0).toFixed(1)}L</td>
                        <td className="py-2.5 px-3 text-right text-amber-400 tabular-nums">₹{totalYTDRevenue.toFixed(1)}L</td>
                        <td className="py-2.5 px-3 text-right text-white/40 tabular-nums">₹{totalBudget.toFixed(1)}L</td>
                        <td className="py-2.5 px-3 text-right text-emerald-400 tabular-nums">+{budgetVariance.toFixed(1)}%</td>
                        <td className="py-2.5 px-3 text-right text-cyan-400 tabular-nums">77.8% avg</td>
                        <td className="py-2.5 px-3 text-right tabular-nums">₹8,850 avg</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Section 3: Room Category Inventory & Yield Distribution */}
              <div className="space-y-2.5 relative z-10">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <div className="flex items-center gap-2">
                    <PieChartIcon className="w-4 h-4 text-amber-400" />
                    <h2 className="text-sm sm:text-base font-serif italic font-bold text-white">
                      3. Room Category Inventory & Yield Distribution
                    </h2>
                  </div>
                  <span className="text-[11px] font-mono text-white/40">Total Inventory: 24 Keys</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {categoryStats.map((item) => (
                    <div
                      key={item.category}
                      className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1.5 text-xs"
                    >
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="font-serif italic font-bold text-white truncate">{item.category}</span>
                      </div>
                      <div className="pt-1 text-[11px] font-mono text-white/50 space-y-1">
                        <div className="flex justify-between">
                          <span>Booking Share:</span>
                          <span className="text-amber-400 font-bold">{item.percentage}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Volume:</span>
                          <span className="text-white">{item.bookings} stays</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Avg Stay:</span>
                          <span className="text-white">{item.avgStayNights} nights</span>
                        </div>
                        <div className="flex justify-between pt-1 border-t border-white/5">
                          <span>Gross Yield:</span>
                          <span className="text-emerald-400 font-bold">₹{(item.revenue / 100000).toFixed(1)}L</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 4: Directives & Controller Sign-off */}
              <div className="space-y-4 pt-2 border-t border-white/10 relative z-10">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <h2 className="text-sm sm:text-base font-serif italic font-bold text-white">
                    4. Strategic Revenue Directives & Financial Controller Sign-Off
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-white/70 font-mono">
                  <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                    <span className="text-amber-400 font-bold block text-[11px]">Durga Puja Dynamic Yield Pricing:</span>
                    <p className="text-[10px] text-white/60">
                      Lock unbooked Deluxe King & Presidential inventory at premium festive tariffs (+25% yield) to capture projected ₹1.99 Cr October surge.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                    <span className="text-amber-400 font-bold block text-[11px]">Direct Booking Channel Expansion:</span>
                    <p className="text-[10px] text-white/60">
                      Increase direct OTA-free reservation incentives by offering complimentary airport transfers, protecting net GOP margins.
                    </p>
                  </div>
                </div>

                {/* Validation Sign-off */}
                <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-white/10 text-xs font-mono">
                  <div className="space-y-0.5">
                    <div className="text-white/40 text-[9px] uppercase tracking-wider">Financial Validation</div>
                    <div className="text-emerald-400 flex items-center gap-1.5 font-bold text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>FINANCIAL AUDIT VERIFIED & CERTIFIED</span>
                    </div>
                    <div className="text-white/30 text-[9px]">Ledger Hash: 9c2e41a7b8d0e5f2a1b3c4d5e6f7a8b9</div>
                  </div>

                  <div className="text-right space-y-0.5 border-t sm:border-t-0 pt-2 sm:pt-0">
                    <div className="font-serif italic font-bold text-amber-400 text-sm">Rajesh Ghosh, FCA</div>
                    <div className="text-white/60 text-[10px]">Chief Financial Officer & Director of Revenue</div>
                    <div className="text-white/30 text-[9px]">The Meridian Kolkata Hotel & Suites</div>
                  </div>
                </div>
              </div>

              {/* Running Footer */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-white/40">
                <span>INNtelligence Hospitality Analytics &bull; Financial & Yield Dossier</span>
                <span className="font-bold text-amber-400">Report 1 of 2</span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* REPORT 2: ENGINEERING, HARDWARE & GUEST DIAGNOSTICS DOSSIER              */}
        {/* ========================================================================= */}
        {(activeTab === 'operations' || activeTab === 'both') && (
          <div className="space-y-3">
            {/* Quick Header Bar with Standalone Action */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                <h2 className="text-sm font-serif italic font-bold text-cyan-400 uppercase tracking-wider">
                  Report 2: Engineering, Hardware & Guest Diagnostics Dossier
                </h2>
              </div>
              <button
                onClick={handleDownloadOperationsReport}
                disabled={downloadingType !== null}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-xs font-medium transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save Operations PDF</span>
              </button>
            </div>

            {/* Rendered Operations Report Document Sheet */}
            <div
              ref={operationsReportRef}
              id="operations-report-sheet"
              className="pdf-page-sheet w-full max-w-5xl mx-auto rounded-3xl bg-[#0D0E11] border border-white/10 shadow-2xl p-6 sm:p-10 space-y-7 text-white relative font-sans overflow-hidden"
            >
              {/* Top Cyan Accent Bar */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-600 via-cyan-400 to-cyan-600" />

              {/* Dossier Header */}
              <div className="border-b border-white/10 pb-6 space-y-4 relative z-10">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-widest uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
                        Confidential &bull; Operational Engineering & Guest SLA Dossier
                      </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-serif italic font-bold text-white tracking-tight">
                      {property?.name || 'The Meridian Kolkata'}
                    </h1>
                    <p className="text-xs text-white/50 font-mono">
                      Engineering Maintenance, Departmental SLAs & Guest Experience Audit &bull; 24 Keys
                    </p>
                  </div>

                  {/* Document Meta Box */}
                  <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 text-right space-y-1 font-mono text-[11px] shrink-0 min-w-[210px]">
                    <div className="flex justify-between gap-3 text-white/40">
                      <span>Report ID:</span>
                      <span className="text-cyan-400 font-bold">INN-OPS-2026-08</span>
                    </div>
                    <div className="flex justify-between gap-3 text-white/40">
                      <span>Audit Scope:</span>
                      <span className="text-white">Hardware, SLAs & Reviews</span>
                    </div>
                    <div className="flex justify-between gap-3 text-white/40">
                      <span>Resolution SLA:</span>
                      <span className="text-emerald-400 font-bold">94.8% on target</span>
                    </div>
                    <div className="flex justify-between gap-3 text-white/40">
                      <span>Sign-off:</span>
                      <span className="text-cyan-400 font-bold">Director of Engineering</span>
                    </div>
                  </div>
                </div>

                {/* Operational KPI Highlights Ribbon */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
                  <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
                    <span className="text-[10px] font-mono uppercase text-white/40 block">Maintenance Tickets</span>
                    <span className="text-xl font-serif font-bold text-white">{totalIncidents} Resolved</span>
                    <span className="text-[10px] text-emerald-400 font-mono block font-semibold">94.8% Resolved in SLA</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
                    <span className="text-[10px] font-mono uppercase text-white/40 block">Avg Resolution Time</span>
                    <span className="text-xl font-serif font-bold text-cyan-400">{avgResolutionTime} mins</span>
                    <span className="text-[10px] text-white/40 font-mono block">Mandated SLA: &lt; 15 mins</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
                    <span className="text-[10px] font-mono uppercase text-white/40 block">Guest CSAT Index</span>
                    <span className="text-xl font-serif font-bold text-amber-400">4.8 / 5.0</span>
                    <span className="text-[10px] text-emerald-400 font-mono block">92.4% Positive Reviews</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
                    <span className="text-[10px] font-mono uppercase text-white/40 block">Turnover Efficiency</span>
                    <span className="text-xl font-serif font-bold text-white">28 mins</span>
                    <span className="text-[10px] text-emerald-400 font-mono block">Housekeeping Readiness</span>
                  </div>
                </div>
              </div>

              {/* Section 1: Engineering & SLA Operational State */}
              <div className="space-y-2.5 relative z-10">
                <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <h2 className="text-sm sm:text-base font-serif italic font-bold text-white">
                    1. Engineering Diagnostics & Service Level Briefing
                  </h2>
                </div>
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2 text-xs text-white/70 leading-relaxed">
                  <p>
                    Throughout 2026, the engineering and property facilities team maintained exceptional infrastructure uptime across all 24 luxury guest keys. Out of <strong>{totalIncidents} logged maintenance and service requests</strong>, <strong>94.8%</strong> were rectified within the property's mandated 15-minute SLA threshold, with an average turnaround time of <strong>{avgResolutionTime} minutes</strong>.
                  </p>
                  <p>
                    Primary hardware friction centered around high-load Wi-Fi streaming during international business conferences (resolved with proactive mesh repeaters) and vintage analog thermostat recalibrations in the Heritage Suites.
                  </p>
                </div>
              </div>

              {/* Section 2: Room-Specific Hardware & Engineering Diagnostics Table */}
              <div className="space-y-2.5 relative z-10">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <div className="flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-cyan-400" />
                    <h2 className="text-sm sm:text-base font-serif italic font-bold text-white">
                      2. Room-Specific Hardware & Engineering Diagnostics
                    </h2>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400">94.8% Overall Resolution SLA</span>
                </div>

                <div className="rounded-2xl border border-white/10 overflow-hidden bg-white/[0.01]">
                  <table className="w-full text-left font-mono text-[11px]">
                    <thead className="bg-white/5 border-b border-white/10 text-cyan-300 font-semibold">
                      <tr>
                        <th className="py-2.5 px-3">Room Category</th>
                        <th className="py-2.5 px-3 text-center">HVAC Cooling</th>
                        <th className="py-2.5 px-3 text-center">Wi-Fi / Mesh</th>
                        <th className="py-2.5 px-3 text-center">Plumbing</th>
                        <th className="py-2.5 px-3 text-center">Keycard Locks</th>
                        <th className="py-2.5 px-3 text-center">Housekeeping</th>
                        <th className="py-2.5 px-3 text-right">Total Issues</th>
                        <th className="py-2.5 px-3 text-right">Resolution SLA</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {roomProblems.map((row, idx) => (
                        <tr key={row.roomCategory} className={idx % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.01]'}>
                          <td className="py-2 px-3 font-medium text-white">{row.roomCategory}</td>
                          <td className="py-2 px-3 text-center text-white/70 tabular-nums">{row.hvacIssues}</td>
                          <td className="py-2 px-3 text-center text-white/70 tabular-nums">{row.wifiAvIssues}</td>
                          <td className="py-2 px-3 text-center text-white/70 tabular-nums">{row.plumbingIssues}</td>
                          <td className="py-2 px-3 text-center text-white/70 tabular-nums">{row.keycardLockIssues}</td>
                          <td className="py-2 px-3 text-center text-white/70 tabular-nums">{row.housekeepingIssues}</td>
                          <td className="py-2 px-3 text-right font-bold text-amber-400 tabular-nums">{row.totalProblems}</td>
                          <td className="py-2 px-3 text-right font-bold text-emerald-400 tabular-nums">{row.resolutionRate}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Section 3: Customer Friction Points & Root-Cause SLA Breakdown */}
              <div className="space-y-2.5 relative z-10">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <h2 className="text-sm sm:text-base font-serif italic font-bold text-white">
                      3. Customer Friction Points & Root-Cause SLA Breakdown
                    </h2>
                  </div>
                  <span className="text-[11px] font-mono text-white/40">Avg Resolution: {avgResolutionTime} mins</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                  {customerProblems.map((prob) => (
                    <div
                      key={prob.problemType}
                      className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-serif italic font-medium text-white truncate max-w-[170px]">
                          {prob.problemType}
                        </span>
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                            prob.severity === 'High'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : prob.severity === 'Medium'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {prob.severity}
                        </span>
                      </div>
                      <div className="flex justify-between text-[11px] text-white/40">
                        <span>Incidents: <strong className="text-white">{prob.count} ({prob.percentage}%)</strong></span>
                        <span className="text-cyan-400 font-semibold">SLA: {prob.avgResolutionMins}m</span>
                      </div>
                      <div className="text-[10px] text-white/30 truncate">
                        Dept: {prob.primaryDepartment}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 4: Verified Guest Experience & Service Recovery Logs */}
              <div className="space-y-2.5 relative z-10">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <div className="flex items-center gap-2">
                    <ThumbsUp className="w-4 h-4 text-amber-400" />
                    <h2 className="text-sm sm:text-base font-serif italic font-bold text-white">
                      4. Sample Verified Guest Feedback & Executive Recovery Logs
                    </h2>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400">CSAT: 4.8 / 5.0</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {feedbacks.slice(0, 4).map((fb) => (
                    <div
                      key={fb.id}
                      className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1.5 text-xs"
                    >
                      <div className="flex items-center justify-between font-mono text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <span className="font-serif italic font-bold text-white">{fb.guestName}</span>
                          <span className="text-white/40 text-[10px]">Rm {fb.roomNumber} ({fb.roomType})</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-amber-400 text-xs">{'★'.repeat(fb.rating)}</span>
                          <span className="text-[9px] text-emerald-400 font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">{fb.status}</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-white/70 italic leading-relaxed">&ldquo;{fb.comment}&rdquo;</p>
                      <div className="text-[10px] font-mono text-white/40 pt-1 border-t border-white/5">
                        Action Taken: <span className="text-cyan-300">{fb.actionTaken}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 5: Engineering Directives & GM Sign-off */}
              <div className="space-y-4 pt-2 border-t border-white/10 relative z-10">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <h2 className="text-sm sm:text-base font-serif italic font-bold text-white">
                    5. Preventative Engineering Directives & GM Sign-Off
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-white/70 font-mono">
                  <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                    <span className="text-cyan-400 font-bold block text-[11px]">1. Wi-Fi 6 Dedicated Mesh Nodes:</span>
                    <p className="text-[10px] text-white/60">
                      Install dedicated tri-band repeaters in 3rd & 4th floor executive suites prior to Q4 festival surge to mitigate high-bandwidth conference drops.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                    <span className="text-cyan-400 font-bold block text-[11px]">2. Smart Digital Thermostat Retrofit:</span>
                    <p className="text-[10px] text-white/60">
                      Complete smart IoT thermostat installation across Heritage Suites to prevent temperature variance complaints.
                    </p>
                  </div>
                </div>

                {/* Validation Sign-off */}
                <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-white/10 text-xs font-mono">
                  <div className="space-y-0.5">
                    <div className="text-white/40 text-[9px] uppercase tracking-wider">Engineering Validation</div>
                    <div className="text-cyan-400 flex items-center gap-1.5 font-bold text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>OPERATIONAL SLA AUDIT VERIFIED & CERTIFIED</span>
                    </div>
                    <div className="text-white/30 text-[9px]">Log Hash: 7b3a92e1c4d8f0a2b5e6f1c3d7e8a9b0</div>
                  </div>

                  <div className="text-right space-y-0.5 border-t sm:border-t-0 pt-2 sm:pt-0">
                    <div className="font-serif italic font-bold text-cyan-400 text-sm">Amit Sen</div>
                    <div className="text-white/60 text-[10px]">General Manager & Director of Operations</div>
                    <div className="text-white/30 text-[9px]">The Meridian Kolkata Hotel & Suites</div>
                  </div>
                </div>
              </div>

              {/* Running Footer */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-white/40">
                <span>INNtelligence Hospitality Analytics &bull; Operational & Engineering Dossier</span>
                <span className="font-bold text-cyan-400">Report 2 of 2</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Google Docs Export Modal */}
      <WorkspaceExportModal
        isOpen={docsModalConfig.isOpen}
        onClose={() => setDocsModalConfig((prev) => ({ ...prev, isOpen: false }))}
        targetType="doc"
        title={docsModalConfig.title}
        description={`This will generate and upload a comprehensive, high-resolution ${
          docsModalConfig.type === 'financial'
            ? 'Financial & Yield Performance Audit'
            : docsModalConfig.type === 'operations'
            ? 'Operational Quality & SLA Diagnostics Report'
            : 'Master 360-Degree Executive Hospitality Dossier'
        } directly into your Google Docs in Google Drive.`}
        itemSummary={[
          {
            label: 'Report Category',
            value:
              docsModalConfig.type === 'financial'
                ? 'Financial & Revenue Yield'
                : docsModalConfig.type === 'operations'
                ? 'Operations & Incident SLA'
                : 'Master Hospitality Dossier (Combined)',
          },
          { label: 'YTD Audited Revenue', value: `₹${(totalYTDRevenue / 10000000).toFixed(2)} Cr` },
          { label: 'Logged Incidents', value: `${totalIncidents} Tickets` },
          { label: 'Security & Integrity', value: 'Google Cloud Encrypted' },
        ]}
        onPerformExport={async (token) => {
          return await exportReportToGoogleDocs(token, docsModalConfig.type, property, kpis);
        }}
      />
    </div>
  );
};
