# Editorial Neo-Brutalist Landing Page & Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the ArtSphere landing experience and global stylesheet into a full-viewport, responsive editorial neo-brutalist system adhering strictly to `Docs/design.md` and interconnecting all application routes.

**Architecture:** Redesign the global styling foundation in `common.css` with exact design tokens, remove artificial mobile frame boundaries, build a universal floating capsule navigation bar connecting all routes, and reconstruct `landing.html` and `landing.css` into an asymmetric modular grid composition with clean typography and zero AI-generic gradients or drop shadows.

**Tech Stack:** HTML5 semantic structure, Vanilla CSS3 (Custom Properties, CSS Grid, Flexbox, Manrope font), Vanilla JavaScript (ES6+), Spring Boot static resource serving.

## Global Constraints

- `--color-ink`: `#0A0A0A`
- `--color-white`: `#FFFFFF`
- `--color-paper`: `#F4F0E7`
- `--color-cream`: `#EAE4D5`
- `--color-yellow`: `#FFF49A`
- `--color-orange`: `#FF5A1F`
- `--color-grey`: `#E7E7E5`
- `--color-mid-grey`: `#6F6F6A`
- Primary border: `1.5px solid #0A0A0A`
- Strong border: `2px solid #0A0A0A`
- Radius scale: `4px` (micro), `8px` (sm), `12px` (md), `18px` (cards), `24px` (containers), `999px` (pills)
- Typography: `Manrope`, tight line-heights (`0.95–1.05` for display/headings)
- No glassmorphism, no purple/blue gradients, no excessive drop shadows, no floating blobs, no generic SaaS card templates.

---

### Task 1: Foundation & Design Tokens (`common.css`)

**Files:**
- Modify: `src/main/resources/static/css/common.css`

**Interfaces:**
- Produces: Global CSS custom properties (`--color-paper`, `--color-cream`, `--color-ink`, `--border-standard`, etc.), typography classes, button styles (`.btn-pill-primary`, `.btn-pill-secondary`), `.capsule-nav`, and `.grid-12` modular layouts.

- [ ] **Step 1: Replace obsolete variables and frame constraints in `common.css`**

Update `common.css` with the exact token system defined in Section 3, 4, 5, 7, 8, and 22 of `Docs/design.md`. Eliminate `.mobile-frame-container` and `max-width: 520px` / `1100px` `.screen-container` boundaries, replacing them with a responsive 100% viewport container with `5–7vw` padding.

```css
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');

:root {
    --color-ink: #0A0A0A;
    --color-white: #FFFFFF;
    --color-paper: #F4F0E7;
    --color-cream: #EAE4D5;
    --color-yellow: #FFF49A;
    --color-orange: #FF5A1F;
    --color-grey: #E7E7E5;
    --color-mid-grey: #6F6F6A;

    --border-thin: 1px solid var(--color-ink);
    --border-standard: 1.5px solid var(--color-ink);
    --border-strong: 2px solid var(--color-ink);

    --radius-micro: 4px;
    --radius-sm: 8px;
    --radius-md: 12px;
    --radius-card: 18px;
    --radius-lg: 24px;
    --radius-pill: 999px;

    --font-primary: 'Manrope', 'Inter', -apple-system, sans-serif;

    --space-1: 4px;
    --space-2: 8px;
    --space-3: 12px;
    --space-4: 16px;
    --space-5: 20px;
    --space-6: 24px;
    --space-7: 32px;
    --space-8: 40px;
    --space-9: 48px;
    --space-10: 64px;
    --space-11: 80px;
    --space-12: 96px;
    --space-13: 128px;
}

* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

body {
    font-family: var(--font-primary);
    background-color: var(--color-paper);
    color: var(--color-ink);
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
    overflow-x: hidden;
}

/* Full-Viewport Layout Grid */
.page-wrapper {
    width: 100%;
    min-height: 100vh;
    padding: 0 6vw;
    display: flex;
    flex-direction: column;
}

.grid-12 {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: 24px;
    width: 100%;
}
```

