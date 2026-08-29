import {
  Property,
  Room,
  Guest,
  Reservation,
  OperationalEvent,
  HotelKPIs,
  RoomType,
  RoomStatus,
  CheckInPayload,
  CheckOutPayload,
  CreateReservationPayload,
  SearchResult,
} from '../src/types';

// The Meridian Kolkata Initial Property
const defaultProperty: Property = {
  id: 'prop_the_meridian_kolkata',
  name: 'The Meridian Kolkata',
  location: 'Kolkata, West Bengal, India',
  totalRooms: 100,
  currency: 'INR',
  timezone: 'Asia/Kolkata',
  tagline: 'Every hospitality business runs on data. Almost none of them run on intelligence.',
};

// Seed 100 Rooms (Floors 1 to 5, 20 rooms per floor: 101-120, 201-220, 301-320, 401-420, 501-520)
function generateInitialRooms(): Room[] {
  const rooms: Room[] = [];
  const roomTypes: RoomType[] = [
    'Deluxe King',
    'Deluxe Twin',
    'Executive Club',
    'Heritage Suite',
    'Presidential Suite',
  ];

  for (let floor = 1; floor <= 5; floor++) {
    for (let index = 1; index <= 20; index++) {
      const roomNum = `${floor}${index < 10 ? '0' + index : index}`;
      let roomType: RoomType = 'Deluxe King';
      let rate = 7500;
      let features = ['High Speed WiFi', 'City View', 'Marble Bath'];

      if (floor === 5 && (index === 19 || index === 20)) {
        roomType = 'Presidential Suite';
        rate = 45000;
        features = ['Victoria Memorial View', 'Private Butler', 'Jacuzzi', 'Club Lounge Access', 'Chauffeur Service'];
      } else if (floor >= 4 && index >= 15) {
        roomType = 'Heritage Suite';
        rate = 18500;
        features = ['Heritage Balcony', 'Colonial Teak Decor', 'Deep Soaking Tub', 'Complimentary High Tea'];
      } else if (floor >= 3 && index >= 11) {
        roomType = 'Executive Club';
        rate = 12000;
        features = ['Club Floor Access', 'Ergonomic Workstation', 'Express Check-In', 'City Skyline View'];
      } else if (index % 3 === 0) {
        roomType = 'Deluxe Twin';
        rate = 8000;
        features = ['Twin Beds', 'Courtyard Garden View', 'Walk-in Shower', 'Fast WiFi'];
      } else {
        roomType = 'Deluxe King';
        rate = 8500;
        features = ['King Bed', 'Hooghly River Hint View', 'Nespresso Machine', 'Smart Lighting'];
      }

      // Default status distribution:
      // Room 204: OCCUPIED by Arjun Sharma
      // Other rooms have a realistic distribution
      let status: RoomStatus = 'Available';
      let maintenanceReason: string | undefined = undefined;

      const numVal = parseInt(roomNum, 10);
      if (roomNum === '204') {
        status = 'Occupied';
      } else if ([103, 107, 212, 308, 415].includes(numVal)) {
        status = 'Cleaning';
      } else if ([118, 319].includes(numVal)) {
        status = 'Maintenance';
        maintenanceReason = 'HVAC sensor calibration & plumbing inspection';
      } else if ([510].includes(numVal)) {
        status = 'Out of Service';
        maintenanceReason = 'Boutique heritage woodwork restoration';
      } else if (
        // ~62 other rooms occupied for a realistic ~64% occupancy
        (numVal % 3 !== 0 && numVal % 5 !== 0) ||
        [101, 102, 105, 108, 110, 114, 201, 202, 205, 208, 210, 214, 218, 301, 304, 305, 309, 314, 401, 404, 408, 412, 501, 505, 519].includes(numVal)
      ) {
        status = 'Occupied';
      } else {
        status = 'Available';
      }

      rooms.push({
        id: `room-${roomNum}`,
        roomNumber: roomNum,
        floor,
        roomType,
        rate,
        status,
        maintenanceReason,
        lastCleanedAt: status === 'Cleaning' ? '2026-08-22T08:30:00Z' : '2026-08-21T16:00:00Z',
        features,
      });
    }
  }

  return rooms;
}

