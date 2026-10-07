export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;
import {searchDirectory} from '@/lib/content';
export async function GET(request:Request) {const query=(new URL(request.url).searchParams.get('q')||'').trim().slice(0,200);return Response.json(await searchDirectory(query,Math.max(0,Math.min(20,Number(new URL(request.url).searchParams.get('batch'))||0))));}
