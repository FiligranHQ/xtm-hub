const COPILOT_BASE_URL = 'https://copilot.filigran.ai/api/v1/public';
const COPILOT_TOKEN = 'jNJu1JTbbPwNqk1tqEOw-WjsKU4dEcgn';

interface CopilotConfig {
  name?: string;
  description?: string;
  icon?: string;
  suggested_prompts?: string[];
}

interface CopilotSession {
  session_id: string;
}

interface CopilotMessages {
  messages?: { role: string; content: string }[];
  is_processing?: boolean;
}

export interface CopilotAgent {
  id: string;
  name?: string;
  slug: null;
  icon: null;
  description: string | null;
}

const injectConversationId = (sseText: string, sessionId: string): string => {
  return sseText
    .split('\n')
    .map((line) => {
      if (!line.startsWith('data: ')) return line;
      try {
        const parsed: Record<string, unknown> = JSON.parse(line.slice(6));
        if (parsed.type === 'done') {
          parsed.conversation_id = sessionId;
          return `data: ${JSON.stringify(parsed)}`;
        }
      } catch {
        /* not JSON */
      }
      return line;
    })
    .join('\n');
};

export const fetchCopilotAgents = async (): Promise<CopilotAgent[]> => {
  const response = await fetch(
    `${COPILOT_BASE_URL}/chat/${COPILOT_TOKEN}/config`
  );
  if (!response.ok) {
    throw new Error(`Copilot error: ${response.status}`);
  }
  const config = (await response.json()) as CopilotConfig;
  return [
    {
      id: COPILOT_TOKEN,
      name: config.name,
      slug: null,
      icon: null,
      description: config.description ?? null,
    },
  ];
};

export const fetchSessionMessages = async (
  conversationId: string
): Promise<{ role: string; content: string }[]> => {
  const response = await fetch(
    `${COPILOT_BASE_URL}/chat/${COPILOT_TOKEN}/sessions/${encodeURIComponent(conversationId)}`
  );
  if (!response.ok) {
    return [];
  }
  const data = (await response.json()) as CopilotMessages;
  return data.messages ?? [];
};

export const streamMessage = async (opts: {
  content: string;
  conversationId?: string;
  visitorId: string;
  context: Record<string, string>;
}): Promise<{ body: string; sessionId: string }> => {
  let sessionId = opts.conversationId;

  if (!sessionId) {
    const sessionResponse = await fetch(
      `${COPILOT_BASE_URL}/chat/${COPILOT_TOKEN}/sessions`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitor_id: opts.visitorId }),
      }
    );
    if (!sessionResponse.ok) {
      throw new Error('Failed to create session');
    }
    const sessionData = (await sessionResponse.json()) as CopilotSession;
    sessionId = sessionData.session_id;
  }

  const streamResponse = await fetch(
    `${COPILOT_BASE_URL}/chat/${COPILOT_TOKEN}/sessions/${encodeURIComponent(sessionId)}/messages/stream`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: opts.content, context: opts.context }),
    }
  );

  if (!streamResponse.ok || !streamResponse.body) {
    throw new Error('Copilot stream error');
  }

  const rawBody = await streamResponse.text();
  const body = injectConversationId(rawBody, sessionId);

  return { body, sessionId };
};
