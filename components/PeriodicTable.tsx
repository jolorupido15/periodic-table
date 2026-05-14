'use client';

import { useState } from 'react';
import { elements, Element, ElementCategory } from '@/lib/elements';
import ElementCard from './ElementCard';
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

  const handleElementClick = (element: Element) => {
    setSelectedElement(element);
    setIsDialogOpen(true);
  };

  return (
    <div className="w-full flex flex-col items-center gap-8 py-10 px-4 md:px-8">
      {/* Controls */}
      <div className="flex items-center gap-4 z-20">
        <Button 
          variant="outline" 
          onClick={() => setIsSphereMode(!isSphereMode)}
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

      {/* Legend - Only in grid mode */}
      {!isSphereMode && (
        <div className="flex flex-wrap justify-center gap-3 md:gap-6 bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/50 backdrop-blur-sm animate-in fade-in duration-1000">
          {categories.map((cat) => (
            <div key={cat.value} className="flex items-center gap-2">
              <div className={cn("w-3 h-3 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.2)]", cat.color)} />
              <span className="text-[10px] md:text-xs font-medium text-zinc-400 uppercase tracking-tight">
                {cat.label}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Grid Container / Sphere Stage */}
      <div className={cn(
        "w-full transition-all duration-1000 flex items-center justify-center min-h-[750px]",
        isSphereMode ? "perspective-[2000px]" : "overflow-x-auto pb-6"
      )}>
        {isSphereMode ? (
          <div className="sphere-container">
            {elements.map((el, i) => {
              const phi = Math.acos(1 - 2 * (i + 0.5) / 118);
              const theta = Math.PI * (1 + Math.sqrt(5)) * i;
              const x = 300 * Math.sin(phi) * Math.cos(theta);
              const y = 300 * Math.sin(phi) * Math.sin(theta);
              const z = 300 * Math.cos(phi);
              
              const catColor = categoryHexColors[el.category] || '#52525b';

              return (
                <div 
                  key={el.number}
                  className="sphere-wrapper"
                  style={{
                    transform: `translate3d(${x}px, ${y}px, ${z}px)`,
                  } as React.CSSProperties}
                >
                  <div 
                    className="sphere-card group"
                    onClick={() => handleElementClick(el)}
                    style={{
                      border: `1px solid ${catColor}90`,
                      boxShadow: `0 0 15px ${catColor}60`,
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
        ) : (
          <div 
            className="grid gap-1.5 mx-auto min-w-[1000px] max-w-[1400px]"
            style={{
              gridTemplateColumns: 'repeat(18, minmax(0, 1fr))',
              gridTemplateRows: 'repeat(10, auto)',
            }}
          >
            {elements.map((element, index) => (
              <ElementCard 
                key={element.number} 
                element={element} 
                index={index}
                onClick={handleElementClick} 
                isSphereMode={false}
              />
            ))}
          </div>
        )}
      </div>

      <ElementDialog 
        element={selectedElement} 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)} 
      />

      <style jsx global>{`
        .sphere-container {
          position: relative;
          width: 700px;
          height: 700px;
          margin: auto;
          transform-style: preserve-3d;
          animation: rotateSphere 25s linear infinite;
        }

        .sphere-wrapper {
          position: absolute;
          left: 50%;
          top: 50%;
          transform-style: preserve-3d;
        }

        .sphere-card {
          width: 65px;
          height: 75px;
          margin-left: -32.5px;
          margin-top: -37.5px;
          background: rgba(10, 10, 10, 0.9);
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.3s ease;
          backface-visibility: hidden;
          animation: counterRotate 25s linear infinite;
        }

        .sphere-card:hover {
          background: rgba(20, 20, 20, 1);
          z-index: 100;
          scale: 1.1;
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
