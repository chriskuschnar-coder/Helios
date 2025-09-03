/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      screens: {
        'xs': '375px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
      },
      colors: {
        navy: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        gold: {
          50: '#fffdf7',
          100: '#fff3cd',
          200: '#ffe066',
          300: '#ffcc02',
          400: '#ffb000',
          500: '#ffd700',
          600: '#e6c200',
          700: '#cc9900',
          800: '#b38600',
          900: '#996600',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Segoe UI', 'system-ui', 'sans-serif'],
        mono: ['SF Mono', 'Monaco', 'Cascadia Code', 'Roboto Mono', 'monospace'],
      },
      fontSize: {
        'xs': ['11px', { lineHeight: '1.4', letterSpacing: '0.02em' }],
        'sm': ['13px', { lineHeight: '1.5', letterSpacing: '0.01em' }],
        'base': ['15px', { lineHeight: '1.6', letterSpacing: '0em' }],
        'lg': ['17px', { lineHeight: '1.6', letterSpacing: '-0.01em' }],
        'xl': ['20px', { lineHeight: '1.5', letterSpacing: '-0.02em' }],
        '2xl': ['24px', { lineHeight: '1.4', letterSpacing: '-0.02em' }],
        '3xl': ['30px', { lineHeight: '1.3', letterSpacing: '-0.03em' }],
        '4xl': ['36px', { lineHeight: '1.2', letterSpacing: '-0.03em' }],
        '5xl': ['48px', { lineHeight: '1.1', letterSpacing: '-0.04em' }],
        '6xl': ['60px', { lineHeight: '1.0', letterSpacing: '-0.04em' }],
      },
      animation: {
        'slide-up': 'slideUp 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        'fade-in': 'fadeIn 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
        'gold-glow': 'goldGlow 3s ease-in-out infinite',
      },
      transitionTimingFunction: {
        'premium': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'md': '8px',
        'lg': '16px',
        'xl': '24px',
        '2xl': '40px',
      },
      backgroundImage: {
        'gradient-gold': 'linear-gradient(135deg, #ffd700 0%, #ffb000 100%)',
        'gradient-success': 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        'gradient-danger': 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      const newUtilities = {
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none'
          }
        },
        '.touch-manipulation': {
          'touch-action': 'manipulation'
        },
        '.hardware-acceleration': {
          'transform': 'translateZ(0)',
          'backface-visibility': 'hidden',
          'will-change': 'transform'
        },
        '.text-balance': {
          'text-wrap': 'balance'
        },
        '.smooth-scroll': {
          'scroll-behavior': 'smooth',
          '-webkit-overflow-scrolling': 'touch'
        }
      }
      addUtilities(newUtilities)
    }
  ],
};
