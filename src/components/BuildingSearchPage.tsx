import React, { useState, useEffect } from 'react';
import { Search, Building2, MapPin, ArrowRight, Loader2, Zap } from 'lucide-react';
import { searchBuilding, BenchmarkingData } from '../services/chicagoData';
import { motion } from 'motion/react';

interface BuildingSearchPageProps {
  onSelect: (building: BenchmarkingData) => void;
}

const LOADING_MESSAGES = [
  "Pulling Chicago benchmarking data...",
  "Calculating ComEd rates...",
  "Comparing to similar buildings...",
  "Building your financial summary..."
];

export function BuildingSearchPage({ onSelect }: BuildingSearchPageProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<BenchmarkingData[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 1500);
    } else {
      setLoadingMessageIndex(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (query.length < 3) return;
    
    setLoading(true);
    setHasSearched(true);
    const data = await searchBuilding(query);
    setResults(data);
    setLoading(false);
  };

  const handleSuggestionClick = async (suggestion: string) => {
    setQuery(suggestion);
    setLoading(true);
    setHasSearched(true);
    const data = await searchBuilding(suggestion);
    setResults(data);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg text-primary relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 mt-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl w-full z-10 text-center space-y-8"
        >
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/5 border border-black/5 text-sm font-medium text-primary/70">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/50 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Chicago Commercial Buildings
          </div>
          <h1 className="text-5xl md:text-7xl font-semibold tracking-tight text-primary">
            Chicago's <span className="text-primary">Commercial Energy</span> Intelligence.
          </h1>
          <p className="text-xl text-primary/60 max-w-2xl mx-auto leading-relaxed">
            The only platform that tells Chicago building owners exactly how much money they are losing to energy inefficiency today, using public benchmarking data.
          </p>
        </div>

        <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto w-full">
          <div className="relative flex items-center">
            <MapPin className="absolute left-5 text-primary/40 w-6 h-6" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter a Chicago building address (e.g., Franklin Center)"
              className="w-full pl-14 pr-36 py-5 bg-white border border-black/5 rounded-2xl text-lg text-primary placeholder-primary/40 focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary/50 transition-all shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
            />
            <button
              type="submit"
              disabled={loading || query.length < 3}
              className={`absolute right-2 top-2 bottom-2 px-8 bg-accent hover:bg-accent-dark disabled:bg-black/5 disabled:text-primary/40 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 ${loading ? 'bg-primary/10 text-primary' : ''}`}
            >
              {loading ? (
                <>
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/50 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                  </span>
                  Analyzing
                </>
              ) : 'Analyze'}
            </button>
          </div>
        </form>

        <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-primary/50 mt-6">
          <span>Try:</span>
          <button type="button" onClick={() => handleSuggestionClick('Franklin Center')} className="hover:text-primary transition-colors underline decoration-black/20 underline-offset-4">Franklin Center</button>
          <button type="button" onClick={() => handleSuggestionClick('111 S Wacker')} className="hover:text-primary transition-colors underline decoration-black/20 underline-offset-4">111 S Wacker</button>
          <button type="button" onClick={() => handleSuggestionClick('Willis Tower')} className="hover:text-primary transition-colors underline decoration-black/20 underline-offset-4">Willis Tower</button>
        </div>

        {/* Results Dropdown */}
        {hasSearched && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl w-full mx-auto bg-white border border-black/5 rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.08)] text-left mt-6"
          >
            {loading ? (
              <div className="p-12 text-center text-primary/60 flex flex-col items-center gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="text-lg font-medium animate-pulse">{LOADING_MESSAGES[loadingMessageIndex]}</p>
              </div>
            ) : results.length > 0 ? (
              <ul className="divide-y divide-black/5">
                {results.map((building, idx) => (
                  <li key={building.row_id || building.id || idx}>
                    <button
                      onClick={() => onSelect(building)}
                      className="w-full p-4 hover:bg-black/5 transition-colors flex items-center justify-between group text-left"
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-2.5 bg-black/5 rounded-xl group-hover:bg-primary/10 group-hover:text-primary transition-colors text-primary/60">
                          <Building2 className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-primary group-hover:text-primary transition-colors tracking-tight">
                            {building.property_name || building.address}
                          </h3>
                          <p className="text-sm text-primary/60 mt-0.5">
                            {building.address} • {building.primary_property_type} • {building.gross_floor_area_buildings_sq_ft} sq ft
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-primary/30 group-hover:text-primary transform group-hover:translate-x-1 transition-all" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-8 text-center text-primary/60">
                <p>No buildings found matching "{query}".</p>
                <p className="text-sm mt-2">Try a different address or ensure the building is over 10,000 sq ft.</p>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>
      </div>
    </div>
  );
}
