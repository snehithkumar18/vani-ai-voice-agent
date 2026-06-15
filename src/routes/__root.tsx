import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { supabase } from "@/integrations/supabase/client";
import { useAppStore } from "@/store/useAppStore";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 hero-gradient overflow-hidden">
      <span
        aria-hidden
        className="absolute inset-0 flex items-center justify-center text-[120px] md:text-[200px] font-bold text-white/10 pointer-events-none select-none"
      >
        404
      </span>
      <div className="relative max-w-md text-center">
        <span className="material-symbols-outlined text-[64px] text-secondary-fixed-dim">
          search_off
        </span>
        <h1 className="text-3xl font-bold text-white mt-4">Page not found</h1>
        <p className="mt-2 text-on-primary-container">
          This page doesn't exist or has been moved.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center rounded-lg bg-secondary px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:opacity-90"
          >
            Back to Dashboard
          </Link>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-lg border border-white/30 bg-white/5 px-5 py-2.5 text-sm font-medium text-white hover:bg-white/10"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#712ae2" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { title: "Vani AI — Enterprise Voice Intelligence" },
      { name: "description", content: "AI voice calling agents for Indian businesses. Realistic Hindi voice, 50+ calls/day, all Indian languages." },
      { property: "og:title", content: "Vani AI — Give Your Business a Voice" },
      { property: "og:description", content: "AI voice calling agents for Indian businesses. Hindi, Telugu, and 20+ languages." },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Vani AI" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Vani AI — Give Your Business a Voice" },
      { name: "twitter:description", content: "AI voice calling agents for Indian businesses. Hindi, Telugu, and 20+ languages." },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.json" },
      { rel: "apple-touch-icon", href: "/icon-192.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  const setUser = useAppStore((s) => s.setUser);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const meta = (session.user.user_metadata ?? {}) as { full_name?: string; avatar_url?: string };
        setUser({
          name: meta.full_name ?? session.user.email ?? "User",
          email: session.user.email ?? "",
          avatar: meta.avatar_url,
        });
      } else {
        setUser(null);
      }
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      router.invalidate();
      if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
    });
    return () => sub.subscription.unsubscribe();
  }, [router, queryClient, setUser]);

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}