- [ ] **Step 2: Add universal button, badge, and capsule navbar classes**

Add `.btn-pill-primary`, `.btn-pill-secondary`, `.pill-tag`, `.capsule-nav`, and mobile responsive media queries (`@media (max-width: 1024px)` and `@media (max-width: 768px)`).

- [ ] **Step 3: Test syntax and commit changes to `common.css`**

Run:
```bash
git add src/main/resources/static/css/common.css
git commit -m "style: establish editorial neo-brutalist design tokens and full-viewport layout in common.css"
```

---

### Task 2: Floating Editorial Capsule Navigation

**Files:**
- Modify: `src/main/resources/static/css/common.css`
- Modify: `src/main/resources/static/pages/landing.html`
- Modify: `src/main/resources/static/js/landing.js`

**Interfaces:**
- Consumes: Design tokens from Task 1.
- Produces: Reusable `<header class="capsule-nav-wrapper">` and `<nav class="capsule-nav">` with all working routes and mobile hamburger drawer.

- [ ] **Step 1: Define Capsule Navbar Markup**

Create the sticky pill capsule header in `landing.html`:
```html
<header class="capsule-nav-wrapper">
    <nav class="capsule-nav">
        <a href="/pages/landing.html" class="nav-brand">
            <span class="brand-sparkle">✦</span>
            <span class="brand-text">ArtSphere</span>
        </a>
        <div class="nav-links" id="navLinks">
            <a href="/pages/home.html" class="nav-link">Home</a>
            <a href="/pages/discover.html" class="nav-link">Discover</a>
            <a href="/pages/communities.html" class="nav-link">Communities</a>
            <a href="/pages/events.html" class="nav-link">Events</a>
            <a href="/pages/collaborators.html" class="nav-link">Collaborate</a>
            <a href="/pages/opportunities.html" class="nav-link">Opportunities</a>
        </div>
        <div class="nav-actions">
            <a href="/pages/login.html" class="btn-pill-secondary">Log In</a>
            <a href="/pages/signup.html" class="btn-pill-primary">Join ArtSphere <span class="btn-arrow">→</span></a>
            <button class="nav-mobile-toggle" id="navMobileToggle" aria-label="Toggle Navigation">
                <span></span>
                <span></span>
            </button>
        </div>
    </nav>
</header>
```

- [ ] **Step 2: Add Capsule Navbar CSS in `common.css`**

Ensure `border: 1.5px solid var(--color-ink)`, `border-radius: var(--radius-pill)`, `background: var(--color-white)`, `padding: 10px 24px`, and responsive drawer for screens `< 1024px`.

- [ ] **Step 3: Update `landing.js` to handle mobile menu toggle**

Wire `navMobileToggle` click listener to toggle `.nav-open` state cleanly.

- [ ] **Step 4: Verify navigation links and commit**

Run:
```bash
git add src/main/resources/static/css/common.css src/main/resources/static/pages/landing.html src/main/resources/static/js/landing.js
git commit -m "feat: implement universal floating capsule navigation across ArtSphere routes"
```

---

### Task 3: Editorial Landing Page Layout (`landing.html` & `landing.css`)

**Files:**
- Modify: `src/main/resources/static/pages/landing.html`
- Modify: `src/main/resources/static/css/landing.css`

**Interfaces:**
- Consumes: Design tokens, grid system, and capsule nav.
- Produces: Complete, responsive landing page markup and styles across all 5 sections.

- [ ] **Step 1: Implement Section A: Editorial Hero (7 + 5 Column Split)**

In `landing.html`:
- Left (7 cols):
  - Label: `<div class="pill-tag"><span class="tag-motif">✦</span> THE INDEPENDENT ARTIST NETWORK</div>`
  - Headline: `<h1 class="hero-headline">Every Artist.<br><span class="hero-headline-accent">Every Passion.</span></h1>`
  - Editorial description text.
  - Buttons: Primary black pill `Join ArtSphere →` and secondary cream pill `Explore Directory ↗`.
