import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
    isClient: boolean;
    setIsClient: (isClient: boolean) => void;
}

export const useAppStore = create<AppState>()(
        (set) => ({
            isClient: true,
            setIsClient: (isClient) => set({ isClient }),
        }),
);