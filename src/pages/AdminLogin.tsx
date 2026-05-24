import React, { useState } from 'react';
import { Mail, Lock, ShieldAlert, MonitorCheck, ArrowRight, ShieldCheck } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (token: string, user: { email: string; name: string; role: string }) => void;
  onBackToCustomer: () => void;
}

export default function AdminLogin({ onLoginSuccess, onBackToCustomer }: LoginProps) {
  const [email, setEmail] = useState('admin@apexcardio.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Authentication failed. Please verify credentials.");
      }

      onLoginSuccess(data.token, data.user);
    } catch (err: any) {
      setError(err.message || "Failed to make authentication request.");
    } finally {
      setLoading(false);
    }
  };

  const initCredentials = (roleType: 'admin' | 'guest') => {
    if (roleType === 'admin') {
      setEmail('admin@apexcardio.com');
      setPassword('admin123');
    } else {
      setEmail('manager@apexcardio.com');
      setPassword('password');
    }
  };

  return (
    <div id="login-screen-root" className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-slate-50">
      <div id="login-card-container" className="max-w-md w-full bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
        
        {/* Banner */}
        <div id="login-banner" className="bg-slate-900 px-6 py-8 text-white flex flex-col items-center justify-center text-center gap-2">
          <div className="bg-indigo-600 p-2.5 rounded-2xl">
            <ShieldCheck className="h-6 w-6 text-white animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">Management Suite Sign-In</h2>
            <p className="text-xs text-slate-400">Authenticated dashboard for managing custom slot offers and database ledgers.</p>
          </div>
        </div>

        {/* Content */}
        <div id="login-body" className="p-8 space-y-6">
          {error && (
            <div id="login-error-toast" className="p-4 bg-rose-50 border border-rose-100/80 rounded-2xl flex items-start gap-3 text-xs text-rose-700 font-medium">
              <ShieldAlert className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form id="login-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">Admin Username/Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@apexcardio.com"
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-800"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">Security Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="admin123"
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-800"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 rounded-xl text-xs tracking-wide transition-colors shadow-lg cursor-pointer max-md:py-2.5 active:bg-slate-900"
            >
              {loading ? (
                <span>Verifying credentials...</span>
              ) : (
                <>
                  <span>Sign In Secured Console</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Credential Seeder (Bonus Helper) */}
          <div id="quick-seed-credentials" className="pt-4 border-t border-slate-100 flex flex-col gap-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Quick Seed / Demo-Skip credentials:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => initCredentials('admin')}
                className="px-2.5 py-1.5 bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-100/60 rounded-xl text-[11px] font-semibold text-indigo-700 text-left cursor-pointer transition-all"
              >
                <div>Alexandra (Admin)</div>
                <div className="text-[9px] text-indigo-500 font-mono">admin@apexcardios.com</div>
              </button>
              <button
                type="button"
                onClick={() => initCredentials('guest')}
                className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 rounded-xl text-[11px] font-semibold text-slate-700 text-left cursor-pointer transition-all"
              >
                <div>Quick Demo Manager</div>
                <div className="text-[9px] text-slate-500 font-mono">manager (any email)</div>
              </button>
            </div>
          </div>

          <button
            onClick={onBackToCustomer}
            className="w-full text-center text-xs text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer block"
          >
            ← Cancel and Return to Booking Listings
          </button>

        </div>
      </div>
    </div>
  );
}
