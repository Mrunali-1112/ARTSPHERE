# ArtSphere Editorial Neo-Brutalist Redesign: Vertical Slice 4 (Communities & Guilds)

## Purpose & Scope
Transform the Communities Index (`communities.html`, `communities.css`, `communities.js`) and Community Details Hub (`community-details.html`, `community-details.css`, `community-details.js`) from mobile phone frames into an expansive, responsive, full-viewport editorial neo-brutalist guild system adhering strictly to `Docs/design.md`.

---

## 1. Structure & Layout Architecture
- **Root Element**: Wrap both pages in `<div class="page-wrapper">` with responsive `6vw` gutters.
- **Eliminate Mobile Boundaries**: Remove `.mobile-viewport`, `.app-header`, and narrow containers.
- **Top Navigation Bar**: Universal Capsule Navigation `<header class="capsule-nav-wrapper">` with active link on **Communities** (`/pages/communities.html`), notification trigger, and profile dropdown menu.

---

## 2. Communities Index (`communities.html`)
1. **Guilds Search & Spotlight Hero (Asymmetric 8 + 4 Grid)**:
   - **Left (8 cols)**:
     - Eyebrow: `✦ ARTIST COLLECTIVES`
     - Headline: `Join Guilds.<br><span class="hero-title-accent">Create in Tandem.</span>`
     - High-contrast search input (`1.5px solid #0A0A0A`, `999px` radius) with instant debounced search.
     - Live result counter badge.
   - **Right (4 cols)**:
     - Featured Guild Spotlight card (`.card-yellow`): "Let's Create Together", active member count, and button `Enter Guild &rarr;` (`/pages/community-details.html?id=401`).

2. **Discipline Category Filter Bar**:
   - Filter pills: All, Painting, Photography, Music, Dance, Writing, Crafts.

3. **Guilds Bento Directory (12-Column Responsive Grid)**:
   - 3 columns on desktop, 2 on tablet, 1 on mobile.
   - Cards styled with `1.5px solid #0A0A0A`, cover images, discipline tags, member count stamps, short description, and button `Explore Guild &rarr;` pointing to `/pages/community-details.html?id=...`.

---

## 3. Community Details Hub (`community-details.html`)
1. **Guild Hero Banner & Header Card**:
   - Cover frame with crisp black outline.
   - Header card (`.card-cream`): Guild Avatar, verified title, mission statement, metadata tags (Member count, Art forms, Location), and primary "Join Guild" pill button with interactive state.

2. **Neo-Brutalist Pill Tabs**:
   - `Overview`, `Posts & WIPs`, `Events & Jams`, `Guild Members`.

3. **Tab Panes**:
   - Overview: Guild rules ledger, featured artworks showcase, upcoming jams.
   - Posts: Creative WIP discussions with comment counts.
   - Events: Masterclasses and sessions.
   - Members: Member directory with links to `/pages/artist-profile.html?id=...`.

4. **Universal Editorial Footer**:
   - Complete footer linking to all platform routes.