// Seed realistic Indian Guests
function generateInitialGuests(): Guest[] {
  return [
    {
      id: 'gst-101',
      firstName: 'Arjun',
      lastName: 'Sharma',
      phone: '+91 98301 24891',
      email: 'arjun.sharma@tata-consultancy.example',
      nationality: 'Indian',
      idProofType: 'Aadhaar Card',
      idProofNumber: 'XXXX-XXXX-4819',
      vipStatus: 'Gold',
      stayStatus: 'Active Stay',
      currentRoomNumber: '204',
      currentReservationId: 'RES-10294',
      checkInDate: '2026-08-21',
      checkOutDate: '2026-08-24',
      totalStays: 6,
      notes: 'Prefers quiet rooms away from elevator, extra feather pillows requested.',
      createdAt: '2026-01-14T10:00:00Z',
    },
    {
      id: 'gst-102',
      firstName: 'Priya',
      lastName: 'Sen',
      phone: '+91 98310 99842',
      email: 'priya.sen@bengal-creative.in',
      nationality: 'Indian',
      idProofType: 'Passport',
      idProofNumber: 'P8920194',
      vipStatus: 'Silver',
      stayStatus: 'Upcoming',
      currentRoomNumber: undefined,
      currentReservationId: 'RES-10295',
      checkInDate: '2026-08-22',
      checkOutDate: '2026-08-25',
      totalStays: 3,
      notes: 'Arriving by late morning flight from Mumbai. Early check-in requested if possible.',
      createdAt: '2026-03-10T12:00:00Z',
    },
    {
      id: 'gst-103',
      firstName: 'Rohan',
      lastName: 'Mukherjee',
      phone: '+91 98744 55120',
      email: 'rohan.mukherjee@itc-infotech.com',
      nationality: 'Indian',
      idProofType: 'Aadhaar Card',
      idProofNumber: 'XXXX-XXXX-9102',
      vipStatus: 'Black Diamond',
      stayStatus: 'Active Stay',
      currentRoomNumber: '519',
      currentReservationId: 'RES-10288',
      checkInDate: '2026-08-20',
      checkOutDate: '2026-08-22', // Departing today
      totalStays: 14,
      notes: 'Managing Director tier. Complimentary airport drop arranged for 4:00 PM.',
      createdAt: '2025-08-11T09:30:00Z',
    },
    {
      id: 'gst-104',
      firstName: 'Ananya',
      lastName: 'Banerjee',
      phone: '+91 98305 11982',
      email: 'ananya.banerjee@arts-council.org',
      nationality: 'Indian',
      idProofType: 'Voter ID',
      idProofNumber: 'WB-KOL-9021',
      vipStatus: 'Regular',
      stayStatus: 'Upcoming',
      currentRoomNumber: undefined,
      currentReservationId: 'RES-10298',
      checkInDate: '2026-08-22',
      checkOutDate: '2026-08-23',
      totalStays: 1,
      notes: 'Guest attending Kolkata Literary Conclave.',
      createdAt: '2026-08-18T14:20:00Z',
    },
    {
      id: 'gst-105',
      firstName: 'Vikram',
      lastName: 'Singhania',
      phone: '+91 99032 87611',
      email: 'vikram.singhania@apex-holdings.co.in',
      nationality: 'Indian',
      idProofType: 'Passport',
      idProofNumber: 'S7710291',
      vipStatus: 'Gold',
      stayStatus: 'Active Stay',
      currentRoomNumber: '412',
      currentReservationId: 'RES-10280',
      checkInDate: '2026-08-19',
      checkOutDate: '2026-08-22', // Departing today
      totalStays: 8,
      notes: 'Corporate rate via MakeMyTrip Corporate.',
      createdAt: '2025-11-04T15:00:00Z',
    },
    {
      id: 'gst-106',
      firstName: 'Dr. Debashis',
      lastName: 'Roy',
      phone: '+91 98312 77019',
      email: 'debashis.roy@amri-hospital.org',
      nationality: 'Indian',
      idProofType: 'Aadhaar Card',
      idProofNumber: 'XXXX-XXXX-6532',
      vipStatus: 'Regular',
      stayStatus: 'Active Stay',
      currentRoomNumber: '108',
      currentReservationId: 'RES-10282',
      checkInDate: '2026-08-21',
      checkOutDate: '2026-08-24',
      totalStays: 2,
      notes: 'Medical conference speaker.',
      createdAt: '2026-07-20T11:00:00Z',
    },
    {
      id: 'gst-107',
      firstName: 'Sunita',
      lastName: 'Patel',
      phone: '+91 97129 44321',
      email: 'sunita.patel@gujarat-textiles.com',
      nationality: 'Indian',
      idProofType: 'Aadhaar Card',
      idProofNumber: 'XXXX-XXXX-1149',
      vipStatus: 'Silver',
      stayStatus: 'Upcoming',
      currentRoomNumber: undefined,
      currentReservationId: 'RES-10300',
      checkInDate: '2026-08-22',
      checkOutDate: '2026-08-26',
      totalStays: 4,
      notes: 'Family booking: 2 adults, 1 child.',
      createdAt: '2026-08-15T16:40:00Z',
    },
    {
      id: 'gst-108',
      firstName: 'Rajesh',
      lastName: 'Gupta',
      phone: '+91 98101 66543',
      email: 'rajesh.gupta@delhi-exports.in',
      nationality: 'Indian',
      idProofType: 'Passport',
      idProofNumber: 'Z1092834',
      vipStatus: 'Regular',
      stayStatus: 'Active Stay',
      currentRoomNumber: '304',
      currentReservationId: 'RES-10279',
      checkInDate: '2026-08-20',
      checkOutDate: '2026-08-23',
      totalStays: 5,
      notes: 'High floor preferred.',
      createdAt: '2026-02-12T10:00:00Z',
    },
    {
      id: 'gst-109',
      firstName: 'Meera',
      lastName: 'Chatterjee',
      phone: '+91 98300 12099',
      email: 'meera.chatterjee@oxford.ac.uk',
      nationality: 'Indian',
      idProofType: 'Passport',
      idProofNumber: 'K4490123',
      vipStatus: 'Gold',
      stayStatus: 'Upcoming',
      currentRoomNumber: undefined,
      currentReservationId: 'RES-10302',
      checkInDate: '2026-08-22',
      checkOutDate: '2026-08-27',
      totalStays: 7,
      notes: 'Guest requested Heritage Suite on 4th floor if available.',
      createdAt: '2026-08-10T09:15:00Z',
    },
    {
      id: 'gst-110',
      firstName: 'Vikrant',
      lastName: 'Choudhury',
      phone: '+91 98200 44910',
      email: 'v.choudhury@mumbai-invest.com',
      nationality: 'Indian',
      idProofType: 'Aadhaar Card',
      idProofNumber: 'XXXX-XXXX-7721',
      vipStatus: 'Silver',
      stayStatus: 'Active Stay',
      currentRoomNumber: '210',
      currentReservationId: 'RES-10275',
      checkInDate: '2026-08-18',
      checkOutDate: '2026-08-22', // Departing today
      totalStays: 3,
      notes: 'Late checkout requested (1:00 PM). Approved by Front Desk.',
      createdAt: '2026-05-19T13:00:00Z',
    },
  ];
}

