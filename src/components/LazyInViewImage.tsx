"use client";

import { useEffect, useId, useRef, useState } from "react";

const MAX_CONCURRENT_LOADED = 6;

type LoadedEntry = {
  unload: () => void;
};

const loadedRegistry = new Map<string, LoadedEntry>();
const loadOrder: string[] = [];

function registerLoaded(id: string, unload: () => void) {
  if (loadedRegistry.has(id)) {
    loadedRegistry.get(id)?.unload();
    loadedRegistry.delete(id);
    const idx = loadOrder.indexOf(id);
    if (idx >= 0) loadOrder.splice(idx, 1);
  }

  loadedRegistry.set(id, { unload });
  loadOrder.push(id);

  while (loadOrder.length > MAX_CONCURRENT_LOADED) {
    const oldest = loadOrder.shift();
    if (!oldest) break;
    const entry = loadedRegistry.get(oldest);
    entry?.unload();
    loadedRegistry.delete(oldest);
  }
}

function unregisterLoaded(id: string) {
  loadedRegistry.delete(id);
  const idx = loadOrder.indexOf(id);
  if (idx >= 0) loadOrder.splice(idx, 1);
}

function getRootMargin(): string {
  if (typeof window === "undefined") return "120px 0px";
  return window.matchMedia("(max-width: 640px)").matches ? "80px 0px" : "200px 0px";
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
}: Props) {
  const instanceId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [activeSrc, setActiveSrc] = useState(src);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setActiveSrc(src);
    setFailed(false);
    setShouldLoad(false);
  }, [src]);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShouldLoad(true);
          return;
        }
        setShouldLoad(false);
        unregisterLoaded(instanceId);
      },
      { rootMargin: getRootMargin(), threshold: 0.01 },
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      unregisterLoaded(instanceId);
    };
  }, [instanceId, src]);

  useEffect(() => {
    if (!shouldLoad) {
      unregisterLoaded(instanceId);
      return;
    }

    registerLoaded(instanceId, () => setShouldLoad(false));
    return () => unregisterLoaded(instanceId);
  }, [shouldLoad, instanceId]);

  const content =
    shouldLoad && !failed ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={activeSrc}
        alt={alt}
        className={className}
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
        className={`h-full w-full bg-white/5 ${failed ? "flex items-center justify-center text-xs text-foreground/40" : "animate-pulse"}`}
        aria-hidden={!failed}
      >
        {failed ? "—" : null}
      </div>
    );

  if (onClick) {
    return (
      <div ref={rootRef} className={`relative h-full w-full ${wrapperClassName}`}>
        <button type="button" className="relative h-full w-full text-left" onClick={onClick}>
          {content}
        </button>
      </div>
    );
  }

  return (
    <div ref={rootRef} className={`relative h-full w-full ${wrapperClassName}`}>
      {content}
    </div>
  );
}
