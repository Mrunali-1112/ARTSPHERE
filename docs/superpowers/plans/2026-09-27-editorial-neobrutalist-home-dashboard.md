# Editorial Neo-Brutalist Home Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform `home.html`, `home.css`, and `home.js` into an expansive, responsive editorial neo-brutalist dashboard with working navigation routes, clean typography, and zero mobile-frame constraints.

**Architecture:** Update `home.html` to adopt `<div class="page-wrapper">` and universal capsule nav, rebuild `home.css` with 12-column grid and modular bento geometry, and refactor `home.js` to fix all route targets and integrate dynamic API data into the new card templates.

**Tech Stack:** HTML5, Vanilla CSS3 (Manrope, Neo-brutalist tokens, CSS Grid), Vanilla JavaScript (REST API fetch).

## Global Constraints
- Primary border: `1.5px solid #0A0A0A`
- Background: `--color-paper: #F4F0E7`
- Surfaces: `--color-white: #FFFFFF`, `--color-cream: #EAE4D5`, `--color-yellow: #FFF49A`
- Radius scale: `18px` for cards, `999px` for pills
- Correct all routes: `/pages/artist-profile.html?id=...`, `/pages/event-details.html?id=...`, `/pages/collaborators.html`, `/pages/notifications.html`

---

### Task 1: Reconstruct `home.html` Structure
- [ ] Replace `.mobile-frame-container` with `<div class="page-wrapper">`.
- [ ] Implement the universal capsule navigation header with active "Home" link, search input, notification bell with link to `/pages/notifications.html`, and user profile menu.
- [ ] Build Section 1: Asymmetric 8 + 4 Studio Hero & Status Ledger.
- [ ] Build Section 2: Disciplines Filter Strip.
- [ ] Build Section 3: Featured Artists Bento Container.
- [ ] Build Section 4: Upcoming Events (7 cols) + Community Guild (5 cols).
- [ ] Build Section 5: Universal Editorial Footer.

### Task 2: Implement Neo-Brutalist Styles in `home.css`
- [ ] Remove old mobile container, purple shadows, and gradient styles.
- [ ] Implement 12-column desktop, 8-column tablet, and 4-column mobile responsive layout.
- [ ] Style studio hero, status ledger card, artist bento cards, and event banners with `1.5px solid #0A0A0A` borders.
- [ ] Style the user account dropdown menu in neo-brutalist fashion.

### Task 3: Fix Routes & Dynamic Rendering in `home.js`
- [ ] Correct all navigation routes (`profile.html` &rarr; `artist-profile.html`, `messages.html` &rarr; `collaborators.html`, etc.).
- [ ] Update `loadFeaturedArtists()` template with neo-brutalist card markup.
- [ ] Update `loadUpcomingEvents()` template with clean date badges and event detail links.
- [ ] Wire notification button to navigate to `/pages/notifications.html`.

### Task 4: Sync & Verify
- [ ] Copy static files to `target/classes/static`.
- [ ] Verify `http://localhost:8080/pages/home.html` returns 200 OK.
- [ ] Generate visual preview of the new Home Dashboard.
- [ ] Commit all changes to git.
