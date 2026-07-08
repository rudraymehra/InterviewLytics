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
        // Brand accent: neon cyan — cyberpunk HUD identity
        // (key names kept as `accent`/`jade` because pages reference them)
        accent: {
          25: '#F0FDFF',
          50: '#ECFEFF',
          100: '#CFFAFE',
          200: '#A5F3FC',
          300: '#67E8F9',
          400: '#22D3EE', // dark-mode text cyan
          500: '#06B6D4',
          600: '#0891B2', // brand cyan
          700: '#0E7490', // hover / light-mode text
          800: '#155E75',
          900: '#164E63',
          950: '#083344',
        },
        jade: {
          25: '#F0FDFF',
          50: '#ECFEFF',
          100: '#CFFAFE',
          200: '#A5F3FC',
          300: '#67E8F9',
          400: '#22D3EE',
          500: '#06B6D4',
          600: '#0891B2',
          700: '#0E7490',
          800: '#155E75',
          900: '#164E63',
          950: '#083344',
        },
        // Secondary neons — highlights, gradient ends, the signature (use sparingly)
        neon: {
          magenta: '#FF2ED1',
          violet: '#8B5CF6',
          spring: '#34F5C5',
        },
        // Flat surfaces: daylight terminal / void
        paper: '#F2F5F9',
        ink: '#060913',
        card: {
          light: '#FFFFFF',
          dark: '#0B1122',
        },
        line: {
          light: '#D8E0EC',
          dark: '#1B2A4A',
        },
        // Score semantics (same >=70 / 40-69 / <40 logic, cyberpunk hues)
        score: {
          strong: '#0D9488',
          strongDark: '#34F5C5',
          mid: '#B45309',
          midDark: '#FFB020',
          weak: '#DC2626',
          weakDark: '#FF3B5C',
          info: '#06B6D4',
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
        display: ['"Chakra Petch"', 'Inter', 'system-ui', 'sans-serif'],
        data: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        // Legacy keys kept working, remapped to void / neon surfaces
        "gradient-premium": "linear-gradient(135deg, #060913 0%, #0B1122 100%)",
        "gradient-gold": "linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)",
      },
      boxShadow: {
        'premium': '0 1px 2px 0 rgba(6, 9, 19, 0.05)',
        // Legacy "gold" glow remapped to a restrained cyan lift
        'gold': '0 0 12px 0 rgba(34, 211, 238, 0.25)',
        'dark': '0 1px 3px 0 rgba(0, 0, 0, 0.25)',
        // Cyberpunk glows — accessories, used sparingly
        'neon': '0 0 16px 0 rgba(34, 211, 238, 0.35)',
        'neon-magenta': '0 0 16px 0 rgba(255, 46, 209, 0.35)',
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
