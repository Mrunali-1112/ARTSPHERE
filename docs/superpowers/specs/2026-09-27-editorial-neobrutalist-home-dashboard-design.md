# ArtSphere Editorial Neo-Brutalist Redesign: Vertical Slice 2 (Home Dashboard)

## Purpose & Scope
Transform the authenticated creator Home Dashboard (`home.html`, `home.css`, `home.js`) from a mobile-frame prototype with broken routes and purple gradients into a full-viewport, editorial neo-brutalist dashboard adhering strictly to `Docs/design.md`.

---

## 1. Structure & Layout Architecture
- **Root Element**: Wrap page in `<div class="page-wrapper">` (responsive `6vw` outer padding, `min-height: 100vh`).
- **Eliminate Mobile Boundaries**: Remove `.mobile-frame-container`, `.screen-container`, and the fixed bottom phone navigation bar.
- **Top Navigation Bar**:
  - Reusable floating capsule header `<header class="capsule-nav-wrapper">` with pill container (`1.5px solid #0A0A0A`).
  - Active link highlight on **Home** (`/pages/home.html`).
  - Full inter-page routes: **Discover** (`/pages/discover.html`), **Communities** (`/pages/communities.html`), **Events** (`/pages/events.html`), **Collaborate** (`/pages/collaborators.html`), **Opportunities** (`/pages/opportunities.html`).
  - Search trigger linking directly to `/pages/discover.html`.
  - Notification icon with indicator badge linking directly to `/pages/notifications.html`.
  - Creator profile dropdown menu with working links to `/pages/artist-profile.html?id=101`, `/pages/portfolio.html?id=101`, `/pages/create-post.html`, `/pages/feed.html`, `/pages/my-applications.html`, and `/pages/settings.html`.

---

## 2. Dashboard Section Composition
1. **Studio Header & Creative Pulse (Asymmetric 8 + 4 Grid)**:
   - **Left Column (8 cols)**:
     - Tag: `✦ CREATIVE STUDIO`
     - Headline: `Welcome back, <span class="hero-title-accent">Creator.</span>`
     - Description: "Connect with multidisciplinary talents, publish your latest work, and find active collaborations."
     - Actions: Primary pill `Share New Craft +` (`/pages/create-post.html`) and secondary pill `Explore Open Collabs &rarr;` (`/pages/collaborators.html`).
   - **Right Column (4 cols)**:
     - Studio Status Ledger (`.card-cream`):
       - Active Collaborations counter
       - Open Requests counter
       - Quick link: `View Applications & Collabs &rarr;` (`/pages/my-applications.html`).

2. **Art Form Taxonomy Selector**:
   - Quick discipline pills: All, Musicians, Dancers, Visual Artists, Photographers, Writers linking to filtered views in `/pages/discover.html?category=...`.

3. **Featured Artists Showcase (Modular Bento Grid)**:
   - Dynamic cards from `/api/home/featured-artists` with fallback rendering.
   - Neo-brutalist styling: `1.5px solid #0A0A0A`, cream/white background, artist cover preview, avatar, discipline pill, and verified link to `/pages/artist-profile.html?id=...`.

4. **Events & Creative Guilds (7 + 5 Grid)**:
   - **Left (7 cols)**:
     - Upcoming workshops and jams from `/api/home/upcoming-events`.
     - Date stamp blocks (`25 SEP`), venue metadata, and `View Details &rarr;` pointing to `/pages/event-details.html?id=...`.
   - **Right (5 cols)**:
     - Featured Community Guild card (`.card-yellow`): "Creative Souls Guild", active member count, and link to `/pages/community-details.html?id=401`.

5. **Universal Editorial Footer**:
   - Matches universal footer from `landing.html`, establishing product-wide consistency.

---

## 3. Verification Criteria
- Page loads cleanly across desktop (12 cols), tablet (8 cols), and mobile (4 cols).
- All links point to real existing routes without dead ends (`profile.html` and `messages.html` replaced with `artist-profile.html` and `collaborators.html` / `notifications.html`).
- Dynamic API data loads properly and displays in neo-brutalist card geometry.
