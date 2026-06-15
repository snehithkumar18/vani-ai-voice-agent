import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Navbar } from "../components/layout/Navbar";
import { Icon } from "../components/vani-ui/Icon";

export const Route = createFileRoute("/")({
  component: LandingPage,
  head: () => ({
    meta: [
      { title: "Vani AI — AI Voice Agents for Indian Businesses" },
      {
        name: "description",
        content:
          "Deploy intelligent AI voice agents that speak natural Hindi, Telugu, and 20+ Indian languages — no code required.",
      },
    ],
  }),
});

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: "easeOut" as const },
});

const fadeDown = (delay = 0) => ({
  initial: { opacity: 0, y: -10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: "easeOut" as const },
});

function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <TrustedBy />
      <Features />
      <Bento />
      <CtaBanner />
      <Footer />
    </div>
  );
}

/* ---------------- HERO ---------------- */
function Hero() {
  const avatars = [
    { bg: "bg-secondary-fixed-dim", initials: "AS" },
    { bg: "bg-secondary-container", initials: "RK" },
    { bg: "bg-primary-fixed-dim", initials: "MP" },
    { bg: "bg-secondary-fixed", initials: "SV" },
    { bg: "bg-secondary/70", initials: "NJ" },
  ];

  return (
    <section className="hero-gradient pt-48 pb-32 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-16 items-center">
        {/* LEFT */}
        <div className="max-w-[560px]">
          <motion.div
            {...fadeDown(0.1)}
            className="inline-flex items-center gap-2 bg-secondary-fixed/20 border border-secondary/30 text-secondary-fixed-dim px-4 py-2 rounded-full text-sm font-semibold"
          >
            <span className="w-2 h-2 bg-success-emerald rounded-full animate-pulse" />
            New: Hindi Voice Models v2.0
          </motion.div>

          <motion.h1
            {...fadeUp(0.2)}
            className="text-[48px] font-bold leading-[56px] tracking-tight text-white max-w-[500px] mt-6"
          >
            Give your business a{" "}
            <span
              style={{
                background: "linear-gradient(90deg,#d2bbff,#8a4cfc)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              voice
            </span>{" "}
            that converts.
          </motion.h1>

          <motion.p
            {...fadeUp(0.3)}
            className="text-on-primary-container text-lg leading-relaxed max-w-[440px] mt-6"
          >
            Deploy intelligent AI voice agents that speak natural Hindi, Telugu,
            and 20+ Indian languages — no code required.
          </motion.p>

          <motion.div {...fadeUp(0.4)} className="flex flex-wrap gap-4 mt-10">
            <Link
              to="/signup"
              className="bg-secondary text-white px-8 py-3.5 rounded-lg font-semibold hover:opacity-90 active:scale-95 transition shadow-[0_8px_24px_rgba(113,42,226,0.4)] inline-flex items-center gap-2"
            >
              Start Free Trial
              <Icon name="arrow_forward" className="text-[20px]" />
            </Link>
            <button className="gradient-border-btn text-white px-8 py-3.5 rounded-lg font-semibold inline-flex items-center gap-2 hover:opacity-90 transition">
              <Icon name="play_circle" className="text-[20px]" />
              Book a Demo
            </button>
          </motion.div>

          <motion.div
            {...fadeUp(0.5)}
            className="mt-10 flex items-center gap-3"
          >
            <div className="flex -space-x-3">
              {avatars.map((a, i) => (
                <div
                  key={i}
                  className={`w-10 h-10 rounded-full border-2 border-primary-container ${a.bg} flex items-center justify-center text-xs font-bold text-primary`}
                >
                  {a.initials}
                </div>
              ))}
            </div>
            <span className="text-on-primary-container text-sm">
              Trusted by 500+ Indian Enterprises
            </span>
          </motion.div>
        </div>

        {/* RIGHT */}
        <div className="relative flex items-center justify-center">
          <div className="absolute w-[400px] h-[400px] bg-secondary/30 rounded-full blur-[80px] -z-10 animate-pulse" />
          <div className="rounded-2xl overflow-hidden border border-white/10 shadow-[0_32px_80px_rgba(0,0,0,0.4)] animate-float w-full max-w-[520px] bg-primary-container p-5">
            {/* mock dashboard */}
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
              <span className="ml-3 text-xs text-on-primary-container">
                vani.ai / dashboard
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { label: "Active Calls", value: "1,284" },
                { label: "Avg. CSAT", value: "4.8 / 5" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="bg-white rounded-lg p-3 shadow-sm"
                >
                  <p className="text-[11px] text-on-surface-variant">
                    {s.label}
                  </p>
                  <p className="text-primary font-bold text-lg mt-1">
                    {s.value}
                  </p>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-lg p-4 mb-4">
              <p className="text-[11px] font-semibold text-on-surface-variant mb-3">
                CALL VOLUME
              </p>
              <div className="flex items-end gap-2 h-20">
                {[40, 65, 50, 80, 60, 95, 75].map((h, i) => (
                  <div
                    key={i}
                    style={{ height: `${h}%` }}
                    className="flex-1 bg-secondary rounded-t-sm"
                  />
                ))}
              </div>
            </div>
            <div className="bg-white rounded-lg p-3">
              {["Aarav S.", "Priya M.", "Rohan K."].map((n, i) => (
                <div
                  key={n}
                  className={`flex items-center justify-between py-2 text-xs ${
                    i < 2 ? "border-b border-border-subtle" : ""
                  }`}
                >
                  <span className="font-medium text-primary">{n}</span>
                  <span className="text-success-emerald font-semibold">
                    Resolved
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- TRUSTED BY ---------------- */
function TrustedBy() {
  const brands = [
    "RELIANCE",
    "TATA GROUP",
    "INFOSYS",
    "WIPRO",
    "HDFC BANK",
    "ZOMATO",
  ];
  return (
    <section className="bg-surface-container-low border-y border-border-subtle py-10">
      <p className="text-center text-xs font-semibold tracking-[0.2em] text-outline uppercase mb-8">
        Empowering India's Fastest Growing Enterprises
      </p>
      <div className="flex justify-center gap-12 flex-wrap px-4">
        {brands.map((b) => (
          <span
            key={b}
            className="text-lg font-bold text-outline/40 hover:text-outline/80 transition-colors cursor-default grayscale"
          >
            {b}
          </span>
        ))}
      </div>
    </section>
  );
}

/* ---------------- FEATURES ---------------- */
function Features() {
  const items = [
    {
      icon: "record_voice_over",
      title: "Realistic Hindi Voice",
      body: "Sarvam Bulbul TTS delivers human-level naturalism in Hindi, Telugu, and 10+ Indian languages with sub-300ms latency.",
    },
    {
      icon: "call",
      title: "50+ Concurrent Calls",
      body: "Handle 50 simultaneous calls per agent with Redis-backed queuing and auto-scale infrastructure on Indian edge servers.",
    },
    {
      icon: "translate",
      title: "20+ Languages",
      body: "From Hindi to Kannada, Punjabi to Bengali — every agent supports Hinglish code-switching natively.",
    },
  ];
  return (
    <section className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center">
          <h2 className="text-primary font-bold text-[32px] leading-tight">
            Built for the Indian Enterprise
          </h2>
          <p className="text-on-surface-variant text-lg mt-4 max-w-[500px] mx-auto">
            Production-ready voice infrastructure designed and tuned for India's
            languages, accents, and scale.
          </p>
        </div>
        <div className="mt-16 grid md:grid-cols-3 gap-6">
          {items.map((it) => (
            <div
              key={it.title}
              className="bg-white border border-border-subtle rounded-2xl p-8 hover:border-secondary/30 hover:shadow-lg transition-all duration-300 group cursor-pointer"
            >
              <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-secondary/20 transition-colors">
                <Icon name={it.icon} className="text-secondary text-[24px]" />
              </div>
              <h3 className="text-primary font-semibold text-xl mb-3">
                {it.title}
              </h3>
              <p className="text-on-surface-variant text-base leading-relaxed">
                {it.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- BENTO ---------------- */
function Bento() {
  const bars = [40, 60, 80, 100, 70, 90, 110];
  return (
    <section className="bg-surface-container-low py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center">
          <h2 className="text-primary font-bold text-[32px] leading-tight">
            Enterprise-grade infrastructure
          </h2>
          <p className="text-on-surface-variant text-lg mt-4 max-w-[500px] mx-auto">
            Built on India-first edge networks with the security and reliability
            your enterprise demands.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-2 gap-4 max-w-[900px] mx-auto">
          {/* Card A */}
          <div className="col-span-2 md:col-span-1 md:row-span-2 bg-primary text-white rounded-2xl p-8 overflow-hidden relative min-h-[340px]">
            <Icon
              name="insights"
              className="absolute top-4 right-4 text-[80px] text-white/5"
            />
            <h3 className="font-bold text-2xl">Advanced Analytics</h3>
            <p className="text-on-primary-container mt-3 max-w-[280px]">
              Real-time dashboards for call volume, sentiment trends, and agent
              performance.
            </p>
            <div className="absolute bottom-8 left-8 right-8 flex gap-2 items-end">
              {bars.map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${h}px` }}
                  className="flex-1 bg-secondary-fixed-dim/30 rounded-t-sm hover:scale-y-110 origin-bottom transition-transform"
                />
              ))}
            </div>
          </div>

          {/* Card B */}
          <div className="col-span-2 md:col-span-1 group bg-secondary text-white rounded-2xl p-8 relative overflow-hidden min-h-[160px]">
            <Icon
              name="speed"
              className="absolute bottom-4 right-4 text-[64px] text-white/10 group-hover:rotate-12 transition-transform"
            />
            <p className="text-[32px] font-bold leading-none">{"< 1 Second"}</p>
            <p className="text-sm font-semibold tracking-widest opacity-70 mt-2">
              ZERO LATENCY
            </p>
            <p className="text-base mt-2 opacity-80">
              Mumbai edge deployment
            </p>
          </div>

          {/* Card C */}
          <div className="bg-white border border-border-subtle rounded-2xl p-6">
            <Icon name="security" className="text-secondary text-[28px]" />
            <p className="font-semibold text-primary mt-3">SOC-2 Type II</p>
            <p className="text-sm text-on-surface-variant mt-1">
              Enterprise data security with end-to-end encryption.
            </p>
          </div>

          {/* Card D */}
          <div className="bg-white border border-border-subtle rounded-2xl p-6">
            <Icon name="hub" className="text-secondary text-[28px]" />
            <p className="font-semibold text-primary mt-3">CRM Connect</p>
            <p className="text-sm text-on-surface-variant mt-1">
              Native integrations with Salesforce, Zoho, and Freshdesk.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- CTA BANNER ---------------- */
function CtaBanner() {
  return (
    <section className="hero-gradient py-24 text-center px-4">
      <h2 className="text-white font-bold text-[40px] leading-tight max-w-[560px] mx-auto">
        Ready to transform your customer calls?
      </h2>
      <p className="text-on-primary-container text-lg mt-4 max-w-[520px] mx-auto">
        Join 500+ enterprises automating support, sales, and outreach with Vani
        AI.
      </p>
      <div className="flex flex-wrap gap-4 mt-10 justify-center">
        <Link
          to="/signup"
          className="bg-secondary text-white px-8 py-3.5 rounded-lg font-semibold hover:opacity-90 active:scale-95 transition shadow-[0_8px_24px_rgba(113,42,226,0.4)] inline-flex items-center gap-2"
        >
          Get Started Free
          <Icon name="arrow_forward" className="text-[20px]" />
        </Link>
        <button className="gradient-border-btn text-white px-8 py-3.5 rounded-lg font-semibold hover:opacity-90 transition">
          Talk to Sales
        </button>
      </div>
    </section>
  );
}

/* ---------------- FOOTER ---------------- */
function Footer() {
  const company = ["About", "Careers", "Blog", "Press"];
  const support = [
    "Documentation",
    "Help Center",
    "Privacy Policy",
    "Terms of Service",
  ];
  return (
    <footer className="bg-white border-t border-border-subtle py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row justify-between items-start gap-10">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
              <Icon
                name="graphic_eq"
                filled
                className="text-white text-[22px]"
              />
            </div>
            <span className="font-bold text-primary text-lg">Vani AI</span>
          </div>
          <p className="text-on-surface-variant text-sm mt-2">
            © 2024 Vani AI. All rights reserved.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-12">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-outline mb-3">
              Company
            </h4>
            <ul className="space-y-2">
              {company.map((l) => (
                <li key={l}>
                  <a
                    href="#"
                    className="text-sm text-on-surface-variant hover:text-secondary transition-colors"
                  >
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-outline mb-3">
              Support
            </h4>
            <ul className="space-y-2">
              {support.map((l) => (
                <li key={l}>
                  <a
                    href="#"
                    className="text-sm text-on-surface-variant hover:text-secondary transition-colors"
                  >
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
