import React, { useState, useEffect } from 'react';
import {
  Menu,
  Search,
  PlusCircle,
  LogIn,
  LogOut,
  UserPlus,
  Clock,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  KeyRound,
} from 'lucide-react';
import { Property, UserRole } from '../types';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  onToggleSidebar: () => void;
  isSidebarOpen?: boolean;
  property: Property | null;
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onOpenCheckIn: () => void;
  onOpenCheckOut: () => void;
  onOpenNewReservation: () => void;
  onOpenAddGuest: () => void;
  onOpenSearch: () => void;
  onResetData: () => void;
  onNavigateToLanding?: () => void;
  onOpenAuthModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  isSidebarOpen,
  property,
  currentRole,
  onRoleChange,
  onOpenCheckIn,
  onOpenCheckOut,
  onOpenNewReservation,
  onOpenAddGuest,
  onOpenSearch,
  onResetData,
  onNavigateToLanding,
  onOpenAuthModal,
}) => {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formatted = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
      setCurrentTime(formatted);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-[#0A0A0B]/90 backdrop-blur-2xl border-b border-white/10 px-3 sm:px-6 lg:px-8 py-2.5 transition-all">
      <div className="w-full flex items-center justify-between gap-2 sm:gap-4 flex-nowrap min-w-0">
        {/* Left Side: Sidebar Toggle & Property Badge in a Single Straight Line */}
        <div className="flex items-center gap-2 sm:gap-3 shrink min-w-0">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white transition-all shrink-0 active:scale-95 shadow-sm"
            title={isSidebarOpen ? 'Toggle Sidebar' : 'Open Sidebar'}
            aria-label="Toggle Sidebar Navigation"
          >
            <Menu className="w-4 h-4 text-amber-400" />
          </button>

          {/* Clean Property / System Identifier */}
          <div className="flex items-center gap-2 min-w-0 truncate">
            <div className="hidden sm:flex items-center gap-2 min-w-0">
              <span className="font-serif italic font-bold text-white text-base tracking-tight truncate">
                {property?.name || 'The Meridian Kolkata'}
              </span>
              <span className="hidden xl:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                Live AI
              </span>
            </div>
            <span className="sm:hidden font-serif italic font-bold text-white text-sm tracking-tight truncate">
              INNtelligence
            </span>
          </div>
        </div>

        {/* Right Side: Straight Single-Line Header Actions (No Line Break Stacks) */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 flex-nowrap shrink-0">
          {/* Live IST Time */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/50 shrink-0 font-mono">
            <Clock className="w-3.5 h-3.5 text-amber-400/80" />
            <span className="text-[11px] text-white/70">{currentTime} IST</span>
          </div>

          {/* Role badge (Desktop) */}
          <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs shrink-0">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <select
              value={currentRole}
              onChange={(e) => onRoleChange(e.target.value as UserRole)}
              className="bg-transparent text-white/80 font-medium text-xs focus:outline-none cursor-pointer pr-1"
            >
              <option value="General Manager" className="bg-[#121214] text-white">
                GM (A. Sen)
              </option>
              <option value="Front Desk" className="bg-[#121214] text-white">
                Desk (Priya D.)
              </option>
              <option value="Owner" className="bg-[#121214] text-white">
                Owner Tier
              </option>
              <option value="Department Head" className="bg-[#121214] text-white">
                Ops Head
              </option>
            </select>
          </div>

          {/* Global Search Button */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white/60 hover:text-white transition-all shrink-0 group whitespace-nowrap"
            title="Search guests, rooms, reservations (Cmd+K)"
          >
            <Search className="w-3.5 h-3.5 text-white/50 group-hover:text-amber-400 transition-colors" />
            <span className="hidden md:inline">Search</span>
            <kbd className="hidden md:inline-block px-1.5 py-0.2 text-[10px] font-mono bg-white/10 rounded border border-white/10 text-white/40">
              ⌘K
            </kbd>
          </button>

          {/* Quick Check-In (Emerald) */}
          <button
            onClick={onOpenCheckIn}
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 hover:text-emerald-200 text-xs font-medium transition-all shrink-0 whitespace-nowrap active:scale-95"
            title="Express Guest Check-In"
          >
            <LogIn className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Check In</span>
          </button>

          {/* Quick Check-Out (Rose) */}
          <button
            onClick={onOpenCheckOut}
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-full bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 hover:text-rose-200 text-xs font-medium transition-all shrink-0 whitespace-nowrap active:scale-95"
            title="Room Folio Check-Out"
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Check Out</span>
          </button>

          {/* New Reservation (Amber Accent) */}
          <button
            onClick={onOpenNewReservation}
            className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full bg-amber-500 hover:bg-amber-400 text-black text-xs font-semibold transition-all shadow-md shadow-amber-500/20 shrink-0 whitespace-nowrap active:scale-95"
            title="Create New Reservation"
          >
            <PlusCircle className="w-3.5 h-3.5 shrink-0" />
            <span>
              <span className="hidden sm:inline">New </span>Booking
            </span>
          </button>

          {/* Register Guest Icon Button */}
          <button
            onClick={onOpenAddGuest}
            className="inline-flex items-center justify-center p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white transition-all shrink-0"
            title="Add Guest Profile"
          >
            <UserPlus className="w-3.5 h-3.5 text-amber-400/90" />
          </button>

          {/* Reset Demo Data Button */}
          <button
            onClick={onResetData}
            className="inline-flex items-center justify-center p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/40 hover:text-amber-400 transition-all shrink-0"
            title="Reset Seed Data"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Staff Auth Button */}
          {onOpenAuthModal && (
            <button
              onClick={onOpenAuthModal}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-amber-500/30 text-white text-xs font-mono transition-all shrink-0 cursor-pointer"
              title={user ? `Signed in as ${user.email}` : 'Sign in with Google (Firebase)'}
            >
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Staff'}
                  className="w-4 h-4 rounded-full border border-amber-400 object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span className="hidden sm:inline text-[11px] max-w-[100px] truncate">
                {user ? user.displayName?.split(' ')[0] || 'Staff' : 'Sign In'}
              </span>
            </button>
          )}

          {/* Return to Landing Page Button */}
          {onNavigateToLanding && (
            <button
              onClick={onNavigateToLanding}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-amber-300 font-mono text-[11px] uppercase tracking-wider transition-all shrink-0 ml-0.5 cursor-pointer"
              title="Return to Public Landing Page"
            >
              <span>Landing</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
