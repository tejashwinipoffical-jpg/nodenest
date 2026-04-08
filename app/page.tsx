'use client';

import Link from 'next/link';
import { Swords, Zap, Trophy, Brain, ChevronRight, Code2, Users, Target, BarChart3, Star } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-background overflow-hidden selection:bg-primary/10">
      {/* Background Ambience */}
      <div className="fixed inset-0 grid-bg-light opacity-60 pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Nav */}
      <nav className="relative z-20 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Swords className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-black tracking-tight text-foreground">
            CodeDuel <span className="text-primary">Arena</span>
          </span>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</Link>
          <Link href="/leaderboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Leaderboard</Link>
          <Link href="/profile" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Profile</Link>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            id="nav-sign-in"
            className="px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-all"
          >
            Sign In
          </Link>
          <Link
            href="/queue"
            className="pro-btn px-6 py-2.5 rounded-full text-sm font-bold flex items-center gap-2"
          >
            Play Now <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-primary text-xs font-bold mb-8 animate-fade-in-up">
          <Star className="w-3 h-3 fill-current" />
          <span>V1.0 is now live — Enter the arena</span>
        </div>

        <h1 className="text-6xl md:text-8xl font-black tracking-tight text-foreground mb-8 animate-fade-in-up [animation-delay:100ms]">
          Code. Duel.<br />
          <span className="brand-text">Dominate.</span>
        </h1>

        <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-12 animate-fade-in-up [animation-delay:200ms] leading-relaxed">
          The ultimate real-time coding platform. Race against opponents globally, 
          solve complex algorithms, and level up your skills with AI-powered feedback.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up [animation-delay:300ms]">
          <Link
            href="/queue"
            id="hero-play-btn"
            className="pro-btn px-10 py-5 rounded-2xl text-lg font-bold flex items-center gap-2 w-full sm:w-auto"
          >
            Start a Duel <Zap className="w-5 h-5 fill-current" />
          </Link>
          <Link
            href="/dashboard"
            className="px-10 py-5 rounded-2xl text-lg font-bold bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all w-full sm:w-auto border border-border"
          >
            View Rankings
          </Link>
        </div>

        {/* Hero Illustration Placeholder (Glassy Card Stack) */}
        <div className="mt-24 relative max-w-5xl mx-auto animate-fade-in-up [animation-delay:400ms]">
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10" />
          <div className="glass-card rounded-3xl p-4 overflow-hidden shadow-2xl">
            <div className="flex items-center gap-2 mb-4 px-4 py-2 border-b border-border/50">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
              </div>
              <div className="ml-4 text-xs font-mono text-muted-foreground">room_58mt68.ts</div>
            </div>
            <div className="grid grid-cols-12 gap-6 p-4">
              <div className="col-span-8 bg-muted/30 rounded-xl h-64 animate-pulse" />
              <div className="col-span-4 space-y-4">
                <div className="bg-muted/30 rounded-xl h-24 animate-pulse" />
                <div className="bg-primary/5 rounded-xl h-36 border border-primary/10 flex items-center justify-center">
                  <Trophy className="w-12 h-12 text-primary opacity-20" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Grid */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-black mb-4">Built for the Next Gen</h2>
          <p className="text-muted-foreground">All the tools you need to sharpen your competitive edge.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { 
              icon: <Zap className="w-6 h-6" />, 
              title: "Instant Duel", 
              desc: "Pro-tier matchmaking in under 10 seconds. Find your perfect rival instantly." 
            },
            { 
              icon: <Brain className="w-6 h-6" />, 
              title: "AI Analysis", 
              desc: "Get deep pedagogical feedback from Claude after every match to optimize your logic." 
            },
            { 
              icon: <Target className="w-6 h-6" />, 
              title: "Ranked Climb", 
              desc: "From Bronze to Grand Master. Prove your skills on the global ELO leaderboard." 
            },
            { 
              icon: <Code2 className="w-6 h-6" />, 
              title: "Monaco Editor", 
              desc: "The world's best code editor, integrated directly into your browser arena." 
            },
            { 
              icon: <Users className="w-6 h-6" />, 
              title: "Community", 
              desc: "Join thousands of developers in the most high-energy coding community." 
            },
            { 
              icon: <BarChart3 className="w-6 h-6" />, 
              title: "Deep Stats", 
              desc: "Track your performance, win rates, and streak history with granular charts." 
            },
          ].map((f, i) => (
            <div key={i} className="glass-card hover:border-primary/20 transition-all p-8 group">
              <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                {f.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{f.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border py-12 px-6 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <Swords className="w-5 h-5 text-primary" />
          <span className="font-bold text-foreground">CodeDuel Arena</span>
        </div>
        <p className="text-sm text-muted-foreground">© 2026 CodeDuel. Premium competitive coding platform.</p>
        <div className="flex gap-6">
          <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Twitter</Link>
          <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Discord</Link>
          <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">GitHub</Link>
        </div>
      </footer>
    </div>
  );
}
