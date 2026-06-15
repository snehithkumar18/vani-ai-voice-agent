import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "../components/layout/DashboardLayout";

export const Route = createFileRoute("/_authenticated/create-agent")({
  component: CreateAgentPage,
});

function CreateAgentPage() {
  return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-full">
        <h1 className="text-2xl text-primary">Create Agent</h1>
      </div>
    </DashboardLayout>
  );
}
