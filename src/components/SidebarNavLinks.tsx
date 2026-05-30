"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { isNavActive } from "@/lib/nav";
import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";

export type SidebarNavItem = {
  name: string;
  href: string;
  icon: LucideIcon;
};

type SidebarNavLinksProps = {
  items: SidebarNavItem[];
  layoutId: string;
  onNavigate?: () => void;
  variant?: "desktop" | "mobile";
};

const pillTransition = (reduced: boolean) =>
  reduced
    ? { duration: 0.18, ease: [0.22, 1, 0.36, 1] as const }
    : { type: "spring" as const, stiffness: 420, damping: 34, mass: 0.85 };

export default function SidebarNavLinks({
  items,
  layoutId,
  onNavigate,
  variant = "desktop",
}: SidebarNavLinksProps) {
  const pathname = usePathname() ?? "/";
  const reduced = usePrefersReducedMotion();
  const isMobile = variant === "mobile";

  return (
    <nav className={cn(isMobile ? "space-y-2" : "space-y-1")}>
      {items.map((item) => {
        const active = isNavActive(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "relative flex items-center space-x-4 w-full transition-colors duration-200 group",
              isMobile
                ? cn(
                    "rounded-2xl border p-4",
                    active
                      ? "border-indigo-200/80 text-indigo-700"
                      : "border-transparent text-slate-800 hover:border-slate-200 hover:bg-slate-100/80"
                  )
                : cn(
                    "rounded-xl p-3",
                    active
                      ? "text-indigo-600"
                      : "text-foreground/60 hover:text-foreground"
                  )
            )}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                aria-hidden
                className={cn(
                  "absolute inset-0 rounded-xl pointer-events-none",
                  isMobile
                    ? "bg-gradient-to-r from-indigo-500/18 via-indigo-400/12 to-purple-500/18 border border-indigo-300/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]"
                    : "bg-gradient-to-r from-indigo-500/22 via-indigo-400/14 to-purple-500/20 border border-indigo-400/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.28)] backdrop-blur-sm"
                )}
                transition={pillTransition(reduced)}
              />
            )}

            <div
              className="relative z-10 w-5 flex justify-center shrink-0"
              {...(item.href === "/portfolio" && !isMobile
                ? { "data-nav-genie-origin": "portfolio" }
                : {})}
            >
              <item.icon
                className={cn(
                  "w-5 h-5 transition-transform duration-300 group-hover:scale-110 shrink-0",
                  active
                    ? isMobile
                      ? "text-indigo-600"
                      : "text-indigo-500"
                    : isMobile
                      ? "text-slate-500 group-hover:text-indigo-500"
                      : "text-foreground/40 group-hover:text-indigo-400"
                )}
              />
            </div>
            <span
              className={cn(
                "relative z-10 truncate",
                isMobile ? "text-base font-semibold" : "font-medium"
              )}
            >
              {item.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
