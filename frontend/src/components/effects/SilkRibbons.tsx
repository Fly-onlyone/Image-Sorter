// SilkRibbons — the app's UNIQUE signature background.
// Distinct from both old apps (ZZZ Bot = aurora blobs, TradingAgent = mesh blobs):
// flowing translucent horizontal Bézier ribbon bands that slowly undulate, filled
// with a low-opacity theme-accent gradient, layered + lightly blurred like silk.
// Canvas-based, GPU-friendly; prefersReducedMotion → frozen static still.

import { useTheme } from "@mui/material/styles";
import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";

interface SilkRibbonsProps {
  /** Dial the whole effect down on image screens so it never fights thumbnails. */
  intensity?: number;
}

interface Ribbon {
  y: number;
  amp: number;
  wavelength: number;
  speed: number;
  phase: number;
  thickness: number;
  color: string;
}

export function SilkRibbons({ intensity = 1 }: SilkRibbonsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const theme = useTheme();
  const reduced = usePrefersReducedMotion();
  const { primary, secondary, info } = theme.app.colors;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const palette = [primary, secondary, info];

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = canvas;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const count = 5;
    const ribbons: Ribbon[] = Array.from({ length: count }, (_, i) => ({
      y: (canvas.clientHeight * (i + 0.5)) / count,
      amp: 40 + i * 14,
      wavelength: 480 + i * 120,
      speed: 0.00018 + i * 0.00006,
      phase: i * 1.3,
      thickness: 120 + i * 30,
      color: palette[i % palette.length],
    }));

    const draw = (t: number) => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      for (const r of ribbons) {
        const grad = ctx.createLinearGradient(0, 0, w, 0);
        grad.addColorStop(0, `${r.color}00`);
        grad.addColorStop(
          0.5,
          `${r.color}${Math.round(28 * intensity)
            .toString(16)
            .padStart(2, "0")}`,
        );
        grad.addColorStop(1, `${r.color}00`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        const step = 24;
        const phase = reduced ? r.phase : r.phase + t * r.speed;
        for (let x = 0; x <= w + step; x += step) {
          const y = r.y + Math.sin(x / r.wavelength + phase) * r.amp;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        for (let x = w + step; x >= 0; x -= step) {
          const y = r.y + r.thickness + Math.sin(x / r.wavelength + phase + 0.6) * r.amp * 0.7;
          ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
      if (!reduced) raf = requestAnimationFrame(draw);
    };

    draw(0);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [primary, secondary, info, intensity, reduced]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
        filter: "blur(36px)",
        opacity: 0.9 * intensity,
      }}
    />
  );
}
