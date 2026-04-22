import { MachineConfig } from '@/conf/machines';
import { Process } from '@/types';
import { APP_CONFIG } from '@/conf/machines';

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
    const subject = '[PM2 Monitor] Test Email';
    const body = `
    <h2>PM2 Monitor Test Email</h2>
    <p>This is a test email to verify your notification settings.</p>
    <p><strong>SMTP Configuration:</strong></p>
    <ul>
      <li>Host: ${APP_CONFIG.smtp.host}</li>
      <li>Port: ${APP_CONFIG.smtp.port}</li>
      <li>From: ${APP_CONFIG.smtp.from}</li>
      <li>To: ${to}</li>
    </ul>
    <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
    <hr>
    <p style="color: #666;">If you received this, your email configuration is working correctly!</p>
  `;

    return await sendEmail(to, subject, body);
}

export function generateDownAlertBody(
    machine: MachineConfig,
    processName: string,
    oldStatus: string,
    newStatus: string
): string {
    return `
    <h2>⚠️ Process Down Alert</h2>
    <p><strong>Machine:</strong> ${machine.name} (${machine.id})</p>
    <p><strong>Process:</strong> ${processName}</p>
    <p><strong>Status change:</strong> ${oldStatus} → ${newStatus}</p>
    <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
    <hr>
    <p style="color: #666;">PM2 Monitor</p>
  `;
}

export function generateDigestBody(
    machine: MachineConfig,
    newDowns: Process[],
    failedEndpoints: { name: string; url: string; status: string | number }[],
    testTimestamp?: string
): string {
    let body = `
    <h2>PM2 Monitor Digest</h2>
    <p><strong>Machine:</strong> ${machine.name}</p>
    <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
  `;

    if (newDowns.length > 0) {
        body += `
      <h3 style="color: #ef4444;">⚠️ Processes DOWN (${newDowns.length})</h3>
      <ul>
        ${newDowns.map(p => `<li><strong>${p.name}</strong> - Status: ${p.status}</li>`).join('')}
      </ul>
    `;
    }

    if (failedEndpoints.length > 0) {
        body += `
      <h3 style="color: #f59e0b;">❌ Failed Endpoint Checks (${failedEndpoints.length})</h3>
      ${testTimestamp ? `<p>Check run at: ${new Date(testTimestamp).toLocaleString()}</p>` : ''}
      <ul>
        ${failedEndpoints.map(e => `
          <li>
            <strong>${e.name}</strong> (${e.url})<br>
            Status: ${e.status}
          </li>
        `).join('')}
      </ul>
    `;
    }

    body += `<hr><p style="color: #666;">Next digest in 15 minutes if issues persist.</p>`;
    return body;
}