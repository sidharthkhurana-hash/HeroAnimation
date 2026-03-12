import { useEffect, useRef } from "react";

// ─── INTERFACES ───────────────────────────────────────────────────────────────

interface Node {
  x: number; y: number; r: number;
  vx: number; vy: number;
  phase: number; phaseSpeed: number; jitterAmp: number;
  depth: number; color: string; opacity: number;
  // drop
  isDropper: boolean; dropDelay: number;
  gravityVy: number; dropFade: number; dropped: boolean;
  // formation
  isPattern: boolean; patternId: number;
  targetX: number; targetY: number;
  homing: boolean; atTarget: boolean; homingDelay: number;
}

// ─── COLORS ───────────────────────────────────────────────────────────────────

const COLORS = [
  "#8c28dc", "#a855f7", "#9333ea", "#7c3aed",
  "#c026d3", "#b060f0", "#d946ef", "#8b5cf6",
];

// ─── PATTERN — single straight spine → fan ────────────────────────────────────
//
//  One horizontal entry spine leads to a junction, which then bursts
//  into a 5-node vertical fan on the far right.
//
//  id:0 ── id:1 ── id:2 ── id:3 ── id:4 ─┐  id:5  (top)
//                                          ├──id:6
//                                          ├──id:7  (centre — same y as spine)
//                                          ├──id:8
//                                          └──id:9  (bottom)

const PATTERN_NODES = [
  // ── Horizontal spine (all at y = 0.50) ─────────────────────────────────────
  { id: 0, rx: 0.07, ry: 0.50, level: 0 },   // entry — far left
  { id: 1, rx: 0.22, ry: 0.50, level: 1 },
  { id: 2, rx: 0.38, ry: 0.50, level: 2 },
  { id: 3, rx: 0.54, ry: 0.50, level: 3 },
  { id: 4, rx: 0.70, ry: 0.50, level: 4 },   // fan junction

  // ── Fan (x = 0.88, centred on spine y = 0.50) ──────────────────────────────
  { id: 5, rx: 0.88, ry: 0.22, level: 5 },   // top
  { id: 6, rx: 0.88, ry: 0.36, level: 5 },
  { id: 7, rx: 0.88, ry: 0.50, level: 5 },   // centre — same y as spine
  { id: 8, rx: 0.88, ry: 0.64, level: 5 },
  { id: 9, rx: 0.88, ry: 0.78, level: 5 },   // bottom
];

const CONNECTIONS: Array<{ from: number; to: number; delay: number }> = [
  // Spine
  { from: 0, to: 1, delay:   0 },
  { from: 1, to: 2, delay: 180 },
  { from: 2, to: 3, delay: 360 },
  { from: 3, to: 4, delay: 540 },

  // Fan — burst from junction
  { from: 4, to: 5, delay: 700 },
  { from: 4, to: 6, delay: 730 },
  { from: 4, to: 7, delay: 760 },
  { from: 4, to: 8, delay: 790 },
  { from: 4, to: 9, delay: 820 },
];

const MAX_CONN_DELAY = 820;

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function patternToCanvas(rx: number, ry: number, W: number, H: number) {
  // Tighter padding on small screens so nodes have room to breathe horizontally
  const padX = Math.max(14, W * 0.04);
  const padY = Math.max(16, H * 0.05);
  return {
    x: padX + rx * (W - 2 * padX),
    y: padY + ry * (H - 2 * padY),
  };
}

function pickColor() { return COLORS[Math.floor(Math.random() * COLORS.length)]; }

function sizeCategory(): number {
  const r = Math.random();
  if (r < 0.58) return 1.5 + Math.random() * 3;
  if (r < 0.83) return 4.5 + Math.random() * 4.5;
  if (r < 0.96) return 9  + Math.random() * 7;
  return 16 + Math.random() * 10;
}