// Seed realistic Reservations
function generateInitialReservations(): Reservation[] {
  return [
    {
      id: 'RES-10294',
      guestId: 'gst-101',
      guestName: 'Arjun Sharma',
      guestPhone: '+91 98301 24891',
      guestEmail: 'arjun.sharma@tata-consultancy.example',
      propertyId: 'prop_the_meridian_kolkata',
      roomId: 'room-204',
      roomNumber: '204',
      roomType: 'Deluxe King',
      bookingChannel: 'Corporate Desk',
      bookingDate: '2026-08-14',
      checkInDate: '2026-08-21',
      checkOutDate: '2026-08-24',
      adults: 1,
      children: 0,
      rate: 8500,
      totalAmount: 25500,
      paidAmount: 25500,
      status: 'Checked In',
      specialRequests: 'High floor, quiet corner, extra towels.',
      createdAt: '2026-08-14T09:00:00Z',
    },
    {
      id: 'RES-10295',
      guestId: 'gst-102',
      guestName: 'Priya Sen',
      guestPhone: '+91 98310 99842',
      guestEmail: 'priya.sen@bengal-creative.in',
      propertyId: 'prop_the_meridian_kolkata',
      roomId: undefined,
      roomNumber: undefined,
      roomType: 'Executive Club',
      bookingChannel: 'Direct Web',
      bookingDate: '2026-08-18',
      checkInDate: '2026-08-22',
      checkOutDate: '2026-08-25',
      adults: 1,
      children: 0,
      rate: 12000,
      totalAmount: 36000,
      paidAmount: 12000,
      status: 'Confirmed',
      specialRequests: 'Arriving at 11:30 AM. Non-smoking room essential.',
      createdAt: '2026-08-18T14:30:00Z',
    },
    {
      id: 'RES-10288',
      guestId: 'gst-103',
      guestName: 'Rohan Mukherjee',
      guestPhone: '+91 98744 55120',
      guestEmail: 'rohan.mukherjee@itc-infotech.com',
      propertyId: 'prop_the_meridian_kolkata',
      roomId: 'room-519',
      roomNumber: '519',
      roomType: 'Presidential Suite',
      bookingChannel: 'Corporate Desk',
      bookingDate: '2026-08-10',
      checkInDate: '2026-08-20',
      checkOutDate: '2026-08-22',
      adults: 2,
      children: 0,
      rate: 45000,
      totalAmount: 90000,
      paidAmount: 90000,
      status: 'Checked In',
      specialRequests: 'Airport limousine transfer at checkout.',
      createdAt: '2026-08-10T11:00:00Z',
    },
    {
      id: 'RES-10298',
      guestId: 'gst-104',
      guestName: 'Ananya Banerjee',
      guestPhone: '+91 98305 11982',
      guestEmail: 'ananya.banerjee@arts-council.org',
      propertyId: 'prop_the_meridian_kolkata',
      roomId: undefined,
      roomNumber: undefined,
      roomType: 'Deluxe King',
      bookingChannel: 'MakeMyTrip',
      bookingDate: '2026-08-19',
      checkInDate: '2026-08-22',
      checkOutDate: '2026-08-23',
      adults: 1,
      children: 0,
      rate: 8500,
      totalAmount: 8500,
      paidAmount: 8500,
      status: 'Confirmed',
      specialRequests: 'City view room.',
      createdAt: '2026-08-19T10:15:00Z',
    },
    {
      id: 'RES-10280',
      guestId: 'gst-105',
      guestName: 'Vikram Singhania',
      guestPhone: '+91 99032 87611',
      guestEmail: 'vikram.singhania@apex-holdings.co.in',
      propertyId: 'prop_the_meridian_kolkata',
      roomId: 'room-412',
      roomNumber: '412',
      roomType: 'Executive Club',
      bookingChannel: 'MakeMyTrip',
      bookingDate: '2026-08-12',
      checkInDate: '2026-08-19',
      checkOutDate: '2026-08-22',
      adults: 1,
      children: 0,
      rate: 12000,
      totalAmount: 36000,
      paidAmount: 36000,
      status: 'Checked In',
      specialRequests: 'Folio bill to corporate GSTIN.',
      createdAt: '2026-08-12T15:20:00Z',
    },
    {
      id: 'RES-10282',
      guestId: 'gst-106',
      guestName: 'Dr. Debashis Roy',
      guestPhone: '+91 98312 77019',
      guestEmail: 'debashis.roy@amri-hospital.org',
      propertyId: 'prop_the_meridian_kolkata',
      roomId: 'room-108',
      roomNumber: '108',
      roomType: 'Deluxe King',
      bookingChannel: 'Phone Direct',
      bookingDate: '2026-08-15',
      checkInDate: '2026-08-21',
      checkOutDate: '2026-08-24',
      adults: 1,
      children: 0,
      rate: 8500,
      totalAmount: 25500,
      paidAmount: 25500,
      status: 'Checked In',
      specialRequests: 'Ground/1st floor room for convenience.',
      createdAt: '2026-08-15T09:40:00Z',
    },
    {
      id: 'RES-10300',
      guestId: 'gst-107',
      guestName: 'Sunita Patel',
      guestPhone: '+91 97129 44321',
      guestEmail: 'sunita.patel@gujarat-textiles.com',
      propertyId: 'prop_the_meridian_kolkata',
      roomId: undefined,
      roomNumber: undefined,
      roomType: 'Deluxe Twin',
      bookingChannel: 'Booking.com',
      bookingDate: '2026-08-20',
      checkInDate: '2026-08-22',
      checkOutDate: '2026-08-26',
      adults: 2,
      children: 1,
      rate: 8000,
      totalAmount: 32000,
      paidAmount: 8000,
      status: 'Confirmed',
      specialRequests: 'Extra cot for child, vegetarian breakfast note.',
      createdAt: '2026-08-20T17:10:00Z',
    },
    {
      id: 'RES-10279',
      guestId: 'gst-108',
      guestName: 'Rajesh Gupta',
      guestPhone: '+91 98101 66543',
      guestEmail: 'rajesh.gupta@delhi-exports.in',
      propertyId: 'prop_the_meridian_kolkata',
      roomId: 'room-304',
      roomNumber: '304',
      roomType: 'Deluxe King',
      bookingChannel: 'Direct Web',
      bookingDate: '2026-08-11',
      checkInDate: '2026-08-20',
      checkOutDate: '2026-08-23',
      adults: 1,
      children: 0,
      rate: 8500,
      totalAmount: 25500,
      paidAmount: 25500,
      status: 'Checked In',
      specialRequests: 'Quiet room.',
      createdAt: '2026-08-11T12:00:00Z',
    },
    {
      id: 'RES-10302',
      guestId: 'gst-109',
      guestName: 'Meera Chatterjee',
      guestPhone: '+91 98300 12099',
      guestEmail: 'meera.chatterjee@oxford.ac.uk',
      propertyId: 'prop_the_meridian_kolkata',
      roomId: undefined,
      roomNumber: undefined,
      roomType: 'Heritage Suite',
      bookingChannel: 'Direct Web',
      bookingDate: '2026-08-21',
      checkInDate: '2026-08-22',
      checkOutDate: '2026-08-27',
      adults: 2,
      children: 0,
      rate: 18500,
      totalAmount: 92500,
      paidAmount: 92500,
      status: 'Confirmed',
      specialRequests: 'Colonial wing preference, quiet courtyard view.',
      createdAt: '2026-08-21T08:20:00Z',
    },
    {
      id: 'RES-10275',
      guestId: 'gst-110',
      guestName: 'Vikrant Choudhury',
      guestPhone: '+91 98200 44910',
      guestEmail: 'v.choudhury@mumbai-invest.com',
      propertyId: 'prop_the_meridian_kolkata',
      roomId: 'room-210',
      roomNumber: '210',
      roomType: 'Deluxe King',
      bookingChannel: 'Corporate Desk',
      bookingDate: '2026-08-08',
      checkInDate: '2026-08-18',
      checkOutDate: '2026-08-22',
      adults: 1,
      children: 0,
      rate: 8500,
      totalAmount: 34000,
      paidAmount: 34000,
      status: 'Checked In',
      specialRequests: 'Late checkout confirmed at 1:00 PM.',
      createdAt: '2026-08-08T16:00:00Z',
    },
  ];
}

