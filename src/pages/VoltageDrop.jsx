import { useState } from 'react';
import { ArrowLeft, Zap, AlertTriangle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cableData, calculateVoltageDrop } from '../utils/engineering/voltageDrop';

const VoltageDrop = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState('1'); // 1 or 3
  const [current, setCurrent] = useState(''); // Amps
  const [distance, setDistance] = useState(''); // meters
  const [cableSize, setCableSize] = useState('4'); // sq.mm
  const [result, setResult] = useState(null);

  const calculateVD = (e) => {
    e.preventDefault();
    const calculationResult = calculateVoltageDrop(phase, current, distance, cableSize);
    if (!calculationResult) {
      alert("กรุณากรอกกระแสและระยะทางให้ถูกต้อง");
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
          <h1 className="text-gradient-solar" style={{ marginBottom: 0, fontSize: '2rem' }}>คำนวณแรงดันตก (Voltage Drop)</h1>
          <p style={{ color: 'var(--text-secondary)' }}>ตรวจสอบแรงดันตกตามระยะสายไฟ</p>
        </div>
      </div>

      <div className="grid-2">
        <div className="equipment-card" style={{ padding: '2rem' }}>
          <form onSubmit={calculateVD} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>ระบบไฟฟ้า</label>
              <select value={phase} onChange={(e) => setPhase(e.target.value)} style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
                <option value="1">1 Phase (230V)</option>
                <option value="3">3 Phase (400V)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>กระแสโหลด (A)</label>
              <input type="number" step="0.1" value={current} onChange={(e) => setCurrent(e.target.value)} required placeholder="เช่น 20" style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>ระยะทางสายไฟ (เมตร)</label>
              <input type="number" step="0.5" value={distance} onChange={(e) => setDistance(e.target.value)} required placeholder="เช่น 50" style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>ขนาดสายไฟทองแดง (ตร.มม.)</label>
              <select value={cableSize} onChange={(e) => setCableSize(e.target.value)} style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
                {Object.keys(cableData).map(size => (
                  <option key={size} value={size}>{size} sq.mm</option>
                ))}
              </select>
            </div>
            
            <button type="submit" style={{ background: 'linear-gradient(135deg, #FFB75E 0%, #ED8F03 100%)', color: 'white', padding: '1rem', borderRadius: '8px', border: 'none', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <Zap size={20} /> คำนวณ Voltage Drop
            </button>
          </form>
        </div>

        {result && (
          <div className="equipment-card animate-fade-in" style={{ padding: '2rem', border: `2px solid ${result.isPass ? '#4CAF50' : '#F44336'}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', color: result.isPass ? '#4CAF50' : '#F44336' }}>
              {result.isPass ? <CheckCircle size={32} /> : <AlertTriangle size={32} />}
              <h3 style={{ margin: 0, fontSize: '1.5rem' }}>
                {result.isPass ? 'ผ่านเกณฑ์มาตรฐาน' : 'ไม่ผ่านเกณฑ์! (แรงดันตกเกิน)'}
              </h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>แรงดันไฟฟ้าตกคร่อมสาย</p>
                <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                  {result.dropV} <span style={{ fontSize: '1.2rem', fontWeight: 'normal', color: 'var(--text-secondary)' }}>V</span>
                </p>
              </div>

              <div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>คิดเป็นเปอร์เซ็นต์ (อ้างอิง {result.voltage}V)</p>
                <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: result.isPass ? '#4CAF50' : '#F44336' }}>
                  {result.percent} <span style={{ fontSize: '1.2rem', fontWeight: 'normal' }}>%</span>
                </p>
              </div>
            </div>
            
            <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
              * มาตรฐานวิศวกรรมแนะนำให้แรงดันตก <strong>ไม่ควรเกิน 3%</strong> สำหรับโหลดแสงสว่างและ 5% สำหรับมอเตอร์/โหลดทั่วไป
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoltageDrop;
