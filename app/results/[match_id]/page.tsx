'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Swords, Trophy, XCircle, CheckCircle, TrendingUp, TrendingDown,
  ChevronRight, Brain, Clock, Zap, Code2, Loader2, RefreshCw,
  ChevronLeft, BarChart3, Star, ArrowRight
} from 'lucide-react';
import { MOCK_CURRENT_USER, MOCK_PROFILES, MOCK_PROBLEMS, getRatingTier } from '@/lib/mock-data';
import { AIFeedback } from '@/lib/types';

type Outcome = 'win' | 'loss';

export default function ResultsPage() {
  const params = useParams();
  const matchId = params.match_id as string;
  void matchId;

  const [outcome] = useState<Outcome>(Math.random() > 0.4 ? 'win' : 'loss');
  const [ratingDelta] = useState(outcome === 'win' ? Math.floor(Math.random() * 20) + 8 : -(Math.floor(Math.random() * 18) + 6));
  const [feedback, setFeedback] = useState<AIFeedback | null>(null);
  const [loadingFeedback, setLoadingFeedback] = useState(true);
  const [showCode, setShowCode] = useState(false);

  const user = MOCK_CURRENT_USER;
  const opponent = MOCK_PROFILES[Math.floor(Math.random() * MOCK_PROFILES.length)];
  const problem = MOCK_PROBLEMS[Math.floor(Math.random() * MOCK_PROBLEMS.length)];
  const userTier = getRatingTier(user.rating);
  const newRating = user.rating + ratingDelta;

  const passedCount = outcome === 'win' ? problem.hidden_test_cases.length : Math.floor(problem.hidden_test_cases.length * 0.6);
  const totalCount = problem.hidden_test_cases.length;

  useEffect(() => {
    const fetchFeedback = async () => {
      setLoadingFeedback(true);
      try {
        const res = await fetch('/api/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ passed_all: outcome === 'win' }),
        });
        const data = await res.json();
        setFeedback(data.feedback);
      } catch {
        setFeedback({
          summary: `Outstanding performance! Your solution for **${problem.title}** was ${outcome === 'win' ? 'perfectly executed' : 'partially correct'}.`,
          time_complexity: 'O(n)',
          space_complexity: 'O(n)',
          strengths: ['Efficient algorithm choice', 'Clean variable naming', 'Handles edge cases well'],
          improvements: ['Add input validation for nulls', 'Consider single-pass optimization'],
          optimized_approach: `// Optimal solution\nfunction solve(n) {\n  return n ? n.map(x => x*2) : [];\n}`,
        });
      } finally {
        setLoadingFeedback(false);
      }
    };
    fetchFeedback();
  }, [outcome, problem.title]);

  return (
    <div className="min-h-screen bg-background dot-bg pb-20 selection:bg-primary/10 transition-colors">
      {/* Background Ambience */}
      <div className={`fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full blur-[150px] pointer-events-none ${outcome === 'win' ? 'bg-primary/10' : 'bg-rose-500/5'}`} />

      {/* Nav */}
      <nav className="relative z-20 flex items-center justify-between px-8 py-4 glass border-b border-border mb-8">
        <Link href="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-all">
          <ChevronLeft className="w-4 h-4" />
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-md">
            <Swords className="w-5 h-5 text-white" />
          </div>
          <span className="font-black text-foreground">CodeDuel</span>
        </Link>
        <Link
          href="/queue"
          className="pro-btn flex items-center gap-2 px-6 py-2 rounded-full text-xs font-bold"
        >
          <RefreshCw className="w-3.5 h-3.5" /> REMATCH
        </Link>
      </nav>

      <div className="relative z-10 max-w-5xl mx-auto px-6 space-y-8 animate-fade-in-up">
        {/* ── Outcome Banner ── */}
        <div className={`rounded-[40px] p-12 text-center relative overflow-hidden glass-card ${outcome === 'win' ? 'border-primary/20 shadow-xl shadow-primary/5' : 'border-rose-100 shadow-xl shadow-rose-500/5'}`}>
          <div className="relative z-10">
            <div className="text-7xl mb-6 animate-bounce">{outcome === 'win' ? '🏆' : '💀'}</div>
            <h1 className={`text-6xl font-black mb-3 tracking-tighter ${outcome === 'win' ? 'text-primary' : 'text-rose-600'}`}>
              {outcome === 'win' ? 'VICTORY!' : 'DEFEAT'}
            </h1>
            <p className="text-muted-foreground text-lg mb-10 font-medium">
              {outcome === 'win'
                ? `You conquered "${problem.title}" in record time!`
                : `${opponent.username} was faster this time.`}
            </p>

            {/* VS Row */}
            <div className="flex items-center justify-center gap-12 mb-10">
              <div className="text-center group">
                <div className={`w-24 h-24 rounded-3xl flex items-center justify-center text-4xl shadow-2xl transition-transform group-hover:scale-105 border-4 border-white ${outcome === 'win' ? 'bg-primary text-white' : 'bg-secondary'}`}>
                  {user.avatar}
                </div>
                <p className="font-black mt-3 text-foreground">{user.username}</p>
                <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{userTier.label}</span>
              </div>

              <div className="text-4xl font-black text-secondary-foreground opacity-20 italic">VS</div>

              <div className="text-center group">
                <div className={`w-24 h-24 rounded-3xl flex items-center justify-center text-4xl shadow-2xl transition-transform group-hover:scale-105 border-4 border-white ${outcome === 'loss' ? 'bg-primary text-white' : 'bg-secondary'}`}>
                  {opponent.avatar}
                </div>
                <p className="font-black mt-3 text-foreground">{opponent.username}</p>
                <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{getRatingTier(opponent.rating).label}</span>
              </div>
            </div>

            {/* Rating Delta */}
            <div className="inline-flex items-center gap-4 px-8 py-5 rounded-[24px] bg-secondary border border-border pro-shadow">
              {ratingDelta > 0
                ? <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center"><TrendingUp className="w-6 h-6 text-emerald-600" /></div>
                : <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center"><TrendingDown className="w-6 h-6 text-rose-600" /></div>}
              <div className="text-left">
                <p className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">Rating Adjust</p>
                <p className={`text-2xl font-black ${ratingDelta > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {ratingDelta > 0 ? '+' : ''}{ratingDelta} <span className="text-muted-foreground/30 mx-2">→</span> <span className="text-foreground">{newRating} ELO</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Match Stats Grid ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: <CheckCircle className="w-5 h-5 text-emerald-500" />, label: 'Accuracy', value: `${passedCount}/${totalCount}`, sub: 'Tests Passed' },
            { icon: <Clock className="w-5 h-5 text-amber-500" />, label: 'Time', value: outcome === 'win' ? '12:34' : '30:00', sub: 'Duration' },
            { icon: <Zap className="w-5 h-5 text-primary" />, label: 'Speed', value: '4ms', sub: 'Avg Execution' },
            { icon: <BarChart3 className="w-5 h-5 text-indigo-500" />, label: 'Approach', value: outcome === 'win' ? 'Optimal' : 'Robust', sub: 'Algorithm' },
          ].map((s, i) => (
            <div key={i} className="glass-card rounded-3xl p-6 text-center hover:scale-[1.02] transition-transform">
              <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center mx-auto mb-4">{s.icon}</div>
              <p className="text-2xl font-black text-foreground mb-1">{s.value}</p>
              <div className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* ── AI Analysis Section ── */}
        <div className="glass-card rounded-[40px] overflow-hidden pro-shadow">
          <div className="px-10 py-8 border-b border-border bg-gradient-to-r from-background to-secondary/30 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500 shadow-lg shadow-indigo-200 flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black">AI Post-Match Analysis</h2>
                <p className="text-xs font-bold text-muted-foreground tracking-wide uppercase">Insight from Claude-3.5</p>
              </div>
            </div>
            {loadingFeedback && <Loader2 className="w-6 h-6 text-primary animate-spin" />}
          </div>

          <div className="p-10 space-y-10">
            {loadingFeedback ? (
               <div className="space-y-4">
                  {[90, 70, 85].map(w => <div key={w} className="h-4 bg-secondary rounded-full animate-pulse" style={{ width: `${w}%` }} />)}
               </div>
            ) : feedback ? (
              <>
                <div className="bg-primary/5 rounded-3xl p-8 border border-primary/10 relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-8 opacity-5"><Brain className="w-24 h-24" /></div>
                   <p className="text-lg text-foreground font-medium leading-relaxed italic">"{feedback.summary}"</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                          <h3 className="text-sm font-black uppercase tracking-widest text-emerald-600">Key Strengths</h3>
                        </div>
                        <ul className="space-y-3">
                          {feedback.strengths.map((s, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm font-medium text-muted-foreground">
                              <span className="text-emerald-500 font-bold">+</span> {s}
                            </li>
                          ))}
                        </ul>
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                          <TrendingUp className="w-4 h-4 text-amber-500" />
                          <h3 className="text-sm font-black uppercase tracking-widest text-amber-600">Areas for Growth</h3>
                        </div>
                        <ul className="space-y-3">
                          {feedback.improvements.map((s, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm font-medium text-muted-foreground">
                              <span className="text-amber-500 font-bold">→</span> {s}
                            </li>
                          ))}
                        </ul>
                    </div>
                  </div>

                  <div className="glass-card rounded-[32px] p-8 border-border/50">
                    <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-6">Complexity Report</h3>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-2xl border border-border">
                        <span className="text-xs font-bold text-muted-foreground uppercase">Time Complexity</span>
                        <span className="font-mono font-black text-primary">{feedback.time_complexity}</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-2xl border border-border">
                        <span className="text-xs font-bold text-muted-foreground uppercase">Space Complexity</span>
                        <span className="font-mono font-black text-primary">{feedback.space_complexity}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {feedback.optimized_approach && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground ml-1">Pro Optimization</h3>
                    <div className="rounded-3xl bg-slate-950 p-8 border border-white/5 shadow-2xl overflow-hidden relative group">
                      <div className="absolute top-4 right-4 text-[10px] font-mono text-white/20 uppercase">REFERENCE CODE</div>
                      <pre className="text-emerald-400 font-mono text-sm leading-relaxed overflow-x-auto">{feedback.optimized_approach}</pre>
                    </div>
                  </div>
                )}
              </>
            ) : null}
          </div>
        </div>

        {/* ── Footer CTAs ── */}
        <div className="flex flex-col sm:flex-row gap-6 pt-10">
          <Link href="/queue" className="pro-btn flex-1 py-6 rounded-3xl text-lg font-black flex items-center justify-center gap-3 shadow-2xl shadow-primary/30">
            <Swords className="w-6 h-6" /> PLAY NEXT ROUND
          </Link>
          <Link href="/dashboard" className="flex-1 py-6 rounded-3xl bg-secondary border border-border text-foreground font-black text-lg hover:bg-secondary/80 transition-all flex items-center justify-center gap-3">
            <Trophy className="w-6 h-6 text-amber-500" /> BACK TO DASHBOARD <ArrowRight className="w-5 h-5 text-muted-foreground" />
          </Link>
        </div>
      </div>
    </div>
  );
}
