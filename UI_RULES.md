# Murrabi Desk OS — UI Rules & Design System

This document serves as the absolute "Source of Truth" for all visual and interactive elements within the Murrabi Desk ecosystem. Follow these rules strictly to maintain the premium, mission-critical aesthetic.

---

## §1 — Core Philosophy

1.  **Mission-Critical Aesthetic**: The UI should feel like a high-end mission control center. Use sharp edges mixed with subtle rounds (`rounded-[14px]`), glassmorphism, and vibrant accents against deep backgrounds.
2.  **Premium Glassmorphism**: Use `backdrop-blur(15px)` and low-opacity borders (`border-white/5` or `border-white/10`) to create depth without clutter.
3.  **Theme Agnosticism**: Every component must look perfect in **Dark Mode** (Default) and **Creamy White** (Light) themes using CSS variables.

---

## §2 — Color Palette & Theming

### 2.1 Accent Protocol
Always use the following CSS variables for interactive elements:
- `--accent-main`: The primary brand color (changes with theme).
- `--accent-hover`: A darker/vibrant version for hover states.
- `--accent-glow`: Low-opacity version for shadows and highlights.
- `--accent-soft`: Very low-opacity version for background tints.

### 2.2 Global Themes
| Theme ID | Name | Background | Accent Variable |
| :--- | :--- | :--- | :--- |
| `default` | Ruby Dark | `#020310` | Red / Ruby |
| `creamy` | Creamy White | `#faf7f0` | Stone / Charcoal |
| `flup` | Flup Emerald | `#f8fafc` | Emerald Green |
| `flup-blue`| Flup Blue | `#f8fafc` | Royal Blue |

---

## §3 — Typography

Never deviate from these classes. All headings **must** be `italic` and `font-black`.

- **Page Titles**: `text-5xl md:text-7xl font-black tracking-tighter italic text-main`
- **Section Headings**: `text-3xl font-black italic text-main tracking-tighter`
- **Sub-headings**: `text-2xl font-black italic text-main tracking-tight`
- **Labels (Micro)**: `text-[10px] font-black uppercase tracking-[0.2em] text-accent-main opacity-60`
- **Accent Bold**: `text-sm font-bold uppercase tracking-widest text-red-400 opacity-80`

---

## §4 — Spacing & Layout

- **Page Padding**: Standard `p-10`.
- **Card Gaps**: Use `gap-6` or `gap-8` for grid layouts.
- **Sidebar Width**: Fixed at `256px` (`w-64`).

---

## §5 — Component Patterns

### 5.1 Glass Cards
The standard container for all content:
- Class: `glass-card` (Defined in `globals.css`)
- Properties: `glass rounded-[14px] p-8 transition-all duration-500`

### 5.2 Buttons
- **Primary (Ruby)**: `btn-ruby` — Uses a gradient of the current accent color.
- **Ghost**: `border border-white/10 hover:bg-white/5 transition-all`
- **Icon-only**: `p-2 rounded-xl glass border border-white/10 text-white/20 hover:text-white`

### 5.3 Inputs (Form V4)
Use the `.form-v4` wrapper for high-end administrative forms:
- **Card**: `.form-v4 .card`
- **Header**: `.form-v4 .card-hdr` (Small caps, bold)
- **Input**: `rounded-[14px] bg-black/20 border-white/10 focus:border-accent-main`

---

## §6 — Theme Safety Rules

1.  **Variable First**: Never use `text-red-500`. Use `text-accent-main`.
2.  **Opacity Logic**: Use Tailwind's opacity shorthand with variables if possible (e.g., `text-accent-main/60`).
3.  **Creamy Overrides**: If a hardcoded color is necessary, ensure it has a `[data-theme="creamy"]` override in `globals.css`.

---

## §9 — Mission Vocabulary

Replace generic UI terms with these equivalents to maintain the "OS" feel:

| Generic Term | Mission Equivalent |
| :--- | :--- |
| Settings | HQ Protocol |
| Profile | Command ID |
| Loading | Initializing Core... |
| Submit / Save | Commit to Record |
| Delete | Purge Data |
| Theme | Visual Protocol |
| Accent Color | Mission Accent |
| Offline | Local Link Only |
