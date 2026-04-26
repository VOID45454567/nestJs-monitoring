import { Server } from "lucide-react"

export const ProcessNotSelected = () => {
    return (
        <div className="card h-full flex flex-col items-center justify-center gap-4 animate-scale-in">
            <div className="w-20 h-20 rounded-2xl bg-bg-tertiary flex items-center justify-center">
                <Server className="w-10 h-10 text-text-muted" />
            </div>
            <div className="text-center">
                <p className="text-text-muted text-sm font-medium">Select a process</p>
                <p className="text-text-muted text-xs mt-1">View details, endpoints and logs</p>
            </div>
        </div>
    )
}