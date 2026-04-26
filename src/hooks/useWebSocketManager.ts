"use client";

import { useEffect, useRef } from "react";
import { useMachineStore } from "@/store/machine.store";
import { MachineConnection } from "@/lib/ws/MachineConnection";

export const useWebSocketManager = () => {
    const connectionsRef = useRef<Map<string, MachineConnection>>(new Map());
    const { machines } = useMachineStore();

    useEffect(() => {
        const currentIds = new Set(machines.map(m => m.id));

        connectionsRef.current.forEach((conn, id) => {
            if (!currentIds.has(id)) {
                conn.destroy();
                connectionsRef.current.delete(id);
            }
        });

        machines.forEach(machine => {
            if (!connectionsRef.current.has(machine.id)) {
                const conn = new MachineConnection(machine.id, machine.wsUrl);
                conn.mounted = true;
                connectionsRef.current.set(machine.id, conn);
                conn.connect();
            }
        });

        return () => {
            connectionsRef.current.forEach(conn => conn.destroy());
            connectionsRef.current.clear();
        };
    }, [machines]);

    return null;
};