'use client';

import { useEditMode } from '@/context/edit-mode-context';
import { appendContentKeyMarker } from '@/utils/content-translation/invisible-marker';
import { useTranslations } from 'next-intl';

// Drop-in replacement for next-intl's useTranslations(namespace): while
// edit mode is on, every plain string returned by t(key) gets an invisible
// marker appended encoding its fully-qualified content key.
// EditModeContentObserver (mounted once per root layout) scans the DOM for
// these markers and makes the surrounding text clickable — no per-string
// wrapping component required. Outside of edit mode this returns
// next-intl's t completely unwrapped, so there is zero overhead.
//
// Limitation (by design): only the callable t(key, values) form is marked.
// Sub-methods that return JSX (t.rich/t.markup) or don't return the
// translated string (t.raw/t.has) pass through untouched via the Proxy's
// default `get` trap, since marking them wouldn't be meaningful and could
// corrupt non-string return values.
export const useTranslate = (namespace?: string) => {
  const t = useTranslations(namespace);
  const { isEditMode } = useEditMode();

  if (!isEditMode) {
    return t;
  }

  return new Proxy(t, {
    apply(target, thisArg, args: Parameters<typeof t>) {
      const result = Reflect.apply(target, thisArg, args);
      if (typeof result !== 'string') {
        return result;
      }
      const [key] = args;
      const fullKey = namespace ? `${namespace}.${String(key)}` : String(key);
      return appendContentKeyMarker(result, fullKey);
    },
  });
};
