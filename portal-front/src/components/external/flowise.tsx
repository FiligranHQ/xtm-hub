'use client';
import { meContext_fragment$data } from '@generated/meContext_fragment.graphql';
import { useCallback, useEffect, useRef } from 'react';

interface FlowiseGlobalProps {
  user?: meContext_fragment$data | null | undefined;
}

export default function FlowiseGlobal({ user }: FlowiseGlobalProps) {
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const initRef = useRef<boolean>(false);
  const lastUserRef = useRef<string>('');

  const getUserKey = useCallback(
    (user: meContext_fragment$data | null | undefined): string => {
      if (!user) return 'anonymous';
      return `${user.id || 'no-id'}-${user.first_name || ''}-${user.last_name || ''}`;
    },
    []
  );

  const getFlowiseSettings = useCallback(() => {
    const flowiseSettings: Record<string, unknown> = {
      chatflowid: '46a94d00-5058-4550-bf5f-39f908919836',
      apiHost: 'https://platform.filigran.ai',
      chatflowConfig: {
        startState: `[{ "key": "context", "value": "XTM Hub" }, { "key": "username", "value": "Anonymous User" }, { "key": "organization", "value": "Unknown" }]`,
      },
      observersConfig: {},
      theme: {
        button: {
          backgroundColor: '#001BDA',
          right: 20,
          bottom: 20,
          size: 48,
          dragAndDrop: true,
          iconColor: 'white',
          customIconSrc: 'https://filigran.io/app/uploads/2025/05/ai-chat.png',
          autoWindowOpen: {
            autoOpen: false,
            openDelay: 2,
            autoOpenOnMobile: false,
          },
        },
        tooltip: {
          showTooltip: false,
        },
        customCSS: `
          * {
            font-family: "IBM Plex Sans" !important;
          }
        `,
        chatWindow: {
          showTitle: true,
          showAgentMessages: false,
          title: 'Ariane Docs Assistant',
          titleAvatarSrc:
            'https://filigran.io/app/uploads/2025/05/embleme_filigran_blanc.png',
          welcomeMessage:
            "Hi there 👋 You're speaking with an AI Agent. I'm here to answer your questions, so what brings you here today?",
          errorMessage: 'Sorry, an error has occurred, please try again later.',
          backgroundColor: '#ffffff',
          height: 700,
          width: 400,
          fontSize: 14,
          starterPromptFontSize: 13,
          clearChatOnReload: false,
          sourceDocsTitle: 'Sources:',
          renderHTML: true,
          botMessage: {
            backgroundColor: '#f7f8ff',
            textColor: '#000000',
            showAvatar: true,
            avatarSrc:
              'https://filigran.io/app/uploads/2025/05/embleme_filigran_background.png',
          },
          userMessage: {
            backgroundColor: '#001BDA',
            textColor: '#ffffff',
            showAvatar: false,
          },
          textInput: {
            placeholder: 'Ask a question...',
            backgroundColor: '#ffffff',
            textColor: '#303235',
            sendButtonColor: '#001BDA',
            maxChars: 100,
            maxCharsWarningMessage:
              'You exceeded the characters limit. Please input less than 50 characters.',
            autoFocus: true,
            sendMessageSound: false,
            receiveMessageSound: false,
          },
          feedback: {
            color: '#303235',
          },
          dateTimeToggle: {
            date: true,
            time: true,
          },
          footer: {
            textColor: '#303235',
            text: 'Powered by',
            company: 'Filigran Ariane AI',
            companyLink: 'https://filigran.io',
          },
        },
      },
    };

    if (user) {
      const selected_organization = user.organizations?.find(
        (org) => org.id === user.selected_organization_id
      );

      flowiseSettings.chatflowConfig = {
        startState: `[{ "key": "context", "value": "XTM Hub" }, { "key": "username", "value": "${user.first_name} ${user.last_name}" }, { "key": "organization", "value": "${selected_organization?.name || 'Unknown'}" }]`,
      };
    } else {
      flowiseSettings.chatflowConfig = {
        startState: `[{ "key": "context", "value": "XTM Hub" }, { "key": "username", "value": "Anonymous User" }, { "key": "organization", "value": "Unknown" }]`,
      };
    }

    return flowiseSettings;
  }, [user]);

  const cleanupPreviousChatbot = useCallback(() => {
    if (scriptRef.current) {
      try {
        scriptRef.current.remove();
      } catch (e) {
        console.error('Script cleanup error:', e);
      }
      scriptRef.current = null;
    }

    const selectors = [
      '[id*="flowise"]',
      '[class*="flowise"]',
      '[class*="chatbot"]',
      '[id*="chatbot"]',
      '.fixed.bottom-5.right-5',
      '.fixed.bottom-4.right-4',
      '.fixed.bottom-6.right-6',
    ];

    selectors.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((element) => {
        try {
          element.remove();
        } catch (e) {
          console.error('Element cleanup error:', e);
        }
      });
    });
  }, []);

  const initializeChatbot = useCallback(() => {
    cleanupPreviousChatbot();

    const settings = getFlowiseSettings();
    const script = document.createElement('script');
    script.type = 'module';
    script.innerHTML = `
      try {
        const { default: Chatbot } = await import("https://cdn.jsdelivr.net/npm/flowise-embed/dist/web.js");
        if (window.FlowiseGlobalInstance) {
          try {
            if (typeof window.FlowiseGlobalInstance.destroy === 'function') {
              window.FlowiseGlobalInstance.destroy();
            }
          } catch (e) {
            console.error('Previous global instance cleanup:', e);
          }
        }

        window.FlowiseGlobalInstance = Chatbot;
        await Chatbot.init(${JSON.stringify(settings)});
      } catch (error) {
        console.error('Error initializing FlowiseGlobal:', error);
      }
    `;

    document.head.appendChild(script);
    scriptRef.current = script;
    initRef.current = true;
  }, [cleanupPreviousChatbot, getFlowiseSettings]);

  useEffect(() => {
    const currentUserKey = getUserKey(user);
    if (lastUserRef.current !== currentUserKey) {
      lastUserRef.current = currentUserKey;
      const timer = setTimeout(() => initializeChatbot(), 300);
      return () => clearTimeout(timer);
    }
  }, [initializeChatbot, getUserKey, user]);

  useEffect(() => {
    if (!initRef.current) {
      const timer = setTimeout(() => initializeChatbot(), 500);
      return () => clearTimeout(timer);
    }
  }, [initializeChatbot]);

  useEffect(() => {
    return () => {
      if (initRef.current) {
        cleanupPreviousChatbot();
        initRef.current = false;
      }
    };
  }, [cleanupPreviousChatbot]);

  return null;
}
