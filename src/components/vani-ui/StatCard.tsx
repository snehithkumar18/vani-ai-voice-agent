import type { ReactNode } from "react";
import { Card } from "./Card";
import { Icon } from "./Icon";

interface Props {
  icon: string;
  label: string;
  value: string | number;
  trend?: { value: string; direction: "up" | "down" };
  iconBg?: string;
  children?: ReactNode;
}

export function StatCard({ icon, label, value, trend, iconBg = "bg-secondary-fixed", children }: Props) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBg}`}>
          <Icon name={icon} filled className="text-secondary" />
        </div>
        {trend && (
          <span
            className={`inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${
              trend.direction === "up"
                ? "bg-emerald-50 text-success-emerald"
                : "bg-red-50 text-error"
            }`}
          >
            <Icon name={trend.direction === "up" ? "trending_up" : "trending_down"} className="text-[14px]" />
            {trend.value}
          </span>
        )}
      </div>
      <p className="mt-4 text-sm text-on-surface-variant">{label}</p>
      <p className="mt-1 text-2xl font-bold text-primary">{value}</p>
      {children}
    </Card>
  );
}
