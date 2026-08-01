import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // Deep slate / near-black cyber-teal backgrounds — the site's base surface.
        abyss: {
          DEFAULT: '#080e14',
          raised: '#0b131b',
          panel: '#0e1922',
          border: '#152431',
        },
        ink: {
          50: '#f4f6fb',
          100: '#e6eaf5',
          200: '#c7d0e8',
          300: '#9aa9d1',
          400: '#6779b3',
          500: '#455393',
          600: '#333f78',
          700: '#293262',
          800: '#0e1922',
          900: '#0b131b',
          950: '#080e14',
        },
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        // Metallic gold/bronze — crests, seals, credential badges.
        gold: {
          300: '#ecd9a0',
          400: '#e8c468',
          500: '#d4af37',
          600: '#c5a059',
          700: '#a37f2f',
        },
        // Electric cyan / muted teal — secondary highlights.
        teal: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        // Neon mint / cyber emerald — primary CTA + monospace label accent.
        mint: {
          300: '#6ee7b7',
          400: '#34d399',
          neon: '#00e599',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        },
      },
      fontFamily: {
        sans: ['var(--font-display)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(15 23 42 / 0.04), 0 1px 3px 0 rgb(15 23 42 / 0.08)',
        glass: 'inset 0 1px 0 0 rgba(255,255,255,0.04), 0 20px 40px -20px rgba(0,0,0,0.65)',
        'glow-mint': '0 0 0 1px rgba(16,185,129,0.4), 0 0 30px -4px rgba(16,185,129,0.55)',
        'glow-cyan': '0 0 0 1px rgba(45,212,191,0.3), 0 0 30px -6px rgba(45,212,191,0.45)',
      },
      backgroundImage: {
        'dot-grid':
          'radial-gradient(rgba(45,212,191,0.16) 1px, transparent 1.5px)',
      },
      backgroundSize: {
        'dot-grid': '20px 20px',
      },
      keyframes: {
        pulseDot: {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 0 0 rgba(16,185,129,0.55)' },
          '50%': { opacity: '0.6', boxShadow: '0 0 0 6px rgba(16,185,129,0)' },
        },
        floatGlow: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        'pulse-dot': 'pulseDot 2s ease-in-out infinite',
        'float-glow': 'floatGlow 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
