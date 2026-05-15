import React, { useEffect } from 'react';
import { X, AlertTriangle, CheckCircle, Brain, MapPin, Clock, DollarSign, User, Zap } from 'lucide-react';

function RiskGauge({ score }) {
  const color = score >= 60 ? '#ef4444' : score >= 30 ? '#f59e0b' : '#10b981';
  const pct   = Math.min(score, 100);
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="50" fill="none" stroke="#1e2d4a" strokeWidth="10" />
          <circle
            cx="60" cy="60" r="50"
            fill="none" stroke={color} strokeWidth="10"
            strokeDasharray={`${2 * Math.PI * 50}`}
            strokeDashoffset={`${2 * Math.PI * 50 * (1 - pct / 100)}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease-out', filter: `drop-shadow(0 0 6px ${color})` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold font-mono" style={{ color }}>{score?.toFixed(0)}</span>
          <span className="text-soc-muted text-xs">/ 100</span>
        </div>
      </div>
      <p className="text-xs font-medium" style={{ color }}>
        {score >= 60 ? 'HIGH RISK' : score >= 30 ? 'MEDIUM RISK' : 'LOW RISK'}
      </p>
    </div>
  );
}

export default function RiskModal({ tx, onClose }) {
  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const rules = tx.triggeredRules?.filter(Boolean) ?? [];

  const ruleLabels = {
    VELOCITY_CHECK:   { label: 'Velocity Check',        icon: '⚡', color: 'badge-warning' },
    GEO_IMPOSSIBILITY:{ label: 'Geo Impossibility',     icon: '🌍', color: 'badge-danger'  },
    THRESHOLD_ANOMALY:{ label: 'Threshold Anomaly',     icon: '📈', color: 'badge-danger'  },
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" />

      {/* Modal */}
      <div className="relative w-full max-w-2xl glass rounded-2xl shadow-2xl animate-slide-up overflow-hidden">
        {/* Header */}
        <div className={`px-6 py-4 border-b border-soc-border flex items-center justify-between
          ${tx.fraudulent ? 'bg-red-500/10' : 'bg-emerald-500/10'}`}>
          <div className="flex items-center gap-3">
            {tx.fraudulent
              ? <AlertTriangle className="w-5 h-5 text-red-400" />
              : <CheckCircle   className="w-5 h-5 text-emerald-400" />}
            <div>
              <h2 className="font-bold text-soc-text">
                {tx.fraudulent ? '🚨 Fraud Alert' : '✅ Clean Transaction'}
              </h2>
              <p className="text-soc-muted text-xs font-mono">TX #{tx.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-soc-muted hover:text-soc-text transition-colors p-1 rounded-lg hover:bg-soc-border">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Top: gauge + info grid */}
          <div className="flex flex-col sm:flex-row gap-6">
            <RiskGauge score={tx.riskScore ?? 0} />

            <div className="flex-1 grid grid-cols-2 gap-3">
              {[
                { icon: User,       label: 'User ID',   value: tx.userId },
                { icon: DollarSign, label: 'Amount',    value: `$${tx.amount?.toFixed(2)}` },
                { icon: Zap,        label: 'Merchant',  value: tx.merchantName },
                { icon: Clock,      label: 'Time',      value: tx.timestamp ? new Date(tx.timestamp).toLocaleString() : '—' },
                { icon: MapPin,     label: 'Latitude',  value: tx.latitude?.toFixed(4) },
                { icon: MapPin,     label: 'Longitude', value: tx.longitude?.toFixed(4) },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="bg-soc-card rounded-xl p-3 border border-soc-border">
                  <p className="text-soc-muted text-xs mb-1 flex items-center gap-1">
                    <Icon className="w-3 h-3" /> {label}
                  </p>
                  <p className="text-soc-text text-sm font-medium font-mono truncate">{value ?? '—'}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Triggered Rules */}
          {rules.length > 0 && (
            <div>
              <h3 className="text-soc-subtext text-xs font-semibold uppercase tracking-wider mb-2">
                Triggered Rules
              </h3>
              <div className="flex flex-wrap gap-2">
                {rules.map(r => {
                  const meta = ruleLabels[r] ?? { label: r, icon: '🔴', color: 'badge-danger' };
                  return (
                    <span key={r} className={meta.color}>
                      {meta.icon} {meta.label}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* AI Explanation */}
          {tx.aiExplanation && (
            <div className="bg-soc-card rounded-xl p-4 border border-soc-border">
              <h3 className="text-soc-subtext text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2">
                <Brain className="w-4 h-4 text-soc-accent" />
                AI Explanation (Gemini)
              </h3>
              <p className="text-soc-text text-sm leading-relaxed">{tx.aiExplanation}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-soc-border flex justify-end">
          <button onClick={onClose} className="btn-ghost">Close</button>
        </div>
      </div>
    </div>
  );
}
