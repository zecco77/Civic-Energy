import { ArrowRight, CheckCircle2, ShieldCheck, MapPin, Star, Clock, Wrench, Zap, Building2, Search, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { useState, useRef } from 'react';

const CONTRACTOR_CATEGORIES = [
  {
    id: 'hvac',
    title: 'HVAC Contractors',
    priority: 'HIGH PRIORITY',
    description: 'These are your money-makers.',
    insight: 'HVAC is the largest source of energy waste in buildings',
    icon: <Zap className="w-6 h-6" />,
    contractors: [
      { name: 'Deljo Heating & Cooling', link: 'https://www.deljoheating.com/' },
      { name: 'Four Seasons Heating, Air Conditioning, Plumbing & Electric', link: 'https://www.fourseasonsheatingcooling.com/' },
      { name: 'ARS / Rescue Rooter Illinois', link: 'https://www.ars.com/chicago' }
    ]
  },
  {
    id: 'lighting',
    title: 'Lighting Contractors',
    priority: 'Quick ROI category',
    description: 'LED + controls = fastest payback (owners love this)',
    insight: 'Lighting upgrades often have the shortest payback period.',
    icon: <Zap className="w-6 h-6" />,
    contractors: [
      { name: 'Eco Engineering Inc.', link: 'https://www.ecoengineering.com/' },
      { name: 'Chicago Lightworks', link: 'https://www.chicagolightworks.com/' },
      { name: 'Midwest Light Energy', link: 'https://midwestlightenergy.com/' }
    ]
  },
  {
    id: 'insulation',
    title: 'Insulation / Building Envelope',
    priority: 'Winter Essential',
    description: 'Insulation + sealing fixes heat loss, especially in Chicago winters',
    insight: 'A tight building envelope is the foundation of energy efficiency.',
    icon: <Building2 className="w-6 h-6" />,
    contractors: [
      { name: 'USA Insulation of Chicago', link: 'https://www.usainsulation.net/chicago/' },
      { name: 'Green Attic Insulation', link: 'https://greenattic.com/' },
      { name: 'Dr. Energy Saver Chicago', link: 'https://www.drenergysaver.com/' }
    ]
  },
  {
    id: 'auditors',
    title: 'Energy Auditors',
    priority: 'Trust layer',
    description: 'Energy audits identify where buildings are wasting energy and what to fix',
    insight: 'Start here if you are unsure where your building is losing money.',
    icon: <Search className="w-6 h-6" />,
    contractors: [
      { name: 'Priority Energy', link: 'https://www.priorityenergy.com/' },
      { name: 'Chicago Energy Consultants', link: 'https://www.chicagoenergyconsultants.com/' },
      { name: 'Certasun', link: 'https://certasun.com/' }
    ]
  }
];

const AUTHORIZED_CONTRACTORS = [
  {
    id: 'hvac-1',
    name: 'Deljo Heating & Cooling',
    category: 'HVAC Upgrades',
    rating: 4.9,
    reviews: 128,
    avgCost: '$15k - $45k',
    license: '#055-123456',
    responseTime: 'Typically responds within 2 hours',
    link: 'https://www.deljoheating.com/'
  },
  {
    id: 'hvac-2',
    name: 'Four Seasons Heating & Cooling',
    category: 'HVAC Upgrades',
    rating: 4.8,
    reviews: 342,
    avgCost: '$12k - $50k',
    license: '#055-987654',
    responseTime: 'Typically responds within 4 hours',
    link: 'https://www.fourseasonsheatingcooling.com/'
  },
  {
    id: 'hvac-3',
    name: 'ARS / Rescue Rooter Illinois',
    category: 'HVAC Upgrades',
    rating: 4.6,
    reviews: 215,
    avgCost: '$10k - $40k',
    license: '#055-112233',
    responseTime: 'Typically responds within 24 hours',
    link: 'https://www.ars.com/chicago'
  },
  {
    id: 'lighting-1',
    name: 'Eco Engineering Inc.',
    category: 'Lighting and Controls',
    rating: 4.9,
    reviews: 85,
    avgCost: '$5k - $25k',
    license: '#055-456789',
    responseTime: 'Typically responds within 24 hours',
    link: 'https://www.ecoengineering.com/'
  },
  {
    id: 'lighting-2',
    name: 'Chicago Lightworks',
    category: 'Lighting and Controls',
    rating: 4.7,
    reviews: 64,
    avgCost: '$8k - $30k',
    license: '#055-654321',
    responseTime: 'Typically responds within 12 hours',
    link: 'https://www.chicagolightworks.com/'
  },
  {
    id: 'lighting-3',
    name: 'Midwest Light Energy',
    category: 'Lighting and Controls',
    rating: 4.8,
    reviews: 92,
    avgCost: '$10k - $40k',
    license: '#055-789012',
    responseTime: 'Typically responds within 4 hours',
    link: 'https://midwestlightenergy.com/'
  },
  {
    id: 'envelope-1',
    name: 'USA Insulation of Chicago',
    category: 'Building Envelope',
    rating: 4.8,
    reviews: 112,
    avgCost: '$10k - $35k',
    license: '#055-112233',
    responseTime: 'Typically responds within 4 hours',
    link: 'https://www.usainsulation.net/chicago/'
  },
  {
    id: 'envelope-2',
    name: 'Green Attic Insulation',
    category: 'Building Envelope',
    rating: 4.9,
    reviews: 205,
    avgCost: '$8k - $20k',
    license: '#055-334455',
    responseTime: 'Typically responds within 2 hours',
    link: 'https://greenattic.com/'
  },
  {
    id: 'envelope-3',
    name: 'Dr. Energy Saver Chicago',
    category: 'Building Envelope',
    rating: 4.7,
    reviews: 156,
    avgCost: '$12k - $40k',
    license: '#055-556677',
    responseTime: 'Typically responds within 24 hours',
    link: 'https://www.drenergysaver.com/'
  },
  {
    id: 'auditors-1',
    name: 'Priority Energy',
    category: 'Energy Auditors',
    rating: 5.0,
    reviews: 45,
    avgCost: '$1k - $5k',
    license: '#055-998877',
    responseTime: 'Typically responds within 24 hours',
    link: 'https://www.priorityenergy.com/'
  },
  {
    id: 'auditors-2',
    name: 'Chicago Energy Consultants',
    category: 'Energy Auditors',
    rating: 4.9,
    reviews: 78,
    avgCost: '$1.5k - $6k',
    license: '#055-887766',
    responseTime: 'Typically responds within 12 hours',
    link: 'https://www.chicagoenergyconsultants.com/'
  },
  {
    id: 'auditors-3',
    name: 'Certasun',
    category: 'Energy Auditors',
    rating: 4.8,
    reviews: 312,
    avgCost: '$2k - $8k',
    license: '#055-776655',
    responseTime: 'Typically responds within 4 hours',
    link: 'https://certasun.com/'
  }
];

const CATEGORIES = ['HVAC Upgrades', 'Building Envelope', 'Lighting and Controls', 'Energy Auditors'];

export function ContractorsPage() {
  const [showResults, setShowResults] = useState(false);
  const [activeTab, setActiveTab] = useState(CATEGORIES[0]);
  const resultsRef = useRef<HTMLDivElement>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    businessName: '',
    licenseNumber: '',
    specialties: [] as string[],
    serviceArea: '',
    projectSize: '$10k - $50k'
  });

  const handleSpecialtyChange = (spec: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(spec)
        ? prev.specialties.filter(s => s !== spec)
        : [...prev.specialties, spec]
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      // Reset form after 5 seconds
      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({
          businessName: '',
          licenseNumber: '',
          specialties: [],
          serviceArea: '',
          projectSize: '$10k - $50k'
        });
      }, 5000);
    }, 1500);
  };

  const filteredContractors = AUTHORIZED_CONTRACTORS.filter(c => c.category === activeTab);

  const handleFindContractors = () => {
    setShowResults(true);
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  return (
    <div className="bg-bg text-primary min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 border border-primary/20">
          Vetted Chicago Professionals
        </div>
        <h1 className="text-5xl md:text-7xl font-semibold tracking-tight mb-8 max-w-4xl mx-auto leading-tight text-primary">
          The right contractor for your exact improvement.
        </h1>
        <p className="text-xl text-primary/60 mb-12 max-w-2xl mx-auto leading-relaxed">
          Every contractor on Civic Energy is license-verified through the Illinois DFPR, reviewed by Chicago building owners, and briefed on ComEd and Peoples Gas rebate claim processes.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={handleFindContractors}
            className="w-full sm:w-auto bg-accent hover:bg-accent-dark text-white px-8 py-4 rounded-full font-medium text-lg transition-colors shadow-sm"
          >
            Find Contractors
          </button>
          <button 
            onClick={() => document.getElementById('application-form')?.scrollIntoView({ behavior: 'smooth' })}
            className="w-full sm:w-auto bg-white border border-black/10 hover:bg-black/5 text-primary px-8 py-4 rounded-full font-medium text-lg transition-colors shadow-sm"
          >
            Join as a Contractor
          </button>
        </div>
      </section>

      {/* Results Section */}
      <AnimatePresence>
        {showResults && (
          <motion.section 
            ref={resultsRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="py-24 bg-white border-y border-black/5"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-semibold text-primary tracking-tight mb-4">Recommended Contractors</h2>
                <p className="text-primary/60 max-w-2xl mx-auto">Based on the most common energy efficiency challenges in Chicago buildings.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                {CONTRACTOR_CATEGORIES.map((category) => (
                  <div key={category.id} className="bg-bg rounded-[2rem] p-8 border border-black/5 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                          {category.icon}
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-primary tracking-tight">{category.title}</h3>
                          <span className="text-xs font-bold text-accent tracking-wider uppercase">{category.priority}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mb-8 flex-grow">
                      <div className="text-sm text-primary/60 bg-white/50 p-4 rounded-xl border border-black/5 min-h-[4rem] flex items-center">
                        <p>{category.insight}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {category.contractors.map((contractor, idx) => (
                        <a 
                          key={idx}
                          href={contractor.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-4 bg-white rounded-2xl border border-black/5 hover:border-primary/30 hover:shadow-md transition-all group"
                        >
                          <span className="font-medium text-primary group-hover:text-accent transition-colors line-clamp-1">{contractor.name}</span>
                          <ExternalLink className="w-4 h-4 text-primary/20 group-hover:text-accent transition-colors shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* How Contractor Matching Works Section */}
      <section className="py-24 bg-white border-y border-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-bg rounded-3xl p-8 border border-black/5 shadow-sm">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                <MapPin className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-primary mb-3 tracking-tight">Matched to Your Building</h3>
              <p className="text-primary/60 leading-relaxed text-sm">
                We only show you contractors who specialize in the improvements your specific building needs — HVAC, insulation, lighting, or controls.
              </p>
            </div>
            <div className="bg-bg rounded-3xl p-8 border border-black/5 shadow-sm">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                <ShieldCheck className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-primary mb-3 tracking-tight">License Verified</h3>
              <p className="text-primary/60 leading-relaxed text-sm">
                Every contractor listing displays their Illinois DFPR license number, insurance status, and BPI certification where applicable.
              </p>
            </div>
            <div className="bg-bg rounded-3xl p-8 border border-black/5 shadow-sm">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                <Zap className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-primary mb-3 tracking-tight">Rebate-Fluent</h3>
              <p className="text-primary/60 leading-relaxed text-sm">
                Contractors on our platform are trained on ComEd and Peoples Gas rebate processes. They handle paperwork so you capture the full incentive.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contractor Category Tabs Section */}
      <section className="py-24 bg-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto pb-4 mb-8 gap-4 scrollbar-hide">
            {CATEGORIES.map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap px-6 py-3 rounded-full text-sm font-medium transition-colors shadow-sm ${
                  activeTab === tab 
                    ? 'bg-primary text-white' 
                    : 'bg-white text-primary hover:bg-black/5 border border-black/5'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContractors.map((contractor) => (
              <div key={contractor.id} className="bg-white rounded-3xl p-6 border border-black/5 hover:border-primary/30 transition-colors group shadow-sm flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-xl font-semibold text-primary mb-1 tracking-tight">{contractor.name}</h4>
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                      {contractor.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 bg-bg px-2 py-1 rounded-lg border border-black/5 shrink-0">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-semibold text-primary">{contractor.rating}</span>
                    <span className="text-xs text-primary/60">({contractor.reviews})</span>
                  </div>
                </div>
                
                <div className="space-y-3 mb-6 flex-grow">
                  <div className="flex items-center gap-2 text-sm text-primary/70">
                    <Building2 className="w-4 h-4 shrink-0" />
                    <span>Avg. Project: {contractor.avgCost}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-primary/70">
                    <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                    <span>DFPR License: {contractor.license}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-primary/70">
                    <Clock className="w-4 h-4 shrink-0" />
                    <span>{contractor.responseTime}</span>
                  </div>
                </div>
                
                <a 
                  href={contractor.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-bg hover:bg-accent text-primary hover:text-white px-4 py-3 rounded-full font-medium text-sm transition-colors flex items-center justify-center gap-2 group-hover:bg-accent group-hover:text-white border border-black/5 group-hover:border-primary"
                >
                  Request Quote
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Request Quote Flow Section */}
      <section className="py-24 bg-white border-y border-black/5 text-center">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-semibold text-primary mb-16 tracking-tight">How to get quotes</h2>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 border-t-2 border-dashed border-primary/30 -z-10"></div>
            
            <div className="bg-bg rounded-3xl p-6 border border-black/5 w-full md:w-1/3 relative z-10 shadow-sm">
              <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-semibold text-lg mx-auto mb-4 shadow-sm">1</div>
              <p className="text-primary font-medium">Your building data is pre-filled.</p>
            </div>
            
            <div className="bg-bg rounded-3xl p-6 border border-black/5 w-full md:w-1/3 relative z-10 shadow-sm">
              <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-semibold text-lg mx-auto mb-4 shadow-sm">2</div>
              <p className="text-primary font-medium">Select up to three contractors.</p>
            </div>
            
            <div className="bg-bg rounded-3xl p-6 border border-black/5 w-full md:w-1/3 relative z-10 shadow-sm">
              <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-semibold text-lg mx-auto mb-4 shadow-sm">3</div>
              <p className="text-primary font-medium">Receive comparable quotes within 48 hours.</p>
            </div>
          </div>
          
          <Link 
            to="/pricing"
            className="inline-block mt-16 bg-accent hover:bg-accent-dark text-white px-8 py-4 rounded-full font-medium text-lg transition-colors shadow-sm"
          >
            Request Your First Quote
          </Link>
        </div>
      </section>

      {/* For Contractors Section */}
      <section id="application-form" className="py-24 bg-bg border-l-4 border-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-16 items-center">
          <div className="lg:w-1/2 space-y-8">
            <h2 className="text-4xl font-semibold text-primary tracking-tight">Grow your Chicago contracting business.</h2>
            <p className="text-xl text-primary/60 leading-relaxed">
              Civic Energy connects licensed contractors with pre-qualified commercial building owners who have already seen their savings analysis and are ready to move forward.
            </p>
            <ul className="space-y-4 text-primary/70">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                <span>Leads arrive with full building context already analyzed.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                <span>No cold outreach required. Building owners request quotes directly.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                <span>Pay per qualified lead or monthly listing fee.</span>
              </li>
            </ul>
            <button className="bg-white border border-black/10 hover:bg-black/5 text-primary px-8 py-4 rounded-full font-medium text-lg transition-colors shadow-sm">
              Apply to Join the Network
            </button>
          </div>
          
          <div className="lg:w-1/2 w-full">
            <div className="bg-white rounded-[2rem] p-8 border border-black/5 shadow-md relative overflow-hidden">
              {isSubmitted ? (
                <div className="absolute inset-0 bg-white z-10 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-semibold text-primary mb-2">Thank you for submitting!</h3>
                  <p className="text-primary/60">Our admin team will review your application and get back to you within 2 business days.</p>
                </div>
              ) : null}
              
              <h3 className="text-2xl font-semibold text-primary mb-6 tracking-tight">Contractor Application</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-primary/70 mb-1">Business Name</label>
                  <input 
                    type="text" 
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-bg border border-black/5 rounded-xl px-4 py-3 text-primary focus:outline-none focus:ring-2 focus:ring-primary/50" 
                    placeholder="e.g. Acme HVAC" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary/70 mb-1">DFPR License Number</label>
                  <input 
                    type="text" 
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-bg border border-black/5 rounded-xl px-4 py-3 text-primary focus:outline-none focus:ring-2 focus:ring-primary/50" 
                    placeholder="e.g. 055-123456" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary/70 mb-2">Specialties</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['HVAC', 'Lighting', 'Envelope', 'Controls'].map(spec => (
                      <label key={spec} className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={formData.specialties.includes(spec)}
                          onChange={() => handleSpecialtyChange(spec)}
                          className="rounded bg-bg border-black/10 text-primary focus:ring-primary" 
                        />
                        <span className="text-sm text-primary/70">{spec}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-primary/70 mb-1">Service Area (ZIPs)</label>
                    <input 
                      type="text" 
                      name="serviceArea"
                      value={formData.serviceArea}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-bg border border-black/5 rounded-xl px-4 py-3 text-primary focus:outline-none focus:ring-2 focus:ring-primary/50" 
                      placeholder="e.g. 60601, 60602" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary/70 mb-1">Avg. Project Size</label>
                    <select 
                      name="projectSize"
                      value={formData.projectSize}
                      onChange={handleInputChange}
                      className="w-full bg-bg border border-black/5 rounded-xl px-4 py-3 text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      <option value="$10k - $50k">$10k - $50k</option>
                      <option value="$50k - $100k">$50k - $100k</option>
                      <option value="$100k+">$100k+</option>
                    </select>
                  </div>
                </div>
                <div className="mt-8 text-center pt-4">
                  <p className="text-sm text-primary/50 mb-4">Applications reviewed within 2 business days.</p>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-accent hover:bg-accent-dark text-white px-8 py-4 rounded-full font-medium text-lg transition-colors shadow-sm disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Apply Now'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
