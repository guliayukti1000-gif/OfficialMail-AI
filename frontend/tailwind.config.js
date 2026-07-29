/** @type {import('tailwindcss').Config} */

export default {

  darkMode: 'class',

  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],

  theme: {

    extend: {

      colors: {

        ink: {
          900: '#0F172A',
          700: '#334155',
          500: '#64748B',
          300: '#CBD5E1',
        },

        surface: {
          DEFAULT: '#FFFFFF',
          soft: '#F8FAFC',
          muted: '#F1F5F9',
        },

        brand: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          400: '#3B82F6',
          500: '#2563EB',
          600: '#1D4ED8',
          900: '#1E3A8A',
        },

        // Ink blue + amber theme (current redesign)
        night: {
          DEFAULT: '#080A14',
          panel: '#0B0F1C',
          glass: '#131A2E',
        },

        accent: {
          DEFAULT: '#3D5AFE',
          dim: '#1C2560',
        },

        flare: {
          DEFAULT: '#F5A623',
        },

      },


      fontFamily: {

        display: [
          '"Plus Jakarta Sans"',
          'sans-serif'
        ],

        body: [
          '"Inter"',
          'sans-serif'
        ],

        mono: [
          '"IBM Plex Mono"',
          'monospace'
        ],

      },


      boxShadow: {

        soft:
        '0 1px 2px rgba(15,23,42,0.04), 0 4px 16px rgba(15,23,42,0.06)',

        card:
        '0 2px 8px rgba(15,23,42,0.05), 0 8px 24px rgba(15,23,42,0.06)',

        glow:
        '0 0 0 4px rgba(37,99,235,0.08)',

        // Amber glow for the new theme's buttons/hero
        flareGlow:
        '0 0 24px rgba(245,166,35,0.35)',

      },


      borderRadius: {

        xl: '14px',
        '2xl': '20px',

      },


      keyframes: {

        float: {

          '0%, 100%': {
            transform: 'translateY(0px)'
          },

          '50%': {
            transform: 'translateY(-8px)'
          },

        },


        drift: {

          '0%, 100%': {
            transform: 'translate(0px,0px)'
          },

          '50%': {
            transform: 'translate(30px,-25px)'
          },

        },


        wave: {

          '0%, 100%': {
            transform: 'scaleY(0.4)'
          },

          '50%': {
            transform: 'scaleY(1)'
          },

        },


        blink: {

          '0%, 90%, 100%': {
            transform: 'scaleY(1)'
          },

          '95%': {
            transform: 'scaleY(0.1)'
          },

        },

        // Big wink + bounce, for the robot mascot every ~10s
        bigWink: {

          '0%, 78%, 90%, 100%': {
            transform: 'scaleY(1)'
          },

          '82%, 86%': {
            transform: 'scaleY(0.1)'
          },

        },

        // Page-load blur-in reveal
        blurIn: {

          '0%': {
            filter: 'blur(14px)',
            opacity: '0',
            transform: 'translateY(14px)'
          },

          '100%': {
            filter: 'blur(0px)',
            opacity: '1',
            transform: 'translateY(0px)'
          },

        },

      },


      animation: {

        float: 'float 3s ease-in-out infinite',

        drift: 'drift 8s ease-in-out infinite',

        wave: 'wave 1s ease-in-out infinite',

        blink: 'blink 4s infinite',

        'big-wink': 'bigWink 10s ease-in-out infinite',

        'blur-in': 'blurIn 0.9s cubic-bezier(0.22,1,0.36,1) both',

      },


    },

  },


  plugins: [],

}