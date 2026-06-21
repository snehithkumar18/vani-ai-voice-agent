import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Icon } from "@/components/vani-ui/Icon";
import { useDashboardStats, useAgents, useCalls } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/analytics")({
  component: AnalyticsPage,
});

function formatDuration(seconds: number | null | undefined): string {
  const s = Math.max(0, Math.round(seconds ?? 0));
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return m > 0 ? `${m}m ${rem}s` : `${rem}s`;
}

function AnalyticsPage() {
  const statsQuery = useDashboardStats();
  const agentsQuery = useAgents();
  const callsQuery = useCalls();

  const [period, setPeriod] = useState<"24h" | "7d" | "30d">("7d");

  // Compute sentiment breakdown
  const sentimentStats = useMemo(() => {
    const list = callsQuery.data ?? [];
    let positive = 0;
    let delighted = 0;
    let neutral = 0;
    let negative = 0;

    list.forEach((c) => {
      if (c.sentiment === "positive") positive++;
      else if (c.sentiment === "delighted") delighted++;
      else if (c.sentiment === "negative") negative++;
      else neutral++;
    });

    const total = list.length || 1;
    return {
      delighted: { count: delighted, pct: Math.round((delighted / total) * 100) },
      positive: { count: positive, pct: Math.round((positive / total) * 100) },
      neutral: { count: neutral, pct: Math.round((neutral / total) * 100) },
      negative: { count: negative, pct: Math.round((negative / total) * 100) },
      total: list.length,
    };
  }, [callsQuery.data]);

  // Compute language distribution
  const languageStats = useMemo(() => {
    const list = agentsQuery.data ?? [];
    const counts: Record<string, number> = {};
    list.forEach((a) => {
      counts[a.language] = (counts[a.language] || 0) + 1;
    });
    return Object.entries(counts).map(([lang, count]) => ({
      language: lang,
      count,
      pct: Math.round((count / (list.length || 1)) * 100),
    }));
  }, [agentsQuery.data]);

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex justify-between items-start mb-8 gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-primary">Analytics</h1>
          <p className="text-on-surface-variant text-base mt-1">
            Deep dive into agent conversations, satisfaction scores, and volumes.
          </p>
        </div>
        
        {/* Period Selector */}
        <div className="flex gap-1 bg-white border border-border-subtle rounded-lg p-1">
          {(["24h", "7d", "30d"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`text-xs px-3.5 py-1.5 rounded-md transition-all font-medium ${
                period === p
                  ? "bg-secondary text-white shadow-sm"
                  : "text-on-surface-variant hover:bg-surface-container-low cursor-pointer"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {statsQuery.isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse bg-white border border-border-subtle rounded-xl h-[120px]"
            />
          ))
        ) : (
          <>
            <div className="bg-white border border-border-subtle rounded-xl p-6">
              <div className="flex justify-between items-start">
                <span className="text-sm font-semibold uppercase tracking-wider text-outline">Total Calls</span>
                <span className="w-8 h-8 rounded-lg bg-secondary/15 text-secondary flex items-center justify-center">
                  <Icon name="call" className="text-[18px]" />
                </span>
              </div>
              <p className="text-3xl font-bold text-primary mt-4">
                {(statsQuery.data?.total_calls ?? 0).toLocaleString()}
              </p>
              <span className="text-xs text-success-emerald font-semibold mt-2 flex items-center gap-1">
                <Icon name="trending_up" className="text-[14px]" /> +12.5% vs last period
              </span>
            </div>

            <div className="bg-white border border-border-subtle rounded-xl p-6">
              <div className="flex justify-between items-start">
                <span className="text-sm font-semibold uppercase tracking-wider text-outline">Active Agents</span>
                <span className="w-8 h-8 rounded-lg bg-secondary/15 text-secondary flex items-center justify-center">
                  <Icon name="smart_toy" filled className="text-[18px]" />
                </span>
              </div>
              <p className="text-3xl font-bold text-primary mt-4">
                {statsQuery.data?.active_agents ?? 0}
              </p>
              <span className="text-xs text-outline mt-2 block">
                {agentsQuery.data?.length ?? 0} agents total
              </span>
            </div>

            <div className="bg-white border border-border-subtle rounded-xl p-6">
              <div className="flex justify-between items-start">
                <span className="text-sm font-semibold uppercase tracking-wider text-outline">Avg Duration</span>
                <span className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Icon name="timer" className="text-[18px]" />
                </span>
              </div>
              <p className="text-3xl font-bold text-primary mt-4">
                {formatDuration(statsQuery.data?.avg_duration_seconds ?? 0)}
              </p>
              <span className="text-xs text-success-emerald font-semibold mt-2 flex items-center gap-1">
                <Icon name="trending_down" className="text-[14px]" /> -4.2s optimization
              </span>
            </div>

            <div className="bg-white border border-border-subtle rounded-xl p-6">
              <div className="flex justify-between items-start">
                <span className="text-sm font-semibold uppercase tracking-wider text-outline">Avg CSAT</span>
                <span className="w-8 h-8 rounded-lg bg-emerald-100 text-success-emerald flex items-center justify-center">
                  <Icon name="sentiment_very_satisfied" filled className="text-[18px]" />
                </span>
              </div>
              <p className="text-3xl font-bold text-primary mt-4">
                {statsQuery.data?.satisfaction_score ?? 0}/5
              </p>
              <span className="text-xs text-success-emerald font-semibold mt-2 flex items-center gap-1">
                <Icon name="trending_up" className="text-[14px]" /> +0.2 improvement
              </span>
            </div>
          </>
        )}
      </div>

      {/* Analytics Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sentiment Distribution */}
        <div className="bg-white border border-border-subtle rounded-xl p-6 lg:col-span-6 flex flex-col justify-between min-h-[360px]">
          <div>
            <h3 className="font-bold text-primary text-lg flex items-center gap-2 mb-2">
              <Icon name="emoji_emotions" className="text-secondary" /> Customer Sentiment Breakdown
            </h3>
            <p className="text-xs text-on-surface-variant mb-6">
              Distribution of intent classification and tone across {sentimentStats.total} recent calls.
            </p>
          </div>

          {callsQuery.isLoading ? (
            <div className="animate-pulse space-y-4 py-4">
              <div className="h-6 bg-surface-container-high rounded" />
              <div className="h-6 bg-surface-container-high rounded" />
              <div className="h-6 bg-surface-container-high rounded" />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Progress bars */}
              <div>
                <div className="flex justify-between text-sm font-medium text-primary mb-1.5">
                  <span className="flex items-center gap-1 text-emerald-600">
                    <Icon name="sentiment_very_satisfied" filled className="text-[16px]" /> Delighted
                  </span>
                  <span>{sentimentStats.delighted.count} calls ({sentimentStats.delighted.pct}%)</span>
                </div>
                <div className="w-full bg-surface-container rounded-full h-3">
                  <div
                    className="bg-emerald-500 h-3 rounded-full"
                    style={{ width: `${sentimentStats.delighted.pct}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm font-medium text-primary mb-1.5">
                  <span className="flex items-center gap-1 text-emerald-600">
                    <Icon name="sentiment_satisfied_alt" className="text-[16px]" /> Positive
                  </span>
                  <span>{sentimentStats.positive.count} calls ({sentimentStats.positive.pct}%)</span>
                </div>
                <div className="w-full bg-surface-container rounded-full h-3">
                  <div
                    className="bg-emerald-400 h-3 rounded-full"
                    style={{ width: `${sentimentStats.positive.pct}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm font-medium text-primary mb-1.5">
                  <span className="flex items-center gap-1 text-amber-600">
                    <Icon name="sentiment_neutral" className="text-[16px]" /> Neutral
                  </span>
                  <span>{sentimentStats.neutral.count} calls ({sentimentStats.neutral.pct}%)</span>
                </div>
                <div className="w-full bg-surface-container rounded-full h-3">
                  <div
                    className="bg-amber-400 h-3 rounded-full"
                    style={{ width: `${sentimentStats.neutral.pct}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm font-medium text-primary mb-1.5">
                  <span className="flex items-center gap-1 text-error">
                    <Icon name="sentiment_dissatisfied" className="text-[16px]" /> Negative
                  </span>
                  <span>{sentimentStats.negative.count} calls ({sentimentStats.negative.pct}%)</span>
                </div>
                <div className="w-full bg-surface-container rounded-full h-3">
                  <div
                    className="bg-red-400 h-3 rounded-full"
                    style={{ width: `${sentimentStats.negative.pct}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Language Breakdown */}
        <div className="bg-white border border-border-subtle rounded-xl p-6 lg:col-span-6 flex flex-col justify-between min-h-[360px]">
          <div>
            <h3 className="font-bold text-primary text-lg flex items-center gap-2 mb-2">
              <Icon name="language" className="text-secondary" /> Language Distribution
            </h3>
            <p className="text-xs text-on-surface-variant mb-6">
              Primary language profile configuration configured across all provisioning bots.
            </p>
          </div>

          {agentsQuery.isLoading ? (
            <div className="animate-pulse space-y-4 py-4">
              <div className="h-6 bg-surface-container-high rounded" />
              <div className="h-6 bg-surface-container-high rounded" />
            </div>
          ) : languageStats.length === 0 ? (
            <div className="text-center py-12 text-on-surface-variant text-sm">
              No agents configured yet.
            </div>
          ) : (
            <div className="space-y-4">
              {languageStats.map((l) => (
                <div key={l.language}>
                  <div className="flex justify-between text-sm font-medium text-primary mb-1.5">
                    <span>{l.language}</span>
                    <span>{l.count} agents ({l.pct}%)</span>
                  </div>
                  <div className="w-full bg-surface-container rounded-full h-3">
                    <div
                      className="bg-secondary h-3 rounded-full"
                      style={{ width: `${l.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Agent Comparison Table */}
        <div className="bg-white border border-border-subtle rounded-xl overflow-hidden shadow-sm lg:col-span-12">
          <div className="px-6 py-4 border-b border-border-subtle">
            <h3 className="font-bold text-primary text-lg">Agent Performance Comparison</h3>
          </div>

          {agentsQuery.isLoading ? (
            <div className="p-6 space-y-4">
              <div className="h-10 bg-surface-container-high rounded" />
              <div className="h-10 bg-surface-container-high rounded" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-surface-container-low text-xs uppercase tracking-wider text-outline border-b border-border-subtle">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Agent Name</th>
                    <th className="px-6 py-3 font-semibold">Status</th>
                    <th className="px-6 py-3 font-semibold">Language</th>
                    <th className="px-6 py-3 font-semibold">Voice Model</th>
                    <th className="px-6 py-3 font-semibold">Calls Made</th>
                    <th className="px-6 py-3 font-semibold">Avg CSAT</th>
                    <th className="px-6 py-3 font-semibold">Success Rate</th>
                    <th className="px-6 py-3 font-semibold text-right">Link</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle text-sm">
                  {agentsQuery.data?.map((a) => (
                    <tr key={a.id} className="hover:bg-surface-container-low transition-colors">
                      <td className="px-6 py-4 font-bold text-primary">{a.name}</td>
                      <td className="px-6 py-4">
                        {a.status === "active" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-semibold">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100 text-xs font-semibold">
                            Paused
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-on-surface-variant font-medium">{a.language}</td>
                      <td className="px-6 py-4 text-on-surface-variant">
                        {a.voice_type.replace("Female - ", "").replace("Male - ", "")}
                      </td>
                      <td className="px-6 py-4 font-medium text-primary">
                        {a.calls_handled.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 font-medium text-amber-600">
                        {statsQuery.data?.satisfaction_score ?? "4.5"}/5
                      </td>
                      <td className="px-6 py-4 font-semibold text-emerald-600">
                        {a.success_rate}%
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          to="/agent/$id"
                          params={{ id: a.id }}
                          className="text-secondary font-semibold hover:underline"
                        >
                          View →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
