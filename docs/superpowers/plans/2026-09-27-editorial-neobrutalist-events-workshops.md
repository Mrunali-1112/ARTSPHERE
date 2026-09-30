# Editorial Neo-Brutalist Events & Workshops Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform `events.html`, `event-details.html`, their stylesheets, and scripts into full-viewport editorial neo-brutalist experiences with working routing and search.

## Global Constraints
- Primary border: `1.5px solid #0A0A0A`
- Background: `--color-paper: #F4F0E7`
- Surfaces: `--color-white: #FFFFFF`, `--color-cream: #EAE4D5`, `--color-yellow: #FFF49A`
- Radius scale: `18px` for cards, `999px` for pills
- Correct all links to `/pages/event-details.html?id=...`, `/pages/community-details.html?id=...`, and `/pages/my-applications.html?category=EVENTS`

---

### Task 1: Reconstruct `events.html`
- [ ] Replace `.mobile-viewport` with `<div class="page-wrapper">`.
- [ ] Implement universal capsule nav with active "Events" link.
- [ ] Build Events Hero (8 + 4 Asymmetric Grid) with search, results count, registration shortcut link, and yellow spotlight event card.
- [ ] Build Art Forms filter strip (`#categoriesScrollRow`).
- [ ] Build Upcoming Events Bento Grid (`#eventsGrid`).
- [ ] Build Universal Editorial Footer.

### Task 2: Implement Neo-Brutalist Styles in `events.css`
- [ ] Remove old mobile container, purple gradients, and pastel stickers.
- [ ] Implement responsive 12-column grid layout.
- [ ] Style hero, spotlight card, category pills, and event bento cards with `1.5px solid #0A0A0A` borders.

### Task 3: Fix Routes & Filtering in `events.js`
- [ ] Update `renderEvents()` template with neo-brutalist bento card markup.
- [ ] Wire category filter pills, live search input, and debouncing.
- [ ] Wire RSVP toggle and navigation to `/pages/event-details.html?id=...`.
- [ ] Wire navigation drawer and user menu dropdowns.

### Task 4: Reconstruct `event-details.html`, `event-details.css`, and `event-details.js`
- [ ] Wrap page in `<div class="page-wrapper">` with universal capsule nav.
- [ ] Build breadcrumb link back to `/pages/events.html`.
- [ ] Build full-width hero cover and event profile header card with "Register Now", "Save", and "Share" buttons.
- [ ] Build 2-column layout (8 cols curriculum, 4 cols organizer/venue/attendees).
- [ ] Style event details in `event-details.css` with clean borders and cards.
- [ ] Update `event-details.js` to handle registration, RSVP confirmation modal, and sharing.

### Task 5: Sync, Verify, & Commit
- [ ] Copy static files to `target/classes/static`.
- [ ] Verify `http://localhost:8080/pages/events.html` and `http://localhost:8080/pages/event-details.html?id=801` return 200 OK.
- [ ] Generate visual preview image.
- [ ] Commit all changes to git.
