import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { CodeBlock } from '@/components/CodeBlock';
import { motion } from 'framer-motion';
import { Play, Loader2, ServerCrash } from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  searchAnime, 
  getAnimeInfo, 
  getEpisodeStreams, 
  getAnimeEpisodes, 
  getLatestEpisodes, 
  healthCheck 
} from '@workspace/api-client-react';

type EndpointType = 'search' | 'info' | 'streams' | 'episodes' | 'latest' | 'health';

export default function Tester() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointType>('info');
  
  // Form states
  const [slug, setSlug] = useState('jujutsu-kaisen');
  const [episodeNum, setEpisodeNum] = useState('1');
  const [query, setQuery] = useState('naruto');
  const [page, setPage] = useState('1');

  // Request state
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [time, setTime] = useState<number | null>(null);

  const handleTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);
    const startTime = performance.now();

    try {
      let data;
      switch (selectedEndpoint) {
        case 'info':
          if (!slug) throw new Error("Anime slug is required");
          data = await getAnimeInfo(slug);
          break;
        case 'streams':
          if (!slug || !episodeNum) throw new Error("Slug and episode number required");
          data = await getEpisodeStreams(slug, parseInt(episodeNum));
          break;
        case 'episodes':
          if (!slug) throw new Error("Anime slug is required");
          data = await getAnimeEpisodes(slug);
          break;
        case 'search':
          if (!query) throw new Error("Search query is required");
          data = await searchAnime({ q: query, page: parseInt(page) || 1 });
          break;
        case 'latest':
          data = await getLatestEpisodes({ page: parseInt(page) || 1 });
          break;
        case 'health':
          data = await healthCheck();
          break;
      }
      setResponse(data);
    } catch (err: any) {
      setError(err.message || "An error occurred fetching the API");
    } finally {
      setTime(Math.round(performance.now() - startTime));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-12 flex flex-col">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 flex flex-col">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-white mb-2">Interactive API Tester</h1>
          <p className="text-muted-foreground">Test endpoints live in your browser. Real requests to the OppAI API.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
          {/* Configuration Panel */}
          <div className="lg:col-span-4 space-y-6">
            <div className="glass-panel p-6 rounded-2xl">
              <h2 className="text-lg font-semibold text-white mb-4">Request Configuration</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Endpoint</label>
                  <select 
                    value={selectedEndpoint}
                    onChange={(e) => setSelectedEndpoint(e.target.value as EndpointType)}
                    className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow appearance-none"
                  >
                    <option value="info">GET /api/anime/{'{slug}'}</option>
                    <option value="streams">GET /api/anime/{'{slug}'}/episode/{'{num}'}</option>
                    <option value="episodes">GET /api/anime/{'{slug}'}/episodes</option>
                    <option value="search">GET /api/search</option>
                    <option value="latest">GET /api/latest</option>
                    <option value="health">GET /api/healthz</option>
                  </select>
                </div>

                <form onSubmit={handleTest} className="space-y-4 pt-4 border-t border-border/50">
                  {/* Dynamic Fields based on Endpoint */}
                  {(selectedEndpoint === 'info' || selectedEndpoint === 'streams' || selectedEndpoint === 'episodes') && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">Anime Slug</label>
                      <input 
                        type="text" 
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        placeholder="e.g. jujutsu-kaisen"
                        className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                      />
                    </motion.div>
                  )}

                  {selectedEndpoint === 'streams' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">Episode Number</label>
                      <input 
                        type="number" 
                        value={episodeNum}
                        onChange={(e) => setEpisodeNum(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                      />
                    </motion.div>
                  )}

                  {selectedEndpoint === 'search' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">Search Query</label>
                      <input 
                        type="text" 
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="e.g. naruto"
                        className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                      />
                    </motion.div>
                  )}

                  {(selectedEndpoint === 'search' || selectedEndpoint === 'latest') && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">Page (Optional)</label>
                      <input 
                        type="number" 
                        value={page}
                        onChange={(e) => setPage(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                      />
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-all shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
                    Send Request
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Response Panel */}
          <div className="lg:col-span-8 flex flex-col min-h-[500px]">
            <div className="glass-panel rounded-2xl flex-1 flex flex-col overflow-hidden border border-border">
              <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border-b border-border">
                <span className="text-sm font-medium text-muted-foreground">JSON Response</span>
                {time !== null && !loading && (
                  <span className="text-xs text-green-400 font-mono bg-green-400/10 px-2 py-1 rounded">
                    Status: {error ? 'Error' : '200 OK'} • Time: {time}ms
                  </span>
                )}
              </div>
              
              <div className="flex-1 bg-[#0d0d0d] p-4 relative overflow-auto custom-scrollbar">
                {loading ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-primary">
                    <Loader2 className="w-10 h-10 animate-spin mb-4" />
                    <span className="font-mono text-sm">Fetching from API...</span>
                  </div>
                ) : error ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-destructive">
                    <ServerCrash className="w-12 h-12 mb-4 opacity-80" />
                    <h3 className="font-semibold text-lg mb-2">Request Failed</h3>
                    <p className="text-sm opacity-80 font-mono text-center px-4 max-w-md">{error}</p>
                  </div>
                ) : response ? (
                  <CodeBlock 
                    code={JSON.stringify(response, null, 2)} 
                    language="json" 
                    className="border-none bg-transparent rounded-none h-full"
                    title="Response Body"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/50">
                    <span className="font-mono text-sm">Hit "Send Request" to see results</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
