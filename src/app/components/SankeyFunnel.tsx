/**
 * SankeyFunnel — Prioritization Analysis section for the dashboard mockup.
 * Layout and SVG paths faithfully ported from the Figma design.
 */
import svgPaths from "../../imports/svg-t0exrrsgiq";
import logoPaths from "../../imports/svg-xs3cq3hw3x";

// ─── Input source logos ───────────────────────────────────────────────────────

function QualysLogo() {
  return (
    <div
      style={{
        position: "relative",
        width: 16,
        height: 16,
        borderRadius: 2,
        flexShrink: 0,
        background: "#E01E2B", // CrowdStrike red
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <svg
        style={{ width: "80%", height: "80%", display: "block" }}
        viewBox="0 0 116.4 88.8"
        xmlns="http://www.w3.org/2000/svg"
        fill="white"
      >
        <path d="M113.3,71.7c-2.6-0.2-7.1-0.8-12.9,1.8c-5.7,2.7-8,2.8-10.8,2.5c0.8,1.4,2.5,3.3,7.7,3.7
        c5.2,0.3,7.8,0.5,5,6.6c0.1-1.8-0.4-5.4-5.6-4.8s-6.4,5-0.8,7.1c-1.8,0.3-5.7,0.5-8.4-6.1c-1.9,0.8-4.8,2.3-10.2-1.5
        c1.9,0.6,4.2,0.7,4.2,0.7c-4.7-2.1-9.3-6-12.1-9.7c2.3,1.6,4.8,3.2,7.4,3.5c-3-3.4-10-10.3-18.6-17.3c5.5,3.3,12.2,8.6,23,7.4
        C92.1,64.4,99.4,62.1,113.3,71.7"/>
        <path d="M67.4,70.4c-7.3-2.7-8.8-3.3-18.2-5.3c-9.3-2.1-18.5-6.3-24.7-13c4.3,2.8,13.2,8.3,22.3,7.7
        c-1.4-1.8-3.9-3.1-7-4.5C43.2,56,53.6,58.3,67.4,70.4"/>
        <path d="M104.1,64.3c6.4,0.6,6.1,1.5,6.1,3.1C107.5,65.4,104.1,64.3,104.1,64.3 M65.5,31.2
        C37.9,23.3,26.9,13.4,18.4,3.1c3.9,11.9,13.1,16.2,23,24.2s10.5,12.3,13.4,17.1c6.5,10.6,7.5,12.3,14,16.9
        c7.6,5,16.8,1.6,26.9,3.2s18.4,9.2,20.2,12.1c2.1-3.7-2.9-9.1-4.3-10.5c0.7-4.9-10.9-7.1-15.4-8.7c-0.9-0.3-3-0.8-1.2-5.2
        C97.5,46.1,100.2,40.8,65.5,31.2"/>
        <path d="M52.1,45.9c-1.8-4.9-4.9-11.1-19.9-20.4C24.8,20.8,14.1,15,0,0c1,4,5.5,14.5,27.9,28.2
        C35.3,33.1,44.9,36.1,52.1,45.9"/>
        <path d="M52.1,55.1c-1.7-4.1-5.3-9.4-19-16.9c-6.4-3.6-17.2-9.2-27-19.8C7,22.2,11.5,30.6,31,41.1
        C36.4,44.2,45.5,47,52.1,55.1"/>
      </svg>
    </div>
  );
}

function AverlonLogo() {
  return (
    <div style={{ position: "relative", width: 16, height: 16, flexShrink: 0 }}>
      <svg style={{ position: "absolute", display: "block", width: "100%", height: "100%" }} fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <rect fill="#2E308E" height="16" rx="2" width="16" />
        <path d={logoPaths.p2caced80} fill="white" />
      </svg>
    </div>
  );
}

function TenableLogo() {
  return (
    <div style={{ position: "relative", width: 16, height: 16, flexShrink: 0 }}>
      <svg style={{ position: "absolute", display: "block", width: "100%", height: "100%" }} fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <rect fill="#041E42" height="16" rx="2" width="16" />
        <path clipRule="evenodd" d={logoPaths.p215bb30} fill="white" fillRule="evenodd" />
      </svg>
    </div>
  );
}

function SnykLogo() {
  return (
    <div style={{ position: "relative", width: 16, height: 16, background: "#222049", borderRadius: 2, overflow: "hidden", flexShrink: 0 }}>
      <div style={{ position: "absolute", top: "4.61%", right: "21.39%", bottom: "7.88%", left: "23.2%" }}>
        <svg style={{ position: "absolute", display: "block", width: "100%", height: "100%" }} fill="none" preserveAspectRatio="none" viewBox="0 0 8.86533 14.0006">
          <path d={logoPaths.pb77b000}  fill="white" />
          <path d={logoPaths.p24649180} fill="white" />
          <path d={logoPaths.p25a0c200} fill="#DBDBDB" />
          <path d={logoPaths.p979f100}  fill="#C6C6C6" />
          <path d={logoPaths.p3a40fb80} fill="#3B3B63" />
          <path d={logoPaths.p2190de00} fill="#53537A" />
          <path d={logoPaths.p30058300} fill="#BC9375" />
          <path d={logoPaths.p3fb99b80} fill="white" />
          <path d={logoPaths.p24fdce00} fill="#C49A7E" />
          <path d={logoPaths.p38e38e80} fill="#D8B7A0" />
          <path d={logoPaths.p7457600}  fill="#3B3B63" />
          <path d={logoPaths.p39d16780} fill="#53537A" />
          <path d={logoPaths.p200b400}  fill="#333152" />
          <path d={logoPaths.p2cf5400}  fill="#333152" />
          <path d={logoPaths.p37756c80} fill="white" />
          <path d={logoPaths.p3f860b00} fill="#333152" />
          <path d={logoPaths.p34524448} fill="#333152" />
          <path d={logoPaths.p1a667e80} fill="white" />
          <path d={logoPaths.pe361f00}  fill="#333152" />
          <path d={logoPaths.p1f8b8b00} fill="#C49A7E" />
          <path d={logoPaths.p2b560c80} fill="#D8B7A0" />
          <path d={logoPaths.p3b66a900} fill="#D8B7A0" />
          <path d={logoPaths.p3f8bad00} fill="#C49A7E" />
          <path d={logoPaths.p3a309cf0} fill="#333152" />
        </svg>
      </div>
    </div>
  );
}

function WizLogo() {
  return (
    <div style={{ position: "relative", width: 16, height: 16, borderRadius: 2, background: "white", flexShrink: 0 }}>
      <div style={{ position: "absolute", top: "27.4%", right: "7.97%", bottom: "32.02%", left: "10.54%", overflow: "hidden" }}>
        <svg style={{ position: "absolute", display: "block", width: "100%", height: "100%" }} fill="none" preserveAspectRatio="none" viewBox="0 0 13.0384 6.49331">
          <path d={logoPaths.p19b4fd00} fill="#325FE8" />
        </svg>
      </div>
      <div style={{ position: "absolute", inset: 0, border: "0.5px solid #0254ec", borderRadius: 2, pointerEvents: "none" }} />
    </div>
  );
}

// ─── Logo wrapper positioned within chart area ────────────────────────────────
function LogoAt({ top, children }: { top: number; children: React.ReactNode }) {
  return (
    <div style={{ position: "absolute", left: "0.39%", top, width: 16, height: 16 }}>
      {children}
    </div>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────
export function SankeyFunnel() {
  return (
    <div style={{
      background: "#09091a",
      borderBottom: "1px solid rgba(255,255,255,0.07)",
      padding: "7px 12px 1px",
      position: "relative",
    }}>

      {/* Section header */}
      <div style={{ height: "11.25px", position: "relative", marginBottom: "4px", width: "100%", display: "flex", alignItems: "center" }}>
        
      </div>

      {/* ── Chart area (143.211px tall, percentage-positioned) ─────────────── */}
      <div style={{ position: "relative", width: "100%", height: "143.211px" }}>

        {/* ── Scanner icon logos ───────────────────────────────────────────── */}
        <LogoAt top={28.7}><QualysLogo /></LogoAt>
        <LogoAt top={55.9}><AverlonLogo /></LogoAt>
        <LogoAt top={79.3}><TenableLogo /></LogoAt>
        <LogoAt top={99.7}><SnykLogo /></LogoAt>
        <LogoAt top={117}><WizLogo /></LogoAt>

        {/* ── Ribbon curves: scanner → node ───────────────────────────────── */}
        {/* Averlon */}
        <div className="absolute" style={{ inset: "17.01% 71.54% 65.75% 5%" }}>
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 150.618 24.6915">
            <path d={svgPaths.p28cd7700} fill="url(#rf0)" />
            <defs>
              <linearGradient id="rf0" gradientUnits="userSpaceOnUse" x1="0" x2="15061.8" y1="0" y2="0">
                <stop stopColor="#7C3AED" stopOpacity="0.72" />
                <stop offset="1" stopColor="#7C3AED" stopOpacity="0.28" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        {/* Orca */}
        <div className="absolute" style={{ inset: "34.25% 71.54% 48.51% 5%" }}>
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 150.618 24.6915">
            <path d={svgPaths.p1eada300} fill="url(#rf1)" />
            <defs>
              <linearGradient id="rf1" gradientUnits="userSpaceOnUse" x1="0" x2="15061.8" y1="0" y2="0">
                <stop stopColor="#06B6D4" stopOpacity="0.72" />
                <stop offset="1" stopColor="#06B6D4" stopOpacity="0.28" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        {/* Snyk */}
        <div className="absolute" style={{ inset: "48.04% 71.54% 32.99% 5%" }}>
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 150.618 27.1607">
            <path d={svgPaths.pb95e680} fill="url(#rf2)" />
            <defs>
              <linearGradient id="rf2" gradientUnits="userSpaceOnUse" x1="0" x2="15061.8" y1="0" y2="0">
                <stop stopColor="#4F46E5" stopOpacity="0.72" />
                <stop offset="1" stopColor="#4F46E5" stopOpacity="0.28" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        {/* Aqua */}
        <div className="absolute" style={{ inset: "60.11% 71.54% 20.06% 5%" }}>
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 150.618 28.3953">
            <path d={svgPaths.p14a38bf0} fill="url(#rf3)" />
            <defs>
              <linearGradient id="rf3" gradientUnits="userSpaceOnUse" x1="0" x2="15061.8" y1="0" y2="0">
                <stop stopColor="#0284C7" stopOpacity="0.72" />
                <stop offset="1" stopColor="#0284C7" stopOpacity="0.28" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        {/* GitHub */}
        <div className="absolute" style={{ inset: "69.59% 71.54% 8.86% 5%" }}>
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 150.618 30.8644">
            <path d={svgPaths.p20ae8c40} fill="url(#rf4)" />
            <defs>
              <linearGradient id="rf4" gradientUnits="userSpaceOnUse" x1="0" x2="15061.8" y1="0" y2="0">
                <stop stopColor="#475569" stopOpacity="0.72" />
                <stop offset="1" stopColor="#475569" stopOpacity="0.28" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* ── Coloured node bars (stacked at convergence point) ────────── */}
        <div className="absolute" style={{ inset: "17.01% 70.38% 65.75% 28.46%" }}>
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7.40746 24.6915">
            <path d={svgPaths.p29812d00} fill="#7C3AED" />
          </svg>
        </div>
        <div className="absolute" style={{ inset: "34.25% 70.38% 51.96% 28.46%" }}>
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7.40746 19.7532">
            <path d={svgPaths.p166e6680} fill="#06B6D4" />
          </svg>
        </div>
        <div className="absolute" style={{ inset: "48.04% 70.38% 39.89% 28.46%" }}>
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7.40746 17.2841">
            <path d={svgPaths.p3efd9e80} fill="#4F46E5" />
          </svg>
        </div>
        <div className="absolute" style={{ inset: "60.11% 70.38% 30.41% 28.46%" }}>
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7.40746 13.5803">
            <path d={svgPaths.p1a493600} fill="#0284C7" />
          </svg>
        </div>
        <div className="absolute" style={{ inset: "69.59% 70.38% 22.65% 28.46%" }}>
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7.40746 11.1112">
            <path d={svgPaths.p70e2540} fill="#475569" />
          </svg>
        </div>

        {/* ── Combined flow bands (node → split) ──────────────────────── */}
        <div className="absolute" style={{ inset: "17.01% 49.62% 65.75% 29.62%" }}>
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 133.334 24.6915">
            <path d={svgPaths.p3bbe5d00} fill="#7C3AED" fillOpacity="0.24" />
          </svg>
        </div>
        <div className="absolute" style={{ inset: "34.25% 49.62% 51.96% 29.62%" }}>
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 133.334 19.7532">
            <path d={svgPaths.p159d3400} fill="#06B6D4" fillOpacity="0.24" />
          </svg>
        </div>
        <div className="absolute" style={{ inset: "48.04% 49.62% 39.89% 29.62%" }}>
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 133.334 17.2841">
            <path d={svgPaths.p231c00} fill="#4F46E5" fillOpacity="0.24" />
          </svg>
        </div>
        <div className="absolute" style={{ inset: "60.11% 49.62% 30.41% 29.62%" }}>
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 133.334 13.5803">
            <path d={svgPaths.p73f1d00} fill="#0284C7" fillOpacity="0.24" />
          </svg>
        </div>
        <div className="absolute" style={{ inset: "69.59% 49.62% 22.65% 29.62%" }}>
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 133.334 11.1112">
            <path d={svgPaths.p11b56340} fill="#475569" fillOpacity="0.24" />
          </svg>
        </div>

        {/* ── Exploitable band (top slice, purple) ─────────────────────── */}
        <div className="absolute" style={{ inset: "17.01% 28.46% 71.79% 50.38%" }}>
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 135.803 16.0495">
            <path d={svgPaths.p1526b080} fill="url(#expFill)" />
            <defs>
              <linearGradient id="expFill" gradientUnits="userSpaceOnUse" x1="0" x2="13580.3" y1="0" y2="0">
                <stop stopColor="#8B5CF6" stopOpacity="0.55" />
                <stop offset="1" stopColor="#8B5CF6" stopOpacity="0.22" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* ── Non-exploitable band (bottom, warm gold) ─────────────────── */}
        <div className="absolute" style={{ inset: "28.21% 28.46% 22.65% 50.38%" }}>
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 135.803 70.3709">
            <path d={svgPaths.p38eee3c0} fill="url(#nonFill)" />
            <defs>
              <linearGradient id="nonFill" gradientUnits="userSpaceOnUse" x1="0" x2="13580.3" y1="0" y2="0">
                <stop stopColor="#C9A96E" stopOpacity="0.32" />
                <stop offset="1" stopColor="#C9A96E" stopOpacity="0.12" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* ── On Attack Chain: thick dashed purple bar ─────────────────── */}
        <div className="absolute" style={{ inset: "22.61% 14.03% 77.39% 71.54%" }}>
          <div style={{ position: "absolute", inset: "-4.5px 0" }}>
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 92.6284 9">
              <path d="M0 4.5H92.6284"
                stroke="#A855F7"
                strokeDasharray="3.7 2.47"
                strokeOpacity="0.5"
                strokeWidth="9" />
            </svg>
          </div>
        </div>

        {/* ── Text labels ──────────────────────────────────────────────── */}
        {/* Total Issues — anchored same style as Exploitable, both lines above funnel */}
        <div style={{
          position: "absolute",
          left: "27.5%",
          top: "0",
          display: "flex",
          flexDirection: "column",
          gap: "1px",
        }}>
          <span style={{ fontFamily: "'Mulish', sans-serif", fontWeight: 700, fontSize: "8.642px", color: "rgba(255,255,255,0.62)", whiteSpace: "nowrap", lineHeight: "1" }}>Total Issues</span>
          <span style={{ fontFamily: "'Mulish', sans-serif", fontWeight: 700, fontSize: "11.111px", color: "#a855f7", whiteSpace: "nowrap", lineHeight: "1" }}>257,719</span>
        </div>

        {/* Exploitable */}
        <p className="absolute font-['Mulish',sans-serif] font-bold"
          style={{ inset: "0 41.1% 92.32% 51.73%", fontSize: "8.642px", color: "rgba(255,255,255,0.62)", lineHeight: "normal" }}>
          Exploitable
        </p>
        <p className="absolute font-['Mulish',sans-serif] font-bold"
          style={{ inset: "6.03% 43.6% 84.19% 51.73%", fontSize: "11.111px", color: "#a855f7", lineHeight: "normal" }}>
          3,920
        </p>

        {/* Non-Exploitable */}
        <p className="absolute font-['Mulish',sans-serif] font-normal"
          style={{ inset: "77.35% 38.14% 14.97% 51.73%", fontSize: "8.642px", color: "rgba(255,255,255,0.22)", lineHeight: "normal" }}>
          Non-Exploitable
        </p>
        <p className="absolute font-['Mulish',sans-serif] font-bold"
          style={{ inset: "83.39% 41.57% 6.84% 51.73%", fontSize: "11.111px", color: "rgba(201,169,110,0.35)", lineHeight: "normal" }}>
          253,799
        </p>

        {/* On Attack Chain */}
        <p className="absolute font-['Mulish',sans-serif] font-bold"
          style={{ inset: "13.13% 2.52% 79.19% 86.89%", fontSize: "8.642px", color: "rgba(255,255,255,0.62)", lineHeight: "normal" }}>
          On Attack Chain
        </p>
        <p className="absolute font-['Mulish',sans-serif] font-bold"
          style={{ inset: "20.02% 8.44% 70.2% 86.89%", fontSize: "11.111px", color: "#a855f7", lineHeight: "normal" }}>
          1,084
        </p>

        {/* Assets to remediate */}
        <p className="absolute font-['Mulish',sans-serif] font-normal"
          style={{ inset: "34.33% 3.67% 59.39% 83.24%", fontSize: "7.407px", lineHeight: "normal", color: "white" }}>
          <span style={{ fontWeight: 700, color: "#a855f7" }}>167 </span>
          <span style={{ fontWeight: 400 }}>Assets to remediate</span>
        </p>

        {/* PRs generated */}
        <p className="absolute font-['Mulish',sans-serif] font-normal"
          style={{ inset: "43.48% 6.48% 50.23% 83.24%", fontSize: "7.407px", lineHeight: "normal", color: "white" }}>
          <span style={{ fontWeight: 700, color: "#a855f7" }}>164</span>
          <span style={{ fontWeight: 400 }}> PRs generated</span>
        </p>

      </div>
    </div>
  );
}