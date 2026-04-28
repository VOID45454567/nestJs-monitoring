"use client";

import { useMachineStore } from "@/store/machine.store";
import { Server } from "lucide-react";
import { MachineItem } from "../machineSelector/MachineItem";

export const MachineSelector = () => {
    const {
        machines,
        selectedMachine,
        machinesStatus,
        setSelectedMachine,
    } = useMachineStore();

    return (
        <div className="glass-effect p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-bg-tertiary flex items-center justify-center">
                        <Server className="w-4 h-4 text-text-muted" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold">Machines</h3>
                        <p className="text-xs text-text-muted">{machines.length} configured</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {machines.map(
                    (machine, index) =>
                        <MachineItem
                            machine={machine}
                            machinesStatus={machinesStatus}
                            selectedMachine={selectedMachine}
                            onSetSelectedMachine={(id) => setSelectedMachine(id)}
                            key={index}
                        >
                        </MachineItem>
                )}
            </div>
        </div>
    );
};