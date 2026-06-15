import { createFileRoute } from "@tanstack/react-router";
import { HtmlPage } from "@/components/HtmlPage";
import html from "@/page-html/vani_ai_dashboard.body.html?raw";

export const Route = createFileRoute("/dashboard")({
  component: () => <HtmlPage html={html} className="bg-surface text-on-surface" />,
});
