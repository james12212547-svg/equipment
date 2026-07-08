// Simplified mV/A/m for Copper multicore PVC cables
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

/**
 * Calculates voltage drop for a given cable size, length, and current.
 * @param {string} phase - '1' (230V) or '3' (400V)
 * @param {number|string} current - Current in Amperes
 * @param {number|string} distance - Distance in meters
 * @param {string} cableSize - Cable size in sq.mm
 * @returns {object|null} - Result object or null if input is invalid
 */
export const calculateVoltageDrop = (phase, current, distance, cableSize) => {
  const I = parseFloat(current);
  const L = parseFloat(distance);
  const mV = cableData[cableSize];
  const systemVoltage = phase === '1' ? 230 : 400;

  if (isNaN(I) || isNaN(L) || I <= 0 || L <= 0) {
    return null;
  }

  // Formula: VD = (mV/A/m * I * L) / 1000
  // For 3-phase, the table values are usually line-to-line drop, but let's use standard simplified calculation.
  let dropV = (mV * I * L) / 1000;
  
  // Convert to percentage
  let dropPercent = (dropV / systemVoltage) * 100;

  return {
    dropV: dropV.toFixed(2),
    percent: dropPercent.toFixed(2),
    isPass: dropPercent <= 3, // Standard allows 3% for lighting, 5% for general. We use strict 3%.
    voltage: systemVoltage
  };
};
