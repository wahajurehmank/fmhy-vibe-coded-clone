import { searchDirectory } from "@/lib/content";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const query = (params.get("q") || "").trim();
  const batch = Number(params.get("batch") || 0);
  if (query.length > 200 || !Number.isInteger(batch) || batch < 0 || batch > 20)
    return Response.json({ error: "Invalid search request" }, { status: 400 });
  try {
    return Response.json(await searchDirectory(query, batch), {
      headers: { "Cache-Control": "public, max-age=60, s-maxage=300" },
    });
  } catch {
    return Response.json(
      { error: "Search is temporarily unavailable" },
      { status: 503 },
    );
  }
}
