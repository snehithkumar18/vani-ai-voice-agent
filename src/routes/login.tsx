import { createFileRoute } from "@tanstack/react-router";
import { HtmlPage } from "@/components/HtmlPage";
import html from "@/page-html/vani_ai_login.body.html?raw";

export const Route = createFileRoute("/login")({
  component: () => <HtmlPage html={html} className="min-h-screen flex items-center justify-center p-md" style={{ backgroundColor: "#F8F7FF" }} />,
});
