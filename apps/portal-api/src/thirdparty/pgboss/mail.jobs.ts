import type { MailTemplates } from '../../server/mail-template/mail';

export const MAIL_QUEUES = {
  SEND: 'mail.send',
  DEAD_LETTER: 'mail.deadletter',
} as const;

export interface MailJobData {
  to: string | string[];
  template: keyof MailTemplates;
  params: Record<string, unknown>;
}