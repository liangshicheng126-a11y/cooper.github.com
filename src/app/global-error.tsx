"use client";

import type { CSSProperties } from "react";

const pageStyle: CSSProperties = {
  minHeight: "100dvh",
  margin: 0,
  display: "grid",
  placeItems: "center",
  padding: "max(1.5rem, env(safe-area-inset-top)) max(1.25rem, env(safe-area-inset-right)) max(1.5rem, env(safe-area-inset-bottom)) max(1.25rem, env(safe-area-inset-left))",
  background: "#050506",
  color: "#f4f4f5",
  fontFamily: "var(--font-archivo), var(--font-script), sans-serif",
};

const panelStyle: CSSProperties = {
  width: "min(100%, 32rem)",
  padding: "clamp(1.5rem, 6vw, 2.5rem)",
  border: "1px solid rgba(255, 255, 255, 0.12)",
  borderRadius: "16px",
  background: "rgba(12, 12, 15, 0.9)",
};

const actionStyle: CSSProperties = {
  minHeight: "44px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "0.75rem 1rem",
  borderRadius: "12px",
  border: 0,
  background: "#f4f4f5",
  color: "#09090b",
  font: "inherit",
  fontWeight: 700,
  textDecoration: "none",
  cursor: "pointer",
};

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const reloadFresh = () => {
    const url = new URL(window.location.href);
    url.searchParams.set("__cooper_static_refresh", String(Date.now()));
    window.location.replace(url.toString());
  };

  return (
    <html lang="zh-CN" className="dark">
      <body style={pageStyle}>
        <main style={panelStyle}>
          <p style={{ margin: 0, color: "#a5b4fc", fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.11em" }}>
            COOPER.
          </p>
          <h1 style={{ margin: "1rem 0 0", fontSize: "1.5rem", lineHeight: 1.333, letterSpacing: "-0.025em" }}>
            页面暂时未能载入
          </h1>
          <p style={{ margin: "1rem 0 0", color: "rgba(244, 244, 245, 0.68)", fontSize: "1rem", lineHeight: 1.6 }}>
            请重新载入最新版本，当前页面地址会保留。 Reload the latest version without losing this address.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginTop: "1.5rem" }}>
            <button type="button" onClick={reloadFresh} style={actionStyle}>
              重新载入 / Reload
            </button>
            <button
              type="button"
              onClick={reset}
              style={{ ...actionStyle, border: "1px solid rgba(255, 255, 255, 0.12)", background: "rgba(255, 255, 255, 0.04)", color: "#f4f4f5" }}
            >
              重试 / Retry
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
