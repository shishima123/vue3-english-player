/** @type {import('tailwindcss').Config} */
module.exports = {
  purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  content: [],
  corePlugins: {
    preflight: false
  },
  theme: {
    fontFamily: {
      default: ['Nunito', 'sans-serif']
    },
    fontSize: {
      '3xs': '10px',
      '2xs': '11px',
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '30px',
      '4xl': '36px',
      '5xl': '48px',
      '6xl': '56px',
      '7xl': '70px',
      '22px': '22px'
    },
    extend: {
      colors: {
        dimgray: '#696969'
      }
    }
  },
  plugins: []
}
