/**
 * Calculates recommended cable size and breaker size based on ampere load.
 * Simplified Cable Sizing (EIT Guidelines for THW/VAF in PVC pipe).
 * @param {number|string} ampere - The load current in Amperes
 * @returns {object|null} - Result object or null if input is invalid
 */
export const calculateCableSizing = (ampere) => {
  const amp = parseFloat(ampere);
  if (isNaN(amp) || amp <= 0) return null;

  // Very simplified standard mapping (similar to Thai EIT standard for THW/VAF in PVC pipe)
  let cableSize = "0";
  let breakerSize = 0;

  if (amp <= 11) { cableSize = "1.5"; breakerSize = 10; }
  else if (amp <= 15) { cableSize = "2.5"; breakerSize = 16; }
  else if (amp <= 21) { cableSize = "4"; breakerSize = 20; }
  else if (amp <= 28) { cableSize = "6"; breakerSize = 32; }
  else if (amp <= 38) { cableSize = "10"; breakerSize = 40; }
  else if (amp <= 50) { cableSize = "16"; breakerSize = 50; }
  else if (amp <= 65) { cableSize = "25"; breakerSize = 63; }
  else if (amp <= 81) { cableSize = "35"; breakerSize = 80; }
  else if (amp <= 99) { cableSize = "50"; breakerSize = 100; }
  else { cableSize = "ปรึกษาวิศวกรออกแบบ"; breakerSize = "Over 100"; }

  return {
    load: amp,
    cableSize,
    breakerSize
  };
};
