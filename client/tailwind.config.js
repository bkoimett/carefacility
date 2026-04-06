/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"DM Serif Display"', 'Georgia', 'serif'],
        body: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
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
