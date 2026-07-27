import React, { useState } from 'react';
import { ArrowLeft, Zap, CheckCircle, AlertTriangle, Printer, Sliders, Layers, ArrowDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CABLE_AC_SPECS, calculateVoltageDropAdvanced } from '../utils/engineering/voltageDrop';
import Tooltip from '../components/Tooltip';

const VoltageDrop = () => {
  const navigate = useNavigate();

  // Mode Switcher: 'basic' vs 'advanced'
  const [mode, setMode] = useState('basic');

  // Basic Inputs
  const [phase, setPhase] = useState('1'); // '1' (230V) or '3' (400V)
  const [current, setCurrent] = useState(''); // Amps
  const [distance, setDistance] = useState(''); // meters
  const [cableSize, setCableSize] = useState('4'); // sq.mm

  // Advanced Inputs
  const [material, setMaterial] = useState('Cu'); // 'Cu' or 'Al'
  const [conduitType, setConduitType] = useState('pvc'); // 'pvc' or 'emt'
  const [powerFactor, setPowerFactor] = useState('0.85');
  const [circuitType, setCircuitType] = useState('branch'); // 'branch', 'feeder', 'combined'
  const [parallelConductors, setParallelConductors] = useState('1');

  const [result, setResult] = useState(null);

  const availableSizes = Object.keys(CABLE_AC_SPECS[material] || CABLE_AC_SPECS.Cu);

  const calculateVD = (e) => {
    e.preventDefault();
    const calculationResult = calculateVoltageDropAdvanced(phase, current, distance, cableSize, {
      material,
      conduitType,
      powerFactor,
      circuitType,
      parallelConductors
    });

    if (!calculationResult) {
      alert("กรุณากรอกกระแสและระยะทางให้ถูกต้อง (ตัวเลขมากกว่า 0)");
      return;
    }
    setResult(calculationResult);
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
          <h1 className="text-gradient-solar" style={{ marginBottom: 0, fontSize: '2rem' }}>คำนวณแรงดันตกตามมาตรฐาน วสท. (AC Voltage Drop)</h1>
          <p style={{ color: 'var(--text-secondary)' }}>AC Impedance (R & X), Material, Power Factor, and Auto-Correction Cable Sizing</p>
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
              🛠️ โหมดอย่างง่าย (Basic)
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

          <form onSubmit={calculateVD} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* System Phase */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>ระบบไฟฟ้า</label>
              <select value={phase} onChange={(e) => setPhase(e.target.value)} style={inputStyle}>
                <option value="1">1 Phase (230V)</option>
                <option value="3">3 Phase (400V)</option>
              </select>
            </div>

            {/* Current & Distance */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>กระแสโหลด (A)</label>
                <input type="number" step="0.1" value={current} onChange={(e) => setCurrent(e.target.value)} required placeholder="เช่น 20" style={inputStyle} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>ระยะทางสาย (เมตร)</label>
                <input type="number" step="0.5" value={distance} onChange={(e) => setDistance(e.target.value)} required placeholder="เช่น 50" style={inputStyle} />
              </div>
            </div>

            {/* Cable Size */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                ขนาดสายไฟ ({material === 'Cu' ? 'ทองแดง Cu' : 'อลูมิเนียม Al'})
              </label>
              <select value={cableSize} onChange={(e) => setCableSize(e.target.value)} style={inputStyle}>
                {availableSizes.map(size => (
                  <option key={size} value={size}>{size} sq.mm ({material === 'Cu' ? 'ทองแดง' : 'อลูมิเนียม'})</option>
                ))}
              </select>
            </div>

            {/* Advanced Settings */}
            {mode === 'advanced' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--accent-solar)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Sliders size={16} /> พารามิเตอร์สายไฟ & ท่อร้อยสายเชิงลึก
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>ชนิดตัวนำ (Conductor)</label>
                    <select value={material} onChange={(e) => { setMaterial(e.target.value); setCableSize(e.target.value === 'Al' ? '10' : '4'); }} style={inputStyle}>
                      <option value="Cu">ทองแดง (Copper - Cu)</option>
                      <option value="Al">อลูมิเนียม (Aluminum - Al)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>ชนิดท่อร้อยสาย</label>
                    <select value={conduitType} onChange={(e) => setConduitType(e.target.value)} style={inputStyle}>
                      <option value="pvc">ท่ออโลหะ (PVC / PE)</option>
                      <option value="emt">ท่อโลหะเหล็ก (EMT / IMC)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Power Factor ($\cos\theta$)</label>
                    <input type="number" step="0.01" value={powerFactor} onChange={(e) => setPowerFactor(e.target.value)} placeholder="0.85" style={inputStyle} />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>ประเภทวงจร (Limit)</label>
                    <select value={circuitType} onChange={(e) => setCircuitType(e.target.value)} style={inputStyle}>
                      <option value="branch">วงจรย่อย (Branch - Max 3%)</option>
                      <option value="feeder">สายป้อน (Feeder - Max 3%)</option>
                      <option value="combined">รวมทั้งระบบ (Combined - Max 5%)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>จำนวนสายขนานต่อเฟส (N เส้น/เฟส)</label>
                  <input type="number" min="1" max="6" value={parallelConductors} onChange={(e) => setParallelConductors(e.target.value)} placeholder="1" style={inputStyle} />
                </div>
              </div>
            )}

            <button type="submit" style={{ background: 'linear-gradient(135deg, #FFB75E 0%, #ED8F03 100%)', color: 'white', padding: '1rem', borderRadius: '8px', border: 'none', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <Zap size={20} /> คำนวณ Voltage Drop
            </button>
          </form>
        </div>

        {/* RESULTS SECTION */}
        {result && (
          <div className="equipment-card animate-fade-in" style={{ padding: '2rem', background: 'rgba(255, 165, 0, 0.03)', border: `1px solid ${result.isPass ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="text-gradient-solar" style={{ margin: 0, fontSize: '1.5rem' }}>ผลการคำนวณแรงดันตก</h3>
              <span style={{ padding: '0.35rem 0.85rem', borderRadius: '50px', background: result.isPass ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: result.isPass ? '#10b981' : '#ef4444', fontWeight: 'bold', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                {result.isPass ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                {result.isPass ? `ผ่านเกณฑ์ วสท. (< ${result.maxAllowedPercent}%)` : `เกินเกณฑ์มาตรฐาน (> ${result.maxAllowedPercent}%)`}
              </span>
            </div>

            {/* Grid of Results */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              
              {/* Voltage Drop % */}
              <div style={{ background: 'var(--bg-tertiary)', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0 0 0.4rem' }}>เปอร์เซ็นต์แรงดันตก (% Voltage Drop)</p>
                <p style={{ fontSize: '2.4rem', fontWeight: 'bold', color: result.isPass ? '#10b981' : '#ef4444', margin: 0 }}>
                  {result.percent} <span style={{ fontSize: '1.2rem', fontWeight: 'normal' }}>%</span>
                </p>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>เกณฑ์ยอมรับสูงสุด: {result.maxAllowedPercent}%</span>
              </div>

              {/* Voltage Drop Volts */}
              <div style={{ background: 'var(--bg-tertiary)', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0 0 0.4rem' }}>แรงดันตกคร่อมสาย (V_drop)</p>
                <p style={{ fontSize: '2.2rem', fontWeight: 'bold', color: 'var(--accent-solar)', margin: 0 }}>
                  {result.dropV} <span style={{ fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 'normal' }}>Volts</span>
                </p>
              </div>

              {/* Receiving Voltage */}
              <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '8px', gridColumn: '1 / -1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>⚡ แรงดันไฟฟ้าปลายทาง (Receiving End Voltage)</p>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>จากต้นทาง {result.voltage} V</span>
                </div>
                <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'white', margin: 0 }}>
                  {result.receivingVoltage} <span style={{ fontSize: '1rem', fontWeight: 'normal' }}>V</span>
                </p>
              </div>
            </div>

            {/* Auto-Correction Sizing Recommendation Banner */}
            {!result.isPass && result.autoRecommendedSize && (
              <div style={{ padding: '1.25rem', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(239, 68, 68, 0.15) 100%)', border: '1px solid #f59e0b', borderRadius: '10px', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <div style={{ background: '#f59e0b', color: 'white', padding: '0.5rem', borderRadius: '50%', flexShrink: 0, marginTop: '0.2rem' }}>
                  <ArrowDown size={20} />
                </div>
                <div>
                  <h4 style={{ margin: 0, color: '#f59e0b', fontSize: '1.05rem' }}>💡 ระบบแนะนำขนาดสายไฟใหม่ (Auto-Correction Sizing)</h4>
                  <p style={{ margin: '0.4rem 0 0', fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: '1.5' }}>
                    แนะนำให้เพิ่มขนาดสายเป็น <strong style={{ color: 'var(--accent-solar)', fontSize: '1.1rem' }}>{result.autoRecommendedSize} sq.mm</strong> เพื่อให้แรงดันตกเหลือเพียง <strong style={{ color: '#10b981', fontSize: '1.1rem' }}>{result.autoRecommendedPercent}%</strong> (ผ่านเกณฑ์มาตรฐาน วสท. ทันที!)
                  </p>
                </div>
              </div>
            )}

            {/* Technical Context Summary */}
            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>
              * อ้างอิงสูตร วสท. กระแสสลับ AC Impedance ($R \cos\theta + X \sin\theta$) | ตัวนำ {result.material === 'Cu' ? 'ทองแดง (Cu)' : 'อลูมิเนียม (Al)'} | ท่อ {result.conduitType === 'pvc' ? 'อโลหะ PVC' : 'ท่อเหล็ก EMT'} | Power Factor {result.powerFactor} | สายขนาน {result.parallelConductors} เส้น/เฟส
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default VoltageDrop;
