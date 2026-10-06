import type { Metadata, Viewport } from 'next';
import { Navbar } from '@/components/Navbar';
import { BottomNav } from '@/components/BottomNav';
import './globals.css';

export const metadata: Metadata = {
  title: 'SCORED | Multi-Sport Grassroots Organization & Tournament Hub',
  description: 'Grassroots tournament and organization discovery hub for Cricket, Kabaddi, Volleyball, Badminton, Kho-Kho, Throwball, Table Tennis, and Athletics.',
  icons: {
    icon: '/scored-logo.png',
    shortcut: '/scored-logo.png',
    apple: '/scored-logo.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#050814',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col scored-dynamic-bg text-slate-100 pb-24 md:pb-0 relative overflow-x-hidden selection:bg-cyan-500/30 selection:text-cyan-200">
        {/* Subtle Cyber Dot Grid Matrix for 3D Spatial Depth */}
        <div 
          className="fixed inset-0 pointer-events-none -z-20 opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255, 255, 255, 0.15) 1px, transparent 1px)',
            backgroundSize: '28px 28px'
          }}
        />

        {/* Aurora Mesh Floating Glow Orbs (Purple / Blue / Cyan) */}
        <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
          {/* Top-left Purple & Fuchsia Aurora */}
          <div 
            className="absolute -top-40 -left-40 w-[38rem] h-[38rem] rounded-full bg-gradient-to-br from-purple-600/35 via-fuchsia-600/20 to-indigo-600/30 blur-[120px]"
            style={{ animation: 'floatOrb1 20s ease-in-out infinite' }}
          />
          {/* Top-right Electric Blue & Indigo Aurora */}
          <div 
            className="absolute top-1/4 -right-40 w-[40rem] h-[40rem] rounded-full bg-gradient-to-bl from-blue-600/35 via-indigo-500/25 to-cyan-500/25 blur-[130px]"
            style={{ animation: 'floatOrb2 24s ease-in-out infinite' }}
          />
          {/* Bottom-left Neon Cyan & Teal Aurora */}
          <div 
            className="absolute -bottom-40 left-1/4 w-[36rem] h-[36rem] rounded-full bg-gradient-to-tr from-cyan-500/30 via-teal-500/20 to-blue-600/25 blur-[120px]"
            style={{ animation: 'floatOrb3 22s ease-in-out infinite' }}
          />
          {/* Center-right Deep Violet & Blue Aurora */}
          <div 
            className="absolute top-2/3 right-1/4 w-[32rem] h-[32rem] rounded-full bg-gradient-to-r from-purple-700/25 via-blue-600/20 to-cyan-400/20 blur-[110px]"
            style={{ animation: 'floatOrb4 26s ease-in-out infinite' }}
          />

          {/* Floating 3D Glass Orbs (Spatial Elements) */}
          <div 
            className="absolute top-36 left-[8%] w-16 h-16 rounded-full bg-gradient-to-tr from-white/10 to-white/5 border border-white/20 backdrop-blur-md shadow-[0_0_25px_rgba(6,182,212,0.35)] opacity-60 hidden lg:block"
            style={{ animation: 'float3D 7s ease-in-out infinite' }}
          />
          <div 
            className="absolute top-1/2 right-[6%] w-24 h-24 rounded-full bg-gradient-to-bl from-white/10 to-white/5 border border-purple-400/30 backdrop-blur-lg shadow-[0_0_35px_rgba(168,85,247,0.35)] opacity-50 hidden lg:block"
            style={{ animation: 'float3D 9s ease-in-out infinite 2s' }}
          />
          <div 
            className="absolute bottom-40 left-[15%] w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400/15 to-transparent border border-cyan-400/30 backdrop-blur-md shadow-[0_0_20px_rgba(59,130,246,0.3)] opacity-40 hidden lg:block"
            style={{ animation: 'float3D 6s ease-in-out infinite 1s' }}
          />
        </div>

        <Navbar />
        <main className="flex-1 relative z-0">
          {children}
        </main>
        <footer className="border-t border-white/10 bg-[#070b18]/70 backdrop-blur-xl py-8 text-center text-xs text-slate-400 relative z-10">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-slate-200">SCORED PLATFORM</span>
              <span className="text-slate-400">• Multi-Sport Grassroots Ecosystem</span>
            </div>
            <div className="flex items-center gap-4 text-slate-400">
              <span className="text-cyan-400 font-mono text-[11px]">Dark Aurora Edition</span>
              <span>•</span>
              <span>Next.js App Router</span>
              <span>•</span>
              <span>Supabase REST</span>
            </div>
          </div>
        </footer>
        <BottomNav />
      </body>
    </html>
  );
}
