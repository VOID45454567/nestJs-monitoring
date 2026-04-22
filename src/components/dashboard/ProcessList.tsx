"use client";

import { useEffect, useState } from "react";
import { useProcessStore } from "@/store/process.store";
import { useMachineStore } from "@/store/machine.store";
import { useAppStore } from "@/store/app.store";
import { createApiClient } from "@/lib/api/client";
import { storage } from "@/lib/storage";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { formatMemory, formatUptime } from "@/utils/formatters";
import { cn } from "@/utils/cn";

export const ProcessList = () => {
  const { selectedMachine } = useMachineStore();
  const { processes, selectedProcess, setProcesses, setSelectedProcess } =
    useProcessStore();
  const { isClient } = useAppStore();
  const [notifiedDowns, setNotifiedDowns] = useState<Set<string>>(new Set());

  const fetchProcesses = async () => {
    if (!isClient) return;
    try {
      const api = createApiClient(selectedMachine);
      const procs = await api.getProcesses();
      setProcesses(procs);
      setNotifiedDowns(storage.getNotifiedDowns(selectedMachine.id));
    } catch (err) {
      console.error("Failed to fetch processes:", err);
    }
  };

  useEffect(() => {
    fetchProcesses();
    const interval = setInterval(fetchProcesses, 30000);
    return () => clearInterval(interval);
  }, [selectedMachine, isClient]);

  return (
    <div className="card h-full animate-scale-in">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Processes</h3>
        <Button variant="ghost" size="sm" onClick={fetchProcesses}>
          Refresh
        </Button>
      </div>

      <div className="space-y-1 max-h-150 overflow-y-auto">
        {processes.map((process) => (
          <div
            key={process.id}
            onClick={() => setSelectedProcess(process)}
            className={cn(
              "p-4 rounded-lg cursor-pointer transition-all duration-200",
              "hover:bg-bg-elevated hover-lift",
              selectedProcess?.id === process.id
                ? "bg-primary-500/20 border-l-4 border-l-primary-500 shadow-glow"
                : "bg-bg-tertiary/50 border-l-4 border-l-transparent",
              notifiedDowns.has(process.name) && "border-l-error-500",
            )}
          >
            <div className="font-medium mb-2">{process.name}</div>
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <StatusBadge status={process.status} />
                <span className="text-text-secondary">PID: {process.pid}</span>
              </div>
              <div className="flex justify-between text-text-muted">
                <span>CPU: {process.cpu.toFixed(1)}%</span>
                <span>MEM: {formatMemory(process.memory)}</span>
                <span>{formatUptime(process.uptime)}</span>
              </div>
            </div>
          </div>
        ))}

        {processes.length === 0 && (
          <div className="text-center py-8 text-text-muted animate-pulse-slow">
            No processes found
          </div>
        )}
      </div>
    </div>
  );
};
