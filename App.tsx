import React, { useState } from 'react';
import { Search, RotateCw, ExternalLink, Star, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Tool {
  name: string;
  rating: string;
  url: string;
  simplicityRank: number; // 1: Easy, 5: Expert
}

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentKeyword, setCurrentKeyword] = useState<string | null>(null);
  const [allTools, setAllTools] = useState<Tool[]>([]);
  const [displayedTools, setDisplayedTools] = useState<Tool[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchToolsFromAI = async (query: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // --- SECURITY: CALL SERVER-SIDE API ---
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });

      if (!response.ok) {
        throw new Error("Failed to fetch from server.");
      }

      const data = await response.json();
      const tools: Tool[] = data.tools;

      if (Array.isArray(tools) && tools.length > 0) {
        // Sort by simplicity rank (easiest first)
        const sortedTools = [...tools].sort((a, b) => a.simplicityRank - b.simplicityRank);
        setAllTools(sortedTools);
        setDisplayedTools(sortedTools.slice(0, 5));
        setCurrentKeyword(query);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.error("AI Search Error:", err);
      setError("Failed to find free tools for this category. Please try a different keyword.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    fetchToolsFromAI(searchQuery);
  };

  const replaceTool = (index: number) => {
    const currentlyDisplayedNames = displayedTools.map(t => t.name);
    const availableTools = allTools.filter(t => !currentlyDisplayedNames.includes(t.name));

    if (availableTools.length === 0) {
      return;
    }

    const newTool = availableTools[Math.floor(Math.random() * availableTools.length)];
    const newDisplayedTools = [...displayedTools];
    newDisplayedTools[index] = newTool;
    // Keep it sorted by simplicity rank if possible, or just replace
    setDisplayedTools(newDisplayedTools.sort((a, b) => a.simplicityRank - b.simplicityRank));
  };

  const getSimplicityLabel = (rank: number) => {
    if (rank <= 1) return { text: 'Beginner', color: 'text-emerald-400' };
    if (rank <= 2) return { text: 'Easy', color: 'text-blue-400' };
    if (rank <= 3) return { text: 'Intermediate', color: 'text-yellow-400' };
    if (rank <= 4) return { text: 'Advanced', color: 'text-orange-400' };
    return { text: 'Expert', color: 'text-red-400' };
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white font-sans selection:bg-white/20 relative overflow-hidden">
      {/* Floating Background Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, 120, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-1/2 -right-24 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[150px]"
        />
        <motion.div
          animate={{
            x: [0, 50, 0],
            y: [0, -100, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -bottom-24 left-1/4 w-80 h-80 bg-violet-500/10 rounded-full blur-[100px]"
        />
      </div>

      <div className="max-w-xl mx-auto px-6 py-24 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl font-bold tracking-tight mb-4">Top 5 Free Tools</h1>
          <p className="text-neutral-500">Search for any free tool category to discover the best options, ranked by simplicity.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <form onSubmit={handleSearch} className="relative mb-12 group">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center">
              {isLoading ? (
                <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
              ) : (
                <Search className="w-5 h-5 text-neutral-500 group-focus-within:text-neutral-300 transition-colors" />
              )}
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={isLoading}
              placeholder="Search for any free tool category (e.g., SEO, Design)..."
              className="w-full bg-[#1a1a1a] border border-neutral-800 rounded-2xl py-5 pl-14 pr-6 text-lg outline-none focus:border-neutral-600 transition-all placeholder:text-neutral-600 disabled:opacity-50"
            />
          </form>
        </motion.div>

        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {displayedTools.map((tool, index) => {
              const simplicity = getSimplicityLabel(tool.simplicityRank);
              return (
                <motion.div
                  key={tool.name}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="group flex items-center justify-between p-5 bg-[#1a1a1a] border border-neutral-800/50 rounded-2xl hover:border-neutral-700 transition-colors"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <a
                        href={tool.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-lg font-semibold hover:underline flex items-center gap-2 group/link"
                      >
                        {tool.name}
                        <ExternalLink className="w-4 h-4 opacity-0 group-hover/link:opacity-100 transition-opacity text-neutral-500" />
                      </a>
                      <span className="text-[10px] uppercase tracking-wider bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded border border-emerald-500/20">Free</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-neutral-500">
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-neutral-500 text-neutral-500" />
                        <span>{tool.rating}</span>
                      </div>
                      <span className="w-1 h-1 rounded-full bg-neutral-700" />
                      <div className="flex items-center gap-1">
                        <span className="text-neutral-600">Level:</span>
                        <span className={`font-medium ${simplicity.color}`}>{simplicity.text}</span>
                        <span className="text-[10px] opacity-40">({tool.simplicityRank}/5)</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => replaceTool(index)}
                    className="p-3 text-neutral-500 hover:text-white hover:bg-white/5 rounded-xl transition-all active:scale-90"
                    title="Replace with another free tool"
                  >
                    <RotateCw className="w-5 h-5" />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-neutral-500 py-8"
            >
              {error}
            </motion.p>
          )}

          {!currentKeyword && !error && !isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-neutral-600 py-20"
            >
              <p className="text-sm uppercase tracking-widest font-medium opacity-50">Search for any free tool category</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
