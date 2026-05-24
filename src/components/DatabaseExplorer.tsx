import React, { useState } from 'react';
import { Database, Link, Key, Cpu, Award } from 'lucide-react';

export default function DatabaseExplorer() {
  const [selectedTable, setSelectedTable] = useState<string | null>(null);

  const tables = {
    Businesses: {
      columns: [
        { name: "Id", type: "UUID", pk: true, fk: false, notes: "PRIMARY KEY (Business identification)" },
        { name: "Name", type: "VARCHAR(100)", pk: false, fk: false, notes: "Required clinic, gym or store title" },
        { name: "Type", type: "VARCHAR(50)", pk: false, fk: false, notes: "Restaurant, Gym, Salon, Clinic, Coaching, Turf, etc." },
        { name: "OwnerName", type: "VARCHAR(100)", pk: false, fk: false, notes: "Admin owner's real-name credentials" },
        { name: "PhoneNumber", type: "VARCHAR(30)", pk: false, fk: false, notes: "Contact cell" },
        { name: "Email", type: "VARCHAR(150)", pk: false, fk: false, notes: "Alert notification email" },
        { name: "Address", type: "TEXT", pk: false, fk: false, notes: "Physical street address location" },
        { name: "City", type: "VARCHAR(100)", pk: false, fk: false, notes: "Geographic search city lookup" },
        { name: "OpeningTime", type: "VARCHAR(5)", pk: false, fk: false, notes: "HH:MM format for availability validation" },
        { name: "ClosingTime", type: "VARCHAR(5)", pk: false, fk: false, notes: "HH:MM format boundary condition" },
        { name: "LogoUrl", type: "VARCHAR(500)", pk: false, fk: false, notes: "Public cloud storage logo reference" }
      ],
      description: "Holds the business specifications. Admin can create, query, and modify this configuration which controls working boundaries."
    },
    Offers: {
      columns: [
        { name: "Id", type: "UUID", pk: true, fk: false, notes: "PRIMARY KEY" },
        { name: "Title", type: "VARCHAR(150)", pk: false, fk: false, notes: "Target discount service title" },
        { name: "Description", type: "TEXT", pk: false, fk: false, notes: "In-depth detail & package guidelines" },
        { name: "Category", type: "VARCHAR(100)", pk: false, fk: false, notes: "Faceted search grouping category" },
        { name: "OriginalPrice", type: "NUMERIC(18,2)", pk: false, fk: false, notes: "Standard price before discount application" },
        { name: "OfferPrice", type: "NUMERIC(18,2)", pk: false, fk: false, notes: "Discounted limit purchase price" },
        { name: "StartDate", type: "TIMESTAMP", pk: false, fk: false, notes: "Validity horizon: start trigger" },
        { name: "EndDate", type: "TIMESTAMP", pk: false, fk: false, notes: "Validity horizon: expire boundary" },
        { name: "StartTime", type: "VARCHAR(5)", pk: false, fk: false, notes: "Operational start hours" },
        { name: "EndTime", type: "VARCHAR(5)", pk: false, fk: false, notes: "Operational end hours" },
        { name: "TotalCapacity", type: "INT", pk: false, fk: false, notes: "Aggregate space capability limit" },
        { name: "MaxBookingPerCustomer", type: "INT", pk: false, fk: false, notes: "Phone limit reservation threshold constraint" },
        { name: "TermsAndConditions", type: "TEXT", pk: false, fk: false, notes: "Legal and clinic guidelines text" },
        { name: "Status", type: "VARCHAR(30)", pk: false, fk: false, notes: "Draft, Active, Paused, Expired, Cancelled" },
        { name: "CouponCode", type: "VARCHAR(50)", pk: false, fk: false, notes: "Bonus coupon code (e.g. DETOX5)" },
        { name: "CouponDiscount", type: "NUMERIC(18,2)", pk: false, fk: false, notes: "Subtract action amount on booking payload" }
      ],
      description: "Limited-time deals posted by the Admin. Each offers contains specific guidelines, prices, and status parameters."
    },
    OfferSlots: {
      columns: [
        { name: "Id", type: "UUID", pk: true, fk: false, notes: "PRIMARY KEY" },
        { name: "OfferId", type: "UUID", pk: false, fk: true, notes: "FOREIGN KEY -> Offers.Id (Cascade Delete)" },
        { name: "SlotDate", type: "DATE", pk: false, fk: false, notes: "Specific work calendar day (YYYY-MM-DD)" },
        { name: "StartTime", type: "VARCHAR(5)", pk: false, fk: false, notes: "Block start (e.g., '14:00')" },
        { name: "EndTime", type: "VARCHAR(5)", pk: false, fk: false, notes: "Block end (e.g., '16:00')" },
        { name: "Capacity", type: "INT", pk: false, fk: false, notes: "Specific session seat constraint" },
        { name: "BookedCount", type: "INT", pk: false, fk: false, notes: "Aggregated successfully reserved seat count" },
        { name: "Status", type: "VARCHAR(30)", pk: false, fk: false, notes: "Available, Full, Closed, Expired, Cancelled" }
      ],
      description: "Individual booking blocks mapped to an Offer. BookedCount automatically increments upon dynamic public customer reservations."
    },
    Bookings: {
      columns: [
        { name: "Id", type: "UUID", pk: true, fk: false, notes: "PRIMARY KEY" },
        { name: "ReferenceNumber", type: "VARCHAR(20)", pk: false, fk: false, notes: "UNIQUE KEY (e.g., SO-129482) for QR search" },
        { name: "OfferId", type: "UUID", pk: false, fk: true, notes: "FOREIGN KEY -> Offers.Id (Restrict delete state)" },
        { name: "SlotId", type: "UUID", pk: false, fk: true, notes: "FOREIGN KEY -> OfferSlots.Id (Restrict delete state)" },
        { name: "CustomerName", type: "VARCHAR(100)", pk: false, fk: false, notes: "Required customer verification name" },
        { name: "PhoneNumber", type: "VARCHAR(30)", pk: false, fk: false, notes: "Tracking phone number for duplicate control" },
        { name: "Email", type: "VARCHAR(150)", pk: false, fk: false, notes: "Optional booking receipt dispatch" },
        { name: "NumberOfPeople", type: "INT", pk: false, fk: false, notes: "Occupancy reservation size" },
        { name: "SpecialNote", type: "TEXT", pk: false, fk: false, notes: "Custom requirements (optional)" },
        { name: "Status", type: "VARCHAR(30)", pk: false, fk: false, notes: "Pending, Confirmed, Cancelled, Completed, NoShow" },
        { name: "PaymentStatus", type: "VARCHAR(30)", pk: false, fk: false, notes: "Unpaid, Paid, Refunded" },
        { name: "BookingDate", type: "TIMESTAMP", pk: false, fk: false, notes: "Created timestamp for analytics" },
        { name: "CouponApplied", type: "VARCHAR(50)", pk: false, fk: false, notes: "Matching CouponCode reference" },
        { name: "TotalPaid", type: "NUMERIC(18,2)", pk: false, fk: false, notes: "Actual financial transaction value" }
      ],
      description: "Core booking facts. Linked to a unique Slot and parent Offer. ReferenceNumber generates a scannable digital confirmation barcode/QR."
    }
  };

  return (
    <div id="database-explorer-container" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Interactive ER Schema Column */}
      <div id="er-visual-section" className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <Database className="h-5 w-5 text-indigo-600" />
          <div>
            <h3 className="text-base font-semibold text-slate-900">Entity Relationship (ER) Diagrams</h3>
            <p className="text-xs text-slate-500">Click a data entity table below to inspect attributes, keys and indexing fields.</p>
          </div>
        </div>

        {/* Visual Map */}
        <div id="er-flow-map" className="relative p-4 bg-slate-50 rounded-2xl border border-slate-100/80 min-h-[360px] flex flex-col items-center justify-center gap-8 overflow-x-auto">
          {/* Top row */}
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 w-full">
            {/* Businesses Card */}
            <div 
              onClick={() => setSelectedTable("Businesses")}
              className={`p-4 rounded-xl border-2 transition-all cursor-pointer w-[180px] text-center shadow-sm hover:-translate-y-1 ${
                selectedTable === 'Businesses' 
                  ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500/10' 
                  : 'bg-white border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-center gap-1.5 font-bold text-xs text-indigo-600 mb-1">
                <Database className="h-3.5 w-3.5" />
                <span>Businesses</span>
              </div>
              <p className="text-[10px] text-slate-500">1:N Active System Profile</p>
              <div className="mt-2 text-[9px] font-mono text-left bg-slate-50 p-1.5 rounded text-slate-600 border border-slate-100">
                <div className="font-semibold text-indigo-700">🔑 Id (UUID)</div>
                <div>Name (VARCHAR)</div>
                <div>Type (VARCHAR)</div>
              </div>
            </div>

            {/* Offers Card */}
            <div 
              onClick={() => setSelectedTable("Offers")}
              className={`p-4 rounded-xl border-2 transition-all cursor-pointer w-[180px] text-center shadow-sm hover:-translate-y-1 ${
                selectedTable === 'Offers' 
                  ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500/10' 
                  : 'bg-white border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-center gap-1.5 font-bold text-xs text-indigo-600 mb-1">
                <Database className="h-3.5 w-3.5" />
                <span>Offers</span>
              </div>
              <p className="text-[10px] text-slate-500">One-to-Many Slots relation</p>
              <div className="mt-2 text-[9px] font-mono text-left bg-slate-50 p-1.5 rounded text-slate-600 border border-slate-100">
                <div className="font-semibold text-indigo-700">🔑 Id (UUID)</div>
                <div>Title (VARCHAR)</div>
                <div>OriginalPrice (DECIMAL)</div>
              </div>
            </div>
          </div>

          {/* Connectors representation */}
          <div className="flex items-center gap-1 text-slate-400">
            <div className="h-0.5 w-[120px] bg-slate-200 relative">
              <span className="absolute -left-1 -top-1 font-mono text-[9px] text-indigo-600">1</span>
              <span className="absolute -right-1 -top-1 font-mono text-[9px] text-indigo-600">N</span>
            </div>
          </div>

          {/* Bottom row */}
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 w-full">
            {/* OfferSlots Card */}
            <div 
              onClick={() => setSelectedTable("OfferSlots")}
              className={`p-4 rounded-xl border-2 transition-all cursor-pointer w-[180px] text-center shadow-sm hover:-translate-y-1 ${
                selectedTable === 'OfferSlots' 
                  ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500/10' 
                  : 'bg-white border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-center gap-1.5 font-bold text-xs text-indigo-600 mb-1">
                <Database className="h-3.5 w-3.5" />
                <span>OfferSlots</span>
              </div>
              <p className="text-[10px] text-slate-500">Weak dependent child</p>
              <div className="mt-2 text-[9px] font-mono text-left bg-slate-50 p-1.5 rounded text-slate-600 border border-slate-100">
                <div className="font-semibold text-indigo-700">🔑 Id (UUID)</div>
                <div className="text-emerald-700">🔗 OfferId (FK)</div>
                <div>SlotDate (DATE)</div>
              </div>
            </div>

            {/* Bookings Card */}
            <div 
              onClick={() => setSelectedTable("Bookings")}
              className={`p-4 rounded-xl border-2 transition-all cursor-pointer w-[180px] text-center shadow-sm hover:-translate-y-1 ${
                selectedTable === 'Bookings' 
                  ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500/10' 
                  : 'bg-white border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-center gap-1.5 font-bold text-xs text-indigo-600 mb-1">
                <Database className="h-3.5 w-3.5" />
                <span>Bookings</span>
              </div>
              <p className="text-[10px] text-slate-500">Transaction Fact Table</p>
              <div className="mt-2 text-[9px] font-mono text-left bg-slate-50 p-1.5 rounded text-slate-600 border border-slate-100">
                <div className="font-semibold text-indigo-700">🔑 Id (UUID)</div>
                <div className="text-emerald-700">🔗 OfferId (FK)</div>
                <div className="text-emerald-700">🔗 SlotId (FK)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Index/Constraint Bullet Explanation */}
        <div id="db-constraints-explanation" className="mt-6 p-4 bg-indigo-500/5 rounded-xl border border-indigo-500/10 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <h5 className="font-semibold text-indigo-900 flex items-center gap-1 mb-1.5">
              <Cpu className="h-3.5 w-3.5 text-indigo-600" />
              Relational Integrity Constraints
            </h5>
            <ul className="space-y-1 text-slate-600 list-disc pl-4">
              <li><strong>Cascade Deletes</strong>: Deleting an Offer triggers cascading deletion of its associated OfferSlots to prevent orphan records.</li>
              <li><strong>Restricted Deletes</strong>: Deleting an Offer is restricted if it contains active transaction bookings to safeguard business reporting ledger records.</li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold text-indigo-900 flex items-center gap-1 mb-1.5">
              <Award className="h-3.5 w-3.5 text-indigo-600" />
              Performance Optimized Indexes
            </h5>
            <ul className="space-y-1 text-slate-600 list-disc pl-4">
              <li><strong>Unique B-Tree Index</strong>: On <code className="bg-white px-1 border rounded">Booking.ReferenceNumber</code> guarantees immediate lookup during QR ticket scanning checkins.</li>
              <li><strong>Composite Filter Search Index</strong>: Implemented on <code className="bg-white px-1 border rounded">(OfferId, SlotDate)</code> speeding up calendar view fetches.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Schema Inspector Column */}
      <div id="schema-inspector-panel" className="bg-slate-900 hover:bg-slate-900 text-slate-200 rounded-2xl border border-slate-800 p-6 shadow-xl overflow-hidden flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-indigo-400 animate-pulse" />
            <span className="font-semibold text-slate-100">Dictionary Inspector</span>
          </div>
          <div className="text-xs text-slate-400">
            {selectedTable 
              ? `Displaying columns for: ${selectedTable}` 
              : "Select any entity table in the ER diagram to inspect its schema metadata dictionary, fields, keys, data-types and notes."
            }
          </div>

          {selectedTable ? (
            <div id="schema-scroller" className="border border-slate-800/80 rounded-xl overflow-hidden max-h-[380px] overflow-y-auto">
              {tables[selectedTable as keyof typeof tables].columns.map((col, index) => (
                <div key={index} className="px-3 py-2.5 bg-slate-950 border-b border-slate-800/60 flex flex-col text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-indigo-300 font-semibold">{col.name}</span>
                    <span className="text-[10px] font-mono text-slate-500 px-1.5 py-0.2 bg-slate-900 border border-slate-800 rounded">{col.type}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                    {col.pk && <span className="text-indigo-400 font-bold flex items-center"><Key className="h-2.5 w-2.5 mr-0.5" /> PK</span>}
                    {col.fk && <span className="text-emerald-400 font-bold flex items-center"><Link className="h-2.5 w-2.5 mr-0.5" /> FK</span>}
                    <span className="truncate">{col.notes}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500 border border-dashed border-slate-800 rounded-xl bg-slate-950/20">
              <Database className="h-10 w-10 text-slate-700 mb-2" />
              <span className="text-center font-medium">No Entity Selected</span>
            </div>
          )}
        </div>

        {selectedTable && (
          <div id="inspector-table-desc" className="mt-4 p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-300">
            <div className="font-semibold text-slate-400 mb-1">Entity Definition:</div>
            {tables[selectedTable as keyof typeof tables].description}
          </div>
        )}
      </div>
    </div>
  );
}
