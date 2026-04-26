import { HealthCheck, HealthReport } from "@/types"
import { cn } from "@/utils/cn"
import { CheckCircle2, XCircle, Activity } from "lucide-react"
import { StatusBadge } from "../ui/StatusBadge"
import { ServiceConfig } from "@/conf/machines"

interface Props {
    health: HealthReport
    serviceConfig?: ServiceConfig
}

export const HealthTab = ({ health, serviceConfig }: Props) => {
    return (
        <div className="space-y-3 animate-fade-in">
            <div className="flex items-center gap-3 mb-4 p-4 rounded-xl bg-bg-elevated/30">
                <Activity className="w-5 h-5 text-text-muted" />
                <div>
                    <span className="text-sm text-text-secondary">PM2 Status</span>
                    <div className="flex items-center gap-2 mt-1">
                        <StatusBadge status={health.pm2Status || "unknown"} />
                        {serviceConfig && (
                            <span className="text-xs text-text-muted">
                                Expected: {serviceConfig.application_status.expected_status}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {health.checks?.map((check: HealthCheck, i: number) => (
                <div
                    key={i}
                    className={cn(
                        "p-4 rounded-xl border transition-all duration-200",
                        check.success
                            ? "bg-success-500/5 border-success-500/20"
                            : "bg-error-500/5 border-error-500/20"
                    )}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {check.success ? (
                                <CheckCircle2 className="w-4 h-4 text-success-400" />
                            ) : (
                                <XCircle className="w-4 h-4 text-error-400" />
                            )}
                            <span className="font-medium text-sm">
                                {check.method} {check.route}
                            </span>
                        </div>
                        <span className={cn(
                            "text-sm font-medium",
                            check.success ? "text-success-400" : "text-error-400"
                        )}>
                            {check.success ? "Passed" : "Failed"}
                        </span>
                    </div>
                    <div className="text-xs text-text-muted mt-2 ml-6">
                        Expected: {check.expected} · Got: {check.result}
                    </div>
                </div>
            ))}
        </div>
    )
}