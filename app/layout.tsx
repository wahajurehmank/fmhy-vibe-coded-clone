import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import "./themes.css";

export const metadata: Metadata = {
  title: "FMHY Atlas — A directory of the free internet",
  description:
    "Explore the FMHY directory with live upstream content, search, guides and community recommendations.",
  icons: { icon: "/favicon.svg" },
};

// Values are checked against fixed allowlists; stored strings never become HTML or CSS.
const preferenceScript = `(()=>{try{const r=document.documentElement;for(const [key,attr,allowed,fallback] of [['atlas-design','design',['atlas','brutalism','bento','clay','maximalism','glass'],'bento'],['atlas-theme','theme',['light','dark','amoled'],'dark'],['atlas-accent','accent',['blue','lime','rose','orange'],'blue']]){const v=localStorage.getItem(key);r.dataset[attr]=allowed.includes(v)?v:fallback}}catch{}})();`;

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const nonce = (await headers()).get("x-nonce") || undefined;
  return (
    <html
      lang="en"
      data-theme="dark"
      data-design="bento"
      data-accent="blue"
      suppressHydrationWarning
    >
      <head>
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{ __html: preferenceScript }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
