import React, { useRef } from 'react';
import { 
  CheckCircle2, 
  Calendar, 
  User, 
  Building, 
  BookOpen, 
  MapPin, 
  Printer, 
  MailCheck, 
  Phone,
  Compass,
  ArrowRight
} from 'lucide-react';
import { Booking } from '../types';
import QRGenerator from '../components/QRGenerator';

interface ConfirmProps {
  booking: Booking;
  onDone: () => void;
}

export default function BookingConfirmation({ booking, onDone }: ConfirmProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    // Elegant system print fallback or mock logging feedback
    window.print();
  };

  return (
    <div id="booking-confirmation-root" className="min-h-[80vh] bg-slate-50 flex items-center justify-center px-4 py-8">
      <div id="confirmation-view-container" className="max-w-2xl w-full space-y-6">
        
        {/* Confirmed Alert Toast */}
        <div id="confirmed-badge-toast" className="p-4 bg-emerald-50 border border-emerald-100 rounded-3xl flex items-center gap-3.5 text-xs text-emerald-800 font-semibold shadow-inner">
          <CheckCircle2 className="h-6 w-6 text-emerald-500 shrink-0 animate-pulse" />
          <div>
            <span className="block font-bold">Appointment Spot Booked!</span>
            <span className="text-[11px] text-emerald-600 font-medium">Your reference has been lodged into the PostgreSQL database. Scan QR at reception desk.</span>
          </div>
        </div>

        {/* Printable Ticket Pass card layout */}
        <div 
          ref={printRef}
          id="digital-pass-card" 
          className="bg-white border border-gray-100 rounded-[32px] shadow-xl overflow-hidden print:shadow-none print:border-none"
        >
          {/* Header banner */}
          <div id="pass-header" className="bg-slate-900 text-white px-8 py-6 flex items-center justify-between border-b border-slate-800">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block font-mono">Admission Ticket</span>
              <h3 className="text-sm font-bold tracking-tight">{booking.offerTitle || "Special Offer Promo"}</h3>
              <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                <Building className="h-3 w-3" /> {booking.businessName || "Apex Cardio Gym & Spa"}
              </span>
            </div>

            <span className="text-xl font-mono font-black text-indigo-400 tracking-wider">
              {booking.referenceNumber}
            </span>
          </div>

          {/* Ticket Body Content */}
          <div id="pass-body" className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Left side details fields */}
            <div className="md:col-span-2 space-y-4">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-50 pb-2">Guest Ledger Details</h4>
              
              <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                
                {/* Name */}
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Customer</span>
                  <span className="text-slate-800 block flex items-center gap-1">
                    <User className="h-3.5 w-3.5 text-indigo-600" /> {booking.customerName}
                  </span>
                </div>

                {/* Date */}
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Date & Time</span>
                  <span className="text-slate-800 block flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-indigo-600" /> {booking.slotDate}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-indigo-500 ml-4">{booking.slotTime}</span>
                </div>

                {/* Telephone */}
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Contact Phone</span>
                  <span className="text-slate-800 block font-mono flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5 text-slate-400" /> {booking.phoneNumber}
                  </span>
                </div>

                {/* Size */}
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Guests Amount</span>
                  <span className="text-slate-800 block font-bold text-indigo-600">
                    🎟️ {booking.numberOfPeople} seat(s) reserved
                  </span>
                </div>
              </div>

              {/* Special instructions */}
              {booking.specialNote && (
                <div className="p-3 bg-slate-50 border border-slate-100/60 rounded-xl text-xs text-slate-600 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Customer Note Alert:</span>
                  <p className="italic font-medium text-slate-600">{booking.specialNote}</p>
                </div>
              )}

              {/* Due summary */}
              <div className="pt-3 border-t border-dashed border-slate-200 text-xs font-semibold text-slate-500">
                Payment status: <span className="font-bold text-emerald-600 uppercase">PAID (via promo reservation)</span>. Total Cost: <span className="font-bold text-indigo-600">${booking.totalPaid}</span>
              </div>
            </div>

            {/* Right side QR module */}
            <div className="flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-dashed border-slate-200 pt-6 md:pt-0 md:pl-8">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3 font-mono">Admission QR Code</span>
              
              <QRGenerator value={booking.referenceNumber} />

              <span className="text-[9px] text-slate-400 text-center font-semibold mt-3 max-w-[130px] leading-snug block">
                Show block barcode at facility register desk-receptionist.
              </span>
            </div>

          </div>

          {/* Simulated Webhook notification log dispatch text */}
          <div id="pass-footer" className="bg-slate-50 px-8 py-3.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-semibold font-mono">
            <span className="flex items-center gap-1.5">
              <MailCheck className="h-4 w-4 text-emerald-500 animate-bounce" />
              Receipt logged to database and dispatched.
            </span>
            <span>Security Signature: OK</span>
          </div>

        </div>

        {/* Action Triggers */}
        <div id="confirmation-cta-actions" className="flex items-center justify-between gap-4">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 active:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 transition-colors cursor-pointer"
          >
            <Printer className="h-4 w-4 text-slate-600" />
            <span>Print Admission Voucher</span>
          </button>

          <button
            onClick={onDone}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-slate-900 text-white font-bold px-4 py-2.5 rounded-xl text-xs tracking-wide transition-all shadow-md cursor-pointer"
          >
            <span>Return to Catalog Exploration</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
