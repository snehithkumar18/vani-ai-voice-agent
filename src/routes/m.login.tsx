import { createFileRoute } from "@tanstack/react-router";
import { HtmlPage } from "@/components/HtmlPage";
import html from "@/page-html/vani_ai_login_mobile.body.html?raw";

export const Route = createFileRoute("/m/login")({
  component: () => <HtmlPage html={html} className="bg-surface-white text-on-surface min-h-screen flex flex-col" />,
});
