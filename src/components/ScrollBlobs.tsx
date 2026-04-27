"use client";

export default function ScrollBlobs() {
  return (
    <div className="liquid-bg pointer-events-none">
      <div aria-hidden className="blob blob-indigo blob-a" />
      <div aria-hidden className="blob blob-cyan blob-b hidden sm:block" />
      <div aria-hidden className="blob blob-rose blob-c hidden lg:block" />
    </div>
  );
}

