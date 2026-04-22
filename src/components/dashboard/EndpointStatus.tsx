"use client";

import { useMachineStore } from "@/store/machine.store";
import { useEndpointChecks } from "@/hooks/useEndpointChecks";
import { formatDuration } from "@/utils/formatters";
import { cn } from "@/utils/cn";

export const EndpointStatus = () => {
  const { selectedMachine } = useMachineStore();
  const { checks } = useEndpointChecks();

  if (selectedMachine.endpoints.length === 0) {
    return null;
  }

  return (
    <div className="glass-effect p-4 mb-6 animate-scale-in">
      <h3 className="text-lg font-semibold mb-3">Configured Endpoints</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {selectedMachine.endpoints.map((endpoint) => {
          const cacheKey = `${endpoint.method}:${endpoint.url}`;
          const check = checks.get(cacheKey);

          return (
            <div
              key={cacheKey}
              className="p-4 bg-bg-tertiary/50 rounded-lg border border-border-primary hover:border-border-accent transition-all duration-200 hover-lift"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium truncate" title={endpoint.name}>
                  {endpoint.name}
                </span>
                <span
                  className={cn(
                    "text-xs px-2 py-1 rounded-full font-medium",
                    check?.passed
                      ? "bg-success-500/20 text-success-400 border border-success-500/30"
                      : check
                        ? "bg-error-500/20 text-error-400 border border-error-500/30"
                        : "bg-text-muted/20 text-text-muted border border-text-muted/30",
                  )}
                >
                  {check
                    ? check.passed
                      ? "✓ Online"
                      : "✗ Failed"
                    : "⏳ Pending"}
                </span>
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

              {check && (
                <div className="text-xs flex justify-between text-text-secondary">
                  <span>
                    Status:{" "}
                    <span
                      className={
                        check.passed ? "text-success-400" : "text-error-400"
                      }
                    >
                      {check.status}
                    </span>
                  </span>
                  <span>{formatDuration(check.duration)}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
