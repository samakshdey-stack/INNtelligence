import React, { useState } from 'react';
import { Guest, Property, StayStatus } from '../types';
import {
  Users,
  Search,
  UserPlus,
  Phone,
  Mail,
  Globe,
  Bed,
  Shield,
  Calendar,
  ChevronRight,
  Filter,
  FileSpreadsheet,
} from 'lucide-react';
import { exportGuestsToGoogleSheets } from '../lib/googleWorkspace';
import { WorkspaceExportModal } from './modals/WorkspaceExportModal';

interface GuestsDirectoryProps {
  guests: Guest[];
  property?: Property | null;
  onSelectGuest: (guestId: string) => void;
  onOpenAddGuest: () => void;
}

export const GuestsDirectory: React.FC<GuestsDirectoryProps> = ({
  guests,
  property = null,
  onSelectGuest,
  onOpenAddGuest,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isSheetsModalOpen, setIsSheetsModalOpen] = useState(false);

  const filteredGuests = guests.filter((g) => {
    const fullName = `${g.firstName} ${g.lastName}`.toLowerCase();
    const query = searchQuery.toLowerCase();

    const matchesSearch =
      !query ||
      fullName.includes(query) ||
      g.phone.toLowerCase().includes(query) ||
      g.email.toLowerCase().includes(query) ||
      (g.currentRoomNumber && g.currentRoomNumber.includes(query)) ||
      g.id.toLowerCase().includes(query) ||
      g.nationality.toLowerCase().includes(query);

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && g.stayStatus === 'Active Stay') ||
      (statusFilter === 'UPCOMING' && g.stayStatus === 'Upcoming') ||
      (statusFilter === 'CHECKED_OUT' && g.stayStatus === 'Checked Out');

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* 1. Header & Controls */}
      <div className="rounded-3xl bg-white/[0.03] border border-white/10 p-6 sm:p-7 backdrop-blur-md shadow-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <Users className="w-5 h-5 text-amber-400" />
              <h2 className="text-xl sm:text-2xl font-serif italic text-white/95 tracking-tight">
                Guest Directory & Profiles
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-white/40 font-light">
              Complete guest registry with stay histories, preferences, and verified contact documents.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
            {/* Google Sheets Export Button */}
            <button
              onClick={() => setIsSheetsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 hover:border-emerald-400/50 text-emerald-400 font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/10 cursor-pointer"
              title="Export all guest profiles to a formatted Google Sheet in Google Drive"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export to Google Sheets</span>
            </button>

            <button
              onClick={onOpenAddGuest}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add New Guest</span>
            </button>
          </div>
        </div>

        {/* Search & Filter bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
          {/* Status Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {[
              { id: 'ALL', label: 'All Guests', count: guests.length },
              {
                id: 'ACTIVE',
                label: 'In-House (Active)',
                count: guests.filter((g) => g.stayStatus === 'Active Stay').length,
              },
              {
                id: 'UPCOMING',
                label: 'Upcoming',
                count: guests.filter((g) => g.stayStatus === 'Upcoming').length,
              },
              {
                id: 'CHECKED_OUT',
                label: 'Checked Out / Past',
                count: guests.filter((g) => g.stayStatus === 'Checked Out').length,
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

          {/* Search Input */}
          <div className="relative min-w-[280px]">
            <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, phone, email, room..."
              className="w-full bg-white/5 border border-white/10 focus:border-amber-500/50 rounded-full pl-9 pr-4 py-2 text-xs text-white placeholder-white/30 focus:outline-none backdrop-blur-sm"
            />
          </div>
        </div>
      </div>

      {/* 2. Guests Table / Cards */}
      <div className="rounded-3xl bg-white/[0.03] border border-white/10 shadow-2xl backdrop-blur-md overflow-hidden">
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.01]">
          <span className="text-xs font-mono uppercase tracking-wider text-white/40">
            Displaying <strong className="text-white">{filteredGuests.length}</strong> guest records
          </span>
          <span className="text-[11px] font-mono text-white/40">Click any guest for full profile</span>
        </div>

        {filteredGuests.length === 0 ? (
          <div className="p-12 text-center text-white/40 text-sm space-y-2">
            <p>No guests match the current search filter.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('ALL');
              }}
              className="text-xs text-amber-400 hover:underline font-mono"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filteredGuests.map((guest) => {
              const isActive = guest.stayStatus === 'Active Stay';

              return (
                <div
                  key={guest.id}
                  onClick={() => onSelectGuest(guest.id)}
                  className="p-5 sm:p-6 hover:bg-white/[0.03] transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-5 group"
                >
                  {/* Left: Avatar & Name */}
                  <div className="flex items-center gap-4 min-w-[240px]">
                    <div className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 group-hover:border-amber-500/40 flex items-center justify-center font-serif italic text-amber-400 text-base transition-colors shrink-0 shadow-inner">
                      {guest.firstName.charAt(0)}
                      {guest.lastName ? guest.lastName.charAt(0) : ''}
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="text-sm font-serif italic text-white group-hover:text-amber-400 transition-colors">
                          {guest.firstName} {guest.lastName}
                        </span>
                        {guest.vipStatus !== 'Regular' && (
                          <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            {guest.vipStatus}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-white/40 mt-1 font-mono">
                        <span>{guest.id}</span>
                        <span>•</span>
                        <span>{guest.nationality}</span>
                      </div>
                    </div>
                  </div>

                  {/* Middle: Contact Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-white/70 min-w-[240px] font-mono">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-amber-400/80 shrink-0" />
                      <span>{guest.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-amber-400/80 shrink-0" />
                      <span className="truncate max-w-[180px]">{guest.email}</span>
                    </div>
                  </div>

                  {/* Right: Stay Status & Room */}
                  <div className="flex items-center justify-between md:justify-end gap-5 min-w-[200px]">
                    <div className="text-left md:text-right">
                      {isActive && guest.currentRoomNumber ? (
                        <div className="flex items-center md:justify-end gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="font-mono font-bold text-xs text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                            Room {guest.currentRoomNumber}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-white/40 block font-mono">
                          {guest.totalStays} Lifetime {guest.totalStays === 1 ? 'Stay' : 'Stays'}
                        </span>
                      )}

                      <span
                        className={`text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full inline-block mt-1.5 ${
                          isActive
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : guest.stayStatus === 'Upcoming'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-white/5 text-white/40 border border-white/10'
                        }`}
                      >
                        {guest.stayStatus}
                      </span>
                    </div>

                    <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Google Sheets Export Modal */}
      <WorkspaceExportModal
        isOpen={isSheetsModalOpen}
        onClose={() => setIsSheetsModalOpen(false)}
        targetType="sheet"
        title="Export Guest Directory to Google Sheets"
        description="This will create a new, professionally formatted Google Spreadsheet in your Google Drive containing complete contact details, stay histories, VIP tiers, and guest preferences."
        itemSummary={[
          { label: 'Total Guest Records', value: `${guests.length} Profiles` },
          { label: 'Active In-House', value: `${guests.filter((g) => g.stayStatus === 'Active Stay').length} Guests` },
          { label: 'VIP Executives', value: `${guests.filter((g) => g.isVIP).length} VIPs` },
          { label: 'Data Fields', value: '14 Columns' },
        ]}
        onPerformExport={async (token) => {
          return await exportGuestsToGoogleSheets(token, guests, property);
        }}
      />
    </div>
  );
};
