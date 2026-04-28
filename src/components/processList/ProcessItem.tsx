import { Process } from "@/types"
import { cn } from "@/utils/cn"
import { formatMemory, formatUptime } from "@/utils/formatters";
import { Box, Circle, Cpu, MemoryStick, Clock } from "lucide-react";
import { StatusBadge } from "../ui/StatusBadge";
import { ServiceHealth } from "@/store/process.store";

interface Props {
    process: Process
    servicesHealth: Record<string, ServiceHealth>
    onSetSelectedProcess: (process: Process) => void
    selectedProcessId?: number
}

export const ProcessItem = ({ process, servicesHealth, onSetSelectedProcess, selectedProcessId }: Props) => {
    const getServiceHealthStatus = (processName: string) => {
        return Object.values(servicesHealth).find(h => h.processName === processName) || null;
    };

    const health = getServiceHealthStatus(process.name);
    const isConnecting = process.status === "connecting";
    const isSelected = selectedProcessId === process.id;
    const isStopped = process.status === "stopped" || process.status === "errored";

    return (
        <div
            key={process.id}
            onClick={() => onSetSelectedProcess(process)}
            className={cn(
                "group p-4 rounded-xl cursor-pointer transition-all duration-200 border",
                isSelected
                    ? "bg-primary-500/10 border-primary-500/40 shadow-glow"
                    : "bg-bg-secondary/40 border-border-primary hover:border-border-accent hover:bg-bg-elevated/60"
            )}
        >
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5 min-w-0">
                    <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                        isSelected ? "bg-primary-500/20" : "bg-bg-tertiary"
                    )}>
                        <Box className="w-4 h-4 text-text-muted" />
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-sm truncate">{process.name}</span>
                            {health && (
                                <span className="px-1.5 py-0.5 rounded-full bg-primary-500/10 text-primary-400 border border-primary-500/20 flex-shrink-0">
                                    service
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                    {health && !isConnecting && !isStopped && (
                        <Circle className={cn(
                            "w-2 h-2 fill-current",
                            health.status === "healthy" && "text-success-400",
                            health.status === "unhealthy" && "text-warning-400 animate-pulse",
                            health.status === "critical" && "text-error-400",
                            health.status === "unknown" && "text-text-muted"
                        )} />
                    )}
                    <StatusBadge status={process.status} />
                </div>
            </div>

            {health && health.summary && !isStopped && (
                <div className="flex items-center gap-3 text-xs mb-2 ml-10">
                    <span className="text-text-muted">
                        Endpoints:{" "}
                        <span className="text-success-400 font-medium">{health.summary.passed}</span>
                        <span className="text-text-muted">/</span>
                        <span className={health.summary.failed > 0 ? "text-error-400 font-medium" : "text-text-muted"}>
                            {health.summary.total}
                        </span>
                    </span>
                    {health.summary.failed > 0 && (
                        <span className="text-error-400/80">
                            {health.summary.failed} failed
                        </span>
                    )}
                </div>
            )}

            {isStopped && health && (
                <div className="text-xs text-warning-400 ml-10 mb-2">
                    Health checks paused
                </div>
            )}

            {isConnecting && (
                <div className="text-xs text-text-muted animate-pulse ml-10">
                    Connecting...
                </div>
            )}

            {!isConnecting && (
                <div className="flex items-center gap-4 text-xs text-text-muted ml-10">
                    <span className="flex items-center gap-1">
                        <Cpu className="w-3 h-3" />
                        {process.cpu.toFixed(1)}%
                    </span>
                    <span className="flex items-center gap-1">
                        <MemoryStick className="w-3 h-3" />
                        {formatMemory(process.memory)}
                    </span>
                    <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatUptime(process.uptime)}
                    </span>
                    <span className="text-text-muted/50">PID {process.pid}</span>
                </div>
            )}
        </div>
    )
}