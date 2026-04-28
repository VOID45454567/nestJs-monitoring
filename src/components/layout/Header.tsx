import { useAppStore } from "@/store/app.store";
import { useMachineStore } from "@/store/machine.store";
import { useWebSocketStore } from "@/store/websocket.store";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { storage } from "@/lib/storage";
import { cn } from "@/utils/cn";
import { Activity, Mail, Save, Send, Server, Wifi, WifiOff } from "lucide-react";

export const Header = () => {
  const { selectedMachine } = useMachineStore();
  const { machinesStatus } = useWebSocketStore();
  const wsStatus = machinesStatus[selectedMachine.id] || 'disconnected';

  return (
    <header className="glass-effect p-6 animate-fade-in">
      <div className="flex flex-col lg:flex-row justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gradient animate-gradient">
              PM2 Monitor
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Server className="w-3.5 h-3.5 text-text-muted" />
              <p className="text-sm text-text-secondary">
                {selectedMachine.name}
                <span className="text-text-muted mx-2">·</span>
                <span className="text-xs text-text-muted">{selectedMachine.url}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border",
            wsStatus === "connected"
              ? "bg-success-500/10 text-success-400 border-success-500/20"
              : "bg-error-500/10 text-error-400 border-error-500/20"
          )}>
            {wsStatus === "connected" ? (
              <Wifi className="w-3.5 h-3.5" />
            ) : (
              <WifiOff className="w-3.5 h-3.5" />
            )}
            <span>{wsStatus === "connected" ? "Connected" : "Disconnected"}</span>
          </div>

        </div>
      </div>
    </header>
  );
};