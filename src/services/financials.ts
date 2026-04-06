import { BenchmarkingData } from './chicagoData';

// Constants for Chicago utility rates (estimates)
const COMED_RATE_PER_KWH = 0.095; // $0.095 per kWh
const PEOPLES_GAS_RATE_PER_THERM = 0.85; // $0.85 per therm
const KBTU_TO_KWH = 0.293071;
const KBTU_TO_THERMS = 0.01;

export interface FinancialSnapshot {
  totalAnnualCost: number;
  estimatedCoolingCost: number;
  estimatedHeatingCost: number;
  estimatedWastedEnergy: number;
  savingsPotential: number;
  savingsPotentialPercentage: number;
  monthlyLoss: number;
  dailyLoss: number;
  
  // Breakdown
  electricityCost: number;
  gasCost: number;

  // Peer Comparison
  peerPercentile: number; // e.g., 80 means worse than 80% of peers
  
  // Metrics
  costPerSqFt: number;
  estimatedTaxDeduction: number;
  
  // Diagnostics Impacts
  diagnostics: {
    hvac: number;
    envelope: number;
    lighting: number;
    peakDemand: number;
    plugLoad: number;
  };

  // Decisions
  combinedSavings: number;
  combinedCost: number;
  combinedNetCost: number;
  combinedPayback: number;
  combinedROI: number;
  fiveYearSavings: number;
  tenYearSavings: number;

  // Financial Impact
  increasedNOI: number;
  capRate: number;
  increasedBuildingValue: number;
}

