'use client';

import { useState } from 'react';
import { elements, Element, ElementCategory } from '@/lib/elements';
import ElementCard from './ElementCard';
import ElementDialog from './ElementDialog';
import { cn } from '@/lib/utils';

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

  const handleElementClick = (element: Element) => {
    setSelectedElement(element);
    setIsDialogOpen(true);
  };

  return (
    <div className="w-full flex flex-col items-center gap-8 py-10 px-4 md:px-8">
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

      {/* Grid Container with Horizontal Scroll on Mobile */}
      <div className="w-full overflow-x-auto pb-6 scrollbar-hide">
        <div 
          className="grid gap-1.5 mx-auto min-w-[1000px] max-w-[1400px]"
          style={{
            gridTemplateColumns: 'repeat(18, minmax(0, 1fr))',
            gridTemplateRows: 'repeat(10, minmax(0, 1fr))',
          }}
        >
          {elements.map((element) => (
            <ElementCard 
              key={element.number} 
              element={element} 
              onClick={handleElementClick} 
            />
          ))}

          {/* Spacer labels for groups/periods could be added here if needed */}
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
