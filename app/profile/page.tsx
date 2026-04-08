'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  User, Mail, Trophy, Swords, Zap, Star, Target, 
  BarChart3, Medal, Calendar, ShieldCheck, ArrowLeft, 
  TrendingUp, Clock, Code2, ChevronRight, Loader2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { MOCK_LEADERBOARD, getRatingTier } from '@/lib/mock-data';
import { Profile } from '@/lib/types';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getProfile() {
      const localId = localStorage.getItem('codeduel_id');
      
      if (!localId) {
        router.push('/login');
        return;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', localId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        localStorage.removeItem('codeduel_id');
        router.push('/login');
      } else {
        setUser(profile);
      }
      setLoading(false);
    }

    getProfile();
  }, [router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-sm font-black text-muted-foreground uppercase tracking-widest">Loading Duelist Records...</p>
        </div>
      </div>
    );
  }

  const tier = getRatingTier(user.rating);
  const totalDuels = user.wins + user.losses + user.draws;
  const winRate = Math.round((user.wins / totalDuels) * 100);

  return (
    <div className="min-h-screen bg-background dot-bg pb-24 selection:bg-primary/10">
      {/* Dynamic Background */}
      <div className="fixed inset-0 grid-bg-light opacity-40 pointer-events-none" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header / Nav */}
      <nav className="relative z-20 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <Link href="/dashboard" className="flex items-center gap-2 group text-muted-foreground hover:text-foreground transition-all">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-bold uppercase tracking-widest">Back to Dashboard</span>
        </Link>
        
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
            <Swords className="w-5 h-5 text-white" />
          </div>
          <span className="font-black text-foreground">CodeDuel <span className="text-primary italic">Arena</span></span>
        </div>

        <Link href="/queue" className="pro-btn px-6 py-2 rounded-full text-xs font-bold flex items-center gap-2">
          New Match <Zap className="w-3.5 h-3.5 fill-current" />
        </Link>
      </nav>

      <main className="relative z-10 max-w-5xl mx-auto px-6 mt-12 space-y-12">
        
        {/* ── Player Card Hero ── */}
        <section className="glass-card rounded-[48px] p-12 flex flex-col md:flex-row items-center gap-12 relative overflow-hidden pro-shadow">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-bl-[200px] pointer-events-none" />
          
          <div className="relative group">
            <div className="w-48 h-48 rounded-[40px] bg-secondary flex items-center justify-center text-7xl border-8 border-background shadow-2xl relative z-10 group-hover:rotate-3 transition-transform duration-500">
              {user.avatar}
            </div>
            <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-primary rounded-3xl flex items-center justify-center text-white border-8 border-background shadow-xl z-20 animate-float">
              <ShieldCheck className="w-8 h-8" />
            </div>
          </div>

          <div className="flex-1 text-center md:text-left space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary border border-border text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">
                Global Rank #124
              </div>
              <h1 className="text-6xl font-black tracking-tighter text-foreground mb-2 brand-text transition-all">
                {user.username}
              </h1>
              <p className="text-lg text-muted-foreground font-medium italic">"{user.bio}"</p>
            </div>

            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-primary/5 border border-primary/10">
                <Trophy className="w-5 h-5 text-primary" />
                <span className="text-xl font-black text-foreground">{user.rating} ELO</span>
              </div>
              <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-secondary border border-border">
                <div className={`w-3 h-3 rounded-full ${tier.color.replace('text-', 'bg-')}`} />
                <span className="text-sm font-black uppercase tracking-widest text-foreground">{tier.label}</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Performance Tab Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Account Identity */}
          <div className="glass-card rounded-[32px] p-8 space-y-8">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
              <User className="w-3.5 h-3.5" /> Identity
            </h3>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-muted-foreground">Email Address</p>
                  <p className="text-sm font-bold text-foreground">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-muted-foreground">Combat History</p>
                  <p className="text-sm font-bold text-foreground">Joined March 2025</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground">
                  <Code2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-muted-foreground">Primary Language</p>
                  <p className="text-sm font-bold text-foreground uppercase">{user.preferred_language}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Core Stats Dossier */}
          <div className="md:col-span-2 glass-card rounded-[32px] p-8 flex flex-col">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground mb-8 flex items-center gap-2">
              <BarChart3 className="w-3.5 h-3.5" /> Combat Dossier
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 flex-1">
              {[
                { label: 'Duels Attended', value: totalDuels, color: 'text-foreground' },
                { label: 'Victories', value: user.wins, color: 'text-emerald-500' },
                { label: 'Defeats', value: user.losses, color: 'text-rose-500' },
                { label: 'Win Rate', value: `${winRate}%`, color: 'text-primary' },
              ].map((s, i) => (
                <div key={i} className="flex flex-col items-center justify-center text-center p-4 bg-secondary/30 rounded-2xl border border-border">
                  <p className={`text-3xl font-black ${s.color} mb-1 transition-transform hover:scale-110`}>{s.value}</p>
                  <p className="text-[10px] font-black uppercase text-muted-foreground tracking-tighter leading-none">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-8 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground">Highest Streak</span>
                  <span className="text-sm font-black text-foreground">12 Duelist Fire</span>
                </div>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[60%] rounded-full shadow-lg shadow-primary/20" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground">Algorithm Mastery</span>
                  <span className="text-sm font-black text-foreground">84% Accuracy</span>
                </div>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 w-[84%] rounded-full shadow-lg shadow-amber-200" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Achievements & Standings ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Achievement Gallery */}
          <section className="glass-card rounded-[32px] p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                <Medal className="w-3.5 h-3.5" /> Achievements
              </h3>
              <button className="text-[10px] font-black text-primary hover:underline transition-all">VIEW ALL GALLERY</button>
            </div>

            <div className="grid grid-cols-4 gap-4">
              {[
                { icon: '🚀', label: 'Early Adopter' },
                { icon: '🔥', label: 'Streak Master' },
                { icon: '💻', label: 'JS Guru' },
                { icon: '🛡️', label: 'Unfailing' },
              ].map((b, i) => (
                <div key={i} className="group relative">
                  <div className="w-full aspect-square rounded-2xl bg-background border-2 border-border flex items-center justify-center text-2xl group-hover:scale-110 group-hover:border-primary transition-all duration-300 pro-shadow cursor-help">
                    {b.icon}
                  </div>
                  <div className="absolute -bottom-1 left-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-[9px] font-black text-center text-muted-foreground uppercase pt-1">{b.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Standings Overview */}
          <section className="glass-card rounded-[32px] p-8 overflow-hidden relative">
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5" /> Standings
              </h3>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/10">
                <TrendingUp className="w-3 h-3 text-emerald-500" />
                <span className="text-[10px] font-black text-emerald-600">+12% this week</span>
              </div>
            </div>

            <div className="space-y-6">
              {MOCK_LEADERBOARD.slice(0, 3).map((item) => (
                <div key={item.profile.id} className={`flex items-center justify-between p-4 rounded-[20px] transition-all ${item.profile.id === user.id ? 'bg-primary/5 border border-primary/10 shadow-sm' : 'hover:bg-secondary/50'}`}>
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-black text-muted-foreground w-4">{item.rank}</span>
                    <div className="w-9 h-9 rounded-xl bg-background border border-border flex items-center justify-center text-lg">{item.profile.avatar}</div>
                    <p className="text-sm font-bold text-foreground">{item.profile.username}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-foreground">{item.profile.rating}</p>
                    <p className="text-[9px] font-bold text-muted-foreground tracking-widest uppercase">Rating</p>
                  </div>
                </div>
              ))}
              
              <Link href="/leaderboard" className="flex items-center justify-between w-full p-4 rounded-[20px] bg-secondary border border-border hover:bg-muted transition-all text-xs font-bold group">
                <span className="text-muted-foreground">View Global Leaderboard</span>
                <ChevronRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </section>
        </div>

      </main>

      {/* Profile Footer Footer */}
      <footer className="relative z-10 max-w-5xl mx-auto px-6 mt-16 flex flex-col md:flex-row items-center justify-between gap-6 opacity-50">
        <div className="flex items-center gap-2">
          <Swords className="w-4 h-4 text-primary" />
          <span className="text-sm font-bold text-foreground">CodeDuel Player Profile</span>
        </div>
        <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest">
          <Link href="#" className="hover:text-primary transition-colors">Privacy Stats</Link>
          <Link href="#" className="hover:text-primary transition-colors">Export Record</Link>
          <Link href="#" className="hover:text-primary transition-colors">API Dossier</Link>
        </div>
      </footer>
    </div>
  );
}
