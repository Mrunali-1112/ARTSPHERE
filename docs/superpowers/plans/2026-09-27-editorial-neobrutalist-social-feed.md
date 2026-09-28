# Implementation Plan: Editorial Neo-brutalist Social Feed & Posts Slice

Transform `feed.html`, `create-post.html`, and `post-details.html` into full-viewport responsive Editorial Neo-brutalist studio publishing experiences.

## Proposed Changes

### Task 1: Feed Page (`feed.html`)
- **Files:**
  - `src/main/resources/static/pages/feed.html`
  - `src/main/resources/static/css/feed.css`
  - `src/main/resources/static/js/feed.js`
- **Actions:**
  - Remove all `.app-layout` and `.feed-screen` mobile clamps.
  - Implement universal floating capsule navigation.
  - Construct 12-column responsive layout (8 cols feed stream, 4 cols editorial sidebar).
  - Implement rich neo-brutalist post cards with image frames, likes, comments, and tags.
  - Connect with `ArtSphereAPI.getFeedPosts` and `togglePostLike`.

### Task 2: Create Post Page (`create-post.html`)
- **Files:**
  - `src/main/resources/static/pages/create-post.html`
  - `src/main/resources/static/css/create-post.css`
  - `src/main/resources/static/js/create-post.js`
- **Actions:**
  - Reconstruct as full-viewport 12-column publishing studio.
  - Media picker / dropzone with live preview.
  - Caption textarea, discipline select, and tags.
  - Connect with `ArtSphereAPI.createPost`.

### Task 3: Post Details & Discussion Page (`post-details.html`)
- **Files:**
  - `src/main/resources/static/pages/post-details.html`
  - `src/main/resources/static/css/post-details.css`
  - `src/main/resources/static/js/post-details.js`
- **Actions:**
  - Full-viewport artwork dossier with high-res media display.
  - Interactive comments thread with real-time comment posting.
  - Connect with `ArtSphereAPI.getPostDetails` and `ArtSphereAPI.addPostComment`.

### Task 4: Verification & Commit
- Sync static files to `target/classes/static/`.
- Verify HTTP 200 on all 3 URLs.
- Generate preview image.
- Commit slice to git.
