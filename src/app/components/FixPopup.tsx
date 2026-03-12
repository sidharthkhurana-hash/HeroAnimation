import { useEffect, useState } from "react";

// ── Cursor geometry (relative to card top-left, accounts for SVG hotspot) ─────
const CURSOR_START_X = 205;  // off to lower-right of card
const CURSOR_START_Y = 172;
const CURSOR_OVER_X  = 115;  // tip lands on button center (button center 130 − hotspot 15)
const CURSOR_OVER_Y  = 118;  // button center Y ≈ 122 − hotspot 4
const CURSOR_PRESS_Y = 122;  // 4 px lower on depress

type CursorStep = "hidden" | "start" | "moving" | "pressing" | "released";

// ── Clean pointer-hand SVG ─────────────────────────────────────────────────────
function HandCursor({ pressing }: { pressing: boolean }) {
  return (
    <svg
      width="24"
      height="32"
      viewBox="0 0 24 32"
      fill="none"
      style={{
        filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.4))",
        transformOrigin: "0% 0%",
        transform: pressing ? "scale(0.93)" : "none",
        transition: "transform 0.10s ease",
      }}
    >
      {/* Arrow pointer shape */}
      <path
        d="M2 2 L2 26 L7.5 20.5 L12.5 30 L15.5 28.5 L10.5 19 L18 19 Z"
        fill="white"
        stroke="#888"
        strokeWidth="1.2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

interface FixPopupProps {
  visible: boolean;
  clicking: boolean;
}

export function FixPopup({ visible, clicking }: FixPopupProps) {
  const [cursorStep, setCursorStep] = useState<CursorStep>("hidden");

  useEffect(() => {
    if (!clicking) {
      setCursorStep("hidden");
      return;
    }
    // Sequence: appear at start → glide → over button → press → release
    setCursorStep("start");
    const t1 = setTimeout(() => setCursorStep("moving"),   60);
    const t2 = setTimeout(() => setCursorStep("pressing"), 900);
    const t3 = setTimeout(() => setCursorStep("released"), 1130);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [clicking]);

  const isPressing = cursorStep === "pressing";
  const showCursor = cursorStep !== "hidden";

  // Cursor position (top-left of SVG element relative to card)
  const cursorX = cursorStep === "start" ? CURSOR_START_X : CURSOR_OVER_X;
  const cursorY =
    cursorStep === "start"    ? CURSOR_START_Y :
    cursorStep === "pressing" ? CURSOR_PRESS_Y :
                                CURSOR_OVER_Y;

  // Transition per step
  const cursorTransition =
    cursorStep === "moving"   ? "transform 0.84s cubic-bezier(0.23, 1, 0.32, 1)" :
    cursorStep === "pressing" ? "transform 0.12s ease" :
    cursorStep === "released" ? "transform 0.15s ease" :
                                "none";

  return (
    <div
      style={{
        position: "absolute",
        left: "55%",
        top: "56%",
        transform: `translate(-50%, -50%) scale(${visible ? 1 : 0.88})`,
        opacity: visible ? 1 : 0,
        transition: "opacity 0.55s ease, transform 0.55s cubic-bezier(0.34, 1.4, 0.64, 1)",
        pointerEvents: visible ? "auto" : "none",
        zIndex: 30,
      }}
    >
      <div
        style={{
          background: "rgba(255, 255, 255, 0.97)",
          borderRadius: "14px",
          padding: "14px 16px 16px",
          width: "260px",
          boxShadow:
            "0 8px 40px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.12)",
          position: "relative",
          overflow: "visible",
        }}
      >
        {/* Title row */}
        <div
          style={{
            display: "flex",
            gap: "9px",
            alignItems: "flex-start",
            marginBottom: "9px",
          }}
        >
          <div style={{ flexShrink: 0, marginTop: "1px" }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="2.5" stroke="#22C35D" strokeWidth="1.33" />
              <line x1="1"    y1="8" x2="5.5" y2="8"  stroke="#22C35D" strokeWidth="1.33" strokeLinecap="round" />
              <line x1="10.5" y1="8" x2="15"  y2="8"  stroke="#22C35D" strokeWidth="1.33" strokeLinecap="round" />
            </svg>
          </div>
          <p
            style={{
              fontSize: "13px",
              fontWeight: 700,
              color: "#08062d",
              lineHeight: "1.35",
              margin: 0,
              fontFamily: "'Mulish', sans-serif",
            }}
          >
            Fix CVE-2024-1234 and 63 others in base node image
          </p>
        </div>

        {/* Meta row */}
        <div
          style={{
            display: "flex",
            gap: "7px",
            alignItems: "center",
            marginBottom: "14px",
          }}
        >
          <span
            style={{
              fontSize: "13px",
              color: "#989898",
              fontFamily: "'Mulish', sans-serif",
              whiteSpace: "nowrap",
            }}
          >
            #22 by averlonsecurity
          </span>
          <span
            style={{
              fontSize: "12px",
              color: "#989898",
              border: "1px solid #c4c4c4",
              borderRadius: "400px",
              padding: "0 7px",
              lineHeight: "18px",
              fontFamily: "'Mulish', sans-serif",
              flexShrink: 0,
            }}
          >
            bot
          </span>
        </div>

        {/* ── Merge Fix button — 3-D raised style ─────────────────────────── */}
        <button
          style={{
            background: isPressing ? "#2c2c2c" : "#363636",
            color: "white",
            border: "none",
            borderRadius: "20px",
            padding: "9px 0",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
            width: "100%",
            fontFamily: "'Mulish', sans-serif",
            letterSpacing: "0.01em",
            // 3-D depth: bottom shadow acts as the "extrusion edge"
            boxShadow: isPressing
              ? "0 1px 0 rgba(0,0,0,0.55), inset 0 2px 4px rgba(0,0,0,0.25)"
              : "0 5px 0 rgba(0,0,0,0.5), 0 7px 16px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.08)",
            transform: isPressing ? "translateY(4px)" : "translateY(0px)",
            transition:
              isPressing
                ? "all 0.10s ease"
                : cursorStep === "released"
                  ? "all 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)"
                  : "box-shadow 0.18s ease, transform 0.18s ease",
          }}
        >
          Merge Fix
        </button>

        {/* ── Animated hand cursor ─────────────────────────────────────────── */}
        {showCursor && (
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              transform: `translate(${cursorX}px, ${cursorY}px)`,
              transition: cursorTransition,
              pointerEvents: "none",
              zIndex: 50,
              cursor: "pointer",
            }}
          >
            <HandCursor pressing={isPressing} />
          </div>
        )}
      </div>
    </div>
  );
}