import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Building2, LineChart, Zap, Leaf, ShieldCheck, ArrowUpRight, Search, MapPin, Loader2 } from 'lucide-react';
import { searchBuilding, BenchmarkingData } from '../services/chicagoData';

const FEATURES = [
  {
    title: "Neighbourhood Insights",
    description: "Compare your building's performance against similar properties in your area to identify realistic improvement targets."
  },
  {
    title: "Interactive Map",
    description: "Visualize energy consumption and emissions data across Chicago's commercial real estate landscape."
  },
  {
    title: "Loss Discovery",
    description: "Pinpoint exact areas of energy waste in your building systems using our advanced analytics engine."
  },
  {
    title: "Saving Tracking",
    description: "Monitor the ROI of your retrofit projects in real-time and track your progress towards decarbonisation goals."
  },
  {
    title: "Upload Bills & Utilities",
    description: "Seamlessly integrate your utility data by uploading bills directly to our platform for automated processing."
  }
];

const LOADING_MESSAGES = [
  "Pulling Chicago benchmarking data...",
  "Calculating ComEd rates...",
  "Comparing to similar buildings...",
  "Building your financial summary..."
];

interface LandingPageProps {
  onSelect?: (building: BenchmarkingData) => void;
}

export function LandingPage({ onSelect }: LandingPageProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<BenchmarkingData[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % FEATURES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

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
    <div className="min-h-screen bg-bg text-primary">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-start overflow-hidden pt-32 pb-20 bg-bg">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.pexels.com/photos/36935627/pexels-photo-36935627.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
            alt="Chicago Skyline Background" 
            className="w-full h-full object-cover object-[center_70%] opacity-80 mix-blend-luminosity translate-y-32 md:translate-y-48"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-bg via-bg/80 to-bg" />
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl" />
        </div>

        <div className="flex-1 flex flex-col items-center justify-start pt-4 md:pt-8 px-6 w-full relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl w-full z-10 text-center space-y-8"
          >
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/5 border border-black/5 text-sm font-medium text-primary/70">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/50 opacity-20"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Chicago Commercial Buildings
              </div>
              <h1 className="text-5xl md:text-7xl font-semibold tracking-tight text-primary">
                Chicago’s Commercial Energy Intelligence for Building Owners
              </h1>
              <p className="text-xl text-primary/60 max-w-2xl mx-auto leading-relaxed">
                See exactly how much your building in Chicago is losing to energy inefficiency - and how to turn it into savings.
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
                          onClick={() => onSelect && onSelect(building)}
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
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <div className="mb-16 border-b border-primary/20 pb-8 text-center">
          <h2 className="text-4xl md:text-5xl font-light tracking-tight">
            The true cost of energy wastage
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Stat 1 */}
          <div className="space-y-8">
            <div className="h-64 rounded-3xl overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=1544&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                alt="Emissions" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="bg-accent rounded-3xl p-10 border border-primary/10 text-white">
              <div className="text-xs font-bold tracking-widest uppercase mb-6 border-b border-white/20 pb-4">Money Wasted</div>
              <div className="text-7xl md:text-8xl font-light tracking-tighter mb-6 text-transparent" style={{ WebkitTextStroke: '1px white' }}>
                $100M+
              </div>
              <p className="text-lg font-medium leading-relaxed">
                Every year, millions of dollars are wasted as clean, affordable energy is lost due to inefficient building systems and lack of scalable retrofits.
              </p>
            </div>
          </div>

          {/* Stat 2 */}
          <div className="space-y-8 md:mt-24">
            <div className="bg-primary rounded-3xl p-10 border border-primary/10 text-white">
              <div className="text-xs font-bold tracking-widest uppercase mb-6 border-b border-white/20 pb-4">CO₂ Emissions</div>
              <div className="text-7xl md:text-8xl font-light tracking-tighter mb-6 text-transparent" style={{ WebkitTextStroke: '1px white' }}>
                +70%
              </div>
              <p className="text-lg font-medium leading-relaxed">
                Commercial and residential buildings account for over 70% of Chicago's annual CO₂ emissions.
              </p>
            </div>
            <div className="h-64 rounded-3xl overflow-hidden">
              <video 
                autoPlay 
                loop 
                muted 
                playsInline
                className="w-full h-full object-cover"
              >
                <source src="https://static.vecteezy.com/system/resources/previews/043/506/342/mp4/chicago-usa-april-3-2023-chicago-lakefront-and-museum-campus-scenic-aerial-view-of-chicago-s-museum-campus-with-a-vibrant-waterfront-free-video.mp4" type="video/mp4" />
              </video>
            </div>
          </div>
        </div>
      </section>

      {/* Target Audience Section */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <div className="mb-16 text-center">
          <h2 className="text-4xl md:text-5xl font-light tracking-tight">
            Who we serve
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-3xl p-10 border border-black/5 shadow-sm">
            <h3 className="text-2xl font-semibold mb-2 text-primary">Commercial Building Owners</h3>
            <p className="text-sm text-primary/60 mb-6">(Office towers, multi-family, hotels)</p>
            <p className="text-lg font-medium leading-relaxed text-primary">
              Care about reducing energy cost ($) and ROI.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-10 border border-black/5 shadow-sm">
            <h3 className="text-2xl font-semibold mb-2 text-primary">Property / Facility Managers</h3>
            <div className="h-5 mb-6"></div>
            <p className="text-lg font-medium leading-relaxed text-primary">
              Care about operations, HVAC performance, maintenance planning.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-10 border border-black/5 shadow-sm">
            <h3 className="text-2xl font-semibold mb-2 text-primary">Real Estate Portfolio Managers / REITs</h3>
            <div className="h-5 mb-6"></div>
            <p className="text-lg font-medium leading-relaxed text-primary">
              Care about portfolio-level savings, asset value, ESG metrics.
            </p>
          </div>
        </div>
      </section>

      {/* Solution Intro */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12">
          <h2 className="text-4xl md:text-5xl font-light tracking-tight">
            Turn up efficiency.<br />Don't turn down comfort.
          </h2>
          <div className="space-y-6 text-lg">
            <p>
              By converting raw building data into actionable financial insights, our flexible platform helps property owners identify high-ROI retrofits and comply with local energy ordinances.
            </p>
            <p>
              Our technology leverages public benchmarking data and advanced modeling to provide a modular, compact, and easy-to-understand decarbonisation solution for a range of clients, from single-building owners to large portfolios.
            </p>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto bg-[#0B2E28] rounded-[3rem] p-12 md:p-20 text-white relative overflow-hidden">
          <div className="absolute top-8 right-8">
            <Link to="/search" className="inline-flex items-center gap-2 bg-accent text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-accent-dark transition-colors">
              Find out more
              <div className="w-1.5 h-1.5 rounded-full bg-white" />
            </Link>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12 mt-12 relative z-10">
            {/* Step 1 */}
            <div className="text-center space-y-6">
              <div className="h-48 flex items-center justify-center">
                <img src="https://images.pexels.com/photos/37040460/pexels-photo-37040460.png?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Step 1" className="h-full object-contain" referrerPolicy="no-referrer" />
              </div>
              <div>
                <h3 className="text-accent text-xl font-medium mb-4">Step 1.</h3>
                <p className="text-white/80">Identify inefficiencies using public benchmarking data and our proprietary algorithms.</p>
              </div>
            </div>
            
            {/* Step 2 */}
            <div className="text-center space-y-6">
              <div className="h-48 flex items-center justify-center relative">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 hidden md:block text-white/30">
                  <ArrowRight className="w-8 h-8" />
                </div>
                <img src="https://images.pexels.com/photos/37040458/pexels-photo-37040458.png?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Step 2" className="h-full object-contain" referrerPolicy="no-referrer" />
              </div>
              <div>
                <h3 className="text-accent text-xl font-medium mb-4">Step 2.</h3>
                <p className="text-white/80">Plan retrofits with clear ROI calculations and financial modeling.</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="text-center space-y-6">
              <div className="h-48 flex items-center justify-center relative">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 hidden md:block text-white/30">
                  <ArrowRight className="w-8 h-8" />
                </div>
                <img src="https://images.pexels.com/photos/37040459/pexels-photo-37040459.png?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Step 3" className="h-full object-contain" referrerPolicy="no-referrer" />
              </div>
              <div>
                <h3 className="text-accent text-xl font-medium mb-4">Step 3.</h3>
                <p className="text-white/80">Execute decarbonisation projects and comply with Chicago's Energy Rating System.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Us */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h2 className="text-4xl md:text-5xl font-light tracking-tight">Why Civic Energy?</h2>
            <p className="text-lg leading-relaxed">
              Our data-driven platform facilitates the efficient use of capital at local and national levels, allowing an economically viable means of decarbonisation for commercial real estate. Scalable and agile, we integrate with existing benchmarking data and can be deployed for any building size.
            </p>
            <Link to="/platform" className="inline-flex items-center gap-2 bg-accent hover:bg-accent-dark text-white px-6 py-3 rounded-full font-medium transition-colors">
              See solutions
              <div className="w-2 h-2 rounded-full bg-white" />
            </Link>
          </div>
          
          <div className="bg-accent-light rounded-[3rem] p-12 relative overflow-hidden min-h-[400px] flex flex-col justify-center">
            <div className="absolute -right-4 top-8 bottom-8 w-8 bg-accent-light/40 rounded-r-3xl" />
            <div className="absolute -right-8 top-16 bottom-16 w-8 bg-accent-light/20 rounded-r-3xl" />
            
            <div className="text-xs font-bold tracking-widest uppercase mb-8 border-b border-primary/20 pb-4 relative z-10">Platform Features</div>
            
            <div className="relative h-48 z-10">
              {FEATURES.map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ 
                    opacity: currentSlide === idx ? 1 : 0,
                    x: currentSlide === idx ? 0 : (currentSlide > idx ? -20 : 20),
                    pointerEvents: currentSlide === idx ? 'auto' : 'none'
                  }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0"
                >
                  <h3 className="text-3xl font-light mb-6">{feature.title}</h3>
                  <p className="text-lg leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>

            <div className="flex gap-2 mt-8 relative z-10">
              {FEATURES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${currentSlide === idx ? 'w-8 bg-accent' : 'w-2 bg-primary/20'}`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Logos */}
      <section className="py-16 bg-primary text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-8 mb-16">
            <h2 className="text-4xl md:text-5xl font-light tracking-tight whitespace-nowrap">Our customers & collaborators</h2>
            <div className="h-px bg-accent flex-1" />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-8 flex items-center justify-center aspect-[3/2]">
                <div className="w-full h-full bg-black/5 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* News */}
      <section className="py-16 bg-primary text-white border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-12">
          <div>
            <h2 className="text-4xl font-light tracking-tight mb-6">Latest news &<br />insights</h2>
            <p className="text-white/70 mb-8">
              Explore activities and the ways in which we actively participate in reducing carbon emissions.
            </p>
            <Link to="/blog" className="inline-flex items-center gap-2 bg-accent hover:bg-accent-dark text-white px-6 py-3 rounded-full font-medium transition-colors text-sm">
              View all news
              <div className="w-2 h-2 rounded-full bg-white" />
            </Link>
          </div>
          
          <div className="bg-white text-primary rounded-[2rem] overflow-hidden flex flex-col">
            <div className="p-8 flex-1">
              <h3 className="text-xl font-medium mb-4">How Your Building Is Losing Money Without You Knowing</h3>
              <a href="https://medium.com/@zecci77/here-is-a-cleaner-medium-style-version-of-your-article-with-a-more-professional-tone-and-no-792fc8751c26" target="_blank" rel="noopener noreferrer" className="text-sm font-medium hover:text-accent transition-colors underline decoration-black/20 underline-offset-4">View post</a>
            </div>
            <div className="h-48 bg-black/5">
              <img src="https://images.unsplash.com/photo-1524168272322-bf73616d9cb5?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="News" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
          </div>

          <div className="bg-white text-primary rounded-[2rem] overflow-hidden flex flex-col">
            <div className="p-8 flex-1">
              <h3 className="text-xl font-medium mb-4">Built for Chicago, Built for Its People</h3>
              <a href="https://medium.com/@zecci77/why-we-named-it-civic-energy-built-for-chicago-built-for-its-people-a21c27b929c9" target="_blank" rel="noopener noreferrer" className="text-sm font-medium hover:text-accent transition-colors underline decoration-black/20 underline-offset-4">View post</a>
            </div>
            <div className="h-48 bg-black/5">
              <img src="https://images.unsplash.com/photo-1643151663724-ab51858d5fe1?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="News" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="relative w-full aspect-square max-w-[550px] mx-auto">
            <div className="absolute inset-8 bg-accent/20 rounded-[3rem] -z-10 translate-x-4 translate-y-4" />
            <div className="absolute left-0 top-0 w-[65%] h-[65%] z-10 flex items-center justify-center">
              <img src="https://images.pexels.com/photos/36905256/pexels-photo-36905256.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Engineers" className="w-full h-full object-contain rounded-[2rem] md:rounded-[3rem]" referrerPolicy="no-referrer" />
            </div>
            <div className="absolute right-0 bottom-0 w-[65%] h-[65%] z-20 flex items-center justify-center">
              <img src="https://images.pexels.com/photos/36905263/pexels-photo-36905263.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="City" className="w-full h-full object-contain rounded-[2rem] md:rounded-[3rem]" referrerPolicy="no-referrer" />
            </div>
          </div>
          
          <div className="space-y-8">
            <h2 className="text-4xl md:text-5xl font-light tracking-tight">Why we're doing this?</h2>
            <p className="text-lg leading-relaxed">
              Civic Energy is committed to making Chicago's commercial real estate sustainable. We are the first of its kind worldwide: a compact, efficient, data-driven energy intelligence platform offering a credible, cost-effective pathway for industry to decarbonise.
            </p>
            <Link to="/about" className="inline-flex items-center gap-2 bg-accent hover:bg-accent-dark text-white px-6 py-3 rounded-full font-medium transition-colors">
              Find out more
              <div className="w-2 h-2 rounded-full bg-white" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 bg-primary text-white mt-8">
        <div className="max-w-4xl mx-auto px-6 text-center flex flex-col items-center">
          <img 
            src="https://images.pexels.com/photos/36906890/pexels-photo-36906890.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
            alt="Civic Energy" 
            className="h-32 md:h-40 object-contain rounded-2xl mb-10"
            referrerPolicy="no-referrer"
          />
          <h2 className="text-3xl md:text-4xl font-light leading-snug mb-12">
            Speak to us to hear how our flexible, affordable decarbonisation technology can benefit you now and in the future.
          </h2>
          <Link to="/contact" className="inline-flex items-center gap-2 bg-white text-primary px-8 py-4 rounded-full font-medium hover:bg-gray-100 transition-colors">
            Contact Us
            <div className="w-2 h-2 rounded-full bg-accent" />
          </Link>
        </div>
      </section>
    </div>
  );
}
