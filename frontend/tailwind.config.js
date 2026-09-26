/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // ── Core brand — blue replacing all purple ─────────────────────────
        "primary":                    "#1a56db",   // was #630ed4 (purple) → blue
        "on-primary":                 "#ffffff",
        "primary-container":          "#1d4ed8",   // was #7c3aed → blue-700
        "on-primary-container":       "#dbeafe",   // was #ede0ff → blue-100
        "primary-fixed":              "#dbeafe",   // was #eaddff → blue-100
        "primary-fixed-dim":          "#93c5fd",   // was #d2bbff → blue-300
        "on-primary-fixed":           "#1e3a5f",   // was #25005a → deep blue
        "on-primary-fixed-variant":   "#1d4ed8",   // was #5a00c6 → blue-700
        "inverse-primary":            "#93c5fd",   // was #d2bbff → blue-300

        // ── Secondary — indigo replacing violet ────────────────────────────
        "secondary":                  "#3b5bdb",   // was #4648d4 → indigo-600
        "on-secondary":               "#ffffff",
        "secondary-container":        "#4263eb",   // was #6063ee → indigo-500
        "on-secondary-container":     "#ffffff",
        "secondary-fixed":            "#e0e7ff",   // was #e1e0ff → indigo-100
        "secondary-fixed-dim":        "#a5b4fc",   // was #c0c1ff → indigo-300
        "on-secondary-fixed":         "#1e2f6b",   // was #07006c → deep indigo
        "on-secondary-fixed-variant": "#1e3a8a",   // was #2f2ebe → blue-900

        // ── Tertiary — teal/cyan unchanged (already good) ──────────────────
        "tertiary":                   "#0e7490",
        "on-tertiary":                "#ffffff",
        "tertiary-container":         "#0e7490",
        "on-tertiary-container":      "#cffafe",
        "tertiary-fixed":             "#a5f3fc",
        "tertiary-fixed-dim":         "#22d3ee",
        "on-tertiary-fixed":          "#083344",
        "on-tertiary-fixed-variant":  "#155e75",

        // ── Error — unchanged ──────────────────────────────────────────────
        "error":                      "#ba1a1a",
        "on-error":                   "#ffffff",
        "error-container":            "#ffdad6",
        "on-error-container":         "#93000a",

        // ── Surfaces — blue-tinted neutrals ───────────────────────────────
        "background":                 "#f8faff",   // was #faf8ff
        "surface":                    "#f8faff",
        "surface-bright":             "#f8faff",
        "surface-dim":                "#d0d9f0",   // was #d2d9f4
        "surface-variant":            "#d8e3fc",   // was #dae2fd
        "surface-tint":               "#1a56db",   // was #732ee4

        "surface-container-lowest":   "#ffffff",
        "surface-container-low":      "#eef3ff",   // was #f2f3ff
        "surface-container":          "#e4ecff",   // was #eaedff
        "surface-container-high":     "#dbe6ff",   // was #e2e7ff
        "surface-container-highest":  "#d3dfff",   // was #dae2fd
        "inverse-surface":            "#1e293b",

        // ── Text & outlines ────────────────────────────────────────────────
        "on-surface":                 "#0f172a",   // was #131b2e → slate-900
        "on-surface-variant":         "#475569",   // was #4a4455 → slate-600
        "on-background":              "#0f172a",
        "inverse-on-surface":         "#eef3ff",
        "outline":                    "#64748b",   // was #7b7487 → slate-500
        "outline-variant":            "#cbd5e1",   // was #ccc3d8 → slate-300
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        sm: "0.25rem",
        md: "0.75rem",
        lg: "1rem",
        xl: "1.5rem",
        full: "9999px",
      },
      spacing: {
        "space-xs": "0.25rem",
        "space-sm": "0.5rem",
        "space-md": "1rem",
        "space-lg": "1.5rem",
        "space-xl": "2.5rem",
        "gutter": "1rem",
        "gutter-desktop": "1.5rem",
        "margin": "1rem",
        "margin-desktop": "2rem",
      },
      fontFamily: {
        "body-lg":           ["Inter", "sans-serif"],
        "body-md":           ["Inter", "sans-serif"],
        "body-sm":           ["Inter", "sans-serif"],
        "headline-xl":       ["Inter", "sans-serif"],
        "headline-xl-mobile":["Inter", "sans-serif"],
        "headline-lg":       ["Inter", "sans-serif"],
        "headline-md":       ["Inter", "sans-serif"],
        "label-md":          ["Inter", "sans-serif"],
        "code-md":           ["JetBrains Mono", "monospace"],
        "code-sm":           ["JetBrains Mono", "monospace"],
      },
      fontSize: {
        "body-lg":  ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "body-md":  ["14px", { lineHeight: "20px", fontWeight: "400" }],
        "body-sm":  ["12px", { lineHeight: "16px", fontWeight: "400" }],
        "headline-xl":       ["36px", { lineHeight: "44px", letterSpacing: "-0.025em", fontWeight: "700" }],
        "headline-xl-mobile":["28px", { lineHeight: "36px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "headline-lg":       ["28px", { lineHeight: "36px", letterSpacing: "-0.02em", fontWeight: "600" }],
        "headline-md":       ["20px", { lineHeight: "28px", letterSpacing: "-0.015em", fontWeight: "600" }],
        "label-md":  ["12px", { lineHeight: "16px", fontWeight: "500" }],
        "code-md":   ["13px", { lineHeight: "20px", fontWeight: "400" }],
        "code-sm":   ["11px", { lineHeight: "16px", fontWeight: "500" }],
      },
      keyframes: {
        ping: {
          "75%, 100%": { transform: "scale(2)", opacity: "0" },
        },
        spin: {
          to: { transform: "rotate(360deg)" },
        },
        bounce: {
          "0%, 100%": { transform: "translateY(-25%)", animationTimingFunction: "cubic-bezier(0.8,0,1,1)" },
          "50%":       { transform: "none", animationTimingFunction: "cubic-bezier(0,0,0.2,1)" },
        },
        pulse: {
          "50%": { opacity: ".5" },
        },
      },
    },
  },
  plugins: [],
}
