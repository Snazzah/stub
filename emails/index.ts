import { buildSendMail } from 'mailing-core';
import nodemailer from 'nodemailer';

const sendMail = buildSendMail({
  transport: nodemailer.createTransport(process.env.EMAIL_SERVER),
  defaultFrom: process.env.EMAIL_FROM,
  configPath: './mailing.config.json'
});

export default sendMail;
