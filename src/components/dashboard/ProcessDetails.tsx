"use client";

import { useState, useEffect, useMemo } from "react";
import { useProcessStore } from "@/store/process.store";
import { useMachineStore } from "@/store/machine.store";
import { createApiClient } from "@/lib/api/client";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/utils/cn";
import {
  Activity, Globe, FileText, RefreshCw,
  AlertTriangle, Server,
} from "lucide-react";
import { LogsTab } from "../processDetails/LogsTab";
import { EndpointsTab } from "../processDetails/EndpointsTab";
import { HealthTab } from "../processDetails/HealthTab";
import { ProcessNotSelected } from "../processDetails/ProcessNotSelected";

type Tab = "health" | "endpoints" | "logs";

export const ProcessDetails = () => {
  const { selectedMachine } = useMachineStore();
  const {
    getMachineData,
    selectedProcess,
    logs,
    loading,
    setLogs,
    setLoading,
  } = useProcessStore();
  const machineData = getMachineData(selectedMachine.id);
  const { servicesHealth } = machineData;
  const [activeTab, setActiveTab] = useState<Tab>("health");

  const serviceHealth = useMemo(() => {
    if (!selectedProcess) return null;
    console.log('Looking for health:', selectedProcess.name, 'in:', servicesHealth);
    const found = Object.values(servicesHealth).find(h => h.processName === selectedProcess.name) ?? null;
    console.log('Found:', found);
    return found;
  }, [selectedProcess, servicesHealth]);

  const serviceEndpoints = useMemo(() => {
    if (!serviceHealth || !Array.isArray(serviceHealth.endpoints)) return [];
    return serviceHealth.endpoints.map(endpoint => ({
      name: endpoint.name,
      url: endpoint.url,
      method: "GET" as const,
      expected: endpoint.expected,
      actual: endpoint.actual,
      passed: endpoint.passed,
      duration: endpoint.duration,
    }));
  }, [serviceHealth]);

  const hasServiceHealthData = serviceEndpoints.length > 0;

  const loadLogs = () => {
    if (!selectedProcess) return;
    setLoading(true);
    const api = createApiClient(selectedMachine);
    api.getLogs(selectedProcess.id)
        .then(l => setLogs(l))
        .catch(err => console.error("Failed to load logs:", err))
        .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (selectedProcess) loadLogs();
  }, [selectedProcess]);

  if (!selectedProcess) {
    return <ProcessNotSelected></ProcessNotSelected>;
  }

  const isStopped = selectedProcess.status === "stopped" || selectedProcess.status === "errored";
  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "health", label: "Health", icon: <Activity className="w-4 h-4" /> },
    { id: "endpoints", label: "Endpoints", icon: <Globe className="w-4 h-4" /> },
    { id: "logs", label: "Logs", icon: <FileText className="w-4 h-4" /> },
  ];

  return (
      <div className="card h-full animate-slide-in">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-bg-tertiary flex items-center justify-center">
              <Server className="w-6 h-6 text-text-muted" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">{selectedProcess.name}</h3>
              {serviceHealth && (
                  <p className="text-xs text-text-muted mt-1">
                    {serviceHealth.processName} · PID: {selectedProcess.pid}
                  </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
                onClick={loadLogs}
                className="btn btn-ghost btn-sm"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {isStopped && (
            <div className={cn(
                "flex items-center gap-3 p-4 rounded-xl mb-4 border",
                selectedProcess.status === "errored"
                    ? "bg-error-500/10 border-error-500/20 text-error-400"
                    : "bg-warning-500/10 border-warning-500/20 text-warning-400"
            )}>
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">
                  {selectedProcess.status === "errored" ? "Process is in error state" : "Process is stopped"}
                </p>
                <p className="text-xs opacity-80 mt-0.5">
                  {selectedProcess.status === "errored" ? "Check logs for details" : "Start the process to monitor endpoints and health"}
                </p>
              </div>
            </div>
        )}

        <div className="flex gap-1 mb-5 bg-bg-tertiary rounded-xl p-1">
          {tabs.map((tab) => (
              <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex-1 justify-center",
                      activeTab === tab.id
                          ? "bg-bg-elevated text-text-primary shadow-sm"
                          : "text-text-muted hover:text-text-secondary"
                  )}
              >
                {tab.icon}
                {tab.label}
              </button>
          ))}
        </div>

        {loading ? (
            <div className="flex justify-center py-16">
              <Spinner size="lg" />
            </div>
        ) : (
            <>
              {activeTab === "health" && (
                  <HealthTab
                      serviceHealth={serviceHealth}
                      isStopped={isStopped}
                  />
              )}

              {activeTab === "endpoints" && (
                  <EndpointsTab
                      hasServiceHealthData={hasServiceHealthData}
                      serviceEndpoints={serviceEndpoints}
                      isStopped={isStopped}
                  />
              )}

              {activeTab === "logs" && (
                  <LogsTab logs={logs}></LogsTab>
              )}
            </>
        )}
      </div>
  );
};