import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  DollarSign,
  PieChart as PieChartIcon,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ThumbsUp,
  Sparkles,
  Filter,
  ArrowUpRight,
  ShieldAlert,
  Send,
  Plus,
  RefreshCw,
  Zap,
  Bed,
  Hotel,
  Activity,
  Award,
  Download,
  FileCheck,
  Compass,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  initialMonthlyRevenueData,
  initialRoomCategoryBookingStats,
  initialRoomProblemsStats,
  initialCustomerProblemsStats,
  initialGuestFeedbackRecords,
} from '../data/analyticsData';
import {
  MonthlyRevenueData,
  RoomCategoryBookingStat,
  RoomProblemStat,
  CustomerProblemStat,
  GuestFeedbackRecord,
} from '../types';
import { FileText } from 'lucide-react';
import { FeedbackActionPlanModal } from './FeedbackActionPlanModal';

interface AnalyticsFeedbackProps {
  onNavigateTab?: (tab: 'reports') => void;
}

export const AnalyticsFeedback: React.FC<AnalyticsFeedbackProps> = ({ onNavigateTab }) => {
  // State for data
  const [revenueData] = useState<MonthlyRevenueData[]>(initialMonthlyRevenueData);
  const [roomCategoryStats] = useState<RoomCategoryBookingStat[]>(initialRoomCategoryBookingStats);
  const [roomProblemsStats] = useState<RoomProblemStat[]>(initialRoomProblemsStats);
  const [customerProblemsStats] = useState<CustomerProblemStat[]>(initialCustomerProblemsStats);
  const [feedbackRecords, setFeedbackRecords] = useState<GuestFeedbackRecord[]>(initialGuestFeedbackRecords);

  // Filter and Interactive States
  const [revenueChartMode, setRevenueChartMode] = useState<'stacked-revenue' | 'actual-vs-budget' | 'adr-revpar' | 'occupancy'>('stacked-revenue');
  const [selectedRoomCategory, setSelectedRoomCategory] = useState<string | null>(null);
  const [selectedCustomerProblem, setSelectedCustomerProblem] = useState<string | null>(null);
  const [feedbackFilter, setFeedbackFilter] = useState<'ALL' | 'Positive' | 'Negative' | 'Urgent'>('ALL');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');

  // Action Plan Modal State
  const [isActionPlanModalOpen, setIsActionPlanModalOpen] = useState(false);

  // New feedback log modal/form state
  const [isLogFeedbackOpen, setIsLogFeedbackOpen] = useState(false);
  const [newGuestName, setNewGuestName] = useState('');
  const [newRoomNumber, setNewRoomNumber] = useState('');
  const [newRoomType, setNewRoomType] = useState('Deluxe King');
  const [newRating, setNewRating] = useState(4);
  const [newCategory, setNewCategory] = useState('Wi-Fi Speed & Mesh Connectivity');
  const [newComment, setNewComment] = useState('');

  // Derived Totals & KPI Metrics
  const totalYTDRevenue = useMemo(() => {
    return revenueData.reduce((acc, curr) => acc + curr.totalRevenue, 0);
  }, [revenueData]);

  const totalBookings = useMemo(() => {
    return roomCategoryStats.reduce((acc, curr) => acc + curr.bookings, 0);
  }, [roomCategoryStats]);

  const totalCustomerProblems = useMemo(() => {
    return customerProblemsStats.reduce((acc, curr) => acc + curr.count, 0);
  }, [customerProblemsStats]);

  const totalRoomIncidents = useMemo(() => {
    return roomProblemsStats.reduce((acc, curr) => acc + curr.totalProblems, 0);
  }, [roomProblemsStats]);

  const avgResolutionTime = useMemo(() => {
    const sum = customerProblemsStats.reduce((acc, curr) => acc + curr.avgResolutionMins * curr.count, 0);
    return (sum / totalCustomerProblems).toFixed(1);
  }, [customerProblemsStats, totalCustomerProblems]);

  // Filtered Feedback Records
  const filteredFeedbacks = useMemo(() => {
    return feedbackRecords.filter((item) => {
      const matchesSentiment =
        feedbackFilter === 'ALL'
          ? true
          : feedbackFilter === 'Urgent'
          ? item.sentiment === 'Negative' && item.status !== 'Resolved'
          : item.sentiment === feedbackFilter;

      const matchesDept =
        departmentFilter === 'ALL'
          ? true
          : item.category.toLowerCase().includes(departmentFilter.toLowerCase());

      return matchesSentiment && matchesDept;
    });
  }, [feedbackRecords, feedbackFilter, departmentFilter]);

  // Action handlers
  const handleResolveFeedback = (id: string) => {
    setFeedbackRecords((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: 'Resolved',
              actionTaken: item.actionTaken || 'Marked as resolved by General Manager / Duty Ops.',
            }
          : item
      )
    );
  };

  const handleCreateFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuestName || !newRoomNumber || !newComment) return;

    const sentiment: 'Positive' | 'Neutral' | 'Negative' =
      newRating >= 4 ? 'Positive' : newRating === 3 ? 'Neutral' : 'Negative';

    const newRecord: GuestFeedbackRecord = {
      id: `fbk-${Date.now().toString().slice(-4)}`,
      guestName: newGuestName,
      roomNumber: newRoomNumber,
      roomType: newRoomType,
      stayDate: '22 Aug 2026',
      rating: newRating,
      sentiment,
      category: newCategory,
      comment: newComment,
      status: sentiment === 'Positive' ? 'Resolved' : 'In-Progress',
      assignedStaff: 'Duty Ops Manager',
      timestamp: 'Just now',
      actionTaken:
        sentiment === 'Negative'
          ? 'Urgent notification sent to relevant department head.'
          : 'Customer compliment logged in dossier.',
    };

    setFeedbackRecords((prev) => [newRecord, ...prev]);
    setNewGuestName('');
    setNewRoomNumber('');
    setNewComment('');
    setIsLogFeedbackOpen(false);
  };

  // Custom Chart Tooltips (Sophisticated Charcoal Glass with Gold Accent)
  const CustomRevenueTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0D0E11]/95 border border-amber-500/30 p-3.5 rounded-2xl shadow-2xl backdrop-blur-xl text-xs space-y-1.5 min-w-[200px]">
          <p className="font-serif italic font-bold text-amber-400 text-sm">{label}</p>
          <div className="space-y-1 pt-1 border-t border-white/10 font-mono">
            {payload.map((entry: any, index: number) => (
              <div key={`item-${index}`} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: entry.color || entry.stroke }}
                  />
                  <span className="text-white/60">{entry.name}:</span>
                </div>
                <span className="font-bold text-white">
                  {entry.name.includes('Rate') || entry.name.includes('RevPAR') || entry.name.includes('ADR')
                    ? `₹${entry.value.toLocaleString('en-IN')}`
                    : entry.name.includes('Occupancy')
                    ? `${entry.value}%`
                    : `₹${entry.value} Lakhs`}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#0D0E11]/95 border border-white/20 p-3 rounded-2xl shadow-2xl backdrop-blur-xl text-xs space-y-1 min-w-[180px]">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
            <span className="font-serif italic font-bold text-white text-sm">{data.category || data.problemType}</span>
          </div>
          <div className="pt-1 border-t border-white/10 space-y-0.5 font-mono text-[11px]">
            <div className="flex justify-between">
              <span className="text-white/40">Share:</span>
              <span className="text-amber-400 font-bold">{data.percentage}%</span>
            </div>
            {data.bookings && (
              <div className="flex justify-between">
                <span className="text-white/40">Total Bookings:</span>
                <span className="text-white">{data.bookings}</span>
              </div>
            )}
            {data.revenue && (
              <div className="flex justify-between">
                <span className="text-white/40">Gross Revenue:</span>
                <span className="text-emerald-400">₹{(data.revenue / 100000).toFixed(1)} Lakhs</span>
              </div>
            )}
            {data.count && (
              <div className="flex justify-between">
                <span className="text-white/40">Reported Incidents:</span>
                <span className="text-white">{data.count}</span>
              </div>
            )}
            {data.avgResolutionMins && (
              <div className="flex justify-between">
                <span className="text-white/40">Avg Resolution:</span>
                <span className="text-cyan-400">{data.avgResolutionMins} min</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0D0E11]/95 border border-amber-500/30 p-3.5 rounded-2xl shadow-2xl backdrop-blur-xl text-xs space-y-1.5 min-w-[210px]">
          <p className="font-serif italic font-bold text-amber-400 text-sm">Room Category: {label}</p>
          <div className="space-y-1 pt-1 border-t border-white/10 font-mono text-[11px]">
            {payload.map((entry: any, index: number) => (
              <div key={`bar-${index}`} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-white/60">{entry.name}:</span>
                </div>
                <span className="font-bold text-white">{entry.value} reports</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-7 pb-12 animate-fadeIn">
      {/* 1. Header & Summary Intelligence Matrix */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-serif italic font-bold text-white tracking-tight">
              Hospitality Intelligence & Feedback Matrix
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Live Analytics
            </span>
          </div>
          <p className="text-xs sm:text-sm text-white/50 max-w-3xl">
            12-Month revenue trajectories, room category booking distribution, pertinent in-room issues, and customer complaint diagnostics for The Meridian Kolkata.
          </p>
        </div>

        {/* Quick Operational Trigger */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => setIsActionPlanModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-gradient-to-r from-amber-500/20 to-amber-500/10 hover:from-amber-500/30 hover:to-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-all shadow-md shadow-amber-500/10 active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Next Steps Action Plan (PDF)</span>
          </button>

          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('reports')}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 text-xs font-medium transition-all active:scale-95"
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>Overview PDF Report</span>
            </button>
          )}

          <button
            onClick={() => setIsLogFeedbackOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all shadow-md shadow-amber-500/20 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Guest Feedback</span>
          </button>
        </div>
      </div>

      {/* 2. Top-Level Metric Badges (Charcoal glass with gold rim) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* YTD Gross Revenue */}
        <div className="p-4 rounded-3xl bg-[#0D0E11]/90 border border-white/10 space-y-2 relative overflow-hidden backdrop-blur-md group hover:border-amber-400/30 transition-all shadow-xl">
          <div className="absolute top-0 right-0 w-24 h-10 bg-gradient-to-l from-amber-400/15 via-white/5 to-transparent pointer-events-none rounded-tr-3xl" />
          <div className="flex items-center justify-between text-white/40">
            <span className="text-[10px] font-mono uppercase tracking-wider">YTD Revenue</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="space-y-0.5">
            <div className="text-xl sm:text-2xl font-serif font-bold text-white">
              ₹{(totalYTDRevenue / 100).toFixed(2)} Cr
            </div>
            <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
              <ArrowUpRight className="w-3 h-3" />
              <span>+18.4% vs 2025</span>
            </div>
          </div>
        </div>

        {/* Avg ADR (Average Daily Rate) */}
        <div className="p-4 rounded-3xl bg-[#0D0E11]/90 border border-white/10 space-y-2 relative overflow-hidden backdrop-blur-md group hover:border-emerald-400/30 transition-all shadow-xl">
          <div className="absolute top-0 right-0 w-24 h-10 bg-gradient-to-l from-emerald-500/15 via-white/5 to-transparent pointer-events-none rounded-tr-3xl" />
          <div className="flex items-center justify-between text-white/40">
            <span className="text-[10px] font-mono uppercase tracking-wider">Avg Daily Rate (ADR)</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="space-y-0.5">
            <div className="text-xl sm:text-2xl font-serif font-bold text-white">₹8,850</div>
            <span className="text-[10px] text-white/40 font-mono">RevPAR: ₹6,885</span>
          </div>
        </div>

        {/* Total Bookings Handled */}
        <div className="p-4 rounded-3xl bg-[#0D0E11]/90 border border-white/10 space-y-2 relative overflow-hidden backdrop-blur-md group hover:border-cyan-400/30 transition-all shadow-xl">
          <div className="absolute top-0 right-0 w-24 h-10 bg-gradient-to-l from-cyan-500/15 via-white/5 to-transparent pointer-events-none rounded-tr-3xl" />
          <div className="flex items-center justify-between text-white/40">
            <span className="text-[10px] font-mono uppercase tracking-wider">Total Bookings</span>
            <Hotel className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="space-y-0.5">
            <div className="text-xl sm:text-2xl font-serif font-bold text-white">{totalBookings.toLocaleString('en-IN')}</div>
            <span className="text-[10px] text-cyan-400 font-mono">Top: Deluxe King (38%)</span>
          </div>
        </div>

        {/* Customer Satisfaction Score */}
        <div className="p-4 rounded-3xl bg-[#0D0E11]/90 border border-white/10 space-y-2 relative overflow-hidden backdrop-blur-md group hover:border-amber-400/30 transition-all shadow-xl">
          <div className="absolute top-0 right-0 w-24 h-10 bg-gradient-to-l from-amber-400/15 via-white/5 to-transparent pointer-events-none rounded-tr-3xl" />
          <div className="flex items-center justify-between text-white/40">
            <span className="text-[10px] font-mono uppercase tracking-wider">Guest CSAT Index</span>
            <ThumbsUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="space-y-0.5">
            <div className="text-xl sm:text-2xl font-serif font-bold text-white">4.8 / 5.0</div>
            <span className="text-[10px] text-emerald-400 font-mono">92.4% Positive Feedback</span>
          </div>
        </div>

        {/* Problem Resolution SLA */}
        <div className="p-4 rounded-3xl bg-[#0D0E11]/90 border border-white/10 space-y-2 relative overflow-hidden backdrop-blur-md group hover:border-rose-400/30 transition-all shadow-xl col-span-2 lg:col-span-1">
          <div className="absolute top-0 right-0 w-24 h-10 bg-gradient-to-l from-rose-500/15 via-white/5 to-transparent pointer-events-none rounded-tr-3xl" />
          <div className="flex items-center justify-between text-white/40">
            <span className="text-[10px] font-mono uppercase tracking-wider">Avg Resolution SLA</span>
            <Zap className="w-4 h-4 text-rose-400" />
          </div>
          <div className="space-y-0.5">
            <div className="text-xl sm:text-2xl font-serif font-bold text-white">{avgResolutionTime} min</div>
            <span className="text-[10px] text-emerald-400 font-mono">94.8% Same-Hour Close</span>
          </div>
        </div>
      </div>

      {/* 3. GRAPH 1: Monthly Revenue Trajectory & Yield Performance */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#0D0E11]/90 border border-white/10 space-y-5 shadow-2xl backdrop-blur-md relative overflow-hidden">
        {/* Subtle Gold / White Light Rim Accent at top-right edge */}
        <div className="absolute top-0 right-0 w-80 h-28 bg-gradient-to-l from-amber-400/10 via-white/5 to-transparent pointer-events-none rounded-tr-3xl" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg sm:text-xl font-serif italic font-bold text-white">
                Monthly Revenue Performance & Financial Trajectory
              </h2>
            </div>
            <p className="text-xs text-white/40">
              12-Month revenue breakdown (Jan 2026 – Dec 2026), Room Tariffs, F&B/Banquets yield, and Budget Target benchmarks (Values in ₹ Lakhs).
            </p>
          </div>

          {/* Metric View Switcher */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-white/5 border border-white/10 shrink-0">
            <button
              onClick={() => setRevenueChartMode('stacked-revenue')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                revenueChartMode === 'stacked-revenue'
                  ? 'bg-amber-500 text-black font-semibold shadow-md shadow-amber-500/20'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              Revenue Streams
            </button>
            <button
              onClick={() => setRevenueChartMode('actual-vs-budget')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                revenueChartMode === 'actual-vs-budget'
                  ? 'bg-amber-500 text-black font-semibold shadow-md shadow-amber-500/20'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              Actual vs Budget
            </button>
            <button
              onClick={() => setRevenueChartMode('adr-revpar')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                revenueChartMode === 'adr-revpar'
                  ? 'bg-amber-500 text-black font-semibold shadow-md shadow-amber-500/20'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              ADR & RevPAR
            </button>
            <button
              onClick={() => setRevenueChartMode('occupancy')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                revenueChartMode === 'occupancy'
                  ? 'bg-amber-500 text-black font-semibold shadow-md shadow-amber-500/20'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              Occupancy %
            </button>
          </div>
        </div>

        {/* Seasonal Callout Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 relative z-10">
          <div className="px-3.5 py-2 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs">
            <span className="text-white/40">Current Month (August)</span>
            <span className="font-mono font-bold text-amber-400">₹1.39 Cr (81.4% to Target)</span>
          </div>
          <div className="px-3.5 py-2 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs">
            <span className="text-white/40">Q4 Festive High (Oct-Dec)</span>
            <span className="font-mono font-bold text-emerald-400">₹5.90 Cr Projected Peak</span>
          </div>
          <div className="px-3.5 py-2 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs">
            <span className="text-white/40">Durga Puja High (Oct)</span>
            <span className="font-mono font-bold text-cyan-400">94.2% Occupancy Rate</span>
          </div>
        </div>

        {/* Chart Canvas */}
        <div className="h-72 sm:h-84 w-full pt-2 relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            {revenueChartMode === 'stacked-revenue' ? (
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="roomRevGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="fbRevGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="banquetRevGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="shortMonth" stroke="#ffffff40" tick={{ fontSize: 11, fill: '#ffffff60' }} />
                <YAxis stroke="#ffffff40" tick={{ fontSize: 11, fill: '#ffffff60' }} />
                <Tooltip content={<CustomRevenueTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: 10, fontSize: 11 }}
                  formatter={(value) => <span className="text-white/70">{value}</span>}
                />
                <Area
                  type="monotone"
                  dataKey="roomRevenue"
                  name="Room Tariff Revenue"
                  stackId="1"
                  stroke="#F59E0B"
                  fill="url(#roomRevGrad)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="foodBeverageRevenue"
                  name="F&B & In-Room Dining"
                  stackId="1"
                  stroke="#10B981"
                  fill="url(#fbRevGrad)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="banquetSpaRevenue"
                  name="Banquets & Heritage Spa"
                  stackId="1"
                  stroke="#06B6D4"
                  fill="url(#banquetRevGrad)"
                  strokeWidth={2}
                />
              </AreaChart>
            ) : revenueChartMode === 'actual-vs-budget' ? (
              <BarChart data={revenueData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="shortMonth" stroke="#ffffff40" tick={{ fontSize: 11, fill: '#ffffff60' }} />
                <YAxis stroke="#ffffff40" tick={{ fontSize: 11, fill: '#ffffff60' }} />
                <Tooltip content={<CustomRevenueTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: 10, fontSize: 11 }}
                  formatter={(value) => <span className="text-white/70">{value}</span>}
                />
                <Bar dataKey="totalRevenue" name="Actual Total Revenue" fill="#F59E0B" radius={[6, 6, 0, 0]} />
                <Bar dataKey="budgetRevenue" name="Budget Target" fill="#ffffff25" radius={[6, 6, 0, 0]} />
              </BarChart>
            ) : revenueChartMode === 'adr-revpar' ? (
              <LineChart data={revenueData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="shortMonth" stroke="#ffffff40" tick={{ fontSize: 11, fill: '#ffffff60' }} />
                <YAxis stroke="#ffffff40" tick={{ fontSize: 11, fill: '#ffffff60' }} domain={['dataMin - 1000', 'dataMax + 1000']} />
                <Tooltip content={<CustomRevenueTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: 10, fontSize: 11 }}
                  formatter={(value) => <span className="text-white/70">{value}</span>}
                />
                <Line
                  type="monotone"
                  dataKey="adr"
                  name="Average Daily Rate (ADR)"
                  stroke="#F59E0B"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#F59E0B' }}
                />
                <Line
                  type="monotone"
                  dataKey="revPar"
                  name="RevPAR (Yield)"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#10B981' }}
                />
              </LineChart>
            ) : (
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="occGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="shortMonth" stroke="#ffffff40" tick={{ fontSize: 11, fill: '#ffffff60' }} />
                <YAxis stroke="#ffffff40" tick={{ fontSize: 11, fill: '#ffffff60' }} domain={[50, 100]} />
                <Tooltip content={<CustomRevenueTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: 10, fontSize: 11 }}
                  formatter={(value) => <span className="text-white/70">{value}</span>}
                />
                <Area
                  type="monotone"
                  dataKey="occupancyRate"
                  name="Hotel Occupancy Rate (%)"
                  stroke="#8B5CF6"
                  fill="url(#occGrad)"
                  strokeWidth={2.5}
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. DUAL DONUT GRAPHS (Room Category Most Booked & Customer Problems) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* DONUT GRAPH 1: Category of Rooms Most Booked */}
        <div className="p-5 sm:p-6 rounded-3xl bg-[#0D0E11]/90 border border-white/10 space-y-4 shadow-2xl backdrop-blur-md relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-48 h-20 bg-gradient-to-l from-amber-400/10 via-white/5 to-transparent pointer-events-none rounded-tr-3xl" />

          <div className="space-y-1 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-amber-400" />
                <h3 className="text-base sm:text-lg font-serif italic font-bold text-white">
                  Most Booked Room Categories
                </h3>
              </div>
              <span className="text-[11px] font-mono text-white/40">{totalBookings} Total Bookings</span>
            </div>
            <p className="text-xs text-white/40">
              Distribution of inventory demand across Deluxe King, Executive Club, Suites, and Twin rooms.
            </p>
          </div>

          {/* Donut Chart Canvas with Center Stat */}
          <div className="h-64 sm:h-72 w-full relative z-10 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={<CustomPieTooltip />} />
                <Pie
                  data={roomCategoryStats}
                  dataKey="percentage"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  innerRadius="58%"
                  outerRadius="82%"
                  paddingAngle={4}
                  onClick={(entry: any) => setSelectedRoomCategory(entry?.category === selectedRoomCategory ? null : entry?.category)}
                  className="cursor-pointer outline-none"
                >
                  {roomCategoryStats.map((entry, index) => (
                    <Cell
                      key={`cell-cat-${index}`}
                      fill={entry.color}
                      stroke="#0D0E11"
                      strokeWidth={3}
                      opacity={selectedRoomCategory && selectedRoomCategory !== entry.category ? 0.4 : 1}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Donut Hole Centerpiece */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">Top Pick</span>
              <span className="text-lg sm:text-xl font-serif font-bold text-amber-400">Deluxe King</span>
              <span className="text-[11px] font-mono text-white/60">38.4% Share</span>
            </div>
          </div>

          {/* Legend / Metrics Breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-white/5 relative z-10 text-xs font-mono">
            {roomCategoryStats.map((item) => (
              <button
                key={item.category}
                onClick={() => setSelectedRoomCategory(item.category === selectedRoomCategory ? null : item.category)}
                className={`p-2 rounded-2xl border text-left transition-all ${
                  selectedRoomCategory === item.category
                    ? 'bg-white/10 border-amber-400/40 text-white'
                    : 'bg-white/[0.02] border-white/5 text-white/60 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="font-serif italic font-medium text-white truncate">{item.category}</span>
                </div>
                <div className="flex justify-between items-center mt-1 text-[11px]">
                  <span className="text-amber-400 font-bold">{item.percentage}%</span>
                  <span className="text-white/40">{item.bookings} bkgs</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* DONUT GRAPH 2: Problems Faced by Customers (Customer Feedback & Complaints) */}
        <div className="p-5 sm:p-6 rounded-3xl bg-[#0D0E11]/90 border border-white/10 space-y-4 shadow-2xl backdrop-blur-md relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-48 h-20 bg-gradient-to-l from-rose-500/10 via-amber-400/5 to-transparent pointer-events-none rounded-tr-3xl" />

          <div className="space-y-1 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <h3 className="text-base sm:text-lg font-serif italic font-bold text-white">
                  Problems Faced by Customers
                </h3>
              </div>
              <span className="text-[11px] font-mono text-rose-400">{totalCustomerProblems} Logged Incidents</span>
            </div>
            <p className="text-xs text-white/40">
              Categorized guest complaints and friction points requiring operational resolution.
            </p>
          </div>

          {/* Donut Chart Canvas with Center Stat */}
          <div className="h-64 sm:h-72 w-full relative z-10 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={<CustomPieTooltip />} />
                <Pie
                  data={customerProblemsStats}
                  dataKey="percentage"
                  nameKey="problemType"
                  cx="50%"
                  cy="50%"
                  innerRadius="58%"
                  outerRadius="82%"
                  paddingAngle={4}
                  onClick={(entry: any) => setSelectedCustomerProblem(entry?.problemType === selectedCustomerProblem ? null : entry?.problemType)}
                  className="cursor-pointer outline-none"
                >
                  {customerProblemsStats.map((entry, index) => (
                    <Cell
                      key={`cell-prob-${index}`}
                      fill={entry.color}
                      stroke="#0D0E11"
                      strokeWidth={3}
                      opacity={selectedCustomerProblem && selectedCustomerProblem !== entry.problemType ? 0.4 : 1}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Donut Hole Centerpiece */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">Leading Cause</span>
              <span className="text-lg sm:text-xl font-serif font-bold text-rose-400">Wi-Fi & Mesh</span>
              <span className="text-[11px] font-mono text-white/60">24.8% of Total</span>
            </div>
          </div>

          {/* Legend / Metrics Breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-white/5 relative z-10 text-xs font-mono">
            {customerProblemsStats.map((item) => (
              <button
                key={item.problemType}
                onClick={() => setSelectedCustomerProblem(item.problemType === selectedCustomerProblem ? null : item.problemType)}
                className={`p-2 rounded-2xl border text-left transition-all ${
                  selectedCustomerProblem === item.problemType
                    ? 'bg-white/10 border-rose-400/40 text-white'
                    : 'bg-white/[0.02] border-white/5 text-white/60 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="font-serif italic font-medium text-white truncate">{item.problemType.split(' ')[0]}</span>
                </div>
                <div className="flex justify-between items-center mt-1 text-[11px]">
                  <span className="text-rose-400 font-bold">{item.percentage}%</span>
                  <span className="text-white/40">{item.count} rpts</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 5. GRAPH 3: Bar Graph — Problems Faced in Pertinent Rooms */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#0D0E11]/90 border border-white/10 space-y-5 shadow-2xl backdrop-blur-md relative overflow-hidden">
        {/* Subtle Gold / White Light Rim Accent */}
        <div className="absolute top-0 right-0 w-80 h-28 bg-gradient-to-l from-amber-400/10 via-cyan-500/5 to-transparent pointer-events-none rounded-tr-3xl" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg sm:text-xl font-serif italic font-bold text-white">
                Problems Faced in Pertinent Rooms (Room-Category Diagnostics)
              </h2>
            </div>
            <p className="text-xs text-white/40">
              Breakdown of specific hardware, engineering, and service issues logged across each room category.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-white/60 bg-white/5 px-3 py-1.5 rounded-full border border-white/10 shrink-0">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>94.8% Overall Resolution SLA</span>
          </div>
        </div>

        {/* Bar Chart Canvas */}
        <div className="h-72 sm:h-80 w-full relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={roomProblemsStats} margin={{ top: 15, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
              <XAxis dataKey="roomCategory" stroke="#ffffff40" tick={{ fontSize: 11, fill: '#ffffff80' }} />
              <YAxis stroke="#ffffff40" tick={{ fontSize: 11, fill: '#ffffff80' }} />
              <Tooltip content={<CustomBarTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: 10, fontSize: 11 }}
                formatter={(value) => <span className="text-white/70">{value}</span>}
              />
              <Bar dataKey="hvacIssues" name="HVAC / Cooling Delay" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="wifiAvIssues" name="Wi-Fi / Smart TV AV" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              <Bar dataKey="plumbingIssues" name="Plumbing / Water Pressure" fill="#06B6D4" radius={[4, 4, 0, 0]} />
              <Bar dataKey="keycardLockIssues" name="Keycard / Smart Lock" fill="#F43F5E" radius={[4, 4, 0, 0]} />
              <Bar dataKey="housekeepingIssues" name="Housekeeping / Linens" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category-Level Incident Insights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2 border-t border-white/5 relative z-10 text-xs">
          {roomProblemsStats.map((item) => (
            <div
              key={item.roomCategory}
              className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-serif italic font-bold text-white truncate">{item.roomCategory}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {item.resolutionRate}% res
                </span>
              </div>
              <div className="text-[11px] font-mono text-white/50 space-y-0.5">
                <p>Total Incidents: <strong className="text-white">{item.totalProblems}</strong></p>
                <p>Leading: <span className="text-amber-400 font-medium">
                  {item.hvacIssues >= item.wifiAvIssues && item.hvacIssues >= item.plumbingIssues
                    ? `HVAC (${item.hvacIssues})`
                    : item.wifiAvIssues >= item.plumbingIssues
                    ? `Wi-Fi (${item.wifiAvIssues})`
                    : `Plumbing (${item.plumbingIssues})`}
                </span></p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. REAL-TIME CUSTOMER FEEDBACK & INCIDENT RESOLUTION STREAM */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#0D0E11]/90 border border-white/10 space-y-5 shadow-2xl backdrop-blur-md relative overflow-hidden">
        {/* Subtle Gold / White Light Rim Accent */}
        <div className="absolute top-0 right-0 w-80 h-28 bg-gradient-to-l from-emerald-500/10 via-amber-400/5 to-transparent pointer-events-none rounded-tr-3xl" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ThumbsUp className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg sm:text-xl font-serif italic font-bold text-white">
                Live Customer Feedback & Resolution Stream
              </h2>
            </div>
            <p className="text-xs text-white/40">
              Verified guest reviews, operational incident dispatches, and real-time resolution SLAs.
            </p>
          </div>

          {/* Feedback Sentiment Filters & Action Plan Download */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsActionPlanModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Next Steps Action Plan (PDF)</span>
            </button>

            <div className="flex flex-wrap items-center gap-1 p-1 rounded-2xl bg-white/5 border border-white/10 shrink-0">
              <button
                onClick={() => setFeedbackFilter('ALL')}
                className={`px-3 py-1 rounded-xl text-xs font-medium transition-all ${
                  feedbackFilter === 'ALL'
                    ? 'bg-amber-500 text-black font-semibold shadow-md shadow-amber-500/20'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                All ({feedbackRecords.length})
              </button>
              <button
                onClick={() => setFeedbackFilter('Positive')}
                className={`px-3 py-1 rounded-xl text-xs font-medium transition-all ${
                  feedbackFilter === 'Positive'
                    ? 'bg-emerald-500 text-black font-semibold'
                    : 'text-emerald-400/80 hover:text-emerald-300'
                }`}
              >
                Positive
              </button>
              <button
                onClick={() => setFeedbackFilter('Negative')}
                className={`px-3 py-1 rounded-xl text-xs font-medium transition-all ${
                  feedbackFilter === 'Negative'
                    ? 'bg-rose-500 text-white font-semibold'
                    : 'text-rose-400/80 hover:text-rose-300'
                }`}
              >
                Complaints
              </button>
              <button
                onClick={() => setFeedbackFilter('Urgent')}
                className={`px-3 py-1 rounded-xl text-xs font-medium transition-all ${
                  feedbackFilter === 'Urgent'
                    ? 'bg-amber-500 text-black font-semibold'
                    : 'text-amber-400 hover:text-amber-300'
                }`}
              >
                Urgent / Open
              </button>
            </div>
          </div>
        </div>

        {/* Feedback Cards List */}
        <div className="space-y-3 relative z-10">
          {filteredFeedbacks.length === 0 ? (
            <div className="p-8 text-center bg-white/[0.02] rounded-2xl border border-white/5 text-white/40 text-xs">
              No customer feedback records matching the selected filter.
            </div>
          ) : (
            filteredFeedbacks.map((fb) => (
              <div
                key={fb.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all space-y-3 relative overflow-hidden backdrop-blur-md ${
                  fb.sentiment === 'Negative'
                    ? fb.status === 'Resolved'
                      ? 'bg-white/[0.02] border-white/10'
                      : 'bg-rose-950/10 border-rose-500/30 hover:border-rose-500/50'
                    : 'bg-white/[0.02] border-white/10 hover:border-amber-400/30'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-serif italic font-bold text-amber-400 text-xs shrink-0">
                      {fb.guestName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-serif italic font-bold text-white text-sm">
                          {fb.guestName}
                        </span>
                        <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          Room {fb.roomNumber} ({fb.roomType})
                        </span>
                      </div>
                      <p className="text-[11px] text-white/40 font-mono">
                        {fb.stayDate} &bull; {fb.timestamp} &bull; {fb.category}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Star rating */}
                    <div className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-amber-400 text-xs font-mono">
                      <span>{'★'.repeat(fb.rating)}</span>
                      <span className="text-white/30">{'★'.repeat(5 - fb.rating)}</span>
                    </div>

                    {/* Status badge */}
                    <span
                      className={`text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        fb.status === 'Resolved'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : fb.status === 'In-Progress'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse'
                      }`}
                    >
                      {fb.status}
                    </span>
                  </div>
                </div>

                {/* Comment Content */}
                <p className="text-xs sm:text-sm text-white/80 font-light italic leading-relaxed pl-11">
                  &ldquo;{fb.comment}&rdquo;
                </p>

                {/* Action Taken & Operator Resolution Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-white/5 pl-11 text-xs">
                  <div className="text-white/40 font-mono text-[11px]">
                    <span className="text-white/60 font-medium">Action Taken: </span>
                    <span className="text-amber-300/80">{fb.actionTaken || 'Assigned to duty manager.'}</span>
                    <span className="text-white/30 ml-2">({fb.assignedStaff})</span>
                  </div>

                  {fb.status !== 'Resolved' && (
                    <button
                      onClick={() => handleResolveFeedback(fb.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-semibold transition-all shadow-sm shadow-emerald-500/20 self-start sm:self-auto active:scale-95"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark Resolved</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Log Guest Feedback Modal */}
      {isLogFeedbackOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0D0E11] border border-amber-500/30 w-full max-w-lg rounded-3xl p-6 space-y-5 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-20 bg-gradient-to-l from-amber-400/15 via-white/5 to-transparent pointer-events-none rounded-tr-3xl" />

            <div className="space-y-1 relative z-10">
              <h3 className="text-lg font-serif italic font-bold text-white">
                Log Live Guest Feedback & Incident
              </h3>
              <p className="text-xs text-white/40">
                Record customer sentiment, maintenance friction, or praise to update hotel diagnostic charts.
              </p>
            </div>

            <form onSubmit={handleCreateFeedback} className="space-y-4 relative z-10 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-white/60 font-mono text-[11px] block">Guest Name</label>
                  <input
                    type="text"
                    required
                    value={newGuestName}
                    onChange={(e) => setNewGuestName(e.target.value)}
                    placeholder="e.g. S. Sen"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-amber-400/50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-white/60 font-mono text-[11px] block">Room Number</label>
                  <input
                    type="text"
                    required
                    value={newRoomNumber}
                    onChange={(e) => setNewRoomNumber(e.target.value)}
                    placeholder="e.g. 308"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-amber-400/50 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-white/60 font-mono text-[11px] block">Room Category</label>
                  <select
                    value={newRoomType}
                    onChange={(e) => setNewRoomType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#121214] border border-white/10 text-white focus:outline-none focus:border-amber-400/50"
                  >
                    <option value="Deluxe King">Deluxe King</option>
                    <option value="Executive Club">Executive Club</option>
                    <option value="Deluxe Twin">Deluxe Twin</option>
                    <option value="Heritage Suite">Heritage Suite</option>
                    <option value="Presidential Suite">Presidential Suite</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-white/60 font-mono text-[11px] block">Star Rating (1 - 5)</label>
                  <select
                    value={newRating}
                    onChange={(e) => setNewRating(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#121214] border border-white/10 text-white focus:outline-none focus:border-amber-400/50 font-mono"
                  >
                    <option value={5}>★★★★★ (5 Stars - Exceptional)</option>
                    <option value={4}>★★★★☆ (4 Stars - Good)</option>
                    <option value={3}>★★★☆☆ (3 Stars - Neutral)</option>
                    <option value={2}>★★☆☆☆ (2 Stars - Friction/Poor)</option>
                    <option value={1}>★☆☆☆☆ (1 Star - Critical Issue)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-white/60 font-mono text-[11px] block">Problem / Feedback Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#121214] border border-white/10 text-white focus:outline-none focus:border-amber-400/50"
                >
                  <option value="Wi-Fi Speed & Mesh Connectivity">Wi-Fi Speed & Mesh Connectivity</option>
                  <option value="Air Conditioning / Thermostat Calibration">Air Conditioning / Thermostat Calibration</option>
                  <option value="Room Service & In-Room Dining Delivery">Room Service & In-Room Dining Delivery</option>
                  <option value="Housekeeping Turnaround & Extra Linen">Housekeeping Turnaround & Extra Linen</option>
                  <option value="Bathroom Water Pressure & Hot Water">Bathroom Water Pressure & Hot Water</option>
                  <option value="Front Desk Express Check-in Waiting">Front Desk Express Check-in Waiting</option>
                  <option value="Hospitality & Express Service">Hospitality & Express Service (Positive)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-white/60 font-mono text-[11px] block">Guest Remarks / Comments</label>
                <textarea
                  required
                  rows={3}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Describe the feedback, issue faced, or compliments..."
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-amber-400/50"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsLogFeedbackOpen(false)}
                  className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-amber-500 hover:bg-amber-400 text-black font-bold transition-all shadow-md shadow-amber-500/20 active:scale-95"
                >
                  Record & Update Analytics
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Feedback Strategic Action Plan & Next Steps PDF Modal */}
      <FeedbackActionPlanModal
        isOpen={isActionPlanModalOpen}
        onClose={() => setIsActionPlanModalOpen(false)}
        feedbackRecords={feedbackRecords}
        customerProblemsStats={customerProblemsStats}
        roomProblemsStats={roomProblemsStats}
        propertyName="The Meridian Kolkata"
      />
    </div>
  );
};
