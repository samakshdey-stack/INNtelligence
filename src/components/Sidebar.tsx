import React from 'react';
import {
  LayoutDashboard,
  ConciergeBell,
  Users,
  CalendarCheck2,
  BedDouble,
  Bot,
  Activity,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Building2,
  LogIn,
  LogOut,
  PlusCircle,
  UserPlus,
  RotateCcw,
  ShieldCheck,
  Clock,
  X,
  BarChart3,
  FileText,
  KeyRound,
} from 'lucide-react';
import { Property, UserRole } from '../types';
import { useAuth } from '../context/AuthContext';

export type TabType =
  | 'command-center'
  | 'front-desk'
  | 'analytics'
  | 'reports'
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

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  badgeCounts?: BadgeCounts;
  property: Property | null;
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onOpenCheckIn: () => void;
  onOpenCheckOut: () => void;
  onOpenNewReservation: () => void;
  onOpenAddGuest: () => void;
  onResetData: () => void;
  onNavigateToLanding?: () => void;
  onOpenAuthModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onToggle,
  isMobileOpen,
  onCloseMobile,
  activeTab,
  onSelectTab,
  badgeCounts,
  property,
  currentRole,
  onRoleChange,
  onOpenCheckIn,
  onOpenCheckOut,
  onOpenNewReservation,
  onOpenAddGuest,
  onResetData,
  onNavigateToLanding,
  onOpenAuthModal,
}) => {
  const { user } = useAuth();
  const counts = badgeCounts || {};

  const navigationItems = [
    {
      id: 'command-center' as TabType,
      label: 'Command Center',
      icon: LayoutDashboard,
      badge: null,
      badgeColor: 'bg-white/10 text-white/70',
    },
    {
      id: 'front-desk' as TabType,
      label: 'Front Desk',
      icon: ConciergeBell,
      badge: counts.arrivals ? `${counts.arrivals} Arr` : null,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    {
      id: 'analytics' as TabType,
      label: 'Analytics & Feedback',
      icon: BarChart3,
      badge: '₹14.8Cr',
      badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    },
    {
      id: 'reports' as TabType,
      label: 'Overview Report',
      icon: FileText,
      badge: 'PDF',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    },
    {
      id: 'guests' as TabType,
      label: 'Guest Directory',
      icon: Users,
      badge: counts.activeStays ? `${counts.activeStays} in-house` : null,
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
    {
      id: 'reservations' as TabType,
      label: 'Reservations',
      icon: CalendarCheck2,
      badge: null,
      badgeColor: 'bg-white/10 text-white/70',
    },
    {
      id: 'rooms' as TabType,
      label: 'Room Inventory',
      icon: BedDouble,
      badge: counts.cleaningRooms ? `${counts.cleaningRooms} clean` : null,
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    },
    {
      id: 'ai-operator' as TabType,
      label: 'AI Operator',
      icon: Bot,
      isSpecial: true,
      badge: 'Live',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    },
    {
      id: 'activity-log' as TabType,
      label: 'Operational Stream',
      icon: Activity,
      badge: null,
      badgeColor: 'bg-white/10 text-white/70',
    },
  ];

  const handleNavClick = (tabId: TabType) => {
    onSelectTab(tabId);
    if (isMobileOpen) {
      onCloseMobile();
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0A0A0B]/95 backdrop-blur-2xl border-r border-white/10 text-white select-none">
      {/* 1. Sidebar Brand Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between min-h-[64px]">
        <div className={`flex items-center gap-3 overflow-hidden ${!isOpen && 'justify-center w-full'}`}>
          <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-white/5 border border-white/10 shadow-lg shadow-black/40 backdrop-blur-md shrink-0">
            <span className="font-serif italic font-bold text-amber-400 text-lg tracking-wider">IN</span>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-[#0A0A0B] shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
          </div>

          {isOpen && (
            <div className="overflow-hidden whitespace-nowrap animate-fadeIn">
              <div className="flex items-center gap-2">
                <span className="text-base font-serif font-bold tracking-tight text-white">
                  INNtelligence
                </span>
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-mono tracking-wider uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Sparkles className="w-2.5 h-2.5" />
                  AI
                </span>
              </div>
              <p className="text-[11px] text-white/40 font-mono truncate">
                {property?.name || 'The Meridian Kolkata'}
              </p>
            </div>
          )}
        </div>

        {/* Mobile close button / Desktop collapse button */}
        <div className="flex items-center gap-1">
          {/* Mobile close */}
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            title="Close Sidebar"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Desktop collapse toggle */}
          <button
            onClick={onToggle}
            className="hidden md:flex p-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/50 hover:text-white transition-colors"
            title={isOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
          >
            {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 2. Scrollable Body: Navigation Links & Quick Actions */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 no-scrollbar">
        {/* Navigation Section */}
        <div className="space-y-1">
          {isOpen && (
            <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-[0.2em] text-white/30">
              Operations Navigation
            </div>
          )}

          <div className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  title={!isOpen ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-medium transition-all group relative ${
                    isActive
                      ? item.isSpecial
                        ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-lg shadow-amber-500/5'
                        : 'bg-white/10 text-white border border-white/15 shadow-md shadow-black/40 font-semibold'
                      : 'text-white/50 hover:text-white hover:bg-white/5 border border-transparent'
                  } ${!isOpen ? 'justify-center px-0' : ''}`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-amber-400' : 'text-white/40 group-hover:text-white/80'
                    }`}
                  />

                  {isOpen && (
                    <div className="flex-1 flex items-center justify-between overflow-hidden text-left">
                      <span className="truncate text-xs font-serif tracking-wide">{item.label}</span>
                      {item.badge && (
                        <span
                          className={`ml-2 text-[9px] font-mono px-2 py-0.5 rounded-full border shrink-0 ${item.badgeColor}`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Active Indicator bar */}
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-amber-400 rounded-r-full shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Operational Triggers in Sidebar */}
        <div className="space-y-2 pt-2 border-t border-white/5">
          {isOpen && (
            <div className="px-3 pb-1 text-[10px] font-mono uppercase tracking-[0.2em] text-white/30">
              Quick Actions
            </div>
          )}

          <div className="space-y-1.5">
            <button
              onClick={() => {
                onOpenNewReservation();
                if (isMobileOpen) onCloseMobile();
              }}
              title="Create New Reservation"
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-2xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-black transition-all shadow-md shadow-amber-500/20 ${
                !isOpen ? 'justify-center px-0' : ''
              }`}
            >
              <PlusCircle className="w-4 h-4 shrink-0" />
              {isOpen && <span className="truncate">New Reservation</span>}
            </button>

            <div className={`grid ${isOpen ? 'grid-cols-2 gap-2' : 'grid-cols-1 gap-1.5'}`}>
              <button
                onClick={() => {
                  onOpenCheckIn();
                  if (isMobileOpen) onCloseMobile();
                }}
                title="Guest Check-In"
                className={`flex items-center gap-2 px-3 py-2 rounded-2xl text-xs font-medium bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 text-emerald-300 transition-all ${
                  !isOpen ? 'justify-center px-0' : ''
                }`}
              >
                <LogIn className="w-3.5 h-3.5 shrink-0" />
                {isOpen && <span>Check In</span>}
              </button>

              <button
                onClick={() => {
                  onOpenCheckOut();
                  if (isMobileOpen) onCloseMobile();
                }}
                title="Guest Check-Out"
                className={`flex items-center gap-2 px-3 py-2 rounded-2xl text-xs font-medium bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 text-rose-300 transition-all ${
                  !isOpen ? 'justify-center px-0' : ''
                }`}
              >
                <LogOut className="w-3.5 h-3.5 shrink-0" />
                {isOpen && <span>Check Out</span>}
              </button>
            </div>

            <button
              onClick={() => {
                onOpenAddGuest();
                if (isMobileOpen) onCloseMobile();
              }}
              title="Add New Guest Dossier"
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs font-medium bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all ${
                !isOpen ? 'justify-center px-0' : ''
              }`}
            >
              <UserPlus className="w-3.5 h-3.5 shrink-0 text-amber-400" />
              {isOpen && <span className="truncate">Register Guest</span>}
            </button>
          </div>
        </div>

        {/* Role Switcher & System Controls */}
        <div className="space-y-2 pt-2 border-t border-white/5">
          {isOpen && (
            <div className="px-3 pb-1 text-[10px] font-mono uppercase tracking-[0.2em] text-white/30">
              Staff Authorization
            </div>
          )}

          <div className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
            <div className={`flex items-center gap-2 ${!isOpen ? 'justify-center' : ''}`}>
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              {isOpen && (
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 block">
                    Active Clearance
                  </span>
                  <select
                    value={currentRole}
                    onChange={(e) => onRoleChange(e.target.value as UserRole)}
                    className="w-full bg-transparent text-white font-medium text-xs focus:outline-none cursor-pointer"
                  >
                    <option value="General Manager" className="bg-[#121214] text-white">
                      General Manager
                    </option>
                    <option value="Front Desk" className="bg-[#121214] text-white">
                      Front Desk Staff
                    </option>
                    <option value="Owner" className="bg-[#121214] text-white">
                      Owner Tier
                    </option>
                    <option value="Department Head" className="bg-[#121214] text-white">
                      Operations Head
                    </option>
                  </select>
                </div>
              )}
            </div>

            {isOpen && (
              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
                {onNavigateToLanding ? (
                  <button
                    onClick={onNavigateToLanding}
                    className="text-amber-400 hover:text-amber-300 font-mono text-[10px] uppercase tracking-wider underline cursor-pointer"
                  >
                    ← Landing Page
                  </button>
                ) : (
                  <span className="text-white/40">Demo Database</span>
                )}
                <button
                  onClick={onResetData}
                  className="inline-flex items-center gap-1 text-[10px] font-mono text-amber-400/80 hover:text-amber-300 underline cursor-pointer"
                  title="Reset sample hotel data"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Seed</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Sidebar Footer */}
      <div className="p-3 border-t border-white/10 bg-white/[0.01]">
        <div
          onClick={onOpenAuthModal}
          className={`flex items-center gap-3 ${!isOpen ? 'justify-center' : ''} p-1.5 rounded-xl hover:bg-white/5 transition-all cursor-pointer`}
          title={user ? `Signed in as ${user.email} (Click to manage)` : 'Click to Sign in with Google (Firebase)'}
        >
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName || 'Staff'}
              className="w-8 h-8 rounded-full border border-amber-400 object-cover shrink-0"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-amber-200 border border-white/10 shadow-sm shrink-0 flex items-center justify-center font-bold text-black text-xs font-serif italic">
              {user ? (user.displayName || 'S')[0].toUpperCase() : 'IN'}
            </div>
          )}
          {isOpen && (
            <div className="overflow-hidden min-w-0 flex-1">
              <p className="text-xs font-medium text-white/90 truncate">
                {user ? user.displayName || user.email : 'The Meridian Kolkata'}
              </p>
              <div className="flex items-center gap-1.5 text-[10px] font-mono truncate">
                <span className={`w-1.5 h-1.5 rounded-full ${user ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                <span className={user ? 'text-emerald-400' : 'text-amber-400/80'}>
                  {user ? `${currentRole} • Auth` : 'Sign In with Firebase'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent / Collapsible Sidebar */}
      <aside
        className={`hidden md:flex flex-col shrink-0 transition-all duration-300 ease-in-out relative z-30 h-screen sticky top-0 ${
          isOpen ? 'w-64' : 'w-20'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Slide-over Drawer with Backdrop */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden animate-fadeIn">
          {/* Backdrop */}
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer content */}
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] shadow-2xl z-10 animate-slideRight">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
