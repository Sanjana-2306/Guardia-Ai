import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function StatsCards({ stats, loading }) {
  if (loading) return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="stat-card animate-pulse">
          <div className="h-4 bg-soc-border rounded w-2/3 mb-3" />
          <div className="h-8 bg-soc-border rounded w-1/2 mb-2" />
          <div className="h-3 bg-soc-border rounded w-full" />
        </div>
      ))}
    </div>
  );

  const cards = [
    {
      label: 'Total Transactions',
      value: stats?.totalTransactions?.toLocaleString() ?? '—',
      sub: 'All time processed',
      color: 'text-soc-accent',
      bg: 'from-blue-500/10 to-indigo-500/10',
      icon: '📊',
      trend: null,
    },
    {
      label: 'Fraud Detected',
      value: stats?.fraudulentTransactions?.toLocaleString() ?? '—',
      sub: `${stats?.fraudRate?.toFixed(1) ?? 0}% of all transactions`,
      color: 'text-red-400',
      bg: 'from-red-500/10 to-rose-500/10',
      icon: '🚨',
      trend: stats?.fraudRate > 10 ? 'up' : 'down',
    },
    {
      label: 'Fraud Rate',
      value: `${stats?.fraudRate?.toFixed(1) ?? 0}%`,
      sub: stats?.fraudRate > 20 ? 'High alert threshold exceeded' : 'Within acceptable range',
      color: stats?.fraudRate > 20 ? 'text-red-400' : stats?.fraudRate > 10 ? 'text-amber-400' : 'text-emerald-400',
      bg: stats?.fraudRate > 20 ? 'from-red-500/10 to-rose-500/10' : 'from-emerald-500/10 to-teal-500/10',
      icon: stats?.fraudRate > 20 ? '⚠️' : '✅',
      trend: null,
    },
    {
      label: 'Avg Risk Score',
      value: stats?.averageRiskScore?.toFixed(1) ?? '—',
      sub: 'Out of 100 · All transactions',
      color: stats?.averageRiskScore > 30 ? 'text-amber-400' : 'text-soc-accent',
      bg: 'from-amber-500/10 to-orange-500/10',
      icon: '🎯',
      trend: null,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <div key={i} className="stat-card animate-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
          {/* Background gradient */}
          <div className={`absolute inset-0 bg-gradient-to-br ${card.bg} rounded-xl opacity-60`} />

          <div className="relative">
            <div className="flex items-start justify-between mb-3">
              <p className="text-soc-muted text-xs font-medium uppercase tracking-wider">{card.label}</p>
              <span className="text-xl">{card.icon}</span>
            </div>

            <p className={`text-3xl font-bold ${card.color} mb-1 font-mono`}>{card.value}</p>

            <div className="flex items-center gap-1.5">
              {card.trend === 'up'   && <TrendingUp   className="w-3 h-3 text-red-400" />}
              {card.trend === 'down' && <TrendingDown  className="w-3 h-3 text-emerald-400" />}
              {card.trend === null   && <Minus         className="w-3 h-3 text-soc-muted" />}
              <p className="text-soc-muted text-xs">{card.sub}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
