import { createFileRoute, Link } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Icon } from "@/components/vani-ui/Icon";
import { Badge } from "@/components/vani-ui/Badge";
import { useCalls, useDashboardStats, useAgents } from "@/lib/queries";
import type { Call, Agent } from "@/lib/database.types";
import type { ReactNode } from "react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});

function formatDuration(seconds: number | null | undefined): string {
  const s = Math.max(0, Math.round(seconds ?? 0));
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return m > 0 ? `${m}m ${rem}s` : `${rem}s`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function initials(name: string | null | undefined): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function DashboardPage() {
  const stats = useDashboardStats();
  const calls = useCalls();
  const agents = useAgents();

  const recentCalls = (calls.data ?? []).slice(0, 5);
  const agentsById = new Map<string, Agent>(
    (agents.data ?? []).map((a) => [a.id, a]),
  );

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex justify-between items-start mb-8 gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-primary">Overview</h1>
          <p className="text-on-surface-variant text-base mt-1">
            Real-time performance for your voice agents.
          </p>
        </div>
        <Link
          to="/create-agent"
          className="inline-flex items-center gap-2 rounded-lg font-medium px-6 py-2.5 text-sm bg-secondary text-white hover:opacity-90 shadow-sm transition-all active:scale-95"
        >
          <Icon name="add" className="text-[20px]" />
          Create New Agent
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {stats.isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse bg-surface-container-high rounded-xl h-[120px]"
            />
          ))
        ) : (
          <>
            <StatCard
              icon="call"
              iconBg="bg-secondary/10"
              iconColor="text-secondary"
              label="Total Calls"
              value={(stats.data?.total_calls ?? 0).toLocaleString()}
              trend={{ value: "+12.5%", positive: true }}
            />
            <StatCard
              icon="smart_toy"
              filled
              iconBg="bg-secondary/10"
              iconColor="text-secondary"
              label="Active Agents"
              value={String(stats.data?.active_agents ?? 0)}
            />
            <StatCard
              icon="timer"
              iconBg="bg-amber-50"
              iconColor="text-amber-600"
              label="Avg Duration"
              value={formatDuration(stats.data?.avg_duration_seconds ?? 0)}
            />
            <StatCard
              icon="sentiment_very_satisfied"
              filled
              iconBg="bg-emerald-50"
              iconColor="text-success-emerald"
              label="Satisfaction Score"
              value={`${stats.data?.satisfaction_score ?? 0}/5`}
              trend={{ value: "+0.4", positive: true }}
            />
          </>
        )}
      </div>

      {/* Recent Calls Table */}
      <div className="bg-white border border-border-subtle rounded-xl overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-border-subtle flex justify-between items-center">
          <h2 className="text-primary font-semibold text-lg">Recent Calls</h2>
          <Link
            to="/call-logs"
            className="text-secondary text-sm font-medium hover:underline"
          >
            View All →
          </Link>
        </div>

        {calls.isLoading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-surface-container-high rounded-md h-14"
              />
            ))}
          </div>
        ) : recentCalls.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <Icon
              name="call_end"
              className="text-[48px]"
              style={{ color: "rgba(120,118,128,0.4)" }}
            />
            <p className="mt-3 text-sm text-on-surface-variant">
              No calls yet. Your agents will show call logs here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-container-low">
                <tr>
                  {[
                    "Customer Name",
                    "Agent",
                    "Status",
                    "Duration",
                    "Date",
                    "Action",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-xs font-semibold uppercase tracking-wider text-outline px-6 py-3 text-left"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentCalls.map((c) => (
                  <CallRow
                    key={c.id}
                    call={c}
                    agentName={
                      c.agent_id ? agentsById.get(c.agent_id)?.name ?? "—" : "—"
                    }
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bottom banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-primary-container rounded-xl p-8 relative overflow-hidden min-h-[180px]">
          <svg
            className="absolute bottom-0 left-0 right-0 h-24 opacity-10"
            viewBox="0 0 1440 120"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,53.3C1120,53,1280,75,1360,85.3L1440,96L1440,120L0,120Z"
              fill="white"
            />
          </svg>
          <h3 className="text-white font-bold text-xl relative">
            Automate your entire support volume
          </h3>
          <p className="text-on-primary-container text-sm mt-2 relative max-w-md">
            Deploy agents that handle 80% of customer queries without human
            escalation.
          </p>
          <button className="mt-6 inline-flex items-center gap-2 rounded-lg font-medium px-5 py-2 text-sm border border-white text-white hover:bg-white/10 transition-all relative">
            Learn More
          </button>
        </div>

        <div className="bg-white border border-border-subtle rounded-xl p-8">
          <Icon
            name="rocket_launch"
            className="text-secondary"
            style={{ fontSize: "32px" }}
          />
          <h3 className="text-primary font-semibold text-lg mt-3">
            Quick Start Guide
          </h3>
          <p className="text-on-surface-variant text-sm mt-2">
            Set up your first agent in under 5 minutes with our step-by-step
            guide.
          </p>
          <button className="text-secondary font-medium text-sm mt-4 hover:underline cursor-pointer">
            Launch Tutorial →
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}

interface StatCardProps {
  icon: string;
  filled?: boolean;
  iconBg: string;
  iconColor: string;
  label: string;
  value: ReactNode;
  trend?: { value: string; positive: boolean };
}

function StatCard({
  icon,
  filled,
  iconBg,
  iconColor,
  label,
  value,
  trend,
}: StatCardProps) {
  return (
    <div className="bg-white border border-border-subtle rounded-xl p-6 hover:border-secondary/30 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-start justify-between">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBg} ${iconColor}`}
        >
          <Icon name={icon} filled={filled} className="text-[22px]" />
        </div>
        {trend && (
          <span
            className={`inline-flex items-center gap-0.5 text-xs font-semibold rounded-full px-2 py-0.5 border ${
              trend.positive
                ? "text-success-emerald bg-emerald-50 border-emerald-100"
                : "text-error bg-red-50 border-red-100"
            }`}
          >
            <Icon
              name={trend.positive ? "trending_up" : "trending_down"}
              className="text-[14px]"
            />
            {trend.value}
          </span>
        )}
      </div>
      <p className="text-xs font-medium uppercase tracking-wider text-outline mt-5">
        {label}
      </p>
      <p className="text-2xl font-bold text-primary mt-1">{value}</p>
    </div>
  );
}

function CallRow({ call, agentName }: { call: Call; agentName: string }) {
  const statusBadge = (() => {
    switch (call.status) {
      case "active":
        return (
          <Badge variant="active">
            <span className="w-1.5 h-1.5 rounded-full bg-success-emerald animate-pulse mr-1" />
            Active
          </Badge>
        );
      case "completed":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-secondary-fixed text-on-secondary-fixed-variant border border-secondary-fixed-dim">
            Completed
          </span>
        );
      case "dropped":
        return <Badge variant="error">Dropped</Badge>;
      case "missed":
        return <Badge variant="error">Missed</Badge>;
      default:
        return <Badge variant="neutral">{call.status}</Badge>;
    }
  })();

  return (
    <tr className="hover:bg-surface-container-low transition-colors border-b border-border-subtle last:border-0">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center text-xs font-bold text-white">
            {initials(call.caller_name ?? call.caller_number)}
          </div>
          <div className="leading-tight">
            <div className="text-sm font-medium text-on-surface">
              {call.caller_name ?? "Unknown"}
            </div>
            {call.caller_number && (
              <div className="text-xs text-outline">{call.caller_number}</div>
            )}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-on-surface-variant">{agentName}</td>
      <td className="px-6 py-4">{statusBadge}</td>
      <td className="px-6 py-4 text-sm text-on-surface-variant">
        {formatDuration(call.duration_seconds)}
      </td>
      <td className="px-6 py-4 text-sm text-on-surface-variant whitespace-nowrap">
        {formatDate(call.started_at)}
      </td>
      <td className="px-6 py-4">
        {call.agent_id ? (
          <Link
            to="/agent/$id"
            params={{ id: call.agent_id }}
            className="inline-flex items-center px-3 py-1 text-xs rounded-md border border-secondary text-secondary hover:bg-secondary hover:text-white transition-colors"
          >
            View
          </Link>
        ) : (
          <span className="text-xs text-outline">—</span>
        )}
      </td>
    </tr>
  );
}
