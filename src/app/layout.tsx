import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/locales/LanguageProvider";
import Sidebar from "@/components/Sidebar";
import LanguageToggle from "@/components/LanguageToggle";
import PageTransition from "@/components/PageTransition";
import ScrollBlobs from "@/components/ScrollBlobs";

const inter = Inter({ subsets: ["latin"] });
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
        <LanguageProvider>
          <ScrollBlobs />

          {/* Layout Structure */}
          <div className="flex min-h-screen">
            <Sidebar />
            <LanguageToggle />
            <main className="flex-1 ml-0 xl:ml-80 px-4 sm:px-8 xl:px-12 pb-8 sm:pb-10 xl:pb-12 pt-24 xl:pt-12 xl:pr-24 relative z-10">
              <PageTransition>
                {children}
              </PageTransition>
            </main>
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}
