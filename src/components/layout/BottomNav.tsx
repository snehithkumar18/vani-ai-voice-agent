import { Link, useLocation } from "@tanstack/react-router";
import { Icon } from "../ui/Icon";

const ITEMS = [
  { label: "Overview", icon: "dashboard", route: "/dashboard" },
  { label: "Agents", icon: "smart_toy", route: "/agents" },
  { label: "Calls", icon: "call", route: "/call-logs" },
  { label: "Settings", icon: "settings", route: "/settings" },
] as const;

export function BottomNav() {
  const location = useLocation();
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 w-full bg-white border-t border-border-subtle h-16 flex items-center justify-around z-40">
      {ITEMS.map((item) => {
        const active = location.pathname === item.route;
        return (
          <Link
            key={item.label}
            to={item.route}
            className={`flex flex-col items-center gap-0.5 text-xs font-medium ${
              active ? "text-secondary" : "text-on-surface-variant"
            }`}
          >
            <Icon name={item.icon} filled={active} className="text-[22px]" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
