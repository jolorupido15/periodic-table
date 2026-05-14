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
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [fadeState, setFadeState] = useState<'in' | 'out'>('in');

  const toggleMode = () => {
    setFadeState('out');
    setIsTransitioning(true);
    
    setTimeout(() => {
      setIsSphereMode(!isSphereMode);
      setFadeState('in');
      setIsTransitioning(false);
    }, 300);
  };

  const handleElementClick = (element: Element) => {
    setSelectedElement(element);
    setIsDialogOpen(true);
  };

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

      {/* Main Content Area */}
      <div className={cn(
        "w-full transition-all duration-500 ease-in-out",
        fadeState === 'out' ? "opacity-0 scale-95 blur-sm" : "opacity-100 scale-100 blur-0"
      )}>
        {isSphereMode ? (
          <div className="sphere-stage perspective-[2000px]">
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
                    className="sphere-card-wrapper"
                    style={{
                      transform: `translate3d(${x}px, ${y}px, ${z}px) rotateY(${theta}rad) rotateX(${phi - Math.PI / 2}rad)`,
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
                      <div className="flex flex-col items-center justify-center h-full relative p-1 text-center">
                        <span className="text-[8px] absolute top-1 right-1 opacity-70 text-zinc-400">
                          {el.number}
                        </span>
                        <span 
                          className="text-[18px] font-bold transition-all duration-300 group-hover:scale-125"
                          style={{ color: catColor, textShadow: `0_0_10px_${catColor}` }}
                        >
                          {el.symbol}
                        </span>
                        <span className="text-[7px] uppercase tracking-widest text-white mt-1 opacity-90 truncate w-full px-0.5">
                          {el.name}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="table-stage flex flex-col items-center gap-8 animate-in fade-in duration-500">
            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-3 md:gap-6 bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/50 backdrop-blur-sm">
              {categories.map((cat) => (
                <div key={cat.value} className="flex items-center gap-2">
                  <div className={cn("w-3 h-3 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.2)]", cat.color)} />
                  <span className="text-[10px] md:text-xs font-medium text-zinc-400 uppercase tracking-tight">
                    {cat.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Grid */}
            <div className="overflow-x-auto w-full pb-6 scrollbar-hide">
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
            </div>
          </div>
        )}
      </div>

      <ElementDialog 
        element={selectedElement} 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)} 
      />

      <style jsx global>{`
        .sphere-stage {
          width: 100%;
          height: 800px;
          display: flex;
          align-items: center;
          justify-center;
          transition: opacity 0.5s ease, transform 0.5s ease;
        }

        .sphere-container {
          position: relative;
          width: 700px;
          height: 700px;
          transform-style: preserve-3d;
          animation: rotateSphere 30s linear infinite;
        }

        .sphere-card-wrapper {
          position: absolute;
          left: 50%;
          top: 50%;
          transform-style: preserve-3d;
          backface-visibility: visible;
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
          transform-style: preserve-3d;
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
