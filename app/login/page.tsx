'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Swords, Eye, EyeOff, Loader2, ArrowRight, Mail, Lock, User, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Mode = 'login' | 'signup';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setError('');
    setSuccess(false);
  }, [mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (mode === 'signup') {
      if (!email || !password || !username) {
        setError('Please fill in all fields.');
        setLoading(false);
        return;
      }

      try {
        // 1. Check if username taken
        const { data: existing } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', username)
          .single();
        
        if (existing) throw new Error('Username already taken.');

        // 2. Insert into Normal Database Table
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([{ 
            username, 
            email, 
            password, // Storing directly for No-Email Auth request
            avatar: '👤' 
          }])
          .select()
          .single();

        if (createError) throw createError;

        if (newProfile) {
          localStorage.setItem('codeduel_id', newProfile.id);
          setLoading(false);
          setSuccess(true);
          setTimeout(() => router.push('/dashboard'), 800);
        }
      } catch (err: any) {
        setLoading(false);
        setError(err.message || 'Signup failed.');
      }
    } else {
      // ── Custom LOGIN Logic (No Email Check) ──
      try {
        if (!username || !password) {
          setError('Username and Password required.');
          setLoading(false);
          return;
        }

        const { data: profile, error: loginError } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', username)
          .eq('password', password)
          .single();

        if (loginError || !profile) {
          throw new Error('Invalid username or password.');
        }

        localStorage.setItem('codeduel_id', profile.id);
        setLoading(false);
        setSuccess(true);
        setTimeout(() => router.push('/dashboard'), 800);
      } catch (err: any) {
        setLoading(false);
        setError(err.message || 'Login failed.');
      }
    }
  };

  return (
    <div className="relative min-h-screen bg-background flex items-center justify-center px-4 overflow-hidden dot-bg">
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-[440px] animate-fade-in-up">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-3 mb-10 group">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:rotate-6 transition-transform">
            <Swords className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-black tracking-tight text-foreground">
            CodeDuel <span className="text-primary italic">Arena</span>
          </span>
        </Link>

        {/* Card */}
        <div className="glass-card rounded-[32px] p-10 pro-shadow">
          <div className="mb-8">
            <h1 className="text-3xl font-black text-foreground mb-2">
              {mode === 'login' ? 'Welcome back' : 'Create account'}
            </h1>
            <p className="text-sm text-muted-foreground font-medium">
              {mode === 'login' 
                ? 'Sign in to your duelist profile.' 
                : 'Join the arena instantly. No email confirmation needed.'}
            </p>
          </div>

          {/* Mode toggle */}
          <div className="flex bg-secondary p-1 rounded-2xl mb-8">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                mode === 'login' ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              SIGN IN
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                mode === 'signup' ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              SIGN UP
            </button>
          </div>

          {success && (
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 mb-6 animate-in fade-in zoom-in duration-300">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <p className="text-sm font-bold">Successfully entered arena!</p>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
              <p className="text-xs font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-black text-foreground uppercase tracking-wider ml-1">Username</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="CipherGhost"
                  className="w-full bg-secondary/50 border border-border rounded-2xl pl-12 pr-4 py-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-background transition-all"
                />
              </div>
            </div>

            {mode === 'signup' && (
              <div className="space-y-2">
                <label className="text-xs font-black text-foreground uppercase tracking-wider ml-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full bg-secondary/50 border border-border rounded-2xl pl-12 pr-4 py-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-background transition-all"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-xs font-black text-foreground uppercase tracking-wider">Password</label>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-secondary/50 border border-border rounded-2xl pl-12 pr-12 py-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-background transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="pro-btn w-full py-4 rounded-2xl text-sm font-black flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <> {mode === 'login' ? 'CONTINUE TO ARENA' : 'CREATE ACCOUNT'} <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8 font-medium">
          Normal Table Mode active. No email confirmation required.
        </p>
      </div>
    </div>
  );
}
