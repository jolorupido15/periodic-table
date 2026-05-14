'use client';

import PeriodicTable from '@/components/PeriodicTable';

export default function PeriodicTablePage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-zinc-100 flex flex-col items-center">
      <div className="w-full max-w-7xl px-4 pt-12 pb-6">
        <header className="flex flex-col items-center text-center space-y-4 mb-12">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-white">
            Periodic Table
          </h1>
          <p className="text-zinc-400 max-w-2xl text-lg font-medium">
            An interactive exploration of the building blocks of the universe. 
            Click on any element to discover its properties and history.
          </p>
          <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
        </header>

        <PeriodicTable />
      </div>

      <footer className="mt-auto py-8 text-zinc-600 text-sm font-medium">
        Interactive Periodic Table • Portfolio Project
      </footer>
    </main>
  );
}
