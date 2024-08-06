import nodemailer from 'nodemailer';
import config from 'config';
const smtpOptions = config.get('smtp_options');
const transporter = nodemailer.createTransport(smtpOptions);

export const sendMail = async (
  from: string = 'no-reply@scredplatform.io',
  to: string = 'berof12139@foraro.com',
  subject: string = 'test mail',
  text: string = 'Hello This is an SMTP message with customizations'
) => {
  const mailOptions = {
    from,
    to,
    subject,
    text,
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Email error: ' + error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
};
