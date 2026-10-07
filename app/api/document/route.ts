export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;
import {getDocument} from '@/lib/content';
export async function GET(request:Request) {const slug=new URL(request.url).searchParams.get('slug')||'index';try {const doc=await getDocument(slug);return Response.json(doc||{error:'Page not found'},{status:doc?200:404});}catch{return Response.json({error:'Invalid page'},{status:400});}}
