# FlowchartViz Design System — "The Botanical Registrar"

Warm editorial minimalism for a degree-path simulator. The metaphor: a university
registrar's desk in a garden — paper surfaces, ink handwriting, botanical green
accents, and one resident scholar named Sprout. Light mode is warm paper with a
green undertone; dark mode is a green-tinted charcoal study at night with cream
ink. Headings speak in serif (Fraunces); the interface speaks in Geist.

---

## 0. Research Log

| Lane | Reference | Deliverable |
|---|---|---|
| Embedded Layer A | `minimalist-skill.md` | Execution discipline: warm monochrome base, serif/sans typographic contrast, crisp 1px `#EAEAEA`-class borders, near-zero shadows, motion as whisper (`translateY(12px)` + opacity, 600ms, `cubic-bezier(0.16,1,0.3,1)`), no gradients/glass, `<kbd>` micro-UI, IntersectionObserver entry reveals. |
| Embedded Layer B #1 | `notion.md` | Warm neutrals (never blue-gray), near-black ink at ~95% not pure black, whisper borders `1px solid rgba(0,0,0,0.1)`, 8px spacing base with organic scale, ultra-low shadow stacks (<0.05 opacity), pill badges for status, generous 64–120px section rhythm. |
| Embedded Layer B #2 | `claude.md` | Parchment canvas concept (`#f5f4ed` → our green-tinted paper), serif display at single weight 500 with line-height 1.10–1.30, exclusively warm-toned neutrals in dark mode too, ring-style depth (`0 0 0 1px`) instead of drop shadows, organic hand-drawn illustration language (basis for Sprout), generous 1.60 body line-height. |
| Lazyweb real-product screens | **Skipped** — network recipe not run; time-boxed to the two-reference budget mandated by the task. Named brands (saybriefly, craft.do, notion.so) were mapped via `_INDEX.md` mood routing ("editorial / paper-like / readable" → notion/claude) instead. |
| Imagen concept drafts | **Skipped** — image generation unavailable in this environment; Sprout was specified in-vector instead (Section 7). |
| React dev tooling gate | **Skipped by task mandate** (react-grab / react-scan / react-doctor not installed). Recorded as accepted debt (Section 9). |

Routing decision: user brief names notion.so + craft.do + saybriefly. `_INDEX.md`
routes "editorial / paper-like / readable" to `notion.md`, `wired.md`, `claude.md`.
`notion.md` covers the Notion half directly; `claude.md` (parchment, warm
editorial, organic illustration) is the closest curated match for craft.do's
warm document feel and saybriefly's calm brief-writing surface. `wired.md`
(broadsheet density, acid accents) rejected as too loud for a simulator.

---

## 1. Atmosphere & Direction

One-line direction: **a registrar's ledger printed on botanical paper, graded by
a small sprout in a graduation cap.**

- Light mode reads as warm paper — off-white with a yellow-green undertone, never
  sterile white, never blue-gray.
- Dark mode is the same desk at night — charcoal with a green cast, cream ink,
  brighter botanical green for actions.
- One saturated story (green) carries everything; red/amber appear only as course
  status semantics. Zero purple, zero blue gradients, zero glassmorphism.
- Depth comes from surface tone shifts (paper → card ivory → tint), 1px borders,
  and at most `shadow-xs`. No blur, no glow.
- The mascot Sprout is the single "hand-made" moment — an inline SVG illustration
  in the Notion/Claude organic style. Everything else is typeset, not drawn.

Signature moment: the empty state — Sprout beside a serif headline, above a
dashed-paper dropzone that greens on drag-over.

## 2. Color Tokens

All values OKLCH. Status/tint/edge/mascot vars live on `:root` and `.dark` and are
additionally mapped into Tailwind v4 via `@theme inline` (`--color-status-passed`
etc.), so utilities like `text-status-passed` / `bg-tint-blocked` exist.

### Light — "Paper Study" (`:root`)