// Seed initial chronological Operational Events
function generateInitialEvents(): OperationalEvent[] {
  return [
    {
      id: 'EVT-9084',
      propertyId: 'prop_the_meridian_kolkata',
      eventType: 'GUEST_CHECKED_IN',
      title: 'Guest checked in',
      description: 'Arjun Sharma completed check-in and received keycards for Room 204.',
      entityType: 'Guest',
      entityId: 'gst-101',
      performedBy: 'Front Desk - Priya D.',
      timestamp: '2026-08-21T10:42:00Z',
      timeFormatted: '10:42 AM',
      metadata: {
        room_number: '204',
        guest_name: 'Arjun Sharma',
        reservation_id: 'RES-10294',
        keycards_issued: 2,
      },
    },
    {
      id: 'EVT-9083',
      propertyId: 'prop_the_meridian_kolkata',
      eventType: 'ROOM_MARKED_CLEAN',
      title: 'Room marked ready',
      description: 'Room 312 completed sanitization, linen refresh, and quality audit.',
      entityType: 'Room',
      entityId: 'room-312',
      performedBy: 'Housekeeping Lead - Ramesh K.',
      timestamp: '2026-08-21T10:18:00Z',
      timeFormatted: '10:18 AM',
      metadata: {
        room_number: '312',
        supervisor: 'Ramesh K.',
        status: 'Available',
      },
    },
    {
      id: 'EVT-9082',
      propertyId: 'prop_the_meridian_kolkata',
      eventType: 'RESERVATION_CREATED',
      title: 'Reservation created',
      description: 'New direct reservation for Priya Sen (Executive Club, Aug 22-25).',
      entityType: 'Reservation',
      entityId: 'RES-10295',
      performedBy: 'Direct Web Channel',
      timestamp: '2026-08-21T09:54:00Z',
      timeFormatted: '09:54 AM',
      metadata: {
        guest_name: 'Priya Sen',
        reservation_id: 'RES-10295',
        channel: 'Direct Web',
        rate: 12000,
      },
    },
    {
      id: 'EVT-9081',
      propertyId: 'prop_the_meridian_kolkata',
      eventType: 'ROOM_MAINTENANCE',
      title: 'Room placed under maintenance',
      description: 'Room 118 scheduled for HVAC sensor calibration and filter change.',
      entityType: 'Room',
      entityId: 'room-118',
      performedBy: 'Engineering Supervisor - Subhash G.',
      timestamp: '2026-08-21T08:30:00Z',
      timeFormatted: '08:30 AM',
      metadata: {
        room_number: '118',
        reason: 'HVAC sensor calibration',
      },
    },
    {
      id: 'EVT-9080',
      propertyId: 'prop_the_meridian_kolkata',
      eventType: 'GUEST_CHECKED_IN',
      title: 'Guest checked in',
      description: 'Dr. Debashis Roy checked into Room 108.',
      entityType: 'Guest',
      entityId: 'gst-106',
      performedBy: 'Front Desk - Priya D.',
      timestamp: '2026-08-21T07:15:00Z',
      timeFormatted: '07:15 AM',
      metadata: {
        room_number: '108',
        guest_name: 'Dr. Debashis Roy',
        reservation_id: 'RES-10282',
      },
    },
  ];
}

