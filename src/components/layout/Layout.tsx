
import React from 'react';
import { Navbar } from './Navbar';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-mono-50 to-mono-100">
      <Navbar />
      
      <main className="pt-16 lg:pt-6 lg:pl-64 transition-all duration-300 min-h-screen">
        <div className="container px-4 py-6 mx-auto max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}
