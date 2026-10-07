# Portfolio Website: Build Plan

Hand this file to Claude Code as the spec. Put it in the new repo as `PLAN.md` and ask Claude Code to build it milestone by milestone.

## 1. Summary

A personal portfolio for Titan with an **old-school developer / retro terminal** look. Visitors land on a full-screen welcome screen where Titan's name is the biggest thing on the page and a menu below it links to each section. English content. Hosted free on Vercel at `<name>.vercel.app`.

**Stack (decided):** Astro + Svelte (only for interactive pieces) + Tailwind CSS, deployed on Vercel.

## 2. Site flow

```
Visitor arrives
   │
   ▼
┌──────────────────────────────────────────┐
│  WELCOME SCREEN (100dvh, full screen)    │
│                                          │
│   ████ TITAN ████   ← ASCII-art name     │
│   > software developer_   ← typed line   │
│                                          │
│   [1] about   [2] projects               │
│   [3] skills  [4] contact                │
│                                          │
│   press 1-4 or click · ↓ scroll          │
└──────────────────────────────────────────┘
   │ click a button / press a number key / scroll
   ▼
 About → Projects → Skills → Contact   (sections on the same page)
```

Decision: **one page with sections**, not separate pages. The welcome buttons smooth-scroll to the section. This keeps it simple, fast, and the URL still updates (`/#projects`) so sections are shareable. Once the visitor scrolls past the welcome screen, a small sticky top bar appears (`~/titan $ about projects skills contact`) so they can jump around without scrolling back up.

## 3. Visual hierarchy (welcome screen)

1. **Name / branding** (largest): ASCII-art or very large pixel/monospace text. This is the first thing the eye hits.
2. **Tagline** (medium): one line typed out letter by letter with a blinking cursor, e.g. `> building small, useful things for the web_`.
3. **Section menu** (smaller, but clearly clickable): buttons styled like a terminal menu, `[1] about`, each with a hover/focus highlight (inverted colors).
4. **Hint** (smallest, dimmed): `press 1-4 or click · scroll ↓`.

On mobile, the ASCII name switches to plain large monospace text (ASCII art breaks on narrow screens), and the menu stacks vertically.

## 4. "Old school dev" style guide

- **Fonts:** `VT323` or `IBM Plex Mono` for headings, `JetBrains Mono` / `IBM Plex Mono` for body (Google Fonts). Monospace everywhere.
- **Colors** (define as CSS variables / Tailwind theme tokens so the palette can be swapped):
  - background `#0b0f0b` (near-black)
  - primary text `#33ff66` (phosphor green) — alternative theme: amber `#ffb000`
  - dim text `#1f8a3d`
  - accent / highlight: inverted (green background, black text)
- **Effects (subtle, all optional):** blinking block cursor, faint CRT scanlines overlay, slight text glow (`text-shadow`). Nothing that hurts readability.
- **Copy style:** headings look like commands (`$ cat about.txt`, `$ ls projects/`, `$ skills --list`, `$ contact`).
- **Boxes/borders:** ASCII-style borders (`+----+`) or 1px solid lines in the primary color, no rounded corners, no gradients.
- **Optional theme toggle:** green ↔ amber, saved in `localStorage`.

## 5. Sections

| Section | Heading | Content |
|---|---|---|
| About | `$ cat about.txt` | Short bio (3–5 lines), photo optional (pixelated/dithered style fits the vibe). |
| Projects | `$ ls projects/` | Cards listing each project: name, one-line description, tech tags, links (live / GitHub). **Projects TBD by Titan**, so ship with placeholder entries driven by a content collection. |
| Skills | `$ skills --list` | Grouped list (languages, frameworks, tools), maybe shown as a fake `tree` output. |
| Contact | `$ contact` | Email, GitHub, LinkedIn, etc. as links. No contact form in v1 (needs a backend). |

## 6. Interactivity (Svelte islands)

Keep JS small. Only these pieces are Svelte components; everything else is static Astro.

