import { useContext } from 'react';
import {
  ChatbotContext,
  SIDEBAR_GAP,
  type ChatbotContextType,
} from './chatbot-context';

export const useChatbot = (): ChatbotContextType => {
  const context = useContext(ChatbotContext);
  if (!context) {
    throw new Error('useChatbot must be used within a ChatbotProvider');
  }
  return context;
};

export const useChatbotContentMargin = (): number => {
  const context = useContext(ChatbotContext);
  if (!context) return 0;
  const { isOpen, mode, sidebarWidth } = context;
  if (isOpen && mode === 'sidebar') {
    return sidebarWidth + SIDEBAR_GAP;
  }
  return 0;
};

export const useChatbotContentTransition = (): string => {
  const context = useContext(ChatbotContext);

  if (!context) return 'none';

  const { isResizing } = context;

  if (isResizing) return 'none';

  return 'margin-right 225ms ease-in-out';
};
