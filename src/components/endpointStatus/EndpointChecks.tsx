import { EndpointExternalTestResult } from "@/types";
import { cn } from "@/utils/cn";
import { formatDuration } from "@/utils/formatters";

interface Props {
    endpoint: EndpointExternalTestResult
    index: number
}

export const EndpointChecks = ({ endpoint, index }: Props) => {
    const cacheKey = `${endpoint.serviceId}:${endpoint.url}`;
    return (
        <div
            key={`${cacheKey}-${index}`}
            className="p-4 bg-bg-tertiary/50 rounded-lg border border-border-primary hover:border-border-accent transition-all duration-200 hover-lift"
        >
            <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm truncate" title={endpoint.name}>
                    {endpoint.name}
                </span>
                <span
                    className={cn(
                        "text-xs px-2 py-1 rounded-full font-medium",
                        endpoint.actual === "pending"
                            ? "bg-text-muted/20 text-text-muted border border-text-muted/30"
                            : endpoint.passed
                                ? "bg-success-500/20 text-success-400 border border-success-500/30"
                                : "bg-error-500/20 text-error-400 border border-error-500/30",
                    )}
                >
                    {endpoint.actual === "pending"
                        ? "Pending"
                        : endpoint.passed
                            ? "Online"
                            : "Failed"}
                </span>
            </div>

            <div className="text-xs text-text-muted mb-2">
                <span className="text-text-secondary">{endpoint.serviceName}</span>
                <span className="text-text-muted mx-1">·</span>
                <span className="text-text-muted">{endpoint.processName}</span>
            </div>

            <div
                className="text-xs text-text-muted truncate mb-2"
                title={endpoint.url}
            >
                <span className="inline-block px-1.5 py-0.5 bg-bg-elevated rounded text-text-secondary mr-1">
                    {endpoint.method}
                </span>
                {endpoint.url}
            </div>

            {endpoint.actual !== "pending" && (
                <div className="text-xs flex justify-between text-text-secondary">
                    <span>
                        Status:{" "}
                        <span
                            className={
                                endpoint.passed ? "text-success-400" : "text-error-400"
                            }
                        >
                            {endpoint.actual}
                        </span>
                    </span>
                    <span>{formatDuration(endpoint.duration)}</span>
                </div>
            )}
        </div>
    )
}