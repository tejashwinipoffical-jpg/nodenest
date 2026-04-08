'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Timer, Swords, Zap, CheckCircle, XCircle, ChevronLeft, 
  Settings, Play, Send, Layout, MessageSquare, Info, 
  Code2, Loader2, Maximize2, AlertCircle, Trophy, Users, Share2
} from 'lucide-react';
import ArenaSettingsModal from '@/components/ArenaSettingsModal';
import { supabase } from '@/lib/supabase';
import { MOCK_PROBLEMS, MOCK_PROFILES, getRatingTier, DEFAULT_STUBS } from '@/lib/mock-data';
import { Language, TestResult, SubmissionStatus, Problem, Profile } from '@/lib/types';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false, loading: () => (
  <div className="flex-1 flex items-center justify-center bg-secondary/50">
    <Loader2 className="w-8 h-8 text-primary animate-spin" />
  </div>
) });

type RunMode = 'run' | 'submit';
type ActivePanel = 'description' | 'results';

export default function ArenaPage() {
  const params = useParams();
  const router = useRouter();
  const matchId = params.match_id as string;

  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [opponent, setOpponent] = useState<Profile>(MOCK_PROFILES[0]);
  const [language, setLanguage] = useState<Language>('javascript');
  const [code, setCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(1800); // 30 mins
  const [isRunning, setIsRunning] = useState(false);
  const [activePanel, setActivePanel] = useState<ActivePanel>('description');
  const [runResults, setRunResults] = useState<TestResult[]>([]);
  const [passedCount, setPassedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>('idle');
  const [winnerDeclared, setWinnerDeclared] = useState(false);
  const [opponentProgress] = useState(Math.floor(Math.random() * 40));
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);

  // Settings state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editorSettings, setEditorSettings] = useState({
    fontSize: 14,
    theme: 'vs-light' as const,
    minimap: false,
  });

  const [isGenerating, setIsGenerating] = useState(false);

  // Socket & Friend Duel state
  const [socket, setSocket] = useState<Socket | null>(null);
  const [lobbyStatus, setLobbyStatus] = useState<'lobby' | 'active'>(matchId.startsWith('friend-') ? 'lobby' : 'active');
  const [connectedOpponent, setConnectedOpponent] = useState<Profile | null>(null);

  useEffect(() => {
    async function initArena() {
      const localId = localStorage.getItem('codeduel_id');
      if (!localId) {
        router.push('/login');
        return;
      }

      // Fetch Profile via Open DB ID
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', localId)
        .single();
      
      if (profile) {
        setCurrentUser(profile);
      } else {
        localStorage.removeItem('codeduel_id');
        router.push('/login');
        return;
      }

      // ── AI Problem Generation Logic ──
      setIsGenerating(true);
      try {
        const genResponse = await fetch('/api/ai/generate-problem', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ difficulty: 'Medium' }) // Tailor to user rank later
        });
        const genData = await genResponse.json();
        
        if (genData.error) {
          console.warn('AI Gen failed, falling back to DB/Mock:', genData.error);
          const { data: dbProblems } = await supabase.from('problems').select('*');
          setProblem(dbProblems?.[0] || MOCK_PROBLEMS[0]);
        } else {
          setProblem(genData);
        }
      } catch (err) {
        console.error('Problem Generation failed:', err);
        setProblem(MOCK_PROBLEMS[0]);
      } finally {
        setIsGenerating(false);
      }
    }

    initArena();
  }, [router]);

  useEffect(() => {
    if (!currentUser) return;
    
    // Connect to Production Socket Server or fall back to local
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || '';
    const newSocket = io(socketUrl, {
      path: '/socket.io',
      transports: ['websocket', 'polling']
    });

    setSocket(newSocket);
    
    // Join room directly
    newSocket.emit('room:join', { roomId: matchId, profile: currentUser });

    newSocket.on('room:matched', (data: { players: Profile[], isStarting: boolean }) => {
      if (data.isStarting) {
        const friend = data.players.find((p: Profile) => p.id !== currentUser.id) || MOCK_PROFILES[0];
        setConnectedOpponent(friend);
        setLobbyStatus('active');
        toast.success(`${friend.username} joined the arena! Get ready!`, {
          icon: '⚔️',
          description: 'A lively duel is about to begin.',
        });
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [matchId, currentUser]);

  const activeOpponent = connectedOpponent || opponent;

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (problem) {
      const stub = DEFAULT_STUBS[problem.id as keyof typeof DEFAULT_STUBS]?.[language] || DEFAULT_STUBS.default[language];
      setCode(stub);
    }
  }, [problem, language]);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const runCode = useCallback(async (mode: RunMode) => {
    if (!problem || !code.trim() || isRunning) return;
    setIsRunning(true);
    setActivePanel('results');
    setSubmissionStatus('running');

    const testCases = mode === 'run'
      ? problem.examples.map((e) => ({ input: e.input, expected_output: e.output ?? '' }))
      : problem.hidden_test_cases.map((tc) => ({ input: tc.input, expected_output: tc.expected_output ?? '' }));

    try {
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language,
          test_cases: mode === 'run' ? testCases : problem.hidden_test_cases,
        }),
      });

      const data = await response.json();
      setRunResults(data.results ?? []);
      setPassedCount(data.passed_count ?? 0);
      setTotalCount(data.total_count ?? testCases.length);
      
      if (mode === 'submit') {
        if (data.success) {
          setSubmissionStatus('passed');
          setWinnerDeclared(true);
          toast.success('All test cases passed! Analyzing code with AI...', {
            icon: '🧠',
          });

          // ── Call Claude AI Analysis ──
          try {
            const aiResponse = await fetch('/api/ai/analyze', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ code, problem, language, results: data.results }),
            });
            const aiData = await aiResponse.json();
            const analysisText = aiData.analysis;
            setAiAnalysis(analysisText);
            setActivePanel('results'); // Switch to results/AI tab

            // ── Persist Result to DB ──
            if (currentUser) {
              await supabase.from('match_results').insert([{
                room_id: undefined, // In MVP we use matchId
                winner_id: currentUser.id,
                loser_id: connectedOpponent?.id || null,
                win_reason: 'All test cases passed.',
              }]);

              // Update user stats
              await supabase.from('profiles')
                .update({ 
                  wins: currentUser.wins + 1,
                  rating: currentUser.rating + 20,
                  streak: currentUser.streak + 1
                })
                .eq('id', currentUser.id);
            }
          } catch (aiErr) {
            console.error('AI Analysis/Persistence failed:', aiErr);
          }

          if (timerRef.current) clearInterval(timerRef.current);
          setTimeout(() => router.push(`/results/${matchId}`), 2500);
        } else {
          setSubmissionStatus('failed');
          toast.error('Some test cases failed. Keep debugging!');
        }
      } else {
        setSubmissionStatus('idle');
      }
    } catch {
      setRunResults([{ test_index: 0, input: '', expected: '', actual: 'Network error', passed: false }]);
      setSubmissionStatus('error');
    } finally {
      setIsRunning(false);
    }
  }, [problem, code, language, isRunning, winnerDeclared, matchId, router]);

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 overflow-hidden relative">
        <div className="absolute inset-0 grid-bg-light opacity-40 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 flex flex-col items-center gap-8 max-w-sm text-center"
        >
          <div className="relative">
            <div className="w-40 h-40 rounded-[48px] bg-secondary flex items-center justify-center relative z-10 pro-shadow">
              <div className="relative">
                 <Swords className="w-20 h-20 text-primary animate-float" />
                 <Zap className="absolute -top-4 -right-4 w-12 h-12 text-primary fill-current animate-pulse" />
              </div>
            </div>
            {/* Spinning ring decorative */}
            <div className="absolute inset-0 border-4 border-primary/20 rounded-[48px] animate-spin-slow" />
          </div>

          <div className="space-y-4">
            <h2 className="text-4xl font-black text-foreground tracking-tighter">AI is <span className="text-primary italic">Forging</span></h2>
            <p className="text-muted-foreground font-medium leading-relaxed">
              Claude is engineering a unique, high-fidelity coding challenge just for this duel. Please wait...
            </p>
          </div>

          <div className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary/5 border border-primary/10 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
            <Loader2 className="w-3 h-3 animate-spin" /> System Engineering Active
          </div>
        </motion.div>
      </div>
    );
  }

  if (!problem) return null;

  return (
    <div className="flex flex-col h-screen bg-background selection:bg-primary/10 overflow-hidden relative">
      {/* ── Waiting Lobby Overlay ── */}
      <AnimatePresence>
        {lobbyStatus === 'lobby' && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[60] bg-white flex flex-col items-center justify-center p-8 text-center"
          >
            <div className="absolute inset-0 grid-bg-light opacity-40 pointer-events-none" />
            
            <div className="relative z-10 max-w-md space-y-8 animate-fade-in-up">
              <div className="relative inline-block">
                <div className="w-32 h-32 rounded-[40px] bg-primary/5 flex items-center justify-center text-6xl shadow-inner border-2 border-primary/10">
                  <Users className="w-16 h-16 text-primary animate-pulse" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-border">
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                </div>
              </div>

              <div className="space-y-3">
                <h2 className="text-4xl font-black text-foreground tracking-tight">Waiting for <span className="text-primary italic">Friend</span></h2>
                <p className="text-muted-foreground font-medium leading-relaxed">
                  The match will start automatically as soon as your friend joins the arena.
                </p>
              </div>

              <div className="p-6 rounded-[32px] bg-secondary/50 border border-border space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Share your direct invite link</p>
                <div className="flex gap-2 p-2 bg-white rounded-2xl border border-border shadow-sm text-xs font-mono text-muted-foreground overflow-hidden truncate px-4 py-3">
                  {typeof window !== 'undefined' ? window.location.href : 'Loading link...'}
                </div>
                <button 
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      navigator.clipboard.writeText(window.location.href);
                    }
                  }}
                  className="w-full py-3 rounded-2xl bg-primary text-white text-xs font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                >
                  <Share2 className="w-4 h-4" /> Copy Link again
                </button>
              </div>

              <button 
                onClick={() => router.push('/dashboard')}
                className="text-sm font-bold text-muted-foreground hover:text-foreground transition-all"
              >
                Cancel & Return to Dashboard
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* ── Arena Header ── */}
      <header className="h-14 flex items-center justify-between px-6 bg-white border-b border-border z-20">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-secondary rounded-lg transition-colors group">
            <ChevronLeft className="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
          </button>
          <div className="flex items-center gap-2">
            <h1 className="font-black text-foreground tracking-tight">{problem.title}</h1>
            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
              problem.difficulty === 'Easy' ? 'bg-emerald-50 text-emerald-600' : 
              problem.difficulty === 'Medium' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
            }`}>
              {problem.difficulty}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-6 py-1.5 bg-secondary/50 rounded-full border border-border">
          <Timer className={`w-4 h-4 ${timeLeft < 300 ? 'text-rose-500 animate-pulse' : 'text-primary'}`} />
          <span className={`font-mono font-bold tabular-nums ${timeLeft < 300 ? 'text-rose-600' : 'text-foreground'}`}>
            {formatTime(timeLeft)}
          </span>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden lg:flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs font-bold leading-none">{activeOpponent.username}</p>
              <p className="text-[10px] text-muted-foreground uppercase font-black">{getRatingTier(activeOpponent.rating).label}</p>
            </div>
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-xl shadow-inner border border-border">
                {activeOpponent.avatar}
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
            </div>
            <div className="w-24 h-1.5 bg-secondary rounded-full overflow-hidden border border-border">
              <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${opponentProgress}%` }} />
            </div>
          </div>
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* ── Main Arena Content ── */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* Left Side: Problem & Results */}
        <div className="w-1/3 flex flex-col border-r border-border bg-white">
          <div className="flex border-b border-border">
            <button
              onClick={() => setActivePanel('description')}
              className={`flex-1 py-3 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${activePanel === 'description' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-muted-foreground hover:bg-secondary'}`}
            >
              <Info className="w-3.5 h-3.5" /> Problem
            </button>
            <button
              onClick={() => setActivePanel('results')}
              className={`flex-1 py-3 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${activePanel === 'results' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-muted-foreground hover:bg-secondary'}`}
            >
              <CheckCircle className="w-3.5 h-3.5" /> Results
              {passedCount > 0 && <span className="ml-1 bg-primary text-white px-1.5 py-0.5 rounded-full text-[9px]">{passedCount}</span>}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {activePanel === 'description' ? (
              <div className="space-y-8 animate-in fade-in slide-in-from-left-2 duration-300">
                <div className="flex flex-wrap gap-2">
                  <span className="px-2.5 py-1 bg-secondary rounded-lg text-xs font-bold text-muted-foreground">{problem.topic}</span>
                  {problem.supported_languages.map(l => (
                    <span key={l} className="px-2.5 py-1 bg-secondary/50 border border-border rounded-lg text-xs font-medium text-muted-foreground uppercase">{l}</span>
                  ))}
                </div>

                <div className="prose prose-sm prose-slate max-w-none">
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap">{problem.statement}</p>
                </div>

                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">Examples</h3>
                  <div className="space-y-4">
                    {problem.examples.map((ex, i) => (
                      <div key={i} className="bg-secondary/30 rounded-2xl p-4 border border-border">
                        <p className="text-[10px] font-black uppercase text-muted-foreground mb-2">Example {i + 1}</p>
                        <div className="grid gap-2">
                          <p className="text-sm font-mono"><span className="text-muted-foreground">Input:</span> {ex.input}</p>
                          <p className="text-sm font-mono"><span className="text-muted-foreground">Output:</span> {ex.output}</p>
                          {ex.explanation && <p className="text-xs text-muted-foreground italic mt-2 border-l-2 border-primary/20 pl-2">{ex.explanation}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">Constraints</h3>
                  <pre className="text-xs text-muted-foreground font-mono bg-secondary/20 p-4 rounded-xl border border-border">{problem.constraints_text}</pre>
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300 pb-10">
                {submissionStatus === 'passed' && (
                  <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-100 text-center mb-6 shadow-sm">
                    <Trophy className="w-12 h-12 text-emerald-500 mx-auto mb-4 animate-bounce" />
                    <h3 className="text-xl font-black text-emerald-800 tracking-tighter">VICTORY SECURED!</h3>
                    <p className="text-sm text-emerald-600 font-medium">All hidden test cases passed beautifully.</p>
                  </div>
                )}

                {/* ── AI Analysis Section ── */}
                {(aiAnalysis || submissionStatus === 'passed') && (
                  <div className="glass-card rounded-[32px] p-8 border-primary/20 bg-primary/5 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-white">
                        <Zap className="w-4 h-4 fill-current" />
                      </div>
                      <h3 className="text-sm font-black uppercase tracking-widest text-primary">AI Judging Analysis</h3>
                    </div>
                    
                    {!aiAnalysis ? (
                      <div className="flex items-center gap-3 py-4">
                        <Loader2 className="w-5 h-5 text-primary animate-spin" />
                        <p className="text-xs font-bold text-muted-foreground animate-pulse uppercase tracking-widest">Claude is analyzing your logic...</p>
                      </div>
                    ) : (
                      <div className="prose prose-sm prose-slate max-w-none text-foreground leading-relaxed prose-headings:text-primary prose-headings:font-black prose-headings:tracking-tight prose-strong:text-foreground">
                         <div dangerouslySetInnerHTML={{ __html: aiAnalysis.replace(/\n/g, '<br/>') }} />
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Unit Test Execution</h3>
                </div>

                {runResults.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                    <Code2 className="w-12 h-12 mb-4 opacity-10" />
                    <p className="text-sm font-medium">Run your code to see results</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {runResults.map((res, i) => (
                      <div key={i} className={`rounded-2xl border ${res.passed ? 'bg-emerald-50/20 border-emerald-100/50' : 'bg-rose-50/30 border-rose-100'} p-4`}>
                        <div className="flex items-center justify-between mb-3">
                          <span className={`text-[10px] font-black uppercase tracking-widest ${res.passed ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {res.passed ? 'Test Passed' : 'Test Failed'}
                          </span>
                          <span className="text-[10px] font-mono text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-full">{res.execution_time_ms}ms</span>
                        </div>
                        <div className="grid gap-2 font-mono text-[11px]">
                          <p><span className="text-muted-foreground">Input:</span> <span className="text-foreground">{res.input}</span></p>
                          <p><span className="text-muted-foreground">Expected:</span> <span className="text-foreground">{res.expected}</span></p>
                          <p className={res.passed ? 'text-emerald-700' : 'text-rose-700'}><span className="text-muted-foreground">Actual:</span> {res.actual}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Code Editor */}
        <div className="flex-1 flex flex-col bg-secondary/10 relative">
          
          {/* Editor Header */}
          <div className="h-10 flex items-center justify-between px-4 bg-white border-b border-border shrink-0">
            <div className="flex gap-1 bg-secondary p-1 rounded-lg">
              {(['javascript', 'python', 'typescript', 'c', 'cpp'] as Language[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLanguage(l)}
                  className={`px-3 py-1 rounded-md text-[10px] font-black uppercase transition-all ${language === l ? 'bg-white text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  {l === 'javascript' ? 'JS' : l === 'typescript' ? 'TS' : l === 'python' ? 'PY' : l === 'c' ? 'C' : 'C++'}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <button className="text-muted-foreground hover:text-foreground p-1"><Maximize2 className="w-3.5 h-3.5" /></button>
              <div className="h-4 w-px bg-border mx-1" />
              <div className="text-[10px] font-black text-muted-foreground uppercase">{language} Mode</div>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            <MonacoEditor
              height="100%"
              language={language === 'typescript' ? 'typescript' : language === 'python' ? 'python' : language === 'cpp' ? 'cpp' : language === 'c' ? 'c' : 'javascript'}
              value={code}
              onChange={(val) => setCode(val ?? '')}
              theme={editorSettings.theme}
              options={{
                fontSize: editorSettings.fontSize,
                fontFamily: 'var(--font-geist-mono)',
                minimap: { enabled: editorSettings.minimap },
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                roundedSelection: true,
                padding: { top: 20 },
                automaticLayout: true,
              }}
            />
          </div>

          {/* Action Footer */}
          <div className="h-16 bg-white border-t border-border flex items-center justify-between px-6 shrink-0">
             <div className="flex items-center gap-4 text-xs">
                {submissionStatus === 'running' && (
                  <div className="flex items-center gap-2 text-primary animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="font-bold">Executing submittal...</span>
                  </div>
                )}
                {submissionStatus === 'failed' && (
                  <div className="flex items-center gap-2 text-rose-500">
                    <AlertCircle className="w-4 h-4" />
                    <span className="font-bold">Submittal Failed. Check results.</span>
                  </div>
                )}
             </div>

             <div className="flex gap-4">
               <button
                 id="arena-run-btn"
                 onClick={() => runCode('run')}
                 disabled={isRunning || winnerDeclared}
                 className="px-6 py-2.5 rounded-xl border border-border bg-white text-foreground font-bold text-sm hover:bg-secondary transition-all flex items-center gap-2 disabled:opacity-50"
               >
                 <Play className="w-4 h-4 fill-current" /> Run Logic
               </button>
               <button
                 id="arena-submit-btn"
                 onClick={() => runCode('submit')}
                 disabled={isRunning || winnerDeclared}
                 className="pro-btn px-8 py-2.5 rounded-xl text-sm font-black flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-primary/20"
               >
                 <Send className="w-4 h-4" /> SUBMIT SOLUTION
               </button>
             </div>
          </div>
        </div>
      </main>

      <ArenaSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={editorSettings}
        updateSettings={(newSettings) => setEditorSettings(prev => ({ ...prev, ...newSettings }))}
      />
    </div>
  );
}
