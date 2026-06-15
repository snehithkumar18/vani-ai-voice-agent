import { useState, type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";
import { Icon } from "../vani-ui/Icon";
import { Avatar } from "../vani-ui/Avatar";
import { AnimatePresence, motion } from "framer-motion";

interface Props {
  children: ReactNode;
}

export function DashboardLayout({ children }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="md:hidden fixed inset-0 bg-black/50 z-40"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="md:hidden fixed inset-y-0 left-0 z-50"
              onClick={() => setMobileOpen(false)}
            >
              <Sidebar />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col overflow-hidden md:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 h-16 bg-white border-b border-border-subtle flex items-center px-4 md:px-6 gap-3 md:gap-4 z-30">
          <button
            type="button"
            className="md:hidden text-on-surface-variant -ml-1"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
          >
            <Icon name="menu" className="text-[26px]" />
          </button>

          <div className="flex-1 max-w-xs relative hidden sm:block">
            <span className="absolute inset-y-0 left-3 flex items-center text-outline pointer-events-none">
              <Icon name="search" className="text-[20px]" />
            </span>
            <input
              type="search"
              placeholder="Search agents, calls..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-surface-container-low text-sm text-on-surface placeholder:text-outline focus:bg-white focus:border-secondary focus:ring-4 focus:ring-secondary/10 border border-transparent outline-none transition-all"
            />
          </div>

          <div className="ml-auto flex items-center gap-3 md:gap-4">
            <button className="relative text-on-surface-variant hover:text-secondary" aria-label="Notifications">
              <Icon name="notifications" className="text-[24px]" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-error rounded-full" />
            </button>
            <span className="hidden sm:block w-px h-8 bg-border-subtle" />
            <div className="hidden sm:flex flex-col items-end leading-tight">
              <span className="text-sm font-medium text-on-surface">Arjun Mehta</span>
              <span className="text-xs text-outline">Enterprise Admin</span>
            </div>
            <Avatar name="Arjun Mehta" size={40} />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">{children}</main>
      </div>

      <BottomNav />
    </div>
  );
}
