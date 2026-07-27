/**
 * EIT (วสท.) Compliant AC Voltage Drop Calculation Engine
 * Supports Copper/Aluminum, Non-magnetic/Steel conduits, Power Factor, Parallel Conductors, and Auto-Correction Sizing.
 */

// AC Resistance (R) & Reactance (X) in Ohm/km at 75°C for Copper (Cu) and Aluminum (Al)
export const CABLE_AC_SPECS = {
  Cu: {
    '1.5': { r: 14.8, xPvc: 0.105, xEmt: 0.130 },
    '2.5': { r: 8.92, xPvc: 0.098, xEmt: 0.123 },
    '4':   { r: 5.57, xPvc: 0.094, xEmt: 0.118 },
    '6':   { r: 3.71, xPvc: 0.090, xEmt: 0.115 },
    '10':  { r: 2.24, xPvc: 0.086, xEmt: 0.110 },
    '16':  { r: 1.41, xPvc: 0.084, xEmt: 0.106 },
    '25':  { r: 0.889, xPvc: 0.082, xEmt: 0.103 },
    '35':  { r: 0.641, xPvc: 0.080, xEmt: 0.101 },
    '50':  { r: 0.473, xPvc: 0.078, xEmt: 0.099 },
    '70':  { r: 0.328, xPvc: 0.076, xEmt: 0.096 },
    '95':  { r: 0.236, xPvc: 0.075, xEmt: 0.094 },
    '120': { r: 0.188, xPvc: 0.073, xEmt: 0.092 }
  },
  Al: {
    '10':  { r: 3.69, xPvc: 0.086, xEmt: 0.110 },
    '16':  { r: 2.33, xPvc: 0.084, xEmt: 0.106 },
    '25':  { r: 1.46, xPvc: 0.082, xEmt: 0.103 },
    '35':  { r: 1.05, xPvc: 0.080, xEmt: 0.101 },
    '50':  { r: 0.778, xPvc: 0.078, xEmt: 0.099 },
    '70':  { r: 0.540, xPvc: 0.076, xEmt: 0.096 },
    '95':  { r: 0.388, xPvc: 0.075, xEmt: 0.094 },
    '120': { r: 0.309, xPvc: 0.073, xEmt: 0.092 }
  }
};

// Legacy table for backward compatibility
export const cableData = {
  '1.5': 29,
  '2.5': 18,
  '4': 11,
  '6': 7.3,
  '10': 4.4,
  '16': 2.8,
  '25': 1.75,
  '35': 1.25,
  '50': 0.93,
  '70': 0.65,
  '95': 0.49,
  '120': 0.39,
};

export const calculateVoltageDropAdvanced = (phase, current, distance, cableSize, options = {}) => {
  const I = parseFloat(current);
  const L = parseFloat(distance);
  if (isNaN(I) || isNaN(L) || I <= 0 || L <= 0) {
    return null;
  }

  const {
    material = 'Cu',          // 'Cu' (ทองแดง) or 'Al' (อลูมิเนียม)
    conduitType = 'pvc',      // 'pvc' (อโลหะ) or 'emt' (ท่อเหล็กโลหะ)
    powerFactor = 0.85,       // cos theta
    circuitType = 'branch',   // 'branch' (3%), 'feeder' (3%), 'combined' (5%)
    parallelConductors = 1    // Number of parallel cables per phase
  } = options;

  const systemVoltage = phase === '1' ? 230 : 400;
  const pf = Math.max(0.1, Math.min(1.0, parseFloat(powerFactor) || 0.85));
  const sinPf = Math.sqrt(1 - Math.pow(pf, 2));
  const N = Math.max(1, parseInt(parallelConductors) || 1);

  const matSpecs = CABLE_AC_SPECS[material] || CABLE_AC_SPECS.Cu;
  const spec = matSpecs[cableSize] || matSpecs['4'] || matSpecs['10'];

  const r = spec.r;
  const x = conduitType === 'emt' ? spec.xEmt : spec.xPvc;

  // AC Voltage Drop Formula:
  // 1-Phase: VD = (2 * L * I * (R cosθ + X sinθ)) / (1000 * N)
  // 3-Phase: VD = (√3 * L * I * (R cosθ + X sinθ)) / (1000 * N)
  const impedanceTerm = (r * pf) + (x * sinPf);
  const factor = phase === '1' ? 2.0 : Math.sqrt(3);

  const dropV = (factor * L * I * impedanceTerm) / (1000 * N);
  const dropPercent = (dropV / systemVoltage) * 100;
  const receivingVoltage = systemVoltage - dropV;

  // EIT Max Allowed Limit
  const maxAllowedPercent = circuitType === 'combined' ? 5.0 : 3.0;
  const isPass = dropPercent <= maxAllowedPercent;

  // Auto-Correction Sizing: Find minimum cable size to pass if failed
  let autoRecommendedSize = null;
  let autoRecommendedPercent = null;

  if (!isPass) {
    const availableSizes = Object.keys(matSpecs);
    for (let s of availableSizes) {
      if (parseFloat(s) > parseFloat(cableSize)) {
        const sSpec = matSpecs[s];
        const sR = sSpec.r;
        const sX = conduitType === 'emt' ? sSpec.xEmt : sSpec.xPvc;
        const sImp = (sR * pf) + (sX * sinPf);
        const sDropV = (factor * L * I * sImp) / (1000 * N);
        const sDropPct = (sDropV / systemVoltage) * 100;
        if (sDropPct <= maxAllowedPercent) {
          autoRecommendedSize = s;
          autoRecommendedPercent = sDropPct.toFixed(2);
          break;
        }
      }
    }
  }

  return {
    dropV: dropV.toFixed(2),
    percent: dropPercent.toFixed(2),
    receivingVoltage: receivingVoltage.toFixed(2),
    isPass,
    maxAllowedPercent,
    voltage: systemVoltage,
    material,
    conduitType,
    powerFactor: pf.toFixed(2),
    circuitType,
    parallelConductors: N,
    autoRecommendedSize,
    autoRecommendedPercent
  };
};

/**
 * Backward-compatible wrapper
 */
export const calculateVoltageDrop = (phase, current, distance, cableSize) => {
  const res = calculateVoltageDropAdvanced(phase, current, distance, cableSize);
  if (!res) return null;
  return {
    dropV: res.dropV,
    percent: res.percent,
    isPass: res.isPass,
    voltage: res.voltage
  };
};
