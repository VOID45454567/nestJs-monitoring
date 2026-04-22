import { cn } from "@/utils/cn";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "online":
      case "healthy":
        return "status-online";
      case "stopped":
        return "status-stopped";
      case "errored":
      case "critical":
        return "status-errored";
      case "launching":
      case "unhealthy":
        return "status-launching";
      default:
        return "status-stopped";
    }
  };

  return (
    <span className={cn("status-badge", getStatusClass(status), className)}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
};
