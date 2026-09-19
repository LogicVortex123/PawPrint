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
          forest: '#245C4A',       // Primary Forest Green
          deep: '#183F34',         // Deep Forest
          sage: '#6F9F89',         // Sage Green
          'warm-sage': '#A8C5B3',  // Warm Sage
          'soft-sage': '#DCEBE2',  // Soft Sage
          'light-sage': '#EEF6F0', // Very Light Sage
          cream: '#F8F8F2',        // Cream
          offwhite: '#FCFCF7',     // Warm Off-White
          dark: '#243638',         // Dark Text
          secondary: '#526461',    // Secondary Text
          white: '#FFFFFF',
          honey: '#F0B94D',        // Warm Yellow Accent (sparing use)
          'honey-soft': '#FBEACB', // Pale Warm Yellow (badge/highlight backgrounds)
          // Dark mode specific surfaces
          darkbg: '#0F241E',
          darksurface: '#17362D',
          darkcard: '#1C4237',
          darkborder: '#2A5548',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        script: ['"Caveat"', 'cursive'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(36, 92, 74, 0.08)',
        'soft-lg': '0 10px 30px -4px rgba(36, 92, 74, 0.12)',
        'soft-xl': '0 20px 40px -6px rgba(36, 92, 74, 0.16)',
        'inner-soft': 'inset 0 2px 4px 0 rgba(36, 92, 74, 0.06)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
        'organic': '2rem 1.5rem 2.5rem 1.5rem',
      },
      animation: {
        'float-slow': 'float 6s ease-in-out infinite',
        'float-reverse': 'floatRev 7s ease-in-out infinite',
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        floatRev: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(8px) rotate(-1deg)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.8 },
        },
      }
    },
  },
  plugins: [],
}
