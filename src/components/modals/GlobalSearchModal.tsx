import React, { useState, useEffect } from 'react';
import { SearchResult } from '../../types';
import {
  Search,
  X,
  Bed,
  Users,
  CalendarCheck2,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { api } from '../../lib/api';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRoom: (roomId: string) => void;
  onSelectGuest: (guestId: string) => void;
  onSelectReservation: (resId: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectRoom,
  onSelectGuest,
  onSelectReservation,
}) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await api.search(query);
        setResults(data);
      } catch (err) {
        console.error('Search failed', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Keyboard shortcut listener for ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const hasAnyResults =
    results &&
    (results.rooms.length > 0 || results.guests.length > 0 || results.reservations.length > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#0A0A0B]/95 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] backdrop-blur-2xl">
        {/* Search input bar */}
        <div className="relative flex items-center p-5 border-b border-white/10 bg-white/[0.02]">
          <Search className="w-5 h-5 text-amber-400 mr-3.5 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search hotel database by room #, guest name, phone, or reservation ID..."
            className="w-full bg-transparent text-sm text-white placeholder-white/30 focus:outline-none"
          />
          {loading && <Loader2 className="w-4 h-4 text-amber-400 animate-spin mr-2" />}
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results area */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 text-xs">
          {!query.trim() && (
            <div className="p-8 text-center text-white/40 space-y-1.5">
              <p className="text-white/60">Type room number, guest surname, phone or booking code</p>
              <span className="text-[11px] font-mono text-white/30">
                Examples: "204", "Das", "Deluxe", "RES-1002"
              </span>
            </div>
          )}

          {query.trim() && !loading && !hasAnyResults && (
            <div className="p-8 text-center text-white/40">
              No matching records found in hotel database.
            </div>
          )}

          {results && results.rooms.length > 0 && (
            <div className="space-y-2.5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                <Bed className="w-3.5 h-3.5 text-cyan-400" /> Rooms ({results.rooms.length})
              </span>
              <div className="space-y-1.5">
                {results.rooms.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => {
                      onClose();
                      onSelectRoom(r.id);
                    }}
                    className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-cyan-400/40 cursor-pointer flex items-center justify-between transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-white text-sm">Room {r.roomNumber}</span>
                      <span className="text-white/70">{r.roomType}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-white/50 border border-white/5">
                        Floor {r.floor}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/5 text-white/60 border border-white/5">
                        {r.status}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-white/30" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {results && results.guests.length > 0 && (
            <div className="space-y-2.5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-amber-400" /> Guests ({results.guests.length})
              </span>
              <div className="space-y-1.5">
                {results.guests.map((g) => (
                  <div
                    key={g.id}
                    onClick={() => {
                      onClose();
                      onSelectGuest(g.id);
                    }}
                    className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-amber-400/40 cursor-pointer flex items-center justify-between transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-white/90">
                        {g.firstName} {g.lastName}
                      </span>
                      <span className="text-white/40 text-[11px] font-mono">{g.phone}</span>
                      <span className="text-white/40 text-[11px]">{g.nationality}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {g.currentRoomNumber && (
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Room {g.currentRoomNumber}
                        </span>
                      )}
                      <ChevronRight className="w-3.5 h-3.5 text-white/30" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {results && results.reservations.length > 0 && (
            <div className="space-y-2.5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <CalendarCheck2 className="w-3.5 h-3.5 text-emerald-400" /> Reservations ({results.reservations.length})
              </span>
              <div className="space-y-1.5">
                {results.reservations.map((res) => (
                  <div
                    key={res.id}
                    onClick={() => {
                      onClose();
                      onSelectReservation(res.id);
                    }}
                    className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-emerald-400/40 cursor-pointer flex items-center justify-between transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-amber-400 text-xs">{res.id}</span>
                      <span className="font-semibold text-white/90">{res.guestName}</span>
                      <span className="text-white/40 text-[11px] font-mono">
                        {res.checkInDate} → {res.checkOutDate}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/5 text-white/60 border border-white/5">
                        {res.status}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-white/30" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
