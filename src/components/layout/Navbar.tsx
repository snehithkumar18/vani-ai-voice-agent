import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "../ui/Icon";
import { Button } from "../ui/Button";

const NAV_LINKS = [
  { label: "Product", to: "/" },
  { label: "Solutions", to: "/" },
  { label: "Pricing", to: "/" },
  { label: "Resources", to: "/" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 h-16 w-full bg-white/80 backdrop-blur border-b border-border-subtle transition-shadow ${
          scrolled ? "shadow-md" : ""
        }`}
      >
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between gap-6">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
              <Icon name="graphic_eq" filled className="text-white text-[22px]" />
            </div>
            <span className="font-bold text-primary text-lg">Vani AI</span>
          </Link>

          {/* Center links */}
          <nav className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map((l) => {
              const active = location.pathname === l.to && l.to !== "/";
              return (
                <a
                  key={l.label}
                  href="#"
                  className={`text-sm font-medium transition-colors ${
                    active
                      ? "text-secondary underline underline-offset-4 decoration-secondary"
                      : "text-on-surface-variant hover:text-secondary"
                  }`}
                >
                  {l.label}
                </a>
              );
            })}
          </nav>

          {/* Right */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/login" })}>
              Login
            </Button>
            <Button variant="primary" size="sm" onClick={() => navigate({ to: "/signup" })}>
              Get Started
            </Button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-primary"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
          >
            <Icon name="menu" className="text-[28px]" />
          </button>
        </div>
      </header>

      {/* Mobile overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[60] hero-gradient flex flex-col p-6"
          >
            <div className="flex justify-end">
              <button
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="text-white"
              >
                <Icon name="close" className="text-[32px]" />
              </button>
            </div>
            <nav className="flex flex-col mt-10 flex-1">
              {NAV_LINKS.map((l) => (
                <a
                  key={l.label}
                  href="#"
                  className="text-white text-2xl font-bold py-4 hover:text-secondary-fixed-dim transition-colors"
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                </a>
              ))}
            </nav>
            <div className="flex flex-col gap-3">
              <Button
                variant="primary"
                fullWidth
                onClick={() => {
                  setOpen(false);
                  navigate({ to: "/signup" });
                }}
              >
                Get Started
              </Button>
              <Button
                variant="outline"
                fullWidth
                className="bg-transparent text-white border-white hover:bg-white/10"
                onClick={() => {
                  setOpen(false);
                  navigate({ to: "/login" });
                }}
              >
                Login
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
