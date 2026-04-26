import { useMachineStore } from "@/store/machine.store";
import { useProcessStore } from "@/store/process.store";
import { useWebSocketStore } from "@/store/websocket.store";
import { WSEventType, WSMessage } from "@/types";
import { sendEmail } from "../notification/email";
import { storage } from "../storage";
import { buildEndpointsDegradedBody, buildEndpointsDegradedSubject, buildEndpointsRecoveredBody, buildEndpointsRecoveredSubject, buildProcessDownBody, buildProcessDownSubject } from "../notification/email/getHtmlBody";

export class MachineConnection {
    ws: WebSocket | null = null;
    machineId: string;
    wsUrl: string;
    reconnectAttempts = 0;
    maxReconnectAttempts = 5;
    reconnectTimeout: NodeJS.Timeout | undefined;
    mounted = false;

    constructor(machineId: string, wsUrl: string) {
        this.machineId = machineId;
        this.wsUrl = wsUrl;
    }

    connect() {
        if (!this.mounted) return;
        if (this.reconnectAttempts >= this.maxReconnectAttempts) return;
        if (this.ws?.readyState === WebSocket.OPEN || this.ws?.readyState === WebSocket.CONNECTING) return;

        this.disconnect();

        try {
            this.ws = new WebSocket(this.wsUrl);

            this.ws.onopen = () => {
                if (!this.mounted) { this.ws?.close(); return; }
                this.reconnectAttempts = 0;
                useWebSocketStore.getState().setMachineConnected(this.machineId, true);

                this.ws?.send(JSON.stringify({
                    event: WSEventType.APP_INIT,
                    data: { machineId: this.machineId }
                }));
            };

            this.ws.onmessage = (event) => {
                if (!this.mounted) return;
                try {
                    const message: WSMessage = JSON.parse(event.data);
                    this.handleMessage(message);
                } catch { }
            };

            this.ws.onclose = (event) => {
                if (!this.mounted) return;
                useWebSocketStore.getState().setMachineConnected(this.machineId, false);
                this.ws = null;

                if (event.code !== 1000) {
                    this.reconnectAttempts++;
                    const delay = Math.min(3000 * this.reconnectAttempts, 30000);
                    this.reconnectTimeout = setTimeout(() => this.connect(), delay);
                }
            };

            this.ws.onerror = () => {
                useWebSocketStore.getState().setMachineConnected(this.machineId, false);
            };
        } catch {
            this.reconnectAttempts++;
        }
    }

    private handleMessage(message: WSMessage) {
        const store = useProcessStore.getState();
        const machine = useMachineStore.getState().machines.find(m => m.id === this.machineId);
        if (!machine) return;

        switch (message.event) {
            case WSEventType.APP_INIT:
                if (message.data.processes) {
                    store.setMachineProcesses(this.machineId, message.data.processes);
                }
                break;

            case WSEventType.PROCESS_UPDATE:
                if (message.data) {
                    store.setMachineProcesses(this.machineId, message.data);
                }
                break;

            case WSEventType.PROCESS_STATUS_CHANGE:
                if (message.data.pm2Id !== undefined && message.data.newStatus) {
                    store.updateMachineProcessStatus(this.machineId, message.data.pm2Id, message.data.newStatus);
                    this.notifyProcessDown(message.data, machine.name);
                }
                break;

            case WSEventType.SERVICE_HEALTH_REPORT:
                if (message.data && message.data.summary) {
                    store.setMachineServiceHealth(this.machineId, message.data.serviceId, message.data);
                    this.notifyEndpointsDown(message.data, machine.name);
                }
                break;
        }
    }

    private async notifyProcessDown(data: any, machineName: string) {
        const email = storage.getEmail();
        if (!email || data.processName === 'unknown') return;

        if (data.newStatus === 'stopped' || data.newStatus === 'errored') {
            const notifiedDowns = storage.getNotifiedDowns(this.machineId);
            if (notifiedDowns.has(data.processName)) return;

            const subject = buildProcessDownSubject({ machineName, processName: data.processName })
            const body = buildProcessDownBody(
                {
                    machine: { id: this.machineId, name: machineName },
                    newStatus: data.newStatus,
                    oldStatus: data.oldStatus,
                    processName: data.processName
                })

            const sent = await sendEmail(email, subject, body);
            if (sent) storage.addNotifiedDown(this.machineId, data.processName);
        }

        if (data.newStatus === 'online') {
            storage.clearNotifiedDown(this.machineId, data.processName);
        }
    }

    private async notifyEndpointsDown(data: any, machineName: string) {
        const email = storage.getEmail();
        if (!email || !data.summary) return;

        if (data.pm2Status === 'stopped' || data.pm2Status === 'errored') return;

        const previousSummary = storage.getServiceHealthSummary(this.machineId, data.serviceId);
        storage.setServiceHealthSummary(this.machineId, data.serviceId, data.summary);

        if (!previousSummary) return;

        if (data.summary.passed < previousSummary.passed) {
            const failedEndpoints = data.endpoints?.filter((e: any) => !e.passed) || [];
            const subject = buildEndpointsDegradedSubject({ machineName, processName: data.processName })
            const body = buildEndpointsDegradedBody(
                {
                    machine: { id: this.machineId, name: machineName },
                    currentSummary: data.summary,
                    failedEndpoints,
                    previousSummary,
                    processName: data.processName,
                    status: data.status
                }
            )

            await sendEmail(email, subject, body);
        }

        if (data.summary.passed > previousSummary.passed && data.pm2Status === 'online') {
            const subject = buildEndpointsRecoveredSubject({ machineName, processName: data.processName })
            const body = buildEndpointsRecoveredBody({ currentSummary: data.summary, machineName, processName: data.processName, previousSummary })
            await sendEmail(email, subject, body);
        }
    }

    disconnect() {
        if (this.reconnectTimeout) { clearTimeout(this.reconnectTimeout); this.reconnectTimeout = undefined; }
        if (this.ws) { this.ws.onclose = null; this.ws.close(1000, 'Disconnect'); this.ws = null; }
        this.reconnectAttempts = 0;
    }

    destroy() {
        this.mounted = false;
        this.disconnect();
    }
}