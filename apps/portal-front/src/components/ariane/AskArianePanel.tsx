'use client';
import { type ChatMode, ChatPanel } from '@filigran/chatbot';
import { LogoXtmOneIcon } from '@filigran/icon';
import { useMessages } from 'next-intl';
import { useTheme } from 'next-themes';
import { useContext, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { PortalContext } from '@/components/me/AppPortalContext';

interface AskArianePanelProps {
  mode: ChatMode;
  onClose: () => void;
  onModeChange: (mode: ChatMode) => void;
  onWidthChange?: (width: number) => void;
  onResizeStart?: () => void;
  onResizeEnd?: () => void;
}

/**
 * Maps the chatbot package's internal default keys (which contain "." or "…")
 */
const ARIANE_KEY_MAP: Record<string, string> = {
  'Analyzing results…': 'AnalyzingResults',
  'Ask a question...': 'AskQuestion',
  'Composing answer…': 'ComposingAnswer',
  'How can I help you, ': 'WelcomeMessage',
  'Sorry, an error occurred. Please try again.': 'ErrorOccurred',
  'Thinking...': 'Thinking',
  'Unable to connect. Please check the configuration.': 'UnableToConnect',
  'Uses AI. Verify results.': 'Disclaimer',
  'Using tools…': 'UsingTools',
};

const AskArianePanel = ({
  mode,
  onClose,
  onModeChange,
  onWidthChange,
  onResizeStart,
  onResizeEnd,
}: AskArianePanelProps) => {
  const messages = useMessages();
  const arianeMessages = (messages?.Ariane ?? {}) as Record<string, string>;
  const t = (key: string): string => {
    const mappedKey = ARIANE_KEY_MAP[key] ?? key;
    return arianeMessages[mappedKey] ?? key;
  };

  const { me } = useContext(PortalContext);
  const { resolvedTheme } = useTheme();
  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  const isDarkMode = resolvedTheme === 'dark';
  const firstName = me?.first_name ?? 'User';
  const topOffset = 128;

  const logoIcon = <LogoXtmOneIcon className="size-4" />;

  useEffect(() => {
    const div = document.createElement('div');
    div.id = 'ask-ariane-portal';
    div.className = isDarkMode ? 'dark' : '';
    document.body.appendChild(div);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setContainer(div);
    return () => {
      document.body.removeChild(div);
      setContainer(null);
    };
  }, [isDarkMode]);

  if (!container) {
    return null;
  }

  return createPortal(
    <ChatPanel
      mode={mode}
      onClose={onClose}
      onModeChange={onModeChange}
      topOffset={topOffset}
      backendType="rest"
      apiBaseUrl="/api/chatbot/chat"
      apiEndpoints={{
        agents: '/agents',
        sessions: '/sessions',
        messages: '/messages',
      }}
      promptSuggestions={[
        t('PromptSuggestion1'),
        t('PromptSuggestion2'),
        t('PromptSuggestion3'),
        t('PromptSuggestion4'),
      ]}
      user={{ firstName }}
      t={t}
      logoIcon={logoIcon}
      resizable={mode === 'sidebar'}
      onWidthChange={onWidthChange}
      onResizeStart={onResizeStart}
      onResizeEnd={onResizeEnd}
    />,
    container
  );
};

export default AskArianePanel;
