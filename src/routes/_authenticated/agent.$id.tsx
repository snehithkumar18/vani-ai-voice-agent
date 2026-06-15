import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export const Route = createFileRoute("/_authenticated/agent/$id")({
  component: AgentDetailPage,
});

function AgentDetailPage() {
  const { id } = Route.useParams();
  return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-full">
        <h1 className="text-2xl text-primary">Agent Detail — {id}</h1>
      </div>
    </DashboardLayout>
  );
}
