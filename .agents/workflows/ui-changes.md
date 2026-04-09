---
description: How to plan and execute any UI change to Murrabi Desk OS
---

# UI Change Workflow

This workflow governs ALL visual, layout, or component changes to Murrabi Desk.
**Before writing a single line of code, follow these steps.**

---

## Step 1 — Read the Design Rules

// turbo
1. Read `UI_RULES.md` in the project root to understand the full design system before making any change.

---

## Step 2 — Identify the Scope

Answer these questions:

- **Which page(s) / component(s) are affected?**
- **Does this change affect both dark-mode and the Creamy White theme?**
- **Does it introduce new colours, spacing, or text styles?**

If the change introduces new colours or UI patterns not in `UI_RULES.md`, update `UI_RULES.md` first (or alongside the change).

---

## Step 3 — Check Theme Safety

Before coding:

- Will new `text-` or `bg-` classes invert correctly under `[data-theme="creamy"]`?
- Are you using `text-accent-main` / `bg-accent-main` (CSS var) rather than hardcoded `red-600`?
- If you're using hardcoded colours, add the corresponding `[data-theme="creamy"]` override in `globals.css`.

---

## Step 4 — Follow Component Patterns

Refer to `UI_RULES.md §5` for the exact class strings to use for:

- Glass cards
- Primary, ghost, destructive, and icon-only buttons
- Inputs and textareas
- Modals / overlays
- Status pills
- Toggle switches

Do **not** invent new patterns. If a new pattern is needed, document it in `UI_RULES.md §5` before using it.

---

## Step 5 — Use Correct Typography Classes

Refer to `UI_RULES.md §3`. Never deviate from:

- Page titles: `text-5xl md:text-7xl font-black tracking-tighter italic`
- Labels: `text-[10px] font-black uppercase tracking-[0.3em]`
- All headings must be **italic + font-black**

---

## Step 6 — Apply Mission Vocabulary

Refer to `UI_RULES.md §9`. Replace generic terms with mission-control equivalents.

---

## Step 7 — Make the Change

Only now write code. Changes should touch:

1. The page/component file (`src/app/[route]/page.tsx` or `src/components/`)
2. `globals.css` — only if adding/updating global tokens or theme overrides
3. `global.d.ts` — only if adding new Electron bridge methods
4. `UI_RULES.md` — if introducing a new reusable pattern

---

## Step 8 — Verify Both Themes

After making the change:

1. Visually confirm dark mode looks correct (default state)
2. Switch to Creamy White in Settings → Mission Accent Protocol and confirm the change still looks correct in the light theme
3. Check that no hardcoded red/white colours "bleed through" in Creamy mode

---

## Step 9 — Update UI_RULES.md (if applicable)

If the change introduced a new component pattern, colour token, animation, or naming convention — add it to `UI_RULES.md` so future changes can follow the same standard.
