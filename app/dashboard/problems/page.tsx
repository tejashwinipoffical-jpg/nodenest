'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Plus, Search, Filter, Code2, Trash2, Edit3, 
  ChevronRight, ArrowLeft, Loader2, Save, X, 
  CheckCircle, Zap, Swords, Layout
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { Problem } from '@/lib/types';

export default function ProblemsDashboard() {
  const router = useRouter();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form State
  const [newProblem, setNewProblem] = useState({
    title: '',
    difficulty: 'Easy',
    topic: 'Arrays',
    statement: '',
    input_format: '',
    output_format: '',
    constraints_text: '',
    examples: [{ input: '', output: '', explanation: '' }],
    hidden_test_cases: [{ input: '', expected_output: '' }]
  });

  useEffect(() => {
    fetchProblems();
  }, []);

  async function fetchProblems() {
    setLoading(true);
    const { data, error } = await supabase
      .from('problems')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) setProblems(data);
    setLoading(false);
  }

  const handleAddProblem = async () => {
    setLoading(true);
    const { error } = await supabase
      .from('problems')
      .insert([newProblem]);

    if (!error) {
      setIsModalOpen(false);
      fetchProblems();
      // Reset form
      setNewProblem({
        title: '',
        difficulty: 'Easy',
        topic: 'Arrays',
        statement: '',
        input_format: '',
        output_format: '',
        constraints_text: '',
        examples: [{ input: '', output: '', explanation: '' }],
        hidden_test_cases: [{ input: '', expected_output: '' }]
      });
    } else {
      console.error('Error adding problem:', error);
    }
    setLoading(false);
  };

  const filteredProblems = problems.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.topic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background dot-bg pb-20 selection:bg-primary/10">
      {/* Top Banner / Nav */}
      <nav className="sticky top-0 z-30 flex items-center justify-between px-8 py-4 glass border-b border-border mb-8">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2 group text-muted-foreground hover:text-foreground transition-all">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-black uppercase tracking-widest">Dashboard</span>
          </Link>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-sm">
              <Layout className="w-5 h-5 text-white" />
            </div>
            <span className="font-black text-foreground">Management <span className="text-primary italic">/ Problems</span></span>
          </div>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="pro-btn px-6 py-2.5 rounded-full text-xs font-black flex items-center gap-2"
        >
          ADD CHALLENGE <Plus className="w-4 h-4" />
        </button>
      </nav>

      <div className="max-w-7xl mx-auto px-6">
        <header className="mb-10">
          <h1 className="text-4xl font-black tracking-tighter text-foreground mb-4">Arena Problem Set</h1>
          <p className="text-muted-foreground font-medium">Create and manage coding problems for the competitive dueling pool.</p>
        </header>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search challenges by title or topic..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-border rounded-2xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
            />
          </div>
          <select className="bg-white border border-border rounded-2xl px-6 py-4 text-sm font-black uppercase tracking-widest text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer">
            <Filter className="w-4 h-4" />
            <option>All Difficulties</option>
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>
        </div>

        {/* Problems List */}
        {loading && problems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
            <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Syncing problem library...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredProblems.map((problem) => (
                <motion.div 
                  key={problem.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="glass-card rounded-[32px] p-6 border-border hover:border-primary/30 transition-all group"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      problem.difficulty === 'Easy' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                      problem.difficulty === 'Medium' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                      'bg-rose-50 text-rose-600 border border-rose-100'
                    }`}>
                      {problem.difficulty}
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 rounded-xl bg-secondary text-muted-foreground hover:text-primary transition-colors">
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-2 rounded-xl bg-rose-50 text-rose-400 hover:text-rose-600 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-black text-foreground mb-2 group-hover:text-primary transition-colors">{problem.title}</h3>
                  <div className="flex items-center gap-2 mb-6">
                    <Code2 className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{problem.topic}</span>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-border">
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-2">
                         {[1,2,3].map(i => (
                           <div key={i} className="w-6 h-6 rounded-full bg-secondary border-2 border-white flex items-center justify-center text-[10px]">👤</div>
                         ))}
                      </div>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">124 Duelists Played</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Add Problem Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-background/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              className="glass-card w-full max-w-4xl p-10 pro-shadow max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                    <Plus className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-foreground tracking-tight uppercase">Forge New Challenge</h2>
                    <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Adding to Global Arena Pool</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-3 rounded-full hover:bg-secondary transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Left Side: General Info */}
                <div className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Challenge Title</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Find Missing Number"
                      value={newProblem.title}
                      onChange={(e) => setNewProblem({...newProblem, title: e.target.value})}
                      className="w-full bg-secondary/50 border border-border rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Difficulty</label>
                      <select 
                        value={newProblem.difficulty}
                        onChange={(e) => setNewProblem({...newProblem, difficulty: e.target.value})}
                        className="w-full bg-secondary/50 border border-border rounded-2xl px-6 py-4 text-sm font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        <option>Easy</option>
                        <option>Medium</option>
                        <option>Hard</option>
                      </select>
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Topic</label>
                      <input 
                        type="text" 
                        placeholder="Algorithms"
                        value={newProblem.topic}
                        onChange={(e) => setNewProblem({...newProblem, topic: e.target.value})}
                        className="w-full bg-secondary/50 border border-border rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Problem Statement</label>
                    <textarea 
                      rows={6} 
                      placeholder="Clearly define the challenge, and expected logic..."
                      value={newProblem.statement}
                      onChange={(e) => setNewProblem({...newProblem, statement: e.target.value})}
                      className="w-full bg-secondary/50 border border-border rounded-3xl px-6 py-6 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                    />
                  </div>
                </div>

                {/* Right Side: Technical Data */}
                <div className="space-y-8">
                   <div className="space-y-3 text-sm font-bold text-muted-foreground bg-primary/5 p-6 rounded-3xl border border-primary/10">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-4 h-4 text-primary fill-current" />
                        <span className="text-xs font-black uppercase tracking-widest text-primary">Test Case Forge</span>
                      </div>
                      <p className="text-[10px] leading-relaxed mb-4">Adding hidden test cases ensures your challenge is failure-proof. Claude will use these to judge submissions.</p>
                      
                      <div className="space-y-4 max-h-[200px] overflow-y-auto pr-2">
                        {newProblem.hidden_test_cases.map((tc, idx) => (
                          <div key={idx} className="flex gap-2">
                             <input 
                               placeholder="Input" 
                               value={tc.input}
                               onChange={(e) => {
                                 const cases = [...newProblem.hidden_test_cases];
                                 cases[idx].input = e.target.value;
                                 setNewProblem({...newProblem, hidden_test_cases: cases});
                               }}
                               className="flex-1 bg-white border border-border rounded-xl px-4 py-3 text-xs" 
                             />
                             <input 
                               placeholder="Expected" 
                               value={tc.expected_output}
                               onChange={(e) => {
                                 const cases = [...newProblem.hidden_test_cases];
                                 cases[idx].expected_output = e.target.value;
                                 setNewProblem({...newProblem, hidden_test_cases: cases});
                               }}
                               className="flex-1 bg-white border border-border rounded-xl px-4 py-3 text-xs" 
                             />
                          </div>
                        ))}
                      </div>
                      <button 
                        onClick={() => setNewProblem({
                          ...newProblem, 
                          hidden_test_cases: [...newProblem.hidden_test_cases, { input: '', expected_output: '' }]
                        })}
                        className="mt-4 text-[10px] font-black text-primary hover:underline uppercase tracking-widest"
                      >
                        + Add test case
                      </button>
                   </div>

                   <button 
                     onClick={handleAddProblem}
                     disabled={loading}
                     className="pro-btn w-full py-6 rounded-3xl text-sm font-black flex items-center justify-center gap-3 shadow-xl shadow-primary/20"
                   >
                     {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>DEPLOY CHALLENGE <CheckCircle className="w-5 h-5" /></>}
                   </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
