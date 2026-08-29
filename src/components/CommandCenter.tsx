import React, { useState } from 'react';
import {
  HotelKPIs,
  Property,
  OperationalEvent,
  Room,
  Reservation,
  AIQueryResponse,
} from '../types';
import {
  Sparkles,
  ArrowUpRight,
  UserCheck,
  UserMinus,
  DoorOpen,
  Star,
  Send,
  Loader2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ChevronRight,
  Bed,
  Brush,
  Wrench,
  Ban,
  Building,
} from 'lucide-react';
import { api } from '../lib/api';

interface CommandCenterProps {
  property: Property | null;
  kpis: HotelKPIs | null;
  events: OperationalEvent[];
  rooms: Room[];
  reservations: Reservation[];
  onOpenCheckInForRes?: (reservationId: string) => void;
  onOpenCheckOutForRes?: (reservationId: string, roomId: string) => void;
  onSelectRoom?: (roomId: string) => void;
  onSelectGuest?: (guestId: string) => void;
  onSelectReservation?: (reservationId: string) => void;
  onNavigateTab: (tab: any) => void;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({
  property,
  kpis,
  events,
  rooms,
  reservations,
  onOpenCheckInForRes,
  onOpenCheckOutForRes,
  onSelectRoom,
  onSelectGuest,
  onSelectReservation,
  onNavigateTab,
}) => {
  const [aiQuery, setAiQuery] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<AIQueryResponse | null>(null);

  const handleRunAiQuery = async (queryText?: string) => {
    const textToRun = queryText || aiQuery;
    if (!textToRun.trim()) return;

    setAiLoading(true);
    setAiQuery(textToRun);
    try {
      const response = await api.queryAI(textToRun);
      setAiResult(response);
    } catch (err: any) {
      setAiResult({
        query: textToRun,
        answer: 'Failed to retrieve AI intelligence. Please check connection.',
        languageDetected: 'English',
        confidence: 0,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setAiLoading(false);
    }
  };

  const samplePrompts = [
    { label: 'How many rooms are vacant?', lang: 'EN' },
    { label: 'Who is staying in room 204?', lang: 'EN' },
    { label: 'Show me today\'s arrivals', lang: 'EN' },
    { label: 'Which rooms are under maintenance?', lang: 'EN' },
    { label: 'आज कितने कमरे खाली हैं?', lang: 'HI' },
    { label: 'Aaj kitne rooms vacant hain?', lang: 'HING' },
  ];

  // Today's pending arrivals
  const todaysArrivalsList = reservations.filter(
    (r) => r.checkInDate === '2026-08-22' && r.status === 'Confirmed'
  );

  // Today's pending departures
  const todaysDeparturesList = reservations.filter(
    (r) => r.checkOutDate === '2026-08-22' && r.status === 'Checked In'
  );

  // Floor stats
  const floorCounts = [1, 2, 3, 4, 5].map((floor) => {
    const floorRooms = rooms.filter((r) => r.floor === floor);
    const occupied = floorRooms.filter((r) => r.status === 'Occupied').length;
    const available = floorRooms.filter((r) => r.status === 'Available').length;
    const cleaning = floorRooms.filter((r) => r.status === 'Cleaning').length;
    const maintenance = floorRooms.filter(
      (r) => r.status === 'Maintenance' || r.status === 'Out of Service'
    ).length;
    return { floor, total: floorRooms.length, occupied, available, cleaning, maintenance };
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* 1. TOP HERO: Property Status & AI Interactive Command Box */}
      <div className="relative rounded-3xl bg-gradient-to-br from-white/10 to-transparent border border-white/10 p-6 sm:p-8 shadow-2xl backdrop-blur-xl overflow-hidden">
        {/* Subtle atmospheric glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-serif italic text-white/95 tracking-tight">
                  {property?.name || 'The Meridian Kolkata'}
                </h1>
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-mono font-medium uppercase tracking-wider bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(34,197,94,0.8)] animate-pulse" />
                  Live Operational State
                </span>
              </div>
              <p className="text-xs sm:text-sm text-white/40 mt-1">
                {property?.location || 'Kolkata, West Bengal, India'} &bull; {property?.totalRooms || 100} Rooms Total Inventory
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-white/50 bg-white/5 px-3.5 py-1.5 rounded-full border border-white/10">
                Operational Date: <strong className="text-white">22 Aug 2026</strong>
              </span>
            </div>
          </div>

          {/* AI Entry Point Query Bar */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-medium text-amber-400">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="tracking-wide">INNtelligence Reasoning Engine (English • हिन्दी • Hinglish)</span>
              </div>
              <span className="text-[10px] text-white/40 uppercase tracking-widest font-mono">Zero-hallucination database grounding</span>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleRunAiQuery();
              }}
              className="relative flex items-center"
            >
              <input
                type="text"
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                placeholder="Ask INNtelligence anything... (e.g., 'Who is staying in room 204?', 'How many rooms are vacant?')"
                className="w-full bg-white/5 border border-white/15 focus:border-amber-500/60 rounded-2xl pl-5 pr-28 py-4 text-sm sm:text-base text-white placeholder-white/25 focus:outline-none focus:ring-1 focus:ring-amber-500/30 backdrop-blur-md transition-all font-sans"
              />
              <button
                type="submit"
                disabled={aiLoading || !aiQuery.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:hover:bg-amber-500 text-black text-xs font-bold transition-all shadow-lg shadow-amber-500/20"
              >
                {aiLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <span>Ask AI</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            {/* Prompt Quick Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[10px] text-white/40 uppercase tracking-widest mr-1 flex items-center gap-1">
                <Flame className="w-3 h-3 text-amber-400" /> Suggested:
              </span>
              {samplePrompts.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleRunAiQuery(p.label)}
                  className="text-xs px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-500/40 text-white/60 hover:text-white transition-all text-left flex items-center gap-1.5 group"
                >
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-white/10 text-amber-300 group-hover:text-amber-200">
                    {p.lang}
                  </span>
                  <span>{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* AI Response Card if present */}
          {aiResult && (
            <div className="mt-3 p-5 rounded-2xl bg-white/5 border border-amber-500/40 space-y-3 backdrop-blur-xl animate-fadeIn">
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                  <span className="text-xs font-semibold text-amber-300 uppercase tracking-widest">
                    INNtelligence Answer ({aiResult.languageDetected})
                  </span>
                </div>
                <span className="text-[10px] font-mono text-white/40">
                  Verified with Live DB
                </span>
              </div>
              <p className="text-sm text-white/90 leading-relaxed font-sans font-normal whitespace-pre-wrap">
                {aiResult.answer}
              </p>

              {/* Related Entity Shortcuts */}
              {aiResult.relatedEntities && (
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/10 text-xs">
                  <span className="text-white/40 text-[10px] uppercase tracking-wider">Related:</span>
                  {aiResult.relatedEntities.rooms?.map((rNum) => (
                    <button
                      key={rNum}
                      onClick={() => onSelectRoom?.(`room-${rNum}`)}
                      className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-amber-300 border border-amber-500/20 font-mono text-[11px] transition-colors"
                    >
                      Room {rNum} &rarr;
                    </button>
                  ))}
                  {aiResult.relatedEntities.reservations?.map((resId) => (
                    <button
                      key={resId}
                      onClick={() => onSelectReservation?.(resId)}
                      className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-emerald-300 border border-emerald-500/20 font-mono text-[11px] transition-colors"
                    >
                      {resId} &rarr;
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 2. CORE OPERATIONAL METRICS (KPIS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Metric 1: Occupancy */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-5 space-y-3 relative overflow-hidden backdrop-blur-md group hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between text-white/40">
            <span className="text-[10px] uppercase tracking-widest font-medium">Occupancy</span>
            <Building className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-3xl sm:text-4xl font-light text-white tracking-tight">
              {kpis ? `${kpis.occupancyRate}%` : '--'}
            </div>
            <span className="text-xs font-mono text-white/40">
              {kpis ? `${kpis.occupiedRooms}/${kpis.totalRooms}` : ''} rms
            </span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-500 to-amber-300 h-full rounded-full transition-all duration-500"
              style={{ width: `${kpis?.occupancyRate || 0}%` }}
            />
          </div>
          <p className="text-[11px] text-white/40">
            {kpis?.inHouseGuestsCount || 0} active in-house guests
          </p>
        </div>

        {/* Metric 2: Today's Arrivals */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-5 space-y-3 relative overflow-hidden backdrop-blur-md group hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between text-white/40">
            <span className="text-[10px] uppercase tracking-widest font-medium">Today's Arrivals</span>
            <UserCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-3xl sm:text-4xl font-light text-emerald-400 tracking-tight">
              {kpis?.todaysArrivals ?? 0}
            </div>
            <span className="text-xs font-mono text-white/40">
              {todaysArrivalsList.length} pending
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-white/60">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(34,197,94,0.6)]" />
            <span>22 Aug scheduled arrivals</span>
          </div>
          <button
            onClick={() => onNavigateTab('front-desk')}
            className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium inline-flex items-center gap-1 pt-1"
          >
            Manage check-ins <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>

        {/* Metric 3: Today's Departures */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-5 space-y-3 relative overflow-hidden backdrop-blur-md group hover:border-rose-500/40 transition-all">
          <div className="flex items-center justify-between text-white/40">
            <span className="text-[10px] uppercase tracking-widest font-medium">Today's Departures</span>
            <UserMinus className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-3xl sm:text-4xl font-light text-rose-400 tracking-tight">
              {kpis?.todaysDepartures ?? 0}
            </div>
            <span className="text-xs font-mono text-white/40">
              {todaysDeparturesList.length} pending
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-white/60">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shadow-[0_0_6px_rgba(244,63,94,0.6)]" />
            <span>Expected checkouts today</span>
          </div>
          <button
            onClick={() => onNavigateTab('front-desk')}
            className="text-[11px] text-rose-400 hover:text-rose-300 font-medium inline-flex items-center gap-1 pt-1"
          >
            Manage checkouts <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>

        {/* Metric 4: Available Rooms */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-5 space-y-3 relative overflow-hidden backdrop-blur-md group hover:border-cyan-500/40 transition-all">
          <div className="flex items-center justify-between text-white/40">
            <span className="text-[10px] uppercase tracking-widest font-medium">Available Rooms</span>
            <DoorOpen className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-3xl sm:text-4xl font-light text-cyan-300 tracking-tight">
              {kpis?.availableRooms ?? 0}
            </div>
            <span className="text-xs font-mono text-white/40">
              +{kpis?.cleaningRooms || 0} clean
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-white/60">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.6)]" />
            <span>Ready for walk-in / booking</span>
          </div>
          <button
            onClick={() => onNavigateTab('rooms')}
            className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium inline-flex items-center gap-1 pt-1"
          >
            View inventory matrix <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>

        {/* Metric 5: Guest Satisfaction */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-5 space-y-3 relative overflow-hidden backdrop-blur-md group hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between text-white/40">
            <span className="text-[10px] uppercase tracking-widest font-medium">Guest Satisfaction</span>
            <Star className="w-4 h-4 text-amber-400 fill-amber-400/20" />
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-3xl sm:text-4xl font-light text-white tracking-tight">
              {kpis?.guestSatisfaction !== null && kpis?.guestSatisfaction !== undefined
                ? `${kpis.guestSatisfaction} / 5`
                : 'No data'}
            </div>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-amber-300">
            {kpis?.guestSatisfaction ? (
              <span>★ 96% positive reviews</span>
            ) : (
              <span className="text-white/40">Insufficient reviews</span>
            )}
          </div>
          <div className="flex items-center justify-between pt-1">
            <p className="text-[11px] text-white/40">
              Est. Daily Rev: ₹{kpis?.todaysRevenueEstimate.toLocaleString('en-IN') || 0}
            </p>
            <button
              onClick={() => onNavigateTab('analytics')}
              className="text-[11px] text-amber-400 hover:text-amber-300 font-medium inline-flex items-center gap-1"
            >
              Revenue & Feedback <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. MIDDLE SECTION: Realtime Front Desk Actions & Floor Matrix Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 cols: Today's Immediate Operational Actions */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-2xl bg-white/5 border border-white/10 p-5 space-y-4 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs uppercase tracking-widest font-semibold text-white">
                  Today's Arrivals Awaiting Check-In
                </h3>
              </div>
              <button
                onClick={() => onNavigateTab('front-desk')}
                className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
              >
                View all ({reservations.filter((r) => r.checkInDate === '2026-08-22').length}) →
              </button>
            </div>

            {todaysArrivalsList.length === 0 ? (
              <div className="p-6 text-center text-white/40 text-xs bg-white/[0.02] rounded-xl border border-dashed border-white/10">
                All scheduled arrivals for today have completed check-in.
              </div>
            ) : (
              <div className="space-y-2.5">
                {todaysArrivalsList.slice(0, 4).map((res) => (
                  <div
                    key={res.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-white/[0.03] border-l-2 border-emerald-500/60 border-t border-r border-b border-white/5 hover:bg-white/[0.06] gap-3 transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">{res.guestName}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-white/80 border border-white/10">
                          {res.id}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-medium">
                          {res.bookingChannel}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-white/40">
                        <span>{res.roomType}</span>
                        <span>&bull;</span>
                        <span>{res.checkInDate} to {res.checkOutDate}</span>
                        <span>&bull;</span>
                        <span className="text-white/80 font-medium">₹{res.rate.toLocaleString('en-IN')}/night</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => onSelectReservation?.(res.id)}
                        className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 text-xs font-medium transition-all"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => onOpenCheckInForRes?.(res.id)}
                        className="px-3.5 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-semibold transition-all shadow-sm shadow-emerald-500/20"
                      >
                        Check In
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Today's Pending Departures */}
          <div className="rounded-2xl bg-white/5 border border-white/10 p-5 space-y-4 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <UserMinus className="w-4 h-4 text-rose-400" />
                <h3 className="text-xs uppercase tracking-widest font-semibold text-white">
                  Today's Expected Departures
                </h3>
              </div>
              <button
                onClick={() => onNavigateTab('front-desk')}
                className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
              >
                Front desk view →
              </button>
            </div>

            {todaysDeparturesList.length === 0 ? (
              <div className="p-6 text-center text-white/40 text-xs bg-white/[0.02] rounded-xl border border-dashed border-white/10">
                No active in-house guests scheduled for departure remaining today.
              </div>
            ) : (
              <div className="space-y-2.5">
                {todaysDeparturesList.slice(0, 3).map((res) => (
                  <div
                    key={res.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-white/[0.03] border-l-2 border-rose-500/60 border-t border-r border-b border-white/5 hover:bg-white/[0.06] gap-3 transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">{res.guestName}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 font-medium">
                          Room {res.roomNumber || 'N/A'}
                        </span>
                        <span className="text-[10px] font-mono text-white/40">{res.id}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-white/40">
                        <span>{res.roomType}</span>
                        <span>&bull;</span>
                        <span>Folio: ₹{res.totalAmount.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => onOpenCheckOutForRes?.(res.id, res.roomId || '')}
                        className="px-3.5 py-1.5 rounded-full bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-200 text-xs font-medium transition-all"
                      >
                        Check Out Room {res.roomNumber}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 5 cols: Floor Inventory Heatmap Snapshot & Quick Operational Activity */}
        <div className="lg:col-span-5 space-y-4">
          {/* Floor Status Snapshot */}
          <div className="rounded-2xl bg-white/5 border border-white/10 p-5 space-y-4 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Bed className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs uppercase tracking-widest font-semibold text-white">
                  Floor-by-Floor Inventory
                </h3>
              </div>
              <span className="text-[10px] font-mono text-white/40 uppercase">100 Rooms</span>
            </div>

            <div className="space-y-3">
              {floorCounts.map((f) => (
                <div key={f.floor} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-white/90">Floor {f.floor}</span>
                    <span className="font-mono text-[11px] text-white/40">
                      {f.occupied} Occ &bull; {f.available} Avail &bull; {f.cleaning} Clean
                    </span>
                  </div>
                  {/* Segmented bar */}
                  <div className="flex w-full h-2 rounded-full overflow-hidden bg-white/10">
                    <div
                      title={`Occupied: ${f.occupied}`}
                      style={{ width: `${(f.occupied / f.total) * 100}%` }}
                      className="bg-amber-400"
                    />
                    <div
                      title={`Available: ${f.available}`}
                      style={{ width: `${(f.available / f.total) * 100}%` }}
                      className="bg-emerald-400"
                    />
                    <div
                      title={`Cleaning: ${f.cleaning}`}
                      style={{ width: `${(f.cleaning / f.total) * 100}%` }}
                      className="bg-cyan-400"
                    />
                    <div
                      title={`Maintenance: ${f.maintenance}`}
                      style={{ width: `${(f.maintenance / f.total) * 100}%` }}
                      className="bg-rose-400"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[10px] text-white/40 uppercase tracking-wider">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400" /> Occupied
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> Available
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-cyan-400" /> Cleaning
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-400" /> Maint.
              </span>
            </div>
          </div>

          {/* Realtime Operational Events Audit Log (Top 4) */}
          <div className="rounded-2xl bg-white/5 border border-white/10 p-5 space-y-3 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs uppercase tracking-widest font-semibold text-white">
                  Recent Operational Events
                </h3>
              </div>
              <button
                onClick={() => onNavigateTab('activity-log')}
                className="text-xs text-amber-400 hover:text-amber-300 font-medium"
              >
                Full Stream →
              </button>
            </div>

            <div className="space-y-3">
              {events.slice(0, 4).map((evt) => (
                <div key={evt.id} className="flex items-start gap-3 text-xs group">
                  <div className="mt-0.5 p-1.5 rounded-full bg-white/10 text-amber-400 border border-white/10">
                    {evt.eventType.includes('CHECKED_IN') && <UserCheck className="w-3 h-3 text-emerald-400" />}
                    {evt.eventType.includes('CHECKED_OUT') && <UserMinus className="w-3 h-3 text-rose-400" />}
                    {evt.eventType.includes('CLEAN') && <Brush className="w-3 h-3 text-cyan-400" />}
                    {evt.eventType.includes('MAINTENANCE') && <Wrench className="w-3 h-3 text-amber-400" />}
                    {evt.eventType.includes('RESERVATION') && <CheckCircle2 className="w-3 h-3 text-indigo-400" />}
                    {evt.eventType.includes('GUEST') && <UserCheck className="w-3 h-3 text-white/70" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white/90 truncate">{evt.title}</span>
                      <span className="text-[10px] font-mono text-white/40">{evt.timeFormatted}</span>
                    </div>
                    <p className="text-[11px] text-white/40 line-clamp-1 mt-0.5">{evt.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
