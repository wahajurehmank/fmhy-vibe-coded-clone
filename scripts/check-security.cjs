const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const assert = require("node:assert/strict");
const ts = require("typescript");
const root = path.resolve(__dirname, "..");
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "atlas-security-"));
const source = fs
  .readFileSync(path.join(root, "lib/content.ts"), "utf8")
  .replace(
    /['"]@\/data\/snapshot\.json['"]/,
    JSON.stringify(path.join(root, "data/snapshot.json")),
  )
  .replace(/['"]marked['"]/, JSON.stringify(require.resolve("marked")))
  .replace(/['"]sanitize-html['"]/, JSON.stringify(require.resolve("sanitize-html")));
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
    esModuleInterop: true,
  },
}).outputText;
const filename = path.join(temporary, "content.cjs");
fs.writeFileSync(filename, compiled);
const { renderDoc, normalizeUrl, getDocument } = require(filename);

(async () => {
  const attack =
    '<script>alert(1)</script>\n\n[x](javascript:alert(1))\n\n<img src="https://example.com/a.png" onerror="alert(1)">\n\n<iframe src="https://example.com"></iframe>\n\n<a href="//evil.example">bad</a>\n\n<div class="menu-backdrop">fake</div>';
  const html = renderDoc(attack, "ai").html;
  assert(
    !/<script|javascript:|onerror|<iframe|href="\/\/|class="menu-backdrop"/.test(
      html,
    ),
  );
  assert(html.includes('loading="lazy"'));
  assert(html.includes('referrerpolicy="no-referrer"'));
  assert.equal(
    normalizeUrl(
      "https://www.reddit.com/r/FREEMEDIAHECKYEAH/wiki/games/#wiki_.25B7_rom_sites",
    ),
    "/gaming#rom-sites",
  );
  const headings = renderDoc("# Same\n# Same", "ai").headings;
  assert.deepEqual(
    headings.map((h) => h.id),
    ["same", "same-1"],
  );
  let requests = 0;
  global.fetch = async () => {
    requests++;
    throw Error("simulated outage");
  };
  const doc = await getDocument("ai");
  assert.equal(doc.source, "snapshot");
  assert(doc.html.includes("DeepSeek"));
  await getDocument("ai");
  assert.equal(
    requests,
    2,
    "Failed upstream requests should back off instead of retrying immediately",
  );
  await assert.rejects(getDocument("../secret"));
  assert.equal(requests, 2, "Invalid paths must not reach an upstream server");
  console.log(
    "Security checks passed: sanitization, safe links, lazy images, unique headings, fallback, retry backoff, invalid path rejection.",
  );
})()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => fs.rmSync(temporary, { recursive: true, force: true }));
