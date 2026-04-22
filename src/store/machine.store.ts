import { create } from 'zustand';
import { MachineConfig, APP_CONFIG } from '@/conf/machines';

interface MachineState {
    machines: MachineConfig[];
    selectedMachine: MachineConfig;
    setSelectedMachine: (machineId: string) => void;
}

export const useMachineStore = create<MachineState>((set) => ({
    machines: APP_CONFIG.machines,
    selectedMachine: APP_CONFIG.machines[0],
    setSelectedMachine: (machineId) =>
        set((state) => ({
            selectedMachine: state.machines.find((m) => m.id === machineId) || state.selectedMachine,
        })),
}));