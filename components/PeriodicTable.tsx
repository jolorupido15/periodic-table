'use client';

import { useState, useEffect, useLayoutEffect, useRef, useMemo } from 'react';
import { elements, Element, ElementCategory } from '@/lib/elements';
import ElementDialog from './ElementDialog';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type ViewMode = 'table' | 'sphere' | 'helix';

const TAU = Math.PI * 2;

/** Strands wrapping the cylinder (like barrel staves / DNA multiplicity). */
const HELIX_STRANDS = 4;

function perspectiveFactor(z3d: number): number {
  return 6000 / (6000 + z3d + 1200);
}

/** Rotate point around +X (mouse up/down tilts the 3D scene). */
function rotateX(x: number, y: number, z: number, angle: number): { x: number; y: number; z: number } {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return { x, y: y * c - z * s, z: y * s + z * c };
}

/** Bright category-colored outer glow without oversized blur on the card face. */
function categoryCardGlowStyle(hex: string): { borderColor: string; boxShadow: string } {
  return {
    borderColor: `${hex}dd`,
    boxShadow: `0 0 0 1px ${hex}66, 0 0 12px ${hex}ee, 0 0 22px ${hex}aa, 0 0 36px ${hex}55, 0 5px 18px rgba(0,0,0,0.65)`,
  };
}

/**
 * Cylindrical barrel helix: elements share rungs; each strand is evenly spaced
 * around the cylinder (0, 2π/K, …). Vertical index j = ⌊i/K⌋, continuous rotation via rot.
 */
function barrelHelix3D(
  i: number,
  n: number,
  nStrands: number,
  R: number,
  pitch: number,
  anglePerRung: number,
  rot: number,
): { x: number; y: number; z: number } {
  const strand = i % nStrands;
  const j = Math.floor(i / nStrands);
  const nRungs = Math.ceil(n / nStrands);
  const mid = (nRungs - 1) / 2;
  const strandAngle = (TAU / nStrands) * strand;
  const theta = j * anglePerRung + strandAngle + rot;
  return {
    x: R * Math.sin(theta),
    y: (j - mid) * pitch,
    z: R * Math.cos(theta),
  };
}

function maxProjectedBarrelHelixExtent(
  n: number,
  nStrands: number,
  R: number,
  pitch: number,
  anglePerRung: number,
): { maxPx: number; maxPy: number } {
  let maxPx = 0;
  let maxPy = 0;
  const rotSamples = [0, 0.3, 0.6, 0.9, 1.2, 1.5, 1.8];
  for (let i = 0; i < n; i++) {
    for (const rot of rotSamples) {
      const p = barrelHelix3D(i, n, nStrands, R, pitch, anglePerRung, rot);
      const f = perspectiveFactor(p.z);
      maxPx = Math.max(maxPx, Math.abs(p.x * f));
      maxPy = Math.max(maxPy, Math.abs(p.y * f));
    }
  }
  return { maxPx, maxPy };
}

/**
 * Size helix to canvas: maximize radius (horizontal fill), then pitch (vertical spacing).
 * ~5.2 full turns around the barrel over all rungs for a clear spiral.
 */
function fitHelixToCanvas(canvasW: number, canvasH: number, n: number): { R: number; pitch: number; anglePerRung: number } {
  const nStrands = HELIX_STRANDS;
  const nRungs = Math.ceil(n / nStrands);
  const anglePerRung = (5.2 * TAU) / Math.max(1, nRungs - 1);

  const edgePadding = 84;
  const projectedCardSlack = 52;
  const nx = Math.max(76, canvasW / 2 - edgePadding - projectedCardSlack);
  const ny = Math.max(76, canvasH / 2 - edgePadding - projectedCardSlack);

  let best: { R: number; pitch: number; anglePerRung: number } | null = null;

  for (let R = 115; R <= 440; R += 6) {
    for (let pitch = 5.5; pitch <= 28; pitch += 0.32) {
      const { maxPx, maxPy } = maxProjectedBarrelHelixExtent(n, nStrands, R, pitch, anglePerRung);
      const ratio = Math.max(maxPx / nx, maxPy / ny);
      if (ratio <= 0.9) {
        if (
          !best ||
          R > best.R + 3 ||
          (Math.abs(R - best.R) <= 3 && pitch > best.pitch + 0.12)
        ) {
          best = { R, pitch, anglePerRung };
        }
      }
    }
  }

  if (best) {
    return best;
  }

  let R = Math.min(340, nx * 0.88);
  let pitch = Math.min(20, (1.9 * ny) / Math.max(1, nRungs - 1));
  for (let iter = 0; iter < 58; iter++) {
    const { maxPx, maxPy } = maxProjectedBarrelHelixExtent(n, nStrands, R, pitch, anglePerRung);
    const ratio = Math.max(maxPx / nx, maxPy / ny);
    if (ratio <= 0.93) return { R, pitch, anglePerRung };
    R *= 0.92;
    pitch *= 0.92;
  }
  return { R: Math.min(270, nx * 0.82), pitch: 8.2, anglePerRung };
}

