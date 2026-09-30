# Editorial Neo-Brutalist Discover Directory Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform `discover.html`, `discover.css`, and `discover.js` into an expansive, responsive, editorial neo-brutalist directory with real-time search, category filtering, and proper routing.

**Architecture:** Wrap `discover.html` with `<div class="page-wrapper">` and universal capsule nav, rebuild `discover.css` with 12-column grid and neo-brutalist cards, and refactor `discover.js` to fix routing targets and render cards dynamically.

## Global Constraints
- Primary border: `1.5px solid #0A0A0A`
- Background: `--color-paper: #F4F0E7`
- Surfaces: `--color-white: #FFFFFF`, `--color-cream: #EAE4D5`
- Radius scale: `18px` for cards, `999px` for pills
- Correct all routes to `/pages/artist-profile.html?id=...` and `/pages/notifications.html`

---

### Task 1: Reconstruct `discover.html`
- [ ] Replace `.mobile-frame-container` with `<div class="page-wrapper">`.
- [ ] Implement the universal capsule nav with active "Discover" link.
- [ ] Build Search & Location Filter Hero (8 + 4 Grid).
- [ ] Build Disciplines Filter Strip.
- [ ] Build Artists Directory Grid container (`artistsResultsGrid`).
- [ ] Build Universal Editorial Footer.

### Task 2: Implement Neo-Brutalist Styles in `discover.css`
- [ ] Remove old mobile container, purple shadows, and gradient styles.
- [ ] Implement 12-column desktop, 8-column tablet, and 4-column mobile responsive layout.
- [ ] Style the search hero, location filter cards, discipline pills, and artist directory cards.

### Task 3: Fix Routes & Real-Time Filtering in `discover.js`
- [ ] Update `renderArtistsGrid()` template with neo-brutalist card markup.
- [ ] Fix profile links to `/pages/artist-profile.html?id=...`.
- [ ] Wire location filter pills to filter alongside discipline pills and search input.
- [ ] Wire mobile drawer navigation.

### Task 4: Sync & Verify
- [ ] Copy static files to `target/classes/static`.
- [ ] Verify `http://localhost:8080/pages/discover.html` returns 200 OK.
- [ ] Generate visual preview of the new Discover Directory.
- [ ] Commit all changes to git.
