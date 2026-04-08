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
import { getRatingTier } from '@/lib/mock-data';
import { Profile } from '@/lib/types';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<Profile | null>(null);
  const [globalRank, setGlobalRank] = useState<number>(0);
  const [rankingList, setRankingList] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getProfileData() {
      const localId = localStorage.getItem('codeduel_id');
      
      if (!localId) {
        router.push('/login');
        return;
      }

      // 1. Fetch User Profile
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', localId)
        .single();

      if (error || !profile) {
        console.error('Error fetching profile:', error);
        localStorage.removeItem('codeduel_id');
        router.push('/login');
        return;
      }

      setUser(profile);

      // 2. Fetch Global Rank & Top rivals
      const [rankRes, rivalsRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }).gt('rating', profile.rating),
        supabase.from('profiles').select('*').order('rating', { ascending: false }).limit(3)
      ]);

      if (rankRes.count !== null) {
        setGlobalRank(rankRes.count + 1);
      }
      
      if (rivalsRes.data) {
        setRankingList(rivalsRes.data);
      }

      setLoading(false);
    }

    getProfileData();
  }, [router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-sm font-black text-muted-foreground uppercase tracking-widest">Accessing Duelist Vault...</p>
        </div>
      </div>
    );
  }

  const tier = getRatingTier(user.rating);
  const totalMatches = user.wins + user.losses;
  const winRate = totalMatches > 0 ? Math.round((user.wins / totalMatches) * 100) : 0;

  return (
    <div className="min-h-screen bg-background dot-bg pb-24 selection:bg-primary/10">
      {/* Dynamic Background */}
      <div className="fixed inset-0 grid-bg-light opacity-40 pointer-events-none" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header / Nav */}
      <nav className="relative z-20 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto border-b border-border/50 glass mb-8">
        <Link href="/dashboard" className="flex items-center gap-2 group text-muted-foreground hover:text-foreground transition-all">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-bold uppercase tracking-widest">Dashboard</span>
        </Link>
        
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
            <Swords className="w-5 h-5 text-white" />
          </div>
          <span className="font-black text-foreground">CodeDuel <span className="text-primary italic">Arena</span></span>
        </div>

        <Link href="/queue" className="pro-btn px-6 py-2 rounded-full text-xs font-bold flex items-center gap-2">
          NEW DUEL <Zap className="w-3.5 h-3.5 fill-current" />
        </Link>
      </nav>

      <main className="relative z-10 max-w-5xl mx-auto px-6 space-y-12">
        
        {/* ── Player Hero ── */}
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
                Global Standing #{globalRank}
              </div>
              <h1 className="text-6xl font-black tracking-tighter text-foreground mb-2">
                {user.username}
              </h1>
              <p className="text-lg text-muted-foreground font-medium italic opacity-70">"{user.bio || 'Ready for a lively duel!'}"</p>
            </div>

            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <div className="flex items-center gap-3 px-6 py-4 rounded-3xl bg-primary/5 border border-primary/10 shadow-sm">
                <Trophy className="w-6 h-6 text-primary" />
                <span className="text-2xl font-black text-foreground">{user.rating} ELO</span>
              </div>
              <div className="flex items-center gap-3 px-6 py-4 rounded-3xl bg-secondary border border-border">
                <div className={`w-3 h-3 rounded-full ${tier.color.replace('text-', 'bg-')}`} />
                <span className="text-sm font-black uppercase tracking-widest text-foreground">{tier.label}</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Identity Dossier */}
          <div className="glass-card rounded-[32px] p-8 space-y-8">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
              <User className="w-3.5 h-3.5" /> Identity Dossier
            </h3>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-muted-foreground">Registered Email</p>
                  <p className="text-sm font-bold text-foreground truncate max-w-[150px]">{user.email || 'Anonymous'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-muted-foreground">Arena Record Since</p>
                  <p className="text-sm font-bold text-foreground">March 2025</p>
                </div>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  <Code2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-muted-foreground">Primary Syntax</p>
                  <p className="text-sm font-bold text-foreground uppercase tracking-widest">{user.preferred_language}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Combat Metrics */}
          <div className="md:col-span-2 glass-card rounded-[32px] p-8 flex flex-col">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground mb-8 flex items-center gap-2">
              <BarChart3 className="w-3.5 h-3.5" /> Performance Analytics
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 flex-1">
              {[
                { label: 'Duels Attended', value: totalMatches, color: 'text-foreground' },
                { label: 'Total Victories', value: user.wins, color: 'text-emerald-500' },
                { label: 'Total Defeats', value: user.losses, color: 'text-rose-500' },
                { label: 'Victory Rate', value: `${winRate}%`, color: 'text-primary' },
              ].map((s, i) => (
                <div key={i} className="flex flex-col items-center justify-center text-center p-5 bg-secondary/30 rounded-3xl border border-border group hover:border-primary/20 transition-all">
                  <p className={`text-3xl font-black ${s.color} mb-1 group-hover:scale-110 transition-transform`}>{s.value}</p>
                  <p className="text-[9px] font-black uppercase text-muted-foreground tracking-tighter leading-none">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-8 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground">Combat Streak</span>
                  <span className="text-sm font-black text-foreground">{user.streak} Matches</span>
                </div>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full shadow-lg shadow-primary/20" style={{ width: `${Math.min(user.streak * 20, 100)}%` }} />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground">Skill Tier Progress</span>
                  <span className="text-sm font-black text-foreground">{user.rating % 100}% towards next</span>
                </div>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full shadow-lg shadow-amber-200" style={{ width: `${user.rating % 100}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Standings Table ── */}
        <section className="glass-card rounded-[32px] p-8 overflow-hidden relative">
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5" /> High Rank Rivals
            </h3>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/5 border border-primary/10">
              <Users className="w-3 h-3 text-primary" />
              <span className="text-[10px] font-black text-primary uppercase tracking-widest">Global Arena</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {rankingList.map((rival, idx) => (
              <div key={rival.id} className={`flex items-center justify-between p-5 rounded-[28px] transition-all border ${rival.id === user.id ? 'bg-primary border-primary text-white shadow-xl shadow-primary/20 scale-105' : 'bg-secondary/30 border-border hover:border-primary/20'}`}>
                <div className="flex items-center gap-4">
                  <span className={`text-xs font-black ${rival.id === user.id ? 'text-white/50' : 'text-muted-foreground'} w-4`}>{idx + 1}</span>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${rival.id === user.id ? 'bg-white/10' : 'bg-background'}`}>
                    {rival.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-bold truncate max-w-[100px]">{rival.username}</p>
                    <p className={`text-[9px] font-black uppercase tracking-widest ${rival.id === user.id ? 'text-white/70' : 'text-muted-foreground'}`}>
                      {getRatingTier(rival.rating).label}
                    </p>
                  </div>
                </div>
                <p className="text-sm font-black">{rival.rating}</p>
              </div>
            ))}
          </div>
          
          <Link href="/dashboard" className="flex items-center justify-between w-full mt-8 p-5 rounded-[24px] bg-secondary border border-border hover:bg-muted transition-all text-xs font-black uppercase tracking-[0.1em] group">
            <span className="text-muted-foreground group-hover:text-primary transition-colors">Return to General Dashboard</span>
            <ChevronRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
          </Link>
        </section>

      </main>
    </div>
  );
}
