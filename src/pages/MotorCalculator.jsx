import { useState, useMemo } from 'react';
import { ArrowLeft, Settings, Info, CheckCircle, Zap, ShieldAlert, Cpu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BREAKER_SIZES } from '../constants/engineeringConstants';

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

const MotorCalculator = () => {
  const navigate = useNavigate();
  const [motorPower, setMotorPower] = useState(5.5);
  const [powerUnit, setPowerUnit] = useState('kW'); // kW or HP
  const [phase, setPhase] = useState('3'); // 1 or 3
  const [voltage, setVoltage] = useState(380); // 220, 380, 400
  const [starterType, setStarterType] = useState('DOL'); // DOL or YD

  // Constants for approx
  const pf = 0.82;
  const eff = 0.85;

  const result = useMemo(() => {
    let kw = powerUnit === 'HP' ? motorPower * 0.746 : motorPower;
    if (kw <= 0) return null;

    // Calculate Full Load Current (In)
    let In = 0;
    if (phase === '1') {
      In = (kw * 1000) / (voltage * pf * eff);
    } else {
      In = (kw * 1000) / (Math.sqrt(3) * voltage * pf * eff);
    }
    
    // Safety Limits
    if (In > 1000) return null;

    // Breaker Size (approx 1.5x - 2.5x In for MCCB) -> Using standard 1.5x minimum
    const minBreaker = In * 1.5;
    let recommendedBreaker = BREAKER_SIZES.find(b => b >= minBreaker) || Math.ceil(minBreaker);

    // Cable Sizing (Capacity >= 1.25 * In)
    const getCableSize = (current) => {
      const targetAmps = current * 1.25;
      const cable = CABLE_AMPACITY_THW.find(c => c.amps >= targetAmps);
      return cable ? cable.size : '>240';
    };

    let details = {};

    if (starterType === 'DOL') {
      details = {
        mainContactor: In,
        olrSetting: In,
        olrRange: `${(In * 0.8).toFixed(1)} - ${(In * 1.2).toFixed(1)} A`,
        cableSize: getCableSize(In),
        cableQty: phase === '1' ? 2 : 3 // L,N or L1,L2,L3
      };
    } else {
      // Star-Delta
      const In_delta = In / Math.sqrt(3); // 58%
      const In_star = In / 3; // 33%
      
      details = {
        mainContactor: In_delta,
        deltaContactor: In_delta,
        starContactor: In_star,
        olrSetting: In_delta, // OLR under Main Contactor
        olrRange: `${(In_delta * 0.8).toFixed(1)} - ${(In_delta * 1.2).toFixed(1)} A`,
        // 6 wires to motor, each carries In_delta. 
        // Need to derate because 6 wires in conduit (approx 80% factor)
        // target capacity = (In_delta * 1.25) / 0.8
        cableSize: getCableSize(In_delta / 0.8), 
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
  }, [motorPower, powerUnit, phase, voltage, starterType]);

  const handlePhaseChange = (p) => {
    setPhase(p);
    if (p === '1') {
      setVoltage(220);
      setStarterType('DOL'); // 1-phase is only DOL
    } else {
      setVoltage(380);
    }
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '0.5rem' }}>
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-gradient-ac" style={{ marginBottom: 0, fontSize: '2rem' }}>คำนวณอุปกรณ์มอเตอร์</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Motor Starter Calculator (DOL & Star-Delta)</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        
        {/* INPUT SECTION */}
        <div className="equipment-card" style={{ padding: '2rem' }}>
          <h3 style={{ margin: '0 0 1.5rem', color: 'var(--text-primary)' }}>ข้อมูลมอเตอร์ (Motor Specs)</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>ระบบไฟ (Phase)</label>
              <select 
                value={phase} 
                onChange={(e) => handlePhaseChange(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
              >
                <option value="1">1-Phase (Single Phase)</option>
                <option value="3">3-Phase (Three Phase)</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>แรงดัน (Voltage)</label>
              <select 
                value={voltage} 
                onChange={(e) => setVoltage(Number(e.target.value))}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
              >
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

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>ขนาดมอเตอร์ (Power)</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="number" min="0.1" step="0.1" value={motorPower} 
                onChange={(e) => setMotorPower(Number(e.target.value))}
                style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }} 
              />
              <select 
                value={powerUnit} 
                onChange={(e) => setPowerUnit(e.target.value)}
                style={{ width: '80px', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
              >
                <option value="kW">kW</option>
                <option value="HP">HP</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>รูปแบบการสตาร์ท (Starter Type)</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <button 
                onClick={() => setStarterType('DOL')}
                style={{ 
                  padding: '1rem', 
                  borderRadius: '8px', 
                  border: `1px solid ${starterType === 'DOL' ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                  background: starterType === 'DOL' ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                  color: starterType === 'DOL' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  fontWeight: starterType === 'DOL' ? 'bold' : 'normal',
                  cursor: 'pointer'
                }}
              >
                Direct On Line (DOL)
              </button>
              <button 
                onClick={() => setStarterType('YD')}
                disabled={phase === '1'}
                style={{ 
                  padding: '1rem', 
                  borderRadius: '8px', 
                  border: `1px solid ${starterType === 'YD' ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                  background: starterType === 'YD' ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                  color: starterType === 'YD' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  fontWeight: starterType === 'YD' ? 'bold' : 'normal',
                  cursor: phase === '1' ? 'not-allowed' : 'pointer',
                  opacity: phase === '1' ? 0.5 : 1
                }}
                title={phase === '1' ? "Star-Delta requires 3-Phase" : ""}
              >
                Star-Delta (Y-Δ)
              </button>
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <Info size={18} color="var(--accent-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
              คำนวณโดยอิงค่า Power Factor ≈ {pf} และประสิทธิภาพมอเตอร์ ≈ {(eff * 100)}% ซึ่งเป็นค่าเฉลี่ยสำหรับมอเตอร์ทั่วไป
            </div>
          </div>
        </div>

        {/* RESULTS SECTION */}
        {result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Summary */}
            <div className="equipment-card" style={{ padding: '2rem', border: '1px solid var(--accent-primary)', background: 'linear-gradient(135deg, var(--bg-secondary) 0%, rgba(59, 130, 246, 0.05) 100%)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>กระแสพิกัดมอเตอร์ (In)</h3>
                  <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Full Load Amp (FLA)</p>
                </div>
                <div style={{ background: 'var(--accent-primary)', color: 'white', padding: '0.75rem', borderRadius: '50%' }}>
                  <Zap size={24} />
                </div>
              </div>
              <div style={{ fontSize: '3.5rem', fontWeight: 'bold', color: 'var(--text-primary)', lineHeight: 1 }}>
                {result.In.toFixed(1)} <span style={{ fontSize: '1.5rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}>A</span>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{result.kw} kW</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>•</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{result.hp} HP</div>
              </div>
            </div>

            {/* Components BOM */}
            <div className="equipment-card" style={{ padding: '2rem' }}>
              <h3 style={{ margin: '0 0 1.5rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Cpu size={20} color="var(--accent-secondary)" />
                รายการอุปกรณ์ (BOM)
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Breaker */}
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div>
                    <div style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>Main Breaker (MCCB/MPCB)</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>พิกัดเผื่อสตาร์ท 1.5x (Trip class)</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: 'var(--accent-secondary)', fontSize: '1.25rem', fontWeight: 'bold' }}>{result.breaker} A</div>
                  </div>
                </div>

                {/* Contactor */}
                {starterType === 'DOL' ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div>
                      <div style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>Magnetic Contactor</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>พิกัด AC-3 (ทนกระแส In)</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: 'var(--accent-primary)', fontSize: '1.25rem', fontWeight: 'bold' }}>{result.mainContactor.toFixed(1)} A</div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px dashed rgba(255,255,255,0.05)' }}>
                      <div>
                        <div style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>Main & Delta Contactor (K1, K2)</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>พิกัด AC-3 (58% In)</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ color: 'var(--accent-primary)', fontSize: '1.25rem', fontWeight: 'bold' }}>{result.mainContactor.toFixed(1)} A</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <div>
                        <div style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>Star Contactor (K3)</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>พิกัด AC-3 (33% In)</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ color: 'var(--accent-primary)', fontSize: '1.25rem', fontWeight: 'bold' }}>{result.starContactor.toFixed(1)} A</div>
                      </div>
                    </div>
                  </>
                )}

                {/* Overload */}
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div>
                    <div style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>Overload Relay (OLR)</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      {starterType === 'DOL' ? 'ตั้งค่าที่กระแส In' : 'ตั้งค่าที่ 58% In (ต่อใต้ Main)'}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#F44336', fontSize: '1.25rem', fontWeight: 'bold' }}>{result.olrSetting.toFixed(1)} A</div>
                    <div style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>ช่วงแนะนำ: {result.olrRange}</div>
                  </div>
                </div>

                {/* Cable */}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>ขนาดสายไฟ (THW / NYY)</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      {starterType === 'DOL' ? 'ร้อยท่อ 1 วงจร' : 'ร้อยท่อ 2 วงจร (ลดทอนกระแส)'}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: 'var(--text-primary)', fontSize: '1.25rem', fontWeight: 'bold' }}>
                      {result.cableQty} × {result.cableSize} <span style={{ fontSize: '0.85rem', fontWeight: 'normal' }}>sq.mm</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Simple Block Diagram */}
            <div className="equipment-card" style={{ padding: '2rem' }}>
              <h3 style={{ margin: '0 0 1.5rem', color: 'var(--text-primary)' }}>แผนผังการต่อสาย (Block Diagram)</h3>
              
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '2rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', border: '1px dashed rgba(255,255,255,0.1)' }}>
                <div style={{ border: '2px solid var(--accent-secondary)', padding: '0.5rem 2rem', borderRadius: '4px', background: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent-secondary)', fontWeight: 'bold' }}>
                  MCCB ({result.breaker}A)
                </div>
                <div style={{ width: '2px', height: '20px', background: 'rgba(255,255,255,0.2)' }} />
                
                {starterType === 'DOL' ? (
                  <>
                    <div style={{ border: '2px solid var(--accent-primary)', padding: '0.5rem 2rem', borderRadius: '4px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-primary)', fontWeight: 'bold' }}>
                      Magnetic Contactor
                    </div>
                    <div style={{ width: '2px', height: '20px', background: 'rgba(255,255,255,0.2)' }} />
                    <div style={{ border: '2px solid #F44336', padding: '0.5rem 2rem', borderRadius: '4px', background: 'rgba(244, 67, 54, 0.1)', color: '#F44336', fontWeight: 'bold' }}>
                      Overload Relay
                    </div>
                    <div style={{ width: '2px', height: '20px', background: 'rgba(255,255,255,0.2)' }} />
                    <div style={{ border: '2px solid #4CAF50', padding: '1rem 2.5rem', borderRadius: '50%', background: 'rgba(76, 175, 80, 0.1)', color: '#4CAF50', fontWeight: 'bold' }}>
                      Motor (M)
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ display: 'flex', gap: '2rem', width: '100%', justifyContent: 'center' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ border: '2px solid var(--accent-primary)', padding: '0.5rem 1.5rem', borderRadius: '4px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-primary)', fontWeight: 'bold' }}>
                          Main (K1)
                        </div>
                        <div style={{ width: '2px', height: '10px', background: 'rgba(255,255,255,0.2)' }} />
                        <div style={{ border: '2px solid #F44336', padding: '0.5rem 1rem', borderRadius: '4px', background: 'rgba(244, 67, 54, 0.1)', color: '#F44336', fontWeight: 'bold', fontSize: '0.85rem' }}>
                          OLR
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ border: '2px solid var(--accent-primary)', padding: '0.5rem 1.5rem', borderRadius: '4px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-primary)', fontWeight: 'bold' }}>
                          Delta (K2)
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ border: '2px solid var(--accent-primary)', padding: '0.5rem 1.5rem', borderRadius: '4px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-primary)', fontWeight: 'bold' }}>
                          Star (K3)
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ width: '2px', height: '20px', background: 'rgba(255,255,255,0.2)' }} />
                    <div style={{ border: '2px solid #4CAF50', padding: '1rem 2.5rem', borderRadius: '50%', background: 'rgba(76, 175, 80, 0.1)', color: '#4CAF50', fontWeight: 'bold' }}>
                      Motor (M)
                    </div>
                    <div style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', marginTop: '0.5rem' }}>* การต่อ OLR ใต้ Main Contactor</div>
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
