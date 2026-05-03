# Washington Place Improvement Association — Operations Guide

This guide covers everything needed to deploy the site, connect it to Netlify, manage board member CMS access, publish content, and handle day-to-day operations.

---

## Table of contents

1. [Prerequisites](#1-prerequisites)
2. [Push the project to GitHub](#2-push-the-project-to-github)
3. [Connect to Netlify and deploy](#3-connect-to-netlify-and-deploy)
4. [Enable Netlify Identity and Git Gateway](#4-enable-netlify-identity-and-git-gateway)
5. [Set a custom domain](#5-set-a-custom-domain)
6. [Update astro.config.mjs with your live URL](#6-update-astroconfigmjs-with-your-live-url)
7. [Invite board members to the CMS](#7-invite-board-members-to-the-cms)
8. [Logging in to the CMS](#8-logging-in-to-the-cms)
9. [Managing content](#9-managing-content)
10. [Managing document files (PDF uploads)](#10-managing-document-files-pdf-uploads)
11. [Viewing contact form submissions](#11-viewing-contact-form-submissions)
12. [Adding or removing board members](#12-adding-or-removing-board-members)
13. [Routine maintenance](#13-routine-maintenance)
14. [Troubleshooting](#14-troubleshooting)

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

## 4. Enable Netlify Identity and Git Gateway

This is required for the CMS login to work.

### Enable Netlify Identity

1. In your Netlify dashboard, open your site.
2. Go to **Site configuration** → **Identity** (in the left sidebar).
3. Click **Enable Identity**.
4. Under **Registration**, set it to **Invite only**. This means only people you invite can create an account — important for a private board CMS.
5. Under **External providers**, you can optionally enable Google login for convenience.

### Enable Git Gateway

Git Gateway is what allows the CMS to commit changes to your GitHub repo on behalf of logged-in users.

1. Still in **Site configuration → Identity**, scroll down to **Services**.
2. Click **Enable Git Gateway**.

That's it. The CMS is now connected to your repo.

---

## 5. Set a custom domain

> Skip this section if you're keeping the `.netlify.app` URL for now.

1. In the Netlify dashboard, go to **Site configuration → Domain management**.
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

Each board member who needs to edit the site needs a Netlify Identity account.

1. In the Netlify dashboard, go to **Site configuration → Identity**.
2. Click **Invite users**.
3. Enter the board member's email address and click **Send**.
4. They will receive an email from Netlify with a link to set their password.
5. They click the link, set a password, and they're ready to log in.

> **One invitation per person.** Each board member needs their own email address. Do not share accounts.

---

## 8. Logging in to the CMS

Board members access the CMS at:

```
https://your-site-url.com/admin/
```

For example: `https://washingtonplace.org/admin/`

### First login

1. Go to `/admin/` on the live site.
2. Click **Login with Netlify Identity**.
3. Enter the email address that received the invitation.
4. Enter the password that was set when accepting the invitation.
5. The CMS dashboard opens, showing the four content sections: News, Events, Documents, Board Members.

### Forgotten password

Board members can reset their own password by clicking **Forgot password?** on the login screen. A reset email will be sent to their address.

---

## 9. Managing content

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

## 10. Managing document files (PDF uploads)

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

## 11. Viewing contact form submissions

The contact form on the Contact page sends submissions to Netlify Forms — no email server or third-party service required.

1. In the Netlify dashboard, go to **Forms** (in the top navigation or sidebar).
2. You'll see a form called **contact**.
3. Click it to view all submissions, including name, email, subject, and message.
4. You can download submissions as a CSV if needed.

### Email notifications

To receive an email each time someone submits the form:

1. In the Netlify dashboard, go to **Site configuration → Forms → Form notifications**.
2. Click **Add notification** → **Email notification**.
3. Enter the board's email address.
4. Click **Save**.

From then on, every form submission sends an email to that address immediately.

---

## 12. Adding or removing board members

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

1. In the Netlify dashboard, go to **Site configuration → Identity**.
2. Find the person's email under **Users**.
3. Click their name → **Delete user**.

They will immediately lose the ability to log in to `/admin/`.

---

## 13. Routine maintenance

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

## 14. Troubleshooting

### The site didn't update after I published something

- Wait 60–90 seconds — the rebuild takes a moment.
- In the Netlify dashboard, check **Deploys**. If the deploy shows as "Failed", click it to see the error log.
- The most common cause is a YAML formatting error in a content file. The error log will name the file.

### I can't log in to /admin/

- Make sure you accepted the invitation email and set your password before trying to log in.
- Try clearing browser cookies and cache, then visit `/admin/` again.
- Check that Netlify Identity and Git Gateway are both enabled (see Section 4).
- If the login popup doesn't appear, the Netlify Identity widget may be blocked by a browser extension. Try in a private/incognito window.

### A board member didn't receive their invitation email

- Ask them to check their spam/junk folder — Netlify invitation emails sometimes land there.
- In the Netlify dashboard → Identity → Users, find the pending invitation and click **Resend**.

### A file uploaded to the Documents section is broken/not downloadable

- The PDF upload may have failed partway through. Delete the document entry and re-create it, re-uploading the file.
- Check the Netlify deploy log to confirm the file was committed to the repo (`public/uploads/`).

### The CMS shows "Failed to persist entry"

This means the CMS could not commit the change to GitHub. Common causes:
- Git Gateway is not enabled — check Section 4.
- The user's Netlify Identity session has expired — log out and log back in.
- A GitHub API rate limit was hit (rare) — wait a few minutes and try again.

### The build fails with a Zod validation error

Astro validates all content files against the schemas in `src/content/config.ts`. If a required field is missing or has the wrong type (e.g. a date formatted incorrectly), the build will fail.

Common issues:
- **Event date formatted as text** — dates must be `YYYY-MM-DD` (e.g. `2026-04-19`), not `April 19, 2026`. The CMS date picker produces the correct format automatically.
- **Tag or type not in the allowed list** — the CMS select widget prevents this, but manual file edits can introduce typos.

The Netlify deploy error log will show exactly which file and field caused the problem.

---

*Last updated: April 2026. For technical changes to the site code, contact the person who built the site.*
