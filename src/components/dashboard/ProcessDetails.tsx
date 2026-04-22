"use client";

import { useState, useEffect } from "react";
import { useProcessStore } from "@/store/process.store";
import { useMachineStore } from "@/store/machine.store";
import { createApiClient } from "@/lib/api/client";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/utils/cn";
import { HealthCheck, EndpointTest } from "@/types";

type Tab = "health" | "tests" | "logs";

export const ProcessDetails = () => {
  const { selectedMachine } = useMachineStore();
  const {
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
  const [activeTab, setActiveTab] = useState<Tab>("health");

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
      await api.processAction(selectedProcess.id, action);
      setTimeout(loadProcessData, 1000);
    } catch (err) {
      console.error(`Failed to ${action} process:`, err);
    }
  };

  useEffect(() => {
    if (selectedProcess) {
      loadProcessData();
    }
  }, [selectedProcess]);

  if (!selectedProcess) {
    return (
      <div className="card h-full flex items-center justify-center">
        <p className="text-text-muted animate-pulse-slow">
          Select a process to view details
        </p>
      </div>
    );
  }

  return (
    <div className="card h-full animate-slide-in">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">{selectedProcess.name}</h3>
        <div className="flex gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleProcessAction("start")}
          >
            Start
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleProcessAction("stop")}
          >
            Stop
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleProcessAction("restart")}
          >
            Restart
          </Button>
          <Button variant="ghost" size="sm" onClick={loadProcessData}>
            Refresh
          </Button>
        </div>
      </div>

      <div className="flex gap-2 mb-4 border-b border-border-primary">
        {(["health", "tests", "logs"] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-all duration-200",
              activeTab === tab
                ? "text-primary-400 border-b-2 border-primary-400"
                : "text-text-secondary hover:text-text-primary",
            )}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          {activeTab === "health" && health && (
            <div className="space-y-3 animate-fade-in">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-text-secondary">PM2 Status:</span>
                <StatusBadge status={health.pm2Status || "unknown"} />
              </div>

              {health.checks?.map((check: HealthCheck, i: number) => (
                <div
                  key={i}
                  className={cn(
                    "p-4 rounded-lg border transition-all duration-200",
                    check.success
                      ? "bg-success-500/10 border-success-500/30"
                      : "bg-error-500/10 border-error-500/30",
                  )}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">
                      {check.method} {check.route}
                    </span>
                    <span
                      className={
                        check.success ? "text-success-400" : "text-error-400"
                      }
                    >
                      {check.success ? "✓" : "✗"}
                    </span>
                  </div>
                  <div className="text-xs text-text-muted mt-2">
                    Expected: {check.expected} | Got: {check.result}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "tests" && tests && (
            <div className="space-y-3 animate-fade-in">
              <div className="p-4 bg-bg-elevated/50 rounded-lg mb-4">
                <p className="font-medium mb-2">Summary</p>
                <div className="progress mb-2">
                  <div
                    className={cn(
                      "progress-bar h-full transition-all duration-500",
                      tests.summary.passed === tests.summary.total
                        ? "progress-success"
                        : "progress-warning",
                    )}
                    style={{
                      width: `${(tests.summary.passed / tests.summary.total) * 100}%`,
                    }}
                  />
                </div>
                <p className="text-sm">
                  Passed: {tests.summary.passed}/{tests.summary.total}
                </p>
                <p className="text-sm">
                  PM2 Status: {tests.pm2.passed ? "✓" : "✗"}
                </p>
              </div>

              {tests.endpoints.map((endpoint: EndpointTest, i: number) => (
                <div
                  key={i}
                  className={cn(
                    "p-4 rounded-lg border transition-all duration-200",
                    endpoint.passed
                      ? "bg-success-500/10 border-success-500/30"
                      : "bg-error-500/10 border-error-500/30",
                  )}
                >
                  <div className="flex justify-between">
                    <span className="font-medium">
                      {endpoint.method} {endpoint.name}
                    </span>
                    <span
                      className={
                        endpoint.passed ? "text-success-400" : "text-error-400"
                      }
                    >
                      {endpoint.passed ? "✓" : "✗"}
                    </span>
                  </div>
                  <div className="text-xs text-text-muted mt-2 space-y-1">
                    <div className="truncate">{endpoint.url}</div>
                    <div>
                      Expected: {endpoint.expected} | Got: {endpoint.actual} |{" "}
                      {endpoint.duration}ms
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "logs" && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <h4 className="font-medium mb-2 text-success-400">STDOUT</h4>
                <pre className="bg-bg-primary p-4 rounded-lg text-xs max-h-64 overflow-auto">
                  {logs.out.slice(-30).map((line: string, i: number) => (
                    <div key={i} className="log-line">
                      {line}
                    </div>
                  ))}
                  {logs.out.length === 0 && (
                    <div className="text-text-muted">No output</div>
                  )}
                </pre>
              </div>
              <div>
                <h4 className="font-medium mb-2 text-error-400">STDERR</h4>
                <pre className="bg-bg-primary p-4 rounded-lg text-xs max-h-64 overflow-auto">
                  {logs.error.slice(-30).map((line: string, i: number) => (
                    <div key={i} className="log-line log-line-error">
                      {line}
                    </div>
                  ))}
                  {logs.error.length === 0 && (
                    <div className="text-text-muted">No errors</div>
                  )}
                </pre>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
