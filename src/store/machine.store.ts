import { create } from 'zustand';
import { MachineConfig, APP_CONFIG } from '@/conf/machines';

export type MachineStatus = 'connected' | 'error' | 'checking' | 'unknown';

interface MachineState {
    machines: MachineConfig[];
    selectedMachine: MachineConfig;
    machinesStatus: Map<string, MachineStatus>;
    setSelectedMachine: (machineId: string) => void;
    setMachineStatus: (machineId: string, status: MachineStatus) => void;
}

const initialMachine = APP_CONFIG.machines[0];

export const useMachineStore = create<MachineState>((set, get) => ({
    machines: APP_CONFIG.machines,
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
}));