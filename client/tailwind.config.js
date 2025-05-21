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
        // Main brand colors - enhanced for better contrast and consistency
        primary: {
          DEFAULT: '#FF5500', // Vibrant orange - core brand color
          light: '#FF7733',
          dark: '#CC4400',
          50: '#FFF2EC',  // Very light shade for subtle backgrounds
          100: '#FFE5D9', // Light shade for hover states
          900: '#993300', // Very dark shade for strong contrast elements
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
          50: '#FFFBEB', // Very light shade
        },
        // UI colors with proper dark theme - optimized for smoky environments
        background: {
          light: '#F5F5F5',
          DEFAULT: '#121212', // Dark background for high contrast
          dark: '#0A0A0A',
          smoky: '#0F0F0F', // Slightly lighter than darkest for layering
        },
        surface: {
          light: '#FFFFFF',
          DEFAULT: '#1E1E1E', // Dark surface for high contrast
          dark: '#181818',
          elevated: '#252525', // Slightly lighter for cards and elevated elements
        },
        text: {
          light: '#FFFFFF', // White text for dark backgrounds
          muted: '#A0A0A0', // Muted gray for secondary text
          dark: '#333333', // Dark text for light backgrounds
          emphasis: '#FFFFFF', // Bright white for emphasis
        },
        // Status colors - enhanced for accessibility
        success: {
          DEFAULT: '#10B981', // Green
          light: '#D1FAE5',
          dark: '#059669', // Darker green for better contrast
        },
        error: {
          DEFAULT: '#EF4444', // Red
          light: '#FEE2E2',
          dark: '#B91C1C', // Darker red for better contrast
        },
        warning: {
          DEFAULT: '#F59E0B', // Amber
          light: '#FEF3C7',
          dark: '#D97706', // Darker amber for better contrast
        },
        info: {
          DEFAULT: '#3B82F6', // Blue
          light: '#DBEAFE',
          dark: '#2563EB', // Darker blue for better contrast
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        hebrew: ['Assistant', 'sans-serif'], // Optimized for Hebrew text
        mono: ['Roboto Mono', 'monospace'],
        display: ['Montserrat', 'Inter', 'system-ui', 'sans-serif'], // For headings
      },
      fontSize: {
        // Enhanced text sizes for better readability in smoky environments
        'base-large': '1.125rem', // 18px
        'xl-large': '1.375rem',   // 22px
        '2xl-large': '1.625rem',  // 26px
        '3xl-large': '2rem',      // 32px
        '4xl-large': '2.5rem',    // 40px
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
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
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
        slideInRight: {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
      boxShadow: {
        'inner-lg': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.15)',
        'soft': '0 4px 14px 0 rgba(0, 0, 0, 0.1)',
        'soft-lg': '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
        'glow': '0 0 15px rgba(255, 85, 0, 0.5)', // Primary color glow effect
        'glow-light': '0 0 10px rgba(255, 85, 0, 0.3)', // Subtle glow effect
      },
      // For auto-scroll feature
      transitionTimingFunction: {
        'scroll': 'cubic-bezier(0.4, 0.0, 0.2, 1)',
      },
    },
  },
  plugins: [
    function({ addComponents, theme }) {
      addComponents({
        // Base card component
        '.card-base': {
          backgroundColor: theme('colors.surface.DEFAULT'),
          borderRadius: theme('borderRadius.lg'),
          boxShadow: theme('boxShadow.soft'),
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          overflow: 'hidden',
        },
        // Elevated card with hover effects
        '.card-elevated': {
          backgroundColor: theme('colors.surface.elevated'),
          borderRadius: theme('borderRadius.lg'),
          boxShadow: theme('boxShadow.soft-lg'),
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: theme('boxShadow.glow-light'),
          },
        },
        // Special card for the Live page
        '.card-live': {
          backgroundColor: theme('colors.surface.DEFAULT'),
          borderRadius: theme('borderRadius.lg'),
          boxShadow: theme('boxShadow.soft'),
          borderLeft: `4px solid ${theme('colors.primary.DEFAULT')}`,
        },
        // Button base styles
        '.btn-base': {
          fontWeight: theme('fontWeight.medium'),
          transition: 'all 0.2s ease',
          borderRadius: theme('borderRadius.md'),
          padding: `${theme('spacing.2')} ${theme('spacing.4')}`,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          '&:focus': {
            outline: 'none',
            ringColor: theme('colors.primary.DEFAULT'),
            ringWidth: '2px',
          },
        },
        // High contrast mode
        '.high-contrast-mode': {
          backgroundColor: '#000000', // Pure black background
          color: '#FFFFFF', // Pure white text
          '& .card-base, & .card-elevated, & .card-live': {
            backgroundColor: '#0A0A0A', // Very dark gray for cards
            borderColor: '#333333', // More visible borders
          },
          '& .text-muted': {
            color: '#CCCCCC', // Lighter gray for better readability
          },
        },
      });
    },
  ],
  // Enable dark mode for potential future light/dark toggle
  darkMode: 'class',
};