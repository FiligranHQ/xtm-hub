import { appendContentKeyMarker } from '@/utils/content-translation/invisible-marker';
import { EDIT_MODE_COOKIE_NAME } from '@/utils/edit-mode-cookie';
import { getTranslations } from 'next-intl/server';
import { cookies } from 'next/headers';

type GetTranslateOptions =
  string | { locale: string; namespace?: string } | undefined;

// Server Component counterpart to useTranslate(): same invisible-marker
// mechanism, but read edit mode from the xtm-edit-mode cookie via
// next/headers instead of EditModeContext, since Server Components render
// with no client-side React context. EditModeContentObserver (mounted once
// per root layout) scans the final DOM regardless of whether the marked
// text came from a Server or Client Component, so no 'use client' boundary
// is required here.
export const getTranslate = async (options?: GetTranslateOptions) => {
  const t =
    typeof options === 'string'
      ? await getTranslations(options)
      : await getTranslations(options);
  const cookieStore = await cookies();
  const isEditMode = cookieStore.get(EDIT_MODE_COOKIE_NAME)?.value === '1';

  if (!isEditMode) {
    return t;
  }

  const namespace = typeof options === 'string' ? options : options?.namespace;

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
