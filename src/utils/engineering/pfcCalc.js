/**
 * Calculates Capacitor Bank size (kVAr), cost, savings, and ROI for Power Factor Correction.
 * @param {number|string} activePower - Load in kW
 * @param {number|string} currentPF - Current Power Factor (0-1)
 * @param {number|string} targetPF - Target Power Factor (0-1)
 * @returns {object|null} - Result object or null if input is invalid
 */
export const calculatePfc = (activePower, currentPF, targetPF) => {
  const P = parseFloat(activePower);
  const pf1 = parseFloat(currentPF);
  const pf2 = parseFloat(targetPF);

  if (isNaN(P) || isNaN(pf1) || isNaN(pf2) || pf1 <= 0 || pf1 >= 1 || pf2 <= 0 || pf2 > 1 || pf1 >= pf2) {
    return null;
  }

  // Calculate required kVAr
  const acos1 = Math.acos(pf1);
  const acos2 = Math.acos(pf2);
  const tan1 = Math.tan(acos1);
  const tan2 = Math.tan(acos2);

  const requiredKvar = P * (tan1 - tan2);

  // Calculate generic penalty savings (MEA/PEA usually charge if PF < 0.85)
  // Formula: Penalty = (Max Demand kVA * 0.85 - Max Demand kW) or similar, 
  // but typically it's ~56 THB per kVAr below the standard.
  // We'll simulate a simple savings model for educational purposes.
  let oldKvar = P * tan1;
  let standardKvarAllowed = P * Math.tan(Math.acos(0.85)); // 0.85 is typical standard
  
  let oldPenalty = 0;
  if (pf1 < 0.85 && oldKvar > standardKvarAllowed) {
    oldPenalty = (oldKvar - standardKvarAllowed) * 56; // 56 THB/kVAr approx penalty rate
  }

  let newKvar = P * tan2;
  let newPenalty = 0;
  if (pf2 < 0.85 && newKvar > standardKvarAllowed) {
    newPenalty = (newKvar - standardKvarAllowed) * 56;
  }

  const monthlySavings = Math.max(0, oldPenalty - newPenalty);
  const estimatedCapCost = requiredKvar * 800; // Estimated 800 THB per kVAr installed
  const roiMonths = monthlySavings > 0 ? (estimatedCapCost / monthlySavings) : 0;

  return {
    kvar: requiredKvar.toFixed(2),
    savings: monthlySavings.toFixed(2),
    cost: estimatedCapCost.toFixed(2),
    roi: roiMonths > 0 ? roiMonths.toFixed(1) : 'ไม่มีจุดคุ้มทุน (ไม่โดนค่าปรับอยู่แล้ว)'
  };
};
