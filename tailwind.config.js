/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b',
          950: '#111111', // Main black
        },
        secondary: {
          50: '#ffffff',
          100: '#ffffff',
          200: '#ffffff',
          300: '#ffffff',
          400: '#ffffff',
          500: '#ffffff',
          600: '#f9fafb',
          700: '#f3f4f6',
          800: '#e5e7eb', // Neutral gray
          900: '#d1d5db',
          950: '#9ca3af',
        },
        // Brand accent: jade — calibrated-instrument identity
        accent: {
          25: '#F4FDF9',
          50: '#ECFDF5',
          100: '#D9F2E9',
          200: '#B3E5D4',
          300: '#7DD3B8',
          400: '#34D399', // dark-mode text jade
          500: '#10B981',
          600: '#0E9F79', // brand jade
          700: '#0B8465', // hover
          800: '#0A6B53',
          900: '#085743',
          950: '#043327',
        },
        jade: {
          25: '#F4FDF9',
          50: '#ECFDF5',
          100: '#D9F2E9',
          200: '#B3E5D4',
          300: '#7DD3B8',
          400: '#34D399',
          500: '#10B981',
          600: '#0E9F79',
          700: '#0B8465',
          800: '#0A6B53',
          900: '#085743',
          950: '#043327',
        },
        // Flat surfaces
        paper: '#F7F7F4',
        ink: '#0C1220',
        card: {
          light: '#FFFFFF',
          dark: '#131A2A',
        },
        line: {
          light: '#E5E4DF',
          dark: '#1F2937',
        },
        // Score semantics
        score: {
          strong: '#0E9F79',
          strongDark: '#34D399',
          mid: '#D97706',
          midDark: '#FBBF24',
          weak: '#DC2626',
          weakDark: '#F87171',
          info: '#3B82F6',
        },
        neutral: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb', // Neutral gray
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151', // Text charcoal
          800: '#1f2937',
          900: '#111827',
          950: '#030712',
        },
        // Legacy support
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
          950: '#030712',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Bricolage Grotesque"', 'Inter', 'system-ui', 'sans-serif'],
        data: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        // Legacy keys kept working, remapped to flat calm surfaces
        "gradient-premium": "linear-gradient(135deg, #0C1220 0%, #0C1220 100%)",
        "gradient-gold": "linear-gradient(135deg, #0E9F79 0%, #0B8465 100%)",
      },
      boxShadow: {
        'premium': '0 1px 2px 0 rgba(12, 18, 32, 0.05)',
        // Legacy "gold" glow remapped to a barely-there jade lift
        'gold': '0 1px 3px 0 rgba(14, 159, 121, 0.15)',
        'dark': '0 1px 3px 0 rgba(0, 0, 0, 0.25)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'bounce-slow': 'bounce 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
