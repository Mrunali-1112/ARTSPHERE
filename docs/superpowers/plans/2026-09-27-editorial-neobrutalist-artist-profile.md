# Implementation Plan: Editorial Neo-brutalist Artist Profile & Portfolio Slice

Transform `artist-profile.html` and `portfolio.html` into full-viewport responsive Editorial Neo-brutalist creative showcases.

## Proposed Changes

### Task 1: Artist Profile Page
- **Files:**
  - `src/main/resources/static/pages/artist-profile.html`
  - `src/main/resources/static/css/artist-profile.css`
  - `src/main/resources/static/js/artist-profile.js`
- **Actions:**
  - Remove all `.mobile-frame-container wide-landing` and `.profile-screen` constraints.
  - Implement universal floating capsule navigation.
  - Reconstruct hero dossier card with cover image, avatar, stats ledger, bio, skills, and follow/message buttons.
  - Build responsive portfolio preview grid and active co-creation pitches.
  - Connect with `ArtSphereAPI.getArtistProfile` with curated fallback dataset.

### Task 2: Portfolio Gallery Page
- **Files:**
  - `src/main/resources/static/pages/portfolio.html`
  - `src/main/resources/static/css/portfolio.css`
  - `src/main/resources/static/js/portfolio.js`
- **Actions:**
  - Remove mobile frame wrapper, implement full-viewport container.
  - Build filter ledger with active category state.
  - 12-column responsive artwork gallery cards.
  - Implement Add/Edit Artwork modal and image preview lightbox.
  - Connect with `ArtSphereAPI.getArtistPortfolio` and `ArtSphereAPI.createPortfolioItem`.

### Task 3: Verification & Commit
- Sync static files to `target/classes/static/`.
- Verify HTTP 200 on all URLs.
- Generate preview image.
- Commit slice to git.
