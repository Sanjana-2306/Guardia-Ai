import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, ChevronDown, ChevronUp, Search, Filter } from 'lucide-react';
import RiskModal from './RiskModal';

function RiskBadge({ score }) {
  if (score >= 60) return <span className="badge-danger">{score.toFixed(0)}</span>;
  if (score >= 30) return <span className="badge-warning">{score.toFixed(0)}</span>;
  return <span className="badge-success">{score.toFixed(0)}</span>;
}

function StatusBadge({ fraudulent }) {
  return fraudulent
    ? <span className="badge-danger flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Flagged</span>
    : <span className="badge-success flex items-center gap-1"><CheckCircle  className="w-3 h-3" /> Cleared</span>;
}

export default function TransactionTable({ transactions = [], loading }) {
  const [selected, setSelected]       = useState(null);
  const [search, setSearch]           = useState('');
  const [filter, setFilter]           = useState('all'); // all | flagged | cleared
  const [sortField, setSortField]     = useState('timestamp');
  const [sortDir, setSortDir]         = useState('desc');

  const toggleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ChevronDown className="w-3 h-3 opacity-30" />;
    return sortDir === 'asc'
      ? <ChevronUp   className="w-3 h-3 text-soc-accent" />
      : <ChevronDown className="w-3 h-3 text-soc-accent" />;
  };

  const filtered = transactions
    .filter(t => {
      const q = search.toLowerCase();
      const matchSearch = !q || t.userId?.toLowerCase().includes(q)
        || t.merchantName?.toLowerCase().includes(q);
      const matchFilter = filter === 'all'
        || (filter === 'flagged' && t.fraudulent)
        || (filter === 'cleared' && !t.fraudulent);
      return matchSearch && matchFilter;
    })
    .sort((a, b) => {
      let va = a[sortField], vb = b[sortField];
      if (sortField === 'timestamp') { va = new Date(va); vb = new Date(vb); }
      if (va < vb) return sortDir === 'asc' ? -1 :  1;
      if (va > vb) return sortDir === 'asc' ?  1 : -1;
      return 0;
    });

  if (loading) return (
    <div className="card animate-pulse space-y-3">
      <div className="h-5 bg-soc-border rounded w-1/3" />
      {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-soc-border rounded" />)}
    </div>
  );

  return (
    <>
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-soc-muted" />
          <input
            className="input pl-9 py-2"
            placeholder="Search by user ID or merchant…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {['all', 'flagged', 'cleared'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`btn text-xs capitalize py-2 px-3 ${filter === f ? 'btn-primary' : 'btn-ghost'}`}
            >
              {f === 'flagged' && <AlertTriangle className="w-3 h-3" />}
              {f === 'cleared' && <CheckCircle   className="w-3 h-3" />}
              {f === 'all'     && <Filter        className="w-3 h-3" />}
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="soc-table">
            <thead>
              <tr>
                {[
                  { label: 'User ID',   field: 'userId' },
                  { label: 'Merchant',  field: 'merchantName' },
                  { label: 'Amount',    field: 'amount' },
                  { label: 'Risk Score',field: 'riskScore' },
                  { label: 'Status',    field: 'fraudulent' },
                  { label: 'Time',      field: 'timestamp' },
                ].map(({ label, field }) => (
                  <th key={field} onClick={() => toggleSort(field)}
                    className="cursor-pointer select-none hover:text-soc-text transition-colors">
                    <span className="flex items-center gap-1">{label} <SortIcon field={field} /></span>
                  </th>
                ))}
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-soc-muted">No transactions found</td></tr>
              ) : filtered.map((tx) => (
                <tr
                  key={tx.id}
                  className={tx.fraudulent ? 'bg-red-500/5' : ''}
                >
                  <td className="font-mono text-xs text-soc-subtext">{tx.userId}</td>
                  <td className="text-soc-text font-medium">{tx.merchantName}</td>
                  <td className="font-mono text-soc-text font-semibold">
                    ${tx.amount?.toFixed(2)}
                  </td>
                  <td><RiskBadge score={tx.riskScore ?? 0} /></td>
                  <td><StatusBadge fraudulent={tx.fraudulent} /></td>
                  <td className="text-soc-muted text-xs font-mono">
                    {tx.timestamp ? new Date(tx.timestamp).toLocaleString() : '—'}
                  </td>
                  <td>
                    <button
                      onClick={() => setSelected(tx)}
                      className="btn-ghost text-xs py-1 px-2"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-soc-border flex items-center justify-between">
          <p className="text-soc-muted text-xs">
            Showing <span className="text-soc-text font-medium">{filtered.length}</span> of{' '}
            <span className="text-soc-text font-medium">{transactions.length}</span> transactions
          </p>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-xs text-soc-muted mr-3">Flagged</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs text-soc-muted">Cleared</span>
          </div>
        </div>
      </div>

      {selected && <RiskModal tx={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