1. **`<BootIntro client:load />`**: types out the tagline (and optionally a short fake boot log like `loading modules... ok`). Plays once per browser session (`sessionStorage`), and is skipped entirely if the user has `prefers-reduced-motion`.
2. **`<KeyboardNav client:load />`**: number keys 1–4 jump to sections; `Esc` / `0` goes back to the welcome screen. Ignore key presses while typing in an input.
3. **`<StickyBar client:idle />`**: shows the top bar after scrolling past the welcome screen; highlights the current section (IntersectionObserver).
4. **(Optional, later) `<ThemeToggle client:idle />`**: green/amber switch.
5. **(Stretch, later) Fake terminal:** a command input where typing `help`, `about`, `projects` navigates. Fun, but not needed for v1.

## 7. Project structure

```
portfolio/
├─ astro.config.mjs        # svelte(), tailwind integrations
├─ tailwind.config.mjs     # colors + fonts as theme tokens
├─ public/                 # favicon, og-image, photo
└─ src/
   ├─ layouts/Base.astro   # <head>, fonts, meta/OG tags, scanline overlay
   ├─ pages/index.astro    # welcome + all sections
   ├─ components/
   │  ├─ Welcome.astro
   │  ├─ Section.astro     # shared section wrapper with "$ command" heading
   │  ├─ ProjectCard.astro
   │  ├─ BootIntro.svelte
   │  ├─ KeyboardNav.svelte
   │  └─ StickyBar.svelte
   ├─ content/
   │  ├─ config.ts         # schema for projects
   │  └─ projects/*.md     # one file per project
   └─ data/site.ts         # name, tagline, links, skills (single place to edit)
```

Project content schema (`src/content/config.ts`): `title`, `description`, `tags: string[]`, `url?`, `repo?`, `image?`, `order: number`, `draft: boolean`. Draft projects are hidden, so Titan can add projects gradually.

## 8. Non-functional requirements

- **Performance:** Lighthouse ≥ 95 on mobile. Total JS on first load under ~30 KB.
- **Accessibility:** menu items are real `<a>`/`<button>` elements, visible focus styles, colour contrast passes WCAG AA, animations respect `prefers-reduced-motion`, ASCII art has an `aria-label` with the plain name.
- **SEO/sharing:** title, description, Open Graph image, favicon.
- **Responsive:** looks right from 360 px wide up to desktop; no horizontal scroll.

## 9. Deployment

1. Create a GitHub repo (e.g. `portannn/portfolio`) and push.
2. In Vercel: **Add New → Project → import the repo**. Astro is auto-detected; no config needed.
3. **Name the Vercel project after Titan's name.** The project name becomes the URL (`<project-name>.vercel.app`). Short names like `titan` are probably taken, so have fallbacks ready: `titan-dev`, `<fullname>`, `<fullname>-dev`.
4. Every push to `main` auto-deploys; pull requests get preview URLs.

## 10. Milestones for Claude Code

1. **Scaffold:** `npm create astro@latest`, add Svelte + Tailwind integrations, set up theme tokens and fonts, `Base.astro` layout. Deploy the empty site to Vercel early.
2. **Welcome screen:** full-screen layout with the name, static tagline and menu; smooth scroll to section anchors.
3. **Sections:** About, Projects (from content collection with 2 placeholder drafts), Skills, Contact, all reading from `site.ts` / content files.
4. **Interactivity:** BootIntro, KeyboardNav, StickyBar.
5. **Polish:** scanlines/glow, mobile layout, accessibility and Lighthouse pass, OG image.
6. **Later:** theme toggle, fake terminal, real projects.

## 11. Still needed from Titan

- [ ] Name to use for the branding (exact text for the ASCII art) and the Vercel project name.
- [ ] One-line tagline.
- [ ] About text (3–5 lines) and optional photo.
- [ ] Skills list.
- [ ] Contact links (email, GitHub `portannn`, LinkedIn, …).
- [ ] Projects to show (TBD; site works without them via drafts).
- [ ] Green or amber as the default colour.

## 12. Prompt to start Claude Code

> Read PLAN.md in this repo. It's the spec for my portfolio site. Build milestone 1 and 2 first, then stop and show me how to run it locally. Follow the stack, structure and style guide in the plan. Use placeholder text where my content isn't filled in yet.
