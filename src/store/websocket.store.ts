import { create } from 'zustand';

type WSStatus = 'connected' | 'disconnected' | 'error';

interface WebSocketState {
    machinesStatus: Record<string, WSStatus>;
    status: WSStatus;
    setStatus: (status: WSStatus) => void;
    setMachineConnected: (machineId: string, connected: boolean) => void;
}

export const useWebSocketStore = create<WebSocketState>((set) => ({
    machinesStatus: {},
    status: 'disconnected',
    setStatus: (status) => set({ status }),
    setMachineConnected: (machineId, connected) =>
        set((state) => ({
            machinesStatus: {
                ...state.machinesStatus,
                [machineId]: connected ? 'connected' : 'disconnected',
            }
        })),
}));