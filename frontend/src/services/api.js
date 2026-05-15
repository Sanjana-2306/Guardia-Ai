import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Attach JWT on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('guardia_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('guardia_token');
      localStorage.removeItem('guardia_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

/* ── Auth ──────────────────────────────────────────────── */
export const login = (email, password) =>
  api.post('/api/auth/login', { email, password }).then((r) => r.data);

/* ── Transactions ──────────────────────────────────────── */
export const getTransactions  = ()      => api.get('/api/transactions').then((r) => r.data);
export const getFlagged       = ()      => api.get('/api/transactions/flagged').then((r) => r.data);
export const submitTransaction = (data) => api.post('/api/transactions', data).then((r) => r.data);

/* ── Dashboard ─────────────────────────────────────────── */
export const getDashboardStats = () => api.get('/api/dashboard/stats').then((r) => r.data);

export default api;
