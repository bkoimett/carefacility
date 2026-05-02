/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'premium-bg': '#070D19',
        'premium-card': '#0B1426',
        'premium-card-hover': '#0E1930',
        'premium-border': '#1A263D',
        'premium-text-primary': '#F0F4FF',
        'premium-text-secondary': '#6B7FA3',
        'premium-text-muted': '#3D4F6B',
        'premium-cyan': {
          DEFAULT: '#06B6D4',
          400: '#22D3EE',
          600: '#0891B2',
          'glow': 'rgba(6,182,212,0.15)'
        },
        'premium-amber': {
          DEFAULT: '#F59E0B',
          'glow': 'rgba(245,158,11,0.12)'
        },
        'premium-red': {
          DEFAULT: '#EF4444',
          'glow': 'rgba(239,68,68,0.12)'
        },
        'premium-green': {
          DEFAULT: '#10B981',
          'glow': 'rgba(16,185,129,0.12)'
        }
      },
      borderRadius: {
        'premium': '14px',
        'premium-sm': '8px',
        'premium-lg': '20px'
      },
      boxShadow: {
        'premium': '0 8px 32px -8px rgba(2,4,12,0.6), 0 0 0 1px rgba(26,38,61,0.8)',
        'premium-glow-cyan': '0 0 24px rgba(6,182,212,0.2)',
        'premium-inset': 'inset 0 1px 0 rgba(255,255,255,0.04)'
      },
      fontFamily: {
        display: ['DM Serif Display', 'Georgia', 'serif'],
        body: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      }
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        careclinic: {
          'primary': '#0f4c75',
          'primary-content': '#ffffff',
          'secondary': '#1b6ca8',
          'secondary-content': '#ffffff',
          'accent': '#e8a838',
          'accent-content': '#1a1a1a',
          'neutral': '#1e2a38',
          'neutral-content': '#d1dde8',
          'base-100': '#f7f9fc',
          'base-200': '#eef2f7',
          'base-300': '#dde5ef',
          'base-content': '#1e2a38',
          'info': '#3b82f6',
          'success': '#10b981',
          'warning': '#f59e0b',
          'error': '#ef4444',
        }
      },
      {
        carenight: {
          'primary': '#3b82f6',
          'primary-content': '#ffffff',
          'secondary': '#6366f1',
          'secondary-content': '#ffffff',
          'accent': '#f59e0b',
          'accent-content': '#1a1a1a',
          'neutral': '#334155',
          'neutral-content': '#e2e8f0',
          'base-100': '#0f172a',
          'base-200': '#1e293b',
          'base-300': '#334155',
          'base-content': '#e2e8f0',
          'info': '#38bdf8',
          'success': '#34d399',
          'warning': '#fbbf24',
          'error': '#f87171',
        }
      }
    ],
    defaultTheme: 'careclinic',
  }
}