const categoryHexColors: Record<string, string> = {
  'alkali metal': '#ef4444',
  'alkaline earth metal': '#f97316',
  'transition metal': '#eab308',
  'post-transition metal': '#14b8a6',
  'metalloid': '#10b981',
  'reactive nonmetal': '#3b82f6',
  'noble gas': '#ec4899',
  'halogen': '#a855f7',
  'lanthanide': '#6366f1',
  'actinide': '#06b6d4',
  'unknown': '#52525b',
};

const categories: { label: string; value: ElementCategory; color: string }[] = [
  { label: 'Alkali Metals', value: 'alkali metal', color: 'bg-red-500' },
  { label: 'Alkaline Earth', value: 'alkaline earth metal', color: 'bg-orange-500' },
  { label: 'Transition Metals', value: 'transition metal', color: 'bg-yellow-500' },
  { label: 'Post-Transition', value: 'post-transition metal', color: 'bg-teal-500' },
  { label: 'Metalloids', value: 'metalloid', color: 'bg-emerald-500' },
  { label: 'Reactive Nonmetals', value: 'reactive nonmetal', color: 'bg-blue-500' },
  { label: 'Noble Gases', value: 'noble gas', color: 'bg-pink-500' },
  { label: 'Halogens', value: 'halogen', color: 'bg-purple-500' },
  { label: 'Lanthanides', value: 'lanthanide', color: 'bg-indigo-500' },
  { label: 'Actinides', value: 'actinide', color: 'bg-cyan-500' },
];

