'use client';

import type { ChatMode } from '@filigran/chatbot';
import { type ReactNode, useCallback, useMemo, useState } from 'react';
import { ChatbotContext } from '@/components/ariane/chatbot-context';

const SIDEBAR_WIDTH_KEY = 'arianeChatSidebarWidth';
const CHAT_MODE_KEY = 'arianeChatMode';
const DEFAULT_WIDTH = 400;

interface ChatbotProviderProps {
  children: ReactNode;
}

const ChatbotProvider = ({ children }: ChatbotProviderProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setModeState] = useState<ChatMode>(() => {
    if (typeof window === 'undefined') return 'sidebar';
    const stored = localStorage.getItem(CHAT_MODE_KEY);
    return (stored as ChatMode) || 'sidebar';
  });

  const [sidebarWidth, setSidebarWidthState] = useState(() => {
    if (typeof window === 'undefined') return DEFAULT_WIDTH;
    const stored = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    if (stored) {
      const parsed = parseInt(stored, 10);
      if (!Number.isNaN(parsed) && parsed >= 300) return parsed;
    }
    return DEFAULT_WIDTH;
  });
  const [isResizing, setIsResizing] = useState(false);

  const openChat = useCallback(() => setIsOpen(true), []);
  const closeChat = useCallback(() => setIsOpen(false), []);
  const toggleChat = useCallback(() => setIsOpen((prev) => !prev), []);

  const setMode = useCallback((newMode: ChatMode) => {
    setModeState(newMode);
    localStorage.setItem(CHAT_MODE_KEY, newMode);
  }, []);

  const setSidebarWidth = useCallback((width: number) => {
    setSidebarWidthState(width);
    localStorage.setItem(SIDEBAR_WIDTH_KEY, String(width));
  }, []);

  const value = useMemo(
    () => ({
      isOpen,
      mode,
      sidebarWidth,
      isResizing,
      openChat,
      closeChat,
      toggleChat,
      setMode,
      setSidebarWidth,
      setIsResizing,
    }),
    [
      isOpen,
      mode,
      sidebarWidth,
      isResizing,
      openChat,
      closeChat,
      toggleChat,
      setMode,
      setSidebarWidth,
    ]
  );

  return (
    <ChatbotContext.Provider value={value}>{children}</ChatbotContext.Provider>
  );
};

export default ChatbotProvider;
