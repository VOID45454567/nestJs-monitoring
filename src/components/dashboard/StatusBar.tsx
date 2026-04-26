"use client";

import { useEffect, useState } from "react";
import { useMachineStore } from "@/store/machine.store";
import { useProcessStore } from "@/store/process.store";
import { useAppStore } from "@/store/app.store";
import { storage } from "@/lib/storage";
import { Button } from "@/components/ui/Button";
import { useEndpointChecks } from "@/hooks/useEndpointChecks";
import { useNotifications } from "@/hooks/useNotifications";
import { cn } from "@/utils/cn";
import { Activity, Server, Bell, Clock, Play, Send } from "lucide-react";

export const StatusBar = () => {
  const { selectedMachine, machinesStatus } = useMachineStore();
  const { getMachineData } = useProcessStore();
  const { isClient } = useAppStore();
  const { runChecks } = useEndpointChecks();
  const { sendDigest } = useNotifications();

  const machineData = getMachineData(selectedMachine.id);
  const processes = machineData.processes;

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
  const machineStatus = machinesStatus.get(selectedMachine.id);

  const stats = [
    {
      icon: <Server className="w-4 h-4" />,
      label: "Machine",
      value: machineStatus === 'connected' ? 'Online' : machineStatus === 'error' ? 'Offline' : machineStatus === 'checking' ? 'Checking' : 'Unknown',
      color: machineStatus === 'connected' ? "text-success-400" : machineStatus === 'error' ? "text-error-400" : "text-text-muted",
      dot: machineStatus === 'connected' ? "bg-success-400" : machineStatus === 'error' ? "bg-error-400" : machineStatus === 'checking' ? "bg-warning-400 animate-pulse" : "bg-text-muted",
    },
    {
      icon: <Activity className="w-4 h-4" />,
      label: "Processes",
      value: `${onlineCount}/${totalCount}`,
      color: "text-success-400",
      sub: "online",
    },
    {
      icon: <Bell className="w-4 h-4" />,
      label: "Notified",
      value: [...notifiedDowns].join(", ") || "None",
      color: "text-error-400",
      truncate: true,
    },
    {
      icon: <Clock className="w-4 h-4" />,
      label: "Last Check",
      value: testResultsSummary?.timestamp
        ? new Date(testResultsSummary.timestamp).toLocaleTimeString()
        : "Never",
      color: "text-text-secondary",
      alert: testResultsSummary?.failedEndpoints?.length > 0 ? `${testResultsSummary.failedEndpoints.length} failed` : undefined,
    },
    {
      icon: <Send className="w-4 h-4" />,
      label: "Last Digest",
      value: lastDigestTime
        ? new Date(lastDigestTime).toLocaleTimeString()
        : "Never",
      color: "text-text-secondary",
    },
  ];

  return (
    <div className="glass-effect p-6 animate-fade-in">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 text-text-muted">
              {stat.icon}
              <span className="text-xs uppercase tracking-wider font-medium">{stat.label}</span>
            </div>
            <div className="flex items-center gap-2">
              {stat.dot && <span className={cn("w-2 h-2 rounded-full flex-shrink-0", stat.dot)} />}
              <span className={cn(
                "text-base font-semibold",
                stat.color,
                stat.truncate && "truncate max-w-[120px]"
              )}>
                {stat.value}
              </span>
              {stat.sub && (
                <span className="text-xs text-text-muted">{stat.sub}</span>
              )}
            </div>
            {stat.alert && (
              <span className="text-xs text-warning-400">⚠️ {stat.alert}</span>
            )}
          </div>
        ))}
      </div>

      <div className="divider my-4" />

      <div className="flex items-center gap-3">
        <Button onClick={runChecks} size="sm">
          <Play className="w-4 h-4" />
          Run Checks
        </Button>
        <Button variant="secondary" size="sm" onClick={sendDigest}>
          <Send className="w-4 h-4" />
          Send Digest
        </Button>
        <div className="text-xs text-text-muted ml-auto flex items-center gap-1">
          <Activity className="w-3 h-3" />
          {selectedMachine.endpoints.length} endpoints configured
        </div>
      </div>
    </div>
  );
};