# Murrabi Desk OS — UI Design System

> **This is the authoritative source of truth for all UI decisions.**
> Every screen, component, and style change must comply with these rules.

---

## 1. Design Language: Liquid Glass

Murrabi Desk follows a **"Liquid Glass"** aesthetic — a premium, minimalist, dark-mode-first interface inspired by mission-control command centres. The visual language is:

- **Deep** — deep obsidian/void backgrounds with translucent glass layers
- **Crisp** — ultra-tight typography, tight tracking, italic headings
- **Warm-aggressive** — muted surfaces punctuated by sharp accent pops
- **Alive** — subtle ambient animations, hover micro-interactions, glow halos

---

## 2. Colour System

### 2.1 Background Palette (Dark Mode — Default)
| Token | Value | Usage |
|---|---|---|
| Page BG | `transparent` (Electron vibrancy) | Root body |
| Surface BG | `rgba(255,255,255,0.02–0.05)` | Cards, panels |
| Sidebar BG | `rgba(15,23,42,0.1)` blur | Left nav |
| Overlay/modal | `rgba(0,0,0,0.95)` + blur | Full-screen modals |

### 2.1a Murrabi Red — The Canonical Red

> **All red in the UI must be Murrabi Red.** There is no other shade of red in Murrabi Desk.

| Property | Value |
|---|---|
| Hex | `#ef4444` |
| Tailwind class | `red-500` (text) / `red-600` (bg/button) |
| CSS variable | `var(--accent-main)` (when default theme is active) |
| CSS utility | `.text-accent-main` / `.bg-accent-main` |

**Never use** `red-400`, `red-700`, `red-800`, `rose-*`, `orange-*`, or any other red-adjacent colour. Only `red-500` and `red-600` are permitted, and only where `var(--accent-main)` cannot be substituted.

### 2.2 Text Palette (Dark Mode)
| Token | Tailwind | Usage |
|---|---|---|
| Primary text | `text-white` | Headings, bold labels |
| Secondary text | `text-white/60–80` | Body copy, descriptions |
| Muted/dim | `text-white/20–40` | Timestamps, placeholders |
| Accent/danger | `text-accent-main` → Murrabi Red | Accent labels, highlights |

### 2.3 Accent System (CSS Variables)
All accent colours are driven by CSS custom properties set on `<html>`:

```
--accent-main      Primary interactive colour (buttons, active states)
--accent-hover     Hovered/pressed variant
--accent-glow      Glow/shadow colour
--accent-soft      10% opacity fill for subtle tints
--accent-rgb       RGB triplet for rgba() usage
```

**Available themes** (set via `accentColor` in `murrabi_settings`):

| ID | Name | Hex | Notes |
|---|---|---|---|
| `red` | **Murrabi Red** *(default)* | `#ef4444` | **The canonical red. All red UI elements use this.** |
| `indigo` | Indigo Mission | `#6366f1` | |
| `emerald` | Emerald Scholarly | `#10b981` | |
| `amber` | Amber Prophetic | `#f59e0b` | |
| `violet` | Aura Violet | `#8b5cf6` | |
| `creamy` | Creamy White *(light theme)* | N/A | Full theme override — no red |

> When the default theme is active, `var(--accent-main)` resolves to Murrabi Red (`#ef4444`). Always use `var(--accent-main)` over hardcoded hex so all accent themes remain consistent.

### 2.4 Creamy White Theme
When `accentColor === 'creamy'`:
- `data-theme="creamy"` is applied to `<html>`
- Background flips to warm parchment `#faf7f0`
- All text flips to near-black `#1a1209`
- All red elements replaced by warm stone `#44403c`
- The `dark` class is removed from `<html>`
- CSS overrides live in `[data-theme="creamy"]` selector block in `globals.css`

**Rule:** Never hardcode `text-white` or `bg-black` on elements that should respond to the Creamy theme — use CSS variable utilities where possible or add a `[data-theme="creamy"]` override in the stylesheet.

---

## 3. Typography

| Role | Class |
|---|---|
| Page title | `text-2xl md:text-4xl font-black tracking-tighter italic` |
| Section heading | `text-xl font-black tracking-tighter italic` |
| Card title | `text-lg font-black tracking-tight italic` |
| Label (micro) | `text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em–0.5em]` |
| Body | `text-sm font-bold leading-relaxed` |
| Small/caption | `text-xs font-black text-white/40` |

**Rules:**
- Headings are always **italic + font-black**
- Labels are always **uppercase + tracked wide**
- Never use `font-normal` — minimum is `font-bold`
- Google Font: **Inter** (`next/font/google`)

---

## 4. Spacing & Layout

| Context | Rule |
|---|---|
| Page padding | `p-10` to `p-12` |
| Card inner padding | `p-8` to `p-12` |
| Gap between cards | `gap-8` to `gap-12` |
| Border radius (card) | `rounded-[32px]` |
| Border radius (button) | `rounded-2xl` to `rounded-[28px]` |
| Border radius (input) | `rounded-2xl` |
| Border radius (pill/tag) | `rounded-full` |

---

## 5. Components

### 5.1 Glass Card
```tsx
<div className="glass-card p-10 border border-white/5 bg-white/5 rounded-[32px] relative overflow-hidden">
```
- Always `relative overflow-hidden`
- Always includes an ambient glow div (bottom-right radial blur) if featured
- Hover state managed by `.glass-card:hover` in `globals.css`

### 5.2 Buttons

**Primary / Action:**
```tsx
className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg active:scale-95"
```

**Ghost / Secondary:**
```tsx
className="bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all"
```

**Destructive:**
```tsx
className="bg-red-600/10 border border-red-500/30 text-red-500 hover:bg-red-600 hover:text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all"
```

