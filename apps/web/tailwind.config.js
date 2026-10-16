/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          green: {
            DEFAULT: '#1b7a43', // Accessible dark green (WCAG AA compliant)
            accent: '#27ae60',  // Original brand accent
            light: '#e8f5e9',
            dark: '#145a32',
          },
          blue: {
            DEFAULT: '#1d4ed8', // Accessible dark blue (WCAG AA compliant)
            accent: '#3498db',  // Original brand accent
            light: '#eff6ff',
            dark: '#1e3a8a',
          },
          navy: '#0f172a',
          slate: '#334155',
          border: '#e2e8f0',
        },
      },
    },
  },
  plugins: [],
};
