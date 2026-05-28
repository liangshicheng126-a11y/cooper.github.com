"use client";

import { usePathname } from "next/navigation";

export default function ScrollBlobs() {
  const pathname = usePathname() ?? "";
  const isGalleryDetail = /^\/portfolio\/p[13]\/?$/.test(pathname);

  return (
    <div
      className={`liquid-bg pointer-events-none${isGalleryDetail ? " liquid-bg--gallery" : ""}`}
      aria-hidden
    >
      <div className="blob blob-indigo blob-a" />
      <div className="blob blob-cyan blob-b" />
      <div className="blob blob-rose blob-c" />
    </div>
  );
}
