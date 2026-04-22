import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/utils/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          ref={ref}
          className={cn(
            "input",
            error &&
              "border-error-500 focus:border-error-500 focus:ring-error-500/20",
            className,
          )}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-error-400">{error}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";