export default function PeriodicTable() {
  const [selectedElement, setSelectedElement] = useState<Element | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [targetMode, setTargetMode] = useState<ViewMode | null>(null);
  /** Stage center in CSS px: (clientWidth/2, clientHeight/2). Updated via ResizeObserver in 3D (pivot must not use % transform on a 0×0 box — that resolves to 0). */
  const [stageCenterPx, setStageCenterPx] = useState<{ x: number; y: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rotationRef = useRef(0);
  const transitionRef = useRef(0);
  const targetModeRef = useRef<ViewMode>('table');
  const currentModeRef = useRef<ViewMode>('table');
  const requestRef = useRef<number>(0);
  const helixParamsRef = useRef({ R: 260, pitch: 12, anglePerRung: 0.58 });
  /** Mouse X normalized to [-1, 1] from stage center; 0 when pointer leaves stage. */
  const pointerNormRef = useRef(0);
  /** +1 = pointer above stage center (mouse “up”). */
  const pointerYNormRef = useRef(0);
  /** Smoothed spin velocity (rad / frame) from pointer. */
  const spinVelRef = useRef(0);
  const pitchVelRef = useRef(0);
  const pitchRef = useRef(0);
  const hoveredCardIndexRef = useRef<number | null>(null);
  const hoverScaleAnimRef = useRef<Float32Array | null>(null);

  // Dimensions
  const cardW = 65;
  const cardH = 75;
  const gap = 8;
  const gridW = 18 * (cardW + gap);
  const gridH = 10 * (cardH + gap);

  // Pre-calculate base positions/data
  const elementData = useMemo(() => {
    return elements.map((el, i) => {
      // Table Pos
      const tx = (el.xpos - 1) * (cardW + gap) - gridW / 2 + cardW / 2;
      const ty = (el.ypos - 1) * (cardH + gap) - gridH / 2 + cardH / 2;

      // Sphere Base (Fibonacci)
      const phi = Math.acos(1 - 2 * (i + 0.5) / 118);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;

      return { tx, ty, phi, theta };
    });
  }, [gridW, gridH]);

  const toggleMode = (mode: ViewMode) => {
    if (viewMode === mode || isTransitioning) return;
    targetModeRef.current = mode;
    setTargetMode(mode);
    currentModeRef.current = viewMode;
    setIsTransitioning(true);
    transitionRef.current = 0;
    setTimeout(() => {
      setViewMode(mode);
      setIsTransitioning(false);
      setTargetMode(null);
      transitionRef.current = 1;
    }, 1500);
  };

  const handleElementClick = (element: Element) => {
    setSelectedElement(element);
    setIsDialogOpen(true);
  };

  useEffect(() => {
    const animate = () => {
      const nEl = elements.length;
      if (!hoverScaleAnimRef.current || hoverScaleAnimRef.current.length !== nEl) {
        hoverScaleAnimRef.current = new Float32Array(nEl).fill(1);
      }
      const hoverScales = hoverScaleAnimRef.current;

      const tableLocked = viewMode === 'table' && !isTransitioning;
      if (!tableLocked) {
        const maxSpin = 0.068;
        const targetSpin = pointerNormRef.current * maxSpin;
        spinVelRef.current += (targetSpin - spinVelRef.current) * 0.14;
        if (Math.abs(pointerNormRef.current) < 0.04) {
          spinVelRef.current *= 0.94;
        }
        rotationRef.current += spinVelRef.current;

        const maxPitch = 0.052;
        const targetPitch = pointerYNormRef.current * maxPitch;
        pitchVelRef.current += (targetPitch - pitchVelRef.current) * 0.14;
        if (Math.abs(pointerYNormRef.current) < 0.04) {
          pitchVelRef.current *= 0.94;
        }
        pitchRef.current += pitchVelRef.current;
      }

      const rot = rotationRef.current;
      const pitchAngle = pitchRef.current;
      if (isTransitioning) {
        transitionRef.current = Math.min(transitionRef.current + 0.015, 1);
      }
      const t = transitionRef.current;

      const items: { index: number; z3d: number }[] = [];

      elementData.forEach((data, i) => {
        const { tx, ty, phi, theta } = data;
        let x3d = 0, y3d = 0, z3d = 0;

        const getPos = (m: ViewMode) => {
          if (m === 'table') {
            return { x: tx, y: ty, z: 0 };
          }
          if (m === 'sphere') {
            const bx = 300 * Math.sin(phi) * Math.cos(theta + rot);
            const by = 300 * Math.cos(phi);
            const bz = 300 * Math.sin(phi) * Math.sin(theta + rot);
            return rotateX(bx, by, bz, pitchAngle);
          }
          if (m === 'helix') {
            const n = elements.length;
            const { R, pitch, anglePerRung } = helixParamsRef.current;
            const p = barrelHelix3D(i, n, HELIX_STRANDS, R, pitch, anglePerRung, rot);
            return rotateX(p.x, p.y, p.z, pitchAngle);
          }
          return { x: 0, y: 0, z: 0 };
        };

        if (isTransitioning) {
          const start = getPos(currentModeRef.current);
          const end = getPos(targetModeRef.current);
          const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
          x3d = start.x + (end.x - start.x) * ease;
          y3d = start.y + (end.y - start.y) * ease;
          z3d = start.z + (end.z - start.z) * ease;
        } else {
          const pos = getPos(viewMode);
          x3d = pos.x; y3d = pos.y; z3d = pos.z;
        }

        const perspective = perspectiveFactor(z3d);
        const x2d = x3d * perspective;
        const y2d = y3d * perspective;

        const helixViz =
          (!isTransitioning && viewMode === 'helix') ||
          (isTransitioning &&
            (currentModeRef.current === 'helix' || targetModeRef.current === 'helix'));

        let scale = perspective;
        let opacity = 1;
        let filter = '';

        if (viewMode !== 'table' || isTransitioning) {
          if (helixViz) {
            const Rc = helixParamsRef.current.R;
            const depth = Math.max(0, Math.min(1, (z3d + Rc) / (2 * Rc + 1e-6)));
            opacity = Math.max(0.34, Math.min(1, 0.36 + 0.62 * depth));
            scale = perspective * (0.78 + 0.38 * depth);
            filter = `brightness(${0.42 + 0.58 * depth})`;
          } else {
            opacity = 0.4 + (z3d + 500) / 1000 * 0.6;
          }
        }

        const hoverTarget = hoveredCardIndexRef.current === i ? 1.1 : 1;
        hoverScales[i] += (hoverTarget - hoverScales[i]) * 0.22;

        const card = cardRefs.current[i];
        if (card) {
          const sOut = scale * hoverScales[i];
          card.style.transform = `translate(-50%, -50%) translate3d(${x2d}px, ${y2d}px, 0) scale(${sOut})`;
          card.style.opacity = Math.max(0, Math.min(1, opacity)).toString();
          card.style.filter = filter;
          items.push({ index: i, z3d });
        }
      });

      items.sort((a, b) => b.z3d - a.z3d);
      items.forEach((item, zIdx) => {
        const card = cardRefs.current[item.index];
        if (card) card.style.zIndex = zIdx.toString();
      });

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [viewMode, isTransitioning, elementData]);

  const activeMode = targetMode || viewMode;

  useLayoutEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const onMove = (e: MouseEvent) => {
      const r = root.getBoundingClientRect();
      const half = Math.max(1, r.width / 2);
      const halfH = Math.max(1, r.height / 2);
      pointerNormRef.current = Math.max(-1, Math.min(1, (e.clientX - r.left - r.width / 2) / half));
      pointerYNormRef.current = Math.max(
        -1,
        Math.min(1, (r.top + r.height / 2 - e.clientY) / halfH),
      );
    };
    const onLeave = () => {
      pointerNormRef.current = 0;
      pointerYNormRef.current = 0;
    };

    root.addEventListener('mousemove', onMove);
    root.addEventListener('mouseleave', onLeave);
    return () => {
      root.removeEventListener('mousemove', onMove);
      root.removeEventListener('mouseleave', onLeave);
    };
  }, [activeMode, viewMode]);

  const needs3DCenter =
    activeMode === 'sphere' ||
    activeMode === 'helix' ||
    (isTransitioning && !!targetMode && targetMode !== 'table');

  useLayoutEffect(() => {
    if (!needs3DCenter) {
      setStageCenterPx(null);
      return;
    }

    const el = containerRef.current;
    if (!el) return;

    const sync = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (w < 1 || h < 1) return;
      setStageCenterPx({ x: w / 2, y: h / 2 });
      helixParamsRef.current = fitHelixToCanvas(w, h, elements.length);
    };

    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
  }, [needs3DCenter]);

  return (
    <div className="flex min-h-0 min-w-0 flex-1 basis-0 flex-col items-stretch self-stretch px-4">
      {/* Header & Controls Container */}
      <div className="sticky top-0 left-0 w-full shrink-0 pt-6 pb-2 flex flex-col items-center z-[1001] bg-transparent border-none shadow-none ring-0 outline-none">
        <header className="flex flex-col items-center text-center mb-6 border-none shadow-none ring-0 outline-none">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.4)] mb-2">
            Periodic Table
          </h1>
          <div className="h-1 w-20 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full" />
        </header>

        <div className="flex items-center gap-4 bg-transparent p-2 rounded-full border-none shadow-none ring-0 outline-none">
        <Button
          variant="outline"
          onClick={() => toggleMode('table')}
          className={cn(
            "rounded-full px-8 py-6 text-sm font-bold border-2 transition-all duration-500 uppercase tracking-widest outline-none ring-0",
            viewMode === 'table' && !isTransitioning
              ? "bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.3)]"
              : "bg-transparent text-white border-white/20 hover:border-white shadow-none"
          )}
        >
          TABLE MODE
        </Button>
        <Button
          variant="outline"
          onClick={() => toggleMode('sphere')}
          className={cn(
            "rounded-full px-8 py-6 text-sm font-bold border-2 transition-all duration-500 uppercase tracking-widest outline-none ring-0",
            (viewMode === 'sphere' || (isTransitioning && targetMode === 'sphere'))
              ? "bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.3)]"
              : "bg-transparent text-white border-white/20 hover:border-white shadow-none"
          )}
        >
          SPHERE MODE
        </Button>
        <Button
          variant="outline"
          onClick={() => toggleMode('helix')}
          className={cn(
            "rounded-full px-8 py-6 text-sm font-bold border-2 transition-all duration-500 uppercase tracking-widest outline-none ring-0",
            (viewMode === 'helix' || (isTransitioning && targetMode === 'helix'))
              ? "bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.3)]"
              : "bg-transparent text-white border-white/20 hover:border-white shadow-none"
          )}
        >
          HELIX MODE
        </Button>
      </div>
      
      {/* Legend - Moved below buttons */}
      <div className="mt-4 flex w-full max-w-full shrink-0 flex-nowrap justify-center gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide">
        {categories.map((cat) => (
            <div key={cat.value} className="flex items-center gap-1.5 whitespace-nowrap">
              <div className={cn("w-2 h-2 rounded-full shrink-0", cat.color)} />
              <span className="text-[10px] md:text-xs font-medium text-zinc-400 uppercase tracking-wider">
                {cat.label}
              </span>
            </div>
          ))}
      </div>
    </div>

      {/* Main: table = fixed height; sphere/helix = remaining column height (viewport − footer − header). */}
      <div
        className={cn(
          'relative w-full min-h-0 min-w-0 overflow-hidden border-none shadow-none outline-none ring-0',
          activeMode === 'table'
            ? 'h-[750px] shrink-0'
            : 'min-h-0 flex-1 basis-0 p-4 sm:p-6 md:p-8',
        )}
      >
        <div
          ref={containerRef}
          className="relative box-border h-full min-h-0 min-w-0 w-full border-0 border-none shadow-none outline-none ring-0"
          style={{ transformStyle: 'preserve-3d', border: 'none', outline: 'none' }}
        >
          {/* Pivot origin = sphere center. No translate on 0×0 box (broken %). Cards use translate(-50%,-50%) for their own size. */}
          <div
            className={cn(
              'absolute h-0 w-0 border-none shadow-none outline-none ring-0',
              needs3DCenter ? '' : 'left-1/2 top-[360px]',
            )}
            style={
              needs3DCenter
                ? {
                    transformStyle: 'preserve-3d',
                    ...(stageCenterPx
                      ? { left: stageCenterPx.x, top: stageCenterPx.y }
                      : { left: '50%', top: '50%' }),
                  }
                : { transformStyle: 'preserve-3d' }
            }
          >
            {elements.map((el, i) => {
              const catColor = categoryHexColors[el.category] || '#52525b';
              const glow = categoryCardGlowStyle(catColor);
              return (
                <div
                  key={el.number}
                  ref={el => {
                    if (el) cardRefs.current[i] = el;
                  }}
                  className="absolute left-0 top-0 w-[65px] h-[75px] border-2 rounded-md cursor-pointer transition-colors duration-300 group overflow-hidden will-change-transform bg-zinc-950/95"
                  onMouseEnter={() => {
                    hoveredCardIndexRef.current = i;
                  }}
                  onMouseLeave={() => {
                    if (hoveredCardIndexRef.current === i) hoveredCardIndexRef.current = null;
                  }}
                  onClick={() => handleElementClick(el)}
                  style={{
                    ...glow,
                    transform: 'translate(-50%, -50%)',
                  } as React.CSSProperties}
                >
                  <div className="relative z-[1] flex h-full flex-col items-center justify-center p-1 text-center">
                    <span
                      className="absolute right-1.5 top-1 text-[9px] font-bold text-zinc-200"
                      style={{ textShadow: '0 0 6px rgba(0,0,0,0.95), 0 1px 2px #000' }}
                    >
                      {el.number}
                    </span>
                    <span
                      className="mb-0.5 text-xl font-black transition-transform duration-300 group-hover:scale-125"
                      style={{
                        color: catColor,
                        textShadow: `0 0 14px ${catColor}dd, 0 0 3px #000, 0 1px 4px #000`,
                      }}
                    >
                      {el.symbol}
                    </span>
                    <span
                      className="w-full truncate px-0.5 text-[7px] font-bold uppercase tracking-tighter text-zinc-200"
                      style={{ textShadow: '0 0 6px rgba(0,0,0,0.95), 0 1px 2px #000' }}
                    >
                      {el.name}
                    </span>
                  </div>
                  <div
                    className="absolute bottom-0 left-0 right-0 z-[1] h-0.5 opacity-70"
                    style={{ backgroundColor: catColor }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <ElementDialog
        element={selectedElement}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
