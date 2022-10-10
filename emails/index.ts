import { buildSendMail, ComponentMail } from 'mailing-core';
import nodemailer from 'nodemailer';

let mailFn: (mail: ComponentMail) => Promise<any>;

export default function sendMail(mail: ComponentMail) {
  if (!process.env.EMAIL_SERVER) return () => {};
  mailFn =
    mailFn ??
    buildSendMail({
      transport: nodemailer.createTransport(process.env.EMAIL_SERVER),
      defaultFrom: process.env.EMAIL_FROM,
      configPath: './mailing.config.json'
    });

  return mailFn(mail);
}
