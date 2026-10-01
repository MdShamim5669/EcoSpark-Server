# EcoSpark Hub: Design System

A single reference for how EcoSpark Hub looks and feels, so every page and component stays consistent (a grading point for UI/UX). Everything is built with **Tailwind CSS** and reusable components in `components/ui`.

---

## 1. Design Principles

1. **Fresh and natural:** green-led palette, lots of white space, soft shapes.
2. **Clear over clever:** obvious actions, readable text, predictable layouts.
3. **Consistent:** the same button, card, badge and spacing everywhere.
4. **Mobile first:** design for 375px first, then scale up.
5. **Accessible:** good contrast, visible focus, labels on every input.
6. **Feedback always:** every action shows loading, success or error.

---

## 2. Color Palette

### Brand
| Token | Tailwind | Hex | Use |
|---|---|---|---|
| `primary-50` | `emerald-50` | `#ECFDF5` | Section backgrounds, hover tint |
| `primary-100` | `emerald-100` | `#D1FAE5` | Light badges, highlights |
| `primary-500` | `emerald-500` | `#10B981` | Accents, icons |
| `primary-600` | `emerald-600` | `#059669` | **Main buttons, links** |
| `primary-700` | `emerald-700` | `#047857` | Button hover |
| `primary-900` | `emerald-900` | `#064E3B` | Footer, dark sections |

### Secondary and Accent
| Token | Hex | Use |
|---|---|---|
| `accent-sky` | `#0EA5E9` | Info, water/energy themed highlights |
| `accent-amber` | `#F59E0B` | **Paid** badge, star ratings, warnings |

### Neutrals
| Token | Tailwind | Use |
|---|---|---|
| Background | `white` / `slate-50` | Page and alternating sections |
| Surface | `white` | Cards, modals |
| Border | `slate-200` | Dividers, card borders |
| Text primary | `slate-900` | Headings |
| Text secondary | `slate-600` | Body text |
| Text muted | `slate-500` | Captions, meta info |

### Status Colors
| Status | Background | Text | Use |
|---|---|---|---|
| Draft | `slate-100` | `slate-700` | Idea status |
| Under Review | `amber-100` | `amber-800` | Idea status |
| Approved | `emerald-100` | `emerald-800` | Idea status |
| Rejected | `red-100` | `red-800` | Idea status |
| Free | `emerald-100` | `emerald-800` | Idea label |
| Paid | `amber-100` | `amber-800` | Idea label |
| Success / Error / Info | `emerald` / `red` / `sky` (`-600`) | | Toasts, alerts |

> Never rely on color alone. Always pair status color with a text label.

---

## 3. Typography

| Role | Font | Notes |
|---|---|---|
| Headings | **Poppins** (600, 700) | Loaded with `next/font/google` |
| Body and UI | **Inter** (400, 500, 600) | Loaded with `next/font/google` |
| Fallback | `system-ui, sans-serif` | |

### Type Scale
| Element | Mobile | Desktop | Tailwind |
|---|---|---|---|
| Hero title (H1) | 32px | 56px | `text-3xl md:text-5xl font-bold` |
| Page title (H1) | 28px | 36px | `text-2xl md:text-4xl font-bold` |
| Section title (H2) | 24px | 32px | `text-2xl md:text-3xl font-semibold` |
| Card title (H3) | 18px | 20px | `text-lg md:text-xl font-semibold` |
| Body | 16px | 16px | `text-base` |
| Small / meta | 14px | 14px | `text-sm text-slate-500` |
| Caption / badge | 12px | 12px | `text-xs font-medium` |

Line height: `leading-relaxed` for paragraphs, `leading-tight` for headings. Max paragraph width: `max-w-prose`.

---

## 4. Spacing, Layout and Shape

