import { APP_CONFIG } from '@/conf/machines';
import { buildTestEmailBody, buildTestEmailSubject } from './getHtmlBody';


export async function sendEmail(to: string, subject: string, body: string): Promise<boolean> {
  try {
    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, subject, html: body }),
    });
    return res.ok;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

export function validateSMTPConfig(): boolean {
  const { host, port, auth } = APP_CONFIG.smtp;
  return !!(host && port && auth.user && auth.pass);
}

export async function sendTestEmail(to: string): Promise<boolean> {
  const subject = buildTestEmailSubject()
  const body = buildTestEmailBody({ to })
  return await sendEmail(to, subject, body);
}