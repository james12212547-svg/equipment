import { useState } from 'react';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const quizData = [
  { id: 1, question: 'หน้าที่หลักของคอมเพรสเซอร์ (Compressor) ในระบบปรับอากาศคืออะไร?', options: ['A. ระบายความร้อนออกจากระบบ', 'B. เพิ่มความดันและอุณหภูมิของสารทำความเย็น', 'C. กรองฝุ่นละอองในอากาศ', 'D. ลดความดันของสารทำความเย็น'], correct: 1 },
  { id: 2, question: 'อุปกรณ์ใดทำหน้าที่ระบายความร้อนออกจากสารทำความเย็นสู่สภาพแวดล้อม?', options: ['A. อีแวปปอเรเตอร์ (Evaporator)', 'B. เอ็กซ์แพนชันวาล์ว (Expansion Valve)', 'C. คอนเดนเซอร์ (Condenser)', 'D. แอคคิวมูเลเตอร์ (Accumulator)'], correct: 2 },
  { id: 3, question: 'อุปกรณ์ใดทำหน้าที่ลดความดันและอุณหภูมิของสารทำความเย็นก่อนเข้าคอยล์เย็น?', options: ['A. เอ็กซ์แพนชันวาล์ว (Expansion Valve)', 'B. คอมเพรสเซอร์ (Compressor)', 'C. ฟิลเตอร์ดรายเออร์ (Filter Drier)', 'D. เทอร์โมสตัท (Thermostat)'], correct: 0 },
  { id: 4, question: 'กระบวนการใดเกิดขึ้นที่อีแวปปอเรเตอร์ (Evaporator)?', options: ['A. สารทำความเย็นกลั่นตัวเป็นของเหลว', 'B. สารทำความเย็นเดือดและดูดซับความร้อนจนเปลี่ยนสถานะเป็นแก๊ส', 'C. สารทำความเย็นถูกอัดให้มีความดันสูงขึ้น', 'D. สารทำความเย็นถูกแยกความชื้นออก'], correct: 1 },
  { id: 5, question: 'สารทำความเย็นที่ไหลออกจากคอมเพรสเซอร์ (Discharge Line) มีสถานะใด?', options: ['A. ของเหลวความดันต่ำ อุณหภูมิต่ำ', 'B. แก๊สความดันต่ำ อุณหภูมิต่ำ', 'C. ของเหลวความดันสูง อุณหภูมิสูง', 'D. แก๊สความดันสูง อุณหภูมิสูง'], correct: 3 },
  { id: 6, question: 'สารทำความเย็นที่ไหลออกจากคอนเดนเซอร์ (Liquid Line) มีสถานะหลักเป็นอะไร?', options: ['A. แก๊สความดันสูง', 'B. ของเหลวความดันสูง', 'C. ของเหลวผสมแก๊สความดันต่ำ', 'D. แก๊สความดันต่ำ'], correct: 1 },
  { id: 7, question: 'วัฏจักรการทำความเย็นแบบอัดไอ (Vapor-Compression Cycle) เริ่มต้นและสิ้นสุดที่อุปกรณ์ใด?', options: ['A. คอมเพรสเซอร์ (Compressor)', 'B. คอนเดนเซอร์ (Condenser)', 'C. อีแวปปอเรเตอร์ (Evaporator)', 'D. เอ็กซ์แพนชันวาล์ว (Expansion Valve)'], correct: 0 },
  { id: 8, question: 'ความร้อนที่ใช้ในการเปลี่ยนสถานะของสารโดยที่อุณหภูมิไม่เปลี่ยนแปลง เรียกว่าอะไร?', options: ['A. ความร้อนสัมผัส (Sensible Heat)', 'B. ความร้อนจำเพาะ (Specific Heat)', 'C. ความร้อนแฝง (Latent Heat)', 'D. ความร้อนรวม (Total Heat)'], correct: 2 },
  { id: 9, question: 'ความร้อนที่ทำให้สารมีอุณหภูมิเปลี่ยนไปแต่สถานะยังคงเดิม เรียกว่าอะไร?', options: ['A. ความร้อนแฝง (Latent Heat)', 'B. ความร้อนสัมผัส (Sensible Heat)', 'C. การนำความร้อน (Conduction)', 'D. การแผ่รังสีความร้อน (Radiation)'], correct: 1 },
  { id: 10, question: 'หลอดรูเข็ม (Capillary Tube) ในระบบปรับอากาศขนาดเล็ก ทำหน้าที่คล้ายกับอุปกรณ์ใด?', options: ['A. คอมเพรสเซอร์ (Compressor)', 'B. คอนเดนเซอร์ (Condenser)', 'C. เอ็กซ์แพนชันวาล์ว (Expansion Valve)', 'D. รีเวอร์ซิงวาล์ว (Reversing Valve)'], correct: 2 },
  { id: 11, question: 'ส่วนที่เรียกว่า Condensing Unit ของเครื่องปรับอากาศแบบแยกส่วน (Split Type) ประกอบด้วยอะไรบ้าง?', options: ['A. คอยล์เย็นและพัดลมโบลเวอร์', 'B. คอมเพรสเซอร์และคอยล์ร้อน', 'C. คอยล์ร้อนและคอยล์เย็น', 'D. แผงวงจรและเทอร์โมสตัท'], correct: 1 },
  { id: 12, question: 'แอคคิวมูเลเตอร์ (Accumulator) ในระบบทำความเย็นมีหน้าที่สำคัญคืออะไร?', options: ['A. เพิ่มแรงดันน้ำยาแอร์ก่อนเข้าคอมเพรสเซอร์', 'B. ป้องกันสารทำความเย็นสถานะของเหลวไหลกลับเข้าคอมเพรสเซอร์', 'C. กรองฝุ่นละอองในระบบท่อน้ำยา', 'D. ระบายความร้อนให้คอมเพรสเซอร์'], correct: 1 },
  { id: 13, question: 'อุปกรณ์ใดทำหน้าที่กรองสิ่งสกปรกและดูดซับความชื้นในระบบท่อน้ำยา?', options: ['A. Filter Drier', 'B. Air Filter', 'C. Muffler', 'D. Oil Separator'], correct: 0 },
  { id: 14, question: 'สารที่ใช้ดูดความชื้นซึ่งบรรจุอยู่ภายใน Filter Drier คือสารใด?', options: ['A. คาร์บอนกัมมันต์ (Activated Carbon)', 'B. ซิลิกาเจล (Silica Gel)', 'C. โซเดียมคลอไรด์ (Sodium Chloride)', 'D. แคลเซียมคาร์บอเนต (Calcium Carbonate)'], correct: 1 },
  { id: 15, question: 'รีเวอร์ซิงวาล์ว (Reversing Valve) จะพบได้ในเครื่องปรับอากาศประเภทใด?', options: ['A. ระบบอินเวอร์เตอร์ (Inverter) ทุกรุ่น', 'B. ระบบทำความเย็นแบบชิลเลอร์ (Chiller)', 'C. ระบบปั๊มความร้อน (Heat Pump) ที่ทำได้ทั้งความเย็นและความร้อน', 'D. เครื่องปรับอากาศแบบหน้าต่าง (Window Type)'], correct: 2 },
  { id: 16, question: 'ครีบอัลลูมิเนียม (Fins) ที่ติดอยู่กับคอยล์ร้อนและคอยล์เย็น มีประโยชน์หลักเพื่ออะไร?', options: ['A. เพิ่มความแข็งแรงให้ท่อทองแดง', 'B. ป้องกันน้ำยาแอร์รั่วไหล', 'C. ลดเสียงดังจากการทำงาน', 'D. เพิ่มพื้นที่ผิวเพื่อประสิทธิภาพในการแลกเปลี่ยนความร้อน'], correct: 3 },
  { id: 17, question: 'พัดลมคอยล์เย็น (Blower) ในเครื่องปรับอากาศแบบติดผนัง มักใช้พัดลมประเภทใด?', options: ['A. พัดลมแบบใบพัด (Propeller Fan)', 'B. พัดลมแบบโพรงกระรอก (Cross Flow / Tangential Fan)', 'C. พัดลมแบบหอยโข่ง (Centrifugal Fan)', 'D. พัดลมดูดอากาศ (Exhaust Fan)'], correct: 1 },
  { id: 18, question: 'การล้างแผ่นกรองอากาศ (Air Filter) ควรทำอย่างน้อยบ่อยแค่ไหนเพื่อประสิทธิภาพที่ดี?', options: ['A. ทุกๆ 1 วัน', 'B. ทุกๆ 2-4 สัปดาห์', 'C. ทุกๆ 6 เดือน', 'D. ทุกๆ 1 ปี'], correct: 1 },
  { id: 19, question: 'สารทำความเย็นชนิดใดที่ถูกยกเลิกการผลิตและใช้งานเนื่องจากทำลายชั้นโอโซน (กลุ่ม CFC)?', options: ['A. R-12', 'B. R-22', 'C. R-32', 'D. R-410A'], correct: 0 },
  { id: 20, question: 'สารทำความเย็น R-22 จัดอยู่ในกลุ่มสารทำความเย็นประเภทใด?', options: ['A. CFC', 'B. HCFC', 'C. HFC', 'D. HC'], correct: 1 },
  { id: 21, question: 'สารทำความเย็นใดที่นิยมใช้ในเครื่องปรับอากาศบ้านยุคปัจจุบัน เนื่องจากมีค่า GWP ต่ำกว่า R-410A และประสิทธิภาพสูง?', options: ['A. R-22', 'B. R-134a', 'C. R-410A', 'D. R-32'], correct: 3 },
  { id: 22, question: 'สารทำความเย็น R-410A เป็นสารผสมระหว่างสารใดในอัตราส่วน 50:50?', options: ['A. R-22 และ R-12', 'B. R-32 และ R-125', 'C. R-134a และ R-32', 'D. R-290 และ R-600a'], correct: 1 },
  { id: 23, question: 'ค่า ODP (Ozone Depletion Potential) ของสารทำความเย็นกลุ่ม HFC เช่น R-32 และ R-410A มีค่าเท่าใด?', options: ['A. 0', 'B. 1', 'C. 10', 'D. 100'], correct: 0 },
  { id: 24, question: 'GWP (Global Warming Potential) คือค่าที่บ่งบอกถึงคุณสมบัติใดของสารทำความเย็น?', options: ['A. ศักยภาพในการทำลายชั้นโอโซน', 'B. ศักยภาพในการทำให้เกิดภาวะโลกร้อน', 'C. ความสามารถในการติดไฟ', 'D. ประสิทธิภาพในการทำความเย็น'], correct: 1 },
  { id: 25, question: 'ข้อควรระวังสำคัญที่สุดในการติดตั้งและซ่อมบำรุงระบบที่ใช้สารทำความเย็น R-32 คืออะไร?', options: ['A. มีกลิ่นฉุนรุนแรง', 'B. มีฤทธิ์กัดกร่อนท่อทองแดง', 'C. มีคุณสมบัติติดไฟได้อ่อนๆ (Mildly Flammable)', 'D. ต้องใช้น้ำมันคอมเพรสเซอร์แบบแร่ (Mineral Oil) เท่านั้น'], correct: 2 },
  { id: 26, question: 'การเติมสารทำความเย็นกลุ่มสารผสม (Zeotropic) เช่น R-410A ควรเติมเข้าระบบในสถานะใดเสมอ?', options: ['A. สถานะแก๊ส', 'B. สถานะของเหลว', 'C. สถานะใดก็ได้', 'D. ต้องอุ่นถังน้ำยาก่อนเติม'], correct: 1 },
  { id: 27, question: 'น้ำมันหล่อลื่นคอมเพรสเซอร์ประเภทใดที่ใช้ร่วมกับสารทำความเย็นกลุ่ม HFC (เช่น R-32, R-410A)?', options: ['A. น้ำมันแร่ (Mineral Oil / MO)', 'B. น้ำมันสังเคราะห์โพลิออลเอสเทอร์ (POE)', 'C. น้ำมันเครื่องยนต์เบอร์ 40', 'D. น้ำมันไฮดรอลิก'], correct: 1 },
  { id: 28, question: 'สารทำความเย็นใดมีความดันใช้งาน (Operating Pressure) ในระบบสูงสุด?', options: ['A. R-12', 'B. R-22', 'C. R-134a', 'D. R-32'], correct: 3 },
  { id: 29, question: 'ระบบอินเวอร์เตอร์ (Inverter) ในเครื่องปรับอากาศช่วยประหยัดพลังงานได้อย่างไร?', options: ['A. ปิดการทำงานของคอมเพรสเซอร์บ่อยขึ้น', 'B. ลดขนาดความจุของคอยล์เย็น', 'C. ปรับความเร็วรอบของคอมเพรสเซอร์ให้สอดคล้องกับโหลดความร้อน', 'D. เปลี่ยนสารทำความเย็นเป็นชนิดพิเศษ'], correct: 2 },
  { id: 30, question: 'คาปาซิเตอร์ (Capacitor) ในคอมเพรสเซอร์แอร์แบบธรรมดา (Non-Inverter) ทำหน้าที่อะไร?', options: ['A. แปลงไฟ AC เป็น DC', 'B. ช่วยสร้างแรงบิดในการสตาร์ทและรักษากระแสของมอเตอร์', 'C. ตัดกระแสไฟเมื่อเกิดไฟฟ้าลัดวงจร', 'D. วัดอุณหภูมิของระบบ'], correct: 1 },
  { id: 31, question: 'เซ็นเซอร์วัดอุณหภูมิห้อง (Room Thermistor) ทำงานโดยอาศัยหลักการใด?', options: ['A. ค่าความต้านทานไฟฟ้าเปลี่ยนแปลงตามอุณหภูมิ (NTC)', 'B. การขยายตัวของของเหลวในหลอดแก้ว', 'C. การเหนี่ยวนำสนามแม่เหล็ก', 'D. แรงดันน้ำยาแอร์ที่แปรผันตามความร้อน'], correct: 0 },
  { id: 32, question: 'อุปกรณ์ใดทำหน้าที่ตัดวงจรไฟฟ้าเมื่อคอมเพรสเซอร์กินกระแสสูงเกินไปหรือร้อนจัด?', options: ['A. แมกเนติกคอนแทคเตอร์ (Magnetic Contactor)', 'B. เทอร์โมคัปเปิล (Thermocouple)', 'C. โอเวอร์โหลดโปรเทคเตอร์ (Overload Protector)', 'D. สวิตช์แรงดัน (Pressure Switch)'], correct: 2 },
  { id: 33, question: 'แมกเนติกคอนแทคเตอร์ (Magnetic Contactor) ทำหน้าที่อะไรในระบบเครื่องปรับอากาศ?', options: ['A. เป็นสวิตช์แม่เหล็กไฟฟ้าใช้ควบคุมการตัดต่อวงจรกำลังของคอมเพรสเซอร์', 'B. กรองสัญญาณรบกวนทางไฟฟ้า', 'C. ปรับระดับแรงดันไฟฟ้าให้คงที่', 'D. ดูดซับความชื้นในระบบ'], correct: 0 },
  { id: 34, question: 'แผงวงจรของเครื่องปรับอากาศแบบอินเวอร์เตอร์ มักมีวงจร PFC (Power Factor Correction) เพื่อประโยชน์ใด?', options: ['A. ทำให้พัดลมหมุนเร็วขึ้น', 'B. ปรับปรุงค่าตัวประกอบกำลังไฟฟ้าให้ใกล้เคียง 1 เพื่อลดการสูญเสียในระบบ', 'C. ป้องกันฟ้าผ่า', 'D. ทำให้สามารถใช้ไฟ 3 เฟสได้'], correct: 1 },
  { id: 35, question: 'หน่วยวัดพลังงานไฟฟ้าที่เครื่องปรับอากาศใช้และเป็นหน่วยในการคิดค่าไฟคืออะไร?', options: ['A. กิโลวัตต์ (kW)', 'B. กิโลโวลต์-แอมแปร์ (kVA)', 'C. กิโลวัตต์-ชั่วโมง (kWh หรือ Unit)', 'D. บีทียูต่อชั่วโมง (BTU/hr)'], correct: 2 },
  { id: 36, question: 'ค่าประสิทธิภาพ SEER (Seasonal Energy Efficiency Ratio) วัดจากอะไร?', options: ['A. ปริมาณน้ำยาที่ใช้ต่อปี', 'B. อัตราส่วนความเย็นต่อพลังงานไฟฟ้าเฉลี่ยตามฤดูกาลตลอดปี', 'C. ความเร็วรอบสูงสุดของคอมเพรสเซอร์', 'D. ระยะเวลาที่แอร์ทำงานจนกว่าห้องจะเย็น'], correct: 1 },
  { id: 37, question: 'ค่า COP (Coefficient of Performance) ในระบบทำความเย็นหมายถึงอะไร?', options: ['A. อัตราส่วนระหว่างความสามารถในการทำความเย็น กับ พลังงานไฟฟ้าที่ใช้ไป', 'B. ประสิทธิภาพการระบายความร้อนของคอยล์ร้อน', 'C. อัตราการไหลของสารทำความเย็น', 'D. ค่าความต้านทานไฟฟ้าของคอมเพรสเซอร์'], correct: 0 },
  { id: 38, question: 'หากแอร์เครื่องหนึ่งมีความสามารถทำความเย็น 12,000 BTU/hr และใช้กำลังไฟฟ้า 1,000 วัตต์ ค่า EER จะเป็นเท่าใด?', options: ['A. 1.2', 'B. 10', 'C. 12', 'D. 120'], correct: 2 },
  { id: 39, question: 'ความเย็น 1 ตันความเย็น (Ton of Refrigeration) มีค่าเท่ากับกี่ BTU/hr?', options: ['A. 9,000 BTU/hr', 'B. 12,000 BTU/hr', 'C. 18,000 BTU/hr', 'D. 24,000 BTU/hr'], correct: 1 },
  { id: 40, question: 'ห้องนอนขนาด 16 ตารางเมตร (ความสูงฝ้ามาตรฐาน ไม่โดนแดดจัด) ควรใช้แอร์ขนาดประมาณเท่าใดจึงจะเหมาะสมที่สุด?', options: ['A. 9,000 - 12,000 BTU/hr', 'B. 18,000 - 24,000 BTU/hr', 'C. 24,000 - 30,000 BTU/hr', 'D. 36,000 BTU/hr ขึ้นไป'], correct: 0 },
  { id: 41, question: 'หากพบอาการ "น้ำแข็งเกาะที่คอยล์เย็น (Evaporator)" สาเหตุที่เป็นไปได้มากที่สุดคืออะไร?', options: ['A. พัดลมคอยล์ร้อนไม่หมุน', 'B. คอมเพรสเซอร์หยุดทำงาน', 'C. แผ่นกรองอากาศอุดตัน หรือ น้ำยาแอร์ในระบบขาด', 'D. เติมน้ำยาแอร์มากเกินไป'], correct: 2 },
  { id: 42, question: 'เครื่องมือชนิดใดใช้สำหรับทำสุญญากาศ (Vacuum) ในระบบปรับอากาศก่อนเติมน้ำยา?', options: ['A. แมนิโฟลด์เกจ (Manifold Gauge)', 'B. เครื่องชาร์จน้ำยา (Charging Cylinder)', 'C. ปั๊มสุญญากาศ (Vacuum Pump)', 'D. แคลมป์มิเตอร์ (Clamp Meter)'], correct: 2 },
  { id: 43, question: 'จุดประสงค์หลักของการทำสุญญากาศ (Vacuum) ระบบแอร์คืออะไร?', options: ['A. เพื่อเพิ่มความดันในระบบ', 'B. เพื่อกำจัดอากาศและความชื้นที่ตกค้างในท่อทองแดง', 'C. เพื่อล้างคราบน้ำมันเก่า', 'D. เพื่อทดสอบกำลังอัดของคอมเพรสเซอร์'], correct: 1 },
  { id: 44, question: 'อาการ "แอร์มีแต่ลมร้อน คอมเพรสเซอร์และพัดลมคอยล์ร้อนทำงานปกติ" อาจเกิดจากสาเหตุใดมากที่สุด?', options: ['A. สารทำความเย็นในระบบรั่วไหลออกจนหมด', 'B. เซ็นเซอร์อุณหภูมิห้องเสีย', 'C. พัดลมคอยล์เย็นมอเตอร์ไหม้', 'D. ท่อน้ำทิ้งอุดตัน'], correct: 0 },
  { id: 45, question: 'อุณหภูมิกระเปาะแห้ง (Dry Bulb Temperature) หมายถึงอะไร?', options: ['A. อุณหภูมิที่วัดได้จากเทอร์โมมิเตอร์ที่มีผ้าเปียกหุ้มกระเปาะ', 'B. อุณหภูมิของอากาศที่วัดด้วยเทอร์โมมิเตอร์แบบปกติทั่วไป', 'C. อุณหภูมิจุดน้ำค้าง', 'D. อุณหภูมิของสารทำความเย็นในสถานะแก๊ส'], correct: 1 },
  { id: 46, question: 'การวัดอุณหภูมิกระเปาะเปียก (Wet Bulb) ควบคู่กับอุณหภูมิกระเปาะแห้ง (Dry Bulb) มีไว้เพื่อหาค่าใดบนไซโครเมตริกชาร์ต?', options: ['A. แรงดันบรรยากาศ (Atmospheric Pressure)', 'B. ความชื้นสัมพัทธ์ (Relative Humidity)', 'C. ความเร็วลม (Air Velocity)', 'D. อัตราการไหลของน้ำยา (Refrigerant Flow Rate)'], correct: 1 },
  { id: 47, question: 'การเลือกขนาด BTU ของแอร์ที่ใหญ่เกินไป (Oversized) จะส่งผลเสียอย่างไร?', options: ['A. คอมเพรสเซอร์ทำงานหนักและไหม้เร็ว', 'B. แอร์จะไม่สามารถทำความเย็นได้เลย', 'C. ท่อน้ำยาจะเกิดน้ำแข็งเกาะตลอดเวลา', 'D. อุณหภูมิห้องลดลงเร็วแต่คอมเพรสเซอร์ตัดบ่อย ทำให้ความชื้นในห้องยังสูงและรู้สึกไม่สบายตัว'], correct: 3 },
  { id: 48, question: 'ในการไล่ระบบท่อน้ำยาหรือตรวจสอบรอยรั่วแบบอัดแรงดัน (Pressure Test) ควรใช้แก๊สชนิดใดจึงจะปลอดภัยที่สุด?', options: ['A. ออกซิเจน (Oxygen)', 'B. ไนโตรเจน (Nitrogen)', 'C. อาร์กอน (Argon)', 'D. คาร์บอนไดออกไซด์ (Carbon Dioxide)'], correct: 1 },
  { id: 49, question: 'แมนิโฟลด์เกจ (Manifold Gauge) หน้าปัดสีน้ำเงิน (Low Pressure) ใช้สำหรับวัดแรงดันที่ส่วนใดของระบบ?', options: ['A. ท่อทางอัด (Discharge Line)', 'B. ท่อทางดูด (Suction Line)', 'C. ท่อพักของเหลว (Liquid Receiver)', 'D. ทางออกของคอนเดนเซอร์'], correct: 1 },
  { id: 50, question: 'มาตรฐานการติดตั้งแฟนคอยล์ยูนิต (คอยล์เย็น) ควรเว้นระยะห่างจากเพดานอย่างน้อยเท่าใด เพื่อให้ดูดลมกลับ (Return Air) ได้ดี?', options: ['A. ชิดเพดานพอดี', 'B. อย่างน้อย 5 เซนติเมตร', 'C. อย่างน้อย 10-15 เซนติเมตรขึ้นไป', 'D. ไม่น้อยกว่า 50 เซนติเมตร'], correct: 2 },
];

