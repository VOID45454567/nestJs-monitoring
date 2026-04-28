import { MachineConfig } from '@/conf/machines';
import { Process } from '@/types';
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
}

export const createApiClient = (machine: MachineConfig): ApiClient => {
    return new ApiClient(machine.url)
};