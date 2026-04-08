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
import { MOCK_RECENT_MATCHES, MOCK_LEADERBOARD, getRatingTier } from '@/lib/mock-data';
import { Profile } from '@/lib/types';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isInviteOpen, setIsInviteOpen] = useState(false);

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
        localStorage.removeItem('codeduel_id'); // Clear invalid ID
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
        
        {/* ── Left Column: Profile & Stats ── */}
        <div className="md:col-span-8 space-y-8">
          
          {/* Challenge & Quick Match Action Card */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => setIsInviteOpen(true)}
              className="flex-1 glass-card rounded-[32px] p-8 flex items-center justify-between group hover:border-primary/30 transition-all text-left"
            >
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-[24px] bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
                  <Share2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-foreground">Invite Friend</h3>
                  <p className="text-sm text-muted-foreground font-medium">Create a private duel link</p>
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                <Plus className="w-6 h-6" />
              </div>
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
              <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-muted-foreground group-hover:text-emerald-500 transition-colors">
                <ChevronRight className="w-6 h-6" />
              </div>
            </Link>
          </div>

          {/* Profile Header Card */}
          <div className="glass-card rounded-3xl p-8 flex flex-col sm:flex-row items-center gap-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px] pointer-events-none" />
            
            <Link href="/profile" className="relative group/avatar">
              <div className="w-32 h-32 rounded-3xl bg-secondary flex items-center justify-center text-5xl border-4 border-background shadow-xl group-hover/avatar:scale-105 transition-transform duration-300">
                {user.avatar}
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary rounded-2xl flex items-center justify-center text-white border-4 border-background shadow-lg group-hover/avatar:rotate-12 transition-transform">
                <Star className="w-5 h-5 fill-current" />
              </div>
            </Link>

            <div className="flex-1 text-center sm:text-left">
              <Link href="/profile" className="inline-flex items-center gap-2 group/title">
                <h1 className="text-4xl font-black text-foreground mb-1 group-hover/title:text-primary transition-colors">
                  {user.username}
                </h1>
                <ChevronRight className="w-6 h-6 text-primary opacity-0 -translate-x-2 group-hover/title:opacity-100 group-hover/title:translate-x-0 transition-all" />
              </Link>
              <p className="text-muted-foreground font-medium mb-4">Level {Math.floor(user.rating / 100)} Duelist</p>
              
              <div className="flex flex-wrap justify-center sm:justify-start gap-4">
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/5 border border-primary/10">
                  <Trophy className="w-4 h-4 text-primary" />
                  <span className="text-sm font-bold text-foreground">{user.rating} ELO</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500/5 border border-orange-500/10">
                  <TrendingUp className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-bold text-foreground">
                    {Math.round((user.wins / (user.wins + user.losses + user.draws)) * 100)}% Win Rate
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: <Target className="w-5 h-5 text-indigo-500" />, label: 'Accuracy', value: '88%' },
              { icon: <Clock className="w-5 h-5 text-amber-500" />, label: 'Avg Time', value: '12m' },
              { icon: <Star className="w-5 h-5 text-emerald-500" />, label: 'Streak', value: user.streak },
              { icon: <BarChart3 className="w-5 h-5 text-rose-500" />, label: 'Duels', value: user.wins + user.losses + user.draws },
            ].map((s, i) => (
              <div key={i} className="glass-card rounded-2xl p-6 text-center hover:scale-[1.02] transition-transform cursor-pointer">
                <div className="flex justify-center mb-3">
                  <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center shadow-sm">
                    {s.icon}
                  </div>
                </div>
                <p className="text-2xl font-black text-foreground">{s.value}</p>
                <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Recent Matches */}
          <div className="glass-card rounded-3xl overflow-hidden">
            <div className="px-8 py-6 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground">
                  <History className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-black">Match History</h2>
              </div>
              <button className="text-sm font-bold text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
                Full Log <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
            
            <div className="divide-y divide-border">
              {MOCK_RECENT_MATCHES.map((match) => (
                <div key={match.id} className="px-8 py-5 flex items-center justify-between hover:bg-secondary/30 transition-colors group">
                  <div className="flex items-center gap-6">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${match.result === 'win' ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                      {match.result === 'win' ? <Trophy className="w-6 h-6 text-white" /> : <Swords className="w-6 h-6 text-white opacity-40" />}
                    </div>
                    <div>
                      <p className="font-bold text-foreground">vs {match.opponent}</p>
                      <p className="text-xs text-muted-foreground">Difficulty: {match.difficulty} • {match.problem_title}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className={`text-lg font-black ${match.result === 'win' ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {match.result === 'win' ? '+' : ''}{match.rating_delta}
                    </p>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">{new Date(match.played_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right Column: Leaderboard ── */}
        <div className="md:col-span-4 space-y-8">
          <div className="glass-card rounded-3xl overflow-hidden h-full">
            <div className="px-8 py-6 border-b border-border bg-gradient-to-br from-background to-secondary/50">
              <div className="flex items-center gap-3 mb-1">
                <Medal className="w-5 h-5 text-amber-500" />
                <h2 className="text-xl font-black italic tracking-tighter uppercase">Leaderboard</h2>
              </div>
              <p className="text-xs text-muted-foreground font-medium">Top 50 Masters Globally</p>
            </div>

            <div className="p-4 space-y-2">
              {MOCK_LEADERBOARD.map((item) => (
                <div 
                  key={item.profile.id} 
                  className={`flex items-center justify-between p-4 rounded-2xl transition-all ${item.profile.id === user.id ? 'bg-primary/5 border border-primary/20 shadow-sm' : 'hover:bg-secondary/50'}`}
                >
                  <div className="flex items-center gap-4">
                    <span className={`text-sm font-black w-4 ${item.rank <= 3 ? 'text-primary' : 'text-muted-foreground'}`}>{item.rank}</span>
                    <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-xl shadow-inner">{item.profile.avatar}</div>
                    <div>
                      <p className="text-sm font-bold text-foreground leading-none mb-1">{item.profile.username}</p>
                      <p className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">{getRatingTier(item.profile.rating).label}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-foreground">{item.profile.rating}</p>
                    <p className="text-[10px] text-muted-foreground">ELO</p>
                  </div>
                </div>
              ))}
              
              <Link href="/leaderboard" className="block text-center mt-6 p-4 rounded-2xl bg-secondary/50 text-xs font-bold text-primary hover:bg-secondary transition-all">
                VIEW GLOBAL RANKINGS
              </Link>
            </div>
          </div>
        </div>
      </div>
      <InviteFriendModal 
        isOpen={isInviteOpen} 
        onClose={() => setIsInviteOpen(false)} 
      />
    </div>
  );
}