| Token | OKLCH | ~Hex | Role |
|---|---|---|---|
| `--background` | `oklch(0.967 0.009 120)` | `#f3f5ee` | Warm green-tinted paper canvas |
| `--foreground` | `oklch(0.252 0.021 150)` | `#1b251d` | Green ink text |
| `--card` | `oklch(0.988 0.005 120)` | `#fafcf8` | Ivory card surface |
| `--card-foreground` | `oklch(0.252 0.021 150)` | `#1b251d` | Ink on cards |
| `--popover` | `oklch(0.988 0.005 120)` | `#fafcf8` | Popover surface |
| `--popover-foreground` | `oklch(0.252 0.021 150)` | `#1b251d` | |
| `--primary` | `oklch(0.458 0.085 155)` | `#2a6542` | Deep botanical green — CTAs, links |
| `--primary-foreground` | `oklch(0.975 0.012 120)` | `#f7f8f2` | Cream text on green |
| `--secondary` | `oklch(0.935 0.018 130)` | | Pale sage fill |
| `--secondary-foreground` | `oklch(0.35 0.03 150)` | | Dark sage ink |
| `--muted` | `oklch(0.94 0.012 125)` | | Quiet fill (kbd, chips, table rows) |
| `--muted-foreground` | `oklch(0.455 0.02 145)` | `#505a50` | Secondary text |
| `--accent` | `oklch(0.925 0.022 132)` | | Hover sage |
| `--accent-foreground` | `oklch(0.32 0.03 150)` | | |
| `--destructive` | `oklch(0.5 0.18 27)` | `#b32322` | Warm crimson errors |
| `--border` | `oklch(0.885 0.014 125)` | | Whisper 1px border |
| `--input` | `oklch(0.86 0.014 125)` | | Input border (slightly firmer) |
| `--ring` | `oklch(0.55 0.09 155)` | | Focus ring green |
| `--radius` | `0.625rem` | | 10px base; lg 10 / xl 14 / 2xl 18 |

Status (solid — text, icons, borders):

| Token | OKLCH | ~Hex |
|---|---|---|
| `--status-passed` | `oklch(0.5 0.11 152)` | `#267543` |
| `--status-failed` | `oklch(0.5 0.18 27)` | `#b32322` |
| `--status-blocked` | `oklch(0.50 0.105 80)` | `#825b00` |
| `--status-pending` | `oklch(0.455 0.02 145)` | `#505a50` |

Status tints (soft badge/node/minimap fills):

| Token | OKLCH |
|---|---|
| `--tint-passed` | `oklch(0.93 0.035 150)` |
| `--tint-failed` | `oklch(0.93 0.03 25)` |
| `--tint-blocked` | `oklch(0.94 0.04 90)` |
| `--tint-pending` | `oklch(0.94 0.012 125)` |

Canvas & edges (consumed by reactflow / store via CSS vars):

| Token | OKLCH |
|---|---|
| `--edge-passed` / `--edge-failed` / `--edge-blocked` | `oklch(0.55 0.11 152)` / `oklch(0.55 0.17 27)` / `oklch(0.62 0.11 80)` |
| `--edge-pending` | `oklch(0.60 0.02 140)` |
| `--canvas-dots` | `oklch(0.85 0.012 125)` |
| `--minimap-bg` / `--minimap-mask` | `oklch(0.988 0.005 120)` / `oklch(0.967 0.009 120 / 70%)` |

Charts (green ramp, dark → light + pale accent):
`--chart-1 oklch(0.72 0.12 152)`, `--chart-2 oklch(0.58 0.1 155)`,
`--chart-3 oklch(0.458 0.085 155)`, `--chart-4 oklch(0.85 0.06 140)`,
`--chart-5 oklch(0.35 0.045 150)`.

Sidebar tokens mirror their non-prefixed counterparts (`--sidebar: 0.96/0.01/120`,
`--sidebar-primary` = `--primary`, borders = `--border`, ring = `--ring`, etc.).

### Dark — "Night Study" (`.dark`)

