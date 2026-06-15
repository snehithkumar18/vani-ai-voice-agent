import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Icon } from "@/components/vani-ui/Icon";
import { Button } from "@/components/vani-ui/Button";
import { Badge } from "@/components/vani-ui/Badge";
import { useAgent, useCalls, useUpdateAgent } from "@/lib/queries";
import type { Call } from "@/lib/database.types";

export const Route = createFileRoute("/_authenticated/agent/$id")({
  component: AgentDetailPage,
});

const TREND_DATA: Record<string, number[]> = {
  "24h": [45, 78, 92, 65, 88, 74, 95, 82, 67, 91, 73, 86],
  "7d": [320, 450, 389, 520, 476, 610, 533],
  "30d": [2100, 2800, 2450, 3100, 2900, 3400],
};

function formatDuration(s: number) {
  if (!s) return "0s";
  const m = Math.floor(s / 60);
  const r = s % 60;
  return m > 0 ? `${m}m ${r}s` : `${r}s`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTimeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function AgentDetailPage() {
  const { id } = Route.useParams();
  const { data: agent, isLoading } = useAgent(id);
  const { data: calls = [] } = useCalls(id);
  const updateAgent = useUpdateAgent();

  const [period, setPeriod] = useState<"24h" | "7d" | "30d">("24h");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [hoverBar, setHoverBar] = useState<number | null>(null);
  const PAGE_SIZE = 10;

  const filteredCalls = useMemo(() => {
    if (!search) return calls;
    const s = search.toLowerCase();
    return calls.filter(
      (c) =>
        c.caller_number?.toLowerCase().includes(s) ||
        c.caller_name?.toLowerCase().includes(s) ||
        c.intent?.toLowerCase().includes(s),
    );
  }, [calls, search]);

  const pagedCalls = filteredCalls.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );
  const totalCalls = filteredCalls.length;
  const totalPages = Math.max(1, Math.ceil(totalCalls / PAGE_SIZE));
  const start = totalCalls === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const end = Math.min(page * PAGE_SIZE, totalCalls);

  if (isLoading || !agent) {
    return (
      <DashboardLayout>
        <div className="p-8 space-y-6">
          <div className="h-10 w-64 rounded animate-pulse bg-surface-container-high" />
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-5 h-72 rounded-xl animate-pulse bg-surface-container-high" />
            <div className="col-span-12 lg:col-span-7 h-72 rounded-xl animate-pulse bg-surface-container-high" />
          </div>
          <div className="h-96 rounded-xl animate-pulse bg-surface-container-high" />
        </div>
      </DashboardLayout>
    );
  }

  const toggleStatus = () => {
    const next = agent.status === "active" ? "paused" : "active";
    updateAgent.mutate({ id: agent.id, patch: { status: next } });
  };

  const data = TREND_DATA[period];
  const max = Math.max(...data);

  return (
    <DashboardLayout>
      <div className="overflow-y-auto bg-background p-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8 pb-8 border-b border-border-subtle">
          <div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center">
                <Icon name="smart_toy" filled className="text-white text-[24px]" />
              </div>
              <h1 className="text-3xl font-bold text-primary">{agent.name}</h1>
              {agent.status === "active" && (
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active
                </span>
              )}
              {agent.status === "paused" && (
                <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold">
                  <Icon name="pause" className="text-[14px]" />
                  Paused
                </span>
              )}
            </div>
            <p className="text-on-surface-variant text-sm mt-2">
              Created on {formatDate(agent.created_at)} • ID: AGENT-
              {agent.id.slice(0, 8).toUpperCase()}
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={toggleStatus}
              disabled={updateAgent.isPending}
              iconLeft={
                <Icon
                  name={agent.status === "active" ? "pause" : "play_arrow"}
                  className="text-[18px]"
                />
              }
            >
              {agent.status === "active" ? "Pause Agent" : "Activate Agent"}
            </Button>
            <Link to="/create-agent">
              <Button iconLeft={<Icon name="edit" className="text-[18px]" />}>
                Edit Agent
              </Button>
            </Link>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-12 gap-6 mb-8">
          {/* Left col */}
          <div className="col-span-12 lg:col-span-5">
            <div className="bg-white border border-border-subtle rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-border-subtle flex items-center gap-2">
                <Icon name="tune" className="text-secondary text-[20px]" />
                <span className="font-semibold text-primary">
                  Configuration Summary
                </span>
              </div>
              {[
                {
                  label: "Primary Language",
                  value: agent.language,
                  icon: "language",
                },
                {
                  label: "Knowledge Base",
                  value: "Enterprise Core v2.4",
                  icon: "book",
                },
                {
                  label: "Voice Type",
                  value: agent.voice_type,
                  icon: "record_voice_over",
                },
                {
                  label: "Response Model",
                  value: "Vani-Omni-Fast",
                  icon: "memory",
                },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex justify-between items-center px-6 py-4 border-b last:border-0 border-border-subtle hover:bg-surface-container-low transition-colors"
                >
                  <span className="text-sm text-on-surface-variant">
                    {row.label}
                  </span>
                  <span className="flex items-center gap-2 text-sm font-semibold text-on-surface">
                    {row.value}
                    <Icon
                      name={row.icon}
                      className="text-outline/40 text-[18px]"
                    />
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 bg-primary-container rounded-xl p-6">
              <Icon
                name="auto_awesome"
                filled
                className="text-secondary-fixed-dim text-[20px]"
              />
              <div className="text-white font-semibold mt-1">AI Insights</div>
              <p className="text-on-primary-container text-sm mt-2 leading-relaxed">
                This agent is performing {agent.success_rate}% above baseline.
                Peak hours: 10AM–1PM and 6PM–9PM IST. Recommend expanding
                knowledge base with billing FAQs.
              </p>
            </div>
          </div>

          {/* Right col */}
          <div className="col-span-12 lg:col-span-7">
            <div className="grid grid-cols-3 gap-4 mb-6">
              <MiniStat
                icon="call"
                iconColor="text-secondary"
                label="Calls Handled"
                value={agent.calls_handled.toLocaleString()}
                delta="+12% this week"
              />
              <MiniStat
                icon="check_circle"
                iconColor="text-emerald-500"
                label="Success Rate"
                value={`${agent.success_rate}%`}
                delta="+2% this week"
              />
              <MiniStat
                icon="timer"
                iconColor="text-amber-500"
                label="Avg Resolution"
                value={formatDuration(agent.avg_duration_seconds)}
                delta="-0.5s"
              />
            </div>

            <div className="bg-white border border-border-subtle rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold text-primary">Performance Trend</h3>
                <div className="flex gap-1 bg-surface-container rounded-lg p-1">
                  {(["24h", "7d", "30d"] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPeriod(p)}
                      className={`text-xs px-3 py-1 rounded-md transition-all ${
                        period === p
                          ? "bg-white shadow text-primary font-medium"
                          : "text-on-surface-variant cursor-pointer"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-end gap-2 h-[120px] relative">
                {data.map((v, i) => {
                  const isMax = v === max;
                  const h = (v / max) * 100;
                  return (
                    <div
                      key={i}
                      className="flex-1 relative h-full flex items-end"
                      onMouseEnter={() => setHoverBar(i)}
                      onMouseLeave={() => setHoverBar(null)}
                    >
                      {hoverBar === i && (
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-primary text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                          {v} calls
                        </div>
                      )}
                      <div
                        className={`w-full rounded-t-sm cursor-pointer transition-all duration-300 ${
                          isMax
                            ? "bg-secondary"
                            : "bg-secondary-fixed-dim hover:bg-secondary/70"
                        }`}
                        style={{ height: `${h}%` }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Call history */}
        <div className="bg-white border border-border-subtle rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border-subtle flex justify-between items-center">
            <div>
              <span className="font-semibold text-primary">Call History</span>
              <span className="text-on-surface-variant text-sm ml-2">
                ({totalCalls} total)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Icon
                  name="search"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[16px]"
                />
                <input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search calls..."
                  className="bg-surface-container-low pl-9 pr-3 py-1.5 rounded-lg text-sm outline-none focus:ring-2 focus:ring-secondary/20"
                />
              </div>
              <button className="p-2 rounded-lg hover:bg-surface-container-low">
                <Icon name="filter_list" className="text-[18px] text-outline" />
              </button>
            </div>
          </div>

          <table className="w-full">
            <thead>
              <tr className="bg-surface-container-low text-xs uppercase tracking-wide text-outline">
                <th className="text-left px-6 py-3 font-medium">Caller ID</th>
                <th className="text-left px-6 py-3 font-medium">Duration</th>
                <th className="text-left px-6 py-3 font-medium">Intent</th>
                <th className="text-left px-6 py-3 font-medium">Sentiment</th>
                <th className="text-left px-6 py-3 font-medium">Status</th>
                <th className="text-left px-6 py-3 font-medium">Time</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody>
              {pagedCalls.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-on-surface-variant text-sm"
                  >
                    No calls yet for this agent.
                  </td>
                </tr>
              ) : (
                pagedCalls.map((c) => <CallRow key={c.id} call={c} />)
              )}
            </tbody>
          </table>

          <div className="px-6 py-3 border-t border-border-subtle flex justify-between items-center">
            <span className="text-sm text-on-surface-variant">
              Showing {start}–{end} of {totalCalls} call logs
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded hover:bg-surface-container-low disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Icon name="chevron_left" className="text-[20px]" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded hover:bg-surface-container-low disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Icon name="chevron_right" className="text-[20px]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function MiniStat({
  icon,
  iconColor,
  label,
  value,
  delta,
}: {
  icon: string;
  iconColor: string;
  label: string;
  value: string;
  delta: string;
}) {
  return (
    <div className="bg-white border border-border-subtle rounded-xl p-4 hover:-translate-y-0.5 transition-transform">
      <Icon name={icon} className={`text-[20px] ${iconColor}`} />
      <div className="text-xs text-on-surface-variant mt-2">{label}</div>
      <div className="text-2xl font-bold text-primary mt-1">{value}</div>
      <div className="text-xs text-emerald-600 mt-1">{delta}</div>
    </div>
  );
}

function CallRow({ call }: { call: Call }) {
  const sentiments: Record<
    string,
    { icon: string; label: string; color: string; filled?: boolean }
  > = {
    positive: {
      icon: "sentiment_satisfied_alt",
      label: "Positive",
      color: "text-emerald-600",
    },
    neutral: { icon: "sentiment_neutral", label: "Neutral", color: "text-amber-500" },
    negative: {
      icon: "sentiment_dissatisfied",
      label: "Negative",
      color: "text-error",
    },
    delighted: {
      icon: "sentiment_very_satisfied",
      label: "Delighted",
      color: "text-emerald-600",
      filled: true,
    },
  };
  const s = sentiments[call.sentiment] ?? sentiments.neutral;

  return (
    <tr className="group border-b last:border-0 border-border-subtle hover:bg-surface-container-low transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <Icon name="phone" className="text-outline text-[14px]" />
          <span className="text-sm text-on-surface">
            {call.caller_number ?? "Unknown"}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 text-sm">
        {formatDuration(call.duration_seconds)}
      </td>
      <td className="px-6 py-4">
        <span className="text-xs bg-surface-container-high rounded-full px-2 py-0.5 text-on-surface-variant">
          {call.intent ?? "general"}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className={`inline-flex items-center gap-1 text-xs ${s.color}`}>
          <Icon name={s.icon} filled={s.filled} className="text-[16px]" />
          {s.label}
        </span>
      </td>
      <td className="px-6 py-4">
        <Badge variant={call.status === "completed" ? "active" : "neutral"}>
          {call.status}
        </Badge>
      </td>
      <td className="px-6 py-4 text-sm text-on-surface-variant">
        {formatTimeAgo(call.started_at)}
      </td>
      <td className="px-6 py-4 text-right">
        <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-white">
          <Icon name="arrow_forward" className="text-[18px] text-secondary" />
        </button>
      </td>
    </tr>
  );
}
