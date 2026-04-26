import { MachineConfig } from "@/conf/machines"
import { MachineStatus } from "@/store/machine.store"
import { cn } from "@/utils/cn"
import { AlertTriangle, HardDrive, Loader2, Monitor, Server, Tag, Wifi, WifiOff } from "lucide-react"

interface Props {
    machine: MachineConfig
    onSetSelectedMacine: (id: string) => void
    selectedMachine: MachineConfig
    machinesStatus: Map<String, MachineStatus>
}

export const MachineItem = ({ machine, onSetSelectedMacine, selectedMachine, machinesStatus }: Props) => {

    const machineIcons: Record<string, React.ReactNode> = {
        development: <Monitor className="w-4 h-4" />,
        staging: <Server className="w-4 h-4" />,
        production: <HardDrive className="w-4 h-4" />,
        local: <Monitor className="w-4 h-4" />,
        internal: <Server className="w-4 h-4" />,
        critical: <HardDrive className="w-4 h-4" />,
    };

    const getStatusIcon = (machineId: string) => {
        const status = machinesStatus.get(machineId);
        switch (status) {
            case 'connected':
                return <Wifi className="w-3.5 h-3.5 text-success-400" />;
            case 'error':
                return <WifiOff className="w-3.5 h-3.5 text-error-400" />;
            case 'checking':
                return <Loader2 className="w-3.5 h-3.5 text-warning-400 animate-spin" />;
            default:
                return <AlertTriangle className="w-3.5 h-3.5 text-text-muted" />;
        }
    };

    const getStatusClass = (machineId: string) => {
        const status = machinesStatus.get(machineId);
        switch (status) {
            case 'connected': return 'bg-success-500/10 text-success-400 border-success-500/20';
            case 'error': return 'bg-error-500/10 text-error-400 border-error-500/20';
            case 'checking': return 'bg-warning-500/10 text-warning-400 border-warning-500/20';
            default: return 'bg-text-muted/10 text-text-muted border-text-muted/20';
        }
    };

    const getStatusText = (machineId: string) => {
        const status = machinesStatus.get(machineId);
        switch (status) {
            case 'connected': return 'Online';
            case 'error': return 'Offline';
            case 'checking': return 'Checking';
            default: return 'Unknown';
        }
    };
    const primaryTag = machine.tags?.[0] || 'development';

    return (
        <div
            key={machine.id}
            onClick={() => onSetSelectedMacine(machine.id)}
            className={cn(
                "group p-4 rounded-xl cursor-pointer transition-all duration-300 border",
                selectedMachine.id === machine.id
                    ? "bg-primary-500/10 border-primary-500/30 shadow-glow"
                    : "bg-bg-secondary/50 border-border-primary hover:border-border-accent hover:bg-bg-elevated/50 hover-lift"
            )}
        >
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
                        selectedMachine.id === machine.id
                            ? "bg-primary-500/20"
                            : "bg-bg-tertiary group-hover:bg-bg-elevated"
                    )}>
                        {machineIcons[primaryTag] || <Server className="w-5 h-5 text-text-muted" />}
                    </div>
                    <div className="min-w-0">
                        <h4 className="font-medium truncate">{machine.name}</h4>
                        <p className="text-xs text-text-muted truncate mt-0.5">{machine.url}</p>
                    </div>
                </div>
                <div className="flex-shrink-0">
                    {getStatusIcon(machine.id)}
                </div>
            </div>

            <div className="flex items-center justify-between">
                <div className={cn(
                    "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border",
                    getStatusClass(machine.id)
                )}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {getStatusText(machine.id)}
                </div>

                <div className="flex items-center gap-3 text-xs text-text-muted">
                    {machine.services && machine.services.length > 0 && (
                        <span className="flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            {machine.services.length}
                        </span>
                    )}
                    {machine.description && (
                        <span className="truncate max-w-[100px]">{machine.description}</span>
                    )}
                </div>
            </div>
        </div>
    );
}