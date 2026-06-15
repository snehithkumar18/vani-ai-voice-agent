import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  fullWidth?: boolean;
}

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";

const sizes: Record<Size, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-2.5 text-sm",
  lg: "px-7 py-3 text-base",
};

const variants: Record<Variant, string> = {
  primary: "bg-secondary text-white hover:opacity-90 shadow-sm",
  outline: "border border-secondary text-secondary bg-white hover:bg-secondary-fixed/40",
  ghost: "text-on-surface-variant hover:text-secondary hover:bg-surface-container-low",
};

export function Button({
  variant = "primary",
  size = "md",
  iconLeft,
  iconRight,
  fullWidth,
  className = "",
  children,
  ...rest
}: Props) {
  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...rest}
    >
      {iconLeft}
      {children}
      {iconRight}
    </button>
  );
}