export function calculateFinancials(data: BenchmarkingData): FinancialSnapshot {
  // Parse values, defaulting to 0 if missing
  const electricityKbtu = parseFloat(data.electricity_use_kbtu || '0');
  const gasKbtu = parseFloat(data.natural_gas_use_kbtu || '0');
  const sqFt = parseFloat(data.gross_floor_area_buildings_sq_ft || '0');
  const eui = parseFloat(data.site_eui_kbtu_sq_ft || '0');
  const score = parseFloat(data.energy_star_score || '50'); // Default to 50 if no score
  const yearBuilt = parseInt(data.year_built || '1980');

  // Calculate electricity cost
  let electricityKwh = electricityKbtu * KBTU_TO_KWH;
  let electricityCost = electricityKwh * COMED_RATE_PER_KWH;

  // Calculate gas cost
  let gasTherms = gasKbtu * KBTU_TO_THERMS;
  let gasCost = gasTherms * PEOPLES_GAS_RATE_PER_THERM;

  // Total cost
  let totalAnnualCost = electricityCost + gasCost;
  
  // If we don't have separate electricity/gas but have EUI and SqFt, estimate total cost
  if (totalAnnualCost === 0 && eui > 0 && sqFt > 0) {
    const totalKbtu = eui * sqFt;
    // Assume 60% electricity, 40% gas for a typical Chicago commercial building
    const estElecKbtu = totalKbtu * 0.6;
    const estGasKbtu = totalKbtu * 0.4;
    
    electricityCost = estElecKbtu * KBTU_TO_KWH * COMED_RATE_PER_KWH;
    gasCost = estGasKbtu * KBTU_TO_THERMS * PEOPLES_GAS_RATE_PER_THERM;
    totalAnnualCost = electricityCost + gasCost;
  }

  // If we STILL don't have total cost (e.g., missing EUI), use EIA/NREL benchmarks based on SqFt
  if (totalAnnualCost === 0 && sqFt > 0) {
    // EIA Commercial Buildings Energy Consumption Survey (CBECS) benchmark: $2.5 - $4 per sq ft
    // We'll use a conservative $3.00 per sq ft as a baseline estimate
    totalAnnualCost = sqFt * 3.00;
    electricityCost = totalAnnualCost * 0.6; // Estimate 60% electricity
    gasCost = totalAnnualCost * 0.4; // Estimate 40% gas
  }

  // Cooling is typically 30-50% of electricity in commercial buildings (NREL benchmark)
  const estimatedCoolingCost = electricityCost > 0 ? electricityCost * 0.4 : totalAnnualCost * 0.24;
  // Heating is typically 40-60% of gas in commercial buildings
  const estimatedHeatingCost = gasCost > 0 ? gasCost * 0.5 : totalAnnualCost * 0.2;

  // Calculate wasted energy based on ENERGY STAR score (1-100)
  // A score of 75 is the target for ENERGY STAR certification.
  let wasteFactor = (75 - score) / 100;
  if (wasteFactor < 0) wasteFactor = 0; // No waste if score > 75
  if (wasteFactor > 0.5) wasteFactor = 0.5; // Cap at 50% waste

  // If no score, use EUI vs generic baseline (e.g., 80 kBTU/sqft for office)
  if (isNaN(score) && eui > 0) {
    const baselineEui = 80; // Generic baseline
    if (eui > baselineEui) {
      wasteFactor = (eui - baselineEui) / eui;
    } else {
      wasteFactor = 0;
    }
  } else if (isNaN(score) && eui === 0) {
    // If no score and no EUI, assume 15-30% waste based on NREL benchmarks for older buildings
    wasteFactor = yearBuilt < 2000 ? 0.25 : 0.15;
  }

  const estimatedWastedEnergy = totalAnnualCost * wasteFactor;
  
  // Savings potential is a realistic capture of the waste (e.g., 10-25% of total cost based on NREL)
  // We'll estimate 80% of the wasted energy is recoverable
  const savingsPotential = estimatedWastedEnergy * 0.8;
  const savingsPotentialPercentage = totalAnnualCost > 0 ? (savingsPotential / totalAnnualCost) * 100 : 0;

  const monthlyLoss = estimatedWastedEnergy / 12;
  const dailyLoss = estimatedWastedEnergy / 365;

  // Peer Percentile (inverse of Energy Star Score roughly)
  const peerPercentile = 100 - score;

  const costPerSqFt = sqFt > 0 ? totalAnnualCost / sqFt : 0;

  // Diagnostic Impacts (distributing the waste)
  const hvacImpact = estimatedWastedEnergy * 0.4;
  const envelopeImpact = estimatedWastedEnergy * 0.25;
  const lightingImpact = estimatedWastedEnergy * 0.2;
  const peakDemandImpact = estimatedWastedEnergy * 0.1;
  const plugLoadImpact = estimatedWastedEnergy * 0.05;

  // Combined Decisions
  const combinedSavings = savingsPotential;
  const combinedCost = combinedSavings * 3.5; // Average 3.5 year payback before incentives
  const estimatedIncentives = combinedCost * 0.25; // Assume 25% covered by incentives
  const combinedNetCost = combinedCost - estimatedIncentives;
  const combinedPayback = (combinedNetCost / combinedSavings) * 12; // in months
  const combinedROI = (combinedSavings / combinedNetCost) * 100;
  
  const fiveYearSavings = (combinedSavings * 5) - combinedNetCost;
  const tenYearSavings = (combinedSavings * 10) - combinedNetCost;

  // 179D Tax Deduction (Inflation Reduction Act)
  // Up to $5.00 per square foot for buildings that reduce energy use by 25% or more.
  // We'll estimate this based on square footage and savings potential.
  const taxDeductionPerSqFt = savingsPotentialPercentage >= 25 ? 5.00 : 2.50; // Simplified tiered estimate
  const estimatedTaxDeduction = sqFt * taxDeductionPerSqFt;

  // Financial Impact (NOI and Building Value)
  // Energy savings directly increase Net Operating Income (NOI)
  const increasedNOI = savingsPotential;
  // Assume a standard cap rate for Chicago commercial real estate (e.g., 7%)
  const capRate = 0.07;
  const increasedBuildingValue = increasedNOI / capRate;

  return {
    totalAnnualCost,
    estimatedCoolingCost,
    estimatedHeatingCost,
    estimatedWastedEnergy,
    savingsPotential,
    savingsPotentialPercentage,
    monthlyLoss,
    dailyLoss,
    electricityCost,
    gasCost,
    peerPercentile,
    costPerSqFt,
    estimatedTaxDeduction,
    diagnostics: {
      hvac: hvacImpact,
      envelope: envelopeImpact,
      lighting: lightingImpact,
      peakDemand: peakDemandImpact,
      plugLoad: plugLoadImpact
    },
    combinedSavings,
    combinedCost,
    combinedNetCost,
    combinedPayback,
    combinedROI,
    fiveYearSavings,
    tenYearSavings,
    increasedNOI,
    capRate,
    increasedBuildingValue
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}
