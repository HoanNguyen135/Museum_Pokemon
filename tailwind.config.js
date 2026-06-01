/** @type {import('tailwindcss').Config} */
const { COLORS } = require('./src/constants/colors');

module.exports = {
  content: ["./App.tsx", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors:COLORS
    },
  },
  plugins: [],
}