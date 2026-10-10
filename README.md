# FMHY Atlas

An independent, responsive presentation of the FMHY directory, ready to deploy from your GitHub repository to Vercel or Netlify.

## Deploy in a few steps

1. Extract this ZIP.
2. Create a GitHub repository and upload **the extracted files**, with `package.json` and this README at the repository root. Include `.gitignore` and `.nvmrc`. Do not upload the ZIP itself or `node_modules`.
3. Import the repository into Vercel or Netlify using the instructions below.

No database, paid API, or required environment variables are needed. The deployed website will follow the hosting provider's normal access settings; the private access of the earlier ChatGPT-hosted site is not carried over.

### Vercel

- Choose **Add New → Project**, then import your GitHub repository.
- Framework preset: **Next.js**.
- Root directory: the folder containing `package.json` (normally the repository root).
- Keep the framework's default output directory. Build: `npm run build`; install: `npm ci`.
- Use Node.js **22.x** and deploy.

### Netlify

- Choose **Add new project → Import an existing project** and select your GitHub repository.
- Base directory: repository root.
- Build command: `npm run build`.
- Publish directory: `.next`.
- The included `netlify.toml` supplies these settings and Node.js 22.
- Netlify automatically installs its current Next.js adapter. Do not disable it or add a static SPA redirect.

Use repository import, not Netlify's static drag-and-drop deployment. The site needs its Next.js server routes to fetch updates and search the directory. Do not set `output: 'export'`, use GitHub Pages, or change the publish directory to `public` or `out`.

## Local development

Install Node.js 22, then:

```bash
npm ci
npm run dev
```

Open http://localhost:3000. For a production check:

```bash
npm run build
npm start
```

`npm run typecheck` checks TypeScript. `npm run test:security` checks sanitization, unsafe links, fallback behavior and invalid source paths.

## How automatic updates work

- The server reads the public `fmhy/edit` repository. No fork-sync workflow is necessary.
- Each page retrieves its upstream Markdown when visited; successful responses are cached for up to 15 minutes in a running server instance.
- Open pages recheck every 15 minutes. New source Markdown pages are discovered from the repository tree.
- Search reads the directory in bounded batches and ranks name matches and starred entries.
- If GitHub is unavailable or rate-limits requests, a bundled snapshot is shown and labeled as saved content. Newly added pages without a snapshot may be unavailable during an outage.
- Homepage entry counts are snapshot counts; the opened page shows its current entry count.
- Updates happen on requests, not as a continuously running background process. Upstream changes do not require redeployment. Your own code/design changes redeploy through the hosting provider's GitHub integration.

### Optional GitHub token

The raw-content endpoint is used first. GitHub's API is a fallback and supplies the directory tree. If API rate limits become a problem, add `GITHUB_TOKEN` as a **server-only** environment variable in your hosting dashboard and redeploy. Only public repository read access is needed. Do not add a real token to GitHub or prefix its name with `NEXT_PUBLIC_`. For local use, copy `.env.example` to `.env.local`.

## Theme options

Open **Theme** in the top bar. Choose Classic, Brutalism, Bento grid, Claymorphism, Maximalism or Glassmorphism. Layout is independent of light/dark/AMOLED brightness and accent color. Preferences are checked against an allowlist, saved on your device and applied before the first paint. Bento is the default. All five new styles use restrained color, readable type and limited ornament.

The theme settings use a native modal dialog with keyboard focus containment, Escape-to-close and focus restoration. Animations respect reduced-motion preferences. Glass blur is limited to the header to keep scrolling light.

## Security and maintenance

- Next.js upgraded to 16.4.0. The dependency audit on 2026-10-10 reported zero currently listed vulnerabilities.
- Per-response nonce-based Content Security Policy restricts executable scripts; no inline event handlers or production eval are allowed. Inline styles remain allowed for framework compatibility.
- Clickjacking protection, MIME sniffing protection, a restrictive permissions policy, referrer policy and HTTPS transport headers are configured.
- Source URLs stay inside the fixed public FMHY repository. Invalid source paths and malformed search batches are rejected. Cache sizes, search batches and input lengths are bounded.
- Markdown is sanitized before rendering. Injected scripts, unsafe links, arbitrary content classes and event handlers are removed. External images load lazily without a referrer.
- Device-local shortcuts and appearance settings are validated before use. API tokens remain server-only.
- Failed source requests back off; search indexes reuse parsed rows, and speculative directory prefetching is disabled.
- Dependency update checks are configured in `.github/dependabot.yml`. Enable Dependabot security updates in your GitHub repository settings if desired. Updates still require review and deployment.

Next.js announced a further upstream security update planned for **2026-10-14**, with affected versions and full impact not yet published as of this export. Apply the relevant patch once available. Announcement: https://nextjs.org/blog/upcoming-nextjs-security-update-october-2026

These measures are application hardening, not a security certification. Public API traffic controls across server instances remain a hosting-platform responsibility. No credentials or user records are stored by this application.

## Included features

- Original responsive design, category navigation, guides, posts and full-text search.
- In-page entry filtering, community-star filters and section navigation.
- Six layout choices, including the five requested styles, plus light/dark/AMOLED modes and muted accent choices.
- Startpage with web search and device-local shortcuts.
- Sanitized Markdown rendering and legacy FMHY link mapping.
- Source attribution and links to upstream contribution workflows.

This is an independent content mirror, not an official FMHY project. Exact parity with every FMHY application feature has not been verified. Community feedback submissions and third-party services remain on their original services.

## Project structure

- `app/`: Next.js pages, styles and server API routes.
- `components/atlas.tsx`: directory interface.
- `components/appearance.tsx`: accessible layout and appearance settings.
- `app/themes.css`: theme-specific layouts and calm shared styling.
- `proxy.ts`: per-response nonce and Content Security Policy.
- `lib/content.ts`: upstream retrieval, cache, Markdown rendering and search.
- `data/`: initial source snapshot and catalog.
- `public/favicon.svg`: site icon.
- `netlify.toml` / `vercel.json`: deployment configuration.

The archive contains portable source files and an npm lockfile. It excludes hosting credentials, ChatGPT-specific infrastructure, Git history, dependencies and generated builds.

## Attribution

Directory content: FMHY contributors, https://fmhy.net and https://github.com/fmhy/edit.
The bundled snapshot records its upstream revision and timestamp in `data/snapshot.json`.
Third-party packages retain their own licenses. No new license is asserted over upstream directory content.

## Hosting documentation

- Vercel: https://vercel.com/docs/frameworks/full-stack/nextjs
- Netlify: https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/
- Next.js deployment: https://nextjs.org/docs/app/getting-started/deploying
