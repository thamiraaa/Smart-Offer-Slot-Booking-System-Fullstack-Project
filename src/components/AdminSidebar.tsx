import React from 'react';
import { 
  LayoutDashboard, 
  CirclePlus, 
  Settings, 
  ClipboardList, 
  Percent, 
  Database, 
  LogOut, 
  Globe, 
  Eye,
  CheckSquare
} from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  onLogout: () => void;
  businessName: string;
}

export default function AdminSidebar({ activeSection, setActiveSection, onLogout, businessName }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard Metric', icon: LayoutDashboard },
    { id: 'offers-list', label: 'Manage All Offers', icon: Percent },
    { id: 'create-offer', label: 'Publish New Offer', icon: CirclePlus },
    { id: 'bookings-list', label: 'Reservations Ledger', icon: ClipboardList },
    { id: 'profile-config', label: 'Business Profile', icon: Settings },
    { id: 'db-code', label: 'PostgreSQL & .NET 8', icon: Database }
  ];

  return (
    <aside id="admin-sidebar" className="w-64 bg-slate-900 text-slate-100 flex flex-col shrink-0 border-r border-slate-800 h-screen sticky top-0">
      {/* Brand */}
      <div id="sidebar-brand" className="p-6 border-b border-slate-800 bg-slate-950 flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
            <Percent className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white leading-none">SmartOffer</h1>
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Slot System</span>
          </div>
        </div>
        <div className="mt-2 text-[11px] text-slate-400 truncate bg-slate-900/60 px-2 py-1 rounded border border-slate-800 font-mono">
          🏢 {businessName || "Apex Cardio Gym"}
        </div>
      </div>

      {/* Nav Menu */}
      <nav id="sidebar-nav" className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        <span className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
          Management Console
        </span>
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-150 cursor-pointer ${
                isActive 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 block' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <IconComponent className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom controls */}
      <div id="sidebar-bottom" className="p-4 border-t border-slate-800 bg-slate-950 space-y-2">
        {/* Switch View Quickly for Viva */}
        <button
          onClick={() => setActiveSection('public-listing')}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 font-semibold active:bg-slate-700 text-slate-300 rounded-xl text-xs transition-colors border border-slate-700 cursor-pointer"
        >
          <Globe className="h-3.5 w-3.5 text-indigo-400 animate-spin-slow" />
          <span>Switch to Customer View</span>
        </button>

        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-rose-500/10 hover:bg-rose-500 hover:text-white font-semibold text-rose-400 rounded-xl text-xs transition-colors cursor-pointer"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Sign Out Session</span>
        </button>
      </div>
    </aside>
  );
}
