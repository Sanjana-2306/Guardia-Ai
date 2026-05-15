import React, { useState } from 'react';
import { login } from '../services/api';
import { Shield, Lock, Mail, AlertTriangle, Eye, EyeOff, Zap } from 'lucide-react';

export default function LoginPage({ onLogin }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [breachAlert, setBreachAlert] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBreachAlert(null);
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      localStorage.setItem('guardia_token', data.token);

      // Show breach warning if detected
      if (data.breachInfo?.breached) {
        setBreachAlert(`⚠️ Your password was found in ${data.breachInfo.breachCount.toLocaleString()} data breaches. Change it immediately.`);
        setTimeout(() => onLogin(data), 3000);
      } else {
        onLogin(data);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (email, password) => setForm({ email, password });

  return (
    <div className="min-h-screen bg-soc-bg bg-grid-pattern flex items-center justify-center p-4">
      {/* Ambient glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 animate-slide-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 mb-4 shadow-lg bg-accent-glow">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gradient mb-1">Guardia-AI</h1>
          <p className="text-soc-subtext text-sm">Security Operations Center</p>
        </div>

        {/* Card */}
        <div className="glass rounded-2xl p-8">
          <h2 className="text-xl font-semibold text-soc-text mb-6">Sign in to your account</h2>

          {/* Breach Alert */}
          {breachAlert && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 mb-5 animate-fade-in">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <p className="text-red-300 text-sm">{breachAlert}</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 mb-5 animate-fade-in">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-soc-subtext mb-1.5">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-soc-muted" />
                <input
                  type="email"
                  className="input pl-10"
                  placeholder="admin@guardia.ai"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-soc-subtext mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-soc-muted" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input pl-10 pr-10"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-soc-muted hover:text-soc-text transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3 text-base mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  Authenticating…
                </span>
              ) : (
                <span className="flex items-center gap-2"><Zap className="w-4 h-4" /> Sign In</span>
              )}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 pt-5 border-t border-soc-border">
            <p className="text-xs text-soc-muted text-center mb-3">Demo Credentials</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillDemo('admin@guardia.ai', 'Admin@1234')}
                className="btn-ghost text-xs py-2 justify-center"
              >
                👑 Admin
              </button>
              <button
                type="button"
                onClick={() => fillDemo('analyst@guardia.ai', 'Analyst@1234')}
                className="btn-ghost text-xs py-2 justify-center"
              >
                🔍 Analyst
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-soc-muted text-xs mt-6">
          Protected by HIBP Breach Intelligence + JWT Auth
        </p>
      </div>
    </div>
  );
}
