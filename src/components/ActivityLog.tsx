import React, { useState } from 'react';
import { OperationalEvent, EventType } from '../types';
import {
  Activity,
  Search,
  Clock,
  UserCheck,
  UserMinus,
  Brush,
  Wrench,
  CheckCircle2,
  UserPlus,
  Shield,
  Filter,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface ActivityLogProps {
  events: OperationalEvent[];
}

export const ActivityLog: React.FC<ActivityLogProps> = ({ events }) => {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  const filteredEvents = events.filter((e) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      e.title.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q) ||
      e.performedBy.toLowerCase().includes(q) ||
      e.id.toLowerCase().includes(q);

    const matchesType =
      filterType === 'ALL' ||
      (filterType === 'CHECK_IN' && e.eventType.includes('CHECKED_IN')) ||
      (filterType === 'CHECK_OUT' && e.eventType.includes('CHECKED_OUT')) ||
      (filterType === 'RESERVATION' && e.eventType.includes('RESERVATION')) ||
      (filterType === 'HOUSEKEEPING' && (e.eventType.includes('CLEAN') || e.eventType.includes('ROOM'))) ||
      (filterType === 'MAINTENANCE' && e.eventType.includes('MAINTENANCE'));

    return matchesSearch && matchesType;
  });

  const getEventIcon = (type: EventType) => {
    if (type.includes('CHECKED_IN')) return <UserCheck className="w-4 h-4 text-emerald-400" />;
    if (type.includes('CHECKED_OUT')) return <UserMinus className="w-4 h-4 text-rose-400" />;
    if (type.includes('CLEAN')) return <Brush className="w-4 h-4 text-cyan-400" />;
    if (type.includes('MAINTENANCE')) return <Wrench className="w-4 h-4 text-amber-400" />;
    if (type.includes('RESERVATION')) return <CheckCircle2 className="w-4 h-4 text-indigo-400" />;
    return <Activity className="w-4 h-4 text-slate-300" />;
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* 1. Header & Controls */}
      <div className="rounded-3xl bg-white/[0.03] border border-white/10 p-6 sm:p-7 backdrop-blur-md shadow-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <Activity className="w-5 h-5 text-amber-400" />
              <h2 className="text-xl sm:text-2xl font-serif italic text-white/95 tracking-tight">
                Operational Audit & Activity Stream
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-white/40 font-light">
              Immutable chronological record of all front-desk operations, room state transitions, and guest actions.
            </p>
          </div>

          <span className="text-xs font-mono text-white/60 bg-white/5 px-4 py-2 rounded-full border border-white/10 self-start sm:self-auto">
            <strong className="text-amber-400">{events.length}</strong> Operational Events
          </span>
        </div>

        {/* Filter Tabs & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {[
              { id: 'ALL', label: 'All Stream' },
              { id: 'CHECK_IN', label: 'Check-Ins' },
              { id: 'CHECK_OUT', label: 'Check-Outs' },
              { id: 'RESERVATION', label: 'Reservations' },
              { id: 'HOUSEKEEPING', label: 'Housekeeping' },
              { id: 'MAINTENANCE', label: 'Maintenance' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                  filterType === tab.id
                    ? 'bg-white/15 text-white border border-white/20 shadow-sm'
                    : 'bg-white/5 text-white/40 hover:text-white/80 border border-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative min-w-[280px]">
            <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search event logs by title, user, ID..."
              className="w-full bg-white/5 border border-white/10 focus:border-amber-500/50 rounded-full pl-9 pr-4 py-2 text-xs text-white placeholder-white/30 focus:outline-none backdrop-blur-sm"
            />
          </div>
        </div>
      </div>

      {/* 2. Timeline List */}
      <div className="rounded-3xl bg-white/[0.03] border border-white/10 shadow-2xl backdrop-blur-md overflow-hidden divide-y divide-white/5">
        {filteredEvents.length === 0 ? (
          <div className="p-12 text-center text-white/40 text-sm">
            No events match your search or filter.
          </div>
        ) : (
          filteredEvents.map((evt) => {
            const isExpanded = expandedEventId === evt.id;

            return (
              <div key={evt.id} className="p-5 sm:p-6 hover:bg-white/[0.02] transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="mt-0.5 p-2.5 rounded-2xl bg-white/5 border border-white/10 shrink-0 shadow-inner">
                      {getEventIcon(evt.eventType)}
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="text-sm font-semibold text-white/95">{evt.title}</span>
                        <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/5 text-white/40 border border-white/10">
                          {evt.eventType}
                        </span>
                        <span className="text-xs text-amber-400/90 font-mono">
                          by {evt.performedBy}
                        </span>
                      </div>
                      <p className="text-xs text-white/70 leading-relaxed font-light">{evt.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-mono text-white/40">{evt.timeFormatted}</span>
                    <button
                      onClick={() => setExpandedEventId(isExpanded ? null : evt.id)}
                      className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                      title="Inspect metadata"
                    >
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Expanded metadata drawer */}
                {isExpanded && (
                  <div className="mt-4 p-4 rounded-2xl bg-black/60 border border-white/10 text-xs font-mono text-white/70 space-y-2 animate-fadeIn">
                    <div className="flex justify-between border-b border-white/10 pb-2 text-[11px] text-white/40">
                      <span>Event ID: {evt.id}</span>
                      <span>Entity: {evt.entityType} ({evt.entityId})</span>
                    </div>
                    <pre className="text-[11px] text-amber-400/90 whitespace-pre-wrap overflow-x-auto">
                      {JSON.stringify(evt.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
