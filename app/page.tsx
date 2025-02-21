'use client';

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    eruda: any;
  }
}

import { useEffect } from "react";
import Content from './components/Content';
import Header from './components/Header';

export default function Home() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      import('eruda').then(module => {
        if (!window.eruda) {
          module.default.init();
        }
      });
    }
  }, []);

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
