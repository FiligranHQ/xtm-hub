'use client';

import {
  useChatbotContentMargin,
  useChatbotContentTransition,
} from '@/components/ariane/use-chatbot-hooks';
import { ReactNode } from 'react';
interface ContentLayoutProps {
  children: ReactNode;
}

export const ContentLayout = ({ children }: ContentLayoutProps) => {
  const chatbotMargin = useChatbotContentMargin();
  const chatbotTransition = useChatbotContentTransition();

  return (
    <div
      className="flex-1 min-h-0"
      style={{
        marginRight: chatbotMargin > 0 ? `${chatbotMargin}px` : 0,
        transition: chatbotTransition,
      }}>
      <main className="h-full w-full overflow-y-auto bg-background p-6">
        {children}
      </main>
    </div>
  );
};
