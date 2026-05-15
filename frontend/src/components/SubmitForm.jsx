import React, { useState } from 'react';
import { submitTransaction } from '../services/api';
import { Send, MapPin, User, DollarSign, Store, AlertTriangle, CheckCircle } from 'lucide-react';

const DEMO_PAYLOADS = [
  {
    label: '⚡ Velocity Fraud',
    data: { userId: 'user-101', amount: 150, merchantName: 'Quick Mart', latitude: 13.0827, longitude: 80.2707 },
  },
  {
    label: '🌍 Geo Impossibility',
    data: { userId: 'user-202', amount: 750, merchantName: 'Dubai Duty Free', latitude: 25.2048, longitude: 55.2708 },
  },
  {
    label: '📈 Threshold Spike',
    data: { userId: 'user-303', amount: 18500, merchantName: 'Crypto Exchange', latitude: 28.6139, longitude: 77.2090 },
  },
  {
    label: '✅ Clean Tx',
    data: { userId: 'user-new', amount: 55.0, merchantName: 'Local Cafe', latitude: 12.9716, longitude: 77.5946 },
  },
];

export default function SubmitForm() {
  const [form, setForm]     = useState({ userId: '', amount: '', merchantName: '', latitude: '', longitude: '' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setResult(null); setLoading(true);
    try {
      const payload = { ...form, amount: parseFloat(form.amount), latitude: parseFloat(form.latitude), longitude: parseFloat(form.longitude) };
      const res = await submitTransaction(payload);
      setResult(res);
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (data) => setForm({ userId: data.userId, amount: String(data.amount), merchantName: data.merchantName, latitude: String(data.latitude), longitude: String(data.longitude) });

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-soc-text font-bold text-xl mb-1">Submit Test Transaction</h2>
        <p className="text-soc-muted text-sm">Run a transaction through the live fraud engine to see real-time results.</p>
      </div>

      {/* Demo payloads */}
      <div>
        <p className="text-soc-muted text-xs uppercase tracking-wider mb-2">Quick-fill demos</p>
        <div className="grid grid-cols-2 gap-2">
          {DEMO_PAYLOADS.map(d => (
            <button key={d.label} onClick={() => fillDemo(d.data)} className="btn-ghost text-sm text-left">
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="card space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-soc-muted mb-1.5 flex items-center gap-1">
              <User className="w-3 h-3" /> User ID
            </label>
            <input className="input" value={form.userId} onChange={e => set('userId', e.target.value)} placeholder="user-001" required />
          </div>
          <div>
            <label className="block text-xs text-soc-muted mb-1.5 flex items-center gap-1">
              <DollarSign className="w-3 h-3" /> Amount (USD)
            </label>
            <input className="input" type="number" step="0.01" min="0.01" value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="500.00" required />
          </div>
          <div className="col-span-2">
            <label className="block text-xs text-soc-muted mb-1.5 flex items-center gap-1">
              <Store className="w-3 h-3" /> Merchant Name
            </label>
            <input className="input" value={form.merchantName} onChange={e => set('merchantName', e.target.value)} placeholder="e.g. Amazon" required />
          </div>
          <div>
            <label className="block text-xs text-soc-muted mb-1.5 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> Latitude
            </label>
            <input className="input" type="number" step="any" value={form.latitude} onChange={e => set('latitude', e.target.value)} placeholder="13.0827" required />
          </div>
          <div>
            <label className="block text-xs text-soc-muted mb-1.5 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> Longitude
            </label>
            <input className="input" type="number" step="any" value={form.longitude} onChange={e => set('longitude', e.target.value)} placeholder="80.2707" required />
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
          {loading
            ? <span className="flex items-center gap-2"><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>Analyzing…</span>
            : <span className="flex items-center gap-2"><Send className="w-4 h-4" />Run Fraud Check</span>
          }
        </button>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
            <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}
      </form>

      {/* Result */}
      {result && (
        <div className={`card animate-slide-up border-2 ${result.fraudulent ? 'border-red-500/50 bg-red-500/5' : 'border-emerald-500/50 bg-emerald-500/5'}`}>
          <div className="flex items-center gap-3 mb-4">
            {result.fraudulent
              ? <AlertTriangle className="w-6 h-6 text-red-400" />
              : <CheckCircle   className="w-6 h-6 text-emerald-400" />}
            <h3 className={`font-bold text-lg ${result.fraudulent ? 'text-red-400' : 'text-emerald-400'}`}>
              {result.fraudulent ? '🚨 FRAUD DETECTED' : '✅ Transaction Cleared'}
            </h3>
            <span className="ml-auto font-mono text-2xl font-bold" style={{ color: result.riskScore >= 60 ? '#ef4444' : result.riskScore >= 30 ? '#f59e0b' : '#10b981' }}>
              {result.riskScore?.toFixed(0)}<span className="text-soc-muted text-sm">/100</span>
            </span>
          </div>

          {result.triggeredRules?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {result.triggeredRules.map(r => <span key={r} className="badge-danger">{r}</span>)}
            </div>
          )}

          {result.aiExplanation && (
            <div className="bg-soc-card rounded-xl p-4 border border-soc-border">
              <p className="text-xs text-soc-muted uppercase tracking-wider mb-2">🤖 AI Explanation</p>
              <p className="text-soc-text text-sm leading-relaxed">{result.aiExplanation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
