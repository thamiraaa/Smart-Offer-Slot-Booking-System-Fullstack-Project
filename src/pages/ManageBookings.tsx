import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, 
  Search, 
  Trash, 
  CheckSquare, 
  Clock, 
  CheckCircle2, 
  X, 
  FileSpreadsheet, 
  ChevronRight, 
  User, 
  AlertTriangle,
  Loader2,
  CalendarDays
} from 'lucide-react';
import { Booking } from '../types';

interface BookingsProps {
  onSelectBooking: (id: string) => void;
}

export default function ManageBookings({ onSelectBooking }: BookingsProps) {
  const [bookingsList, setBookingsList] = useState<Booking[]>([]);
  const [filterText, setFilterText] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = async () => {
    try {
      const resp = await fetch('/api/bookings');
      if (!resp.ok) throw new Error("Could not read databases");
      const data = await resp.json();
      setBookingsList(data);
    } catch (err) {
      setError("Failed to synchronize ledgers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const resp = await fetch(`/api/bookings/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (resp.ok) {
        // Refresh listings
        fetchBookings();
      }
    } catch (err) {
      alert("Failed to modify transaction status");
    }
  };

  const handleExportCSV = () => {
    const headers = ["ID", "Reference", "Customer Name", "Phone", "Email", "Offer Campaign Title", "Slot", "Date", "Guests", "Status", "Payment", "Date Booked"];
    const rows = bookingsList.map(b => [
      b.id,
      b.referenceNumber,
      b.customerName,
      b.phoneNumber,
      b.email || 'N/A',
      b.offerTitle || '',
      b.slotTime || '',
      b.slotDate || '',
      b.numberOfPeople.toString(),
      b.status,
      b.paymentStatus,
      b.bookingDate
    ]);

    const csvContent = [headers, ...rows].map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `SmartOffer_Detailed_Report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // String matches filter (case insensitives)
  const filteredBookings = bookingsList.filter(b => {
    const textMatch = 
      b.customerName.toLowerCase().includes(filterText.toLowerCase()) || 
      b.referenceNumber.toLowerCase().includes(filterText.toLowerCase()) || 
      b.phoneNumber.includes(filterText) ||
      (b.offerTitle && b.offerTitle.toLowerCase().includes(filterText.toLowerCase()));

    const statusMatch = filterStatus === 'ALL' || b.status === filterStatus;

    return textMatch && statusMatch;
  });

  if (loading) {
    return (
      <div id="bookings-loader" className="flex justify-center items-center py-20 text-slate-500 text-xs font-mono">
        LOADING ACTIVE TRANSACTIONS LEDGER...
      </div>
    );
  }

  return (
    <div id="manage-bookings-root" className="space-y-6">
      
      {/* Title */}
      <div id="bookings-title" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Reservations & Transactions Log</h2>
          <p className="text-xs text-slate-500">Monitor guest Check-ins, update attendance status, or issue refunds cascades.</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100/80 active:bg-emerald-100 text-emerald-700 px-3.5 py-2 border border-emerald-200 rounded-xl text-xs font-semibold cursor-pointer transition-all"
        >
          <FileSpreadsheet className="h-4 w-4" />
          <span>Export All to CSV Report</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div id="bookings-toolbar" className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-4 justify-between">
        
        {/* Text Filter */}
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Search by Reference, Customer name, Phone, or Deal..."
            className="w-full bg-slate-50 border border-gray-200 rounded-xl py-2 pl-9 pr-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-800"
          />
        </div>

        {/* State Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block whitespace-nowrap">Filter Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full md:w-auto bg-slate-50 border border-gray-200 rounded-xl py-2 px-3.5 text-xs font-semibold text-slate-700 cursor-pointer"
          >
            <option value="ALL">All Bookings</option>
            <option value="Pending">Pending Checkin</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
            <option value="No Show">No Show</option>
          </select>
        </div>

      </div>

      {/* Database ledger table */}
      <div id="bookings-table-panel" className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm overflow-hidden">
        <div id="filtered-table-scroller" className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="pb-3 pr-2">Reference Code</th>
                <th className="pb-3 pr-2">Customer Details</th>
                <th className="pb-3 pr-2">Selected Campaigns Deal</th>
                <th className="pb-3 pr-2">Assigned Time Slot</th>
                <th className="pb-3 pr-2">Guests count</th>
                <th className="pb-3 pr-2">Amount Paid</th>
                <th className="pb-3 pr-2">Status</th>
                <th className="pb-3 text-right">Perform Checks Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-medium font-mono text-[11px]">
                    No registrations found matching the filtering options.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => (
                  <tr 
                    key={b.id} 
                    onClick={() => onSelectBooking(b.id)}
                    className="hover:bg-slate-50/50 transition-colors cursor-pointer group"
                  >
                    <td className="py-4 pr-2">
                      <span className="font-mono font-bold text-slate-900 block group-hover:text-indigo-600 transition-colors">
                        {b.referenceNumber}
                      </span>
                      <span className="text-[9px] text-slate-400 block font-medium">Record: {b.id.substring(0, 8)}</span>
                    </td>
                    <td className="py-4 pr-2">
                      <div className="font-semibold text-slate-800">{b.customerName}</div>
                      <span className="text-[10px] text-slate-400 font-mono font-semibold block">{b.phoneNumber}</span>
                    </td>
                    <td className="py-4 pr-2 max-w-[150px] truncate">
                      <span className="font-medium text-slate-700 block truncate" title={b.offerTitle}>
                        {b.offerTitle}
                      </span>
                    </td>
                    <td className="py-4 pr-2">
                      <div className="font-semibold text-slate-800">{b.slotDate}</div>
                      <span className="text-[10px] text-slate-400">{b.slotTime}</span>
                    </td>
                    <td className="py-4 pr-2 font-mono font-bold text-slate-800 text-center">
                      {b.numberOfPeople}
                    </td>
                    <td className="py-4 pr-2">
                      <div className="font-bold text-slate-900">${b.totalPaid}</div>
                      <span className={`text-[9px] font-bold uppercase tracking-wider block ${
                        b.paymentStatus === 'Paid' ? 'text-emerald-600' :
                        b.paymentStatus === 'Refunded' ? 'text-rose-500' : 'text-amber-500'
                      }`}>
                        {b.paymentStatus}
                      </span>
                    </td>
                    <td className="py-4 pr-2">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                        b.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                        b.status === 'Completed' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                        b.status === 'Cancelled' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                        b.status === 'No Show' ? 'bg-slate-50 text-slate-600 border-slate-200' :
                        'bg-amber-50 text-amber-700 border-amber-100'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="py-4 text-right space-x-1" onClick={(e) => e.stopPropagation()}>
                      {b.status === 'Pending' || b.status === 'Confirmed' ? (
                        <div className="flex justify-end gap-1.5 list-none">
                          <button
                            onClick={() => handleUpdateStatus(b.id, 'Completed')}
                            className="px-2 py-1 bg-emerald-50 border border-emerald-100 text-emerald-700 hover:bg-emerald-100 rounded text-[10px] font-bold cursor-pointer transition-colors"
                          >
                            Mark Arrived
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(b.id, 'No Show')}
                            className="px-2 py-1 bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded text-[10px] font-bold cursor-pointer transition-colors"
                          >
                            No Show
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(b.id, 'Cancelled')}
                            className="px-2 py-1 bg-rose-50 border border-rose-100 text-rose-700 hover:bg-rose-100 rounded text-[10px] font-bold cursor-pointer transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">No further actions.</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
