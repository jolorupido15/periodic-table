'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { elements, Element, ElementCategory } from '@/lib/elements';
import ElementDialog from './ElementDialog';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type ViewMode = 'table' | 'sphere' | 'helix';

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

  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rotationRef = useRef(0);
  const transitionRef = useRef(0); // 0 to 1
  const targetModeRef = useRef<ViewMode>('table');
  const currentModeRef = useRef<ViewMode>('table');
  const requestRef = useRef<number>();

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

      // Helix Base
      const strand = i < 59 ? 0 : 1;
      const idx = strand === 0 ? i : i - 59;
      const helixAngle = (idx / 59) * Math.PI * 4 + (strand === 1 ? Math.PI : 0);
      const hy = (idx - 29.5) * 18;

      return { tx, ty, phi, theta, helixAngle, hy };
    });
  }, []);

  const toggleMode = (mode: ViewMode) => {
    if (viewMode === mode || isTransitioning) return;

    targetModeRef.current = mode;
    currentModeRef.current = viewMode;
    setIsTransitioning(true);
    transitionRef.current = 0;

    // Transition timing logic handled in animation loop
    setTimeout(() => {
      setViewMode(mode);
      setIsTransitioning(false);
      transitionRef.current = 1;
    }, 1500);
  };

  const handleElementClick = (element: Element) => {
    setSelectedElement(element);
    setIsDialogOpen(true);
  };

  useEffect(() => {
    const animate = () => {
      rotationRef.current += 0.005;
      const rot = rotationRef.current;

      // Update transition progress if active
      if (isTransitioning) {
        transitionRef.current = Math.min(transitionRef.current + 0.015, 1);
      }
      const t = transitionRef.current;
      const mode = isTransitioning ? 'transition' : viewMode;

      const items: { index: number; z3d: number }[] = [];

      elementData.forEach((data, i) => {
        const { tx, ty, phi, theta, helixAngle, hy } = data;

        let x3d = 0, y3d = 0, z3d = 0;

        // Calculate 3D position for each mode
        const getPos = (m: ViewMode) => {
          if (m === 'table') return { x: tx, y: ty, z: 0 };
          if (m === 'sphere') {
            return {
              x: 300 * Math.sin(phi) * Math.cos(theta + rot),
              y: 300 * Math.cos(phi),
              z: 300 * Math.sin(phi) * Math.sin(theta + rot)
            };
          }
          if (m === 'helix') {
            return {
              x: Math.cos(helixAngle + rot) * 250,
              y: hy,
              z: Math.sin(helixAngle + rot) * 250
            };
          }
          return { x: 0, y: 0, z: 0 };
        };

        if (isTransitioning) {
          const start = getPos(currentModeRef.current);
          const end = getPos(targetModeRef.current);
          // Cubic ease-in-out for the transition progress
          const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
          x3d = start.x + (end.x - start.x) * ease;
          y3d = start.y + (end.y - start.y) * ease;
          z3d = start.z + (end.z - start.z) * ease;
        } else {
          const pos = getPos(viewMode);
          x3d = pos.x; y3d = pos.y; z3d = pos.z;
        }

        // Project 3D to 2D
        const perspective = 800 / (800 + z3d);
        const x2d = x3d * perspective;
        const y2d = y3d * perspective;
        const scale = perspective;
        const opacity = viewMode === 'table' && !isTransitioning ? 1 : 0.4 + (z3d + 300) / 600 * 0.6;

        const card = cardRefs.current[i];
        if (card) {
          card.style.transform = `translate(-50%, -50%) translate3d(${x2d}px, ${y2d}px, 0) scale(${scale})`;
          card.style.opacity = Math.max(0, Math.min(1, opacity)).toString();
          items.push({ index: i, z3d });
        }
      });

      // Painter's algorithm
      items.sort((a, b) => b.z3d - a.z3d);
      items.forEach((item, zIdx) => {
        const card = cardRefs.current[item.index];
        if (card) card.style.zIndex = zIdx.toString();
      });

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [viewMode, isTransitioning, elementData]);

  return (
    <div className="w-full flex flex-col items-center gap-12 py-10 px-4">
      {/* Controls */}
      <div className="flex items-center gap-6 z-[1000]">
        <Button
          variant="outline"
          onClick={() => toggleMode('table')}
          className={cn(
            "rounded-full px-8 py-6 text-sm font-bold border-2 transition-all duration-500 uppercase tracking-widest",
            viewMode === 'table' && !isTransitioning
              ? "bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.3)]"
              : "bg-transparent text-white border-white/20 hover:border-white"
          )}
        >
          TABLE MODE
        </Button>
        <Button
          variant="outline"
          onClick={() => toggleMode('sphere')}
          className={cn(
            "rounded-full px-8 py-6 text-sm font-bold border-2 transition-all duration-500 uppercase tracking-widest",
            (viewMode === 'sphere' || (isTransitioning && targetModeRef.current === 'sphere'))
              ? "bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.3)]"
              : "bg-transparent text-white border-white/20 hover:border-white"
          )}
        >
          SPHERE MODE
        </Button>
        <Button
          variant="outline"
          onClick={() => toggleMode('helix')}
          className={cn(
            "rounded-full px-8 py-6 text-sm font-bold border-2 transition-all duration-500 uppercase tracking-widest",
            (viewMode === 'helix' || (isTransitioning && targetModeRef.current === 'helix'))
              ? "bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.3)]"
              : "bg-transparent text-white border-white/20 hover:border-white"
          )}
        >
          HELIX MODE
        </Button>
      </div>

      {/* Main Content Area */}
      <div className="w-full min-h-[800px] flex items-center justify-center relative">
        {/* Stage */}
        <div ref={containerRef} className="relative w-[700px] h-[700px]">
          {elements.map((el, i) => {
            const catColor = categoryHexColors[el.category] || '#52525b';
            return (
              <div
                key={el.number}
                ref={(el) => (cardRefs.current[i] = el)}
                className="absolute left-1/2 top-1/2 w-[65px] h-[75px] bg-zinc-950/90 border rounded-md cursor-pointer transition-colors duration-300 group overflow-hidden will-change-transform"
                onClick={() => handleElementClick(el)}
                style={{
                  borderColor: `${catColor}80`,
                  boxShadow: `0 0 15px ${catColor}40`,
                } as React.CSSProperties}
              >
                <div className="flex flex-col items-center justify-center h-full relative p-1 text-center">
                  <span className="text-[9px] absolute top-1 right-1.5 opacity-60 text-zinc-400 font-bold">
                    {el.number}
                  </span>
                  <span
                    className="text-xl font-black mb-0.5 group-hover:scale-125 transition-transform duration-300"
                    style={{ color: catColor, textShadow: `0 0 10px ${catColor}50` }}
                  >
                    {el.symbol}
                  </span>
                  <span className="text-[7px] uppercase font-bold tracking-tighter text-zinc-500 truncate w-full px-0.5">
                    {el.name}
                  </span>
                </div>
                <div
                  className="absolute bottom-0 left-0 right-0 h-0.5 opacity-50"
                  style={{ backgroundColor: catColor }}
                />
              </div>
            );
          })}
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
