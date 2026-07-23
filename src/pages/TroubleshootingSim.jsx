import { useState } from 'react';
import { 
  ArrowLeft, Wrench, RefreshCcw, ThermometerSnowflake, Wind, ChevronRight, Sun, Zap,
  ShieldCheck, AlertTriangle, Gauge, Cpu, CheckCircle2, XCircle, FileText, Activity, Terminal
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const scenariosList = [
  {
    id: 'ac_cap_fail',
    category: 'ac',
    categoryName: 'ระบบปรับอากาศ (HVAC)',
    icon: Wind,
    color: '#0080FF',
    title: 'ใบแจ้งซ่อม WO-8812: แอร์สำนักงานลมพัดปกติ แต่ไม่มีความเย็น',
    client: 'บริษัท ไทยอินดัสทรี จำกัด (อาคาร B ชั้น 3)',
    equipment: 'Wall Mounted Inverter Air Conditioner 24,000 BTU',
    symptom: 'พัดลมคอยล์เย็นทำงานปกติ เสียงพัดลมคอยล์ร้อนหมุน แต่ห้องร้อนอุณหภูมิ 32°C คอมเพรสเซอร์ดังตัดแกร๊กๆ',
    nameplate: {
      voltage: '220V 1-Phase 50Hz',
      rla: '8.5 A',
      lra: '42 A',
      refrigerant: 'R32 (1.10 kg)',
      capRating: '45 µF ±5% 450VAC'
    },
    measurements: {
      lotoDone: false,
      voltageLN: '222 VAC (ปกติ)',
      currentAmp: '1.2 A (ต่ำกว่า RLA 8.5A มาก)',
      capValue: '5.2 µF (เสื่อมสภาพอย่างหนัก! ค่าปกติ 45 µF)',
      windingResistance: 'C-R: 1.5 Ω, C-S: 2.8 Ω, R-S: 4.3 Ω (ขดลวดปกติ)',
      lowPressure: '145 PSI (Static Equalized - คอมฯ ไม่สตาร์ท)',
      highPressure: '145 PSI (Static Equalized)',
      supplyTemp: '31.2 °C (ไม่มีความเย็น)',
      returnTemp: '31.8 °C (Delta T = 0.6 °C)'
    },
    diagnosisOptions: [
      { id: 'diag_leak', label: 'น้ำยาแอร์รั่วหมดระบบ ทำให้แอร์ไม่เย็น', correct: false, explanation: 'ผิด! แรงดันน้ำยาอยู่ที่ 145 PSI (Static) แสดงว่าน้ำยาเต็มระบบ ไม่ได้รั่ว' },
      { id: 'diag_cap', label: 'คาปาซิเตอร์ (Run Capacitor) ค่าความจุลดลง ทำให้คอมเพรสเซอร์ไม่มีแรงสตาร์ท', correct: true, explanation: 'ถูกต้อง! วัดค่า C ได้เพียง 5.2 µF จากสเปก 45 µF ทำให้คอมเพรสเซอร์ไม่ออกตัวและตัด Overload' },
      { id: 'diag_comp_burn', label: 'คอมเพรสเซอร์ขดลวดไหม้ ต้องเปลี่ยนคอมเพรสเซอร์ใหม่', correct: false, explanation: 'ผิด! ผลวัดความต้านทานขดลวด C-R, C-S, R-S ได้ค่าสมดุลตามปกติ คอมฯ ไม่ได้ไหม้' },
      { id: 'diag_filter', label: 'ฟิลเตอร์กรองฝุ่นตัน ให้ล้างทำความสะอาดแอร์', correct: false, explanation: 'ผิด! แม้ล้างแอร์ก็ไม่ช่วย เพราะปัญหาอยู่ที่ระบบไฟฟ้าของคอมเพรสเซอร์ไม่ทำงาน' }
    ],
    repairSteps: [
      'ตัดแหล่งจ่ายไฟ (LOTO) และวัดตรวจสอบแรงดันไฟฟ้าให้อยู่ในสถานะ 0V',
      'ทำการคายประจุไฟฟ้าที่ค้างใน คาปาซิเตอร์ ตัวเก่าเพื่อความปลอดภัย',
      'ถอดสายและเปลี่ยน คาปาซิเตอร์ ตัวใหม่ขนาด 45 µF 450VAC ตามสเปก Nameplate',
      'จ่ายไฟเข้าระบบ และทดสอบวัดกระแสทำงานจริง (กระแสจะกลับมาอยู่ที่ ~8.1A และ Supply Temp ดร็อปลงเหลือ 16°C)'
    ]
  },
  {
    id: 'refrig_fan_dead',
    category: 'refrig',
    categoryName: 'ระบบทำความเย็น (Refrigeration)',
    icon: ThermometerSnowflake,
    color: '#00F0FF',
    title: 'ใบแจ้งซ่อม WO-9045: ตู้แช่เครื่องดื่มคอมเพรสเซอร์ร้อนจัดและตัดตัดต่อบ่อย',
    client: 'ร้านสะดวกซื้อ Minimart สาขาบางนา',
    equipment: 'Commercial Display Chiller 3-Door',
    symptom: 'ตู้แช่ไม่เย็น คอมเพรสเซอร์ร้อนจัดจนจับไม่ได้ มีเสียง Overload ตัดการทำงานทุกๆ 5 นาที',
    nameplate: {
      voltage: '220V 1-Phase 50Hz',
      rla: '4.2 A',
      lra: '24 A',
      refrigerant: 'R134a (0.45 kg)',
      capRating: '15 µF 450VAC'
    },
    measurements: {
      lotoDone: false,
      voltageLN: '218 VAC (ปกติ)',
      currentAmp: '12.8 A (สูงกว่า RLA มาก - Overload Cutout)',
      capValue: '14.8 µF (ปกติ)',
      windingResistance: 'C-R: 3.1 Ω, C-S: 5.4 Ω (ปกติ)',
      lowPressure: '65 PSI (สูงกว่าปกติ)',
      highPressure: '320 PSI (สูงเกินพิกัดความปลอดภัย High Pressure Alert!)',
      supplyTemp: '24.5 °C',
      returnTemp: '26.0 °C',
      condenserFan: 'มอเตอร์พัดลมคอยล์ร้อนฝืดสนิท ไม่หมุน (Locked Rotor)'
    },
    diagnosisOptions: [
      { id: 'diag_overcharge', label: 'เติมน้ำยาแอร์เกินขนาด ทำให้แรงดันสูง', correct: false, explanation: 'ผิด! แรงดันสูงเกิดจากความร้อนระบายไม่ออก ไม่ใช่น้ำยาเกิน' },
      { id: 'diag_fan_dead', label: 'มอเตอร์พัดลมระบายความร้อนคอยล์ร้อน (Condenser Fan) พัง ทำให้ความดันและกระแสสูงจน Overload ตัด', correct: true, explanation: 'ถูกต้อง! เมื่อพัดลมระบายความร้อนไม่หมุน ความดัน High Side พุ่งสูงถึง 320 PSI ส่งผลให้กระแสพุ่งไป 12.8A จนคอมเพรสเซอร์ตัดความร้อน' },
      { id: 'diag_thermo', label: 'เทอร์โมสตัทตั้งอุณหภูมิผิดพลาด', correct: false, explanation: 'ผิด! เทอร์โมสตัททำงานสั่งให้เครื่องวิ่ง แต่เครื่องระบายความร้อนไม่ได้เอง' }
    ],
    repairSteps: [
      'ทำการ LOTO ปลดสวิตช์ตัดไฟตู้แช่',
      'ถอดชุดพัดลมระบายความร้อนคอยล์ร้อน (Condenser Fan Motor)',
      'เปลี่ยนมอเตอร์พัดลมตัวใหม่พร้อมทำความสะอาดแผงคอนเดนเซอร์ที่ฝุ่นเกาะ',
      'เปิดทดสอบระบบ (ความดัน High Side กลับสู่ 150 PSI กระแสลดเหลือ 4.0A)'
    ]
  },
  {
    id: 'solar_pv_string_open',
    category: 'solar',
    categoryName: 'ระบบพลังงานแสงอาทิตย์ (Solar)',
    icon: Sun,
    color: '#F59E0B',
    title: 'ใบแจ้งซ่อม WO-7731: อินเวอร์เตอร์โซลาร์ผลิตไฟได้เพียงครึ่งเดียวของพิกัด',
    client: 'โรงงานส่งออกอาหาร รังสิต',
    equipment: 'On-Grid Solar Inverter 10 kW (2 MPPTs)',
    symptom: 'ระบบติดตั้ง 10 kWp แดดจัดตอนเที่ยง แต่ผลิตไฟได้เพียง 4.8 kW หน้าจอแสดงผล MPPT1 = 4.8kW, MPPT2 = 0W',
    nameplate: {
      voltage: '380V 3-Phase 50Hz AC',
      maxDcVoltage: '1000 VDC',
      mpptRange: '200V - 850V DC',
      mpptInputs: '2 Strings (String 1: 12 Panels, String 2: 12 Panels)'
    },
    measurements: {
      lotoDone: false,
      voltageLN: '230 VAC / Phase (ปกติ)',
      mppt1Voc: '485 VDC (ปกติ - กำลังผลิต 4.8 kW)',
      mppt2Voc: '0 VDC (Open Circuit / สายขาดวงจร)',
      string2Mc4: 'พบขั้วต่อ MC4 Connector ฝั่ง DC String 2 หลุด/ไหม้หลอมละลาย',
      insulationResistance: 'String 1: >999 MΩ, String 2: Open'
    },
    diagnosisOptions: [
      { id: 'diag_inv_board', label: 'วงจร MPPT2 ภายในอินเวอร์เตอร์พัง ต้องเปลี่ยนอินเวอร์เตอร์', correct: false, explanation: 'ผิด! แรงดัน DC ฝั่งเข้า MPPT2 วัดได้ 0V แสดงว่าปัญหาเกิดจากสายไฟ/ขั้วต่อฝั่งหลังคา ไม่ใช่อินเวอร์เตอร์' },
      { id: 'diag_mc4_burn', label: 'ขั้วต่อ MC4 Connector ฝั่ง String 2 อาร์คไหม้หลุดวงจร ทำให้ไฟไม่เข้า MPPT2', correct: true, explanation: 'ถูกต้อง! การเข้าหัว MC4 ไม่แน่นทำให้เกิดความร้อนสะสมจนขั้วต่อไหม้ลัดวงจร ไฟจาก String 2 จึงลงมาไม่ถึงอินเวอร์เตอร์' },
      { id: 'diag_panel_shading', label: 'เงาต้นไม้บังแผงใน String 2 ทั้งหมด', correct: false, explanation: 'ผิด! เงาบังแผงจะทำให้ V/I ดร็อปลง แต่จะไม่ทำให้แรงดันเป็น 0V สดๆ แบบวงจรขาด' }
    ],
    repairSteps: [
      'สับ DC Isolator Switch และ AC Breaker ลงเพื่อทำ LOTO',
      'ปีนขึ้นตรวจสอบสายไฟ DC บนหลังคาบริเวณ String 2',
      'ตัดสายไฟส่วนที่ไหม้และเข้าหัว MC4 Connector ตัวใหม่ด้วยคีมย้ำมาตรฐานวิศวกรรม',
      'วัดแรงดัน String 2 ได้ 485 VDC สับสวิตช์จ่ายไฟ กำลังผลิตรวมกลับมาเป็น 9.6 kW'
    ]
  }
];

const TroubleshootingSim = () => {
  const navigate = useNavigate();
  const [activeScenario, setActiveScenario] = useState(null);
  
  // Interactive Simulation State
  const [safetyCleared, setSafetyCleared] = useState(false);
  const [activeTool, setActiveTool] = useState('none'); // 'multimeter', 'clamp', 'gauge', 'thermal'
  const [selectedDiagnosis, setSelectedDiagnosis] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState(['[SYSTEM]: Diagnostic Station Ready. Please perform Safety Clearance (LOTO).']);

  const addLog = (msg) => {
    setTerminalLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const handleStartScenario = (sc) => {
    setActiveScenario(sc);
    setSafetyCleared(false);
    setActiveTool('none');
    setSelectedDiagnosis(null);
    setCurrentStepIndex(0);
    setIsCompleted(false);
    setTerminalLogs([
      `[SYSTEM]: Initialized Work Order ${sc.title.split(':')[0]}`,
      `[CLIENT]: ${sc.client}`,
      `[EQUIPMENT]: ${sc.equipment}`,
      `[SAFETY]: LOCKOUT/TAGOUT (LOTO) REQUIRED BEFORE MEASUREMENT.`
    ]);
  };

  const handleSafetyClearance = () => {
    setSafetyCleared(true);
    addLog('SUCCESS: Safety Breaker Locked & Tagged (LOTO Passed). Zero voltage confirmed on live chassis.');
  };

  const handleSelectTool = (tool) => {
    if (!safetyCleared) {
      addLog('WARNING: Safety Clearance (LOTO) is mandatory before using measurement tools!');
      return;
    }
    setActiveTool(tool);
    if (tool === 'multimeter') {
      addLog('TOOL ENGAGED: Digital Multimeter (Voltage & Capacitance Mode)');
    } else if (tool === 'clamp') {
      addLog('TOOL ENGAGED: AC/DC Current Clamp Meter');
    } else if (tool === 'gauge') {
      addLog('TOOL ENGAGED: Digital Refrigerant Gauge Manifold');
    } else if (tool === 'thermal') {
      addLog('TOOL ENGAGED: Thermal Imaging & Infrared Temperature Scanner');
    }
  };

  const handleSelectDiagnosis = (diag) => {
    setSelectedDiagnosis(diag);
    if (diag.correct) {
      addLog(`DIAGNOSIS CONFIRMED: ${diag.label}`);
    } else {
      addLog(`DIAGNOSIS REJECTED: ${diag.explanation}`);
    }
  };

  const handleExecuteNextRepairStep = () => {
    if (currentStepIndex < activeScenario.repairSteps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
      addLog(`EXECUTED REPAIR STEP ${currentStepIndex + 1}: ${activeScenario.repairSteps[currentStepIndex]}`);
    } else {
      setIsCompleted(true);
      addLog(`SUCCESS: Work Order completed! System restored to nominal operating parameters.`);
    }
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      {/* Header Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <button 
          onClick={() => activeScenario ? setActiveScenario(null) : navigate(-1)} 
          style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '0.5rem' }}
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-gradient-ac" style={{ marginBottom: '0.2rem', fontSize: '2rem' }}>
            {activeScenario ? 'สถานีวิเคราะห์และซ่อมบำรุงวิศวกรรม' : 'จำลองสถานการณ์ซ่อมบำรุงวิศวกรรม'}
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Industrial Engineering Diagnostic Workstation</p>
        </div>
      </div>

      {/* Mode 1: Select Work Order Scenario */}
      {!activeScenario && (
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <h2 style={{ fontSize: '1.3rem', color: 'var(--text-primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText color="var(--accent-ac)" size={22} /> รายการใบแจ้งซ่อมหน้างานจริง (Active Work Orders)
            </h2>
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
              เลือกสถานการณ์เพื่อเข้าสู่สถานีวิเคราะห์ ใช้เครื่องมือวัดค่าทางไฟฟ้า อุณหภูมิ และความดัน เพื่อหาสาเหตุเชิงวิศวกรรม
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {scenariosList.map((sc) => {
              const IconComponent = sc.icon;
              return (
                <div 
                  key={sc.id} 
                  className="equipment-card category-card-hover"
                  onClick={() => handleStartScenario(sc)}
                  style={{ 
                    padding: '1.8rem', 
                    background: 'var(--bg-secondary)', 
                    borderRadius: 'var(--radius-md)', 
                    border: '1px solid var(--border-color)',
                    borderTop: `4px solid ${sc.color}`,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <span style={{ fontSize: '0.85rem', background: 'var(--bg-tertiary)', padding: '0.3rem 0.8rem', borderRadius: '50px', color: sc.color, fontWeight: 'bold' }}>
                        {sc.categoryName}
                      </span>
                      <IconComponent color={sc.color} size={24} />
                    </div>

                    <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '0.8rem', lineHeight: '1.4' }}>
                      {sc.title}
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '1rem' }}>
                      <strong>อาการแจ้งซ่อม:</strong> {sc.symptom}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '1rem' }}>
                    <span style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>📍 {sc.client}</span>
                    <button style={{ background: sc.color, color: 'white', border: 'none', padding: '0.4rem 1rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 'bold' }}>
                      เข้าซ่อม <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Mode 2: Interactive Diagnostic Workstation */}
      {activeScenario && (
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Work Order Header Banner */}
          <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: `1px solid ${activeScenario.color}`, display: 'flex', flexWrap: 'wrap', justifyBetween: 'space-between', gap: '1.5rem' }}>
            <div style={{ flex: 1, minWidth: '280px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ background: activeScenario.color, color: 'white', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                  WORK ORDER
                </span>
                <h2 style={{ fontSize: '1.3rem', color: 'var(--text-primary)', margin: 0 }}>{activeScenario.title}</h2>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: '0 0 0.5rem 0' }}>
                🏢 <strong>สถานที่:</strong> {activeScenario.client} | ⚙️ <strong>อุปกรณ์:</strong> {activeScenario.equipment}
              </p>
              <p style={{ color: '#FFB800', background: 'rgba(255,184,0,0.1)', padding: '0.6rem', borderRadius: '6px', margin: 0, fontSize: '0.9rem', borderLeft: '3px solid #FFB800' }}>
                ⚠️ <strong>อาการรับแจ้ง:</strong> {activeScenario.symptom}
              </p>
            </div>

            {/* Nameplate Spec Box */}
            <div style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: '6px', border: '1px solid var(--border-color)', minWidth: '240px' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--accent-ac)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Cpu size={16} /> SPECIFICATION NAMEPLATE
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <div>Volt: <strong style={{ color: 'var(--text-primary)' }}>{activeScenario.nameplate.voltage}</strong></div>
                <div>RLA: <strong style={{ color: 'var(--text-primary)' }}>{activeScenario.nameplate.rla}</strong></div>
                <div>LRA: <strong style={{ color: 'var(--text-primary)' }}>{activeScenario.nameplate.lra}</strong></div>
                {activeScenario.nameplate.refrigerant && <div>Refrig: <strong style={{ color: 'var(--text-primary)' }}>{activeScenario.nameplate.refrigerant}</strong></div>}
                {activeScenario.nameplate.capRating && <div style={{ gridColumn: 'span 2' }}>Capacitor: <strong style={{ color: 'var(--text-primary)' }}>{activeScenario.nameplate.capRating}</strong></div>}
              </div>
            </div>
          </div>

          {/* Step 1: Safety & LOTO Clearance */}
          {!safetyCleared && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '2px dashed #EF4444', padding: '2rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <AlertTriangle color="#EF4444" size={48} style={{ marginBottom: '1rem' }} />
              <h3 style={{ color: '#EF4444', fontSize: '1.4rem', marginBottom: '0.5rem' }}>ขั้นตอนความปลอดภัยวิศวกรรม (LOTO Safety Requirement)</h3>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 1.5rem auto' }}>
                ตามมาตรฐานความปลอดภัย OSHA/วสท. ก่อนเปิดตู้ไฟและใช้เครื่องมือวัด คุณต้องสับเบรกเกอร์ตัดวงจร คล้องกุญแจ Lockout/Tagout และวัดตรวจสอบสถานะไฟ 0V ก่อนเริ่มงาน
              </p>
              <button 
                onClick={handleSafetyClearance}
                style={{ background: '#EF4444', color: 'white', border: 'none', padding: '0.8rem 2rem', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <ShieldCheck size={22} /> ดำเนินการ LOTO และสับสวิตช์ความปลอดภัย
              </button>
            </div>
          )}

          {/* Main Interactive Workbench (Unlocked after Safety Clearance) */}
          {safetyCleared && (
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
              
              {/* Left Column: Tools & Diagnostic Viewport */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                
                {/* Measurement Tool Selector */}
                <div style={{ background: 'var(--bg-secondary)', padding: '1.2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Wrench size={20} color="var(--accent-ac)" /> เลือกเครื่องมือวัดทางวิศวกรรม (Measurement Toolbox)
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.8rem' }}>
                    <button 
                      onClick={() => handleSelectTool('multimeter')}
                      style={{ 
                        background: activeTool === 'multimeter' ? 'var(--accent-primary)' : 'var(--bg-primary)', 
                        color: activeTool === 'multimeter' ? 'white' : 'var(--text-primary)',
                        border: '1px solid var(--border-color)', padding: '0.8rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem'
                      }}
                    >
                      <Zap size={20} /> Multimeter (Volt/Cap)
                    </button>
                    <button 
                      onClick={() => handleSelectTool('clamp')}
                      style={{ 
                        background: activeTool === 'clamp' ? 'var(--accent-primary)' : 'var(--bg-primary)', 
                        color: activeTool === 'clamp' ? 'white' : 'var(--text-primary)',
                        border: '1px solid var(--border-color)', padding: '0.8rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem'
                      }}
                    >
                      <Activity size={20} /> Clamp Meter (Amp)
                    </button>
                    <button 
                      onClick={() => handleSelectTool('gauge')}
                      style={{ 
                        background: activeTool === 'gauge' ? 'var(--accent-primary)' : 'var(--bg-primary)', 
                        color: activeTool === 'gauge' ? 'white' : 'var(--text-primary)',
                        border: '1px solid var(--border-color)', padding: '0.8rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem'
                      }}
                    >
                      <Gauge size={20} /> Manifold Gauge (PSI)
                    </button>
                    <button 
                      onClick={() => handleSelectTool('thermal')}
                      style={{ 
                        background: activeTool === 'thermal' ? 'var(--accent-primary)' : 'var(--bg-primary)', 
                        color: activeTool === 'thermal' ? 'white' : 'var(--text-primary)',
                        border: '1px solid var(--border-color)', padding: '0.8rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem'
                      }}
                    >
                      <ThermometerSnowflake size={20} /> Temp Probe (°C)
                    </button>
                  </div>
                </div>

                {/* Display Measurement Results */}
                <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Activity size={20} color="var(--accent-solar)" /> ผลการวัดค่าจากเครื่องมือ (Empirical Readings)
                  </h3>

                  {activeTool === 'none' && (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-tertiary)' }}>
                      กรุณากดเลือกเครื่องมือวัดด้านบนเพื่อดูค่าพารามิเตอร์จริงหน้างาน
                    </div>
                  )}

                  {activeTool === 'multimeter' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: '6px', borderLeft: '4px solid #0080FF' }}>
                        <span style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>แรงดันไฟฟ้า (Volt L-N):</span>
                        <h4 style={{ color: '#0080FF', fontSize: '1.3rem', margin: '0.2rem 0 0 0' }}>{activeScenario.measurements.voltageLN}</h4>
                      </div>
                      {activeScenario.measurements.capValue && (
                        <div style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: '6px', borderLeft: '4px solid #EF4444' }}>
                          <span style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>ค่าความจุ Capacitance (µF):</span>
                          <h4 style={{ color: '#EF4444', fontSize: '1.3rem', margin: '0.2rem 0 0 0' }}>{activeScenario.measurements.capValue}</h4>
                        </div>
                      )}
                      {activeScenario.measurements.windingResistance && (
                        <div style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: '6px', borderLeft: '4px solid #10B981', gridColumn: 'span 2' }}>
                          <span style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>ความต้านทานขดลวดมอเตอร์ (Ohm Ω):</span>
                          <h4 style={{ color: '#10B981', fontSize: '1.1rem', margin: '0.2rem 0 0 0' }}>{activeScenario.measurements.windingResistance}</h4>
                        </div>
                      )}
                      {activeScenario.measurements.mppt2Voc && (
                        <div style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: '6px', borderLeft: '4px solid #F59E0B', gridColumn: 'span 2' }}>
                          <span style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>แรงดัน DC String 1 & String 2:</span>
                          <h4 style={{ color: '#F59E0B', fontSize: '1.1rem', margin: '0.2rem 0 0 0' }}>
                            String 1: {activeScenario.measurements.mppt1Voc} | String 2: {activeScenario.measurements.mppt2Voc}
                          </h4>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTool === 'clamp' && (
                    <div style={{ background: 'var(--bg-primary)', padding: '1.2rem', borderRadius: '6px', borderLeft: '4px solid #F59E0B' }}>
                      <span style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>กระแสไฟฟ้าขณะทำงาน (Amp Draw):</span>
                      <h4 style={{ color: '#F59E0B', fontSize: '1.5rem', margin: '0.3rem 0' }}>{activeScenario.measurements.currentAmp}</h4>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
                        พิกัด Nameplate RLA: <strong>{activeScenario.nameplate.rla}</strong>
                      </p>
                    </div>
                  )}

                  {activeTool === 'gauge' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: '6px', borderLeft: '4px solid #0080FF' }}>
                        <span style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>Low Side Suction Pressure:</span>
                        <h4 style={{ color: '#0080FF', fontSize: '1.3rem', margin: '0.2rem 0 0 0' }}>{activeScenario.measurements.lowPressure}</h4>
                      </div>
                      <div style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: '6px', borderLeft: '4px solid #EF4444' }}>
                        <span style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>High Side Discharge Pressure:</span>
                        <h4 style={{ color: '#EF4444', fontSize: '1.3rem', margin: '0.2rem 0 0 0' }}>{activeScenario.measurements.highPressure}</h4>
                      </div>
                    </div>
                  )}

                  {activeTool === 'thermal' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: '6px', borderLeft: '4px solid #10B981' }}>
                        <span style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>อุณหภูมิลมจ่าย (Supply Air):</span>
                        <h4 style={{ color: '#10B981', fontSize: '1.3rem', margin: '0.2rem 0 0 0' }}>{activeScenario.measurements.supplyTemp}</h4>
                      </div>
                      <div style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: '6px', borderLeft: '4px solid #F59E0B' }}>
                        <span style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>อุณหภูมิลมกลับ (Return Air):</span>
                        <h4 style={{ color: '#F59E0B', fontSize: '1.3rem', margin: '0.2rem 0 0 0' }}>{activeScenario.measurements.returnTemp}</h4>
                      </div>
                      {activeScenario.measurements.condenserFan && (
                        <div style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: '6px', borderLeft: '4px solid #EF4444', gridColumn: 'span 2' }}>
                          <span style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>ตรวจด้วยกล้องความร้อนพัดลมคอนเดนเซอร์:</span>
                          <h4 style={{ color: '#EF4444', fontSize: '1rem', margin: '0.2rem 0 0 0' }}>{activeScenario.measurements.condenserFan}</h4>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Step 2: Diagnostic Hypothesis & Decision */}
                <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle2 size={20} color="var(--accent-ac)" /> สรุปผลวิเคราะห์สาเหตุเชิงวิศวกรรม (Engineering Diagnosis)
                  </h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    {activeScenario.diagnosisOptions.map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => handleSelectDiagnosis(opt)}
                        style={{
                          background: selectedDiagnosis?.id === opt.id ? (opt.correct ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)') : 'var(--bg-primary)',
                          border: `1px solid ${selectedDiagnosis?.id === opt.id ? (opt.correct ? '#10B981' : '#EF4444') : 'var(--border-color)'}`,
                          color: 'var(--text-primary)',
                          padding: '1rem',
                          borderRadius: '8px',
                          textAlign: 'left',
                          cursor: 'pointer',
                          fontSize: '0.95rem',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '0.8rem',
                          transition: 'all 0.2s'
                        }}
                      >
                        {selectedDiagnosis?.id === opt.id ? (
                          opt.correct ? <CheckCircle2 color="#10B981" size={20} style={{ flexShrink: 0 }} /> : <XCircle color="#EF4444" size={20} style={{ flexShrink: 0 }} />
                        ) : (
                          <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid var(--border-color)', flexShrink: 0 }} />
                        )}
                        <div>
                          <div style={{ fontWeight: 'bold', marginBottom: '0.2rem' }}>{opt.label}</div>
                          {selectedDiagnosis?.id === opt.id && (
                            <div style={{ fontSize: '0.85rem', color: opt.correct ? '#10B981' : '#EF4444', marginTop: '0.4rem' }}>
                              {opt.explanation}
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Step 3: Professional Corrective Action Plan (Unlocked if Diagnosis is Correct) */}
                {selectedDiagnosis?.correct && (
                  <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid #10B981' }}>
                    <h3 style={{ fontSize: '1.1rem', color: '#10B981', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Wrench size={20} /> ขั้นตอนการลงมือซ่อมบำรุงตามมาตรฐาน (Standard Operating Protocol)
                    </h3>

                    <div style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginBottom: '0.5rem' }}>
                        ขั้นตอนที่ {currentStepIndex + 1} จาก {activeScenario.repairSteps.length}:
                      </div>
                      <div style={{ fontSize: '1.05rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>
                        {activeScenario.repairSteps[currentStepIndex]}
                      </div>
                    </div>

                    {!isCompleted ? (
                      <button
                        onClick={handleExecuteNextRepairStep}
                        style={{
                          background: '#10B981', color: 'white', border: 'none', padding: '0.8rem 1.8rem', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem'
                        }}
                      >
                        ดำเนินการขั้นตอนถัดไป <ChevronRight size={18} />
                      </button>
                    ) : (
                      <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '1.2rem', borderRadius: '8px', border: '1px solid #10B981', color: '#10B981', fontWeight: 'bold', textAlign: 'center' }}>
                        🎉 การซ่อมบำรุงตามใบแจ้งซ่อมสำเร็จเสร็จสิ้น! ระบบส่งมอบงานกลับสู่สถานะปกติเรียบร้อยแล้ว
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right Column: Industrial Terminal / Event Log Console */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ background: '#0F172A', color: '#38BDF8', padding: '1.2rem', borderRadius: 'var(--radius-md)', border: '1px solid #1E293B', fontFamily: 'monospace', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', height: '100%', minHeight: '400px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94A3B8', borderBottom: '1px solid #1E293B', paddingBottom: '0.6rem', marginBottom: '0.8rem' }}>
                    <Terminal size={16} /> DIAGNOSTIC CONSOLE LOG
                  </div>
                  <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {terminalLogs.map((log, index) => (
                      <div key={index} style={{ wordBreak: 'break-word', color: log.includes('SUCCESS') ? '#4ADE80' : log.includes('WARNING') ? '#FBBF24' : '#38BDF8' }}>
                        {log}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default TroubleshootingSim;
