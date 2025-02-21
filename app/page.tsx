'use client';

import Content from './components/Content';
import Header from './components/Header';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      <script src="https://cdn.jsdelivr.net/npm/eruda"></script>
      <script>eruda.init();</script>
      <Header />
      <main className="p-8 sm:p-10">
        <div className="max-w-[1200px] mx-auto">
          <Content />
        </div>
      </main>
    </div>
  );
}
