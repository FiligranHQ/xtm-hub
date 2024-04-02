const FiligranUIPlugin = require('filigran-ui/plugin');
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    './node_modules/filigran-ui/dist/**/*.{js,ts,jsx,tsx}',
  ],
  plugins: [require('tailwindcss-animate'), FiligranUIPlugin()],
};
