import React, { useState } from 'react';
import { ArrowLeft, Zap, TrendingUp, Printer, Sliders, ShieldAlert, CheckCircle, Cpu, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { calculatePfcAdvanced } from '../utils/engineering/pfcCalc';
import Tooltip from '../components/Tooltip';

const PfcCalculator = () => {
  const navigate = useNavigate();

  // Mode Switcher: 'basic' vs 'advanced'
  const [mode, setMode] = useState('basic');

  // Basic Inputs
  const [activePower, setActivePower] = useState(''); // kW
  const [currentPF, setCurrentPF] = useState('');
  const [targetPF, setTargetPF] = useState('0.95');

  // Advanced Inputs
  const [voltage, setVoltage] = useState('400'); // '380', '400', '22000'
  const [hasHarmonics, setHasHarmonics] = useState(false);
  const [reactorType, setReactorType] = useState('7%'); // '7%' or '14%'
  const [customCostPerKvar, setCustomCostPerKvar] = useState('');

  const [result, setResult] = useState(null);

  const numCurrentPF = Number(currentPF);
  const numTargetPF = Number(targetPF);
  
  const isInvalidPf = (targetPF !== '' && currentPF !== '') && (numTargetPF > 1.0 || numTargetPF <= numCurrentPF);

  const calculatePFC = (e) => {
    e.preventDefault();
    const calculationResult = calculatePfcAdvanced(activePower, currentPF, targetPF, {
      voltage: Number(voltage),
      hasHarmonics,
      reactorType,
      customCostPerKvar: Number(customCostPerKvar)
    });

    if (!calculationResult) {
      alert("กรุณากรอกข้อมูลให้ถูกต้อง (PF ต้องอยู่ระหว่าง 0 - 1 และ Target PF ต้องมากกว่า Current PF)");
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
          <h1 className="text-gradient-solar" style={{ marginBottom: 0, fontSize: '2rem' }}>คำนวณปรับปรุง Power Factor (PFC & Capacitor Bank)</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Capacitor Bank Sizing, kVAR Penalty Savings (PEA/MEA) & ROI Calculator</p>
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

          <form onSubmit={calculatePFC} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>โหลดใช้งานจริง Active Power (kW)</label>
              <input type="number" step="0.1" value={activePower} onChange={(e) => setActivePower(e.target.value)} required placeholder="เช่น 500" style={inputStyle} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Power Factor ปัจจุบัน</label>
                <input type="number" step="0.01" value={currentPF} onChange={(e) => setCurrentPF(e.target.value)} required placeholder="เช่น 0.70" style={inputStyle} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>PF เป้าหมาย (Target PF)</label>
                <input 
                  type="number" step="0.01" value={targetPF} onChange={(e) => setTargetPF(e.target.value)} required placeholder="แนะนำ 0.95" 
                  style={{ ...inputStyle, border: isInvalidPf ? '1px solid #ef4444' : '1px solid var(--border-color)' }} 
                />
              </div>
            </div>

            {isInvalidPf && (
              <span style={{ color: '#ef4444', fontSize: '0.8rem' }}>
                * PF เป้าหมายต้องไม่เกิน 1.0 และต้องมากกว่า PF ปัจจุบัน
              </span>
            )}

            {/* Advanced Settings */}
            {mode === 'advanced' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--accent-solar)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Sliders size={16} /> พารามิเตอร์ระบบไฟฟ้า & Harmonics
                </h4>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>แรงดันไฟฟ้าของระบบ (System Voltage)</label>
                  <select value={voltage} onChange={(e) => setVoltage(e.target.value)} style={inputStyle}>
                    <option value="400">400V (3 Phase แรงต่ำมาตรฐาน)</option>
                    <option value="380">380V (3 Phase แรงต่ำ)</option>
                    <option value="22000">22 kV (22,000V แรงสูง)</option>
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--bg-primary)', borderRadius: '8px' }}>
                  <div>
                    <strong style={{ fontSize: '0.85rem', display: 'block' }}>โหลดมี Harmonics / VFD หรือไม่?</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>ป้องกัน Resonance โดยใช้ Detuned Reactor</span>
                  </div>
                  <input type="checkbox" checked={hasHarmonics} onChange={(e) => setHasHarmonics(e.target.checked)} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                </div>

                {hasHarmonics && (
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>ชนิด Detuned Reactor ที่แนะนำ</label>
                    <select value={reactorType} onChange={(e) => setReactorType(e.target.value)} style={inputStyle}>
                      <option value="7%">Detuned Reactor 7% (189Hz - ป้องกัน Harmonics ลำดับที่ 5)</option>
                      <option value="14%">Detuned Reactor 14% (134Hz - ป้องกัน Harmonics ลำดับที่ 3)</option>
                    </select>
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>ราคาประเมินติดตั้ง (บาท/kVAR) [ว่าง = คำนวณอัตโนมัติ]</label>
                  <input type="number" value={customCostPerKvar} onChange={(e) => setCustomCostPerKvar(e.target.value)} placeholder={hasHarmonics ? '1800' : '1000'} style={inputStyle} />
                </div>
              </div>
            )}

            <button 
              type="submit" 
              disabled={isInvalidPf}
              style={{ 
                background: isInvalidPf ? 'var(--bg-tertiary)' : 'linear-gradient(135deg, #FFB75E 0%, #ED8F03 100%)', 
                color: isInvalidPf ? 'var(--text-tertiary)' : 'white', 
                padding: '1rem', borderRadius: '8px', border: 'none', 
                fontSize: '1.1rem', fontWeight: 'bold', cursor: isInvalidPf ? 'not-allowed' : 'pointer', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' 
              }}
            >
              <Zap size={20} /> คำนวณ Capacitor Bank
            </button>
          </form>
        </div>

        {/* RESULTS SECTION */}
        {result && (
          <div className="equipment-card animate-fade-in" style={{ padding: '2rem', background: 'rgba(255, 165, 0, 0.03)', border: '1px solid rgba(255, 165, 0, 0.2)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="text-gradient-solar" style={{ margin: 0, fontSize: '1.5rem' }}>ผลการออกแบบ Capacitor Bank</h3>
              <span style={{ padding: '0.3rem 0.75rem', borderRadius: '50px', background: result.monthlyPenaltySavings > 0 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)', color: result.monthlyPenaltySavings > 0 ? '#10b981' : '#f59e0b', fontWeight: 'bold', fontSize: '0.85rem' }}>
                {result.monthlyPenaltySavings > 0 ? `คืนทุนใน ${result.paybackYears} ปี 🚀` : 'ไม่โดนค่าปรับ PF'}
              </span>
            </div>

            {/* Grid of Results */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              
              {/* Capacitor Bank Size */}
              <div style={{ background: 'var(--bg-tertiary)', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0 0 0.4rem' }}>ขนาด Capacitor Bank ($Q_c$)</p>
                <p style={{ fontSize: '2.2rem', fontWeight: 'bold', color: 'var(--accent-solar)', margin: 0 }}>
                  {result.requiredKvar} <span style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>kVAR</span>
                </p>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{result.hasHarmonics ? `* มี Detuned Reactor ${result.reactorType}` : '* แบบ Standard Duty'}</span>
              </div>

              {/* Monthly Penalty Savings */}
              <div style={{ background: 'var(--bg-tertiary)', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0 0 0.4rem' }}>ประหยัดค่าปรับ kVAR (กฟภ./กฟน.)</p>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981', margin: 0 }}>
                  ฿{result.monthlyPenaltySavings.toLocaleString()} <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>/เดือน</span>
                </p>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>อ้างอิงอัตรา 56.07 บาท/kVAR</span>
              </div>

              {/* Step Configuration */}
              <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '8px' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: 0 }}>🔢 การจัดแบ่ง Step (APFC Controller)</p>
                <p style={{ fontSize: '1.3rem', fontWeight: 'bold', margin: '0.2rem 0 0', color: 'white' }}>
                  {result.totalSteps} Steps <span style={{ fontSize: '0.9rem', color: 'var(--accent-solar)' }}>({result.stepSizeKvar} kVAR x {result.totalSteps})</span>
                </p>
              </div>

              {/* Current Reduction */}
              <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '8px' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: 0 }}>📉 กระแสสายเมนลดลง ($\Delta I$)</p>
                <p style={{ fontSize: '1.3rem', fontWeight: 'bold', margin: '0.2rem 0 0', color: '#3b82f6' }}>
                  {result.currentReducedAmps} <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Amperes</span>
                </p>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>จาก {result.currentBeforeAmps}A เหลือ {result.currentAfterAmps}A</span>
              </div>

              {/* Transformer Headroom Released */}
              <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '8px', gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', textAlign: 'center' }}>
                <div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: 0 }}>🏭 ความจุหม้อแปลงที่ได้คืนมา</p>
                  <p style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#10b981', margin: '0.2rem 0 0' }}>{result.kvaReleased} kVA</p>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>รองรับการเพิ่มเครื่องจักรใหม่โดยไม่ต้องเพิ่มหม้อแปลง</span>
                </div>
                <div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: 0 }}>💰 งบประมาณประเมิน (CAPEX)</p>
                  <p style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#f59e0b', margin: '0.2rem 0 0' }}>฿{result.totalCostCapex.toLocaleString()}</p>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>~฿{result.unitCostPerKvar.toLocaleString()}/kVAR</span>
                </div>
              </div>
            </div>

            {/* Note & Guidelines */}
            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>
              * อ้างอิงระเบียบการไฟฟ้า (PEA/MEA): คิดค่าปรับ kVAR ส่วนที่เกิน 61.97% ของ Max Demand kW ในอัตรา 56.07 บาท/kVAR/เดือน | แนะนำ Breaker <strong>{result.recommendedBreakerAmps} AT</strong> และ Capacitor Duty Contactor <strong>{result.recommendedContactorAmps} A</strong>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default PfcCalculator;
