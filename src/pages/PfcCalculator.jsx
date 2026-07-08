import { useState } from 'react';
import { ArrowLeft, Zap, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { calculatePfc } from '../utils/engineering/pfcCalc';

const PfcCalculator = () => {
  const navigate = useNavigate();
  const [activePower, setActivePower] = useState(''); // kW
  const [currentPF, setCurrentPF] = useState('');
  const [targetPF, setTargetPF] = useState('0.95');
  const [result, setResult] = useState(null);

  const numCurrentPF = Number(currentPF);
  const numTargetPF = Number(targetPF);
  
  // Logic ตรวจสอบ: Target PF ต้องไม่เกิน 1.0 และต้องมากกว่า Current PF
  const isInvalidPf = (targetPF !== '' && currentPF !== '') && (numTargetPF > 1.0 || numTargetPF <= numCurrentPF);

  const calculatePFC = (e) => {
    e.preventDefault();
    const calculationResult = calculatePfc(activePower, currentPF, targetPF);
    if (!calculationResult) {
      alert("กรุณากรอกข้อมูลให้ถูกต้อง (PF ต้องอยู่ระหว่าง 0 - 1 และ Target PF ต้องมากกว่า Current PF)");
      return;
    }
    setResult(calculationResult);
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '0.5rem' }}>
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-gradient-solar" style={{ marginBottom: 0, fontSize: '2rem' }}>คำนวณปรับปรุง Power Factor (PFC)</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Capacitor Bank Sizing & ROI Calculator</p>
        </div>
      </div>

      <div className="grid-2">
        <div className="equipment-card" style={{ padding: '2rem' }}>
          <form onSubmit={calculatePFC} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>โหลดใช้งานจริง Active Power (kW)</label>
              <input type="number" step="0.1" value={activePower} onChange={(e) => setActivePower(e.target.value)} required placeholder="เช่น 500" style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Power Factor ปัจจุบัน</label>
              <input type="number" step="0.01" value={currentPF} onChange={(e) => setCurrentPF(e.target.value)} required placeholder="เช่น 0.70" style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Power Factor เป้าหมาย (Target PF)</label>
              <input 
                type="number" 
                step="0.01" 
                value={targetPF} 
                onChange={(e) => setTargetPF(e.target.value)} 
                required 
                placeholder="แนะนำ 0.95 - 1.0" 
                style={{ 
                  width: '100%', 
                  padding: '1rem', 
                  borderRadius: '8px', 
                  border: isInvalidPf ? '1px solid #ef4444' : '1px solid var(--border-color)', 
                  background: isInvalidPf ? 'rgba(239, 68, 68, 0.05)' : 'var(--bg-primary)', 
                  color: 'var(--text-primary)' 
                }} 
              />
              {isInvalidPf && (
                <span style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.5rem', display: 'block' }}>
                  PF เป้าหมายต้องไม่เกิน 1.0 และต้องมากกว่า PF ปัจจุบัน
                </span>
              )}
            </div>
            
            <button 
              type="submit" 
              disabled={isInvalidPf}
              style={{ 
                background: isInvalidPf ? 'var(--bg-tertiary)' : 'linear-gradient(135deg, #FFB75E 0%, #ED8F03 100%)', 
                color: isInvalidPf ? 'var(--text-tertiary)' : 'white', 
                padding: '1rem', 
                borderRadius: '8px', 
                border: 'none', 
                fontSize: '1.1rem', 
                fontWeight: 'bold', 
                cursor: isInvalidPf ? 'not-allowed' : 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '0.5rem' 
              }}
            >
              <Zap size={20} /> คำนวณ Capacitor
            </button>
          </form>
        </div>

        {result && (
          <div className="equipment-card animate-fade-in" style={{ padding: '2rem', background: 'rgba(255, 165, 0, 0.05)', border: '1px solid rgba(255, 165, 0, 0.2)' }}>
            <h3 className="text-gradient-solar" style={{ marginBottom: '1.5rem' }}>ผลการคำนวณ</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>ขนาด Capacitor Bank ที่ต้องติดตั้งเพิ่ม</p>
                <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--accent-solar)' }}>
                  {result.kvar} <span style={{ fontSize: '1.2rem', fontWeight: 'normal' }}>kVAr</span>
                </p>
              </div>

              <div style={{ padding: '1.5rem', background: 'var(--bg-primary)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#4CAF50' }}>
                  <TrendingUp size={20} /> <strong style={{ fontSize: '1.1rem' }}>วิเคราะห์ความคุ้มทุน (ประเมิน)</strong>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>ประหยัดค่าปรับ (ต่อเดือน)</span>
                    <strong style={{ fontSize: '1.2rem' }}>{Number(result.savings).toLocaleString()} ฿</strong>
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>ระยะเวลาคืนทุน (เดือน)</span>
                    <strong style={{ fontSize: '1.2rem' }}>{result.roi}</strong>
                  </div>
                </div>
              </div>
            </div>
            
            <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
              * หมายเหตุ: การคำนวณค่าปรับและระยะเวลาคืนทุนเป็นการประเมินเบื้องต้น โดยอิงจากอัตราค่าปรับ PF เฉลี่ยที่ 56 บาท/kVAr และราคาติดตั้ง Capacitor Bank เฉลี่ยที่ 800 บาท/kVAr
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PfcCalculator;
