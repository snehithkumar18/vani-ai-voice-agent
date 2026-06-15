import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
});

function SignupPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <h1 className="text-2xl text-primary">Signup</h1>
    </div>
  );
}
