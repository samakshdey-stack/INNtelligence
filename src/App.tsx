/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Property,
  HotelKPIs,
  Room,
  Guest,
  Reservation,
  OperationalEvent,
  UserRole,
  CheckInPayload,
  CheckOutPayload,
  CreateReservationPayload,
} from './types';
import { api } from './lib/api';
import { Header } from './components/Header';
import { Sidebar, TabType } from './components/Sidebar';
import { CommandCenter } from './components/CommandCenter';
import { FrontDesk } from './components/FrontDesk';
import { AnalyticsFeedback } from './components/AnalyticsFeedback';
import { OverviewReport } from './components/OverviewReport';
import { GuestsDirectory } from './components/GuestsDirectory';
import { ReservationsManager } from './components/ReservationsManager';
import { RoomsManager } from './components/RoomsManager';
import { AIOperator } from './components/AIOperator';
import { ActivityLog } from './components/ActivityLog';
import { RoomDetailModal } from './components/RoomDetailModal';
import { GuestDetailModal } from './components/GuestDetailModal';
import { CheckInModal } from './components/modals/CheckInModal';
import { CheckOutModal } from './components/modals/CheckOutModal';
import { NewReservationModal } from './components/modals/NewReservationModal';
import { AddGuestModal } from './components/modals/AddGuestModal';
import { GlobalSearchModal } from './components/modals/GlobalSearchModal';
import { AuthModal } from './components/modals/AuthModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import { LandingPage } from './components/LandingPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Loader2 } from 'lucide-react';

