'use client';

import PeriodicTable from '@/components/PeriodicTable';
import GalaxyBackground from '@/components/GalaxyBackground';

export default function Home() {
  return (
    <main className="relative min-h-screen text-zinc-100 flex flex-col items-center overflow-x-hidden">
      {/* Immersive Galaxy Background */}
      <GalaxyBackground />
      
      <div className="relative z-10 w-full max-w-7xl px-4 pt-12 pb-6">
        <header className="relative z-20 flex flex-col items-center text-center space-y-4 mb-12">
          <div className="animate-in fade-in zoom-in duration-1000">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
              Periodic Table
            </h1>
          </div>
          <p className="text-zinc-400 max-w-2xl text-lg font-medium animate-in fade-in slide-in-from-top-4 duration-1000 delay-200">
            An interactive exploration of the building blocks of the universe. 
            Click on any element to discover its properties and history.
          </p>
          <div className="h-1 w-32 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)] animate-in fade-in duration-1000 delay-500" />
        </header>

        <PeriodicTable />
      </div>

      <footer className="relative z-10 mt-auto py-8 text-zinc-600 text-sm font-medium tracking-widest uppercase">
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
