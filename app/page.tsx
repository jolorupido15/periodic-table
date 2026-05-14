'use client';

import React from 'react';
import PeriodicTable from '@/components/PeriodicTable';
import GalaxyBackground from '@/components/GalaxyBackground';

export default function Home() {
  return (
    <main className="relative flex h-dvh min-h-0 w-full flex-col items-stretch overflow-x-hidden overflow-y-auto text-zinc-100">
      <GalaxyBackground />
      <PeriodicTable />
      <footer className="relative z-10 mt-auto w-full py-8 text-center text-zinc-600 text-sm font-medium tracking-widest uppercase">
        Cosmic Periodic Table • Portfolio Project
      </footer>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes zoomIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes slideInFromTop {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-in {
          animation-fill-mode: forwards;
        }
        .fade-in {
          animation-name: fadeIn;
        }
        .zoom-in {
          animation-name: zoomIn;
        }
        .slide-in-from-top-4 {
          animation-name: slideInFromTop;
        }
        .duration-1000 {
          animation-duration: 1000ms;
        }
        .delay-200 {
          animation-delay: 200ms;
        }
        .delay-500 {
          animation-delay: 500ms;
        }
      `}</style>
    </main>
  );
}
