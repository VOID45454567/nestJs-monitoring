import { Logs } from "@/store/process.store"

interface Props {
    logs: Logs
}

export const LogsTab = ({ logs }: Props) => {
    return (
        <div className="space-y-4 animate-fade-in">
            <div className="p-4 rounded-xl bg-bg-elevated/30">
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-success-400" />
                    <h4 className="font-medium text-sm text-success-400">STDOUT</h4>
                    <span className="text-xs text-text-muted ml-auto">{logs.out.length} lines</span>
                </div>
                <pre className="bg-bg-primary rounded-lg p-4 text-xs max-h-48 overflow-auto font-mono">
                    {logs.out.slice(-30).map((line: string, i: number) => (
                        <div key={i} className="log-line">{line}</div>
                    ))}
                    {logs.out.length === 0 && (
                        <div className="text-text-muted">No output</div>
                    )}
                </pre>
            </div>
            <div className="p-4 rounded-xl bg-bg-elevated/30">
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-error-400" />
                    <h4 className="font-medium text-sm text-error-400">STDERR</h4>
                    <span className="text-xs text-text-muted ml-auto">{logs.error.length} lines</span>
                </div>
                <pre className="bg-bg-primary rounded-lg p-4 text-xs max-h-48 overflow-auto font-mono">
                    {logs.error.slice(-30).map((line: string, i: number) => (
                        <div key={i} className="log-line log-line-error">{line}</div>
                    ))}
                    {logs.error.length === 0 && (
                        <div className="text-text-muted">No errors</div>
                    )}
                </pre>
            </div>
        </div>
    )
}