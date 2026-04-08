'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Share2, Link as LinkIcon, Users, QrCode } from 'lucide-react';

interface InviteFriendModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InviteFriendModal({ isOpen, onClose }: InviteFriendModalProps) {
  const [roomId, setRoomId] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRoomId(`friend-${Math.random().toString(36).substring(7)}`);
      setCopied(false);
    }
  }, [isOpen]);

  const inviteLink = typeof window !== 'undefined' 
    ? `${window.location.origin}/arena/${roomId}` 
    : '';

  const copyToClipboard = () => {
    if (!inviteLink) return;
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'CodeDuel Arena Challenge',
          text: `⚔️ Challenge Alert! Join my CodeDuel Arena room to battle 1v1!`,
          url: inviteLink,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      copyToClipboard();
    }
  };

  const shareWhatsApp = () => {
    // Putting the link first often helps apps generate the preview/clickable link better
    const text = `Join my CodeDuel Arena room: ${inviteLink}\n\n⚔️ Challenge Accepted? Battle me 1v1!`;
    const encodedText = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encodedText}`, '_blank');
  };

  const shareTwitter = () => {
    const text = `Ready for a duel? ⚔️ Join my arena on CodeDuel! \n\n${inviteLink}`;
    const encodedText = encodeURIComponent(text);
    window.open(`https://twitter.com/intent/tweet?text=${encodedText}`, '_blank');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md glass-card rounded-[32px] p-8 pro-shadow overflow-hidden"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-foreground">Invite a Friend</h2>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Share Lively Link</p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="p-2 hover:bg-secondary rounded-xl transition-colors text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-8">
              {/* How it works */}
              <div className="flex gap-4 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                <Users className="w-5 h-5 text-primary shrink-0" />
                <p className="text-xs text-foreground/80 leading-relaxed">
                  Challenge your friends to a <span className="text-primary font-black italic">lively</span> battle. Send this link via social media to start!
                </p>
              </div>

              {/* Link Box */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <label className="text-[10px] font-black uppercase text-muted-foreground">Your Global Duel Link</label>
                  <a 
                    href={inviteLink} 
                    target="_blank" 
                    className="text-[10px] font-black text-primary hover:underline uppercase tracking-tighter"
                  >
                    Test in new tab ↗
                  </a>
                </div>
                <div className="flex gap-2 p-2 bg-secondary rounded-2xl border border-border">
                  <a 
                    href={inviteLink}
                    target="_blank"
                    className="flex-1 flex items-center px-3 overflow-hidden hover:bg-white/50 transition-colors rounded-xl"
                  >
                    <LinkIcon className="w-4 h-4 text-primary shrink-0 mr-2" />
                    <span className="text-xs font-mono text-primary truncate underline decoration-primary/30 underline-offset-4">{inviteLink}</span>
                  </a>
                  <button
                    onClick={copyToClipboard}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all shadow-sm ${
                      copied ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-primary text-white hover:brightness-110 shadow-primary/20'
                    }`}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span className="text-xs font-bold">{copied ? 'Copied' : 'Copy Link'}</span>
                  </button>
                </div>
              </div>

              {/* Extras - Lively Social Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={shareWhatsApp}
                  className="flex flex-col items-center justify-center p-6 rounded-2xl bg-secondary hover:bg-emerald-50 transition-all border border-border group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white mb-3 shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                    <Share2 className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-emerald-800">WhatsApp Join</span>
                </button>
                <button 
                  onClick={shareNative}
                  className="flex flex-col items-center justify-center p-6 rounded-2xl bg-secondary hover:bg-primary/5 transition-all border border-border group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white mb-3 shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                    <Share2 className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-primary">More Shared Apps</span>
                </button>
              </div>
            </div>

            <div className="mt-10">
              <Link
                href={`/arena/${roomId}`}
                className="pro-btn w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2"
              >
                Join Arena & Wait <Users className="w-4 h-4" />
              </Link>
              <div className="mt-4 p-4 rounded-2xl bg-amber-50 border border-amber-100">
                <p className="text-[9px] text-center text-amber-700 font-bold uppercase tracking-tight">
                  ⚠️ Localhost links typically only work on this computer. <br />
                  To play with a friend remotely, deploy this project or use a tunnel!
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
