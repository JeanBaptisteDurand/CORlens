import * as React from "react";
import { cn } from "../../lib/utils.js";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
};

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "btn-primary-themed text-white border border-[color:var(--page-accent-400)]",
  secondary:
    "bg-transparent border-[color:var(--app-glass-panel-border)] text-slate-200 hover:bg-white/5",
  ghost: "bg-transparent border-transparent text-slate-300 hover:text-white hover:bg-white/5",
  danger: "bg-red-500/12 text-white border-red-500/50 hover:bg-red-500/20",
};

const sizeClasses: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-2.5 text-base",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", disabled, ...props }, ref) => {
    return (
      <button
        type="button"
        ref={ref}
        disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-medium border transition-all duration-180 focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--page-accent-400)] focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:opacity-50 disabled:cursor-not-allowed",
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
