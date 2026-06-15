// Combined design-system head injection for all Vani AI pages.
// Tailwind CDN + brand config + custom per-page styles.

export const VANI_TW_CONFIG = `tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "on-tertiary-fixed": "#1b1a29",
        "on-background": "#1a1b21",
        "secondary-container": "#8a4cfc",
        "on-secondary": "#ffffff",
        "on-primary": "#ffffff",
        "surface-container-lowest": "#ffffff",
        "surface-container-high": "#e8e7ef",
        "on-surface": "#1a1b21",
        "primary-container": "#1e1b4b",
        "outline-variant": "#c8c5d0",
        "background": "#faf8ff",
        "border-subtle": "#E5E7EB",
        "on-error": "#ffffff",
        "secondary-fixed-dim": "#d2bbff",
        "inverse-on-surface": "#f1f0f8",
        "surface-container-highest": "#e2e2e9",
        "tertiary-container": "#21202f",
        "on-tertiary-container": "#898799",
        "tertiary": "#0a0917",
        "surface-bright": "#faf8ff",
        "surface-container-low": "#f4f3fb",
        "surface-white": "#FFFFFF",
        "secondary": "#712ae2",
        "on-tertiary": "#ffffff",
        "on-secondary-fixed-variant": "#5a00c6",
        "outline": "#787680",
        "surface-tint": "#5b598c",
        "on-surface-variant": "#47464f",
        "surface-container": "#eeedf5",
        "on-secondary-fixed": "#25005a",
        "on-primary-fixed": "#181445",
        "surface-dim": "#dad9e1",
        "inverse-surface": "#2f3036",
        "surface": "#faf8ff",
        "tertiary-fixed": "#e4e0f5",
        "surface-variant": "#e2e2e9",
        "on-primary-fixed-variant": "#444173",
        "inverse-primary": "#c4c1fb",
        "text-muted": "#6B7280",
        "primary-fixed-dim": "#c4c1fb",
        "secondary-fixed": "#eaddff",
        "error-container": "#ffdad6",
        "on-error-container": "#93000a",
        "primary-fixed": "#e3dfff",
        "error": "#ba1a1a",
        "tertiary-fixed-dim": "#c7c4d8",
        "success-emerald": "#059669",
        "primary": "#070235",
        "on-primary-container": "#8683ba",
        "on-tertiary-fixed-variant": "#464555",
        "on-secondary-container": "#fffbff"
      },
      borderRadius: { DEFAULT: "0.25rem", lg: "0.5rem", xl: "0.75rem", full: "9999px" },
      spacing: { md: "16px", lg: "24px", gutter: "24px", base: "8px", xl: "32px", sm: "12px", "container-max": "1280px", xs: "4px" },
      fontFamily: {
        "headline-lg": ["Inter"], "label-sm": ["Inter"], "headline-md": ["Inter"], "label-md": ["Inter"],
        "display-lg": ["Inter"], "body-md": ["Inter"], "headline-lg-mobile": ["Inter"], "body-sm": ["Inter"], "body-lg": ["Inter"]
      },
      fontSize: {
        "headline-lg": ["32px", {"lineHeight": "40px", "letterSpacing": "-0.02em", "fontWeight": "700"}],
        "label-sm": ["12px", {"lineHeight": "16px", "letterSpacing": "0.05em", "fontWeight": "600"}],
        "headline-md": ["24px", {"lineHeight": "32px", "fontWeight": "600"}],
        "label-md": ["14px", {"lineHeight": "20px", "fontWeight": "500"}],
        "display-lg": ["48px", {"lineHeight": "56px", "letterSpacing": "-0.02em", "fontWeight": "700"}],
        "body-md": ["16px", {"lineHeight": "24px", "fontWeight": "400"}],
        "headline-lg-mobile": ["24px", {"lineHeight": "32px", "fontWeight": "700"}],
        "body-sm": ["14px", {"lineHeight": "20px", "fontWeight": "400"}],
        "body-lg": ["18px", {"lineHeight": "28px", "fontWeight": "400"}]
      }
    }
  }
}`;

export const VANI_GLOBAL_CSS = `
body { font-family: 'Inter', sans-serif; -webkit-font-smoothing: antialiased; -webkit-tap-highlight-color: transparent; }
.material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
.glass-card { background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.1); }
.hero-gradient { background: radial-gradient(circle at 50% 0%, #1e1b4b 0%, #070235 100%); }
.gradient-border-btn { position: relative; background: linear-gradient(#070235, #070235) padding-box, linear-gradient(to right, #712ae2, #8a4cfc) border-box; border: 2px solid transparent; }
@keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
.animate-float { animation: float 6s ease-in-out infinite; }
.auth-card { box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03); border: 1px solid #E5E7EB; }
.input-focus-custom:focus { outline: none; border-color: #7C3AED; box-shadow: 0 0 0 3px rgba(124,58,237,0.2); }
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 24px; }
.step-line { position: relative; }
.step-line::after { content:''; position:absolute; top:50%; left:100%; width:100%; height:2px; background:#E5E7EB; transform:translateY(-50%); z-index:0; }
.step-line:last-child::after { display:none; }
.bento-card { transition: all 0.3s cubic-bezier(0.4,0,0.2,1); }
.bento-card:hover { transform: translateY(-2px); }
.text-gradient { background: linear-gradient(135deg, #d2bbff 0%, #8a4cfc 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.focus-ring:focus-within { box-shadow: 0 0 0 3px rgba(113,42,226,0.2); }
.linear-shadow { box-shadow: 0px 4px 12px rgba(30,27,75,0.05); }
.active-tab .material-symbols-outlined { font-variation-settings: 'FILL' 1; }
.scroll-hide::-webkit-scrollbar { display: none; }
.scroll-hide { -ms-overflow-style: none; scrollbar-width: none; }
.step-transition { transition: all 0.3s cubic-bezier(0.4,0,0.2,1); }
.active-ring { animation: pulse-ring 2s cubic-bezier(0.4,0,0.6,1) infinite; }
@keyframes pulse-ring { 0%,100% { opacity: 0.2; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.05); } }
.shimmer-text { background: linear-gradient(90deg,#ffffff 0%,#8a4cfc 50%,#ffffff 100%); background-size: 200% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent; animation: shimmer 3s linear infinite; }
@keyframes shimmer { to { background-position: 200% center; } }
`;
