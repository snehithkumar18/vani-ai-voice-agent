import type { HTMLAttributes, ReactNode } from "react";

type Variant = "active" | "error" | "neutral";

interface Props extends HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
  icon?: ReactNode;
}

const variants: Record<Variant, string> = {
  active:
    "bg-emerald-50 text-success-emerald border border-emerald-100",
  error: "bg-red-50 text-error border border-red-100",
  neutral:
    "bg-surface-container text-on-surface-variant border border-border-subtle",
};

export function Badge({ variant = "neutral", icon, className = "", children, ...rest }: Props) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${variants[variant]} ${className}`}
      {...rest}
    >
      {icon}
      {children}
    </span>
  );
}
