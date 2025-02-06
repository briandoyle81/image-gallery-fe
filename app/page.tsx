import '@rainbow-me/rainbowkit/styles.css';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import Content from './components/Content';


export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-md p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Onchain Image Gallery</h1>
        <ConnectButton />
      </header>
      <main className="p-8 sm:p-20">
        <Content />
      </main>
    </div>
  );
}
