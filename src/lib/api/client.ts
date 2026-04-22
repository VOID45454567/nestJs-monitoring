import { MachineConfig } from '@/config/machines';
import { Process, HealthReport, TestResult, EndpointCheckResult } from '@/types';

class ApiClient {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, options);
        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }
        return response.json();
    }

    async getProcesses(): Promise<Process[]> {
        const data = await this.request<{ processes: Process[] }>('/api/pm2/processes');
        return data.processes || [];
    }

    async getHealth(processName: string): Promise<HealthReport> {
        return this.request(`/api/pm2/health/${processName}`);
    }

    async getTests(pm2Id: number): Promise<TestResult> {
        return this.request(`/api/tests/${pm2Id}`);
    }

    async getLogs(pm2Id: number, lines: number = 50): Promise<{ out: string[]; error: string[] }> {
        const data = await this.request<{ logs: { out: string[]; error: string[] } }>(
            `/api/pm2/process/${pm2Id}?lines=${lines}`
        );
        return data.logs || { out: [], error: [] };
    }

    async processAction(pm2Id: number, action: 'start' | 'stop' | 'restart'): Promise<any> {
        return this.request(`/api/pm2/process/${pm2Id}/${action}`, { method: 'POST' });
    }

    async checkEndpoint(endpoint: { url: string; method: string; expected_status_code: number }): Promise<EndpointCheckResult> {
        const start = Date.now();
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            const response = await fetch(endpoint.url, {
                method: endpoint.method,
                signal: controller.signal,
            });
            clearTimeout(timeoutId);

            return {
                passed: response.status === endpoint.expected_status_code,
                status: response.status,
                duration: Date.now() - start,
            };
        } catch (error: any) {
            return {
                passed: false,
                status: error.name === 'AbortError' ? 'TIMEOUT' : error.message,
                duration: Date.now() - start,
            };
        }
    }
}

export const createApiClient = (machine: MachineConfig) => new ApiClient(machine.url);