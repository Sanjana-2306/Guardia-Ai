import React from 'react';
import {
  Shield, Activity, AlertTriangle, LogOut,
  LayoutDashboard, List, Flag, ChevronRight
} from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard',    icon: LayoutDashboard },
  { id: 'transactions', label: 'Transactions', icon: List },
  { id: 'alerts',    label: 'Fraud Alerts', icon: Flag },
  { id: 'submit',    label: 'Submit Test',  icon: Activity },
];

export default function Sidebar({ activeTab, setActiveTab, user, onLogout, stats }) {
  const fraudRate = stats?.fraudRate ?? 0;
  const isHighAlert = fraudRate > 20;

  return (
    <aside className="w-64 min-h-screen bg-soc-surface border-r border-soc-border flex flex-col">
      {/* Brand */}
      <div className="p-6 border-b border-soc-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-soc-text text-sm">Guardia-AI</p>
            <p className="text-soc-muted text-xs">SOC Dashboard</p>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="p-4 border-b border-soc-border">
        <div className={`flex items-center gap-2 p-3 rounded-xl ${isHighAlert ? 'bg-red-500/10 border border-red-500/30' : 'bg-emerald-500/10 border border-emerald-500/30'}`}>
          <div className={`pulse-dot ${isHighAlert ? 'pulse-dot-danger' : 'pulse-dot-success'}`}>
            <span />
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-xs font-semibold ${isHighAlert ? 'text-red-400' : 'text-emerald-400'}`}>
              {isHighAlert ? 'HIGH THREAT LEVEL' : 'SYSTEM NOMINAL'}
            </p>
            <p className="text-soc-muted text-xs truncate">
              Fraud rate: {fraudRate.toFixed(1)}%
            </p>
          </div>
          {isHighAlert && <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 text-left group
              ${activeTab === id
                ? 'bg-soc-accent text-white shadow-lg'
                : 'text-soc-subtext hover:bg-soc-border/50 hover:text-soc-text'
              }`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span className="flex-1">{label}</span>
            {activeTab === id && <ChevronRight className="w-3 h-3 opacity-70" />}
          </button>
        ))}
      </nav>

      {/* User info + logout */}
      <div className="p-4 border-t border-soc-border">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-soc-card mb-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
            {user?.email?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-soc-text text-xs font-medium truncate">{user?.email}</p>
            <p className="text-soc-muted text-xs">{user?.role}</p>
          </div>
        </div>
        <button onClick={onLogout} className="btn-ghost w-full justify-center text-xs">
          <LogOut className="w-3.5 h-3.5" /> Sign Out
        </button>
      </div>
    </aside>
  );
}
