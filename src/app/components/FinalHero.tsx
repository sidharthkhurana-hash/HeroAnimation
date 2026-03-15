import { useEffect, useRef, useState } from "react";
import imgMockupTemplate from "figma:asset/a664f395028a3e119ac2333395b17b5eba30883f.png";
import svgPaths from "../../imports/svg-4jb3m3yz27";
import { SankeyFunnel } from "./SankeyFunnel";
import averlonLogo from "../../imports/svg-76y8m40ees";

interface FinalHeroProps {
  visible: boolean;
}

const DESKTOP_MOCKUP_WIDTH = 666;
const MIN_MOCKUP_SCALE = 0.62;

// Ghost mockup — browser-window silhouette filled white at low opacity
function GhostMockup({ opacity = 0.35 }: { opacity?: number }) {
  return (
    <svg
      viewBox="0 0 447.892 291.164"
      fill="none"
      style={{ width: "100%", height: "auto", display: "block" }}
    >
      {/* Filled silhouette */}
      <path d={svgPaths.p1efdaf00} fill="white" opacity={opacity} />
      {/* Subtle stroke edge */}
      <path
        d={svgPaths.p1efdaf00}
        fill="none"
        stroke="white"
        strokeOpacity={0.18}
        strokeWidth={1}
      />
    </svg>
  );
}

