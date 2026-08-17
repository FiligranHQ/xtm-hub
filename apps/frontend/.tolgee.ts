import { DevTools, FormatSimple, Tolgee } from '@tolgee/react';

export const tolgee = Tolgee().use(DevTools()).use(FormatSimple()).init({
  language: 'en',
  apiUrl: 'http://localhost:8080',
  apiKey: 'tgpak_gjptm3degbrwo4zumvvgqzlfgbxtmzlpn5rdi4lwofvw6',
});
