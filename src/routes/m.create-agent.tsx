import { createFileRoute } from "@tanstack/react-router";
import { HtmlPage } from "@/components/HtmlPage";
import html from "@/page-html/vani_ai_create_agent_mobile.body.html?raw";

export const Route = createFileRoute("/m/create-agent")({
  component: () => <HtmlPage html={html} className="bg-background text-on-background min-h-screen flex flex-col overflow-x-hidden" />,
});
