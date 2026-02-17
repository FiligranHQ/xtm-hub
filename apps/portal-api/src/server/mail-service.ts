import config from 'config';
import * as fsPromises from 'fs/promises';
import { toGlobalId } from 'graphql-relay/node/node.js';
import Handlebars from 'handlebars';
import nodemailer from 'nodemailer';
import * as path from 'path';
import { logApp } from '../utils/app-logger.util';
import { MailTemplates, templateSubjects } from './mail-template/mail';

const smtpOptions = config.get('smtp_options');
const transporter = nodemailer.createTransport(smtpOptions);

const templateCache = new Map<string, HandlebarsTemplateDelegate>();

interface SendMailParams<T extends keyof MailTemplates> {
  to: string | string[];
  template: T;
  params: MailTemplates[T];
}

export const buildServiceLink = ({
  serviceDefinitionIdentifier,
  serviceInstanceId,
}: {
  serviceDefinitionIdentifier: string;
  serviceInstanceId: string;
}) => {
  return `${config.get('base_url_front')}/app/service/${serviceDefinitionIdentifier}/${toGlobalId('ServiceInstance', serviceInstanceId)}`;
};

export async function renderEmail<T extends keyof MailTemplates>(
  templateName: T,
  params: MailTemplates[T]
) {
  let compiledTemplate = templateCache.get(templateName);

  if (!compiledTemplate) {
    const filepath = path.join(
      'src/server/mail-template',
      `${templateName}.html`
    );
    const templateContent = (await fsPromises.readFile(filepath)).toString();
    compiledTemplate = Handlebars.compile(templateContent);
    templateCache.set(templateName, compiledTemplate);
  }

  const renderParams = {
    ...params,
    base_url_front: config.get('base_url_front'),
    contactEmail: 'xtm-hub-support@filigran.io',
  };

  return compiledTemplate(renderParams);
}

export const sendMail = async <T extends keyof MailTemplates>({
  to,
  template,
  params,
}: SendMailParams<T>) => {
  const from = config.get<string>('smtp_options.from');
  const subject = templateSubjects[template](params);
  const html = await renderEmail(template, params);

  if (!(process.env.VITEST_MODE || process.env.NODE_ENV === 'test')) {
    transporter?.sendMail(
      {
        from,
        to,
        subject,
        html,
      },
      (error, info) => {
        if (error) {
          logApp.error('Email error: ' + error);
        } else {
          logApp.info('Email sent: ' + info.response);
        }
      }
    );
  }
};

/**
 * Clear the template cache.
 * Useful for testing or when templates are updated at runtime.
 */
export const clearTemplateCache = () => {
  templateCache.clear();
};