function buildNodes(w: number, h: number, count: number): Node[] {
  const nodes: Node[] = [];
  const cols = Math.ceil(Math.sqrt(count * (w / h)));
  const rows = Math.ceil(count / cols);
  const cellW = w / cols;
  const cellH = h / rows;

  for (let c = 0; c < cols; c++) {
    for (let rr = 0; rr < rows; rr++) {
      if (nodes.length >= count) break;
      const x = c * cellW + Math.random() * cellW;
      const y = rr * cellH + Math.random() * cellH;
      const r = sizeCategory();
      const depth = Math.random();
      const speed = 0.08 + depth * 0.18;
      const angle = Math.random() * Math.PI * 2;
      nodes.push({
        x, y, r,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        phase: Math.random() * Math.PI * 2,
        phaseSpeed: 0.004 + Math.random() * 0.012,
        jitterAmp: 0.15 + Math.random() * 0.35,
        depth,
        color: pickColor(),
        opacity: 0.22 + Math.random() * 0.38,
        isDropper: false, dropDelay: 0, gravityVy: 0, dropFade: 1, dropped: false,
        isPattern: false, patternId: -1,
        targetX: 0, targetY: 0,
        homing: false, atTarget: false, homingDelay: 0,
      });
    }
  }
  return nodes;
}

function hexToRgba(hex: string, alpha: number): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return `rgba(130,120,255,${alpha})`;
  return `rgba(${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)},${alpha})`;
}

// ─── AMBIENT NODE (chaos / triage phase) ──────────────────────────────────────

function drawNode(
  ctx: CanvasRenderingContext2D,
  node: Node,
  time: number,
  fadeMultiplier = 1,
  jitterScale = 1,
) {
  const jx = Math.sin(time * 1.7 + node.phase) * node.jitterAmp * jitterScale;
  const jy = Math.cos(time * 2.1 + node.phase * 1.3) * node.jitterAmp * jitterScale;
  const px = node.x + jx;
  const py = node.y + jy;
  const r = node.r;
  const glowR = r * 1.3;
  const alpha = node.opacity * fadeMultiplier;

  const grd = ctx.createRadialGradient(px, py, 0, px, py, glowR);
  grd.addColorStop(0,    hexToRgba(node.color, alpha));
  grd.addColorStop(0.45, hexToRgba(node.color, alpha * 0.45));
  grd.addColorStop(1,    hexToRgba(node.color, 0));

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.beginPath();
  ctx.arc(px, py, glowR, 0, Math.PI * 2);
  ctx.fillStyle = grd;
  ctx.fill();

  const coreGrd = ctx.createRadialGradient(px, py, 0, px, py, r);
  coreGrd.addColorStop(0, hexToRgba(node.color, Math.min(1, alpha * 1.8)));
  coreGrd.addColorStop(1, hexToRgba(node.color, alpha * 0.6));
  ctx.beginPath();
  ctx.arc(px, py, r, 0, Math.PI * 2);
  ctx.fillStyle = coreGrd;
  ctx.fill();
  ctx.restore();
}

// ─── PATTERN NODE (formation / attack chain phase) ────────────────────────────
// Bright neon circles: white core → purple inner glow → wide ambient halo

function drawPatternNode(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number,
  nodePhase: number,
  isRoot: boolean,
  fadeM = 1,
  jitterScale = 0.35,
) {
  const jx = Math.sin(time * 1.7 + nodePhase) * 1.2 * jitterScale;
  const jy = Math.cos(time * 2.1 + nodePhase * 1.3) * 1.2 * jitterScale;
  const px = x + jx;
  const py = y + jy;

  const r = isRoot ? 7 : 5.5;
  const alpha = fadeM;

  ctx.save();
  ctx.globalCompositeOperation = "lighter";

  // Wide ambient halo
  const outerGrd = ctx.createRadialGradient(px, py, 0, px, py, r * 7);
  outerGrd.addColorStop(0,   `rgba(170, 70, 255, ${alpha * 0.28})`);
  outerGrd.addColorStop(0.3, `rgba(130, 30, 220, ${alpha * 0.14})`);
  outerGrd.addColorStop(1,   `rgba(80,  0, 160, 0)`);
  ctx.beginPath();
  ctx.arc(px, py, r * 7, 0, Math.PI * 2);
  ctx.fillStyle = outerGrd;
  ctx.fill();

  // Inner glow ring
  const innerGrd = ctx.createRadialGradient(px, py, 0, px, py, r * 2.4);
  innerGrd.addColorStop(0,   `rgba(225, 160, 255, ${alpha * 0.75})`);
  innerGrd.addColorStop(0.5, `rgba(185,  90, 255, ${alpha * 0.40})`);
  innerGrd.addColorStop(1,   `rgba(140,  40, 220, 0)`);
  ctx.beginPath();
  ctx.arc(px, py, r * 2.4, 0, Math.PI * 2);
  ctx.fillStyle = innerGrd;
  ctx.fill();

  // Bright core
  const coreGrd = ctx.createRadialGradient(px, py, 0, px, py, r);
  coreGrd.addColorStop(0,   `rgba(255, 245, 255, ${alpha})`);
  coreGrd.addColorStop(0.45,`rgba(220, 140, 255, ${alpha * 0.92})`);
  coreGrd.addColorStop(1,   `rgba(155,  55, 240, ${alpha * 0.55})`);
  ctx.beginPath();
  ctx.arc(px, py, r, 0, Math.PI * 2);
  ctx.fillStyle = coreGrd;
  ctx.fill();

  ctx.restore();
}

