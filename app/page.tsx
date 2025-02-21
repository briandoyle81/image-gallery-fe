'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';

// Dynamically import components with no SSR
const Content = dynamic(() => import('./components/Content'), { ssr: false });
const Header = dynamic(() => import('./components/Header'), { ssr: false });

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="p-8 sm:p-10">
        <div className="max-w-[1200px] mx-auto">
          <Content />
        </div>
      </main>
    </div>
  );
}
