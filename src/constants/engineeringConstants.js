export const BREAKER_SIZES = [16, 20, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250, 320, 400, 500, 630];

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
