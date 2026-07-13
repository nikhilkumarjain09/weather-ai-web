# Aeris Weather Platform

Aeris is a premium, developer-grade consumer weather analytics dashboard built on Next.js 15, React 19, and the Weather-AI API platform. It provides real-time atmospheric measurements, daily visual sparklines, interactive canvas-based weather maps, Recharts visual analytics curves, on-demand AI syntheses, and customizable webhooks alerting systems.

---

## Features

### 1. Premium Landing Page & Weather Themes
- **Visual Weather Backgrounds**: Framer Motion backgrounds simulating falling rain, swirling snow, slow cloud drifts, and golden sunbeams depending on current weather conditions. Respects `prefers-reduced-motion` settings.
- **Diurnal Greeting**: Sun/Moon Lucide indicators matching systems' localized hour of day.
- **Quota telemetry readout**: Color-coded plan gauges marking requests used (<50% Teal, 50-80% Amber, >80% Red danger).

### 2. Autocomplete Search Experience
- **Debounced Inputs**: Fast 250ms input autocomplete filtering.
- **Keyboard arrow navigation**: Up/Down and Enter keys select suggestions instantly.
- **Suggestions Bank**: Quick links for popular global capital cities, search histories, and custom coordinate nodes.

### 3. Diurnal Hourly Timeline
- **Smooth Snap scrolling**: Horizontal swipeable carousel tracing temperature curves, precipitation chances, and wind speeds hour-by-hour over the next 24 hours.

### 4. Interactive Map Section
- **Thermal Heatmaps / Radar Sweeps**: HTML5 Canvas map displaying radar scanners, coordinate markers, and geolocation points.
- **Telemetry node pinning**: Clicking on grid coordinates pins targets, letting users save custom node coordinates to their favorite location arrays.

### 5. Expandable Daily Forecasts
- **Accent-colored Temperature Sparklines**: Smooth SVG temperature path traces mapping temperature gradients over a 7-day strip.
- **Detail Drawers**: Expanding cards rendering hourly winds, humidity indices, and precipitation risks.

### 6. Interactive Visual Charts
- **Recharts Dashboard**: Toggleable views for Temperature areas, Precipitation bars, Humidity lines, Wind line profiles, and Pressure indicators.

### 7. Unified Command Palette (`Ctrl + K`)
- **Frictionless hotkey triggers**: Instant navigation, theme switches, unit changes, and settings resets via a keyboard-navigable dialog focus trap.

---

## Folder Structure

```
app/
  api/
    alerts/         # Webhook alerts endpoints
    usage/          # Request quotas endpoints
    weather/        # WeatherAI proxy endpoints
  settings/         # Dedicated System Settings page
  layout.tsx        # Query and Theme wrapper layouts
  page.tsx          # Prime Console dashboard
components/
  chrome/           # TopBar, Sidebar, CommandPalette, ProfileMenu
  controls/         # SearchBar, UnitToggle, UsagePanel
  dashboard/        # WeatherCharts, StatCard, ComparisonGrid
  map/              # WeatherMap HTML5 Canvas map widget
  modals/           # AlertSubscribe, KeyboardShortcuts, SavedLocations, Settings
  shared/           # Toast, ErrorBanner, EmptyState, LockedFeatureBadge
  weather/          # CurrentConditions, ForecastStrip, HourlyTimeline, AnimatedBackground
providers/          # React Query and next-themes providers
store/              # Segmented Zustand slices (ui, prefs, favs, history, settings)
services/           # Weather-AI fetch adapters and query hook queries
lib/                # Caching, types, and historical trackers
```

---

## Tech Stack
- **Core Framework**: Next.js 15.5 (App Router), React 19
- **Type Safety**: Strict TypeScript
- **Styling**: Tailwind CSS v4, Vanilla CSS variable tokens
- **Animations**: Framer Motion
- **Data Visualizations**: Recharts
- **Caching & Queries**: TanStack Query v5 (React Query)
- **State Management**: Zustand v5
- **Icons**: Lucide React

---

## Installation & Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   Create a `.env` file in the root directory:
   ```env
   WEATHERAI_KEY=your_weather_ai_api_key
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```

4. **Compile Production Bundle**:
   ```bash
   npm run build
   ```

5. **Run Vitest Suite**:
   ```bash
   npm run test
   ```

---

## Performance & Accessibility Audits

- **Zero-hydration flutters**: `next-themes` ThemeProvider and strict Next.js static asset definitions.
- **TanStack Caching**: Automatic query deduping, 60s stale time settings, and automated network reconnections.
- **ARIA & Keyboard focus**: Focus traps for modal sheets, command palettes, and auto-completers. Semantic HTML landmarks.
- **Media query overrides**: CSS blocks limiting transition speeds to 1ms for accessible screen reader experiences.
