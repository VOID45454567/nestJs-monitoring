export const storage = {
    getEmail: (): string => localStorage.getItem('pm2_email') || '',
    setEmail: (email: string) => localStorage.setItem('pm2_email', email),

    getServiceHealthSummary: (machineId: string, serviceId: string): { passed: number; total: number } | null => {
        try {
            const key = `pm2_health_summary_${machineId}_${serviceId}`;
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch {
            return null;
        }
    },
    setServiceHealthSummary: (machineId: string, serviceId: string, summary: { passed: number; total: number }) => {
        const key = `pm2_health_summary_${machineId}_${serviceId}`;
        localStorage.setItem(key, JSON.stringify(summary));
    },

    getNotifiedDowns: (machineId: string): Set<string> => {
        try {
            const key = `pm2_notified_downs_${machineId}`;
            return new Set(JSON.parse(localStorage.getItem(key) || '[]'));
        } catch {
            return new Set();
        }
    },
    addNotifiedDown: (machineId: string, processName: string) => {
        const key = `pm2_notified_downs_${machineId}`;
        const downs = storage.getNotifiedDowns(machineId);
        downs.add(processName);
        localStorage.setItem(key, JSON.stringify([...downs]));
    },
    clearNotifiedDown: (machineId: string, processName: string) => {
        const key = `pm2_notified_downs_${machineId}`;
        const downs = storage.getNotifiedDowns(machineId);
        downs.delete(processName);
        localStorage.setItem(key, JSON.stringify([...downs]));
    },

    getLastTestResults: (machineId: string): any => {
        try {
            const key = `pm2_last_tests_${machineId}`;
            return JSON.parse(localStorage.getItem(key) || '{}');
        } catch {
            return {};
        }
    },
    setLastTestResults: (machineId: string, results: any) => {
        const key = `pm2_last_tests_${machineId}`;
        localStorage.setItem(key, JSON.stringify(results));
    },

    getLastDigestTime: (machineId: string): number => {
        const key = `pm2_last_digest_${machineId}`;
        return Number(localStorage.getItem(key)) || 0;
    },
    setLastDigestTime: (machineId: string, time: number) => {
        const key = `pm2_last_digest_${machineId}`;
        localStorage.setItem(key, String(time));
    },

    getEndpointCheckCache: (machineId: string): Map<string, { passed: boolean; timestamp: number }> => {
        try {
            const key = `pm2_endpoint_cache_${machineId}`;
            const data = JSON.parse(localStorage.getItem(key) || '[]');
            return new Map(data);
        } catch {
            return new Map();
        }
    },
    setEndpointCheckCache: (machineId: string, cache: Map<string, { passed: boolean; timestamp: number }>) => {
        const key = `pm2_endpoint_cache_${machineId}`;
        localStorage.setItem(key, JSON.stringify([...cache.entries()]));
    },
};