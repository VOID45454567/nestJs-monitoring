import { create } from 'zustand';
import { Process, HealthReport, TestResult } from '@/lib/api/types';

interface ProcessState {
    processes: Process[];
    selectedProcess: Process | null;
    health: HealthReport | null;
    tests: TestResult | null;
    logs: { out: string[]; error: string[] };
    loading: boolean;

    setProcesses: (processes: Process[]) => void;
    setSelectedProcess: (process: Process | null) => void;
    setHealth: (health: HealthReport | null) => void;
    setTests: (tests: TestResult | null) => void;
    setLogs: (logs: { out: string[]; error: string[] }) => void;
    setLoading: (loading: boolean) => void;
    reset: () => void;
}

export const useProcessStore = create<ProcessState>((set) => ({
    processes: [],
    selectedProcess: null,
    health: null,
    tests: null,
    logs: { out: [], error: [] },
    loading: false,

    setProcesses: (processes) => set({ processes }),
    setSelectedProcess: (process) => set({ selectedProcess: process }),
    setHealth: (health) => set({ health }),
    setTests: (tests) => set({ tests }),
    setLogs: (logs) => set({ logs }),
    setLoading: (loading) => set({ loading }),
    reset: () => set({
        processes: [],
        selectedProcess: null,
        health: null,
        tests: null,
        logs: { out: [], error: [] },
    }),
}));