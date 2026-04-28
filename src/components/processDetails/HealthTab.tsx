import { ServiceHealth } from "@/store/process.store"
import { cn } from "@/utils/cn"
import { CheckCircle2, XCircle, Activity, AlertTriangle } from "lucide-react"
import { StatusBadge } from "../ui/StatusBadge"

interface Props {
    serviceHealth: ServiceHealth | null
    isStopped: boolean
}

export const HealthTab = ({ serviceHealth, isStopped }: Props) => {
    if (!serviceHealth) {
        return (
            <div className="text-center py-12 text-text-muted">
                <Activity className="w-8 h-8 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Waiting for health data...</p>
            </div>
        )
    }

    return (
        <div className="space-y-3 animate-fade-in">
            <div className="flex items-center gap-3 mb-4 p-4 rounded-xl bg-bg-elevated/30">
                <Activity className="w-5 h-5 text-text-muted" />
                <div>
                    <span className="text-sm text-text-secondary">PM2 Status</span>
                    <div className="flex items-center gap-2 mt-1">
                        <StatusBadge status={serviceHealth.pm2Status || "unknown"} />
                        {!isStopped && (
                            <span className="text-xs text-text-muted">
                                Expected: online
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {isStopped && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-warning-500/10 border border-warning-500/20 text-warning-400">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm">Service is stopped. Health checks are paused.</p>
                </div>
            )}

            {!isStopped && serviceHealth.endpoints.length === 0 && (
                <div className="text-center py-8 text-text-muted">
                    <Activity className="w-6 h-6 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No endpoint checks configured</p>
                </div>
            )}

            {!isStopped && serviceHealth.endpoints.map((check, i) => (
                <div
                    key={i}
                    className={cn(
                        "p-4 rounded-xl border transition-all duration-200",
                        check.passed
                            ? "bg-success-500/5 border-success-500/20"
                            : "bg-error-500/5 border-error-500/20"
                    )}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {check.passed ? (
                                <CheckCircle2 className="w-4 h-4 text-success-400" />
                            ) : (
                                <XCircle className="w-4 h-4 text-error-400" />
                            )}
                            <span className="font-medium text-sm">
                                GET {check.url}
                            </span>
                        </div>
                        <span className={cn(
                            "text-sm font-medium",
                            check.passed ? "text-success-400" : "text-error-400"
                        )}>
                            {check.passed ? "Passed" : "Failed"}
                        </span>
                    </div>
                    <div className="text-xs text-text-muted mt-2 ml-6">
                        Expected: {check.expected} · Got: {check.actual} · {check.duration}ms
                    </div>
                </div>
            ))}
        </div>
    )
}