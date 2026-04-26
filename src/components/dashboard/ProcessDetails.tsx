"use client";

import { useState, useEffect, useMemo } from "react";
import { useProcessStore } from "@/store/process.store";
import { useMachineStore } from "@/store/machine.store";
import { createApiClient } from "@/lib/api/client";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/utils/cn";
import {
  Activity, Globe, FileText, Play, Square, RotateCw, RefreshCw,
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
    health,
    tests,
    logs,
    loading,
    setHealth,
    setTests,
    setLogs,
    setLoading,
  } = useProcessStore();
  const machineData = getMachineData(selectedMachine.id);
  const { servicesHealth } = machineData;
  const [activeTab, setActiveTab] = useState<Tab>("health");

  const serviceConfig = selectedMachine.services?.find(
    s => s.pm2_process_name === selectedProcess?.name
  );

  const serviceEndpoints = useMemo(() => {
    if (!serviceConfig || !selectedProcess) return [];
    const healthData = servicesHealth[serviceConfig.id];
    if (!healthData || !Array.isArray(healthData.endpoints)) return [];
    return healthData.endpoints.map(endpoint => ({
      name: endpoint.name,
      url: endpoint.url,
      method: "GET" as const,
      expected: endpoint.expected,
      actual: endpoint.actual,
      passed: endpoint.passed,
      duration: endpoint.duration,
    }));
  }, [serviceConfig, selectedProcess, servicesHealth]);

  const hasServiceHealthData = serviceEndpoints.length > 0;

  const loadProcessData = async () => {
    if (!selectedProcess) return;
    setLoading(true);
    try {
      const api = createApiClient(selectedMachine);
      const [h, t, l] = await Promise.all([
        api.getHealth(selectedProcess.name),
        api.getTests(selectedProcess.id),
        api.getLogs(selectedProcess.id),
      ]);
      setHealth(h);
      setTests(t);
      setLogs(l);
    } catch (err) {
      console.error("Failed to load process data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessAction = async (action: "start" | "stop" | "restart") => {
    if (!selectedProcess) return;
    try {
      const api = createApiClient(selectedMachine);
      selectedProcess.status = action === 'start' ? 'online' : action === 'stop' ? 'stopped' : ''
      await api.processAction(selectedProcess.id, action);
      setTimeout(loadProcessData, 1000);
    } catch (err) {
      console.error(`Failed to ${action} process:`, err);
    }
  };

  useEffect(() => {
    if (selectedProcess) loadProcessData();
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
            {serviceConfig && (
              <p className="text-xs text-text-muted mt-1">
                {serviceConfig.name} · PM2 ID: {serviceConfig.pm2ID} · PID: {selectedProcess.pid}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isStopped ? (
            <Button variant="primary" size="sm" onClick={() => handleProcessAction("start")}>
              <Play className="w-4 h-4" />
              Start
            </Button>
          ) : (
            <>
              <Button variant="danger" size="sm" onClick={() => handleProcessAction("stop")}>
                <Square className="w-4 h-4" />
                Stop
              </Button>
              <Button variant="secondary" size="sm" onClick={() => handleProcessAction("restart")}>
                <RotateCw className="w-4 h-4" />
                Restart
              </Button>
            </>
          )}
          <Button variant="ghost" size="sm" onClick={loadProcessData}>
            <RefreshCw className="w-4 h-4" />
          </Button>
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
          {activeTab === "health" && health && (
            <HealthTab
              health={health}
              serviceConfig={serviceConfig}
            >
            </HealthTab>
          )}

          {activeTab === "endpoints" && (
            <EndpointsTab
              hasServiceHealthData={hasServiceHealthData}
              serviceEndpoints={serviceEndpoints}
              tests={tests}
              serviceConfig={serviceConfig}
            ></EndpointsTab>
          )}

          {activeTab === "logs" && (
            <LogsTab logs={logs}></LogsTab>
          )}
        </>
      )}
    </div>
  );
};