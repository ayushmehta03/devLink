/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class", 

  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-space-grotesk)", "ui-sans-serif", "system-ui"],
      },
    },
  },

  plugins: [],
};
