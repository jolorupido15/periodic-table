'use client';

import { useState, useEffect, useMemo } from 'react';
import { elements, Element, ElementCategory } from '@/lib/elements';
import ElementCard from './ElementCard';
import ElementDialog from './ElementDialog';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type ViewState = 'table' | 'flying-to-sphere' | 'sphere' | 'flying-to-table';

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
  const [viewState, setViewState] = useState<ViewState>('table');

  const toggleMode = () => {
    if (viewState === 'table') {
      setViewState('flying-to-sphere');
      setTimeout(() => setViewState('sphere'), 1800);
    } else if (viewState === 'sphere') {
      setViewState('flying-to-table');
      setTimeout(() => setViewState('table'), 1800);
    }
  };

  const handleElementClick = (element: Element) => {
    setSelectedElement(element);
    setIsDialogOpen(true);
  };

  // Dimensions
  const cardW = 65;
  const cardH = 75;
  const gap = 8;
  const gridW = 18 * (cardW + gap);
  const gridH = 10 * (cardH + gap);

  // Pre-calculate positions
  const elementPositions = useMemo(() => {
    return elements.map((el, i) => {
      // Table Pos
      const tx = (el.xpos - 1) * (cardW + gap) - gridW / 2 + cardW / 2;
      const ty = (el.ypos - 1) * (cardH + gap) - gridH / 2 + cardH / 2;

      // Sphere Pos
      const phi = Math.acos(1 - 2 * (i + 0.5) / 118);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      const sx = 300 * Math.sin(phi) * Math.cos(theta);
      const sy = 300 * Math.sin(phi) * Math.sin(theta);
      const sz = 300 * Math.cos(phi);

      return { tx, ty, sx, sy, sz, theta, phi };
    });
  }, []);

  const isFlying = viewState === 'flying-to-sphere' || viewState === 'flying-to-table';
  const isSphere = viewState === 'sphere';

  return (
    <div className="w-full flex flex-col items-center gap-12 py-10 px-4">
      {/* Controls */}
      <div className="z-[1000]">
        <Button 
          variant="outline" 
          onClick={toggleMode}
          disabled={isFlying}
          className={cn(
            "rounded-full px-12 py-8 text-xl font-black border-2 transition-all duration-700 uppercase tracking-widest",
            (isSphere || viewState === 'flying-to-sphere') 
              ? "bg-white text-black border-white shadow-[0_0_40px_rgba(255,255,255,0.4)] scale-110" 
              : "bg-transparent text-white border-white/20 hover:border-white"
          )}
        >
          {isSphere ? "EXIT SPHERE" : "SPHERE MODE"}
        </Button>
      </div>

      {/* Legend - Hidden in sphere/flying */}
      <div className={cn(
        "flex flex-wrap justify-center gap-4 transition-all duration-700",
        viewState !== 'table' ? "opacity-0 -translate-y-8" : "opacity-100"
      )}>
        {categories.map((cat) => (
          <div key={cat.value} className="flex items-center gap-2">
            <div className={cn("w-3 h-3 rounded-full", cat.color)} />
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-widest">
              {cat.label}
            </span>
          </div>
        ))}
      </div>

      {/* Main Stage */}
      <div className={cn(
        "relative w-full transition-all duration-1000",
        isSphere || isFlying ? "h-[800px] perspective-[2000px]" : "h-[850px]"
      )}>
        <div className={cn(
          "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
          isSphere ? "rotating-sphere" : ""
        )}
        style={{
          width: isSphere || isFlying ? '100%' : `${gridW}px`,
          height: isSphere || isFlying ? '100%' : `${gridH}px`,
          transformStyle: 'preserve-3d',
        }}
        >
          {elements.map((el, i) => {
            const pos = elementPositions[i];
            const catColor = categoryHexColors[el.category] || '#52525b';

            // Determine current position based on viewState
            let x = pos.tx, y = pos.ty, z = 0;
            let opacity = 1;
            let scale = 1;

            if (viewState === 'sphere' || viewState === 'flying-to-sphere') {
              x = pos.sx; y = pos.sy; z = pos.sz;
            }
            if (viewState === 'flying-to-table') {
              x = pos.tx; y = pos.ty; z = 0;
            }

            return (
              <div 
                key={el.number}
                className="absolute left-1/2 top-1/2"
                style={{
                  transform: `translate3d(${x}px, ${y}px, ${z}px)`,
                  transition: isFlying ? 'transform 1200ms cubic-bezier(0.4, 0, 0.2, 1), opacity 800ms ease' : 'none',
                  transitionDelay: isFlying ? `${i * 10}ms` : '0ms',
                  transformStyle: 'preserve-3d',
                  zIndex: isSphere ? Math.round(z + 500) : 10,
                } as React.CSSProperties}
              >
                <div 
                  className={cn(
                    "relative w-[65px] h-[75px] -ml-[32.5px] -mt-[37.5px] rounded-md bg-zinc-950/90 border cursor-pointer transition-all duration-500 group overflow-hidden",
                    isSphere && "billboard-card"
                  )}
                  onClick={() => handleElementClick(el)}
                  style={{
                    borderColor: `${catColor}80`,
                    boxShadow: isSphere || isFlying ? `0 0 20px ${catColor}40` : 'none',
                    opacity: isSphere && z < 0 ? 0.6 : 1,
                  } as React.CSSProperties}
                >
                  <div className="flex flex-col items-center justify-center h-full p-1">
                    <span className="text-[9px] absolute top-1 right-1.5 opacity-60 text-zinc-400 font-bold">
                      {el.number}
                    </span>
                    <span 
                      className="text-xl font-black mb-0.5 group-hover:scale-125 transition-transform duration-300"
                      style={{ color: catColor, textShadow: `0 0 10px ${catColor}50` }}
                    >
                      {el.symbol}
                    </span>
                    <span className="text-[7px] uppercase font-bold tracking-tighter text-zinc-500 truncate w-full text-center">
                      {el.name}
                    </span>
                  </div>
                  {/* Category color bottom bar */}
                  <div 
                    className="absolute bottom-0 left-0 right-0 h-0.5 opacity-50"
                    style={{ backgroundColor: catColor }}
                  />
                </div>
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
        .rotating-sphere {
          animation: rotateSphere 30s linear infinite;
        }

        @keyframes rotateSphere {
          from { transform: rotateY(0deg); }
          to { transform: rotateY(360deg); }
        }

        .billboard-card {
          /* We don't need manual counter-rotation keyframes if we use the billboard approach 
             where the cards themselves don't inherit the parent's rotateY.
             Wait, they DO inherit it. 
             So we use the same animation but reversed. */
          animation: counterRotate 30s linear infinite;
        }

        @keyframes counterRotate {
          from { transform: rotateY(0deg); }
          to { transform: rotateY(-360deg); }
        }

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
