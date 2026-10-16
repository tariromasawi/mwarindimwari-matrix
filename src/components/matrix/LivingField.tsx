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
  const tipRef = useRef<HTMLDivElement>(null);
  const focusRef = useRef(focus);
  const hoverRef = useRef<string | null>(null);
  const pulsesRef = useRef<{ id: string; at: number }[]>([]);
  const provincesRef = useRef(provinces);
  focusRef.current = focus;
  provincesRef.current = provinces;

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
    let lastFocus = focusRef.current;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const still = reduce || media.matches;

    const paint = (time: number) => {
      if (focusRef.current !== lastFocus) {
        pulsesRef.current.push({ id: focusRef.current, at: time });
        pulsesRef.current = pulsesRef.current.slice(-8);
        lastFocus = focusRef.current;
      }
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
      const pace = running ? 1 : 0.35;
      const spin = still ? 0.4 : (time / 9000) * pace;

      for (const star of stars) {
        const twinkle = still ? star.a : star.a * (0.65 + 0.35 * Math.sin(time / 700 + star.x * 12));
        ctx.fillStyle = `rgba(244, 234, 212, ${twinkle})`;
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

      const beamPulse = still ? 0.85 : 0.55 + 0.45 * Math.sin(time / 480);
      const beam = ctx.createLinearGradient(cx, h * 0.05, cx, h * 0.92);
      beam.addColorStop(0, "rgba(243, 212, 138, 0)");
      beam.addColorStop(0.45, `rgba(243, 212, 138, ${beamPulse})`);
      beam.addColorStop(1, "rgba(94, 200, 255, 0)");
      ctx.strokeStyle = beam;
      ctx.lineWidth = (2 + beamPulse * 3) * dpr;
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

      const nodes = provincesRef.current.map((province) => {
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
        const hot = node.province.id === focusRef.current || node.province.id === hoverRef.current;
        ctx.strokeStyle = hot
          ? "rgba(243, 212, 138, 0.85)"
          : `rgba(94, 200, 255, ${0.15 + node.score * 0.45})`;
        ctx.beginPath();
        ctx.moveTo(node.x, node.y);
        ctx.lineTo(cx, cy);
        ctx.stroke();
        if (!still && running) {
          const travel = (time / 1400 + node.score) % 1;
          const sparkX = node.x + (cx - node.x) * travel;
          const sparkY = node.y + (cy - node.y) * travel;
          ctx.fillStyle = "rgba(243, 212, 138, 0.95)";
          ctx.beginPath();
          ctx.arc(sparkX, sparkY, 2.2 * dpr, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (!still) {
        for (const mote of motes) {
          const a = mote.p + (time / 4000) * pace;
          const mx = cx + Math.cos(a) * w * mote.s * 0.42;
          const my = cy + Math.sin(a * 1.3) * h * mote.s * 0.32;
          ctx.fillStyle = "rgba(243, 212, 138, 0.7)";
          ctx.beginPath();
          ctx.arc(mx, my, 1.4 * dpr, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      pulsesRef.current = pulsesRef.current.filter((pulse) => time - pulse.at < 900);
      for (const pulse of pulsesRef.current) {
        const node = nodes.find((item) => item.province.id === pulse.id);
        if (!node) continue;
        const age = (time - pulse.at) / 900;
        ctx.beginPath();
        ctx.strokeStyle = `rgba(243, 212, 138, ${1 - age})`;
        ctx.lineWidth = 2 * dpr;
        ctx.arc(node.x, node.y, (12 + age * 46) * dpr, 0, Math.PI * 2);
        ctx.stroke();
      }

      for (const node of nodes) {
        const hot = node.province.id === focusRef.current;
        const hovered = node.province.id === hoverRef.current;
        const radius = (5 + node.score * 10 + (hovered ? 3 : 0)) * dpr;
        if (hot && !still) {
          const halo = 1 + 0.18 * Math.sin(time / 260);
          ctx.beginPath();
          ctx.strokeStyle = "rgba(243, 212, 138, 0.55)";
          ctx.lineWidth = 1.5 * dpr;
          ctx.arc(node.x, node.y, radius * halo + 6 * dpr, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.fillStyle = hot || hovered ? "rgba(243, 212, 138, 0.95)" : "rgba(94, 200, 255, 0.9)";
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(7, 9, 16, 0.8)";
        ctx.lineWidth = 2 * dpr;
        ctx.stroke();
        ctx.fillStyle = hot || hovered ? "#070910" : "#f4ead4";
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
    const onResize = () => paint(performance.now());
    window.addEventListener("resize", onResize);
    return () => {
      stopped = true;
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [reduce, running]);

  function hit(event: PointerEvent<HTMLCanvasElement>) {
    const canvas = ref.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    let best: { id: string; d: number } | null = null;
    for (const province of provincesRef.current) {
      const at = NODE_AT[province.id];
      if (!at) continue;
      const nx = 0.08 + at[0] * 0.84;
      const ny = 0.08 + at[1] * 0.8;
      const d = Math.hypot(nx - x, ny - y);
      if (!best || d < best.d) best = { id: province.id, d };
    }
    return best && best.d < 0.08 ? best.id : null;
  }

  function move(event: PointerEvent<HTMLCanvasElement>) {
    const id = hit(event);
    hoverRef.current = id;
    const canvas = ref.current;
    if (canvas) canvas.style.cursor = id ? "pointer" : "default";
    const tip = tipRef.current;
    const frame = canvas?.parentElement;
    if (!tip || !frame || !canvas) return;
    if (!id) {
      tip.hidden = true;
      return;
    }
    const province = provincesRef.current.find((item) => item.id === id);
    if (!province) return;
    const rect = frame.getBoundingClientRect();
    tip.hidden = false;
    tip.textContent = `${province.name} · ${priorityScore(province.factors).toFixed(2)}`;
    tip.style.left = `${Math.min(event.clientX - rect.left + 14, rect.width - 160)}px`;
    tip.style.top = `${Math.min(event.clientY - rect.top + 14, rect.height - 36)}px`;
  }

  function pick(event: PointerEvent<HTMLCanvasElement>) {
    const id = hit(event);
    if (!id) return;
    pulsesRef.current.push({ id, at: performance.now() });
    onFocus(id);
  }

  return (
    <div className="field-frame">
      <canvas
        ref={ref}
        onPointerDown={pick}
        onPointerMove={move}
        onPointerLeave={() => {
          hoverRef.current = null;
          if (tipRef.current) tipRef.current.hidden = true;
        }}
        aria-label="Living matrix. Zimbabwe’s ten provinces glow by scenario priority. Press a node or use the province list."
      />
      <div ref={tipRef} className="field-tip" hidden />
      <div className="field-caption">
        <span>Living key</span>
        <span>{running ? "Cycle live" : "Cycle paused"}</span>
      </div>
    </div>
  );
}

function drawAnkh(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
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