| Token | OKLCH | ~Hex | Role |
|---|---|---|---|
| `--background` | `oklch(0.205 0.012 155)` | `#131915` | Green-tinted charcoal (never pure black) |
| `--foreground` | `oklch(0.925 0.012 110)` | `#e6e7de` | Cream ink |
| `--card` | `oklch(0.245 0.014 155)` | `#1b221e` | Elevated green-charcoal |
| `--card-foreground` | `oklch(0.925 0.012 110)` | `#e6e7de` | |
| `--popover` / `--popover-foreground` | `oklch(0.245 0.014 155)` / cream | | |
| `--primary` | `oklch(0.72 0.12 152)` | `#66ba7f` | Brighter sprout green |
| `--primary-foreground` | `oklch(0.22 0.03 155)` | | Deep green text on bright green |
| `--secondary` | `oklch(0.29 0.016 150)` | | Sage-charcoal fill |
| `--secondary-foreground` | `oklch(0.9 0.012 110)` | | |
| `--muted` | `oklch(0.27 0.014 152)` | | |
| `--muted-foreground` | `oklch(0.7 0.014 130)` | `#9ba097` | |
| `--accent` | `oklch(0.31 0.02 150)` | | |
| `--accent-foreground` | `oklch(0.925 0.012 110)` | | |
| `--destructive` | `oklch(0.65 0.16 25)` | | |
| `--border` | `oklch(0.93 0.01 110 / 12%)` | | Cream-tinted hairline |
| `--input` | `oklch(0.93 0.01 110 / 16%)` | | |
| `--ring` | `oklch(0.65 0.1 152)` | | |

Status dark: `--status-passed oklch(0.78 0.13 150)` `#76cf8a`,
`--status-failed oklch(0.7 0.16 25)` `#f2716a`,
`--status-blocked oklch(0.82 0.12 85)` `#e8be62`,
`--status-pending oklch(0.7 0.014 130)`.
Tints dark: passed `oklch(0.32 0.045 152)`, failed `oklch(0.32 0.05 25)`,
blocked `oklch(0.34 0.05 90)`, pending `oklch(0.3 0.014 150)`.
Edges dark: passed `oklch(0.72 0.12 152)`, failed `oklch(0.65 0.16 25)`,
blocked `oklch(0.75 0.11 85)`, pending `oklch(0.55 0.016 140)`.
`--canvas-dots oklch(0.32 0.012 145)`; minimap bg/mask mirror card/background at 70%.
Charts dark: `0.78/0.13/150`, `0.68/0.12/152`, `0.58/0.1/155`, `0.88/0.08/145`, `0.48/0.08/152`.

### Verified contrast (computed OKLCH → linear sRGB → WCAG)

All text pairs ≥ 4.5:1 in both themes; non-text graphics ≥ 3:1.

| Pair | Light | Dark |
|---|---|---|
| foreground / background | 14.39 | 14.34 |
| foreground / card | 15.28 | 12.97 |
| muted-foreground / card | 6.98 | 6.07 |
| primary-foreground / primary (button) | 6.43 | 7.27 |
| primary / background (links) | 6.27 | 7.56 |
| secondary-fg / secondary | 9.26 | 10.43 |
| status-passed / background · / tint | 5.18 · 4.69 | 9.38 · 6.54 |
| status-failed / background · / tint | 6.00 · 5.30 | 6.23 · 4.52 |
| status-blocked / background · / tint | 5.54 · 5.11 | 10.17 · 6.70 |
| status-pending / background | 6.57 | 6.72 |
| edge-pending / card (graphic) | 3.79 | 3.35 |

## 3. Typography

