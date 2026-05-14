'use client';

import { useState, useEffect } from 'react';
import { elements, Element, ElementCategory } from '@/lib/elements';
import ElementDialog from './ElementDialog';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const categories: { label: string; value: ElementCategory; color: string; hex: string }[] = [
  { label: 'Alkali Metals', value: 'alkali metal', color: 'bg-red-500', hex: '#ef4444' },
  { label: 'Alkaline Earth', value: 'alkaline earth metal', color: 'bg-orange-500', hex: '#f97316' },
  { label: 'Transition Metals', value: 'transition metal', color: 'bg-yellow-500', hex: '#eab308' },
  { label: 'Post-Transition', value: 'post-transition metal', color: 'bg-teal-500', hex: '#14b8a6' },
  { label: 'Metalloids', value: 'metalloid', color: 'bg-emerald-500', hex: '#10b981' },
  { label: 'Reactive Nonmetals', value: 'reactive nonmetal', color: 'bg-blue-500', hex: '#3b82f6' },
  { label: 'Noble Gases', value: 'noble gas', color: 'bg-pink-500', hex: '#ec4899' },
  { label: 'Halogens', value: 'halogen', color: 'bg-purple-500', hex: '#a855f7' },
  { label: 'Lanthanides', value: 'lanthanide', color: 'bg-indigo-500', hex: '#6366f1' },
  { label: 'Actinides', value: 'actinide', color: 'bg-cyan-500', hex: '#06b6d4' },
];

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