// ─── NEON DASHED Z-ELBOW CONNECTION ───────────────────────────────────────────
//
//  Routing: source → right to midX → vertical → right to target
//  All connections from the same source share the same midX, so their vertical
//  segments overlap and glow together as a single bright "bus" line.

function drawConnection(
  ctx: CanvasRenderingContext2D,
  x1: number, y1: number,
  x2: number, y2: number,
  progress: number,
  opacity: number,
) {
  if (progress <= 0 || opacity <= 0) return;

  const CORNER_R = 22;
  const midX    = (x1 + x2) / 2;
  const isHoriz = Math.abs(y2 - y1) < 5;

  // ── Build the Z-elbow path ────────────────────────────────────────────────
  const buildPath = (c: CanvasRenderingContext2D) => {
    c.beginPath();
    if (isHoriz) {
      c.moveTo(x1, y1);
      c.lineTo(x2, y2);
    } else {
      const dy    = y2 - y1;
      const signY = dy > 0 ? 1 : -1;
      const r     = Math.min(
        CORNER_R,
        Math.abs(midX - x1) * 0.82,
        Math.abs(dy) / 2    * 0.82,
      );
      // Right → bend at midX → vertical → bend at midX → right to target
      c.moveTo(x1, y1);
      c.lineTo(midX - r, y1);
      c.arcTo(midX, y1, midX, y1 + signY * r, r);
      c.lineTo(midX, y2 - signY * r);
      c.arcTo(midX, y2, midX + r, y2, r);
      c.lineTo(x2, y2);
    }
  };

  // ── Total path length (for draw-in dash trick) ────────────────────────────
  let totalLength: number;
  if (isHoriz) {
    totalLength = Math.abs(x2 - x1);
  } else {
    const dy   = y2 - y1;
    const r    = Math.min(CORNER_R, Math.abs(midX - x1) * 0.82, Math.abs(dy) / 2 * 0.82);
    const seg1 = Math.max(0, Math.abs(midX - x1) - r);
    const arcL = (Math.PI / 2) * r;
    const seg2 = Math.max(0, Math.abs(dy) - 2 * r);
    const seg3 = Math.max(0, Math.abs(x2 - midX) - r);
    totalLength = Math.max(1, seg1 + arcL + seg2 + arcL + seg3);
  }

  const drawLen = totalLength * Math.min(1, progress);

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.lineCap  = "round";
  ctx.lineJoin = "round";

  const progressDash = (halfW = 0) => {
    ctx.setLineDash([drawLen + halfW, totalLength + 300]);
    ctx.lineDashOffset = 0;
  };

  // Layer 1 — ultra-wide outer haze
  ctx.strokeStyle = `rgba(100, 0, 210, ${0.08 * opacity})`;
  ctx.lineWidth   = 24;
  progressDash(12);
  ctx.beginPath(); buildPath(ctx); ctx.stroke();

  // Layer 2 — mid glow
  ctx.strokeStyle = `rgba(150, 45, 255, ${0.22 * opacity})`;
  ctx.lineWidth   = 10;
  progressDash(5);
  ctx.beginPath(); buildPath(ctx); ctx.stroke();

  // Layer 3 — inner glow
  ctx.strokeStyle = `rgba(195, 95, 255, ${0.46 * opacity})`;
  ctx.lineWidth   = 4;
  progressDash(2);
  ctx.beginPath(); buildPath(ctx); ctx.stroke();

  // Layer 4 — bright rim
  ctx.strokeStyle = `rgba(225, 155, 255, ${0.74 * opacity})`;
  ctx.lineWidth   = 1.8;
  progressDash(1);
  ctx.beginPath(); buildPath(ctx); ctx.stroke();

  // Layer 5 — core dashed line (repeating when fully drawn)
  if (progress >= 1) {
    ctx.setLineDash([9, 6]);
    ctx.lineDashOffset = 0;
  } else {
    ctx.setLineDash([drawLen + 0.5, totalLength + 300]);
    ctx.lineDashOffset = 0;
  }
  ctx.strokeStyle = `rgba(248, 205, 255, ${0.96 * opacity})`;
  ctx.lineWidth   = 1.2;
  ctx.beginPath(); buildPath(ctx); ctx.stroke();

  ctx.setLineDash([]);
  ctx.restore();
}

