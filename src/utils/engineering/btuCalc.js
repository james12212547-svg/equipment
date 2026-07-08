/**
 * Calculates the required BTU and recommended AC size based on room dimensions and exposure.
 * @param {number} width - Room width in meters
 * @param {number} length - Room length in meters
 * @param {number} height - Room height in meters
 * @param {string} roomType - Type of room ('bedroom', 'living', 'office', 'kitchen')
 * @param {string} sunExposure - Sun exposure ('normal', 'high')
 * @returns {object|null} - Result object containing area, volume, calculatedBTU, and recommendedSize, or null if input is invalid
 */
export const calculateBtuSizing = (width, length, height, roomType, sunExposure) => {
  const w = parseFloat(width);
  const l = parseFloat(length);
  const h = parseFloat(height); // Can be NaN if empty
  if (isNaN(w) || isNaN(l) || w <= 0 || l <= 0) return null;

  const area = w * l;
  
  // Base multiplier based on room type
  let multiplier = 800; // Default (Living/Office)
  if (roomType === 'bedroom') multiplier = 700;
  if (roomType === 'living' || roomType === 'office') multiplier = 800;
  if (roomType === 'kitchen') multiplier = 900;

  // Sun exposure adjustment
  if (sunExposure === 'high') {
    multiplier += 100;
  }

  // Calculate base BTU
  let calculatedBTU = area * multiplier;
  let volume = null;
  let isHighCeiling = false;

  // Double Volume or high ceiling adjustment (> 3 meters)
  if (!isNaN(h) && h > 0) {
    volume = area * h;
    if (h > 3) {
      isHighCeiling = true;
      // Convert area-based to volume-based (assuming standard height is ~3m)
      calculatedBTU = volume * (multiplier / 3);
    }
  }

  calculatedBTU = Math.ceil(calculatedBTU);
  
  // Recommend standard BTU sizes
  let recommendedSize = 9000;
  const sizes = [9000, 12000, 15000, 18000, 24000, 30000, 36000, 42000, 48000];
  
  for (let size of sizes) {
    if (calculatedBTU <= size) {
      recommendedSize = size;
      break;
    }
  }
  if (calculatedBTU > 48000) recommendedSize = calculatedBTU;

  return {
    area: area.toFixed(1),
    volume: volume ? volume.toFixed(1) : null,
    isHighCeiling,
    multiplier,
    calculatedBTU,
    recommendedSize
  };
};
