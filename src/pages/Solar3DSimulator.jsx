import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Sun, ShieldCheck, Zap, Compass, RefreshCw, Printer, ArrowLeft, Sliders, Layers, AlertCircle, TrendingUp, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// Solar Physics Calculation Helpers (Thailand Latitude ~13.75° N)
const calculateSunPosition = (timeHour) => {
  // 06:00 (sunrise) to 18:00 (sunset)
  const normTime = (timeHour - 6) / 12; // 0 to 1
  const elevationRad = Math.sin(normTime * Math.PI) * (Math.PI / 2); // 0° -> 90° -> 0°
  const elevationDeg = (elevationRad * 180) / Math.PI;

  // Sun Azimuth: East (90°) -> South (180°) -> West (270°)
  const azimuthDeg = 90 + normTime * 180;

  return { elevationDeg, azimuthDeg, normTime };
};

const Solar3DSimulator = () => {
  const navigate = useNavigate();
  const [timeOfDay, setTimeOfDay] = useState(12.5); // 12:30 PM
  const [roofType, setRoofType] = useState('gable'); // 'gable' | 'hip' | 'flat'
  const [roofPitch, setRoofPitch] = useState(15); // 15° pitch
  const [roofOrientation, setRoofOrientation] = useState(180); // 180° = South (Best in TH)
  const [panelCount, setPanelCount] = useState(16); // 16 panels * 550W = 8.8 kWp
  const [obstacleType, setObstacleType] = useState('tree'); // 'tree' | 'building' | 'none'
  const [obstacleDistance, setObstacleDistance] = useState(8); // meters

  const canvasRef = useRef(null);

  // Sun Position & Solar Physics Calculation
  const solarPhysics = useMemo(() => {
    const { elevationDeg, azimuthDeg, normTime } = calculateSunPosition(timeOfDay);

    // Incidence Angle Calculation (Angle between sun rays & roof normal)
    const roofPitchRad = (roofPitch * Math.PI) / 180;
    const roofAzimuthRad = (roofOrientation * Math.PI) / 180;
    const sunElevRad = (elevationDeg * Math.PI) / 180;
    const sunAzimRad = (azimuthDeg * Math.PI) / 180;

    // Cosine of incidence angle
    const cosIncidence =
      Math.sin(sunElevRad) * Math.cos(roofPitchRad) +
      Math.cos(sunElevRad) * Math.sin(roofPitchRad) * Math.cos(sunAzimRad - roofAzimuthRad);

    const incidenceFactor = Math.max(0, cosIncidence);

    // Shading loss from obstacles (trees/buildings) during morning/evening
    let shadingLossFactor = 0;
    if (obstacleType !== 'none') {
      if (timeOfDay < 9.5 || timeOfDay > 15.5) {
        shadingLossFactor = obstacleType === 'tree' ? 0.35 : 0.60;
      }
    }

    // Solar Irradiance (W/m2) peak at 1000 W/m2 at noon
    const rawIrradiance = Math.sin(normTime * Math.PI) * 1000;
    const effectiveIrradiance = Math.max(0, rawIrradiance * incidenceFactor * (1 - shadingLossFactor));

    // DC Power Output (Panel rating 550W)
    const systemCapacityKwp = (panelCount * 550) / 1000; // kWp
    const inverterEfficiency = 0.96;
    const currentPowerKw = (effectiveIrradiance / 1000) * systemCapacityKwp * inverterEfficiency;

    // Estimate Daily & Monthly Generation
    const dailyKwh = systemCapacityKwp * 4.2 * (Math.cos((roofPitch - 15) * (Math.PI / 180))) * (1 - (shadingLossFactor * 0.2));
    const monthlySavingsThb = dailyKwh * 30 * 4.5; // ~4.5 THB per kWh

    return {
      elevationDeg: elevationDeg.toFixed(1),
      azimuthDeg: azimuthDeg.toFixed(1),
      incidenceFactor: (incidenceFactor * 100).toFixed(1),
      effectiveIrradiance: Math.round(effectiveIrradiance),
      currentPowerKw: currentPowerKw.toFixed(2),
      systemCapacityKwp: systemCapacityKwp.toFixed(2),
      dailyKwh: dailyKwh.toFixed(1),
      monthlySavingsThb: Math.round(monthlySavingsThb),
      shadingLossPercent: Math.round(shadingLossFactor * 100),
    };
  }, [timeOfDay, roofPitch, roofOrientation, panelCount, obstacleType, obstacleDistance]);

  // Render 3D Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear Screen
    ctx.clearRect(0, 0, width, height);

    // Sky Background Gradient (Changes color based on time of day)
    const normTime = (timeOfDay - 6) / 12;
    const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
    if (timeOfDay < 7 || timeOfDay > 17) {
      skyGrad.addColorStop(0, '#1e1b4b');
      skyGrad.addColorStop(1, '#311b92');
    } else if (timeOfDay < 9 || timeOfDay > 15) {
      skyGrad.addColorStop(0, '#0284c7');
      skyGrad.addColorStop(1, '#38bdf8');
    } else {
      skyGrad.addColorStop(0, '#0369a1');
      skyGrad.addColorStop(1, '#0284c7');
    }
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, height);

    // Sun & Light Rays (Draw in background)
    const sunAngleRad = (normTime * Math.PI);
    const sunX = width - (normTime * (width - 100));
    const sunY = height - 120 - Math.sin(sunAngleRad) * (height - 180);

    ctx.shadowBlur = 25;
    ctx.shadowColor = '#f59e0b';
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(sunX, sunY, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Ground Surface
    ctx.fillStyle = '#15803d';
    ctx.fillRect(0, height - 100, width, 100);

    const centerX = width / 2;
    const centerY = height / 2 + 40;

    // Draw Obstacles (Trees / Buildings) on BOTH sides to explain morning & evening shading
    const { azimuthDeg, elevationDeg } = calculateSunPosition(timeOfDay);
    const isMorningShade = timeOfDay < 9.5;
    const isEveningShade = timeOfDay > 15.5;

    if (obstacleType !== 'none') {
      const drawObstacle = (ox, oy, type) => {
        if (type === 'tree') {
          ctx.fillStyle = '#78350f'; // Trunk
          ctx.fillRect(ox - 10, oy - 30, 20, 80);
          ctx.fillStyle = '#14532d'; // Leaves
          ctx.beginPath();
          ctx.arc(ox, oy - 60, 45, 0, Math.PI * 2);
          ctx.fill();
        } else if (type === 'building') {
          ctx.fillStyle = '#64748b'; // Building Wall
          ctx.fillRect(ox - 45, oy - 150, 90, 200);
          ctx.fillStyle = '#475569'; // Windows
          for (let i = 0; i < 4; i++) {
            ctx.fillRect(ox - 30, oy - 130 + (i * 30), 20, 15);
            ctx.fillRect(ox + 10, oy - 130 + (i * 30), 20, 15);
          }
        }
      };

      // Draw East Obstacle (Morning Shade) & West Obstacle (Evening Shade)
      drawObstacle(centerX + 260, centerY + 20, obstacleType); // East
      drawObstacle(centerX - 260, centerY + 20, obstacleType); // West

      // Draw dynamic shadow for East obstacle in morning
      if (isMorningShade) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.ellipse(centerX + 100, centerY + 40, 140, 20, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      // Draw dynamic shadow for West obstacle in evening
      if (isEveningShade) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.ellipse(centerX - 100, centerY + 40, 140, 20, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // House Walls
    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.moveTo(centerX - 120, centerY);
    ctx.lineTo(centerX + 120, centerY);
    ctx.lineTo(centerX + 120, centerY + 80);
    ctx.lineTo(centerX - 120, centerY + 80);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#475569';
    ctx.stroke();

    // 3D Roof
    ctx.fillStyle = roofType === 'flat' ? '#64748b' : '#b91c1c';
    ctx.beginPath();
    const pitchOffset = (roofPitch / 45) * 50;

    if (roofType === 'gable') {
      ctx.moveTo(centerX - 140, centerY);
      ctx.lineTo(centerX, centerY - 60 - pitchOffset);
      ctx.lineTo(centerX + 140, centerY);
    } else { // Hip / Flat
      ctx.moveTo(centerX - 130, centerY);
      ctx.lineTo(centerX - 60, centerY - 40 - pitchOffset);
      ctx.lineTo(centerX + 60, centerY - 40 - pitchOffset);
      ctx.lineTo(centerX + 130, centerY);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Draw Solar Panels Grid on Roof (Shading Effect Applied)
    const panelRows = 2;
    const panelCols = Math.min(8, Math.ceil(panelCount / 2));
    const startPx = centerX - (panelCols * 14);

    for (let r = 0; r < panelRows; r++) {
      for (let c = 0; c < panelCols; c++) {
        const px = startPx + c * 28;
        const py = centerY - 35 - pitchOffset * 0.5 + r * 16;
        
        // Determine if this specific panel is shaded by obstacle
        const isPanelShaded = obstacleType !== 'none' && (
          (isMorningShade && c >= panelCols / 2) || // East shadow hits right panels
          (isEveningShade && c < panelCols / 2)     // West shadow hits left panels
        );

        ctx.fillStyle = isPanelShaded ? '#1e293b' : '#1e3a8a'; // Dark grey if shaded, blue if active
        ctx.fillRect(px, py, 24, 12);
        ctx.strokeStyle = isPanelShaded ? '#334155' : '#38bdf8';
        ctx.strokeRect(px, py, 24, 12);
      }
    }

    // Sun Rays to Roof (only if not heavily shaded)
    if (!isMorningShade && !isEveningShade) {
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.4)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(sunX, sunY);
      ctx.lineTo(centerX, centerY - 40);
      ctx.stroke();
      ctx.setLineDash([]);
    }

  }, [timeOfDay, roofType, roofPitch, panelCount, obstacleType]);

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '4rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Sun color="var(--accent-solar)" size={28} />
            <h1 className="text-gradient-solar" style={{ fontSize: '2.3rem', marginBottom: 0 }}>3D Solar Roof & Sun Shadow Simulator</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            จำลองทิศทางแสงแดด มุมเอียงหลังคา เงาตกกระทบ และกำลังการผลิตไฟฟ้าโซลาร์เซลล์ 3D
          </p>
        </div>
      </div>

      {/* Main Grid Workspace */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* LEFT: 3D Visualizer Canvas & Time Slider */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div className="equipment-card" style={{ padding: '1.25rem', position: 'relative' }}>
            {/* Time Overlay Badge */}
            <div style={{ position: 'absolute', top: 25, left: 25, background: 'rgba(15, 23, 42, 0.85)', padding: '0.5rem 1rem', borderRadius: '50px', border: '1px solid var(--border-color)', color: 'white', fontWeight: 'bold', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sun size={18} color="#f59e0b" /> เวลา: {Math.floor(timeOfDay).toString().padStart(2, '0')}:{Math.round((timeOfDay % 1) * 60).toString().padStart(2, '0')} น.
            </div>

            <canvas
              ref={canvasRef}
              width={750}
              height={420}
              style={{ width: '100%', height: 'auto', borderRadius: '12px', display: 'block' }}
            />

            {/* Time Slider */}
            <div style={{ marginTop: '1.25rem', background: 'var(--bg-secondary)', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                <span>🌅 พระอาทิตย์ขึ้น (06:00 น.)</span>
                <strong style={{ color: 'var(--accent-solar)', fontSize: '1rem' }}>☀️ ปรับเวลาดวงอาทิตย์</strong>
                <span>🌇 พระอาทิตย์ตก (18:00 น.)</span>
              </div>
              <input
                type="range"
                min="6"
                max="18"
                step="0.25"
                value={timeOfDay}
                onChange={(e) => setTimeOfDay(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent-solar)', cursor: 'pointer' }}
              />
            </div>
          </div>

          {/* Daily Generation Curve Summary */}
          <div className="equipment-card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <TrendingUp size={18} color="#10b981" /> ผลการวิเคราะห์กำลังการผลิตประจำวัน
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', textAlign: 'center' }}>
              <div style={{ background: 'var(--bg-tertiary)', padding: '0.85rem', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>ความเข้มแสงแดด (Irradiance)</span>
                <strong style={{ display: 'block', fontSize: '1.2rem', color: '#f59e0b', marginTop: '0.2rem' }}>
                  {solarPhysics.effectiveIrradiance} W/m²
                </strong>
              </div>
              <div style={{ background: 'var(--bg-tertiary)', padding: '0.85rem', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>กำลังผลิต AC ขณะนี้</span>
                <strong style={{ display: 'block', fontSize: '1.2rem', color: '#00f0ff', marginTop: '0.2rem' }}>
                  {solarPhysics.currentPowerKw} kW
                </strong>
              </div>
              <div style={{ background: 'var(--bg-tertiary)', padding: '0.85rem', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>ผลิตได้ต่อวัน (Est.)</span>
                <strong style={{ display: 'block', fontSize: '1.2rem', color: '#10b981', marginTop: '0.2rem' }}>
                  {solarPhysics.dailyKwh} kWh
                </strong>
              </div>
              <div style={{ background: 'var(--bg-tertiary)', padding: '0.85rem', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>ประหยัดค่าไฟ/เดือน</span>
                <strong style={{ display: 'block', fontSize: '1.2rem', color: '#8b5cf6', marginTop: '0.2rem' }}>
                  ฿{solarPhysics.monthlySavingsThb.toLocaleString()}
                </strong>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT: Controls & Parameters Inspector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div className="equipment-card" style={{ padding: '1.25rem', border: '1px solid var(--accent-solar)' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Sliders size={18} color="var(--accent-solar)" /> ปรับแต่งสเปคหลังคาและโซลาร์
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', fontSize: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>รูปทรงหลังคา (Roof Type):</label>
                <select
                  value={roofType}
                  onChange={(e) => setRoofType(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                >
                  <option value="gable">หลังคาจั่ว (Gable Roof)</option>
                  <option value="hip">หลังคาปั้นหยา (Hip Roof)</option>
                  <option value="flat">หลังคาแฟลต / ดาดฟ้า (Flat Roof)</option>
                </select>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>องศาความเอียงหลังคา (Pitch):</span>
                  <strong style={{ color: 'var(--accent-solar)' }}>{roofPitch}°</strong>
                </div>
                <input
                  type="range"
                  min="5"
                  max="45"
                  value={roofPitch}
                  onChange={(e) => setRoofPitch(parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--accent-solar)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>ทิศทางรับแสง (Roof Azimuth):</label>
                <select
                  value={roofOrientation}
                  onChange={(e) => setRoofOrientation(parseInt(e.target.value))}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                >
                  <option value={180}>ทิศใต้ (South - ดีที่สุด 100%)</option>
                  <option value={90}>ทิศตะวันออก (East - 88%)</option>
                  <option value={270}>ทิศตะวันตก (West - 88%)</option>
                  <option value={0}>ทิศเหนือ (North - 70%)</option>
                </select>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>จำนวนแผงโซลาร์ (550W/แผง):</span>
                  <strong style={{ color: '#00f0ff' }}>{panelCount} แผง ({solarPhysics.systemCapacityKwp} kWp)</strong>
                </div>
                <input
                  type="range"
                  min="4"
                  max="32"
                  step="2"
                  value={panelCount}
                  onChange={(e) => setPanelCount(parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: '#00f0ff' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>สิ่งบังแสงบังเงา (Obstacle Shading):</label>
                <select
                  value={obstacleType}
                  onChange={(e) => setObstacleType(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                >
                  <option value="none">ไม่มีสิ่งบังแสง (No Shading)</option>
                  <option value="tree">มีต้นไม้ใหญ่ใกล้หลังคา (Tree Shade)</option>
                  <option value="building">มีอาคารสูงข้างเคียง (Building Shade)</option>
                </select>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Solar3DSimulator;