// ─── HIGHLIGHT RING (exploitable nodes) ───────────────────────────────────────

function drawHighlightRing(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  r: number,
  time: number,
) {
  for (let i = 0; i < 3; i++) {
    const cycle = (time * 0.85 + i / 3) % 1;
    const ringR  = r * 1.8 + cycle * r * 8;
    const alpha  = Math.pow(1 - cycle, 1.6) * 0.72;
    if (alpha < 0.01) continue;

    ctx.save();
    ctx.strokeStyle = `rgba(255, 130, 40, ${alpha})`;
    ctx.lineWidth    = Math.max(0.4, 1.8 * (1 - cycle));
    ctx.beginPath();
    ctx.arc(x, y, ringR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  const throb      = 0.5 + 0.5 * Math.sin(time * Math.PI * 4);
  const innerAlpha = 0.18 + throb * 0.38;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  const grd = ctx.createRadialGradient(x, y, 0, x, y, r * 3);
  grd.addColorStop(0, `rgba(255, 130, 40, ${innerAlpha})`);
  grd.addColorStop(1, `rgba(255, 130, 40, 0)`);
  ctx.beginPath();
  ctx.arc(x, y, r * 3, 0, Math.PI * 2);
  ctx.fillStyle = grd;
  ctx.fill();
  ctx.restore();
}

// ─── COMPONENT ───────────────────────────────────────────────────────────────

const NODE_COUNT = 160;

interface NodeFieldProps {
  dropping: boolean;
  forming: boolean;
  onConnectionsComplete?: () => void;
  highlightNodeIds?: number[];
  dimmed?: boolean;
  dissolving?: boolean;
  trackCount?: number;
  showTrackedRings?: boolean;
  onFramePositions?: (pts: Array<{ x: number; y: number; r: number }>) => void;
  onPatternPositions?: (positions: Record<number, { x: number; y: number }>) => void;
  /** Positions within the tracked-node set that must NOT drop (0-based). */
  keepTrackedIndices?: number[];
}

export function NodeField({
  dropping,
  forming,
  onConnectionsComplete,
  highlightNodeIds = [],
  dimmed = false,
  dissolving = false,
  trackCount = 0,
  showTrackedRings = false,
  onFramePositions,
  onPatternPositions,
  keepTrackedIndices = [],
}: NodeFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef  = useRef<Node[]>([]);
  const rafRef    = useRef<number>(0);
  const timeRef   = useRef<number>(0);

  const droppingRef    = useRef(false);
  const dropTriggerTs  = useRef<number>(0);

  const formingRef           = useRef(false);
  const homingTriggerTs      = useRef<number>(0);
  const patternNodeMapRef    = useRef<Record<number, Node>>({});
  const connectionsActiveRef = useRef(false);
  const connectionStartTsRef = useRef<number>(0);
  const connCompleteRef      = useRef(false);
  const onConnCompleteRef    = useRef(onConnectionsComplete);
  const onPatternPosRef      = useRef(onPatternPositions);

  const highlightIdsRef = useRef<number[]>(highlightNodeIds);
  const dimmedRef       = useRef(false);
  const dimOpacityRef   = useRef(1);

  const trackedIndicesRef   = useRef<number[]>([]);
  const showTrackedRingsRef = useRef(showTrackedRings);
  const onFramePosRef       = useRef(onFramePositions);
  const trackCountRef       = useRef(trackCount);
  const keepTrackedIndicesRef = useRef(keepTrackedIndices);

  const dissolvingRef      = useRef(false);
  const dissolveStartTsRef = useRef<number>(0);

  useEffect(() => { onConnCompleteRef.current  = onConnectionsComplete; }, [onConnectionsComplete]);
  useEffect(() => { onPatternPosRef.current    = onPatternPositions;    }, [onPatternPositions]);
  useEffect(() => { highlightIdsRef.current    = highlightNodeIds;      }, [highlightNodeIds]);
  useEffect(() => { dimmedRef.current          = dimmed;                }, [dimmed]);
  useEffect(() => { showTrackedRingsRef.current = showTrackedRings;     }, [showTrackedRings]);
  useEffect(() => { onFramePosRef.current      = onFramePositions;      }, [onFramePositions]);
  useEffect(() => { trackCountRef.current      = trackCount;            }, [trackCount]);
  useEffect(() => { keepTrackedIndicesRef.current = keepTrackedIndices; }, [keepTrackedIndices]);

  useEffect(() => {
    if (!dissolving) return;
    dissolvingRef.current      = true;
    dissolveStartTsRef.current = -1;
  }, [dissolving]);

  // ── DROP ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!dropping) return;
    droppingRef.current   = true;
    dropTriggerTs.current = -1;

    const nodes   = nodesRef.current;
    const shuffled = [...nodes].sort(() => Math.random() - 0.5);
    const dropCount = Math.floor(nodes.length * 0.875);
    for (let i = 0; i < shuffled.length; i++) {
      if (i < dropCount) {
        shuffled[i].isDropper = true;
        shuffled[i].dropDelay = Math.random() * 1800;
        shuffled[i].gravityVy = 0;
        shuffled[i].dropFade  = 1;
        shuffled[i].dropped   = false;
      }
    }

    // Exploitable tracked nodes must NOT drop — unmark them explicitly
    for (const pos of keepTrackedIndicesRef.current) {
      const nodeIdx = trackedIndicesRef.current[pos];
      if (nodeIdx !== undefined && nodes[nodeIdx]) {
        nodes[nodeIdx].isDropper = false;
      }
    }
  }, [dropping]);

  // ── FORMATION ────────────��────────────────────────────────────────────────
  useEffect(() => {
    if (!forming) return;
    formingRef.current      = true;
    homingTriggerTs.current = -1;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const W = canvas.width;
    const H = canvas.height;

    const nodes  = nodesRef.current;
    const alive  = nodes.filter(n => !n.dropped);
    const shuffled = [...alive].sort(() => Math.random() - 0.5);

    const pMap: Record<number, Node> = {};

    for (let i = 0; i < PATTERN_NODES.length && i < shuffled.length; i++) {
      const node = shuffled[i];
      const pn   = PATTERN_NODES[i];
      const { x: tx, y: ty } = patternToCanvas(pn.rx, pn.ry, W, H);

      node.isDropper  = false;
      node.dropped    = false;
      node.gravityVy  = 0;
      node.isPattern  = true;
      node.patternId  = pn.id;
      node.targetX    = tx;
      node.targetY    = ty;
      node.homing     = true;
      node.atTarget   = false;
      node.homingDelay = pn.level * 200 + Math.random() * 150;

      pMap[pn.id] = node;
    }
    patternNodeMapRef.current = pMap;
  }, [forming]);

  // ── CANVAS + TICK ─────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const parent = canvas.parentElement;
      const w = parent?.clientWidth  || canvas.offsetWidth  || window.innerWidth;
      const h = parent?.clientHeight || canvas.offsetHeight || window.innerHeight;

      canvas.width  = w;
      canvas.height = h;

      if (!formingRef.current) {
        nodesRef.current = buildNodes(canvas.width, canvas.height, NODE_COUNT);
        const tc = trackCountRef.current;
        if (tc > 0) {
          const total = nodesRef.current.length;
          const step  = Math.floor(total / tc);
          const chosen: number[] = [];
          for (let i = 0; i < tc; i++) {
            const base   = i * step + Math.floor(step * 0.15);
            const jitter = Math.floor(Math.random() * step * 0.5);
            chosen.push(Math.min(base + jitter, total - 1));
          }
          trackedIndicesRef.current = chosen;
        }
      }
    };

    resize();
    // Webflow / embed layout stabilization
    setTimeout(resize, 50);
    setTimeout(resize, 150);
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let lastTs = 0;

    const tick = (ts: number) => {
      const dt = Math.min((ts - lastTs) / 16.67, 3);
      lastTs = ts;
      timeRef.current += 0.016 * dt;
      const t = timeRef.current;
      const W = canvas.width;
      const H = canvas.height;

      if (droppingRef.current  && dropTriggerTs.current  === -1)  dropTriggerTs.current  = ts;
      if (formingRef.current   && homingTriggerTs.current === -1)  homingTriggerTs.current = ts;
      if (dissolvingRef.current && dissolveStartTsRef.current === -1) dissolveStartTsRef.current = ts;

      const dissolveElapsed = dissolvingRef.current && dissolveStartTsRef.current > 0
        ? ts - dissolveStartTsRef.current
        : 0;

      ctx.clearRect(0, 0, W, H);

      // Dim fade
      const dimTarget = dimmedRef.current ? 0.1 : 1;
      if (dimOpacityRef.current !== dimTarget) {
        const step = 0.016 * dt;
        dimOpacityRef.current = dimTarget < dimOpacityRef.current
          ? Math.max(dimTarget, dimOpacityRef.current - step)
          : Math.min(dimTarget, dimOpacityRef.current + step);
      }
      ctx.globalAlpha = dimOpacityRef.current;

      const nodes = nodesRef.current;

      for (const node of nodes) {
        if (node.dropped) continue;

        const isActiveDropper =
          node.isDropper &&
          dropTriggerTs.current > 0 &&
          ts - dropTriggerTs.current >= node.dropDelay;

        // ── HOMING ────────────────────────────────────────────────────────
        if (formingRef.current && node.homing) {
          if (homingTriggerTs.current > 0) {
            const sinceHoming = ts - homingTriggerTs.current - node.homingDelay;
            if (sinceHoming > 0) {
              const dx   = node.targetX - node.x;
              const dy   = node.targetY - node.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < 2) {
                node.x       = node.targetX;
                node.y       = node.targetY;
                node.atTarget = true;
                node.homing   = false;
              } else {
                const f = 0.065 * dt;
                node.x += dx * f;
                node.y += dy * f;
              }
            }
          }
          drawPatternNode(ctx, node.x, node.y, t, node.phase, node.patternId === 0, 1, 0.06);

        // ── GRAVITY DROP ──────────────────────────────────────────────────
        } else if (isActiveDropper) {
          node.gravityVy += 0.22 * dt;
          node.y += node.gravityVy * dt;
          node.x += node.vx * dt * 0.3;

          const sinceGravity = ts - dropTriggerTs.current - node.dropDelay;
          node.dropFade = Math.max(0, 1 - sinceGravity / 1100);

          if (node.y > H + 80 || node.dropFade <= 0.01) {
            node.dropped = true;
            continue;
          }
          drawNode(ctx, node, t, node.dropFade, 1);

        // ── SETTLED PATTERN NODE ──────────────────���───────────────────────
        } else if (node.isPattern && node.atTarget) {
          let fadeM   = 1;
          let jitterS = 0.35;
          if (dissolveElapsed > 0) {
            const nodeStart = 320 + (node.phase / (Math.PI * 2)) * 480;
            fadeM   = Math.max(0, 1 - Math.max(0, dissolveElapsed - nodeStart) / 650);
            jitterS = 0.35 + Math.min(1, dissolveElapsed / 800) * 3.0;
          }
          drawPatternNode(ctx, node.x, node.y, t, node.phase, node.patternId === 0, fadeM, jitterS);

        // ── NORMAL DRIFT ──────────────────────────────────────────────────
        } else {
          node.x += node.vx * dt;
          node.y += node.vy * dt;
          const margin = node.r * 3;
          if (node.x < -margin)       node.x = W + margin;
          else if (node.x > W + margin) node.x = -margin;
          if (node.y < -margin)       node.y = H + margin;
          else if (node.y > H + margin) node.y = -margin;
          drawNode(ctx, node, t, 1, 1);
        }
      }

      // ── KICK OFF CONNECTIONS when every pattern node is seated ────────────
      if (formingRef.current && !connectionsActiveRef.current) {
        const pMap  = patternNodeMapRef.current;
        const total = Object.keys(pMap).length;
        if (total > 0 && Object.values(pMap).every(n => n.atTarget)) {
          connectionsActiveRef.current  = true;
          connectionStartTsRef.current  = ts;
          // Report pixel positions of all pattern nodes once
          if (onPatternPosRef.current) {
            const pos: Record<number, { x: number; y: number }> = {};
            for (const [k, n] of Object.entries(pMap)) {
              pos[Number(k)] = { x: n.x, y: n.y };
            }
            onPatternPosRef.current(pos);
          }
        }
      }

      // ── DRAW CONNECTIONS ──────────────────────────────────────────────────
      if (connectionsActiveRef.current) {
        const elapsed = ts - connectionStartTsRef.current;

        for (const conn of CONNECTIONS) {
          const fromNode = patternNodeMapRef.current[conn.from];
          const toNode   = patternNodeMapRef.current[conn.to];
          if (!fromNode || !toNode) continue;

          const sinceConn = elapsed - conn.delay;
          if (sinceConn < 0) continue;

          const progress = Math.min(1, sinceConn / 620);
          const opacity  = Math.min(1, sinceConn / 280);

          // Dissolve: leaf connections (high delay) break first
          let dissolveAlpha = 1;
          if (dissolveElapsed > 0) {
            const connFadeStart = (1 - conn.delay / MAX_CONN_DELAY) * 480;
            dissolveAlpha = Math.max(0, 1 - Math.max(0, dissolveElapsed - connFadeStart) / 450);
          }

          drawConnection(
            ctx,
            fromNode.x, fromNode.y,
            toNode.x,   toNode.y,
            progress,
            opacity * dissolveAlpha,
          );
        }

        if (!connCompleteRef.current && elapsed >= 1700) {
          connCompleteRef.current = true;
          onConnCompleteRef.current?.();
        }
      }

      // ── HIGHLIGHT RINGS ───────────────────────────────────────────────────
      const hlIds = highlightIdsRef.current;
      if (hlIds.length > 0) {
        for (const id of hlIds) {
          const node = patternNodeMapRef.current[id];
          if (!node || !node.atTarget) continue;
          drawHighlightRing(ctx, node.x, node.y, node.r, t);
        }
      }

      // ── OVERLAY RINGS FOR TRACKED NODES ───────────────────────────────────
      if (showTrackedRingsRef.current && trackedIndicesRef.current.length > 0) {
        for (const idx of trackedIndicesRef.current) {
          const node = nodesRef.current[idx];
          if (!node || node.dropped) continue;
          const jx = Math.sin(t * 1.7 + node.phase) * node.jitterAmp;
          const jy = Math.cos(t * 2.1 + node.phase * 1.3) * node.jitterAmp;
          const px = node.x + jx;
          const py = node.y + jy;
          const ringR = Math.max(node.r * 2.6, 9);
          const pulse  = 0.28 + 0.22 * Math.sin(t * Math.PI * 1.4);
          ctx.save();
          ctx.strokeStyle = `rgba(255, 255, 255, ${pulse})`;
          ctx.lineWidth = 0.85;
          ctx.beginPath();
          ctx.arc(px, py, ringR, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
      }

      ctx.globalAlpha = 1;

      // ── REPORT TRACKED NODE POSITIONS ─────────────────────────────────────
      if (onFramePosRef.current && trackedIndicesRef.current.length > 0) {
        const pts = trackedIndicesRef.current.reduce<Array<{ x: number; y: number; r: number }>>(
          (acc, idx) => {
            const n = nodesRef.current[idx];
            if (n && !n.dropped) acc.push({ x: n.x, y: n.y, r: n.r });
            return acc;
          },
          [],
        );
        if (pts.length > 0) onFramePosRef.current(pts);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        display: "block",
      }}
    />
  );
}