"use client";

import { useEffect, useState } from "react";
import { useMachineStore } from "@/store/machine.store";
import { useProcessStore } from "@/store/process.store";
import { useAppStore } from "@/store/app.store";
import { storage } from "@/lib/storage";
import { Button } from "@/components/ui/Button";
import { useEndpointChecks } from "@/hooks/useEndpointChecks";
import { useNotifications } from "@/hooks/useNotifications";

export const StatusBar = () => {
  const { selectedMachine } = useMachineStore();
  const { processes } = useProcessStore();
  const { isClient } = useAppStore();
  const { runChecks } = useEndpointChecks();
  const { sendDigest } = useNotifications();

  const [lastDigestTime, setLastDigestTime] = useState<number>(0);
  const [testResultsSummary, setTestResultsSummary] = useState<any>(null);
  const [notifiedDowns, setNotifiedDowns] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!isClient) return;

    setLastDigestTime(storage.getLastDigestTime(selectedMachine.id));
    setTestResultsSummary(storage.getLastTestResults(selectedMachine.id));
    setNotifiedDowns(storage.getNotifiedDowns(selectedMachine.id));
  }, [selectedMachine.id, isClient]);

  const onlineCount = processes.filter((p) => p.status === "online").length;
  const totalCount = processes.length;

  return (
    <div className="glass-effect p-4 mb-6 animate-fade-in">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="flex flex-col">
          <span className="text-text-muted text-xs uppercase tracking-wider">
            Processes
          </span>
          <span className="text-lg font-semibold">
            <span className="text-success-400">{onlineCount}</span>
            <span className="text-text-muted">/{totalCount}</span>
            <span className="text-text-secondary ml-1">online</span>
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-text-muted text-xs uppercase tracking-wider">
            Notified Downs
          </span>
          <span className="text-lg font-semibold text-error-400 truncate">
            {[...notifiedDowns].join(", ") || "None"}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-text-muted text-xs uppercase tracking-wider">
            Last Endpoint Check
          </span>
          <span className="text-lg font-semibold">
            {testResultsSummary?.timestamp
              ? new Date(testResultsSummary.timestamp).toLocaleTimeString()
              : "Never"}
            {testResultsSummary?.failedEndpoints?.length > 0 && (
              <span className="ml-2 text-warning-400 text-sm">
                ⚠️ {testResultsSummary.failedEndpoints.length} failed
              </span>
            )}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-text-muted text-xs uppercase tracking-wider">
            Last Digest
          </span>
          <span className="text-lg font-semibold">
            {lastDigestTime
              ? new Date(lastDigestTime).toLocaleTimeString()
              : "Never"}
          </span>
        </div>
      </div>

      <div className="divider my-4" />

      <div className="flex gap-3">
        <Button onClick={runChecks} className="shadow-glow">
          Run Endpoint Checks Now
        </Button>
        <Button variant="secondary" onClick={sendDigest}>
          Send Digest Now
        </Button>
      </div>
    </div>
  );
};
