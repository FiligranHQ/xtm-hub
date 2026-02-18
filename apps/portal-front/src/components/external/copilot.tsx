'use client';
import { meContext_fragment$data } from '@generated/meContext_fragment.graphql';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef } from 'react';

const COPILOT_WIDGET_URL =
  'https://copilot.filigran.ai/api/v1/public/widget.js';
const COPILOT_TOKEN = 'jNJu1JTbbPwNqk1tqEOw-WjsKU4dEcgn';
const COPILOT_SCRIPT_ID = 'filigran-copilot-widget';

interface CopilotProps {
  user?: meContext_fragment$data | null | undefined;
}

export default function Copilot({ user }: CopilotProps) {
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const lastUserRef = useRef<string>('');
  const pathname = usePathname();

  const getUserKey = useCallback(
    (u: meContext_fragment$data | null | undefined): string => {
      if (!u) return 'anonymous';
      return `${u.id || 'no-id'}-${u.first_name || ''}-${u.last_name || ''}`;
    },
    []
  );

  const buildContext = useCallback(() => {
    const context: Record<string, string> = {
      product: 'XTM Hub',
      page: pathname || '/',
    };

    if (user) {
      context.username =
        `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim() || 'Unknown';
      context.email = user.email;

      const selectedOrganization = user.organizations?.find(
        (org) => org.id === user.selected_organization_id
      );
      context.organization = selectedOrganization?.name || 'Unknown';
      context.isPersonalSpace = selectedOrganization?.personal_space
        ? 'true'
        : 'false';
    } else {
      context.username = 'Anonymous User';
      context.organization = 'Unknown';
    }

    return JSON.stringify(context);
  }, [user, pathname]);

  const cleanup = useCallback(() => {
    if (scriptRef.current) {
      try {
        scriptRef.current.remove();
      } catch (_) {}
      scriptRef.current = null;
    }

    const existing = document.getElementById(COPILOT_SCRIPT_ID);
    if (existing) {
      try {
        existing.remove();
      } catch (_) {}
    }
  }, []);

  const initialize = useCallback(() => {
    cleanup();

    const script = document.createElement('script');
    script.id = COPILOT_SCRIPT_ID;
    script.src = COPILOT_WIDGET_URL;
    script.setAttribute('data-token', COPILOT_TOKEN);
    script.setAttribute('data-context', buildContext());
    script.async = true;

    document.head.appendChild(script);
    scriptRef.current = script;
  }, [cleanup, buildContext]);

  /**
   * Update the data-context attribute on the existing script element
   * when the page changes, without doing a full widget re-init.
   * This keeps the chat state intact across navigations while giving
   * the LLM fresh page context for the next question.
   */
  const updateContext = useCallback(() => {
    const scriptEl =
      scriptRef.current || document.getElementById(COPILOT_SCRIPT_ID);
    if (scriptEl) {
      scriptEl.setAttribute('data-context', buildContext());
    }
  }, [buildContext]);

  // Full re-init when the user identity changes
  useEffect(() => {
    const currentUserKey = getUserKey(user);
    if (lastUserRef.current !== currentUserKey) {
      lastUserRef.current = currentUserKey;
      const timer = setTimeout(() => initialize(), 300);
      return () => clearTimeout(timer);
    }
  }, [initialize, getUserKey, user]);

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
}
