import React, { useState } from 'react';
import {
  Reservation,
  Room,
  Guest,
  HotelKPIs,
} from '../types';
import {
  ConciergeBell,
  LogIn,
  LogOut,
  PlusCircle,
  UserPlus,
  UserCheck,
  UserMinus,
  Bed,
  Search,
  CheckCircle2,
  Clock,
  Building,
  CreditCard,
  Phone,
  Mail,
  Shield,
  ArrowRight,
} from 'lucide-react';

interface FrontDeskProps {
  reservations: Reservation[];
  rooms: Room[];
  guests: Guest[];
  kpis: HotelKPIs | null;
  onOpenCheckIn: () => void;
  onOpenCheckOut: () => void;
  onOpenNewReservation: () => void;
  onOpenAddGuest: () => void;
  onCheckInReservation: (reservationId: string) => void;
  onCheckOutReservation: (reservationId: string, roomId: string) => void;
  onSelectGuest: (guestId: string) => void;
  onSelectRoom: (roomId: string) => void;
}

export const FrontDesk: React.FC<FrontDeskProps> = ({
  reservations,
  rooms,
  guests,
  kpis,
  onOpenCheckIn,
  onOpenCheckOut,
  onOpenNewReservation,
  onOpenAddGuest,
  onCheckInReservation,
  onCheckOutReservation,
  onSelectGuest,
  onSelectRoom,
}) => {
  const [activeSection, setActiveSection] = useState<'arrivals' | 'departures' | 'inhouse' | 'available'>(
    'arrivals'
  );
  const [searchQuery, setSearchQuery] = useState('');

  const todayStr = '2026-08-22';

  // Filtered lists
  const todaysArrivals = reservations.filter(
    (r) =>
      r.checkInDate === todayStr &&
      (r.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.roomType.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const todaysDepartures = reservations.filter(
    (r) =>
      r.checkOutDate === todayStr &&
      r.status === 'Checked In' &&
      (r.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.roomNumber && r.roomNumber.includes(searchQuery)))
  );

  const inHouseReservations = reservations.filter(
    (r) =>
      r.status === 'Checked In' &&
      (r.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.roomNumber && r.roomNumber.includes(searchQuery)) ||
        r.id.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const availableRoomsList = rooms.filter(
    (r) =>
      r.status === 'Available' &&
      (r.roomNumber.includes(searchQuery) || r.roomType.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* 1. Header & Quick Actions Bar */}
      <div className="rounded-3xl bg-gradient-to-br from-white/10 to-transparent border border-white/10 p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <ConciergeBell className="w-5 h-5 text-amber-400" />
              <h2 className="text-2xl sm:text-3xl font-serif italic text-white/95 tracking-tight">
                Front Desk Operations Workspace
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-white/40">
              Manage arrivals, key issuing, check-outs, folio settling, and guest requests in real time.
            </p>
          </div>

          {/* Quick Actions Cluster */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenCheckIn}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs transition-all shadow-md shadow-emerald-500/20"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Express Check In</span>
            </button>

            <button
              onClick={onOpenCheckOut}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-200 font-semibold text-xs transition-all"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span>Check Out</span>
            </button>

            <button
              onClick={onOpenNewReservation}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-200 font-semibold text-xs transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>New Reservation</span>
            </button>

            <button
              onClick={onOpenAddGuest}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 font-semibold text-xs transition-all"
            >
              <UserPlus className="w-3.5 h-3.5 text-white/60" />
              <span>Add Guest</span>
            </button>
          </div>
        </div>

        {/* 2. Operational Filter Tabs & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveSection('arrivals')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                activeSection === 'arrivals'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-white/5 text-white/50 hover:text-white border border-transparent'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Today's Arrivals</span>
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-[10px] font-mono">
                {reservations.filter((r) => r.checkInDate === todayStr).length}
              </span>
            </button>

            <button
              onClick={() => setActiveSection('departures')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                activeSection === 'departures'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'bg-white/5 text-white/50 hover:text-white border border-transparent'
              }`}
            >
              <UserMinus className="w-3.5 h-3.5" />
              <span>Today's Departures</span>
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500/20 text-[10px] font-mono">
                {reservations.filter((r) => r.checkOutDate === todayStr && r.status === 'Checked In').length}
              </span>
            </button>

            <button
              onClick={() => setActiveSection('inhouse')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                activeSection === 'inhouse'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                  : 'bg-white/5 text-white/50 hover:text-white border border-transparent'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              <span>In-House Guests</span>
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-[10px] font-mono">
                {reservations.filter((r) => r.status === 'Checked In').length}
              </span>
            </button>

            <button
              onClick={() => setActiveSection('available')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                activeSection === 'available'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                  : 'bg-white/5 text-white/50 hover:text-white border border-transparent'
              }`}
            >
              <Bed className="w-3.5 h-3.5" />
              <span>Ready Rooms</span>
              <span className="px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-[10px] font-mono">
                {rooms.filter((r) => r.status === 'Available').length}
              </span>
            </button>
          </div>

          {/* Quick filter input */}
          <div className="relative min-w-[240px]">
            <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by guest, room, ID..."
              className="w-full bg-white/5 border border-white/10 focus:border-amber-500/50 rounded-full pl-9 pr-4 py-2 text-xs text-white placeholder-white/30 focus:outline-none backdrop-blur-md"
            />
          </div>
        </div>
      </div>

      {/* 3. Section Content Display */}
      {activeSection === 'arrivals' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-serif italic font-bold text-white/90 tracking-wide">
              Scheduled Arrivals for Today (22 Aug 2026)
            </h3>
            <span className="text-xs text-white/40 font-mono">
              {todaysArrivals.length} total entries
            </span>
          </div>

          {todaysArrivals.length === 0 ? (
            <div className="p-8 text-center bg-white/[0.02] rounded-3xl border border-white/10 text-white/40 text-sm backdrop-blur-md">
              No matching arrivals scheduled for today.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {todaysArrivals.map((res) => {
                const guest = guests.find((g) => g.id === res.guestId);
                const isCheckedIn = res.status === 'Checked In';

                return (
                  <div
                    key={res.id}
                    className={`rounded-3xl bg-[#0D0E11]/90 border p-5 space-y-3.5 transition-all shadow-xl backdrop-blur-md relative overflow-hidden group hover:shadow-[0_0_25px_rgba(245,158,11,0.08)] ${
                      isCheckedIn
                        ? 'border-emerald-500/30 bg-[#0D1211]/90 hover:border-emerald-500/50'
                        : 'border-white/10 hover:border-amber-400/40 hover:bg-[#101116]/95'
                    }`}
                  >
                    {/* Subtle Gold / White Light Rim Accent at top-right edge */}
                    <div className="absolute top-0 right-0 w-32 h-12 bg-gradient-to-l from-amber-400/10 via-white/5 to-transparent pointer-events-none rounded-tr-3xl" />

                    <div className="flex items-start justify-between gap-2 relative z-10">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5">
                          <button
                            onClick={() => onSelectGuest(res.guestId)}
                            className="text-base font-serif italic font-bold text-white hover:text-amber-400 transition-colors text-left"
                          >
                            {res.guestName}
                          </button>
                          {guest?.vipStatus && guest.vipStatus !== 'Regular' && (
                            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              VIP: {guest.vipStatus}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-white/40 font-mono">
                          <Phone className="w-3 h-3 text-amber-400/70" />
                          <span>{res.guestPhone}</span>
                          <span>•</span>
                          <span>{res.id}</span>
                        </div>
                      </div>

                      <span
                        className={`text-[11px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                          isCheckedIn
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {isCheckedIn ? 'Checked In' : 'Confirmed'}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs relative z-10">
                      <div>
                        <span className="text-[10px] font-mono uppercase text-white/40 block">Room Category</span>
                        <span className="font-medium text-white/90">{res.roomType}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono uppercase text-white/40 block">Assigned Room</span>
                        <span className="font-mono font-medium text-amber-400">
                          {res.roomNumber ? `Room ${res.roomNumber}` : 'Pending assignment'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono uppercase text-white/40 block">Booking Channel</span>
                        <span className="text-white/80">{res.bookingChannel}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono uppercase text-white/40 block">Stay Duration</span>
                        <span className="text-white/80 font-mono text-[11px]">{res.checkInDate} → {res.checkOutDate}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono uppercase text-white/40 block">Nightly Rate</span>
                        <span className="font-mono text-white/90">₹{res.rate.toLocaleString('en-IN')}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono uppercase text-white/40 block">Total Folio</span>
                        <span className="font-mono font-semibold text-emerald-400">₹{res.totalAmount.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    {res.specialRequests && (
                      <p className="text-xs text-amber-300/90 bg-amber-500/5 px-3 py-1.5 rounded-xl border border-amber-500/20 font-light">
                        <strong className="font-mono text-amber-400">Request:</strong> {res.specialRequests}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-1 relative z-10">
                      <button
                        onClick={() => onSelectGuest(res.guestId)}
                        className="text-xs text-white/40 hover:text-white/80 transition-colors font-mono"
                      >
                        View Guest Dossier →
                      </button>

                      {!isCheckedIn && (
                        <button
                          onClick={() => onCheckInReservation(res.id)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all shadow-md shadow-emerald-500/20 active:scale-95"
                        >
                          <LogIn className="w-3.5 h-3.5" />
                          <span>Check In Guest</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeSection === 'departures' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-serif italic font-bold text-white/90 tracking-wide">
              Scheduled Departures for Today (22 Aug 2026)
            </h3>
            <span className="text-xs text-white/40 font-mono">
              {todaysDepartures.length} pending checkouts
            </span>
          </div>

          {todaysDepartures.length === 0 ? (
            <div className="p-8 text-center bg-white/[0.02] rounded-3xl border border-white/10 text-white/40 text-sm backdrop-blur-md">
              No pending departures remaining for today.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {todaysDepartures.map((res) => (
                <div
                  key={res.id}
                  className="rounded-3xl bg-[#0D0E11]/90 border border-white/10 hover:border-rose-500/40 p-5 space-y-3.5 transition-all shadow-xl backdrop-blur-md relative overflow-hidden group hover:shadow-[0_0_25px_rgba(244,63,94,0.08)]"
                >
                  {/* Subtle Gold / White Light Rim Accent at top-right edge */}
                  <div className="absolute top-0 right-0 w-32 h-12 bg-gradient-to-l from-rose-500/10 via-amber-400/5 to-transparent pointer-events-none rounded-tr-3xl" />

                  <div className="flex items-start justify-between gap-2 relative z-10">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="text-base font-serif italic font-bold text-white">
                          {res.guestName}
                        </span>
                        <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20">
                          Room {res.roomNumber || 'N/A'}
                        </span>
                      </div>
                      <p className="text-xs text-white/40 mt-1 font-mono">
                        Reservation: {res.id} • {res.roomType}
                      </p>
                    </div>

                    <span className="text-[11px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20">
                      Departing Today
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 grid grid-cols-2 gap-2.5 text-xs relative z-10">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-white/40 block">Stay Window</span>
                      <span className="text-white/80 font-mono text-[11px]">{res.checkInDate} to {res.checkOutDate}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase text-white/40 block">Folio Balance</span>
                      <span className="font-mono text-emerald-400 font-semibold">
                        ₹{res.totalAmount.toLocaleString('en-IN')} (Paid)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 relative z-10">
                    <span className="text-[11px] text-white/40 font-mono">
                      Checkout sets room to <strong className="text-amber-400">Cleaning</strong>
                    </span>

                    <button
                      onClick={() => onCheckOutReservation(res.id, res.roomId || '')}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-200 text-xs font-semibold transition-all shadow-md shadow-rose-500/10 active:scale-95"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-400" />
                      <span>Process Checkout</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeSection === 'inhouse' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-serif italic font-bold text-white/90 tracking-wide">
              Active In-House Guests ({inHouseReservations.length})
            </h3>
            <span className="text-xs text-white/40 font-mono">
              Live Hotel Occupancy: <strong className="text-amber-400">{kpis?.occupancyRate || 0}%</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {inHouseReservations.map((res) => (
              <div
                key={res.id}
                className="rounded-3xl bg-[#0D0E11]/90 border border-white/10 p-5 space-y-3.5 hover:border-amber-400/40 transition-all shadow-xl backdrop-blur-md relative overflow-hidden group hover:shadow-[0_0_25px_rgba(245,158,11,0.08)]"
              >
                {/* Subtle Gold / White Light Rim Accent */}
                <div className="absolute top-0 right-0 w-28 h-10 bg-gradient-to-l from-amber-400/10 via-white/5 to-transparent pointer-events-none rounded-tr-3xl" />

                <div className="flex items-start justify-between relative z-10">
                  <div>
                    <span className="text-sm font-serif italic font-bold text-white block group-hover:text-amber-300 transition-colors">
                      {res.guestName}
                    </span>
                    <span className="text-xs text-white/40 font-mono">{res.roomType}</span>
                  </div>
                  <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    Room {res.roomNumber}
                  </span>
                </div>

                <div className="text-xs text-white/50 space-y-1.5 bg-white/[0.02] p-3 rounded-2xl border border-white/5 font-mono relative z-10">
                  <div className="flex justify-between">
                    <span className="text-white/30">Check-out:</span>
                    <span className="text-white/80 font-medium">{res.checkOutDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/30">Guests:</span>
                    <span className="text-white/80">{res.adults} Adult(s), {res.children} Child</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/30">Channel:</span>
                    <span className="text-white/80">{res.bookingChannel}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 relative z-10">
                  <button
                    onClick={() => onSelectGuest(res.guestId)}
                    className="text-xs text-amber-400 hover:text-amber-300 font-mono"
                  >
                    Guest Dossier →
                  </button>

                  <button
                    onClick={() => onCheckOutReservation(res.id, res.roomId || '')}
                    className="px-3 py-1.5 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-medium border border-rose-500/25 transition-colors"
                  >
                    Check Out
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSection === 'available' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-serif italic font-bold text-white/90 tracking-wide">
              Ready & Available Rooms ({availableRoomsList.length})
            </h3>
            <span className="text-xs text-white/40 font-mono">
              Certified Clean by Housekeeping
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
            {availableRoomsList.map((room) => (
              <div
                key={room.id}
                onClick={() => onSelectRoom(room.id)}
                className="p-4 rounded-3xl bg-[#0D0E11]/90 border border-emerald-500/20 hover:border-emerald-500/50 cursor-pointer space-y-2.5 transition-all group shadow-xl backdrop-blur-md relative overflow-hidden hover:shadow-[0_0_20px_rgba(16,185,129,0.1)]"
              >
                {/* Subtle Gold / Emerald Rim Light */}
                <div className="absolute top-0 right-0 w-20 h-8 bg-gradient-to-l from-emerald-500/10 via-amber-400/5 to-transparent pointer-events-none rounded-tr-3xl" />

                <div className="flex items-center justify-between relative z-10">
                  <span className="font-mono text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                    Room {room.roomNumber}
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Ready
                  </span>
                </div>
                <div className="text-xs text-white/40 relative z-10">
                  <p className="text-white/80 font-medium truncate">{room.roomType}</p>
                  <p className="font-mono text-amber-400 mt-0.5">₹{room.rate.toLocaleString('en-IN')}/night</p>
                </div>
                <div className="text-[10px] font-mono text-white/30 pt-1.5 border-t border-white/5 flex items-center justify-between relative z-10">
                  <span>Floor {room.floor}</span>
                  <span className="text-emerald-400 group-hover:underline">Assign →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
