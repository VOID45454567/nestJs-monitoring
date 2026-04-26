import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
    email: string;
    isClient: boolean;
    setEmail: (email: string) => void;
    setIsClient: (isClient: boolean) => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            email: '',
            isClient: true,
            setEmail: (email) => set({ email }),
            setIsClient: (isClient) => set({ isClient }),
        }),
        {
            name: 'app-storage',
            partialize: (state) => ({ email: state.email }),
        }
    )
);