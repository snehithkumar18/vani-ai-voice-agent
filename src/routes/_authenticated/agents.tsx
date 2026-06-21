import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Icon } from "@/components/vani-ui/Icon";
import { Button } from "@/components/vani-ui/Button";
import { Badge } from "@/components/vani-ui/Badge";
import { useAgents, useUpdateAgent } from "@/lib/queries";
import type { Agent } from "@/lib/database.types";

export const Route = createFileRoute("/_authenticated/agents")({
  component: MyAgentsPage,
});

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function MyAgentsPage() {
  const { data: agents = [], isLoading } = useAgents();
  const updateAgent = useUpdateAgent();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAgents = agents.filter((a) =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.language.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.voice_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleStatus = (agent: Agent) => {
    const nextStatus = agent.status === "active" ? "paused" : "active";
    updateAgent.mutate({ id: agent.id, patch: { status: nextStatus } });
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex justify-between items-start mb-8 gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-primary">My Agents</h1>
          <p className="text-on-surface-variant text-base mt-1">
            Manage your conversational AI calling agents.
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

      {/* Search and Filters */}
      <div className="mb-6 flex gap-4 max-w-md">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-3 flex items-center text-outline pointer-events-none">
            <Icon name="search" className="text-[20px]" />
          </span>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, language, voice..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white border border-border-subtle text-sm text-on-surface placeholder:text-outline focus:border-secondary focus:ring-4 focus:ring-secondary/10 outline-none transition-all"
          />
        </div>
      </div>

      {/* Agents Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse bg-white border border-border-subtle rounded-xl h-[280px]"
            />
          ))}
        </div>
      ) : filteredAgents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-border-subtle rounded-xl text-center px-6">
          <Icon
            name="smart_toy"
            className="text-[64px]"
            style={{ color: "rgba(120,118,128,0.3)" }}
          />
          <h3 className="mt-4 text-lg font-semibold text-primary">No Agents Found</h3>
          <p className="mt-2 text-sm text-on-surface-variant max-w-sm">
            {searchQuery
              ? "Try adjusting your search terms to find your agent."
              : "Get started by creating your first conversational voice agent."}
          </p>
          {!searchQuery && (
            <Link to="/create-agent" className="mt-6">
              <Button>Create Agent</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAgents.map((agent) => (
            <div
              key={agent.id}
              className="bg-white border border-border-subtle rounded-xl p-6 flex flex-col hover:border-secondary/30 hover:shadow-md transition-all duration-200"
            >
              {/* Header */}
              <div className="flex justify-between items-start gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center shrink-0">
                    <Icon name="smart_toy" filled className="text-secondary text-[22px]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-primary text-lg">{agent.name}</h3>
                    <p className="text-xs text-outline">
                      Created: {formatDate(agent.created_at)}
                    </p>
                  </div>
                </div>
                {agent.status === "active" ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold">
                    Paused
                  </span>
                )}
              </div>

              {/* Specs */}
              <div className="my-5 space-y-2.5 py-4 border-y border-border-subtle">
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant flex items-center gap-1.5">
                    <Icon name="language" className="text-[16px] text-outline" /> Language
                  </span>
                  <span className="font-semibold text-primary">{agent.language}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant flex items-center gap-1.5">
                    <Icon name="record_voice_over" className="text-[16px] text-outline" /> Voice
                  </span>
                  <span className="font-semibold text-primary truncate max-w-[180px]">
                    {agent.voice_type.replace("Female - ", "").replace("Male - ", "")}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant flex items-center gap-1.5">
                    <Icon name="call" className="text-[16px] text-outline" /> Calls Handled
                  </span>
                  <span className="font-semibold text-primary">
                    {agent.calls_handled.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant flex items-center gap-1.5">
                    <Icon name="check_circle" className="text-[16px] text-outline" /> Success Rate
                  </span>
                  <span className="font-semibold text-emerald-600">
                    {agent.success_rate}%
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-auto flex gap-2">
                <Link
                  to="/agent/$id"
                  params={{ id: agent.id }}
                  className="flex-1"
                >
                  <Button variant="outline" fullWidth>
                    View Details
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={() => toggleStatus(agent)}
                  disabled={updateAgent.isPending}
                  className="px-3 border-border-subtle text-on-surface-variant"
                >
                  <Icon
                    name={agent.status === "active" ? "pause" : "play_arrow"}
                    className="text-[20px]"
                  />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
