import { createFileRoute } from "@tanstack/react-router";
import { HtmlPage } from "@/components/HtmlPage";
import html from "@/page-html/vani_ai_active_call_mobile.body.html?raw";

export const Route = createFileRoute("/m/call")({
  component: () => <HtmlPage html={html} className="flex flex-col min-h-screen text-on-primary bg-primary overflow-hidden" />,
});
