/**
 * CascadePanel — cascading security-fix PR cards that appear after the first
 * merge-fix click, animate in one-by-one, then show a cursor merging the top
 * "Ready to Merge" item.
 */

import { useEffect, useState } from "react";

// ── Cursor coordinates (relative to the card container's top-left) ─────────────
const CURSOR_START_X = 390;
const CURSOR_START_Y = 260;
const CURSOR_OVER_X  = 326;
const CURSOR_OVER_Y  = 66;
const CURSOR_PRESS_Y = 70;

type CursorStep = "hidden" | "start" | "moving" | "pressing" | "released";

function HandCursor({ pressing }: { pressing: boolean }) {
  return (
    <svg
      width="24" height="32" viewBox="0 0 24 32" fill="none"
      style={{
        filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.6))",
        transformOrigin: "0% 0%",
        transform: pressing ? "scale(0.93)" : "none",
        transition: "transform 0.10s ease",
      }}
    >
      <path
        d="M2 2 L2 26 L7.5 20.5 L12.5 30 L15.5 28.5 L10.5 19 L18 19 Z"
        fill="white"
        stroke="#666"
        strokeWidth="1.2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ── Fix item definitions ───────────────────────────────────────────────────────

const FIX_ITEMS = [
  { id: 0, title: "Fix CVE-2024-1234 and 63 others in base node image",     pr: "#22", initialStatus: "ready"   },
  { id: 1, title: "Patch Log4j RCE in logging-service container",           pr: "#23", initialStatus: "applied" },
  { id: 2, title: "Revoke exposed AWS credentials & rotate IAM keys",       pr: "#24", initialStatus: "applied" },
  { id: 3, title: "Update OpenSSL across all microservice pods",            pr: "#25", initialStatus: "applied" },
  { id: 4, title: "Restrict wildcard S3 permissions on checkout-role",      pr: "#26", initialStatus: "ready"   },
  { id: 5, title: "Remove hardcoded DB password from payment-service",      pr: "#27", initialStatus: "ready"   },
];

// ── Component ──────────────────────────────────────────────────────────────────

interface CascadePanelProps {
  visible:  boolean;
  clicking: boolean;
}

