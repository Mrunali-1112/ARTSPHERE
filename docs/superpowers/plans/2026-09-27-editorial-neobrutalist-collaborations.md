# Editorial Neo-Brutalist Collaborations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Overhaul the entire collaboration suite (`collaborators.html`, `collaboration-details.html`, `collaboration-requests.html`, `create-collaboration.html`) into full-viewport editorial neo-brutalist experiences with working routing and search.

## Global Constraints
- Primary border: `1.5px solid #0A0A0A`
- Background: `--color-paper: #F4F0E7`
- Surfaces: `--color-white: #FFFFFF`, `--color-cream: #EAE4D5`, `--color-yellow: #FFF49A`
- Radius scale: `18px` for cards, `999px` for pills
- Correct all links to `/pages/collaboration-details.html?id=...`, `/pages/collaboration-requests.html`, `/pages/create-collaboration.html`, and `/pages/artist-profile.html?id=...`

---

### Task 1: Reconstruct `collaborators.html`, `collaborators.css`, and `collaborators.js`
- [ ] Replace `.app-layout` with `<div class="page-wrapper">` and universal capsule nav.
- [ ] Build 8+4 Asymmetric Hero with search bar, count badge, requests shortcut link, and yellow spotlight card.
- [ ] Build Skill & Art Form filter pills row (`#skillsFilterList`).
- [ ] Build Collaborations Bento Grid (`#collabGrid`).
- [ ] Build Universal Editorial Footer.
- [ ] Implement neo-brutalist styling in `collaborators.css`.
- [ ] Update `collaborators.js` with bento cards, filtering, search, and user menu dropdown.

### Task 2: Reconstruct `collaboration-details.html`, `collaboration-details.css`, and `collaboration-details.js`
- [ ] Wrap page in `<div class="page-wrapper">` with universal capsule nav and breadcrumb back link.
- [ ] Build Creator Profile Header card with avatar, role, and profile link.
- [ ] Build Project Overview card with status badge, title, and quick facts ledger.
- [ ] Build 2-column layout (8 cols vision/skills/reference, 4 cols host guild/IP guidelines/CTA).
- [ ] Build request modal with clean neo-brutalist styling.
- [ ] Update `collaboration-details.js` with fallback data, request modal handling, and link sharing.

### Task 3: Reconstruct `collaboration-requests.html`, `collaboration-requests.css`, and `collaboration-requests.js`
- [ ] Wrap in `<div class="page-wrapper">` with universal capsule nav and breadcrumb.
- [ ] Build 3 status tabs (`Received`, `Sent`, `Approved`) with live counter badges.
- [ ] Implement responsive cards with accept/decline actions and links to `/pages/artist-profile.html?id=...`.
- [ ] Implement neo-brutalist styles in `collaboration-requests.css`.
- [ ] Update `collaboration-requests.js` to handle tab switching and request actions.

### Task 4: Reconstruct `create-collaboration.html`, `create-collaboration.css`, and `create-collaboration.js`
- [ ] Wrap in `<div class="page-wrapper">` with universal capsule nav and breadcrumb.
- [ ] Build neo-brutalist form container with purpose chips, high-contrast inputs, description textarea, and reference link.
- [ ] Style form in `create-collaboration.css` with clean borders and buttons.
- [ ] Update `create-collaboration.js` to handle form submission, validation, and redirection to details page.

### Task 5: Sync, Verify, & Commit
- [ ] Copy static files to `target/classes/static`.
- [ ] Verify `http://localhost:8080/pages/collaborators.html`, `http://localhost:8080/pages/collaboration-details.html?id=301`, `http://localhost:8080/pages/collaboration-requests.html`, and `http://localhost:8080/pages/create-collaboration.html` return 200 OK.
- [ ] Generate visual preview image.
- [ ] Commit all changes to git.
