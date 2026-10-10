"use client";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  Compass,
  Grid2X2,
  ShieldCheck,
  Sparkles,
  Tv,
  Headphones,
  Gamepad2,
  BookOpen,
  GraduationCap,
  Download,
  Network,
  Monitor,
  Smartphone,
  Globe,
  Code2,
  Image,
  Video,
  FileText,
  Folder,
  Settings,
  Radio,
  Layers,
  ChevronRight,
  Menu,
  X,
  Sun,
  Moon,
  Check,
  RefreshCw,
  Star,
  ExternalLink,
  Command,
  Info,
  Palette,
  Home,
  Plus,
  Trash2,
} from "lucide-react";
import seed from "@/data/catalog.json";
import Appearance from "./appearance";
import type { DocMeta, Heading } from "@/lib/content";
type Doc = DocMeta & {
  html: string;
  headings: Heading[];
  source: string;
  checkedAt: string;
};
type Result = {
  title: string;
  snippet: string;
  url: string;
  category: string;
  starred: boolean;
};
const categories = [
  {
    slug: "privacy",
    label: "Adblocking & Privacy",
    short: "Privacy",
    description: "Take back control of your digital life.",
    icon: ShieldCheck,
    tags: ["Adblockers", "VPNs", "Security"],
    group: "Essentials",
    color: "green",
  },
  {
    slug: "ai",
    label: "Artificial Intelligence",
    short: "Artificial Intelligence",
    description: "Find your next intelligent assistant.",
    icon: Sparkles,
    tags: ["Chatbots", "Image generation", "Local AI"],
    group: "Essentials",
    color: "blue",
  },
  {
    slug: "video",
    label: "Movies, TV & Anime",
    short: "Streaming",
    description: "A world of stories, ready to explore.",
    icon: Tv,
    tags: ["Movies", "Series", "Anime"],
    group: "Entertainment",
    color: "orange",
  },
  {
    slug: "audio",
    label: "Music, Podcasts & Radio",
    short: "Listening",
    description: "Find the soundtrack to just about anything.",
    icon: Headphones,
    tags: ["Music", "Podcasts", "Radio"],
    group: "Entertainment",
    color: "purple",
  },
  {
    slug: "gaming",
    label: "Gaming & Emulation",
    short: "Gaming",
    description: "New worlds. Old favorites. Endless play.",
    icon: Gamepad2,
    tags: ["PC games", "Emulators", "ROMs"],
    group: "Entertainment",
    color: "pink",
  },
  {
    slug: "reading",
    label: "Books, Comics & Manga",
    short: "Reading",
    description: "Something for every curious mind.",
    icon: BookOpen,
    tags: ["Ebooks", "Comics", "Manga"],
    group: "Entertainment",
    color: "yellow",
  },
  {
    slug: "educational",
    label: "Learning & Education",
    short: "Education",
    description: "Go deeper into whatever interests you.",
    icon: GraduationCap,
    tags: ["Courses", "Skills", "Research"],
    group: "Essentials",
    color: "blue",
  },
  {
    slug: "downloading",
    label: "Downloading",
    short: "Downloading",
    description: "Explore software and open directories.",
    icon: Download,
    tags: ["Software", "Directories"],
    group: "Platforms",
    color: "green",
  },
  {
    slug: "torrenting",
    label: "Torrenting",
    short: "Torrenting",
    description: "Clients, trackers and community indexes.",
    icon: Network,
    tags: ["Clients", "Trackers"],
    group: "Platforms",
    color: "purple",
  },
  {
    slug: "mobile",
    label: "Android & iOS",
    short: "Mobile",
    description: "Make more of the device in your pocket.",
    icon: Smartphone,
    tags: ["Android", "iOS", "Apps"],
    group: "Platforms",
    color: "orange",
  },
  {
    slug: "linux-macos",
    label: "Linux & macOS",
    short: "Linux & macOS",
    description: "Tools and software for your operating system.",
    icon: Monitor,
    tags: ["Linux", "macOS"],
    group: "Platforms",
    color: "blue",
  },
  {
    slug: "developer-tools",
    label: "Developer Tools",
    short: "Developer Tools",
    description: "Everything between an idea and a finished build.",
    icon: Code2,
    tags: ["Code", "Hosting", "Git"],
    group: "Tools",
    color: "green",
  },
  {
    slug: "internet-tools",
    label: "Internet Tools",
    short: "Internet Tools",
    description: "A better way to use the web.",
    icon: Globe,
    tags: ["Browsers", "Search", "Extensions"],
    group: "Tools",
    color: "blue",
  },
  {
    slug: "system-tools",
    label: "System Tools",
    short: "System Tools",
    description: "Tune, maintain and customize your computer.",
    icon: Settings,
    tags: ["Windows", "Hardware"],
    group: "Tools",
    color: "purple",
  },
  {
    slug: "file-tools",
    label: "File Tools",
    short: "File Tools",
    description: "Manage, share and organize your files.",
    icon: Folder,
    tags: ["Hosting", "Storage", "Archives"],
    group: "Tools",
    color: "yellow",
  },
  {
    slug: "image-tools",
    label: "Image Tools",
    short: "Image Tools",
    description: "Create, edit and find the perfect image.",
    icon: Image,
    tags: ["Editors", "Design", "Images"],
    group: "Tools",
    color: "pink",
  },
  {
    slug: "video-tools",
    label: "Video Tools",
    short: "Video Tools",
    description: "Your toolkit for moving pictures.",
    icon: Video,
    tags: ["Editing", "Players"],
    group: "Tools",
    color: "orange",
  },
  {
    slug: "text-tools",
    label: "Text Tools",
    short: "Text Tools",
    description: "Work with words in entirely new ways.",
    icon: FileText,
    tags: ["Writing", "Fonts", "Translation"],
    group: "Tools",
    color: "green",
  },
  {
    slug: "gaming-tools",
    label: "Gaming Tools",
    short: "Gaming Tools",
    description: "Get more out of every game.",
    icon: Gamepad2,
    tags: ["Launchers", "Optimization"],
    group: "Tools",
    color: "pink",
  },
  {
    slug: "social-media-tools",
    label: "Social Media Tools",
    short: "Social Media",
    description: "Useful extras for your online communities.",
    icon: Radio,
    tags: ["Discord", "Reddit", "YouTube"],
    group: "Tools",
    color: "blue",
  },
  {
    slug: "non-english",
    label: "Non-English",
    short: "Non-English",
    description: "Discover resources in your language.",
    icon: Globe,
    tags: ["International", "Languages"],
    group: "More",
    color: "purple",
  },
  {
    slug: "misc",
    label: "Miscellaneous",
    short: "Miscellaneous",
    description: "The wonderfully hard to categorize.",
    icon: Layers,
    tags: ["Interesting", "Fun", "Everyday"],
    group: "More",
    color: "orange",
  },
  {
    slug: "storage",
    label: "Extended Collections",
    short: "Extended Collections",
    description: "Even more resources from across the directory.",
    icon: Folder,
    tags: ["Collections", "Archives"],
    group: "More",
    color: "yellow",
  },
];
const guides = [
  { slug: "beginners-guide", label: "Beginners Guide", icon: BookOpen },
  { slug: "posts", label: "Updates & Changelog", icon: RefreshCw },
  { slug: "unsafe", label: "Unsafe Sites", icon: ShieldCheck },
  { slug: "other/FAQ", label: "Frequently Asked Questions", icon: Info },
  { slug: "other/contributing", label: "Contribute", icon: Plus },
  { slug: "other/backups", label: "Backups", icon: Folder },
  { slug: "other/selfhosting", label: "Selfhosting", icon: Monitor },
  { slug: "other/wallpapers", label: "Wallpapers", icon: Image },
  { slug: "feedback", label: "Community Feedback", icon: Radio },
];
const groups = [
  "All categories",
  "Essentials",
  "Entertainment",
  "Tools",
  "Platforms",
  "More",
];
function count(n: number) {
  return n.toLocaleString("en-US");
}
function Logo() {
  return (
    <span className="brand-mark" aria-hidden="true">
      a<span>◆</span>
    </span>
  );
}
function Startpage() {
  const [links, setLinks] = useState([
    { name: "GitHub", url: "https://github.com" },
    { name: "Wikipedia", url: "https://wikipedia.org" },
    { name: "Hacker News", url: "https://news.ycombinator.com" },
    { name: "FMHY Guide", url: "/beginners-guide" },
  ]);
  const [now, setNow] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    try {
      const data = JSON.parse(
        localStorage.getItem("atlas-shortcuts") || "null",
      );
      if (Array.isArray(data))
        setLinks(
          data
            .filter(
              (x): x is { name: string; url: string } =>
                !!x &&
                typeof x.name === "string" &&
                x.name.length <= 40 &&
                typeof x.url === "string" &&
                (/^https?:\/\//i.test(x.url) || /^\/(?!\/)/.test(x.url)),
            )
            .slice(0, 24),
        );
    } catch {}
    const tick = () =>
      setNow(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, []);
  const save = (value: typeof links) => {
    setLinks(value);
    try {
      localStorage.setItem("atlas-shortcuts", JSON.stringify(value));
    } catch {
      setError("Your browser could not save these shortcuts.");
    }
  };
  return (
    <div className="startpage">
      <div className="eyebrow">YOUR CORNER OF THE INTERNET</div>
      <div className="clock">{now || "Startpage"}</div>
      <h1>A good place to begin.</h1>
      <form
        action="https://searx.fmhy.net/search"
        method="get"
        className="big-search"
      >
        <Search />
        <input
          name="q"
          required
          aria-label="Search the web"
          placeholder="Search the web with SearXNG"
        />
        <button type="submit">Search</button>
      </form>
      <div className="shortcuts">
        {links.map((l, i) => (
          <div key={l.url}>
            <a href={l.url}>
              <Globe />
              <strong>{l.name}</strong>
            </a>
            <button
              aria-label={`Remove ${l.name}`}
              onClick={() => save(links.filter((_, j) => j !== i))}
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
        <button className="add-shortcut" onClick={() => setAdding(!adding)}>
          <Plus />
          Add shortcut
        </button>
      </div>
      {adding && (
        <form
          className="shortcut-form"
          onSubmit={(e) => {
            e.preventDefault();
            const data = new FormData(e.currentTarget);
            let url = String(data.get("url"));
            try {
              const u = new URL(url);
              if (!["http:", "https:"].includes(u.protocol)) throw Error();
              if (links.length >= 24) {
                setError("You can save up to 24 shortcuts.");
                return;
              }
              save([
                ...links,
                {
                  name: String(data.get("name")).trim().slice(0, 40),
                  url: u.href,
                },
              ]);
              setAdding(false);
              setError("");
            } catch {
              setError("Enter a complete http or https address.");
            }
          }}
        >
          <input
            name="name"
            placeholder="Name"
            aria-label="Shortcut name"
            required
            maxLength={40}
          />
          <input
            name="url"
            placeholder="https://example.com"
            aria-label="Shortcut URL"
            required
          />
          <button className="pill" type="submit">
            Save shortcut
          </button>
        </form>
      )}
      {error && <p role="alert">{error}</p>}
      <p className="muted">Shortcuts are saved on this device.</p>
    </div>
  );
}
export default function Atlas() {
  const pathname = usePathname() || "/";
  const router = useRouter();
  const routeQuery = useSearchParams()?.get("q") || "";
  const slug = pathname.replace(/^\/|\/$/g, "");
  const home = !slug;
  const isSearch = slug === "search";
  const [docs, setDocs] = useState<DocMeta[]>(Object.values(seed));
  const [source, setSource] = useState("checking");
  const [checked, setChecked] = useState("");
  const [revision, setRevision] = useState("");
  const [announcement, setAnnouncement] = useState<{
    title: string;
    url: string;
  } | null>(null);
  const [doc, setDoc] = useState<Doc | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [menu, setMenu] = useState(false);
  const [group, setGroup] = useState("All categories");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [searchTotal, setSearchTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [onlyStars, setOnlyStars] = useState(false);
  const [filter, setFilter] = useState("");
  const [toc, setToc] = useState(false);
  const [activeHeading, setActiveHeading] = useState("");
  const deferredFilter = useDeferredValue(filter);
  const inputRef = useRef<HTMLInputElement>(null);
  const articleRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const tick = setInterval(() => {
      if (document.visibilityState === "visible") setRefresh((x) => x + 1);
    }, 900000);
    const key = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape") {
        setMenu(false);
        setToc(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", key);
    return () => {
      clearInterval(tick);
      window.removeEventListener("keydown", key);
    };
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/catalog", { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw Error();
        return r.json() as Promise<{
          docs: DocMeta[];
          source: string;
          checkedAt: string;
          revision: string;
          announcement: { title: string; url: string } | null;
        }>;
      })
      .then((data) => {
        setDocs(data.docs);
        setSource(data.source);
        setChecked(data.checkedAt);
        setRevision(data.revision);
        setAnnouncement(data.announcement);
      })
      .catch((e) => {
        if (e.name !== "AbortError") setSource("snapshot");
      });
    return () => controller.abort();
  }, [refresh]);
  useEffect(() => {
    setError("");
    if (doc?.slug !== slug) setDoc(null);
    if (!slug || slug === "posts" || slug === "startpage") {
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    if (doc?.slug !== slug || isSearch) setLoading(true);
    if (isSearch) {
      const q = routeQuery;
      setQuery(q);
      setSearchQuery(q);
      (async () => {
        const fetchBatch = async (batch: number) => {
          const response = await fetch(
            "/api/search?q=" + encodeURIComponent(q) + "&batch=" + batch,
            { signal: controller.signal },
          );
          if (!response.ok) throw Error();
          return (await response.json()) as {
            results: (Result & { score: number })[];
            total: number;
            batches: number;
          };
        };
        const first = await fetchBatch(0);
        const rest = await Promise.allSettled(
          Array.from({ length: Math.max(0, first.batches - 1) }, (_, i) =>
            fetchBatch(i + 1),
          ),
        );
        const batches = [
          first,
          ...rest.flatMap((result) =>
            result.status === "fulfilled" ? [result.value] : [],
          ),
        ];
        if (
          rest.some((result) => result.status === "rejected") &&
          !controller.signal.aborted
        )
          setError(
            "Some sections could not be searched. These results are partial.",
          );
        const combined = batches
          .flatMap((b) => b.results)
          .sort((a, b) => b.score - a.score);
        if (controller.signal.aborted) return;
        setResults(combined.slice(0, 150));
        setSearchTotal(batches.reduce((n, b) => n + b.total, 0));
        setLoading(false);
      })().catch((e) => {
        if (e.name !== "AbortError") {
          setError("Search could not load. Please try again.");
          setLoading(false);
        }
      });
    } else
      fetch("/api/document?slug=" + encodeURIComponent(slug), {
        signal: controller.signal,
      })
        .then((r) => {
          if (!r.ok)
            throw Error(
              r.status === 404
                ? "This page could not be found."
                : "This page could not load.",
            );
          return r.json() as Promise<Doc>;
        })
        .then((data) => {
          if (controller.signal.aborted) return;
          setDoc(data);
          setLoading(false);
          document.title = data.title + " · FMHY Atlas";
          if (!controller.signal.aborted)
            setTimeout(() => {
              if (!controller.signal.aborted && window.location.hash) {
                let id = "";
                try {
                  id = decodeURIComponent(window.location.hash.slice(1));
                } catch {}
                document.getElementById(id)?.scrollIntoView();
              }
            }, 100);
        })
        .catch((e) => {
          if (e.name !== "AbortError") {
            setError(e.message);
            setLoading(false);
          }
        });
    return () => controller.abort();
  }, [slug, isSearch, refresh, routeQuery]);
  useEffect(() => {
    setMenu(false);
    setToc(false);
    setFilter("");
    setOnlyStars(false);
    setActiveHeading("");
  }, [slug]);
  useEffect(() => {
    if (home) document.title = "FMHY Atlas — A directory of the free internet";
  }, [home]);
  useEffect(() => {
    const root = articleRef.current;
    if (!root) return;
    root.querySelectorAll("li").forEach((li) => {
      const text = li.textContent || "";
      const show =
        (!onlyStars || text.includes("⭐")) &&
        (!deferredFilter ||
          text.toLowerCase().includes(deferredFilter.toLowerCase()));
      (li as HTMLElement).hidden = !show;
    });
  }, [doc, onlyStars, deferredFilter]);
  useEffect(() => {
    if (!doc || !articleRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries)
          if (e.isIntersecting) setActiveHeading(e.target.id);
      },
      { rootMargin: "-90px 0px -65% 0px" },
    );
    articleRef.current
      .querySelectorAll("h2,h3,h4")
      .forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [doc]);
  const bySlug = useMemo(
    () => Object.fromEntries(docs.map((d) => [d.slug, d])),
    [docs],
  );
  const known = new Set(categories.map((c) => c.slug));
  const extra = docs.filter(
    (d) =>
      !d.slug.includes("/") &&
      !known.has(d.slug) &&
      ![
        "index",
        "posts",
        "startpage",
        "sandbox",
        "beginners-guide",
        "feedback",
        "unsafe",
      ].includes(d.slug),
  );
  const visible = categories.filter(
    (c) => group === "All categories" || c.group === group,
  );
  const total = categories.reduce(
    (s, c) => s + (bySlug[c.slug]?.count || 0),
    0,
  );
  const activeCategory = categories.find((c) => c.slug === slug);
  const posts = docs
    .filter((d) => d.slug.startsWith("posts/"))
    .sort((a, b) => b.date.localeCompare(a.date));
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearchQuery(query.trim());
    router.push("/search?q=" + encodeURIComponent(query.trim()));
  };
  const statusSource = doc?.source || source;
  const statusDate = doc?.checkedAt || checked;
  return (
    <div className="atlas-shell">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <aside className={"sidebar " + (menu ? "open" : "")}>
        <Link prefetch={false} href="/" className="brand">
          <Logo />
          <span>
            FMHY<span className="brand-sub">ATLAS</span>
          </span>
        </Link>
        <button
          className="mobile-close icon-button"
          aria-label="Close navigation"
          onClick={() => setMenu(false)}
        >
          <X />
        </button>
        <nav aria-label="Main navigation">
          <div className="nav-start">
            <Link prefetch={false} href="/" className={home ? "active" : ""}>
              <Compass size={18} />
              Explore the directory
              <span className="nav-dot" />
            </Link>
            <Link
              prefetch={false}
              href="/beginners-guide"
              className={slug === "beginners-guide" ? "active" : ""}
            >
              <BookOpen size={18} />
              Beginners guide
            </Link>
            <Link
              prefetch={false}
              href="/posts"
              className={slug === "posts" ? "active" : ""}
            >
              <RefreshCw size={17} />
              What's new
            </Link>
          </div>
          <div className="nav-label">
            THE DIRECTORY <span>{categories.length + extra.length}</span>
          </div>
          {["Essentials", "Entertainment", "Platforms", "Tools", "More"].map(
            (g) => (
              <div className="nav-group" key={g}>
                {g !== "Essentials" && <div className="group-label">{g}</div>}
                {categories
                  .filter((c) => c.group === g)
                  .map((c) => (
                    <Link
                      prefetch={false}
                      key={c.slug}
                      href={"/" + c.slug}
                      className={slug === c.slug ? "active" : ""}
                    >
                      <c.icon size={17} />
                      <span>{c.short}</span>
                    </Link>
                  ))}
              </div>
            ),
          )}
          {extra.map((d) => (
            <Link prefetch={false} key={d.slug} href={"/" + d.slug}>
              <Folder size={17} />
              {d.title}
            </Link>
          ))}
          <div className="nav-label">COMMUNITY & MORE</div>
          <Link
            prefetch={false}
            href="/startpage"
            className={slug === "startpage" ? "active" : ""}
          >
            <Home size={17} />
            Startpage
          </Link>
          {guides.slice(2).map((g) => (
            <Link
              prefetch={false}
              key={g.slug}
              href={"/" + g.slug}
              className={slug === g.slug ? "active" : ""}
            >
              <g.icon size={17} />
              {g.label}
            </Link>
          ))}
          <a href="https://searx.fmhy.net" target="_blank" rel="noreferrer">
            <Search size={17} />
            SearXNG
            <ExternalLink size={13} />
          </a>
          <a
            href="https://github.com/fmhy/FMHY/wiki/FMHY-Discord"
            target="_blank"
            rel="noreferrer"
          >
            <Radio size={17} />
            Discord
            <ExternalLink size={13} />
          </a>
        </nav>
        <div className="sidebar-footer">
          <span className="mini-monogram">a.</span>
          <div>
            Built on community.<small>Curated by FMHY contributors.</small>
          </div>
        </div>
      </aside>
      {menu && (
        <button
          className="menu-backdrop"
          aria-label="Close navigation"
          onClick={() => setMenu(false)}
        />
      )}
      <div className="workspace">
        <header className="topbar">
          <div className="breadcrumbs">
            <button
              className="mobile-menu icon-button"
              aria-label="Open navigation"
              onClick={() => setMenu(true)}
            >
              <Menu />
            </button>
            <span className="desktop-only">THE FREE INTERNET</span>
            <span className="breadcrumb-slash">/</span>
            <span>
              {home
                ? "Explore"
                : isSearch
                  ? "Search"
                  : slug === "posts"
                    ? "Updates"
                    : activeCategory?.short || doc?.title || "Directory"}
            </span>
          </div>
          <div className="top-actions">
            <a
              className="source-link"
              href="https://github.com/fmhy/edit"
              target="_blank"
              rel="noreferrer"
            >
              <Code2 size={16} />
              Source
              <ExternalLink size={13} />
            </a>
            <Appearance />
          </div>
        </header>
        <main id="main" className={home ? "main home-main" : "main"}>
          {home ? (
            <>
              <section className="intro">
                <div className="intro-main">
                  <div className="eyebrow">
                    <span /> THE COMMUNITY-CURATED DIRECTORY
                  </div>
                  <h1>
                    The internet has more.
                    <br />
                    <em>Find your corner.</em>
                  </h1>
                  <p>
                    Free tools, media, knowledge, and a few rabbit holes.
                    <br className="desktop-only" /> All in one place, curated by
                    people who care.
                  </p>
                </div>
                <div className="directory-stamp">
                  <Compass size={31} strokeWidth={1.25} />
                  <span>
                    OPEN TO
                    <br />
                    EXPLORATION
                  </span>
                  <small>FMHY / ATLAS</small>
                </div>
              </section>
              <form className="big-search" onSubmit={submit}>
                <Search size={23} />
                <input
                  maxLength={200}
                  ref={inputRef}
                  aria-label="Search the directory"
                  placeholder="What are you looking for?"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <kbd>
                  <Command size={12} /> K
                </kbd>
                <button type="submit">Search directory</button>
              </form>
              <div className="search-hints">
                <span>Try something:</span>
                {["AI chatbots", "audiobooks", "photo editors"].map((s) => (
                  <Link
                    prefetch={false}
                    href={"/search?q=" + encodeURIComponent(s)}
                    key={s}
                  >
                    {s}
                  </Link>
                ))}
              </div>
              <div className="directory-heading">
                <div>
                  <h2>
                    Pick a direction
                    <span>{categories.length + extra.length}</span>
                  </h2>
                  <p>A whole lot of internet, thoughtfully organized.</p>
                </div>
                <span className="entry-total">
                  {count(total)} resource entries
                </span>
              </div>
              <div
                className="category-tabs"
                role="group"
                aria-label="Category groups"
              >
                {groups.map((g) => (
                  <button
                    aria-pressed={group === g}
                    className={group === g ? "selected" : ""}
                    key={g}
                    onClick={() => setGroup(g)}
                  >
                    {g}
                  </button>
                ))}
              </div>
              <section
                className="category-grid"
                aria-label="Directory categories"
              >
                {visible.map((c, i) => (
                  <Link
                    prefetch={false}
                    className={"category-card " + c.color}
                    href={"/" + c.slug}
                    key={c.slug}
                  >
                    <div className="card-top">
                      <span className="category-icon">
                        <c.icon size={25} strokeWidth={1.65} />
                      </span>
                      <span className="card-index">
                        {String(categories.indexOf(c) + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <h3>{c.label}</h3>
                    <p>{c.description}</p>
                    <div className="card-tags">
                      {c.tags.map((t) => (
                        <span key={t}>{t}</span>
                      ))}
                    </div>
                    <div className="card-bottom">
                      <span>{count(bySlug[c.slug]?.count || 0)} entries</span>
                      <span>
                        Explore <ChevronRight size={15} />
                      </span>
                    </div>
                  </Link>
                ))}
                {group === "All categories" &&
                  extra.map((d) => (
                    <Link
                      prefetch={false}
                      className="category-card blue"
                      href={"/" + d.slug}
                      key={d.slug}
                    >
                      <Folder />
                      <h3>{d.title}</h3>
                      <p>{d.description}</p>
                      <div className="card-bottom">
                        {count(d.count)} entries
                        <ChevronRight size={15} />
                      </div>
                    </Link>
                  ))}
              </section>
              <section className="guide-band">
                <div className="guide-band-icon">
                  <BookOpen size={25} />
                </div>
                <div>
                  <div className="eyebrow">
                    A LITTLE GUIDANCE GOES A LONG WAY
                  </div>
                  <h3>New here? Start with the essentials.</h3>
                  <p>
                    Adblocking, staying safe, and getting the most out of FMHY.
                  </p>
                </div>
                <Link prefetch={false} href="/beginners-guide" className="pill">
                  Read the beginners guide
                </Link>
              </section>
              <div className="home-bottom">
                <Link prefetch={false} href={announcement?.url || "/posts"}>
                  <RefreshCw size={19} />
                  <div>
                    <small>FROM THE COMMUNITY</small>
                    <strong>
                      {announcement?.title || "Updates & changelog"}
                    </strong>
                  </div>
                  <ChevronRight size={18} />
                </Link>
                <Link prefetch={false} href="/other/contributing">
                  <Plus size={19} />
                  <div>
                    <small>MAKE THE DIRECTORY BETTER</small>
                    <strong>Have something worth sharing?</strong>
                  </div>
                  <ChevronRight size={18} />
                </Link>
              </div>
            </>
          ) : (
            <>
              <form className="compact-search" onSubmit={submit}>
                <Search size={18} />
                <input
                  maxLength={200}
                  ref={inputRef}
                  aria-label="Search all of FMHY"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search all of FMHY"
                />
                <kbd>⌘ K</kbd>
                <button type="submit">Search</button>
              </form>
              {slug === "posts" ? (
                <>
                  <div className="page-heading">
                    <div className="eyebrow">THE LATEST FROM FMHY</div>
                    <h1>Always evolving.</h1>
                    <p>
                      New discoveries, directory changes, and community updates.
                    </p>
                  </div>
                  <div className="posts-grid">
                    {posts.map((post) => (
                      <Link
                        prefetch={false}
                        href={"/" + post.slug}
                        className="post-card"
                        key={post.slug}
                      >
                        <time>
                          {post.date
                            ? new Date(
                                post.date + "T12:00:00",
                              ).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "Community post"}
                        </time>
                        <h2>{post.title}</h2>
                        <p>{post.description}</p>
                        <span>
                          Read update <ChevronRight size={15} />
                        </span>
                      </Link>
                    ))}
                  </div>
                </>
              ) : slug === "startpage" ? (
                <Startpage />
              ) : isSearch ? (
                <>
                  <div className="page-heading">
                    <div className="eyebrow">SEARCH THE DIRECTORY</div>
                    <h1>
                      {searchQuery ? (
                        <>
                          Results for <em>“{searchQuery}”</em>
                        </>
                      ) : (
                        "What will you discover?"
                      )}
                    </h1>
                    {!loading && searchQuery && (
                      <p>
                        {count(searchTotal)} matching entries
                        {searchTotal > 150 ? " · Showing the first 150" : ""}
                      </p>
                    )}
                  </div>
                  {loading ? (
                    <div className="loading-state">
                      <RefreshCw className="spin" />
                      Searching the latest directory…
                    </div>
                  ) : (
                    <div className="results">
                      {error && (
                        <div className="filter-note" role="status">
                          {error}{" "}
                          <button onClick={() => setRefresh((x) => x + 1)}>
                            Try again
                          </button>
                        </div>
                      )}
                      {results.map((r, i) => (
                        <Link
                          prefetch={false}
                          className="search-result"
                          href={r.url}
                          key={r.url + i}
                        >
                          <div>
                            <span className="result-category">
                              {r.category}
                            </span>
                            <h2>
                              {r.starred && <Star size={17} />} {r.title}
                            </h2>
                            <p>{r.snippet}</p>
                          </div>
                          <ChevronRight size={19} />
                        </Link>
                      ))}
                      {searchQuery && !results.length && (
                        <div className="empty-state">
                          <Search size={32} />
                          <h2>No matches yet.</h2>
                          <p>
                            Try a shorter phrase, a website name, or a broader
                            topic.
                          </p>
                          <Link prefetch={false} href="/">
                            Browse all categories
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : loading ? (
                <div className="loading-state">
                  <RefreshCw className="spin" />
                  Opening the latest page…
                </div>
              ) : error ? (
                <div className="error-state" role="alert">
                  <h1>{error}</h1>
                  <button
                    className="pill"
                    onClick={() => setRefresh((x) => x + 1)}
                  >
                    Try again
                  </button>
                  <Link prefetch={false} href="/">
                    Back to the directory
                  </Link>
                </div>
              ) : doc ? (
                <>
                  <div className="page-heading">
                    <div className="eyebrow">
                      {activeCategory?.group || "FROM THE FMHY COMMUNITY"}{" "}
                      <span className="eyebrow-separator">/</span>{" "}
                      {doc.count > 0
                        ? count(doc.count) + " ENTRIES"
                        : "GUIDES & UPDATES"}
                    </div>
                    <h1>{doc.title}</h1>
                    <p>{doc.description}</p>
                    <div className="page-meta">
                      <span
                        className={doc.source === "live" ? "live" : "fallback"}
                      >
                        {doc.source === "live" ? (
                          <Check size={14} />
                        ) : (
                          <Info size={14} />
                        )}{" "}
                        {doc.source === "live"
                          ? "Upstream content"
                          : "Saved copy · source unavailable"}
                      </span>
                      <a
                        href={
                          "https://github.com/fmhy/edit/edit/main/docs/" +
                          slug +
                          ".md"
                        }
                        target="_blank"
                        rel="noreferrer"
                      >
                        Suggest an edit <ExternalLink size={13} />
                      </a>
                      <button onClick={() => setRefresh((x) => x + 1)}>
                        <RefreshCw size={13} />
                        Check for updates
                      </button>
                    </div>
                  </div>
                  <div className="document-layout">
                    <section className="document-main">
                      <div className="document-controls">
                        <label className="within-search">
                          <Search size={17} />
                          <input
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            placeholder="Filter entries on this page"
                            aria-label="Filter entries on this page"
                          />
                          {filter && (
                            <button
                              aria-label="Clear filter"
                              onClick={() => setFilter("")}
                            >
                              <X size={15} />
                            </button>
                          )}
                        </label>
                        <button
                          className={
                            "star-toggle " + (onlyStars ? "selected" : "")
                          }
                          aria-pressed={onlyStars}
                          onClick={() => setOnlyStars(!onlyStars)}
                        >
                          <Star size={16} />
                          <span>Starred only</span>
                        </button>
                        <button
                          className="toc-toggle icon-button"
                          aria-label="Table of contents"
                          onClick={() => setToc(!toc)}
                        >
                          <Menu size={17} />
                        </button>
                      </div>
                      {onlyStars && (
                        <div className="filter-note">
                          Showing community-recommended entries.{" "}
                          <button onClick={() => setOnlyStars(false)}>
                            Show all
                          </button>
                        </div>
                      )}
                      <article
                        className="prose"
                        aria-busy={loading}
                        ref={articleRef}
                        dangerouslySetInnerHTML={{ __html: doc.html }}
                        onClick={(e) => {
                          const a = (e.target as HTMLElement).closest("a");
                          if (
                            a &&
                            a.getAttribute("href")?.startsWith("/") &&
                            !a.getAttribute("href")?.startsWith("//") &&
                            !e.ctrlKey &&
                            !e.metaKey &&
                            !e.shiftKey &&
                            !e.altKey &&
                            e.button === 0 &&
                            a.target !== "_blank"
                          ) {
                            e.preventDefault();
                            router.push(a.getAttribute("href")!);
                          }
                        }}
                      />
                      <div className="article-end">
                        <span>Content curated by FMHY contributors.</span>
                        <a
                          href={"https://fmhy.net/" + slug}
                          target="_blank"
                          rel="noreferrer"
                        >
                          View original <ExternalLink size={13} />
                        </a>
                      </div>
                    </section>
                    <aside
                      className={"toc " + (toc ? "toc-open" : "")}
                      aria-label="On this page"
                    >
                      <div className="eyebrow">ON THIS PAGE</div>
                      {doc.headings.map((h) => (
                        <a
                          className={
                            (h.level > 1 ? "nested " : "") +
                            (activeHeading === h.id ? "current" : "")
                          }
                          href={"#" + h.id}
                          key={h.id}
                          onClick={() => {
                            setToc(false);
                            setActiveHeading(h.id);
                          }}
                        >
                          {h.text}
                        </a>
                      ))}
                    </aside>
                  </div>
                </>
              ) : null}
            </>
          )}
        </main>
        <footer className="footer">
          <div>
            <span className="footer-brand">
              FMHY <b>ATLAS</b>
            </span>
            <span>Independent design. Community-curated content.</span>
            <a href="https://fmhy.net" target="_blank" rel="noreferrer">
              Original FMHY <ExternalLink size={12} />
            </a>
          </div>
          <div
            className="sync-status"
            title={
              statusDate
                ? "Last checked: " +
                  statusDate +
                  (revision ? " · Revision " + revision.slice(0, 7) : "")
                : "Checking upstream"
            }
          >
            {statusSource === "checking" ? (
              <RefreshCw size={13} className="spin" />
            ) : statusSource === "live" ? (
              <Check size={13} />
            ) : (
              <Info size={13} />
            )}
            <span>
              {statusSource === "checking"
                ? "Checking source"
                : statusSource === "live"
                  ? "Auto-refresh · 15 min"
                  : "Saved directory · retrying automatically"}
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
