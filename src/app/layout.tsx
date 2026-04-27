import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/locales/LanguageProvider";
import Sidebar from "@/components/Sidebar";
import LanguageToggle from "@/components/LanguageToggle";
import PageTransition from "@/components/PageTransition";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Designer Portfolio",
  description: "Independent Designer / Visual Developer Portfolio",
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
          {/* Liquid Background */}
          <div className="liquid-bg">
            <div className="blob" style={{ top: '-10%', left: '-5%' }}></div>
            <div className="blob" style={{ top: '40%', right: '-10%', background: 'linear-gradient(135deg, #3b82f6 0%, #2dd4bf 100%)' }}></div>
            <div className="blob" style={{ bottom: '-10%', left: '20%', background: 'linear-gradient(135deg, #f43f5e 0%, #fb923c 100%)' }}></div>
          </div>

          {/* Layout Structure */}
          <div className="flex min-h-screen">
            <Sidebar />
            <LanguageToggle />
            <main className="flex-1 ml-80 p-12 pr-24 relative z-10">
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
