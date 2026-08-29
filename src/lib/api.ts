import {
  Property,
  Room,
  Guest,
  Reservation,
  OperationalEvent,
  HotelKPIs,
  CheckInPayload,
  CheckOutPayload,
  CreateReservationPayload,
  SearchResult,
  AIQueryResponse,
} from '../types';
import { db } from '../../server/db';
import { resolveFactualQueryLocal } from '../../server/ai';

async function handleResponse<T>(res: Response): Promise<T | null> {
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return null;
  }
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Request failed with status ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Property
  async getProperty(): Promise<Property> {
    try {
      const res = await fetch('/api/property');
      const data = await handleResponse<Property>(res);
      if (data) return data;
    } catch {
      // Fallback
    }
    return db.getProperty();
  },

  // KPIs
  async getKPIs(): Promise<HotelKPIs> {
    try {
      const res = await fetch('/api/kpis');
      const data = await handleResponse<HotelKPIs>(res);
      if (data) return data;
    } catch {
      // Fallback
    }
    return db.getKPIs();
  },

  // Rooms
  async getRooms(params?: { status?: string; floor?: number }): Promise<Room[]> {
    try {
      const url = new URL('/api/rooms', window.location.origin);
      if (params?.status) url.searchParams.set('status', params.status);
      if (params?.floor) url.searchParams.set('floor', params.floor.toString());
      const res = await fetch(url.toString());
      const data = await handleResponse<Room[]>(res);
      if (data) return data;
    } catch {
      // Fallback
    }
    let rooms = db.getAllRooms();
    if (params?.status) {
      rooms = rooms.filter((r) => r.status === params.status);
    }
    if (params?.floor) {
      rooms = rooms.filter((r) => r.floor === params.floor);
    }
    return rooms;
  },

  async getRoomById(id: string): Promise<Room> {
    try {
      const res = await fetch(`/api/rooms/${id}`);
      const data = await handleResponse<Room>(res);
      if (data) return data;
    } catch {
      // Fallback
    }
    const room = db.getRoomById(id);
    if (!room) throw new Error('Room not found.');
    return room;
  },

  async markRoomClean(roomId: string, performedBy?: string): Promise<{ success: boolean; room: Room }> {
    try {
      const res = await fetch(`/api/rooms/${roomId}/mark-clean`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ performedBy }),
      });
      const data = await handleResponse<{ success: boolean; room: Room }>(res);
      if (data) return data;
    } catch {
      // Fallback
    }
    const result = db.markRoomClean(roomId, performedBy || 'Housekeeping Lead');
    if (!result.success || !result.room) {
      throw new Error(result.error || 'Failed to mark room clean');
    }
    return { success: true, room: result.room };
  },

  async setRoomMaintenance(
    roomId: string,
    status: 'Maintenance' | 'Out of Service' | 'Available',
    reason?: string,
    performedBy?: string
  ): Promise<{ success: boolean; room: Room }> {
    try {
      const res = await fetch(`/api/rooms/${roomId}/maintenance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, reason, performedBy }),
      });
      const data = await handleResponse<{ success: boolean; room: Room }>(res);
      if (data) return data;
    } catch {
      // Fallback
    }
    const result = db.setRoomMaintenance(roomId, status, reason, performedBy);
    if (!result.success || !result.room) {
      throw new Error(result.error || 'Failed to update maintenance status');
    }
    return { success: true, room: result.room };
  },

  // Guests
  async getGuests(): Promise<Guest[]> {
    try {
      const res = await fetch('/api/guests');
      const data = await handleResponse<Guest[]>(res);
      if (data) return data;
    } catch {
      // Fallback
    }
    return db.getAllGuests();
  },

  async getGuestById(id: string): Promise<Guest> {
    try {
      const res = await fetch(`/api/guests/${id}`);
      const data = await handleResponse<Guest>(res);
      if (data) return data;
    } catch {
      // Fallback
    }
    const guest = db.getGuestById(id);
    if (!guest) throw new Error('Guest not found.');
    return guest;
  },

  async createGuest(data: Partial<Guest>): Promise<Guest> {
    try {
      const res = await fetch('/api/guests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const resData = await handleResponse<Guest>(res);
      if (resData) return resData;
    } catch {
      // Fallback
    }
    return db.createGuest(data);
  },

  // Reservations
  async getReservations(): Promise<Reservation[]> {
    try {
      const res = await fetch('/api/reservations');
      const data = await handleResponse<Reservation[]>(res);
      if (data) return data;
    } catch {
      // Fallback
    }
    return db.getAllReservations();
  },

  async getReservationById(id: string): Promise<Reservation> {
    try {
      const res = await fetch(`/api/reservations/${id}`);
      const data = await handleResponse<Reservation>(res);
      if (data) return data;
    } catch {
      // Fallback
    }
    const reservation = db.getReservationById(id);
    if (!reservation) throw new Error('Reservation not found.');
    return reservation;
  },

  async createReservation(payload: CreateReservationPayload): Promise<Reservation> {
    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await handleResponse<Reservation>(res);
      if (data) return data;
    } catch {
      // Fallback
    }
    const result = db.createReservation(payload);
    if (result.error || !result.reservation) {
      throw new Error(result.error || 'Failed to create reservation');
    }
    return result.reservation;
  },

  async cancelReservation(id: string, performedBy?: string): Promise<{ success: boolean }> {
    try {
      const res = await fetch(`/api/reservations/${id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ performedBy }),
      });
      const data = await handleResponse<{ success: boolean }>(res);
      if (data) return data;
    } catch {
      // Fallback
    }
    return db.cancelReservation(id, performedBy);
  },

  // Check-In
  async checkIn(payload: CheckInPayload): Promise<{ success: boolean; room: Room; reservation: Reservation; guest: Guest }> {
    try {
      const res = await fetch('/api/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await handleResponse<{ success: boolean; room: Room; reservation: Reservation; guest: Guest }>(res);
      if (data) return data;
    } catch {
      // Fallback
    }
    const result = db.performCheckIn(payload);
    if (!result.success || !result.room || !result.reservation || !result.guest) {
      throw new Error(result.error || 'Failed to perform check-in');
    }
    return {
      success: true,
      room: result.room,
      reservation: result.reservation,
      guest: result.guest,
    };
  },

  // Check-Out
  async checkOut(payload: CheckOutPayload): Promise<{ success: boolean; room: Room; reservation: Reservation }> {
    try {
      const res = await fetch('/api/check-out', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await handleResponse<{ success: boolean; room: Room; reservation: Reservation }>(res);
      if (data) return data;
    } catch {
      // Fallback
    }
    const result = db.performCheckOut(payload);
    if (!result.success || !result.room || !result.reservation) {
      throw new Error(result.error || 'Failed to perform check-out');
    }
    return {
      success: true,
      room: result.room,
      reservation: result.reservation,
    };
  },

  // Events
  async getEvents(): Promise<OperationalEvent[]> {
    try {
      const res = await fetch('/api/events');
      const data = await handleResponse<OperationalEvent[]>(res);
      if (data) return data;
    } catch {
      // Fallback
    }
    return db.getAllEvents();
  },

  // Search
  async search(query: string): Promise<SearchResult> {
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const data = await handleResponse<SearchResult>(res);
      if (data) return data;
    } catch {
      // Fallback
    }
    return db.search(query);
  },

  // AI Operator Query
  async queryAI(query: string): Promise<AIQueryResponse> {
    try {
      const res = await fetch('/api/ai/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const data = await handleResponse<AIQueryResponse>(res);
      if (data) return data;
    } catch {
      // Fallback
    }
    const local = resolveFactualQueryLocal(query);
    if (local) return local;
    const kpis = db.getKPIs();
    return {
      query,
      answer: `Live Hotel State: ${kpis.availableRooms} rooms available, ${kpis.occupiedRooms} occupied (${kpis.occupancyRate}% occupancy), ${kpis.todaysArrivals} arrivals today.`,
      languageDetected: 'English',
      confidence: 0.92,
      timestamp: new Date().toISOString(),
    };
  },

  // Reset seed
  async resetSeed(): Promise<{ message: string }> {
    try {
      const res = await fetch('/api/reset-seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await handleResponse<{ message: string }>(res);
      if (data) return data;
    } catch {
      // Fallback
    }
    db.reset();
    return { message: 'Hotel database reset to initial seeded state.' };
  },
};
