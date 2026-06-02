// SilkRibbons — the app's UNIQUE signature background.
// Distinct from both old apps (ZZZ Bot = aurora blobs, TradingAgent = mesh blobs):
// flowing translucent horizontal Bézier ribbon bands that slowly undulate AND drift
// vertically, filled with a theme-accent gradient, layered + lightly blurred like silk.
// Canvas-based, GPU-friendly; prefersReducedMotion → frozen static still.

import { useTheme } from "@mui/material/styles";
import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";

// Tunables — richer than the original (was 5 bands / ~0.11 alpha / blur 36 / opacity 0.9).
const RIBBON_COUNT = 7;
const RIBBON_ALPHA = 0.16; // mid-stop alpha at full intensity
const RIBBON_BLUR = 30; // px
const RIBBON_OPACITY = 1.0; // base canvas opacity multiplier
const AMP_BASE = 52;
const AMP_STEP = 16;
const THICK_BASE = 130;
const THICK_STEP = 34;
const DRIFT_SPEED = 0.000045; // slow vertical drift rate
const DRIFT_RATIO = 0.04; // drift amplitude as a fraction of canvas height

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

  // `reduced` is read through a ref so toggling reduce-motion does NOT re-run the setup effect
  // (re-creating the canvas + ribbons mid-flip was the screen-flicker source). The loop simply
  // stops rescheduling — the canvas freezes in place (no jump) — and a separate effect restarts
  // it when motion is re-enabled.
  const reducedRef = useRef(reduced);
  reducedRef.current = reduced;
  const rafRef = useRef(0);
  const drawRef = useRef<(t: number) => void>(() => {});

  // Setup + draw loop. Re-runs only when colors/intensity change, never on `reduced`.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

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

    const count = RIBBON_COUNT;
    const ribbons: Ribbon[] = Array.from({ length: count }, (_, i) => ({
      y: (canvas.clientHeight * (i + 0.5)) / count,
      amp: AMP_BASE + i * AMP_STEP,
      wavelength: 480 + i * 120,
      speed: 0.00018 + i * 0.00006,
      phase: i * 1.3,
      thickness: THICK_BASE + i * THICK_STEP,
      color: palette[i % palette.length],
    }));

    const alphaHex = Math.round(RIBBON_ALPHA * intensity * 255)
      .toString(16)
      .padStart(2, "0");

    const draw = (t: number) => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      for (const r of ribbons) {
        const grad = ctx.createLinearGradient(0, 0, w, 0);
        grad.addColorStop(0, `${r.color}00`);
        grad.addColorStop(0.5, `${r.color}${alphaHex}`);
        grad.addColorStop(1, `${r.color}00`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        const step = 24;
        // Always time-based: when reduced flips on, the loop just stops rescheduling and the
        // current frame stays put (freeze-in-place), rather than snapping to a base position.
        const phase = r.phase + t * r.speed;
        const baseY = r.y + Math.sin(t * DRIFT_SPEED + r.phase) * h * DRIFT_RATIO;
        for (let x = 0; x <= w + step; x += step) {
          const y = baseY + Math.sin(x / r.wavelength + phase) * r.amp;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        for (let x = w + step; x >= 0; x -= step) {
          const y = baseY + r.thickness + Math.sin(x / r.wavelength + phase + 0.6) * r.amp * 0.7;
          ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
      if (!reducedRef.current) rafRef.current = requestAnimationFrame(draw);
    };

    drawRef.current = draw;
    draw(0);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [primary, secondary, info, intensity]);

  // Start/stop the loop when reduce-motion toggles, without rebuilding the canvas.
  useEffect(() => {
    cancelAnimationFrame(rafRef.current);
    if (!reduced) rafRef.current = requestAnimationFrame((t) => drawRef.current(t));
  }, [reduced]);

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
        filter: `blur(${RIBBON_BLUR}px)`,
        opacity: RIBBON_OPACITY * intensity,
      }}
    />
  );
}
