'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Swords, Users, Clock, Wifi, WifiOff, CheckCircle, XCircle, Zap, ChevronLeft } from 'lucide-react';
import { MOCK_CURRENT_USER, MOCK_PROFILES, getRandomProblem } from '@/lib/mock-data';

type Phase = 'lobby' | 'searching' | 'accepting' | 'redirecting';

interface MatchData {
  roomId: string;
  opponentName: string;
  opponentRating: number;
  opponentAvatar: string;
}

const ACCEPT_TIMEOUT = 15;

export default function QueuePage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('lobby');
  const [waitSeconds, setWaitSeconds] = useState(0);
  const [activePlayers] = useState(847 + Math.floor(Math.random() * 50));
  const [acceptTimer, setAcceptTimer] = useState(ACCEPT_TIMEOUT);
  const [playerAccepted, setPlayerAccepted] = useState(false);
  const [opponentAccepted, setOpponentAccepted] = useState(false);
  const [matchData, setMatchData] = useState<MatchData | null>(null);
  const [connected, setConnected] = useState(false);
  const [preferredDifficulty, setPreferredDifficulty] = useState<string>('Any');

  const waitTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const acceptTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const matchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Simulate socket connection
  useEffect(() => {
    const t = setTimeout(() => setConnected(true), 600);
    return () => clearTimeout(t);
  }, []);

  // Wait timer
  useEffect(() => {
    if (phase === 'searching') {
      waitTimerRef.current = setInterval(() => setWaitSeconds((s) => s + 1), 1000);
    } else {
      if (waitTimerRef.current) clearInterval(waitTimerRef.current);
      if (phase === 'lobby') setWaitSeconds(0);
    }
    return () => { if (waitTimerRef.current) clearInterval(waitTimerRef.current); };
  }, [phase]);

  // Simulate matchmaking: find opponent after 3-7s
  useEffect(() => {
    if (phase !== 'searching') return;
    const delay = 3000 + Math.random() * 4000;
    matchTimerRef.current = setTimeout(() => {
      const opponent = MOCK_PROFILES[Math.floor(Math.random() * MOCK_PROFILES.length)];
      setMatchData({
        roomId: `room_${Math.random().toString(36).substring(2, 8)}`,
        opponentName: opponent.username,
        opponentRating: opponent.rating,
        opponentAvatar: opponent.avatar ?? '??',
      });
      setPhase('accepting');
      setAcceptTimer(ACCEPT_TIMEOUT);
    }, delay);
    return () => { if (matchTimerRef.current) clearTimeout(matchTimerRef.current); };
  }, [phase]);

  // Accept countdown
  useEffect(() => {
    if (phase !== 'accepting') return;
    acceptTimerRef.current = setInterval(() => {
      setAcceptTimer((t) => {
        if (t <= 1) {
          clearInterval(acceptTimerRef.current!);
          setPhase('lobby');
          setMatchData(null);
          setPlayerAccepted(false);
          setOpponentAccepted(false);
          return ACCEPT_TIMEOUT;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (acceptTimerRef.current) clearInterval(acceptTimerRef.current); };
  }, [phase]);

  // Simulate opponent accepting after 2s
  useEffect(() => {
    if (phase !== 'accepting' || opponentAccepted) return;
    const t = setTimeout(() => setOpponentAccepted(true), 2000);
    return () => clearTimeout(t);
  }, [phase, opponentAccepted]);

  // Both accepted → redirect
  useEffect(() => {
    if (!playerAccepted || !opponentAccepted || !matchData) return;
    setPhase('redirecting');
    const t = setTimeout(() => router.push(`/arena/${matchData.roomId}`), 1500);
    return () => clearTimeout(t);
  }, [playerAccepted, opponentAccepted, matchData, router]);

  const handleJoinQueue = useCallback(() => {
    setPhase('searching');
  }, []);

  const handleLeaveQueue = useCallback(() => {
    if (matchTimerRef.current) clearTimeout(matchTimerRef.current);
    setPhase('lobby');
  }, []);

  const handleAccept = useCallback(() => {
    setPlayerAccepted(true);
  }, []);

  const handleDecline = useCallback(() => {
    if (acceptTimerRef.current) clearInterval(acceptTimerRef.current);
    setPhase('lobby');
    setMatchData(null);
    setPlayerAccepted(false);
    setOpponentAccepted(false);
  }, []);

  const formatWait = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="relative min-h-screen bg-[oklch(0.08_0.005_265)] flex flex-col">
      <div className="fixed inset-0 grid-bg opacity-30 pointer-events-none" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] bg-[oklch(0.55_0.25_265/6%)] rounded-full blur-[150px] pointer-events-none" />

      {/* Nav */}
      <nav className="relative z-20 flex items-center justify-between px-8 py-4 border-b border-white/5">
        <Link href="/" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
          <ChevronLeft className="w-4 h-4" />
          <Swords className="w-5 h-5 text-[oklch(0.72_0.25_265)]" />
          <span className="font-bold text-white">CodeDuel</span>
        </Link>
        <div className="flex items-center gap-2 text-sm">
          {connected
            ? <><Wifi className="w-4 h-4 text-emerald-400" /><span className="text-emerald-400">Connected</span></>
            : <><WifiOff className="w-4 h-4 text-zinc-500 animate-pulse" /><span className="text-zinc-500">Connecting…</span></>}
        </div>
      </nav>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* ── LOBBY ── */}
        {phase === 'lobby' && (
          <div className="w-full max-w-lg text-center space-y-8 animate-in fade-in duration-500">
            <div>
              <h1 className="text-4xl font-black text-white mb-2">Find a Duel</h1>
              <p className="text-zinc-400">Get matched with an opponent near your skill level</p>
            </div>

            {/* Player card */}
            <div className="glass-card rounded-2xl p-6 text-left">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[oklch(0.55_0.25_265)] to-[oklch(0.45_0.28_280)] flex items-center justify-center text-white text-xl font-black">
                  {MOCK_CURRENT_USER.avatar}
                </div>
                <div>
                  <p className="text-white font-bold text-lg">{MOCK_CURRENT_USER.username}</p>
                  <p className="text-[oklch(0.72_0.25_265)] font-mono text-sm">{MOCK_CURRENT_USER.rating} ELO</p>
                </div>
              </div>

              <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-wider">Difficulty Preference</label>
              <div className="flex gap-2">
                {['Any', 'Easy', 'Medium', 'Hard'].map((d) => (
                  <button
                    key={d}
                    onClick={() => setPreferredDifficulty(d)}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-all ${
                      preferredDifficulty === d
                        ? 'border-[oklch(0.72_0.25_265)] bg-[oklch(0.72_0.25_265/15%)] text-[oklch(0.72_0.25_265)]'
                        : 'border-white/10 text-zinc-400 hover:border-white/20'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Live stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-card rounded-xl p-4 flex items-center gap-3">
                <Users className="w-5 h-5 text-emerald-400" />
                <div>
                  <p className="text-white font-bold">{activePlayers}</p>
                  <p className="text-xs text-zinc-500">Online Now</p>
                </div>
              </div>
              <div className="glass-card rounded-xl p-4 flex items-center gap-3">
                <Clock className="w-5 h-5 text-amber-400" />
                <div>
                  <p className="text-white font-bold">~30s</p>
                  <p className="text-xs text-zinc-500">Avg Wait</p>
                </div>
              </div>
            </div>

            <button
              id="queue-join-btn"
              onClick={handleJoinQueue}
              disabled={!connected}
              className="neon-btn w-full py-4 rounded-xl text-lg font-bold text-white flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Swords className="w-5 h-5" />
              Enter Queue
            </button>
          </div>
        )}

        {/* ── SEARCHING ── */}
        {phase === 'searching' && (
          <div className="text-center space-y-10 animate-in fade-in duration-500">
            {/* Radar animation */}
            <div className="relative w-48 h-48 mx-auto">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="absolute inset-0 rounded-full border border-[oklch(0.72_0.25_265/30%)] animate-ping"
                  style={{ animationDelay: `${i * 0.4}s`, animationDuration: '2s' }}
                />
              ))}
              <div className="absolute inset-0 rounded-full border border-[oklch(0.72_0.25_265/60%)] animate-pulse-neon" />
              <div className="absolute inset-[20%] rounded-full border border-[oklch(0.72_0.25_265/40%)]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Swords className="w-12 h-12 text-[oklch(0.72_0.25_265)]" />
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-black text-white mb-2">Searching for Opponent…</h2>
              <p className="text-zinc-400">
                Difficulty: <span className="text-[oklch(0.72_0.25_265)] font-semibold">{preferredDifficulty}</span>
                {' · '}Rating range: <span className="text-[oklch(0.72_0.25_265)] font-semibold">
                  {MOCK_CURRENT_USER.rating - 100}–{MOCK_CURRENT_USER.rating + 100}
                </span>
              </p>
            </div>

            {/* Wait timer */}
            <div className="glass-card rounded-xl px-10 py-6 inline-block">
              <p className="text-4xl font-mono font-black text-white">{formatWait(waitSeconds)}</p>
              <p className="text-xs text-zinc-500 mt-1">Time in queue</p>
            </div>

            {/* Animated dots */}
            <div className="flex justify-center gap-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-[oklch(0.72_0.25_265)]"
                  style={{ animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }}
                />
              ))}
            </div>

            <button
              id="queue-leave-btn"
              onClick={handleLeaveQueue}
              className="px-6 py-2 rounded-lg text-sm text-zinc-400 glass border border-white/10 hover:text-white hover:border-white/20 transition-all"
            >
              Leave Queue
            </button>
          </div>
        )}

        {/* ── ACCEPTING ── */}
        {phase === 'accepting' && matchData && (
          <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="glass-card neon-border rounded-2xl p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-[oklch(0.72_0.25_265/15%)] flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-[oklch(0.72_0.25_265)]" />
              </div>
              <h2 className="text-2xl font-black text-white mb-1">Match Found!</h2>
              <p className="text-zinc-400 text-sm mb-6">Accept within <span className="font-bold text-white">{acceptTimer}s</span> to begin</p>

              {/* Timer ring */}
              <div className="relative w-16 h-16 mx-auto mb-6">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="28" fill="none" stroke="oklch(0.18 0.01 265)" strokeWidth="4" />
                  <circle
                    cx="32" cy="32" r="28"
                    fill="none"
                    stroke="oklch(0.72 0.25 265)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 28}`}
                    strokeDashoffset={`${2 * Math.PI * 28 * (1 - acceptTimer / ACCEPT_TIMEOUT)}`}
                    style={{ transition: 'stroke-dashoffset 1s linear' }}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-lg font-black text-white">{acceptTimer}</span>
              </div>

              {/* Vs display */}
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="text-center">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[oklch(0.55_0.25_265)] to-[oklch(0.45_0.28_280)] flex items-center justify-center text-white text-xl font-black mb-2">
                    {MOCK_CURRENT_USER.avatar}
                  </div>
                  <p className="text-white text-sm font-semibold">{MOCK_CURRENT_USER.username}</p>
                  <p className="text-xs text-zinc-500">{MOCK_CURRENT_USER.rating}</p>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-2xl font-black text-[oklch(0.72_0.25_265)] neon-glow">VS</span>
                </div>
                <div className="text-center">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center text-white text-xl font-black mb-2">
                    {matchData.opponentAvatar}
                  </div>
                  <p className="text-white text-sm font-semibold">{matchData.opponentName}</p>
                  <p className="text-xs text-zinc-500">{matchData.opponentRating}</p>
                </div>
              </div>

              {/* Accept status */}
              <div className="flex justify-between text-xs mb-6 px-2">
                <div className="flex items-center gap-1">
                  {playerAccepted
                    ? <CheckCircle className="w-4 h-4 text-emerald-400" />
                    : <div className="w-4 h-4 rounded-full border-2 border-zinc-600" />}
                  <span className={playerAccepted ? 'text-emerald-400' : 'text-zinc-400'}>You</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className={opponentAccepted ? 'text-emerald-400' : 'text-zinc-400'}>{matchData.opponentName}</span>
                  {opponentAccepted
                    ? <CheckCircle className="w-4 h-4 text-emerald-400" />
                    : <div className="w-4 h-4 rounded-full border-2 border-zinc-600 animate-pulse" />}
                </div>
              </div>

              {/* Buttons */}
              {!playerAccepted ? (
                <div className="flex gap-3">
                  <button
                    id="accept-decline-btn"
                    onClick={handleDecline}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold glass border border-white/10 text-zinc-400 hover:text-rose-400 hover:border-rose-500/30 transition-all flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Decline
                  </button>
                  <button
                    id="accept-match-btn"
                    onClick={handleAccept}
                    className="flex-1 neon-btn py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Accept
                  </button>
                </div>
              ) : (
                <div className="py-3 text-emerald-400 font-semibold flex items-center justify-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Accepted! Waiting for opponent…
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── REDIRECTING ── */}
        {phase === 'redirecting' && (
          <div className="text-center animate-in fade-in duration-500 space-y-6">
            <div className="w-20 h-20 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto animate-pulse">
              <CheckCircle className="w-10 h-10 text-emerald-400" />
            </div>
            <h2 className="text-3xl font-black text-white">Both Players Ready!</h2>
            <p className="text-zinc-400">Entering the arena…</p>
          </div>
        )}
      </main>
    </div>
  );
}
