import { useState, useMemo } from 'react';
import { ArrowLeft, Lightbulb, Grid3x3, AlertTriangle, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ROOM_TYPES = [
  { name: 'ห้องนั่งเล่น / ทางเดิน (150 Lux)', lux: 150 },
  { name: 'ห้องนอน (150 Lux)', lux: 150 },
  { name: 'ห้องน้ำ (200 Lux)', lux: 200 },
  { name: 'ห้องครัว (300 Lux)', lux: 300 },
  { name: 'ห้องเรียน / ห้องประชุม (500 Lux)', lux: 500 },
  { name: 'ห้องทำงาน / อ่านหนังสือ (500 Lux)', lux: 500 },
  { name: 'งานละเอียด / วาดแบบ (1000 Lux)', lux: 1000 },
];

const LAMP_TYPES = [
  { name: 'หลอด LED Bulb 9W (~800 lm)', lumen: 800 },
  { name: 'หลอด LED Bulb 12W (~1050 lm)', lumen: 1050 },
  { name: 'โคมไฟดาวน์ไลท์ LED 12W (~1000 lm)', lumen: 1000 },
  { name: 'โคมไฟดาวน์ไลท์ LED 15W (~1300 lm)', lumen: 1300 },
  { name: 'หลอดยาว LED Tube 9W (~900 lm)', lumen: 900 },
  { name: 'หลอดยาว LED Tube 18W (~1800 lm)', lumen: 1800 },
  { name: 'โคมฟลูออเรสเซนต์ 36W รุ่นเก่า (~2500 lm)', lumen: 2500 },
];

const LightingCalculator = () => {
  const navigate = useNavigate();
  const [width, setWidth] = useState(4);
  const [length, setLength] = useState(5);
  const [targetLux, setTargetLux] = useState(ROOM_TYPES[5].lux);
  const [lampLumen, setLampLumen] = useState(LAMP_TYPES[0].lumen);
  
  // Advanced Settings
  const [maintenanceFactor, setMaintenanceFactor] = useState(0.8);
  const [utilizationFactor, setUtilizationFactor] = useState(0.6);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Calculation
  const area = width * length;
  
  const result = useMemo(() => {
    if (area <= 0 || targetLux <= 0 || lampLumen <= 0) return { lamps: 0, actualLux: 0, grid: { rows: 1, cols: 1 } };
    
    // Formula: E = (N * F * UF * MF) / A  =>  N = (E * A) / (F * UF * MF)
    const requiredTotalLumens = (targetLux * area) / (maintenanceFactor * utilizationFactor);
    const calculatedLamps = requiredTotalLumens / lampLumen;
    const roundedLamps = Math.ceil(calculatedLamps);
    
    // Reverse calculation to find actual Lux with rounded lamps
    const actualLux = (roundedLamps * lampLumen * maintenanceFactor * utilizationFactor) / area;
    
    // Grid Arrangement Suggestion
    // Simple heuristic for grid layout
    const aspect = length / width;
    let cols = Math.max(1, Math.round(Math.sqrt(roundedLamps / aspect)));
    let rows = Math.max(1, Math.ceil(roundedLamps / cols));
    
    // If rows * cols is significantly larger than needed, adjust
    if (rows * cols > roundedLamps + Math.max(rows, cols)) {
      cols = Math.ceil(Math.sqrt(roundedLamps / aspect));
      rows = Math.ceil(roundedLamps / cols);
    }
    
    return {
      lamps: roundedLamps,
      exactLamps: calculatedLamps.toFixed(2),
      actualLux: Math.round(actualLux),
      grid: { rows, cols }
    };
  }, [area, targetLux, lampLumen, maintenanceFactor, utilizationFactor, width, length]);

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '0.5rem' }}>
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-gradient-solar" style={{ marginBottom: 0, fontSize: '2rem' }}>โปรแกรมคำนวณแสงสว่าง</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Lighting & Lux Calculator</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        {/* Input Form */}
        <div className="equipment-card" style={{ padding: '2rem' }}>
          <h3 style={{ margin: '0 0 1.5rem', color: 'var(--text-primary)' }}>ข้อมูลพื้นที่และการใช้งาน</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>ความกว้าง (เมตร)</label>
              <input 
                type="number" min="1" step="0.5" value={width} 
                onChange={(e) => setWidth(Number(e.target.value))}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }} 
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>ความยาว (เมตร)</label>
              <input 
                type="number" min="1" step="0.5" value={length} 
                onChange={(e) => setLength(Number(e.target.value))}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }} 
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>ประเภทห้อง (ความสว่างเป้าหมาย)</label>
            <select 
              value={targetLux} 
              onChange={(e) => setTargetLux(Number(e.target.value))}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', marginBottom: '0.5rem' }}
            >
              {ROOM_TYPES.map((r, i) => (
                <option key={i} value={r.lux}>{r.name}</option>
              ))}
              <option value="custom">กำหนดเอง (Custom)</option>
            </select>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input 
                type="number" min="10" value={targetLux} 
                onChange={(e) => setTargetLux(Number(e.target.value))}
                style={{ width: '100px', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }} 
              />
              <span style={{ color: 'var(--text-tertiary)' }}>Lux</span>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>ประเภทหลอดไฟ</label>
            <select 
              value={lampLumen} 
              onChange={(e) => setLampLumen(Number(e.target.value))}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', marginBottom: '0.5rem' }}
            >
              {LAMP_TYPES.map((l, i) => (
                <option key={i} value={l.lumen}>{l.name}</option>
              ))}
              <option value="custom">กำหนดเอง (Custom)</option>
            </select>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input 
                type="number" min="10" value={lampLumen} 
                onChange={(e) => setLampLumen(Number(e.target.value))}
                style={{ width: '100px', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }} 
              />
              <span style={{ color: 'var(--text-tertiary)' }}>Lumen / ดวง</span>
            </div>
          </div>

          {/* Advanced Settings Toggle */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
            <button 
              onClick={() => setShowAdvanced(!showAdvanced)}
              style={{ background: 'transparent', border: 'none', color: 'var(--accent-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: 0 }}
            >
              <Settings size={16} /> 
              {showAdvanced ? 'ซ่อนการตั้งค่าขั้นสูง (สำหรับวิศวกร)' : 'แสดงการตั้งค่าขั้นสูง (สำหรับวิศวกร)'}
            </button>
            
            {showAdvanced && (
              <div style={{ marginTop: '1rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', display: 'grid', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    <span>Maintenance Factor (MF)</span>
                    <span>{maintenanceFactor}</span>
                  </label>
                  <input 
                    type="range" min="0.5" max="1.0" step="0.05" value={maintenanceFactor} 
                    onChange={(e) => setMaintenanceFactor(Number(e.target.value))}
                    style={{ width: '100%' }} 
                  />
                  <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>ค่าเผื่อฝุ่นเกาะ/หลอดเสื่อมสภาพ (ปกติ 0.8)</p>
                </div>
                <div>
                  <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    <span>Utilization Factor (UF)</span>
                    <span>{utilizationFactor}</span>
                  </label>
                  <input 
                    type="range" min="0.3" max="1.0" step="0.05" value={utilizationFactor} 
                    onChange={(e) => setUtilizationFactor(Number(e.target.value))}
                    style={{ width: '100%' }} 
                  />
                  <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>ค่าสัมประสิทธิ์การสะท้อนแสงของห้อง (ปกติ 0.6)</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="equipment-card" style={{ padding: '2rem', background: 'linear-gradient(135deg, var(--bg-secondary) 0%, rgba(254, 202, 87, 0.05) 100%)', border: '1px solid var(--accent-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ background: 'var(--accent-secondary)', color: 'white', padding: '1rem', borderRadius: '50%' }}>
                <Lightbulb size={32} />
              </div>
              <div>
                <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>จำนวนหลอดไฟที่แนะนำ</h3>
                <p style={{ margin: 0, color: 'var(--accent-secondary)', fontWeight: 'bold' }}>Lumen Method Calculation</p>
              </div>
            </div>
            
            <div style={{ fontSize: '4rem', fontWeight: 'bold', color: 'var(--text-primary)', lineHeight: 1, marginBottom: '0.5rem' }}>
              {result.lamps} <span style={{ fontSize: '1.5rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}>ดวง</span>
            </div>
            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              คำนวณเป๊ะๆ ได้ {result.exactLamps} ดวง (ปัดเศษขึ้นเพื่อความสว่างที่เพียงพอ)
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>ความสว่างที่ได้จริง</div>
                <div style={{ color: result.actualLux >= targetLux ? '#4CAF50' : '#F44336', fontSize: '1.5rem', fontWeight: 'bold' }}>
                  {result.actualLux} <span style={{ fontSize: '1rem', fontWeight: 'normal' }}>Lux</span>
                </div>
                <div style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>เป้าหมาย {targetLux} Lux</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>พื้นที่ห้อง</div>
                <div style={{ color: 'var(--text-primary)', fontSize: '1.5rem', fontWeight: 'bold' }}>
                  {area} <span style={{ fontSize: '1rem', fontWeight: 'normal' }}>ตร.ม.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Grid Layout Visualizer */}
          <div className="equipment-card" style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <Grid3x3 size={20} color="var(--accent-secondary)" />
              <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>ไอเดียการจัดวาง (Visual Grid)</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              แนะนำให้เรียงแบบ {result.grid.rows} แถว แถวละ {result.grid.cols} ดวง (รวม {result.grid.rows * result.grid.cols} ดวง)
            </p>

            <div style={{ 
              background: 'rgba(0,0,0,0.2)', 
              border: '2px dashed rgba(255,255,255,0.1)', 
              borderRadius: '12px',
              padding: '2rem',
              aspectRatio: `${width} / ${length}`,
              display: 'grid',
              gridTemplateColumns: `repeat(${result.grid.cols}, 1fr)`,
              gridTemplateRows: `repeat(${result.grid.rows}, 1fr)`,
              gap: '1rem',
              alignItems: 'center',
              justifyItems: 'center',
              width: '100%',
              maxWidth: '300px',
              margin: '0 auto auto auto'
            }}>
              {Array.from({ length: result.lamps }).map((_, i) => (
                <div key={i} style={{ 
                  width: '16px', 
                  height: '16px', 
                  background: 'var(--accent-secondary)', 
                  borderRadius: '50%',
                  boxShadow: '0 0 15px var(--accent-secondary)',
                  animation: 'pulse 2s infinite'
                }} />
              ))}
            </div>
            
            {result.lamps !== result.grid.rows * result.grid.cols && (
              <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', color: '#feca57', fontSize: '0.85rem', background: 'rgba(254, 202, 87, 0.1)', padding: '1rem', borderRadius: '8px' }}>
                <AlertTriangle size={24} style={{ flexShrink: 0 }} />
                <span>จำนวนไฟไม่พอดีกับรูปแบบ Grid สมมาตร คุณอาจต้องปรับตำแหน่งบางดวง หรือเพิ่ม/ลดไฟให้ครบคู่ครับ</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LightingCalculator;
