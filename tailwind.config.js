/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}",
     "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: '#07111F',
        surface: '#0D1B2A',
        'surface-elevated': '#13263A',

        primary: '#FE5B00',
        'primary-dark': '#D94D00',

        'text-primary': '#FFFFFF',
        'text-secondary': '#AAB4C0',

        border: '#26384A',
      },
    },
  },
  plugins: [],
}