- Right (5 cols):
  - Editorial Spotlight Card with black border, cream paper surface, verified creator preview, and direct portfolio link.

- [ ] **Step 2: Implement Section B: Modular Art Form Taxonomy (Bento Grid)**

In `landing.html`:
- Header: Section title with subtitle and "View All in Directory →" link.
- Asymmetric 12-column grid cards:
  - Musicians (4 cols): Audio icon, tag, description.
  - Dancers (4 cols): Motion icon, tag, description.
  - Visual Artists (4 cols): Yellow accent pill tag `FEATURED`, artist count.
  - Photographers (6 cols): Horizontal layout, camera motif, sample portrait.
  - Writers & Composers (6 cols): Editorial quote card with author attribution.
- All cards link to `/pages/discover.html?artForm=...`.

- [ ] **Step 3: Implement Section C: Platform Metrics Strip**

In `landing.html`:
- 4-item shared-border modular strip:
  - `10,000+` Verified Artists
  - `5,200+` Collaborations Formed
  - `2,400+` Live Events & Workshops
  - `60+` Active Communities
- Crisp black divider borders and high-contrast typography.

- [ ] **Step 4: Implement Section D: "Why Join ArtSphere" Bento Grid**

In `landing.html`:
- Asymmetric cards:
  - Card 1 (6 col): "Cross-Disciplinary Collaborations"
  - Card 2 (3 col): "Open Calls & Residencies"
  - Card 3 (3 col): "Workshops & Jams"
  - Card 4 (12 col): "No Algorithms. Pure Craft."

- [ ] **Step 5: Implement Section E: Bottom Call-To-Action & Full Footer**

In `landing.html`:
- High-impact callout card: "Ready to share your craft with the world?" + `Create Your Profile →`.
- Full-width editorial footer with columns for Explore, Community, Opportunities, and Legal.

- [ ] **Step 6: Write complete responsive stylesheet in `landing.css`**

Write clean, modular CSS in `src/main/resources/static/css/landing.css` supporting desktop (12 cols), tablet (8 cols), and mobile (4 cols). Eliminate all legacy gradients, pink/purple shadows, and fixed widths.

- [ ] **Step 7: Test and commit landing overhaul**

Run:
```bash
git add src/main/resources/static/pages/landing.html src/main/resources/static/css/landing.css
git commit -m "feat: complete editorial neo-brutalist landing page overhaul"
```

---

### Task 4: Interactive Script & Navigation Interconnections (`landing.js`)

**Files:**
- Modify: `src/main/resources/static/js/landing.js`

**Interfaces:**
- Handles art form card clicks, route redirects with category query parameters, and mobile navigation toggling.

- [ ] **Step 1: Update `landing.js` with category click handlers**

Ensure clicking any art form card (Musicians, Dancers, Visual Artists, Photographers, Writers) cleanly directs to `/pages/discover.html?artForm=<type>`.

- [ ] **Step 2: Commit changes to `landing.js`**

Run:
```bash
git add src/main/resources/static/js/landing.js
git commit -m "feat: wire category filters and navigation handlers in landing.js"
```

---

### Task 5: Design System QA & Verification

**Files:**
- Verify: `http://localhost:8080/pages/landing.html`

- [ ] **Step 1: Test HTTP response and DOM structure**

Run command to verify `http://localhost:8080/pages/landing.html` returns 200 OK with expected semantic tags.

- [ ] **Step 2: Verify against Section 25 (Visual Quality Gate) checklist**

Confirm:
- 12-column grid active with variable column spans (`7+5`, `4+4+4`, `6+6`).
- Black geometric borders (`1.5px solid #0A0A0A`).
- Zero glassmorphism or purple/blue gradients.
- Controlled radius system (`999px` pills, `18px` cards).
- Full screen width responsiveness without artificial containers.
- All routes in capsule nav correctly navigate to target pages.
