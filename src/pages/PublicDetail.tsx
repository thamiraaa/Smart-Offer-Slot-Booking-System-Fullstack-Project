import React, { useState, useEffect } from 'react';
import { 
  Percent, 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle, 
  CalendarClock, 
  User, 
  Phone, 
  Mail, 
  Users, 
  ChevronRight, 
  CreditCard,
  MapPin,
  HelpCircle,
  FileText,
  Activity,
  Tag
} from 'lucide-react';
import { Offer, OfferSlot, BusinessProfile, Booking } from '../types';

interface DetailProps {
  offerId: string;
  onBack: () => void;
  onBookingSuccess: (booking: Booking) => void;
}

export default function PublicDetail({ offerId, onBack, onBookingSuccess }: DetailProps) {
  const [offer, setOffer] = useState<Offer | null>(null);
  const [business, setBusiness] = useState<BusinessProfile | null>(null);
  const [slots, setSlots] = useState<OfferSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selected Slot states
  const [selectedSlotId, setSelectedSlotId] = useState<string>('');
  
  // Customer Booking form states
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [numberOfPeople, setNumberOfPeople] = useState('1');
  const [specialNote, setSpecialNote] = useState('');
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponFeedback, setCouponFeedback] = useState('');

  const [bookingLoading, setBookingLoading] = useState(false);

  const loadData = async () => {
    try {
      const offerResp = await fetch(`/api/offers/${offerId}`);
      if (!offerResp.ok) throw new Error("Offer not found");
      const offerData = await offerResp.json();
      setOffer(offerData);

      const bizResp = await fetch('/api/business');
      if (bizResp.ok) {
        const bizData = await bizResp.json();
        setBusiness(bizData);
      }

      const slotsResp = await fetch(`/api/offers/${offerId}/slots`);
      if (slotsResp.ok) {
        const slotsData = await slotsResp.json();
        setSlots(slotsData);
        // Auto select first available slot
        const available = slotsData.find((s: OfferSlot) => s.status === 'Available');
        if (available) {
          setSelectedSlotId(available.id);
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch deal particulars.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [offerId]);

  const handleApplyCoupon = () => {
    if (!offer) return;
    if (!couponCodeInput.trim()) {
      setCouponFeedback("Please enter a coupon code");
      return;
    }

    if (offer.couponCode && couponCodeInput.toUpperCase() === offer.couponCode.toUpperCase()) {
      setCouponApplied(true);
      setCouponFeedback(`Successfully Applied code! Subtracted $${offer.couponDiscount || 0}`);
    } else {
      setCouponApplied(false);
      setCouponFeedback("Invalid promo code for this offer campaign");
    }
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offer) return;
    if (!selectedSlotId) {
      setError("Please select a timing block first before checking out.");
      return;
    }

    setBookingLoading(true);
    setError(null);

    const activeSlot = slots.find(s => s.id === selectedSlotId);
    if (!activeSlot) {
      setError("Selected slot record mismatch exception.");
      setBookingLoading(false);
      return;
    }

    if (activeSlot.status === 'Full' || activeSlot.availableCount <= 0) {
      setError("This specific slot has reached its volume capacity.");
      setBookingLoading(false);
      return;
    }

    const payload = {
      offerId: offer.id,
      slotId: selectedSlotId,
      customerName,
      phoneNumber,
      email: email || undefined,
      numberOfPeople: Number(numberOfPeople),
      specialNote: specialNote || undefined,
      couponApplied: couponApplied ? couponCodeInput.toUpperCase() : undefined
    };

    try {
      const resp = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const resData = await resp.json();

      if (!resp.ok) {
        throw new Error(resData.error || "Failed to file dynamic reservation payload callback.");
      }

      onBookingSuccess(resData);
    } catch (err: any) {
      setError(err.message || "Something went wrong committing this booking.");
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div id="detail-loader" className="flex justify-center items-center py-24 text-slate-500 text-xs font-mono">
        RETRIEVING CAMPAIGN CONFIGURATION DATA...
      </div>
    );
  }

  if (error && !offer) {
    return (
      <div id="detail-error" className="p-6 bg-rose-50 border border-rose-100 rounded-2xl text-rose-700 max-w-xl mx-auto text-center mt-12">
        <AlertCircle className="h-10 w-10 text-rose-500 mx-auto mb-2" />
        <h4 className="font-bold">Offer Inaccessible</h4>
        <p className="text-xs text-rose-600 mt-1">{error}</p>
        <button onClick={onBack} className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold cursor-pointer">
          Back to Listings
        </button>
      </div>
    );
  }

  if (!offer) return null;

  // Calculators
  const guestsNum = Number(numberOfPeople);
  const rawCost = offer.offerPrice * guestsNum;
  const discountAmt = couponApplied ? (offer.couponDiscount || 0) : 0;
  const finalBill = Math.max(0, rawCost - discountAmt);

  return (
    <div id="portal-detail-root" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Back link */}
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-bold tracking-wide cursor-pointer py-1 block"
      >
        ← Return back to Booking Deals
      </button>

      {error && (
        <div id="detail-form-error" className="p-4 bg-orange-50 border border-orange-100 text-xs text-orange-700 font-medium rounded-2xl">
          ⚠️ {error}
        </div>
      )}

      {/* Detail Layout */}
      <div id="detail-layout" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns - Campaign info and slots grid selection */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Info Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold rounded-full uppercase tracking-wider block">
                {offer.category}
              </span>
              <span className="text-[11px] font-semibold text-slate-500">
                Validity: {offer.startDate} to {offer.endDate}
              </span>
            </div>

            <div className="space-y-2">
              <h2 className="text-lg md:text-2xl font-black text-slate-900 leading-snug tracking-tight">
                {offer.title}
              </h2>
              <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-normal">
                {offer.description}
              </p>
            </div>

            {/* Pricing Summary */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between flex-wrap gap-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">Special Exclusive Price</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-black text-indigo-600">${offer.offerPrice}</span>
                  <span className="text-xs text-slate-400 line-through font-semibold">${offer.originalPrice}</span>
                  <span className="text-xs font-bold text-emerald-600 uppercase bg-emerald-50 px-1.5 py-0.5 rounded">Save {offer.discountPercentage}% OFF</span>
                </div>
              </div>

              {business && (
                <div className="text-right text-xs">
                  <span className="font-semibold block text-slate-800">🏢 Managed by:</span>
                  <span className="text-slate-500">{business.name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Interactive slots selection grid */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="border-b border-slate-50 pb-3">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                <CalendarClock className="h-4.5 w-4.5 text-indigo-600" />
                <span>Select Appointment Timing Block</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Pick one of the merchant's predefined slots matching your availability calendar.</p>
            </div>

            {slots.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                This promotional campaign has no available scheduling blocks at this moment.
              </div>
            ) : (
              <div id="slots-picker-grid" className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {slots.map((s) => {
                  const isFull = s.status === 'Full' || s.availableCount <= 0;
                  const isSelected = selectedSlotId === s.id;
                  
                  return (
                    <div
                      key={s.id}
                      onClick={() => !isFull && setSelectedSlotId(s.id)}
                      className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex justify-between items-center ${
                        isFull ? 'bg-slate-50 border-slate-200/60 opacity-55 cursor-not-allowed' :
                        isSelected ? 'bg-indigo-50/40 border-indigo-600 ring-2 ring-indigo-600/10' :
                        'bg-white border-slate-100 hover:border-slate-300'
                      }`}
                    >
                      <div className="space-y-1">
                        <span className={`text-xs font-mono font-bold block ${isSelected ? 'text-indigo-600' : 'text-slate-900'}`}>
                          ⏰ {s.startTime} - {s.endTime}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-semibold">Session: {s.slotDate}</span>
                      </div>

                      <div className="text-right">
                        {isFull ? (
                          <span className="text-[10px] font-bold text-orange-600 px-1.5 py-0.5 bg-orange-50 rounded-full border border-orange-100 uppercase">Waitlist</span>
                        ) : (
                          <>
                            <span className="text-[10px] font-bold text-emerald-700 px-1.5 py-0.5 bg-emerald-50 rounded-full border border-emerald-100 uppercase tracking-wider block">Space ok</span>
                            <span className="text-[9.5px] text-slate-400 block font-mono mt-1 font-semibold">{s.availableCount} available</span>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Terms / Info */}
          <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 text-xs text-slate-600 space-y-2">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-indigo-600" />
              Campaign Guidelines & Terms Check:
            </h4>
            <div className="leading-relaxed whitespace-pre-line font-medium text-slate-600">
              {offer.termsAndConditions}
            </div>
            {business && (
              <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-200/60 font-semibold text-slate-700">
                <MapPin className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                <span>Location: {business.address}, {business.city} • Open: {business.openingTime} to {business.closingTime}</span>
              </div>
            )}
          </div>

        </div>

        {/* Right Columns - Booking checkout forms */}
        <div id="booking-checkout-container">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-lg sticky top-24 space-y-6">
            <div className="border-b border-slate-50 pb-3 flex flex-col gap-0.5">
              <h3 className="text-sm font-bold text-slate-950">Filing Reservation Appointment</h3>
              <span className="text-[10.5px] font-semibold text-slate-500">Provide verified contact details to receive scannable tickets.</span>
            </div>

            <form id="public-booking-form" onSubmit={handleCreateBooking} className="space-y-4">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">Your Real Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="David Sterling"
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-800"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block flex items-center gap-1">
                  <span>Contact Phone Number</span>
                  <HelpCircle className="h-3.5 w-3.5 text-slate-400 cursor-help" title="Input phone which determines max seat duplicate bookings boundaries check." />
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-800"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">Receipt Email (Optional)</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="david.sterling@gmail.com"
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium focus:outline-none text-slate-800"
                  />
                </div>
              </div>

              {/* Number of People */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">Occupancy Reservation Size</label>
                <div className="relative">
                  <Users className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="number"
                    required
                    min="1"
                    max={offer.maxBookingPerCustomer}
                    value={numberOfPeople}
                    onChange={(e) => setNumberOfPeople(e.target.value)}
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold text-slate-850"
                  />
                </div>
                <span className="text-[10px] font-semibold text-slate-400 block tracking-tight">Campaign limit: max {offer.maxBookingPerCustomer} seats per caller.</span>
              </div>

              {/* Special Note */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">Personalized Requirements Note (Optional)</label>
                <textarea
                  rows={2}
                  value={specialNote}
                  onChange={(e) => setSpecialNote(e.target.value)}
                  placeholder="Allergies, wheelchair access, physical strain recovery guidelines..."
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl py-2 px-3 text-xs font-medium text-slate-850"
                />
              </div>

              {/* Coupon Codes System */}
              {offer.couponCode && (
                <div className="pt-2 border-t border-slate-100 space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 block">Apply Campaign Promo Code</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder={`e.g. ${offer.couponCode}`}
                      value={couponCodeInput}
                      onChange={(e) => setCouponCodeInput(e.target.value)}
                      className="w-full bg-slate-50 border border-gray-200 rounded-xl py-2 px-3 text-xs font-mono font-bold text-slate-800 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                  {couponFeedback && (
                    <span className={`text-[10px] font-semibold block ${couponApplied ? 'text-emerald-600' : 'text-rose-500'}`}>
                      {couponApplied ? "✓ " : "✗ "}{couponFeedback}
                    </span>
                  )}
                </div>
              )}

              {/* Financial Calculation summary */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4.5 space-y-2 text-xs">
                <div className="flex justify-between font-semibold text-slate-600">
                  <span>Unit Special Deal:</span>
                  <span>${offer.offerPrice} x {guestsNum}</span>
                </div>
                {couponApplied && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Exclusive Coupon Off:</span>
                    <span>-${offer.couponDiscount || 0}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-slate-900 border-t border-slate-200/60 pt-2 text-sm">
                  <span>Amount Due At Facility:</span>
                  <span className="text-indigo-600 text-base font-black">${finalBill}</span>
                </div>
              </div>

              {/* Action */}
              <button
                type="submit"
                disabled={bookingLoading}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-slate-900 hover:scale-[1.01] text-white font-extrabold py-3.5 rounded-2xl text-xs tracking-wide transition-all shadow-md shadow-indigo-600/15 cursor-pointer disabled:bg-slate-500"
              >
                {bookingLoading ? (
                  <span>Securing slot spaces...</span>
                ) : (
                  <>
                    <CreditCard className="h-4.5 w-4.5" />
                    <span>Confirm Slot & Get Ticket</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

      </div>

    </div>
  );
}