**Icon-only:**
```tsx
className="p-3 rounded-xl bg-white/5 text-white/20 hover:text-white hover:bg-white/10 transition-all border border-white/5"
```

### 5.3 Inputs & Textareas
```tsx
className="w-full bg-white/[0.02] border border-white/5 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-red-600/40 transition-all placeholder:text-white/10"
```
- Always `outline-none` — use `focus:ring-*` instead
- Placeholder colour: `placeholder:text-white/10`

### 5.4 Labels (for form fields)
```tsx
<label className="text-[9px] font-black text-white/30 uppercase tracking-widest ml-1">
  Field Name
</label>
```

### 5.5 Modals / Overlays
```tsx
<div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-3xl animate-in fade-in duration-500">
  <div className="w-full max-w-2xl bg-white/[0.03] border border-white/10 rounded-[40px] shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-500">
```

### 5.6 Status / Tag Pills
```tsx
<span className="text-[10px] font-black text-red-500 uppercase tracking-[0.4em] bg-red-600/10 px-3 py-1 rounded-full border border-red-500/20">
  LABEL
</span>
```

### 5.7 Toggle Switches
Active: `bg-red-600` | Inactive: `bg-white/10`  
Knob: absolute `w-4 h-4 rounded-full bg-white`

---

## 6. Animation & Motion

| Interaction | Rule |
|---|---|
| Page enter | `animate-in fade-in duration-700` |
| Modal enter | `animate-in zoom-in-95 fade-in duration-500` |
| Active scale | `active:scale-95` on all buttons |
| Hover lift | `hover:-translate-y-0.5` on feature buttons |
| Spin (loading) | `animate-spin` on `<RefreshCw />` |
| Pulse (unread) | `animate-pulse` on status dots |
| Ambient glow | `blur-[120px]` radial div, `pointer-events-none`, bottom-right |
| Sidebar ambient | `animate-[spin_20s_linear_infinite]` radial gradient |

**Rule:** All transitions are `transition-all duration-300` unless a longer duration is intentional (e.g. `duration-500` for modals, `duration-700` for page entries).

---

## 7. Icons

**Library:** `lucide-react` exclusively.

| Context | Size |
|---|---|
| Nav icons | `size={18}` |
| Button icons | `size={16}` |
| Card section icon (in badge) | `size={24}` |
| Header/title icon | `size={20}`–`size={28}` |
| Empty state icon | `size={32}`–`size={80}` |

**Rule:** Icons must always match text colour using `className`. Never set raw `color` prop.

---

## 8. Navigation & Page Structure

### Sidebar
- Width: `w-64` (collapsible via `-ml-64`)
- Collapse shortcut: `CMD+D`
- Nav links: icon + label, active = `nav-link active` class
- Profile block at bottom

### Page Layout Skeleton
```tsx
<main className="main-content flex flex-col min-h-screen pb-12 animate-in fade-in duration-700">
  <header className="... draggable-header">  {/* Always draggable */}
    <h1 className="text-7xl font-black tracking-tighter text-main italic">Title</h1>
    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-accent-main opacity-60">Subtitle</p>
  </header>
  <div className="grid grid-cols-12 gap-12 no-drag">
    ...
  </div>
</main>
```

**Rules:**
- `draggable-header` on every page's header for native window dragging
- `no-drag` on all interactive content areas
- Grid is always 12 columns

---

## 9. Naming Conventions (UI Text)

Murrabi Desk uses a "Mission Control" command vocabulary. All UI strings should follow:

| Generic | Murrabi Term |
|---|---|
| Email Inbox | Mission Inbox / Communication Feed |
| Send Email | Dispatch / Transmit |
| New Event | Add Task / Mission Log |
| Save | Commit / Confirm |
| Delete | Archive / Wipe Protocol |
| Search | Scan / Identify |
| Loading | Establishing Protocol... |
| Error | Protocol Failure |
| Success | Mission Confirmed |
| Settings | Operational Settings |
| Profile | Identity Protocol |
| Notes | Mission Notes |

---

## 10. Theme-Safe Coding Rules

1. **Never** use `className="dark:..."` — the dark/light toggle is handled via `data-theme`, not Tailwind dark class
2. **Always** add `[data-theme="creamy"]` overrides in `globals.css` when introducing new hardcoded colours that must invert
3. **Always** use `var(--accent-main)` / `text-accent-main` for interactive accent colours so all themes benefit
4. **Never** hardcode `#ef4444` (Murrabi Red hex) directly in component code — use Tailwind `red-500`/`red-600` or the CSS variable `var(--accent-main)`
5. Accent buttons/states should use `bg-accent-main` (CSS class) rather than `bg-red-600` where the button is expected to respect theme changes
6. **Murrabi Red is the only red.** Do not use `red-400`, `red-700`, `red-800`, `rose-*`, `orange-*`, or any approximation. If you need a red tone, use `red-500` (text/icons) or `red-600` (backgrounds/buttons). No exceptions.

---

## 11. File & Component Organisation

```
src/
  app/            Next.js pages (one folder per route)
  components/     Shared components (modals, sidebar items, clocks)
  lib/            Services (GoogleSyncService, auth)
  styles/
    globals.css   Global tokens, theme overrides, utilities
  types/
    global.d.ts   Electron bridge typings
```

**Rules:**
- Pages live in `src/app/[route]/page.tsx`
- Reusable UI = `src/components/`
- No inline `<style>` tags except for keyframe animation blocks
- CSS custom properties go in `:root {}` in `globals.css`
- Theme overrides go in `[data-theme="..."]` blocks directly below `:root`
