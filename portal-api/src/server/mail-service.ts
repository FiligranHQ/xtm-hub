import config from 'config';
import * as fsPromises from 'fs/promises';
import nodemailer from 'nodemailer';
import * as path from 'path';

const smtpOptions = config.get('smtp_options');
const transporter = nodemailer.createTransport(smtpOptions);

export async function renderEmail<T extends Record<string, string>>(
  substitutions: T
) {
  const templatePath = 'transactional';
  const filepath = path.join(
    'src/server/mail-template',
    `${templatePath}.html`
  );
  let template = (await fsPromises.readFile(filepath)).toString();

  for (const sub in substitutions) {
    template = template.replace(`{{ ${sub} }}`, substitutions[sub]);
  }

  return template;
}

export const sendMail = async ({
  from = (config.get('smtp_options.auth.user') as string) ||
    'no-reply@scredplatform.io',
  to = 'jean-philippe.kha@filigran.io',
  subject = 'test mail',
  text = 'Please confirm your email address in order to activate your account.',
}) => {
  const html = await renderEmail({
    name: 'Jean-Philippe',
    project: 'XTM Hub',
    text,
  });
  const mailOptions = {
    from,
    to,
    subject,
    html,
    attachments: [
      {
        filename: 'logo_filigran.png',
        path: 'src/server/mail-template/images/logo_filigran.png',
        cid: 'logo_filigran.png',
      },
    ],
  };

  transporter?.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Email error: ' + error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
};