export function CascadePanel({ visible, clicking }: CascadePanelProps) {
  const [shownCount, setShownCount] = useState(0);
  const [topMerged, setTopMerged]   = useState(false);
  const [cursorStep, setCursorStep] = useState<CursorStep>("hidden");

  useEffect(() => {
    if (!visible) {
      setShownCount(0);
      setTopMerged(false);
      setCursorStep("hidden");
      return;
    }
    const timers = FIX_ITEMS.map((_, i) =>
      setTimeout(() => setShownCount(i + 1), i * 190),
    );
    return () => timers.forEach(clearTimeout);
  }, [visible]);

  useEffect(() => {
    if (!clicking) { setCursorStep("hidden"); return; }
    setCursorStep("start");
    const t1 = setTimeout(() => setCursorStep("moving"),   80);
    const t2 = setTimeout(() => setCursorStep("pressing"), 1000);
    const t3 = setTimeout(() => setCursorStep("released"), 1230);
    const t4 = setTimeout(() => setTopMerged(true),         1380);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [clicking]);

  const isPressing = cursorStep === "pressing";
  const showCursor = cursorStep !== "hidden";

  const cursorX = cursorStep === "start" ? CURSOR_START_X : CURSOR_OVER_X;
  const cursorY =
    cursorStep === "start"    ? CURSOR_START_Y :
    cursorStep === "pressing" ? CURSOR_PRESS_Y :
                                CURSOR_OVER_Y;
  const cursorTransition =
    cursorStep === "moving"   ? "transform 0.88s cubic-bezier(0.23, 1, 0.32, 1)" :
    cursorStep === "pressing" ? "transform 0.12s ease" :
    cursorStep === "released" ? "transform 0.15s ease" : "none";

  const appliedCount = FIX_ITEMS.filter((it, i) =>
    i === 0 ? topMerged : it.initialStatus === "applied",
  ).length;

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: `translate(-50%, -50%) scale(${visible ? 1 : 0.92})`,
        opacity:    visible ? 1 : 0,
        transition: "opacity 0.55s ease, transform 0.55s cubic-bezier(0.34,1.4,0.64,1)",
        pointerEvents: visible ? "auto" : "none",
        zIndex: 30,
      }}
    >
      {/* Outer glow ring */}
      <div
        style={{
          position: "absolute",
          inset: "-1px",
          borderRadius: "14px",
          background: "transparent",
          boxShadow: "0 0 0 1px rgba(168,85,247,0.18), 0 0 60px rgba(109,40,217,0.18), 0 16px 64px rgba(0,0,0,0.75)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          background: "rgba(5,8,20,0.94)",
          borderRadius: "13px",
          width: "420px",
          border: "1px solid rgba(168,85,247,0.16)",
          backdropFilter: "blur(22px)",
          WebkitBackdropFilter: "blur(22px)",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* ── Header ────────────────────────────────────────────────────────── */}
        <div
          style={{
            padding: "13px 16px 12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
            {/* Git-merge icon */}
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="2.5" stroke="#22c55e" strokeWidth="1.4" />
              <line x1="1"    y1="8" x2="5.5" y2="8"  stroke="#22c55e" strokeWidth="1.4" strokeLinecap="round" />
              <line x1="10.5" y1="8" x2="15"  y2="8"  stroke="#22c55e" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            <span style={{ fontFamily: "'Mulish', sans-serif", fontWeight: 700, fontSize: "13px", color: "rgba(255,255,255,0.88)", letterSpacing: "0.01em" }}>
              Security Fixes
            </span>
            <span style={{ fontFamily: "Menlo, monospace", fontSize: "9px", letterSpacing: "0.10em", color: "rgba(168,85,247,0.55)", textTransform: "uppercase" }}>
              averlonsecurity
            </span>
          </div>

          {/* Merge counter badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              background: "rgba(34,197,94,0.10)",
              border: "1px solid rgba(34,197,94,0.22)",
              borderRadius: "20px",
              padding: "3px 10px",
              transition: "all 0.4s ease",
            }}
          >
            <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 5px #22c55e" }} />
            <span style={{ fontFamily: "Menlo, monospace", fontSize: "10px", letterSpacing: "0.06em", color: "#4ade80", fontWeight: 400 }}>
              {appliedCount} of {FIX_ITEMS.length} merged
            </span>
          </div>
        </div>

        {/* ── Fix rows ──────────────────────────────────────────────────────── */}
        {FIX_ITEMS.map((item, i) => {
          const isApplied  = i === 0 ? topMerged : item.initialStatus === "applied";
          const isTopReady = i === 0 && !topMerged;
          const shown      = i < shownCount;

          return (
            <div
              key={item.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "0 16px",
                height: "52px",
                borderBottom: i < FIX_ITEMS.length - 1 ? "1px solid rgba(255,255,255,0.045)" : "none",
                opacity:   shown ? 1 : 0,
                transform: shown ? "translateX(0)" : "translateX(16px)",
                transition: "opacity 0.28s ease, transform 0.34s cubic-bezier(0.34,1.2,0.64,1)",
                background: isTopReady
                  ? "rgba(139,92,246,0.055)"
                  : "transparent",
              }}
            >
              {/* Status icon */}
              <div style={{ flexShrink: 0 }}>
                {isApplied ? (
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="7" fill="#22c55e" opacity="0.12" />
                    <path d="M5 8.5L7 10.5L11 6.5" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="2.5" stroke="#a78bfa" strokeWidth="1.3" />
                    <line x1="1"    y1="8" x2="5.5" y2="8"  stroke="#a78bfa" strokeWidth="1.3" strokeLinecap="round" />
                    <line x1="10.5" y1="8" x2="15"  y2="8"  stroke="#a78bfa" strokeWidth="1.3" strokeLinecap="round" />
                  </svg>
                )}
              </div>

              {/* Fix title */}
              <p
                style={{
                  flex: 1,
                  fontFamily: "'Mulish', sans-serif",
                  fontSize: "12px",
                  fontWeight: 500,
                  color: isApplied ? "rgba(255,255,255,0.28)" : "rgba(255,255,255,0.72)",
                  margin: 0,
                  lineHeight: 1.35,
                  textDecorationLine: isApplied ? "line-through" : "none",
                  textDecorationColor: "rgba(255,255,255,0.18)",
                  transition: "all 0.4s ease",
                }}
              >
                {item.title}
              </p>

              {/* PR badge */}
              <span
                style={{
                  fontFamily: "Menlo, monospace",
                  fontSize: "9.5px",
                  letterSpacing: "0.04em",
                  color: "rgba(255,255,255,0.22)",
                  whiteSpace: "nowrap",
                  marginRight: "2px",
                  flexShrink: 0,
                  display: isApplied ? "none" : "block",
                }}
              >
                {item.pr}
              </span>

              {/* Applied badge OR Merge button */}
              <div style={{ flexShrink: 0 }}>
                {isApplied ? (
                  <span
                    style={{
                      fontFamily: "Menlo, monospace",
                      fontSize: "9.5px",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: "#4ade80",
                      background: "rgba(34,197,94,0.08)",
                      border: "1px solid rgba(34,197,94,0.20)",
                      borderRadius: "20px",
                      padding: "3px 9px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Merged ✓
                  </span>
                ) : (
                  <button
                    style={{
                      background: isPressing && isTopReady
                        ? "rgba(139,92,246,0.22)"
                        : "rgba(139,92,246,0.14)",
                      color: isPressing && isTopReady ? "#e9d5ff" : "#c4b5fd",
                      border: `1px solid ${isPressing && isTopReady ? "rgba(167,139,250,0.50)" : "rgba(139,92,246,0.32)"}`,
                      borderRadius: "20px",
                      padding: "4px 13px",
                      fontSize: "11px",
                      fontWeight: 600,
                      fontFamily: "'Mulish', sans-serif",
                      letterSpacing: "0.02em",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      boxShadow: isPressing && isTopReady
                        ? "0 0 14px rgba(139,92,246,0.30)"
                        : "0 0 0 1px rgba(139,92,246,0.08)",
                      transform: isPressing && isTopReady ? "translateY(1px) scale(0.97)" : "translateY(0) scale(1)",
                      transition: "all 0.12s ease",
                    }}
                  >
                    Merge Fix
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* ── Animated hand cursor ──────────────────────────────────────────── */}
        {showCursor && (
          <div
            style={{
              position: "absolute",
              left: 0, top: 0,
              transform: `translate(${cursorX}px, ${cursorY}px)`,
              transition: cursorTransition,
              pointerEvents: "none",
              zIndex: 50,
            }}
          >
            <HandCursor pressing={isPressing} />
          </div>
        )}
      </div>
    </div>
  );
}