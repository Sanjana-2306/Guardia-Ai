/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark SOC dashboard palette
        'soc-bg':       '#090e1a',
        'soc-surface':  '#0f1729',
        'soc-card':     '#141e33',
        'soc-border':   '#1e2d4a',
        'soc-accent':   '#3b82f6',
        'soc-accent2':  '#6366f1',
        'soc-danger':   '#ef4444',
        'soc-warning':  '#f59e0b',
        'soc-success':  '#10b981',
        'soc-muted':    '#64748b',
        'soc-text':     '#e2e8f0',
        'soc-subtext':  '#94a3b8',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-slow':  'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in':     'fadeIn 0.3s ease-in-out',
        'slide-up':    'slideUp 0.4s ease-out',
        'glow-danger': 'glowDanger 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:     { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        slideUp:    { '0%': { transform: 'translateY(16px)', opacity: 0 }, '100%': { transform: 'translateY(0)', opacity: 1 } },
        glowDanger: { '0%, 100%': { boxShadow: '0 0 8px rgba(239,68,68,0.4)' }, '50%': { boxShadow: '0 0 20px rgba(239,68,68,0.8)' } },
      },
      backgroundImage: {
        'grid-pattern': "url(\"data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0z' fill='none'/%3E%3Cpath d='M0 0v40M40 0v40M0 0h40M0 40h40' stroke='%231e2d4a' stroke-width='0.5'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
}
