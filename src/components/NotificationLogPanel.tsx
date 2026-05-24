import React from 'react';
import { Bell, Info, XCircle, CheckCircle, Smartphone } from 'lucide-react';
import { NotificationLog } from '../types';

interface LogsProps {
  logs: NotificationLog[];
  onClear?: () => void;
}

export default function NotificationLogPanel({ logs, onClear }: LogsProps) {
  return (
    <div id="logs-panel-root" className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm h-full flex flex-col justify-between">
      <div>
        <div id="logs-panel-header" className="flex items-center justify-between mb-4 border-b border-slate-50 pb-3">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-indigo-600 animate-bounce" />
            <h4 className="text-sm font-semibold text-slate-900">Virtual MQ Notifications Logger</h4>
          </div>
          <span className="text-[10px] font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
            Live Queue
          </span>
        </div>

        <p className="text-[11px] text-slate-500 mb-4 font-normal">
          This logs simulated background notifications, mimicking real webhook logs pushed during operations.
        </p>

        <div id="logs-list-scroller" className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
          {logs.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-400 font-medium">
              No recent alerts in buffer.
            </div>
          ) : (
            logs.map((log) => {
              let iconColor = "bg-blue-50 text-blue-600 border-blue-100";
              let icon = <Info className="h-3 w-3" />;
              
              if (log.type === "booking_received") {
                iconColor = "bg-indigo-50 text-indigo-600 border-indigo-100";
                icon = <Bell className="h-3 w-3" />;
              } else if (log.type === "booking_confirmed" || log.type === "status_changed") {
                iconColor = "bg-emerald-50 text-emerald-600 border-emerald-100";
                icon = <CheckCircle className="h-3 w-3" />;
              } else if (log.type === "booking_cancelled") {
                iconColor = "bg-rose-50 text-rose-600 border-rose-100";
                icon = <XCircle className="h-3 w-3" />;
              }

              return (
                <div key={log.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                    <span className={`px-1.5 py-0.2 rounded-full border text-[9px] font-semibold ${iconColor}`}>
                      {log.type.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-slate-700 font-medium text-[11px] leading-snug">{log.message}</p>
                  {log.referenceNumber && (
                    <div className="text-[9px] font-mono text-indigo-600 font-semibold bg-white px-1.5 py-0.5 rounded border border-slate-200/60 inline-block">
                      Ref: {log.referenceNumber}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {logs.length > 0 && onClear && (
        <button
          onClick={onClear}
          className="w-full text-center mt-4 text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer border-t border-slate-100 pt-3"
        >
          Clear Logs Buffer
        </button>
      )}
    </div>
  );
}
