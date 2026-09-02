/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.js","./components/**/*.{ja,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
}