const Quiz = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const handleAnswerClick = (index) => {
    if (showResult) return;
    setSelectedAnswer(index);
    setShowResult(true);

    if (index === quizData[currentQuestion].correct) {
      setScore(score + 1);
    }
  };

  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setShowResult(false);
    
    if (currentQuestion + 1 < quizData.length) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setQuizFinished(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setQuizFinished(false);
  };

  const question = quizData[currentQuestion];
  const percentage = Math.round((score / quizData.length) * 100);

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button 
          onClick={() => navigate(-1)} 
          style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '0.5rem' }}
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-gradient-ac" style={{ marginBottom: 0, fontSize: '2rem' }}>แบบทดสอบความรู้วิศวกรรม</h1>
          <p style={{ color: 'var(--text-secondary)' }}>ระบบปรับอากาศและสารทำความเย็น — 50 ข้อ</p>
        </div>
      </div>

      <div className="equipment-card" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        {!quizFinished ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>
              <span>คำถามที่ {currentQuestion + 1} จาก {quizData.length}</span>
              <span>คะแนนปัจจุบัน: {score}</span>
            </div>

            {/* Progress Bar */}
            <div style={{ width: '100%', height: '6px', background: 'var(--bg-tertiary)', borderRadius: '3px', marginBottom: '2rem' }}>
              <div style={{ width: `${((currentQuestion + 1) / quizData.length) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #00F0FF, #0080FF)', borderRadius: '3px', transition: 'width 0.3s ease' }} />
            </div>

            <h2 style={{ fontSize: '1.4rem', marginBottom: '2rem', lineHeight: '1.6' }}>
              {question.question}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {question.options.map((option, index) => {
                let btnStyle = {
                  padding: '1rem 1.5rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontSize: '1rem',
                  textAlign: 'left',
                  cursor: showResult ? 'default' : 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'all 0.2s'
                };

                if (showResult) {
                  if (index === question.correct) {
                    btnStyle.background = 'rgba(76, 175, 80, 0.2)';
                    btnStyle.border = '1px solid #4CAF50';
                  } else if (index === selectedAnswer && index !== question.correct) {
                    btnStyle.background = 'rgba(244, 67, 54, 0.2)';
                    btnStyle.border = '1px solid #F44336';
                  }
                }

                return (
                  <button 
                    key={index} 
                    onClick={() => handleAnswerClick(index)}
                    style={btnStyle}
                    className={!showResult ? 'quiz-option-hover' : ''}
                    disabled={showResult}
                  >
                    {option}
                    {showResult && index === question.correct && <CheckCircle color="#4CAF50" />}
                    {showResult && index === selectedAnswer && index !== question.correct && <XCircle color="#F44336" />}
                  </button>
                );
              })}
            </div>

            {showResult && (
              <div className="animate-fade-in" style={{ marginTop: '2rem', padding: '1.5rem', background: 'var(--bg-tertiary)', borderRadius: '8px' }}>
                <h4 style={{ color: selectedAnswer === question.correct ? '#4CAF50' : '#F44336', marginBottom: '0.5rem' }}>
                  {selectedAnswer === question.correct ? '✅ ยอดเยี่ยม! คำตอบถูกต้อง' : '❌ ผิดพลาด! คำตอบที่ถูกคือตัวเลือก ' + ['A','B','C','D'][question.correct]}
                </h4>
                <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                  <button 
                    onClick={handleNextQuestion}
                    style={{ 
                      padding: '0.75rem 1.5rem', 
                      background: 'var(--accent-ac)', 
                      color: '#000', 
                      border: 'none', 
                      borderRadius: '4px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    {currentQuestion + 1 === quizData.length ? 'ดูผลคะแนนสรุป' : 'ไปข้อถัดไป →'}
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="animate-fade-in" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>ทำแบบทดสอบเสร็จสิ้น! 🎓</h2>
            <div style={{ 
              width: '160px', 
              height: '160px', 
              borderRadius: '50%', 
              background: 'var(--bg-secondary)', 
              display: 'flex', 
              flexDirection: 'column',
              justifyContent: 'center', 
              alignItems: 'center', 
              margin: '0 auto 2rem',
              border: `4px solid ${percentage >= 80 ? '#4CAF50' : percentage >= 60 ? '#FF9800' : '#F44336'}`
            }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: percentage >= 80 ? '#4CAF50' : percentage >= 60 ? '#FF9800' : '#F44336' }}>{score}</span>
              <span style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>จาก {quizData.length}</span>
              <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{percentage}%</span>
            </div>
            
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', marginBottom: '2rem' }}>
              {percentage === 100 ? '🏆 Perfect Score! คุณคือปรมาจารย์ระบบปรับอากาศตัวจริง!' : 
               percentage >= 80 ? '👏 ยอดเยี่ยมมาก! ความรู้ด้านระบบปรับอากาศแน่นมากครับ!' : 
               percentage >= 60 ? '👍 ดีครับ! มีพื้นฐานที่แข็งแกร่ง ลองทบทวนเพิ่มเติมนะครับ' : 
               '📚 ไม่เป็นไรครับ ลองกลับไปทบทวนเนื้อหาแล้วมาสอบใหม่ได้เสมอ!'}
            </p>
            
            <button 
              onClick={resetQuiz}
              style={{ 
                padding: '1rem 2rem', 
                background: 'linear-gradient(135deg, #00F0FF 0%, #0080FF 100%)', 
                color: 'white', 
                border: 'none', 
                borderRadius: '8px',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                cursor: 'pointer'
              }}
            >
              ทำแบบทดสอบอีกครั้ง
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Quiz;
