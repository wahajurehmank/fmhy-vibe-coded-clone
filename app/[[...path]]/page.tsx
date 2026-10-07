import {Suspense} from 'react';
import Atlas from '@/components/atlas';
export default function Page(){return <Suspense fallback={<main className="loading-state">Opening FMHY Atlas…</main>}><Atlas/></Suspense>;}
