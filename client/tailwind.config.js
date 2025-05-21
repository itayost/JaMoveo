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
        // Apple inspired color palette
        primary: {
          DEFAULT: '#007AFF', // iOS blue
          light: '#5AC8FA',
          dark: '#0062CC',
          50: '#E1F0FF',
          100: '#B8DAFF',
          900: '#004080',
        },
        secondary: {
          DEFAULT: '#1C1C1E', // Dark mode background
          light: '#2C2C2E',
          dark: '#000000',
        },
        accent: {
          DEFAULT: '#FF9500', // iOS orange
          light: '#FFCC00', // iOS yellow
          dark: '#FF3B30', // iOS red
          50: '#FFF9EB',
          blue: '#5AC8FA', // iOS light blue
          yellow: '#FFCC00',
          green: '#34C759', // iOS green
          red: '#FF3B30',
          purple: '#AF52DE', // iOS purple
          pink: '#FF2D55', // iOS pink
          indigo: '#5856D6', // iOS indigo
        },
        // UI colors with proper Apple-like dark theme
        background: {
          light: '#F2F2F7', // iOS light background
          DEFAULT: '#1C1C1E', // iOS dark background
          dark: '#000000',
        },
        surface: {
          light: '#FFFFFF',
          DEFAULT: '#2C2C2E', // iOS dark card background
          dark: '#1C1C1E',
          elevated: '#3A3A3C', // Slightly lighter for cards
        },
        text: {
          light: '#FFFFFF', // White text for dark backgrounds
          muted: '#8E8E93', // iOS gray for secondary text
          dark: '#1C1C1E', // Dark text for light backgrounds
          emphasis: '#FFFFFF', // Bright white for emphasis
        },
        // Status colors - iOS inspired
        success: {
          DEFAULT: '#34C759', // iOS green
          light: '#E3FFF1',
          dark: '#248A3D',
        },
        error: {
          DEFAULT: '#FF3B30', // iOS red
          light: '#FFE5E5',
          dark: '#C60B00',
        },
        warning: {
          DEFAULT: '#FF9500', // iOS orange
          light: '#FFF6E5',
          dark: '#C93400',
        },
        info: {
          DEFAULT: '#007AFF', // iOS blue
          light: '#E1F0FF',
          dark: '#0040DD',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'San Francisco',
          'Helvetica Neue',
          'Helvetica',
          'Arial',
          'sans-serif'
        ],
        hebrew: [
          '-apple-system',
          'BlinkMacSystemFont',
          'San Francisco',
          'Helvetica Neue',
          'Helvetica',
          'Arial',
          'sans-serif'
        ],
        mono: [
          'SF Mono',
          'Menlo',
          'Monaco',
          'Consolas',
          'Liberation Mono',
          'Courier New',
          'monospace'
        ],
        display: [
          '-apple-system',
          'BlinkMacSystemFont',
          'San Francisco',
          'Helvetica Neue',
          'Helvetica',
          'Arial',
          'sans-serif'
        ],
      },
      fontSize: {
        // iOS-inspired text sizes
        'base-large': '1.0625rem', // 17px
        'xl-large': '1.3125rem',   // 21px
        '2xl-large': '1.5rem',     // 24px
        '3xl-large': '1.9375rem',  // 31px
        '4xl-large': '2.5rem',     // 40px
      },
      borderRadius: {
        'ios': '0.75rem', // Apple's typical corner radius
        'ios-lg': '1.25rem', // Larger iOS style radius
        'ios-xl': '1.75rem', // Extra large iOS style radius
        'ios-full': '9999px', // Full rounded like iOS buttons
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
        'float': 'float 3s ease-in-out infinite',
        'spring': 'spring 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(15px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        spring: {
          '0%': { transform: 'scale(0.95)' },
          '70%': { transform: 'scale(1.04)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      boxShadow: {
        'ios': '0 4px 10px rgba(0, 0, 0, 0.05), 0 0 1px rgba(0, 0, 0, 0.1)',
        'ios-md': '0 4px 16px rgba(0, 0, 0, 0.1), 0 1px 4px rgba(0, 0, 0, 0.05)',
        'ios-lg': '0 10px 30px rgba(0, 0, 0, 0.15), 0 1px 5px rgba(0, 0, 0, 0.05)',
        'ios-inner': 'inset 0 1px 3px rgba(0, 0, 0, 0.05)',
        'ios-focus': '0 0 0 4px rgba(0, 122, 255, 0.3)',
        'ios-error': '0 0 0 4px rgba(255, 59, 48, 0.3)',
        'ios-success': '0 0 0 4px rgba(52, 199, 89, 0.3)',
      },
      backdropFilter: {
        'ios': 'blur(20px) saturate(180%)',
      },
    },
  },
  plugins: [
    function({ addComponents, theme }) {
      addComponents({
        // iOS-style button
        '.ios-button': {
          borderRadius: theme('borderRadius.ios-full'),
          fontWeight: theme('fontWeight.medium'),
          padding: `${theme('spacing.3')} ${theme('spacing.6')}`,
          transition: 'all 0.2s ease',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          '&:active': {
            transform: 'scale(0.97)',
          },
        },
        '.ios-primary-button': {
          backgroundColor: theme('colors.primary.DEFAULT'),
          color: theme('colors.white'),
          '&:hover': {
            backgroundColor: theme('colors.primary.dark'),
          },
        },
        '.ios-secondary-button': {
          backgroundColor: theme('colors.background.DEFAULT'),
          color: theme('colors.primary.DEFAULT'),
          border: `1px solid ${theme('colors.surface.light')}`,
          '&:hover': {
            backgroundColor: theme('colors.surface.DEFAULT'),
          },
        },
        // iOS-style card
        '.ios-card': {
          backgroundColor: theme('colors.surface.DEFAULT'),
          borderRadius: theme('borderRadius.ios-lg'),
          boxShadow: theme('boxShadow.ios'),
          overflow: 'hidden',
        },
        // iOS-style input
        '.ios-input': {
          backgroundColor: theme('colors.surface.DEFAULT'),
          borderRadius: theme('borderRadius.ios'),
          border: `1px solid ${theme('colors.surface.light')}`,
          padding: `${theme('spacing.3')} ${theme('spacing.4')}`,
          '&:focus': {
            outline: 'none',
            boxShadow: theme('boxShadow.ios-focus'),
            borderColor: theme('colors.primary.DEFAULT'),
          },
        },
        // iOS-style sheet modal
        '.ios-sheet': {
          backgroundColor: theme('colors.surface.DEFAULT'),
          borderTopLeftRadius: theme('borderRadius.ios-xl'),
          borderTopRightRadius: theme('borderRadius.ios-xl'),
          boxShadow: theme('boxShadow.ios-lg'),
        },
        // iOS navbar style with blur
        '.ios-navbar': {
          backdropFilter: 'blur(12px) saturate(180%)',
          backgroundColor: 'rgba(28, 28, 30, 0.8)',
          borderBottomWidth: '0.5px',
          borderBottomColor: 'rgba(142, 142, 147, 0.2)',
        },
        // iOS tab bar style
        '.ios-tabbar': {
          backdropFilter: 'blur(12px) saturate(180%)',
          backgroundColor: 'rgba(28, 28, 30, 0.8)',
          borderTopWidth: '0.5px',
          borderTopColor: 'rgba(142, 142, 147, 0.2)',
        },
        // iOS toggle
        '.ios-toggle': {
          position: 'relative',
          width: '51px',
          height: '31px',
          borderRadius: '31px',
          backgroundColor: 'rgba(120, 120, 128, 0.32)',
          transition: 'background-color 0.2s',
          '&.active': {
            backgroundColor: theme('colors.success.DEFAULT'),
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: '2px',
            left: '2px',
            width: '27px',
            height: '27px',
            borderRadius: '50%',
            background: theme('colors.white'),
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
            transition: 'transform 0.2s',
          },
          '&.active::after': {
            transform: 'translateX(20px)',
          },
        },
      });
    },
  ],
  // Enable dark mode for potential future light/dark toggle
  darkMode: 'class',
}