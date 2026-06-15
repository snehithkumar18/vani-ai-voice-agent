import { useState } from "react";
import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Input } from "@/components/vani-ui/Input";
import { Icon } from "@/components/vani-ui/Icon";

export const Route = createFileRoute("/login")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) throw redirect({ to: "/dashboard" });
  },
  component: LoginPage,
});

type SubmitState = "idle" | "loading" | "error";

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [state, setState] = useState<SubmitState>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleGoogle() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/dashboard",
    });
    if (result.error) {
      toast.error("Google sign-in failed. Please try again.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/dashboard" });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    setError(null);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) {
      setError(err.message);
      setState("error");
      setTimeout(() => setState("idle"), 2000);
      return;
    }
    navigate({ to: "/dashboard" });
  }

  async function handleForgot() {
    if (!email) {
      toast.error("Enter your email above first.");
      return;
    }
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/reset-password",
    });
    if (err) toast.error(err.message);
    else toast.success("Reset link sent to your email");
  }

  return (
    <div className="bg-surface min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-[440px] bg-white border border-border-subtle rounded-xl shadow-[0px_8px_32px_rgba(30,27,75,0.08)] p-10"
      >
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary to-primary flex items-center justify-center text-white">
            <Icon name="mic" />
          </div>
          <span className="text-primary font-bold text-xl tracking-tight">Vani AI</span>
        </div>

        <h1 className="text-primary font-bold text-2xl text-center">Welcome back</h1>
        <p className="text-on-surface-variant text-sm text-center mt-1">
          Continue to your Vani AI dashboard
        </p>

        <button
          type="button"
          onClick={handleGoogle}
          className="mt-8 w-full bg-white border border-outline-variant rounded-lg py-3 px-4 flex items-center justify-center gap-3 hover:bg-surface-container-low transition-colors cursor-pointer text-on-surface font-medium text-sm"
        >
          <GoogleIcon />
          Continue with Google
        </button>

        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-border-subtle" />
          <span className="text-xs font-medium text-outline tracking-widest">OR EMAIL</span>
          <div className="flex-1 h-px bg-border-subtle" />
        </div>

        <form onSubmit={handleSubmit}>
          <Input
            label="Email Address"
            name="email"
            type="email"
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="mt-5">
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="password" className="text-sm font-medium text-on-surface">
                Password
              </label>
              <button
                type="button"
                onClick={handleForgot}
                className="text-secondary text-sm font-medium hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPwd ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 pr-11 rounded-lg border border-border-subtle bg-white text-on-surface placeholder:text-outline focus:border-secondary focus:ring-4 focus:ring-secondary/10 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="absolute inset-y-0 right-3 flex items-center text-outline hover:text-secondary"
              >
                <Icon name={showPwd ? "visibility_off" : "visibility"} />
              </button>
            </div>
            {error && state === "error" && (
              <p className="text-xs text-error mt-1.5">{error}</p>
            )}
          </div>

          <SubmitButton state={state} idleLabel="Sign In" loadingLabel="Signing in..." />
        </form>

        <p className="text-center text-sm text-on-surface-variant mt-6">
          Don't have an account?{" "}
          <Link to="/signup" className="text-secondary font-semibold hover:underline">
            Sign up for free
          </Link>
        </p>
        <hr className="border-border-subtle my-4" />
        <p className="text-center text-xs text-outline">
          Start free, no credit card required
        </p>
      </motion.div>

      <div className="mt-6 flex justify-center gap-8 opacity-40">
        <div className="flex items-center gap-1.5">
          <Icon name="verified_user" className="text-base" />
          <span className="text-xs font-semibold text-on-surface-variant">
            ENTERPRISE SECURE
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Icon name="cloud_done" className="text-base" />
          <span className="text-xs font-semibold text-on-surface-variant">99.9% UPTIME</span>
        </div>
      </div>
    </div>
  );
}

export function SubmitButton({
  state,
  idleLabel,
  loadingLabel,
}: {
  state: SubmitState;
  idleLabel: string;
  loadingLabel: string;
}) {
  const base =
    "mt-8 w-full inline-flex items-center justify-center gap-2 rounded-lg font-medium px-7 py-3 text-base transition-all active:scale-95 text-white";
  if (state === "loading") {
    return (
      <button type="submit" disabled className={`${base} bg-secondary/70 cursor-not-allowed`}>
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
        {loadingLabel}
      </button>
    );
  }
  if (state === "error") {
    return (
      <button type="submit" className={`${base} bg-error`}>
        Try again
      </button>
    );
  }
  return (
    <button type="submit" className={`${base} bg-secondary hover:opacity-90 shadow-sm`}>
      {idleLabel}
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35.5 24 35.5c-6.4 0-11.5-5.1-11.5-11.5S17.6 12.5 24 12.5c3 0 5.7 1.1 7.7 2.9l5.7-5.7C33.9 6.5 29.2 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.3-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.6 16 18.9 12.5 24 12.5c3 0 5.7 1.1 7.7 2.9l5.7-5.7C33.9 6.5 29.2 4.5 24 4.5 16.3 4.5 9.7 8.9 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 43.5c5.1 0 9.7-2 13.2-5.1l-6.1-5c-2 1.4-4.4 2.1-7.1 2.1-5.3 0-9.7-3.1-11.3-7.6l-6.6 5.1C9.6 39 16.2 43.5 24 43.5z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4-4.1 5.4l6.1 5c-.4.4 6.7-4.9 6.7-14.4 0-1.2-.1-2.3-.4-3.5z"
      />
    </svg>
  );
}
