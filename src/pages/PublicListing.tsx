import React, { useState, useEffect } from 'react';
import { 
  Percent, 
  Search, 
  MapPin, 
  Clock, 
  Tag, 
  Bookmark, 
  Activity, 
  Compass, 
  CalendarDays,
  ShieldCheck,
  Building,
  AlertOctagon,
  Flame,
  ArrowRight
} from 'lucide-react';
import { Offer, OfferSlot, BusinessProfile } from '../types';

interface ListingProps {
  onSelectOffer: (id: string) => void;
}

// Countdown Sub-Component (Fulfills: Bonus Feature "Countdown timer")
function CountdownTimer({ expiryDate }: { expiryDate: string }) {
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    const calculateTime = () => {
      // Calculate delta to expiryDate (YYYY-MM-DD or ISO)
      const now = new Date();
      const target = new Date(expiryDate + "T23:59:59");
      const delta = target.getTime() - now.getTime();

      if (delta <= 0) {
        setTimeLeft(null);
        return;
      }

      const totalSeconds = Math.floor(delta / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      setTimeLeft({ hours, minutes, seconds });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [expiryDate]);

  if (!timeLeft) {
    return (
      <span className="text-[10px] font-bold text-rose-500 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-full uppercase tracking-wider block">
        Campaign Expired
      </span>
    );
  }

  return (
    <div className="flex items-center gap-1.5 text-rose-600 font-mono text-[10.5px] font-bold bg-rose-50 border border-rose-100 px-2.5 py-0.5 rounded-full">
      <Flame className="h-3.5 w-3.5 text-rose-500 animate-pulse" />
      <span>{timeLeft.hours}h : {timeLeft.minutes}m : {timeLeft.seconds}s</span>
    </div>
  );
}

export default function PublicListing({ onSelectOffer }: ListingProps) {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [business, setBusiness] = useState<BusinessProfile | null>(null);
  const [slotsMap, setSlotsMap] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [priceRange, setPriceRange] = useState('200');
  const [availableOnly, setAvailableOnly] = useState(false);

  const loadData = async () => {
    try {
      const bizResp = await fetch('/api/business');
      if (bizResp.ok) {
        const bus = await bizResp.json();
        setBusiness(bus);
      }

      const offersResp = await fetch('/api/offers');
      if (offersResp.ok) {
        const list = await offersResp.json();
        // Filter out drafts for customer screen
        setOffers(list.filter((o: Offer) => o.status !== 'Draft' && o.status !== 'Cancelled'));
      }

      const slotsResp = await fetch('/api/slots');
      if (slotsResp.ok) {
        const slots: OfferSlot[] = await slotsResp.json();
        // Map offer ID to sum of available counts
        const mapping: Record<string, number> = {};
        slots.forEach(s => {
          mapping[s.offerId] = (mapping[s.offerId] || 0) + s.availableCount;
        });
        setSlotsMap(mapping);
      }
    } catch (err) {
      console.error("Failed load listings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter listings
  const filteredOffers = offers.filter(o => {
    const textMatch = 
      o.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      o.description.toLowerCase().includes(searchQuery.toLowerCase());

    const typeMatch = selectedType === 'ALL' || (business && business.type === selectedType);
    const categoryMatch = selectedCategory === 'ALL' || o.category === selectedCategory;
    const priceMatch = o.offerPrice <= Number(priceRange);
    
    const qtyLeft = slotsMap[o.id] || 0;
    const qtyMatch = !availableOnly || qtyLeft > 0;

    return textMatch && typeMatch && categoryMatch && priceMatch && qtyMatch;
  });

  const categories = Array.from(new Set(offers.map(o => o.category)));

  if (loading) {
    return (
      <div id="listing-loader" className="flex flex-col items-center justify-center py-24 gap-3 text-slate-500">
        <Activity className="h-10 w-10 text-indigo-600 animate-spin" />
        <span className="text-xs font-semibold font-mono tracking-widest text-slate-400">UPDATING SLOTS AVAILABILITY IN REAL-TIME...</span>
      </div>
    );
  }

  return (
    <div id="public-listing-root" className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Immersive Welcome Hero Banner */}
      <div id="portal-hero-section" className="relative rounded-3xl overflow-hidden bg-slate-950 text-white p-8 md:p-12 shadow-xl border border-slate-800">
        <div className="absolute inset-0 opacity-10 bg-cover bg-center pointer-events-none" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=600')" }}></div>
        <div className="relative z-10 max-w-2xl space-y-4">
          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full inline-flex items-center gap-1.5 select-none">
            <Flame className="h-3 w-3 text-indigo-400 animate-pulse" />
            Limited-Time Booking Exclusives
          </span>
          <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight leading-tight">
            Claim Limited Appointment Slots with Flat 50%+ Discounts!
          </h2>
          <p className="text-xs md:text-sm text-slate-300 font-normal">
            Real-time appointment scheduler synced with custom merchant promotions. Find salons, physical labs, stadiums, classes and coaches near you.
          </p>
          {business && (
            <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-200 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 w-fit">
              <span className="flex items-center gap-1">🏢 {business.name}</span>
              <span className="flex items-center gap-1">📍 {business.city}, {business.address}</span>
              <span className="flex items-center gap-1">⏰ Open: {business.openingTime} - {business.closingTime}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Filter Toolbar + Results Panels */}
      <div id="listing-body" className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Filters Rail bar */}
        <div id="filter-rail" className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm h-fit space-y-6">
          <div className="flex items-center justify-between border-b border-slate-50 pb-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 select-none">
              <Compass className="h-4.5 w-4.5 text-indigo-600" />
              <span>Search Filters</span>
            </h3>
            <button 
              onClick={() => {
                setSearchQuery('');
                setSelectedType('ALL');
                setSelectedCategory('ALL');
                setPriceRange('200');
                setAvailableOnly(false);
              }}
              className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
            >
              Reset
            </button>
          </div>

          {/* Search Bar query */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">Keyword Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Coaching, facial, court..."
                className="w-full bg-slate-50 border border-gray-200 rounded-xl py-2 pl-9 pr-3 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">Offer Tag Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-50 border border-gray-200 rounded-xl py-2 px-3 text-xs font-semibold text-slate-700 cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Sliding Max pricing filter */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <label className="text-slate-700">Max Offer Price ($)</label>
              <span className="text-indigo-600 font-bold">${priceRange}</span>
            </div>
            <input
              type="range"
              min="10"
              max="200"
              step="5"
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          {/* Available only Checkbox */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-50">
            <input
              type="checkbox"
              id="cb-available-only"
              checked={availableOnly}
              onChange={(e) => setAvailableOnly(e.target.checked)}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <label htmlFor="cb-available-only" className="text-xs font-semibold text-slate-700 cursor-pointer select-none">
              Hide Fully Booked Slots
            </label>
          </div>
        </div>

        {/* Right Offer Cards Output columns */}
        <div id="listing-cards-grid" className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Discovering {filteredOffers.length} Verified Deals</span>
            <span>Live Sync: Active</span>
          </div>

          {filteredOffers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-100 rounded-3xl shadow-sm text-center p-6 space-y-3">
              <AlertOctagon className="h-10 w-10 text-slate-400 animate-bounce" />
              <div>
                <h4 className="font-bold text-slate-900 text-sm">No Active Slots Found</h4>
                <p className="text-xs text-slate-500 max-w-md mt-1">Adjust your filters, expand your budget boundaries, or clear query keywords to discover relevant deals.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredOffers.map((o) => {
                const spacesLeft = slotsMap[o.id] || 0;
                const isFull = spacesLeft <= 0;

                return (
                  <div
                    key={o.id}
                    className="bg-white border border-slate-100 rounded-3xl shadow-sm flex flex-col justify-between overflow-hidden hover:shadow-md transition-shadow h-full"
                  >
                    
                    {/* Card Header information */}
                    <div className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-bold rounded-full uppercase tracking-wider block">
                          {o.category}
                        </span>
                        
                        {/* Countdown Timers */}
                        <CountdownTimer expiryDate={o.endDate} />
                      </div>

                      <div className="space-y-1.5">
                        <h3 className="text-sm font-bold text-slate-900 tracking-tight leading-snug hover:text-indigo-600 transition-colors cursor-pointer" onClick={() => onSelectOffer(o.id)}>
                          {o.title}
                        </h3>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {o.description}
                        </p>
                      </div>

                      {/* Pricing block */}
                      <div className="flex items-end gap-3 pt-2">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Campaign Price</span>
                          <span className="text-xl font-black text-indigo-600 leading-none mt-1">${o.offerPrice}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[9px] text-slate-400 line-through font-semibold block leading-none">${o.originalPrice}</span>
                          <span className="text-[10px] font-bold text-emerald-600 leading-none mt-1 uppercase">Save {o.discountPercentage}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer actions */}
                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-100/60 flex items-center justify-between gap-3">
                      <div>
                        {isFull ? (
                          <span className="text-[10.5px] font-bold text-orange-600 bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-full uppercase tracking-wide">
                            Waitlist Triggered
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                            🎟️ <strong>{spacesLeft} seats</strong> left today
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => onSelectOffer(o.id)}
                        className={`flex items-center gap-1.5 font-bold px-3.5 py-2 rounded-xl text-xs tracking-wide cursor-pointer transition-all ${
                          isFull 
                            ? 'bg-amber-500 hover:bg-amber-600 text-white' 
                            : 'bg-slate-900 hover:bg-slate-800 text-white'
                        }`}
                      >
                        {isFull ? (
                          <span>Join Waitlist</span>
                        ) : (
                          <>
                            <span>Book Now</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </>
                        )}
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
