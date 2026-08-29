import React from 'react';
import {
  LayoutDashboard,
  ConciergeBell,
  Users,
  CalendarCheck2,
  BedDouble,
  Bot,
  Activity,
} from 'lucide-react';

export type TabType =
  | 'command-center'
  | 'front-desk'
  | 'guests'
  | 'reservations'
  | 'rooms'
  | 'ai-operator'
  | 'activity-log';

export interface BadgeCounts {
  arrivals?: number;
  departures?: number;
  activeStays?: number;
  cleaningRooms?: number;
}

interface NavigationProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  badgeCounts?: BadgeCounts;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  badgeCounts,
}) => {
  const counts = badgeCounts || {};
  const tabs = [
    {
      id: 'command-center' as TabType,
      label: 'Command Center',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'front-desk' as TabType,
      label: 'Front Desk',
      icon: ConciergeBell,
      badge: counts.arrivals ? `${counts.arrivals} Arr` : null,
    },
    {
      id: 'guests' as TabType,
      label: 'Guests',
      icon: Users,
      badge: counts.activeStays ? `${counts.activeStays} in-house` : null,
    },
    {
      id: 'reservations' as TabType,
      label: 'Reservations',
      icon: CalendarCheck2,
      badge: null,
    },
    {
      id: 'rooms' as TabType,
      label: 'Rooms',
      icon: BedDouble,
      badge: counts.cleaningRooms ? `${counts.cleaningRooms} clean` : null,
    },
    {
      id: 'ai-operator' as TabType,
      label: 'AI Operator',
      icon: Bot,
      isSpecial: true,
      badge: 'Live',
    },
    {
      id: 'activity-log' as TabType,
      label: 'Operational Stream',
      icon: Activity,
      badge: null,
    },
  ];

  return (
    <div className="w-full bg-[#0A0A0B]/80 backdrop-blur-xl border-b border-white/5 sticky top-[61px] z-30 px-4 lg:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-start overflow-x-auto no-scrollbar gap-1 sm:gap-2 py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`relative flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-medium uppercase tracking-[0.12em] transition-all whitespace-nowrap ${
                isActive
                  ? tab.isSpecial
                    ? 'bg-gradient-to-r from-amber-500/20 to-amber-600/10 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/10'
                    : 'bg-white/10 text-white border border-white/15 shadow-sm shadow-black/40'
                  : 'text-white/40 hover:text-white/90 hover:bg-white/5 border border-transparent'
              }`}
            >
              <Icon
                className={`w-3.5 h-3.5 ${
                  isActive
                    ? tab.isSpecial
                      ? 'text-amber-400'
                      : 'text-amber-400'
                    : 'text-white/40'
                }`}
              />
              <span className="text-[11px] font-medium">{tab.label}</span>

              {tab.badge && (
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full ${
                    tab.isSpecial
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-white/10 text-white/70 border border-white/10'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
