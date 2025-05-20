// client/tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        // Main brand colors
        primary: {
          DEFAULT: '#FF5500',
          light: '#FF7733',
          dark: '#CC4400',
        },
        secondary: {
          DEFAULT: '#0D0D0D',
          light: '#333333',
          dark: '#000000',
        },
        accent: {
          DEFAULT: '#FFD700', // Gold
          light: '#FFEB66',
          dark: '#CCA800',
        },
        // UI colors with proper dark theme
        background: {
          light: '#F5F5F5',
          DEFAULT: '#121212',
          dark: '#0A0A0A',
        },
        surface: {
          light: '#FFFFFF',
          DEFAULT: '#1E1E1E',
          dark: '#181818',
        },
        text: {
          light: '#FFFFFF',
          muted: '#A0A0A0',
          dark: '#333333',
        },
        // Status colors
        success: {
          DEFAULT: '#10B981',
          light: '#D1FAE5',
        },
        error: {
          DEFAULT: '#EF4444',
          light: '#FEE2E2',
        },
        warning: {
          DEFAULT: '#F59E0B',
          light: '#FEF3C7',
        },
        info: {
          DEFAULT: '#3B82F6',
          light: '#DBEAFE',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        hebrew: ['Assistant', 'sans-serif'],
        mono: ['Roboto Mono', 'monospace'],
      },
      fontSize: {
        // Enhanced text sizes for better readability in smoky environments
        'base-large': '1.125rem', // 18px
        'xl-large': '1.375rem',   // 22px
        '2xl-large': '1.625rem',  // 26px
      },
      spacing: {
        '18': '4.5rem',
        '68': '17rem',
        '84': '21rem',
        '96': '24rem',
        '128': '32rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'fade-in': 'fadeIn 0.5s ease-in',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      boxShadow: {
        'inner-lg': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.15)',
        'soft': '0 4px 14px 0 rgba(0, 0, 0, 0.1)',
      },
      // For auto-scroll feature
      transitionTimingFunction: {
        'scroll': 'cubic-bezier(0.4, 0.0, 0.2, 1)',
      },
    },
  },
  plugins: [],
  darkMode: 'class', // Enable dark mode with class (for potential future light/dark toggle)
}