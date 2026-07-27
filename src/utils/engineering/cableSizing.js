/**
 * EIT (วสท.) Compliant Cable, Breaker, Ground Wire, and Conduit Sizing Engine
 */

// Ground wire sizing based on EIT Table 5-27 (อ้างอิงพิกัดเบรกเกอร์)
const GROUND_WIRE_TABLE = [
  { maxCb: 20, groundSize: 2.5 },
  { maxCb: 40, groundSize: 4 },
  { maxCb: 60, groundSize: 6 },
  { maxCb: 100, groundSize: 10 },
  { maxCb: 125, groundSize: 16 },
  { maxCb: 200, groundSize: 25 },
  { maxCb: 400, groundSize: 35 },
  { maxCb: 800, groundSize: 50 }
];

// Conduit Fill Table (Maximum 40% fill capacity rule for 3 or more wires)
const CONDUIT_SIZES = [
  { name: '1/2" (4 หุน)', maxAreaSqmm: 78 },   // 40% of 196 sqmm
  { name: '3/4" (6 หุน)', maxAreaSqmm: 136 },  // 40% of 340 sqmm
  { name: '1" (8 หุน)', maxAreaSqmm: 215 },    // 40% of 538 sqmm
  { name: '1-1/4" (1 นิ้วสอง)', maxAreaSqmm: 375 },
  { name: '1-1/2" (1 นิ้วครึ่ง)', maxAreaSqmm: 512 },
  { name: '2" (2 นิ้ว)', maxAreaSqmm: 840 }
];

// Cable Outer Diameter & Resistance (approximate per size)
const CABLE_SPECS = {
  1.5: { outerDiameter: 3.0, rPerKm: 12.1 },
  2.5: { outerDiameter: 3.6, rPerKm: 7.41 },
  4:   { outerDiameter: 4.2, rPerKm: 4.61 },
  6:   { outerDiameter: 4.8, rPerKm: 3.08 },
  10:  { outerDiameter: 6.2, rPerKm: 1.83 },
  16:  { outerDiameter: 7.4, rPerKm: 1.15 },
  25:  { outerDiameter: 9.0, rPerKm: 0.727 },
  35:  { outerDiameter: 10.2, rPerKm: 0.524 },
  50:  { outerDiameter: 12.0, rPerKm: 0.387 },
  70:  { outerDiameter: 14.0, rPerKm: 0.268 },
  95:  { outerDiameter: 16.5, rPerKm: 0.193 },
  120: { outerDiameter: 18.2, rPerKm: 0.153 }
};

// EIT Ampacity Table (THW / VAF / NYY / CV-XLPE) for Group 1 (Air) vs Group 2 (Conduit)
const AMPACITY_TABLES = {
  // Group 2: ร้อยท่อในอากาศ (PVC/EMT) - 70°C PVC (THW/VAF)
  group2_pvc: [
    { size: 1.5, amp: 15 },
    { size: 2.5, amp: 21 },
    { size: 4,   amp: 28 },
    { size: 6,   amp: 36 },
    { size: 10,  amp: 50 },
    { size: 16,  amp: 68 },
    { size: 25,  amp: 89 },
    { size: 35,  amp: 110 },
    { size: 50,  amp: 134 },
    { size: 70,  amp: 171 },
    { size: 95,  amp: 207 },
    { size: 120, amp: 239 }
  ],
  // Group 1: เดินลอยในอากาศ (Free Air) - 70°C PVC
  group1_pvc: [
    { size: 1.5, amp: 18 },
    { size: 2.5, amp: 25 },
    { size: 4,   amp: 34 },
    { size: 6,   amp: 44 },
    { size: 10,  amp: 61 },
    { size: 16,  amp: 82 },
    { size: 25,  amp: 108 },
    { size: 35,  amp: 135 },
    { size: 50,  amp: 168 },
    { size: 70,  amp: 213 },
    { size: 95,  amp: 258 },
    { size: 120, amp: 300 }
  ],
  // 90°C XLPE (CV Cable) - Higher heat tolerance (+25%)
  cv_xlpe: [
    { size: 1.5, amp: 22 },
    { size: 2.5, amp: 30 },
    { size: 4,   amp: 40 },
    { size: 6,   amp: 51 },
    { size: 10,  amp: 70 },
    { size: 16,  amp: 95 },
    { size: 25,  amp: 126 },
    { size: 35,  amp: 155 },
    { size: 50,  amp: 189 },
    { size: 70,  amp: 238 },
    { size: 95,  amp: 289 },
    { size: 120, amp: 337 }
  ]
};