function HotelAppContent() {
  const { role, setRole } = useAuth();
  // Public Landing vs Operational App View
  const [currentView, setCurrentView] = useState<'landing' | 'app'>('landing');

  // Navigation, Sidebar & Role
  const [activeTab, setActiveTab] = useState<TabType>('command-center');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Core Data States
  const [property, setProperty] = useState<Property | null>(null);
  const [kpis, setKpis] = useState<HotelKPIs | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [events, setEvents] = useState<OperationalEvent[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);

  // Modals & Detail Overlays
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [preselectedCheckInResId, setPreselectedCheckInResId] = useState<string | null>(null);

  const [isCheckOutOpen, setIsCheckOutOpen] = useState(false);
  const [preselectedCheckOutResId, setPreselectedCheckOutResId] = useState<string | null>(null);
  const [preselectedCheckOutRoomId, setPreselectedCheckOutRoomId] = useState<string | null>(null);

  const [isNewReservationOpen, setIsNewReservationOpen] = useState(false);
  const [isAddGuestOpen, setIsAddGuestOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Selected Detail Views
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [selectedGuestId, setSelectedGuestId] = useState<string | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', title: string, description?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, type, title, description }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Load all data
  const loadData = useCallback(async () => {
    try {
      const [propData, kpisData, roomsData, guestsData, resData, eventsData] =
        await Promise.all([
          api.getProperty(),
          api.getKPIs(),
          api.getRooms(),
          api.getGuests(),
          api.getReservations(),
          api.getEvents(),
        ]);

      setProperty(propData);
      setKpis(kpisData);
      setRooms(roomsData);
      setGuests(guestsData);
      setReservations(resData);
      setEvents(eventsData);
    } catch (err: any) {
      console.error('Failed to load hotel data:', err);
      addToast('error', 'Connection issue', 'Could not sync latest hotel state.');
    } finally {
      setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000); // Periodic live sync
    return () => clearInterval(interval);
  }, [loadData]);

  // Global Keyboard Shortcut: ⌘K or Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handlers for Operational Actions
  const handleCheckInSubmit = async (payload: CheckInPayload) => {
    try {
      const result = await api.checkIn(payload);
      addToast(
        'success',
        'Check-In Successful',
        `Guest ${result.guest.firstName} ${result.guest.lastName} checked into Room ${result.room.roomNumber}.`
      );
      await loadData();
    } catch (err: any) {
      addToast('error', 'Check-In Failed', err.message);
      throw err;
    }
  };

  const handleCheckOutSubmit = async (payload: CheckOutPayload) => {
    try {
      const result = await api.checkOut(payload);
      addToast(
        'success',
        'Check-Out Complete',
        `Room ${result.room.roomNumber} vacated and set to Housekeeping Cleaning status.`
      );
      await loadData();
    } catch (err: any) {
      addToast('error', 'Check-Out Failed', err.message);
      throw err;
    }
  };

  const handleNewReservationSubmit = async (payload: CreateReservationPayload) => {
    try {
      const result = await api.createReservation(payload);
      addToast(
        'success',
        'Reservation Created',
        `Confirmed ${result.id} for ${result.guestName} (${result.roomType}).`
      );
      await loadData();
    } catch (err: any) {
      addToast('error', 'Reservation Failed', err.message);
      throw err;
    }
  };

  const handleAddGuestSubmit = async (guestData: Partial<Guest>) => {
    try {
      const result = await api.createGuest(guestData);
      addToast(
        'success',
        'Guest Registered',
        `Profile created for ${result.firstName} ${result.lastName} (${result.id}).`
      );
      await loadData();
    } catch (err: any) {
      addToast('error', 'Registration Failed', err.message);
      throw err;
    }
  };

  const handleMarkClean = async (roomId: string) => {
    try {
      const result = await api.markRoomClean(roomId, 'Housekeeping Supervisor');
      addToast(
        'success',
        'Room Inspected & Clean',
        `Room ${result.room.roomNumber} is now Available for guest booking.`
      );
      await loadData();
    } catch (err: any) {
      addToast('error', 'Action Failed', err.message);
    }
  };

  const handleSetMaintenance = async (
    roomId: string,
    status: 'Maintenance' | 'Out of Service' | 'Available',
    reason?: string
  ) => {
    try {
      const result = await api.setRoomMaintenance(roomId, status, reason, 'Operations Head');
      addToast(
        'info',
        'Room Status Updated',
        `Room ${result.room.roomNumber} transitioned to ${status}.`
      );
      await loadData();
    } catch (err: any) {
      addToast('error', 'Action Failed', err.message);
    }
  };

  const handleCancelReservation = async (reservationId: string) => {
    try {
      await api.cancelReservation(reservationId, role);
      addToast('info', 'Reservation Cancelled', `Reservation ${reservationId} has been cancelled.`);
      await loadData();
    } catch (err: any) {
      addToast('error', 'Cancellation Failed', err.message);
    }
  };

  const handleResetData = async () => {
    try {
      await api.resetSeed();
      addToast('info', 'Database Reset', 'Reset data to original seed for The Meridian Kolkata.');
      await loadData();
    } catch (err: any) {
      addToast('error', 'Reset Failed', err.message);
    }
  };

  // Quick Action Triggers
  const openCheckInForRes = (resId: string) => {
    setPreselectedCheckInResId(resId);
    setIsCheckInOpen(true);
  };

  const openCheckOutForRes = (resId: string, roomId: string) => {
    setPreselectedCheckOutResId(resId);
    setPreselectedCheckOutRoomId(roomId);
    setIsCheckOutOpen(true);
  };

  const currentSelectedRoom = rooms.find((r) => r.id === selectedRoomId) || null;
  const currentSelectedGuest = guests.find((g) => g.id === selectedGuestId) || null;

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-[#080C14] flex flex-col items-center justify-center text-slate-300 gap-3">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
        <span className="font-serif text-lg tracking-wider text-white">INNtelligence</span>
        <p className="text-xs text-slate-500">Connecting to operational hotel database...</p>
      </div>
    );
  }

  // 1. PUBLIC LANDING PAGE (Exact Match to Design Specs & Screenshots)
  if (currentView === 'landing') {
    return (
      <>
        <LandingPage onEnterApp={() => setCurrentView('app')} />
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white flex flex-row font-sans selection:bg-amber-500 selection:text-black relative overflow-x-hidden">
      {/* Atmospheric Media Ambient Lighting & Glows */}
      <div className="fixed inset-0 opacity-20 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[550px] h-[550px] bg-amber-500/20 blur-[130px] rounded-full" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[650px] h-[650px] bg-blue-500/10 blur-[160px] rounded-full" />
        <div className="absolute top-[40%] right-[15%] w-[400px] h-[400px] bg-amber-600/10 blur-[140px] rounded-full" />
      </div>

      {/* 1. Toggle Sidebar (Desktop Persistent Collapsible & Mobile Slide-Over) */}
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen((prev) => !prev)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        badgeCounts={{
          arrivals: reservations.filter((r) => r.checkInDate === '2026-08-22' && r.status === 'Confirmed').length,
          departures: reservations.filter((r) => r.checkOutDate === '2026-08-22' && r.status === 'Checked In').length,
          activeStays: guests.filter((g) => g.stayStatus === 'Active Stay').length,
          cleaningRooms: rooms.filter((r) => r.status === 'Cleaning').length,
        }}
        property={property}
        currentRole={role}
        onRoleChange={setRole}
        onOpenCheckIn={() => {
          setPreselectedCheckInResId(null);
          setIsCheckInOpen(true);
        }}
        onOpenCheckOut={() => {
          setPreselectedCheckOutResId(null);
          setPreselectedCheckOutRoomId(null);
          setIsCheckOutOpen(true);
        }}
        onOpenNewReservation={() => setIsNewReservationOpen(true)}
        onOpenAddGuest={() => setIsAddGuestOpen(true)}
        onResetData={handleResetData}
        onNavigateToLanding={() => setCurrentView('landing')}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* 2. Main Layout Container (Header + Content Workspace + Footer) */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto relative z-10">
        {/* Universal Top Header with Straight Single-Line Buttons and Sidebar Toggle */}
        <Header
          onToggleSidebar={() => {
            if (window.innerWidth < 768) {
              setIsMobileSidebarOpen((prev) => !prev);
            } else {
              setIsSidebarOpen((prev) => !prev);
            }
          }}
          isSidebarOpen={isSidebarOpen}
          property={property}
          currentRole={role}
          onRoleChange={setRole}
          onOpenCheckIn={() => {
            setPreselectedCheckInResId(null);
            setIsCheckInOpen(true);
          }}
          onOpenCheckOut={() => {
            setPreselectedCheckOutResId(null);
            setPreselectedCheckOutRoomId(null);
            setIsCheckOutOpen(true);
          }}
          onOpenNewReservation={() => setIsNewReservationOpen(true)}
          onOpenAddGuest={() => setIsAddGuestOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
          onResetData={handleResetData}
          onNavigateToLanding={() => setCurrentView('landing')}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
        />

        {/* Main Workspace Container */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 relative z-10">
          {activeTab === 'command-center' && (
            <CommandCenter
              property={property}
              kpis={kpis}
              events={events}
              rooms={rooms}
              reservations={reservations}
              onOpenCheckInForRes={openCheckInForRes}
              onOpenCheckOutForRes={openCheckOutForRes}
              onSelectRoom={(id) => setSelectedRoomId(id)}
              onSelectGuest={(id) => setSelectedGuestId(id)}
              onSelectReservation={(id) => {
                const res = reservations.find((r) => r.id === id);
                if (res) setSelectedGuestId(res.guestId);
              }}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'front-desk' && (
            <FrontDesk
              reservations={reservations}
              rooms={rooms}
              guests={guests}
              kpis={kpis}
              onOpenCheckIn={() => {
                setPreselectedCheckInResId(null);
                setIsCheckInOpen(true);
              }}
              onOpenCheckOut={() => {
                setPreselectedCheckOutResId(null);
                setPreselectedCheckOutRoomId(null);
                setIsCheckOutOpen(true);
              }}
              onOpenNewReservation={() => setIsNewReservationOpen(true)}
              onOpenAddGuest={() => setIsAddGuestOpen(true)}
              onCheckInReservation={openCheckInForRes}
              onCheckOutReservation={openCheckOutForRes}
              onSelectGuest={(id) => setSelectedGuestId(id)}
              onSelectRoom={(id) => setSelectedRoomId(id)}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsFeedback onNavigateTab={(tab) => setActiveTab(tab)} />
          )}

          {activeTab === 'reports' && (
            <OverviewReport
              property={property}
              rooms={rooms}
              guests={guests}
              reservations={reservations}
              kpis={kpis}
            />
          )}

          {activeTab === 'guests' && (
            <GuestsDirectory
              guests={guests}
              property={property}
              onSelectGuest={(id) => setSelectedGuestId(id)}
              onOpenAddGuest={() => setIsAddGuestOpen(true)}
            />
          )}

          {activeTab === 'reservations' && (
            <ReservationsManager
              reservations={reservations}
              rooms={rooms}
              onOpenNewReservation={() => setIsNewReservationOpen(true)}
              onCheckInReservation={openCheckInForRes}
              onCancelReservation={handleCancelReservation}
              onSelectGuest={(id) => setSelectedGuestId(id)}
              onSelectRoom={(id) => setSelectedRoomId(id)}
            />
          )}

          {activeTab === 'rooms' && (
            <RoomsManager
              rooms={rooms}
              onSelectRoom={(id) => setSelectedRoomId(id)}
            />
          )}

          {activeTab === 'ai-operator' && (
            <AIOperator
              onSelectRoom={(id) => setSelectedRoomId(id)}
              onSelectGuest={(id) => setSelectedGuestId(id)}
              onSelectReservation={(id) => {
                const res = reservations.find((r) => r.id === id);
                if (res) setSelectedGuestId(res.guestId);
              }}
            />
          )}

          {activeTab === 'activity-log' && (
            <ActivityLog events={events} />
          )}
        </main>

        {/* Atmospheric Media Bottom Operational Status Bar */}
        <footer className="h-12 sm:h-14 flex items-center justify-between px-4 sm:px-6 lg:px-8 bg-white/[0.02] border-t border-white/5 relative z-10 backdrop-blur-md text-xs shrink-0">
          <div className="flex gap-3 sm:gap-6 items-center">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
            <span className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-medium">
              System Operational &bull; 100 Rooms Monitored
            </span>
          </div>
          <div className="flex items-center gap-3 sm:gap-6">
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-[10px] text-white/30 uppercase tracking-widest">Active Operator</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                {role === 'General Manager' ? 'A. Sen (GM)' : role === 'Front Desk' ? 'P. Dasgupta (Desk)' : 'Owner'}
              </span>
            </div>
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-500 to-amber-200 border border-white/10 shadow-sm" />
          </div>
        </footer>
      </div>

      {/* 4. Action Modals */}
      <CheckInModal
        isOpen={isCheckInOpen}
        preselectedReservationId={preselectedCheckInResId}
        reservations={reservations}
        rooms={rooms}
        guests={guests}
        onClose={() => {
          setIsCheckInOpen(false);
          setPreselectedCheckInResId(null);
        }}
        onSubmitCheckIn={handleCheckInSubmit}
      />

      <CheckOutModal
        isOpen={isCheckOutOpen}
        preselectedReservationId={preselectedCheckOutResId}
        preselectedRoomId={preselectedCheckOutRoomId}
        reservations={reservations}
        rooms={rooms}
        onClose={() => {
          setIsCheckOutOpen(false);
          setPreselectedCheckOutResId(null);
          setPreselectedCheckOutRoomId(null);
        }}
        onSubmitCheckOut={handleCheckOutSubmit}
      />

      <NewReservationModal
        isOpen={isNewReservationOpen}
        guests={guests}
        rooms={rooms}
        onClose={() => setIsNewReservationOpen(false)}
        onSubmitReservation={handleNewReservationSubmit}
      />

      <AddGuestModal
        isOpen={isAddGuestOpen}
        onClose={() => setIsAddGuestOpen(false)}
        onSubmitGuest={handleAddGuestSubmit}
      />

      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectRoom={(id) => setSelectedRoomId(id)}
        onSelectGuest={(id) => setSelectedGuestId(id)}
        onSelectReservation={(id) => {
          const res = reservations.find((r) => r.id === id);
          if (res) setSelectedGuestId(res.guestId);
        }}
      />

      {/* 5. Detail Inspection Overlays */}
      <RoomDetailModal
        room={currentSelectedRoom}
        guests={guests}
        reservations={reservations}
        events={events}
        onClose={() => setSelectedRoomId(null)}
        onMarkClean={handleMarkClean}
        onSetMaintenance={handleSetMaintenance}
        onOpenCheckOut={openCheckOutForRes}
        onSelectGuest={(id) => {
          setSelectedRoomId(null);
          setSelectedGuestId(id);
        }}
      />

      <GuestDetailModal
        guest={currentSelectedGuest}
        reservations={reservations}
        events={events}
        rooms={rooms}
        onClose={() => setSelectedGuestId(null)}
        onCheckInGuest={openCheckInForRes}
        onCheckOutGuest={openCheckOutForRes}
        onSelectRoom={(id) => {
          setSelectedGuestId(null);
          setSelectedRoomId(id);
        }}
      />

      {/* 6. Firebase Staff Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onProceedToOperations={() => {
          setIsAuthModalOpen(false);
          setCurrentView('app');
          addToast('success', 'Operations Active', `Logged in as ${role}`);
        }}
        onSuccess={() => {
          setIsAuthModalOpen(false);
          addToast('success', 'Authentication Updated', 'Staff credentials synced with Firebase.');
        }}
      />

      {/* 7. Notifications Toast Host */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <HotelAppContent />
    </AuthProvider>
  );
}
