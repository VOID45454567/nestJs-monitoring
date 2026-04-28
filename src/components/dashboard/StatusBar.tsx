"use client";

import { useMachineStore } from "@/store/machine.store";
import { useProcessStore } from "@/store/process.store";
import { cn } from "@/utils/cn";
import { Activity, Server, Wifi, WifiOff } from "lucide-react";

export const StatusBar = () => {
  const { selectedMachine, machinesStatus } = useMachineStore();
  const { getMachineData } = useProcessStore();
  const machineData = getMachineData(selectedMachine.id);
  const processes = machineData.processes;

  const onlineCount = processes.filter((p) => p.status === "online").length;
  const totalCount = processes.length;
  const machineStatus = machinesStatus.get(selectedMachine.id);
  const isConnected = machineStatus === 'connected';

  const stats = [
    {
      icon: <Server className="w-4 h-4" />,
      label: "Machine",
      value: isConnected ? 'Online' : machineStatus === 'checking' ? 'Checking' : 'Offline',
      color: isConnected ? "text-success-400" : machineStatus === 'checking' ? "text-warning-400" : "text-error-400",
      dot: isConnected ? "bg-success-400" : machineStatus === 'checking' ? "bg-warning-400 animate-pulse" : "bg-error-400",
    },
    {
      icon: <Activity className="w-4 h-4" />,
      label: "Processes",
      value: `${onlineCount}/${totalCount}`,
      color: "text-success-400",
      sub: "online",
    },
    {
      icon: isConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />,
      label: "Connection",
      value: isConnected ? "WS Live" : "WS Offline",
      color: isConnected ? "text-success-400" : "text-error-400",
    },
  ];

  return (
      <div className="glass-effect p-6 animate-fade-in">
        <div className="grid grid-cols-3 gap-4">
          {stats.map((stat, index) => (
              <div key={index} className="flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5 text-text-muted">
                  {stat.icon}
                  <span className="text-xs uppercase tracking-wider font-medium">{stat.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {stat.dot && <span className={cn("w-2 h-2 rounded-full flex-shrink-0", stat.dot)} />}
                  <span className={cn("text-base font-semibold", stat.color)}>
                {stat.value}
              </span>
                  {stat.sub && (
                      <span className="text-xs text-text-muted">{stat.sub}</span>
                  )}
                </div>
              </div>
          ))}
        </div>
      </div>
  );
};