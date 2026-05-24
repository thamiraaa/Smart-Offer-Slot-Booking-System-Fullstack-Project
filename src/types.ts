/**
 * Smart Offer Slot Booking System
 * Shared TypeScript Models and Interfaces
 */

export interface BusinessProfile {
  id: string;
  name: string;
  type: 'Restaurant' | 'Gym' | 'Salon' | 'Clinic' | 'Coaching' | 'Turf' | 'Other';
  ownerName: string;
  phoneNumber: string;
  email: string;
  address: string;
  city: string;
  openingTime: string; // e.g., "09:00"
  closingTime: string; // e.g., "21:00"
  logoUrl?: string;
}

export type OfferStatus = 'Draft' | 'Active' | 'Paused' | 'Expired' | 'Cancelled';

export interface Offer {
  id: string;
  title: string;
  description: string;
  category: string;
  originalPrice: number;
  offerPrice: number;
  discountPercentage: number;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  totalCapacity: number;
  maxBookingPerCustomer: number;
  termsAndConditions: string;
  status: OfferStatus;
  couponCode?: string;
  couponDiscount?: number; // percentage or flat amount
}

export type SlotStatus = 'Available' | 'Full' | 'Closed' | 'Expired' | 'Cancelled';

export interface OfferSlot {
  id: string;
  offerId: string;
  slotDate: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  capacity: number;
  bookedCount: number;
  availableCount: number;
  status: SlotStatus;
}

export type BookingStatus = 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed' | 'No Show';
export type PaymentStatus = 'Unpaid' | 'Paid' | 'Refunded';

export interface Booking {
  id: string;
  referenceNumber: string; // e.g., "SO-839210"
  offerId: string;
  slotId: string;
  customerName: string;
  phoneNumber: string;
  email?: string;
  numberOfPeople: number;
  specialNote?: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  bookingDate: string; // ISO datetime
  couponApplied?: string;
  totalPaid: number;
  // Denormalized/Join helper properties for display
  offerTitle?: string;
  businessName?: string;
  slotDate?: string;
  slotTime?: string;
}

export interface DashboardSummary {
  totalOffers: number;
  activeOffers: number;
  totalBookings: number;
  todaysBookings: number;
  totalCapacity: number;
  bookedSeats: number;
  availableSeats: number;
  conversionRate: number; // percentage of bookings vs offer views or available slots
  bookingsOverTime: Array<{ date: string; bookings: number; revenue: number }>;
  industryDistribution: Array<{ name: string; value: number }>;
  recentBookings: Booking[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'Admin' | 'Customer';
  token?: string;
}

export interface NotificationLog {
  id: string;
  timestamp: string;
  type: 'booking_received' | 'booking_confirmed' | 'booking_cancelled' | 'status_changed';
  message: string;
  referenceNumber?: string;
}
