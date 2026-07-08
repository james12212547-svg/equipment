/**
 * Calculates Solar ROI and system sizing.
 * @param {string} calcMode - 'bill' (monthly bill in Baht) or 'load' (daily load in kWh)
 * @param {number|string} inputValue - The value corresponding to calcMode
 * @param {number} inflationRate - Annual electricity price inflation rate in percentage (e.g., 3 for 3%)
 * @param {number} psh - Peak Sun Hours for the selected province (default 4.0)
 * @returns {object|null} - Result object or null if input is invalid
 */
export const calculateSolarRoi = (calcMode, inputValue, inflationRate = 3, psh = 4.0) => {
  const value = parseFloat(inputValue);
  if (isNaN(value) || value <= 0) {
    return null; // Return null to indicate error
  }

  let recommendedKW = 0;
  let actualSavingsPerMonth = 0;
  const PSH = psh; // Peak Sun Hours — now province-specific
  const panelWattage = 550; // Standard 550W panel
  const costPerKW = 25000; // Estimated cost per kW in Baht

  if (calcMode === 'bill') {
    // Mode: Calculate from Monthly Bill
    // 1 kW solar generates PSH units/day => PSH*30 units/month
    const savingsPerKWPerMonth = PSH * 30 * 5; // 5 Baht/unit avg
    const targetSavings = value * 0.7; // Aim to cover 70% of bill
    recommendedKW = targetSavings / savingsPerKWPerMonth;
    
    // Round to standard sizes (3kW, 5kW, 10kW)
    if (recommendedKW <= 3) recommendedKW = 3;
    else if (recommendedKW <= 5) recommendedKW = 5;
    else if (recommendedKW <= 10) recommendedKW = 10;
    else recommendedKW = Math.ceil(recommendedKW);

    actualSavingsPerMonth = recommendedKW * savingsPerKWPerMonth;

  } else {
    // Mode: Calculate from Daily Load (kWh/day)
    // If user needs X kWh/day, system size = X / PSH
    recommendedKW = value / PSH;
    recommendedKW = Number(recommendedKW.toFixed(2));
    
    // Savings = kWh * 5 Baht * 30 days
    actualSavingsPerMonth = (recommendedKW * PSH) * 5 * 30;
  }

  // Common calculations based on recommendedKW
  const totalWatts = recommendedKW * 1000;
  const numberOfPanels = Math.ceil(totalWatts / panelWattage);
  const inverterSize = Math.ceil(recommendedKW); // Round up to next whole kW for inverter
  const inverterPhase = inverterSize > 5 ? '3-Phase (3 เฟส)' : '1-Phase (1 เฟส)';
  
  const estimatedCost = recommendedKW * costPerKW;
  const requiredArea = numberOfPanels * 2.6; // ~2.6 sqm per 550W panel

  // Iterative Payback Calculation with Engineering Accuracy
  const degradationRate = 0.006; // 0.6% panel degradation per year
  const annualCleaningCost = recommendedKW * 500; // 500 THB/kW per year for maintenance
  const inverterReplacementCost = inverterSize * 8000; // 8,000 THB/kW replacing at year 10
  const elecInflation = inflationRate / 100; // Convert to decimal

  let cumulativeCashFlow = -estimatedCost;
  let paybackYears = 0;
  let foundPayback = false;
  
  for (let year = 1; year <= 25; year++) {
    // Savings increase due to electricity inflation, but decrease due to panel degradation
    const inflationMultiplier = Math.pow(1 + elecInflation, year - 1);
    const degradationMultiplier = Math.pow(1 - degradationRate, year - 1);
    const currentYearSavings = (actualSavingsPerMonth * 12) * inflationMultiplier * degradationMultiplier;
    
    // O&M Costs
    let currentYearCost = annualCleaningCost;
    if (year === 10) { // Replace inverter at year 10
      currentYearCost += inverterReplacementCost;
    }

    const netCashFlow = currentYearSavings - currentYearCost;
    cumulativeCashFlow += netCashFlow;

    if (!foundPayback && cumulativeCashFlow >= 0) {
      paybackYears = year - (cumulativeCashFlow / netCashFlow);
      foundPayback = true;
    }
  }

  // Fallback if ROI never reached
  if (!foundPayback) paybackYears = (estimatedCost / (actualSavingsPerMonth * 12));

  return {
    recommendedKW,
    numberOfPanels,
    panelWattage,
    inverterSize,
    inverterPhase,
    actualSavingsPerMonth,
    actualSavingsPerYear: actualSavingsPerMonth * 12,
    estimatedCost,
    paybackYears: paybackYears.toFixed(1),
    requiredArea: requiredArea.toFixed(1),
    degradationRate,
    annualCleaningCost,
    inverterReplacementCost,
    elecInflation,
    psh: PSH, // Return PSH used for display
  };
};
