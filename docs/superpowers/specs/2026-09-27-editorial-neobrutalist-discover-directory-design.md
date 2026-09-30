# ArtSphere Editorial Neo-Brutalist Redesign: Vertical Slice 3 (Discover Directory)

## Purpose & Scope
Transform the creator directory and search page (`discover.html`, `discover.css`, `discover.js`) from a mobile-frame view into an expansive, responsive, full-viewport editorial neo-brutalist search & discovery experience adhering strictly to `Docs/design.md`.

---

## 1. Structure & Layout Architecture
- **Root Element**: Wrap page in `<div class="page-wrapper">` with responsive `6vw` gutters.
- **Eliminate Mobile Boundaries**: Remove `.mobile-frame-container`, `.screen-container`, and the fixed bottom phone bar.
- **Top Navigation Bar**:
  - Reusable floating capsule header `<header class="capsule-nav-wrapper">`.
  - Active state on **Discover** (`/pages/discover.html`).
  - Working links to **Home**, **Communities**, **Events**, **Collaborate**, **Opportunities**, and **Notifications**.
  - Creator profile dropdown menu with valid routes to `/pages/artist-profile.html?id=101`, `/pages/portfolio.html?id=101`, `/pages/create-post.html`, `/pages/my-applications.html`, etc.

---

## 2. Directory Section Composition
1. **Search & Discovery Hero (Asymmetric 8 + 4 Grid)**:
   - **Left (8 cols)**:
     - Eyebrow: `✦ CREATIVE DIRECTORY`
     - Headline: `Discover Multidisciplinary <span class="hero-title-accent">Craft.</span>`
     - High-contrast search input: `1.5px solid #0A0A0A`, pill shape (`999px`), instant dynamic debounce search.
     - Live result counter: `Showing X artists across all disciplines`.
   - **Right (4 cols)**:
     - Location Filter Ledger (`.card-cream`):
       - Fast filters for Mumbai, Pune, Bengaluru, and All Locations.

2. **Discipline Pill Filter Bar**:
   - Filter pills (`All`, `Music`, `Dance`, `Visual Arts`, `Photography`, `Writing`).
   - Active state: Solid black fill with white text.

3. **Artists Directory Grid (12-Column Responsive Grid)**:
   - 3 columns on desktop (`col-4`), 2 on tablet (`col-md-4`), 1 on mobile (`col-sm-4`).
   - Cards styled with:
     - `1.5px solid #0A0A0A` borders with `18px` card radius.
     - Artist cover artwork preview.
     - Artist avatar with verified badge.
     - Name, profession tag, location.
     - Short bio and skills badges.
     - Button `View Portfolio &rarr;` linking to `/pages/artist-profile.html?id=...`.

4. **Universal Editorial Footer**:
   - Matches universal footer from `landing.html` and `home.html`.

---

## 3. Verification Criteria
- Fluid layout at all screen sizes.
- Search and category filters operate seamlessly in real time.
- All artist cards link directly to `/pages/artist-profile.html?id=...` (fixing dead-end links).
