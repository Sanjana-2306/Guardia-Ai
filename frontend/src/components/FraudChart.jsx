import React from 'react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Legend
} from 'recharts';

const COLORS = {
  fraud:  '#ef4444',
  clean:  '#10b981',
  accent: '#3b82f6',
};

const tooltipStyle = {
  contentStyle: { background: '#141e33', border: '1px solid #1e2d4a', borderRadius: '12px', fontSize: '12px' },
  labelStyle:   { color: '#94a3b8' },
  itemStyle:    { color: '#e2e8f0' },
};

/** Build hourly distribution from transactions array */
function buildHourlyData(transactions) {
  const hours = {};
  for (let h = 0; h < 24; h++) hours[h] = { hour: `${String(h).padStart(2,'0')}:00`, fraud: 0, clean: 0 };
  transactions.forEach(tx => {
    if (!tx.timestamp) return;
    const h = new Date(tx.timestamp).getHours();
    if (tx.fraudulent) hours[h].fraud++;
    else hours[h].clean++;
  });
  return Object.values(hours);
}

/** Build rule frequency data */
function buildRuleData(transactions) {
  const counts = { VELOCITY_CHECK: 0, GEO_IMPOSSIBILITY: 0, THRESHOLD_ANOMALY: 0 };
  transactions.filter(t => t.fraudulent).forEach(tx => {
    const rules = (typeof tx.triggeredRules === 'string')
      ? tx.triggeredRules.split(',')
      : (tx.triggeredRules ?? []);
    rules.forEach(r => { if (r in counts) counts[r]++; });
  });
  return [
    { name: 'Velocity',  value: counts.VELOCITY_CHECK,    color: '#f59e0b' },
    { name: 'Geo',       value: counts.GEO_IMPOSSIBILITY, color: '#ef4444' },
    { name: 'Threshold', value: counts.THRESHOLD_ANOMALY, color: '#6366f1' },
  ].filter(d => d.value > 0);
}

export default function FraudChart({ transactions = [] }) {
  const hourly  = buildHourlyData(transactions);
  const ruleData = buildRuleData(transactions);
  const total   = transactions.length;
  const flagged = transactions.filter(t => t.fraudulent).length;

  const pieData = [
    { name: 'Fraudulent', value: flagged,        color: COLORS.fraud },
    { name: 'Legitimate', value: total - flagged, color: COLORS.clean },
  ].filter(d => d.value > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

      {/* --- Hourly Activity Area Chart --- */}
      <div className="card lg:col-span-2">
        <h3 className="text-soc-text font-semibold text-sm mb-4">Transaction Activity (24h)</h3>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={hourly} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="fraudGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}   />
              </linearGradient>
              <linearGradient id="cleanGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}   />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e2d4a" />
            <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#64748b' }} interval={3} />
            <YAxis tick={{ fontSize: 10, fill: '#64748b' }} allowDecimals={false} />
            <Tooltip {...tooltipStyle} />
            <Area type="monotone" dataKey="clean" stroke={COLORS.clean} fill="url(#cleanGrad)" strokeWidth={2} name="Clean" />
            <Area type="monotone" dataKey="fraud" stroke={COLORS.fraud} fill="url(#fraudGrad)" strokeWidth={2} name="Fraud" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* --- Pie Chart --- */}
      <div className="card flex flex-col items-center justify-center">
        <h3 className="text-soc-text font-semibold text-sm mb-4 self-start">Transaction Split</h3>
        {pieData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%" cy="50%"
                innerRadius={55} outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color}
                    style={{ filter: `drop-shadow(0 0 6px ${entry.color}66)` }} />
                ))}
              </Pie>
              <Tooltip {...tooltipStyle} />
              <Legend
                formatter={(value) => <span style={{ color: '#94a3b8', fontSize: 12 }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-soc-muted text-sm">No data yet</p>
        )}
      </div>

      {/* --- Rule Frequency Bar Chart --- */}
      {ruleData.length > 0 && (
        <div className="card lg:col-span-3">
          <h3 className="text-soc-text font-semibold text-sm mb-4">Fraud Rule Trigger Frequency</h3>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={ruleData} layout="vertical" margin={{ left: 10, right: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2d4a" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} allowDecimals={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} width={80} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]} name="Triggers">
                {ruleData.map((entry, i) => (
                  <Cell key={i} fill={entry.color}
                    style={{ filter: `drop-shadow(0 0 4px ${entry.color}88)` }} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
