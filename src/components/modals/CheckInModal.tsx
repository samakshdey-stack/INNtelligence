import React, { useState, useEffect } from 'react';
import {
  Reservation,
  Room,
  Guest,
  CheckInPayload,
} from '../../types';
import {
  X,
  LogIn,
  CheckCircle2,
  AlertTriangle,
  User,
  Bed,
  CreditCard,
  Key,
  Shield,
  Loader2,
} from 'lucide-react';

interface CheckInModalProps {
  isOpen: boolean;
  preselectedReservationId?: string | null;
  reservations: Reservation[];
  rooms: Room[];
  guests: Guest[];
  onClose: () => void;
  onSubmitCheckIn: (payload: CheckInPayload) => Promise<void>;
}

export const CheckInModal: React.FC<CheckInModalProps> = ({
  isOpen,
  preselectedReservationId,
  reservations,
  rooms,
  guests,
  onClose,
  onSubmitCheckIn,
}) => {
  const [selectedResId, setSelectedResId] = useState<string>('');
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [idProofType, setIdProofType] = useState<string>('Aadhaar Card');
  const [idProofNumber, setIdProofNumber] = useState<string>('');
  const [keyCardsIssued, setKeyCardsIssued] = useState<number>(2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Eligible confirmed reservations for check-in
  const eligibleReservations = reservations.filter((r) => r.status === 'Confirmed');

  useEffect(() => {
    if (preselectedReservationId) {
      setSelectedResId(preselectedReservationId);
    } else if (eligibleReservations.length > 0 && !selectedResId) {
      setSelectedResId(eligibleReservations[0].id);
    }
  }, [preselectedReservationId, eligibleReservations]);

  const selectedReservation = reservations.find((r) => r.id === selectedResId);
  const selectedGuest = selectedReservation
    ? guests.find((g) => g.id === selectedReservation.guestId)
    : null;

  // Available rooms matching or suitable
  const availableRooms = rooms.filter(
    (r) =>
      r.status === 'Available' ||
      (selectedReservation?.roomId && r.id === selectedReservation.roomId)
  );

  useEffect(() => {
    if (selectedReservation) {
      if (selectedReservation.roomId) {
        setSelectedRoomId(selectedReservation.roomId);
      } else {
        const matchingAvailable = availableRooms.find(
          (r) => r.roomType === selectedReservation.roomType
        );
        if (matchingAvailable) {
          setSelectedRoomId(matchingAvailable.id);
        } else if (availableRooms.length > 0) {
          setSelectedRoomId(availableRooms[0].id);
        }
      }

      if (selectedGuest?.idProofType) {
        setIdProofType(selectedGuest.idProofType);
      }
      if (selectedGuest?.idProofNumber) {
        setIdProofNumber(selectedGuest.idProofNumber);
      }
    }
  }, [selectedResId, selectedReservation, selectedGuest]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResId) {
      setError('Please select a reservation.');
      return;
    }
    if (!selectedRoomId) {
      setError('Please assign an available room.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onSubmitCheckIn({
        reservationId: selectedResId,
        roomId: selectedRoomId,
        idProofType,
        idProofNumber: idProofNumber || 'VERIFIED-DESK',
        performedBy: 'Front Desk (Priya D.)',
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to complete check-in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl bg-[#0A0A0B]/95 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col backdrop-blur-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <LogIn className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-serif italic text-white/95">
                Guest Check-In & Room Key Assignment
              </h3>
              <p className="text-xs text-white/40">
                Verify guest documents and assign an inspected room.
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
        <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-4 text-xs sm:text-sm">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Select Confirmed Reservation */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-mono uppercase tracking-wider text-white/60">
              Select Confirmed Reservation
            </label>
            <select
              value={selectedResId}
              onChange={(e) => setSelectedResId(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-amber-500/60"
            >
              {eligibleReservations.length === 0 ? (
                <option value="">No confirmed reservations ready for check-in</option>
              ) : (
                eligibleReservations.map((r) => (
                  <option key={r.id} value={r.id} className="bg-[#12141A] text-white">
                    {r.guestName} — {r.id} ({r.roomType}, {r.checkInDate} to {r.checkOutDate})
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Guest & Stay Summary Banner */}
          {selectedReservation && (
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white">{selectedReservation.guestName}</span>
                <span className="font-mono text-emerald-400">
                  Rate: ₹{selectedReservation.rate.toLocaleString('en-IN')}/night
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-white/40">
                <div>
                  <span className="block text-[10px] uppercase font-mono tracking-wider">Contact</span>
                  <span className="text-white/80">{selectedReservation.guestPhone}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-mono tracking-wider">Stay Window</span>
                  <span className="text-white/80">
                    {selectedReservation.checkInDate} &rarr; {selectedReservation.checkOutDate}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 2. Room Assignment */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-mono uppercase tracking-wider text-white/60">
              Assign Available Room
            </label>
            <select
              value={selectedRoomId}
              onChange={(e) => setSelectedRoomId(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-amber-500/60"
            >
              {availableRooms.length === 0 ? (
                <option value="">No inspected available rooms in inventory</option>
              ) : (
                availableRooms.map((room) => (
                  <option key={room.id} value={room.id} className="bg-[#12141A] text-white">
                    Room {room.roomNumber} (Floor {room.floor} &bull; {room.roomType} &bull; ₹{room.rate.toLocaleString('en-IN')}/night)
                  </option>
                ))
              )}
            </select>
          </div>

          {/* 3. Verification & ID Proof */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-white/60">
                ID Document Type
              </label>
              <select
                value={idProofType}
                onChange={(e) => setIdProofType(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500/60"
              >
                <option value="Aadhaar Card" className="bg-[#12141A] text-white">Aadhaar Card</option>
                <option value="Passport" className="bg-[#12141A] text-white">Passport</option>
                <option value="Driving License" className="bg-[#12141A] text-white">Driving License</option>
                <option value="Voter ID" className="bg-[#12141A] text-white">Voter ID</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-white/60">
                ID Document Reference
              </label>
              <input
                type="text"
                value={idProofNumber}
                onChange={(e) => setIdProofNumber(e.target.value)}
                placeholder="e.g. 5421-9876-1234"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-amber-500/60"
              />
            </div>
          </div>

          {/* Key cards issued */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 text-xs">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-400" />
              <span className="text-white/70">Keycards Issued:</span>
            </div>
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setKeyCardsIssued(num)}
                  className={`w-8 h-8 rounded-xl text-xs font-mono font-medium transition-all ${
                    keyCardsIssued === num
                      ? 'bg-amber-500 text-black font-bold shadow-md shadow-amber-500/20'
                      : 'bg-white/5 text-white/50 hover:text-white border border-white/10'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
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
              disabled={loading || !selectedResId || !selectedRoomId}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-black text-xs font-bold transition-all shadow-md shadow-emerald-500/20"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
              <span>Complete Check In</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
