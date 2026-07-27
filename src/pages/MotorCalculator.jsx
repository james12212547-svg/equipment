import React, { useState, useMemo } from 'react';
import { ArrowLeft, Settings, Info, CheckCircle, Zap, ShieldAlert, Cpu, Printer, Sliders, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BREAKER_SIZES } from '../constants/engineeringConstants';
import Tooltip from '../components/Tooltip';

const CABLE_AMPACITY_THW = [
  { size: 1.5, amps: 15 },
  { size: 2.5, amps: 21 },
  { size: 4, amps: 28 },
  { size: 6, amps: 36 },
  { size: 10, amps: 50 },
  { size: 16, amps: 68 },
  { size: 25, amps: 89 },
  { size: 35, amps: 111 },
  { size: 50, amps: 134 },
  { size: 70, amps: 171 },
  { size: 95, amps: 207 },
  { size: 120, amps: 239 },
  { size: 150, amps: 272 },
  { size: 185, amps: 310 },
  { size: 240, amps: 364 },
];

const STANDARD_CONTACTOR_SIZES = [9, 12, 18, 25, 32, 38, 40, 50, 65, 80, 95, 115, 150, 185, 225, 265, 300];

const MOTOR_IE_CLASSES = {
  IE1: { name: 'IE1 (Standard Efficiency - มอเตอร์ทั่วไป)', eff: 0.85, pf: 0.82 },
  IE2: { name: 'IE2 (High Efficiency - มอเตอร์ประสิทธิภาพสูง)', eff: 0.88, pf: 0.84 },
  IE3: { name: 'IE3 (Premium Efficiency - มอเตอร์พรีเมียม)', eff: 0.91, pf: 0.86 },
  IE4: { name: 'IE4 (Super Premium Efficiency - ซูเปอร์พรีเมียม)', eff: 0.93, pf: 0.88 }
};

