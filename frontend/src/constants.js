/**
 * Frontend constants and configuration
 */

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
  },
  TRANSACTIONS: {
    SUBMIT: '/api/transactions',
    GET_ALL: '/api/transactions',
    GET_FLAGGED: '/api/transactions/flagged',
  },
  DASHBOARD: {
    STATS: '/api/dashboard/stats',
    PING: '/api/dashboard/ping',
  },
};

export const FRAUD_RULES = {
  VELOCITY_CHECK: {
    label: 'Velocity Check',
    description: '>3 transactions in 60 seconds',
    icon: '⚡',
    severity: 'warning',
  },
  GEO_IMPOSSIBILITY: {
    label: 'Geo Impossibility',
    description: 'Travel speed >800 km/h',
    icon: '🌍',
    severity: 'danger',
  },
  THRESHOLD_ANOMALY: {
    label: 'Threshold Anomaly',
    description: 'Amount >400% of historical average',
    icon: '📈',
    severity: 'danger',
  },
};

export const RISK_LEVELS = {
  HIGH: { threshold: 60, label: 'HIGH RISK', color: '#ef4444', bg: 'from-red-500/10 to-rose-500/10' },
  MEDIUM: { threshold: 30, label: 'MEDIUM RISK', color: '#f59e0b', bg: 'from-amber-500/10 to-orange-500/10' },
  LOW: { threshold: 0, label: 'LOW RISK', color: '#10b981', bg: 'from-emerald-500/10 to-green-500/10' },
};

export const TOAST_DURATION = 5000; // ms

export const DEMO_CREDENTIALS = [
  { email: 'admin@guardia.ai', password: 'Admin@1234', role: 'ADMIN' },
  { email: 'analyst@guardia.ai', password: 'Analyst@1234', role: 'ANALYST' },
];

export const REFRESH_INTERVALS = {
  DASHBOARD: 10000, // 10s
  TRANSACTIONS: 8000, // 8s
  STATS: 12000, // 12s
};

export const PAGE_SIZES = {
  TRANSACTIONS_TABLE: 20,
  FLAGGED_TABLE: 15,
};

export const ANIMATION_DURATION = {
  FADE: 300,
  SLIDE: 400,
  BOUNCE: 600,
};
