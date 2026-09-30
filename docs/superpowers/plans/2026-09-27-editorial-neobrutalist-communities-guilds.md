# Editorial Neo-Brutalist Communities & Guilds Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform `communities.html`, `community-details.html`, their stylesheets, and scripts into full-viewport editorial neo-brutalist experiences with working routing and search.

## Global Constraints
- Primary border: `1.5px solid #0A0A0A`
- Background: `--color-paper: #F4F0E7`
- Surfaces: `--color-white: #FFFFFF`, `--color-cream: #EAE4D5`, `--color-yellow: #FFF49A`
- Radius scale: `18px` for cards, `999px` for pills
- Correct all links to `/pages/community-details.html?id=...` and `/pages/artist-profile.html?id=...`

---

### Task 1: Reconstruct `communities.html`
- [ ] Replace `.mobile-viewport` with `<div class="page-wrapper">`.
- [ ] Implement universal capsule nav with active "Communities" link.
- [ ] Build Guilds Search & Spotlight Hero (8 + 4 Grid).
- [ ] Build Disciplines Filter Strip.
- [ ] Build Guilds Directory Bento Grid (`popularCommunitiesGrid`).
- [ ] Build Universal Editorial Footer.

### Task 2: Implement Neo-Brutalist Styles in `communities.css`
- [ ] Remove old mobile container, purple gradients, and pastel stickers.
- [ ] Implement responsive 12-column grid layout.
- [ ] Style the search hero, spotlight card, category pills, and guild cards with `1.5px solid #0A0A0A` borders.

### Task 3: Fix Routes & Search in `communities.js`
- [ ] Update `renderCommunities()` template with neo-brutalist card markup.
- [ ] Wire category filter pills and live search input.
- [ ] Wire mobile drawer navigation.

### Task 4: Reconstruct `community-details.html`, `community-details.css`, and `community-details.js`
- [ ] Wrap page in `<div class="page-wrapper">` with universal capsule nav.
- [ ] Build full-width hero cover and guild profile header card with "Join Guild" button.
- [ ] Build neo-brutalist pill tab bar (`Overview`, `Posts`, `Events`, `Members`).
- [ ] Style tab panes in `community-details.css` with clean borders and cards.
- [ ] Update `community-details.js` to handle tab switching and dynamic data.

### Task 5: Sync, Verify, & Commit
- [ ] Copy static files to `target/classes/static`.
- [ ] Verify `http://localhost:8080/pages/communities.html` and `http://localhost:8080/pages/community-details.html?id=401` return 200 OK.
- [ ] Generate visual preview image.
- [ ] Commit all changes to git.
