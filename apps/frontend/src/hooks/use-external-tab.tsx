import { logFrontendError } from '@/components/error-frontend-log.graphql';
import { getUrlOrigin } from '@/utils/external-url';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useRelayEnvironment } from 'react-relay';

interface UseExternalTabProps {
  url: string;
  tabName: string;
  onMessage?: (event: MessageEvent) => void;
  onClosingTab?: () => void;
  preventUnload: boolean;
}

interface UseExternalTabReturn {
  isTabOpen: boolean;
  openTab: () => void;
  closeTab: () => void;
  focusTab: () => void;
  postMessage: (message: Record<string, unknown>) => void;
}

const useExternalTab = ({
  url,
  tabName,
  onMessage,
  onClosingTab,
  preventUnload,
}: UseExternalTabProps): UseExternalTabReturn => {
  const tabRef = useRef<WindowProxy | null>(null);
  const tabOriginRef = useRef<string | null>(null);
  const [isTabOpen, setIsTabOpen] = useState(false);
  const environment = useRelayEnvironment();
  const beforeUnloadHandler = (event: BeforeUnloadEvent) => {
    event.preventDefault();
    return null;
  };
  const openTab = useCallback(() => {
    setIsTabOpen(true);
    tabOriginRef.current = getUrlOrigin(url);
    tabRef.current = window.open(url, tabName);
  }, [url, tabName]);

  const closeTab = useCallback(() => {
    tabRef.current?.close();
    tabRef.current = null;
    tabOriginRef.current = null;
    setIsTabOpen(false);
  }, []);

  const focusTab = useCallback(() => {
    tabRef.current?.focus();
  }, []);

  const postMessage = useCallback((message: Record<string, unknown>) => {
    if (!tabOriginRef.current) {
      return;
    }
    tabRef.current?.postMessage(message, tabOriginRef.current);
  }, []);

  // A ref, so that a new onMessage on each render of the caller does not re-subscribe the listener.
  const onMessageRef = useRef(onMessage);
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!tabRef.current || event.source !== tabRef.current) {
        return;
      }
      if (!tabOriginRef.current || event.origin !== tabOriginRef.current) {
        if (event.data?.action) {
          logFrontendError(
            environment,
            `XTM Hub: message ignored, it comes from "${event.origin}" but the opened platform origin is "${tabOriginRef.current}"`
          );
        }
        return;
      }
      onMessageRef.current?.(event);
    };
    let checkInterval: ReturnType<typeof setInterval> | undefined;
    if (isTabOpen) {
      window.addEventListener('message', handleMessage);
      if (preventUnload) {
        window.addEventListener('beforeunload', beforeUnloadHandler);
      }
      checkInterval = setInterval(() => {
        if (tabRef.current?.closed) {
          if (onClosingTab) {
            onClosingTab();
          }
          closeTab();
          clearInterval(checkInterval);
        }
      }, 500);
    }

    return () => {
      clearInterval(checkInterval);
      window.removeEventListener('message', handleMessage);

      if (preventUnload) {
        window.removeEventListener('beforeunload', beforeUnloadHandler);
      }
    };
  }, [isTabOpen, closeTab, onClosingTab, preventUnload, environment]);

  return {
    isTabOpen,
    openTab,
    closeTab,
    focusTab,
    postMessage,
  };
};

export default useExternalTab;
