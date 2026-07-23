import { useState } from 'react';
import { 
  ArrowLeft, Wind, ThermometerSnowflake, Activity, Zap, Flame, Eye, Settings, 
  HelpCircle, AlertTriangle, Layers, BarChart2, Cpu, RotateCcw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const refrigerantsData = {
  R32: {
    name: 'R-32 (Difluoromethane)',
    gwp: 675,
    safetyClass: 'A2L (Mildly Flammable)',
    pevapCoeff: (te) => (te + 40) * 0.21 + 3.2,
    pcondCoeff: (tc) => (tc + 40) * 0.45 + 5.0,
    copBase: 4.4,
    color: '#0080FF'
  },
  R410A: {
    name: 'R-410A (Near-Azeotropic Blend)',
    gwp: 2088,
    safetyClass: 'A1 (Non-Flammable)',
    pevapCoeff: (te) => (te + 40) * 0.22 + 3.5,
    pcondCoeff: (tc) => (tc + 40) * 0.48 + 5.5,
    copBase: 4.1,
    color: '#9333EA'
  },
  R134a: {
    name: 'R-134a (Tetrafluoroethane)',
    gwp: 1430,
    safetyClass: 'A1 (Non-Flammable)',
    pevapCoeff: (te) => (te + 40) * 0.11 + 1.2,
    pcondCoeff: (tc) => (tc + 40) * 0.26 + 2.1,
    copBase: 3.8,
    color: '#10B981'
  },
  R290: {
    name: 'R-290 (Propane - Hydrocarbon)',
    gwp: 3,
    safetyClass: 'A3 (Highly Flammable)',
    pevapCoeff: (te) => (te + 40) * 0.14 + 1.8,
    pcondCoeff: (tc) => (tc + 40) * 0.32 + 3.0,
    copBase: 4.6,
    color: '#F59E0B'
  }
};

const componentsDetail = {
  compressor: {
    name: 'คอมเพรสเซอร์ (Compressor)',
    role: 'ดูดไอสารทำความเย็นความดันต่ำจากคอยล์เย็น แล้วอัด (Compress) เพิ่มความดันและอุณหภูมิส่งไปคอยล์ร้อน',
    entryState: 'แก๊สไอความดันต่ำ (Low P / Low T Vapor)',
    exitState: 'แก๊สไอความร้อนสูงความดันสูง (High P / High T Superheated Gas)',
    troubleshooting: 'หากกระแสไฟฟ้าพุ่งสูง (Overamp) อาจเกิดจากคอยล์ร้อนระบายความร้อนไม่ออก หรือน้ำยาเหลวไหลกลับเข้าคอมฯ (Liquid Slugging) ทำให้ลิ้นวาล์วพัง',
    color: '#EF4444'
  },
  condenser: {
    name: 'คอยล์ร้อน & พัดลม (Condenser & Fan)',
    role: 'ดึงความร้อนออกจากแก๊สสารทำความเย็นทิ้งสู่บรรยากาศภายนอก ทำให้น้ำยาเปลี่ยนสถานะเป็นของเหลวแรงดันสูง',
    entryState: 'แก๊สไอร้อนความดันสูง (Superheated Gas)',
    exitState: 'ของเหลวความดันสูงอุณหภูมิปานกลาง (Subcooled Liquid)',
    troubleshooting: 'หากครีบฟินฝุ่นตัน หรือพัดลมพัง ความดัน High Side จะพุ่งสูงจัด (High Pressure Trip) ทำให้อินเวอร์เตอร์หรือเบรกเกอร์ตัดการทำงาน',
    color: '#F59E0B'
  },
  receiver: {
    name: 'ถังพักน้ำยาเหลว & กระเปาะส่อง (Receiver & Sight Glass)',
    role: 'สำรองปริมาณสารทำความเย็นเหลวให้เพียงพอต่อการเปลี่ยนแปลงโหลด และส่องดูฟองอากาศเพื่อเช็คน้ำยาขาด/ความชื้น',
    entryState: 'ของเหลวความดันสูง',
    exitState: 'ของเหลวล้วนไม่มีฟอง (Pure Liquid)',
    troubleshooting: 'หากเห็นฟองอากาศวิ่งใน Sight Glass ตลอดเวลา แปลว่าน้ำยาในระบบขาด หรือ Filter Drier อุดตันกึ่งหนึ่ง',
    color: '#EAB308'
  },
  drier: {
    name: 'ฟิลเตอร์ดรายเออร์ (Filter Drier)',
    role: 'ดักกรองเศษสิ่งสกปรกและดูดซับความชื้นในระบบน้ำยา เพื่อป้องกันการเกิดน้ำแข็งอุดตันที่วาล์วฉีด',
    entryState: 'ของเหลวความดันสูง',
    exitState: 'ของเหลวบริสุทธิ์ไร้ความชื้น',
    troubleshooting: 'หากลองจับท่อทางเข้าและทางออกของ Drier แล้วพบว่ามีความแตกต่างของอุณหภูมิ (ทางออกเย็นกว่า) แสดงว่า Drier เริ่มอุดตันแล้ว',
    color: '#10B981'
  },
  txv: {
    name: 'เอ็กซ์แพนชันวาล์ว (Thermostatic Expansion Valve - TXV)',
    role: 'ลดความดันของสารทำความเย็นเหลวฉับพลัน พร้อมฉีดพ่นให้กลายเป็นฝอยละอองอุณหภูมิติดลบก่อนเข้าคอยล์เย็น',
    entryState: 'ของเหลวความดันสูง (High P Liquid)',
    exitState: 'ละอองของผสมเหลว-ไอ ความดันต่ำ อุณหภูมิเย็นจัด (Low P Cold Mixture)',
    troubleshooting: 'หากกระเปาะเซนเซอร์ (Sensing Bulb) หลุดจากท่อซัคชัน วาล์วจะเปิดกว้างผิดปกติ ทำให้น้ำยาเหลวหลุดไปเข้าคอมเพรสเซอร์',
    color: '#06B6D4'
  },
  evaporator: {
    name: 'คอยล์เย็น & พัดลมโบวเวอร์ (Evaporator & Blower)',
    role: 'ดึงความร้อนจากอากาศในห้องเข้าสู่สารทำความเย็น ทำให้อากาศที่พัดผ่านเย็นลงและสารทำความเย็นเดือดกลายเป็นไอ',
    entryState: 'ละอองของผสมเย็นจัดความดันต่ำ',
    exitState: 'ไอแก๊สซูเปอร์ฮีตความดันต่ำ (Superheated Vapor)',
    troubleshooting: 'หากฟิลเตอร์ตันหรือลมผ่านน้อย สารทำความเย็นจะไม่ระเหยและเกิดน้ำแข็งเกาะหนาบนแผงคอยล์เย็น',
    color: '#3B82F6'
  },
  accumulator: {
    name: 'ถังดักน้ำยาเหลว (Suction Accumulator)',
    role: 'กักน้ำยาเหลวที่ยังระเหยไม่หมด ไม่ให้หลุดเข้าไปในคอมเพรสเซอร์ (คอมฯ อัดได้เฉพาะแก๊สเท่านั้น)',
    entryState: 'ไอน้ำยาอาจมีหยดน้ำยาเหลวปน',
    exitState: 'แก๊สไอล้วน 100%',
    troubleshooting: 'จำเป็นมากในระบบฮีตปั๊มหรือระบบที่มีการเปลี่ยนแปลงโหลดรวดเร็ว เพื่อป้องกันคอมเพรสเซอร์น็อค',
    color: '#8B5CF6'
  }
};

const InteractiveSchematic = () => {
  const navigate = useNavigate();
  const [selectedRef, setSelectedRef] = useState('R32');
  const [tEvap, setTEvap] = useState(5); // °C
  const [tCond, setTCond] = useState(45); // °C
  const [superheat, setSuperheat] = useState(5); // K
  const [subcooling, setSubcooling] = useState(3); // K
  const [activeTab, setActiveTab] = useState('schematic'); // 'schematic' | 'phDiagram'
  const [selectedComponent, setSelectedComponent] = useState('compressor');

  // Calculations
  const currentRef = refrigerantsData[selectedRef];
  const pEvapBar = Math.max(1.2, currentRef.pevapCoeff(tEvap)).toFixed(2);
  const pCondBar = Math.max(pEvapBar * 1.5, currentRef.pcondCoeff(tCond)).toFixed(2);
  const pRatio = (pCondBar / pEvapBar).toFixed(2);
  
  // Dynamic COP calculation
  const tempDiff = Math.max(15, tCond - tEvap);
  const cop = (currentRef.copBase * (40 / tempDiff) * (1 - (superheat + subcooling) * 0.01)).toFixed(2);

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      <style>{`
        .pipe-flow-hot { stroke-dasharray: 8; animation: flowFast 0.8s linear infinite; }
        .pipe-flow-liquid { stroke-dasharray: 6; animation: flowFast 1.2s linear infinite; }
        .pipe-flow-cold { stroke-dasharray: 8; animation: flowFast 1s linear infinite; }
        @keyframes flowFast {
          from { stroke-dashoffset: 32; }
          to { stroke-dashoffset: 0; }
        }
      `}</style>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '0.5rem' }}>
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-gradient-ac" style={{ marginBottom: '0.2rem', fontSize: '2rem' }}>จำลองวัฏจักรความเย็นเชิงวิศวกรรม</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Thermodynamic Refrigeration Cycle & P-h Mollier Simulator</p>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Top Control Bar: Refrigerant & Mode Tabs */}
        <div style={{ background: 'var(--bg-secondary)', padding: '1.2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          
          {/* Refrigerant Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 'bold', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Flame color="var(--accent-solar)" size={18} /> สารทำความเย็น:
            </span>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              {Object.keys(refrigerantsData).map((refKey) => (
                <button
                  key={refKey}
                  onClick={() => setSelectedRef(refKey)}
                  style={{
                    background: selectedRef === refKey ? refrigerantsData[refKey].color : 'var(--bg-primary)',
                    color: selectedRef === refKey ? 'white' : 'var(--text-primary)',
                    border: `1px solid ${selectedRef === refKey ? refrigerantsData[refKey].color : 'var(--border-color)'}`,
                    padding: '0.4rem 0.9rem',
                    borderRadius: '20px',
                    fontWeight: 'bold',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {refKey}
                </button>
              ))}
            </div>
          </div>

          {/* View Mode Switcher (Schematic vs P-h Diagram) */}
          <div style={{ display: 'flex', background: 'var(--bg-primary)', padding: '0.3rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <button
              onClick={() => setActiveTab('schematic')}
              style={{
                background: activeTab === 'schematic' ? 'var(--accent-primary)' : 'transparent',
                color: activeTab === 'schematic' ? 'white' : 'var(--text-secondary)',
                border: 'none',
                padding: '0.5rem 1.2rem',
                borderRadius: '6px',
                fontWeight: 'bold',
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <Activity size={18} /> แผนภาพระบบ (Schematic Flow)
            </button>
            <button
              onClick={() => setActiveTab('phDiagram')}
              style={{
                background: activeTab === 'phDiagram' ? 'var(--accent-primary)' : 'transparent',
                color: activeTab === 'phDiagram' ? 'white' : 'var(--text-secondary)',
                border: 'none',
                padding: '0.5rem 1.2rem',
                borderRadius: '6px',
                fontWeight: 'bold',
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <BarChart2 size={18} /> กราฟ P-h Mollier Diagram
            </button>
          </div>
        </div>

        {/* Operating Conditions Sliders & Calculated Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          
          {/* Slider 1: Evaporating Temp */}
          <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>อุณหภูมิเดือดคอยล์เย็น ($T_{evap}$):</span>
              <strong style={{ color: '#3B82F6' }}>{tEvap} °C</strong>
            </div>
            <input 
              type="range" min="-15" max="12" step="1" value={tEvap} 
              onChange={(e) => setTEvap(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#3B82F6' }}
            />
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.3rem' }}>
              แรงดัน $P_{evap}$: {pEvapBar} bar (abs)
            </div>
          </div>

          {/* Slider 2: Condensing Temp */}
          <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>อุณหภูมิควบแน่นคอยล์ร้อน ($T_{cond}$):</span>
              <strong style={{ color: '#EF4444' }}>{tCond} °C</strong>
            </div>
            <input 
              type="range" min="30" max="65" step="1" value={tCond} 
              onChange={(e) => setTCond(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#EF4444' }}
            />
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.3rem' }}>
              แรงดัน $P_{cond}$: {pCondBar} bar (abs)
            </div>
          </div>

          {/* Calculated Metrics Cards */}
          <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>อัตราส่วนความดัน (PR)</span>
              <h3 style={{ margin: '0.2rem 0 0 0', color: 'var(--text-primary)', fontSize: '1.3rem' }}>{pRatio}</h3>
            </div>
            <div style={{ height: '30px', width: '1px', background: 'var(--border-color)' }} />
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>ประสิทธิภาพระบบ (COP)</span>
              <h3 style={{ margin: '0.2rem 0 0 0', color: Number(cop) > 4.0 ? '#10B981' : '#F59E0B', fontSize: '1.4rem', fontWeight: 'bold' }}>{cop}</h3>
            </div>
          </div>

        </div>

        {/* Main Display Box (Schematic OR P-h Diagram) */}
        <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', position: 'relative', overflow: 'hidden' }}>
          
          {activeTab === 'schematic' ? (
            <div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '1rem' }}>
                💡 คลิกที่อุปกรณ์ในวงจรเพื่อดูการเปลี่ยนแปลงสถานะน้ำยา และคู่มือวิเคราะห์อาการเสียหน้างานจริง
              </p>

              {/* Animated Interactive SVG Schematic */}
              <div style={{ position: 'relative', width: '100%', height: '420px', background: '#0F172A', borderRadius: '12px', border: '1px solid #1E293B', padding: '1rem' }}>
                <svg width="100%" height="100%" viewBox="0 0 900 380" style={{ overflow: 'visible' }}>
                  
                  {/* Pipelines with animated flow */}
                  {/* 1. Compressor Discharge -> Condenser (Hot Superheated Gas - Red) */}
                  <path d="M 520 280 L 720 280 L 720 140" stroke="#EF4444" strokeWidth="6" fill="none" className="pipe-flow-hot" />
                  
                  {/* 2. Condenser -> Receiver -> Drier -> TXV (Subcooled Liquid - Orange/Yellow) */}
                  <path d="M 720 80 L 520 80 L 520 60 L 380 60" stroke="#F59E0B" strokeWidth="6" fill="none" className="pipe-flow-liquid" />
                  
                  {/* 3. TXV -> Evaporator (Low P Cold Liquid/Vapor - Cyan) */}
                  <path d="M 280 60 L 140 60 L 140 160" stroke="#06B6D4" strokeWidth="6" fill="none" className="pipe-flow-cold" />

                  {/* 4. Evaporator -> Accumulator -> Compressor (Low P Suction Vapor - Blue) */}
                  <path d="M 140 240 L 140 330 L 440 330 L 440 300" stroke="#3B82F6" strokeWidth="6" fill="none" className="pipe-flow-cold" />

                  {/* COMPONENT 1: Compressor */}
                  <g onClick={() => setSelectedComponent('compressor')} style={{ cursor: 'pointer' }}>
                    <rect x="440" y="240" width="90" height="70" rx="10" fill={selectedComponent === 'compressor' ? '#EF4444' : '#1E293B'} stroke="#EF4444" strokeWidth="3" />
                    <text x="485" y="275" fill="white" fontSize="12" textAnchor="middle" fontWeight="bold">Compressor</text>
                    <text x="485" y="295" fill="#EF4444" fontSize="10" textAnchor="middle">อัดไอร้อน</text>
                  </g>

                  {/* COMPONENT 2: Condenser */}
                  <g onClick={() => setSelectedComponent('condenser')} style={{ cursor: 'pointer' }}>
                    <rect x="670" y="60" width="100" height="80" rx="10" fill={selectedComponent === 'condenser' ? '#F59E0B' : '#1E293B'} stroke="#F59E0B" strokeWidth="3" />
                    <text x="720" y="95" fill="white" fontSize="12" textAnchor="middle" fontWeight="bold">Condenser</text>
                    <text x="720" y="115" fill="#F59E0B" fontSize="10" textAnchor="middle">ระบายความร้อน</text>
                  </g>

                  {/* COMPONENT 3: Receiver & Sight Glass */}
                  <g onClick={() => setSelectedComponent('receiver')} style={{ cursor: 'pointer' }}>
                    <rect x="480" y="35" width="70" height="50" rx="8" fill={selectedComponent === 'receiver' ? '#EAB308' : '#1E293B'} stroke="#EAB308" strokeWidth="2" />
                    <text x="515" y="60" fill="white" fontSize="10" textAnchor="middle">Receiver</text>
                    <circle cx="515" cy="72" r="4" fill="#EAB308" />
                  </g>

                  {/* COMPONENT 4: Filter Drier */}
                  <g onClick={() => setSelectedComponent('drier')} style={{ cursor: 'pointer' }}>
                    <rect x="380" y="42" width="60" height="36" rx="6" fill={selectedComponent === 'drier' ? '#10B981' : '#1E293B'} stroke="#10B981" strokeWidth="2" />
                    <text x="410" y="64" fill="white" fontSize="10" textAnchor="middle">Drier</text>
                  </g>

                  {/* COMPONENT 5: TXV (Expansion Valve) */}
                  <g onClick={() => setSelectedComponent('txv')} style={{ cursor: 'pointer' }}>
                    <polygon points="280,45 320,60 280,75 320,45 280,60" fill={selectedComponent === 'txv' ? '#06B6D4' : '#1E293B'} stroke="#06B6D4" strokeWidth="3" />
                    <text x="300" y="92" fill="#06B6D4" fontSize="11" textAnchor="middle" fontWeight="bold">TXV Valve</text>
                  </g>

                  {/* COMPONENT 6: Evaporator */}
                  <g onClick={() => setSelectedComponent('evaporator')} style={{ cursor: 'pointer' }}>
                    <rect x="90" y="150" width="100" height="90" rx="10" fill={selectedComponent === 'evaporator' ? '#3B82F6' : '#1E293B'} stroke="#3B82F6" strokeWidth="3" />
                    <text x="140" y="190" fill="white" fontSize="12" textAnchor="middle" fontWeight="bold">Evaporator</text>
                    <text x="140" y="210" fill="#3B82F6" fontSize="10" textAnchor="middle">ดูดความร้อนในห้อง</text>
                  </g>

                  {/* COMPONENT 7: Suction Accumulator */}
                  <g onClick={() => setSelectedComponent('accumulator')} style={{ cursor: 'pointer' }}>
                    <rect x="220" y="295" width="50" height="70" rx="15" fill={selectedComponent === 'accumulator' ? '#8B5CF6' : '#1E293B'} stroke="#8B5CF6" strokeWidth="2" />
                    <text x="245" y="335" fill="white" fontSize="9" textAnchor="middle">Accumulator</text>
                  </g>
                </svg>
              </div>
            </div>
          ) : (
            /* Mode 2: P-h Mollier Curve Graph View */
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                แผนภาพความดัน-เอนทัลปี (Pressure-Enthalpy P-h Mollier Diagram)
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                เส้นโดมแสดงสภาวะอิ่มตัว (Saturation Dome) ของสารทำความเย็น {selectedRef} และวัฏจักร 4 ขั้นตอน
              </p>

              <div style={{ position: 'relative', width: '100%', height: '380px', background: '#0F172A', borderRadius: '12px', border: '1px solid #1E293B', padding: '1rem' }}>
                <svg width="100%" height="100%" viewBox="0 0 800 320">
                  
                  {/* Saturation Dome Path */}
                  <path d="M 100 280 Q 400 40 700 280" stroke="#64748B" strokeWidth="3" fill="none" strokeDasharray="4,4" />
                  <text x="400" y="45" fill="#94A3B8" fontSize="11" textAnchor="middle">Critical Point</text>
                  <text x="180" y="200" fill="#94A3B8" fontSize="10">Liquid Region</text>
                  <text x="400" y="180" fill="#64748B" fontSize="12" textAnchor="middle">Two-Phase (Liquid + Vapor Dome)</text>
                  <text x="620" y="200" fill="#94A3B8" fontSize="10">Superheated Vapor</text>

                  {/* Cycle Lines (State 1 -> 2 -> 3 -> 4 -> 1) */}
                  {/* State 1 (Suction) to State 2 (Discharge Compressor Work) */}
                  <line x1="560" y1="230" x2="660" y2="100" stroke="#EF4444" strokeWidth="4" />
                  
                  {/* State 2 to State 3 (Condenser Heat Rejection) */}
                  <line x1="660" y1="100" x2="280" y2="100" stroke="#F59E0B" strokeWidth="4" />

                  {/* State 3 to State 4 (Expansion Valve Isoenthalpic Drop) */}
                  <line x1="280" y1="100" x2="280" y2="230" stroke="#06B6D4" strokeWidth="4" />

                  {/* State 4 to State 1 (Evaporator Heat Absorption) */}
                  <line x1="280" y1="230" x2="560" y2="230" stroke="#3B82F6" strokeWidth="4" />

                  {/* State Points Nodes */}
                  <circle cx="560" cy="230" r="7" fill="#3B82F6" />
                  <text x="575" y="245" fill="white" fontSize="11" fontWeight="bold">State 1 (Suction Vapor)</text>

                  <circle cx="660" cy="100" r="7" fill="#EF4444" />
                  <text x="675" y="95" fill="white" fontSize="11" fontWeight="bold">State 2 (Discharge Gas)</text>

                  <circle cx="280" cy="100" r="7" fill="#F59E0B" />
                  <text x="210" y="90" fill="white" fontSize="11" fontWeight="bold">State 3 (Subcooled Liquid)</text>

                  <circle cx="280" cy="230" r="7" fill="#06B6D4" />
                  <text x="200" y="245" fill="white" fontSize="11" fontWeight="bold">State 4 (Cold Mixture)</text>

                  {/* Axes */}
                  <line x1="80" y1="290" x2="740" y2="290" stroke="#475569" strokeWidth="2" />
                  <text x="410" y="312" fill="#94A3B8" fontSize="11" textAnchor="middle">Enthalpy h (kJ/kg)</text>

                  <line x1="80" y1="290" x2="80" y2="30" stroke="#475569" strokeWidth="2" />
                  <text x="40" y="160" fill="#94A3B8" fontSize="11" textAnchor="middle" transform="rotate(-90,40,160)">Pressure P (bar)</text>
                </svg>
              </div>
            </div>
          )}

        </div>

        {/* Selected Component Information Panel */}
        {selectedComponent && (
          <div className="equipment-card animate-fade-in" style={{ padding: '1.8rem', background: 'var(--bg-secondary)', borderLeft: `5px solid ${componentsDetail[selectedComponent].color}`, borderRadius: 'var(--radius-md)' }}>
            <h3 style={{ fontSize: '1.3rem', color: componentsDetail[selectedComponent].color, marginBottom: '0.8rem' }}>
              🔍 {componentsDetail[selectedComponent].name}
            </h3>

            <p style={{ color: 'var(--text-primary)', lineHeight: '1.6', marginBottom: '1.2rem', fontSize: '1.05rem' }}>
              {componentsDetail[selectedComponent].role}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.2rem' }}>
              <div style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                <span style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>สถานะสารทำความเย็นฝั่งเข้า (Entry State):</span>
                <div style={{ color: 'var(--text-primary)', fontWeight: 'bold', marginTop: '0.2rem', fontSize: '0.95rem' }}>
                  {componentsDetail[selectedComponent].entryState}
                </div>
              </div>
              <div style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                <span style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>สถานะสารทำความเย็นฝั่งออก (Exit State):</span>
                <div style={{ color: 'var(--text-primary)', fontWeight: 'bold', marginTop: '0.2rem', fontSize: '0.95rem' }}>
                  {componentsDetail[selectedComponent].exitState}
                </div>
              </div>
            </div>

            <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '6px', borderLeft: '3px solid #EF4444' }}>
              <h4 style={{ color: '#EF4444', margin: '0 0 0.4rem 0', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <AlertTriangle size={16} /> การวิเคราะห์อาการเสียและการตรวจเช็คหน้างาน (Field Troubleshooting):
              </h4>
              <p style={{ color: 'var(--text-primary)', lineHeight: '1.5', margin: 0, fontSize: '0.9rem' }}>
                {componentsDetail[selectedComponent].troubleshooting}
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default InteractiveSchematic;
