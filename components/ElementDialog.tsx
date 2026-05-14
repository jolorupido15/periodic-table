'use client';

import { Element, ElementCategory } from '@/lib/elements';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface ElementDialogProps {
  element: Element | null;
  isOpen: boolean;
  onClose: () => void;
}

const categoryBorderColors: Record<ElementCategory, string> = {
  'alkali metal': 'border-red-500/50',
  'alkaline earth metal': 'border-orange-500/50',
  'transition metal': 'border-yellow-500/50',
  'post-transition metal': 'border-teal-500/50',
  'metalloid': 'border-emerald-500/50',
  'reactive nonmetal': 'border-blue-500/50',
  'noble gas': 'border-pink-500/50',
  'halogen': 'border-purple-500/50',
  'lanthanide': 'border-indigo-500/50',
  'actinide': 'border-cyan-500/50',
  'unknown': 'border-zinc-700',
};

export default function ElementDialog({ element, isOpen, onClose }: ElementDialogProps) {
  if (!element) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn(
        "sm:max-w-[500px] bg-[#0a0a0a] border-2 shadow-2xl transition-all duration-500",
        categoryBorderColors[element.category]
      )}>
        <DialogHeader>
          <div className="flex items-center gap-4 mb-4">
            <div className={cn(
              "w-20 h-20 flex flex-col items-center justify-center border-2 rounded-lg",
              categoryBorderColors[element.category]
            )}>
              <span className="text-xs opacity-70">{element.number}</span>
              <span className="text-3xl font-bold">{element.symbol}</span>
              <span className="text-[10px] opacity-60">{element.atomic_mass}</span>
            </div>
            <div>
              <DialogTitle className="text-3xl font-bold tracking-tight text-white">
                {element.name}
              </DialogTitle>
              <DialogDescription className="capitalize text-zinc-400 font-medium">
                {element.category} • {element.phase}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
          <div className="space-y-4">
            <div>
              <h4 className="text-zinc-500 font-semibold mb-1 uppercase text-xs tracking-wider">Atomic Mass</h4>
              <p className="text-white font-medium">{element.atomic_mass} u</p>
            </div>
            <div>
              <h4 className="text-zinc-500 font-semibold mb-1 uppercase text-xs tracking-wider">Electron Configuration</h4>
              <p className="text-white font-medium">{element.electron_configuration}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <h4 className="text-zinc-500 font-semibold mb-1 uppercase text-xs tracking-wider">Number</h4>
              <p className="text-white font-medium">{element.number}</p>
            </div>
            <div>
              <h4 className="text-zinc-500 font-semibold mb-1 uppercase text-xs tracking-wider">Phase (STP)</h4>
              <p className="text-white font-medium">{element.phase}</p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h4 className="text-zinc-500 font-semibold mb-2 uppercase text-xs tracking-wider">Description</h4>
          <p className="text-zinc-300 leading-relaxed italic">
            {element.summary}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
