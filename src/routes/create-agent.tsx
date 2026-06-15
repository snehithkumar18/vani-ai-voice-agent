import { createFileRoute } from "@tanstack/react-router";
import { HtmlPage } from "@/components/HtmlPage";
import html from "@/page-html/vani_ai_create_agent.body.html?raw";

export const Route = createFileRoute("/create-agent")({
  component: () => <HtmlPage html={html} className="bg-background text-on-surface min-h-screen" />,
});
