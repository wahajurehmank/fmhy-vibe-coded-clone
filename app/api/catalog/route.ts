export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;
import {getCatalog} from '@/lib/content';
export async function GET() {return Response.json(await getCatalog());}
