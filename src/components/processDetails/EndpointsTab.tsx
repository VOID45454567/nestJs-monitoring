import { Globe, AlertTriangle } from "lucide-react"
import { EndpointData } from "./EndpointData"
import { ServiceEndpoint } from "@/store/process.store"

interface Props {
    hasServiceHealthData: boolean
    serviceEndpoints: ServiceEndpoint[]
    isStopped: boolean
}

export const EndpointsTab = ({ hasServiceHealthData, serviceEndpoints, isStopped }: Props) => {
    return (
        <div className="space-y-3 animate-fade-in">
            {isStopped && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-warning-500/10 border border-warning-500/20 text-warning-400 mb-4">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    <div>
                        <p className="text-sm font-medium">Service is stopped</p>
                        <p className="text-xs opacity-80 mt-0.5">Endpoints are not being checked while process is stopped</p>
                    </div>
                </div>
            )}

            {!isStopped && hasServiceHealthData ? (
                serviceEndpoints.map((endpoint, i) => (
                    <EndpointData endpoint={endpoint} key={i}></EndpointData>
                ))
            ) : !isStopped ? (
                <div className="text-center py-12 text-text-muted">
                    <Globe className="w-8 h-8 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">Waiting for health data...</p>
                </div>
            ) : null}
        </div>
    )
}