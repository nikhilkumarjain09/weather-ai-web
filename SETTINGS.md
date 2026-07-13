# SETTINGS.md — WeatherAI Assessment Project

## Goal

A small, genuinely complete product that feels like a native extension of the WeatherAI platform itself — same visual language as their own developer dashboard (sidebar with sectioned nav, teal-accented dark chrome, stat cards, top bar with notifications and profile menu), applied to a consumer-facing weather dashboard. Multi-location tracking, historical trends, caching/rate-limit resilience, a request log and API playground for power users, tests, CI, and a repo that looks maintained.

Product name (placeholder, rename freely): **Aeris**.

## Stack

- Next.js 15 (App Router), TypeScript strict mode
- Tailwind CSS (utility-first, no CSS-in-JS)
- lucide-react — the only icon set used anywhere in the app. No emojis, ever, in UI copy, code comments, commit messages, or README. Where the reference design uses an emoji (e.g. a wave in the greeting), substitute a lucide icon instead (e.g. `Sun` or `Sunrise` depending on time of day).
- Zustand for client state (saved locations, unit preference, active theme, comparison selection, notification queue) — persisted to `localStorage` where relevant
- Vitest + React Testing Library for unit/component tests
- Playwright for a small e2e smoke suite
- GitHub Actions for CI (lint, typecheck, test on every push)
- Deployment target: Vercel (env vars for `WEATHERAI_KEY`, never exposed client-side)
- Optional: Upstash Redis (free tier) for server-side response caching — falls back cleanly to an in-memory Map cache if no Redis env vars are set

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
| `warning` | `#F59E0B` | Latency spikes, alert-risk flags |
| `success` | `#34D399` | Healthy quota, cache hit, success states |
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
- Data / numeric: **JetBrains Mono**, tabular-nums — every stat-card number, temperature, coordinate, percentage, and timestamp. This is the one deliberate departure from the reference screenshot's plain sans stat numbers — mono figures read as more precise and align with your established data-forward style.

### Layout — chrome

**Top bar** (fixed, `sidebar-bg`, bottom border): brand mark (teal gradient square icon + "Aeris" + small muted tagline) on the left; on the right, a notification bell (`Bell` icon, small teal dot badge when unread items exist) opening a dropdown notification list, and a profile control (avatar circle with initial, username, chevron) opening the profile dropdown menu.

**Profile dropdown menu** (opens from the top-bar profile control): 
- Theme — segmented control or submenu: Dark / Light / System
- Units — quick shortcut to metric/imperial (mirrors the main unit toggle for convenience)
- Keyboard shortcuts — opens the shortcuts modal
- API docs — external link to weather-ai.co/docs
- Settings — opens a settings modal (default location, notification preferences)
- Sign out — since there's no real backend auth for this assessment, implement a lightweight local identity: first visit prompts for a display name (stored in `localStorage`), shown in the top bar and greeting; "Sign out" clears it and returns to the name-prompt screen. Documented clearly in the README as a mocked, not real, auth layer.

**Sidebar** (fixed left, `sidebar-bg`, collapses to icon-only on tablet and a bottom tab bar on mobile), grouped exactly like the reference screenshot's section pattern:
- **OVERVIEW** — Dashboard (current conditions + forecast), Trends (historical chart), Comparison (multi-location grid)
- **LOCATIONS** — Saved Locations (list + search entry point)
- **CONFIGURATION** — Alerts & Webhooks (Pro-gated, locked badge on Free plan), Request Log, API Playground
- **ACCOUNT** — Profile, Usage & Quota

Active nav item: `accent-tint` background, `accent` text, no left border needed — the tint alone matches the reference's subtlety.

**Main content**: greeting header ("Good [morning/afternoon/evening], **[name]**" with a lucide sun/moon icon instead of an emoji wave, plus current date), a row of stat cards, then the relevant panel per sidebar section below.

### Stat cards

Match the reference exactly: uppercase small muted label top-left, small icon in a muted circular badge top-right, large bold mono number below, short muted caption underneath. For the Dashboard overview, the four cards are:
- **Requests Today** (`Send` icon) — count of WeatherAI calls made today
- **Avg Response Time** (`Zap` icon) — rolling average latency of proxied calls
- **Cache Hit Rate** (`Wifi` icon) — % of requests served from cache vs origin
- **Monthly Quota** (`Package` icon) — used/limit against the plan cap, same as the Usage panel

### Cards, badges, buttons