- **Spacing scale:** Tailwind's 4px scale. Common values: `2, 3, 4, 6, 8, 12, 16`.
- **Container:** `mx-auto max-w-7xl px-4 sm:px-6 lg:px-8`
- **Section padding:** `py-12 md:py-20`
- **Grid gap:** `gap-4 md:gap-6`
- **Radius:** buttons and inputs `rounded-lg`, cards `rounded-2xl`, badges `rounded-full`, modals `rounded-2xl`
- **Shadows:** cards `shadow-sm` (hover `shadow-md`), modals and dropdowns `shadow-xl`
- **Borders:** `border border-slate-200`

### Breakpoints
| Name | Min width | Layout |
|---|---|---|
| default | 0 | 1 column, hamburger menu |
| `sm` | 640px | 2-column forms |
| `md` | 768px | 2-column cards, sidebar collapses |
| `lg` | 1024px | 3-column cards, full navbar, dashboard sidebar |
| `xl` | 1280px | 4-column stats, wider container |

---

## 5. Tailwind Config

```ts
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#ECFDF5",
          100: "#D1FAE5",
          500: "#10B981",
          600: "#059669",
          700: "#047857",
          900: "#064E3B",
        },
        accent: { sky: "#0EA5E9", amber: "#F59E0B" },
      },
      fontFamily: {
        heading: ["var(--font-poppins)", "system-ui", "sans-serif"],
        body: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: { xl: "0.75rem", "2xl": "1rem" },
    },
  },
  plugins: [],
};
export default config;
```

---

## 6. Components

### 6.1 Button
| Variant | Classes |
|---|---|
| Primary | `bg-primary-600 text-white hover:bg-primary-700` |
| Secondary | `bg-primary-50 text-primary-700 hover:bg-primary-100` |
| Outline | `border border-slate-300 text-slate-700 hover:bg-slate-50` |
| Danger | `bg-red-600 text-white hover:bg-red-700` |
| Ghost | `text-slate-700 hover:bg-slate-100` |

Base: `inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed`

Sizes: `sm` (`px-3 py-1.5 text-sm`), `md` (default), `lg` (`px-6 py-3 text-base`).
**Loading state:** show a spinner, keep the label, set `disabled`.

### 6.2 Input, Textarea, Select
- `w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm placeholder:text-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20`
- Always a visible `<label>` above; helper text `text-xs text-slate-500`.
- **Error state:** `border-red-500` plus message below in `text-xs text-red-600`.
- Required fields marked with a red `*`.

### 6.3 Idea Card
```
┌──────────────────────────┐
│ [Image 16:9, rounded-t]  │  Paid badge (top-right, if paid)
│ [Category badge]         │
│ Idea title (2 lines max) │
│ Short description (3 ln) │
│ 👤 Author   ▲ 128 votes  │
│ [ View Idea ]            │
└──────────────────────────┘
```
`rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition overflow-hidden`. Use `line-clamp-2` for title and `line-clamp-3` for description. Same height cards in a grid.

### 6.4 Badges
- Base: `inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium`
- Category: `bg-primary-50 text-primary-700`
- Status and Free/Paid: see the status table in section 2.

### 6.5 Navbar
- Sticky, `bg-white/90 backdrop-blur border-b border-slate-200`, height `h-16`.
- Left: logo. Center: Home, Ideas, Dashboard, About Us, Blog. Right: Login/Register **or** avatar menu (My Profile, Dashboard, Logout).
- Mobile: hamburger opens a slide-down panel. Active link: `text-primary-600 font-medium`.

### 6.6 Footer
- `bg-primary-900 text-primary-50`. Four columns: brand and short text, quick links, legal (Terms, Privacy), contact (email, phone, social icons). Bottom bar with copyright.

### 6.7 Hero
- Full-width cover image with a dark green gradient overlay, white H1 catchy statement, one sentence subtitle, search bar (keyword and category) and a primary CTA.

### 6.8 Vote Buttons
- Vertical or horizontal group: ▲ count ▼. Active up: `text-primary-600`, active down: `text-red-600`. Click the active one again to remove the vote. Disabled with spinner while loading. Logged-out click redirects to login.

