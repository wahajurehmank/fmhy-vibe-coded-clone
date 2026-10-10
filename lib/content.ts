import { marked } from "marked";
import sanitizeHtml from "sanitize-html";
import snapshot from "@/data/snapshot.json";

export type DocMeta = {
  slug: string;
  title: string;
  description: string;
  date: string;
  count: number;
};
type SourceDoc = DocMeta & { raw: string };
export type Heading = { id: string; text: string; level: number };
const saved = snapshot.docs as Record<string, SourceDoc>;
const TTL = 15 * 60 * 1000;
const cache = new Map<string, { at: number; value: string }>();
const failures = new Map<string, number>();
const MAX_CACHED_DOCUMENTS = 120;
const pending = new Map<string, Promise<string>>();
async function upstream(path: string): Promise<string> {
  const hit = cache.get(path);
  if (hit && Date.now() - hit.at < TTL) return hit.value;
  if ((failures.get(path) || 0) > Date.now())
    throw new Error("Source temporarily unavailable");
  const inFlight = pending.get(path);
  if (inFlight) return inFlight;
  const job = (async () => {
    let value: string;
    try {
      const response = await fetch(
        `https://raw.githubusercontent.com/fmhy/edit/main/${path}`,
        {
          signal: AbortSignal.timeout(3000),
          headers: { "User-Agent": "FMHY-Atlas" },
          next: { revalidate: 900 },
        } as RequestInit,
      );
      if (!response.ok) throw new Error(`Upstream returned ${response.status}`);
      value = await response.text();
    } catch {
      const response = await fetch(
        `https://api.github.com/repos/fmhy/edit/contents/${path}?ref=main`,
        {
          signal: AbortSignal.timeout(5000),
          headers: {
            "User-Agent": "FMHY-Atlas",
            Accept: "application/vnd.github+json",
            ...(process.env.GITHUB_TOKEN
              ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
              : {}),
          },
          next: { revalidate: 900 },
        } as RequestInit,
      );
      if (!response.ok) throw new Error(`GitHub returned ${response.status}`);
      const data = (await response.json()) as {
        encoding: string;
        content: string;
      };
      if (data.encoding !== "base64" || typeof data.content !== "string")
        throw new Error("Invalid source response");
      value = new TextDecoder().decode(
        Uint8Array.from(atob(data.content.replace(/\s/g, "")), (c) =>
          c.charCodeAt(0),
        ),
      );
    }
    if (value.length > 2000000) throw new Error("Unexpected document size");
    failures.delete(path);
    if (cache.size >= MAX_CACHED_DOCUMENTS)
      cache.delete(cache.keys().next().value!);
    cache.set(path, { at: Date.now(), value });
    return value;
  })();
  pending.set(path, job);
  try {
    return await job;
  } catch (error) {
    if (failures.size >= MAX_CACHED_DOCUMENTS)
      failures.delete(failures.keys().next().value!);
    failures.set(path, Date.now() + 60000);
    throw error;
  } finally {
    pending.delete(path);
  }
}
export function slugify(text: string) {
  return text
    .replace(/<[^>]*>/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[\u200B-\u200D\u2060\uFEFF]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[\/_]/g, "-")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
function cleanText(s: string) {
  return s
    .replace(/<[^>]*>/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[*_`#►▷]/g, "")
    .trim();
}
function metadata(slug: string, raw: string): DocMeta {
  const fallback = saved[slug];
  return {
    slug,
    title:
      raw
        .match(/^title:\s*(.+)$/m)?.[1]
        ?.trim()
        .replace(/^['"]|['"]$/g, "") ||
      fallback?.title ||
      slug.split("/").pop()!.replace(/-/g, " "),
    description:
      raw.match(/^description:\s*(.+)$/m)?.[1]?.trim() ||
      fallback?.description ||
      "",
    date: raw.match(/^date:\s*(.+)$/m)?.[1]?.trim() || fallback?.date || "",
    count: (raw.match(/^\s*[-*] .+\]\(https?:\/\//gm) || []).length,
  };
}
export async function getRaw(slug: string) {
  if (
    slug.length > 160 ||
    !/^[a-zA-Z0-9][a-zA-Z0-9_-]*(?:\/[a-zA-Z0-9][a-zA-Z0-9_-]*){0,2}$/.test(
      slug,
    )
  )
    throw new Error("Invalid page");
  const source =
    slug === "other/contributing"
      ? ".github/CONTRIBUTING.md"
      : `docs/${slug}.md`;
  try {
    const raw = await upstream(source);
    return {
      ...metadata(slug, raw),
      raw,
      source: "live",
      checkedAt: new Date(cache.get(source)?.at || Date.now()).toISOString(),
    };
  } catch {
    if (!saved[slug]) return null;
    return { ...saved[slug], source: "snapshot", checkedAt: snapshot.syncedAt };
  }
}
let manifest: { at: number; slugs: string[]; revision: string } | null = null;
export async function getCatalog() {
  let fresh = false;
  try {
    if (!manifest || Date.now() - manifest.at > TTL) {
      const response = await fetch(
        "https://api.github.com/repos/fmhy/edit/git/trees/main?recursive=1",
        {
          headers: {
            "User-Agent": "FMHY-Atlas",
            Accept: "application/vnd.github+json",
            ...(process.env.GITHUB_TOKEN
              ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
              : {}),
          },
          signal: AbortSignal.timeout(8000),
          next: { revalidate: 900 },
        } as RequestInit,
      );
      if (!response.ok) throw new Error("Source unavailable");
      const json = (await response.json()) as {
        sha: string;
        truncated?: boolean;
        tree: { path: string }[];
      };
      if (json.truncated || !json.tree) throw new Error("Incomplete source");
      const slugs = json.tree
        .map((x) => x.path)
        .filter((p) => /^docs\/(?!\.|public\/).+\.md$/.test(p))
        .map((p) => p.slice(5, -3));
      if (slugs.length < 20) throw new Error("Incomplete catalog");
      manifest = { at: Date.now(), slugs, revision: json.sha };
    }
    fresh = true;
  } catch {
    /* Preserve the bundled directory when GitHub is unreachable. */
  }
  const slugs = manifest?.slugs || Object.keys(saved);
  const docs = slugs
    .filter((x) => x !== "sandbox")
    .map((slug) => {
      const { raw, ...meta } = saved[slug] || {
        ...metadata(slug, ""),
        raw: "",
      };
      return meta;
    });
  const home = await getRaw("index");
  const announcement = home?.raw.match(
    /announcement:\s*\n\s*title:\s*(.+)\n\s*link:\s*(\S+)/,
  );
  return {
    docs,
    source: fresh ? "live" : "snapshot",
    revision: manifest?.revision || snapshot.revision,
    checkedAt: fresh ? new Date().toISOString() : snapshot.syncedAt,
    announcement: announcement
      ? { title: announcement[1].trim(), url: announcement[2] }
      : null,
  };
}
const aliases: Record<string, string> = {
  "adblock-vpn-privacy": "privacy",
  android: "mobile",
  ios: "mobile",
  index: "",
  "tools-index": "",
  "tools-misc": "misc",
  games: "gaming",
  download: "downloading",
  torrent: "torrenting",
  edu: "educational",
  "social-media": "social-media-tools",
  "game-tools": "gaming-tools",
  linux: "linux-macos",
  "non-eng": "non-english",
  "dev-tools": "developer-tools",
};
export function normalizeUrl(href: string, current = "") {
  let url = href.replace(/^https?:\/\/(?:www\.)?fmhy.net(?=\/|$)/, "");
  url = url.replace(
    /^https?:\/\/(?:www\.)?reddit.com\/r\/FREEMEDIAHECKYEAH\/wiki\/([^/#?]+)\/?/i,
    (_, name) => "/" + (aliases[name] ?? name),
  );
  if (url.startsWith("/")) {
    url = url.replace(/\.md(?=#|$)/, "");
    if (url.includes("#wiki_")) {
      const [page, hash] = url.split("#wiki_");
      let decoded = hash
        .replace(/\.25(?:ba|b7)_?/gi, "")
        .replace(/\.([0-9a-f]{2})/gi, "%$1");
      try {
        decoded = decodeURIComponent(decoded);
      } catch {}
      url = page.replace(/\/$/, "") + "#" + slugify(decoded.replace(/_/g, " "));
    }
  }
  if (url.startsWith("./") || url.startsWith("../")) {
    try {
      const u = new URL(url, "https://atlas.local/" + current);
      url = u.pathname.replace(/\.md$/, "") + u.hash;
    } catch {}
  }
  return url || "/";
}
export function renderDoc(raw: string, slug: string) {
  let md = raw
    .replace(/^---\s*\n[\s\S]*?\n---\s*\n/, "")
    .replace(/<script\b[\s\S]*?<\/script>/gi, "")
    .replace(/<Post\b[^>]*\/>/g, "");
  md = md
    .replace(/^\*\*\*\s*\n/gm, "\n---\n")
    .replace(/^\*\*\[◄◄ Back to Wiki Index\].*$/gm, "")
    .replace(/^\s*(?:---\s*\n)+/, "");
  md = md.replace(/<WallpaperCard\s+([\s\S]*?)\/>/g, (_, attrs) => {
    const attr = (key: string) =>
      attrs.match(new RegExp(key + '="([^"]*)"'))?.[1] || "";
    return `\n### ${attr("title")}\n${attr("description")}\n\n![${attr("title")}](${attr("desktop")})\n\n[Desktop wallpaper](${attr("desktop")}) · [Mobile wallpaper](${attr("mobile")})\n`;
  });
  md = md.replace(/^!!!(?:note|info|tip|warning|danger)\s*(.*)$/gm, "> $1");
  md = md.replace(
    /^:::(?:info|tip|warning|danger|details)\s*(.*)\n([\s\S]*?)^:::\s*$/gm,
    (_, title, body) =>
      `\n> **${title || "Note"}**\n> ${body.trim().replace(/\n/g, "\n> ")}\n`,
  );
  const headings: Heading[] = [];
  const used = new Map<string, number>();
  const renderer = new marked.Renderer();
  renderer.heading = ({ tokens, depth }) => {
    const text = thisParser(tokens);
    const base = slugify(text);
    const n = used.get(base) || 0;
    used.set(base, n + 1);
    const id = base + (n ? "-" + n : "");
    headings.push({ id, text: cleanText(text), level: depth });
    return `<h${Math.min(depth + 1, 6)} id="${id}">${text}</h${Math.min(depth + 1, 6)}>`;
  };
  function thisParser(tokens: any[]) {
    return marked.Parser.parseInline(tokens);
  }
  const html = marked.parse(md, { renderer, async: false }) as string;
  const clean = sanitizeHtml(html, {
    allowedTags: [
      ...sanitizeHtml.defaults.allowedTags,
      "img",
      "details",
      "summary",
    ],
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      "*": ["id"],
      a: ["href", "title", "target", "rel"],
      img: [
        "src",
        "alt",
        "width",
        "height",
        "loading",
        "decoding",
        "referrerpolicy",
      ],
    },
    transformTags: {
      img: (_tag, attr) => ({
        tagName: "img",
        attribs: {
          ...attr,
          loading: "lazy",
          decoding: "async",
          referrerpolicy: "no-referrer",
        },
      }),
      a: (_tag, attr) => {
        const href = normalizeUrl(attr.href || "", slug);
        return {
          tagName: "a",
          attribs: {
            ...attr,
            href,
            ...(/^https?:/.test(href)
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {}),
          },
        };
      },
    },
    allowedSchemes: ["http", "https", "mailto", "magnet"],
    allowProtocolRelative: false,
  });
  return { html: clean, headings };
}
export async function getDocument(slug: string) {
  if (
    slug.length > 160 ||
    !/^[a-zA-Z0-9][a-zA-Z0-9_-]*(?:\/[a-zA-Z0-9][a-zA-Z0-9_-]*){0,2}$/.test(
      slug,
    )
  )
    throw new Error("Invalid page");
  if (
    !saved[slug] &&
    !(await getCatalog()).docs.some((doc) => doc.slug === slug)
  )
    return null;
  const doc = await getRaw(slug);
  return doc ? { ...doc, raw: undefined, ...renderDoc(doc.raw, slug) } : null;
}
type SearchRow = {
  title: string;
  snippet: string;
  url: string;
  category: string;
  starred: boolean;
  lower: string;
};
const searchCache = new Map<string, { raw: string; rows: SearchRow[] }>();
function indexDocument(doc: SourceDoc): SearchRow[] {
  const cached = searchCache.get(doc.slug);
  if (cached?.raw === doc.raw) return cached.rows;
  const rows: SearchRow[] = [];
  let anchor = "";
  const used = new Map<string, number>();
  for (const line of doc.raw
    .replace(/^---\s*\n[\s\S]*?\n---\s*\n/, "")
    .split("\n")) {
    if (/^#{1,6} /.test(line)) {
      const base = slugify(line.replace(/^#+ /, ""));
      const n = used.get(base) || 0;
      used.set(base, n + 1);
      anchor = base + (n ? "-" + n : "");
    }
    if (line.length < 6 || line.length > 8000) continue;
    const link = line.match(/\[([^\]]+)\]\(([^)]+)\)/);
    const title = link ? cleanText(link[1]) : cleanText(line).slice(0, 100);
    if (!title) continue;
    rows.push({
      title,
      snippet: cleanText(line).slice(0, 360),
      url: `/${doc.slug}${anchor ? "#" + anchor : ""}`,
      category: doc.title,
      starred: line.includes("⭐"),
      lower: line.toLowerCase().replace(/[\u200B-\u200D\u2060\uFEFF]/g, ""),
    });
  }
  if (searchCache.size >= 120)
    searchCache.delete(searchCache.keys().next().value!);
  searchCache.set(doc.slug, { raw: doc.raw, rows });
  return rows;
}
export async function searchDirectory(query: string, batch = 0) {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean).slice(0, 8);
  if (!terms.length)
    return { results: [], total: 0, batches: 1, source: "live" };
  const catalog = await getCatalog();
  const slugs = catalog.docs
    .map((d) => d.slug)
    .filter(
      (slug) => !["index", "posts", "startpage", "sandbox"].includes(slug),
    );
  const size = 12;
  const batches = Math.ceil(slugs.length / size);
  if (batch >= batches)
    return { results: [], total: 0, batches, source: "live" };
  const selected = slugs.slice(batch * size, (batch + 1) * size);
  const live: Awaited<ReturnType<typeof getRaw>>[] = [];
  // Keep each request's upstream work bounded and return cached rows across queries.
  for (let offset = 0; offset < selected.length; offset += 6)
    live.push(
      ...(await Promise.all(selected.slice(offset, offset + 6).map(getRaw))),
    );
  const results = [];
  for (const doc of live)
    if (doc)
      for (const row of indexDocument(doc))
        if (terms.every((t) => row.lower.includes(t))) {
          const { lower, ...result } = row;
          results.push({
            ...result,
            score:
              (row.title.toLowerCase() === query.toLowerCase()
                ? 100
                : terms.every((t) => row.title.toLowerCase().includes(t))
                  ? 50
                  : 0) + (row.starred ? 5 : 0),
          });
        }
  results.sort((a, b) => b.score - a.score);
  return {
    results: results.slice(0, 150),
    total: results.length,
    batches,
    source: live.some((d) => d?.source === "snapshot") ? "mixed" : "live",
  };
}
