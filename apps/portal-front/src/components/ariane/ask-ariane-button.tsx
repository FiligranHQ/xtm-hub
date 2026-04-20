'use client';

import { cn } from '@/lib/utils';
import { LogoXtmOneIcon } from '@filigran/icon';
import { Button } from '@filigran/ui';
import { useTranslations } from 'next-intl';
import { type FunctionComponent } from 'react';
import AskArianePanel from './ask-ariane-panel';
import { useChatbot } from './use-chatbot-hooks';

const AskArianeButton: FunctionComponent = () => {
  const t = useTranslations();
  const {
    isOpen,
    mode,
    toggleChat,
    closeChat,
    setMode,
    setSidebarWidth,
    setIsResizing,
  } = useChatbot();

  const askArianeButtonStyle = cn(
    'gap-2 transition-all duration-200',
    'hover:bg-[#D6C2FA]/15',
    'active:bg-[#D6C2FA]/25',
    isOpen && 'bg-[#D6C2FA]/15 hover:bg-[#D6C2FA]/25'
  );

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleChat}
        className={askArianeButtonStyle}>
        <LogoXtmOneIcon
          className="size-4"
          style={{ color: '#D6C2FA' }}
        />
        <span className="bg-gradient-to-r from-[#D6C2FA] to-[#B286FF] bg-clip-text text-transparent">
          {t('Ariane.Ask')}
        </span>
      </Button>

      {isOpen && (
        <AskArianePanel
          mode={mode}
          onClose={closeChat}
          onModeChange={setMode}
          onWidthChange={setSidebarWidth}
          onResizeStart={() => setIsResizing(true)}
          onResizeEnd={() => setIsResizing(false)}
        />
      )}
    </>
  );
};

export default AskArianeButton;
