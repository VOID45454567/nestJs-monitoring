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

        <div className="space-y-3 max-h-[calc(100vh-24rem)] overflow-y-auto pr-1">
          {processes.map(
              (process, index) =>
                  <ProcessItem
                      key={index}
                      process={process}
                      selectedProcessId={selectedProcess?.id}
                      servicesHealth={servicesHealth}
                      onSetSelectedProcess={(process) => setSelectedProcess(process)}
                      selectedMachine={selectedMachine}
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