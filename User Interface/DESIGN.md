---
name: Autonomous OSS Copilot
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#4a4455'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#7b7487'
  outline-variant: '#ccc3d8'
  surface-tint: '#732ee4'
  primary: '#630ed4'
  on-primary: '#ffffff'
  primary-container: '#7c3aed'
  on-primary-container: '#ede0ff'
  inverse-primary: '#d2bbff'
  secondary: '#4648d4'
  on-secondary: '#ffffff'
  secondary-container: '#6063ee'
  on-secondary-container: '#fffbff'
  tertiary: '#005766'
  on-tertiary: '#ffffff'
  tertiary-container: '#007184'
  on-tertiary-container: '#b7efff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#eaddff'
  primary-fixed-dim: '#d2bbff'
  on-primary-fixed: '#25005a'
  on-primary-fixed-variant: '#5a00c6'
  secondary-fixed: '#e1e0ff'
  secondary-fixed-dim: '#c0c1ff'
  on-secondary-fixed: '#07006c'
  on-secondary-fixed-variant: '#2f2ebe'
  tertiary-fixed: '#acedff'
  tertiary-fixed-dim: '#4cd7f6'
  on-tertiary-fixed: '#001f26'
  on-tertiary-fixed-variant: '#004e5c'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.025em
  headline-xl-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.015em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  code-md:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  code-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-desktop: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system embodies the focus, precision, and ambient intelligence of a next-generation open-source copilot. It merges developer-centric utility with an approachable conversational interface. The emotional tone is capable, calm, transparent, and encouraging—erasing the friction and intimidation typically associated with open-source onboarding.

The aesthetic blends **Modern Tech Minimalism** with delicate **Glassmorphism and Tonal Layering**. It leverages pure white operational canvases over soft lavender atmosphere backdrops, punctuated by precise violet accents. The design communicates real-time intelligence through distinct multi-agent statuses, crisp monospaced telemetry, and lightweight, high-legibility cards.

## Colors

The palette revolves around a calm, multi-layered lavender canvas punctuated by high-clarity violet actions and targeted agent colorways:

- **Canvas & Backgrounds**: Base background sits on `#faf5ff` (Lavender 50), stepping to `#f5f3ff` (Lavender 100) for recessed sidebars and code canvas wells. Active foreground panels, elevated cards, and message containers rest on pure `#ffffff`.
- **Primary & Secondary Accents**: `#7c3aed` (Violet 600) drives key CTA buttons, interactive focus rings, and primary execution paths. `#6366f1` (Indigo 500) serves as an assistive bridge for conversational threads, automated agent prompts, and flow links.
- **Neutrals & Text**: Foreground typography uses `#0f172a` (Slate 900) for headlines and high-emphasis body, `#475569` (Slate 600) for secondary metadata, and `#94a3b8` (Slate 400) for subtle placeholders and disabled states. Borders utilize `#e9d5ff` (Lavender 200) for structural bounding lines and `#f3e8ff` for delicate surface divisions.
- **Multi-Agent Badges & States**:
  - *Manager Agent*: `#7c3aed` (Deep Violet) — orchestrator state.
  - *Discovery Agent*: `#6366f1` (Electric Indigo) — repository crawling and vector search.
  - *Repo Health Agent*: `#10b981` (Emerald) — CI metrics, commit velocity, and bus-factor analysis.
  - *Issue Matching Agent*: `#f59e0b` (Amber) — issue triage and skill-level compatibility.
  - *Onboarding Agent*: `#06b6d4` (Cyan) — dev setup, local environment check, and PR templates.

## Typography

The type system is balanced between high-speed reading comprehension and dense developer tooling:

- **Inter** handles UI controls, natural conversational dialog, and navigational chrome. Tight tracking (`-0.02em`) on display headlines provides punch, while regular tracking across body sizes maintains readability in multi-column issue inspectors.
- **JetBrains Mono** governs technical readouts: git commit SHAs, CLI prompts, package manifests, agent execution logs, and runtime telemetry. Monospaced styling is enforced inside agent identity tags to reinforce systemic precision.

## Layout & Spacing

The layout model uses a responsive fluid grid optimized for dual-mode copilot interactions:

