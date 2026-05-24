import React, { useState, useEffect } from 'react';
import { 
  Booking, 
  DashboardSummary, 
  NotificationLog 
} from '../types';
import { 
  Activity, 
  CalendarClock, 
  Users, 
  TrendingUp, 
  CheckCircle, 
  X, 
  AlertTriangle, 
  Loader2, 
  Smartphone, 
  ArrowRight, 
  User, 
  CalendarDays,
  FileSpreadsheet,
  Percent
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import NotificationLogPanel from '../components/NotificationLogPanel';

interface DashboardProps {
  token: string;
  onEditOffer: (id: string) => void;
  onSelectBooking: (id: string) => void;
  onNavigateToSection: (section: string) => void;
}

export default function AdminDashboard({ token, onEditOffer, onSelectBooking, onNavigateToSection }: DashboardProps) {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchDashboardData = async () => {
    try {
      const summaryResp = await fetch('/api/dashboard/summary');
      if (!summaryResp.ok) throw new Error("Could not pull stats");
      const summaryData = await summaryResp.json();
      setSummary(summaryData);

      const logsResp = await fetch('/api/notifications');
      if (logsResp.ok) {
        const logsData = await logsResp.json();
        setNotifications(logsData);
      }
    } catch (err: any) {
      setError("Failed to coordinate api communication with backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // Refresh stats periodically
    const interval = setInterval(fetchDashboardData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateBookingStatus = async (id: string, newStatus: string) => {
    try {
      const resp = await fetch(`/api/bookings/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (!resp.ok) throw new Error("Could not update");
      fetchDashboardData();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  // CSV Bookings Download (Bonus Feature)
  const handleExportCSV = () => {
    if (!summary || !summary.recentBookings) return;
    
    const headers = ["Reference", "Customer Name", "Phone", "Email", "Offer Title", "Slot", "Date", "Guests", "Status", "Total Paid"];
    const rows = summary.recentBookings.map(b => [
      b.referenceNumber,
      b.customerName,
      b.phoneNumber,
      b.email || 'N/A',
      b.offerTitle || '',
      b.slotTime || '',
      b.slotDate || '',
      b.numberOfPeople.toString(),
      b.status,
      `$${b.totalPaid}`
    ]);

    const csvContent = [headers, ...rows].map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `SmartOffer_Bookings_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div id="stats-loading-screen" className="flex flex-col items-center justify-center py-24 gap-3 text-slate-500">
        <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
        <span className="text-xs font-semibold font-mono tracking-widest text-slate-400">SYNCING LIVE PostgreSQL LEDGER...</span>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div id="stats-error-screen" className="p-8 bg-rose-50 border border-rose-100 rounded-3xl text-rose-800 max-w-2xl mx-auto mt-12 flex flex-col items-center gap-4 text-center">
        <AlertTriangle className="h-12 w-12 text-rose-500 animate-bounce" />
        <div>
          <h4 className="font-bold">Database Out of Sync</h4>
          <p className="text-xs text-rose-600 mt-1">{error || "The Express data pipeline experienced a terminal breach."}</p>
        </div>
        <button onClick={fetchDashboardData} className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold cursor-pointer">
          Reconnect Pipeline API
        </button>
      </div>
    );
  }

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

  return (
    <div id="dashboard-root" className="space-y-6">
      
      {/* Title / Action Bar */}
      <div id="dashboard-welcome-banner" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Active Operations Summary</h2>
          <p className="text-xs text-slate-500">PostgreSQL core metrics synced with current slot calendar reservations.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 active:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 cursor-pointer transition-all"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
            <span>Generate CSV Ledger</span>
          </button>
          <button
            onClick={() => onNavigateToSection('create-offer')}
            className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20 cursor-pointer transition-all"
          >
            <span>Publish New Slot Offer</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Metric Cards Bento Grid */}
      <div id="metrics-bento-grid" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Offers */}
        <div id="stat-card-offers" className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total / Active Deals</span>
            <h4 className="text-lg font-bold text-slate-900 mt-0.5">{summary.totalOffers} <span className="text-xs text-slate-400 font-normal">({summary.activeOffers} active)</span></h4>
          </div>
        </div>

        {/* Total Bookings */}
        <div id="stat-card-bookings" className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CalendarClock className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Bookings</span>
            <h4 className="text-lg font-bold text-slate-900 mt-0.5">{summary.totalBookings} <span className="text-xs text-emerald-600 font-normal">+{summary.todaysBookings} today</span></h4>
          </div>
        </div>

        {/* Capacity Seats representation */}
        <div id="stat-card-capacity" className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Seats Reserved</span>
            <h4 className="text-lg font-bold text-slate-900 mt-0.5">{summary.bookedSeats}<span className="text-xs text-slate-400 font-normal"> / {summary.totalCapacity} capacity</span></h4>
          </div>
        </div>

        {/* Conversion Rate */}
        <div id="stat-card-conversion" className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Conversion Yield</span>
            <h4 className="text-lg font-bold text-slate-900 mt-0.5">{summary.conversionRate}% <span className="text-xs text-purple-500 font-semibold uppercase tracking-wider">Efficient</span></h4>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div id="charts-layout-section" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Reservation Velocity Area Chart */}
        <div id="area-chart-panel" className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-indigo-600" />
            <span>Reservations Sales & Capacity Metrics</span>
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={summary.bookingsOverTime} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" name="Revenue ($)" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                <Area type="monotone" dataKey="bookings" name="Bookings Volume" stroke="#10b981" strokeWidth={1} fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Industry Pie Chart */}
        <div id="pie-chart-panel" className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4 text-indigo-600" />
              <span>Offers Category Dispersion</span>
            </h3>
            
            <div className="h-40 flex items-center justify-center">
              {summary.industryDistribution.length === 0 ? (
                <span className="text-xs text-slate-400">No active category listings.</span>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={summary.industryDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {summary.industryDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div id="pie-legend" className="space-y-1.5 border-t border-slate-50 pt-3">
            {summary.industryDistribution.map((entry, index) => (
              <div key={entry.name} className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-2 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                  {entry.name}
                </span>
                <span className="text-slate-900">{entry.value} deals</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bookings Table & Live Ticker */}
      <div id="table-ticker-layout" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Bookings ledger table */}
        <div id="recent-bookings-panel" className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-900">Recent Customer Bookings (Live updates)</h3>
              <button 
                onClick={() => onNavigateToSection('bookings-list')}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
              >
                View Full Ledgers →
              </button>
            </div>

            <div id="recent-table-scroller" className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="pb-3 pr-2">Customer & Reference</th>
                    <th className="pb-3 pr-2">Offer Selection</th>
                    <th className="pb-3 pr-2">Time Slot</th>
                    <th className="pb-3 pr-2">Size</th>
                    <th className="pb-3 pr-2">Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {summary.recentBookings.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                        No customer reservations recorded.
                      </td>
                    </tr>
                  ) : (
                    summary.recentBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/55 transition-colors group">
                        <td className="py-3.5 pr-2">
                          <div className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">{b.customerName}</div>
                          <span className="font-mono text-[10px] text-slate-400">{b.referenceNumber}</span>
                        </td>
                        <td className="py-3.5 pr-2 max-w-[140px] truncate">
                          <span className="font-medium text-slate-700 block truncate">{b.offerTitle}</span>
                        </td>
                        <td className="py-3.5 pr-2">
                          <div className="font-medium text-slate-700">{b.slotDate}</div>
                          <span className="text-[10px] text-slate-400">{b.slotTime}</span>
                        </td>
                        <td className="py-3.5 pr-2 font-mono font-bold text-slate-800">
                          {b.numberOfPeople}p
                        </td>
                        <td className="py-3.5 pr-2">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                            b.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                            b.status === 'Completed' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                            b.status === 'Cancelled' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                            'bg-amber-50 text-amber-700 border-amber-100'
                          }`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="py-3.5 text-right space-x-1.5 whitespace-nowrap">
                          {b.status !== 'Cancelled' && b.status !== 'Completed' && (
                            <>
                              <button
                                onClick={() => handleUpdateBookingStatus(b.id, 'Cancelled')}
                                className="px-1.5 py-0.7 bg-rose-50 hover:bg-rose-100 border border-rose-100/60 text-rose-700 text-[10px] font-bold rounded cursor-pointer transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleUpdateBookingStatus(b.id, 'Completed')}
                                className="px-1.5 py-0.7 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100/60 text-emerald-700 text-[10px] font-bold rounded cursor-pointer transition-colors"
                              >
                                Mark Done
                              </button>
                            </>
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

        {/* Notifications and Webhook Log Console */}
        <div id="logs-panel-column" className="bg-white">
          <NotificationLogPanel logs={notifications} />
        </div>

      </div>

    </div>
  );
}
