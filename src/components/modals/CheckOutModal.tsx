import React, { useState, useEffect } from 'react';
import {
  Reservation,
  Room,
  CheckOutPayload,
} from '../../types';
import {
  X,
  LogOut,
  AlertTriangle,
  CreditCard,
  Brush,
  CheckCircle2,
  Receipt,
  Loader2,
} from 'lucide-react';

interface CheckOutModalProps {
  isOpen: boolean;
  preselectedReservationId?: string | null;
  preselectedRoomId?: string | null;
  reservations: Reservation[];
  rooms: Room[];
  onClose: () => void;
  onSubmitCheckOut: (payload: CheckOutPayload) => Promise<void>;
}

export const CheckOutModal: React.FC<CheckOutModalProps> = ({
  isOpen,
  preselectedReservationId,
  preselectedRoomId,
  reservations,
  rooms,
  onClose,
  onSubmitCheckOut,
}) => {
  const [selectedResId, setSelectedResId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('Corporate Direct / Credit Card');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // In-house reservations
  const activeReservations = reservations.filter((r) => r.status === 'Checked In');

  useEffect(() => {
    if (preselectedReservationId) {
      setSelectedResId(preselectedReservationId);
    } else if (preselectedRoomId) {
      const match = activeReservations.find((r) => r.roomId === preselectedRoomId);
      if (match) setSelectedResId(match.id);
    } else if (activeReservations.length > 0 && !selectedResId) {
      setSelectedResId(activeReservations[0].id);
    }
  }, [preselectedReservationId, preselectedRoomId, activeReservations]);

  const selectedReservation = reservations.find((r) => r.id === selectedResId);
  const selectedRoom = selectedReservation?.roomId
    ? rooms.find((r) => r.id === selectedReservation.roomId)
    : null;

  if (!isOpen) return null;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResId) {
      setError('Please select an active in-house stay to check out.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onSubmitCheckOut({
        reservationId: selectedResId,
        performedBy: 'Front Desk (Priya D.)',
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to process checkout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#0A0A0B]/95 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col backdrop-blur-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <LogOut className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-serif italic text-white/95">
                Express Guest Check-Out & Folio Settle
              </h3>
              <p className="text-xs text-white/40">
                Settle folio charges and transition room to Housekeeping Cleaning.
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

        {/* Modal Form */}
        <form onSubmit={handleCheckout} className="p-6 sm:p-7 space-y-4 text-xs sm:text-sm">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Select In-House Stay */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-mono uppercase tracking-wider text-white/60">
              Select In-House Room / Guest
            </label>
            <select
              value={selectedResId}
              onChange={(e) => setSelectedResId(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-amber-500/60"
            >
              {activeReservations.length === 0 ? (
                <option value="">No active in-house guests currently</option>
              ) : (
                activeReservations.map((r) => (
                  <option key={r.id} value={r.id} className="bg-[#12141A] text-white">
                    Room {r.roomNumber || 'N/A'} — {r.guestName} ({r.id})
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Folio Breakdown */}
          {selectedReservation && (
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <div>
                  <span className="font-semibold text-white text-sm block">
                    {selectedReservation.guestName}
                  </span>
                  <span className="text-xs text-white/40">
                    Room {selectedReservation.roomNumber} &bull; {selectedReservation.roomType}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-white/40 block">Total Folio</span>
                  <span className="font-mono text-base font-bold text-emerald-400">
                    ₹{selectedReservation.totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-white/60">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 block">Stay Duration</span>
                  <span className="text-white/80">{selectedReservation.checkInDate} &rarr; {selectedReservation.checkOutDate}</span>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 block">Booking Channel</span>
                  <span className="text-white/80">{selectedReservation.bookingChannel}</span>
                </div>
              </div>
            </div>
          )}

          {/* Housekeeping Rule Notification */}
          <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-start gap-2.5 text-xs text-cyan-200">
            <Brush className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              Completing this checkout will transition <strong>Room {selectedReservation?.roomNumber || ''}</strong> directly into <span className="text-cyan-300 font-semibold">"Cleaning"</span> status for Housekeeping disinfection.
            </p>
          </div>

          {/* Payment method selection */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-mono uppercase tracking-wider text-white/60">
              Settlement Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500/60"
            >
              <option value="Corporate Direct / Credit Card" className="bg-[#12141A] text-white">Corporate Direct / Credit Card</option>
              <option value="UPI / Online QR" className="bg-[#12141A] text-white">UPI / Online QR</option>
              <option value="Cash at Front Desk" className="bg-[#12141A] text-white">Cash at Front Desk</option>
              <option value="Prepaid OTA Voucher" className="bg-[#12141A] text-white">Prepaid OTA Voucher</option>
            </select>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-white/70 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedResId}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-rose-500 hover:bg-rose-400 disabled:opacity-40 text-black text-xs font-bold transition-all shadow-md shadow-rose-500/20"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
              <span>Complete Check-Out</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
