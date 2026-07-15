/**
 * Calculates recommended cable size and breaker size based on ampere load.
 * Complies with EIT Guidelines for THW in PVC pipe (coordinating CB with Cable capacity).
 * @param {number|string} ampere - The load current in Amperes
 * @param {string} loadName - Optional name of the load to enforce specific rules (e.g., Receptacles)
 * @returns {object|null} - Result object or null if input is invalid
 */
export const calculateCableSizing = (ampere, loadName = '') => {
  const amp = parseFloat(ampere);
  if (isNaN(amp) || amp <= 0) return null;

  let minAmps = amp * 1.25;
  
  // Rule: Receptacles must use minimum 2.5 sq.mm with 16AT breaker
  const isReceptacle = loadName.includes('เต้ารับ');
  if (isReceptacle && minAmps < 16) {
    minAmps = 16; 
  }

  const standardBreakers = [10, 16, 20, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250, 320, 400, 500, 630];
  const breakerSize = standardBreakers.find(b => b >= minAmps) || Math.ceil(minAmps);

  let cableSize = "2.5";
  switch(breakerSize) {
    case 10: cableSize = "1.5"; break;
    case 16: cableSize = "2.5"; break;
    case 20: cableSize = "4"; break;
    case 32: cableSize = "6"; break;
    case 40: cableSize = "10"; break;
    case 50: cableSize = "16"; break;
    case 63: cableSize = "25"; break;
    case 80: cableSize = "35"; break;
    case 100: cableSize = "50"; break;
    case 125: cableSize = "70"; break;
    case 160: cableSize = "95"; break;
    case 200: cableSize = "120"; break;
    default: cableSize = "ปรึกษาวิศวกร";
  }

  return {
    load: amp,
    cableSize,
    breakerSize
  };
};
