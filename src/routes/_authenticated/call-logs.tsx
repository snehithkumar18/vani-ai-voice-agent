import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Icon } from "@/components/vani-ui/Icon";
import { Badge } from "@/components/vani-ui/Badge";
import { useCalls, useAgents } from "@/lib/queries";
import type { Call, Agent } from "@/lib/database.types";

export const Route = createFileRoute("/_authenticated/call-logs")({
  component: CallLogsPage,
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

function CallLogsPage() {
  const callsQuery = useCalls();
  const agentsQuery = useAgents();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 12;

  const agentsById = useMemo(() => {
    return new Map<string, Agent>(
      (agentsQuery.data ?? []).map((a) => [a.id, a])
    );
  }, [agentsQuery.data]);

  const filteredCalls = useMemo(() => {
    const list = callsQuery.data ?? [];
    if (!search) return list;
    const s = search.toLowerCase();
    return list.filter(
      (c) =>
        c.caller_number?.toLowerCase().includes(s) ||
        c.caller_name?.toLowerCase().includes(s) ||
        c.intent?.toLowerCase().includes(s) ||
        c.status?.toLowerCase().includes(s)
    );
  }, [callsQuery.data, search]);

  const pagedCalls = useMemo(() => {
    return filteredCalls.slice(
      (page - 1) * PAGE_SIZE,
      page * PAGE_SIZE
    );
  }, [filteredCalls, page]);

  const totalCalls = filteredCalls.length;
  const totalPages = Math.max(1, Math.ceil(totalCalls / PAGE_SIZE));
  const start = totalCalls === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const end = Math.min(page * PAGE_SIZE, totalCalls);

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex justify-between items-start mb-8 gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-primary">Call Logs</h1>
          <p className="text-on-surface-variant text-base mt-1">
            Complete call records and sentiment analysis.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6 flex gap-4 max-w-md">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-3 flex items-center text-outline pointer-events-none">
            <Icon name="search" className="text-[20px]" />
          </span>
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by caller, intent, or status..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white border border-border-subtle text-sm text-on-surface placeholder:text-outline focus:border-secondary focus:ring-4 focus:ring-secondary/10 outline-none transition-all"
          />
        </div>
      </div>

      {/* Calls Table Wrapper */}
      <div className="bg-white border border-border-subtle rounded-xl overflow-hidden shadow-sm">
        {callsQuery.isLoading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-surface-container-high rounded-md h-12"
              />
            ))}
          </div>
        ) : filteredCalls.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <Icon
              name="call_end"
              className="text-[64px]"
              style={{ color: "rgba(120,118,128,0.3)" }}
            />
            <h3 className="mt-4 text-lg font-semibold text-primary">No Call Logs Found</h3>
            <p className="mt-2 text-sm text-on-surface-variant max-w-sm">
              {search
                ? "Try adjusting your search terms."
                : "No conversations have been recorded by your voice agents yet."}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-surface-container-low text-xs uppercase tracking-wider text-outline border-b border-border-subtle">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Customer ID</th>
                    <th className="px-6 py-3 font-semibold">Agent</th>
                    <th className="px-6 py-3 font-semibold">Intent</th>
                    <th className="px-6 py-3 font-semibold">Sentiment</th>
                    <th className="px-6 py-3 font-semibold">Duration</th>
                    <th className="px-6 py-3 font-semibold">Status</th>
                    <th className="px-6 py-3 font-semibold">Date & Time</th>
                    <th className="px-6 py-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {pagedCalls.map((call) => (
                    <CallLogRow
                      key={call.id}
                      call={call}
                      agentName={
                        call.agent_id
                          ? agentsById.get(call.agent_id)?.name ?? "Unknown Agent"
                          : "Unknown Agent"
                      }
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-border-subtle flex justify-between items-center flex-wrap gap-4">
              <span className="text-sm text-on-surface-variant">
                Showing {start}–{end} of {totalCalls} call records
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 rounded-lg border border-border-subtle hover:bg-surface-container-low disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  aria-label="Previous page"
                >
                  <Icon name="chevron_left" className="text-[20px]" />
                </button>
                <span className="text-sm text-primary font-medium px-2">
                  Page {page} of {totalPages}
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1.5 rounded-lg border border-border-subtle hover:bg-surface-container-low disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  aria-label="Next page"
                >
                  <Icon name="chevron_right" className="text-[20px]" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

function CallLogRow({ call, agentName }: { call: Call; agentName: string }) {
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
    <tr className="hover:bg-surface-container-low transition-colors group">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center text-xs font-bold text-white shrink-0">
            {initials(call.caller_name ?? call.caller_number)}
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-primary">
              {call.caller_name ?? "Customer"}
            </div>
            {call.caller_number && (
              <div className="text-xs text-outline mt-0.5">{call.caller_number}</div>
            )}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-on-surface-variant">{agentName}</td>
      <td className="px-6 py-4">
        <span className="text-xs bg-surface-container-high rounded-full px-2.5 py-0.5 text-on-surface-variant font-medium">
          {call.intent ?? "general"}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${s.color}`}>
          <Icon name={s.icon} filled={s.filled} className="text-[16px]" />
          {s.label}
        </span>
      </td>
      <td className="px-6 py-4 text-sm text-on-surface-variant font-medium">
        {formatDuration(call.duration_seconds)}
      </td>
      <td className="px-6 py-4">{statusBadge}</td>
      <td className="px-6 py-4 text-sm text-on-surface-variant whitespace-nowrap">
        {formatDate(call.started_at)}
      </td>
      <td className="px-6 py-4 text-right">
        {call.agent_id ? (
          <Link
            to="/agent/$id"
            params={{ id: call.agent_id }}
            className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md border border-secondary text-secondary hover:bg-secondary hover:text-white transition-colors"
          >
            View Details
          </Link>
        ) : (
          <span className="text-xs text-outline">—</span>
        )}
      </td>
    </tr>
  );
}
