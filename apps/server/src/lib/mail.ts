let nodemailer: any;
try {
  // use require to make the dependency optional at build time
  // projects using template can install nodemailer when they need mail support
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  nodemailer = require('nodemailer');
} catch (e) {
  nodemailer = null;
}

type Transporter = any;
type NodemailerSendOptions = any;

import { ConfigService } from '../config/config.service';
import fs from 'fs';
import path from 'path';

export interface MailConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
}

export interface SendMailOptions {
  to?: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  attachments?: NodemailerSendOptions['attachments'];
}

let transporter: Transporter | null = null;
let currentMailConfig: string | null = null;

export function isMailConfigured(
  customConfig?: MailConfig,
): customConfig is MailConfig {
  const mailConfig: MailConfig | undefined =
    customConfig || ConfigService.get('mail');
  return !!(mailConfig && mailConfig.host && mailConfig.user);
}

export const hasMailConfig = isMailConfigured;

export function getTransporter(customConfig?: MailConfig): Transporter {
  const mailConfig: MailConfig | undefined =
    customConfig || ConfigService.get('mail');
  if (!isMailConfigured(mailConfig)) {
    throw new Error('邮件服务未配置，请联系管理员配置 SMTP 服务');
  }

  const configKey = JSON.stringify(mailConfig);
  if (transporter && currentMailConfig === configKey && !customConfig) {
    return transporter;
  }

  if (!nodemailer) {
    throw new Error('nodemailer 未安装，请在需要邮件功能时安装 nodemailer');
  }

  const newTransporter = nodemailer.createTransport({
    host: mailConfig.host,
    port: mailConfig.port,
    secure: mailConfig.secure,
    auth: {
      user: mailConfig.user,
      pass: mailConfig.pass,
    },
  });

  if (!customConfig) {
    transporter = newTransporter;
    currentMailConfig = configKey;
  }

  return newTransporter;
}

export async function sendMail(
  options: SendMailOptions,
  customConfig?: MailConfig,
) {
  if (!options.to || (Array.isArray(options.to) && options.to.length === 0)) {
    throw new Error('收件人邮箱不能为空');
  }
  const mailConfig: MailConfig | undefined =
    customConfig || ConfigService.get('mail');
  const t = getTransporter(customConfig);

  const mailOptions: NodemailerSendOptions = {
    from: options.from || mailConfig?.from || mailConfig?.user,
    to: Array.isArray(options.to) ? options.to.join(',') : options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
    attachments: options.attachments,
  };

  return t.sendMail(mailOptions);
}

export async function verifyTransporter(
  customConfig?: MailConfig,
): Promise<boolean> {
  const t = getTransporter(customConfig);
  return t.verify();
}

let verifyTemplate: string | null = null;
let logoSvg: string | null = null;

function getVerifyTemplate(): string {
  if (!verifyTemplate) {
    verifyTemplate = fs.readFileSync(
      path.join(__dirname, '../../assets/verify_zh.html'),
      'utf-8',
    );
  }
  return verifyTemplate;
}

function getLogoSvg(): string {
  if (!logoSvg) {
    logoSvg = fs
      .readFileSync(path.join(__dirname, '../../assets/logo.svg'), 'utf-8')
      .replaceAll('1em', '40px');
  }
  return logoSvg;
}

export interface VerifyMailOptions {
  to?: string;
  nickname: string;
  verifyUrl: string;
  domain: string;
}

export async function sendVerifyMail(
  options: VerifyMailOptions,
  customConfig?: MailConfig,
) {
  if (!options.to) {
    throw new Error('收件人邮箱不能为空');
  }
  const template = getVerifyTemplate();
  const logo = getLogoSvg();
  const siteName = process.env.NAME || 'Template';

  const html = template
    .replaceAll('{{domain}}', options.domain)
    .replaceAll('{{logo}}', logo)
    .replaceAll('{{nickname}}', options.nickname)
    .replaceAll('{{email}}', options.to)
    .replaceAll('{{verifyUrl}}', options.verifyUrl)
    .replaceAll('{{name}}', siteName);

  return sendMail(
    {
      to: options.to,
      subject: `[${siteName}] 请验证您的电子邮件地址`,
      html,
    },
    customConfig,
  );
}