### 6.9 Comments
- Each comment: avatar, name, time, text, Reply, Delete (owner or admin).
- Replies indented `ml-6 border-l border-slate-200 pl-4`. On mobile limit indentation after depth 3.

### 6.10 Paywall Card
- Shown in place of full content: lock icon, "This is a paid idea", price, **Buy Now** button (or "Login to buy" when logged out). Blurred preview behind: `blur-sm select-none`.

### 6.11 Tables (Dashboard)
- Header `bg-slate-50 text-xs uppercase text-slate-500`, rows `border-b border-slate-100 hover:bg-slate-50`. Wrap in `overflow-x-auto` for mobile. Row actions via icon buttons or a kebab menu.

### 6.12 Modal
- Overlay `bg-black/50`, panel `max-w-lg rounded-2xl bg-white p-6 shadow-xl`, focus trapped, closes on Esc. Reject modal has a required feedback textarea.

### 6.13 Toast and Alerts
- Toasts top-right (top-center on mobile), auto-dismiss after 4s. Success, error, info variants with an icon.
- Inline alert: `rounded-lg border p-3 text-sm` in the matching status color.

### 6.14 Loading, Empty and Error States
- **Loading:** skeleton blocks (`animate-pulse bg-slate-200 rounded`) matching the final layout; spinner inside buttons.
- **Empty:** icon, short message, one action (e.g. "No ideas found. Clear filters").
- **Error:** friendly message with a Retry button. Dedicated 404 and Unauthorized pages.

### 6.15 Pagination
- Previous, page numbers (with ellipsis), Next. Current page `bg-primary-600 text-white`. Disabled edges at `opacity-50`.

### 6.16 Stats Card (Admin)
- `rounded-2xl border bg-white p-5`: icon in a tinted circle, big number (`text-2xl font-bold`), label (`text-sm text-slate-500`).

---

## 7. Page Layout Patterns

| Page | Layout |
|---|---|
| Home | Hero, Search, Featured ideas (3-col grid), Top 3 voted (highlight cards), How it works (optional), Newsletter (`bg-primary-50`), Footer. Alternate section backgrounds `white` / `slate-50`. |
| All Ideas | Filters in a left sidebar on `lg` (collapsible drawer on mobile), grid of cards, sort dropdown and result count on top, pagination at the bottom. |
| Idea Details | Two columns on `lg`: main content (2/3) and sticky side panel (1/3) with voting, price, author info. Single column on mobile. |
| Auth pages | Centered card `max-w-md`, logo above, link to the other auth page below. |
| Dashboard | Left sidebar (`w-64`, drawer on mobile), top bar with user menu, content area on `bg-slate-50`. |

---

## 8. Iconography and Imagery

- Icons: **lucide-react**, 20px inline, 24px standalone, stroke width 1.75.
- Images: `next/image`, 16:9 for idea cards, `object-cover`, always with `alt` text. Use nature-themed photography.
- Logo: leaf and spark mark plus "EcoSpark Hub" wordmark; a monochrome white version for the footer.

---

## 9. Motion

- Transitions: `transition duration-200 ease-in-out` on hover and focus.
- Card hover: shadow lift, optional `-translate-y-0.5`.
- Keep animations subtle; respect `prefers-reduced-motion`.

---

## 10. Accessibility Checklist

- [ ] Text contrast at least 4.5:1 (body on white uses `slate-600` or darker)
- [ ] Visible focus ring on every interactive element
- [ ] Every input has a label; errors are announced (`aria-describedby`)
- [ ] Buttons are `<button>`, links are `<a>`/`<Link>`
- [ ] Touch targets at least 44x44px on mobile
- [ ] Images have meaningful `alt`
- [ ] Modals trap focus and close with Esc

---

## 11. Do and Don't

| Do | Don't |
|---|---|
| Reuse `components/ui` | Copy and paste markup between pages |
| Use the tokens above | Invent new hex colors or random spacing |
| Show skeletons and clear errors | Leave blank screens while loading |
| Test at 375 / 768 / 1280px | Design for desktop only |
| Keep one primary button per view | Use several competing primary buttons |