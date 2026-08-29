import React, { useState } from 'react';
import { Guest, VIPTier } from '../../types';
import {
  X,
  UserPlus,
  AlertTriangle,
  Loader2,
  Shield,
  Phone,
  Mail,
  Globe,
  FileText,
} from 'lucide-react';

interface AddGuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitGuest: (guestData: Partial<Guest>) => Promise<void>;
}

export const AddGuestModal: React.FC<AddGuestModalProps> = ({
  isOpen,
  onClose,
  onSubmitGuest,
}) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [nationality, setNationality] = useState('Indian');
  const [vipStatus, setVipStatus] = useState<VIPTier>('Regular');
  const [idProofType, setIdProofType] = useState('Aadhaar Card');
  const [idProofNumber, setIdProofNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !phone.trim()) {
      setError('First name and phone number are required.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onSubmitGuest({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        email: email.trim() || `${firstName.toLowerCase()}@meridian-guest.com`,
        nationality: nationality.trim() || 'Indian',
        vipStatus,
        idProofType,
        idProofNumber: idProofNumber.trim() || 'VERIFIED-DESK',
        notes: notes.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to add guest profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#0A0A0B]/95 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] backdrop-blur-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-serif italic text-white/95">
                Register New Guest Profile
              </h3>
              <p className="text-xs text-white/40">
                Create a persistent guest record with verified identification.
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

          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-white/60">First Name *</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="e.g. Sunita"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-amber-500/60"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-white/60">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="e.g. Banerjee"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-amber-500/60"
              />
            </div>
          </div>

          {/* Contact Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-white/60">Phone Number *</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98300 12345"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-amber-500/60"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-white/60">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sunita@example.com"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-amber-500/60"
              />
            </div>
          </div>

          {/* Nationality & VIP Tier */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-white/60">Nationality</label>
              <input
                type="text"
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
                placeholder="Indian"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-amber-500/60"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-white/60">VIP Tier</label>
              <select
                value={vipStatus}
                onChange={(e) => setVipStatus(e.target.value as VIPTier)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500/60"
              >
                <option value="Regular" className="bg-[#12141A] text-white">Regular</option>
                <option value="Silver" className="bg-[#12141A] text-white">Silver</option>
                <option value="Gold" className="bg-[#12141A] text-white">Gold</option>
                <option value="Platinum" className="bg-[#12141A] text-white">Platinum (High Priority)</option>
              </select>
            </div>
          </div>

          {/* ID Proof Type & Number */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-white/60">ID Document</label>
              <select
                value={idProofType}
                onChange={(e) => setIdProofType(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500/60"
              >
                <option value="Aadhaar Card" className="bg-[#12141A] text-white">Aadhaar Card</option>
                <option value="Passport" className="bg-[#12141A] text-white">Passport</option>
                <option value="Driving License" className="bg-[#12141A] text-white">Driving License</option>
                <option value="PAN Card" className="bg-[#12141A] text-white">PAN Card</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-white/60">Document Number</label>
              <input
                type="text"
                value={idProofNumber}
                onChange={(e) => setIdProofNumber(e.target.value)}
                placeholder="e.g. 8765-4321-1234"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-amber-500/60"
              />
            </div>
          </div>

          {/* Notes / Special Preferences */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-mono uppercase tracking-wider text-white/60">
              Preferences & Staff Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Prefers feather pillows, vegetarian breakfast, quiet room..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-amber-500/60"
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
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              <span>Save Guest Profile</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
