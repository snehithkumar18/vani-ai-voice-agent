import { createFileRoute } from "@tanstack/react-router";
import { HtmlPage } from "@/components/HtmlPage";
import html from "@/page-html/vani_ai_agent_details.body.html?raw";

export const Route = createFileRoute("/agent")({
  component: () => <HtmlPage html={html} className="bg-background text-on-background min-h-screen" />,
});
