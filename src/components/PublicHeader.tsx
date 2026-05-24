import React from 'react';
import { Percent, User, LogIn, ShieldCheck, Heart, Sparkles, Flame, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  isAdminLoggedIn: boolean;
  onAdminClick: () => void;
  onCustomerClick: () => void;
  activeSection: string;
  businessName: string;
}

export default function PublicHeader({ isAdminLoggedIn, onAdminClick, onCustomerClick, activeSection, businessName }: HeaderProps) {
  return (
    <header id="public-main-header" className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand/Logo */}
        <div id="header-brand-section" className="flex items-center gap-2 cursor-pointer" onClick={onCustomerClick}>
          <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-md shadow-indigo-600/20">
            <Percent className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-slate-900 leading-none">SmartOffer</h1>
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Appointment Center</span>
          </div>
        </div>

        {/* Live Status indicator */}
        <div id="api-status-pill" className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100 text-[11px] font-semibold animate-pulse">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>PostgreSQL & .NET 8 Live Simulation</span>
        </div>

        {/* Navigation CTAs */}
        <div id="header-nav-actions" className="flex items-center gap-3">
          <button
            onClick={onCustomerClick}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeSection === 'public-listing' || activeSection.startsWith('public-detail')
                ? 'bg-slate-100 text-slate-800'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Explore Deals
          </button>

          {isAdminLoggedIn ? (
            <button
              onClick={onAdminClick}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all shadow-md shadow-indigo-600/25 cursor-pointer"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Admin Dashboard</span>
            </button>
          ) : (
            <button
              onClick={onAdminClick}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 active:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors duration-150 cursor-pointer"
            >
              <LogIn className="h-3.5 w-3.5 text-slate-300" />
              <span>Sign In (Admin)</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
}
