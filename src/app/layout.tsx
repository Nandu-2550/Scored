import type { Metadata } from 'next';
import { Navbar } from '@/components/Navbar';
import { BottomNav } from '@/components/BottomNav';
import './globals.css';

export const metadata: Metadata = {
  title: 'SCORED | Multi-Sport Grassroots Organization & Tournament Hub',
  description: 'Grassroots tournament and organization discovery hub for Cricket, Kabaddi, Volleyball, Badminton, Kho-Kho, Throwball, Table Tennis, and Athletics.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col scored-dynamic-bg text-slate-900 pb-16 md:pb-0 relative overflow-x-hidden selection:bg-blue-500/20 selection:text-blue-900">
        {/* Soft Ambient Floating Glow Orbs for Glassmorphism Depth */}
        <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-blue-300/30 blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
          <div className="absolute top-1/3 -right-40 w-[30rem] h-[30rem] rounded-full bg-sky-300/25 blur-3xl animate-pulse" style={{ animationDuration: '12s' }} />
          <div className="absolute -bottom-40 left-1/3 w-[28rem] h-[28rem] rounded-full bg-emerald-300/25 blur-3xl animate-pulse" style={{ animationDuration: '10s' }} />
        </div>

        <Navbar />
        <main className="flex-1 relative z-0">
          {children}
        </main>
        <footer className="border-t border-white/60 bg-white/60 backdrop-blur-md py-8 text-center text-xs text-slate-500 relative z-10">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-slate-700">SCORED PLATFORM</span>
              <span>• Multi-Sport Grassroots Ecosystem</span>
            </div>
            <div className="flex items-center gap-4 text-slate-500">
              <span>Next.js App Router</span>
              <span>•</span>
              <span>Supabase REST Enabled</span>
              <span>•</span>
              <span>Cloudinary Media</span>
            </div>
          </div>
        </footer>
        <BottomNav />
      </body>
    </html>
  );
}
