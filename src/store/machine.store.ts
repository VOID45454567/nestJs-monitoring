import { create } from 'zustand';
import { MachineConfig, APP_CONFIG } from '@/conf/machines';

export type MachineStatus = 'connected' | 'error' | 'checking' | 'unknown';

interface MachineState {
    machines: MachineConfig[];
    selectedMachine: MachineConfig;
    machinesStatus: Map<string, MachineStatus>;
    setSelectedMachine: (machineId: string) => void;
    setMachineStatus: (machineId: string, status: MachineStatus) => void;
    checkMachineHealth: (machineId: string) => Promise<void>;
    checkAllMachinesHealth: () => Promise<void>;
}

const initialMachine = APP_CONFIG.machines.find(m => m.enabled !== false) || APP_CONFIG.machines[0];

export const useMachineStore = create<MachineState>((set, get) => ({
    machines: APP_CONFIG.machines.filter(m => m.enabled !== false),
    selectedMachine: initialMachine,
    machinesStatus: new Map(),

    setSelectedMachine: (machineId) =>
        set((state) => ({
            selectedMachine: state.machines.find((m) => m.id === machineId) || state.selectedMachine,
        })),

    setMachineStatus: (machineId, status) =>
        set((state) => {
            const newStatus = new Map(state.machinesStatus);
            newStatus.set(machineId, status);
            return { machinesStatus: newStatus };
        }),

    checkMachineHealth: async (machineId) => {
        const { setMachineStatus } = get();
        const machine = get().machines.find(m => m.id === machineId);
        if (!machine) return;

        setMachineStatus(machineId, 'checking');

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            const response = await fetch(`${machine.url}/health`, {
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (response.ok) {
                setMachineStatus(machineId, 'connected');
            } else {
                setMachineStatus(machineId, 'error');
            }
        } catch (error) {
            setMachineStatus(machineId, 'error');
        }
    },

    checkAllMachinesHealth: async () => {
        const { machines, checkMachineHealth } = get();
        await Promise.all(machines.map(m => checkMachineHealth(m.id)));
    },
}));