// Database In-Memory Store with thread-safe operations
class HotelDatabase {
  private property: Property = defaultProperty;
  private rooms: Room[] = [];
  private guests: Guest[] = [];
  private reservations: Reservation[] = [];
  private events: OperationalEvent[] = [];

  constructor() {
    this.reset();
  }

  public reset(): void {
    this.property = { ...defaultProperty };
    this.rooms = generateInitialRooms();
    this.guests = generateInitialGuests();
    this.reservations = generateInitialReservations();
    this.events = generateInitialEvents();

    // Link occupied rooms to guests
    this.syncOccupancyLinks();
  }

  private syncOccupancyLinks(): void {
    for (const res of this.reservations) {
      if (res.status === 'Checked In' && res.roomId) {
        const room = this.rooms.find((r) => r.id === res.roomId);
        if (room) {
          room.status = 'Occupied';
          room.currentGuestId = res.guestId;
          room.currentGuestName = res.guestName;
          room.currentReservationId = res.id;
        }
      }
    }
  }

  // Property
  public getProperty(): Property {
    return { ...this.property };
  }

  // Rooms
  public getAllRooms(): Room[] {
    return [...this.rooms];
  }

  public getRoomById(id: string): Room | undefined {
    return this.rooms.find((r) => r.id === id || r.roomNumber === id);
  }

  public getRoomsByStatus(status: RoomStatus): Room[] {
    return this.rooms.filter((r) => r.status === status);
  }

  public getAvailableRooms(roomType?: RoomType): Room[] {
    return this.rooms.filter(
      (r) => r.status === 'Available' && (!roomType || r.roomType === roomType)
    );
  }

  // Guests
  public getAllGuests(): Guest[] {
    return [...this.guests];
  }

  public getGuestById(id: string): Guest | undefined {
    return this.guests.find((g) => g.id === id);
  }

