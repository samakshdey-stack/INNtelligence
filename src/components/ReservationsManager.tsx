import React, { useState } from 'react';
import { Reservation, ReservationStatus, Room } from '../types';
import {
  CalendarCheck2,
  PlusCircle,
  Search,
  LogIn,
  XCircle,
  Clock,
  Building,
  CreditCard,
  Filter,
  CheckCircle2,
} from 'lucide-react';

interface ReservationsManagerProps {
  reservations: Reservation[];
  rooms: Room[];
  onOpenNewReservation: () => void;
  onCheckInReservation: (reservationId: string) => void;
  onCancelReservation: (reservationId: string) => void;
  onSelectGuest: (guestId: string) => void;
  onSelectRoom: (roomId: string) => void;
}

export const ReservationsManager: React.FC<ReservationsManagerProps> = ({
  reservations,
  rooms,
  onOpenNewReservation,
  onCheckInReservation,
  onCancelReservation,
  onSelectGuest,
  onSelectRoom,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredReservations = reservations.filter((r) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      r.id.toLowerCase().includes(q) ||
      r.guestName.toLowerCase().includes(q) ||
      r.guestPhone.toLowerCase().includes(q) ||
      r.roomType.toLowerCase().includes(q) ||
      (r.roomNumber && r.roomNumber.includes(q)) ||
      r.bookingChannel.toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* 1. Header & Controls */}
      <div className="rounded-3xl bg-white/[0.03] border border-white/10 p-6 sm:p-7 backdrop-blur-md shadow-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <CalendarCheck2 className="w-5 h-5 text-amber-400" />
              <h2 className="text-xl sm:text-2xl font-serif italic text-white/95 tracking-tight">
                Reservation & Booking Management
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-white/40 font-light">
              Direct and channel bookings across OTA, Corporate Desk, and Web channels.
            </p>
          </div>

          <button
            onClick={onOpenNewReservation}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-all shadow-lg shadow-amber-500/20 self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Reservation</span>
          </button>
        </div>

        {/* Filter Tabs & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {[
              { id: 'ALL', label: 'All Bookings', count: reservations.length },
              {
                id: 'Confirmed',
                label: 'Confirmed',
                count: reservations.filter((r) => r.status === 'Confirmed').length,
              },
              {
                id: 'Checked In',
                label: 'Checked In',
                count: reservations.filter((r) => r.status === 'Checked In').length,
              },
              {
                id: 'Checked Out',
                label: 'Checked Out',
                count: reservations.filter((r) => r.status === 'Checked Out').length,
              },
              {
                id: 'Cancelled',
                label: 'Cancelled',
                count: reservations.filter((r) => r.status === 'Cancelled').length,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                  statusFilter === tab.id
                    ? 'bg-white/15 text-white border border-white/20 shadow-sm'
                    : 'bg-white/5 text-white/40 hover:text-white/80 border border-white/5'
                }`}
              >
                <span>{tab.label}</span>
                <span className="px-2 py-0.5 rounded-full bg-black/40 text-[10px] font-mono text-white/60">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="relative min-w-[280px]">
            <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, guest, room, channel..."
              className="w-full bg-white/5 border border-white/10 focus:border-amber-500/50 rounded-full pl-9 pr-4 py-2 text-xs text-white placeholder-white/30 focus:outline-none backdrop-blur-sm"
            />
          </div>
        </div>
      </div>

      {/* 2. Reservations List */}
      <div className="space-y-3">
        {filteredReservations.length === 0 ? (
          <div className="p-12 text-center bg-white/[0.02] rounded-3xl border border-white/10 text-white/40 text-sm">
            No reservations found for this filter.
          </div>
        ) : (
          filteredReservations.map((res) => {
            const isConfirmed = res.status === 'Confirmed';
            const isCheckedIn = res.status === 'Checked In';
            const isCancelled = res.status === 'Cancelled';

            return (
              <div
                key={res.id}
                className={`rounded-3xl bg-white/[0.03] border p-5 sm:p-6 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-5 backdrop-blur-md ${
                  isCheckedIn
                    ? 'border-emerald-500/30 bg-emerald-500/[0.03]'
                    : isConfirmed
                    ? 'border-white/10 hover:border-amber-500/30'
                    : isCancelled
                    ? 'border-rose-500/20 opacity-60'
                    : 'border-white/10'
                }`}
              >
                {/* Left Block: ID, Guest, Dates */}
                <div className="space-y-2 min-w-[280px]">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-semibold text-amber-400 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                      {res.id}
                    </span>
                    <button
                      onClick={() => onSelectGuest(res.guestId)}
                      className="text-base font-serif italic text-white hover:text-amber-400 transition-colors text-left"
                    >
                      {res.guestName}
                    </button>
                    <span
                      className={`text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        isCheckedIn
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : isConfirmed
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : isCancelled
                          ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                          : 'bg-white/5 text-white/40'
                      }`}
                    >
                      {res.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-white/40 font-mono">
                    <span>{res.guestPhone}</span>
                    <span>•</span>
                    <span className="text-white/70">{res.bookingChannel}</span>
                    <span>•</span>
                    <span>Booked: {res.bookingDate}</span>
                  </div>

                  {res.specialRequests && (
                    <p className="text-xs text-amber-300/90 bg-amber-500/5 px-3 py-1.5 rounded-xl border border-amber-500/20">
                      {res.specialRequests}
                    </p>
                  )}
                </div>

                {/* Middle Block: Stay Details */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 block">Room Category</span>
                    <span className="font-medium text-white/80">{res.roomType}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 block">Room Number</span>
                    <span className="font-mono font-medium text-amber-400">
                      {res.roomNumber ? `Room ${res.roomNumber}` : 'Unassigned'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 block">Stay Dates</span>
                    <span className="text-white/80 font-mono">{res.checkInDate} → {res.checkOutDate}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 block">Rate & Total</span>
                    <span className="font-mono font-semibold text-emerald-400">
                      ₹{res.totalAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Right Block: Actions */}
                <div className="flex items-center justify-end gap-2.5 shrink-0">
                  {isConfirmed && (
                    <>
                      <button
                        onClick={() => onCheckInReservation(res.id)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all shadow-md shadow-emerald-500/20"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>Check In</span>
                      </button>

                      <button
                        onClick={() => onCancelReservation(res.id)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-medium transition-all"
                        title="Cancel reservation"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Cancel</span>
                      </button>
                    </>
                  )}

                  {isCheckedIn && res.roomId && (
                    <button
                      onClick={() => onSelectRoom(res.roomId!)}
                      className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 text-xs font-medium transition-all"
                    >
                      Room Details →
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
