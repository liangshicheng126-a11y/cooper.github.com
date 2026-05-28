"use client";

import { usePathname } from "next/navigation";

export default function ScrollBlobs() {
  const pathname = usePathname() ?? "";
  const isHeavyGallery = /^\/portfolio\/p[13]\/?$/.test(pathname);

  if (isHeavyGallery) {
    return null;
  }

  return (
    <div className="liquid-bg pointer-events-none">
      <div aria-hidden className="blob blob-indigo blob-a" />
      <div aria-hidden className="blob blob-cyan blob-b" />
      <div aria-hidden className="blob blob-rose blob-c" />
    </div>
  );
}
