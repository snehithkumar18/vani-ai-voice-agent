import type { HTMLAttributes } from "react";

export function Card({ className = "", children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`bg-white border border-border-subtle rounded-xl shadow-[0px_4px_12px_rgba(30,27,75,0.03)] ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
