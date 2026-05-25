'use client';
import { buildContext, CopilotUser, getUserKey } from './copilot.utils';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef } from 'react';

const COPILOT_WIDGET_URL =
  'https://copilot.filigran.ai/api/v1/public/widget.js';
const COPILOT_TOKEN = 'jNJu1JTbbPwNqk1tqEOw-WjsKU4dEcgn';
const COPILOT_SCRIPT_ID = 'filigran-copilot-widget';

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

  const cleanup = useCallback(() => {
    if (scriptRef.current) {
      try {
        scriptRef.current.remove();
      } catch (_e) {}
      scriptRef.current = null;
    }

    const existing = document.getElementById(COPILOT_SCRIPT_ID);
    if (existing) {
      try {
        existing.remove();
      } catch (_e) {}
    }
  }, []);

  const initialize = useCallback(() => {
    cleanup();

    const script = document.createElement('script');
    script.id = COPILOT_SCRIPT_ID;
    script.src = COPILOT_WIDGET_URL;
    script.setAttribute('data-token', COPILOT_TOKEN);
    script.setAttribute('data-context', buildContextFn());
    script.async = true;

    document.head.appendChild(script);
    scriptRef.current = script;
  }, [cleanup, buildContextFn]);

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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return null;
};

export default Copilot;
