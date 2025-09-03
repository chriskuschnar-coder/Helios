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
        'neon-cyan': '#00f5ff',
        'neon-violet': '#8b5cf6',
        'neon-emerald': '#10b981',
        'neon-pink': '#ec4899',
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
        primary: {
          50: '#f0f4ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Segoe UI', 'system-ui', 'sans-serif'],
        mono: ['SF Mono', 'Monaco', 'Cascadia Code', 'Roboto Mono', 'monospace'],
        serif: ['SF Pro Display', 'Inter', 'system-ui', 'sans-serif'],
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
        'holographic': 'holographicShift 8s ease-in-out infinite',
        'liquid-float': 'liquidFloat 6s ease-in-out infinite',
        'neural-pulse': 'neuralPulse 3s ease-in-out infinite',
        'data-stream': 'dataStream 3s ease-in-out infinite',
        'quantum-glow': 'quantumGlow 4s ease-in-out infinite',
        'morphic-shift': 'morphicShift 8s ease-in-out infinite',
        'ai-thinking': 'aiThinking 1.4s ease-in-out infinite',
      },
      transitionTimingFunction: {
        'cinematic': 'cubic-bezier(0.23, 1, 0.32, 1)',
        'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'liquid': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'md': '8px',
        'lg': '16px',
        'xl': '24px',
        '2xl': '40px',
        '3xl': '64px',
      },
      backgroundImage: {
        'holographic-primary': 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        'holographic-secondary': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 50%, #43e97b 100%)',
        'aurora-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #43e97b 75%, #4facfe 100%)',
        'neural-network': 'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.2) 0%, transparent 50%)',
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
        '.text-holographic': {
          background: 'linear-gradient(135deg, #ffffff 0%, #00f5ff 50%, #ffffff 100%)',
          backgroundSize: '200% 200%',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
          animation: 'holographicShift 4s ease-in-out infinite',
        },
        '.text-quantum-glow': {
          color: '#00f5ff',
          textShadow: '0 0 20px rgba(0, 245, 255, 0.5)',
        },
        '.glass-morphism': {
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
        },
        '.neural-glow': {
          boxShadow: '0 0 40px rgba(102, 126, 234, 0.3), 0 0 80px rgba(118, 75, 162, 0.2)',
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
