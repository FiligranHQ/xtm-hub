import config from 'config';
import * as fsPromises from 'fs/promises';
import nodemailer from 'nodemailer';
import * as path from 'path';
import { MailTemplates, templateSubjects } from './mail-template/mail';

const smtpOptions = config.get('smtp_options');
const transporter = nodemailer.createTransport(smtpOptions);

interface SendMailParams<T extends keyof MailTemplates> {
  to: string;
  template: T;
  params: MailTemplates[T];
}

export async function renderEmail<T extends keyof MailTemplates>(
  templateName: T,
  params: MailTemplates[T]
) {
  const filepath = path.join(
    'src/server/mail-template',
    `${templateName}.html`
  );

  let templateContent = (await fsPromises.readFile(filepath)).toString();

  const replaceParams = {
    ...params,
    base_url_front: config.get('base_url_front'),
    contactEmail: 'xtm-hub-support@filigran.io',
  };
  for (const key in replaceParams) {
    const value = replaceParams[key as keyof MailTemplates[T]];
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    templateContent = templateContent.replace(regex, value as string);
  }

  return templateContent;
}

export const sendMail = async <T extends keyof MailTemplates>({
  to,
  template,
  params,
}: SendMailParams<T>) => {
  const from = config.get('smtp_options.auth.user') as string;
  const subject = templateSubjects[template](params);
  const html = await renderEmail(template, params);
  const mailOptions = {
    from,
    to,
    subject,
    html,
  };

  transporter?.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Email error: ' + error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
};