| Role | Font | Weight | Size / line-height | Notes |
|---|---|---|---|---|
| Display hero | Fraunces (`--font-heading`) | 500 | 2.25–3rem / 1.10–1.15, `tracking-tight` | Editorial anchor; single weight, never bold |
| Page/wordmark heading | Fraunces | 500–600 | 1.125–1.25rem | Header wordmark, panel titles |
| Body | Geist (`--font-sans`) | 400 | 0.875–1rem / 1.6 | Relaxed, book-like line-height |
| UI labels | Geist | 500 | 0.75–0.875rem | Buttons, labels |
| Mono (course codes, kbd) | Geist Mono (`--font-mono`) | 500–600 | 0.75rem, `tracking-wider` | `Y{T}`/`T{T}` metadata |
| Badge/status | Geist | 500–600 | 0.625rem, uppercase, `tracking-widest` | Pill, tinted |

Fraunces loads via `next/font/google` (variable `--font-fraunces`, latin,
swap). `@theme inline` maps `--font-heading: var(--font-fraunces)`. Body stays
Geist; headings never use Inter-class sans. Serif ceiling weight is 600.

## 4. Spacing, Radius, Depth

- Base unit 8px (Tailwind default scale). Macro whitespace: empty state is
  vertically centered with generous padding; dashboard is full-bleed (below).
- Radius: buttons/inputs `rounded-md` (8px effective via radius scale), cards and
  canvas `rounded-xl` (14px), badges full pill. Nothing blobbier than 14px on
  structural containers.
- Borders are the depth system: crisp `1px solid var(--border)` everywhere.
  Shadows only `shadow-xs` on cards/canvas — cumulative whisper, never `shadow-lg`.
- No `backdrop-blur` anywhere (header is solid `bg-background`).
- `min-h-[100dvh]` for page shell; sticky header `h-16` with solid background.

### Dashboard layout pattern — full-bleed canvas + floating rail

The dashboard is a Figma/Miro-style workspace: the graph gets everything, tools
float over it on token-styled chrome. No `max-w` cap, no column grid.

- **Shell**: header stays sticky `h-16`; the dashboard branch fills the rest —
  `flex-1 p-3 sm:p-4`, at `lg+` locked to `h-[calc(100dvh-4rem)]` with
  `overflow-hidden` (no page scroll). Below `lg` the canvas is full-width
  `h-[70dvh]` and the page scrolls.
- **Canvas inset**: the reactflow surface keeps its `rounded-xl border
  border-border bg-muted/40 shadow-xs` treatment — the one soft-cornered
  "sheet" floating on the page paper.
- **Floating simulator rail** (`DashboardRail`): overlays the canvas left side,
  `w-80`, `bg-card/95` translucent solid (no blur), `rounded-xl border
  border-border shadow-xs`, `left-4 top-14 bottom-28` — the bottom offset
  clears the bottom-left canvas controls (~98px tall) so zoom/fit stay
  reachable while the rail is open — internally scrollable.
  Contents: GWACalculator + a collapsible "Canvas guide" `<details>` (merged
  former guide panel + tips card, `<kbd>` chips). Toggle is an icon button
  pinned at canvas `left-4 top-4` (Lucide `PanelLeft` / `PanelLeftClose`) with
  `aria-expanded` + dynamic `aria-label`; the button stays put whether open or
  closed. Defaults open at `lg+`, closed below `lg`.
- **Mobile drawer** (below `lg`): the same rail opens as a left sheet —
  `fixed top-16 inset-y-0 left-0 w-[85vw] max-w-80 rounded-r-xl border-r`,
  scrim `bg-foreground/25` (solid dim, not blur), closes on scrim click,
  `Escape`, or its header close button. The floating toggle hides while the
  drawer is open.
- **Canvas chrome** (all token-styled `bg-card border-border shadow-xs`
  chips): top-right toolbar = layout-direction segmented control + Reset
  layout / Reset statuses icon buttons; bottom-left = reactflow Controls
  (with fit-view) and, beside it at `ml-[3.25rem]!`, the zoom readout +
  status-legend chip bar; bottom-right = MiniMap (`hidden` below `sm`).
  reactflow's stylesheet is unlayered and beats Tailwind utilities, so chip
  offsets on reactflow panels use the trailing `!` important modifier.

## 5. Primitives & States

