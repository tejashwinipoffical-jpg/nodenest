'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Trophy, Swords, Zap, Target, Star, BarChart3, Clock, 
  ChevronRight, ArrowUpRight, TrendingUp, Medal, History,
  Users, Share2, Plus, Loader2, Layout
} from 'lucide-react';
import InviteFriendModal from '@/components/InviteFriendModal';
import { supabase } from '@/lib/supabase';
import { getRatingTier } from '@/lib/mock-data';
import { Profile } from '@/lib/types';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<Profile | null>(null);
  const [leaderboard, setLeaderboard] = useState<Profile[]>([]);
  const [recentMatches, setRecentMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  useEffect(() => {
    async function getDashboardData() {
      const localId = localStorage.getItem('codeduel_id');
      
      if (!localId) {
        router.push('/login');
        return;
      }

      // Fetch User, Leaderboard, and Recent Matches
      const [userRes, leaderboardRes, matchesRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', localId).single(),
        supabase.from('profiles').select('*').order('rating', { ascending: false }).limit(5),
        supabase.from('match_results').select('*, winner:profiles!winner_id(username, avatar)').order('created_at', { ascending: false }).limit(3)
      ]);

      if (userRes.error) {
        console.error('Error fetching profile:', userRes.error);
        localStorage.removeItem('codeduel_id');
        router.push('/login');
      } else {
        setUser(userRes.data);
      }

      if (!leaderboardRes.error && leaderboardRes.data) {
        setLeaderboard(leaderboardRes.data);
      }

      if (!matchesRes.error && matchesRes.data) {
        setRecentMatches(matchesRes.data);
      }

      setLoading(false);
    }

    getDashboardData();
  }, [router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-sm font-black text-muted-foreground uppercase tracking-widest">Synthesizing Stats...</p>
        </div>
      </div>
    );
  }

  const tier = getRatingTier(user.rating);

  return (
    <div className="min-h-screen bg-background dot-bg pb-20 selection:bg-primary/10">
      {/* Top Banner / Nav */}
      <nav className="sticky top-0 z-30 flex items-center justify-between px-8 py-4 glass border-b border-border mb-8">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform shadow-sm">
              <Swords className="w-5 h-5 text-white" />
            </div>
            <span className="font-black text-foreground">CodeDuel</span>
          </Link>
        </div>
        
        <div className="flex items-center gap-6">
          <Link href="/dashboard/problems" className="hidden md:flex items-center gap-2 text-xs font-black text-muted-foreground hover:text-primary transition-all uppercase tracking-widest">
            <Layout className="w-4 h-4" /> Manage Problems
          </Link>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary border border-border">
            <div className={`w-2 h-2 rounded-full ${tier.color.replace('text-', 'bg-')}`} />
            <span className="text-xs font-bold text-foreground uppercase tracking-wider">{tier.label}</span>
          </div>
          <Link href="/queue" className="pro-btn px-5 py-2 rounded-full text-xs font-bold flex items-center gap-2">
            Find Match <Zap className="w-3.5 h-3.5 fill-current" />
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Left Column: Stats */}
        <div className="md:col-span-8 space-y-8">
          
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => {
                const link = `${window.location.origin}/arena/friend-${Math.random().toString(36).substring(7)}`;
                navigator.clipboard.writeText(link);
                toast.success('Duel Link Copied!', {
                  description: 'Send it to your friend to start! ⚔️',
                  icon: '🔗'
                });
              }}
              className="flex-1 glass-card rounded-[32px] p-8 border-2 border-primary/20 bg-primary/5 flex items-center justify-between group hover:bg-primary/10 transition-all text-left"
            >
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-[24px] bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                  <Copy className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-foreground">Fast Invite</h3>
                  <p className="text-sm text-primary font-bold">Copy Link & Send</p>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 text-primary" />
            </button>

            <Link href="/queue" className="flex-1 glass-card rounded-[32px] p-8 flex items-center justify-between group hover:border-emerald-500/30 transition-all text-left">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-[24px] bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500">
                  <Zap className="w-8 h-8 fill-current" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-foreground">Random Duel</h3>
                  <p className="text-sm text-muted-foreground font-medium">Match with global rivals</p>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 text-muted-foreground group-hover:text-emerald-500 transition-colors" />
            </Link>
          </div>

          {/* User Hero */}
          <div className="glass-card rounded-[40px] p-10 flex flex-col sm:flex-row items-center gap-10 relative overflow-hidden group hover:border-primary/20 transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px] pointer-events-none group-hover:w-40 group-hover:h-40 transition-all" />
            
            <Link href="/profile" className="relative shrink-0">
              <div className="w-32 h-32 rounded-3xl bg-secondary flex items-center justify-center text-5xl border-4 border-background shadow-xl hover:rotate-3 transition-transform">
                {user.avatar}
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary rounded-2xl flex items-center justify-center text-white border-4 border-background shadow-lg">
                <Star className="w-5 h-5 fill-current" />
              </div>
            </Link>

            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-4xl font-black text-foreground mb-1">{user.username}</h1>
              <p className="text-muted-foreground font-medium mb-6">Mastery Level: {getRatingTier(user.rating).label}</p>
              
              <div className="flex flex-wrap justify-center sm:justify-start gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-2xl border border-primary/10">
                  <Trophy className="w-4 h-4 text-primary" />
                  <span className="text-sm font-black text-foreground">{user.rating} ELO</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/5 rounded-2xl border border-amber-500/10">
                  <Zap className="w-4 h-4 text-amber-500 fill-current" />
                  <span className="text-sm font-black text-foreground">{user.streak} Streak</span>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { label: 'Duels Attended', value: user.wins + user.losses, icon: Swords, color: 'text-primary' },
              { label: 'Victories', value: user.wins, icon: Target, color: 'text-emerald-500' },
              { label: 'Combat Rank', value: '#124', icon: BarChart3, color: 'text-amber-500' },
            ].map((stat, i) => (
              <div key={i} className="glass-card rounded-3xl p-6 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-muted-foreground mb-0.5">{stat.label}</p>
                  <p className="text-xl font-black text-foreground leading-none">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Leaderboard & Matches */}
        <div className="md:col-span-4 space-y-8">
          {/* Leaderboard */}
          <section className="glass-card rounded-[32px] p-8 border-primary/10">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                <Trophy className="w-3.5 h-3.5" /> High Standings
              </h3>
              <Link href="/leaderboard" className="text-[10px] font-black text-primary hover:underline">GLOBAL ↗</Link>
            </div>
            
            <div className="space-y-6">
              {leaderboard.length > 0 ? (
                leaderboard.map((item, idx) => (
                  <div key={item.id} className={`flex items-center justify-between p-3 rounded-2xl transition-all ${item.id === user.id ? 'bg-primary/5 border border-primary/10 shadow-sm' : 'hover:bg-secondary/50'}`}>
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-black text-muted-foreground w-3">{idx + 1}</span>
                      <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center text-xl">{item.avatar}</div>
                      <div>
                        <p className="text-sm font-bold text-foreground truncate max-w-[100px]">{item.username}</p>
                        <p className={`text-[9px] font-black uppercase tracking-widest ${getRatingTier(item.rating).color}`}>{getRatingTier(item.rating).label}</p>
                      </div>
                    </div>
                    <p className="text-sm font-black text-foreground">{item.rating}</p>
                  </div>
                ))
              ) : (
                <div className="py-10 text-center opacity-40">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                  <p className="text-[10px] font-bold uppercase tracking-widest">Awaiting Rivals...</p>
                </div>
              )}
            </div>
          </section>

          {/* Recent Matches */}
          <section className="glass-card rounded-[32px] p-8">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground mb-8 flex items-center gap-2">
              <History className="w-3.5 h-3.5" /> Recent Combat
            </h3>
            
            <div className="space-y-6">
              {recentMatches.length > 0 ? (
                recentMatches.map((match, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-secondary/30">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center text-lg">{match.winner?.avatar || '👤'}</div>
                        <div>
                          <p className="text-xs font-bold text-foreground">{match.winner?.username || 'Guest'} won</p>
                          <p className="text-[9px] text-muted-foreground">Against rival • 2m ago</p>
                        </div>
                     </div>
                     <div className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-500 text-[10px] font-black">WIN</div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center bg-secondary/30 rounded-2xl border-2 border-dashed border-border flex flex-col items-center">
                  <Clock className="w-6 h-6 text-muted-foreground/30 mb-2" />
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">No Recent Matches</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      <InviteFriendModal isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} />
    </div>
  );
}
