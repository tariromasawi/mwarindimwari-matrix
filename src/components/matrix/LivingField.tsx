import { useLayoutEffect, useRef, type PointerEvent } from "react";
import { priorityScore } from "@/lib/matrix/engine";
import type { Province } from "@/lib/matrix/types";

const LAND: [number, number][] = [
  [0.16, 0.34],
  [0.22, 0.2],
  [0.36, 0.14],
  [0.5, 0.12],
  [0.64, 0.16],
  [0.76, 0.22],
  [0.9, 0.34],
  [0.94, 0.48],
  [0.84, 0.6],
  [0.72, 0.72],
  [0.58, 0.84],
  [0.44, 0.88],
  [0.3, 0.78],
  [0.18, 0.64],
  [0.12, 0.48],
];

const NODE_AT: Record<string, [number, number]> = {
  "mashonaland-central": [0.56, 0.24],
  "mashonaland-west": [0.4, 0.34],
  harare: [0.58, 0.4],
  "mashonaland-east": [0.72, 0.38],
  "matabeleland-north": [0.28, 0.4],
  manicaland: [0.82, 0.52],
  midlands: [0.44, 0.64],
  bulawayo: [0.32, 0.6],
  masvingo: [0.58, 0.7],
  "matabeleland-south": [0.3, 0.74],
};

