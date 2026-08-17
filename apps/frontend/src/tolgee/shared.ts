import { FormatIcu } from '@tolgee/format-icu';
import { DevTools, FormatSimple, Tolgee } from '@tolgee/web';

// const apiKey = process.env.NEXT_PUBLIC_TOLGEE_API_KEY;
// const apiUrl = process.env.NEXT_PUBLIC_TOLGEE_API_URL;
const apiKey = 'tgpak_gjptm3degbrwo4zumvvgqzlfgbxtmzlpn5rdi4lwofvw6';
const apiUrl = 'http://localhost:8080';

export const ALL_LANGUAGES = ['en', 'fr', 'ja'];
export const DEFAULT_LANGUAGE = 'en';

export function TolgeeBase() {
  return Tolgee()
    .use(FormatSimple())
    .use(FormatIcu())
    .use(DevTools())
    .updateDefaults({
      apiKey,
      apiUrl,
      staticData: {
        en: () => import('@messages/en.json'),
        fr: () => import('@messages/fr.json'),
        ja: () => import('@messages/ja.json'),
      },
    });
}
