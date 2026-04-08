'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Type, Sun, Moon, Maximize2, Monitor } from 'lucide-react';

interface ArenaSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: {
    fontSize: number;
    theme: 'vs-light' | 'vs-dark';
    minimap: boolean;
  };
  updateSettings: (newSettings: any) => void;
}

export default function ArenaSettingsModal({ isOpen, onClose, settings, updateSettings }: ArenaSettingsModalProps) {
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
              <h2 className="text-2xl font-black text-foreground">Editor Settings</h2>
              <button 
                onClick={onClose} 
                className="p-2 hover:bg-secondary rounded-xl transition-colors text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-8">
              {/* Font Size */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Type className="w-4 h-4 text-primary" />
                    <span className="text-sm font-bold text-foreground">Font Size</span>
                  </div>
                  <span className="text-sm font-black text-primary bg-primary/5 px-2 py-0.5 rounded-lg">{settings.fontSize}px</span>
                </div>
                <input
                  type="range"
                  min="12"
                  max="24"
                  step="1"
                  value={settings.fontSize}
                  onChange={(e) => updateSettings({ fontSize: parseInt(e.target.value) })}
                  className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-[10px] font-bold text-muted-foreground tracking-widest px-1 uppercase">
                  <span>small</span>
                  <span>large</span>
                </div>
              </div>

              {/* Theme Toggle */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-primary" />
                  <span className="text-sm font-bold text-foreground">Editor Theme</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => updateSettings({ theme: 'vs-light' })}
                    className={`flex items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                      settings.theme === 'vs-light' 
                        ? 'border-primary bg-primary/5 text-primary' 
                        : 'border-border bg-background text-muted-foreground hover:border-border/50 hover:bg-secondary/50'
                    }`}
                  >
                    <Sun className="w-4 h-4" />
                    <span className="text-xs font-black uppercase tracking-wider">Light</span>
                  </button>
                  <button
                    onClick={() => updateSettings({ theme: 'vs-dark' })}
                    className={`flex items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                      settings.theme === 'vs-dark' 
                        ? 'border-primary bg-primary/5 text-primary' 
                        : 'border-border bg-background text-muted-foreground hover:border-border/50 hover:bg-secondary/50'
                    }`}
                  >
                    <Moon className="w-4 h-4" />
                    <span className="text-xs font-black uppercase tracking-wider">Dark</span>
                  </button>
                </div>
              </div>

              {/* Minimap Toggle */}
              <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-2xl border border-border">
                <div className="flex items-center gap-3">
                  <Maximize2 className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-sm font-bold text-foreground leading-none">Editor Minimap</p>
                    <p className="text-[10px] text-muted-foreground font-medium mt-1">Sidebar code preview</p>
                  </div>
                </div>
                <button
                  onClick={() => updateSettings({ minimap: !settings.minimap })}
                  className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-1 ${
                    settings.minimap ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <motion.div
                    animate={{ x: settings.minimap ? 24 : 0 }}
                    className="w-4 h-4 bg-white rounded-full shadow-sm"
                  />
                </button>
              </div>
            </div>

            <div className="mt-10">
              <button
                onClick={onClose}
                className="pro-btn w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest"
              >
                Apply & Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
