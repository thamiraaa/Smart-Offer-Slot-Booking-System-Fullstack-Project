import React, { useState, useEffect } from 'react';
import { 
  Percent, 
  Trash2, 
  Edit, 
  Power, 
  PowerOff, 
  Calendar, 
  ChevronRight, 
  Plus, 
  AlertCircle, 
  CheckCircle,
  HelpCircle,
  X,
  FileText
} from 'lucide-react';
import { Offer, OfferSlot } from '../types';

interface ManageProps {
  onEditOffer: (id: string) => void;
  onNavigateToCreate: () => void;
}

export default function ManageOffers({ onEditOffer, onNavigateToCreate }: ManageProps) {
  const [offersList, setOffersList] = useState<Offer[]>([]);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [selectedOfferSlots, setSelectedOfferSlots] = useState<OfferSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOffers = async () => {
    try {
      const resp = await fetch('/api/offers');
      if (!resp.ok) throw new Error("Database offline");
      const data = await resp.json();
      setOffersList(data);
      if (data.length > 0 && !selectedOffer) {
        // Auto select first one for calendar slot drawer demo
        setSelectedOffer(data[0]);
        fetchSlots(data[0].id);
      }
    } catch (err: any) {
      setError("Failed to fetch offers from simulated database.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSlots = async (offerId: string) => {
    try {
      const resp = await fetch(`/api/offers/${offerId}/slots`);
      if (resp.ok) {
        const slotsData = await resp.json();
        setSelectedOfferSlots(slotsData);
      }
    } catch (err) {
      console.error("Failed to load slots");
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleToggleStatus = async (offer: Offer) => {
    const nextStatus = offer.status === 'Active' ? 'Paused' : 'Active';
    try {
      const resp = await fetch(`/api/offers/${offer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      if (resp.ok) {
        // Local state updates
        setOffersList(offersList.map(o => o.id === offer.id ? { ...o, status: nextStatus } : o));
        if (selectedOffer && selectedOffer.id === offer.id) {
          setSelectedOffer({ ...selectedOffer, status: nextStatus });
        }
      }
    } catch (err) {
      alert("Error toggling campaign status");
    }
  };

  const handleDeleteOffer = async (id: string, offerTitle: string) => {
    if (!window.confirm(`Are you absolutely sure you want to delete offer "${offerTitle}"? This will cascadingly destroy all linked booked slots.`)) {
      return;
    }

    try {
      const resp = await fetch(`/api/offers/${id}`, { method: 'DELETE' });
      if (resp.ok) {
        const remaining = offersList.filter(o => o.id !== id);
        setOffersList(remaining);
        if (selectedOffer && selectedOffer.id === id) {
          setSelectedOffer(remaining[0] || null);
          setSelectedOfferSlots([]);
        }
      }
    } catch (err) {
      alert("Delete operation failed");
    }
  };

  if (loading) {
    return (
      <div id="manage-loader" className="text-center py-20 text-slate-500 font-mono text-xs">
        RETRIEVING OFFERS CONFIGURATION LEDGER...
      </div>
    );
  }

  return (
    <div id="manage-offers-root" className="space-y-6">
      
      {/* Page header */}
      <div id="manage-header" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Active Offer Portfolios</h2>
          <p className="text-xs text-slate-500">Enable, disable, update pricing matrix, or verify active capacity blocks.</p>
        </div>
        <button
          onClick={onNavigateToCreate}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer shadow-md shadow-indigo-600/25 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Publish New Offer</span>
        </button>
      </div>

      {error ? (
        <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl text-xs text-orange-700">
          {error}
        </div>
      ) : (
        <div id="manage-offers-grid" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main List Table Area */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm overflow-hidden space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 pb-2 border-b border-slate-50">Active Catalog Listings</h3>

            <div id="offers-table-wrap" className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="pb-3 pr-2">Campaign Title</th>
                    <th className="pb-3 pr-2">Pricing</th>
                    <th className="pb-3 pr-2">Discount</th>
                    <th className="pb-3 pr-2">Capacity</th>
                    <th className="pb-3 pr-2">Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {offersList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                        Catalog is empty. Tap "Publish New Offer" to create your first promotion!
                      </td>
                    </tr>
                  ) : (
                    offersList.map((o) => (
                      <tr 
                        key={o.id} 
                        onClick={() => {
                          setSelectedOffer(o);
                          fetchSlots(o.id);
                        }}
                        className={`hover:bg-slate-50/50 transition-colors cursor-pointer group ${
                          selectedOffer?.id === o.id ? 'bg-indigo-50/20' : ''
                        }`}
                      >
                        <td className="py-4 pr-2 max-w-[160px]">
                          <div className="font-semibold text-slate-800 truncate group-hover:text-indigo-600">{o.title}</div>
                          <span className="text-[10px] text-slate-400 block font-semibold">{o.category} • {o.startDate}</span>
                        </td>
                        <td className="py-4 pr-2">
                          <span className="font-bold text-slate-950">${o.offerPrice}</span>
                          <span className="text-[10px] text-slate-400 line-through block font-medium">${o.originalPrice}</span>
                        </td>
                        <td className="py-4 pr-2 font-bold text-emerald-600">
                          {o.discountPercentage}% OFF
                        </td>
                        <td className="py-4 pr-2 font-semibold text-slate-600 font-mono">
                          {o.totalCapacity} slots
                        </td>
                        <td className="py-4 pr-2">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                            o.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                            o.status === 'Draft' ? 'bg-slate-50 text-slate-600 border-slate-200' :
                            o.status === 'Paused' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                            'bg-red-50 text-red-700 border-red-100'
                          }`}>
                            {o.status}
                          </span>
                        </td>
                        <td className="py-4 text-right space-x-1 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleToggleStatus(o)}
                            title={o.status === 'Active' ? 'Pause Campaign' : 'Activate Campaign'}
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors cursor-pointer inline-block"
                          >
                            {o.status === 'Active' ? <Power className="h-4 w-4 text-emerald-600" /> : <PowerOff className="h-4 w-4 text-slate-400" />}
                          </button>
                          <button
                            onClick={() => onEditOffer(o.id)}
                            title="Edit Offer properties"
                            className="p-1.5 hover:bg-indigo-50 rounded-lg text-indigo-600 transition-colors cursor-pointer inline-block"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteOffer(o.id, o.title)}
                            title="Delete offer cascade"
                            className="p-1.5 hover:bg-rose-50 rounded-lg text-rose-500 transition-colors cursor-pointer inline-block"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Slots Calendar Visualizer Sidebar (Fulfills: Bonus Feature "Calendar slot view") */}
          <div className="bg-slate-900 border border-slate-800 text-slate-200 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <Calendar className="h-4.5 w-4.5 text-indigo-400" />
                <h4 className="text-xs font-semibold text-slate-100 tracking-wide uppercase">Interactive Slot Calendar</h4>
              </div>

              {selectedOffer ? (
                <div id="calendar-drawer" className="space-y-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block font-mono">Viewing Allocation for:</span>
                    <span className="text-xs font-bold text-indigo-300 block leading-tight mt-0.5">{selectedOffer.title}</span>
                  </div>

                  {/* Calendar Dates Simulated representation */}
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">Calendar schedule: {selectedOffer.startDate}</div>
                    
                    {/* Simulated 7 Grid calendar blocks */}
                    <div className="grid grid-cols-7 gap-1 text-[9px] text-center font-mono">
                      {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                        <div key={d} className="font-bold text-slate-500 pb-2 border-b border-slate-800/60 uppercase">{d}</div>
                      ))}
                      {/* empty blocks */}
                      <div className="text-slate-700 py-1 font-semibold">20</div>
                      <div className="text-slate-700 py-1 font-semibold">21</div>
                      <div className="text-slate-700 py-1 font-semibold">22</div>
                      <div className="text-slate-700 py-1 font-semibold">23</div>
                      {/* Highlighted active offers dates starting may 24 */}
                      <div className="bg-indigo-600 text-white font-bold py-1 rounded shadow shadow-indigo-600/30">24</div>
                      <div className="bg-indigo-950 text-indigo-400 font-semibold py-1 rounded">25</div>
                      <div className="bg-indigo-950 text-indigo-400 font-semibold py-1 rounded">26</div>
                    </div>
                  </div>

                  {/* Detailed slots rows */}
                  <div className="space-y-2 max-h-[220px] overflow-y-auto">
                    <span className="text-[10px] font-bold text-slate-400 block tracking-wider uppercase mb-1">Time Blocks available:</span>
                    {selectedOfferSlots.length === 0 ? (
                      <div className="text-xs text-slate-500 py-6 text-center border border-dashed border-slate-800 rounded-xl bg-slate-950/25">
                        No active scheduling blocks. Expand on "Publish" to add timing slots!
                      </div>
                    ) : (
                      selectedOfferSlots.map((s) => (
                        <div key={s.id} className="p-2.5 bg-slate-950 rounded-xl hover:bg-slate-950/80 border border-slate-800/80 text-xs flex items-center justify-between text-slate-300 gap-2">
                          <div>
                            <span className="font-mono font-bold text-slate-100 flex items-center gap-1">
                              ⏰ {s.startTime} - {s.endTime}
                            </span>
                            <span className="text-[9px] text-slate-500 block font-medium">Session: {s.slotDate}</span>
                          </div>
                          
                          <div className="text-right">
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${
                              s.status === 'Available' ? 'bg-indigo-950 text-indigo-400 border-indigo-800/40' : 'bg-red-950 text-red-400 border-red-900/40'
                            }`}>
                              {s.status}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono block mt-1">{s.bookedCount}/{s.capacity} occupied</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                <div className="py-20 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl bg-slate-950/30 text-xs font-semibold">
                  Pick an offer row to inspect slot capacities.
                </div>
              )}
            </div>

            {selectedOffer && (
              <div id="quick-panel-footer" className="mt-4 p-3 bg-slate-950 border border-slate-800 rounded-xl text-[10px] text-slate-400 flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4 text-indigo-400 shrink-0" />
                <span>To modify slots, click the edit button (pen icon) on the catalog list.</span>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
