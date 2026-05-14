'use client';

import { Element, ElementCategory } from '@/lib/elements';
import { cn } from '@/lib/utils';

interface ElementCardProps {
  element: Element;
  onClick: (element: Element) => void;
}

const categoryColors: Record<ElementCategory, string> = {
  'alkali metal': 'bg-red-500/10 border-red-500/50 text-red-200 hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:bg-red-500/20',
  'alkaline earth metal': 'bg-orange-500/10 border-orange-500/50 text-orange-200 hover:shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:bg-orange-500/20',
  'transition metal': 'bg-yellow-500/10 border-yellow-500/50 text-yellow-200 hover:shadow-[0_0_20px_rgba(234,179,8,0.4)] hover:bg-yellow-500/20',
  'post-transition metal': 'bg-teal-500/10 border-teal-500/50 text-teal-200 hover:shadow-[0_0_20px_rgba(20,184,166,0.4)] hover:bg-teal-500/20',
  'metalloid': 'bg-emerald-500/10 border-emerald-500/50 text-emerald-200 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:bg-emerald-500/20',
  'reactive nonmetal': 'bg-blue-500/10 border-blue-500/50 text-blue-200 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:bg-blue-500/20',
  'noble gas': 'bg-pink-500/10 border-pink-500/50 text-pink-200 hover:shadow-[0_0_20px_rgba(236,72,153,0.4)] hover:bg-pink-500/20',
  'halogen': 'bg-purple-500/10 border-purple-500/50 text-purple-200 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:bg-purple-500/20',
  'lanthanide': 'bg-indigo-500/10 border-indigo-500/50 text-indigo-200 hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:bg-indigo-500/20',
  'actinide': 'bg-cyan-500/10 border-cyan-500/50 text-cyan-200 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:bg-cyan-500/20',
  'unknown': 'bg-zinc-800/50 border-zinc-700 text-zinc-400 hover:bg-zinc-700/50',
};

export default function ElementCard({ element, onClick }: ElementCardProps) {
  return (
    <div
      onClick={() => onClick(element)}
      className={cn(
        'relative flex flex-col items-center justify-center p-1.5 border transition-all duration-300 cursor-pointer rounded-sm group select-none hover:-translate-y-1',
        categoryColors[element.category]
      )}
      style={{
        gridColumn: element.xpos,
        gridRow: element.ypos,
      }}
    >
      <span className="absolute top-0.5 left-1 text-[10px] font-medium opacity-70">
        {element.number}
      </span>
      <span className="text-lg font-bold tracking-tight">
        {element.symbol}
      </span>
      <span className="text-[9px] font-medium truncate w-full text-center mt-0.5 opacity-90">
        {element.name}
      </span>
      <span className="text-[8px] opacity-60 mt-0.5">
        {element.atomic_mass}
      </span>
    </div>
  );
}
