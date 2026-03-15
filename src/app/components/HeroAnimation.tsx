/**
 * HeroAnimation — self-contained hero canvas animation.
 * Drop this into any `position: relative` container that has a defined height
 * and it will fill it completely, running the full eight-phase animation sequence.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { NodeField } from "./NodeField";
import { CascadePanel } from "./CascadePanel";
import { FinalHero } from "./FinalHero";

// ── Constants ─────────────────────────────────────────────────────────────────

const HIGHLIGHT_IDS = [2, 6, 9];

// ── Insight labels — appear on pattern nodes once connections are assembled ────
const INSIGHT_LABELS = [
  { nodeId:  0, text: "Internet reachable with RCE",          color: "#ef4444", delay: 280  },
  { nodeId:  3, text: "Lateral movement",                     color: "#f97316", delay: 680  },
  { nodeId:  7, text: "Retrieves service account credentials", color: "#f59e0b", delay: 1080 },
  { nodeId:  9, text: "Gets write access to AI training data", color: "#ef4444", delay: 1480 },
];
// Text ("Attackers Exploit Systems, Not CVEs.") appears 1950ms after "formed"
const FORMED_TEXT_DELAY = 1950;

const OVERLAY_DATA = [
  { category: "VULNERABILITY",    title: "CVE-2023-0006: SQL Injection",     status: "Critical",  statusColor: "#ef4444" },
  { category: "MISCONFIGURATION", title: "Public S3 Bucket Exposed",          status: "High Risk", statusColor: "#f97316" },
  { category: "SECRET EXPOSURE",  title: "AWS Key Leaked in Git Repo",        status: "Critical",  statusColor: "#ef4444" },
  { category: "ENTITLEMENT",      title: "Overprivileged IAM Role Access",    status: "High Risk", statusColor: "#f97316" },
  { category: "VULNERABILITY",    title: "CVE-2024-1182: Log4j RCE Exploit", status: "Critical",  statusColor: "#ef4444" },
  { category: "VULNERABILITY",    title: "CVE-2023-4891: OpenSSL Overflow",  status: "High Risk", statusColor: "#f97316" },
];
const OVERLAY_DELAYS = [550, 1050, 1600, 850, 1350, 1950];

// ── Triage-phase overlay data (same tracked nodes, "not exploitable" verdict) ──

// Typing delays (ms from phase start):
//   r1Delay = popup delay + 380ms (card settle time)
//   r2Delay = r1Delay + reason1.length * 22ms (speed) + 220ms (gap)
//   verdictDelay = r2Delay + reason2.length * 22ms + 150ms (appears after both lines finish)
const TRIAGE_DATA = [
  {
    category: "VULNERABILITY",
    title: "CVE-2023-44487: HTTP/2 Rapid Reset",
    reason1: "Service directly reachable — no WAF in path",
    reason2: "Active exploit confirmed in traffic logs",
    r1Delay: 700,  r2Delay: 1712, verdictDelay: 2654,
    exploitable: true,
  },
  {
    category: "MISCONFIGURATION",
    title: "Redis Port Open on Internal Subnet",
    reason1: "Security group restricts all inbound traffic",
    reason2: "No lateral movement path from perimeter",
    r1Delay: 1100, r2Delay: 2288, verdictDelay: 3296,
    exploitable: false,
  },
  {
    category: "VULNERABILITY",
    title: "CVE-2024-0056: TLS MitM Downgrade",
    reason1: "Certificate pinning enforced at gateway",
    reason2: "No known active exploit in this environment",
    r1Delay: 1560, r2Delay: 2638, verdictDelay: 3734,
    exploitable: false,
  },
  {
    category: "SECRET EXPOSURE",
    title: "Hardcoded DB Password in Config File",
    reason1: "Config file exposed in public repository",
    reason2: "Credentials confirmed active — not rotated",
    r1Delay: 900,  r2Delay: 2000, verdictDelay: 2876,
    exploitable: true,
  },
  {
    category: "ENTITLEMENT",
    title: "Wildcard S3 Read Permission on Role",
    reason1: "Bucket contains no customer-sensitive data",
    reason2: "No external principal can assume the role",
    r1Delay: 1300, r2Delay: 2444, verdictDelay: 3496,
    exploitable: false,
  },
  {
    category: "VULNERABILITY",
    title: "CVE-2023-0179: Linux Kernel PrivEsc",
    reason1: "Kernel version patched — exploit not applicable",
    reason2: "No container escape vector available",
    r1Delay: 1820, r2Delay: 3074, verdictDelay: 4174,
    exploitable: false,
  },
];
const TRIAGE_DELAYS = [320, 720, 1180, 520, 920, 1440];

// ── Phase ordering ────────────────────────────────────────────────────────────

type Phase = "chaos" | "triage" | "drop" | "form" | "formed" | "highlight" | "cascade" | "dissolve" | "final";

const ALL_PHASES: Phase[] = [
  "chaos", "triage", "drop", "form", "formed", "highlight", "cascade", "dissolve", "final",
];

// ── Timeline visual config ────────────────────────────────────────────────────

// Section chapter markers shown above the track
const SECTIONS = [
  { label: "01", phaseIdx: 0 },
  { label: "02", phaseIdx: 4 },
  { label: "03", phaseIdx: 8 },
];

// Scatter-particle data (fixed so it never flickers on re-render)
const STARS = [
  { x:  3, y: 38, r: 1,   p: true  },
  { x:  8, y: 68, r: 1,   p: false },
  { x: 14, y: 25, r: 1.4, p: false },
  { x: 19, y: 74, r: 1,   p: true  },
  { x: 25, y: 52, r: 1,   p: false },
  { x: 31, y: 40, r: 1,   p: false },
  { x: 37, y: 80, r: 1.4, p: true  },
  { x: 43, y: 44, r: 1,   p: false },
  { x: 49, y: 18, r: 1,   p: false },
  { x: 55, y: 70, r: 1,   p: true  },
  { x: 61, y: 33, r: 1.4, p: false },
  { x: 67, y: 60, r: 1,   p: false },
  { x: 73, y: 22, r: 1,   p: true  },
  { x: 79, y: 72, r: 1,   p: false },
  { x: 84, y: 44, r: 1.4, p: false },
  { x: 90, y: 64, r: 1,   p: true  },
  { x: 95, y: 28, r: 1,   p: false },
  { x: 28, y: 62, r: 0.8, p: false },
  { x: 52, y: 85, r: 0.8, p: true  },
  { x: 76, y: 30, r: 0.8, p: false },
];

// ── TypewriterText ────────────────────────────────────────────────────────────

function TypewriterText({
  text, startDelay, speed = 22, active,
}: {
  text: string; startDelay: number; speed?: number; active: boolean;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active) return;
    setCount(0);
    let intervalId: ReturnType<typeof setInterval> | null = null;
    const timeoutId = setTimeout(() => {
      let i = 0;
      intervalId = setInterval(() => {
        i += 1;
        setCount(i);
        if (i >= text.length) {
          if (intervalId) clearInterval(intervalId);
          intervalId = null;
        }
      }, speed);
    }, startDelay);
    return () => {
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [active]); // eslint-disable-line react-hooks/exhaustive-deps

  const done = count >= text.length;
  return (
    <>
      {text.slice(0, count)}
      {active && !done && count > 0 && (
        <span
          style={{
            display: "inline-block",
            width: "1.5px",
            height: "0.82em",
            background: "#4ade80",
            verticalAlign: "text-bottom",
            marginLeft: "1px",
            animation: "twBlink 0.65s step-end infinite",
          }}
        />
      )}
    </>
  );
}

// ── HeroText ──────────────────────────────────────────────────────────────────

function HeroText({ phase, textVisible }: { phase: Phase; textVisible: boolean }) {
  const visible = phase === "chaos" || phase === "triage" || phase === "drop" || textVisible || phase === "dissolve";
  return (
    <div
      className="absolute flex flex-col items-center text-center text-white pointer-events-none"
      style={{
        left: "50%", top: "50%",
        transform: "translate(-50%, -50%)",
        width: "min(829px, 86vw)",
        gap: "13px",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.65s ease",
        zIndex: 20,
      }}
    >
      <div style={{ display: "grid", width: "100%" }}>
        <p className="font-[Brulia]" style={{ gridArea: "1/1", lineHeight: 1, whiteSpace: "pre-wrap", fontSize: "clamp(28px, 4vw, 45px)", opacity: phase === "chaos"  ? 1 : 0, transition: "opacity 0.75s ease" }}>
          Thousands of Findings. Yet Risk Remains.
        </p>
        <p className="font-[Brulia]" style={{ gridArea: "1/1", lineHeight: 1, whiteSpace: "pre-wrap", fontSize: "clamp(28px, 4vw, 45px)", opacity: (phase === "triage" || phase === "drop") ? 1 : 0, transition: "opacity 0.75s ease 0.35s" }}>
          Not Every Finding is a Risk.
        </p>
        <p className="font-[Brulia]" style={{ gridArea: "1/1", lineHeight: 1, whiteSpace: "pre-wrap", fontSize: "clamp(28px, 4vw, 45px)", opacity: textVisible ? 1 : 0, transition: "opacity 1.1s ease" }}>
          {"Attackers Exploit Systems,\nNot CVEs."}
        </p>
        <p className="font-[Brulia]" style={{ gridArea: "1/1", lineHeight: 1, whiteSpace: "pre-wrap", fontSize: "clamp(28px, 4vw, 45px)", opacity: phase === "dissolve" ? 1 : 0, transition: "opacity 0.9s ease 0.2s" }}>
          {"Findings Highlight Gaps.\nFixes Address Risk."}
        </p>
      </div>
      <p style={{ fontFamily: "'Mulish', sans-serif", fontWeight: 300, fontSize: "clamp(14px, 1.5vw, 18px)", lineHeight: "normal", opacity: phase === "chaos" ? 1 : 0, transition: "opacity 0.4s ease" }}>
        Discovery Outpaces Defense.
      </p>
    </div>
  );
}

// ── TimelineSlider ────────────────────────────────────────────────────────────

interface TimelineSliderProps {
  phase:      Phase;
  onSeek:     (p: Phase) => void;
  onLiveSeek: (p: Phase) => void;
}

function TimelineSlider({ phase, onSeek, onLiveSeek }: TimelineSliderProps) {
  const trackRef      = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);

  // Always-fresh refs — no stale closures inside document handlers
  const phaseRef      = useRef<Phase>(phase);
  const onSeekRef     = useRef(onSeek);
  const onLiveSeekRef = useRef(onLiveSeek);
  useEffect(() => { phaseRef.current      = phase;      }, [phase]);
  useEffect(() => { onSeekRef.current     = onSeek;     }, [onSeek]);
  useEffect(() => { onLiveSeekRef.current = onLiveSeek; }, [onLiveSeek]);

  const currentIdx = ALL_PHASES.indexOf(phase);
  const progress   = currentIdx / (ALL_PHASES.length - 1);

  // Stable helper — no deps, reads refs only so it never changes
  const phaseFromX = useCallback((clientX: number): Phase => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return phaseRef.current;
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return ALL_PHASES[Math.round(ratio * (ALL_PHASES.length - 1))];
  }, []); // ← intentionally empty: relies entirely on refs

  // Register global listeners ONCE (phaseFromX is stable so this runs once)
  useEffect(() => {
    const move = (clientX: number) => {
      if (!isDraggingRef.current) return;
      onLiveSeekRef.current(phaseFromX(clientX));
    };
    const end = (clientX: number) => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      setIsDragging(false);
      onSeekRef.current(phaseFromX(clientX));
    };

    const onMouseMove  = (e: MouseEvent)  => move(e.clientX);
    const onMouseUp    = (e: MouseEvent)  => end(e.clientX);
    const onTouchMove  = (e: TouchEvent)  => { e.preventDefault(); move(e.touches[0].clientX); };
    const onTouchEnd   = (e: TouchEvent)  => end(e.changedTouches[0].clientX);

    document.addEventListener("mousemove",  onMouseMove);
    document.addEventListener("mouseup",    onMouseUp);
    document.addEventListener("touchmove",  onTouchMove,  { passive: false });
    document.addEventListener("touchend",   onTouchEnd);
    return () => {
      document.removeEventListener("mousemove",  onMouseMove);
      document.removeEventListener("mouseup",    onMouseUp);
      document.removeEventListener("touchmove",  onTouchMove);
      document.removeEventListener("touchend",   onTouchEnd);
    };
  }, [phaseFromX]);

  // Start drag from orb; stopPropagation prevents track's onClick from also firing
  const startDrag = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isDraggingRef.current = true;
    setIsDragging(true);
  };

  return (
    <div
      style={{
        position: "absolute",
        bottom: 20, left: 0, right: 0,
        height: "62px",
        zIndex: 25,
        pointerEvents: "none",
      }}
    >
      {/* Gradient fade at very bottom so the track doesn't float on thin air */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to top, rgba(7,7,15,0.55) 0%, transparent 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Star / scatter particles */}
      <svg
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }}
        aria-hidden="true"
      >
        {STARS.map((s, i) => (
          <circle
            key={i}
            cx={`${s.x}%`}
            cy={`${s.y}%`}
            r={s.r}
            fill={s.p ? "rgba(168,85,247,0.55)" : "rgba(255,255,255,0.20)"}
          />
        ))}
      </svg>

      {/* ── Clickable track area ─────────────────────────────────────────── */}
      <div
        ref={trackRef}
        onClick={(e) => {
          // Only handle genuine track clicks (not bubbled from orb drag)
          if (isDraggingRef.current) return;
          onSeekRef.current(phaseFromX(e.clientX));
        }}
        onTouchEnd={(e) => {
          if (isDraggingRef.current) return;
          e.preventDefault();
          onSeekRef.current(phaseFromX(e.changedTouches[0].clientX));
        }}
        style={{
          position: "absolute",
          top: "50%", left: "52px", right: "52px",
          height: "44px",
          transform: "translateY(-50%)",
          cursor: "pointer",
          pointerEvents: "auto",
        }}
      >
        {/* Dashed track line */}
        <div
          style={{
            position: "absolute",
            top: "50%", left: 0, right: 0,
            height: 0,
            borderTop: "1px dashed rgba(255,255,255,0.18)",
          }}
        />

        {/* Section labels (01, 02, 03) — positioned above the midline */}
        {SECTIONS.map(({ label, phaseIdx }) => {
          const pct = (phaseIdx / (ALL_PHASES.length - 1)) * 100;
          return (
            <div
              key={label}
              style={{
                position:  "absolute",
                left:      `${pct}%`,
                top:       "calc(50% - 14px)",
                transform: "translateX(-50%)",
                fontFamily:    "Menlo, monospace",
                fontSize:      "10px",
                letterSpacing: "0.06em",
                color:         "rgba(255,255,255,0.32)",
                userSelect:    "none",
                pointerEvents: "none",
                lineHeight: 1,
              }}
            >
              {label}
            </div>
          );
        })}

        {/* Small tick marks at each section position */}
        {SECTIONS.map(({ label, phaseIdx }) => {
          const pct = (phaseIdx / (ALL_PHASES.length - 1)) * 100;
          return (
            <div
              key={`tick-${label}`}
              style={{
                position:  "absolute",
                left:      `${pct}%`,
                top:       "50%",
                transform: "translate(-50%, -50%)",
                width:     "1px",
                height:    "6px",
                background: "rgba(255,255,255,0.25)",
                pointerEvents: "none",
              }}
            />
          );
        })}

        {/* ── Glowing orb indicator ─────────────────────────────────────── */}
        <div
          onMouseDown={startDrag}
          onTouchStart={startDrag}
          onClick={(e) => e.stopPropagation()} // prevent track onClick on orb click
          style={{
            position:  "absolute",
            left:      `${progress * 100}%`,
            top:       "50%",
            transform: "translate(-50%, -50%)",
            width:  "15px",
            height: "15px",
            borderRadius: "50%",
            background: "radial-gradient(circle at 38% 32%, #e0aaff, #7c3aed 75%)",
            boxShadow: [
              "0 0 0 2.5px rgba(168,85,247,0.25)",
              "0 0 10px 3px rgba(168,85,247,0.75)",
              "0 0 26px 8px rgba(109,40,217,0.38)",
            ].join(", "),
            cursor:        isDragging ? "grabbing" : "grab",
            zIndex:        5,
            pointerEvents: "auto",
            transition:    isDragging ? "none" : "left 0.38s cubic-bezier(0.23, 1, 0.32, 1)",
          }}
        />
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function HeroAnimation() {
  const [phase,    setPhase]    = useState<Phase>("chaos");
  const [resetKey, setResetKey] = useState(0);
  const [cascadeClickActive, setCascadeClickActive] = useState(false);
  const [hasEnteredViewport, setHasEnteredViewport] = useState(false);

  // Pattern node pixel positions (reported by NodeField once connections start)
  const [patternPos, setPatternPos] = useState<Record<number, { x: number; y: number }>>({});
  // Delayed text reveal — "Attackers Exploit Systems, Not CVEs." appears after labels
  const [textVisible, setTextVisible] = useState(false);
  // Viewport size for responsive label clamping
  const containerRef = useRef<HTMLDivElement>(null);
  const [vp, setVp] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const updateSize = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setVp({
        w: rect.width,
        h: rect.height,
      });
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const isMobile = vp.w < 640;
  const isTablet = vp.w < 1024;

  useEffect(() => {
    if (hasEnteredViewport) return;
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      entries => {
        const entry = entries[0];
        if (entry && entry.isIntersecting) {
          setHasEnteredViewport(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35, rootMargin: "0px 0px -15%" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasEnteredViewport]);

  const overlayRefs = useRef<Array<HTMLDivElement | null>>(new Array(6).fill(null));
  const triageRefs  = useRef<Array<HTMLDivElement | null>>(new Array(6).fill(null));

  const handleFramePositions = useCallback(
    (pts: Array<{ x: number; y: number; r: number }>) => {
      pts.forEach((pt, i) => {
        const parentW =
          (overlayRefs.current[i]?.parentElement ??
            triageRefs.current[i]?.parentElement)?.clientWidth ??
          containerRef.current?.clientWidth ??
          vp.w;
        const flipLeft = pt.x > parentW * 0.60;
        const transform = flipLeft
          ? `translate(calc(-100% - 16px), -50%)`
          : `translate(16px, -50%)`;

        const el = overlayRefs.current[i];
        if (el) {
          el.style.left      = `${pt.x}px`;
          el.style.top       = `${pt.y}px`;
          el.style.transform = transform;
        }
        const tel = triageRefs.current[i];
        if (tel) {
          tel.style.left      = `${pt.x}px`;
          tel.style.top       = `${pt.y}px`;
          tel.style.transform = transform;
        }
      });
    },
    [],
  );

  // ── Single effect drives ALL phase auto-advancement ───────────────────────
  useEffect(() => {
    if (!hasEnteredViewport) return undefined;
    let t: ReturnType<typeof setTimeout> | undefined;
    if (phase === "chaos")     t = setTimeout(() => setPhase("triage"),    4000);
    if (phase === "triage")    t = setTimeout(() => setPhase("drop"),      5200);
    if (phase === "drop")      t = setTimeout(() => setPhase("form"),      3200);
    if (phase === "formed")    t = setTimeout(() => setPhase("highlight"), 4200);
    if (phase === "highlight") t = setTimeout(() => setPhase("cascade"),   2200);
    if (phase === "cascade")   t = setTimeout(() => setPhase("dissolve"),  4800);
    if (phase === "dissolve")  t = setTimeout(() => setPhase("final"),     2600);
    return () => { if (t !== undefined) clearTimeout(t); };
  }, [phase, hasEnteredViewport]);

  // ── Delayed text reveal during "formed" phase ─────────────────────────────
  useEffect(() => {
    if (!hasEnteredViewport || phase !== "formed") { setTextVisible(false); return; }
    const t = setTimeout(() => setTextVisible(true), FORMED_TEXT_DELAY);
    return () => clearTimeout(t);
  }, [phase, hasEnteredViewport]);

  // ── Cascade sub-timer: trigger cursor click 2.3s into cascade phase ───────
  useEffect(() => {
    if (!hasEnteredViewport || phase !== "cascade") { setCascadeClickActive(false); return; }
    const t = setTimeout(() => setCascadeClickActive(true), 2300);
    return () => clearTimeout(t);
  }, [phase, hasEnteredViewport]);

  const handleConnectionsComplete = useCallback(() => {
    setPhase("formed");
    // Keep patternPos intact so insight labels have positions to render
  }, []);

  const handlePatternPositions = useCallback(
    (positions: Record<number, { x: number; y: number }>) => {
      setPatternPos(positions);
    },
    [],
  );

  // Commit seek: remount NodeField for a clean canvas state
  const seekTo = useCallback((targetPhase: Phase) => {
    setResetKey(k => k + 1);
    setPhase(targetPhase);
  }, []);

  // Live seek during drag: just update phase, don't remount canvas
  const liveSeek = useCallback((targetPhase: Phase) => {
    setPhase(targetPhase);
  }, []);

  const isDropping   = phase !== "chaos" && phase !== "triage";
  const isForming    = ["form","formed","highlight","cascade","dissolve","final"].includes(phase);
  const isHighlight  = ["highlight","cascade"].includes(phase);
  const isDissolving = phase === "dissolve";

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden"
      style={{
        background: "radial-gradient(ellipse at 52% 44%, #1a0830 0%, #0b0617 45%, #07070f 100%)",
        transform: "translateY(-40px)",
      }}
    >
      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 46%, rgba(140,40,220,0.10) 0%, transparent 65%)",
        }}
      />

      {/* Canvas layer — keyed so it remounts cleanly on commit seeks */}
      {hasEnteredViewport && (
        <NodeField
          key={resetKey}
          dropping={isDropping}
          forming={isForming}
          onConnectionsComplete={handleConnectionsComplete}
          highlightNodeIds={isHighlight ? HIGHLIGHT_IDS : []}
          dimmed={phase === "final"}
          dissolving={isDissolving}
          trackCount={6}
          showTrackedRings={phase === "chaos" || phase === "triage"}
          onFramePositions={handleFramePositions}
          onPatternPositions={handlePatternPositions}
          keepTrackedIndices={[0, 3]}
        />
      )}

      {/* Chaos-phase overlay cards */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 10, opacity: phase === "chaos" ? 1 : 0, transition: "opacity 0.55s ease" }}
      >
        <style>{`
          @keyframes overlayPop {
            from { opacity: 0; transform: scale(0.82); }
            to   { opacity: 1; transform: scale(1);    }
          }
          @keyframes triagePop {
            from { opacity: 0; transform: scale(0.86) translateY(6px); }
            to   { opacity: 1; transform: scale(1)    translateY(0px); }
          }
          @keyframes twBlink {
            0%, 100% { opacity: 1; }
            50%       { opacity: 0; }
          }
          @keyframes verdictPop {
            from { opacity: 0; transform: translateY(4px) scale(0.94); }
            to   { opacity: 1; transform: translateY(0px) scale(1);    }
          }
        `}</style>
        {OVERLAY_DATA.map((data, i) => (
          <div key={i} ref={el => { overlayRefs.current[i] = el; }} style={{ position: "absolute", left: -9999, top: -9999 }}>
            <div style={{ animation: `overlayPop 0.32s cubic-bezier(0.34, 1.56, 0.64, 1) ${OVERLAY_DELAYS[i]}ms both`, transformOrigin: "left center" }}>
              <div style={{ background: "rgba(6,8,24,0.90)", border: "1px solid rgba(255,255,255,0.13)", borderRadius: "8px", padding: "10px 14px", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", minWidth: "188px", maxWidth: "224px", boxShadow: "0 4px 24px rgba(0,0,0,0.5)" }}>
                <p style={{ fontFamily: "Menlo, monospace", fontSize: "8.5px", letterSpacing: "0.13em", textTransform: "uppercase", color: "rgba(255,255,255,0.36)", margin: "0 0 5px" }}>{data.category}</p>
                <p style={{ fontFamily: "'Mulish', sans-serif", fontSize: "12.5px", fontWeight: 600, color: "white", margin: "0 0 8px", lineHeight: 1.35 }}>{data.title}</p>
                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: data.statusColor, flexShrink: 0, boxShadow: `0 0 5px ${data.statusColor}` }} />
                  <span style={{ fontFamily: "'Mulish', sans-serif", fontSize: "11px", color: data.statusColor, fontWeight: 500 }}>{data.status}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Triage-phase overlay cards — "Not Exploitable" verdicts */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 10, opacity: phase === "triage" ? 1 : 0, transition: "opacity 0.6s ease" }}
      >
        {TRIAGE_DATA.map((data, i) => (
          <div key={i} ref={el => { triageRefs.current[i] = el; }} style={{ position: "absolute", left: -9999, top: -9999 }}>
            <div style={{ animation: phase === "triage" ? `triagePop 0.38s cubic-bezier(0.34, 1.4, 0.64, 1) ${TRIAGE_DELAYS[i]}ms both` : "none", transformOrigin: "left center" }}>
              <div style={{ background: "rgba(4,12,20,0.92)", border: `1px solid ${data.exploitable ? "rgba(239,68,68,0.28)" : "rgba(34,197,94,0.22)"}`, borderRadius: "8px", padding: "10px 14px", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", minWidth: "210px", maxWidth: "248px", boxShadow: `0 4px 28px rgba(0,0,0,0.55), 0 0 0 1px ${data.exploitable ? "rgba(239,68,68,0.10)" : "rgba(34,197,94,0.08)"}` }}>
                {/* Category */}
                <p style={{ fontFamily: "Menlo, monospace", fontSize: "8px", letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.30)", margin: "0 0 5px" }}>{data.category}</p>
                {/* Title */}
                <p style={{ fontFamily: "'Mulish', sans-serif", fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,0.82)", margin: "0 0 9px", lineHeight: 1.35 }}>{data.title}</p>
                {/* Reasons — typewriter lines */}
                <div style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", paddingBottom: "8px", marginBottom: "9px", display: "flex", flexDirection: "column", gap: "5px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "6px" }}>
                    <span style={{ color: data.exploitable ? "#f87171" : "#4ade80", fontSize: "9px", flexShrink: 0, marginTop: "1.5px", opacity: 0.85 }}>{data.exploitable ? "✗" : "✓"}</span>
                    <span style={{ fontFamily: "'Mulish', sans-serif", fontSize: "10.5px", color: "rgba(255,255,255,0.48)", lineHeight: 1.35 }}>
                      <TypewriterText
                        text={data.reason1}
                        startDelay={data.r1Delay}
                        active={hasEnteredViewport && phase === "triage"}
                      />
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "6px" }}>
                    <span style={{ color: data.exploitable ? "#f87171" : "#4ade80", fontSize: "9px", flexShrink: 0, marginTop: "1.5px", opacity: 0.85 }}>{data.exploitable ? "✗" : "✓"}</span>
                    <span style={{ fontFamily: "'Mulish', sans-serif", fontSize: "10.5px", color: "rgba(255,255,255,0.48)", lineHeight: 1.35 }}>
                      <TypewriterText
                        text={data.reason2}
                        startDelay={data.r2Delay}
                        active={hasEnteredViewport && phase === "triage"}
                      />
                    </span>
                  </div>
                </div>
                {/* Verdict badge */}
                <div
                  style={{
                    display: "flex", alignItems: "center", gap: "6px", marginBottom: "9px",
                    animation: phase === "triage" ? `verdictPop 0.45s cubic-bezier(0.34, 1.5, 0.64, 1) ${data.verdictDelay}ms both` : "none",
                  }}
                >
                  {data.exploitable ? (
                    <>
                      <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#ef4444", flexShrink: 0, boxShadow: "0 0 6px #ef4444, 0 0 12px rgba(239,68,68,0.4)" }} />
                      <span style={{ fontFamily: "'Mulish', sans-serif", fontSize: "11.5px", color: "#f87171", fontWeight: 700, letterSpacing: "0.01em" }}>Exploitable</span>
                    </>
                  ) : (
                    <>
                      <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#22c55e", flexShrink: 0, boxShadow: "0 0 6px #22c55e, 0 0 12px rgba(34,197,94,0.4)" }} />
                      <span style={{ fontFamily: "'Mulish', sans-serif", fontSize: "11.5px", color: "#4ade80", fontWeight: 700, letterSpacing: "0.01em" }}>Not Exploitable</span>
                    </>
                  )}
                </div>
                {/* Averlon AI attribution footer */}
                <div style={{ marginTop: "9px", paddingTop: "7px", borderTop: "1px solid rgba(168,85,247,0.14)", display: "flex", alignItems: "center", gap: "5px" }}>
                  <svg width="9" height="9" viewBox="0 0 9 9" fill="none" style={{ flexShrink: 0 }}>
                    <path d="M4.5 0.5L5.5 3.5H8.5L6.2 5.4L7 8.2L4.5 6.5L2 8.2L2.8 5.4L0.5 3.5H3.5Z" fill="#a855f7" opacity="0.9"/>
                  </svg>
                  <span style={{ fontFamily: "Menlo, monospace", fontSize: "7.5px", letterSpacing: "0.13em", textTransform: "uppercase", color: "rgba(168,85,247,0.75)" }}>Averlon AI</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mid-animation text */}
      <HeroText phase={phase} textVisible={textVisible} />

      {/* ── Insight labels — pop on attack chain nodes ─────────────────────── */}
      <style>{`
        @keyframes insightPop {
          0%   { opacity: 0; transform: translateY(8px) scale(0.88); }
          65%  { opacity: 1; transform: translateY(-3px) scale(1.02); }
          100% { opacity: 1; transform: translateY(0px) scale(1); }
        }
      `}</style>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 18, opacity: (phase === "formed" || phase === "highlight") ? 1 : 0, transition: "opacity 0.7s ease" }}
      >
        {INSIGHT_LABELS.map((label) => {
          const pos = patternPos[label.nodeId];
          if (!pos) return null;

          // ── Responsive sizing ───────────────────────────────────────────
          const labelMaxW  = isMobile ? 148 : isTablet ? 188 : 230;
          const halfMaxW   = labelMaxW / 2 + 10;
          const fontSize   = isMobile ? "10px" : "11px";
          const padY_chip  = isMobile ? "5px" : "6px";
          const padX_chip  = isMobile ? "8px" : "11px";

          // ── Horizontal clamping: keep the label inside the viewport ─────
          // The outer div uses translateX(-50%) to center on the node.
          // We clamp the anchor so the label never clips left/right.
          const clampedX = Math.max(halfMaxW, Math.min(pos.x, vp.w - halfMaxW));

          // ── Vertical flip: below if node is in top 28% of canvas ────────
          const flipBelow    = pos.y < vp.h * 0.28;
          const vertShift    = flipBelow
            ? "translateY(20px)"
            : "translateY(calc(-100% - 20px))";
          const stemDir      = flipBelow ? "to bottom" : "to top";
          const stemAnchor   = flipBelow ? "top" : "bottom";

          return (
            <div
              key={label.nodeId}
              style={{
                position: "absolute",
                left: clampedX,
                top: pos.y,
                transform: "translateX(-50%)",
                pointerEvents: "none",
              }}
            >
              {/* Stem — always points toward the actual node at pos.x */}
              {!isMobile && (
                <div style={{
                  position: "absolute",
                  left: `calc(50% + ${pos.x - clampedX}px)`,
                  [stemAnchor]: "100%",
                  transform: "translateX(-50%)",
                  width: "1px",
                  height: "16px",
                  background: `linear-gradient(${stemDir}, ${label.color}55, transparent)`,
                }} />
              )}

              {/* Label chip */}
              <div style={{
                transform: vertShift,
                animation: phase === "formed" || phase === "highlight"
                  ? `insightPop 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) ${label.delay}ms both`
                  : "none",
              }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: isMobile ? "5px" : "7px",
                  background: "rgba(4, 4, 16, 0.90)",
                  border: `1px solid ${label.color}50`,
                  borderLeft: `2.5px solid ${label.color}`,
                  borderRadius: "6px",
                  padding: `${padY_chip} ${padX_chip} ${padY_chip} ${isMobile ? "7px" : "9px"}`,
                  backdropFilter: "blur(14px)",
                  WebkitBackdropFilter: "blur(14px)",
                  boxShadow: `0 0 0 1px ${label.color}18, 0 4px 20px rgba(0,0,0,0.55), 0 0 18px ${label.color}15`,
                  maxWidth: `${labelMaxW}px`,
                  // Allow wrapping on mobile/tablet
                  whiteSpace: isMobile ? "normal" : "nowrap",
                }}>
                  {/* Pulsing dot */}
                  <span style={{ position: "relative", width: isMobile ? "5px" : "6px", height: isMobile ? "5px" : "6px", flexShrink: 0 }}>
                    <span style={{
                      position: "absolute", inset: 0,
                      borderRadius: "50%",
                      background: label.color,
                      boxShadow: `0 0 5px ${label.color}, 0 0 10px ${label.color}80`,
                    }} />
                    <span style={{
                      position: "absolute",
                      inset: "-3px",
                      borderRadius: "50%",
                      background: `${label.color}25`,
                      animation: "twBlink 1.4s ease-in-out infinite",
                    }} />
                  </span>
                  <span style={{
                    fontFamily: "'Mulish', sans-serif",
                    fontSize,
                    fontWeight: 600,
                    color: "rgba(255,255,255,0.90)",
                    letterSpacing: "0.01em",
                    lineHeight: 1.35,
                  }}>
                    {label.text}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Averlon AI triage status pill ─────────────────────────────────── */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "22px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 22,
          opacity: phase === "triage" ? 1 : 0,
          transition: "opacity 0.5s ease",
        }}
      >
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          background: "rgba(10,5,22,0.82)",
          border: "1px solid rgba(168,85,247,0.30)",
          borderRadius: "999px",
          padding: "5px 13px 5px 9px",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          boxShadow: "0 0 0 1px rgba(168,85,247,0.10), 0 4px 18px rgba(0,0,0,0.45)",
        }}>
          {/* Pulsing purple dot */}
          <span style={{ position: "relative", width: "7px", height: "7px", flexShrink: 0 }}>
            <span style={{
              position: "absolute", inset: 0,
              borderRadius: "50%",
              background: "#a855f7",
              animation: "twBlink 1.1s ease-in-out infinite",
            }} />
            <span style={{
              position: "absolute", inset: "-3px",
              borderRadius: "50%",
              background: "rgba(168,85,247,0.25)",
              animation: "twBlink 1.1s ease-in-out infinite",
            }} />
          </span>
          <span style={{
            fontFamily: "Menlo, monospace",
            fontSize: "10px",
            letterSpacing: "0.10em",
            textTransform: "uppercase",
            color: "rgba(168,85,247,0.90)",
          }}>
            Averlon AI
          </span>
          <span style={{
            width: "1px",
            height: "10px",
            background: "rgba(168,85,247,0.25)",
          }} />
          <span style={{
            fontFamily: "'Mulish', sans-serif",
            fontSize: "10.5px",
            color: "rgba(255,255,255,0.50)",
            letterSpacing: "0.01em",
          }}>
            Analyzing attack paths…
          </span>
        </div>
      </div>

      {/* ── Cascade panel: cascading PR fix cards ─────────────────────────── */}
      <CascadePanel
        visible={phase === "cascade"}
        clicking={cascadeClickActive}
      />

      {/* Final hero reveal */}
      <FinalHero visible={phase === "final"} />

      {/* ── Timeline scrubber ─────────────────────────────────────────────── */}
      <TimelineSlider
        phase={phase}
        onSeek={seekTo}
        onLiveSeek={liveSeek}
      />
    </div>
  );
}
