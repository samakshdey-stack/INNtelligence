import React, { useState } from 'react';
import {
  Guest,
  Room,
  CreateReservationPayload,
} from '../../types';
import {
  X,
  PlusCircle,
  AlertTriangle,
  Calendar,
  Bed,
  CreditCard,
  User,
  Loader2,
} from 'lucide-react';

interface NewReservationModalProps {
  isOpen: boolean;
  guests: Guest[];
  rooms: Room[];
  onClose: () => void;
  onSubmitReservation: (payload: CreateReservationPayload) => Promise<void>;
}

export const NewReservationModal: React.FC<NewReservationModalProps> = ({
  isOpen,
  guests,
  rooms,
  onClose,
  onSubmitReservation,
}) => {
  const [guestMode, setGuestMode] = useState<'existing' | 'new'>('existing');
  const [selectedGuestId, setSelectedGuestId] = useState<string>(guests[0]?.id || '');

  // New guest fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // Reservation details
  const [roomType, setRoomType] = useState('Deluxe King Room');
  const [checkInDate, setCheckInDate] = useState('2026-08-22');
  const [checkOutDate, setCheckOutDate] = useState('2026-08-24');
  const [bookingChannel, setBookingChannel] = useState('Direct Front Desk');
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [customRate, setCustomRate] = useState(7500);
  const [specialRequests, setSpecialRequests] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const roomRatesByType: Record<string, number> = {
    'Deluxe King Room': 7500,
    'Executive Suite': 14000,
    'Club Twin Room': 8500,
    'Presidential Suite': 32000,
    'Superior Queen Room': 6500,
  };

  const handleRoomTypeChange = (type: string) => {
    setRoomType(type);
    if (roomRatesByType[type]) {
      setCustomRate(roomRatesByType[type]);
    }
  };

  // Compute nights
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  const nights = Math.max(1, Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)));
  const totalAmount = nights * customRate;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload: CreateReservationPayload = {
        guestId: guestMode === 'existing' ? selectedGuestId : undefined,
        newGuest:
          guestMode === 'new'
            ? {
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                phone: phone.trim(),
                email: email.trim() || `${firstName.toLowerCase()}@meridian-guest.com`,
                nationality: 'Indian',
              }
            : undefined,
        roomType,
        checkInDate,
        checkOutDate,
        bookingChannel,
        adults,
        children,
        rate: customRate,
        specialRequests: specialRequests.trim() || undefined,
        performedBy: 'Front Desk (Priya D.)',
      };

      if (guestMode === 'new' && (!firstName.trim() || !phone.trim())) {
        throw new Error('Please provide at least a First Name and Phone Number for the new guest.');
      }

      await onSubmitReservation(payload);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create reservation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl bg-[#0A0A0B]/95 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] backdrop-blur-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-serif italic text-white/95">
                Create New Hotel Reservation
              </h3>
              <p className="text-xs text-white/40">
                Direct booking or OTA channel intake for The Meridian Kolkata.
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
        <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-4 text-xs sm:text-sm overflow-y-auto">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Guest Mode Switch */}
          <div className="flex items-center gap-2 p-1 bg-white/5 rounded-2xl border border-white/10">
            <button
              type="button"
              onClick={() => setGuestMode('existing')}
              className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${
                guestMode === 'existing'
                  ? 'bg-amber-500 text-black font-semibold shadow-md'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              Existing Guest Profile
            </button>
            <button
              type="button"
              onClick={() => setGuestMode('new')}
              className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${
                guestMode === 'new'
                  ? 'bg-amber-500 text-black font-semibold shadow-md'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              New Guest Walk-in / Intake
            </button>
          </div>

          {/* Existing Guest Select */}
          {guestMode === 'existing' ? (
            <div className="space-y-1.5">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-white/60">
                Select Registered Guest
              </label>
              <select
                value={selectedGuestId}
                onChange={(e) => setSelectedGuestId(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500/60"
              >
                {guests.map((g) => (
                  <option key={g.id} value={g.id} className="bg-[#12141A] text-white">
                    {g.firstName} {g.lastName} — {g.phone} ({g.nationality})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="space-y-3 p-4 rounded-2xl bg-white/[0.03] border border-white/10">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-white/40 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g. Rohini"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-amber-500/60"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-white/40 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="e.g. Dasgupta"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-amber-500/60"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-white/40 mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 98310 98765"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-amber-500/60"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-white/40 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="guest@example.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-amber-500/60"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Room Category & Channel */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-white/60">Room Category</label>
              <select
                value={roomType}
                onChange={(e) => handleRoomTypeChange(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500/60"
              >
                <option value="Deluxe King Room" className="bg-[#12141A] text-white">Deluxe King Room</option>
                <option value="Executive Suite" className="bg-[#12141A] text-white">Executive Suite</option>
                <option value="Club Twin Room" className="bg-[#12141A] text-white">Club Twin Room</option>
                <option value="Presidential Suite" className="bg-[#12141A] text-white">Presidential Suite</option>
                <option value="Superior Queen Room" className="bg-[#12141A] text-white">Superior Queen Room</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-white/60">Booking Channel</label>
              <select
                value={bookingChannel}
                onChange={(e) => setBookingChannel(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500/60"
              >
                <option value="Direct Front Desk" className="bg-[#12141A] text-white">Direct Front Desk</option>
                <option value="Booking.com" className="bg-[#12141A] text-white">Booking.com</option>
                <option value="Agoda" className="bg-[#12141A] text-white">Agoda</option>
                <option value="MakeMyTrip" className="bg-[#12141A] text-white">MakeMyTrip</option>
                <option value="Corporate Desk" className="bg-[#12141A] text-white">Corporate Desk</option>
                <option value="Hotel Website" className="bg-[#12141A] text-white">Hotel Website</option>
              </select>
            </div>
          </div>

          {/* Stay Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-white/60">Check-In Date</label>
              <input
                type="date"
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500/60"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-white/60">Check-Out Date</label>
              <input
                type="date"
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500/60"
              />
            </div>
          </div>

          {/* Occupants & Nightly Rate */}
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-white/60">Adults</label>
              <input
                type="number"
                min="1"
                max="6"
                value={adults}
                onChange={(e) => setAdults(parseInt(e.target.value) || 1)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500/60"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-white/60">Children</label>
              <input
                type="number"
                min="0"
                max="4"
                value={children}
                onChange={(e) => setChildren(parseInt(e.target.value) || 0)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500/60"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-white/60">Nightly Rate (₹)</label>
              <input
                type="number"
                min="1000"
                step="500"
                value={customRate}
                onChange={(e) => setCustomRate(parseInt(e.target.value) || 0)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500/60"
              />
            </div>
          </div>

          {/* Computed Summary */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
            <span className="text-xs text-white/60">
              Total ({nights} {nights === 1 ? 'night' : 'nights'} @ ₹{customRate.toLocaleString('en-IN')}/night)
            </span>
            <span className="font-mono text-base font-bold text-amber-400">
              ₹{totalAmount.toLocaleString('en-IN')}
            </span>
          </div>

          {/* Special Requests */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-mono uppercase tracking-wider text-white/60">
              Special Guest Requests / Note
            </label>
            <input
              type="text"
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder="e.g. High floor, early check-in, extra towels..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-amber-500/60"
            />
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
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black text-xs font-bold transition-all shadow-md shadow-amber-500/20"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
              <span>Confirm Reservation</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