type Props = {
  provinces: Province[];
  focus: string;
  running: boolean;
  reduce: boolean;
  onFocus: (id: string) => void;
};

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function LivingField({ provinces, focus, running, reduce, onFocus }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const focusRef = useRef(focus);
  focusRef.current = focus;

  useLayoutEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const stars = Array.from({ length: 140 }, (_, i) => {
      const rand = mulberry32(i + 11);
      return { x: rand(), y: rand(), r: 0.4 + rand() * 1.4, a: 0.25 + rand() * 0.7 };
    });
    const motes = Array.from({ length: 48 }, (_, i) => {
      const rand = mulberry32(i + 90);
      return { x: rand(), y: rand(), s: 0.15 + rand() * 0.45, p: rand() * Math.PI * 2 };
    });
    let raf = 0;
    let stopped = false;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const still = reduce || !running || media.matches;

    const paint = (time: number) => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.floor(rect.width * dpr));
      const h = Math.max(1, Math.floor(rect.height * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      ctx.clearRect(0, 0, w, h);
      const cx = w * 0.5;
      const cy = h * 0.48;
      const spin = still ? 0.4 : time / 9000;

      for (const star of stars) {
        ctx.fillStyle = `rgba(244, 234, 212, ${star.a})`;
        ctx.beginPath();
        ctx.arc(star.x * w, star.y * h, star.r * dpr, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.save();
      ctx.translate(cx, cy);
      ctx.strokeStyle = "rgba(94, 200, 255, 0.28)";
      ctx.lineWidth = 1 * dpr;
      for (let ring = 1; ring <= 4; ring++) {
        ctx.beginPath();
        ctx.ellipse(0, 0, w * 0.16 * ring * 0.55, h * 0.12 * ring * 0.7, spin + ring, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();

      const beam = ctx.createLinearGradient(cx, h * 0.05, cx, h * 0.92);
      beam.addColorStop(0, "rgba(243, 212, 138, 0)");
      beam.addColorStop(0.45, "rgba(243, 212, 138, 0.85)");
      beam.addColorStop(1, "rgba(94, 200, 255, 0)");
      ctx.strokeStyle = beam;
      ctx.lineWidth = 3 * dpr;
      ctx.beginPath();
      ctx.moveTo(cx, h * 0.06);
      ctx.lineTo(cx, h * 0.9);
      ctx.stroke();

      const ox = w * 0.08;
      const oy = h * 0.08;
      const sx = w * 0.84;
      const sy = h * 0.8;
      ctx.beginPath();
      LAND.forEach(([x, y], index) => {
        const px = ox + x * sx;
        const py = oy + y * sy;
        if (index === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.closePath();
      const land = ctx.createRadialGradient(cx, cy, 10, cx, cy, w * 0.4);
      land.addColorStop(0, "rgba(36, 78, 64, 0.85)");
      land.addColorStop(1, "rgba(12, 28, 32, 0.92)");
      ctx.fillStyle = land;
      ctx.fill();
      ctx.strokeStyle = "rgba(230, 179, 77, 0.85)";
      ctx.lineWidth = 1.5 * dpr;
      ctx.stroke();

      const nodes = provinces.map((province) => {
        const at = NODE_AT[province.id] ?? [0.5, 0.5];
        return {
          province,
          x: ox + at[0] * sx,
          y: oy + at[1] * sy,
          score: priorityScore(province.factors),
        };
      });

      ctx.lineWidth = 1 * dpr;
      for (const node of nodes) {
        ctx.strokeStyle = `rgba(94, 200, 255, ${0.15 + node.score * 0.45})`;
        ctx.beginPath();
        ctx.moveTo(node.x, node.y);
        ctx.lineTo(cx, cy);
        ctx.stroke();
      }

      if (!still) {
        for (const mote of motes) {
          const a = mote.p + time / 4000;
          const mx = cx + Math.cos(a) * w * mote.s * 0.42;
          const my = cy + Math.sin(a * 1.3) * h * mote.s * 0.32;
          ctx.fillStyle = "rgba(243, 212, 138, 0.7)";
          ctx.beginPath();
          ctx.arc(mx, my, 1.4 * dpr, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      for (const node of nodes) {
        const hot = node.province.id === focusRef.current;
        const radius = (5 + node.score * 10) * dpr;
        ctx.beginPath();
        ctx.fillStyle = hot ? "rgba(243, 212, 138, 0.95)" : "rgba(94, 200, 255, 0.9)";
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(7, 9, 16, 0.8)";
        ctx.lineWidth = 2 * dpr;
        ctx.stroke();
        ctx.fillStyle = hot ? "#070910" : "#f4ead4";
        ctx.font = `${11 * dpr}px Outfit, sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText(node.province.short, node.x, node.y - radius - 4 * dpr);
      }

      drawAnkh(ctx, cx, cy - h * 0.02, Math.min(w, h) * 0.16);
      ctx.fillStyle = "rgba(244, 234, 212, 0.88)";
      ctx.font = `${13 * dpr}px Cinzel, serif`;
      ctx.textAlign = "center";
      ctx.fillText("MUDZIMU UNOYERA", cx, oy + 0.9 * sy);
    };

    const loop = (time: number) => {
      if (stopped) return;
      paint(time);
      raf = window.requestAnimationFrame(loop);
    };

    paint(0);
    if (!still) raf = window.requestAnimationFrame(loop);
    const onResize = () => paint(0);
    window.addEventListener("resize", onResize);
    return () => {
      stopped = true;
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [provinces, running, reduce]);

  function pick(event: PointerEvent<HTMLCanvasElement>) {
    const canvas = ref.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    let best: { id: string; d: number } | null = null;
    for (const province of provinces) {
      const at = NODE_AT[province.id];
      if (!at) continue;
      const nx = 0.08 + at[0] * 0.84;
      const ny = 0.08 + at[1] * 0.8;
      const d = Math.hypot(nx - x, ny - y);
      if (!best || d < best.d) best = { id: province.id, d };
    }
    if (best && best.d < 0.08) onFocus(best.id);
  }

  return (
    <div className="field-frame">
      <canvas
        ref={ref}
        onPointerDown={pick}
        aria-label="Living matrix. Zimbabwe’s ten provinces glow by scenario priority. Press a node or use the province list."
      />
      <div className="field-caption">
        <span>Living key</span>
        <span>{running ? "Cycle live" : "Cycle paused"}</span>
      </div>
    </div>
  );
}

function drawAnkh(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = "rgba(243, 212, 138, 0.95)";
  ctx.lineWidth = Math.max(2, s * 0.045);
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(0, -s * 0.28, s * 0.2, 0, Math.PI * 2);
  ctx.moveTo(0, -s * 0.08);
  ctx.lineTo(0, s * 0.46);
  ctx.moveTo(-s * 0.26, 0.02 * s);
  ctx.lineTo(s * 0.26, 0.02 * s);
  ctx.stroke();
  ctx.restore();
}
