"use client";

import { useEffect, useRef, useState } from "react";

function getRootMargin(): string {
  if (typeof window === "undefined") return "200px 0px";
  return window.matchMedia("(max-width: 640px)").matches ? "160px 0px" : "280px 0px";
}

type Props = {
  src: string;
  alt: string;
  className?: string;
  wrapperClassName?: string;
  onClick?: () => void;
  draggable?: boolean;
  /** Used when optimized thumb/display WebP is missing (e.g. dev without prebuild). */
  fallbackSrc?: string;
  sizes?: string;
  /** cover: fill fixed-height frame; natural: intrinsic proportions for masonry */
  variant?: "cover" | "natural";
};

export default function LazyInViewImage({
  src,
  alt,
  className = "",
  wrapperClassName = "",
  onClick,
  draggable = false,
  fallbackSrc,
  sizes = "(max-width: 640px) 50vw, 25vw",
  variant = "cover",
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const hasLoadedRef = useRef(false);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [activeSrc, setActiveSrc] = useState(src);
  const [failed, setFailed] = useState(false);

  const isNatural = variant === "natural";
  const imgClassName = isNatural
    ? `block w-full h-auto ${className}`.trim()
    : `h-full w-full object-cover ${className}`.trim();

  useEffect(() => {
    setActiveSrc(src);
    setFailed(false);
    if (!hasLoadedRef.current) {
      setShouldLoad(false);
    }
  }, [src]);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;

    if (hasLoadedRef.current) {
      setShouldLoad(true);
      return;
    }

    if (typeof IntersectionObserver === "undefined") {
      hasLoadedRef.current = true;
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        hasLoadedRef.current = true;
        setShouldLoad(true);
        observer.disconnect();
      },
      { rootMargin: getRootMargin(), threshold: 0.01 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [src]);

  const content =
    shouldLoad && !failed ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={activeSrc}
        alt={alt}
        className={imgClassName}
        sizes={sizes}
        loading="lazy"
        decoding="async"
        draggable={draggable}
        onError={() => {
          if (fallbackSrc && activeSrc !== fallbackSrc) {
            setActiveSrc(fallbackSrc);
            return;
          }
          setFailed(true);
        }}
      />
    ) : (
      <div
        className={`w-full bg-slate-200/60 dark:bg-white/5 ${isNatural ? "min-h-[8rem]" : "h-full"} ${failed ? "flex items-center justify-center text-xs text-foreground/40" : ""}`}
        aria-hidden={!failed}
      >
        {failed ? "—" : null}
      </div>
    );

  if (onClick) {
    return (
      <div ref={rootRef} className={`relative w-full ${isNatural ? "" : "h-full"} ${wrapperClassName}`}>
        <button type="button" className={`relative w-full text-left ${isNatural ? "" : "h-full"}`} onClick={onClick}>
          {content}
        </button>
      </div>
    );
  }

  return (
    <div ref={rootRef} className={`relative w-full ${isNatural ? "" : "h-full"} ${wrapperClassName}`}>
      {content}
    </div>
  );
}
