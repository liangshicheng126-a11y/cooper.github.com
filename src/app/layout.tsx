import type { Metadata } from "next";
import { Archivo, ZCOOL_QingKe_HuangYou } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/locales/LanguageProvider";
import PageTransition from "@/components/PageTransition";
import GsapProvider from "@/components/motion/GsapProvider";
import MotionTierProvider from "@/components/motion/MotionTierProvider";
import NightBackdrop from "@/components/NightBackdrop";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
});
const zcoolDisplay = ZCOOL_QingKe_HuangYou({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display-cjk",
  display: "swap",
});
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.GITHUB_REPOSITORY_OWNER
    ? `https://${process.env.GITHUB_REPOSITORY_OWNER}.github.io`
    : "http://localhost:3000");

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Designer Portfolio",
  description: "Independent Designer / Visual Developer Portfolio",
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
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${archivo.variable} ${zcoolDisplay.variable}`} suppressHydrationWarning>
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
            <GsapProvider>
              <div className="site-shell">
                <NightBackdrop />
                <SiteHeader />
                <main className="site-main">
                  <PageTransition>{children}</PageTransition>
                  <SiteFooter />
                </main>
              </div>
            </GsapProvider>
          </MotionTierProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
