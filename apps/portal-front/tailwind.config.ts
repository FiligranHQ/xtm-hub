import FiligranUIPlugin from '@filigran/ui/plugin';
import plugin from 'tailwindcss/plugin';
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    './node_modules/@filigran/ui/dist/**/*.{js,ts,jsx,tsx}',
    '../../node_modules/@filigran/ui/dist/**/*.{js,ts,jsx,tsx}',
  ],
  plugins: [
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('tailwindcss-animate'),
    FiligranUIPlugin(),
    plugin(function ({ addVariant }) {
      addVariant(
        'mobile',
        "@media screen and (max-width: theme('screens.sm'))"
      ); // instead of hard-coded 640px use sm breakpoint value from config. Or anything
    }),
  ],
};
