import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, TrendingDown, Zap, AlertTriangle, CheckCircle2, Lock, ArrowRight, DollarSign, Activity, Settings, Wrench, BarChart3, Cloud, Building2, Star, Calendar, FileText, Download, LockOpen, X, Plus, ShieldCheck, Clock, Info, Sparkles, Brain, Target, Lightbulb } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { BenchmarkingData } from '../services/chicagoData';
import { calculateFinancials, formatCurrency } from '../services/financials';
import { cn } from '../lib/utils';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, doc, setDoc, deleteDoc, getDoc, query, where, getDocs } from 'firebase/firestore';

import { NeighborhoodMap } from './NeighborhoodMap';
import { BuildingExplorer } from './BuildingExplorer';
import { BillUpload } from './BillUpload';

interface DashboardProps {
  building: BenchmarkingData;
  onBack: () => void;
}

const MetricTooltip = ({ title, tooltip, titleClassName = "text-sm text-primary/60 font-medium", align = "center", className = "mb-1" }: { title: string, tooltip: string, titleClassName?: string, align?: "left" | "center" | "right", className?: string }) => (
  <div className={cn("group relative inline-flex items-center gap-1.5", className)}>
    <p className={titleClassName}>{title}</p>
    <Info className="w-3.5 h-3.5 text-primary/40 cursor-help" />
    <div className={cn(
      "absolute bottom-full mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none font-normal leading-relaxed text-center",
      align === "center" ? "left-1/2 -translate-x-1/2" : align === "left" ? "left-0" : "right-0"
    )}>
      {tooltip}
      <div className={cn(
        "absolute top-full border-4 border-transparent border-t-gray-900",
        align === "center" ? "left-1/2 -translate-x-1/2" : align === "left" ? "left-4" : "right-4"
      )}></div>
    </div>
  </div>
);