export default function PeriodicTable() {
  const [selectedElement, setSelectedElement] = useState<Element | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSphereMode, setIsSphereMode] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const toggleMode = () => {
    setIsTransitioning(true);
    setIsSphereMode(!isSphereMode);
    setTimeout(() => setIsTransitioning(false), 850);
  };

  const handleElementClick = (element: Element) => {
    setSelectedElement(element);
    setIsDialogOpen(true);
  };

  // Grid Constants
  const cardWidth = 60;
  const cardHeight = 75;
  const gap = 6;
  const gridWidth = 18 * (cardWidth + gap);
  const gridHeight = 10 * (cardHeight + gap);

  return (
    <div className="w-full flex flex-col items-center gap-8 py-10 px-4 md:px-8">
      {/* Controls */}
      <div className="flex items-center gap-4 z-50">
        <Button 
          variant="outline" 
          onClick={toggleMode}
          disabled={isTransitioning}
          className={cn(
            "rounded-full px-10 py-7 text-xl font-black border-2 transition-all duration-700 uppercase tracking-widest",
            isSphereMode 
              ? "bg-white text-black hover:bg-zinc-200 border-white scale-110 shadow-[0_0_30px_rgba(255,255,255,0.6)]" 
              : "bg-transparent text-white border-white/20 hover:border-white hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
          )}
        >
          {isSphereMode ? "EXIT SPHERE" : "SPHERE MODE"}
        </Button>
      </div>

      {/* Legend - Fade out in sphere mode */}
      <div className={cn(
        "flex flex-wrap justify-center gap-3 md:gap-6 bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/50 backdrop-blur-sm transition-all duration-1000",
        isSphereMode ? "opacity-0 pointer-events-none -translate-y-4" : "opacity-100"
      )}>
        {categories.map((cat) => (
          <div key={cat.value} className="flex items-center gap-2">
            <div className={cn("w-3 h-3 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.2)]", cat.color)} />
            <span className="text-[10px] md:text-xs font-medium text-zinc-400 uppercase tracking-tight">
              {cat.label}
            </span>
          </div>
        ))}
      </div>

      {/* Main Stage */}
      <div className={cn(
        "relative transition-all duration-1000 flex items-center justify-center",
        isSphereMode ? "w-full h-[800px] perspective-[2000px]" : "w-full min-h-[850px] overflow-x-auto pb-6"
      )}>
        <div className={cn(
          "relative transition-all duration-1000",
          isSphereMode ? "sphere-container" : "table-container"
        )}
        style={!isSphereMode ? {
          width: `${gridWidth}px`,
          height: `${gridHeight}px`,
        } : {}}
        >
          {elements.map((el, i) => {
            // Sphere calculation
            const phi = Math.acos(1 - 2 * (i + 0.5) / 118);
            const theta = Math.PI * (1 + Math.sqrt(5)) * i;
            const sx = 300 * Math.sin(phi) * Math.cos(theta);
            const sy = 300 * Math.sin(phi) * Math.sin(theta);
            const sz = 300 * Math.cos(phi);

            // Table calculation
            const tx = (el.xpos - 1) * (cardWidth + gap) - gridWidth / 2 + cardWidth / 2;
            const ty = (el.ypos - 1) * (cardHeight + gap) - gridHeight / 2 + cardHeight / 2;
            
            const catColor = categoryHexColors[el.category] || '#52525b';

            return (
              <div 
                key={el.number}
                className="element-wrapper"
                style={{
                  transform: isSphereMode 
                    ? `translate3d(${sx}px, ${sy}px, ${sz}px)` 
                    : `translate3d(${tx}px, ${ty}px, 0px)`,
                  transitionDelay: `${i * 5}ms`,
                  zIndex: isSphereMode ? Math.round(sz + 300) : 10,
                } as React.CSSProperties}
              >
                <div 
                  className={cn(
                    "sphere-card group transition-all duration-800 cubic-bezier(0.4, 0, 0.2, 1)",
                    isSphereMode && "is-sphere"
                  )}
                  onClick={() => handleElementClick(el)}
                  style={{
                    border: `1px solid ${catColor}90`,
                    boxShadow: isSphereMode ? `0 0 15px ${catColor}60` : 'none',
                    opacity: isSphereMode ? 1 : 0.95,
                    transform: isSphereMode ? 'scale(1)' : 'scale(1)',
                    transitionDelay: `${i * 5}ms`,
                  } as React.CSSProperties}
                >
                  <div className="flex flex-col items-center justify-center h-full relative p-1">
                    <span className="text-[8px] absolute top-1 right-1 opacity-70 text-zinc-400">
                      {el.number}
                    </span>
                    <span 
                      className="text-[20px] font-bold transition-all duration-300 group-hover:scale-125"
                      style={{ color: catColor, textShadow: `0 0 10px ${catColor}` }}
                    >
                      {el.symbol}
                    </span>
                    <span className="text-[7px] uppercase tracking-widest text-white mt-1 opacity-90 truncate w-full text-center px-0.5">
                      {el.name}
                    </span>
                  </div>
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
        .sphere-container {
          position: relative;
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
          animation: rotateSphere 25s linear infinite;
        }

        .table-container {
          position: relative;
          transform-style: preserve-3d;
        }

        .element-wrapper {
          position: absolute;
          left: 50%;
          top: 50%;
          transform-style: preserve-3d;
          transition: transform 800ms cubic-bezier(0.4, 0, 0.2, 1);
        }

        .sphere-card {
          width: 65px;
          height: 75px;
          margin-left: -32.5px;
          margin-top: -37.5px;
          background: rgba(10, 10, 10, 0.9);
          border-radius: 4px;
          cursor: pointer;
          transition: transform 800ms cubic-bezier(0.4, 0, 0.2, 1), 
                      opacity 800ms ease, 
                      box-shadow 800ms ease,
                      background 300ms ease;
          backface-visibility: hidden;
        }

        .sphere-card.is-sphere {
          animation: counterRotate 25s linear infinite;
        }

        .sphere-card:hover {
          background: rgba(20, 20, 20, 1);
          z-index: 1000 !important;
          scale: 1.15;
        }

        @keyframes rotateSphere {
          from { transform: rotateY(0deg); }
          to { transform: rotateY(360deg); }
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
