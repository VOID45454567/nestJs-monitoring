export const formatMemory = (bytes: number): string => {
    return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
};

export const formatUptime = (uptime: number): string => {
    if (!uptime) return '0s';

    const seconds = Math.floor(uptime / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    if (minutes > 0) return `${minutes}m`;
    return `${seconds}s`;
};

export const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
};

export const formatTimestamp = (timestamp: string): string => {
    return new Date(timestamp).toLocaleTimeString();
};