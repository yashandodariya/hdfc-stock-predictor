/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        hdfc: {
          blue: '#1a3b8b',      // Financial HDFC Blue
          red: '#ea2a30',       // Accent Red
          dark: '#111827',      // Premium background slate-900
          card: '#1f2937',      // Premium card slate-800
          silver: '#9ca3af',    // Slate text grey
          gold: '#f59e0b',      // Accent color
        }
      }
    },
  },
  plugins: [],
}
