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
};