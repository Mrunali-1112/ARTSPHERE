# Implementation Plan: Editorial Neo-brutalist Auth & Utility (Slice 10)

## 1. Goal
Execute the final vertical slice of the ArtSphere redesign by reconstructing `login`, `signup`, `notifications`, `settings`, `settings-details`, and `help-support` into full-viewport, editorial neo-brutalist web experiences.

## 2. Steps

### Step 1: Reconstruct Login Page
- Reconstruct `src/main/resources/static/pages/login.html`
- Create `src/main/resources/static/css/login.css`
- Reconstruct `src/main/resources/static/js/login.js`

### Step 2: Reconstruct Sign Up Page
- Reconstruct `src/main/resources/static/pages/signup.html`
- Create `src/main/resources/static/css/signup.css`
- Reconstruct `src/main/resources/static/js/signup.js`

### Step 3: Reconstruct Notifications Center
- Reconstruct `src/main/resources/static/pages/notifications.html`
- Reconstruct `src/main/resources/static/css/notifications.css`
- Reconstruct `src/main/resources/static/js/notifications.js`

### Step 4: Reconstruct Settings & Profile Editor
- Reconstruct `src/main/resources/static/pages/settings.html` and `src/main/resources/static/css/settings.css`
- Reconstruct `src/main/resources/static/pages/settings-details.html` and `src/main/resources/static/css/settings-details.css`
- Update `src/main/resources/static/js/settings.js` and `src/main/resources/static/js/settings-details.js`

### Step 5: Reconstruct Help & Support Page
- Reconstruct `src/main/resources/static/pages/help-support.html`
- Reconstruct `src/main/resources/static/css/help-support.css`
- Update `src/main/resources/static/js/help-support.js`

### Step 6: Sync Assets, Verify HTTP Status & Generate Visual Preview
- Sync static assets to `target/classes/static/`
- Verify HTTP 200 on all endpoints via `Invoke-WebRequest`
- Generate visual preview artifact via `generate_image`
- Commit Slice 10 to git
