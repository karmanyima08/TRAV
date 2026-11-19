/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#101D35',
          800: '#162846',
          700: '#1d3358',
          600: '#264270'
        },
        primary: {
          DEFAULT: '#3563E9',
          50: '#F0F4FE',
          100: '#DDE7FD',
          200: '#BACFFA',
          500: '#3563E9',
          600: '#2550D0',
          700: '#1B3FA8'
        },
        teal: {
          DEFAULT: '#20BFA9',
          50: '#E9FAF7',
          100: '#C7F4ED',
          500: '#20BFA9',
          600: '#16A491'
        },
        surface: '#F6F8FC',
        text: {
          primary: '#1D2939',
          secondary: '#475467',
          muted: '#98A2B3'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        card: '0 1px 3px rgba(16,29,53,0.06), 0 4px 16px rgba(16,29,53,0.04)',
        'card-hover': '0 8px 30px rgba(16,29,53,0.10)',
        subtle: '0 2px 8px rgba(0,0,0,0.04)'
      }
    },
  },
  plugins: [],
}