export function Dashboard({ building, onBack }: DashboardProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'loss' | 'diagnostics' | 'decisions' | 'contractors' | 'tracking' | 'map' | 'bills' | 'ai'>('loss');
  const [activeContractorCategory, setActiveContractorCategory] = useState('All');
  const [acceptedBid, setAcceptedBid] = useState<number | null>(null);
  const [expandedBid, setExpandedBid] = useState<number | null>(null);
  const [isRequestingBids, setIsRequestingBids] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [trackingPeriod, setTrackingPeriod] = useState<'1Y' | 'YTD' | 'ALL'>('1Y');
  const [selectedActions, setSelectedActions] = useState<number[]>([0, 1, 2]); // Default all selected
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isBillUploadPageOpen, setIsBillUploadPageOpen] = useState(false);
  const [isInPortfolio, setIsInPortfolio] = useState(false);
  const [portfolioDocId, setPortfolioDocId] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [refinedFinancials, setRefinedFinancials] = useState<any>(null);

  const baseFinancials = calculateFinancials(building);
  const financials = refinedFinancials || baseFinancials;
  const buildingSize = parseFloat(building.gross_floor_area_buildings_sq_ft || '0');

  const formatValue = (value: number) => {
    if (refinedFinancials) {
      return formatCurrency(value);
    }
    const min = value * 0.85;
    const max = value * 1.15;
    return `${formatCurrency(min)} - ${formatCurrency(max)}`;
  };

  const confidenceScore = refinedFinancials?.confidenceScore || 'Low';

  useEffect(() => {
    const checkPortfolio = async (uid: string) => {
      try {
        const q = query(
          collection(db, 'portfolioBuildings'),
          where('uid', '==', uid),
          where('buildingId', '==', building.id)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          setIsInPortfolio(true);
          setPortfolioDocId(querySnapshot.docs[0].id);
        } else {
          setIsInPortfolio(false);
          setPortfolioDocId(null);
        }
      } catch (error) {
        console.error("Error checking portfolio:", error);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        checkPortfolio(user.uid);
        setIsTracking(false);
      } else {
        setIsInPortfolio(false);
        setPortfolioDocId(null);
      }
    });

    return () => unsubscribe();
  }, [building.id]);

  const handleAddToPortfolio = async () => {
    if (!auth.currentUser) {
      navigate('/login', { state: { from: '/dashboard' } });
      return;
    }

    setLoadingAction('portfolio');
    try {
      if (isInPortfolio && portfolioDocId) {
        await deleteDoc(doc(db, 'portfolioBuildings', portfolioDocId));
        setIsInPortfolio(false);
        setPortfolioDocId(null);
      } else {
        const newDocRef = doc(collection(db, 'portfolioBuildings'));
        await setDoc(newDocRef, {
          uid: auth.currentUser.uid,
          buildingId: building.id,
          propertyName: building.property_name || '',
          address: building.address || '',
          propertyType: building.primary_property_type || '',
          sqFt: parseFloat(building.gross_floor_area_buildings_sq_ft || '0'),
          yearBuilt: parseInt(building.year_built || '0', 10),
          energyStarScore: parseFloat(building.energy_star_score || '0'),
          ghgEmissions: parseFloat(building.total_ghg_emissions_metric_tons_co2e || '0'),
          customName: building.property_name || building.address,
          createdAt: new Date().toISOString()
        });
        setIsInPortfolio(true);
        setPortfolioDocId(newDocRef.id);
      }
    } catch (error) {
      console.error('Error adding to portfolio:', error);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleToggleTracking = async () => {
    if (!auth.currentUser) {
      navigate('/login', { state: { from: '/dashboard' } });
      return;
    }

    setLoadingAction('tracking');
    try {
      // We'll use mock data for now since we don't have a database setup yet
      setIsTracking(!isTracking);
    } catch (error) {
      console.error('Error toggling tracking:', error);
    } finally {
      setLoadingAction(null);
    }
  };

  const baseMonthly = financials.totalAnnualCost / 12;
  const seasonalFactors = [1.1, 1.0, 0.9, 0.8, 0.9, 1.2, 1.3, 1.3, 1.1, 0.9, 1.0, 1.1];

  const toggleAction = (index: number) => {
    setSelectedActions(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const actionsData = [
    {
      savings: financials.savingsPotential * 0.15,
      cost: financials.savingsPotential * 0.15 * 2.0,
      paybackMonths: 24,
      roi: 50
    },
    {
      savings: financials.savingsPotential * 0.20,
      cost: financials.savingsPotential * 0.20 * 3.5,
      paybackMonths: 42,
      roi: 28
    },
    {
      savings: financials.savingsPotential * 0.10,
      cost: financials.savingsPotential * 0.10 * 5.0,
      paybackMonths: 60,
      roi: 20
    },
    {
      savings: financials.savingsPotential * 0.25,
      cost: financials.savingsPotential * 0.25 * 3.0,
      paybackMonths: 36,
      roi: 33
    },
    {
      savings: financials.savingsPotential * 0.15,
      cost: financials.savingsPotential * 0.15 * 6.0,
      paybackMonths: 72,
      roi: 16
    },
    {
      savings: financials.savingsPotential * 0.05,
      cost: financials.savingsPotential * 0.05 * 1.5,
      paybackMonths: 18,
      roi: 66
    },
    {
      savings: financials.savingsPotential * 0.20,
      cost: financials.savingsPotential * 0.20 * 7.0,
      paybackMonths: 84,
      roi: 14
    },
    {
      savings: financials.savingsPotential * 0.05,
      cost: financials.savingsPotential * 0.05 * 4.0,
      paybackMonths: 48,
      roi: 25
    }
  ];

  const selectedSavings = selectedActions.reduce((sum, idx) => sum + actionsData[idx].savings, 0);
  const selectedCost = selectedActions.reduce((sum, idx) => sum + actionsData[idx].cost, 0);
  const selectedTenYearSavings = (selectedSavings * 10) - selectedCost;
  const selectedROI = selectedCost > 0 ? (selectedSavings / selectedCost) * 100 : 0;

  const allTimeChartData = useMemo(() => {
    const data = [];
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    
    for (let i = -24; i <= 12; i++) {
      const d = new Date(currentYear, currentMonth + i, 1);
      const monthIdx = d.getMonth();
      const year = d.getFullYear();
      const monthName = d.toLocaleString('default', { month: 'short' });
      const label = `${monthName} '${year.toString().slice(-2)}`;
      
      const baseline = baseMonthly * seasonalFactors[monthIdx];
      const dynamicMonthlySavings = selectedSavings / 12;
      
      const isFuture = i > 0;
      
      data.push({
        month: label,
        actual: isFuture ? null : Math.round(baseline),
        projected: isFuture ? Math.round(baseline - (dynamicMonthlySavings * seasonalFactors[monthIdx])) : (i === 0 ? Math.round(baseline) : null),
        baseline: Math.round(baseline),
        date: d
      });
    }
    return data;
  }, [baseMonthly, selectedSavings]);

  const filteredChartData = useMemo(() => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    if (trackingPeriod === 'YTD') {
      return allTimeChartData.filter(d => d.date.getFullYear() === currentYear);
    } else if (trackingPeriod === '1Y') {
      const oneYearAgo = new Date(currentYear - 1, currentMonth, 1);
      const oneYearFuture = new Date(currentYear, currentMonth + 12, 1);
      return allTimeChartData.filter(d => d.date >= oneYearAgo && d.date <= oneYearFuture);
    }
    return allTimeChartData;
  }, [trackingPeriod, allTimeChartData]);

  const handleDownload = () => {
    setIsDownloading(true);
    
    try {
      // Generate CSV content
      const headers = ['Month', 'Actual Cost', 'Projected Cost', 'Baseline Cost'];
      const csvData = filteredChartData.map(row => `${row.month},${row.actual || ''},${row.projected || ''},${row.baseline}`);
      const csvContent = [headers.join(','), ...csvData].join('\n');
      
      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `energy_cost_trend_${trackingPeriod.toLowerCase()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading CSV:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const pieData = [
    { name: 'Electricity', value: financials.electricityCost, color: '#3b82f6' },
    { name: 'Natural Gas', value: financials.gasCost, color: '#f97316' },
  ].filter(d => d.value > 0);

  if (isBillUploadPageOpen) {
    return (
      <div className="min-h-screen bg-bg flex flex-col">
        <header className="bg-white border-b border-black/5 sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsBillUploadPageOpen(false)}
                className="p-2 -ml-2 hover:bg-black/5 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-primary" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-primary tracking-tight">Impact Analysis</h1>
                <p className="text-sm text-primary/60">{building.property_name || building.address}</p>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
          <BillUpload 
            currentFinancials={baseFinancials}
            onRefinedData={(data) => setRefinedFinancials(data)}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-primary pb-20">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-black/5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="p-2 -ml-2 text-primary/60 hover:text-primary hover:bg-black/5 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-primary truncate max-w-[300px] sm:max-w-md">
                {building.property_name || building.address}
              </h1>
              <p className="text-xs text-primary/60 font-mono">
                {building.address} • {building.primary_property_type}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setActiveTab('contractors')}
              className="bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2 rounded-xl text-sm font-medium transition-colors hidden sm:block"
            >
              Connect with Contractors
            </button>
            <button 
              onClick={handleAddToPortfolio}
              disabled={loadingAction === 'portfolio'}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-sm hidden sm:flex",
                isInPortfolio
                  ? "bg-primary/10 text-primary hover:bg-primary/20"
                  : "bg-primary text-white hover:bg-black"
              )}
            >
              <Plus className={cn("w-4 h-4 transition-transform", isInPortfolio && "rotate-45")} />
              {isInPortfolio ? "In Portfolio" : "Add to Portfolio"}
            </button>
            <button 
              onClick={() => setIsReportModalOpen(true)}
              className="bg-accent hover:bg-accent-dark text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm"
            >
              Unlock Report
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Step 1: Instant Loss Discovery */}
        <section className="space-y-6">
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-3xl font-bold tracking-tight text-primary">Financial Snapshot</h2>
                  <div className={cn(
                    "px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1", 
                    confidenceScore === 'High' ? "bg-emerald-100 text-emerald-700" : 
                    confidenceScore === 'Medium' ? "bg-blue-100 text-blue-700" : 
                    "bg-amber-100 text-amber-700"
                  )}>
                    <CheckCircle2 className="w-3 h-3" />
                    Data Confidence: {confidenceScore}
                  </div>
                </div>
                <p className="text-primary/60 mt-1">
                  {confidenceScore === 'High' 
                    ? "Powered by Chicago Benchmarking, EIA, NREL, NOAA, OpenStreetMap, Census & Green Button APIs"
                    : "Based on Chicago Benchmarking Data & ComEd/Peoples Gas Rates"}
                </p>
              </div>
              <button 
                onClick={() => setIsBillUploadPageOpen(true)}
                className="bg-accent hover:bg-accent-dark text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Upload Bills & Utilities
              </button>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex bg-black/5 p-1 rounded-full overflow-x-auto hide-scrollbar max-w-[calc(100vw-2rem)] sm:max-w-none">
                <button 
                  onClick={() => setActiveTab('loss')}
                  className={cn("px-4 py-1.5 text-sm font-medium rounded-full transition-all whitespace-nowrap", activeTab === 'loss' ? "bg-white text-primary shadow-[0_1px_3px_rgba(0,0,0,0.1)]" : "text-primary/60 hover:text-primary")}
                >
                  Loss Discovery
                </button>
                <button 
                  onClick={() => setActiveTab('diagnostics')}
                  className={cn("px-4 py-1.5 text-sm font-medium rounded-full transition-all whitespace-nowrap", activeTab === 'diagnostics' ? "bg-white text-primary shadow-[0_1px_3px_rgba(0,0,0,0.1)]" : "text-primary/60 hover:text-primary")}
                >
                  Diagnostics
                </button>
                <button 
                  onClick={() => setActiveTab('decisions')}
                  className={cn("px-4 py-1.5 text-sm font-medium rounded-full transition-all whitespace-nowrap", activeTab === 'decisions' ? "bg-white text-primary shadow-[0_1px_3px_rgba(0,0,0,0.1)]" : "text-primary/60 hover:text-primary")}
                >
                  Action Plan
                </button>
                <button 
                  onClick={() => setActiveTab('contractors')}
                  className={cn("px-4 py-1.5 text-sm font-medium rounded-full transition-all whitespace-nowrap flex items-center gap-1.5", activeTab === 'contractors' ? "bg-white text-primary shadow-[0_1px_3px_rgba(0,0,0,0.1)]" : "text-primary/60 hover:text-primary")}
                >
                  Contractor Bids
                </button>
                <button 
                  onClick={() => setActiveTab('tracking')}
                  className={cn("px-4 py-1.5 text-sm font-medium rounded-full transition-all whitespace-nowrap flex items-center gap-1.5", activeTab === 'tracking' ? "bg-white text-primary shadow-[0_1px_3px_rgba(0,0,0,0.1)]" : "text-primary/60 hover:text-primary")}
                >
                  Savings Tracking
                </button>
                <button 
                  onClick={() => setActiveTab('map')}
                  className={cn("px-4 py-1.5 text-sm font-medium rounded-full transition-all whitespace-nowrap flex items-center gap-1.5", activeTab === 'map' ? "bg-white text-primary shadow-[0_1px_3px_rgba(0,0,0,0.1)]" : "text-primary/60 hover:text-primary")}
                >
                  Neighbour Comparison
                </button>
                <button 
                  onClick={() => setActiveTab('ai')}
                  className={cn("px-4 py-1.5 text-sm font-medium rounded-full transition-all whitespace-nowrap flex items-center gap-1.5", activeTab === 'ai' ? "bg-white text-primary shadow-[0_1px_3px_rgba(0,0,0,0.1)]" : "text-primary/60 hover:text-primary")}
                >
                  <Sparkles className="w-4 h-4 text-blue-500" />
                  AI Summary
                </button>
              </div>
            </div>
          </div>

          {activeTab === 'map' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative z-0"
            >
              <BuildingExplorer 
                building={building} 
                onClose={() => setActiveTab('loss')}
                onReviewReport={() => setIsReportModalOpen(true)}
                formatValue={formatValue}
                confidenceScore={confidenceScore}
              />
            </motion.div>
          )}

          {activeTab === 'ai' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-3xl p-8 shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-black/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                  <Sparkles className="w-64 h-64" />
                </div>
                
                <div className="flex items-center gap-3 mb-6 relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                    <Brain className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold text-primary tracking-tight">AI Executive Summary</h3>
                    <p className="text-primary/60">A synthesized overview of your building's energy profile and action plan.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
                  <div className="lg:col-span-2 space-y-8">
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-primary flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-rose-500" />
                        The Problem: Significant Energy Waste
                      </h4>
                      <p className="text-primary/80 leading-relaxed">
                        Your building is currently losing an estimated <span className="font-semibold text-rose-600">{formatValue(financials.estimatedWastedEnergy)}</span> annually due to inefficiencies. 
                        With an ENERGY STAR score of <span className="font-semibold">{building.energy_star_score || 'N/A'}</span>, it performs in the bottom half of similar properties in Chicago. 
                        The primary culprits are likely aging HVAC systems, poor envelope insulation, and outdated lighting.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-primary flex items-center gap-2">
                        <Target className="w-5 h-5 text-blue-500" />
                        The Solution: Targeted Retrofits
                      </h4>
                      <p className="text-primary/80 leading-relaxed">
                        By implementing the recommended action plan—starting with LED retrofits and HVAC optimization—you can eliminate up to <span className="font-semibold text-blue-600">{financials.savingsPotentialPercentage.toFixed(1)}%</span> of your energy waste. 
                        These upgrades are not just expenses; they are investments that will increase your Net Operating Income (NOI) by an estimated <span className="font-semibold text-emerald-600">{formatValue(financials.increasedNOI)}</span> per year.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-primary flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-amber-500" />
                        The Impact: Value Creation
                      </h4>
                      <p className="text-primary/80 leading-relaxed">
                        Beyond immediate utility savings, these improvements will boost your building's overall asset value by approximately <span className="font-semibold text-primary">{formatValue(financials.increasedBuildingValue)}</span>. 
                        Furthermore, you will reduce your carbon footprint by <span className="font-semibold">{building.total_ghg_emissions_metric_tons_co2e ? (Number(building.total_ghg_emissions_metric_tons_co2e) * 0.2).toFixed(1) : 'N/A'} tons</span> annually, aligning with Chicago's sustainability goals and avoiding potential future emissions penalties.
                      </p>
                    </div>
                  </div>

                  <div className="bg-bg rounded-2xl p-6 space-y-6">
                    <h4 className="font-semibold text-primary border-b border-black/5 pb-4">Key Takeaways</h4>
                    
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-primary/60 uppercase font-bold mb-1">Total Savings Potential</p>
                        <p className="text-2xl font-bold text-emerald-600">{formatValue(financials.savingsPotential)} <span className="text-sm font-normal text-emerald-600/70">/ yr</span></p>
                      </div>
                      
                      <div>
                        <p className="text-xs text-primary/60 uppercase font-bold mb-1">Estimated ROI</p>
                        <p className="text-2xl font-bold text-blue-600">22% - 35%</p>
                      </div>
                      
                      <div>
                        <p className="text-xs text-primary/60 uppercase font-bold mb-1">Payback Period</p>
                        <p className="text-2xl font-bold text-primary">2.5 - 4.5 <span className="text-sm font-normal text-primary/60">Years</span></p>
                      </div>

                      <div>
                        <p className="text-xs text-primary/60 uppercase font-bold mb-1">Available Incentives</p>
                        <p className="text-2xl font-bold text-amber-600">{formatValue(financials.estimatedTaxDeduction)}</p>
                        <p className="text-xs text-amber-700/70 mt-1">179D + Utility Rebates</p>
                      </div>
                    </div>

                    <button 
                      onClick={() => setActiveTab('decisions')}
                      className="w-full bg-primary text-white py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 mt-4"
                    >
                      View Action Plan
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'loss' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <div className="md:col-span-2 space-y-6">
                {/* Primary Loss Card */}
                <div className="bg-white rounded-3xl p-8 shadow-[0_2px_10px_rgba(0,0,0,0.04)] relative flex flex-col lg:flex-row gap-8">
                  <div className="flex-1 relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-500/10 text-rose-600 rounded-full text-sm font-medium mb-6">
                      <AlertTriangle className="w-4 h-4" />
                      Critical Inefficiency Detected
                    </div>
                    <h3 className="text-5xl font-semibold text-primary tracking-tight mb-2">
                      {formatValue(financials.monthlyLoss)} <span className="text-2xl text-primary/60 font-medium">/ mo</span>
                    </h3>
                    <p className="text-xl text-primary/70 mb-8">
                      This building is losing an estimated <span className="text-rose-600 font-medium">{formatValue(financials.estimatedWastedEnergy)}</span> annually to energy inefficiency.
                    </p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                      <div className="bg-bg rounded-2xl p-4">
                        <MetricTooltip title="Daily Bleed" tooltip="The estimated amount of money lost every single day due to building inefficiencies and wasted energy." align="left" />
                        <p className="text-2xl font-semibold text-primary">{formatValue(financials.dailyLoss)}</p>
                      </div>
                      <div className="bg-bg rounded-2xl p-4">
                        <MetricTooltip title="Savings Potential" tooltip="The total estimated annual savings achievable by implementing recommended energy efficiency upgrades." />
                        <p className="text-2xl font-semibold text-primary">{formatValue(financials.savingsPotential)}</p>
                      </div>
                      <div className="bg-bg rounded-2xl p-4 col-span-2 md:col-span-1">
                        <MetricTooltip title="Potential Reduction" tooltip="The percentage of your total energy costs that could be eliminated through efficiency improvements." align="right" />
                        <p className="text-2xl font-semibold text-primary">{financials.savingsPotentialPercentage.toFixed(1)}%</p>
                      </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-black/5">
                      <h4 className="text-lg font-semibold text-primary mb-4">Financial Impact of Upgrades</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
                          <MetricTooltip title="Increased NOI" tooltip="Net Operating Income increase resulting directly from reduced annual operating expenses (energy savings)." align="left" />
                          <p className="text-2xl font-semibold text-emerald-600">+{formatValue(financials.increasedNOI)}</p>
                          <p className="text-xs text-emerald-700/70 mt-1">Directly from energy savings</p>
                        </div>
                        <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
                          <MetricTooltip title="Building Value Increase" tooltip="The estimated increase in the building's asset value, calculated by dividing the Increased NOI by the local capitalization rate." align="right" />
                          <p className="text-2xl font-semibold text-blue-600">+{formatValue(financials.increasedBuildingValue)}</p>
                          <p className="text-xs text-blue-700/70 mt-1">Based on {financials.capRate * 100}% cap rate</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="lg:w-1/3 relative z-10 min-h-[300px] lg:min-h-0">
                    {building.latitude && building.longitude ? (
                      <iframe 
                        src={`https://maps.google.com/maps?q=${building.latitude},${building.longitude}&z=16&output=embed`}
                        className="w-full h-full object-cover rounded-2xl shadow-lg border-0"
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Building Location"
                      ></iframe>
                    ) : (
                      <div className="w-full h-full bg-black/5 rounded-2xl flex items-center justify-center text-primary/40">
                        Location not available
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-8 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-8 border-t border-black/5">
                    <div className="bg-bg rounded-2xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-4 h-4 text-primary" />
                        <MetricTooltip title="Cost Intensity" tooltip="Annual energy cost per square foot of building space." titleClassName="text-xs text-primary/60 font-medium" align="left" className="mb-0" />
                      </div>
                      <p className="text-xl font-semibold text-primary tracking-tight">{formatValue(financials.costPerSqFt)} <span className="text-xs font-normal text-primary/50">/sqft</span></p>
                    </div>
                    <div className="bg-bg rounded-2xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-4 h-4 text-amber-500" />
                        <MetricTooltip title="Site EUI" tooltip="Site Energy Use Intensity (EUI) measures the amount of energy consumed per square foot per year." titleClassName="text-xs text-primary/60 font-medium" align="center" className="mb-0" />
                      </div>
                      <p className="text-xl font-semibold text-primary tracking-tight">{building.site_eui_kbtu_sq_ft || 'N/A'} <span className="text-xs font-normal text-primary/50">kBtu/sqft</span></p>
                    </div>
                    <div className="bg-bg rounded-2xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Cloud className="w-4 h-4 text-primary/40" />
                        <MetricTooltip title="GHG Emissions" tooltip="Total Greenhouse Gas Emissions in Metric Tons of CO2 equivalent per year." titleClassName="text-xs text-primary/60 font-medium" align="center" className="mb-0" />
                      </div>
                      <p className="text-xl font-semibold text-primary tracking-tight">{building.total_ghg_emissions_metric_tons_co2e ? Number(building.total_ghg_emissions_metric_tons_co2e).toLocaleString() : 'N/A'} <span className="text-xs font-normal text-primary/50">MTCO2e</span></p>
                    </div>
                    <div className="bg-bg rounded-2xl p-4 border border-primary/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="w-4 h-4 text-primary" />
                        <MetricTooltip title="179D Tax Deduction" tooltip="Estimated federal tax deduction available for energy-efficient commercial building property." titleClassName="text-xs text-primary/60 font-medium" align="right" className="mb-0" />
                      </div>
                      <p className="text-xl font-semibold text-primary tracking-tight">{formatValue(financials.estimatedTaxDeduction)}</p>
                      <p className="text-[10px] text-primary/40 mt-1">Estimated IRA Federal Credit</p>
                    </div>
                  </div>

                  <div className="mt-8 pt-8 border-t border-black/5">
                    <div className="bg-primary rounded-2xl p-6 text-white relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-6 opacity-10">
                        <TrendingDown className="w-32 h-32" />
                      </div>
                      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
                        <div className="max-w-xl">
                          <h3 className="text-xl font-semibold tracking-tight mb-2">Convert CapEx to OpEx</h3>
                          <p className="text-white/70 text-sm leading-relaxed">
                            Civic Energy funds your retrofits with zero upfront capital. Upgrade costs are covered entirely through guaranteed energy savings, creating immediate positive cash flow and asset value growth.
                          </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                          <button 
                            onClick={() => navigate(auth.currentUser ? '/pricing' : '/signup', { state: { from: '/dashboard' } })}
                            className="bg-accent hover:bg-accent-dark text-white px-6 py-3 rounded-full font-semibold text-sm transition-all shadow-lg hover:scale-105 active:scale-95 whitespace-nowrap"
                          >
                            Get Started Risk-Free
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Context Cards */}
              <div className="space-y-6">
                <div className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
                  <div className="flex items-center justify-between mb-4">
                    <MetricTooltip title="Total Energy Spend" tooltip="The estimated total annual cost of electricity and natural gas for this building." />
                    <DollarSign className="w-5 h-5 text-primary/40" />
                  </div>
                  <p className="text-3xl font-semibold text-primary tracking-tight">{formatValue(financials.totalAnnualCost)}</p>
                  <p className="text-sm text-primary/60 mt-2">Estimated annual cost</p>
                  
                  {pieData.length > 0 && (
                    <div className="h-32 mt-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={30}
                            outerRadius={50}
                            paddingAngle={2}
                            dataKey="value"
                            stroke="none"
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value: number) => formatValue(value)}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  <div className="mt-4 space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-primary/70 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        Electricity (ComEd)
                      </span>
                      <span className="font-medium text-primary">{formatValue(financials.electricityCost)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm pt-2">
                      <span className="text-primary/70 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                        Natural Gas (Peoples Gas)
                      </span>
                      <span className="font-medium text-primary">{formatValue(financials.gasCost)}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-black/5 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-primary/60">Est. Cooling Cost</span>
                      <span className="font-medium text-blue-600">{formatValue(financials.estimatedCoolingCost)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-primary/60">Est. Heating Cost</span>
                      <span className="font-medium text-orange-600">{formatValue(financials.estimatedHeatingCost)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-6 text-primary shadow-sm border border-black/5 relative">
                  <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
                    <div className="absolute -right-4 -bottom-4 opacity-[0.03]">
                      <BarChart3 className="w-32 h-32" />
                    </div>
                  </div>
                  <MetricTooltip title="Peer Comparison" tooltip="Your building's ENERGY STAR score compared to similar properties. A score of 50 is the national median." align="left" />
                  <div className="flex items-baseline gap-2 relative z-10">
                    <span className="text-4xl font-semibold tracking-tight">{building.energy_star_score || 'N/A'}</span>
                    <span className="text-primary/50">/ 100</span>
                  </div>
                  <p className="text-sm text-primary/50 mt-2 relative z-10">
                    ENERGY STAR Score
                  </p>
                  
                  {building.energy_star_score && (
                    <div className="mt-4 relative z-10">
                      <div className="flex justify-between text-xs text-primary/50 mb-1">
                        <span>Bottom 10%</span>
                        <span>Top 10%</span>
                      </div>
                      <div className="w-full bg-black/5 rounded-full h-2 relative">
                        <div 
                          className="absolute top-0 left-0 h-2 rounded-full bg-gradient-to-r from-rose-500 via-yellow-500 to-primary" 
                          style={{ width: '100%' }}
                        ></div>
                        <div 
                          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow border-2 border-primary"
                          style={{ left: `calc(${building.energy_star_score}% - 8px)` }}
                        ></div>
                      </div>
                      <p className="text-xs text-rose-500 mt-3 font-medium">
                        Your building is in the bottom {financials.peerPercentile}% of similar Chicago buildings.
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Building Metrics moved to Primary Loss Card */}

              {/* Zero Upfront banner moved to Primary Loss Card */}
            </motion.div>
          )}

          {/* Step 2: Diagnostic Layer */}
          {activeTab === 'diagnostics' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-3xl p-8 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                  <div className="max-w-3xl">
                    <h3 className="text-2xl font-semibold text-primary tracking-tight mb-4">Why is this happening?</h3>
                    <p className="text-lg text-primary/70">
                      Based on your building's age ({building.year_built || 'Unknown'}), size ({Number(building.gross_floor_area_buildings_sq_ft).toLocaleString()} sq ft), and energy profile compared to similar {building.primary_property_type} properties in Chicago, we've identified the likely sources of waste.
                    </p>
                    <div className="mt-4 p-4 bg-blue-50/50 rounded-2xl text-sm text-primary/80 flex items-start gap-3">
                      <Activity className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                      <p>
                        <strong className="font-medium">Chicago Climate Context:</strong> Local heating degree days (HDD) and cooling degree days (CDD) heavily drive these costs. Your building's envelope and HVAC systems are struggling to maintain efficiency during extreme seasonal shifts.
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 bg-bg p-4 rounded-2xl text-center">
                    <p className="text-sm text-primary/60 font-medium mb-1">Data Confidence</p>
                    <div className="flex items-center gap-1 justify-center text-primary mb-2">
                      <div className={cn("w-2 h-4 rounded-sm", confidenceScore === 'High' || confidenceScore === 'Medium' || confidenceScore === 'Low' ? "bg-primary" : "bg-primary/20")}></div>
                      <div className={cn("w-2 h-4 rounded-sm", confidenceScore === 'High' || confidenceScore === 'Medium' ? "bg-primary" : "bg-primary/20")}></div>
                      <div className={cn("w-2 h-4 rounded-sm", confidenceScore === 'High' ? "bg-primary" : "bg-primary/20")}></div>
                    </div>
                    <p className="text-xs font-bold text-primary uppercase">
                      {confidenceScore}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DiagnosticCard 
                    title="HVAC System Aging"
                    description="Older heating and cooling systems lose 15-20% efficiency. Your high electricity usage suggests cooling inefficiencies during Chicago summers."
                    impact="High"
                    dollarImpact={financials.diagnostics.hvac}
                    icon={<Settings className="w-6 h-6 text-orange-500" />}
                    formatValue={formatValue}
                    tooltip="Heating, Ventilation, and Air Conditioning systems degrade over time. Upgrading or tuning these systems can drastically reduce energy consumption."
                  />
                  <DiagnosticCard 
                    title="Envelope & Insulation Gaps"
                    description="Buildings built in your era often lack modern thermal breaks, leading to significant heat loss during Chicago winters."
                    impact="High"
                    dollarImpact={financials.diagnostics.envelope}
                    icon={<Activity className="w-6 h-6 text-blue-500" />}
                    formatValue={formatValue}
                    tooltip="The building envelope includes walls, windows, and roofs. Poor insulation allows heated or cooled air to escape, forcing HVAC systems to work harder."
                  />
                  <DiagnosticCard 
                    title="Lighting Inefficiency"
                    description="If not fully upgraded to LED with occupancy sensors, lighting can account for up to 30% of wasted electricity."
                    impact="Medium"
                    dollarImpact={financials.diagnostics.lighting}
                    icon={<Zap className="w-6 h-6 text-yellow-500" />}
                    formatValue={formatValue}
                    tooltip="Outdated lighting technologies (like fluorescent or incandescent) consume significantly more electricity than modern LED fixtures."
                  />
                  <DiagnosticCard 
                    title="Peak Demand Charges"
                    description="ComEd commercial rates heavily penalize peak usage. Lack of automated controls exposes you to high demand charges."
                    impact="Medium"
                    dollarImpact={financials.diagnostics.peakDemand}
                    icon={<TrendingDown className="w-6 h-6 text-rose-500" />}
                    formatValue={formatValue}
                    tooltip="Utility companies charge extra when your building draws a large amount of power at once. Smoothing out this usage avoids expensive penalties."
                  />
                  <DiagnosticCard 
                    title="Plug Load & Equipment Waste"
                    description="Computers, monitors, and unmanaged equipment left running overnight draw phantom power continuously."
                    impact="Low"
                    dollarImpact={financials.diagnostics.plugLoad}
                    icon={<Wrench className="w-6 h-6 text-primary/60" />}
                    formatValue={formatValue}
                    tooltip="Energy consumed by devices plugged into standard outlets, even when not actively in use (phantom power)."
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Decision Layer */}
          {activeTab === 'decisions' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
                <div>
                  <h3 className="text-2xl font-semibold text-primary tracking-tight">Recommended Actions</h3>
                  <p className="text-sm text-primary/60 mt-1">Select actions to build your custom plan</p>
                </div>
                
                <div className="bg-primary/5 p-4 rounded-2xl flex items-center gap-6">
                  <div>
                    <p className="text-xs text-primary font-medium uppercase tracking-wider mb-1">Selected 10-Year Value</p>
                    <p className="text-2xl font-semibold text-primary tracking-tight">{formatValue(selectedTenYearSavings)}</p>
                  </div>
                  <div className="w-px h-10 bg-primary/20"></div>
                  <div>
                    <p className="text-xs text-primary font-medium uppercase tracking-wider mb-1">Selected ROI</p>
                    <p className="text-2xl font-semibold text-primary tracking-tight">{selectedROI.toFixed(0)}%</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute -left-3 -top-3 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm z-10">
                    START WITH THIS ONE
                  </div>
                  <ActionCard 
                    title="LED Retrofit & Smart Controls"
                    description="Upgrade all remaining legacy lighting to LED and install networked occupancy sensors."
                    savings={actionsData[0].savings}
                    cost={actionsData[0].cost}
                    paybackMonths={actionsData[0].paybackMonths}
                    roi={actionsData[0].roi}
                    incentives={['ComEd Standard Lighting Rebate', '179D Tax Deduction Eligible']}
                    isSelected={selectedActions.includes(0)}
                    onToggle={() => toggleAction(0)}
                    formatValue={formatValue}
                    tooltip="LEDs use up to 75% less energy and last 25x longer than incandescent lighting. Smart controls ensure lights are only on when spaces are occupied."
                  />
                </div>
                <ActionCard 
                  title="HVAC Rooftop Unit (RTU) Optimization"
                  description="Install advanced RTU controllers with variable frequency drives (VFDs) and demand control ventilation."
                  savings={actionsData[1].savings}
                  cost={actionsData[1].cost}
                  paybackMonths={actionsData[1].paybackMonths}
                  roi={actionsData[1].roi}
                  incentives={['ComEd Custom HVAC Rebate', 'IRA Commercial Credit']}
                  isSelected={selectedActions.includes(1)}
                  onToggle={() => toggleAction(1)}
                  formatValue={formatValue}
                  tooltip="Optimizing RTUs allows fans and compressors to run at partial speeds, matching actual demand rather than running at 100% all the time."
                />
                <ActionCard 
                  title="Building Envelope Sealing & Insulation"
                  description="Targeted air sealing, weatherstripping, and roof insulation to reduce heating load during Chicago winters."
                  savings={actionsData[2].savings}
                  cost={actionsData[2].cost}
                  paybackMonths={actionsData[2].paybackMonths}
                  roi={actionsData[2].roi}
                  incentives={['Peoples Gas Prescriptive Rebate']}
                  isSelected={selectedActions.includes(2)}
                  onToggle={() => toggleAction(2)}
                  formatValue={formatValue}
                  tooltip="Sealing gaps and improving insulation prevents conditioned air from escaping, significantly reducing the workload on heating and cooling systems."
                />
                <ActionCard 
                  title="Building Automation System (BAS) Upgrade"
                  description="Deploy a centralized energy management system to optimize scheduling, setpoints, and peak demand."
                  savings={actionsData[3].savings}
                  cost={actionsData[3].cost}
                  paybackMonths={actionsData[3].paybackMonths}
                  roi={actionsData[3].roi}
                  incentives={['ComEd Custom Rebate', 'Retro-Commissioning (RCx) Incentive']}
                  isSelected={selectedActions.includes(3)}
                  onToggle={() => toggleAction(3)}
                  formatValue={formatValue}
                  tooltip="A BAS acts as the 'brain' of the building, automatically adjusting systems based on occupancy, weather, and time of day to eliminate waste."
                />
                <ActionCard 
                  title="High-Efficiency Boiler Replacement"
                  description="Replace aging atmospheric boilers with condensing boilers (95%+ AFUE) for significant gas savings."
                  savings={actionsData[4].savings}
                  cost={actionsData[4].cost}
                  paybackMonths={actionsData[4].paybackMonths}
                  roi={actionsData[4].roi}
                  incentives={['Peoples Gas Custom Rebate', 'IRA Commercial Credit']}
                  isSelected={selectedActions.includes(4)}
                  onToggle={() => toggleAction(4)}
                  formatValue={formatValue}
                  tooltip="Condensing boilers capture heat from exhaust gases that would normally be vented outside, making them highly efficient."
                />
                <ActionCard 
                  title="Variable Frequency Drives (VFDs)"
                  description="Install VFDs on chilled water pumps and cooling tower fans to match motor speed to actual demand."
                  savings={actionsData[5].savings}
                  cost={actionsData[5].cost}
                  paybackMonths={actionsData[5].paybackMonths}
                  roi={actionsData[5].roi}
                  incentives={['ComEd Standard VFD Rebate']}
                  isSelected={selectedActions.includes(5)}
                  onToggle={() => toggleAction(5)}
                  formatValue={formatValue}
                  tooltip="VFDs allow motors to run at slower speeds when full power isn't needed, drastically reducing electricity consumption."
                />
                <ActionCard 
                  title="Commercial Solar PV Installation"
                  description="Install a rooftop solar array to offset grid electricity and generate long-term renewable energy."
                  savings={actionsData[6].savings}
                  cost={actionsData[6].cost}
                  paybackMonths={actionsData[6].paybackMonths}
                  roi={actionsData[6].roi}
                  incentives={['Illinois Shines (SRECs)', '30% Federal ITC']}
                  isSelected={selectedActions.includes(6)}
                  onToggle={() => toggleAction(6)}
                  formatValue={formatValue}
                  tooltip="Solar panels generate free electricity from the sun, reducing your reliance on the grid and lowering utility bills."
                />
                <ActionCard 
                  title="Domestic Hot Water (DHW) Electrification"
                  description="Upgrade gas-fired water heaters to high-efficiency commercial heat pump water heaters."
                  savings={actionsData[7].savings}
                  cost={actionsData[7].cost}
                  paybackMonths={actionsData[7].paybackMonths}
                  roi={actionsData[7].roi}
                  incentives={['ComEd Heat Pump Rebate', 'IRA Electrification Rebate']}
                  isSelected={selectedActions.includes(7)}
                  onToggle={() => toggleAction(7)}
                  formatValue={formatValue}
                  tooltip="Heat pump water heaters use electricity to move heat from the air to the water, making them 2-3 times more efficient than conventional electric resistance water heaters."
                />
              </div>
            </motion.div>
          )}

          {/* Step 5: Contractor Marketplace */}
          {activeTab === 'contractors' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-3xl p-8 border border-black/5 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-2xl font-semibold text-primary tracking-tight mb-2">Contractor Bids</h3>
                    <p className="text-primary/60">Pre-vetted contractors ready for your action plan.</p>
                  </div>
                  <button 
                    onClick={() => {
                      setIsRequestingBids(true);
                      setTimeout(() => setIsRequestingBids(false), 2000);
                    }}
                    disabled={isRequestingBids}
                    className="bg-accent hover:bg-accent-dark disabled:bg-primary/50 text-white px-4 py-2 rounded-full font-medium text-sm transition-colors shadow-sm"
                  >
                    {isRequestingBids ? 'Requesting...' : 'Request New Bids'}
                  </button>
                </div>

                <div className="flex flex-wrap gap-3 mb-8">
                  {['All', 'HVAC Upgrades', 'Building Envelope', 'Lighting and Controls', 'Energy Auditors', 'Mechanical Systems'].map(category => (
                    <button
                      key={category}
                      onClick={() => setActiveContractorCategory(category)}
                      className={cn(
                        "px-5 py-2.5 rounded-full text-sm font-medium transition-all border",
                        activeContractorCategory === category 
                          ? "bg-[#082E29] text-white border-[#082E29]" 
                          : "bg-white text-primary border-black/10 hover:border-black/20"
                      )}
                    >
                      {category}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    {
                      name: "Chicago Climate Control",
                      rating: 4.9,
                      reviews: 42,
                      category: "HVAC Upgrades",
                      license: "#055-123456",
                      responseTime: "Typically responds within 4 hours",
                      multiplier: 1.08
                    },
                    {
                      name: "Windy City HVAC",
                      rating: 4.5,
                      reviews: 112,
                      category: "HVAC Upgrades",
                      license: "#055-234567",
                      responseTime: "Typically responds within 6 hours",
                      multiplier: 0.95
                    },
                    {
                      name: "Green Buildings Chicago",
                      rating: 4.6,
                      reviews: 87,
                      category: "Building Envelope",
                      license: "#055-901234",
                      responseTime: "Typically responds within 12 hours",
                      multiplier: 0.91
                    },
                    {
                      name: "Lakeside Lighting & Controls",
                      rating: 4.7,
                      reviews: 189,
                      category: "Lighting and Controls",
                      license: "#055-345678",
                      responseTime: "Typically responds within 2 hours",
                      multiplier: 0.88
                    },
                    {
                      name: "Midwest Energy Solutions",
                      rating: 4.8,
                      reviews: 342,
                      category: "Energy Auditors",
                      license: "#055-789012",
                      responseTime: "Typically responds within 24 hours",
                      multiplier: 1.02
                    },
                    {
                      name: "Hill Group Mechanical",
                      rating: 4.8,
                      reviews: 215,
                      category: "Mechanical Systems",
                      license: "#055-567890",
                      responseTime: "Typically responds within 8 hours",
                      multiplier: 1.05
                    },
                    {
                      name: "Illinois Solar & Storage",
                      rating: 4.9,
                      reviews: 104,
                      category: "Mechanical Systems",
                      license: "#055-678901",
                      responseTime: "Typically responds within 24 hours",
                      multiplier: 0.95
                    }
                  ].filter(c => activeContractorCategory === 'All' || c.category === activeContractorCategory).map((contractor, idx) => {
                    const bidAmount = selectedCost > 0 ? selectedCost * contractor.multiplier : 25000 * contractor.multiplier;
                    const estimatedSavings = selectedSavings > 0 ? selectedSavings : 5000;
                    const rebates = bidAmount * 0.25; // 25% estimated rebates
                    const netCost = bidAmount - rebates;
                    const paybackPeriod = netCost / estimatedSavings;

                    return (
                      <div key={idx} className="bg-white rounded-3xl p-6 border border-black/5 shadow-sm flex flex-col">
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="text-xl font-bold text-primary pr-4">{contractor.name}</h4>
                          <div className="flex items-center gap-1 bg-orange-50 px-2 py-1 rounded-lg border border-orange-100 text-sm shrink-0">
                            <Star className="w-4 h-4 text-orange-500 fill-orange-500" />
                            <span className="font-bold text-primary">{contractor.rating}</span>
                            <span className="text-primary/50">({contractor.reviews})</span>
                          </div>
                        </div>
                        <div className="mb-6">
                          <span className="bg-bg px-3 py-1 rounded-lg text-sm text-primary/80 border border-black/5">{contractor.category}</span>
                        </div>
                        
                        <div className="space-y-3 mb-6 flex-1">
                          <div className="flex items-center gap-3 text-sm text-primary/70">
                            <ShieldCheck className="w-4 h-4 shrink-0" />
                            <span>DFPR License: {contractor.license}</span>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-primary/70">
                            <Clock className="w-4 h-4 shrink-0" />
                            <span>{contractor.responseTime}</span>
                          </div>
                        </div>

                        <div className="bg-bg rounded-2xl p-4 mb-6 space-y-3">
                          <h5 className="text-sm font-semibold text-primary mb-2">Estimated Bid Breakdown</h5>
                          <div className="flex justify-between text-sm">
                            <span className="text-primary/60">Gross Project Cost</span>
                            <span className="font-medium text-primary">{formatValue(bidAmount)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-primary/60">Est. Utility Rebates</span>
                            <span className="font-medium text-emerald-600">-{formatValue(rebates)}</span>
                          </div>
                          <div className="h-px bg-black/5 my-2"></div>
                          <div className="flex justify-between text-sm font-semibold">
                            <span className="text-primary">Net Cost to You</span>
                            <span className="text-primary">{formatValue(netCost)}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-black/5">
                            <div>
                              <p className="text-xs text-primary/50 uppercase tracking-wider mb-1">Est. Savings</p>
                              <p className="font-medium text-primary">{formatValue(estimatedSavings)}/yr</p>
                            </div>
                            <div>
                              <p className="text-xs text-primary/50 uppercase tracking-wider mb-1">Payback</p>
                              <p className="font-medium text-primary">{paybackPeriod.toFixed(1)} yrs</p>
                            </div>
                          </div>
                        </div>

                        <button 
                          onClick={() => setAcceptedBid(idx)}
                          className={cn(
                            "w-full py-3 rounded-2xl font-semibold transition-colors flex items-center justify-center gap-2 group",
                            acceptedBid === idx 
                              ? "bg-[#FF7A00] text-white" 
                              : "bg-[#FAF5F0] text-primary hover:bg-[#FF7A00] hover:text-white"
                          )}
                        >
                          {acceptedBid === idx ? 'Quote Requested ✓' : 'Request Quote'} 
                          {acceptedBid !== idx && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 6: Savings Tracking */}
          {activeTab === 'tracking' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-3xl p-6 border border-black/5 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-primary" />
                    </div>
                    <MetricTooltip title="Projected Annual Savings" tooltip="The estimated total amount of money you will save each year after completing the selected upgrades." titleClassName="font-medium text-primary" align="left" />
                  </div>
                  <div className="text-3xl font-semibold text-primary tracking-tight mb-2">
                    {formatValue(selectedSavings)}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-primary font-medium">
                    <TrendingDown className="w-4 h-4" />
                    {Math.round((selectedSavings / financials.totalAnnualCost) * 100)}% of total cost
                  </div>
                </div>
                
                <div className="bg-white rounded-3xl p-6 border border-black/5 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-blue-600" />
                    </div>
                    <MetricTooltip title="Projected Energy Usage" tooltip="Your building's estimated new total energy consumption (in Megawatt-hours) after efficiency improvements." titleClassName="font-medium text-primary" align="center" />
                  </div>
                  <div className="text-3xl font-semibold text-primary tracking-tight mb-2">
                    {Math.round((financials.electricityCost - (selectedSavings * 0.7)) / 0.095 / 1000)} <span className="text-lg text-primary/40 font-normal">MWh</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-primary font-medium">
                    <TrendingDown className="w-4 h-4" />
                    {Math.round((selectedSavings / financials.totalAnnualCost) * 100)}% reduction
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-black/5 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-purple-600" />
                    </div>
                    <MetricTooltip title="Projected ENERGY STAR" tooltip="Your estimated new ENERGY STAR score after upgrades. A higher score increases building value and marketability." titleClassName="font-medium text-primary" align="right" />
                  </div>
                  <div className="text-3xl font-semibold text-primary tracking-tight mb-2">
                    {building.energy_star_score || 'N/A'} <span className="text-lg text-primary/40 font-normal">/ 100</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-primary font-medium">
                    <TrendingDown className="w-4 h-4 rotate-180" />
                    +{Math.round((selectedSavings / financials.totalAnnualCost) * 100 * 0.8)} points projected
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-8 border border-black/5 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                  <div>
                    <h3 className="text-xl font-semibold text-primary tracking-tight mb-1">Energy Cost Trend</h3>
                    <p className="text-sm text-primary/60">Actual vs. Projected costs after retrofits</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="bg-bg p-1 rounded-lg flex text-sm">
                      <button onClick={() => setTrackingPeriod('YTD')} className={cn("px-3 py-1 rounded-md transition-colors", trackingPeriod === 'YTD' ? "bg-white shadow-sm font-medium text-primary" : "text-primary/60 hover:text-primary")}>YTD</button>
                      <button onClick={() => setTrackingPeriod('1Y')} className={cn("px-3 py-1 rounded-md transition-colors", trackingPeriod === '1Y' ? "bg-white shadow-sm font-medium text-primary" : "text-primary/60 hover:text-primary")}>1Y</button>
                      <button onClick={() => setTrackingPeriod('ALL')} className={cn("px-3 py-1 rounded-md transition-colors", trackingPeriod === 'ALL' ? "bg-white shadow-sm font-medium text-primary" : "text-primary/60 hover:text-primary")}>All Time</button>
                    </div>
                    <button 
                      onClick={handleDownload}
                      disabled={isDownloading}
                      className="flex items-center gap-2 text-sm font-medium text-primary/60 hover:text-primary transition-colors disabled:opacity-50"
                    >
                      <Download className="w-4 h-4" />
                      {isDownloading ? 'Exporting...' : 'Export'}
                    </button>
                  </div>
                </div>
                
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={filteredChartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dx={-10} tickFormatter={(value) => `$${value}`} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: number) => formatValue(value)}
                      />
                      <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                      <Line type="monotone" dataKey="baseline" name="Baseline Cost" stroke="#e5e7eb" strokeWidth={2} dot={false} activeDot={false} />
                      <Line type="monotone" dataKey="actual" name="Actual Cost" stroke="primary" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} connectNulls />
                      <Line type="monotone" dataKey="projected" name="Projected Cost (Post-Retrofit)" stroke="#FF7500" strokeWidth={3} strokeDasharray="5 5" dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} connectNulls />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>
          )}

        </section>

        {/* Trust and Transparency Footer */}
        <footer className="pt-12 border-t border-black/5 mt-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h5 className="font-medium text-primary mb-3">Data Sources</h5>
              <ul className="space-y-2 text-sm text-primary/60">
                <li>Chicago Energy Benchmarking Ordinance</li>
                <li>ENERGY STAR Portfolio Manager</li>
                <li>ComEd Commercial Tariffs</li>
                <li>Peoples Gas Commercial Tariffs</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-primary mb-3">Methodology</h5>
              <p className="text-sm text-primary/60 leading-relaxed">
                Estimates are based on peer comparisons within the same property type and vintage in the Chicago area. Savings potential assumes upgrading to current IECC standards.
              </p>
            </div>
            <div>
              <h5 className="font-medium text-primary mb-3">Disclaimer</h5>
              <p className="text-sm text-primary/60 leading-relaxed">
                These figures are estimates for informational purposes only. Actual savings will vary based on specific building conditions, usage patterns, and final contractor pricing.
              </p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-black/5 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-primary/40">
            <p>© {new Date().getFullYear()} Civic Energy. All rights reserved.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
            </div>
          </div>
        </footer>
      </main>

      {/* Full Report Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] shadow-2xl relative overflow-hidden flex flex-col"
          >
            {/* Simple Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0 z-10 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100">
                  <FileText className="w-5 h-5 text-gray-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Energy Optimization Report.pdf</h3>
                  <p className="text-sm text-gray-500">{building.address}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsReportModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Report Content Area */}
            <div className="relative flex-1 overflow-hidden bg-gray-50/50 p-6 sm:p-10">
              {/* PDF Page */}
              <div className="bg-white shadow-sm border border-gray-200 w-full max-w-3xl mx-auto min-h-[600px] p-10 sm:p-16 space-y-10 relative mb-20">
                {/* Header Section */}
                <div className="border-b-2 border-primary pb-6">
                  <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">Energy Optimization Analysis</h1>
                  <p className="text-lg text-gray-600">Prepared for: {building.property_name || building.address}</p>
                  <p className="text-sm text-gray-400 mt-4">Generated on {new Date().toLocaleDateString()}</p>
                </div>

                {/* Executive Summary */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Activity className="w-6 h-6 text-primary" />
                    Executive Summary
                  </h2>
                  <p className="text-gray-700 leading-relaxed text-justify">
                    Based on our comprehensive analysis of your building's energy consumption patterns, 
                    we have identified significant opportunities for efficiency improvements. Your current 
                    Energy Star Score of 72 indicates above-average performance, but targeted retrofits 
                    could elevate this to 85+, resulting in substantial cost savings.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-6 mt-6">
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                      <p className="text-sm text-gray-500 mb-1 uppercase tracking-wider font-semibold">Estimated Annual Savings</p>
                      <p className="text-3xl font-bold text-primary">$42,500</p>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                      <p className="text-sm text-gray-500 mb-1 uppercase tracking-wider font-semibold">Payback Period</p>
                      <p className="text-3xl font-bold text-gray-900">2.4 Years</p>
                    </div>
                  </div>
                </div>

                {/* Detailed Analysis (This will be partially blurred) */}
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <TrendingDown className="w-6 h-6 text-primary" />
                    Primary Loss Factors
                  </h2>
                  
                  <div className="space-y-6">
                    <div className="border border-gray-100 rounded-xl p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">1. HVAC Inefficiency (Off-hours)</h3>
                      <p className="text-gray-700 mb-4 text-justify">
                        Analysis of smart meter data reveals significant energy draw between 10 PM and 5 AM. 
                        The current BMS scheduling is not properly setting back temperatures during unoccupied hours.
                      </p>
                      <div className="h-40 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                        [Detailed Load Profile Chart]
                      </div>
                    </div>

                    <div className="border border-gray-100 rounded-xl p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">2. Lighting Retrofit Potential</h3>
                      <p className="text-gray-700 mb-4 text-justify">
                        Approximately 45% of the building's lighting fixtures are still utilizing legacy fluorescent tubes.
                        Upgrading to LED fixtures with occupancy sensors presents a high-ROI opportunity.
                      </p>
                      <div className="h-40 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                        [Lighting ROI Calculation Table]
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Blur Overlay & CTA */}
              <div className="absolute inset-x-0 bottom-0 h-[70%] bg-gradient-to-t from-gray-50 via-gray-50/95 to-transparent backdrop-blur-[8px] flex flex-col items-center justify-end pb-12 px-6 z-20 pointer-events-none">
                <div className="max-w-sm w-full text-center space-y-5 pointer-events-auto bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto border border-gray-100">
                    <Lock className="w-8 h-8 text-gray-400" />
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Full Report Locked</h3>
                    <p className="text-gray-500 text-sm">
                      This is a premium feature. Subscribe to access detailed retrofitting plans and ROI calculations.
                    </p>
                  </div>

                  <div className="pt-2">
                    <button 
                      onClick={() => navigate('/pricing', { state: { from: '/dashboard' } })}
                      className="w-full bg-accent hover:bg-accent-dark text-white font-medium py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
                    >
                      <LockOpen className="w-4 h-4" />
                      {auth.currentUser ? 'Subscribe to Unlock' : 'Sign Up to Unlock'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function DiagnosticCard({ title, description, impact, dollarImpact, icon, formatValue, tooltip }: { title: string, description: string, impact: string, dollarImpact?: number, icon: React.ReactNode, formatValue?: (value: number) => string, tooltip?: string }) {
  return (
    <div className="p-6 rounded-3xl bg-bg hover:bg-white hover:shadow-[0_2px_10px_rgba(0,0,0,0.04)] transition-all">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-white rounded-2xl shadow-sm">
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-primary">{title}</h4>
              {tooltip && (
                <div className="group relative inline-flex items-center">
                  <Info className="w-3.5 h-3.5 text-primary/40 cursor-help" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none font-normal leading-relaxed text-center">
                    {tooltip}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              )}
            </div>
            <span className={cn(
              "text-xs font-medium px-2 py-1 rounded-full",
              impact === 'High' ? "bg-rose-500/10 text-rose-600" : impact === 'Medium' ? "bg-amber-500/10 text-amber-600" : "bg-blue-500/10 text-blue-600"
            )}>
              {impact} Impact
            </span>
          </div>
          <p className="text-sm text-primary/60 leading-relaxed mb-3">{description}</p>
          {dollarImpact !== undefined && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-500/5 rounded-full text-sm font-medium text-rose-600">
              <TrendingDown className="w-4 h-4" />
              Est. {formatValue ? formatValue(dollarImpact) : formatCurrency(dollarImpact)} / yr
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ActionCard({ title, description, savings, cost, paybackMonths, roi, incentives, isSelected, onToggle, formatValue, tooltip }: any) {
  return (
    <div 
      onClick={onToggle}
      className={cn(
        "bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all group cursor-pointer border-2",
        isSelected ? "border-primary" : "border-transparent"
      )}
    >
      <div className="flex flex-col lg:flex-row gap-6 justify-between">
        <div className="flex-1 space-y-4">
          <div className="flex items-start gap-3">
            <div className={cn(
              "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-1 transition-colors",
              isSelected ? "bg-primary border-primary" : "border-gray-300"
            )}>
              {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xl font-semibold text-primary tracking-tight group-hover:text-primary transition-colors">{title}</h4>
                {tooltip && (
                  <div className="group/tooltip relative inline-flex items-center">
                    <Info className="w-4 h-4 text-primary/40 cursor-help" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-xl shadow-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-50 pointer-events-none font-normal leading-relaxed text-center">
                      {tooltip}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                )}
              </div>
              <p className="text-primary/60 mt-1">{description}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 pl-9">
            {Array.isArray(incentives) ? incentives.map((inc, idx) => (
              <div key={idx} className="inline-flex items-center gap-1.5 text-xs text-blue-600 bg-blue-500/10 px-2.5 py-1 rounded-full font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {inc}
              </div>
            )) : (
              <div className="inline-flex items-center gap-1.5 text-xs text-blue-600 bg-blue-500/10 px-2.5 py-1 rounded-full font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {incentives}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex flex-wrap lg:flex-nowrap gap-4 lg:gap-8 items-center bg-bg p-4 rounded-2xl">
          <div className="space-y-1">
            <p className="text-xs text-primary/50 font-medium uppercase tracking-wider">Est. Savings</p>
            <p className="text-2xl font-semibold text-primary tracking-tight">{formatValue ? formatValue(savings) : formatCurrency(savings)}<span className="text-sm font-normal text-primary/50">/yr</span></p>
          </div>
          <div className="w-px h-12 bg-black/5 hidden lg:block"></div>
          <div className="space-y-1">
            <p className="text-xs text-primary/50 font-medium uppercase tracking-wider">Est. Cost</p>
            <p className="text-xl font-semibold text-primary tracking-tight">{formatValue ? formatValue(cost) : formatCurrency(cost)}</p>
          </div>
          <div className="w-px h-12 bg-black/5 hidden lg:block"></div>
          <div className="space-y-1">
            <p className="text-xs text-primary/50 font-medium uppercase tracking-wider">Payback</p>
            <p className="text-xl font-semibold text-primary tracking-tight">{paybackMonths} <span className="text-sm font-normal text-primary/50">mos</span></p>
          </div>
          <div className="w-px h-12 bg-black/5 hidden lg:block"></div>
          <div className="space-y-1">
            <p className="text-xs text-primary/50 font-medium uppercase tracking-wider">ROI</p>
            <p className="text-xl font-semibold text-primary tracking-tight">{roi}%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
