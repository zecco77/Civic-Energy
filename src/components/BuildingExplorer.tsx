import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  X, Activity, TrendingDown, LockOpen, ChevronRight, 
  CloudRain, Wind, Thermometer, Zap, BarChart3, 
  LayoutDashboard, AlertTriangle, Filter, Search,
  CheckCircle2, Info, ArrowRight, Lock, FileText,
  Cloud, Sun, Droplets, Sparkles, Brain, Target, Lightbulb,
  Plus
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Cell 
} from 'recharts';
import { BenchmarkingData, getChicagoBuildingDetails, getCookCountyProperty, getCookCountyAssessorData, ChicagoBuildingDetails, CookCountyProperty, CookCountyAssessorData } from '../services/chicagoData';
import { calculateFinancials, formatCurrency } from '../services/financials';
import { NeighborhoodMap } from './NeighborhoodMap';
import { cn } from '../lib/utils';
import { getWeatherData, WeatherData } from '../services/weatherService';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

interface BuildingExplorerProps {
  building: BenchmarkingData;
  onClose: () => void;
  onReviewReport: () => void;
  formatValue?: (value: number) => string;
  confidenceScore?: 'Low' | 'Medium' | 'High';
}

export function BuildingExplorer({ building, onClose, onReviewReport, formatValue, confidenceScore = 'Low' }: BuildingExplorerProps) {
  const financials = calculateFinancials(building);
  const [buildingSize, setBuildingSize] = useState('');
  const [electricityUsage, setElectricityUsage] = useState('');
  const [footprintResult, setFootprintResult] = useState<number | null>(null);
  const [neighborhoodData, setNeighborhoodData] = useState<BenchmarkingData[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecastDate, setForecastDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [chicagoDetails, setChicagoDetails] = useState<ChicagoBuildingDetails | null>(null);
  const [cookCountyData, setCookCountyData] = useState<CookCountyProperty | null>(null);
  const [assessorData, setAssessorData] = useState<CookCountyAssessorData | null>(null);
  const [isInPortfolio, setIsInPortfolio] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  useEffect(() => {
    if (building.latitude && building.longitude) {
      getWeatherData(building.latitude, building.longitude, forecastDate).then(setWeather);
    }
  }, [building.latitude, building.longitude, forecastDate]);

  useEffect(() => {
    if (building.address) {
      getChicagoBuildingDetails(building.address).then(setChicagoDetails);
      getCookCountyProperty(building.address).then(data => {
        setCookCountyData(data);
        if (data?.pin) {
          getCookCountyAssessorData(data.pin).then(setAssessorData);
        }
      });
    }

    // Check portfolio/tracking status if logged in
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // We'll use mock data for now since we don't have a database setup yet
        setIsInPortfolio(false);
        setIsTracking(false);
      }
    });

    return () => unsubscribe();
  }, [building.latitude, building.longitude, building.address, building.id, building.row_id]);

  const handleAddToPortfolio = async () => {
    if (!auth.currentUser) {
      alert('Please log in to add buildings to your portfolio.');
      return;
    }

    setLoadingAction('portfolio');
    try {
      // We'll use mock data for now since we don't have a database setup yet
      setIsInPortfolio(!isInPortfolio);
    } catch (error) {
      console.error('Error adding to portfolio:', error);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleToggleTracking = async () => {
    if (!auth.currentUser) {
      alert('Please log in to enable live tracking.');
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

  const handleCalculateFootprint = () => {
    const size = parseFloat(buildingSize) || 0;
    const usage = parseFloat(electricityUsage) || 0;
    // Simple calculation: usage * 12 months * 0.0004 (tons CO2 per kWh)
    const result = usage * 12 * 0.0004;
    setFootprintResult(result);
  };

  // Calculate comparison metrics
  const buildingsWithMetrics = neighborhoodData.map(b => {
    const bFinancials = calculateFinancials(b);
    return {
      ...b,
      costPerSqFt: bFinancials.totalAnnualCost / (parseFloat(b.gross_floor_area_buildings_sq_ft || '1') || 1)
    };
  }).filter(b => b.costPerSqFt > 0);

  const medianCostPerSqFt = buildingsWithMetrics.length > 0 
    ? [...buildingsWithMetrics].sort((a, b) => a.costPerSqFt - b.costPerSqFt)[Math.floor(buildingsWithMetrics.length / 2)].costPerSqFt
    : 0;

  const medianScore = buildingsWithMetrics.length > 0
    ? [...buildingsWithMetrics].sort((a, b) => (parseInt(a.energy_star_score || '0')) - (parseInt(b.energy_star_score || '0')))[Math.floor(buildingsWithMetrics.length / 2)].energy_star_score
    : '0';

  const targetCostPerSqFt = financials.totalAnnualCost / (parseFloat(building.gross_floor_area_buildings_sq_ft || '1') || 1);
  const costDiffPercent = medianCostPerSqFt > 0 ? ((targetCostPerSqFt - medianCostPerSqFt) / medianCostPerSqFt) * 100 : 0;
  const isOutperforming = targetCostPerSqFt < medianCostPerSqFt;

  const dynamicInsights = useMemo(() => {
    const insights: string[] = [];
    const score = parseInt(building.energy_star_score || '0');
    const yearBuilt = parseInt(building.year_built || '0');
    const elecKbtu = parseFloat(building.electricity_use_kbtu || '0');
    const gasKbtu = parseFloat(building.natural_gas_use_kbtu || '0');
    const propType = building.primary_property_type || '';

    if (score > 0 && score < 50) {
      insights.push(`Energy Star score (${score}) is below average. Prioritize comprehensive energy audit.`);
    } else if (score >= 75) {
      insights.push(`High performer (Score: ${score}). Focus on continuous commissioning to maintain efficiency.`);
    }

    if (yearBuilt > 0 && yearBuilt < 1980) {
      insights.push(`Pre-1980 construction detected. High probability of envelope leaks; prioritize weatherization.`);
    } else if (yearBuilt >= 1980 && yearBuilt < 2005) {
      insights.push(`Aging infrastructure. Evaluate HVAC and boiler systems for end-of-life replacement.`);
    }

    if (elecKbtu > gasKbtu * 1.5) {
      insights.push(`High electrical load relative to gas. Focus on LED retrofits, VFDs, and cooling optimization.`);
    } else if (gasKbtu > elecKbtu * 1.5) {
      insights.push(`High thermal load detected. Evaluate boiler efficiency, steam traps, and envelope sealing.`);
    }

    if (propType.toLowerCase().includes('office')) {
      insights.push(`Office profile: Implement smart occupancy sensors and aggressive weekend HVAC setbacks.`);
    } else if (propType.toLowerCase().includes('multifamily')) {
      insights.push(`Multifamily profile: Focus on domestic hot water (DHW) efficiency and tenant sub-metering.`);
    }

    // Fallbacks if we don't have enough data to generate 3 insights
    if (insights.length < 3) insights.push(`Pre-cool building before 4 PM to avoid peak demand charges.`);
    if (insights.length < 3) insights.push(`Implement automated demand response (ADR) during grid stress events.`);
    if (insights.length < 3) insights.push(`Optimize operational scheduling to match actual occupancy patterns.`);

    return insights.slice(0, 3); // Return top 3 insights
  }, [building]);

  return (
    <div className="flex flex-col lg:flex-row min-h-[800px] bg-bg gap-4 p-4">
      {/* Left Sidebar */}
      <div className="w-full lg:w-96 flex flex-col gap-4">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-black/5">
          <div className="flex justify-between items-start mb-6">
            <div className="flex gap-3">
              <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center shrink-0">
                <LayoutDashboard className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="font-bold text-primary leading-tight">{building.property_name || building.address}</h2>
                <p className="text-xs text-primary/50 mt-1 uppercase tracking-wider">{building.address}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors">
              <X className="w-5 h-5 text-primary/40" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-blue-600 mb-2">
              <Activity className="w-4 h-4" />
              Energy Savings Dashboard
            </div>
            
            <div className="text-xs text-primary/50 mb-2">
              {confidenceScore === 'High' 
                ? "Powered by Chicago Benchmarking, EIA, NREL, NOAA, OpenStreetMap, Census & Green Button APIs"
                : "Based on Chicago Benchmarking Data & ComEd/Peoples Gas Rates"}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-bg p-4 rounded-2xl">
                <p className="text-[10px] text-primary/40 uppercase font-bold mb-1">Building Energy Score</p>
                <p className="text-xl font-bold text-primary">
                  {building.energy_star_score || 'N/A'} <span className="text-xs font-normal text-primary/40">/ 100</span>
                </p>
              </div>
              <div className="bg-bg p-4 rounded-2xl">
                <p className="text-[10px] text-primary/40 uppercase font-bold mb-1">Carbon Reduction</p>
                <p className="text-xl font-bold text-primary">
                  {building.total_ghg_emissions_metric_tons_co2e ? (Number(building.total_ghg_emissions_metric_tons_co2e) * 0.2).toFixed(1) : '450.4'} <span className="text-xs font-normal text-primary/40">tons/yr</span>
                </p>
              </div>
              <div className="bg-bg p-4 rounded-2xl border border-rose-500/10">
                <p className="text-[10px] text-rose-500 uppercase font-bold mb-1">Annual Cooling Cost</p>
                <p className="text-xl font-bold text-rose-600">{formatValue ? formatValue(financials.estimatedCoolingCost) : formatCurrency(financials.estimatedCoolingCost)}</p>
              </div>
              <div className="bg-primary/10 p-4 rounded-2xl border border-primary/10">
                <p className="text-[10px] text-primary uppercase font-bold mb-1">AI Optimization Opp.</p>
                <p className="text-xl font-bold text-primary">{formatValue ? formatValue(financials.savingsPotential * 0.4) : formatCurrency(financials.savingsPotential * 0.4)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-black/5">
          <h3 className="font-bold text-primary mb-4 flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-500" />
            Building Details
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-bg p-4 rounded-2xl">
              <p className="text-[10px] uppercase tracking-wider text-primary/40 font-bold mb-1">Year Built</p>
              <p className="text-sm font-bold text-primary">{building.year_built || chicagoDetails?.year_built || 'N/A'}</p>
            </div>
            <div className="bg-bg p-4 rounded-2xl">
              <p className="text-[10px] uppercase tracking-wider text-primary/40 font-bold mb-1">Floor Area</p>
              <p className="text-sm font-bold text-primary">{parseInt(building.gross_floor_area_buildings_sq_ft || '0').toLocaleString()} sq ft</p>
            </div>
            <div className="bg-bg p-4 rounded-2xl">
              <p className="text-[10px] uppercase tracking-wider text-primary/40 font-bold mb-1">Property Type</p>
              <p className="text-sm font-bold text-primary">{building.primary_property_type || 'N/A'}</p>
            </div>
            <div className="bg-bg p-4 rounded-2xl">
              <p className="text-[10px] uppercase tracking-wider text-primary/40 font-bold mb-1">Stories</p>
              <p className="text-sm font-bold text-primary">{chicagoDetails?.no_of_stories || 'N/A'}</p>
            </div>
              {cookCountyData?.pin && (
                <div className="bg-bg p-4 rounded-2xl col-span-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-primary/40 font-bold mb-1">Cook County PIN</p>
                      <p className="text-sm font-bold text-primary">{cookCountyData.pin}</p>
                    </div>
                    {assessorData && (
                      <div className="text-right">
                        <p className="text-[10px] uppercase tracking-wider text-primary/40 font-bold mb-1">Tax Code</p>
                        <p className="text-sm font-bold text-primary">{assessorData.tax_code || 'N/A'}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-black/5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-primary">Energy Optimization Report</h3>
            <button 
              onClick={onReviewReport}
              className="bg-blue-500/10 text-blue-600 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-blue-500/20 transition-colors"
            >
              Review Report
            </button>
          </div>
          
          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-primary/50">Estimated Savings:</span>
              <span className="font-bold text-primary">{formatValue ? formatValue(financials.savingsPotential) : formatCurrency(financials.savingsPotential)} / yr</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-primary/50">Carbon Reduction:</span>
              <span className="font-bold text-primary">68 tons / yr</span>
            </div>
          </div>

          <p className="text-[10px] text-primary/40 uppercase font-bold mb-3">Recommended Upgrades:</p>
          <div className="flex flex-wrap gap-2">
            {['HVAC Improvements', 'Insulation Retrofit', 'Solar Potential', 'Lake-Water Cooling'].map(tag => (
              <span key={tag} className="text-[10px] font-bold text-primary/60 bg-bg px-2.5 py-1.5 rounded-lg border border-black/5">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Neighborhood Comparison - Added Benefit */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-black/5">
          <div className="flex items-center gap-2 text-sm font-bold text-primary mb-4">
            <TrendingDown className="w-4 h-4" />
            Neighborhood Comparison
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-bg rounded-2xl">
              <div className="flex justify-between items-end mb-1">
                <p className="text-[10px] text-primary/40 uppercase font-bold">Efficiency vs. Median</p>
                <p className={cn("text-sm font-bold", isOutperforming ? "text-primary" : "text-rose-600")}>
                  {isOutperforming ? 'Outperforming' : 'Underperforming'}
                </p>
              </div>
              <p className="text-xl font-bold text-primary">
                {Math.abs(costDiffPercent).toFixed(1)}% {isOutperforming ? 'Better' : 'Worse'}
              </p>
              <p className="text-[10px] text-primary/40 mt-1">
                Compared to {neighborhoodData.length} buildings in this area
              </p>
            </div>

            {!isOutperforming && (
              <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20">
                <p className="text-[10px] text-primary uppercase font-bold mb-1">Potential Benefit</p>
                <p className="text-sm font-bold text-primary leading-tight">
                  Matching the neighborhood median efficiency would save you approximately {formatValue ? formatValue(Math.max(0, financials.totalAnnualCost - (medianCostPerSqFt * parseFloat(building.gross_floor_area_buildings_sq_ft || '0')))) : formatCurrency(Math.max(0, financials.totalAnnualCost - (medianCostPerSqFt * parseFloat(building.gross_floor_area_buildings_sq_ft || '0'))))} per year.
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-bg p-3 rounded-xl">
                <p className="text-[9px] text-primary/40 uppercase font-bold mb-0.5">Median Score</p>
                <p className="text-sm font-bold text-primary">{medianScore}</p>
              </div>
              <div className="bg-bg p-3 rounded-xl">
                <p className="text-[9px] text-primary/40 uppercase font-bold mb-0.5">Median Cost/SqFt</p>
                <p className="text-sm font-bold text-primary">{formatValue ? formatValue(medianCostPerSqFt) : formatCurrency(medianCostPerSqFt)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Center Map Area */}
      <div className="flex-1 bg-white rounded-3xl shadow-sm border border-black/5 overflow-hidden relative flex flex-col">
        <div className="absolute top-4 right-4 z-[400]">
          <button className="bg-white/90 backdrop-blur-md border border-black/10 px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold text-primary shadow-sm hover:bg-white transition-colors">
            <Filter className="w-4 h-4" />
            Filter Pins
          </button>
        </div>

        <div className="flex-1 relative">
          <NeighborhoodMap 
            building={building} 
            onDiagnosticClick={() => {}} 
            hideSidePanel={true} 
            onDataLoaded={setNeighborhoodData}
          />
        </div>

        <div className="absolute bottom-6 left-6 z-[400] bg-white/90 backdrop-blur-md border border-black/10 p-4 rounded-2xl shadow-sm min-w-[180px]">
          <p className="text-[10px] font-bold text-primary/40 uppercase mb-3">Efficiency Score</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-primary/70">
              <div className="w-3 h-3 rounded-full bg-primary"></div>
              Good (&gt;80)
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-primary/70">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              Average (60-80)
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-primary/70">
              <div className="w-3 h-3 rounded-full bg-rose-500"></div>
              Poor (&lt;60)
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-full lg:w-96 flex flex-col gap-4">
        {/* Emergency Alert */}
        <div className="bg-rose-50 border border-rose-100 rounded-3xl p-5 flex gap-4">
          <div className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <h4 className="font-bold text-rose-900 text-sm mb-1">Emergency Grid Stress Alert</h4>
            <p className="text-xs text-rose-800 leading-relaxed">
              High grid stress predicted in {building.community_area || 'your area'} between 5–8 PM.
            </p>
          </div>
        </div>

        {/* Weather Forecast */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-black/5">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2 text-sm font-bold text-blue-600">
              <BarChart3 className="w-4 h-4" />
              Forecast Date
            </div>
            <input 
              type="date" 
              value={forecastDate}
              onChange={(e) => setForecastDate(e.target.value)}
              className="bg-bg text-xs font-bold rounded-lg px-3 py-1.5 border-none outline-none focus:ring-2 focus:ring-primary/20 text-primary cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              {weather?.icon ? (
                <img src={weather.icon} alt="weather" className="w-8 h-8 rounded-lg" referrerPolicy="no-referrer" />
              ) : (
                <Thermometer className="w-6 h-6 text-primary/40" />
              )}
              <span className="text-3xl font-bold text-primary">{weather?.temperature || '--'}°F</span>
            </div>
            <div className="flex items-center gap-2">
              <Droplets className="w-5 h-5 text-blue-400" />
              <span className="text-sm font-bold text-primary/60">{weather?.humidity || '--'}%</span>
            </div>
            <div className="flex items-center gap-2">
              <Wind className="w-5 h-5 text-primary/30" />
              <span className="text-sm font-bold text-primary/60">{weather?.windSpeed || '--'}</span>
            </div>
          </div>
          <p className="text-xs text-primary/40 italic mb-6">{weather?.description || 'Loading forecast...'}</p>

          <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex gap-3">
            <TrendingDown className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-800 leading-relaxed">
              {weather && weather.temperature < 40 
                ? "Energy demand will increase by 15% due to heating needs in cold weather."
                : "Energy demand is currently stable based on local climate conditions."}
            </p>
          </div>
        </div>

        {/* AI Insights Section */}
        <div className="bg-white rounded-3xl shadow-sm border border-black/5 flex-1 flex flex-col">
          <div className="px-6 py-6 flex-1">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
                    <Brain className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-primary">Insights AI</h4>
                    <p className="text-xs text-primary/50">AI-driven performance analysis</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 px-1">
                <ul className="text-xs text-primary/80 space-y-2 font-medium">
                  {dynamicInsights.map((insight, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>



              <div className="space-y-3">
                <p className="text-[10px] font-bold text-primary/40 uppercase tracking-wider ml-1">AI Recommendations</p>
                
                <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100 flex gap-3">
                  <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center shrink-0">
                    <Lightbulb className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-purple-900 mb-0.5">HVAC Optimization</p>
                    <p className="text-[10px] text-purple-800 leading-relaxed">
                      Your building's EUI is 12% higher than similar properties. AI suggests recalibrating chillers for 8% immediate savings.
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex gap-3">
                  <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center shrink-0">
                    <Target className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-blue-900 mb-0.5">Tax Incentive Opportunity</p>
                    <p className="text-[10px] text-blue-800 leading-relaxed">
                      Upgrading lighting to LED qualifies for a $1.80/sqft federal tax deduction under Section 179D.
                    </p>
                  </div>
                </div>

                <button className="w-full bg-purple-600 text-white font-bold py-3.5 rounded-xl text-sm shadow-sm hover:bg-purple-700 transition-colors mt-2">
                  Take Action Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
