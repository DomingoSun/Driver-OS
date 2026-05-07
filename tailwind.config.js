/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base: '#000000',
        surface: '#0D0D0D',
        'surface-2': '#141414',
        'border-dim': '#1A1A1A',
        'accent-blue': '#00D1FF',
        'accent-green': '#39FF14',
        'accent-red': '#FF3B3B',
        'accent-yellow': '#FFD600',
        'text-primary': '#FFFFFF',
        'text-muted': '#6B7280',
        'text-dim': '#374151',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'glow-blue': '0 0 16px rgba(0,209,255,0.35)',
        'glow-green': '0 0 16px rgba(57,255,20,0.35)',
        'glow-red': '0 0 16px rgba(255,59,59,0.35)',
      },
    },
  },
  plugins: [],
}