- Cards: 1px `border`, 10px radius, `surface` background, no drop shadow — matches the reference's flat, bordered look
- Plan badge ("FREE PLAN" style): small pill, `accent-tint` background, `accent` text, uppercase, bold, small tracking
- Buttons: bordered secondary style (like "Regenerate", "Reveal", "Copy" in the reference) for low-emphasis actions; solid `accent` fill only for the single primary action per view
- Time-range pills (7d / 30d / 90d style, seen on the reference's chart card): segmented pill group, active segment gets `accent-tint` background + `accent` text

### Motion

No decorative animation. Allowed: 150ms fade/slide on new data, skeleton pulse during per-action loading, dropdown/modal open transitions, toast slide-in/out, notification bell dot pulse once on new alert. Respect `prefers-reduced-motion` everywhere.

## Icons

lucide-react only, consistent sizing (18px inline / 20px buttons / 24px section headers). Semantic mapping:
- Conditions: `Sun`, `CloudSun`, `Cloud`, `CloudRain`, `CloudLightning`, `CloudSnow`, `Wind`
- Chrome: `Bell` (notifications), `ChevronDown` (dropdown affordances), `LogOut` (sign out), `Palette` (theme menu item), `Settings`, `Keyboard`, `BookOpen` (API docs link)
- Nav: `LayoutDashboard` (Dashboard), `TrendingUp` (Trends), `Layers` (Comparison), `MapPin` (Saved Locations), `BellRing` (Alerts & Webhooks), `ScrollText` (Request Log), `Terminal` (API Playground), `User` (Profile), `Gauge` (Usage & Quota)
- Stat cards: `Send`, `Zap`, `Wifi`, `Package` as specified above
- Actions: `Search`, `RefreshCw` (spins while loading), `Thermometer` (units), `AlertTriangle` (errors/risk), `Bot` (AI summary — not `Sparkles`), `Download` (CSV export), `Lock` (Pro-gated features)

## Interaction conventions (carried over from prior projects)

- Per-action loading states: every independent action (search, refresh, unit toggle, AI summary fetch, quota check, alert subscribe, CSV export, playground request) has its own isolated loading indicator — never a single global spinner
- Modal-based interactions for: saved locations management, alert/webhook subscription setup, keyboard shortcuts reference, settings, error detail expansion
- Dropdown-based interactions for: notifications, profile menu — dismiss on outside click and `Escape`, trap focus while open
- Toasts (bottom-right, auto-dismiss, dismissible early) for background confirmations: "Location saved", "Alert subscribed", "Theme changed to Light", "Data refreshed from cache"
- Errors render inline in the interface's own voice, never a raw stack trace or apology
- Empty states are actionable, not just blank — always include the one button that resolves them
- Keyboard shortcuts: `/` focus search, `r` refresh active view, `1`-`9` switch saved locations, `?` shortcuts modal, `Cmd/Ctrl+K` opens a command palette for jumping between sidebar sections and saved locations (bonus power-user feature, in keeping with the platform-native feel)

## API integration notes

- All WeatherAI calls proxied through Next.js route handlers — API key lives only in server env, never sent to client
- Default endpoint: `/v1/weather-geo?ip=auto` on first load, manual override via `/v1/weather?lat=&lon=` on search or saved-location switch
- `ai=false` by default on numeric-only requests; `ai=true` only when the AI summary panel is explicitly opened
- Server-side caching (60s TTL current conditions, 15min forecast) via the Redis-or-in-memory abstraction; every response includes `_meta.cache: "hit"|"miss"` feeding the Cache Hit Rate stat card
- Exponential backoff + retry (max 3 attempts) on `500`/`503`, implemented once in `lib/weatherClient.ts`
- Free plan is the primary target. Pro-gated endpoints (`forecast14`, `insights`, webhooks, SMS) are feature-flagged via `WEATHERAI_PLAN` env var: on Free, their sidebar entries show a `Lock` badge and a one-line explanation instead of being hidden; on `pro`, they function fully
- **Request Log** (new, mirrors the reference platform's own "Request Logs" nav item): every proxied call is appended to a capped in-memory/localStorage log — endpoint, params, status, latency, cache hit/miss, timestamp — rendered as a table in the Request Log sidebar section
- **API Playground** (new, mirrors the reference platform's "Playground" nav item): a simple form letting the user pick an endpoint, fill params, and see the raw JSON response — demonstrates direct familiarity with the WeatherAI API surface beyond just the consumer UI
- Historical trend data: no true history endpoint exists, so trends are built by persisting each successful current-conditions fetch to `localStorage`, capped at 30 days, clearly labeled "since you started tracking this location," not framed as true historical API data

## Repo completeness bar

- Meaningful, incremental commit history (conventional-commit style: `feat:`, `fix:`, `test:`, `docs:`, `style:`)
- `README.md`, `CONTRIBUTING.md`, `LICENSE` (MIT), `.env.local.example`, `.github/workflows/ci.yml`
- No committed secrets, no committed `node_modules`, sensible `.gitignore`
