import React, { useState } from 'react';
import { ArrowLeft, Zap, Printer, CheckCircle, AlertTriangle, Info, Sliders, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { calculateCableSizingAdvanced } from '../utils/engineering/cableSizing';
import Tooltip from '../components/Tooltip';

const LOAD_PRESETS = [
  { id: 'custom', name: '⚙️ กำหนดโหลดเอง (Custom Load)', unit: 'A', value: 20 },
  { id: 'water_heater', name: '🚿 เครื่องทำน้ำอุ่น (4,500W)', unit: 'W', value: 4500 },
  { id: 'ac_18000', name: '❄️ เครื่องปรับอากาศ 18,000 BTU (1,500W)', unit: 'W', value: 1500 },
  { id: 'ac_36000', name: '❄️ เครื่องปรับอากาศ 36,000 BTU (3,000W)', unit: 'W', value: 3000 },
  { id: 'motor_3hp', name: '⚙️ มอเตอร์ไฟฟ้า 3 แรงม้า (2.2 kW / 3HP)', unit: 'HP', value: 3 },
  { id: 'ev_charger', name: '🚗 เครื่องชาร์จรถไฟฟ้า EV Wallbox (7.4 kW)', unit: 'kW', value: 7.4 },
  { id: 'outlet_circuit', name: '🔌 วงจรเต้ารับทั่วไป (16A)', unit: 'A', value: 16 }
];

const CableSizing = () => {
  const navigate = useNavigate();

  // Mode Switcher: 'basic' vs 'advanced'
  const [mode, setMode] = useState('basic');

  // Input states
  const [selectedPreset, setSelectedPreset] = useState('custom');
  const [inputLoad, setInputLoad] = useState('20');
  const [inputUnit, setInputUnit] = useState('A'); // 'A', 'kW', 'W', 'HP'
  const [lengthMeters, setLengthMeters] = useState('20');

  // Advanced Inputs
  const [systemPhase, setSystemPhase] = useState('1P'); // '1P' (220V), '3P' (380V)
  const [cableType, setCableType] = useState('THW'); // 'THW', 'VAF', 'NYY', 'CV', 'VCT'
  const [installMethod, setInstallMethod] = useState('group2'); // 'group2' (ร้อยท่อ), 'group1' (เดินลอย)

  const [result, setResult] = useState(null);

  const handlePresetSelect = (presetId) => {
    setSelectedPreset(presetId);
    const preset = LOAD_PRESETS.find(p => p.id === presetId);
    if (preset && preset.id !== 'custom') {
      setInputLoad(preset.value.toString());
      setInputUnit(preset.unit);
    }
  };

  const calculateCable = (e) => {
    e.preventDefault();
    const calculationResult = calculateCableSizingAdvanced(inputLoad, {
      inputUnit,
      systemPhase,
      cableType,
      installMethod,
      lengthMeters,
      loadName: selectedPreset
    });

    if (calculationResult) {
      setResult(calculationResult);
    }
  };

  const inputStyle = { width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none', fontSize: '1rem' };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      
      {/* Header */}
      <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '0.5rem' }}>
          <ArrowLeft size={24} />
        </button>
        <div style={{ flex: 1 }}>
          <h1 className="text-gradient-solar" style={{ marginBottom: 0, fontSize: '2rem' }}>โปรแกรมคำนวณขนาดสายไฟ & เบรกเกอร์ (วสท.)</h1>
          <p style={{ color: 'var(--text-secondary)' }}>EIT Standard Cable Sizing, Voltage Drop, Ground Wire & Conduit Calculator</p>
        </div>
        <button onClick={() => window.print()} style={{ background: 'var(--accent-secondary)', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Printer size={20} /> พิมพ์เป็น PDF
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem', alignItems: 'flex-start' }}>
        
        {/* INPUT FORM SECTION */}
        <div className="equipment-card no-print" style={{ padding: '1.75rem' }}>
          
          {/* Mode Switcher Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <button 
              onClick={() => setMode('basic')} 
              style={{ 
                flex: 1, padding: '0.65rem', borderRadius: '8px', 
                border: mode === 'basic' ? '2px solid var(--accent-solar)' : '1px solid var(--border-color)', 
                background: mode === 'basic' ? 'rgba(245, 158, 11, 0.15)' : 'var(--bg-primary)', 
                color: mode === 'basic' ? 'var(--accent-solar)' : 'var(--text-secondary)', 
                fontWeight: mode === 'basic' ? 'bold' : 'normal', cursor: 'pointer', fontSize: '0.9rem' 
              }}
            >
              🛠️ โหมดช่าง/ใช้งานทั่วไป (Basic)
            </button>
            <button 
              onClick={() => setMode('advanced')} 
              style={{ 
                flex: 1, padding: '0.65rem', borderRadius: '8px', 
                border: mode === 'advanced' ? '2px solid var(--accent-solar)' : '1px solid var(--border-color)', 
                background: mode === 'advanced' ? 'rgba(245, 158, 11, 0.15)' : 'var(--bg-primary)', 
                color: mode === 'advanced' ? 'var(--accent-solar)' : 'var(--text-secondary)', 
                fontWeight: mode === 'advanced' ? 'bold' : 'normal', cursor: 'pointer', fontSize: '0.9rem' 
              }}
            >
              ⚙️ โหมดวิศวกร (Advanced)
            </button>
          </div>

          <form onSubmit={calculateCable} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Load Preset Selection */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>เลือกโหลดอุปกรณ์สำเร็จรูป</label>
              <select value={selectedPreset} onChange={(e) => handlePresetSelect(e.target.value)} style={inputStyle}>
                {LOAD_PRESETS.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Load Input + Unit Converter */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <label style={{ color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: 'bold' }}>
                  โหลดไฟฟ้าที่ใช้งาน
                </label>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>แปลงหน่วยอัตโนมัติ</span>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '0.5rem' }}>
                <input 
                  type="number" step="0.1" min="0.1"
                  value={inputLoad} onChange={(e) => setInputLoad(e.target.value)} 
                  placeholder="เช่น 18" required style={inputStyle} 
                />
                <select value={inputUnit} onChange={(e) => setInputUnit(e.target.value)} style={inputStyle}>
                  <option value="A">แอมป์ (A)</option>
                  <option value="kW">กิโลวัตต์ (kW)</option>
                  <option value="W">วัตต์ (W)</option>
                  <option value="HP">แรงม้า (HP)</option>
                </select>
              </div>
            </div>

            {/* Cable Length */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                ระยะทางความยาวสาย (เมตร)
                <Tooltip text="ใช้สำหรับคำนวณแรงดันตก (Voltage Drop %)\nมาตรฐาน วสท. กำหนดให้ไม่เกิน 3%" />
              </label>
              <input 
                type="number" min="1" max="1000"
                value={lengthMeters} onChange={(e) => setLengthMeters(e.target.value)} 
                placeholder="เช่น 20" required style={inputStyle} 
              />
            </div>

            {/* Advanced Settings */}
            {mode === 'advanced' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--accent-solar)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Sliders size={16} /> พารามิเตอร์การติดตั้งเชิงวิศวกรรม
                </h4>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>ระบบไฟฟ้า (System Phase)</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button type="button" onClick={() => setSystemPhase('1P')} style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: systemPhase === '1P' ? '2px solid var(--accent-solar)' : '1px solid var(--border-color)', background: systemPhase === '1P' ? 'rgba(245,158,11,0.15)' : 'var(--bg-primary)', color: systemPhase === '1P' ? 'var(--accent-solar)' : 'var(--text-secondary)', cursor: 'pointer' }}>
                      1 Phase (220V)
                    </button>
                    <button type="button" onClick={() => setSystemPhase('3P')} style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: systemPhase === '3P' ? '2px solid var(--accent-solar)' : '1px solid var(--border-color)', background: systemPhase === '3P' ? 'rgba(245,158,11,0.15)' : 'var(--bg-primary)', color: systemPhase === '3P' ? 'var(--accent-solar)' : 'var(--text-secondary)', cursor: 'pointer' }}>
                      3 Phase (380V)
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>ชนิดของสายไฟและฉนวน</label>
                  <select value={cableType} onChange={(e) => setCableType(e.target.value)} style={inputStyle}>
                    <option value="THW">THW (IEC 01) - สายแกนเดียว PVC 70°C</option>
                    <option value="VAF">VAF - สายแบน 2 แกน PVC 70°C (เดินลอย)</option>
                    <option value="NYY">NYY - สายเปลือก 2 ชั้น PVC 70°C (ฝังดิน)</option>
                    <option value="CV">CV / XLPE - สายฉนวนทนความร้อนสูง 90°C</option>
                    <option value="VCT">VCT - สายอ่อนกลม PVC 70°C</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>วิธีการติดตั้ง (กลุ่มการติดตั้ง วสท.)</label>
                  <select value={installMethod} onChange={(e) => setInstallMethod(e.target.value)} style={inputStyle}>
                    <option value="group2">กลุ่ม 2: เดินร้อยท่อในอากาศ (PVC/EMT Conduit)</option>
                    <option value="group1">กลุ่ม 1: เดินลอยในอากาศ (Free Air / Cable Tray)</option>
                  </select>
                </div>
              </div>
            )}

            <button type="submit" style={{ background: 'linear-gradient(135deg, #FFB75E 0%, #ED8F03 100%)', color: 'white', padding: '1rem', borderRadius: '8px', border: 'none', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <Zap size={20} /> คำนวณขนาดสายไฟ & เบรกเกอร์
            </button>
          </form>
        </div>

        {/* RESULTS SECTION */}
        {result && (
          <div className="equipment-card animate-fade-in" style={{ padding: '2rem', background: 'rgba(255, 165, 0, 0.03)', border: '1px solid rgba(255, 165, 0, 0.2)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="text-gradient-solar" style={{ margin: 0, fontSize: '1.5rem' }}>ผลการคำนวณตามมาตรฐาน วสท.</h3>
              <span style={{ padding: '0.3rem 0.75rem', borderRadius: '50px', background: result.isVdPassed ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: result.isVdPassed ? '#10b981' : '#ef4444', fontWeight: 'bold', fontSize: '0.85rem' }}>
                {result.isVdPassed ? '✓ ผ่านเกณฑ์ วสท.' : '⚠️ แรงดันตกเกินเกณฑ์'}
              </span>
            </div>

            {/* Grid of Results */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              
              {/* Phase Cable Size */}
              <div style={{ background: 'var(--bg-tertiary)', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0 0 0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  ⚡ ขนาดสายเฟส ({result.cableType})
                </p>
                <p style={{ fontSize: '2.4rem', fontWeight: 'bold', color: 'var(--accent-solar)', margin: 0 }}>
                  {result.cableSizeStr} <span style={{ fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 'normal' }}>ตร.มม.</span>
                </p>
                {result.upsizedForVd && (
                  <span style={{ fontSize: '0.75rem', color: '#f59e0b', display: 'block', marginTop: '0.3rem' }}>
                    * ปรับขนาดสายเพิ่มจากระยะทางเพื่อควบคุม Voltage Drop
                  </span>
                )}
              </div>

              {/* Breaker Size */}
              <div style={{ background: 'var(--bg-tertiary)', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0 0 0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  🔌 ขนาดเบรกเกอร์ (CB)
                  <Tooltip text={`คำนวณจาก I_load (${result.currentAmps}A) × 1.25\n= ${(result.currentAmps * 1.25).toFixed(1)}A\nแล้วปรับขึ้นเป็นขนาดมาตรฐานถัดไป`} />
                </p>
                <p style={{ fontSize: '2.4rem', fontWeight: 'bold', color: 'white', margin: 0 }}>
                  {result.breakerSize} <span style={{ fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 'normal' }}>AT</span>
                </p>
              </div>

              {/* Ground Wire Size */}
              <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '8px' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: 0 }}>🟢 สายดิน (PE Ground Wire)</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0.2rem 0 0', color: '#10b981' }}>
                  {result.groundWireSize} <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 'normal' }}>ตร.มม.</span>
                </p>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>อ้างอิงตาราง วสท. 5-27</span>
              </div>

              {/* Conduit Size */}
              <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '8px' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: 0 }}>🟡 ท่อร้อยสายไฟที่แนะนำ</p>
                <p style={{ fontSize: '1.3rem', fontWeight: 'bold', margin: '0.2rem 0 0', color: '#f59e0b' }}>
                  {result.conduitSizeStr}
                </p>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>คิดตามเกณฑ์ 40% Fill Rule</span>
              </div>
            </div>

            {/* Voltage Drop & System Summary */}
            <div style={{ background: 'var(--bg-tertiary)', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>กระแสโหลดคำนวณจริง ($I_{load}$):</span>
                <strong style={{ color: 'var(--text-primary)' }}>{result.currentAmps} A</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>แรงดันตกในสาย (Voltage Drop %):</span>
                <strong style={{ color: result.isVdPassed ? '#10b981' : '#ef4444', fontSize: '1.05rem' }}>
                  {result.voltageDropPercent}% ({result.voltageDropVolts} Volts)
                </strong>
              </div>

              <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', borderTop: '1px dashed var(--border-color)', paddingTop: '0.5rem', marginTop: '0.2rem' }}>
                * กำหนดเกณฑ์แรงดันตกวงจรย่อยไม่เกิน 3.0% (ตามข้อกำหนด วสท.) | ความยาวสาย {lengthMeters} เมตร | ระบบ {result.systemPhase} ({result.voltage}V)
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default CableSizing;
