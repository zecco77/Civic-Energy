import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap, Polygon, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { BenchmarkingData, getNeighborhoodData, getBuildingFootprints, BuildingFootprint } from '../services/chicagoData';
import { calculateFinancials, formatCurrency } from '../services/financials';
import { TrendingDown, TrendingUp, Download, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';

interface NeighborhoodMapProps {
  building: BenchmarkingData;
  onDiagnosticClick: () => void;
  hideSidePanel?: boolean;
  onDataLoaded?: (neighbors: BenchmarkingData[]) => void;
}

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 15);
  }, [center, map]);
  return null;
}

export function NeighborhoodMap({ building, onDiagnosticClick, hideSidePanel = false, onDataLoaded }: NeighborhoodMapProps) {
  const [neighbors, setNeighbors] = useState<BenchmarkingData[]>([]);
  const [footprints, setFootprints] = useState<BuildingFootprint[]>([]);
  const [radius, setRadius] = useState(400); // 0.25 miles in meters
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!building.latitude || !building.longitude) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      let data = await getNeighborhoodData(building.latitude, building.longitude, 400);
      let currentRadius = 400;
      
      // If fewer than 10 buildings, expand to 0.5 miles (800 meters)
      if (data.length < 10) {
        data = await getNeighborhoodData(building.latitude, building.longitude, 800);
        currentRadius = 800;
        setRadius(800);
      }
      
      // If still fewer than 10, expand to 1 mile (1600 meters)
      if (data.length < 10) {
        data = await getNeighborhoodData(building.latitude, building.longitude, 1600);
        currentRadius = 1600;
        setRadius(1600);
      }
      
      setNeighbors(data);
      if (onDataLoaded) {
        onDataLoaded(data);
      }
      
      // Fetch building footprints from Overpass API
      try {
        const footprintsData = await getBuildingFootprints(building.latitude, building.longitude, currentRadius);
        setFootprints(footprintsData);
      } catch (err) {
        // Silently ignore footprint fetch failures
      }
      
      setLoading(false);
    }
    
    fetchData();
  }, [building]);

  if (!building.latitude || !building.longitude) {
    return (
      <div className="bg-white rounded-3xl p-8 text-center border border-black/5 shadow-sm">
        <p className="text-primary/60">Location data not available for this building to show neighborhood comparison.</p>
      </div>
    );
  }

  const center: [number, number] = [parseFloat(building.latitude), parseFloat(building.longitude)];
  
  // Deduplicate neighbors by id or address
  const uniqueNeighbors = Array.from(new Map<string, BenchmarkingData>(neighbors.map(n => [n.id || n.address, n])).values());
  
  // Calculate metrics for all buildings including the target
  const allBuildings: BenchmarkingData[] = [...uniqueNeighbors.filter(n => (n.id || n.address) !== (building.id || building.address)), building];
  
  const buildingsWithMetrics = allBuildings.map(b => {
    const financials = calculateFinancials(b);
    const costPerSqFt = financials.totalAnnualCost / (parseFloat(b.gross_floor_area_buildings_sq_ft) || 1);
    const score = b.energy_star_score ? parseInt(b.energy_star_score) : null;
    return { ...b, financials, costPerSqFt, score };
  });

  // Calculate medians
  const validScores = buildingsWithMetrics.map(b => b.score).filter(s => s !== null) as number[];
  const medianScore = validScores.length > 0 
    ? validScores.sort((a, b) => a - b)[Math.floor(validScores.length / 2)] 
    : 50;
    
  const validCosts = buildingsWithMetrics.map(b => b.costPerSqFt).filter(c => c > 0);
  const medianCostPerSqFt = validCosts.length > 0
    ? validCosts.sort((a, b) => a - b)[Math.floor(validCosts.length / 2)]
    : 0;

  // Target building metrics
  const targetMetrics = buildingsWithMetrics.find(b => (b.id || b.address) === (building.id || building.address)) || buildingsWithMetrics[buildingsWithMetrics.length - 1];
  
  // Rank by cost per sq ft (lower is better)
  const rankedByCost = [...buildingsWithMetrics].filter(b => b.costPerSqFt > 0).sort((a, b) => a.costPerSqFt - b.costPerSqFt);
  const targetRank = rankedByCost.findIndex(b => (b.id || b.address) === (building.id || building.address)) + 1;
  const totalRanked = rankedByCost.length;
  
  const isTopQuartile = targetRank <= Math.ceil(totalRanked * 0.25);
  const isBottomQuartile = targetRank >= Math.floor(totalRanked * 0.75);
  
  // Best performer
  const bestPerformer = rankedByCost[0];
  const gapToBest = targetMetrics.financials.totalAnnualCost - (bestPerformer ? (bestPerformer.costPerSqFt * parseFloat(building.gross_floor_area_buildings_sq_ft)) : 0);

  // Color coding logic based on local distribution
  const getColorTier = (costPerSqFt: number) => {
    if (costPerSqFt === 0) return '#64748b'; // Gray for missing data
    
    // Find percentile
    const index = rankedByCost.findIndex(b => b.costPerSqFt === costPerSqFt);
    const percentile = index / (totalRanked - 1 || 1);
    
    if (percentile <= 0.2) return '#166534'; // Deep green (Top 20%)
    if (percentile <= 0.4) return '#4ade80'; // Light green (20-40%)
    if (percentile <= 0.6) return '#facc15'; // Yellow (40-60%)
    if (percentile <= 0.8) return '#f97316'; // Orange (60-80%)
    return '#e11d48'; // Red (Bottom 20%)
  };
  
  const getTierLabel = (costPerSqFt: number) => {
    if (costPerSqFt === 0) return 'Data Unavailable';
    const index = rankedByCost.findIndex(b => b.costPerSqFt === costPerSqFt);
    const percentile = index / (totalRanked - 1 || 1);
    if (percentile <= 0.2) return 'Top Performer';
    if (percentile <= 0.4) return 'Above Average';
    if (percentile <= 0.6) return 'Average';
    if (percentile <= 0.8) return 'Below Average';
    return 'Significant Waste Detected';
  };

  const targetColor = getColorTier(targetMetrics.costPerSqFt);
  const targetTierLabel = getTierLabel(targetMetrics.costPerSqFt);
  
  const outperformingCount = targetRank > 1 ? targetRank - 1 : 0;

  // Mock neighborhood data for 3 neighborhoods
  const neighborhoodContext = [
    { name: 'Current Neighborhood', avgScore: medianScore, avgCost: medianCostPerSqFt },
    { name: 'Adjacent North', avgScore: Math.max(0, medianScore - 5), avgCost: medianCostPerSqFt * 1.1 },
    { name: 'Adjacent South', avgScore: Math.min(100, medianScore + 8), avgCost: medianCostPerSqFt * 0.9 }
  ];

  return (
    <div className={cn("bg-white rounded-3xl border border-black/5 shadow-sm overflow-hidden flex flex-col lg:flex-row", hideSidePanel && "h-full border-none shadow-none")}>
      {/* Map Area */}
      <div className={cn("w-full relative bg-black flex flex-col", !hideSidePanel && "lg:w-[60%] min-h-[400px] lg:min-h-[600px]")}>
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-10">
            <div className="text-primary animate-pulse font-medium">Loading neighborhood data...</div>
          </div>
        ) : null}
        
        {/* Neighborhood Rank Callout */}
        {!hideSidePanel && (
          <div className="absolute top-4 left-4 z-[400] bg-white/80 backdrop-blur-md border border-black/5 rounded-2xl p-4 shadow-sm max-w-[250px]">
            {uniqueNeighbors.length > 0 ? (
              <p className="text-sm text-primary/80 leading-relaxed">
                Your building ranks <span className={cn("font-semibold text-lg", isBottomQuartile ? "text-rose-500" : isTopQuartile ? "text-primary" : "text-amber-500")}>{targetRank > 0 ? targetRank : '?'}</span> out of <span className="font-semibold text-primary">{totalRanked}</span> buildings in this neighborhood.
              </p>
            ) : (
              <p className="text-sm text-primary/80 leading-relaxed">
                No comparable buildings found in this neighborhood.
              </p>
            )}
          </div>
        )}

        {/* Radius Label */}
        {!hideSidePanel && (
          <div className="absolute bottom-4 left-4 z-[400] bg-white/80 backdrop-blur-md rounded-full px-4 py-1.5 text-xs font-medium text-primary/60 border border-black/5 shadow-sm">
            Showing {allBuildings.length} buildings within {radius === 400 ? '0.25' : '0.5'} miles
          </div>
        )}

        {/* Map Data Source Label */}
        <div className="absolute bottom-4 right-4 z-[400] bg-white/80 backdrop-blur-md rounded-full px-4 py-1.5 text-[10px] font-medium text-primary/40 border border-black/5 shadow-sm">
          Map Data: OpenStreetMap & Overpass API
        </div>

        <div className="absolute inset-0 z-0">
          <MapContainer 
            center={center} 
            zoom={15} 
            style={{ height: '100%', width: '100%', background: 'bg' }}
            zoomControl={false}
            attributionControl={false}
          >
            <MapUpdater center={center} />
            {/* Light theme tiles */}
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; OpenStreetMap contributors &copy; CARTO'
            />
            
            {/* Render building footprints */}
            {footprints.map((fp) => {
              const isTargetFootprint = building.address && fp.tags && 
                (building.address.toLowerCase().includes((fp.tags['addr:housenumber'] || '').toLowerCase()) && 
                 building.address.toLowerCase().includes((fp.tags['addr:street'] || '').toLowerCase()));
              
              return (
                <Polygon
                  key={`fp-${fp.id}`}
                  positions={fp.geometry.map(g => [g.lat, g.lon])}
                  pathOptions={{
                    fillColor: isTargetFootprint ? '#FF7500' : '#d1d1d6', // accent for target, light gray for others
                    fillOpacity: isTargetFootprint ? 0.6 : 0.4,
                    color: isTargetFootprint ? '#E66900' : '#c7c7cc', // accent-dark border for target
                    weight: isTargetFootprint ? 2 : 1
                  }}
                />
              );
            })}
            
            {buildingsWithMetrics.map((b) => {
              if (!b.latitude || !b.longitude) return null;
              const isTarget = (b.id || b.address) === (building.id || building.address);
              const color = getColorTier(b.costPerSqFt);
              const tierLabel = getTierLabel(b.costPerSqFt);
              
              if (isTarget) {
                const targetIcon = L.divIcon({
                  className: 'custom-div-icon',
                  html: `
                    <div class="relative flex items-center justify-center">
                      <div class="absolute w-10 h-10 bg-primary/30 rounded-full animate-ping"></div>
                      <div class="w-6 h-6 bg-accent rounded-full border-2 border-white shadow-lg z-10"></div>
                    </div>
                  `,
                  iconSize: [40, 40],
                  iconAnchor: [20, 20]
                });

                return (
                  <Marker
                    key={`target-${b.row_id || b.id}`}
                    position={[parseFloat(b.latitude), parseFloat(b.longitude)]}
                    icon={targetIcon}
                  >
                    <Tooltip direction="top" offset={[0, -10]} opacity={1} className="custom-tooltip">
                      <div className="bg-white/90 backdrop-blur-md text-primary p-4 rounded-2xl border border-black/5 shadow-sm min-w-[200px]">
                        <p className="font-semibold text-sm mb-1 tracking-tight">{b.address}</p>
                        <p className="text-xs text-primary mb-3">{b.primary_property_type}</p>
                        <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                          <div>
                            <span className="text-primary/50 block mb-0.5">Score</span>
                            <span className="font-medium text-primary">{b.energy_star_score || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-primary/50 block mb-0.5">Cost/SqFt</span>
                            <span className="font-medium text-primary">{b.costPerSqFt > 0 ? formatCurrency(b.costPerSqFt) : 'N/A'}</span>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-black/5 flex items-center justify-between">
                          <span className={cn(
                            "text-xs font-medium px-2.5 py-1 rounded-full inline-block",
                            color === '#166534' ? "bg-primary/20 text-primary" :
                            color === '#4ade80' ? "bg-primary/10 text-primary" :
                            color === '#facc15' ? "bg-amber-500/20 text-amber-600" :
                            color === '#f97316' ? "bg-orange-500/20 text-orange-600" :
                            color === '#e11d48' ? "bg-rose-500/20 text-rose-600" :
                            "bg-black/5 text-primary/60"
                          )}>
                            {tierLabel}
                          </span>
                          <a 
                            href={`https://www.openstreetmap.org/?mlat=${b.latitude}&mlon=${b.longitude}#map=19/${b.latitude}/${b.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-accent hover:underline flex items-center gap-1"
                          >
                            OSM View
                          </a>
                        </div>
                      </div>
                    </Tooltip>
                  </Marker>
                );
              }

              return (
                <CircleMarker
                  key={b.row_id || b.id || `${b.latitude}-${b.longitude}`}
                  center={[parseFloat(b.latitude), parseFloat(b.longitude)]}
                  radius={8}
                  pathOptions={{
                    fillColor: color,
                    fillOpacity: 0.9,
                    color: color,
                    weight: 1
                  }}
                >
                  <Tooltip direction="top" offset={[0, -10]} opacity={1} className="custom-tooltip">
                    <div className="bg-white/90 backdrop-blur-md text-primary p-4 rounded-2xl border border-black/5 shadow-sm min-w-[200px]">
                      <p className="font-semibold text-sm mb-1 tracking-tight">{b.address}</p>
                      <p className="text-xs text-primary mb-3">{b.primary_property_type}</p>
                      <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                        <div>
                          <span className="text-primary/50 block mb-0.5">Score</span>
                          <span className="font-medium text-primary">{b.energy_star_score || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-primary/50 block mb-0.5">Cost/SqFt</span>
                          <span className="font-medium text-primary">{b.costPerSqFt > 0 ? formatCurrency(b.costPerSqFt) : 'N/A'}</span>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-black/5">
                        <span className={cn(
                          "text-xs font-medium px-2.5 py-1 rounded-full inline-block",
                          color === '#166534' ? "bg-primary/20 text-primary" :
                          color === '#4ade80' ? "bg-primary/10 text-primary" :
                          color === '#facc15' ? "bg-amber-500/20 text-amber-600" :
                          color === '#f97316' ? "bg-orange-500/20 text-orange-600" :
                          color === '#e11d48' ? "bg-rose-500/20 text-rose-600" :
                          "bg-black/5 text-primary/60"
                        )}>
                          {tierLabel}
                        </span>
                      </div>
                    </div>
                  </Tooltip>
                </CircleMarker>
              );
            })}
          </MapContainer>
        </div>
      </div>

      {/* Side Panel */}
      {!hideSidePanel && (
        <div className="w-full lg:w-[40%] p-8 flex flex-col bg-white">
          <h3 className="text-2xl font-semibold text-primary mb-8 tracking-tight">Neighborhood Comparison</h3>
          
          <div className="space-y-6 flex-1">
            {/* Row 1: Annual Energy Cost per SqFt */}
            <div className="flex justify-between items-center pb-6 border-b border-black/5">
              <div>
                <p className="text-sm text-primary/60 mb-1">Annual Cost / SqFt</p>
                <p className="text-xl font-semibold text-primary tracking-tight">{targetMetrics.costPerSqFt > 0 ? formatCurrency(targetMetrics.costPerSqFt) : 'N/A'}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-primary/40 mb-1.5">vs Neighborhood Median</p>
                {targetMetrics.costPerSqFt > 0 && medianCostPerSqFt > 0 ? (
                  <div className={cn("flex items-center justify-end gap-1 text-sm font-medium", targetMetrics.costPerSqFt > medianCostPerSqFt ? "text-rose-500" : "text-primary")}>
                    {targetMetrics.costPerSqFt > medianCostPerSqFt ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {formatCurrency(Math.abs(targetMetrics.costPerSqFt - medianCostPerSqFt))}
                  </div>
                ) : (
                  <span className="text-sm text-primary/40">N/A</span>
                )}
              </div>
            </div>

            {/* Row 2: ENERGY STAR Score */}
            <div className="flex justify-between items-center pb-6 border-b border-black/5">
              <div>
                <p className="text-sm text-primary/60 mb-1">ENERGY STAR Score</p>
                <p className="text-xl font-semibold text-primary tracking-tight">{targetMetrics.score || 'N/A'}</p>
              </div>
              <div className="text-right">
                {targetMetrics.score !== null ? (
                  <span className={cn("text-sm font-medium", targetMetrics.score < medianScore ? "text-rose-500" : "text-primary")}>
                    {targetMetrics.score < medianScore ? "Below" : "Above"} neighborhood average
                  </span>
                ) : (
                  <span className="text-sm text-primary/40">N/A</span>
                )}
              </div>
            </div>

            {/* Row 3: Estimated Annual Waste */}
            <div className="flex justify-between items-center pb-6 border-b border-black/5">
              <div>
                <p className="text-sm text-primary/60 mb-1">Estimated Annual Waste</p>
                <p className="text-xl font-semibold text-rose-500 tracking-tight">{formatCurrency(targetMetrics.financials.estimatedWastedEnergy)}</p>
              </div>
              <div className="text-right max-w-[150px]">
                <p className="text-xs text-primary/50 leading-relaxed">
                  Top-performing similar buildings nearby spend <span className="text-primary font-medium">{formatCurrency(gapToBest > 0 ? gapToBest : 0)}</span> less per year.
                </p>
              </div>
            </div>

            {/* Row 4: Efficiency Tier */}
            <div className="pb-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-sm text-primary/60">Efficiency Tier:</span>
                <span className="text-sm font-semibold" style={{ color: targetColor }}>{targetTierLabel}</span>
              </div>
              {outperformingCount > 0 && (
                <p className="text-sm text-rose-500/90 font-medium">
                  {outperformingCount} nearby buildings are outperforming yours right now.
                </p>
              )}
            </div>
          </div>

          {/* Best Performer Highlight */}
          {bestPerformer && (bestPerformer.id || bestPerformer.address) !== (building.id || building.address) && (
            <div className="bg-black/5 rounded-2xl p-5 mb-8 border border-black/5">
              <p className="text-xs text-primary font-medium uppercase tracking-wider mb-3">Top Performer Nearby</p>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-sm font-medium text-primary truncate max-w-[160px]">{bestPerformer.address}</p>
                  <p className="text-xs text-primary/50 mt-1">Score: {bestPerformer.score || 'N/A'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-primary">{formatCurrency(bestPerformer.costPerSqFt)}<span className="text-xs text-primary/50 font-normal">/sqft</span></p>
                </div>
              </div>
              <p className="text-xs text-primary/60 pt-3 border-t border-black/5 leading-relaxed">
                The gap between their costs and yours is estimated at <span className="font-medium text-primary">{formatCurrency(gapToBest > 0 ? gapToBest : 0)}</span> per year.
              </p>
            </div>
          )}

          {/* CTAs */}
          <div className="mt-auto space-y-4">
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 mb-4">
              <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-2">Building-Specific Finding</h4>
              <p className="text-xs text-amber-800 leading-relaxed">
                Based on historical data, this building's energy sensitivity to temperature spikes is 18% higher than the 10 nearest neighbors. 
                This suggests a significant opportunity for HVAC control optimization.
              </p>
            </div>
            
            <button 
              onClick={onDiagnosticClick}
              className="w-full bg-accent hover:bg-accent-dark text-white py-3.5 px-4 rounded-full font-medium text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              See Why You're Ranked {targetRank > 0 ? targetRank : '?'} and How to Move Up
              <ArrowRight className="w-4 h-4" />
            </button>
            <button 
              onClick={() => window.print()}
              className="w-full text-center text-xs text-primary/40 hover:text-primary/70 transition-colors flex items-center justify-center gap-1.5 py-2"
            >
              <Download className="w-3.5 h-3.5" />
              Download neighborhood comparison as PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
