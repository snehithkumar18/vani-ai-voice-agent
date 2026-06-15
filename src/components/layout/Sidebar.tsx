import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Icon } from "../vani-ui/Icon";
import { Button } from "../vani-ui/Button";

const NAV = [
  { label: "Overview", icon: "dashboard", route: "/dashboard" },
  { label: "My Agents", icon: "smart_toy", route: "/agents" },
  { label: "Call Logs", icon: "call", route: "/call-logs" },
  { label: "Analytics", icon: "insights", route: "/analytics" },
  { label: "Settings", icon: "settings", route: "/settings" },
] as const;

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside className="fixed left-0 top-0 w-64 h-full bg-surface-container-low border-r border-border-subtle z-40 flex flex-col">
      {/* Brand */}
      <div className="px-4 py-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
          <Icon name="graphic_eq" filled className="text-white text-[22px]" />
        </div>
        <div className="leading-tight">
          <p className="font-bold text-primary">Vani AI</p>
          <p className="text-xs text-on-surface-variant">Voice Intelligence</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="px-3 flex flex-col gap-1">
        {NAV.map((item) => {
          const active = location.pathname === item.route;
          return (
            <Link
              key={item.label}
              to={item.route}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors text-sm ${
                active
                  ? "bg-secondary-container text-on-secondary-container font-semibold"
                  : "text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              <Icon name={item.icon} filled={active} className="text-[20px]" />
              {item.label}
            </Link>
          );
        })}

        <Button
          variant="primary"
          fullWidth
          className="mt-6 shadow-md"
          iconLeft={<Icon name="add" className="text-[20px]" />}
          onClick={() => navigate({ to: "/create-agent" })}
        >
          Create Agent
        </Button>
      </nav>

      {/* Bottom */}
      <div className="mt-auto px-3 pb-6 pt-4 border-t border-border-subtle flex flex-col gap-1">
        <a
          href="#"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors text-sm text-on-surface-variant hover:bg-surface-container-high"
        >
          <Icon name="help_outline" className="text-[20px]" />
          Help Center
        </a>
        <a
          href="#"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors text-sm text-on-surface-variant hover:bg-red-50 hover:text-error"
        >
          <Icon name="logout" className="text-[20px]" />
          Logout
        </a>
      </div>
    </aside>
  );
}
