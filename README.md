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

`npm run typecheck` checks TypeScript.

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

## Included features

- Original responsive design, category navigation, guides, posts and full-text search.
- In-page entry filtering, community-star filters and section navigation.
- Light, dark and AMOLED themes with accent choices.
- Startpage with web search and device-local shortcuts.
- Sanitized Markdown rendering and legacy FMHY link mapping.
- Source attribution and links to upstream contribution workflows.

This is an independent content mirror, not an official FMHY project. Exact parity with every FMHY application feature has not been verified. Community feedback submissions and third-party services remain on their original services.

## Project structure

- `app/`: Next.js pages, styles and server API routes.
- `components/atlas.tsx`: directory interface.
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
