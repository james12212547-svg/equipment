// อ้างอิงอัตราค่าไฟฟ้าโดยเฉลี่ย (PEA/MEA) ไม่รวม Ft และภาษี หรือรวมแบบประมาณการ
// หมายเหตุ: ใช้สำหรับการประเมินค่าไฟเบื้องต้นเท่านั้น

export const TARIFF_TYPES = [
  {
    id: 1,
    name: 'ประเภทที่ 1: บ้านอยู่อาศัย',
    rates: {
      normal: 4.42, // อัตราเฉลี่ยสำหรับการใช้ไฟเกิน 150 หน่วย
      tou: { onPeak: 5.7982, offPeak: 2.6369 },
      tod: null // บ้านอยู่อาศัยไม่มี TOD
    }
  },
  {
    id: 2,
    name: 'ประเภทที่ 2: กิจการขนาดเล็ก',
    rates: {
      normal: 4.42,
      tou: { onPeak: 5.7982, offPeak: 2.6369 },
      tod: { onPeak: 5.2674, partialPeak: 4.2598, offPeak: 2.6369 }
    }
  },
  {
    id: 3,
    name: 'ประเภทที่ 3: กิจการขนาดกลาง',
    rates: {
      normal: 3.14, // ไม่มี Normal ปกติบังคับ TOU/TOD แต่ใส่ค่าเฉลี่ยไว้
      tou: { onPeak: 4.1839, offPeak: 2.6037 },
      tod: { onPeak: 4.1025, partialPeak: 4.1025, offPeak: 2.6037 } // Simplified
    }
  },
  {
    id: 4,
    name: 'ประเภทที่ 4: กิจการขนาดใหญ่',
    rates: {
      normal: 3.14,
      tou: { onPeak: 4.1839, offPeak: 2.6037 },
      tod: { onPeak: 4.1025, partialPeak: 4.1025, offPeak: 2.6037 }
    }
  },
  {
    id: 5,
    name: 'ประเภทที่ 5: กิจการเฉพาะอย่าง (เช่น โรงแรม)',
    rates: {
      normal: 3.14,
      tou: { onPeak: 4.1839, offPeak: 2.6037 },
      tod: { onPeak: 4.1025, partialPeak: 4.1025, offPeak: 2.6037 }
    }
  },
  {
    id: 6,
    name: 'ประเภทที่ 6: องค์กรไม่แสวงหาผลกำไร',
    rates: {
      normal: 3.42,
      tou: { onPeak: 4.1839, offPeak: 2.6037 },
      tod: null
    }
  },
  {
    id: 7,
    name: 'ประเภทที่ 7: กิจการสูบน้ำเพื่อการเกษตร',
    rates: {
      normal: 3.13,
      tou: { onPeak: 5.1135, offPeak: 2.6037 },
      tod: null
    }
  },
  {
    id: 8,
    name: 'ประเภทที่ 8: ไฟฟ้าชั่วคราว',
    rates: {
      normal: 6.8025,
      tou: null,
      tod: null
    }
  }
];
