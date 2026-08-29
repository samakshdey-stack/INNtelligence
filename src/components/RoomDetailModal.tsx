import React, { useState } from 'react';
import {
  Room,
  Guest,
  Reservation,
  OperationalEvent,
  RoomStatus,
} from '../types';
import {
  X,
  Bed,
  Brush,
  Wrench,
  Ban,
  CheckCircle2,
  Clock,
  User,
  LogOut,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';

interface RoomDetailModalProps {
  room: Room | null;
  guests: Guest[];
  reservations: Reservation[];
  events: OperationalEvent[];
  onClose: () => void;
  onMarkClean: (roomId: string) => void;
  onSetMaintenance: (roomId: string, status: 'Maintenance' | 'Out of Service' | 'Available', reason?: string) => void;
  onOpenCheckOut: (reservationId: string, roomId: string) => void;
  onSelectGuest: (guestId: string) => void;
}

export const RoomDetailModal: React.FC<RoomDetailModalProps> = ({
  room,
  guests,
  reservations,
  events,
  onClose,
  onMarkClean,
  onSetMaintenance,
  onOpenCheckOut,
  onSelectGuest,
}) => {
  const [maintenanceReason, setMaintenanceReason] = useState('');
  const [showMaintenanceForm, setShowMaintenanceForm] = useState(false);

  if (!room) return null;

  const currentGuest = guests.find((g) => g.id === room.currentGuestId);
  const currentReservation = reservations.find((r) => r.id === room.currentReservationId);

  // Events related to this room
  const roomEvents = events.filter(
    (e) =>
      e.entityId === room.id ||
      e.metadata.room_number === room.roomNumber ||
      (currentReservation && e.metadata.reservation_id === currentReservation.id)
  );

  const getStatusBadge = (status: RoomStatus) => {
    switch (status) {
      case 'Available':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" /> Available & Ready
          </span>
        );
      case 'Occupied':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <User className="w-3.5 h-3.5" /> Occupied
          </span>
        );
      case 'Cleaning':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Brush className="w-3.5 h-3.5" /> Housekeeping (Cleaning)
          </span>
        );
      case 'Maintenance':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider bg-rose-500/10 text-rose-300 border border-rose-500/20">
            <Wrench className="w-3.5 h-3.5" /> Maintenance Required
          </span>
        );
      case 'Out of Service':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider bg-white/5 text-white/50 border border-white/10">
            <Ban className="w-3.5 h-3.5" /> Out of Service
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-[#0A0A0B]/95 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col backdrop-blur-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-mono font-bold text-xl text-amber-400 shadow-inner">
              {room.roomNumber}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-serif italic text-white/95">
                  Room {room.roomNumber} — {room.roomType}
                </h3>
              </div>
              <p className="text-xs text-white/40 mt-0.5 font-mono">
                Floor {room.floor} • Standard Rate: ₹{room.rate.toLocaleString('en-IN')}/night
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {getStatusBadge(room.status)}
            <button
              onClick={onClose}
              className="p-2 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-7 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
          {/* Current Occupant Details if Occupied */}
          {room.status === 'Occupied' && (
            <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400">
                  Current Occupant (Active Stay)
                </span>
                {currentReservation && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenCheckOut(currentReservation.id, room.id);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-rose-500/20 border border-rose-500/30 hover:bg-rose-500/30 text-rose-300 text-xs font-semibold transition-all"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Check Out</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 block">Guest Name</span>
                  <button
                    onClick={() => currentGuest && onSelectGuest(currentGuest.id)}
                    className="font-medium text-white/90 hover:text-amber-400 transition-colors text-left"
                  >
                    {room.currentGuestName || 'Registered In-House Guest'} →
                  </button>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 block">Reservation Ref</span>
                  <span className="font-mono text-white/80">
                    {room.currentReservationId || 'Direct Stay'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 block">Stay Dates</span>
                  <span className="text-white/80 font-mono">
                    {currentReservation ? `${currentReservation.checkInDate} to ${currentReservation.checkOutDate}` : 'In-House'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 block">Billing Rate</span>
                  <span className="font-mono text-amber-400 font-semibold">
                    ₹{room.rate.toLocaleString('en-IN')}/night
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Cleaning Notice if in Cleaning */}
          {room.status === 'Cleaning' && (
            <div className="p-5 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                  <Brush className="w-4 h-4" /> Housekeeping in Progress
                </span>
                <p className="text-xs text-white/60">
                  Room was vacated and is undergoing linen refresh, sanitization, and mini-bar audit.
                </p>
              </div>

              <button
                onClick={() => onMarkClean(room.id)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-xs transition-all shadow-md shrink-0"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Mark Clean & Available</span>
              </button>
            </div>
          )}

          {/* Maintenance Notice if under Maintenance */}
          {room.status === 'Maintenance' && (
            <div className="p-5 rounded-2xl bg-rose-500/5 border border-rose-500/20 space-y-3">
              <span className="text-[11px] font-mono uppercase tracking-wider text-rose-300 flex items-center gap-2">
                <Wrench className="w-4 h-4" /> Technical Maintenance Log
              </span>
              <p className="text-xs text-white/80">
                <strong className="text-white/60">Reason:</strong> {room.maintenanceReason || 'HVAC and plumbing routine servicing.'}
              </p>
              <div className="pt-2">
                <button
                  onClick={() => onSetMaintenance(room.id, 'Available')}
                  className="px-4 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-all"
                >
                  Clear Maintenance & Mark Available
                </button>
              </div>
            </div>
          )}

          {/* Room Specs & Amenities */}
          <div className="space-y-2.5">
            <h4 className="text-[11px] font-mono uppercase tracking-wider text-white/40">
              Room Specifications & Amenities
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-xs">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 block">Inventory ID</span>
                <span className="font-mono text-white/80">{room.id}</span>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 block">Floor Number</span>
                <span className="text-white/80">Floor {room.floor}</span>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 block">Published Rate</span>
                <span className="font-mono text-amber-400">₹{room.rate.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {room.features && room.features.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {room.features.map((feat, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] px-3 py-1 rounded-full bg-white/5 text-white/70 border border-white/10"
                  >
                    {feat}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Maintenance Action Form */}
          {room.status !== 'Occupied' && (
            <div className="space-y-2.5 pt-3 border-t border-white/10">
              {!showMaintenanceForm ? (
                <div className="flex items-center gap-2.5">
                  {room.status !== 'Cleaning' && (
                    <button
                      onClick={() => onMarkClean(room.id)}
                      className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-cyan-400 text-xs font-medium border border-white/10 transition-colors"
                    >
                      <Brush className="w-3.5 h-3.5 inline mr-1.5" /> Mark Cleaning
                    </button>
                  )}
                  {room.status !== 'Maintenance' && (
                    <button
                      onClick={() => setShowMaintenanceForm(true)}
                      className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-rose-300 text-xs font-medium border border-white/10 transition-colors"
                    >
                      <Wrench className="w-3.5 h-3.5 inline mr-1.5" /> Flag Maintenance...
                    </button>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-rose-500/30 space-y-3">
                  <span className="text-xs font-semibold text-rose-300 block">
                    Flag Room {room.roomNumber} for Maintenance
                  </span>
                  <input
                    type="text"
                    value={maintenanceReason}
                    onChange={(e) => setMaintenanceReason(e.target.value)}
                    placeholder="Enter reason (e.g. AC sensor repair, bathroom leak)..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-rose-500/50"
                  />
                  <div className="flex items-center gap-2.5 pt-1">
                    <button
                      onClick={() => {
                        onSetMaintenance(room.id, 'Maintenance', maintenanceReason);
                        setShowMaintenanceForm(false);
                      }}
                      className="px-4 py-1.5 rounded-full bg-rose-500 hover:bg-rose-400 text-white font-semibold text-xs"
                    >
                      Confirm Maintenance
                    </button>
                    <button
                      onClick={() => setShowMaintenanceForm(false)}
                      className="px-4 py-1.5 rounded-full bg-white/5 text-white/50 text-xs hover:bg-white/10"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Historical Operational Logs for this Room */}
          <div className="space-y-2.5">
            <h4 className="text-[11px] font-mono uppercase tracking-wider text-white/40">
              Room Activity History
            </h4>
            {roomEvents.length === 0 ? (
              <p className="text-xs text-white/40 p-4 bg-white/[0.02] rounded-2xl border border-white/5">
                No specific activity recorded for this room today.
              </p>
            ) : (
              <div className="space-y-2">
                {roomEvents.slice(0, 4).map((evt) => (
                  <div
                    key={evt.id}
                    className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="font-medium text-white/90">{evt.title}</span>
                      <span className="text-white/30">•</span>
                      <span className="text-white/40 text-[11px]">{evt.description}</span>
                    </div>
                    <span className="text-[10px] font-mono text-white/40 shrink-0 ml-2">
                      {evt.timeFormatted}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-5 border-t border-white/10 bg-white/[0.02] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 text-xs font-semibold transition-colors"
          >
            Close Room View
          </button>
        </div>
      </div>
    </div>
  );
};
