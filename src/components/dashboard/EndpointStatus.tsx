"use client";

import { useMachineStore } from "@/store/machine.store";
import { useProcessStore } from "@/store/process.store";
import { useMemo } from "react";
import { EndpointChecks } from "../endpointStatus/EndpointChecks";
import { getAllEndpoints } from "@/utils/getAllEndpoints";

export const EndpointStatus = () => {
  const { selectedMachine } = useMachineStore();
  const { getMachineData } = useProcessStore();
  const machineData = getMachineData(selectedMachine.id);
  const { servicesHealth } = machineData
  const allEndpoints = useMemo(() => {
    if (!selectedMachine.services || selectedMachine.services.length === 0) {
      return [];
    }
    return getAllEndpoints(selectedMachine, servicesHealth)
  }, [selectedMachine.services, servicesHealth]);

  if (!selectedMachine.services || selectedMachine.services.length === 0) {
    return (
      <div className="glass-effect p-4 mb-6 animate-scale-in">
        <h3 className="text-lg font-semibold mb-3">Service Endpoints</h3>
        <p className="text-text-muted text-center py-4">
          No services configured for {selectedMachine.name}
        </p>
      </div>
    );
  }

  const passedCount = allEndpoints.filter(e => e.passed).length;
  const failedCount = allEndpoints.filter(e => !e.passed && e.actual !== "pending").length;
  const pendingCount = allEndpoints.filter(e => e.actual === "pending").length;

  return (
    <div className="glass-effect p-4 mb-6 animate-scale-in">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold">
          Service Endpoints ({allEndpoints.length})
        </h3>
        <div className="flex gap-3 text-xs">
          <span className="text-success-400">✓ {passedCount}</span>
          {failedCount > 0 && <span className="text-error-400">✗ {failedCount}</span>}
          {pendingCount > 0 && <span className="text-text-muted">○ {pendingCount}</span>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {allEndpoints.map(
          (endpoint, index) =>
            <EndpointChecks endpoint={endpoint} index={index} key={index}>
            </EndpointChecks>
        )}
      </div>
    </div>
  );
};