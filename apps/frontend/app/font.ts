import { Geologica, IBM_Plex_Sans } from 'next/font/google';

export const geologica = Geologica({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-geologica',
  adjustFontFallback: false,
});

export const ibmPlexSans = IBM_Plex_Sans({
  weight: ['100', '200', '300', '400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-ibm-plex-sans',
});