  public createGuest(data: Partial<Guest>): Guest {
    const newGuest: Guest = {
      id: `gst-${Date.now().toString().slice(-6)}`,
      firstName: data.firstName || 'Guest',
      lastName: data.lastName || '',
      phone: data.phone || '+91 98000 00000',
      email: data.email || 'guest@example.com',
      nationality: data.nationality || 'Indian',
      idProofType: data.idProofType || 'Aadhaar Card',
      idProofNumber: data.idProofNumber || 'XXXX-XXXX-0000',
      vipStatus: data.vipStatus || 'Regular',
      stayStatus: 'No Active Stay',
      totalStays: 1,
      notes: data.notes,
      createdAt: new Date().toISOString(),
    };
    this.guests.unshift(newGuest);

    this.recordEvent({
      eventType: 'GUEST_CREATED',
      title: 'Guest profile created',
      description: `New guest profile registered: ${newGuest.firstName} ${newGuest.lastName}`,
      entityType: 'Guest',
      entityId: newGuest.id,
      performedBy: 'Front Desk',
      metadata: {
        guest_name: `${newGuest.firstName} ${newGuest.lastName}`,
        phone: newGuest.phone,
        email: newGuest.email,
      },
    });

    return newGuest;
  }

  // Reservations
  public getAllReservations(): Reservation[] {
    return [...this.reservations];
  }

  public getReservationById(id: string): Reservation | undefined {
    return this.reservations.find((r) => r.id === id);
  }

