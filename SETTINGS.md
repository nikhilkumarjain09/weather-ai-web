# SETTINGS.md — WeatherAI Assessment Project

## Goal

A clean, complete integration of WeatherAI's real API endpoints, styled to match WeatherAI's own developer dashboard (sidebar with sectioned nav, teal-accented dark chrome, stat cards, top bar with notifications and profile menu). Every feature in this app maps to an actual endpoint WeatherAI exposes — no invented backend systems, no simulated auth, no fabricated logging dashboards. Multi-location tracking, historical trends (client-side, honestly labeled), and a plan-aware alerts feature (their real webhooks endpoint), tests, CI, and a repo that looks maintained.

Product name (placeholder, rename freely): **Aeris**.

## Stack

- Next.js 15 (App Router), TypeScript strict mode
- Tailwind CSS (utility-first, no CSS-in-JS)
- lucide-react — the only icon set used anywhere in the app. No emojis, ever, in UI copy, code comments, commit messages, or README. Where the reference design uses an emoji (e.g. a wave in the greeting), substitute a lucide icon instead (e.g. `Sun` or `Sunrise` depending on time of day).
- Zustand for client state (saved locations, unit preference, active theme, comparison selection, optional display name for personalization) — persisted to `localStorage` where relevant
- Vitest + React Testing Library for unit/component tests
- Playwright for a small e2e smoke suite
- GitHub Actions for CI (lint, typecheck, test on every push)
- Deployment target: Vercel (env vars for `WEATHERAI_KEY`, never exposed client-side)
- Caching: a small in-memory Map with TTL, used only inside the Next.js route handlers to avoid redundant calls to WeatherAI within a short window. No external cache service — this stays a single, simple file, not a "system."

## Design direction: "WeatherAI Platform Native"

Match the reference screenshot's dashboard chrome closely: dark, teal-accented, data-forward, generous card spacing, sectioned sidebar navigation, top bar with brand mark + notifications + profile menu. Reject: gradient hero banners, cheerful marketing copy, decorative animation, emoji anywhere in the UI itself.

### Color tokens — Dark theme (default)

| Token | Hex | Usage |
|---|---|---|
| `bg` | `#0A0E16` | App background |
| `sidebar-bg` | `#0D1220` | Sidebar, top bar — separated from main content by `border` |
| `surface` | `#121826` | Cards, panels, modals, dropdowns |
| `surface-raised` | `#1A2233` | Hover/active states on surface |
| `border` | `#212B3D` | Hairline dividers and card borders |
| `text-primary` | `#F1F5F9` | Headings, primary data values |
| `text-muted` | `#8B95A7` | Labels, captions, secondary text |
| `accent` | `#2DD4BF` | Brand teal — logo, active nav item, links, primary buttons, plan badges |
| `accent-tint` | `rgba(45,212,191,0.12)` | Active nav item background, teal badge backgrounds |
| `warning` | `#F59E0B` | Alert-risk flags, quota warnings |
| `success` | `#34D399` | Healthy quota, success states |
| `danger` | `#F87171` | Errors, quota exhausted, 4xx/5xx |

### Color tokens — Light theme

| Token | Hex |
|---|---|
| `bg` | `#F7F9FC` |
| `sidebar-bg` | `#FFFFFF` |
| `surface` | `#FFFFFF` |
| `surface-raised` | `#F1F5F9` |
| `border` | `#E2E8F0` |
| `text-primary` | `#0F172A` |
| `text-muted` | `#64748B` |
| `accent` / `accent-tint` / `warning` / `success` / `danger` | same hues as dark theme, tuned for contrast on white |

Themes are implemented as CSS variables swapped at the root, not duplicated component logic. Three options exposed to the user: **Dark**, **Light**, **System** (follows OS preference via `prefers-color-scheme`).

### Typography

- Display / headings: **Space Grotesk**, restrained sizes (greeting header ≈ 24–28px, not oversized)
- Body: **Inter** — all UI copy, labels, nav items
- Data / numeric: **JetBrains Mono**, tabular-nums — every stat-card number, temperature, coordinate, percentage, and timestamp.

### Layout — chrome

**Top bar** (fixed, `sidebar-bg`, bottom border): brand mark (teal gradient square icon + "Aeris" + small muted tagline) on the left; on the right, a notification bell (`Bell` icon, teal dot badge when unread items exist — populated only by real events like a triggered weather alert or an approaching quota limit from `/v1/usage`) opening a dropdown list, and a profile control (avatar circle with initial, optional display name, chevron) opening the profile dropdown menu.

There is no login/authentication system in this app — it calls WeatherAI with a server-side API key on the user's behalf, there's no concept of a signed-in account. The avatar/name is purely a cosmetic personalization touch: an optional display name set once in the Settings modal (defaults to a generic label like "there" if unset), not a sign-in flow. Do not build a name-prompt gate, sign-out flow, or any session concept.

**Profile dropdown menu** (opens from the top-bar profile control):
- Theme — segmented control or submenu: Dark / Light / System
- Units — quick shortcut to metric/imperial (mirrors the main unit toggle)
- Keyboard shortcuts — opens the shortcuts modal
- API docs — external link to weather-ai.co/docs
- Settings — opens a settings modal (display name, default location, unit preference)

**Sidebar** (fixed left, `sidebar-bg`, collapses to icon-only on tablet and a bottom tab bar on mobile), grouped like the reference screenshot's section pattern:
- **OVERVIEW** — Dashboard (current conditions + forecast), Trends (historical chart), Comparison (multi-location grid)
- **LOCATIONS** — Saved Locations (list + search entry point)
- **CONFIGURATION** — Alerts & Webhooks (real `/v1/webhooks` endpoint, Pro-gated — shows a locked badge on a Free plan key rather than being hidden)
- **ACCOUNT** — Profile (opens Settings), Usage & Quota (real `/v1/usage` endpoint)

