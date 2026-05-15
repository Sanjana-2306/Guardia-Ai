import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import StatsCards from '../components/StatsCards';
import TransactionTable from '../components/TransactionTable';
import FraudChart from '../components/FraudChart';
import SubmitForm from '../components/SubmitForm';
import { getDashboardStats, getTransactions, getFlagged } from '../services/api';
import { RefreshCw, Bell, AlertTriangle } from 'lucide-react';

export default function DashboardPage({ user, onLogout }) {
  const [activeTab, setActiveTab]   = useState('dashboard');
  const [stats, setStats]           = useState(null);
  const [transactions, setTxns]     = useState([]);
  const [flagged, setFlagged]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [alertCount, setAlertCount] = useState(0);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setStatsLoading(true);
    try {
      const [s, t, f] = await Promise.all([
        getDashboardStats(),
        getTransactions(),
        getFlagged(),
      ]);
      setStats(s);
      setTxns(t);
      setFlagged(f);
      setAlertCount(f.length);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Auto-refresh every 30s
  useEffect(() => {
    const id = setInterval(fetchAll, 30000);
    return () => clearInterval(id);
  }, [fetchAll]);

  const tabTitle = {
    dashboard:    'Security Overview',
    transactions: 'All Transactions',
    alerts:       'Fraud Alerts',
    submit:       'Submit Transaction',
  };

  return (
    <div className="flex h-screen bg-soc-bg overflow-hidden">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={onLogout}
        stats={stats}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-soc-surface border-b border-soc-border flex items-center justify-between px-6 shrink-0">
          <div>
            <h1 className="text-soc-text font-semibold text-base">{tabTitle[activeTab]}</h1>
            <p className="text-soc-muted text-xs">
              Last updated: {lastRefresh.toLocaleTimeString()} · Auto-refresh 30s
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Alert bell */}
            <div className="relative">
              <button className="btn-ghost p-2.5 relative">
                <Bell className="w-4 h-4" />
                {alertCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold animate-pulse">
                    {alertCount > 9 ? '9+' : alertCount}
                  </span>
                )}
              </button>
            </div>

            {/* High fraud rate warning */}
            {stats?.fraudRate > 20 && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/15 border border-red-500/30 animate-glow-danger">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                <span className="text-red-400 text-xs font-semibold">High Fraud Rate</span>
              </div>
            )}

            {/* Refresh */}
            <button
              onClick={fetchAll}
              disabled={loading}
              className="btn-ghost p-2.5"
              title="Refresh data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-soc-accent' : ''}`} />
            </button>
          </div>
        </header>

        {/* Scrollable body */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* ── Dashboard Tab ── */}
          {activeTab === 'dashboard' && (
            <>
              <StatsCards stats={stats} loading={statsLoading} />
              <FraudChart transactions={transactions} />

              {/* Recent alerts feed */}
              {stats?.recentRiskEvents?.length > 0 && (
                <div className="card">
                  <h3 className="text-soc-text font-semibold text-sm mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    Recent Risk Events
                  </h3>
                  <div className="space-y-2">
                    {stats.recentRiskEvents.slice(0, 5).map((e, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-soc-border/30 border border-soc-border/50 hover:bg-soc-border/50 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-soc-text text-sm font-medium">User <span className="font-mono text-soc-accent">{e.userId}</span></p>
                          <p className="text-soc-muted text-xs truncate">{e.triggeredRules?.join(', ')}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-red-400 font-mono font-bold text-sm">{e.riskScore?.toFixed(0)}</p>
                          <p className="text-soc-muted text-xs">{e.createdAt ? new Date(e.createdAt).toLocaleTimeString() : '—'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── Transactions Tab ── */}
          {activeTab === 'transactions' && (
            <TransactionTable transactions={transactions} loading={loading} />
          )}

          {/* ── Alerts Tab ── */}
          {activeTab === 'alerts' && (
            <TransactionTable transactions={flagged} loading={loading} />
          )}

          {/* ── Submit Tab ── */}
          {activeTab === 'submit' && (
            <SubmitForm />
          )}
        </main>
      </div>
    </div>
  );
}
