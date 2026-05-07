# Washington Place Improvement Association — Operations Guide

This guide covers everything needed to deploy the site, connect it to Netlify, manage board member CMS access, publish content, and handle day-to-day operations.

---

## Table of contents

1. [Prerequisites](#1-prerequisites)
2. [Push the project to GitHub](#2-push-the-project-to-github)
3. [Connect to Netlify and deploy](#3-connect-to-netlify-and-deploy)
4. [Set up GitHub OAuth for the CMS](#4-set-up-github-oauth-for-the-cms)
5. [Set a custom domain](#5-set-a-custom-domain)
6. [Update astro.config.mjs with your live URL](#6-update-astroconfigmjs-with-your-live-url)
7. [Invite board members to the CMS](#7-invite-board-members-to-the-cms)
8. [Logging in to the CMS](#8-logging-in-to-the-cms)
9. [Staging and releasing changes](#9-staging-and-releasing-changes)
10. [Managing content](#10-managing-content)
11. [Managing document files (PDF uploads)](#11-managing-document-files-pdf-uploads)
12. [Viewing contact form submissions](#12-viewing-contact-form-submissions)
13. [Adding or removing board members](#13-adding-or-removing-board-members)
14. [Routine maintenance](#14-routine-maintenance)
15. [Troubleshooting](#15-troubleshooting)

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

## 4. Set up GitHub OAuth for the CMS

> **Why this section changed.** The original plan used Netlify Identity + Git Gateway, which Netlify put into maintenance mode in September 2024 and no longer offers on new projects. Instead, the CMS now authenticates board members directly through GitHub. This means each editor needs a GitHub account and must be added as a collaborator on the repo (covered in Section 7). The CMS uses a small OAuth helper bundled with this project (in `netlify/functions/`) to complete GitHub login.

You'll do three things: create a GitHub OAuth App, add its credentials to Netlify as environment variables, and redeploy.

### 4a. Create a GitHub OAuth App

1. Sign in to GitHub as the account that owns the `wpia-website` repo (or an org owner, if the repo lives in an organization).
2. Go to **github.com → Settings → Developer settings → OAuth Apps → New OAuth App**.
   - Direct link: <https://github.com/settings/applications/new>
3. Fill in:
   - **Application name**: `WPIA Website CMS`
   - **Homepage URL**: your live site URL, e.g. `https://washingtonplace.org`
   - **Authorization callback URL**: your live site URL **+ `/auth/callback`**, e.g. `https://washingtonplace.org/auth/callback`
   - Leave "Enable Device Flow" unchecked.
4. Click **Register application**.
5. On the next screen:
   - Copy the **Client ID** (visible immediately).
   - Click **Generate a new client secret**, then copy the **Client Secret** somewhere safe — GitHub only shows it once.

> **If you haven't set up a custom domain yet** and are still on the `*.netlify.app` URL, use that URL in steps 3 and 4 (e.g. `https://sparkly-fox-123456.netlify.app/auth/callback`). Once you switch to the custom domain, come back here and edit the OAuth App's Homepage and Authorization callback URLs to match.

### 4b. Add the credentials to Netlify

1. In the Netlify dashboard, open the project → **Project configuration → Environment variables**.
2. Click **Add a variable** → **Add a single variable** and create:
   - **Key**: `OAUTH_CLIENT_ID`
   - **Value**: the Client ID you copied
   - **Scopes**: leave defaults (all scopes)
3. Repeat with:
   - **Key**: `OAUTH_CLIENT_SECRET`
   - **Value**: the Client Secret you copied
4. Click **Save**.

### 4c. Trigger a redeploy

Environment variables only apply to *new* builds, so you need a fresh deploy:

1. Go to **Deploys** in the left sidebar.
2. Click **Trigger deploy** → **Deploy project**.
3. Wait ~60–90 seconds for it to finish.

The CMS is now wired to GitHub. Section 7 covers giving board members access; Section 8 covers logging in.

> **Sanity check.** After the deploy finishes, open `https://your-site/auth` in a browser. It should bounce you straight to GitHub's authorization screen. If you instead see a 500 error or a Netlify "Page not found", the env vars probably didn't take — re-check Section 4b and trigger another deploy.

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

Each board member who edits the site needs a **GitHub account** and must be added as a **collaborator** on the `wpia-website` repository. After that, they can log in to the CMS using GitHub.

### 7a. Make sure they have a GitHub account

If a board member doesn't already have one:

1. Send them to <https://github.com/signup>.
2. Have them sign up with their email address. Free accounts are fine.
3. Have them confirm the email and complete the basic setup (no need to set up SSH keys, configure 2FA right away, or anything else — just a working account).
4. Ask them to send you their **GitHub username** (not their email).

### 7b. Add them as a collaborator

1. Go to <https://github.com/washingtonplace79/wpia-website/settings/access>.
2. Click **Add people**.
3. Type the board member's GitHub username (or email if username unknown) and select them from the dropdown.
4. Choose the **Write** role. (Read is too restrictive — the CMS needs to push commits. Maintain/Admin gives more than they need.)
5. Click **Add to repository**.
6. GitHub will email them an invitation. They must click **Accept invitation** in that email (or visit the repo) before they can log in to the CMS.

> **One person per GitHub account.** Each board member needs their own GitHub account. Do not share accounts — every CMS edit shows up as a commit by the editing user, which is useful for traceability.

---

## 8. Logging in to the CMS

Board members access the CMS at:

```
https://your-site-url.com/admin/
```

For example: `https://washingtonplace.org/admin/`

### First login

1. Go to `/admin/` on the live site.
2. Click **Login with GitHub**.
3. A popup opens at github.com asking them to sign in (if they aren't already) and authorize the **WPIA Website CMS** application. Click **Authorize**.
4. The popup closes and the CMS dashboard opens, showing the four content sections: News, Events, Documents, Board Members.

> The "Authorize" prompt only appears the first time. After that, GitHub remembers the authorization and the popup will close immediately on subsequent logins.

### Forgotten password

Passwords are managed by GitHub, not by this site. If a board member forgets their GitHub password, they reset it at <https://github.com/password_reset>. Once they're back into GitHub, they can log in to the CMS again — no action needed on this site.

---

## 9. Staging and releasing changes

Netlify charges 15 credits for each production deploy (free tier = 300 credits/month) but **deploy previews are free**. To avoid burning credits on every CMS save, this site uses a two-branch workflow:

- **`staging` branch** — where routine CMS edits land. Netlify builds a free preview.
- **`main` branch** — what the public sees. Pushing here costs 15 credits.

### Two admin URLs

| URL | Writes to | When to use | Cost per save |
|---|---|---|---|
| `https://washingtonplace.org/admin/` | `staging` | Routine edits, drafts, anything not urgent | Free |
| `https://washingtonplace.org/admin-publish/` | `main` | Urgent posts that must go live immediately | 15 credits |

The two pages look identical except for a colored banner at the top: **green = staging**, **red = LIVE**. Both use the same GitHub login.

### Where to preview staging edits

When you save through `/admin/`, your changes appear on the staging deploy URL within ~60 seconds. The URL is in the Netlify dashboard under **Deploys** — anything tagged "Branch: staging" with a `staging--your-site.netlify.app` URL. Bookmark this URL.

### Releasing staging to production

When you're happy with what's on staging and want it live:

1. Go to <https://github.com/washingtonplace79/wpia-website/actions/workflows/release.yml>.
2. Click **Run workflow** → leave the branch as `main` → click the green **Run workflow** button.
3. The action merges `staging` into `main`. Netlify rebuilds production within ~60 seconds (one 15-credit deploy).

If there's nothing new on staging, the action exits without doing anything (no credits spent).

### What if someone uses `/admin-publish/`?

That goes straight to `main` and triggers a production deploy. The `Sync staging with main` action (in `.github/workflows/sync-staging.yml`) automatically merges those changes back into staging on every push to main, so the two branches stay in sync.

### One-time setup (already done — for reference)

- `staging` branch exists on GitHub
- Netlify has **Branch deploys** enabled for `staging` (Project configuration → Build & deploy → Continuous deployment → Branches and deploy contexts → "Let me add individual branches" → add `staging`)
- GitHub Actions are enabled on the repo

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
4. Click **Publish** (top right).

The site will rebuild and the post will appear within about 60 seconds.

### Editing an existing news post

1. Click **News & Announcements** in the sidebar.
2. Click the post title.
3. Make changes.
4. Click **Publish**.

### Deleting a news post

1. Open the post.
2. Click the three-dot menu (⋮) near the top right.
3. Click **Delete**.

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
4. Click **Publish**.

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
4. Click **Publish**.

The PDF is committed to the repo and the document row appears on the Documents page.

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

Removing someone from the Board Members content collection only removes them from the Contact page — it does **not** revoke their CMS login. To do that:

1. Go to <https://github.com/washingtonplace79/wpia-website/settings/access>.
2. Find the person in the collaborators list.
3. Click the **⋯** menu next to their name → **Remove access**.

They immediately lose write access to the repository, which means the CMS will refuse to save their changes the next time they try. They can still *open* `/admin/` and log in with GitHub, but any save attempt will fail. (Their existing GitHub account is unaffected — only their access to this specific repo is removed.)

---

## 14. Routine maintenance

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

## 15. Troubleshooting

### The site didn't update after I published something

- Wait 60–90 seconds — the rebuild takes a moment.
- In the Netlify dashboard, check **Deploys**. If the deploy shows as "Failed", click it to see the error log.
- The most common cause is a YAML formatting error in a content file. The error log will name the file.

### I can't log in to /admin/

- Make sure you accepted the GitHub collaborator invitation email before trying to log in. Pending invitations are listed at <https://github.com/notifications> or in the email itself.
- Try clearing browser cookies and cache, then visit `/admin/` again.
- If the login popup is blocked, allow popups for the site and try again.
- Open `https://your-site/auth` directly in a new tab. It should bounce to GitHub. If it shows a 500 error, the `OAUTH_CLIENT_ID` / `OAUTH_CLIENT_SECRET` env vars are missing or were added after the last deploy — see Section 4b/4c.
- If GitHub shows "redirect_uri mismatch", the OAuth App's **Authorization callback URL** doesn't match the site you're logging in from. Edit it at <https://github.com/settings/developers> to be exactly `https://YOUR-DOMAIN/auth/callback`.

### A board member didn't receive their invitation email

- Ask them to check their spam/junk folder.
- They can also accept directly: have them sign in to GitHub and open <https://github.com/washingtonplace79/wpia-website/invitations>.
- If the invitation expired (after 7 days), re-invite them at the repo's **Settings → Collaborators** page.

### A file uploaded to the Documents section is broken/not downloadable

- The PDF upload may have failed partway through. Delete the document entry and re-create it, re-uploading the file.
- Check the Netlify deploy log to confirm the file was committed to the repo (`public/uploads/`).

### The CMS shows "Failed to persist entry"

This means the CMS could not commit the change to GitHub. Common causes:
- The user is not a collaborator on the repo (or their invitation is still pending) — check Section 7.
- The user's GitHub session expired — log out of the CMS, log back in, retry.
- The user's collaborator role is **Read** instead of **Write** — bump it to Write at the repo's Settings → Collaborators page.
- A GitHub API rate limit was hit (rare) — wait a few minutes and try again.

### The build fails with a Zod validation error

Astro validates all content files against the schemas in `src/content/config.ts`. If a required field is missing or has the wrong type (e.g. a date formatted incorrectly), the build will fail.

Common issues:
- **Event date formatted as text** — dates must be `YYYY-MM-DD` (e.g. `2026-04-19`), not `April 19, 2026`. The CMS date picker produces the correct format automatically.
- **Tag or type not in the allowed list** — the CMS select widget prevents this, but manual file edits can introduce typos.

The Netlify deploy error log will show exactly which file and field caused the problem.

---

*Last updated: May 2026. For technical changes to the site code, contact the person who built the site.*