- **Structure**: A persistent 3-column split view on desktop screens (Agent Orchestration Sidebar: 280px fixed; Central Copilot Dialogue: min 540px fluid; Contextual Code/Issue Inspector: 420px fixed).
- **Responsive Adaptations**:
  - *Desktop (≥1200px)*: Full 3-column workflow; canvas margin is 32px (`margin-desktop`) with 24px column gutters (`gutter-desktop`).
  - *Tablet (768px - 1199px)*: Sidebar collapses to an icon rail; central copilot conversation and inspector split 60/40.
  - *Mobile (<768px)*: Single-column stack with bottom floating agent command sheet; margins scale down to 16px (`margin`).
- **Internal Component Spacing**: All internal components observe an 8pt spatial grid, relying on `space-xs` (4px) for inline status icon spacing, `space-sm` (8px) for badge and input padding, and `space-md` (16px) for interior card structures.

## Elevation & Depth

Visual depth is achieved through delicate violet-tinted atmospheric diffusion, preventing sterile gray drop-shadows:

- **Level 0 (Flat)**: Recessed surfaces (`#f5f3ff`) such as telemetry panels, shell consoles, and unselected filter tags, bounded by 1px solid `#e9d5ff`.
- **Level 1 (Surface)**: Floating white workspace cards (`#ffffff`). Shadow: `0 1px 3px rgba(124, 58, 237, 0.04), 0 1px 2px rgba(15, 23, 42, 0.05)`, rimmed with a 1px border of `#f3e8ff`.
- **Level 2 (Interactive Floating)**: Hovered issue cards and copilot response bubbles. Shadow: `0 8px 24px -4px rgba(124, 58, 237, 0.08), 0 2px 6px rgba(15, 23, 42, 0.04)`.
- **Level 3 (Overlay / Popover)**: Multi-agent switcher menus and modal setup dialogues. Background: `rgba(255, 255, 255, 0.92)` with `backdrop-filter: blur(12px)`. Shadow: `0 20px 32px -8px rgba(124, 58, 237, 0.12), 0 4px 12px rgba(15, 23, 42, 0.06)`.

## Shapes

The interface employs a balanced curvature profile (`roundedness: 2`):

- Standard interactive controls (input fields, buttons, agent pills) maintain a default corner radius of `8px` (`0.5rem`).
- Cards, chat message envelopes, and telemetry display windows feature `16px` (`1rem`) corner radii (`rounded-lg`).
- Floating copilot command bars and multi-agent chip pills adopt full capsule borders (`9999px`) to distinguish conversational controls from structured issue metadata.

## Components

- **Agent Badges & Indicators**:
  - Compact capsules combining a 6px status LED, agent title in `code-sm`, and an optional heartbeat pulse indicator.
  - Colors: Subtle tinted background (10% opacity) matching the agent hue, a 1px border (25% opacity), and bold monospaced colored text (e.g., Discovery Agent: `#eef2ff` fill, `#6366f1` text).
- **Buttons**:
  - *Primary*: Solid `#7c3aed` with white text, crisp 0.5rem radius, and a subtle lavender glow on hover (`0 4px 14px rgba(124, 58, 237, 0.35)`).
  - *Secondary / Outline*: White background with `#e9d5ff` border, `#0f172a` text, shifting to `#f5f3ff` background on hover.
  - *Ghost / Agent Tool*: `#f5f3ff` base with `#6366f1` icon, zero border.
- **Issue & Repository Cards**:
  - Pure `#ffffff` background with 1px `#f3e8ff` border.
  - Header displays repository avatar, full path in `code-md`, and dynamic compatibility percentage score badge.
  - Body contains issue synopsis, required skill tags, and the recommending agent's signature note.
- **Copilot Message Bubbles**:
  - *User Message*: Clean white surface with subtle right-aligned violet highlight border (`2px solid #7c3aed`).
  - *Agent Response*: Edge-to-edge transparent layout with an avatar pillar, structured markdown body, inline code chips in `#f5f3ff`, and collapsible agent trace accordions showing step-by-step reasoning.
- **Input Fields & Command Bar**:
  - Floating prompt bar at screen bottom: `#ffffff` capsule, border 1px solid `#e9d5ff`, elevation Level 2, with integrated agent tag selector and monospaced shortcut hint (`⌘K`).
- **Telemetry & Agent Logs**:
  - Fixed-height panel with `#f5f3ff` background, 1px `#e9d5ff` border, featuring syntax-highlighted streaming text in `JetBrains Mono` (`code-sm`) and agent status filters.