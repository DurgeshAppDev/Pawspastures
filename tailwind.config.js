/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
  ],

  presets: [require("nativewind/preset")],

  theme: {
    extend: {
      colors: {
       
        background: "#0A141D",
        surface: "#17212A",
        "surface-elevated": "#131D25",
        "surface-icon": "#202B34",

        primary: "#FFB59A",
        "primary-dark": "#F39A7C",

        // Orange accent
        accent: "#FF6B00",

        "text-primary": "#FFFFFF",
        "text-secondary": "#B7C0C8",
        "text-muted": "#8D989F",
        "text-placeholder": "#6F7A82",

        "icon-muted": "#C5CDD2",
        border: "#2A3540",
        "border-subtle": "#202C35",
      },
    },
  },

  plugins: [],
};