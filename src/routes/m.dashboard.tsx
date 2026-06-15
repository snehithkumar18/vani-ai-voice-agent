import { createFileRoute } from "@tanstack/react-router";
import { HtmlPage } from "@/components/HtmlPage";
import html from "@/page-html/vani_ai_dashboard_mobile.body.html?raw";

export const Route = createFileRoute("/m/dashboard")({
  component: () => <HtmlPage html={html} className="bg-background text-on-background min-h-screen pb-32" />,
});
