'use client';

import { PortalContext } from '@/components/me/AppPortalContext';
import { EDIT_MODE_COOKIE_NAME } from '@/utils/edit-mode-cookie';
import { PortalCapability } from '@graphql/generated';
import {
  createContext,
  ReactNode,
  useContext,
  useMemo,
  useSyncExternalStore,
} from 'react';

interface EditModeContextValue {
  // Whether the current user is allowed to enter edit mode at all — mirrors
  // the backend's @auth(portalCapa: [BYPASS]) gate on upsertContentTranslation.
  canEditContent: boolean;
  // Whether edit mode is currently on. Driven entirely by the
  // xtm-edit-mode cookie: visit /edition to set it, /edition/exit to clear
  // it. Always false when canEditContent is false, regardless of the cookie.
  isEditMode: boolean;
}

const EditModeContext = createContext<EditModeContextValue | undefined>(
  undefined
);

const hasEditModeCookie = () =>
  document.cookie
    .split('; ')
    .some((entry) => entry === `${EDIT_MODE_COOKIE_NAME}=1`);

// The cookie never changes without a full page navigation (toggled by
// visiting /edition or /edition/exit, both of which reload the page), so
// there's nothing to subscribe to — the snapshot is simply read once after
// mount.
const subscribe = () => () => {};

// Mounted once per root layout (public + private) — no props needed, the
// cookie is the single source of truth for on/off, so the same tree works
// uniformly on any page instead of needing a dedicated /edition route per
// page.
export const EditModeProvider = ({ children }: { children: ReactNode }) => {
  // hasCapability is undefined outside of AppPortalContext (the public
  // marketing tree never mounts it, to stay eligible for static generation).
  // There, we trust the cookie alone as a UI-level signal — the
  // upsertContentTranslation mutation is still capability-gated
  // server-side, and the /edition route only sets this cookie for users who
  // already have the BYPASS capability, so this is a UI-only relaxation,
  // not a security hole.
  const { hasCapability } = useContext(PortalContext);

  // useSyncExternalStore (rather than useState+useEffect) reads the
  // document.cookie external store correctly under SSR: it returns the
  // server snapshot (false) on the server and the first client render (no
  // hydration mismatch, and the public tree stays statically generated
  // since this read never touches a server-side dynamic API), then
  // switches to the real client snapshot right after mount.
  const hasCookie = useSyncExternalStore(
    subscribe,
    hasEditModeCookie,
    () => false
  );

  const canEditContent = hasCapability
    ? hasCapability(PortalCapability.Bypass)
    : hasCookie;

  const value = useMemo<EditModeContextValue>(
    () => ({
      canEditContent,
      isEditMode: canEditContent && hasCookie,
    }),
    [canEditContent, hasCookie]
  );

  return (
    <EditModeContext.Provider value={value}>
      {children}
    </EditModeContext.Provider>
  );
};

// Default used wherever useTranslate()/useEditMode() is called outside of
// any EditModeProvider ancestor. Safe by construction: content is simply
// never editable there, instead of crashing the page.
const defaultEditModeValue: EditModeContextValue = {
  canEditContent: false,
  isEditMode: false,
};

export const useEditMode = () => {
  const context = useContext(EditModeContext);
  return context ?? defaultEditModeValue;
};
