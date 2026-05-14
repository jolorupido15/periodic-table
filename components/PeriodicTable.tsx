'use client';

import { useState, useEffect } from 'react';
import { elements, Element, ElementCategory } from '@/lib/elements';
import ElementCard from './ElementCard';
import ElementDialog from './ElementDialog';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

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
  const [isSphereMode, setIsSphereMode] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!isSphereMode) return;

    let animationFrameId: number;
    const animate = () => {
      setRotation(prev => ({
        x: prev.x + 0.1,
        y: prev.y + 0.2
      }));
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationFrameId);
  }, [isSphereMode]);

  const handleElementClick = (element: Element) => {
    setSelectedElement(element);
    setIsDialogOpen(true);
  };

  const getSphereStyle = (index: number): React.CSSProperties => {
    const total = elements.length;
    const phi = Math.acos(-1 + (2 * index) / total);
    const theta = Math.sqrt(total * Math.PI) * phi;

    const radius = 400; // Sphere radius in pixels

    return {
      transform: `
        rotateY(${theta}rad) 
        rotateX(${phi}rad) 
        translateZ(${radius}px)
      `,
      position: 'absolute',
      left: '50%',
      top: '50%',
      marginLeft: '-32px', // half width
      marginTop: '-40px', // half height
    };
  };

  return (
    <div className="w-full flex flex-col items-center gap-8 py-10 px-4 md:px-8">
      {/* Controls */}
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          onClick={() => setIsSphereMode(!isSphereMode)}
          className={cn(
            "rounded-full px-8 py-6 text-lg font-bold border-2 transition-all duration-500",
            isSphereMode 
              ? "bg-white text-black hover:bg-zinc-200 border-white scale-110" 
              : "bg-transparent text-white border-white/20 hover:border-white"
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
        "w-full transition-all duration-1000 flex items-center justify-center",
        isSphereMode ? "h-[800px] perspective-[1500px]" : "overflow-x-auto pb-6"
      )}>
        <div 
          className={cn(
            "transition-all duration-1000",
            isSphereMode 
              ? "relative w-full h-full transform-style-3d" 
              : "grid gap-1.5 mx-auto min-w-[1000px] max-w-[1400px]"
          )}
          style={isSphereMode ? {
            transform: `rotateX(${rotation.x * 0.1}deg) rotateY(${rotation.y}deg)`,
            transformStyle: 'preserve-3d'
          } : {
            gridTemplateColumns: 'repeat(18, minmax(0, 1fr))',
            gridTemplateRows: 'repeat(10, minmax(0, 1fr))',
          }}
        >
          {elements.map((element, index) => (
            <ElementCard 
              key={element.number} 
              element={element} 
              index={index}
              onClick={handleElementClick} 
              isSphereMode={isSphereMode}
              sphereStyle={getSphereStyle(index)}
            />
          ))}
        </div>
      </div>

      <ElementDialog 
        element={selectedElement} 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)} 
      />

      <style jsx global>{`
        .perspective-[1500px] {
          perspective: 1500px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
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
