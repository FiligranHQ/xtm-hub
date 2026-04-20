import { Express, Request, Response } from 'express';
import { validate as uuidValidate } from 'uuid';
import { CopilotService } from '../../thirdparty/copilot/client';
import { logApp } from '../../utils/app-logger.util';

export const chatbotProxyEndpoint = (app: Express) => {
  // GET /api/chatbot/chat/agents -> GET /chat/{TOKEN}/config
  app.get('/api/chatbot/chat/agents', async (req: Request, res: Response) => {
    if (!req.session?.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    try {
      const agents = await CopilotService.fetchAgents();
      return res.json(agents);
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
        const messages =
          await CopilotService.fetchSessionMessages(conversation_id);
        return res.json({ messages });
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
      if (conversation_id && !uuidValidate(conversation_id)) {
        return res.status(400).json({ message: 'Invalid conversation_id' });
      }
      try {
        const user = req.session.user;
        const { body } = await CopilotService.streamMessage({
          content,
          conversationId: conversation_id,
          visitorId: user.id,
          context: {
            product: 'XTM Hub',
            username: `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim(),
            email: user.email,
          },
        });

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