  public createReservation(payload: CreateReservationPayload): { reservation: Reservation; error?: string } {
    let guest: Guest | undefined;
    if (payload.guestId) {
      guest = this.getGuestById(payload.guestId);
    } else if (payload.newGuest) {
      guest = this.createGuest(payload.newGuest);
    }

    if (!guest) {
      return { reservation: null as any, error: 'Guest information is required.' };
    }

    let room: Room | undefined;
    if (payload.roomId) {
      room = this.getRoomById(payload.roomId);
      if (!room) {
        return { reservation: null as any, error: 'Selected room not found.' };
      }
      if (room.status !== 'Available') {
        return {
          reservation: null as any,
          error: `Room ${room.roomNumber} cannot be assigned because its current status is ${room.status}.`,
        };
      }
    }

    const checkIn = new Date(payload.checkInDate);
    const checkOut = new Date(payload.checkOutDate);
    const diffDays = Math.max(1, Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 3600 * 24)));
    const totalAmount = diffDays * payload.rate;

    const newRes: Reservation = {
      id: `RES-${Math.floor(10000 + Math.random() * 90000)}`,
      guestId: guest.id,
      guestName: `${guest.firstName} ${guest.lastName}`,
      guestPhone: guest.phone,
      guestEmail: guest.email,
      propertyId: this.property.id,
      roomId: room?.id,
      roomNumber: room?.roomNumber,
      roomType: payload.roomType,
      bookingChannel: payload.bookingChannel,
      bookingDate: new Date().toISOString().split('T')[0],
      checkInDate: payload.checkInDate,
      checkOutDate: payload.checkOutDate,
      adults: payload.adults || 1,
      children: payload.children || 0,
      rate: payload.rate,
      totalAmount,
      paidAmount: 0,
      status: 'Confirmed',
      specialRequests: payload.specialRequests,
      createdAt: new Date().toISOString(),
    };

    this.reservations.unshift(newRes);

    this.recordEvent({
      eventType: 'RESERVATION_CREATED',
      title: 'Reservation created',
      description: `Reservation ${newRes.id} booked for ${newRes.guestName} (${newRes.roomType}, ${newRes.checkInDate} to ${newRes.checkOutDate}).`,
      entityType: 'Reservation',
      entityId: newRes.id,
      performedBy: payload.performedBy || 'Front Desk',
      metadata: {
        reservation_id: newRes.id,
        guest_name: newRes.guestName,
        room_number: newRes.roomNumber,
        channel: newRes.bookingChannel,
        rate: newRes.rate,
      },
    });

    return { reservation: newRes };
  }

  public cancelReservation(id: string, performedBy = 'Front Desk'): { success: boolean; error?: string } {
    const res = this.getReservationById(id);
    if (!res) return { success: false, error: 'Reservation not found.' };

    if (res.status === 'Checked In') {
      return { success: false, error: 'Cannot cancel a reservation that is currently Checked In. Perform checkout instead.' };
    }

    res.status = 'Cancelled';

    this.recordEvent({
      eventType: 'RESERVATION_CANCELLED',
      title: 'Reservation cancelled',
      description: `Reservation ${res.id} for ${res.guestName} was cancelled.`,
      entityType: 'Reservation',
      entityId: res.id,
      performedBy,
      metadata: {
        reservation_id: res.id,
        guest_name: res.guestName,
      },
    });

    return { success: true };
  }

  // CHECK-IN FLOW
  public performCheckIn(payload: CheckInPayload): { success: boolean; room?: Room; reservation?: Reservation; guest?: Guest; error?: string } {
    const targetRoom = this.getRoomById(payload.roomId);
    if (!targetRoom) {
      return { success: false, error: 'Target room does not exist.' };
    }

    // STRICT VALIDATION: Room assignment rule
    if (targetRoom.status !== 'Available') {
      return {
        success: false,
        error: `Cannot check into Room ${targetRoom.roomNumber} because it is currently ${targetRoom.status}. Only Available rooms can be assigned.`,
      };
    }

    let guest: Guest | undefined;
    if (payload.guestId) {
      guest = this.getGuestById(payload.guestId);
    } else if (payload.newGuest) {
      guest = this.createGuest(payload.newGuest);
    }

    let res: Reservation | undefined;
    if (payload.reservationId) {
      res = this.getReservationById(payload.reservationId);
    }

    if (!res && guest) {
      // Walk-in check-in: generate an immediate reservation
      const createResRes = this.createReservation({
        guestId: guest.id,
        roomId: targetRoom.id,
        roomType: targetRoom.roomType,
        bookingChannel: 'Direct Web',
        checkInDate: new Date().toISOString().split('T')[0],
        checkOutDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        adults: 1,
        children: 0,
        rate: targetRoom.rate,
        performedBy: payload.performedBy || 'Front Desk',
      });
      res = createResRes.reservation;
    }

    if (!res || !guest) {
      return { success: false, error: 'Valid guest and reservation are required to complete check-in.' };
    }

    // State Changes:
    // 1. Reservation -> Checked In
    res.status = 'Checked In';
    res.roomId = targetRoom.id;
    res.roomNumber = targetRoom.roomNumber;

    // 2. Room -> Occupied
    targetRoom.status = 'Occupied';
    targetRoom.currentGuestId = guest.id;
    targetRoom.currentGuestName = `${guest.firstName} ${guest.lastName}`;
    targetRoom.currentReservationId = res.id;

    // 3. Guest -> Active Stay
    guest.stayStatus = 'Active Stay';
    guest.currentRoomNumber = targetRoom.roomNumber;
    guest.currentReservationId = res.id;
    guest.checkInDate = res.checkInDate;
    guest.checkOutDate = res.checkOutDate;
    guest.totalStays = (guest.totalStays || 0) + 1;

    // 4. Operational Event -> Created
    this.recordEvent({
      eventType: 'GUEST_CHECKED_IN',
      title: 'Guest checked in',
      description: `${guest.firstName} ${guest.lastName} checked into Room ${targetRoom.roomNumber}. Keycards issued.`,
      entityType: 'Guest',
      entityId: guest.id,
      performedBy: payload.performedBy || 'Front Desk',
      metadata: {
        room_number: targetRoom.roomNumber,
        guest_name: `${guest.firstName} ${guest.lastName}`,
        reservation_id: res.id,
        room_type: targetRoom.roomType,
        rate: targetRoom.rate,
      },
    });

    return { success: true, room: targetRoom, reservation: res, guest };
  }

  // CHECK-OUT FLOW
  public performCheckOut(payload: CheckOutPayload): { success: boolean; room?: Room; reservation?: Reservation; error?: string } {
    const room = this.getRoomById(payload.roomId);
    if (!room) {
      return { success: false, error: 'Room not found.' };
    }

    const res = this.getReservationById(payload.reservationId);
    if (!res) {
      return { success: false, error: 'Reservation not found.' };
    }

    const guest = this.getGuestById(res.guestId);

    // State Changes:
    // 1. Reservation -> Checked Out
    res.status = 'Checked Out';

    // 2. IMPORTANT RULE: A checked-out room must NOT immediately become Available.
    // It first becomes: Cleaning
    room.status = 'Cleaning';
    const previousGuestName = room.currentGuestName || res.guestName;
    room.currentGuestId = undefined;
    room.currentGuestName = undefined;
    room.currentReservationId = undefined;

    // 3. Guest -> Checked Out
    if (guest) {
      guest.stayStatus = 'Checked Out';
      guest.currentRoomNumber = undefined;
      guest.currentReservationId = undefined;
    }

    // 4. Operational Event -> Created
    this.recordEvent({
      eventType: 'GUEST_CHECKED_OUT',
      title: 'Guest checked out',
      description: `${previousGuestName} checked out of Room ${room.roomNumber}. Room assigned to Housekeeping (Cleaning).`,
      entityType: 'Guest',
      entityId: guest?.id || res.guestId,
      performedBy: payload.performedBy || 'Front Desk',
      metadata: {
        room_number: room.roomNumber,
        guest_name: previousGuestName,
        reservation_id: res.id,
        new_room_status: 'Cleaning',
      },
    });

    return { success: true, room, reservation: res };
  }

  // HOUSEKEEPING: Mark Room Clean
  public markRoomClean(roomId: string, performedBy = 'Housekeeping'): { success: boolean; room?: Room; error?: string } {
    const room = this.getRoomById(roomId);
    if (!room) return { success: false, error: 'Room not found.' };

    if (room.status === 'Occupied') {
      return { success: false, error: 'Cannot mark an Occupied room as Available. Guest is still in-house.' };
    }

    room.status = 'Available';
    room.maintenanceReason = undefined;
    room.lastCleanedAt = new Date().toISOString();

    this.recordEvent({
      eventType: 'ROOM_MARKED_CLEAN',
      title: 'Room marked ready',
      description: `Room ${room.roomNumber} inspected and certified ready for check-in by housekeeping.`,
      entityType: 'Room',
      entityId: room.id,
      performedBy,
      metadata: {
        room_number: room.roomNumber,
        status: 'Available',
      },
    });

    return { success: true, room };
  }

  // MAINTENANCE: Set Room Status
  public setRoomMaintenance(
    roomId: string,
    status: 'Maintenance' | 'Out of Service' | 'Available',
    reason?: string,
    performedBy = 'Facilities'
  ): { success: boolean; room?: Room; error?: string } {
    const room = this.getRoomById(roomId);
    if (!room) return { success: false, error: 'Room not found.' };

    if (room.status === 'Occupied' && status !== 'Available') {
      return { success: false, error: 'Cannot place an Occupied room into maintenance. Relocate guest first.' };
    }

    room.status = status;
    room.maintenanceReason = reason;

    this.recordEvent({
      eventType: 'ROOM_MAINTENANCE',
      title: `Room status updated: ${status}`,
      description: `Room ${room.roomNumber} placed on ${status}. Reason: ${reason || 'Routine inspection'}`,
      entityType: 'Room',
      entityId: room.id,
      performedBy,
      metadata: {
        room_number: room.roomNumber,
        new_status: status,
        reason: reason || 'Scheduled technical maintenance',
      },
    });

    return { success: true, room };
  }

  // Operational Events
  public getAllEvents(): OperationalEvent[] {
    return [...this.events];
  }

  public recordEvent(eventData: Omit<OperationalEvent, 'id' | 'propertyId' | 'timestamp' | 'timeFormatted'>): OperationalEvent {
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const newEvent: OperationalEvent = {
      id: `EVT-${Math.floor(1000 + Math.random() * 9000)}`,
      propertyId: this.property.id,
      timestamp: now.toISOString(),
      timeFormatted,
      ...eventData,
    };

    this.events.unshift(newEvent);
    // Keep last 100 events
    if (this.events.length > 100) {
      this.events.pop();
    }
    return newEvent;
  }

  // Global Search
  public search(query: string): SearchResult {
    const cleanQ = (query || '').trim().toLowerCase();
    if (!cleanQ) {
      return { rooms: [], guests: [], reservations: [] };
    }

    const matchedRooms = this.rooms.filter(
      (r) =>
        r.roomNumber.toLowerCase().includes(cleanQ) ||
        r.roomType.toLowerCase().includes(cleanQ) ||
        r.status.toLowerCase().includes(cleanQ) ||
        (r.currentGuestName && r.currentGuestName.toLowerCase().includes(cleanQ))
    );

    const matchedGuests = this.guests.filter(
      (g) =>
        `${g.firstName} ${g.lastName}`.toLowerCase().includes(cleanQ) ||
        g.phone.toLowerCase().includes(cleanQ) ||
        g.email.toLowerCase().includes(cleanQ) ||
        (g.currentRoomNumber && g.currentRoomNumber.toLowerCase().includes(cleanQ))
    );

    const matchedReservations = this.reservations.filter(
      (res) =>
        res.id.toLowerCase().includes(cleanQ) ||
        res.guestName.toLowerCase().includes(cleanQ) ||
        res.guestPhone.toLowerCase().includes(cleanQ) ||
        (res.roomNumber && res.roomNumber.toLowerCase().includes(cleanQ)) ||
        res.status.toLowerCase().includes(cleanQ)
    );

    return {
      rooms: matchedRooms.slice(0, 8),
      guests: matchedGuests.slice(0, 8),
      reservations: matchedReservations.slice(0, 8),
    };
  }

  // KPIs
  public getKPIs(): HotelKPIs {
    const total = this.rooms.length;
    const occupied = this.rooms.filter((r) => r.status === 'Occupied').length;
    const available = this.rooms.filter((r) => r.status === 'Available').length;
    const cleaning = this.rooms.filter((r) => r.status === 'Cleaning').length;
    const maintenance = this.rooms.filter((r) => r.status === 'Maintenance').length;
    const outOfService = this.rooms.filter((r) => r.status === 'Out of Service').length;

    const occupancyRate = total > 0 ? Math.round((occupied / total) * 100) : 0;

    // Today's date (local context 2026-08-22)
    const todayStr = '2026-08-22';
    const todaysArrivals = this.reservations.filter(
      (r) => r.checkInDate === todayStr && (r.status === 'Confirmed' || r.status === 'Checked In')
    ).length;

    const todaysDepartures = this.reservations.filter(
      (r) => r.checkOutDate === todayStr && (r.status === 'Checked In' || r.status === 'Checked Out')
    ).length;

    const inHouseGuestsCount = this.guests.filter((g) => g.stayStatus === 'Active Stay').length;

    // Guest satisfaction: verified 4.8 / 5.0
    const guestSatisfaction = 4.8;

    const todaysRevenueEstimate = this.rooms
      .filter((r) => r.status === 'Occupied')
      .reduce((sum, r) => sum + r.rate, 0);

    return {
      occupancyRate,
      occupiedRooms: occupied,
      totalRooms: total,
      todaysArrivals,
      todaysDepartures,
      availableRooms: available,
      cleaningRooms: cleaning,
      maintenanceRooms: maintenance,
      outOfServiceRooms: outOfService,
      guestSatisfaction,
      inHouseGuestsCount,
      todaysRevenueEstimate,
    };
  }
}

export const db = new HotelDatabase();
