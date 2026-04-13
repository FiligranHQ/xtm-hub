import { Express, Request, Response } from 'express';
import { validate as uuidValidate } from 'uuid';
import { logApp } from '../../utils/app-logger.util';

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

export const chatbotProxyEndpoint = (app: Express) => {
  // GET /api/chatbot/chat/agents -> GET /chat/{TOKEN}/config
  app.get('/api/chatbot/chat/agents', async (req: Request, res: Response) => {
    if (!req.session?.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    try {
      const response = await fetch(
        `${COPILOT_BASE_URL}/chat/${COPILOT_TOKEN}/config`
      );
      if (!response.ok) {
        return res.status(response.status).json({ message: 'Copilot error' });
      }
      const config = (await response.json()) as CopilotConfig;
      // Transform config to agents format expected by @filigran/chatbot
      return res.json([
        {
          id: COPILOT_TOKEN,
          name: config.name,
          slug: null,
          icon: null,
          description: config.description ?? null,
        },
      ]);
    } catch (error) {
      logApp.error('Chatbot proxy: failed to fetch agents', { error });
      return res.status(502).json({ message: 'Copilot unavailable' });
    }
  });

  // POST /api/chatbot/chat/sessions -> GET /chat/{TOKEN}/sessions/{conversation_id}
  app.post(
    '/api/chatbot/chat/sessions',
    async (req: Request, res: Response) => {
      if (!req.session?.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      const { conversation_id } = req.body;
      if (!conversation_id || !uuidValidate(conversation_id)) {
        return res.json({ messages: [] });
      }
      try {
        const response = await fetch(
          `${COPILOT_BASE_URL}/chat/${COPILOT_TOKEN}/sessions/${conversation_id}`
        );
        if (!response.ok) {
          return res.json({ messages: [] });
        }
        const data = (await response.json()) as CopilotMessages;
        return res.json({ messages: data.messages ?? [] });
      } catch (error) {
        logApp.error('Chatbot proxy: failed to fetch session', { error });
        return res.json({ messages: [] });
      }
    }
  );

  // POST /api/chatbot/chat/messages -> POST /chat/{TOKEN}/sessions/{conversation_id}/messages/stream
  app.post(
    '/api/chatbot/chat/messages',
    async (req: Request, res: Response) => {
      if (!req.session?.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      const { content, conversation_id } = req.body;
      try {
        // Create or reuse session
        let sessionId = conversation_id;
        if (sessionId && !uuidValidate(sessionId)) {
          return res.status(400).json({ message: 'Invalid conversation_id' });
        }
        if (!sessionId) {
          const sessionResponse = await fetch(
            `${COPILOT_BASE_URL}/chat/${COPILOT_TOKEN}/sessions`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                visitor_id: req.session.user.id,
              }),
            }
          );
          if (!sessionResponse.ok) {
            return res
              .status(502)
              .json({ message: 'Failed to create session' });
          }
          const sessionData = (await sessionResponse.json()) as CopilotSession;
          sessionId = sessionData.session_id;
        }

        // Build context from user session
        const user = req.session.user;
        const context = {
          product: 'XTM Hub',
          username: `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim(),
          email: user.email,
        };

        // Forward message to copilot
        const streamResponse = await fetch(
          `${COPILOT_BASE_URL}/chat/${COPILOT_TOKEN}/sessions/${sessionId}/messages/stream`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content, context }),
          }
        );

        if (!streamResponse.ok || !streamResponse.body) {
          return res.status(502).json({ message: 'Copilot stream error' });
        }

        let body = await streamResponse.text();

        // Inject conversation_id into the done event
        body = body.replace(
          /data: ({.*"type"\s*:\s*"done".*})/,
          (_match, json: string) => {
            try {
              const parsed: Record<string, unknown> = JSON.parse(json);
              parsed.conversation_id = sessionId;
              return `data: ${JSON.stringify(parsed)}`;
            } catch {
              return _match;
            }
          }
        );

        // Send response with SSE content type so the component can parse it
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.send(body);
      } catch (error) {
        logApp.error('Chatbot proxy: failed to stream message', { error });
        if (!res.headersSent) {
          return res.status(502).json({ message: 'Copilot unavailable' });
        }
        res.end();
      }
    }
  );
};
