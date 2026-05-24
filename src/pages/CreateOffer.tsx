import React, { useState, useEffect } from 'react';
import { 
  Percent, 
  ArrowLeft, 
  Clock, 
  CheckCircle, 
  Calendar, 
  Coins, 
  Plus, 
  Trash, 
  Layers,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { Offer, OfferSlot } from '../types';

interface CreateProps {
  editOfferId?: string | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function CreateOffer({ editOfferId, onSuccess, onCancel }: CreateProps) {
  const isEditMode = !!editOfferId;
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [originalPrice, setOriginalPrice] = useState('100');
  const [offerPrice, setOfferPrice] = useState('49');
  const [startDate, setStartDate] = useState('2026-05-24');
  const [endDate, setEndDate] = useState('2026-06-05');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');
  const [totalCapacity, setTotalCapacity] = useState('20');
  const [maxBookingPerCustomer, setMaxBookingPerCustomer] = useState('2');
  const [termsAndConditions, setTermsAndConditions] = useState('Please arrive 10 minutes prior to your booking. Cancellation available before 2 hours.');
  const [status, setStatus] = useState<'Draft' | 'Active' | 'Paused' | 'Expired' | 'Cancelled'>('Active');
  
  // Coupon parameters
  const [couponCode, setCouponCode] = useState('DMOSTART');
  const [couponDiscount, setCouponDiscount] = useState('5');

  // Multi-slot definitions loaded or generated
  const [slotsList, setSlotsList] = useState<Array<{ id?: string; startTime: string; endTime: string; capacity: number }>>([
    { startTime: '10:00', endTime: '12:00', capacity: 10 },
    { startTime: '14:00', endTime: '16:00', capacity: 10 }
  ]);

  useEffect(() => {
    if (isEditMode && editOfferId) {
      setLoading(true);
      setError(null);
      
      const fetchOfferDetails = async () => {
        try {
          const resp = await fetch(`/api/offers/${editOfferId}`);
          if (!resp.ok) throw new Error("Could not load details");
          const o = await resp.json();
          
          setTitle(o.title);
          setDescription(o.description);
          setCategory(o.category);
          setOriginalPrice(o.originalPrice.toString());
          setOfferPrice(o.offerPrice.toString());
          setStartDate(o.startDate);
          setEndDate(o.endDate);
          setStartTime(o.startTime);
          setEndTime(o.endTime);
          setTotalCapacity(o.totalCapacity.toString());
          setMaxBookingPerCustomer(o.maxBookingPerCustomer.toString());
          setTermsAndConditions(o.termsAndConditions);
          setStatus(o.status);
          setCouponCode(o.couponCode || '');
          setCouponDiscount((o.couponDiscount || 0).toString());

          // Load corresponding slots
          const slotsResp = await fetch(`/api/offers/${editOfferId}/slots`);
          if (slotsResp.ok) {
            const list: OfferSlot[] = await slotsResp.json();
            setSlotsList(list.map(s => ({
              id: s.id,
              startTime: s.startTime,
              endTime: s.endTime,
              capacity: s.capacity
            })));
          }
        } catch (err: any) {
          setError("Failed to fetch initial edit payload from Express database.");
        } finally {
          setLoading(false);
        }
      };

      fetchOfferDetails();
    }
  }, [editOfferId, isEditMode]);

  // Validations & Pricing helper
  const discountPct = Number(originalPrice) > 0 
    ? Math.round(((Number(originalPrice) - Number(offerPrice)) / Number(originalPrice)) * 100) 
    : 0;

  const handleGenerateHourlySlots = () => {
    // Generate 2-hour blocks from startTime to endTime
    const startHour = parseInt(startTime.split(':')[0]);
    const endHour = parseInt(endTime.split(':')[0]);
    
    if (isNaN(startHour) || isNaN(endHour) || startHour >= endHour) {
      alert("Please ensure valid Start and End times first.");
      return;
    }

    const generated: Array<{ startTime: string; endTime: string; capacity: number }> = [];
    let current = startHour;
    const blockCap = Math.round(Number(totalCapacity) / 4) || 5;

    while (current + 2 <= endHour) {
      const sStr = current < 10 ? `0${current}:00` : `${current}:00`;
      const eStr = (current + 2) < 10 ? `0${current + 2}:00` : `${current + 2}:00`;
      generated.push({
        startTime: sStr,
        endTime: eStr,
        capacity: blockCap
      });
      current += 2;
    }

    setSlotsList(generated);
  };

  const handleAddCustomSlotRow = () => {
    setSlotsList([...slotsList, { startTime: '12:00', endTime: '14:00', capacity: 5 }]);
  };

  const handleRemoveSlotRow = (index: number) => {
    setSlotsList(slotsList.filter((_, idx) => idx !== index));
  };

  const handleSlotEdit = (index: number, field: string, value: any) => {
    const list = [...slotsList];
    list[index] = { ...list[index], [field]: value };
    setSlotsList(list);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    // Hard check validation
    const orig = Number(originalPrice);
    const offerPr = Number(offerPrice);

    if (isNaN(orig) || isNaN(offerPr)) {
      setError("Please supply numeric prices inside input blocks.");
      setSubmitting(false);
      return;
    }

    if (offerPr >= orig) {
      setError("Dynamic constraint breached: Offer Price must be less than standard Original Price.");
      setSubmitting(false);
      return;
    }

    if (slotsList.length === 0) {
      setError("Constraint breached: At least one slot timing definition must exist.");
      setSubmitting(false);
      return;
    }

    const payload = {
      title,
      description,
      category,
      originalPrice: orig,
      offerPrice: offerPr,
      startDate,
      endDate,
      startTime,
      endTime,
      totalCapacity: Number(totalCapacity),
      maxBookingPerCustomer: Number(maxBookingPerCustomer),
      termsAndConditions,
      status,
      couponCode: couponCode || undefined,
      couponDiscount: Number(couponDiscount) || 0
    };

    try {
      let offerId = editOfferId;
      
      if (isEditMode) {
        // Edit existing
        const editResp = await fetch(`/api/offers/${editOfferId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!editResp.ok) {
          const res = await editResp.json();
          throw new Error(res.error || "Failed to update offer");
        }
      } else {
        // Create new
        const createResp = await fetch('/api/offers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!createResp.ok) {
          const res = await createResp.json();
          throw new Error(res.error || "Failed to publish offer");
        }
        const createdOffer = await createResp.json();
        offerId = createdOffer.id;
      }

      // Sync slots definitions: POST to /api/slots for each slot
      // For a robust implementation, our in-memory DB will update listings
      // If edit mode, the backend deleted cascades or merges. Let's create slots that don't exist yet
      for (const sl of slotsList) {
        if (!sl.id) { // Only create if it's a new slot entry row
          await fetch('/api/slots', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              offerId,
              slotDate: startDate, // Anchor slot to startDate for local tracking
              startTime: sl.startTime,
              endTime: sl.endTime,
              capacity: sl.capacity
            })
          });
        }
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || "Something triggered an internal exception.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div id="create-loader" className="flex justify-center items-center py-20 text-slate-500 text-xs font-mono">
        LOADING INITIAL RECORD STATE...
      </div>
    );
  }

  return (
    <div id="create-offer-root" className="space-y-6">
      
      {/* Title */}
      <div id="create-header" className="flex items-center gap-3">
        <button
          onClick={onCancel}
          className="p-2 border border-slate-200 hover:bg-slate-50 hover:text-slate-800 rounded-xl transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            {isEditMode ? "Modify Live Offer Details" : "Publish Dynamic Deal Package"}
          </h2>
          <p className="text-xs text-slate-500">Provide pricing multipliers, terms, calendar scopes, and slots.</p>
        </div>
      </div>

      {error && (
        <div id="create-error-toast" className="p-4 bg-orange-50 border border-orange-100 rounded-2xl text-xs text-orange-700 font-medium">
          ⚠️ {error}
        </div>
      )}

      {/* Main Grid Form */}
      <form id="offer-definition-form" onSubmit={handleSubmitForm} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Basic Fields Forms */}
        <div className="lg:col-span-2 space-y-6 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900 border-b border-slate-50 pb-3 h-fit flex items-center gap-1.5">
            <Layers className="h-4 w-4 text-indigo-600" />
            <span>Offer Parameters & Text Descriptions</span>
          </h3>

          <div className="space-y-4">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">Offer Campaign Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Weekend Elite Tennis Turf Booking Special Promo"
                className="w-full bg-slate-50 border border-gray-200 rounded-xl py-2.5 px-4 text-xs font-medium focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-800"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">Detailed Package Outline</label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detail what is included (amenities, drinks, spa therapist special certifications...)"
                className="w-full bg-slate-50 border border-gray-200 rounded-xl py-2.5 px-4 text-xs font-medium focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-800"
              />
            </div>

            {/* Price section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">Original Base Price ($)</label>
                <div className="relative">
                  <Coins className="absolute left-3.5 top-3 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="number"
                    required
                    min="1"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">Offer Campaign Price ($)</label>
                <div className="relative">
                  <Coins className="absolute left-3.5 top-3 h-3.5 w-3.5 text-indigo-500" />
                  <input
                    type="number"
                    required
                    min="1"
                    value={offerPrice}
                    onChange={(e) => setOfferPrice(e.target.value)}
                    className="w-full bg-slate-50 border border-indigo-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold text-indigo-700 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all bg-indigo-50/20"
                  />
                </div>
              </div>

              {/* Autopooled discount visualizer bar */}
              <div className="flex flex-col justify-end">
                <div className="bg-emerald-50 border border-emerald-100 p-2.5 rounded-xl flex items-center justify-between text-xs">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Discount Rate:</span>
                  <span className="font-bold text-emerald-700">{discountPct > 0 ? `${discountPct}% OFF` : '0%'}</span>
                </div>
              </div>
            </div>

            {/* Campaign boundaries date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-slate-400" />
                  <span>Start Validity Day</span>
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl py-2.5 px-4 text-xs font-medium text-slate-800"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-rose-400" />
                  <span>Expiration Day</span>
                </label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl py-2.5 px-4 text-xs font-medium text-slate-800"
                />
              </div>
            </div>

            {/* operational times */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block flex items-center gap-1">
                  <Clock className="h-3 w-3 text-slate-400" />
                  <span>Operational Opening Hour</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 09:00"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl py-2.5 px-4 text-xs font-mono font-medium text-slate-800"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block flex items-center gap-1">
                  <Clock className="h-3 w-3 text-slate-400" />
                  <span>Operational Closing Hour</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 21:00"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl py-2.5 px-4 text-xs font-mono font-medium text-slate-800"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">Terms & Rules</label>
              <textarea
                rows={2}
                value={termsAndConditions}
                onChange={(e) => setTermsAndConditions(e.target.value)}
                placeholder="Terms and Conditions..."
                className="w-full bg-slate-50 border border-gray-200 rounded-xl py-2 px-4 text-xs font-medium text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Categories, Limits & Automatic Slots Setup */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 border-b border-slate-50 pb-3 flex items-center gap-1.5">
              <Percent className="h-4 w-4 text-indigo-600" />
              <span>Category & Booking Safetys</span>
            </h3>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">Faceted Search Category</label>
              <input
                type="text"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g., Spa, Gym, Sports, Coaching"
                className="w-full bg-slate-50 border border-gray-200 rounded-xl py-2 px-4 text-xs font-medium text-slate-800"
              />
            </div>

            {/* Total Capacity Overall */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">Whole Capacity Pool (Seats)</label>
              <input
                type="number"
                required
                min="1"
                value={totalCapacity}
                onChange={(e) => setTotalCapacity(e.target.value)}
                className="w-full bg-slate-50 border border-gray-200 rounded-xl py-2 px-4 text-xs font-medium text-slate-800"
              />
            </div>

            {/* Max booking per phone check */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block flex items-center gap-1">
                <span>Max Capacity Seat per Customer</span>
                <HelpCircle className="h-3.5 w-3.5 text-slate-400 cursor-help" title="Anti-spam booking limit per customer telephone number" />
              </label>
              <input
                type="number"
                required
                min="1"
                value={maxBookingPerCustomer}
                onChange={(e) => setMaxBookingPerCustomer(e.target.value)}
                className="w-full bg-slate-50 border border-gray-200 rounded-xl py-2 px-4 text-xs font-medium text-slate-800"
              />
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">Campaign Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-slate-50 border border-gray-200 rounded-xl py-2.5 px-4 text-xs font-semibold text-slate-800 cursor-pointer"
              >
                <option value="Active">Active (Publish live)</option>
                <option value="Draft">Draft (Only Admin views)</option>
                <option value="Paused">Paused (Temporary hold)</option>
                <option value="Cancelled">Cancelled (Flagged null)</option>
              </select>
            </div>

            {/* Custom Promo Coupons (Bonus Support) */}
            <div className="border-t border-slate-100 pt-4 space-y-3">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 select-none">
                <Sparkles className="h-3.5 w-3.5 text-indigo-500 animate-pulse" />
                <span>Coupon Promo integration</span>
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-600">Promo Code</label>
                  <input
                    type="text"
                    placeholder="e.g. DETOX5"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl py-1.5 px-2.5 text-xs font-mono font-bold text-indigo-700"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-600">Off Flat ($)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="5"
                    value={couponDiscount}
                    onChange={(e) => setCouponDiscount(e.target.value)}
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl py-1.5 px-2.5 text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Time Slot generator section */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-50 pb-2">
              <h4 className="text-xs font-semibold text-slate-950">Configure Slots</h4>
              <button
                type="button"
                onClick={handleGenerateHourlySlots}
                className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100/60 px-2 py-1 rounded transition-colors cursor-pointer"
              >
                Auto-Split Hours
              </button>
            </div>

            <p className="text-[11px] text-slate-500">Each offer requires corresponding timing booking intervals.</p>

            <div id="slots-checklist" className="space-y-2 max-h-[160px] overflow-y-auto">
              {slotsList.map((slot, index) => (
                <div key={index} className="flex items-center gap-1.5 bg-slate-50 p-2 border border-slate-100/60 rounded-xl text-xs">
                  <input
                    type="text"
                    required
                    value={slot.startTime}
                    onChange={(e) => handleSlotEdit(index, 'startTime', e.target.value)}
                    placeholder="10:00"
                    className="w-14 bg-white border rounded text-center text-[11.5px] font-mono py-0.5"
                  />
                  <span className="text-slate-400 font-mono text-[10px]">to</span>
                  <input
                    type="text"
                    required
                    value={slot.endTime}
                    onChange={(e) => handleSlotEdit(index, 'endTime', e.target.value)}
                    placeholder="12:00"
                    className="w-14 bg-white border rounded text-center text-[11.5px] font-mono py-0.5"
                  />
                  <input
                    type="number"
                    required
                    min="1"
                    title="Capacity seat size"
                    value={slot.capacity}
                    onChange={(e) => handleSlotEdit(index, 'capacity', Number(e.target.value))}
                    className="w-10 bg-white border rounded text-center py-0.5"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveSlotRow(index)}
                    className="p-1 hover:bg-rose-50 rounded text-rose-500 cursor-pointer"
                  >
                    <Trash className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddCustomSlotRow}
              className="w-full py-2 border-2 border-dashed border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-300 rounded-xl text-[11px] font-bold text-center flex items-center justify-center gap-1 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add custom slot</span>
            </button>
          </div>

          <div id="form-action-blocks" className="flex items-center gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="w-1/2 text-center py-3 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-2xl text-xs font-bold cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="w-1/2 flex items-center justify-center bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-2xl text-xs tracking-wide transition-all shadow-md cursor-pointer disabled:bg-slate-500"
            >
              {submitting ? "Publishing deal..." : isEditMode ? "Save Changes" : "Publish Deal"}
            </button>
          </div>

        </div>

      </form>
    </div>
  );
}
