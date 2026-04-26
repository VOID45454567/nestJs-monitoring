import { MachineConfig } from "@/conf/machines"
import { Process } from "@/types"

interface ITestEmail {
    to: string
}

interface IDownMessage {
    machine: Pick<MachineConfig, 'name' | 'id'>,
    processName: string,
    oldStatus: string,
    newStatus: string
}

interface IEndpointsDegraded {
    machine: Pick<MachineConfig, 'name' | 'id'>,
    processName: string,
    status: string,
    currentSummary: { passed: number; total: number },
    previousSummary: { passed: number; total: number },
    failedEndpoints: Array<{
        name: string;
        url: string;
        expected: number;
        actual: number | string;
        duration: number
    }>
}

interface ISubject {
    machineName: string,
    processName: string
}

interface IDigestMessage {
    machine: Pick<MachineConfig, 'name' | 'id'>,
    downProcesses: Process[],
    failedEndpoints: { name: string; url: string; status: string | number }[],
    testTimestamp?: string
}

interface IEndpointsRecovery {
    machineName: string,
    processName: string,
    currentSummary: { passed: number; total: number },
    previousSummary: { passed: number; total: number }
}

export const buildTestEmailBody = (data: ITestEmail): string => {
    return `
        <h2>PM2 Monitor Test Email</h2>
        <p>This is a test email to verify your notification settings.</p>
        <p><strong>To:</strong> ${data.to}</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        <hr>
        <p style="color: #666;">If you received this, your email configuration is working correctly!</p>
    `;
}

export const buildTestEmailSubject = (): string => {
    return '[PM2 Monitor] Test Email';
}

export const buildProcessDownSubject = (data: ISubject): string => {
    return `[PM2 Monitor] ${data.processName} is DOWN on ${data.machineName}`;
}

export const buildProcessDownBody = (data: IDownMessage): string => {
    return `
        <h2>Process Down Alert</h2>
        <p><strong>Machine:</strong> ${data.machine.name} (${data.machine.id})</p>
        <p><strong>Process:</strong> ${data.processName}</p>
        <p><strong>Status:</strong> ${data.oldStatus} → ${data.newStatus}</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        <hr>
        <p style="color: #666;">PM2 Monitor</p>
    `;
}

export const buildEndpointsDegradedSubject = (data: ISubject): string => {
    return `[PM2 Monitor] ${data.processName} endpoints DEGRADED on ${data.machineName}`;
}

export const buildEndpointsDegradedBody = (data: IEndpointsDegraded): string => {
    return `
        <h2>Service Health Degraded</h2>
        <p><strong>Machine:</strong> ${data.machine.name} (${data.machine.id})</p>
        <p><strong>Service:</strong> ${data.processName}</p>
        <p><strong>Status:</strong> ${data.status.toUpperCase()}</p>
        <p><strong>Endpoints:</strong> ${data.currentSummary.passed}/${data.currentSummary.total} passed (was ${data.previousSummary.passed}/${data.previousSummary.total})</p>
        ${data.failedEndpoints.length > 0 ? `
        <h3 style="color: #ef4444;">Failed Endpoints (${data.failedEndpoints.length})</h3>
        <ul>
            ${data.failedEndpoints.map(e => `
                <li>
                    <strong>${e.name}</strong><br>
                    URL: ${e.url}<br>
                    Expected: ${e.expected} | Got: ${e.actual}<br>
                    Duration: ${e.duration}ms
                </li>
            `).join('')}
        </ul>
        ` : ''}
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        <hr>
        <p style="color: #666;">PM2 Monitor</p>
    `;
}

export const buildEndpointsRecoveredSubject = (data: ISubject): string => {
    return `[PM2 Monitor] ${data.processName} endpoints RECOVERED on ${data.machineName}`;
}

export const buildEndpointsRecoveredBody = (data: IEndpointsRecovery): string => {
    return `
        <h2>Service Health Improved</h2>
        <p><strong>Machine:</strong> ${data.machineName}</p>
        <p><strong>Service:</strong> ${data.processName}</p>
        <p><strong>Endpoints:</strong> ${data.currentSummary.passed}/${data.currentSummary.total} passed (was ${data.previousSummary.passed}/${data.previousSummary.total})</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        <hr>
        <p style="color: #666;">PM2 Monitor</p>
    `;
}

export const buildDigestSubject = (machineName: string): string => {
    return `[PM2 Monitor] ${machineName} - Digest ${new Date().toLocaleString()}`;
}

export const buildDigestBody = (data: IDigestMessage): string => {
    let body = `
        <h2>PM2 Monitor Digest</h2>
        <p><strong>Machine:</strong> ${data.machine.name}</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
    `;

    if (data.downProcesses.length > 0) {
        body += `
            <h3 style="color: #ef4444;">Processes DOWN (${data.downProcesses.length})</h3>
            <ul>
                ${data.downProcesses.map(p => `<li><strong>${p.name}</strong> - Status: ${p.status}</li>`).join('')}
            </ul>
        `;
    }

    if (data.failedEndpoints.length > 0) {
        body += `
            <h3 style="color: #f59e0b;">Failed Endpoint Checks (${data.failedEndpoints.length})</h3>
            ${data.testTimestamp ? `<p>Check run at: ${new Date(data.testTimestamp).toLocaleString()}</p>` : ''}
            <ul>
                ${data.failedEndpoints.map(e => `
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