export const calculateCableSizingAdvanced = (inputLoad, options = {}) => {
  const opts = options || {};
  const loadVal = parseFloat(inputLoad);
  if (isNaN(loadVal) || loadVal <= 0) return null;

  const {
    inputUnit = 'A',       // 'A', 'kW', 'W', 'HP'
    systemPhase = '1P',    // '1P' (220V) or '3P' (380V)
    cableType = 'THW',     // 'THW', 'VAF', 'NYY', 'CV', 'VCT'
    installMethod = 'group2', // 'group2' (ร้อยท่อ), 'group1' (เดินลอย), 'group5' (ฝังดิน)
    lengthMeters = 20,     // Length in meters
    pf = 0.85,             // Power factor
    loadName = ''
  } = opts;

  // 1. Calculate Load Current in Amperes
  let currentAmps = loadVal;
  const voltage = systemPhase === '3P' ? 380 : 220;

  if (inputUnit === 'kW') {
    currentAmps = systemPhase === '3P' 
      ? (loadVal * 1000) / (Math.sqrt(3) * voltage * pf)
      : (loadVal * 1000) / (voltage * pf);
  } else if (inputUnit === 'W') {
    currentAmps = systemPhase === '3P' 
      ? loadVal / (Math.sqrt(3) * voltage * pf)
      : loadVal / (voltage * pf);
  } else if (inputUnit === 'HP') {
    const watts = loadVal * 746;
    currentAmps = systemPhase === '3P' 
      ? watts / (Math.sqrt(3) * voltage * 0.85 * 0.85)
      : watts / (voltage * 0.85 * 0.85);
  }

  currentAmps = Number(currentAmps.toFixed(2));

  // 2. Continuous Load Safety Factor 125% for Breaker Sizing
  let designAmps = currentAmps * 1.25;

  // Receptacle minimum rule
  const safeLoadName = String(loadName || '');
  if (safeLoadName.includes('เต้ารับ') && designAmps < 16) {
    designAmps = 16;
  }

  const standardBreakers = [10, 16, 20, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250, 320, 400, 500, 630];
  const breakerSize = standardBreakers.find(b => b >= designAmps) || Math.ceil(designAmps);

  // 3. Select Ampacity Table based on Cable Type & Install Method
  let ampacityList = AMPACITY_TABLES.group2_pvc;
  if (cableType === 'CV') {
    ampacityList = AMPACITY_TABLES.cv_xlpe;
  } else if (installMethod === 'group1') {
    ampacityList = AMPACITY_TABLES.group1_pvc;
  }

  // 4. Initial Cable Size Selection by Ampacity
  let selectedCableEntry = ampacityList.find(c => c.amp >= breakerSize) || ampacityList[ampacityList.length - 1];
  let cableSizeNum = selectedCableEntry.size;

  // 5. Voltage Drop Calculation & Auto-Upsizing if VD > 3%
  const length = Math.max(1, parseFloat(lengthMeters) || 20);
  let voltageDropPercent = 0;
  let voltageDropVolts = 0;
  let upsizedForVd = false;

  const calculateVd = (size) => {
    const spec = CABLE_SPECS[size] || CABLE_SPECS[16];
    const r = spec.rPerKm;
    const vDrop = systemPhase === '3P'
      ? (Math.sqrt(3) * length * currentAmps * (r * pf / 1000))
      : (2 * length * currentAmps * (r * pf / 1000));
    const vPercent = (vDrop / voltage) * 100;
    return { vDrop, vPercent };
  };

  let vdResult = calculateVd(cableSizeNum);
  voltageDropVolts = vdResult.vDrop;
  voltageDropPercent = vdResult.vPercent;

  // Auto-upsize cable if Voltage Drop > 3%
  if (voltageDropPercent > 3.0) {
    for (let i = 0; i < ampacityList.length; i++) {
      if (ampacityList[i].size > cableSizeNum) {
        cableSizeNum = ampacityList[i].size;
        vdResult = calculateVd(cableSizeNum);
        voltageDropVolts = vdResult.vDrop;
        voltageDropPercent = vdResult.vPercent;
        upsizedForVd = true;
        if (voltageDropPercent <= 3.0) break;
      }
    }
  }

  // 6. Ground Wire Sizing (EIT Table 5-27)
  const groundEntry = GROUND_WIRE_TABLE.find(g => breakerSize <= g.maxCb) || GROUND_WIRE_TABLE[GROUND_WIRE_TABLE.length - 1];
  const groundWireSize = groundEntry.groundSize;

  // 7. Conduit Sizing (40% Fill Rule)
  const numPhaseWires = systemPhase === '3P' ? 4 : 2;
  const specPhase = CABLE_SPECS[cableSizeNum] || CABLE_SPECS[16];
  const specGround = CABLE_SPECS[groundWireSize] || CABLE_SPECS[2.5];

  const areaPhaseOne = Math.PI * Math.pow(specPhase.outerDiameter / 2, 2);
  const areaGroundOne = Math.PI * Math.pow(specGround.outerDiameter / 2, 2);

  const totalWireArea = (numPhaseWires * areaPhaseOne) + areaGroundOne;
  const recommendedConduit = CONDUIT_SIZES.find(c => c.maxAreaSqmm >= totalWireArea) || CONDUIT_SIZES[CONDUIT_SIZES.length - 1];

  return {
    currentAmps,
    breakerSize,
    cableSizeNum,
    cableSizeStr: `${cableSizeNum}`,
    groundWireSize: `${groundWireSize}`,
    conduitSizeStr: recommendedConduit.name,
    voltageDropVolts: voltageDropVolts.toFixed(2),
    voltageDropPercent: voltageDropPercent.toFixed(2),
    isVdPassed: voltageDropPercent <= 3.0,
    upsizedForVd,
    voltage,
    systemPhase,
    cableType,
    installMethod
  };
};

/**
 * Backward-compatible wrapper for existing components (LoadSchedule, SingleLineDiagram)
 */
export const calculateCableSizing = (ampere, loadName = '') => {
  const res = calculateCableSizingAdvanced(ampere, { loadName });
  if (!res) return null;
  return {
    load: res.currentAmps,
    cableSize: res.cableSizeStr,
    breakerSize: res.breakerSize
  };
};
