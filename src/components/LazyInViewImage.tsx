"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  src: string;
  alt: string;
  className?: string;
  wrapperClassName?: string;
  onClick?: () => void;
  draggable?: boolean;
};

export default function LazyInViewImage({
  src,
  alt,
  className = "",
  wrapperClassName = "",
  onClick,
  draggable = false,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setShouldLoad(true);
        observer.disconnect();
      },
      { rootMargin: "280px 0px", threshold: 0.01 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const content = shouldLoad && !failed ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      draggable={draggable}
      onError={() => setFailed(true)}
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
