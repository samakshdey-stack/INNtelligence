import React from 'react';
import {
  Guest,
  Reservation,
  OperationalEvent,
  Room,
} from '../types';
import {
  X,
  User,
  Phone,
  Mail,
  Globe,
  Shield,
  CreditCard,
  Calendar,
  Bed,
  CheckCircle2,
  Clock,
  LogIn,
  LogOut,
  FileText,
} from 'lucide-react';

interface GuestDetailModalProps {
  guest: Guest | null;
  reservations: Reservation[];
  events: OperationalEvent[];
  rooms: Room[];
  onClose: () => void;
  onCheckInGuest?: (reservationId: string) => void;
  onCheckOutGuest?: (reservationId: string, roomId: string) => void;
  onSelectRoom?: (roomId: string) => void;
}

export const GuestDetailModal: React.FC<GuestDetailModalProps> = ({
  guest,
  reservations,
  events,
  rooms,
  onClose,
  onCheckInGuest,
  onCheckOutGuest,
  onSelectRoom,
}) => {
  if (!guest) return null;

  // Guest reservations
  const guestReservations = reservations.filter(
    (r) => r.guestId === guest.id || r.guestName.toLowerCase() === `${guest.firstName} ${guest.lastName}`.toLowerCase()
  );

  // Active stay reservation
  const activeReservation = guestReservations.find((r) => r.status === 'Checked In');

  // Related events
  const guestEvents = events.filter(
    (e) =>
      e.entityId === guest.id ||
      e.metadata.guest_name?.toLowerCase().includes(guest.firstName.toLowerCase()) ||
      (guest.currentReservationId && e.metadata.reservation_id === guest.currentReservationId)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-[#0A0A0B]/95 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col backdrop-blur-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-amber-400 font-serif italic text-xl shadow-inner">
              {guest.firstName.charAt(0)}
              {guest.lastName ? guest.lastName.charAt(0) : ''}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-lg font-serif italic text-white/95">
                  {guest.firstName} {guest.lastName}
                </h3>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-white/5 text-white/60 border border-white/10">
                  {guest.id}
                </span>
                {guest.vipStatus !== 'Regular' && (
                  <span className="text-[11px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    VIP: {guest.vipStatus}
                  </span>
                )}
              </div>
              <p className="text-xs text-white/40 mt-0.5 font-mono">
                {guest.nationality} • Registered since {new Date(guest.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-7 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
          {/* Active Stay Banner if In-House */}
          {guest.stayStatus === 'Active Stay' && guest.currentRoomNumber && (
            <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400">
                    Currently In-House (Active Stay)
                  </span>
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="text-xl font-serif italic text-white">
                    Room {guest.currentRoomNumber}
                  </span>
                  <span className="text-xs text-white/40 font-mono">
                    Check-in: {guest.checkInDate || '2026-08-21'} • Check-out: {guest.checkOutDate || '2026-08-24'}
                  </span>
                </div>
              </div>

              {activeReservation && (
                <button
                  onClick={() => {
                    onClose();
                    onCheckOutGuest?.(activeReservation.id, activeReservation.roomId || '');
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-rose-500/20 border border-rose-500/30 hover:bg-rose-500/30 text-rose-300 text-xs font-semibold self-start sm:self-center transition-all shadow-md shrink-0"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Check Out Room {guest.currentRoomNumber}</span>
                </button>
              )}
            </div>
          )}

          {/* Contact & Identification Grid */}
          <div className="space-y-2.5">
            <h4 className="text-[11px] font-mono uppercase tracking-wider text-white/40">
              Guest Identity & Contact
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 p-5 rounded-2xl bg-white/[0.03] border border-white/10">
              <div className="space-y-1">
                <span className="text-[11px] font-mono uppercase tracking-wider text-white/40 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-amber-400" /> Phone
                </span>
                <span className="font-medium text-white/90 font-mono">{guest.phone}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-mono uppercase tracking-wider text-white/40 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-amber-400" /> Email
                </span>
                <span className="font-medium text-white/90 truncate block">{guest.email}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-mono uppercase tracking-wider text-white/40 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-amber-400" /> Nationality
                </span>
                <span className="font-medium text-white/90">{guest.nationality}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-mono uppercase tracking-wider text-white/40 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" /> ID Document
                </span>
                <span className="font-medium text-white/90 font-mono">
                  {guest.idProofType || 'Aadhaar Card'}: {guest.idProofNumber || 'Verified'}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-mono uppercase tracking-wider text-white/40 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" /> Lifetime Stays
                </span>
                <span className="font-mono font-medium text-white/90">{guest.totalStays} Stays</span>
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-mono uppercase tracking-wider text-white/40 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-amber-400" /> Folio Status
                </span>
                <span className="font-medium text-emerald-400 font-mono">Current & Settled</span>
              </div>
            </div>
          </div>

          {/* Special Notes / Preferences */}
          {guest.notes && (
            <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-1.5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> Guest Preferences & Front Desk Notes
              </span>
              <p className="text-xs text-white/80 leading-relaxed font-light">{guest.notes}</p>
            </div>
          )}

          {/* Stay & Reservation History */}
          <div className="space-y-2.5">
            <h4 className="text-[11px] font-mono uppercase tracking-wider text-white/40">
              Reservation History ({guestReservations.length})
            </h4>
            {guestReservations.length === 0 ? (
              <p className="text-xs text-white/40 p-4 bg-white/[0.02] rounded-2xl border border-white/5">
                No historical reservations found for this guest profile.
              </p>
            ) : (
              <div className="space-y-2">
                {guestReservations.map((res) => (
                  <div
                    key={res.id}
                    className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white/90">{res.roomType}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-white/60">
                          {res.id}
                        </span>
                        <span
                          className={`text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                            res.status === 'Checked In'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : res.status === 'Confirmed'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-white/5 text-white/40'
                          }`}
                        >
                          {res.status}
                        </span>
                      </div>
                      <p className="text-xs text-white/40 font-mono">
                        {res.checkInDate} to {res.checkOutDate} • {res.bookingChannel} • ₹{res.rate.toLocaleString('en-IN')}/night
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-mono font-semibold text-emerald-400">
                        Total ₹{res.totalAmount.toLocaleString('en-IN')}
                      </span>
                      {res.roomNumber && (
                        <span className="block text-[11px] text-amber-400 font-mono">
                          Room {res.roomNumber}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Operational Event Audit History */}
          <div className="space-y-2.5">
            <h4 className="text-[11px] font-mono uppercase tracking-wider text-white/40">
              Operational Activity Log
            </h4>
            {guestEvents.length === 0 ? (
              <p className="text-xs text-white/40 p-4 bg-white/[0.02] rounded-2xl border border-white/5">
                No specific operational logs recorded.
              </p>
            ) : (
              <div className="space-y-2">
                {guestEvents.slice(0, 4).map((evt) => (
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
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
};
