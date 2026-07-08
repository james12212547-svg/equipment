export const equipmentData = [
  {
    id: 'ac-split',
    category: 'air-conditioning',
    name: 'ระบบปรับอากาศแบบแยกส่วน (Split Type)',
    nameEng: 'Split Type Air Conditioner',
    abbreviation: 'SPLIT',
    symbol: '',
    image: '',
    function: 'ระบบปรับอากาศขนาดย่อมที่ส่วนประกอบของเครื่องปรับอากาศจะแยกเป็น 2 ส่วนหลักคือ ส่วนของคอยล์ทำความเย็น (ในพื้นที่ปรับอากาศ) และคอยล์ร้อน (นอกอาคาร)',
    principle: 'ระหว่างชุดคอยล์ร้อนคอยล์เย็นจะมีท่อสารทำความเย็นทำหน้าที่ถ่ายเทความร้อนออกจากห้องปรับอากาศ',
    specs: [
      { label: 'ชนิดคอมเพรสเซอร์', value: 'แบบลูกสูบ, แบบโรตารี่, แบบสโครล' },
      { label: 'ชนิด Condenser', value: 'ท่อทองแดงและฟินอลูมิเนียม, อลูมิเนียมไมโครแชนแนล' },
      { label: 'ชนิด Expansion Valve', value: 'TXV, EEV, Capillary tube, AXV' },
      { label: 'ชนิด Evaporator', value: 'แบบแห้ง (Direct Expansion หรือ DX Evaporator)' }
    ],
    warnings: ''
  },
  {
    id: 'comp-reciprocating',
    category: 'air-conditioning',
    name: 'คอมเพรสเซอร์แบบลูกสูบ (Reciprocating)',
    nameEng: 'Reciprocating Compressor',
    abbreviation: 'COMP-REC',
    symbol: '',
    image: '',
    function: 'ดูดและอัดสารทำความเย็นในสถานะที่เป็นแก๊ส เพื่อเพิ่มความดันและอุณหภูมิแล้วส่งไปยังคอนเดนเซอร์',
    principle: 'ในแต่ละกระบอกสูบประกอบด้วยชุดของลิ้นทางดูดและลิ้นทางอัดติดกับวาล์วเพลต (Valve plate) ขณะที่ลูกสูบหนึ่งเคลื่อนที่ลงในจังหวะดูด ลูกสูบหนึ่งจะเคลื่อนที่ขึ้นในจังหวะอัด',
    specs: [],
    warnings: 'ดูดเฉพาะสารทำความเย็นในสถานะแก๊สที่มีความดันต่ำและอุณหภูมิต่ำจากอีวาพอเรเตอร์เท่านั้น'
  },
  {
    id: 'comp-rotary',
    category: 'air-conditioning',
    name: 'คอมเพรสเซอร์แบบโรตารี่ (Rotary)',
    nameEng: 'Rotary Compressor',
    abbreviation: 'COMP-ROT',
    symbol: '',
    image: '',
    function: 'ดูดและอัดสารทำความเย็นในสถานะแก๊ส สำหรับระบบเครื่องทำความเย็นขนาดเล็ก',
    principle: 'อาศัยการกวาดตัวตามแกนโรเตอร์ (Rotor) ทำงานได้อย่างมีประสิทธิภาพสูง กินไฟน้อย',
    specs: [
      { label: 'ขนาดที่เหมาะสม', value: 'ระบบเครื่องทำความเย็นขนาดเล็กไม่เกิน 1-3 RTH' }
    ],
    warnings: 'ถ้าเดินโหลดนานและเกินตัว ความร้อนที่เกิดจาการเสียดสีทำให้ลูกสูบติด และสูญเสียกำลังอัด'
  },
  {
    id: 'comp-scroll',
    category: 'air-conditioning',
    name: 'คอมเพรสเซอร์แบบสโครล หรือแบบก้นหอย (Scroll)',
    nameEng: 'Scroll Compressor',
    abbreviation: 'COMP-SCR',
    symbol: '',
    image: '',
    function: 'เป็นคอมเพรสเซอร์ขนาดเล็กถึงกลาง ที่เอาข้อดีของคอมเพรสเซอร์แบบลูกสูบและแบบโรตารี่มารวมกันทำให้มีประสิทธิภาพที่เพิ่มมากขึ้น',
    principle: 'จะเป็นแผ่นวงกลมสองวงมีครีบหมุนแบบก้นหอยสองแผ่นประกบคู่กัน แผ่นก้นหอยตัวบนจะถูกยึดติดกับที่ ตัวล่างจะถูกเหวี่ยงเป็นวงโคจรโดยเพลาของมอเตอร์',
    specs: [
      { label: 'ขนาดที่เหมาะสม', value: '1 – 50 RTH' }
    ],
    warnings: ''
  },
  {
    id: 'condenser-copper',
    category: 'air-conditioning',
    name: 'แผงคอยล์แบบท่อทองแดงและฟินอลูมิเนียม',
    nameEng: 'Copper Tube with Aluminum Fin Condenser',
    abbreviation: 'COND-CU',
    symbol: '',
    image: '',
    function: 'รูปแบบมาตรฐานที่ใช้กันมาอย่างยาวนานเพื่อระบายความร้อน',
    principle: 'โครงสร้างประกอบด้วยท่อทองแดงขดไปมาเป็นรูปตัว U (U-Tube) และมีแผ่นฟินอลูมิเนียมบางๆ ซ้อนกันเพื่อเพิ่มพื้นที่ผิวในการระบายความร้อน',
    specs: [
      { label: 'ข้อดี', value: 'มีความทนทานต่อการกัดกร่อนสูงมาก รอยรั่วขนาดเล็กสามารถใช้ลวดเชื่อมทองแดงอุดได้ ซ่อมแซมง่าย อายุการใช้งานยาวนาน' }
    ],
    warnings: ''
  },
  {
    id: 'condenser-microchannel',
    category: 'air-conditioning',
    name: 'แผงคอยล์แบบอลูมิเนียมไมโครแชนแนล',
    nameEng: 'Microchannel / Parallel Flow Condenser',
    abbreviation: 'COND-MCHX',
    symbol: '',
    image: '',
    function: 'แผงระบายความร้อนที่มีประสิทธิภาพในการแลกเปลี่ยนความร้อน (Heat Transfer) สูงมาก',
    principle: 'โครงสร้างทำจากอลูมิเนียมทั้งหมด โดยท่อน้ำยาจะเป็นลักษณะแบนๆ และมีรูเล็กๆ (Microchannel) เรียงกันอยู่ภายในจำนวนมาก',
    specs: [
      { label: 'ข้อดี', value: 'มีพื้นที่ผิวสัมผัสเยอะ ทำให้ออกแบบตัวเครื่อง (CDU) ให้มีขนาดกะทัดรัดและน้ำหนักเบาลงได้ ช่วยลดการใช้สารทำความเย็น 20-30%' }
    ],
    warnings: ''
  },
  {
    id: 'valve-txv',
    category: 'air-conditioning',
    name: 'เทอร์โมสแตติกเอ็กซ์แพนชันวาล์ว',
    nameEng: 'Thermostatic Expansion Valve (TXV)',
    abbreviation: 'TXV',
    symbol: '',
    image: '',
    function: 'เป็นตัวควบคุมและปรับอัตราการไหลของสารทำความเย็น',
    principle: 'อาศัยหลักควบคุมให้อุณหภูมิทางอีวาพอเรเตอร์คงที่เสมอ มีกระเปาะเป็นตัวรับสัมผัสอุณหภูมิท่อทางออก (ท่อ Suction) เพื่อปรับให้ลิ้นเปิดกว้างหรือแคบลงขึ้นอยู่กับอุณหภูมิ Superheat',
    specs: [],
    warnings: ''
  },
  {
    id: 'valve-eev',
    category: 'air-conditioning',
    name: 'อิเล็กทรอนิกส์เอ็กซ์แพนชันวาล์ว',
    nameEng: 'Electronic Expansion Valve (EEV)',
    abbreviation: 'EEV',
    symbol: '',
    image: '',
    function: 'ควบคุมการเปิด-ปิดวาล์วอย่างละเอียดตามคำสั่งของไมโครคอนโทรลเลอร์',
    principle: 'เป็นมอเตอร์สเต็ปเปอร์ ควบคุมปริมาณน้ำยาแอร์และค่า Superheat ได้แม่นยำมาก',
    specs: [
      { label: 'ตำแหน่งติดตั้ง', value: 'มักติดตั้งไว้ที่ฝั่งคอยล์ร้อน (Outdoor) ในระบบ Split Type' }
    ],
    warnings: 'ติดตั้งที่ฝั่งคอยล์ร้อนเพื่อป้องกันไม่ให้เกิดเสียงดังจากการฉีดน้ำยาแอร์รบกวนคนในห้อง'
  },
  {
    id: 'valve-capillary',
    category: 'air-conditioning',
    name: 'ท่อแคพิลลารี',
    nameEng: 'Capillary tube',
    abbreviation: 'CAP',
    symbol: '',
    image: '',
    function: 'ตัวควบคุมการไหลของสารทำความเย็น เป็นแบบอาศัยหลักการทำงานอย่างง่าย',
    principle: 'เป็นท่อที่มีขนาดเล็กมาก เส้นผ่านศูนย์กลาง 0.028-0.095 นิ้ว มักจะอยู่ติดกับแผงฟินคอยล์เพื่อฉีดสารทำความเย็นไปยังอีวาพอเรเตอร์',
    specs: [
      { label: 'ขนาดการใช้งาน', value: 'ระบบแอร์บ้านทั่วไปที่มีขนาดไม่เกิน 36,000 BTU' }
    ],
    warnings: ''
  },
  {
    id: 'valve-axv',
    category: 'air-conditioning',
    name: 'ออโตเมติกเอ็กซ์แพนชันวาล์ว',
    nameEng: 'Automatic Expansion Valve (AXV)',
    abbreviation: 'AXV',
    symbol: '',
    image: '',
    function: 'ตัวควบคุมและปรับอัตราการไหลของสารทำความเย็น',
    principle: 'อาศัยหลักควบคุมให้ความดันทางอีวาพอเรเตอร์คงที่เสมอ เมื่อโหลดเพิ่มความดันสูงขึ้น ลิ้นจะเปิดกว้างขึ้น เมื่ออุณหภูมิลด ความดันลด ลิ้นจะเปิดแคบลง',
    specs: [],
    warnings: ''
  },
  {
    id: 'evaporator-dx',
    category: 'air-conditioning',
    name: 'อีวาพอเรเตอร์แบบแห้ง',
    nameEng: 'Direct Expansion (DX) Evaporator',
    abbreviation: 'DX Evap',
    symbol: '',
    image: '',
    function: 'ดูดซับความร้อนจากอากาศเพื่อทำให้อากาศในห้องเย็นลง',
    principle: 'สารทำความเย็นจะระเหยกลายเป็นไอจนหมดภายในคอยล์ เป็นประเภทมาตรฐานที่ใช้ในแอร์บ้านทั่วไป',
    specs: [],
    warnings: ''
  },
  {
    id: 'refrigerants',
    category: 'air-conditioning',
    name: 'สารทำความเย็น (Refrigerants)',
    nameEng: 'Refrigerants',
    abbreviation: 'REF',
    symbol: '',
    image: '',
    function: 'สารที่เป็นตัวกลางในการดึงและระบายความร้อน',
    principle: 'มียุคต่างๆ: ยุคแรก (แอมโมเนีย, คาร์บอนไดออกไซด์, ซัลเฟอร์ไดออกไซด์), สารสังเคราะห์ CFCs (R-12, R-11), สารสังเคราะห์ HCFCs (R-22, R-123), สารสังเคราะห์ HFCs (R-134a, R-410A, R-404a), ยุคใหม่ HFOs และธรรมชาติ (R-290, R-600a, R-32, R-1234yf)',
    specs: [
      { label: 'รุ่นใหม่ (HFOs/ธรรมชาติ)', value: 'R-32 (แอร์บ้านอินเวอร์เตอร์), R-290, R-600a, R-1234yf' },
      { label: 'HFCs', value: 'R-134a, R-407C / R-410A, R-404a / R-507A' },
      { label: 'แบบเก่า', value: 'R-22 (ยกเลิกแล้ว), CFCs (ยกเลิกแล้ว)' }
    ],
    warnings: 'สารทำความเย็นยุคแรกบางชนิด เช่น ซัลเฟอร์ไดออกไซด์ ถูกยกเลิกไปเพราะเป็นพิษสูง'
  },
  {
    id: 'ac-package',
    category: 'air-conditioning',
    name: 'ระบบปรับอากาศแบบชุดหรือแพ็คเกจ (Package)',
    nameEng: 'Package Air Conditioner',
    abbreviation: 'PACKAGE',
    symbol: '',
    image: '',
    function: 'ระบบแอร์ที่รวมส่วนประกอบทั้งหมด (คอมเพรสเซอร์, แผงคอยล์ร้อน, คอยล์เย็น) จะรวมอยู่ในชุดเดียวกัน',
    principle: 'มีท่อส่งลมเย็นและท่อลมกลับ โดยมักติดตั้งไว้บนดาดฟ้าจึงประหยัดพื้นที่มากกว่าระบบแบบแยกส่วน แล้วใช้ท่อส่งลมเย็นกระจายไปห้องต่างๆ',
    specs: [
      { label: 'ระบายความร้อนด้วยอากาศ', value: 'เหมาะสำหรับพื้นที่ที่มีข้อจำกัด และไม่ต้องการทำความเย็นมาก' },
      { label: 'ระบายความร้อนด้วยน้ำ', value: 'ต้องการประสิทธิภาพการระบายความร้อนได้ดีกว่าแบบอากาศ แต่ใช้พื้นที่มากขึ้น ไม่เหมาะสำหรับพื้นที่จำกัด' }
    ],
    warnings: ''
  },
  {
    id: 'ac-chiller-system',
    category: 'air-conditioning',
    name: 'ระบบปรับอากาศแบบใช้เครื่องทำน้ำเย็น (Chiller)',
    nameEng: 'Chiller System',
    abbreviation: 'CHILLER',
    symbol: '',
    image: '',
    function: 'ระบบปรับอากาศขนาดใหญ่ (บางครั้งเรียกว่าระบบปรับอากาศแบบศูนย์รวม) เหมาะสำหรับพื้นที่ที่ต้องการปรับอากาศขนาดใหญ่ หรือมีหลายห้อง หลายโซน',
    principle: 'ส่วนใหญ่จะใช้น้ำเป็นสารตัวกลางในการถ่ายเทความร้อนหรือความเย็น ประกอบด้วยระบบฝั่งน้ำเย็น (Chilled water loop) และระบบฝั่งระบายความร้อน (Condenser water loop)',
    specs: [],
    warnings: ''
  },
  {
    id: 'chiller-chilled-water',
    category: 'air-conditioning',
    name: 'อุปกรณ์ระบบฝั่งน้ำเย็น (Chilled water loop)',
    nameEng: 'Chilled Water Loop Components',
    abbreviation: 'CHW',
    symbol: '',
    image: '',
    function: 'ระบบน้ำเย็นสำหรับส่งไปแลกเปลี่ยนความร้อน',
    principle: 'ประกอบด้วย ปั๊มน้ำเย็น (Chilled water pump) ส่งน้ำไปอาคาร, เครื่องส่งลมเย็นขนาดใหญ่ (AHU) ใช้เป่าลมเย็นพื้นที่ใหญ่, แฟนคอยล์ยูนิต (FCU) สำหรับห้องย่อยๆ และคอยล์เย็นขนาดใหญ่ในอีวาพอเรเตอร์ที่ถูกเติมเต็มด้วยสารทำความเย็นสถานะเหลวตลอดเวลา',
    specs: [],
    warnings: ''
  },
  {
    id: 'chiller-condenser-water',
    category: 'air-conditioning',
    name: 'อุปกรณ์ระบบฝั่งระบายความร้อน (Condenser water loop)',
    nameEng: 'Condenser Water Loop Components',
    abbreviation: 'CDW',
    symbol: '',
    image: '',
    function: 'ระบบระบายความร้อนของชิลเลอร์ระบายความร้อนด้วยน้ำ',
    principle: 'ประกอบด้วย ปั๊มน้ำระบายความร้อน (Condenser Water Pump) ส่งน้ำไปด้านบนอาคาร และ หอระบายความร้อน (Cooling Tower) รับน้ำร้อนมาฉีดเป็นฝอยลงมา โดยมีพัดลมเป่าสวนทางขึ้นไปเพื่อดึงความร้อนทำให้น้ำบางส่วนระเหยและน้ำที่เหลือเย็นลง',
    specs: [],
    warnings: ''
  },
  {
    id: 'chiller-air-cooled',
    category: 'air-conditioning',
    name: 'ชิลเลอร์ระบายความร้อนด้วยอากาศ',
    nameEng: 'Air-Cooled Chiller',
    abbreviation: 'ACC',
    symbol: '',
    image: '',
    function: 'ผลิตน้ำเย็นโดยระบายความร้อนออกจากน้ำยาแอร์โดยตรง ไม่ต้องใช้น้ำเป็นตัวกลาง',
    principle: 'ใช้พัดลมขนาดใหญ่หลายๆ ตัว ดูดอากาศภายนอกให้เป่าผ่านแผงคอยล์ร้อน (ฟินคอยล์) ตัวเครื่องจะรวมเอาคอมเพรสเซอร์และแผงระบายความร้อนด้วยพัดลมไว้ในชุดเดียวกัน (Packaged)',
    specs: [],
    warnings: ''
  },
  {
    id: 'ac-vrf',
    category: 'air-conditioning',
    name: 'ระบบปรับอากาศแบบ VRF',
    nameEng: 'Variable Refrigerant Flow (VRF)',
    abbreviation: 'VRF',
    symbol: '',
    image: '',
    function: 'เหมือนกับแบบแยกส่วน โดยใช้คอยล์ร้อน (Outdoor Unit) เพียงตัวเดียว เชื่อมต่อกับคอยล์เย็น (Indoor Unit) ได้หลายตัวพร้อมกัน (สูงสุดได้หลายสิบตัว)',
    principle: 'ควบคุมปริมาณสารทำความเย็นที่ส่งไปยังคอยล์เย็นแต่ละตัวได้อย่างอิสระตามภาระความร้อน (Load) จริงของห้อง ทำงาน 4 ขั้นตอน: 1) Load Sensing 2) Central Processing & Inverter Regulation 3) Refrigerant Distribution (EEV) 4) Evaporation & Return Cycle (มี Accumulator ก่อนเข้าคอม)',
    specs: [
      { label: 'ข้อดี', value: 'ประหยัดพลังงานในภาพรวมสูง, ประหยัดพื้นที่ติดตั้ง CDU, เดินท่อน้ำยาได้ไกล, ระบบควบคุมอัจฉริยะ (เชื่อม BMS)' },
      { label: 'ข้อเสีย', value: 'ต้นทุนเริ่มต้นสูงมาก, การติดตั้งซับซ้อนและต้องไล่ระบบเข้มงวด, ความเสี่ยงจุดเดียว (Single Point of Failure)' }
    ],
    warnings: 'VRF มีประสิทธิภาพช่วง Part-Load สูงมาก (ค่า COP สูง) เพราะคอมเพรสเซอร์ Inverter ปรับการฉีดสารทำความเย็นได้พอดีกับห้อง'
  },
  {
    id: 'ac-fixed-speed',
    category: 'air-conditioning',
    name: 'แอร์ระบบธรรมดา (Fixed Speed / Non-Inverter)',
    nameEng: 'Fixed Speed AC',
    abbreviation: 'FIXED',
    symbol: '',
    image: '',
    function: 'ระบบที่คอมเพรสเซอร์ทำงานความเร็วรอบคงที่เสมอ (100% capacity)',
    principle: 'การทำงานแบบ "ตัด-ต่อ" (On/Off) เมื่ออุณหภูมิลดถึงจุดที่ตั้งไว้ คอมเพรสเซอร์จะ "ตัด" ทันที และเมื่อร้อนขึ้นจะ "กระชากไฟสตาร์ทใหม่" 100% วนลูปไปเรื่อยๆ',
    specs: [
      { label: 'ข้อดี', value: 'ราคาเครื่องถูกกว่า, ซ่อมบำรุงง่ายและถูก, ทนทานต่อไฟตก/ไฟกระชาก, ทำความเย็นจัดได้สะใจ (เหมาะกับร้านอาหาร)' },
      { label: 'ข้อเสีย', value: 'กินไฟมากกว่าจากกระแสสตาร์ท (Starting Current), อุณหภูมิแกว่ง, เสียงตัดต่อดัง' }
    ],
    warnings: ''
  },
  {
    id: 'ac-inverter',
    category: 'air-conditioning',
    name: 'แอร์ระบบ Inverter',
    nameEng: 'Inverter AC',
    abbreviation: 'INVERTER',
    symbol: '',
    image: '',
    function: 'ระบบที่แปรผันความเร็วรอบคอมเพรสเซอร์เพื่อประหยัดพลังงาน',
    principle: 'ใช้แผงวงจรอินเวอร์เตอร์ (VFD) แปลง AC เป็น DC และแปลงกลับเป็น AC เพื่อปรับความถี่มอเตอร์ เมื่อใกล้ถึงอุณหภูมิจะ "ลดรอบ" แทนการตัด ทำให้เลี้ยงรอบเบาๆ ไปเรื่อยๆ ชดเชยความร้อน',
    specs: [
      { label: 'ข้อดี', value: 'ประหยัดไฟสูงสุด 30-50%, อุณหภูมิคงที่ เย็นสบาย, เสียงเงียบ, ไม่กระชากไฟ (เป็นมิตรกับไฟอาคาร)' },
      { label: 'ข้อเสีย', value: 'ราคาสูงกว่า, ค่าซ่อมแผงวงจรแพง, ลมเย็นรู้สึกไม่ฉ่ำ, ต้องคำนวณ BTU ให้พอดีห้อง' }
    ],
    warnings: 'หากเลือก BTU เล็กกว่าห้อง แอร์จะเร่ง 100% ตลอดเวลาทำให้พังเร็วและไม่ประหยัดไฟ'
  },

  // Solar Data
  {
    id: 'solar-panel',
    category: 'solar',
    name: 'แผงโซลาร์เซลล์ (Solar Panel)',
    nameEng: 'Solar Panel',
    abbreviation: 'PANEL',
    symbol: '',
    image: '',
    function: 'เปลี่ยน “พลังงานแสงอาทิตย์” ให้กลายเป็น “พลังงานไฟฟ้ากระแสตรง (DC)” ผ่านปรากฏการณ์ Photovoltaic Effect',
    principle: 'ทำจากซิลิคอน (Silicon) สารกึ่งตัวนำ มีชั้น P-type (บวก) และ N-type (ลบ) ทำงาน 5 ขั้นตอน: 1) แสงตกกระทบแผง 2) โฟตอนกระตุ้นอิเล็กตรอน 3) เกิดสนามไฟฟ้า 4) ได้ไฟ DC 5) ส่งเข้าอินเวอร์เตอร์',
    specs: [
      { label: 'ประสิทธิภาพ', value: '20–22% (รุ่นใหม่ N-Type TOPCon สูงถึง 23%)' },
      { label: 'อายุการใช้งาน', value: '25–30 ปี (รับประกันผลิตไฟลดไม่เกิน 0.5-1% ต่อปี)' },
      { label: 'การลดค่าไฟ', value: 'ลดค่าไฟได้ 30–70% ต่อเดือน (ขึ้นกับการใช้งาน)' }
    ],
    warnings: 'ประสิทธิภาพจะลดลงเมื่อมีเมฆมาก หรือมีฝุ่น PM2.5 เกาะสะสม (ลดลงได้ถึง 20% ใน 6 เดือน) ต้องล้างแผงด้วยน้ำสะอาดและแปรงนุ่มทุก 3 เดือน'
  },
  {
    id: 'solar-inv-ongrid',
    category: 'solar',
    name: 'อินเวอร์เตอร์ระบบออนกริด',
    nameEng: 'Grid-Tied Inverter',
    abbreviation: 'GTI',
    symbol: '',
    image: '',
    function: 'แปลงไฟ DC จากแผงเป็นไฟ AC 50Hz จ่ายเข้าบ้าน และควบคุมให้ซิงค์กับความถี่ของการไฟฟ้า',
    principle: 'เชื่อมต่อขนานกับระบบการไฟฟ้าโดยตรง ไม่มีแบตเตอรี่ หากผลิตไฟไม่พอจะดึงไฟจากการไฟฟ้ามาผสมอัตโนมัติ',
    specs: [
      { label: 'อายุการใช้งาน', value: '8–12 ปี (ต้องมีการเปลี่ยนใหม่ในระยะยาว)' },
      { label: 'ระบบ 1 เฟส', value: 'สำหรับบ้านพักทั่วไปขนาดเล็ก (≤ 5 kW)' },
      { label: 'ระบบ 3 เฟส', value: 'สำหรับบ้านใหญ่ ( > 10 kW) ต้องบาลานซ์เฟสให้สมดุล (กระจายแผงให้แต่ละเฟสต่างกันไม่เกิน ±10%)' }
    ],
    warnings: 'เมื่อไฟการไฟฟ้าดับ อินเวอร์เตอร์ออนกริดจะตัดการทำงานทันที (Anti-Islanding) เพื่อความปลอดภัยของช่างไฟซ่อมบำรุง'
  },
  {
    id: 'solar-inv-hybrid',
    category: 'solar',
    name: 'อินเวอร์เตอร์ระบบไฮบริด',
    nameEng: 'Hybrid Inverter',
    abbreviation: 'HYB-INV',
    symbol: '',
    image: '',
    function: 'แปลงไฟและบริหารจัดการแหล่งจ่ายพลังงานจากทั้งแผงโซลาร์ แบตเตอรี่ และการไฟฟ้า',
    principle: 'ตอนกลางวันผลิตไฟใช้และชาร์จส่วนเกินเข้าแบตเตอรี่ กลางคืนดึงไฟจากแบตเตอรี่มาใช้ และสามารถสลับไปดึงไฟแบตเตอรี่มาใช้ได้อัตโนมัติเมื่อเกิดเหตุไฟดับ',
    specs: [
      { label: 'การทำงานเมื่อไฟดับ', value: 'สามารถจ่ายไฟต่อได้ผ่านฟังก์ชัน Backup/EPS โดยใช้แบตเตอรี่' },
      { label: 'อุปกรณ์เสริม', value: 'ต้องติดตั้งร่วมกับตู้สลับไฟอัตโนมัติ (ATS - Automatic Transfer Switch)' }
    ],
    warnings: 'ราคาอินเวอร์เตอร์ไฮบริดและแบตเตอรี่สูงกว่าระบบออนกริดปกติ ทำให้ระยะเวลาคืนทุนนานขึ้น (8-12 ปี)'
  },
  {
    id: 'solar-battery',
    category: 'solar',
    name: 'แบตเตอรี่กักเก็บพลังงาน',
    nameEng: 'Lithium-ion Battery (LiFePO4)',
    abbreviation: 'BESS',
    symbol: '',
    image: '',
    function: 'กักเก็บพลังงานไฟฟ้าส่วนเกินที่ผลิตได้ในตอนกลางวัน เพื่อใช้ในเวลากลางคืนหรือตอนไฟดับ',
    principle: 'นิยมใช้เซลล์ ลิเธียมไอออนฟอสเฟต (LiFePO4) ซึ่งมีความปลอดภัยสูง ทนความร้อน ไม่ระเบิดง่าย และมีระบบ BMS (Battery Management System) ควบคุมการชาร์จภายใน',
    specs: [
      { label: 'อายุการใช้งาน', value: '8–10 ปี' },
      { label: 'รอบการชาร์จ (Cycle Life)', value: 'รับประกัน 5,000–6,000 รอบชาร์จ' }
    ],
    warnings: 'มีต้นทุนสูง เป็นส่วนที่ทำให้ระบบ Off-grid หรือ Hybrid แพงกว่า On-grid 1 เท่าตัว'
  },
  {
    id: 'mount-metal-sheet',
    category: 'solar',
    name: 'โครงยึดแผงหลังคาเมทัลชีท',
    nameEng: 'Metal Sheet Roof Mounting',
    abbreviation: 'MOUNT-MT',
    symbol: '',
    image: '',
    function: 'อุปกรณ์ยึดแผงโซลาร์เข้ากับหลังคาเหล็กเมทัลชีท',
    principle: 'มี 2 วิธีหลัก: 1) ใช้ตัวจับล็อกลอนหนีบสันลอน (Klip-Lok) แบบไม่เจาะหลังคาเลย 2) ยิงสกรูปลายสว่านเข้าแปเหล็ก (L-Feet) พร้อมแหวน EPDM กันน้ำ',
    specs: [
      { label: 'จุดเด่น', value: 'ติดตั้งเร็วที่สุด น้ำหนักเบา ระบายความร้อนใต้แผงได้ดี' },
      { label: 'ข้อแนะนำ', value: 'แนะนำใช้ตัวล็อกลอนแบบไม่เจาะเพื่อกันน้ำรั่ว 100%' }
    ],
    warnings: 'หลังคาควรมีความหนา ≥ 0.35 มม. และต้องซีลทุกจุดเจาะ เช็คสนิมขอบรูเสมอ'
  },
  {
    id: 'mount-cpac',
    category: 'solar',
    name: 'โครงยึดแผงหลังคากระเบื้อง CPAC',
    nameEng: 'CPAC Tile Roof Mounting',
    abbreviation: 'MOUNT-CP',
    symbol: '',
    image: '',
    function: 'อุปกรณ์ยึดแผงสำหรับบ้านหลังคากระเบื้องคอนกรีต (โมเนีย)',
    principle: 'ใช้วิธียกกระเบื้องขึ้น แล้วติดตั้ง "ตะขอเกี่ยว" (Tile Hook) ยึดกับจันทันไม้หรือเหล็ก จากนั้นวางกระเบื้องกลับโดยเจียรร่องเล็กน้อยให้ตะขอลอดโผล่ขึ้นมา',
    specs: [
      { label: 'จุดเด่น', value: 'แทบไม่เจาะทะลุหลังคา เก็บงานสวยงามมาก กันน้ำรั่วได้ดีเยี่ยม' }
    ],
    warnings: 'ต้องใช้ความระมัดระวังเพราะกระเบื้องอาจแตกราว ควรเผื่อกระเบื้องสำรองไว้ และต้องจัดระยะตะขอให้ตรงกับแนวไม้จันทัน'
  },
  {
    id: 'mount-corrugated',
    category: 'solar',
    name: 'โครงยึดแผงหลังคากระเบื้องลอนคู่',
    nameEng: 'Corrugated Tile Mounting',
    abbreviation: 'MOUNT-CR',
    symbol: '',
    image: '',
    function: 'อุปกรณ์ยึดแผงสำหรับหลังคาโรงเรือน หรือกระเบื้องลอนคู่',
    principle: 'ใช้การยิงสกรูตะขอ (Hanger Bolt) ที่เป็นสแตนเลส ทะลุสันลอนกระเบื้องลงไปยึดกับแปหลังคา พร้อมใส่ยาง EPDM และตัวรองสันลอนเพื่อกันน้ำ',
    specs: [
      { label: 'จุดเด่น', value: 'ต้นทุนอุปกรณ์ต่ำ ติดตั้งไม่ยากนัก' }
    ],
    warnings: 'กฎเหล็กคือ "ยิงบนสันลอนเท่านั้น ห้ามยิงท้องลอน" เพื่อกันน้ำขัง และต้องระวังกระเบื้องเปราะแตกตอนขึ้นไปเหยียบ'
  },
  {
    id: 'mount-concrete',
    category: 'solar',
    name: 'โครงยึดแผงหลังคาดาดฟ้าคอนกรีต',
    nameEng: 'Concrete Deck Mounting',
    abbreviation: 'MOUNT-CC',
    symbol: '',
    image: '',
    function: 'ชุดขาตั้งและโครงสร้างสำหรับติดตั้งบนดาดฟ้าพื้นราบ',
    principle: 'ใช้ขาตั้งปรับองศา (Tilt Mount) เอียงแผง 10–15 องศาเพื่อรับแสงและให้น้ำฝนชะล้างฝุ่น ยึดด้วยการหล่อฐานถ่วงคอนกรีต (Ballast) หรือยิงพุกเคมี',
    specs: [
      { label: 'จุดเด่น', value: 'ปรับมุม-ทิศทางรับแดดได้อิสระ เดินเข้าไปตรวจซ่อมใต้แผงได้ง่าย' }
    ],
    warnings: 'ต้องคำนวณการรับน้ำหนักของพื้นดาดฟ้าให้ดี และต้องทำระบบกันซึมที่จุดยึดพุก รวมถึงเว้นระยะห่างระหว่างแถวแผง (Row Spacing) เพื่อไม่ให้เงาบังกันเอง'
  },
  {
    id: 'system-ongrid',
    category: 'solar',
    name: 'ระบบออนกริด (On-Grid)',
    nameEng: 'On-Grid System',
    abbreviation: 'ON-GRID',
    symbol: '',
    image: '',
    function: 'ระบบผลิตไฟฟ้าที่คุ้มค่าที่สุด เหมาะสำหรับ "บ้านที่ใช้ไฟกลางวันมาก" หรือโฮมออฟฟิศ',
    principle: 'ไฟที่ผลิตได้จะถูกดึงไปใช้ในบ้านทันที ลดการซื้อไฟจากการไฟฟ้า หากผลิตได้มากกว่าที่ใช้ ไฟส่วนเกินจะไหลย้อนกลับมิเตอร์ไปขายคืนได้ (โครงการ Net Billing 2.20 บาท/หน่วย)',
    specs: [
      { label: 'ราคาติดตั้ง (5 kW)', value: '90,000 – 120,000 บาท' },
      { label: 'ระยะเวลาคืนทุน (Payback)', value: '4 – 6 ปี (เร็วกว่าระบบอื่น 2 เท่า)' }
    ],
    warnings: 'ระบบนี้ไม่มีแบตเตอรี่สำรอง ดังนั้นเมื่อเกิดเหตุ "ไฟหลวงดับ" แผงโซลาร์เซลล์จะดับตามไปด้วย ไม่สามารถผลิตไฟมาใช้ได้'
  },
  {
    id: 'system-offgrid',
    category: 'solar',
    name: 'ระบบออฟกริด (Off-Grid)',
    nameEng: 'Off-Grid System',
    abbreviation: 'OFF-GRID',
    symbol: '',
    image: '',
    function: 'ระบบผลิตไฟฟ้าอิสระ ตัดขาดจากการไฟฟ้า 100% เหมาะกับ "พื้นที่ห่างไกล, บนดอย, เกาะ"',
    principle: 'ผลิตไฟได้ต้องนำไปเก็บในแบตเตอรี่ทั้งหมด แล้วดึงจากแบตเตอรี่มาใช้ในบ้านตลอด 24 ชั่วโมง',
    specs: [
      { label: 'ราคาติดตั้ง', value: '100,000 - 130,000+ บาท (ต้องลงทุนซื้อแบตเตอรี่ขนาดใหญ่)' },
      { label: 'ระยะเวลาคืนทุน', value: '3.5 – 4.5 ปี (ประเมินจากการที่ไม่ต้องลากสายไฟแรงสูงเข้าพื้นที่)' }
    ],
    warnings: 'ไม่แนะนำสำหรับบ้านในเมืองที่มีไฟอยู่แล้ว เพราะต้องดูแลแบตเตอรี่มาก และในวันฝนตกหนักหลายวัน ไฟอาจจะไม่พอใช้'
  },
  {
    id: 'system-hybrid',
    category: 'solar',
    name: 'ระบบไฮบริด (Hybrid)',
    nameEng: 'Hybrid System',
    abbreviation: 'HYBRID',
    symbol: '',
    image: '',
    function: 'รวมข้อดีของ On-Grid และ Off-Grid ไว้ด้วยกัน เหมาะกับบ้านที่ "ไฟดับบ่อย" หรือต้องการสำรองไฟ',
    principle: 'ปกติทำงานเหมือน On-grid คือใช้ไฟและชาร์จแบต แต่ถ้าไฟดับ อินเวอร์เตอร์จะสลับไปดึงไฟจากแบตเตอรี่มาจ่ายให้เครื่องใช้ไฟฟ้าที่จำเป็นได้อย่างต่อเนื่อง',
    specs: [
      { label: 'ราคาติดตั้ง (5 kW + แบต 5 kWh)', value: 'ประมาณ 200,000 บาท' },
      { label: 'ระยะเวลาคืนทุน', value: '8 – 12 ปี (คืนทุนช้ากว่า On-Grid เพราะค่าแบตเตอรี่)' }
    ],
    warnings: 'อายุแบตเตอรี่สั้นกว่าแผง (8-10 ปี) ทำให้ต้องมีรอบการลงทุนเปลี่ยนแบตเตอรี่ในอนาคต'
  },
  {
    id: 'solar-wiring',
    category: 'solar',
    name: 'การเดินสายไฟและอุปกรณ์ป้องกัน (Wiring)',
    nameEng: 'Solar Wiring & Protection',
    abbreviation: 'WIRING',
    symbol: '',
    image: '',
    function: 'การนำส่งกระแสไฟฟ้าจากแผงผ่านอุปกรณ์ไปยังจุดใช้งานด้วยความปลอดภัย',
    principle: 'ฝั่ง DC (แผง->อินเวอร์เตอร์): ใช้สาย PV (PV1-F) ทนแดด UV ขั้วต่อ MC4 ฝั่ง AC: ใช้สาย THW / NYY ทองแดง. คำนวณแรงดันตกคร่อมรวมไม่ควรเกิน 5%',
    specs: [
      { label: 'ระบบกราวด์ (Grounding)', value: 'ต่อโครงแผง+อินเวอร์เตอร์ลงหลักดิน ค่าความต้านทาน < 5 Ω' },
      { label: 'ตู้ควบคุม (Combiner Box)', value: 'ติดตั้งเบรกเกอร์ DC/AC, ฟิวส์สตริง, SPD กันฟ้าผ่า, RCD ตัดไฟรั่ว' }
    ],
    warnings: 'ต้องแยกท่อเดินสาย DC ออกจาก AC เพื่อลดการรบกวนและเพิ่มความปลอดภัย สาย AC ต้องเผื่อ Derating เมื่อเดินในท่อ'
  },
  {
    id: 'solar-conduit',
    category: 'solar',
    name: 'ท่อร้อยสายไฟ (Conduit)',
    nameEng: 'Conduit',
    abbreviation: 'CONDUIT',
    symbol: '',
    image: '',
    function: 'ปกป้องสายไฟจากแดด ฝน กระแทก และป้องกันไฟลาม',
    principle: '1) ท่อ EMT (เหล็กบาง): ใช้งานภายในอาคาร 2) ท่อ IMC/RSC (เหล็กหนา): ทนทาน งานภายนอก 3) ท่อ uPVC: กันน้ำ กันสนิม นิยมเดินนอกบ้าน 4) ท่ออ่อน: เข้าจุดอุปกรณ์',
    specs: [],
    warnings: 'ฝั่ง DC บนหลังคาควรใช้ท่อโลหะหรือท่อทนแดด UV ชนิดพิเศษ เพื่อป้องกันการกรอบแตก และกันไฟลามตามมาตรฐานความปลอดภัย'
  },
  {
    id: 'solar-spd-type1',
    category: 'solar',
    name: 'อุปกรณ์ป้องกันไฟกระชาก (SPD) Type 1',
    nameEng: 'Surge Protective Device (SPD) Type 1',
    abbreviation: 'SPD-T1',
    symbol: '',
    image: '',
    function: 'ปราการด่านหน้าป้องกันฟ้าผ่า สกัดกั้นพลังงานมหาศาลจากภายนอก ณ จุดทางเข้าบริการ (Service Entrance)',
    principle: 'ออกแบบมาเพื่อรับรูปคลื่น 10/350 µs (จำลองฟ้าผ่าโดยตรง) ซึ่งมีพลังงานมากกว่าคลื่น 8/20 µs ถึง 20 เท่า',
    specs: [
      { label: 'พารามิเตอร์สำคัญ', value: 'I_imp (Impulse Current) และระดับการป้องกัน U_p ≤ 4 kV' },
      { label: 'เมื่อใดที่ต้องใช้', value: 'อาคารมีระบบป้องกันฟ้าผ่า (LPS), รับไฟจากสายเหนือดิน, โครงสร้างพื้นฐานสำคัญ' },
      { label: 'Expert Tip (UL 1449)', value: 'บางรุ่นเป็น Dual-rated สามารถนำไปติดตั้งทางด้าน Load side เพื่อทำหน้าที่แทน Type 2 ได้ เพิ่มความยืดหยุ่น' }
    ],
    warnings: 'คิดว่าติด Type 1 แล้วจะปลอดภัยทั้งหมดไม่ได้ เพราะค่า U_p สูงเกินกว่าที่อุปกรณ์อิเล็กทรอนิกส์ปลายทางจะทนได้ ต้องประสานการทำงานกับ Type 2'
  },
  {
    id: 'solar-spd-type2',
    category: 'solar',
    name: 'อุปกรณ์ป้องกันไฟกระชาก (SPD) Type 2',
    nameEng: 'Surge Protective Device (SPD) Type 2',
    abbreviation: 'SPD-T2',
    symbol: '',
    image: '',
    function: 'ระบบป้องกันหลัก (Workhorse) ของระบบ จัดการแรงดันเกินชั่วครู่ภายในระบบ (Internal Switching Transients)',
    principle: 'จัดการแรงดันกระชากจากการทำงานของมอเตอร์, HVAC, ลิฟต์ หรือ VFD (เกิดบ่อยกว่าฟ้าผ่ามาก) ทดสอบด้วยรูปคลื่น 8/20 µs',
    specs: [
      { label: 'พารามิเตอร์สำคัญ', value: 'I_n (Nominal) / I_max และระดับการป้องกัน U_p ≤ 2.5 kV (Category II)' },
      { label: 'จุดติดตั้ง', value: 'แผงจ่ายไฟหลัก (MDB) หรือแผงย่อย (Sub-panels)' },
      { label: 'เมื่อใดที่ต้องใช้', value: 'ทุกจุดที่ต้องการป้องกันแผงจ่ายไฟ โดยเฉพาะตู้คอนโทรลโซลาร์เซลล์, HVAC, EV Charger' }
    ],
    warnings: 'ห้ามผสมแบรนด์ SPD โดยไม่มีการคำนวณ (Coordination) อาจทำให้การป้องกันไม่ทำงานตามลำดับที่ถูกต้อง'
  },
  {
    id: 'solar-spd-type3',
    category: 'solar',
    name: 'อุปกรณ์ป้องกันไฟกระชาก (SPD) Type 3',
    nameEng: 'Surge Protective Device (SPD) Type 3',
    abbreviation: 'SPD-T3',
    symbol: '',
    image: '',
    function: 'การปกป้องขั้นสุดท้าย (Point-of-use Layer) ลดแรงดันตกค้างส่วนสุดท้ายให้ปลอดภัยต่อแผงวงจร',
    principle: 'ทำ "Voltage Clamping" ขลิบแรงดันในระดับละเอียด (Fine-tuning) ติดตั้งใกล้กับอุปกรณ์ที่ละเอียดอ่อน เช่น เซิร์ฟเวอร์, อุปกรณ์ไอที ทดสอบด้วย Combination Wave',
    specs: [
      { label: 'พารามิเตอร์สำคัญ', value: 'U_oc (Open-circuit voltage) และระดับการป้องกัน U_p ≤ 1.5 kV' },
      { label: 'กฎ 10 เมตร (10-Meter Rule)', value: 'ต้องติดตั้งห่างจากแผงที่มี Type 2 อย่างน้อย 10 เมตร เพื่อสร้าง Adequate Impedance หน่วงเวลาให้ Type 2 ทำงานก่อน' }
    ],
    warnings: 'ห้ามใช้ Type 3 เพียงลำพังโดยไม่มี Type 2 เป็นอันขาด เพราะความสามารถในการระบายกระแสต่ำมาก จะทำให้ถูกทำลายทันที'
  },
  {
    id: 'solar-spd-coordination',
    category: 'solar',
    name: 'ยุทธศาสตร์การป้องกันแบบลำดับชั้น (SPD Coordination)',
    nameEng: 'Layered Protection Strategy',
    abbreviation: 'COORD',
    symbol: '',
    image: '',
    function: 'การประสานงานทางพลังงานระหว่างชั้น (Energy Coordination) เพื่อให้ระบบสกัดกั้นแรงดันเกินได้อย่างสมบูรณ์',
    principle: 'Stage 1: Type 1 ระบายฟ้าผ่า -> Stage 2: Type 2 จัดการไฟกระชากสวิตชิ่ง -> Stage 3: Type 3 ลดแรงดันส่วนสุดท้ายให้วงจร',
    specs: [
      { label: 'การเลือกผู้ผลิต', value: 'ควรใช้ Matched Product Families หรือตรวจสอบ Coordination Table ของผู้ผลิตเสมอ' },
      { label: 'ความเข้าใจผิด', value: 'การละเลยระยะ Decoupling (ติด Type 2 กับ 3 ใกล้กันเกินไป) ทำให้เกิดการแบ่งพลังงานผิดพลาด' }
    ],
    warnings: 'การเลือก SPD ไม่ได้ขึ้นอยู่กับราคา แต่ขึ้นอยู่กับ "ตำแหน่งติดตั้ง" และ "ระดับพลังงาน" ตามมาตรฐาน IEC 61643-11 / UL 1449'
  }
];

export const categories = [
  {
    id: 'air-conditioning',
    name: 'ระบบปรับอากาศ',
    nameEng: 'Air Conditioning',
    description: 'ข้อมูลทั้งหมดเกี่ยวกับระบบปรับอากาศประเภทต่างๆ คอมเพรสเซอร์ วาล์ว และส่วนประกอบที่เกี่ยวข้องตามไฟล์อ้างอิง',
    image: '/images/category-ac.jpg'
  },
  {
    id: 'solar',
    name: 'ระบบโซลาร์เซลล์',
    nameEng: 'Solar Power Systems',
    description: 'รายละเอียดเจาะลึกระบบเซลล์แสงอาทิตย์ On-Grid, Off-Grid, Hybrid อุปกรณ์ประกอบ และมาตรฐานการติดตั้งครบวงจร',
    image: '/images/category-solar.jpg'
  }
];
