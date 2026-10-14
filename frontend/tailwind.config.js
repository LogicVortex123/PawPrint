/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        paw: {
          forest: '#1F6B53',       // Primary brand green
          deep: '#14503D',         // Pressed / hover state of the primary
          sage: '#6FA58C',         // Sage Green
          'warm-sage': '#A9CDB9',  // Warm Sage (muted text in dark mode)
          'soft-sage': '#DDEBE2',  // Soft Sage
          'light-sage': '#EEF6F1', // Very Light Sage
          cream: '#F6F5EF',        // Page background
          offwhite: '#FCFCF8',     // Raised surface
          mist: '#F1F5F1',         // App canvas behind cards
          line: '#E3EAE4',         // Hairline borders
          dark: '#1C2B29',         // Primary text
          secondary: '#5A6B67',    // Secondary text
          white: '#FFFFFF',
          honey: '#F2B84B',        // Warm yellow accent
          'honey-soft': '#FCEFD3',
          coral: '#F0705A',        // Warm accent for highlights and CTAs on dark
          'coral-soft': '#FDE6E0',
          // Dark mode surfaces
          darkbg: '#0C1C17',
          darksurface: '#12281F',
          darkcard: '#173329',
          darkborder: '#244739',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['"Fraunces"', 'Georgia', 'serif'],
        script: ['"Caveat"', 'cursive'],
      },
      boxShadow: {
        '2xs': '0 1px 2px rgba(16, 40, 32, 0.05)',
        'soft': '0 4px 20px -4px rgba(16, 60, 45, 0.10)',
        'soft-lg': '0 12px 32px -8px rgba(16, 60, 45, 0.16)',
        'soft-xl': '0 24px 48px -12px rgba(16, 60, 45, 0.22)',
        'soft-2xl': '0 32px 64px -16px rgba(16, 60, 45, 0.28)',
        'card': '0 1px 2px rgba(16, 40, 32, 0.04), 0 8px 24px -14px rgba(16, 40, 32, 0.14)',
        'card-hover': '0 2px 4px rgba(16, 40, 32, 0.04), 0 18px 40px -16px rgba(16, 40, 32, 0.24)',
        'glow': '0 0 0 4px rgba(31, 107, 83, 0.14)',
        'inner-soft': 'inset 0 2px 4px 0 rgba(36, 92, 74, 0.06)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
        '5xl': '2.5rem',
        'organic': '2rem 1.5rem 2.5rem 1.5rem',
      },
      animation: {
        'float-slow': 'float 6s ease-in-out infinite',
        'float-reverse': 'floatRev 7s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 1.5s infinite',
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
        'blob': 'blob 14s ease-in-out infinite',
        'marquee': 'marquee 38s linear infinite',
        'wiggle': 'wiggle 0.6s ease-in-out',
        'pop': 'pop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'slide-in-left': 'slideInLeft 0.32s cubic-bezier(0.16, 1, 0.3, 1) both',
        'slide-in-right': 'slideInRight 0.32s cubic-bezier(0.16, 1, 0.3, 1) both',
        'gradient-x': 'gradientX 8s ease infinite',
        'spin-slow': 'spin 18s linear infinite',
        'draw': 'draw 1.6s ease-out forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        floatRev: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(10px) rotate(-1deg)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.8 },
        },
        blob: {
          '0%, 100%': { borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%', transform: 'translate(0, 0) rotate(0deg)' },
          '33%': { borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%', transform: 'translate(12px, -16px) rotate(8deg)' },
          '66%': { borderRadius: '50% 50% 33% 67% / 55% 27% 73% 45%', transform: 'translate(-10px, 10px) rotate(-6deg)' },
        },
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-12deg)' },
          '75%': { transform: 'rotate(12deg)' },
        },
        pop: {
          from: { opacity: 0, transform: 'scale(0.92)' },
          to: { opacity: 1, transform: 'scale(1)' },
        },
        slideInLeft: {
          from: { opacity: 0, transform: 'translateX(-24px)' },
          to: { opacity: 1, transform: 'translateX(0)' },
        },
        slideInRight: {
          from: { opacity: 0, transform: 'translateX(24px)' },
          to: { opacity: 1, transform: 'translateX(0)' },
        },
        gradientX: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        draw: {
          from: { strokeDashoffset: '1000' },
          to: { strokeDashoffset: '0' },
        },
      }
    },
  },
  plugins: [],
}