| Primitive | Spec |
|---|---|
| **Primary button** (shadcn `Button` default) | `bg-primary text-primary-foreground` hover darkens via `/80`–`/90`; active `translate-y-px`; focus-visible ring-3 `ring-ring/50` |
| **Outline/ghost buttons** | `border-border bg-background` / transparent; hover `bg-muted` |
| **Card** | `bg-card border border-border rounded-xl shadow-xs`; headers use `border-b border-border` |
| **Pill status badge** | `bg-tint-* text-status-* border border-status-*/30 rounded-full px-1.5 py-0.5 text-[10px] uppercase tracking-widest` |
| **kbd** | `border border-border bg-muted rounded px-1 font-mono text-[10px]` |
| **Dropzone** | `border-2 border-dashed border-input rounded-xl`; hover `border-primary/50 bg-muted/50`; drag `border-primary bg-primary/5`; focus-visible ring-2 ring-ring; `role="button"` `tabIndex=0` Enter/Space activates |
| **Icon buttons** | shadcn `size="icon"` + `aria-label` always |
| **Course node** | 220px card, `border-status-*` 1px (blocked dashed), tinted bg at 60–80%, mono code, pill status badge, hover border strengthens |
| **Floating rail / canvas chrome** | `bg-card` (rail `bg-card/95`) `rounded-xl border border-border shadow-xs` chips floating over the canvas; never blurred glass |
| **Segmented control** | `role="group"` + `aria-pressed` buttons inside `bg-muted rounded-lg p-1`; active = `bg-card shadow-xs`, inactive = `text-muted-foreground` hover `text-foreground` (same pattern as GWA scale toggle and layout-direction toggle) |
| **Legend chips** | decorative dot `size-2 rounded-full bg-status-*` (`aria-hidden`) + `text-[10px] font-medium text-muted-foreground` label, on a `bg-card` chip bar |
| **Zoom badge** | mono `text-[10px] tabular-nums tracking-wider` % readout on `bg-muted` chip, fixed `min-w` so updates never reflow neighbors |
| **Collapsible section** | native `<details>/<summary>` (Canvas guide); summary has `focus-visible:ring-2 ring-ring`, chevron rotates `group-open:rotate-180` |
| **Theme toggle** | cycles light → dark → system; Sun / Moon / Monitor (Lucide); mounted-guarded, aria-label announces current + next |

Interactive states: hover = border/background tone shift (color only); active =
1px translate; focus-visible = 2–3px green ring. Motion is state communication
only — no decorative animation (see Section 6).

## 6. Motion

- Entry reveal (empty state only): `rise-in` — `opacity 0→1`,
  `translateY(14px)→0`, 600ms, `cubic-bezier(0.16,1,0.3,1)`, staggered 80ms via
  `.stagger-1/2/3`. Applied with `motion-safe:` and disabled by
  `prefers-reduced-motion: reduce` (global media query in globals.css).
- Hover/active: color transitions ≤200ms; button active translate-y 1px.
- Reactflow's `animated` dash on passed edges is meaningful (progress) and stays.
- Floating chrome entrance: rail/drawer/scrim mount with `fade-in` (+
  `slide-in-from-left-2` for the rail) 150–200ms, `motion-safe:` gated —
  state communication (panel opened), in `transform`/`opacity` only. Closing
  is instant.
- GPU-friendly only: `transform` / `opacity`. No layout-property animation, no
  keyframe loops, no parallax.

## 7. Mascot — Sprout

A botanical scholar: a cream seed-shaped body with ink dot eyes, gentle smile,
green blush; a sprout of two leaves (deep + light green with ink outline)
rising from behind an ink mortarboard cap, tassel in sprout green with a small
leaf tip; a soft ink ground shadow. Hand-drawn feel via round caps/joins,
slightly asymmetric paths, 3px ink outlines.

- Component `src/components/Mascot.tsx`, pure inline SVG, `viewBox="0 0 140 140"`,
  `size` prop (default 144 for empty state, 36 in header).
