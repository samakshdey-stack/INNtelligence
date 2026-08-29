export type RoomStatus = 'Available' | 'Occupied' | 'Cleaning' | 'Maintenance' | 'Out of Service';

export type VIPTier = 'Regular' | 'Silver' | 'Gold' | 'Black Diamond' | 'Platinum';

export type RoomType =
  | 'Deluxe King'
  | 'Deluxe Twin'
  | 'Executive Club'
  | 'Heritage Suite'
  | 'Presidential Suite'
  | 'Deluxe King Room'
  | 'Executive Suite'
  | 'Club Twin Room'
  | 'Superior Queen Room'
  | string;

export type ReservationStatus =
  | 'Confirmed'
  | 'Checked In'
  | 'Checked Out'
  | 'Cancelled'
  | 'No Show';

export type BookingChannel =
  | 'Direct Web'
  | 'Phone Direct'
  | 'Direct Front Desk'
  | 'Corporate Desk'
  | 'MakeMyTrip'
  | 'Booking.com'
  | 'Agoda'
  | 'Hotel Website'
  | string;

export type StayStatus = 'Active Stay' | 'Upcoming' | 'Checked Out' | 'No Active Stay';

export type UserRole = 'General Manager' | 'Front Desk' | 'Owner' | 'Department Head';

export interface Property {
  id: string;
  name: string;
  location: string;
  totalRooms: number;
  currency: string;
  timezone: string;
  tagline: string;
}

export interface Room {
  id: string;
  roomNumber: string;
  floor: number;
  roomType: RoomType;
  rate: number;
  status: RoomStatus;
  currentGuestId?: string;
  currentGuestName?: string;
  currentReservationId?: string;
  maintenanceReason?: string;
  lastCleanedAt?: string;
  features: string[];
}

export interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  nationality: string;
  idProofType?: string;
  idProofNumber?: string;
  vipStatus: 'Regular' | 'Silver' | 'Gold' | 'Black Diamond';
  stayStatus: StayStatus;
  currentRoomNumber?: string;
  currentReservationId?: string;
  checkInDate?: string;
  checkOutDate?: string;
  totalStays: number;
  notes?: string;
  createdAt: string;
}

export interface Reservation {
  id: string;
  guestId: string;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  propertyId: string;
  roomId?: string;
  roomNumber?: string;
  roomType: RoomType;
  bookingChannel: BookingChannel;
  bookingDate: string;
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  children: number;
  rate: number;
  totalAmount: number;
  paidAmount: number;
  status: ReservationStatus;
  specialRequests?: string;
  createdAt: string;
}

export type EventType =
  | 'GUEST_CHECKED_IN'
  | 'GUEST_CHECKED_OUT'
  | 'RESERVATION_CREATED'
  | 'RESERVATION_CANCELLED'
  | 'ROOM_MARKED_CLEAN'
  | 'ROOM_MAINTENANCE'
  | 'GUEST_CREATED'
  | 'ROOM_ASSIGNED'
  | 'ROOM_STATUS_CHANGED';

export interface OperationalEvent {
  id: string;
  propertyId: string;
  eventType: EventType;
  title: string;
  description: string;
  entityType: 'Room' | 'Guest' | 'Reservation' | 'Housekeeping';
  entityId: string;
  performedBy: string;
  timestamp: string;
  timeFormatted: string;
  metadata: {
    room_number?: string;
    guest_name?: string;
    reservation_id?: string;
    reason?: string;
    channel?: string;
    [key: string]: any;
  };
}

export interface HotelKPIs {
  occupancyRate: number;
  occupiedRooms: number;
  totalRooms: number;
  todaysArrivals: number;
  todaysDepartures: number;
  availableRooms: number;
  cleaningRooms: number;
  maintenanceRooms: number;
  outOfServiceRooms: number;
  guestSatisfaction: number | null; // null if no data
  inHouseGuestsCount: number;
  todaysRevenueEstimate: number;
}

export interface SearchResult {
  rooms: Room[];
  guests: Guest[];
  reservations: Reservation[];
}

export interface CheckInPayload {
  guestId?: string;
  newGuest?: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    nationality: string;
    idProofType?: string;
    idProofNumber?: string;
  };
  reservationId?: string;
  roomId: string;
  performedBy?: string;
  notes?: string;
}

export interface CheckOutPayload {
  reservationId: string;
  roomId: string;
  performedBy?: string;
  folioSettled?: boolean;
}

export interface CreateReservationPayload {
  guestId?: string;
  newGuest?: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    nationality: string;
  };
  roomId?: string;
  roomType: RoomType;
  bookingChannel: BookingChannel;
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  children: number;
  rate: number;
  specialRequests?: string;
  performedBy?: string;
}

export interface AIQueryResponse {
  query: string;
  answer: string;
  languageDetected: 'English' | 'Hindi' | 'Hinglish';
  confidence: number;
  relatedEntities?: {
    rooms?: string[];
    guests?: string[];
    reservations?: string[];
  };
  suggestedFollowUps?: string[];
  timestamp: string;
}

export interface MonthlyRevenueData {
  month: string;
  shortMonth: string;
  roomRevenue: number; // in ₹ Lakhs
  foodBeverageRevenue: number; // in ₹ Lakhs
  banquetSpaRevenue: number; // in ₹ Lakhs
  totalRevenue: number; // in ₹ Lakhs
  budgetRevenue: number; // in ₹ Lakhs
  occupancyRate: number; // %
  adr: number; // Average Daily Rate in ₹
  revPar: number; // RevPAR in ₹
  bookingsCount: number;
}

export interface RoomCategoryBookingStat {
  category: string;
  bookings: number;
  percentage: number;
  revenue: number; // in ₹
  color: string;
  avgStayNights: number;
  occupancyShare: number; // %
}

export interface RoomProblemStat {
  roomCategory: string;
  hvacIssues: number;
  plumbingIssues: number;
  wifiAvIssues: number;
  keycardLockIssues: number;
  housekeepingIssues: number;
  totalProblems: number;
  resolutionRate: number; // %
}

export interface CustomerProblemStat {
  problemType: string;
  count: number;
  percentage: number;
  color: string;
  avgResolutionMins: number;
  severity: 'High' | 'Medium' | 'Low';
  primaryDepartment: string;
}

export interface GuestFeedbackRecord {
  id: string;
  guestName: string;
  roomNumber: string;
  roomType: string;
  stayDate: string;
  rating: number; // 1 to 5
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  category: string;
  comment: string;
  status: 'Resolved' | 'In-Progress' | 'Pending Dispatch';
  assignedStaff: string;
  timestamp: string;
  actionTaken?: string;
}
