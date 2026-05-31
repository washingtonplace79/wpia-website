# Washington Place Improvement Association — Operations Guide

This guide covers everything needed to deploy the site, connect it to Netlify, manage board member CMS access, publish content, and handle day-to-day operations.

---

## Table of contents

1. [Prerequisites](#1-prerequisites)
2. [Push the project to GitHub](#2-push-the-project-to-github)
3. [Connect to Netlify and deploy](#3-connect-to-netlify-and-deploy)
4. [Set up DecapBridge for the CMS](#4-set-up-decapbridge-for-the-cms)
5. [Set a custom domain](#5-set-a-custom-domain)
6. [Update astro.config.mjs with your live URL](#6-update-astroconfigmjs-with-your-live-url)
7. [Invite board members to the CMS](#7-invite-board-members-to-the-cms)
8. [Logging in to the CMS](#8-logging-in-to-the-cms)
9. [Staging and releasing changes](#9-staging-and-releasing-changes)
10. [Managing content](#10-managing-content)
11. [Managing document files (PDF uploads)](#11-managing-document-files-pdf-uploads)
12. [Viewing contact form submissions](#12-viewing-contact-form-submissions)
13. [Adding or removing board members](#13-adding-or-removing-board-members)
14. [Maintaining environment variables](#14-maintaining-environment-variables)
15. [Routine maintenance](#15-routine-maintenance)
16. [Troubleshooting](#16-troubleshooting)

---

## 1. Prerequisites

Before deploying you need:

- A **GitHub account** (free). Create one at github.com if you don't have one.
- A **Netlify account** (free). Create one at netlify.com — you can sign up with your GitHub account, which makes the connection easier.
- The project files on your computer (already done).

---

## 2. Push the project to GitHub

The site's content is stored in Git. Every time a board member saves a post in the CMS, Decap CMS commits the change to GitHub, and Netlify automatically rebuilds and republishes the site.

### Steps

1. Go to **github.com** → click **New repository** (the `+` button, top right).
2. Name it something like `wpia-website`. Set it to **Private** (recommended) or Public.
3. Do **not** initialize with a README or .gitignore — the project already has one.
4. Click **Create repository**.
5. GitHub will show you a block of commands. In your terminal, inside the project folder, run:

```bash
git init
git add .
git commit -m "Initial scaffold"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/wpia-website.git
git push -u origin main
```

Replace `YOUR-USERNAME` with your GitHub username. After this, refresh the GitHub page — you should see all the project files.

---

## 3. Connect to Netlify and deploy

1. Log in to **netlify.com**.
2. From your team dashboard, click **Add new site** → **Import an existing project**.
3. Choose **Deploy with GitHub** and authorize Netlify to access your repositories.
4. Select the `wpia-website` repository.
5. Netlify will detect the build settings from `netlify.toml`. Confirm:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
6. Click **Deploy site**.

Netlify will install dependencies and build the site. This takes about 60–90 seconds. When it finishes you'll see a live URL like `https://sparkly-fox-123456.netlify.app`. The site is live.

> **Auto-deploys**: From now on, every time changes are pushed to the `main` branch on GitHub (including CMS edits), Netlify automatically rebuilds and republishes the site within about a minute.

---

## 4. Set up DecapBridge for the CMS

The CMS uses DecapBridge PKCE auth for routine staging edits. Editors do not need GitHub accounts; DecapBridge manages invitations and the CMS commits changes to the `staging` branch through its Git Gateway.

### 4a. DecapBridge site settings

In DecapBridge, configure the site with:

- **Git provider**: GitHub
- **Repository**: `washingtonplace79/wpia-website`
- **CMS login URL**: `https://washingtonplace.org/admin/index.html`
- **Git access token**: a fine-grained GitHub token with read/write access to repository contents

The staging CMS config lives at `public/admin/config.yml`. It is already set to:

- `branch: staging`
- `base_url: https://auth.decapbridge.com`
- `gateway_url: https://gateway.decapbridge.com`

### 4b. Configure publishing

Publishing reviewed staging changes uses the site-side publish page at:

```
https://washingtonplace.org/publish/
```

This page calls a Netlify Function that starts the existing `release.yml` GitHub workflow. Add these Netlify environment variables:

- **`GITHUB_WORKFLOW_TOKEN`**: a fine-grained GitHub token for `washingtonplace79/wpia-website` with **Actions: Read and write**
- **`PUBLISH_SECRET`**: a strong passcode shared only with people allowed to publish

Optional environment variable:

- **`PUBLISH_WORKFLOW_REF`**: defaults to `main`

### 4c. Trigger a redeploy

Environment variables only apply to new builds/functions, so trigger a fresh deploy after adding them:

1. Go to **Deploys** in the Netlify dashboard.
2. Click **Trigger deploy** → **Deploy project**.
3. Wait ~60–90 seconds for it to finish.

The CMS is now wired to DecapBridge for editing, and `/publish/` is wired for releasing reviewed staging changes to production.

---

## 5. Set a custom domain

> Skip this section if you're keeping the `.netlify.app` URL for now.

1. In the Netlify dashboard, go to **Project configuration → Domain management**.
2. Click **Add a domain** and enter your domain (e.g. `washingtonplace.org`).
3. Netlify will give you nameserver addresses (e.g. `dns1.p01.nsone.net`).
4. Log in to wherever you registered the domain and update the nameservers to Netlify's values.
5. DNS propagation takes a few minutes to a few hours.
6. Netlify automatically provisions a free SSL certificate (HTTPS) once DNS is active.

---

## 6. Update astro.config.mjs with your live URL

Once you have a live URL (either the `.netlify.app` one or your custom domain), update the site config:

Open `astro.config.mjs` and change the `site` line:

```js
// Before
site: 'https://your-site.netlify.app',

// After (example)
site: 'https://washingtonplace.org',
```

Commit and push this change:

```bash
git add astro.config.mjs
git commit -m "Set production site URL"
git push
```

---

## 7. Invite board members to the CMS

Board member CMS access is managed in DecapBridge, not GitHub. Editors do not need repository access.

### 7a. Invite an editor

1. Log in to DecapBridge.
2. Open the `wpia-website` site.
3. Invite the board member by email.
4. Ask them to accept the invitation and choose their login method.

### 7b. Choose who can publish

Publishing is separate from editing. Only share the `/publish/` passcode with people who are allowed to release reviewed staging changes to the live site.

---

## 8. Logging in to the CMS

Board members access the CMS at:

```
https://your-site-url.com/admin/
```

For example: `https://washingtonplace.org/admin/`

### First login

1. Go to `/admin/` on the live site.
2. Click the login button.
3. Complete the DecapBridge login flow.
4. The CMS dashboard opens, showing the four content sections: News, Events, Documents, Board Members.

DecapBridge manages passwords, invite status, and SSO login options.

### Forgotten password

Passwords are managed by DecapBridge, not by this site. If a board member forgets their password, they use DecapBridge's reset flow from the CMS login screen.

---

## 9. Staging and releasing changes

Netlify charges 15 credits for each production deploy (free tier = 300 credits/month) but **deploy previews are free**. To avoid burning credits on every CMS save, this site uses a two-branch workflow:

- **`staging` branch** — where routine CMS edits land. Netlify builds a free preview.
- **`main` branch** — what the public sees. Pushing here costs 15 credits.

### Edit, preview, publish

| URL | Purpose | Cost |
|---|---|---|
| `https://washingtonplace.org/admin/` | Edit content on `staging` | Free branch deploy |
| `https://staging--wpia.netlify.app/` | Preview staged changes | Free branch deploy |
| `https://washingtonplace.org/publish/` | Release reviewed `staging` changes to `main` | One production deploy |

The old `/admin-publish/` direct-to-`main` path should be treated as a legacy emergency path only. Routine publishing should go through `/publish/` so content is reviewed on staging first.

### Where to preview staging edits

When you save through `/admin/`, your changes appear on the **staging deploy URL** within ~60 seconds:

> **<https://staging--wpia.netlify.app/>**

Bookmark this. Note the **double dash** (`--`) between the branch name and the site name — that's Netlify's separator (single dashes are valid in both branch and site names, so they'd be ambiguous). The general pattern for any branch is `https://<branch>--wpia.netlify.app/`.

The same URL is also discoverable in the Netlify dashboard under **Deploys** — any row tagged "Branch: staging" links to it.

### Releasing staging to production

When you're happy with what's on staging and want it live:

1. Go to <https://washingtonplace.org/publish/>.
2. Enter the publish passcode.
3. Click **Publish to live site**.
4. The publish function starts `.github/workflows/release.yml`. That workflow merges `staging` into `main` if there is anything new. Netlify rebuilds production within ~60 seconds of the merge (one production deploy).

If there's nothing new on staging, the page reports that production is already up to date.

### What if someone commits directly to `main`?

Direct `main` commits trigger a production deploy. The `Sync staging with main` action (in `.github/workflows/sync-staging.yml`) automatically merges those changes back into staging on every push to main, so the two branches stay in sync.

### One-time setup (already done — for reference)

- `staging` branch exists on GitHub
- Netlify has **Branch deploys** enabled for `staging` (Project configuration → Build & deploy → Continuous deployment → Branches and deploy contexts → "Let me add individual branches" → add `staging`)
- GitHub Actions are enabled on the repo
- Netlify has `GITHUB_WORKFLOW_TOKEN` and `PUBLISH_SECRET` set for the publish function

---

## 10. Managing content

All content editing happens through the CMS at `/admin/`. No code knowledge is needed.

### Publishing a news post

1. In the CMS, click **News & Announcements** in the left sidebar.
2. Click **New News & Announcements**.
3. Fill in:
   - **Title** — the headline
   - **Date** — use the date picker
   - **Author** — defaults to "Board of Directors"; change if needed
   - **Tag** — choose one: Event, Infrastructure, Governance, or Community
   - **Excerpt** — a short summary (~200 characters) shown on the listing and home pages
   - **Body** — the full post content, formatted with the toolbar (bold, lists, headings, etc.)
4. Click **Publish** (top right). In the CMS, this means "save to staging."

The staging site will rebuild and the post will appear at `https://staging--wpia.netlify.app/` within about 60 seconds. Use `/publish/` only after reviewing it there.

### Editing an existing news post

1. Click **News & Announcements** in the sidebar.
2. Click the post title.
3. Make changes.
4. Click **Publish** to save the edit to staging.

### Deleting a news post

1. Open the post.
2. Click the three-dot menu (⋮) near the top right.
3. Click **Delete**. The deletion is saved to staging.

### Adding an event

1. Click **Events** in the sidebar.
2. Click **New Events**.
3. Fill in:
   - **Title** — event name
   - **Date** — use the date picker
   - **Start Time** — type the time, e.g. `9:00 AM`
   - **End Time** — optional, e.g. `1:00 PM`
   - **Location** — where the event takes place
   - **Type** — Volunteer, Governance, or Social
   - **Description** — optional details shown if someone clicks through
4. Click **Publish** to save the event to staging.

Events automatically move to the "Past events" section on the Events page once their date passes.

### Adding a document

See the next section — document files require an upload step.

---

## 11. Managing document files (PDF uploads)

Because Netlify's free tier stores files in the GitHub repo, PDF files are uploaded through the CMS media library and committed to `public/uploads/` in the repo.

### Uploading a new document

1. In the CMS, click **Documents** in the sidebar.
2. Click **New Documents**.
3. Fill in:
   - **Name** — the display name, e.g. `April 2026 Board Meeting Minutes`
   - **Category** — Governance, Minutes, or Financial
   - **Date** — display date, e.g. `Apr 2026`
   - **File** — click **Choose a file** → **Upload** → select the PDF from your computer
   - **File Size** — optional, e.g. `102 KB` (check in Finder/Explorer)
4. Click **Publish** to save the document to staging.

The PDF is committed to the repo and the document row appears on the staging Documents page.

### File size limits

Netlify's free tier has a 100 MB repository size limit. For a neighborhood association with PDFs, this is unlikely to be a problem for years. Large scanned documents should be compressed before uploading (free tools: smallpdf.com, ilovepdf.com).

---

## 12. Viewing contact form submissions

The contact form on the Contact page sends submissions to Netlify Forms — no email server or third-party service required.

1. In the Netlify dashboard, go to **Forms** (in the top navigation or sidebar).
2. You'll see a form called **contact**.
3. Click it to view all submissions, including name, email, subject, and message.
4. You can download submissions as a CSV if needed.

### Email notifications

To receive an email each time someone submits the form:

1. In the Netlify dashboard, go to **Project configuration → Forms → Form notifications**.
2. Click **Add notification** → **Email notification**.
3. Enter the board's email address.
4. Click **Save**.

From then on, every form submission sends an email to that address immediately.

---

## 13. Adding or removing board members

### Adding a board member (contact page listing)

1. In the CMS, click **Board Members** in the sidebar.
2. Click **New Board Members**.
3. Fill in:
   - **Name** — full name
   - **Role** — e.g. `President`, `At-Large Member`
   - **Email** — optional; if provided, the name becomes a clickable `mailto:` link
   - **Display Order** — controls the order on the Contact page (1 = first, 2 = second, etc.)
4. Click **Publish**.

### Removing a board member from the listing

1. Open the board member entry in the CMS.
2. Use the three-dot menu → **Delete**.

### Revoking CMS access (when a board member leaves)

Removing someone from the Board Members content collection only removes them from the Contact page — it does **not** revoke their CMS login. To revoke login, remove or disable them in DecapBridge.

Also rotate `PUBLISH_SECRET` in Netlify if that person had the publish passcode.

---

## 14. Maintaining environment variables

Environment variables are managed in Netlify: **Project configuration → Environment variables**. After changing any value, trigger a fresh deploy from **Deploys → Trigger deploy → Deploy project**.

### Required variables

| Variable | Purpose | When to rotate |
|---|---|---|
| `GITHUB_WORKFLOW_TOKEN` | Lets `/publish/` start the `release.yml` GitHub workflow | When the token owner changes roles, the token expires, or access may be compromised |
| `PUBLISH_SECRET` | Passcode for the `/publish/` page | When a publisher leaves, after accidental sharing, or on a regular board transition |

### GitHub token requirements

Create `GITHUB_WORKFLOW_TOKEN` as a fine-grained GitHub token scoped only to `washingtonplace79/wpia-website`, with **Actions: Read and write**. Do not use a broad personal access token. The workflow itself uses GitHub Actions' built-in token to merge `staging` into `main`.

### Rotating the publish passcode

1. Generate a new strong passcode.
2. Replace `PUBLISH_SECRET` in Netlify.
3. Trigger a fresh deploy.
4. Share the new passcode only with authorized publishers.

### Rotating the GitHub release token

1. Create a new fine-grained token in GitHub.
2. Replace `GITHUB_WORKFLOW_TOKEN` in Netlify.
3. Trigger a fresh deploy.
4. Test `/publish/` after confirming staging has a harmless pending change, or use the GitHub Action fallback if urgent publishing is needed.
5. Revoke the old token in GitHub.

### DecapBridge token

DecapBridge also has its own Git access token for CMS edits to `staging`. Maintain that token in DecapBridge, not Netlify. It should also be fine-grained, scoped only to this repo, and have repository contents read/write access.

---

## 15. Routine maintenance

### When Astro or other packages need updating

Run this in the project folder:

```bash
npm update
```

Then test locally (`npm run dev`), and push to GitHub. Netlify will deploy the update automatically.

### Yearly tasks

- **Update footer year**: The footer reads the current year from the server clock at build time, so it updates automatically on each deploy. No action needed.
- **Review board member list**: After annual elections, update the Board Members collection in the CMS.
- **Archive old documents**: There is no automatic archiving. Old minutes and budgets remain listed. If the list grows long, you can delete old entries from the CMS.

---

## 16. Troubleshooting

### The site didn't update after I published something

- Wait 60–90 seconds — the rebuild takes a moment.
- In the Netlify dashboard, check **Deploys**. If the deploy shows as "Failed", click it to see the error log.
- The most common cause is a YAML formatting error in a content file. The error log will name the file.

### I can't log in to /admin/

- Make sure you accepted the DecapBridge invitation email before trying to log in.
- Try clearing browser cookies and cache, then visit `/admin/` again.
- If the login popup is blocked, allow popups for the site and try again.
- Confirm the DecapBridge site is configured with the CMS login URL `https://washingtonplace.org/admin/index.html`.

### A board member didn't receive their invitation email

- Ask them to check their spam/junk folder.
- Re-send the invitation from DecapBridge if needed.

### A file uploaded to the Documents section is broken/not downloadable

- The PDF upload may have failed partway through. Delete the document entry and re-create it, re-uploading the file.
- Check the Netlify deploy log to confirm the file was committed to the repo (`public/uploads/`).

### The CMS shows "Failed to persist entry"

This means the CMS could not commit the change to GitHub. Common causes:
- The DecapBridge Git access token is missing, expired, or lacks repository contents write access.
- The user's DecapBridge session expired — log out of the CMS, log back in, retry.
- A GitHub API rate limit was hit (rare) — wait a few minutes and try again.

### The publish page says "Publish failed"

- If it says **unauthorized**, the passcode is wrong or `PUBLISH_SECRET` was rotated.
- If it says **publish_not_configured**, Netlify is missing `GITHUB_WORKFLOW_TOKEN` or `PUBLISH_SECRET`; add them and redeploy.
- If the release workflow fails with a merge conflict, `staging` cannot be cleanly merged into `main`. A maintainer needs to resolve the conflict in GitHub.

### The build fails with a Zod validation error

Astro validates all content files against the schemas in `src/content/config.ts`. If a required field is missing or has the wrong type (e.g. a date formatted incorrectly), the build will fail.

Common issues:
- **Event date formatted as text** — dates must be `YYYY-MM-DD` (e.g. `2026-04-19`), not `April 19, 2026`. The CMS date picker produces the correct format automatically.
- **Tag or type not in the allowed list** — the CMS select widget prevents this, but manual file edits can introduce typos.

The Netlify deploy error log will show exactly which file and field caused the problem.

---

*Last updated: May 2026. For technical changes to the site code, contact the person who built the site.*
