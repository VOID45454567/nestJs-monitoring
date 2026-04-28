import { create } from 'zustand';
import { Process } from '@/types';

export interface ServiceEndpoint {
    name: string;
    url: string;
    expected: number;
    actual: number | string;
    passed: boolean;
    duration: number;
}

export interface Logs {
    out: string[]
    error: string[]
}

export interface ServiceHealth {
    serviceId: string;
    processName: string;
    pm2Status: string;
    endpoints: ServiceEndpoint[]
    summary: { total: number; passed: number; failed: number };
    status: 'healthy' | 'unhealthy' | 'critical' | 'unknown';
}

interface MachineProcessData {
    processes: Process[];
    servicesHealth: Record<string, ServiceHealth>;
    wsConnected: boolean;
}

interface ProcessState {
    machinesData: Record<string, MachineProcessData>;
    selectedProcess: Process | null;
    logs: Logs;
    loading: boolean;

    getMachineData: (machineId: string) => MachineProcessData;

    setMachineProcesses: (machineId: string, processes: Process[]) => void;
    setMachineServiceHealth: (machineId: string, serviceId: string, health: ServiceHealth) => void;
    updateMachineProcessStatus: (machineId: string, id: number, status: string) => void;
    setMachineConnected: (machineId: string, connected: boolean) => void;

    setSelectedProcess: (process: Process | null) => void;
    setLogs: (logs: { out: string[]; error: string[] }) => void;
    setLoading: (loading: boolean) => void;
}

const getDefaultMachineData = (): MachineProcessData => ({
    processes: [],
    servicesHealth: {},
    wsConnected: false,
});

export const useProcessStore = create<ProcessState>((set, get) => ({
    machinesData: {},
    selectedProcess: null,
    logs: { out: [], error: [] },
    loading: false,

    getMachineData: (machineId) => {
        return get().machinesData[machineId] || getDefaultMachineData();
    },

    setMachineProcesses: (machineId, processes) =>
        set((state) => ({
            machinesData: {
                ...state.machinesData,
                [machineId]: {
                    ...(state.machinesData[machineId] || getDefaultMachineData()),
                    processes,
                }
            }
        })),

    setMachineServiceHealth: (machineId, serviceId, health) =>
        set((state) => ({
            machinesData: {
                ...state.machinesData,
                [machineId]: {
                    ...(state.machinesData[machineId] || getDefaultMachineData()),
                    servicesHealth: {
                        ...(state.machinesData[machineId]?.servicesHealth || {}),
                        [serviceId]: health,
                    }
                }
            }
        })),

    updateMachineProcessStatus: (machineId, id, status) =>
        set((state) => {
            const machineData = state.machinesData[machineId];
            if (!machineData) return state;

            return {
                machinesData: {
                    ...state.machinesData,
                    [machineId]: {
                        ...machineData,
                        processes: machineData.processes.map(p =>
                            p.id === id ? { ...p, status } : p
                        )
                    }
                }
            };
        }),

    setMachineConnected: (machineId, connected) =>
        set((state) => ({
            machinesData: {
                ...state.machinesData,
                [machineId]: {
                    ...(state.machinesData[machineId] || getDefaultMachineData()),
                    wsConnected: connected,
                }
            }
        })),

    setSelectedProcess: (process) => set({ selectedProcess: process }),
    setLogs: (logs) => set({ logs }),
    setLoading: (loading) => set({ loading }),
}));