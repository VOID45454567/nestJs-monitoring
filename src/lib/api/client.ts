import { MachineConfig } from '@/conf/machines';
import { Process, HealthReport, TestResult, EndpointCheckResult } from '@/types';
import axios, { AxiosInstance } from 'axios';

class ApiClient {
    private client: AxiosInstance

    constructor(baseUrl: string) {
        this.client = axios.create({
            baseURL: baseUrl,
            timeout: 5000,
            headers: {
                "Content-Type": "application/json"
            }
        })

    }

    async getProcesses(): Promise<Process[]> {
        const { data } = await this.client.get<{ processes: Process[] }>('/api/pm2/processes');
        return data.processes || [];
    }

    async getHealth(processName: string): Promise<HealthReport> {
        const { data } = await this.client.get<HealthReport>(`/api/pm2/health/${processName}`);
        return data;
    }

    async getTests(pm2Id: number): Promise<TestResult> {
        const { data } = await this.client.get<TestResult>(`/api/tests/${pm2Id}`);
        return data;
    }

    async getLogs(pm2Id: number, lines: number = 50): Promise<{ out: string[]; error: string[] }> {
        const { data } = await this.client.get<{ logs: { out: string[]; error: string[] } }>(
            `/api/pm2/process/${pm2Id}`,
            { params: { lines } }
        );
        return data.logs || { out: [], error: [] };
    }

    async processAction(pm2Id: number, action: 'start' | 'stop' | 'restart'): Promise<void> {
        await this.client.post(`/api/pm2/process/${pm2Id}/${action}`);
    }

    async checkEndpoint(endpoint: {
        url: string;
        method: string;
        expected_status_code: number;
    }): Promise<EndpointCheckResult> {
        const start = Date.now();

        try {
            const response = await axios({
                method: endpoint.method,
                url: endpoint.url,
                timeout: 5000,
                validateStatus: () => true,
            });

            return {
                passed: response.status === endpoint.expected_status_code,
                status: response.status,
                duration: Date.now() - start,
                timepstamp: new Date().toISOString(),
            };
        } catch (error: any) {
            return {
                passed: false,
                status: error.code === 'ECONNABORTED' ? 'TIMEOUT' : error.message,
                duration: Date.now() - start,
                timepstamp: new Date().toISOString(),
            };
        }
    }
}

export const createApiClient = (machine: MachineConfig): ApiClient => {
    return new ApiClient(machine.url)
};