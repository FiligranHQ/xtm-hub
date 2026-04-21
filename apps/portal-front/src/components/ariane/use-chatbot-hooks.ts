import { useContext } from 'react';
import { ChatbotContext, type ChatbotContextType } from './chatbot-context';

export const useChatbot = (): ChatbotContextType => {
  const context = useContext(ChatbotContext);
  if (!context) {
    throw new Error('useChatbot must be used within a ChatbotProvider');
  }
  return context;
};
