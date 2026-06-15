import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "../components/layout/Navbar";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-32 flex items-center justify-center">
        <h1 className="text-2xl text-primary">Landing</h1>
      </main>
    </div>
  );
}
