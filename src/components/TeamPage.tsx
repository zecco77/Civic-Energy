import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

const TEAM = [
  {
    name: 'Zalak (Zecco) Patel',
    role: 'CO-FOUNDER AND CEO',
    image: '/Zalak_Patel.jpg',
  },
  {
    name: 'Arushi Malhotra',
    role: 'COO',
    image: '/Arushi.png',
  },
  {
    name: 'Sameed Iqbal',
    role: 'CTO',
    image: '/Sameed.png', 
  }
];

export function TeamPage() {
  return (
    <div className="min-h-screen bg-bg flex flex-col font-sans">
      <Navbar />
      
      <main className="flex-1 pt-32 pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 border-b-2 border-accent pb-2">
            <h1 className="text-2xl sm:text-3xl font-semibold text-accent uppercase tracking-wider">Management Team</h1>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {TEAM.map((member) => (
              <div key={member.name} className="flex flex-col items-center">
                <div className="relative w-full aspect-[4/5] sm:aspect-square md:aspect-[4/5] object-cover mb-4 rounded-xl overflow-hidden bg-primary/10">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[85%] bg-white py-2 px-4 rounded-[2rem] shadow-md text-center">
                    <span className="font-semibold text-primary text-base sm:text-lg whitespace-nowrap">{member.name}</span>
                  </div>
                </div>
                <p className="text-accent font-bold tracking-widest uppercase text-sm">{member.role}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12 pt-8 border-t border-black/10">
            <p className="font-bold text-primary tracking-wide text-sm sm:text-base">
              CHICAGO-BASED TEAM | CURRENTLY BOOTSTRAPPED
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
