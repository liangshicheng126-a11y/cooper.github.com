import type { Metadata } from "next";
import { Archivo, Noto_Sans_SC, Noto_Sans_JP, Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/locales/LanguageProvider";
import { DEFAULT_LANGUAGE, getLanguageOption } from "@/locales/config";
import PageTransition from "@/components/PageTransition";
import GsapProvider from "@/components/motion/GsapProvider";
import MotionTierProvider from "@/components/motion/MotionTierProvider";
import NightBackdrop from "@/components/NightBackdrop";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import OpeningSequence from "@/components/motion/OpeningSequence";
import { IntroPlaybackProvider } from "@/components/motion/IntroPlaybackContext";
import {
  getOpeningIntroEarlyGateScript,
  getPagesBasePath,
} from "@/lib/openingIntro";
import { getClientAssetRecoveryScript } from "@/lib/clientRecovery";
import { INTRO_ENABLED } from "@/lib/motion";

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
});
const notoSansSC = Noto_Sans_SC({
  weight: "variable",
  subsets: ["latin"],
  variable: "--font-noto-sans-sc",
  display: "swap",
  preload: false,
  fallback: ["Microsoft YaHei", "Arial"],
});
const notoSansJP = Noto_Sans_JP({
  weight: "variable",
  subsets: ["latin"],
  variable: "--font-noto-sans-jp",
  display: "swap",
  preload: false,
  fallback: ["Hiragino Kaku Gothic ProN", "Yu Gothic", "sans-serif"],
});
const notoSansKR = Noto_Sans_KR({
  weight: "variable",
  subsets: ["latin"],
  variable: "--font-noto-sans-kr",
  display: "swap",
  preload: false,
  fallback: ["Apple SD Gothic Neo", "Malgun Gothic", "sans-serif"],
});
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.GITHUB_REPOSITORY_OWNER
    ? `https://${process.env.GITHUB_REPOSITORY_OWNER}.github.io`
    : "http://localhost:3000");
const openingGateScript = getOpeningIntroEarlyGateScript(
  getPagesBasePath(),
  INTRO_ENABLED
);
const clientAssetRecoveryScript = getClientAssetRecoveryScript();

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: "Designer Portfolio",
    description: "Independent Designer / Visual Developer Portfolio",
    images: ["/preview.svg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Designer Portfolio",
    description: "Independent Designer / Visual Developer Portfolio",
    images: ["/preview.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang={getLanguageOption(DEFAULT_LANGUAGE).htmlLang} className="dark" suppressHydrationWarning>
      <head>
        <script
          id="cooper-client-asset-recovery"
          dangerouslySetInnerHTML={{ __html: clientAssetRecoveryScript }}
        />
        <script
          id="cooper-opening-gate"
          dangerouslySetInnerHTML={{ __html: openingGateScript }}
        />
      </head>
      <body className={`${archivo.variable} ${notoSansSC.variable} ${notoSansJP.variable} ${notoSansKR.variable}`} suppressHydrationWarning>
        <span
          hidden
          aria-hidden
          dangerouslySetInnerHTML={{
            __html: `<!--
THESIS: Cooper's work appears as a nocturnal screening room, refusing the portfolio-template split sidebar and decorative blob scaffold.
OWN-WORLD: Graphite black, cold white type, zinc hairlines, translucent obsidian surfaces, radial light beams, and restrained indigo signals.
STORY: Visitors identify Cooper, understand his capabilities, inspect real work, and choose contact, task brief, or Xiaocoo without losing context.
FIRST VIEWPORT: A compact floating top bar frames an exactly centered oversized title, supporting statement, two actions, and a restrained floating-line field.
FORM: Nocturnal portfolio screening room, grounded direction 4, seed 94f35f2e.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
-->`,
          }}
        />
        <LanguageProvider>
          <MotionTierProvider>
            <IntroPlaybackProvider>
              <GsapProvider>
                <OpeningSequence />
                <div className="site-shell">
                  <NightBackdrop />
                  <SiteHeader />
                  <main className="site-main">
                    <PageTransition>{children}</PageTransition>
                    <SiteFooter />
                  </main>
                </div>
              </GsapProvider>
            </IntroPlaybackProvider>
          </MotionTierProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
