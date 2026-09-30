# Implementation Plan: Editorial Neo-brutalist Opportunities & Applications Slice

Transform `opportunities.html`, `opportunity-details.html`, and `my-applications.html` into full-viewport responsive Editorial Neo-brutalist applications.

## User Review Checkpoints
1. Opportunities Index (`/pages/opportunities.html`) with category pills, search, featured card, and responsive cards grid.
2. Opportunity Details (`/pages/opportunity-details.html?id=...`) with application modal and host dossiers.
3. My Applications Tracker (`/pages/my-applications.html`) with dual-level category/status filtering.

## Proposed Changes

### Task 1: Opportunities Index Page
- **Files:**
  - `src/main/resources/static/pages/opportunities.html`
  - `src/main/resources/static/css/opportunities.css`
  - `src/main/resources/static/js/opportunities.js`
- **Actions:**
  - Remove all `.mobile-frame-container wide-landing` and `.opportunities-screen` constraints.
  - Implement universal floating capsule nav with active "Opportunities" link.
  - Build responsive 12-column grid for open calls and featured opportunity.
  - Connect with `ArtSphereAPI.getOpportunities` and `ArtSphereAPI.getFeaturedOpportunity` with curated fallbacks.

### Task 2: Opportunity Details Page
- **Files:**
  - `src/main/resources/static/pages/opportunity-details.html`
  - `src/main/resources/static/css/opportunity-details.css`
  - `src/main/resources/static/js/opportunity-details.js`
- **Actions:**
  - Full-viewport dossier page with breadcrumbs, host organization ledger, compensation details.
  - Interactive application modal (`applyModal`) submitting to `ArtSphereAPI.applyToOpportunity` with instant confirmation.
  - Bookmark toggling and sharing.

### Task 3: My Applications Tracker Page
- **Files:**
  - `src/main/resources/static/pages/my-applications.html`
  - `src/main/resources/static/css/my-applications.css`
  - `src/main/resources/static/js/my-applications.js`
- **Actions:**
  - Reconstruct page with floating capsule nav, stats counter bar, and dual-layer filtering (Events, Collaborations, Opportunities).
  - Rich neo-brutalist cards with clear status pills and links to target resources.

### Task 4: Verification & Commit
- Sync static files to `target/classes/static/`.
- Verify HTTP 200 on all 3 pages.
- Generate preview visual.
- Git commit slice.
