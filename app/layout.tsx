import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'FMHY Atlas — A directory of the free internet',description:'Explore the FMHY directory in an independent, thoughtfully designed interface. Live upstream content, full-text search, guides and community recommendations.',icons:{icon:'/favicon.svg'}};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