- Fills are token-driven via CSS vars (inline `style` fills so `var()` resolves):
  `--mascot-leaf oklch(0.52 0.1 152)` (dark: `0.6 0.11 152`),
  `--mascot-leaf-light oklch(0.72 0.11 150)` (dark: `0.76 0.12 150`),
  `--mascot-cream oklch(0.965 0.015 110)`, `--mascot-ink oklch(0.27 0.02 150)`,
  `--mascot-blush oklch(0.85 0.05 130)`. The character keeps its own fixed
  palette in both themes (illustrations are printed in ink, not re-inked by
  the room's light) — only the leaves brighten slightly at night.
- `role="img"` + `aria-label="Sprout, the FlowchartViz mascot"`.
- One expression (content scholar). No clip-art, no smiley emoji, no gradients.

## 8. Accessibility Constraints

- Text contrast ≥ 4.5:1 and UI graphics ≥ 3:1 in **both** themes — verified
  arithmetically (Section 2 table); re-run the check when any token changes.
- Every interactive element has a visible `focus-visible` ring (green,
  `--ring`); icon-only buttons carry `aria-label`; the dropzone is a real
  button semantically (`role="button"`, `tabIndex={0}`, Enter/Space keydown,
  click opens picker).
- The GWA scale toggle exposes `aria-pressed`; upload errors render with
  `role="alert"`.
- Theme-dependent rendering (toggle icon/label) is mounted-guarded;
  `suppressHydrationWarning` stays on `<html>` for next-themes class injection.
- `prefers-reduced-motion` disables the entry reveal globally.
- Keyboard shortcuts (documented in the Canvas guide with `<kbd>` chips):
  `F` fits the whole graph in view (ignored while typing in
  input/textarea/select/contenteditable or with modifier keys held);
  `Backspace` / `Delete` remove a selected edge (reactflow built-in);
  `Escape` closes the simulator rail/drawer. All fit-view paths use
  `fitViewOptions { padding: 0.15, maxZoom: 1 }`.
- Icons: Lucide SVGs only — no emoji anywhere in UI copy.

## 9. Accepted Debt

- React dev tooling (react-grab / react-scan / react-doctor) not installed —
  explicitly out of scope for this task; revisit before perf work.
- reactflow `<MiniMap>`/`<Background>` colors are read via
  `getComputedStyle` on theme change (attribute-based SVG fills cannot use
  `var()`), so minimap fills repaint one frame after a theme switch. Edges use
  inline-style `var(--edge-*)` and repaint instantly.
- `oklch()` strings are handed to SVG presentation attributes for
  Background/MiniMap; requires an evergreen browser (Chrome 111+, Safari 16.4+,
  Firefox 113+) — acceptable for this app's audience.
- Sidebar tokens are themed but no sidebar ships yet; they exist so the token
  set stays shadcn-complete.
- No Primitive Showcase harness page — this is a single-surface app; the empty
  state + dashboard are the showcase. `/visual-qa` browser pass not run (no
  server starts allowed in this task); contrast verified arithmetically instead.
- Zoom badge re-renders on every zoom tick (reactflow `useStore` selector on
  `transform[2]`). Isolated to a tiny leaf component with a fixed `min-w` so
  the cost is minimal and constant-width text never reflows neighbors.
- Rail default-open resolves one frame after hydration (`matchMedia` is read
  in an effect to avoid an SSR hydration mismatch); the 200ms entrance
  animation makes the pop-in read as intentional.
- The mobile drawer does not trap focus; Escape, scrim click, and a visible
  close button are provided instead.
- Switching layout direction or resetting layout re-runs the dagre pipeline
  and discards manually dragged node positions — pre-existing pipeline
  behavior, kept so the orientation toggle stays a pure store re-layout.
- `!rounded-lg` on the MiniMap uses the legacy leading-`!` important syntax,
  inert under Tailwind v4 (trailing `!` is current); visually redundant with
  `.react-flow__minimap { border-radius: var(--radius) }` in globals.css, so
  left as-is.
