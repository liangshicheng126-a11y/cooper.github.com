import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/locales/LanguageProvider";
import Sidebar from "@/components/Sidebar";
import LanguageToggle from "@/components/LanguageToggle";
import PageTransition from "@/components/PageTransition";
import ScrollBlobs from "@/components/ScrollBlobs";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://liangshicheng126-a11y.github.io"),
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
            <main className="flex-1 ml-0 lg:ml-80 p-6 sm:p-8 lg:p-12 pr-6 sm:pr-10 lg:pr-24 pt-24 lg:pt-12 relative z-10">
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