const MotorCalculator = () => {
  const navigate = useNavigate();
  const [motorPower, setMotorPower] = useState(5.5);
  const [powerUnit, setPowerUnit] = useState('kW'); // kW or HP
  const [phase, setPhase] = useState('3'); // 1 or 3
  const [voltage, setVoltage] = useState(380); // 220, 380, 400
  const [starterType, setStarterType] = useState('DOL'); // DOL or YD

  // Advanced Inputs
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [ieClass, setIeClass] = useState('IE1');

  const activeIe = MOTOR_IE_CLASSES[ieClass] || MOTOR_IE_CLASSES.IE1;
  const pf = activeIe.pf;
  const eff = activeIe.eff;

  const result = useMemo(() => {
    let kw = powerUnit === 'HP' ? motorPower * 0.746 : motorPower;
    if (kw <= 0) return null;

    // Calculate Full Load Current (In / FLA)
    let In = 0;
    if (phase === '1') {
      In = (kw * 1000) / (voltage * pf * eff);
    } else {
      In = (kw * 1000) / (Math.sqrt(3) * voltage * pf * eff);
    }
    
    if (In > 1000) return null;

    // Breaker Size (1.5x - 2.5x In for MCCB)
    const minBreaker = In * 1.5;
    let recommendedBreaker = BREAKER_SIZES.find(b => b >= minBreaker) || Math.ceil(minBreaker);

    // EIT Cable Sizing (Capacity >= 1.25 * In AND Minimum size >= 2.5 sq.mm for Motor Power Circuits)
    const getCableSize = (current) => {
      const targetAmps = current * 1.25;
      const cable = CABLE_AMPACITY_THW.find(c => c.amps >= targetAmps);
      let size = cable ? cable.size : '>240';
      if (typeof size === 'number' && size < 2.5) {
        size = 2.5; // Enforce EIT minimum 2.5 sq.mm for motor branch circuit!
      }
      return size;
    };

    // Helper for standard contactor selection
    const getContactorRating = (current) => {
      return STANDARD_CONTACTOR_SIZES.find(c => c >= current) || Math.ceil(current);
    };

    let details = {};

    if (starterType === 'DOL') {
      const mainContactorRating = getContactorRating(In);
      details = {
        mainContactor: In,
        mainContactorRating,
        olrSetting: In,
        olrRange: `${(In * 0.8).toFixed(1)} - ${(In * 1.2).toFixed(1)} A`,
        cableSize: getCableSize(In),
        cableQty: phase === '1' ? 2 : 3 // L,N or L1,L2,L3
      };
    } else {
      // Star-Delta Sizing:
      // Main (KM1) & Delta (KM2): 58% of In (In / √3)
      // Star (KM3): 33% of In (In / 3)
      const In_delta = In / Math.sqrt(3); // 58%
      const In_star = In / 3; // 33%
      
      const mainContactorRating = getContactorRating(In_delta);
      const deltaContactorRating = getContactorRating(In_delta);
      const starContactorRating = getContactorRating(In_star);

      details = {
        mainContactor: In_delta,
        mainContactorRating,
        deltaContactor: In_delta,
        deltaContactorRating,
        starContactor: In_star,
        starContactorRating,
        olrSetting: In_delta, // OLR under Main Contactor
        olrRange: `${(In_delta * 0.8).toFixed(1)} - ${(In_delta * 1.2).toFixed(1)} A`,
        // 6 wires to motor (2 sets of 3-Phase: U1,V1,W1 and U2,V2,W2)
        cableSize: getCableSize(In_delta / 0.8), // 80% derating for 6 cables in conduit
        cableQty: 6
      };
    }

    return {
      kw: kw.toFixed(2),
      hp: (kw / 0.746).toFixed(2),
      In: In,
      breaker: recommendedBreaker,
      ...details
    };
  }, [motorPower, powerUnit, phase, voltage, starterType, pf, eff]);

  const handlePhaseChange = (p) => {
    setPhase(p);
    if (p === '1') {
      setVoltage(220);
      setStarterType('DOL'); // 1-phase is DOL only
    } else {
      setVoltage(380);
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
          <h1 className="text-gradient-solar" style={{ marginBottom: 0, fontSize: '2rem' }}>คำนวณอุปกรณ์มอเตอร์ (Motor Starter Sizing)</h1>
          <p style={{ color: 'var(--text-secondary)' }}>DOL & Star-Delta (Y-Δ) Sizing, EIT Cable Sizing (&ge; 2.5 sq.mm), and Wiring Diagram</p>
        </div>
        <button onClick={() => window.print()} style={{ background: 'var(--accent-secondary)', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Printer size={20} /> พิมพ์เป็น PDF
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem', alignItems: 'flex-start' }}>
        
        {/* INPUT SECTION */}
        <div className="equipment-card no-print" style={{ padding: '1.75rem' }}>
          <h3 style={{ margin: '0 0 1.25rem', color: 'var(--text-primary)' }}>ข้อมูลมอเตอร์ (Motor Specs)</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>ระบบไฟ (Phase)</label>
              <select value={phase} onChange={(e) => handlePhaseChange(e.target.value)} style={inputStyle}>
                <option value="1">1-Phase (Single Phase)</option>
                <option value="3">3-Phase (Three Phase)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>แรงดัน (Voltage)</label>
              <select value={voltage} onChange={(e) => setVoltage(Number(e.target.value))} style={inputStyle}>
                {phase === '1' ? (
                  <option value="220">220V</option>
                ) : (
                  <>
                    <option value="380">380V</option>
                    <option value="400">400V</option>
                  </>
                )}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>ขนาดมอเตอร์ (Power)</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input type="number" min="0.1" step="0.1" value={motorPower} onChange={(e) => setMotorPower(Number(e.target.value))} style={{ ...inputStyle, flex: 1 }} />
              <select value={powerUnit} onChange={(e) => setPowerUnit(e.target.value)} style={{ width: '90px', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', outline: 'none' }}>
                <option value="kW">kW</option>
                <option value="HP">HP</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>รูปแบบการสตาร์ท (Starter Type)</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <button 
                type="button"
                onClick={() => setStarterType('DOL')}
                style={{ 
                  padding: '0.85rem', borderRadius: '8px', 
                  border: `2px solid ${starterType === 'DOL' ? 'var(--accent-solar)' : 'var(--border-color)'}`,
                  background: starterType === 'DOL' ? 'rgba(245, 158, 11, 0.15)' : 'var(--bg-primary)',
                  color: starterType === 'DOL' ? 'var(--accent-solar)' : 'var(--text-secondary)',
                  fontWeight: starterType === 'DOL' ? 'bold' : 'normal', cursor: 'pointer'
                }}
              >
                Direct On Line (DOL)
              </button>
              <button 
                type="button"
                onClick={() => setStarterType('YD')}
                disabled={phase === '1'}
                style={{ 
                  padding: '0.85rem', borderRadius: '8px', 
                  border: `2px solid ${starterType === 'YD' ? 'var(--accent-solar)' : 'var(--border-color)'}`,
                  background: starterType === 'YD' ? 'rgba(245, 158, 11, 0.15)' : 'var(--bg-primary)',
                  color: starterType === 'YD' ? 'var(--accent-solar)' : 'var(--text-secondary)',
                  fontWeight: starterType === 'YD' ? 'bold' : 'normal',
                  cursor: phase === '1' ? 'not-allowed' : 'pointer', opacity: phase === '1' ? 0.5 : 1
                }}
              >
                Star-Delta (Y-Δ)
              </button>
            </div>
          </div>

          {/* Advanced Settings Toggle */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            <button 
              type="button" 
              onClick={() => setShowAdvanced(!showAdvanced)} 
              style={{ background: 'none', border: 'none', color: 'var(--accent-solar)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.4rem', padding: 0 }}
            >
              <Sliders size={16} /> {showAdvanced ? '▲ ซ่อนตั้งค่าขั้นสูง (สำหรับวิศวกรรม)' : '▼ แสดงตั้งค่าขั้นสูง (ระดับประสิทธิภาพ IE Class)'}
            </button>

            {showAdvanced && (
              <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>ระดับประสิทธิภาพมอเตอร์ (Motor IE Rating)</label>
                  <select value={ieClass} onChange={(e) => setIeClass(e.target.value)} style={inputStyle}>
                    {Object.keys(MOTOR_IE_CLASSES).map(key => (
                      <option key={key} value={key}>{MOTOR_IE_CLASSES[key].name}</option>
                    ))}
                  </select>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
                  * พารามิเตอร์อัตโนมัติ: Power Factor $\cos\theta = {pf}$ | Efficiency $\eta = {(eff * 100).toFixed(0)}\%$
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RESULTS SECTION */}
        {result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Full Load Current Summary Card */}
            <div className="equipment-card animate-fade-in" style={{ padding: '1.75rem', border: '1px solid rgba(255, 165, 0, 0.3)', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div>
                  <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.3rem' }}>กระแสพิกัดมอเตอร์ (In)</h3>
                  <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Full Load Ampere (FLA)</p>
                </div>
                <div style={{ background: 'var(--accent-solar)', color: 'white', padding: '0.75rem', borderRadius: '50%' }}>
                  <Zap size={26} />
                </div>
              </div>

              <div style={{ fontSize: '3.4rem', fontWeight: 'bold', color: 'white', lineHeight: 1 }}>
                {result.In.toFixed(1)} <span style={{ fontSize: '1.4rem', color: 'var(--accent-solar)', fontWeight: 'normal' }}>Amperes</span>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <span>กำลังไฟฟ้า: <strong>{result.kw} kW</strong> ({result.hp} HP)</span>
                <span>•</span>
                <span>มาตรฐาน: <strong>{activeIe.name.split(' ')[0]}</strong></span>
              </div>
            </div>

            {/* Components BOM Card */}
            <div className="equipment-card animate-fade-in" style={{ padding: '1.75rem' }}>
              <h3 style={{ margin: '0 0 1.25rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '1.15rem' }}>
                <Cpu size={20} className="text-solar" /> รายการสเปกอุปกรณ์ควบคุม (BOM Specs)
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                
                {/* Main Breaker */}
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.85rem', borderBottom: '1px solid var(--border-color)' }}>
                  <div>
                    <div style={{ color: 'var(--text-primary)', fontWeight: 'bold', fontSize: '0.95rem' }}>Main Breaker (MCCB / MPCB)</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>พิกัดเผื่อสตาร์ท 1.5x In</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: 'var(--accent-solar)', fontSize: '1.25rem', fontWeight: 'bold' }}>{result.breaker} A</div>
                  </div>
                </div>

                {/* Contactors */}
                {starterType === 'DOL' ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.85rem', borderBottom: '1px solid var(--border-color)' }}>
                    <div>
                      <div style={{ color: 'var(--text-primary)', fontWeight: 'bold', fontSize: '0.95rem' }}>Magnetic Contactor (KM1)</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>พิกัด AC-3 (คำนวณ {result.mainContactor.toFixed(1)} A)</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: '#3b82f6', fontSize: '1.25rem', fontWeight: 'bold' }}>{result.mainContactorRating} A <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>(AC-3)</span></div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.85rem', borderBottom: '1px solid var(--border-color)' }}>
                      <div>
                        <div style={{ color: 'var(--text-primary)', fontWeight: 'bold', fontSize: '0.95rem' }}>Main (KM1) & Delta Contactor (KM2)</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>พิกัด AC-3 (58% In = {result.mainContactor.toFixed(1)} A)</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ color: '#3b82f6', fontSize: '1.25rem', fontWeight: 'bold' }}>{result.mainContactorRating} A <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>(AC-3 x 2 ตัว)</span></div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.85rem', borderBottom: '1px solid var(--border-color)' }}>
                      <div>
                        <div style={{ color: 'var(--text-primary)', fontWeight: 'bold', fontSize: '0.95rem' }}>Star Contactor (KM3)</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>พิกัด AC-3 (33% In = {result.starContactor.toFixed(1)} A)</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ color: '#3b82f6', fontSize: '1.25rem', fontWeight: 'bold' }}>{result.starContactorRating} A <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>(AC-3 x 1 ตัว)</span></div>
                      </div>
                    </div>
                  </>
                )}

                {/* Overload Relay */}
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.85rem', borderBottom: '1px solid var(--border-color)' }}>
                  <div>
                    <div style={{ color: 'var(--text-primary)', fontWeight: 'bold', fontSize: '0.95rem' }}>Overload Relay (OLR)</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                      {starterType === 'DOL' ? 'ตั้งค่ากระแสกระแสพิกัด In' : 'ตั้งค่ากระแส 58% In (ต่อใต้ Main Contactor)'}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#ef4444', fontSize: '1.25rem', fontWeight: 'bold' }}>{result.olrSetting.toFixed(1)} A</div>
                    <div style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>ช่วงตั้งค่า: {result.olrRange}</div>
                  </div>
                </div>

                {/* Cable Sizing (Compliant with EIT min 2.5 sq.mm) */}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ color: 'var(--text-primary)', fontWeight: 'bold', fontSize: '0.95rem' }}>ขนาดสายไฟวงจรกำลัง (Power Cables)</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                      {starterType === 'DOL' ? 'สายไฟไปมอเตอร์ 3 เส้น (ทนกระแส >= 125% In)' : 'สายไฟไปมอเตอร์ 6 เส้น (ทนกระแส >= 125% In/√3)'}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#10b981', fontSize: '1.25rem', fontWeight: 'bold' }}>
                      {result.cableQty} × {result.cableSize} <span style={{ fontSize: '0.85rem', fontWeight: 'normal' }}>sq.mm</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>* ขั้นต่ำ 2.5 sq.mm ตาม วสท.</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Power Schematic Diagram (Visual Wiring Diagram) */}
            <div className="equipment-card animate-fade-in" style={{ padding: '1.75rem' }}>
              <h3 style={{ margin: '0 0 1.25rem', color: 'var(--text-primary)', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Layers size={18} className="text-solar" /> แผนผังวงจรกำลัง (Power Diagram Schematic)
              </h3>
              
              <div style={{ background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.85rem' }}>
                
                {/* 3-Phase Supply */}
                <div style={{ display: 'flex', gap: '1rem', color: 'var(--accent-solar)', fontWeight: 'bold', fontSize: '0.85rem' }}>
                  <span>L1 (R)</span> <span>L2 (S)</span> <span>L3 (T)</span>
                </div>

                <div style={{ width: '2px', height: '16px', background: 'rgba(255,255,255,0.3)' }} />
                
                {/* Main Breaker Box */}
                <div style={{ border: '2px solid var(--accent-solar)', padding: '0.5rem 1.5rem', borderRadius: '6px', background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-solar)', fontWeight: 'bold', fontSize: '0.9rem' }}>
                  Main Breaker ({result.breaker}A)
                </div>

                <div style={{ width: '2px', height: '16px', background: 'rgba(255,255,255,0.3)' }} />

                {starterType === 'DOL' ? (
                  <>
                    <div style={{ border: '2px solid #3b82f6', padding: '0.5rem 1.5rem', borderRadius: '6px', background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', fontWeight: 'bold', fontSize: '0.9rem' }}>
                      Main Contactor (KM1 - {result.mainContactorRating}A)
                    </div>

                    <div style={{ width: '2px', height: '16px', background: 'rgba(255,255,255,0.3)' }} />

                    <div style={{ border: '2px solid #ef4444', padding: '0.5rem 1.5rem', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', fontWeight: 'bold', fontSize: '0.9rem' }}>
                      Overload Relay ({result.olrSetting.toFixed(1)}A)
                    </div>

                    <div style={{ width: '2px', height: '16px', background: 'rgba(255,255,255,0.3)' }} />

                    <div style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 'bold' }}>
                      สายไฟ 3 เส้น ({result.cableSize} sq.mm)
                    </div>

                    <div style={{ width: '2px', height: '12px', background: 'rgba(255,255,255,0.3)' }} />

                    <div style={{ width: '70px', height: '70px', borderRadius: '50%', border: '3px solid #10b981', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontWeight: 'bold', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: '0.95rem' }}>
                      Motor (M)
                      <span style={{ fontSize: '0.65rem', color: 'white' }}>U1 V1 W1</span>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Star-Delta Schematics */}
                    <div style={{ display: 'flex', gap: '1.25rem', width: '100%', justifyContent: 'center', flexWrap: 'wrap' }}>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', color: '#3b82f6', marginBottom: '0.2rem' }}>Main</span>
                        <div style={{ border: '2px solid #3b82f6', padding: '0.45rem 0.85rem', borderRadius: '6px', background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', fontWeight: 'bold', fontSize: '0.82rem' }}>
                          KM1 ({result.mainContactorRating}A)
                        </div>
                        <div style={{ width: '2px', height: '10px', background: 'rgba(255,255,255,0.3)' }} />
                        <div style={{ border: '2px solid #ef4444', padding: '0.35rem 0.65rem', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', fontWeight: 'bold', fontSize: '0.78rem' }}>
                          OLR ({result.olrSetting.toFixed(1)}A)
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', color: '#3b82f6', marginBottom: '0.2rem' }}>Delta</span>
                        <div style={{ border: '2px solid #3b82f6', padding: '0.45rem 0.85rem', borderRadius: '6px', background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', fontWeight: 'bold', fontSize: '0.82rem' }}>
                          KM2 ({result.deltaContactorRating}A)
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', color: '#3b82f6', marginBottom: '0.2rem' }}>Star</span>
                        <div style={{ border: '2px solid #3b82f6', padding: '0.45rem 0.85rem', borderRadius: '6px', background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', fontWeight: 'bold', fontSize: '0.82rem' }}>
                          KM3 ({result.starContactorRating}A)
                        </div>
                        <div style={{ borderTop: '2px dashed #3b82f6', width: '100%', marginTop: '0.3rem' }} title="Star Shorting Bar" />
                      </div>

                    </div>

                    <div style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 'bold', marginTop: '0.5rem' }}>
                      สายไฟไปมอเตอร์ 6 เส้น (2 ชุด x 3 เส้น {result.cableSize} sq.mm)
                    </div>

                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', border: '3px solid #10b981', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontWeight: 'bold', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: '0.95rem' }}>
                      Motor (M)
                      <span style={{ fontSize: '0.65rem', color: 'white' }}>U1,V1,W1 / U2,V2,W2</span>
                    </div>

                    <div style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>
                      * วงจร Star-Delta ควบคุมสตาร์ท ป้องกันกระแส Inrush สูงในโรงงาน
                    </div>
                  </>
                )}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default MotorCalculator;