function DashboardMockup() {
  return (
    <div
      style={{
        position: "relative",
        zIndex: 2,
        borderRadius: "14px",
        overflow: "hidden",
        boxShadow:
          "0 2px 0 rgba(255,255,255,0.06), 0 32px 80px rgba(0,0,0,0.55), 0 8px 24px rgba(0,0,0,0.35)",
      }}
    >
      <div
        style={{
          width: "100%",
          background: "#09091a",
          fontFamily: "'Mulish', sans-serif",
          fontSize: "11px",
          color: "#e2e8f0",
          userSelect: "none",
          display: "block",
        }}
      >
        {/* Browser chrome */}
        <div
          style={{
            background: "#12122b",
            padding: "7px 12px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <div style={{ display: "flex", gap: "5px" }}>
            {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
              <div
                key={c}
                style={{ width: "8px", height: "8px", borderRadius: "50%", background: c }}
              />
            ))}
          </div>
        </div>

        {/* App nav */}
        <div
          style={{
            background: "#0e0e22",
            display: "flex",
            alignItems: "center",
            padding: "0 14px",
            height: "36px",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            gap: "0",
          }}
        >
          {/* Averlon wordmark SVG logo */}
          <svg
            viewBox="0 0 49.3156 8.67138"
            fill="none"
            style={{ width: "49px", height: "9px", flexShrink: 0, marginRight: "20px" }}
            aria-label="averlon"
          >
            <path d={averlonLogo.p14087200} fill="white" />
          </svg>
          {[
            { l: "Dashboard", a: true },
            { l: "Findings", a: false },
            { l: "Attack Chains", a: false },
            { l: "Remediation", a: false },
            { l: "Agents", a: false },
          ].map((t) => (
            <span
              key={t.l}
              style={{
                color: t.a ? "white" : "rgba(255,255,255,0.38)",
                fontSize: "8.5px",
                fontWeight: t.a ? 600 : 400,
                padding: "0 9px",
                height: "100%",
                display: "flex",
                alignItems: "center",
                borderBottom: t.a ? "2px solid #8c28dc" : "2px solid transparent",
                whiteSpace: "nowrap",
              }}
            >
              {t.l}
            </span>
          ))}
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "5px" }}>
            <div
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#22c55e",
                boxShadow: "0 0 5px #22c55e",
              }}
            />
            <span style={{ fontSize: "8px", color: "rgba(255,255,255,0.4)", whiteSpace: "nowrap" }}>
              5 Agents Active
            </span>
          </div>
        </div>

        {/* ── Prioritization Analysis Sankey ── */}
        <SankeyFunnel />

        {/* Body: table + agent panel */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 188px" }}>
          {/* Vulnerability table */}
          <div style={{ borderRight: "1px solid rgba(255,255,255,0.07)" }}>
            {/* Toolbar */}
            <div
              style={{
                padding: "7px 12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1px solid rgba(255,255,255,0.07)",
                background: "#0b0b1e",
              }}
            >
              <span style={{ fontSize: "9.5px", fontWeight: 600, color: "rgba(255,255,255,0.88)" }}>
                Vulnerability Queue
              </span>
              <div style={{ display: "flex", gap: "5px" }}>
                <div
                  style={{
                    background: "linear-gradient(135deg,#2e3192,#8c28dc)",
                    borderRadius: "4px",
                    padding: "3px 9px",
                    fontSize: "7.5px",
                    color: "white",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "3px",
                  }}
                >
                  <span>✦</span>
                  <span>Fix All Critical</span>
                </div>
                <div
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "4px",
                    padding: "3px 7px",
                    fontSize: "7.5px",
                    color: "rgba(255,255,255,0.45)",
                    cursor: "pointer",
                  }}
                >
                  ⊕ Filter
                </div>
              </div>
            </div>
            {/* Col headers */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "78px 1fr 52px 38px 68px",
                padding: "4px 12px",
                gap: "6px",
                background: "#090919",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              {["CVE ID", "VULNERABILITY", "SEV", "CVSS", "ACTION"].map((h) => (
                <span
                  key={h}
                  style={{ fontSize: "7px", color: "rgba(255,255,255,0.25)", letterSpacing: "0.08em" }}
                >
                  {h}
                </span>
              ))}
            </div>
            {/* Rows — trimmed to 3 */}
            {[
              {
                id: "CVE-2024-23897",
                desc: "Jenkins CLI Unauth RCE",
                svc: "ci-pipeline",
                sev: "CRITICAL",
                cvss: "9.8",
                state: "fix",
              },
              {
                id: "CVE-2024-3400",
                desc: "PAN-OS Command Injection",
                svc: "firewall",
                sev: "CRITICAL",
                cvss: "10.0",
                state: "fix",
              },
              {
                id: "CVE-2023-4863",
                desc: "libwebp Heap Buffer Overflow",
                svc: "media-svc",
                sev: "HIGH",
                cvss: "8.8",
                state: "done",
              },
            ].map((row, i) => {
              const sc = row.sev === "CRITICAL" ? "#ef4444" : row.sev === "HIGH" ? "#f97316" : "#f59e0b";
              return (
                <div
                  key={row.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "78px 1fr 52px 38px 68px",
                    padding: "5px 12px",
                    gap: "6px",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                    background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.012)",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: "7.5px",
                      color: "#8b9cf7",
                      fontFamily: "monospace",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {row.id}
                  </span>
                  <div style={{ overflow: "hidden" }}>
                    <div
                      style={{
                        fontSize: "8px",
                        color: "rgba(255,255,255,0.8)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {row.desc}
                    </div>
                    <div style={{ fontSize: "7px", color: "rgba(255,255,255,0.28)" }}>{row.svc}</div>
                  </div>
                  <div
                    style={{
                      background: `${sc}1a`,
                      border: `1px solid ${sc}55`,
                      borderRadius: "3px",
                      padding: "1px 4px",
                      fontSize: "6.5px",
                      color: sc,
                      textAlign: "center",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {row.sev}
                  </div>
                  <span style={{ fontSize: "9px", color: sc, fontWeight: 700, textAlign: "center" }}>
                    {row.cvss}
                  </span>
                  {row.state === "done" ? (
                    <div
                      style={{
                        background: "#22c55e18",
                        border: "1px solid #22c55e44",
                        borderRadius: "4px",
                        padding: "3px 5px",
                        fontSize: "7px",
                        color: "#22c55e",
                        textAlign: "center",
                      }}
                    >
                      ✓ Fixed
                    </div>
                  ) : row.state === "fixing" ? (
                    <div
                      style={{
                        background: "#8c28dc22",
                        border: "1px solid #8c28dc55",
                        borderRadius: "4px",
                        padding: "3px 5px",
                        fontSize: "7px",
                        color: "#a855f7",
                        textAlign: "center",
                        whiteSpace: "nowrap",
                      }}
                    >
                      ⟳ Fixing…
                    </div>
                  ) : (
                    <div
                      style={{
                        background: "linear-gradient(135deg,rgba(46,49,146,0.7),rgba(140,40,220,0.7))",
                        border: "1px solid rgba(140,40,220,0.45)",
                        borderRadius: "4px",
                        padding: "3px 5px",
                        fontSize: "7px",
                        color: "white",
                        textAlign: "center",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                      }}
                    >
                      ▶ Auto Fix
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right: AI Agent panel */}
          <div style={{ background: "#090919" }}>
            <div style={{ padding: "7px 12px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              <span style={{ fontSize: "9px", fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>
                AI Agent Activity
              </span>
            </div>
            {[
              { name: "Triage Agent", msg: "Analyzed 1,247 findings", time: "2s", active: true },
              { name: "Prioritization Agent", msg: "Ranked 23 attack chains", time: "5s", active: true },
              { name: "Remediation Agent", msg: "Generated PR #847", time: "12s", active: true },
              { name: "Remediation Agent", msg: "Merged fix — CVE-2023-4863", time: "1m", active: false },
              { name: "Triage Agent", msg: "Cleared 34 false positives", time: "3m", active: false },
            ].map((agent, index) => (
              <div
                key={`${agent.name}-${agent.time}-${index}`}
                style={{ padding: "6px 12px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <div
                      style={{
                        width: "5px",
                        height: "5px",
                        borderRadius: "50%",
                        background: agent.active ? "#22c55e" : "#8c28dc",
                        boxShadow: agent.active ? "0 0 4px #22c55e" : "none",
                      }}
                    />
                    <span style={{ fontSize: "7.5px", color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>{agent.name}</span>
                  </div>
                  <span style={{ fontSize: "6.5px", color: "rgba(255,255,255,0.22)" }}>{agent.time} ago</span>
                </div>
                <p
                  style={{
                    fontSize: "7px",
                    color: "rgba(255,255,255,0.38)",
                    paddingLeft: "10px",
                    margin: 0,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {agent.msg}
                </p>
              </div>
            ))}
            {/* Remediation velocity mini chart */}
            <div style={{ padding: "8px 12px" }}>
              <div
                style={{
                  fontSize: "7px",
                  color: "rgba(255,255,255,0.3)",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: "7px",
                }}
              >
                Remediation Velocity
              </div>
              {[{ l: "Mon", p: 28 }, { l: "Tue", p: 44 }, { l: "Wed", p: 35 }, { l: "Thu", p: 61 }, { l: "Fri", p: 79 }, { l: "Sat", p: 68 }, { l: "Sun", p: 94 }].map((b) => (
                <div key={b.l} style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "4px" }}>
                  <span style={{ fontSize: "6px", color: "rgba(255,255,255,0.25)", width: "14px" }}>{b.l}</span>
                  <div style={{ flex: 1, height: "5px", background: "rgba(255,255,255,0.07)", borderRadius: "2px", overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${b.p}%`,
                        height: "100%",
                        background: "linear-gradient(90deg,#2e3192,#8c28dc)",
                        borderRadius: "2px",
                      }}
                    />
                  </div>
                  <span style={{ fontSize: "6px", color: "rgba(255,255,255,0.25)", width: "20px", textAlign: "right" }}>{b.p}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FinalHero({ visible }: FinalHeroProps) {
  const mockupShellRef = useRef<HTMLDivElement | null>(null);
  const mockupContentRef = useRef<HTMLDivElement | null>(null);
  const [mockupScale, setMockupScale] = useState(1);
  const [mockupHeight, setMockupHeight] = useState<number | null>(null);
  const shellPadding = mockupScale < 0.82 ? 22 : mockupScale < 0.94 ? 14 : 0;

  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateMetrics = () => {
      const shell = mockupShellRef.current;
      if (!shell) return;
      const availableWidth = shell.clientWidth;
      const nextScale = Math.min(
        1,
        Math.max(MIN_MOCKUP_SCALE, availableWidth / DESKTOP_MOCKUP_WIDTH),
      );
      setMockupScale(nextScale);

      if (mockupContentRef.current) {
        setMockupHeight(mockupContentRef.current.offsetHeight * nextScale);
      }
    };

    updateMetrics();

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && mockupShellRef.current) {
      resizeObserver = new ResizeObserver(updateMetrics);
      resizeObserver.observe(mockupShellRef.current);
    }

    window.addEventListener("resize", updateMetrics);
    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("resize", updateMetrics);
    };
  }, []);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        overflowX: "hidden",
        overflowY: "hidden",
        // Fade + lift-in entrance
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(18px)",
        transition: "opacity 0.9s ease, transform 0.9s cubic-bezier(0.22, 1, 0.36, 1)",
        pointerEvents: visible ? "auto" : "none",
        zIndex: 5,
      }}
    >
      {/* ── Text block ──────────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          color: "white",
          paddingTop: "clamp(100px, 14vh, 140px)",
          paddingLeft: "20px",
          paddingRight: "20px",
          gap: "0px",
          minHeight: "300px",
        }}
      >
        {/* Reserved space for Webflow-managed heading/CTA */}
      </div>

      {/* ── Mockup section ─────────────────────────────────────────────────── */}
      <div
        ref={mockupShellRef}
        style={{
          position: "relative",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          marginTop: "clamp(36px, 5vh, 56px)",
          flexShrink: 0,
          height: mockupHeight ?? undefined,
          paddingLeft: `${shellPadding}px`,
          paddingRight: `${shellPadding}px`,
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            width: DESKTOP_MOCKUP_WIDTH * mockupScale,
            maxWidth: "100%",
            height: mockupHeight ?? undefined,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              transform: `scale(${mockupScale})`,
              transformOrigin: "top center",
              width: DESKTOP_MOCKUP_WIDTH,
            }}
          >
            <div
              ref={mockupContentRef}
              style={{
                position: "relative",
                width: DESKTOP_MOCKUP_WIDTH,
                flexShrink: 0,
              }}
            >
              {/* Ghost left — removed */}
              {/* Ghost right — removed */}

              {/* Main product screenshot */}
              <DashboardMockup />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
