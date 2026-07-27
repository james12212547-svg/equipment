/**
 * Advanced Power Factor Correction (PFC) & Capacitor Bank Calculation Engine
 * Complies with PEA / MEA Electricity Tariffs (kVAR Penalty Rate: 56.07 THB/kVAR)
 */

export const calculatePfcAdvanced = (activePower, currentPF, targetPF = 0.95, options = {}) => {
  const P = parseFloat(activePower);
  const pf1 = parseFloat(currentPF);
  const pf2 = parseFloat(targetPF);

  if (isNaN(P) || isNaN(pf1) || isNaN(pf2) || pf1 <= 0 || pf1 >= 1 || pf2 <= 0 || pf2 > 1 || pf1 >= pf2) {
    return null;
  }

  const {
    voltage = 400,        // 380V or 400V Low Voltage, or High Voltage (22000V)
    hasHarmonics = false,  // Has VFDs / Inverters
    reactorType = '7%',   // '7%' or '14%'
    customCostPerKvar = 0 // Custom THB/kVAR
  } = options;

  // 1. Calculate Required Reactive Power (Qc in kVAR)
  const acos1 = Math.acos(pf1);
  const acos2 = Math.acos(pf2);
  const tan1 = Math.tan(acos1);
  const tan2 = Math.tan(acos2);

  const requiredKvar = P * (tan1 - tan2);
  const q1 = P * tan1; // Initial kVAR
  const q2 = P * tan2; // Target kVAR

  // 2. PEA/MEA kVAR Penalty Calculation
  // Standard allowed reactive power without penalty is 61.97% of Max Demand kW (cos phi = 0.85 -> tan = 0.6197)
  const allowedKvarPenaltyThreshold = 0.6197 * P;
  const KVAR_PENALTY_RATE = 56.07; // Baht / kVAR / Month

  const initialExcessKvar = Math.max(0, q1 - allowedKvarPenaltyThreshold);
  const targetExcessKvar = Math.max(0, q2 - allowedKvarPenaltyThreshold);

  const initialMonthlyPenalty = initialExcessKvar * KVAR_PENALTY_RATE;
  const targetMonthlyPenalty = targetExcessKvar * KVAR_PENALTY_RATE;
  const monthlyPenaltySavings = Math.max(0, initialMonthlyPenalty - targetMonthlyPenalty);
  const yearlyPenaltySavings = monthlyPenaltySavings * 12;

  // 3. Current Reduction (Amperes)
  const vNum = parseFloat(voltage) || 400;
  const currentBeforeAmps = (P * 1000) / (Math.sqrt(3) * vNum * pf1);
  const currentAfterAmps = (P * 1000) / (Math.sqrt(3) * vNum * pf2);
  const currentReducedAmps = Math.max(0, currentBeforeAmps - currentAfterAmps);

  // 4. Transformer Capacity Released (kVA Headroom)
  const s1Kva = P / pf1;
  const s2Kva = P / pf2;
  const kvaReleased = Math.max(0, s1Kva - s2Kva);

  // 5. Capacitor Rated Current & Equipment Sizing
  const capacitorCurrentAmps = (requiredKvar * 1000) / (Math.sqrt(3) * vNum);
  const recommendedContactorAmps = capacitorCurrentAmps * 1.35; // 1.35x safety for Capacitor Duty Contactor
  const recommendedBreakerAmps = capacitorCurrentAmps * 1.5;

  // 6. Step Configuration Recommendation for APFC Controller
  let stepSizeKvar = 25;
  if (requiredKvar <= 50) stepSizeKvar = 10;
  else if (requiredKvar <= 150) stepSizeKvar = 25;
  else if (requiredKvar <= 300) stepSizeKvar = 50;
  else stepSizeKvar = 100;

  const totalSteps = Math.ceil(requiredKvar / stepSizeKvar);

  // 7. CAPEX & Payback Period
  let defaultCostPerKvar = hasHarmonics ? 1800 : 1000; // 1,000 THB/kVAR standard, 1,800 THB/kVAR with Detuned Reactor
  const unitCostPerKvar = customCostPerKvar > 0 ? parseFloat(customCostPerKvar) : defaultCostPerKvar;
  const totalCostCapex = requiredKvar * unitCostPerKvar;
  const paybackMonths = monthlyPenaltySavings > 0 ? (totalCostCapex / monthlyPenaltySavings) : 0;
  const paybackYears = paybackMonths > 0 ? (paybackMonths / 12) : 0;

  return {
    requiredKvar: Math.round(requiredKvar),
    q1: q1.toFixed(1),
    q2: q2.toFixed(1),
    monthlyPenaltySavings: Math.round(monthlyPenaltySavings),
    yearlyPenaltySavings: Math.round(yearlyPenaltySavings),
    initialMonthlyPenalty: Math.round(initialMonthlyPenalty),
    currentBeforeAmps: currentBeforeAmps.toFixed(1),
    currentAfterAmps: currentAfterAmps.toFixed(1),
    currentReducedAmps: currentReducedAmps.toFixed(1),
    s1Kva: s1Kva.toFixed(1),
    s2Kva: s2Kva.toFixed(1),
    kvaReleased: kvaReleased.toFixed(1),
    capacitorCurrentAmps: capacitorCurrentAmps.toFixed(1),
    recommendedContactorAmps: Math.ceil(recommendedContactorAmps),
    recommendedBreakerAmps: Math.ceil(recommendedBreakerAmps),
    stepSizeKvar,
    totalSteps,
    totalCostCapex: Math.round(totalCostCapex),
    paybackMonths: paybackMonths > 0 ? paybackMonths.toFixed(1) : 'ไม่มีค่าปรับ',
    paybackYears: paybackYears > 0 ? paybackYears.toFixed(1) : 'ไม่มีค่าปรับ',
    voltage: vNum,
    hasHarmonics,
    reactorType,
    unitCostPerKvar
  };
};

/**
 * Backward-compatible wrapper for existing components
 */
export const calculatePfc = (activePower, currentPF, targetPF = 0.95) => {
  const res = calculatePfcAdvanced(activePower, currentPF, targetPF);
  if (!res) return null;

  return {
    kvar: res.requiredKvar.toString(),
    savings: res.monthlyPenaltySavings.toString(),
    cost: res.totalCostCapex.toString(),
    roi: res.monthlyPenaltySavings > 0 ? `${res.paybackMonths} เดือน (${res.paybackYears} ปี)` : 'ไม่มีจุดคุ้มทุน (ไม่โดนค่าปรับอยู่แล้ว)'
  };
};
