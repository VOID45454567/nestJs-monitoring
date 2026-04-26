"use client";

import { useEffect } from "react";
import { useProcessStore } from "@/store/process.store";
import { useMachineStore } from "@/store/machine.store";
import { cn } from "@/utils/cn";
import { Box, Wifi, WifiOff } from "lucide-react";
import { ProcessItem } from "../processList/ProcessItem";

export const ProcessList = () => {
  const { selectedMachine } = useMachineStore();
  const { getMachineData, selectedProcess, setSelectedProcess } = useProcessStore();
  const machineData = getMachineData(selectedMachine.id);
  const { processes, servicesHealth, wsConnected } = machineData;

  useEffect(() => {
    setSelectedProcess(null);
  }, [selectedMachine, setSelectedProcess]);


  if (!selectedMachine.services || selectedMachine.services.length === 0) {
    return (
      <div className="card h-full animate-scale-in">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-bg-tertiary flex items-center justify-center">
              <Box className="w-4 h-4 text-text-muted" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Processes</h3>
              <p className="text-xs text-text-muted">{selectedMachine.name}</p>
            </div>
          </div>
          <div className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
            wsConnected
              ? "bg-success-500/10 text-success-400 border-success-500/20"
              : "bg-error-500/10 text-error-400 border-error-500/20"
          )}>
            {wsConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            {wsConnected ? "Live" : "Offline"}
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <div className="w-16 h-16 rounded-2xl bg-bg-tertiary flex items-center justify-center">
            <Box className="w-8 h-8 text-text-muted" />
          </div>
          <p className="text-text-muted text-sm font-medium">No services configured</p>
          <p className="text-text-muted text-xs">Add services in machines.ts</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card h-full animate-scale-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-bg-tertiary flex items-center justify-center">
            <Box className="w-4 h-4 text-text-muted" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Processes</h3>
            <p className="text-xs text-text-muted">{processes.length} total</p>
          </div>
        </div>
      </div>

      <div className="space-y-3 max-h-[calc(100vh-24rem)] overflow-y-auto pr-1">
        {processes.map(
          (process, index) =>
            <ProcessItem
              key={index}
              process={process}
              selectedMachine={selectedMachine}
              selectedProcessId={selectedProcess?.id}
              servicesHealth={servicesHealth}
              onSetSelectedPorcess={(process) => setSelectedProcess(process)}
            >
            </ProcessItem>
        )}

        {processes.length === 0 && (
          <div className="text-center py-8 text-text-muted">
            <Box className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No processes running</p>
          </div>
        )}
      </div>
    </div>
  );
};