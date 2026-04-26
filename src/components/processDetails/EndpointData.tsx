import { ServiceEndpoint } from "@/store/process.store"
import { cn } from "@/utils/cn"
import { formatDuration } from "@/utils/formatters"
import { CheckCircle2, CircleCheck, CircleX, Clock, XCircle } from "lucide-react"

interface Props {
    endpoint: ServiceEndpoint
}

export const EndpointData = ({ endpoint }: Props) => {
    return (
        <div
            className={cn(
                "p-4 rounded-xl border transition-all duration-200",
                endpoint.passed
                    ? "bg-success-500/5 border-success-500/20"
                    : "bg-error-500/5 border-error-500/20"
            )}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                    {endpoint.passed ? (
                        <CheckCircle2 className="w-4 h-4 text-success-400 flex-shrink-0" />
                    ) : (
                        <XCircle className="w-4 h-4 text-error-400 flex-shrink-0" />
                    )}
                    <span className="font-medium text-sm truncate">{endpoint.name}</span>
                </div>
                <span className={cn(
                    "text-xs font-medium flex-shrink-0 ml-2",
                    endpoint.passed ? "text-success-400" : "text-error-400"
                )}>
                    {endpoint.passed ? <CircleCheck></CircleCheck> : <CircleX></CircleX>}
                </span>
            </div>
            <div className="text-xs text-text-muted mt-2 space-y-1 ml-6">
                <div className="truncate">{endpoint.url}</div>
                <div className="flex items-center gap-3">
                    <span>Expected: {endpoint.expected}</span>
                    <span>Got: {endpoint.actual}</span>
                    <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDuration(endpoint.duration)}
                    </span>
                </div>
            </div>
        </div>
    )
}