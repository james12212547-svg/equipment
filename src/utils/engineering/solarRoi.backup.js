/**
 * Advanced Solar ROI & System Sizing Calculation Engine (Original Backup)
 * Supports On-Grid, Hybrid (Battery), Off-Grid, Day/Night Load Ratios, Feed-in Tariff, and Environmental Metrics.
 */
export const calculateSolarRoi = (calcMode, inputValue, options = {}) => {
  const value = parseFloat(inputValue);
  if (isNaN(value) || value <= 0) {
    return null;
  }

  const {
    inflationRate = 3,
    psh = 4.5,
    dayUsageRatio = 60, // 60% Day / 40% Night
    systemType = 'on_grid', // 'on_grid', 'hybrid', 'off_grid'
    customCost = 0,
    enableFit = true,
    fitRate = 2.20, // 2.20 THB/kWh (โซลาร์ภาคประชาชน)
    prRate = 0.80, // Performance Ratio (80%)
    elecRate = 4.42 // Average electricity rate in THB/kWh
  } = options;

  const PSH = Math.max(1, parseFloat(psh) || 4.5);
  const PR = Math.max(0.5, Math.min(0.95, parseFloat(prRate) || 0.80));
  const dayRatio = Math.max(0.1, Math.min(1.0, (parseFloat(dayUsageRatio) || 60) / 100));

  const panelWattage = 550; // Standard 550W Tier-1 Monocrystalline Panel
  let costPerKW = 28000; // Default On-Grid cost per kW in Baht

  if (systemType === 'hybrid') costPerKW = 42000; // Hybrid with Lithium Battery
  else if (systemType === 'off_grid') costPerKW = 55000; // Off-Grid with heavy storage

  let recommendedKW = 0;
  let dailyKwhNeeded = 0;

  if (calcMode === 'bill') {
    // Mode: Calculate from Monthly Bill
    const totalMonthlyKwh = value / elecRate;
    dailyKwhNeeded = totalMonthlyKwh / 30;
    const daytimeKwhNeeded = dailyKwhNeeded * dayRatio;
    
    // System size needed to cover daytime energy
    recommendedKW = daytimeKwhNeeded / (PSH * PR);
    
    // Round to standard commercial / residential inverter steps (3kW, 5kW, 10kW, 15kW, 20kW...)
    if (recommendedKW <= 3) recommendedKW = 3;
    else if (recommendedKW <= 5) recommendedKW = 5;
    else if (recommendedKW <= 10) recommendedKW = 10;
    else recommendedKW = Math.ceil(recommendedKW);
  } else {
    // Mode: Calculate from Daily Load (kWh/day)
    dailyKwhNeeded = value;
    const daytimeKwhNeeded = dailyKwhNeeded * dayRatio;
    recommendedKW = daytimeKwhNeeded / (PSH * PR);
    recommendedKW = Number(recommendedKW.toFixed(2));
  }

  // Daily Generation & Consumption breakdown
  const dailyGenKwh = recommendedKW * PSH * PR;
  const daytimeKwhNeeded = dailyKwhNeeded * dayRatio;

  // Self-consumed solar power vs Surplus exported power
  const selfConsumedDailyKwh = Math.min(dailyGenKwh, daytimeKwhNeeded);
  const surplusDailyKwh = Math.max(0, dailyGenKwh - daytimeKwhNeeded);

  // Financial Savings
  const selfConsumedMonthlySavings = selfConsumedDailyKwh * 30 * elecRate;
  const fitMonthlyRevenue = enableFit ? surplusDailyKwh * 30 * fitRate : 0;
  const actualSavingsPerMonth = selfConsumedMonthlySavings + fitMonthlyRevenue;

  // System Specs
  const totalWatts = recommendedKW * 1000;
  const numberOfPanels = Math.ceil(totalWatts / panelWattage);
  const inverterSize = Math.ceil(recommendedKW);
  const inverterPhase = inverterSize > 5 ? '3-Phase (3 เฟส)' : '1-Phase (1 เฟส)';
  const requiredArea = numberOfPanels * 2.6; // ~2.6 sqm per 550W panel

  // Capital Cost (CAPEX)
  const estimatedCost = customCost > 0 ? parseFloat(customCost) : (recommendedKW * costPerKW);

  // Iterative Payback & Financial Analysis (25 Years)
  const degradationRate = 0.006; // 0.6% panel degradation per year
  const annualCleaningCost = recommendedKW * 400; // 400 THB/kW per year maintenance
  const inverterReplacementCost = inverterSize * 7500; // 7,500 THB/kW replacing at year 10/12
  const batteryReplacementCost = systemType === 'hybrid' ? (recommendedKW * 12000) : 0; // Battery replacement at year 8 & 16
  const elecInflation = (parseFloat(inflationRate) || 3) / 100;

  let cumulativeCashFlow = -estimatedCost;
  let paybackYears = 0;
  let foundPayback = false;

  for (let year = 1; year <= 25; year++) {
    const inflationMultiplier = Math.pow(1 + elecInflation, year - 1);
    const degradationMultiplier = Math.pow(1 - degradationRate, year - 1);
    const currentYearSavings = (actualSavingsPerMonth * 12) * inflationMultiplier * degradationMultiplier;

    let currentYearCost = annualCleaningCost;
    if (year === 10) currentYearCost += inverterReplacementCost;
    if (systemType === 'hybrid' && (year === 8 || year === 16)) currentYearCost += batteryReplacementCost;

    const netCashFlow = currentYearSavings - currentYearCost;
    cumulativeCashFlow += netCashFlow;

    if (!foundPayback && cumulativeCashFlow >= 0) {
      paybackYears = year - (cumulativeCashFlow / netCashFlow);
      foundPayback = true;
    }
  }

  if (!foundPayback) paybackYears = (estimatedCost / Math.max(1, actualSavingsPerMonth * 12));

  // Environmental Impact (ESG Metrics)
  const annualGenKwh = dailyGenKwh * 365;
  const co2ReducedTonsPerYear = (annualGenKwh * 0.50) / 1000; // 0.50 kg CO2 / kWh
  const treesPlantedEquivalent = Math.round(co2ReducedTonsPerYear * 45); // ~45 trees per ton CO2

  return {
    recommendedKW,
    numberOfPanels,
    panelWattage,
    inverterSize,
    inverterPhase,
    actualSavingsPerMonth: Math.round(actualSavingsPerMonth),
    actualSavingsPerYear: Math.round(actualSavingsPerMonth * 12),
    selfConsumedMonthlySavings: Math.round(selfConsumedMonthlySavings),
    fitMonthlyRevenue: Math.round(fitMonthlyRevenue),
    estimatedCost: Math.round(estimatedCost),
    paybackYears: paybackYears.toFixed(1),
    requiredArea: requiredArea.toFixed(1),
    degradationRate,
    annualCleaningCost,
    inverterReplacementCost,
    elecInflation,
    psh: PSH,
    prRate: PR,
    dayUsageRatio,
    systemType,
    co2ReducedTonsPerYear: co2ReducedTonsPerYear.toFixed(2),
    treesPlantedEquivalent
  };
};
