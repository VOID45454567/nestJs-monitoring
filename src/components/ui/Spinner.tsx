import { cn } from "@/utils/cn";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const Spinner = ({ size = "md", className }: SpinnerProps) => {
  const sizes = {
    sm: "spinner-sm",
    md: "",
    lg: "spinner-lg",
  };

  return <div className={cn("spinner", sizes[size], className)} />;
};
