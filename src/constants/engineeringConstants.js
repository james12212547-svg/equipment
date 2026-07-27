export const BREAKER_SIZES = [10, 16, 20, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250, 320, 400, 500, 630];

export const APPLIANCE_PRESETS = [
  { name: 'เครื่องปรับอากาศ 9,000 BTU', current: 3.5, type: 'AC' },
  { name: 'เครื่องปรับอากาศ 12,000 BTU', current: 5.0, type: 'AC' },
  { name: 'เครื่องปรับอากาศ 18,000 BTU', current: 7.5, type: 'AC' },
  { name: 'เครื่องปรับอากาศ 24,000 BTU', current: 10.0, type: 'AC' },
  { name: 'เครื่องปรับอากาศ 36,000 BTU', current: 15.0, type: 'AC' },
  { name: 'เครื่องทำน้ำอุ่น 3,500W', current: 16.0, type: 'Heater' },
  { name: 'เครื่องทำน้ำอุ่น 4,500W', current: 20.5, type: 'Heater' },
  { name: 'เครื่องทำน้ำอุ่น 6,000W', current: 27.5, type: 'Heater' },
  { name: 'ตู้เย็น (ขนาดทั่วไป)', current: 1.5, type: 'General' },
  { name: 'เครื่องซักผ้า', current: 2.5, type: 'General' },
  { name: 'เต้ารับทั่วไป (1 วงจร)', current: 8.0, type: 'Receptacle' },
  { name: 'วงจรแสงสว่าง (1 วงจร)', current: 5.0, type: 'Lighting' },
  { name: 'EV Charger 7kW (1-Phase)', current: 32.0, type: 'EV' },
];

export const CONDUIT_SPECS = {
  PVC: [
    { size: '3/8" (15mm)', mm: 15, area: 154, maxFill: 61 },
    { size: '1/2" (18mm)', mm: 18, area: 254, maxFill: 101 },
    { size: '3/4" (20mm)', mm: 20, area: 380, maxFill: 152 },
    { size: '1" (25mm)', mm: 25, area: 615, maxFill: 246 },
    { size: '1-1/4" (35mm)', mm: 35, area: 962, maxFill: 385 },
    { size: '1-1/2" (40mm)', mm: 40, area: 1452, maxFill: 580 },
    { size: '2" (55mm)', mm: 55, area: 2290, maxFill: 916 },
    { size: '2-1/2" (65mm)', mm: 65, area: 3318, maxFill: 1327 },
    { size: '3" (80mm)', mm: 80, area: 4900, maxFill: 1960 },
    { size: '4" (100mm)', mm: 100, area: 8170, maxFill: 3268 }
  ],
  EMT: [
    { size: '1/2"', mm: 15, area: 196, maxFill: 78 },
    { size: '3/4"', mm: 20, area: 343, maxFill: 137 },
    { size: '1"', mm: 25, area: 556, maxFill: 222 },
    { size: '1-1/4"', mm: 32, area: 962, maxFill: 385 },
    { size: '1-1/2"', mm: 40, area: 1314, maxFill: 525 },
    { size: '2"', mm: 50, area: 2165, maxFill: 866 },
    { size: '2-1/2"', mm: 65, area: 3420, maxFill: 1368 },
    { size: '3"', mm: 80, area: 5025, maxFill: 2010 },
    { size: '4"', mm: 100, area: 8660, maxFill: 3464 }
  ],
  IMC: [
    { size: '1/2"', mm: 15, area: 214, maxFill: 85 },
    { size: '3/4"', mm: 20, area: 373, maxFill: 149 },
    { size: '1"', mm: 25, area: 607, maxFill: 242 },
    { size: '1-1/4"', mm: 32, area: 1050, maxFill: 420 },
    { size: '1-1/2"', mm: 40, area: 1430, maxFill: 572 },
    { size: '2"', mm: 50, area: 2330, maxFill: 932 },
    { size: '2-1/2"', mm: 65, area: 3310, maxFill: 1324 },
    { size: '3"', mm: 80, area: 5100, maxFill: 2040 },
    { size: '4"', mm: 100, area: 8600, maxFill: 3440 }
  ],
  RSC: [
    { size: '1/2"', mm: 15, area: 206, maxFill: 82 },
    { size: '3/4"', mm: 20, area: 360, maxFill: 144 },
    { size: '1"', mm: 25, area: 586, maxFill: 234 },
    { size: '1-1/4"', mm: 32, area: 1010, maxFill: 404 },
    { size: '1-1/2"', mm: 40, area: 1380, maxFill: 552 },
    { size: '2"', mm: 50, area: 2260, maxFill: 904 },
    { size: '2-1/2"', mm: 65, area: 3210, maxFill: 1284 },
    { size: '3"', mm: 80, area: 4960, maxFill: 1984 },
    { size: '4"', mm: 100, area: 8430, maxFill: 3372 }
  ],
  HDPE: [
    { size: '20mm', mm: 20, area: 201, maxFill: 80 },
    { size: '25mm', mm: 25, area: 314, maxFill: 125 },
    { size: '32mm', mm: 32, area: 530, maxFill: 212 },
    { size: '40mm', mm: 40, area: 855, maxFill: 342 },
    { size: '50mm', mm: 50, area: 1385, maxFill: 554 },
    { size: '63mm', mm: 63, area: 2120, maxFill: 848 },
    { size: '75mm', mm: 75, area: 3020, maxFill: 1208 },
    { size: '90mm', mm: 90, area: 4415, maxFill: 1766 },
    { size: '110mm', mm: 110, area: 6650, maxFill: 2660 }
  ],
  FMC: [
    { size: '1/2"', mm: 15, area: 201, maxFill: 80 },
    { size: '3/4"', mm: 20, area: 340, maxFill: 136 },
    { size: '1"', mm: 25, area: 530, maxFill: 212 },
    { size: '1-1/4"', mm: 32, area: 960, maxFill: 384 },
    { size: '1-1/2"', mm: 40, area: 1250, maxFill: 500 },
    { size: '2"', mm: 50, area: 2040, maxFill: 816 }
  ]
};

export const WIRE_AREAS = {
  THW: {
    1.5: 8.5, 2.5: 11, 4: 15, 6: 22, 10: 38.5, 16: 46.5, 25: 75, 35: 95, 50: 130, 70: 175
  },
  NYY: {
    1.5: 23, 2.5: 27, 4: 33, 6: 39, 10: 50, 16: 64, 25: 95, 35: 113, 50: 143, 70: 180
  },
  VAF: {
    1.5: 25, 2.5: 33, 4: 45, 6: 58, 10: 82
  }
};
