import React, { useState, useMemo } from 'react';
import { ArrowLeft, Lightbulb, Grid3x3, AlertTriangle, Settings, Printer, CheckCircle, Sliders, Zap, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Tooltip from '../components/Tooltip';

const ROOM_TYPES = [
  { name: 'ห้องนั่งเล่น / ทางเดิน (150 Lux)', lux: 150, becLpd: 10 },
  { name: 'ห้องนอน (150 Lux)', lux: 150, becLpd: 10 },
  { name: 'ห้องน้ำ (200 Lux)', lux: 200, becLpd: 10 },
  { name: 'ห้องครัว (300 Lux)', lux: 300, becLpd: 12 },
  { name: 'ห้องเรียน / สำนักงาน (500 Lux)', lux: 500, becLpd: 10 },
  { name: 'ห้องทำงาน / อ่านหนังสือ (500 Lux)', lux: 500, becLpd: 10 },
  { name: 'ร้านค้า / ห้างสรรพสินค้า (750 Lux)', lux: 750, becLpd: 14 },
  { name: 'งานละเอียด / วาดแบบ (1000 Lux)', lux: 1000, becLpd: 15 },
  { name: 'คลังสินค้า / โรงงาน (300 Lux)', lux: 300, becLpd: 6 },
];

const LAMP_TYPES = [
  { id: 'led_panel_60x60', name: 'โคมพาเนล LED 60x60 cm (36W / 3,600 lm)', watts: 36, lumen: 3600 },
  { id: 'downlight_12w', name: 'โคมดาวน์ไลท์ LED 12W (1,000 lm)', watts: 12, lumen: 1000 },
  { id: 'downlight_15w', name: 'โคมดาวน์ไลท์ LED 15W (1,300 lm)', watts: 15, lumen: 1300 },
  { id: 'led_bulb_9w', name: 'หลอด LED Bulb 9W (800 lm)', watts: 9, lumen: 800 },
  { id: 'led_bulb_12w', name: 'หลอด LED Bulb 12W (1,050 lm)', watts: 12, lumen: 1050 },
  { id: 'led_tube_18w', name: 'หลอดยาว LED Tube 18W (1,800 lm)', watts: 18, lumen: 1800 },
  { id: 'highbay_100w', name: 'โคมไฮเบย์โรงงาน LED 100W (12,000 lm)', watts: 100, lumen: 12000 },
  { id: 'custom', name: '⚙️ กำหนดเอง (Custom)', watts: 10, lumen: 1000 }
];

const LightingCalculator = () => {
  const navigate = useNavigate();

  // Basic Inputs
  const [width, setWidth] = useState(4);
  const [length, setLength] = useState(5);
  const [targetLux, setTargetLux] = useState(ROOM_TYPES[4].lux);
  const [selectedLampId, setSelectedLampId] = useState('led_panel_60x60');
  const [customWatts, setCustomWatts] = useState(36);
  const [customLumen, setCustomLumen] = useState(3600);

  // Advanced Inputs
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [roomHeight, setRoomHeight] = useState(2.8);
  const [workplaneHeight, setWorkplaneHeight] = useState(0.75);
  const [reflectance, setReflectance] = useState('medium'); // 'high', 'medium', 'low'
  const [maintenanceFactor, setMaintenanceFactor] = useState(0.8);
  
  // Quick-fix manual lamp count override
  const [overrideLamps, setOverrideLamps] = useState(null);

  const selectedLamp = LAMP_TYPES.find(l => l.id === selectedLampId) || LAMP_TYPES[0];
  const lampWatts = selectedLampId === 'custom' ? (Number(customWatts) || 1) : selectedLamp.watts;
  const lampLumen = selectedLampId === 'custom' ? (Number(customLumen) || 100) : selectedLamp.lumen;

  const area = width * length;

  const handleLampSelect = (lampId) => {
    setSelectedLampId(lampId);
    setOverrideLamps(null); // Reset override on lamp change
    const lamp = LAMP_TYPES.find(l => l.id === lampId);
    if (lamp && lamp.id !== 'custom') {
      setCustomWatts(lamp.watts);
      setCustomLumen(lamp.lumen);
    }
  };

  // Calculation Engine
  const result = useMemo(() => {
    if (area <= 0 || targetLux <= 0 || lampLumen <= 0) {
      return null;
    }

    // 1. Calculate Room Cavity Ratio (RCR)
    const hRc = Math.max(0.5, roomHeight - workplaneHeight); // Cavity height
    const rcr = (5 * hRc * (length + width)) / area;

    // 2. Dynamic Utilization Factor (UF) based on RCR and Reflectance
    let baseUf = Math.max(0.35, 0.70 - (rcr * 0.04));
    if (reflectance === 'high') baseUf *= 1.08;
    else if (reflectance === 'low') baseUf *= 0.85;

    const uf = Math.min(0.85, Math.max(0.30, baseUf));

    // 3. Required Lumens & Lamp Count
    const requiredTotalLumens = (targetLux * area) / (maintenanceFactor * uf);
    const calculatedLamps = requiredTotalLumens / lampLumen;
    const roundedLamps = Math.ceil(calculatedLamps);

    // Active Lamp count (Default rounded or Override)
    const activeLamps = overrideLamps !== null ? overrideLamps : roundedLamps;

    // 4. Actual Lux & Energy Metrics (LPD)
    const actualLux = (activeLamps * lampLumen * maintenanceFactor * uf) / area;
    const totalWatts = activeLamps * lampWatts;
    const lpd = totalWatts / area; // W / sq.m

    // BEC Target Benchmark
    const currentRoomObj = ROOM_TYPES.find(r => r.lux === targetLux) || ROOM_TYPES[4];
    const maxBecLpd = currentRoomObj.becLpd;
    const isLpdPassed = lpd <= maxBecLpd;

    // 5. Grid Layout Logic (Symmetrical Nx x Ny)
    const aspect = length / width;
    let cols = Math.max(1, Math.round(Math.sqrt(activeLamps / aspect)));
    let rows = Math.max(1, Math.ceil(activeLamps / cols));

    if (rows * cols < activeLamps) {
      cols = Math.ceil(Math.sqrt(activeLamps / aspect));
      rows = Math.ceil(activeLamps / cols);
    }

    // 6. Grid Spacing & Wall Offsets
    const spacingCols = width / cols;
    const spacingRows = length / rows;
    const wallOffsetCols = spacingCols / 2;
    const wallOffsetRows = spacingRows / 2;

    // 7. Symmetrical Quick-Fix Options
    const optLowerCols = Math.max(1, Math.floor(Math.sqrt(calculatedLamps / aspect)));
    const optLowerRows = Math.max(1, Math.floor(calculatedLamps / optLowerCols));
    const optLowerCount = optLowerCols * optLowerRows;
    const optLowerLux = Math.round((optLowerCount * lampLumen * maintenanceFactor * uf) / area);

    const optUpperCols = Math.max(1, Math.ceil(Math.sqrt(calculatedLamps / aspect)));
    const optUpperRows = Math.max(1, Math.ceil(calculatedLamps / optUpperCols));
    const optUpperCount = optUpperCols * optUpperRows;
    const optUpperLux = Math.round((optUpperCount * lampLumen * maintenanceFactor * uf) / area);

    return {
      lamps: activeLamps,
      exactLamps: calculatedLamps.toFixed(2),
      actualLux: Math.round(actualLux),
      rcr: rcr.toFixed(1),
      uf: uf.toFixed(2),
      mf: maintenanceFactor,
      totalWatts,
      lpd: lpd.toFixed(2),
      maxBecLpd,
      isLpdPassed,
      grid: { rows, cols },
      spacing: {
        cols: spacingCols.toFixed(2),
        rows: spacingRows.toFixed(2),
        wallCols: wallOffsetCols.toFixed(2),
        wallRows: wallOffsetRows.toFixed(2)
      },
      quickFix: {
        lowerCount: optLowerCount,
        lowerGrid: `${optLowerRows}x${optLowerCols}`,
        lowerLux: optLowerLux,
        upperCount: optUpperCount,
        upperGrid: `${optUpperRows}x${optUpperCols}`,
        upperLux: optUpperLux
      }
    };
  }, [area, targetLux, lampLumen, lampWatts, maintenanceFactor, roomHeight, workplaneHeight, reflectance, width, length, overrideLamps]);

  const inputStyle = { width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none', fontSize: '1rem' };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      
      {/* Header */}
      <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '0.5rem' }}>
          <ArrowLeft size={24} />
        </button>
        <div style={{ flex: 1 }}>
          <h1 className="text-gradient-solar" style={{ marginBottom: 0, fontSize: '2rem' }}>โปรแกรมคำนวณแสงสว่าง (Advanced Lighting & Lux)</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Lumen Method, Building Energy Code (BEC LPD), RCR, and Ceiling Grid Spacing</p>
        </div>
        <button onClick={() => window.print()} style={{ background: 'var(--accent-secondary)', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Printer size={20} /> พิมพ์เป็น PDF
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem', alignItems: 'flex-start' }}>
        
        {/* INPUT FORM SECTION */}
        <div className="equipment-card no-print" style={{ padding: '1.75rem' }}>
          <h3 style={{ margin: '0 0 1.25rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Lightbulb size={22} className="text-solar" /> ข้อมูลพื้นที่และการใช้งาน
          </h3>

          <form style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Room Dimensions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>ความกว้าง W (เมตร)</label>
                <input type="number" min="1" step="0.5" value={width} onChange={(e) => { setWidth(Number(e.target.value)); setOverrideLamps(null); }} style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>ความยาว L (เมตร)</label>
                <input type="number" min="1" step="0.5" value={length} onChange={(e) => { setLength(Number(e.target.value)); setOverrideLamps(null); }} style={inputStyle} />
              </div>
            </div>

            {/* Room Type (Target Lux) */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>ประเภทห้อง (ความสว่างเป้าหมาย Lux)</label>
              <select value={targetLux} onChange={(e) => { setTargetLux(Number(e.target.value)); setOverrideLamps(null); }} style={inputStyle}>
                {ROOM_TYPES.map((r, i) => (
                  <option key={i} value={r.lux}>{r.name}</option>
                ))}
              </select>
            </div>

            {/* Lamp Selection */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>ประเภทโคมไฟ / หลอดไฟ</label>
              <select value={selectedLampId} onChange={(e) => handleLampSelect(e.target.value)} style={inputStyle}>
                {LAMP_TYPES.map((l) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>

            {selectedLampId === 'custom' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>กำลังไฟ (Watts)</label>
                  <input type="number" value={customWatts} onChange={(e) => setCustomWatts(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>ความสว่าง (Lumens)</label>
                  <input type="number" value={customLumen} onChange={(e) => setCustomLumen(e.target.value)} style={inputStyle} />
                </div>
              </div>
            )}

            {/* Advanced Settings Toggle */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              <button 
                type="button" 
                onClick={() => setShowAdvanced(!showAdvanced)} 
                style={{ background: 'none', border: 'none', color: 'var(--accent-solar)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.4rem', padding: 0 }}
              >
                <Sliders size={16} /> {showAdvanced ? '▲ ซ่อนตั้งค่าขั้นสูง (สำหรับวิศวกรรม)' : '▼ แสดงตั้งค่าขั้นสูง (ความสูงห้อง H, Workplane, ค่าสะท้อนแสง)'}
              </button>

              {showAdvanced && (
                <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>ความสูงห้อง H (เมตร)</label>
                      <input type="number" step="0.1" value={roomHeight} onChange={(e) => setRoomHeight(Number(e.target.value))} style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>ระดับโต๊ะทำงาน Hw (เมตร)</label>
                      <input type="number" step="0.05" value={workplaneHeight} onChange={(e) => setWorkplaneHeight(Number(e.target.value))} style={inputStyle} />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>ค่าการสะท้อนแสงของผนัง/เพดาน (Reflectance)</label>
                    <select value={reflectance} onChange={(e) => setReflectance(e.target.value)} style={inputStyle}>
                      <option value="high">สูง (เพดาน 70% / ผนังขาว 50%)</option>
                      <option value="medium">ปานกลาง (เพดาน 50% / ผนัง 30%)</option>
                      <option value="low">ต่ำ (เพดานมืด / ผนังทาสีเข้ม 10%)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                      <span>Maintenance Factor (MF)</span>
                      <strong style={{ color: 'var(--accent-solar)' }}>{maintenanceFactor}</strong>
                    </label>
                    <input type="range" min="0.5" max="1.0" step="0.05" value={maintenanceFactor} onChange={(e) => setMaintenanceFactor(Number(e.target.value))} style={{ width: '100%', accentColor: 'var(--accent-solar)', cursor: 'pointer' }} />
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* RESULTS SECTION */}
        {result && (
          <div className="equipment-card animate-fade-in" style={{ padding: '1.75rem', background: 'rgba(255, 165, 0, 0.03)', border: '1px solid rgba(255, 165, 0, 0.2)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Lamp Count Header Card */}
            <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', gap: '1rem', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--accent-solar)' }}>
              <div style={{ background: 'var(--accent-solar)', color: 'white', padding: '0.85rem', borderRadius: '50%', flexShrink: 0 }}>
                <Lightbulb size={32} />
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>จำนวนโคมไฟที่แนะนำ (Lumen Method)</span>
                <div style={{ fontSize: '2.8rem', fontWeight: 'bold', color: 'white', lineHeight: 1, margin: '0.2rem 0' }}>
                  {result.lamps} <span style={{ fontSize: '1.2rem', color: 'var(--text-primary)', fontWeight: 'normal' }}>ดวง</span>
                </div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
                  คำนวณเป๊ะได้ {result.exactLamps} ดวง {overrideLamps !== null && '(กำหนดจำนวนเอง)'}
                </span>
              </div>

              {overrideLamps !== null && (
                <button onClick={() => setOverrideLamps(null)} style={{ padding: '0.4rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-secondary)', fontSize: '0.78rem', cursor: 'pointer' }}>
                  🔄 รีเซ็ตค่าคำนวณ
                </button>
              )}
            </div>

            {/* Metrics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>ความสว่างที่ได้จริง</span>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0.2rem 0 0', color: result.actualLux >= targetLux ? '#10b981' : '#f59e0b' }}>
                  {result.actualLux} <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Lux</span>
                </p>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>เป้าหมาย {targetLux} Lux</span>
              </div>

              <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>ความหนาแน่นกำลังไฟ (LPD)</span>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0.2rem 0 0', color: result.isLpdPassed ? '#10b981' : '#ef4444' }}>
                  {result.lpd} <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>W/m²</span>
                </p>
                <span style={{ fontSize: '0.75rem', color: result.isLpdPassed ? '#10b981' : '#ef4444' }}>
                  {result.isLpdPassed ? `✓ ผ่านเกณฑ์ BEC (<= ${result.maxBecLpd} W/m²)` : `⚠️ เกินเกณฑ์ BEC (> ${result.maxBecLpd} W/m²)`}
                </span>
              </div>
            </div>

            {/* Ceiling Grid Spacing Breakdown Card */}
            <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.88rem', color: 'var(--accent-solar)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                📏 ระยะระบุตำแหน่งติดตั้งบนเพดาน (Ceiling Grid Spacing)
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.82rem' }}>
                <div>• ระยะห่างระหว่างโคม (กว้าง): <strong>{result.spacing.cols} ม.</strong></div>
                <div>• ระยะห่างจากผนัง (กว้าง): <strong>{result.spacing.wallCols} ม.</strong></div>
                <div>• ระยะห่างระหว่างโคม (ยาว): <strong>{result.spacing.rows} ม.</strong></div>
                <div>• ระยะห่างจากผนัง (ยาว): <strong>{result.spacing.wallRows} ม.</strong></div>
              </div>
            </div>

            {/* Visual Grid Visualizer */}
            <div style={{ background: 'var(--bg-tertiary)', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', marginBottom: '0.75rem' }}>
                <h4 style={{ margin: 0, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Grid3x3 size={18} className="text-solar" /> รูปแบบการจัดวาง Grid บนเพดาน
                </h4>
                <span style={{ fontSize: '0.8rem', color: 'var(--accent-solar)', fontWeight: 'bold' }}>
                  {result.grid.rows} แถว x {result.grid.cols} คอลัมน์ (รวม {result.grid.rows * result.grid.cols} ช่อง)
                </span>
              </div>

              <div style={{ 
                background: 'rgba(0,0,0,0.3)', border: '2px dashed var(--border-color)', borderRadius: '10px',
                padding: '1.5rem', aspectRatio: `${width} / ${length}`,
                display: 'grid', gridTemplateColumns: `repeat(${result.grid.cols}, 1fr)`, gridTemplateRows: `repeat(${result.grid.rows}, 1fr)`,
                gap: '0.75rem', alignItems: 'center', justifyItems: 'center', width: '100%', maxWidth: '280px', margin: '0 auto'
              }}>
                {Array.from({ length: result.lamps }).map((_, i) => (
                  <div key={i} style={{ width: '14px', height: '14px', background: 'var(--accent-solar)', borderRadius: '50%', boxShadow: '0 0 12px var(--accent-solar)' }} />
                ))}
              </div>

              {/* Quick-Fix Layout Buttons if not fitting grid */}
              {result.lamps !== result.grid.rows * result.grid.cols && (
                <div style={{ marginTop: '1rem', padding: '0.85rem', background: 'rgba(255, 165, 0, 0.1)', border: '1px solid rgba(255, 165, 0, 0.3)', borderRadius: '8px' }}>
                  <p style={{ margin: '0 0 0.5rem', fontSize: '0.8rem', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <AlertTriangle size={16} /> จำนวนโคมไม่พอดีกับ Grid สมมาตร เลือกปรับเป็นจำนวนคู่อัตโนมัติ:
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button type="button" onClick={() => setOverrideLamps(result.quickFix.lowerCount)} style={{ flex: 1, padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.78rem', cursor: 'pointer' }}>
                      ⚡ ปรับเป็น {result.quickFix.lowerCount} ดวง ({result.quickFix.lowerGrid}) ~{result.quickFix.lowerLux} Lux
                    </button>
                    <button type="button" onClick={() => setOverrideLamps(result.quickFix.upperCount)} style={{ flex: 1, padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.78rem', cursor: 'pointer' }}>
                      ✨ ปรับเป็น {result.quickFix.upperCount} ดวง ({result.quickFix.upperGrid}) ~{result.quickFix.upperLux} Lux
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Technical Context Footnote */}
            <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
              * อ้างอิงวิธี Lumen Method | ดรรชนีห้อง (RCR): {result.rcr} | สัมประสิทธิ์การใช้งาน (UF): {result.uf} | ค่าเผื่อฝุ่น (MF): {result.mf}
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default LightingCalculator;
