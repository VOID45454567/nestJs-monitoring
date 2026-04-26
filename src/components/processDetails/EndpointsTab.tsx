import { EndpointTest, TestResult } from "@/types"
import { cn } from "@/utils/cn"
import { Globe, CircleCheck, CircleX } from "lucide-react"
import { EndpointData } from "./EndpointData"
import { ServiceConfig } from "@/conf/machines"
import { ServiceEndpoint } from "@/store/process.store"

interface Props {
    serviceConfig?: ServiceConfig
    hasServiceHealthData: boolean
    serviceEndpoints: ServiceEndpoint[]
    tests: TestResult | null
}

export const EndpointsTab = ({ serviceConfig, hasServiceHealthData, serviceEndpoints, tests }: Props) => {
    return (
        <div className="space-y-3 animate-fade-in">
            {serviceConfig ? (
                <>
                    <div className="p-4 rounded-xl bg-bg-elevated/30 mb-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Globe className="w-4 h-4 text-text-muted" />
                            <span className="font-medium text-sm">{serviceConfig.name}</span>
                        </div>
                        <div className="text-xs text-text-muted space-y-1 ml-6">
                            <p>Expected Status: {serviceConfig.application_status.expected_status}</p>
                            {serviceConfig.logs?.alert_on_error_patterns && (
                                <p>Alert patterns: {serviceConfig.logs.alert_on_error_patterns.join(', ')}</p>
                            )}
                        </div>
                    </div>

                    {hasServiceHealthData ? (
                        serviceEndpoints.map((endpoint, i) => (
                            <EndpointData endpoint={endpoint} key={i}></EndpointData>
                        ))
                    ) : tests ? (
                        <>
                            <div className="p-4 rounded-xl bg-bg-elevated/30 mb-4">
                                <div className="progress mb-3">
                                    <div
                                        className={cn(
                                            "progress-bar h-full transition-all duration-500",
                                            tests.summary.passed === tests.summary.total
                                                ? "progress-success"
                                                : "progress-warning"
                                        )}
                                        style={{ width: `${(tests.summary.passed / tests.summary.total) * 100}%` }}
                                    />
                                </div>
                                <div className="flex items-center gap-4 text-sm">
                                    <span className="text-success-400 font-medium">{tests.summary.passed} passed</span>
                                    <span className="text-text-muted">/</span>
                                    <span>{tests.summary.total} total</span>
                                </div>
                            </div>
                            {tests.endpoints.map((endpoint: EndpointTest, i: number) => (
                                <div
                                    key={i}
                                    className={cn(
                                        "p-4 rounded-xl border",
                                        endpoint.passed
                                            ? "bg-success-500/5 border-success-500/20"
                                            : "bg-error-500/5 border-error-500/20"
                                    )}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-sm">{endpoint.name}</span>
                                        <span className={endpoint.passed ? "text-success-400" : "text-error-400"}>
                                            {endpoint.passed ? <CircleCheck></CircleCheck> : <CircleX></CircleX>}
                                        </span>
                                    </div>
                                    <div className="text-xs text-text-muted mt-2 ml-0 space-y-1">
                                        <div className="truncate">{endpoint.url}</div>
                                        <div>Expected: {endpoint.expected} · Got: {endpoint.actual} · {endpoint.duration}ms</div>
                                    </div>
                                </div>
                            ))}
                        </>
                    ) : (
                        <div className="text-center py-12 text-text-muted">
                            <Globe className="w-8 h-8 mx-auto mb-3 opacity-50" />
                            <p className="text-sm">Waiting for health data...</p>
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-12 text-text-muted">
                    <Globe className="w-8 h-8 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No service configuration for this process</p>
                </div>
            )}
        </div>
    )
}