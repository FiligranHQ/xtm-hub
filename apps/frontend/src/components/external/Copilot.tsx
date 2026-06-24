'use client';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { buildContext, CopilotUser, getUserKey } from './copilot.utils';

const COPILOT_WIDGET_URL =
  'https://copilot.filigran.ai/api/v1/public/widget.js';
const COPILOT_TOKEN = 'jNJu1JTbbPwNqk1tqEOw-WjsKU4dEcgn';

export const COPILOT_SCRIPT_ID = 'filigran-copilot-widget';

let widgetOwner: symbol | null = null;

interface CopilotProps {
  user?: CopilotUser | null | undefined;
}

const Copilot = ({ user }: CopilotProps) => {
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const lastUserRef = useRef<string>('');
  const pathname = usePathname();

  const getUserKeyFn = useCallback(
    (u: CopilotUser | null | undefined): string => getUserKey(u),
    []
  );

  const buildContextFn = useCallback(
    () => buildContext(user, pathname),
    [user, pathname]
  );

  const [ownerId] = useState<symbol>(() => Symbol('copilot'));

  const cleanup = useCallback(() => {
    document
      .querySelectorAll<HTMLElement>(`#${COPILOT_SCRIPT_ID}`)
      .forEach((el) => {
        try {
          el.remove();
        } catch (_e) {}
      });
    scriptRef.current = null;
  }, []);

  const initialize = useCallback(() => {
    if (widgetOwner !== null && widgetOwner !== ownerId) {
      return;
    }
    widgetOwner = ownerId;

    cleanup();

    const script = document.createElement('script');
    script.id = COPILOT_SCRIPT_ID;
    script.src = COPILOT_WIDGET_URL;
    script.setAttribute('data-token', COPILOT_TOKEN);
    script.setAttribute('data-context', buildContextFn());
    script.async = true;

    document.head.appendChild(script);
    scriptRef.current = script;
  }, [cleanup, buildContextFn, ownerId]);

  const updateContext = useCallback(() => {
    const scriptEl =
      scriptRef.current || document.getElementById(COPILOT_SCRIPT_ID);
    if (scriptEl) {
      scriptEl.setAttribute('data-context', buildContextFn());
    }
  }, [buildContextFn]);

  // Full re-init when the user identity changes
  useEffect(() => {
    const currentUserKey = getUserKeyFn(user);
    if (lastUserRef.current !== currentUserKey) {
      lastUserRef.current = currentUserKey;
      const timer = setTimeout(() => initialize(), 300);
      return () => clearTimeout(timer);
    }
  }, [initialize, getUserKeyFn, user]);

  // Initial load
  useEffect(() => {
    if (!scriptRef.current) {
      const timer = setTimeout(() => initialize(), 500);
      return () => clearTimeout(timer);
    }
  }, [initialize]);

  // Lightweight context update on page navigation (no full re-init)
  useEffect(() => {
    if (scriptRef.current) {
      updateContext();
    }
  }, [pathname, updateContext]);

  useEffect(() => {
    return () => {
      if (widgetOwner === ownerId) {
        cleanup();
        widgetOwner = null;
      }
    };
  }, [cleanup, ownerId]);

  return null;
};

export default Copilot;
