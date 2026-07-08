import { useState } from 'react';
import { ArrowLeft, Wrench, RefreshCcw, ThermometerSnowflake, Wind, ChevronRight, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const simulationData = {
  ac: {
    name: 'ระบบปรับอากาศ (Air Conditioning)',
    icon: Wind,
    color: '#0080FF',
    scenarios: [
      {
        id: 'ac_not_cold',
        title: 'แอร์บ้านไม่เย็น มีแต่ลม',
        startNode: 'start',
        nodes: {
          start: {
            question: 'ลูกค้าแจ้งว่า: "แอร์ที่บ้านทำงานปกติ ลมออก แต่ลมไม่เย็นเลย" คุณจะเริ่มเช็คอะไรเป็นอันดับแรก?',
            options: [
              { text: 'เช็คฟิลเตอร์และคอยล์เย็นว่าตันหรือไม่', next: 'checkFilter' },
              { text: 'เอาเกจจ์ไปวัดน้ำยาแอร์ที่คอยล์ร้อนทันที', next: 'checkRefrigerant' },
              { text: 'เช็คว่าคอมเพรสเซอร์ทำงานหรือไม่', next: 'checkCompressor' }
            ]
          },
          checkFilter: {
            question: 'คุณเปิดฝาดูพบว่าฟิลเตอร์ฝุ่นเกาะหนามาก และคอยล์เย็นก็มีฝุ่นตัน คุณจะทำอย่างไร?',
            options: [
              { text: 'ล้างทำความสะอาดแอร์ (ล้างใหญ่)', next: 'successFilter' },
              { text: 'เติมน้ำยาแอร์เพิ่ม', next: 'failOvercharge' }
            ]
          },
          checkRefrigerant: {
            question: 'คุณเอาเกจจ์ไปวัดน้ำยา พบว่าน้ำยาปกติ (150 psi สำหรับ R32) แต่คอมเพรสเซอร์ไม่ได้ทำงาน มีแต่พัดลมหมุน คุณจะทำอย่างไร?',
            options: [
              { text: 'เช็คคาปาซิเตอร์ (Capacitor) ของคอมเพรสเซอร์', next: 'checkCapacitor' },
              { text: 'ปล่อยน้ำยาทิ้งแล้วเติมใหม่', next: 'failWaste' }
            ]
          },
          checkCompressor: {
            question: 'คุณเดินไปดูคอยล์ร้อน พบว่าพัดลมหมุน แต่ไม่ได้ยินเสียงคอมเพรสเซอร์ทำงาน (หรือดังแต๊กแล้วตัด) คุณจะเช็คอะไร?',
            options: [
              { text: 'เช็คคาปาซิเตอร์ (Capacitor) ของคอมเพรสเซอร์', next: 'checkCapacitor' },
              { text: 'สรุปว่าคอมพัง และแจ้งเปลี่ยนคอมเพรสเซอร์ใหม่', next: 'failExpensive' }
            ]
          },
          checkCapacitor: {
            question: 'คุณถอดคาปาซิเตอร์มาวัดด้วยมัลติมิเตอร์ พบว่าค่าความจุ (uF) ลดลงไปมากหรือแทบไม่มีเลย',
            options: [
              { text: 'เปลี่ยนคาปาซิเตอร์ตัวใหม่ที่มีค่า uF เท่าเดิม', next: 'successCapacitor' }
            ]
          },
          successFilter: {
            result: 'success',
            title: '✅ แก้ไขสำเร็จ!',
            desc: 'เก่งมากครับ! ปัญหาลมไม่เย็นส่วนใหญ่เกิดจากแอร์ตัน ทำให้ลมผ่านคอยล์เย็นไม่ได้ การล้างแอร์เป็นวิธีแก้ปัญหาที่ถูกต้องที่สุดและประหยัดที่สุด'
          },
          successCapacitor: {
            result: 'success',
            title: '✅ แก้ไขสำเร็จ!',
            desc: 'ยอดเยี่ยม! การที่คอมเพรสเซอร์ไม่สตาร์ทมักเกิดจาก Capacitor เสีย (ค่าเสื่อม/บวม) การเปลี่ยน Cap เป็นการแก้ปัญหาที่ตรงจุดและเสียค่าใช้จ่ายน้อยที่สุด'
          },
          failOvercharge: {
            result: 'fail',
            title: '❌ แก้ไขผิดพลาด!',
            desc: 'การเติมน้ำยาโดยที่แอร์ยังตันอยู่ จะทำให้ความดันในระบบสูงเกินไป (Overcharge) คอมเพรสเซอร์จะทำงานหนักและพังได้ น้ำยาแอร์ระบบปิดจะไม่หายไปไหนถ้าไม่รั่วครับ'
          },
          failWaste: {
            result: 'fail',
            title: '❌ แก้ไขผิดพลาด!',
            desc: 'เสียเวลาและเสียเงินลูกค้าฟรีๆ! น้ำยาแอร์ไม่ได้เสื่อมสภาพ การปล่อยทิ้งไม่ได้แก้ปัญหาที่คอมเพรสเซอร์ไม่ทำงาน'
          },
          failExpensive: {
            result: 'fail',
            title: '❌ ช่างสายฟันหัวแบะ!',
            desc: 'ใจเย็นๆ ก่อน! คอมเพรสเซอร์พังยากมาก ควรเช็คอุปกรณ์ส่วนควบอย่าง Capacitor หรือ แมกเนติกคอนแทคเตอร์ ก่อนที่จะฟันธงว่าคอมพังครับ'
          }
        }
      },
      {
        id: 'ac_water_leak',
        title: 'น้ำแอร์หยดหน้าเครื่อง',
        startNode: 'start',
        nodes: {
          start: {
            question: 'ลูกค้าแจ้งว่า: "น้ำแอร์หยดลงมาตรงหน้าเครื่องคอยล์เย็นเยอะมาก" คุณคิดว่าเป็นเพราะอะไร?',
            options: [
              { text: 'น้ำยาแอร์ขาด ทำให้เกิดน้ำแข็งเกาะแล้วละลาย', next: 'checkIce' },
              { text: 'ท่อน้ำทิ้งตัน หรือถาดน้ำทิ้งสกปรก', next: 'checkDrain' },
              { text: 'พัดลมคอยล์เย็นรอบตก', next: 'failWrongCause' }
            ]
          },
          checkDrain: {
            question: 'ถอดฝาครอบคอยล์เย็นออกมาดู พบว่าในถาดน้ำทิ้งมีเมือกใสๆ เต็มไปหมด และน้ำขังไม่ยอมไหล คุณจะแก้ปัญหาอย่างไร?',
            options: [
              { text: 'ใช้ปั๊มแรงดันสูงฉีดไล่เมือกในท่อน้ำทิ้งและล้างถาด', next: 'successDrain' },
              { text: 'ตัดท่อน้ำทิ้งทิ้งแล้วเดินใหม่หมด', next: 'failOverkill' }
            ]
          },
          checkIce: {
            question: 'ตรวจสอบคอยล์เย็น ไม่พบน้ำแข็งเกาะ แต่มีน้ำล้นจากถาดน้ำทิ้ง',
            options: [
              { text: 'เช็คท่อน้ำทิ้งและถาดน้ำทิ้งว่ามีอะไรอุดตันไหม', next: 'checkDrain' }
            ]
          },
          successDrain: {
            result: 'success',
            title: '✅ แก้ไขสำเร็จ!',
            desc: 'ถูกต้องครับ อาการน้ำหยดส่วนใหญ่เกิดจากฝุ่นและเมือกสะสมในถาดน้ำทิ้งและท่อน้ำทิ้ง การล้างทำความสะอาดและฉีดไล่ท่อน้ำทิ้งจะช่วยแก้ปัญหานี้ได้ 100%'
          },
          failWrongCause: {
            result: 'fail',
            title: '❌ วิเคราะห์ผิดจุด!',
            desc: 'พัดลมรอบตกอาจทำให้แอร์ไม่เย็นหรือเป็นน้ำแข็ง แต่สาเหตุหลักของน้ำหยดหน้าเครื่องคือทางระบายน้ำตันครับ'
          },
          failOverkill: {
            result: 'fail',
            title: '❌ ทำเรื่องเล็กให้เป็นเรื่องใหญ่!',
            desc: 'แค่เมือกอุดตัน ไม่จำเป็นต้องรื้อท่อน้ำทิ้งทิ้งทั้งระบบ แค่ใช้เครื่องเป่าลม (Blower) หรือปั๊มน้ำฉีดอัดไล่ก็เพียงพอแล้ว'
          }
        }
      }
    ]
  },
  refrig: {
    name: 'ระบบทำความเย็น (Refrigeration)',
    icon: ThermometerSnowflake,
    color: '#00F0FF',
    scenarios: [
      {
        id: 'fridge_ice',
        title: 'ตู้เย็น No-Frost น้ำแข็งเกาะช่องฟรีซ',
        startNode: 'start',
        nodes: {
          start: {
            question: 'ลูกค้าแจ้งว่า: "ตู้เย็น 2 ประตูแบบ No-Frost น้ำแข็งเกาะช่องฟรีซหนามาก และช่องแช่เย็นด้านล่างไม่เย็นเลย" คุณจะตรวจเช็คอะไร?',
            options: [
              { text: 'เติมน้ำยาทำความเย็นเพิ่ม', next: 'failRef' },
              { text: 'ตรวจสอบระบบละลายน้ำแข็ง (Defrost System)', next: 'checkDefrost' },
              { text: 'เปลี่ยนยางขอบประตูตู้เย็น', next: 'failRubber' }
            ]
          },
          checkDefrost: {
            question: 'ระบบละลายน้ำแข็งประกอบด้วย Heater, Bimetal (หรือ Defrost Thermostat) และ Timer (หรือบอร์ด) คุณเช็ค Timer แล้วทำงานปกติ คุณจะเช็คอะไรต่อ?',
            options: [
              { text: 'เช็ค Heater และ Bimetal', next: 'checkHeater' },
              { text: 'เช็คคอมเพรสเซอร์', next: 'failCompressor' }
            ]
          },
          checkHeater: {
            question: 'วัดค่าความต้านทานของ Heater พบว่ามีค่าโอห์มปกติ แต่วัด Bimetal ในขณะที่อุณหภูมิติดลบ (-10°C) พบว่าวงจรขาด (Open)',
            options: [
              { text: 'เปลี่ยน Bimetal (Defrost Thermostat) ใหม่', next: 'successBimetal' },
              { text: 'เปลี่ยน Heater ใหม่', next: 'failHeater' }
            ]
          },
          successBimetal: {
            result: 'success',
            title: '✅ แก้ไขสำเร็จ!',
            desc: 'เก่งมาก! Bimetal มีหน้าที่ต่อวงจรให้ Heater ทำงานเมื่อมีน้ำแข็งเกาะ (อุณหภูมิต่ำ) การที่มัน Open แปลว่ามันเสีย ทำให้ Heater ไม่ทำงาน น้ำแข็งจึงเกาะหนาจนบังทางลมลงด้านล่าง'
          },
          failRef: {
            result: 'fail',
            title: '❌ วิเคราะห์ผิด!',
            desc: 'ถ้าน้ำยาขาด ตู้เย็นจะไม่เย็นและจะไม่มีน้ำแข็งเกาะหนาเต็มแผงแบบนี้ การเติมน้ำยาไม่ช่วยอะไรเลย'
          },
          failRubber: {
            result: 'fail',
            title: '❌ ยังไม่ตรงจุด!',
            desc: 'ยางขอบประตูรั่วทำให้น้ำแข็งเกาะได้ก็จริง แต่สำหรับตู้ No-Frost ถ้าน้ำแข็งเกาะจนลามมาบังช่องลม สาเหตุหลักคือระบบละลายน้ำแข็งเสีย'
          },
          failCompressor: {
            result: 'fail',
            title: '❌ หลงทางแล้ว!',
            desc: 'ถ้าน้ำแข็งเกาะแปลว่าคอมเพรสเซอร์ทำความเย็นได้ปกติ ไม่จำเป็นต้องไปเช็คคอมเพรสเซอร์'
          },
          failHeater: {
            result: 'fail',
            title: '❌ เปลี่ยนผิดตัว!',
            desc: 'Heater มีความต้านทานแสดงว่าขดลวดไม่ขาด ตัวที่เสียคือ Bimetal ที่ไม่ยอมต่อวงจรต่างหาก'
          }
        }
      },
      {
        id: 'fridge_hot_comp',
        title: 'ตู้แช่คอมเพรสเซอร์ร้อนจัดและตัดการทำงาน',
        startNode: 'start',
        nodes: {
          start: {
            question: 'ตู้แช่มินิมาร์ทไม่เย็น คอมเพรสเซอร์ร้อนจัดและ Overload ตัดการทำงาน คุณเอามือจับแผงคอยล์ร้อนด้านล่างพบว่าร้อนมาก',
            options: [
              { text: 'เช็คพัดลมระบายความร้อนที่คอยล์ร้อน', next: 'checkFan' },
              { text: 'เปลี่ยน Overload Protector ใหม่', next: 'failOverload' }
            ]
          },
          checkFan: {
            question: 'พัดลมระบายความร้อนที่คอยล์ร้อน (Condenser Fan) ไม่หมุน เอามือเขี่ยดูพบว่าใบพัดฝืดมาก หมุนไม่ไป',
            options: [
              { text: 'ฉีดน้ำมันหล่อลื่น (โซแน็ก) แล้วปล่อยให้ลูกค้าใช้ต่อ', next: 'failTempFix' },
              { text: 'เปลี่ยนมอเตอร์พัดลมคอยล์ร้อนใหม่', next: 'successFan' }
            ]
          },
          successFan: {
            result: 'success',
            title: '✅ แก้ไขสำเร็จ!',
            desc: 'ถูกต้อง! มอเตอร์พัดลมระบายความร้อนพังทำให้คอยล์ร้อนระบายความร้อนไม่ได้ ความดันระบบสูงขึ้นจนคอมเพรสเซอร์กินกระแสสูงและ Overload ตัด การเปลี่ยนมอเตอร์คือวิธีที่ยั่งยืน'
          },
          failOverload: {
            result: 'fail',
            title: '❌ แก้ที่ปลายเหตุ!',
            desc: 'Overload ตัดเพราะคอมเพรสเซอร์ร้อนจัดจริงๆ การเปลี่ยน Overload ใหม่โดยไม่แก้ปัญหาการระบายความร้อน เดี๋ยวคอมเพรสเซอร์ก็จะพังในที่สุด'
          },
          failTempFix: {
            result: 'fail',
            title: '❌ ได้แค่ชั่วคราว!',
            desc: 'การฉีดน้ำมันหล่อลื่นช่วยให้มอเตอร์ที่ฝืดหมุนได้ชั่วคราวเท่านั้น ไม่เกิน 1-2 สัปดาห์มันก็จะฝืดอีกและทำให้ตู้ไม่เย็นเหมือนเดิม การเปลี่ยนมอเตอร์ใหม่คือทางออกที่ดีที่สุดสำหรับงานพาณิชย์'
          }
        }
      }
    ]
  },
  solar: {
    name: 'ระบบโซลาร์เซลล์ (Solar Power)',
    icon: Sun,
    color: '#F59E0B',
    scenarios: [
      {
        id: 'solar_low_yield',
        title: 'ผลิตไฟได้น้อยกว่าปกติมาก',
        startNode: 'start',
        nodes: {
          start: {
            question: 'ลูกค้าแจ้งว่า: "ช่วงนี้แดดแรงมาก แต่ดูในแอปแล้วระบบผลิตไฟได้น้อยกว่าเดือนก่อนๆ เกือบครึ่งเลย" คุณจะตรวจเช็คอะไรก่อน?',
            options: [
              { text: 'เช็คอินเวอร์เตอร์ว่าเสียหรือไม่', next: 'failInverter' },
              { text: 'ขอให้ลูกค้าถ่ายรูปแผงบนหลังคามาให้ดู', next: 'checkPanels' },
              { text: 'เช็คสายไฟ AC ที่เชื่อมต่อเข้าเบรกเกอร์', next: 'failCables' }
            ]
          },
          checkPanels: {
            question: 'รูปที่ลูกค้าส่งมาพบว่าแผงโซลาร์เซลล์มีฝุ่นเกาะหนามาก และมีขี้นกเยอะ แถมยังมีกิ่งไม้โตมาบังแผงบางส่วนในช่วงบ่าย คุณจะแนะนำลูกค้าว่าอย่างไร?',
            options: [
              { text: 'แนะนำให้ฉีดน้ำล้างแผงและตัดแต่งกิ่งไม้ที่บังแดด', next: 'successPanels' },
              { text: 'แนะนำให้ติด Optimizer เพิ่มทุกแผง', next: 'failOptimizer' }
            ]
          },
          successPanels: {
            result: 'success',
            title: '✅ แก้ไขสำเร็จ!',
            desc: 'ถูกต้องครับ! ปัญหาคลาสสิกที่สุดคือฝุ่น ขี้นก และเงาบังแผง (Shading) แค่บังแผงเดียวก็ทำให้กำลังการผลิตรวมของสตริงนั้นตกไปมหาศาล การบำรุงรักษาด้วยการล้างแผงคือวิธีที่ประหยัดและเห็นผลทันที'
          },
          failInverter: {
            result: 'fail',
            title: '❌ ยังไม่ใช่สาเหตุหลัก!',
            desc: 'ถ้าอินเวอร์เตอร์เสีย มักจะไม่ผลิตไฟเลย (0W) หรือขึ้น Error Code ชัดเจน การที่ไฟตกแต่ยังผลิตได้ มักมาจากสภาพแวดล้อมฝั่งแผง (DC) มากกว่า'
          },
          failCables: {
            result: 'fail',
            title: '❌ ไม่เกี่ยวกับจุดนี้!',
            desc: 'สาย AC ทำหน้าที่ส่งไฟที่แปลงแล้วเข้าบ้าน ถ้ามีปัญหาเบรกเกอร์จะทริป หรืออินเวอร์เตอร์จะขึ้น Grid Error ไฟจะไม่เข้าระบบเลย'
          },
          failOptimizer: {
            result: 'fail',
            title: '❌ เสียเงินเกินความจำเป็น!',
            desc: 'Optimizer ช่วยแก้ปัญหาเงาบังได้จริง แต่วิธีแก้ที่ตรงจุดและเสียค่าใช้จ่ายน้อยกว่าคือ "การตัดกิ่งไม้ที่บังเงาและการล้างแผง" ควรเริ่มจากวิธีเบสิคก่อนเสมอ'
          }
        }
      },
      {
        id: 'solar_grid_missing',
        title: 'Inverter ขึ้น Error "Grid Missing"',
        startNode: 'start',
        nodes: {
          start: {
            question: 'อินเวอร์เตอร์ระบบ On-Grid แจ้งเตือนไฟกระพริบสีแดง หน้าจอหรือในแอปขึ้นว่า "Grid Missing" หรือ "No AC Connection" เกิดจากอะไร?',
            options: [
              { text: 'แผงโซลาร์เซลล์เสีย', next: 'failPanels' },
              { text: 'ไฟการไฟฟ้าดับ หรือเบรกเกอร์ฝั่ง AC ฝั่งโซลาร์เซลล์ทริป', next: 'checkGrid' },
              { text: 'ระบบระบายความร้อนของอินเวอร์เตอร์มีปัญหา', next: 'failCooling' }
            ]
          },
          checkGrid: {
            question: 'คุณให้ลูกค้าลองเช็คไฟในบ้าน พบว่าไฟบ้านติดปกติ (การไฟฟ้าไม่ได้ดับ) จากนั้นไปดูที่ตู้ไฟของระบบโซลาร์เซลล์ คุณควรทำอย่างไร?',
            options: [
              { text: 'ตรวจสอบเบรกเกอร์ AC ว่าทริปตกลงมาหรือไม่ และใช้มัลติมิเตอร์วัดไฟ AC', next: 'successGrid' },
              { text: 'กด Reset คืนค่าโรงงานที่อินเวอร์เตอร์ทันที', next: 'failReset' }
            ]
          },
          successGrid: {
            result: 'success',
            title: '✅ แก้ไขสำเร็จ!',
            desc: 'ยอดเยี่ยม! "Grid Missing" หมายถึงอินเวอร์เตอร์ไม่เจอไฟจากการไฟฟ้า ถ้าไฟหลวงไม่ดับ แสดงว่าปัญหามักอยู่ที่เบรกเกอร์ AC ทริป, สายหลวม, หรือฟิวส์ขาด การตรวจเช็คแรงดันฝั่ง AC คือคำตอบที่ถูกต้องตามหลักวิศวกรรม'
          },
          failPanels: {
            result: 'fail',
            title: '❌ ผิดฝั่งแล้ว!',
            desc: 'แผงโซลาร์เซลล์อยู่ฝั่งไฟกระแสตรง (DC) แต่ Error "Grid Missing" หมายถึงปัญหาฝั่งไฟกระแสสลับ (AC) จากการไฟฟ้า'
          },
          failCooling: {
            result: 'fail',
            title: '❌ คนละเรื่องกัน!',
            desc: 'ปัญหาความร้อนจะแจ้งเตือนว่า "Over Temperature" ไม่ใช่ "Grid Missing"'
          },
          failReset: {
            result: 'fail',
            title: '❌ อย่าเพิ่งรีเซ็ต!',
            desc: 'การคืนค่าโรงงานทำให้ต้องตั้งค่า Grid Code และ Wi-Fi ใหม่ทั้งหมด ซึ่งไม่ช่วยแก้ปัญหาไฟ AC ไม่เข้าเครื่อง ควรเช็คเบรกเกอร์และสายไฟก่อนเสมอ'
          }
        }
      }
    ]
  }
};

const TroubleshootingSim = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [currentStep, setCurrentStep] = useState(null);

  const resetAll = () => {
    setSelectedCategory(null);
    setSelectedScenario(null);
    setCurrentStep(null);
  };

  const startScenario = (scenario) => {
    setSelectedScenario(scenario);
    setCurrentStep(scenario.startNode);
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button onClick={() => {
          if (currentStep) {
            setCurrentStep(null);
            setSelectedScenario(null);
          } else if (selectedCategory) {
            setSelectedCategory(null);
          } else {
            navigate(-1);
          }
        }} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '0.5rem' }}>
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-gradient-ac" style={{ marginBottom: 0, fontSize: '2rem' }}>จำลองสถานการณ์ซ่อมบำรุง</h1>
          <p style={{ color: 'var(--text-secondary)' }}>HVAC & Refrigeration Simulator</p>
        </div>
      </div>

      <div className="equipment-card" style={{ padding: '2.5rem', maxWidth: '800px', margin: '0 auto', minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
        
        {/* Step 1: Select Category */}
        {!selectedCategory && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>เลือกระบบที่ต้องการจำลอง</h2>
            {Object.entries(simulationData).map(([key, category]) => {
              const Icon = category.icon;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  style={{
                    background: 'var(--bg-tertiary)',
                    border: `1px solid var(--border-color)`,
                    padding: '2rem',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.5rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    color: 'var(--text-primary)',
                    textAlign: 'left'
                  }}
                  className="category-card-hover"
                  onMouseOver={e => e.currentTarget.style.borderColor = category.color}
                  onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
                >
                  <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '50%', color: category.color }}>
                    <Icon size={32} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.4rem' }}>{category.name}</h3>
                    <p style={{ margin: 0, color: 'var(--text-secondary)' }}>ทดสอบความรู้การวิเคราะห์อาการเสีย {category.scenarios.length} สถานการณ์</p>
                  </div>
                  <ChevronRight size={24} color="var(--text-tertiary)" />
                </button>
              );
            })}
          </div>
        )}

        {/* Step 2: Select Scenario */}
        {selectedCategory && !selectedScenario && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <Wrench size={28} color={simulationData[selectedCategory].color} />
              <h2 style={{ margin: 0 }}>เลือกสถานการณ์ ({simulationData[selectedCategory].name})</h2>
            </div>
            
            {simulationData[selectedCategory].scenarios.map((scenario) => (
              <button
                key={scenario.id}
                onClick={() => startScenario(scenario)}
                className="quiz-option-hover"
                style={{
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  padding: '1.5rem',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  color: 'var(--text-primary)',
                  textAlign: 'left'
                }}
              >
                <span style={{ fontSize: '1.2rem', fontWeight: '500' }}>{scenario.title}</span>
                <ChevronRight size={20} color="var(--text-tertiary)" />
              </button>
            ))}
          </div>
        )}

        {/* Step 3: Play Scenario */}
        {selectedScenario && currentStep && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%', flex: 1 }}>
            {(() => {
              const stepNode = selectedScenario.nodes[currentStep];
              
              if (stepNode.result) {
                // End state
                return (
                  <div className="animate-fade-in" style={{ textAlign: 'center', margin: 'auto', padding: '2rem 0' }}>
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: stepNode.result === 'success' ? '#4CAF50' : '#F44336' }}>
                      {stepNode.title}
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', lineHeight: '1.6', marginBottom: '3rem' }}>
                      {stepNode.desc}
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                      <button 
                        onClick={() => startScenario(selectedScenario)}
                        style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', padding: '1rem 2rem', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                      >
                        <RefreshCcw size={18} /> ลองสถานการณ์นี้ใหม่
                      </button>
                      <button 
                        onClick={() => { setSelectedScenario(null); setCurrentStep(null); }}
                        style={{ background: 'var(--accent-primary)', color: 'white', padding: '1rem 2rem', borderRadius: '8px', border: 'none', fontSize: '1rem', cursor: 'pointer', fontWeight: 'bold' }}
                      >
                        เลือกสถานการณ์อื่น
                      </button>
                    </div>
                  </div>
                );
              }

              // Question state
              return (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', color: simulationData[selectedCategory].color }}>
                    <Wrench size={32} />
                    <h2 style={{ fontSize: '1.4rem', margin: 0, color: 'var(--text-primary)' }}>สถานการณ์: {selectedScenario.title}</h2>
                  </div>
                  
                  <p style={{ fontSize: '1.3rem', lineHeight: '1.6', marginBottom: '3rem', flex: 1 }}>
                    {stepNode.question}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {stepNode.options.map((opt, i) => (
                      <button 
                        key={i}
                        className="quiz-option-hover"
                        onClick={() => setCurrentStep(opt.next)}
                        style={{ padding: '1.2rem', borderRadius: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '1.1rem', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s' }}
                      >
                        {opt.text}
                      </button>
                    ))}
                  </div>
                </>
              );
            })()}
          </div>
        )}

      </div>
    </div>
  );
};

export default TroubleshootingSim;
