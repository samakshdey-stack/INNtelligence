import React, { useState } from 'react';
import { Room, RoomStatus } from '../types';
import {
  BedDouble,
  Search,
  CheckCircle2,
  Brush,
  Wrench,
  Ban,
  User,
  Layers,
  Sparkles,
} from 'lucide-react';

interface RoomsManagerProps {
  rooms: Room[];
  onSelectRoom: (roomId: string) => void;
}

export const RoomsManager: React.FC<RoomsManagerProps> = ({
  rooms,
  onSelectRoom,
}) => {
  const [selectedFloor, setSelectedFloor] = useState<number | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRooms = rooms.filter((r) => {
    const matchesFloor = selectedFloor === 'ALL' || r.floor === selectedFloor;
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    const matchesSearch =
      !searchQuery ||
      r.roomNumber.includes(searchQuery) ||
      r.roomType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.currentGuestName && r.currentGuestName.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesFloor && matchesStatus && matchesSearch;
  });

  const getStatusVisuals = (status: RoomStatus) => {
    switch (status) {
      case 'Available':
        return {
          border: 'border-white/10 hover:border-emerald-500/50',
          bg: 'bg-white/[0.03]',
          badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          dot: 'bg-emerald-400',
          icon: CheckCircle2,
        };
      case 'Occupied':
        return {
          border: 'border-white/10 hover:border-amber-500/50',
          bg: 'bg-white/[0.03]',
          badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
          dot: 'bg-amber-400',
          icon: User,
        };
      case 'Cleaning':
        return {
          border: 'border-white/10 hover:border-cyan-500/50',
          bg: 'bg-white/[0.03]',
          badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
          dot: 'bg-cyan-400',
          icon: Brush,
        };
      case 'Maintenance':
        return {
          border: 'border-white/10 hover:border-rose-500/50',
          bg: 'bg-white/[0.03]',
          badge: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
          dot: 'bg-rose-400',
          icon: Wrench,
        };
      case 'Out of Service':
        return {
          border: 'border-white/5 hover:border-white/20',
          bg: 'bg-white/[0.01]',
          badge: 'bg-white/5 text-white/40 border-white/10',
          dot: 'bg-white/30',
          icon: Ban,
        };
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* 1. Header & Inventory Stats */}
      <div className="rounded-3xl bg-white/[0.03] border border-white/10 p-6 sm:p-7 backdrop-blur-md shadow-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <BedDouble className="w-5 h-5 text-amber-400" />
              <h2 className="text-xl sm:text-2xl font-serif italic text-white/95 tracking-tight">
                100-Room Master Inventory Matrix
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-white/40 font-light">
              Real-time room occupancy, cleaning workflows, and technical maintenance across Floors 1–5.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-white/60 bg-white/5 px-4 py-2 rounded-full border border-white/10">
              Total Units: <strong className="text-amber-400">{rooms.length}</strong>
            </span>
          </div>
        </div>

        {/* Floor Selection Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-xs font-mono uppercase tracking-wider text-white/40 mr-1 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" /> Floor:
            </span>
            <button
              onClick={() => setSelectedFloor('ALL')}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                selectedFloor === 'ALL'
                  ? 'bg-amber-500 text-black font-semibold shadow-md'
                  : 'bg-white/5 text-white/50 hover:text-white border border-white/5'
              }`}
            >
              All (1-5)
            </button>
            {[1, 2, 3, 4, 5].map((floorNum) => (
              <button
                key={floorNum}
                onClick={() => setSelectedFloor(floorNum)}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                  selectedFloor === floorNum
                    ? 'bg-amber-500 text-black font-semibold shadow-md'
                    : 'bg-white/5 text-white/50 hover:text-white border border-white/5'
                }`}
              >
                Floor {floorNum}
              </button>
            ))}
          </div>

          {/* Quick Search */}
          <div className="relative min-w-[260px]">
            <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search room # or guest..."
              className="w-full bg-white/5 border border-white/10 focus:border-amber-500/50 rounded-full pl-9 pr-4 py-2 text-xs text-white placeholder-white/30 focus:outline-none backdrop-blur-sm"
            />
          </div>
        </div>

        {/* Status Filter Chips */}
        <div className="flex items-center gap-2 pt-2 border-t border-white/10 overflow-x-auto no-scrollbar">
          {[
            { id: 'ALL', label: 'All Statuses', count: rooms.length, color: 'text-white/60' },
            {
              id: 'Available',
              label: 'Available',
              count: rooms.filter((r) => r.status === 'Available').length,
              color: 'text-emerald-400',
            },
            {
              id: 'Occupied',
              label: 'Occupied',
              count: rooms.filter((r) => r.status === 'Occupied').length,
              color: 'text-amber-400',
            },
            {
              id: 'Cleaning',
              label: 'Cleaning',
              count: rooms.filter((r) => r.status === 'Cleaning').length,
              color: 'text-cyan-400',
            },
            {
              id: 'Maintenance',
              label: 'Maintenance',
              count: rooms.filter((r) => r.status === 'Maintenance').length,
              color: 'text-rose-400',
            },
          ].map((statusChip) => (
            <button
              key={statusChip.id}
              onClick={() => setStatusFilter(statusChip.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                statusFilter === statusChip.id
                  ? 'bg-white/15 text-white border border-white/20 shadow-sm'
                  : 'bg-white/5 text-white/40 hover:text-white/80 border border-white/5'
              }`}
            >
              <span className={statusChip.color}>●</span>
              <span>{statusChip.label}</span>
              <span className="font-mono text-[10px] text-white/40">({statusChip.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Room Matrix Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-wider text-white/40">
            Showing <strong className="text-white">{filteredRooms.length}</strong> matching rooms
          </span>
          <span className="text-[11px] font-mono text-white/40">Click any room for controls</span>
        </div>

        {filteredRooms.length === 0 ? (
          <div className="p-12 text-center bg-white/[0.02] rounded-3xl border border-white/10 text-white/40 text-sm">
            No rooms match your active filter criteria.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
            {filteredRooms.map((room) => {
              const visual = getStatusVisuals(room.status);
              const Icon = visual.icon;

              return (
                <div
                  key={room.id}
                  onClick={() => onSelectRoom(room.id)}
                  className={`p-4 rounded-3xl ${visual.bg} border ${visual.border} cursor-pointer space-y-3 transition-all group hover:scale-[1.02] shadow-lg backdrop-blur-md relative overflow-hidden`}
                >
                  {/* Top Bar: Room # and Status Badge */}
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                        {room.roomNumber}
                      </span>
                      <span className="text-[10px] text-white/40 block font-mono">
                        Floor {room.floor}
                      </span>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${visual.badge}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${visual.dot}`} />
                      {room.status}
                    </span>
                  </div>

                  {/* Room Type & Rate */}
                  <div className="space-y-0.5 text-xs">
                    <p className="text-white/80 font-medium truncate">{room.roomType}</p>
                    <p className="font-mono text-amber-400 text-[11px]">
                      ₹{room.rate.toLocaleString('en-IN')}/night
                    </p>
                  </div>

                  {/* Dynamic Occupancy / Housekeeping Info */}
                  <div className="pt-2.5 border-t border-white/5 text-[11px] text-white/40">
                    {room.status === 'Occupied' && (
                      <p className="text-amber-400/90 font-medium truncate flex items-center gap-1">
                        <User className="w-3 h-3 text-amber-400 shrink-0" />
                        <span className="truncate">{room.currentGuestName || 'In-House'}</span>
                      </p>
                    )}
                    {room.status === 'Available' && (
                      <p className="text-emerald-400 flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider">
                        <CheckCircle2 className="w-3 h-3 shrink-0" /> Ready to Book
                      </p>
                    )}
                    {room.status === 'Cleaning' && (
                      <p className="text-cyan-400 flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider">
                        <Brush className="w-3 h-3 shrink-0" /> Housekeeping
                      </p>
                    )}
                    {room.status === 'Maintenance' && (
                      <p className="text-rose-400 truncate flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider">
                        <Wrench className="w-3 h-3 shrink-0" /> Maintenance
                      </p>
                    )}
                    {room.status === 'Out of Service' && (
                      <p className="text-white/30 font-mono text-[10px] uppercase tracking-wider">Out of Service</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