Active nav item: `accent-tint` background, `accent` text.

**Main content**: greeting header ("Good [morning/afternoon/evening][, name]" with a lucide sun/moon icon instead of an emoji wave, plus current date), a row of stat cards, then the relevant panel per sidebar section below.

### Stat cards

Match the reference exactly: uppercase small muted label top-left, small icon in a muted circular badge top-right, large bold mono number below, short muted caption underneath. Every number here must come from a real WeatherAI response field — no fabricated metrics:
- **Current Temp** (`Thermometer` icon) — from `/v1/weather`
- **Feels Like** (`Wind` icon) — from `/v1/weather`
- **Humidity** (`Droplet` icon) — from `/v1/weather`
- **Monthly Quota** (`Package` icon) — used/limit, from `/v1/usage`

### Cards, badges, buttons

- Cards: 1px `border`, 10px radius, `surface` background, no drop shadow
- Plan badge ("FREE PLAN" style): small pill, `accent-tint` background, `accent` text, uppercase, bold, small tracking — reflects the real plan tier returned by `/v1/usage`
- Buttons: bordered secondary style for low-emphasis actions; solid `accent` fill only for the single primary action per view
- Time-range pills (7d / 30d / 90d style) on the historical trend chart: segmented pill group, active segment gets `accent-tint` background + `accent` text

### Motion

No decorative animation. Allowed: 150ms fade/slide on new data, skeleton pulse during per-action loading, dropdown/modal open transitions, toast slide-in/out, notification bell dot pulse once on a new real alert. Respect `prefers-reduced-motion` everywhere.

## Icons

lucide-react only, consistent sizing (18px inline / 20px buttons / 24px section headers). Semantic mapping:
- Conditions: `Sun`, `CloudSun`, `Cloud`, `CloudRain`, `CloudLightning`, `CloudSnow`, `Wind`
- Chrome: `Bell` (notifications), `ChevronDown` (dropdown affordances), `Palette` (theme menu item), `Settings`, `Keyboard`, `BookOpen` (API docs link)
- Nav: `LayoutDashboard` (Dashboard), `TrendingUp` (Trends), `Layers` (Comparison), `MapPin` (Saved Locations), `BellRing` (Alerts & Webhooks), `User` (Profile), `Gauge` (Usage & Quota)
- Stat cards: `Thermometer`, `Wind`, `Droplet`, `Package` as specified above
- Actions: `Search`, `RefreshCw` (spins while loading), `AlertTriangle` (errors/risk), `Bot` (AI summary — not `Sparkles`), `Download` (CSV export of local trend data), `Lock` (Pro-gated features)

## Interaction conventions (carried over from prior projects)

- Per-action loading states: every independent action (search, refresh, unit toggle, AI summary fetch, quota check, alert subscribe, CSV export) has its own isolated loading indicator — never a single global spinner
- Modal-based interactions for: saved locations management, alert/webhook subscription setup, keyboard shortcuts reference, settings, error detail expansion
- Dropdown-based interactions for: notifications, profile menu — dismiss on outside click and `Escape`, trap focus while open
- Toasts (bottom-right, auto-dismiss, dismissible early) for background confirmations: "Location saved", "Alert subscribed", "Theme changed to Light"
- Errors render inline in the interface's own voice, using the real error code/message WeatherAI returns, never a raw stack trace
- Empty states are actionable, not just blank — always include the one button that resolves them
- Keyboard shortcuts: `/` focus search, `r` refresh active view, `1`-`9` switch saved locations, `?` shortcuts modal

## API integration notes

All features map to a real WeatherAI endpoint. The Next.js route handlers exist purely to keep the API key server-side — they are thin proxies, not a separate system:

- `app/api/weather/route.ts` → proxies `/v1/weather-geo` (auto-detect, default on first load) or `/v1/weather` (lat/lon, used on search or saved-location switch). Accepts `units`, `ai`, `days` and forwards them.
- `app/api/usage/route.ts` → proxies `/v1/usage` directly, uncached (always fresh).
- `app/api/alerts/route.ts` → proxies `/v1/webhooks` (GET to list, POST to create). On a Free-plan key this legitimately returns a 403 from WeatherAI itself — surface that real response as the locked state, don't fake it client-side.
- `ai=false` by default on numeric-only requests; `ai=true` only when the AI summary panel is explicitly opened, to preserve AI quota.
- In-memory cache (60s TTL current conditions, 15min forecast) inside `app/api/weather/route.ts` only, to avoid redundant identical calls — a few lines, not a subsystem.
- Simple retry (max 2 attempts) on `500`/`503` from WeatherAI, implemented inline in the fetch wrapper.
- Historical trend data: WeatherAI has no history endpoint, so trends are built by persisting each successful current-conditions fetch to `localStorage`, capped at 30 days, clearly labeled "since you started tracking this location" — this is the one piece of local-only data in the app, and it's labeled honestly rather than presented as an API feature.

## Repo completeness bar

- Meaningful, incremental commit history (conventional-commit style: `feat:`, `fix:`, `test:`, `docs:`, `style:`)
- `README.md`, `CONTRIBUTING.md`, `LICENSE` (MIT), `.env.local.example`, `.github/workflows/ci.yml`
- No committed secrets, no committed `node_modules`, sensible `.gitignore`