import { create } from 'zustand';

type WSStatus = 'connected' | 'disconnected' | 'error' | 'connecting';

interface WebSocketState {
    status: WSStatus;
    setStatus: (status: WSStatus) => void;
}

export const useWebSocketStore = create<WebSocketState>((set) => ({
    status: 'disconnected',
    setStatus: (status) => set({ status }),
}));