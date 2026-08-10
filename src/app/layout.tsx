import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/locales/LanguageProvider";
import Sidebar from "@/components/Sidebar";
import LanguageToggle from "@/components/LanguageToggle";
import PageTransition from "@/components/PageTransition";
import ScrollBlobs from "@/components/ScrollBlobs";
import GsapProvider from "@/components/motion/GsapProvider";
import MotionTierProvider from "@/components/motion/MotionTierProvider";
import { IntroPlaybackProvider } from "@/components/motion/IntroPlaybackContext";
import BlobSplashIntro from "@/components/motion/BlobSplashIntro";
import ViewportCanvas from "@/components/ViewportCanvas";
import {
  getBlobIntroEarlyGateScript,
  getPagesBasePath,
} from "@/lib/blobIntro";

const inter = Inter({ subsets: ["latin"] });
const introEnabled = process.env.NEXT_PUBLIC_INTRO_ENABLED !== "false";
const pagesBasePath = getPagesBasePath();
const introEarlyGateScript = getBlobIntroEarlyGateScript(
  pagesBasePath,
  introEnabled
);
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
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <script
          dangerouslySetInnerHTML={{ __html: introEarlyGateScript }}
        />
        <LanguageProvider>
          <MotionTierProvider>
          <IntroPlaybackProvider>
          <GsapProvider>
            <ViewportCanvas>
              <ScrollBlobs />
              <BlobSplashIntro />

              {/* Layout Structure — desktop locked to design width via ViewportCanvas */}
              <div className="layout-chrome flex min-h-screen min-w-0 overflow-x-clip">
                <Sidebar />
                <LanguageToggle />
                <main className="flex flex-col flex-1 min-h-[100dvh] min-w-0 overflow-x-clip ml-0 xl:ml-80 px-4 sm:px-8 lg:px-10 xl:px-12 pb-8 sm:pb-10 xl:pb-12 pt-24 xl:pt-12 relative z-10">
                  <PageTransition>
                    {children}
                  </PageTransition>
                </main>
              </div>
            </ViewportCanvas>
          </GsapProvider>
          </IntroPlaybackProvider>
          </MotionTierProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
