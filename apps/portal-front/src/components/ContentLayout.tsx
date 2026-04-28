'use client';

import { FunctionComponent, ReactNode } from 'react';
import {
  useChatbotContentMargin,
  useChatbotContentTransition,
} from './ariane/use-chatbot-hooks';
interface ContentLayoutProps {
  children: ReactNode;
}

export const ContentLayout: FunctionComponent<ContentLayoutProps> = ({
  children,
}) => {
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
