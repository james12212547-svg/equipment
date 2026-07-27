import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Sun, ShieldCheck, Zap, Compass, RefreshCw, Printer, ArrowLeft, Sliders, Layers, AlertCircle, TrendingUp, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// -------------------------------------------------------------
// 1. Isometric 3D Projection Math Engine (30° Projection)
// -------------------------------------------------------------
const toIso = (x, y, z, originX, originY) => {
  // cos(30°) ≈ 0.866, sin(30°) = 0.5
  const isoX = originX + (x - y) * 0.866;
  const isoY = originY + (x + y) * 0.5 - z;
  return { x: isoX, y: isoY };
};

// -------------------------------------------------------------
// 2. Low-Poly 3D Isometric Tree Renderer (Cylindrical Trunk + Pyramid Canopy)
// -------------------------------------------------------------
const drawIsoTree = (ctx, origin, options) => {
  const { x = 0, y = 0, sunTime = 12 } = options;

  const shadowAngle = ((sunTime - 6) / 12) * Math.PI;
  const shadowLen = Math.abs(Math.cos(shadowAngle)) * 80;
  const shadowDir = sunTime < 12 ? -1 : 1;

  // Tree Shadow on Ground
  const sp = toIso(x + shadowLen * shadowDir * 0.5, y + 15, 0, origin.x, origin.y);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.beginPath();
  ctx.ellipse(sp.x, sp.y, 20, 10, Math.PI / 4, 0, Math.PI * 2);
  ctx.fill();

  // Trunk Base (3D Box)
  const tw = 8, td = 8, th = 24;
  const p0 = toIso(x - tw / 2, y - td / 2, 0, origin.x, origin.y);
  const p1 = toIso(x + tw / 2, y - td / 2, 0, origin.x, origin.y);
  const p2 = toIso(x + tw / 2, y + td / 2, 0, origin.x, origin.y);
  const p3 = toIso(x - tw / 2, y + td / 2, 0, origin.x, origin.y);

  const t0 = toIso(x - tw / 2, y - td / 2, th, origin.x, origin.y);
  const t2 = toIso(x + tw / 2, y + td / 2, th, origin.x, origin.y);
  const t3 = toIso(x - tw / 2, y + td / 2, th, origin.x, origin.y);

  ctx.fillStyle = '#451a03';
  ctx.beginPath();
  ctx.moveTo(p0.x, p0.y); ctx.lineTo(p3.x, p3.y);
  ctx.lineTo(t3.x, t3.y); ctx.lineTo(t0.x, t0.y);
  ctx.fill();

  ctx.fillStyle = '#290e02';
  ctx.beginPath();
  ctx.moveTo(p3.x, p3.y); ctx.lineTo(p2.x, p2.y);
  ctx.lineTo(t2.x, t2.y); ctx.lineTo(t3.x, t3.y);
  ctx.fill();

  // Foliage Layers (Green Pyramids)
  const drawCanopyPyramid = (cz, cw, ch, colLeft, colRight) => {
    const cp0 = toIso(x - cw / 2, y - cw / 2, cz, origin.x, origin.y);
    const cp1 = toIso(x + cw / 2, y - cw / 2, cz, origin.x, origin.y);
    const cp2 = toIso(x + cw / 2, y + cw / 2, cz, origin.x, origin.y);
    const cp3 = toIso(x - cw / 2, y + cw / 2, cz, origin.x, origin.y);
    const cpApex = toIso(x, y, cz + ch, origin.x, origin.y);

    ctx.fillStyle = colLeft;
    ctx.beginPath();
    ctx.moveTo(cp0.x, cp0.y); ctx.lineTo(cp3.x, cp3.y); ctx.lineTo(cpApex.x, cpApex.y);
    ctx.fill();

    ctx.fillStyle = colRight;
    ctx.beginPath();
    ctx.moveTo(cp3.x, cp3.y); ctx.lineTo(cp2.x, cp2.y); ctx.lineTo(cpApex.x, cpApex.y);
    ctx.fill();
  };

  drawCanopyPyramid(th, 36, 22, '#14532d', '#0f3923');
  drawCanopyPyramid(th + 16, 28, 20, '#16a34a', '#15803d');
  drawCanopyPyramid(th + 32, 20, 18, '#22c55e', '#16a34a');
};

// -------------------------------------------------------------
// 3. Clean Isometric House + Gable Roof + Solar Panels Engine
// -------------------------------------------------------------
const drawIsometricHouse = (ctx, origin, options) => {
  const { W = 100, D = 120, H_wall = 60, H_roof = 40, sunTime = 12, panelCount = 16, obstacleType = 'tree' } = options;

  // --- A. Draw Shadow on Ground FIRST (BEFORE House!) ---
  const shadowAngle = ((sunTime - 6) / 12) * Math.PI; // Sun angle according to time
  const shadowLen = Math.abs(Math.cos(shadowAngle)) * 110;
  const shadowDir = sunTime < 12 ? -1 : 1;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.beginPath();

  const x0 = -W / 2;
  const x1 = W / 2;
  const y0 = -D / 2;
  const y1 = D / 2;

  const b0 = toIso(x0, y0, 0, origin.x, origin.y);
  const b1 = toIso(x1, y0, 0, origin.x, origin.y);
  const b2 = toIso(x1, y1, 0, origin.x, origin.y);
  const b3 = toIso(x0, y1, 0, origin.x, origin.y);

  const shadowOffX = shadowLen * shadowDir;
  const shadowOffY = (1 - Math.sin(shadowAngle)) * 40;

  const s0 = toIso(x0 + shadowOffX, y0 + shadowOffY, 0, origin.x, origin.y);
  const s1 = toIso(x1 + shadowOffX, y0 + shadowOffY, 0, origin.x, origin.y);
  const s2 = toIso(x1 + shadowOffX, y1 + shadowOffY, 0, origin.x, origin.y);
  const s3 = toIso(x0 + shadowOffX, y1 + shadowOffY, 0, origin.x, origin.y);

  ctx.moveTo(b0.x, b0.y);
  ctx.lineTo(s0.x, s0.y);
  ctx.lineTo(s1.x, s1.y);
  ctx.lineTo(s2.x, s2.y);
  ctx.lineTo(s3.x, s3.y);
  ctx.lineTo(b2.x, b2.y);
  ctx.closePath();
  ctx.fill();

  // --- B. House Vertices (Centered at origin) ---
  const w0 = toIso(x0, y0, H_wall, origin.x, origin.y);
  const w1 = toIso(x1, y0, H_wall, origin.x, origin.y);
  const w2 = toIso(x1, y1, H_wall, origin.x, origin.y);
  const w3 = toIso(x0, y1, H_wall, origin.x, origin.y);

  // Gable Ridge 2 points (centered along X)
  const r0 = toIso(0, y0, H_wall + H_roof, origin.x, origin.y);
  const r1 = toIso(0, y1, H_wall + H_roof, origin.x, origin.y);

  // --- C. Draw House Base Walls ---
  // Front-Left Wall (Slate Gray)
  ctx.fillStyle = '#334155';
  ctx.beginPath();
  ctx.moveTo(b0.x, b0.y); ctx.lineTo(b3.x, b3.y);
  ctx.lineTo(w3.x, w3.y); ctx.lineTo(w0.x, w0.y);
  ctx.closePath();
  ctx.fill();

  // Front-Right Wall with Triangular Gable Peak
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.moveTo(b3.x, b3.y); ctx.lineTo(b2.x, b2.y);
  ctx.lineTo(w2.x, w2.y); ctx.lineTo(r1.x, r1.y); ctx.lineTo(w3.x, w3.y);
  ctx.closePath();
  ctx.fill();

  // --- D. Draw Gable Roof 2 Slopes ---
  // Left Roof Slope (Dark Slate Shadow Side)
  ctx.fillStyle = '#475569';
  ctx.beginPath();
  ctx.moveTo(w0.x, w0.y); ctx.lineTo(r0.x, r0.y);
  ctx.lineTo(r1.x, r1.y); ctx.lineTo(w3.x, w3.y);
  ctx.closePath();
  ctx.fill();

  // Right Roof Slope (Sun-Facing Side)
  ctx.fillStyle = '#64748b';
  ctx.beginPath();
  ctx.moveTo(r0.x, r0.y); ctx.lineTo(w1.x, w1.y);
  ctx.lineTo(w2.x, w2.y); ctx.lineTo(r1.x, r1.y);
  ctx.closePath();
  ctx.fill();

  // Ridge Line Accent
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(r0.x, r0.y); ctx.lineTo(r1.x, r1.y);
  ctx.stroke();

  // --- E. Solar Panels Grid on Sun-Facing Right Roof Slope ---
  const panelRows = 2;
  const panelCols = Math.min(8, Math.ceil(panelCount / 2));
  const isMorningShade = sunTime < 9.5 && obstacleType !== 'none';
  const isEveningShade = sunTime > 15.5 && obstacleType !== 'none';

  for (let r = 0; r < panelRows; r++) {
    for (let c = 0; c < panelCols; c++) {
      const xSpan = (W / 2 - 12) / panelCols;
      const ySpan = (D - 20) / panelRows;

      const px0 = 4 + c * xSpan;
      const px1 = px0 + xSpan - 2;

      const py0 = y0 + 10 + r * ySpan;
      const py1 = py0 + ySpan - 4;

      // Z height along roof pitch
      const pz0 = H_wall + H_roof * (1 - px0 / (W / 2)) + 2;
      const pz1 = H_wall + H_roof * (1 - px1 / (W / 2)) + 2;

      const isShaded = (isMorningShade && c >= panelCols / 2) || (isEveningShade && c < panelCols / 2);

      const pc0 = toIso(px0, py0, pz0, origin.x, origin.y);
      const pc1 = toIso(px1, py0, pz1, origin.x, origin.y);
      const pc2 = toIso(px1, py1, pz1, origin.x, origin.y);
      const pc3 = toIso(px0, py1, pz0, origin.x, origin.y);

      // Solar Panel Metallic Blue
      ctx.fillStyle = isShaded ? '#0f172a' : '#1d4ed8';
      ctx.beginPath();
      ctx.moveTo(pc0.x, pc0.y); ctx.lineTo(pc1.x, pc1.y);
      ctx.lineTo(pc2.x, pc2.y); ctx.lineTo(pc3.x, pc3.y);
      ctx.closePath();
      ctx.fill();

      // Glowing Cyan Frame Line
      ctx.strokeStyle = isShaded ? '#334155' : '#93c5fd';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Specular Glass Reflection Overlay
      if (!isShaded) {
        const reflectGrad = ctx.createLinearGradient(pc0.x, pc0.y, pc2.x, pc2.y);
        reflectGrad.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
        reflectGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.05)');
        reflectGrad.addColorStop(1, 'rgba(255, 255, 255, 0.0)');

        ctx.fillStyle = reflectGrad;
        ctx.beginPath();
        ctx.moveTo(pc0.x, pc0.y); ctx.lineTo(pc1.x, pc1.y);
        ctx.lineTo(pc2.x, pc2.y); ctx.lineTo(pc3.x, pc3.y);
        ctx.closePath();
        ctx.fill();
      }
    }
  }
};

// Solar Physics Calculation Helpers (Thailand Latitude ~13.75° N)
const calculateSunPosition = (timeHour) => {
  const normTime = (timeHour - 6) / 12; // 0 to 1
  const elevationRad = Math.sin(normTime * Math.PI) * (Math.PI / 2);
  const elevationDeg = (elevationRad * 180) / Math.PI;
  const azimuthDeg = 90 + normTime * 180;

  return { elevationDeg, azimuthDeg, normTime };
};

const Solar3DSimulator = () => {
  const navigate = useNavigate();
  const [timeOfDay, setTimeOfDay] = useState(12.5); // 12:30 PM
  const [roofType, setRoofType] = useState('gable'); // 'gable' | 'hip' | 'flat'
  const [roofPitch, setRoofPitch] = useState(15); // 15° pitch
  const [roofOrientation, setRoofOrientation] = useState(180); // 180° = South
  const [panelCount, setPanelCount] = useState(16); // 16 panels * 550W = 8.8 kWp
  const [obstacleType, setObstacleType] = useState('tree'); // 'tree' | 'building' | 'none'
  const [obstacleDistance, setObstacleDistance] = useState(8); // meters

  const canvasRef = useRef(null);

  // Solar Physics Calculation
  const solarPhysics = useMemo(() => {
    const { elevationDeg, azimuthDeg, normTime } = calculateSunPosition(timeOfDay);

    const roofPitchRad = (roofPitch * Math.PI) / 180;
    const roofAzimuthRad = (roofOrientation * Math.PI) / 180;
    const sunElevRad = (elevationDeg * Math.PI) / 180;
    const sunAzimRad = (azimuthDeg * Math.PI) / 180;

    const cosIncidence =
      Math.sin(sunElevRad) * Math.cos(roofPitchRad) +
      Math.cos(sunElevRad) * Math.sin(roofPitchRad) * Math.cos(sunAzimRad - roofAzimuthRad);

    const incidenceFactor = Math.max(0, cosIncidence);

    let shadingLossFactor = 0;
    if (obstacleType !== 'none') {
      if (timeOfDay < 9.5 || timeOfDay > 15.5) {
        shadingLossFactor = obstacleType === 'tree' ? 0.35 : 0.60;
      }
    }

    const rawIrradiance = Math.sin(normTime * Math.PI) * 1000;
    const effectiveIrradiance = Math.max(0, rawIrradiance * incidenceFactor * (1 - shadingLossFactor));

    const systemCapacityKwp = (panelCount * 550) / 1000; // kWp
    const inverterEfficiency = 0.96;
    const currentPowerKw = (effectiveIrradiance / 1000) * systemCapacityKwp * inverterEfficiency;

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

  // Render Pipeline
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear Screen
    ctx.clearRect(0, 0, width, height);

    const normTime = (timeOfDay - 6) / 12;

    // 1. Sky Background Gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
    if (timeOfDay < 7 || timeOfDay > 17) {
      skyGrad.addColorStop(0, '#030712');
      skyGrad.addColorStop(1, '#0f172a');
    } else if (timeOfDay < 9 || timeOfDay > 15) {
      skyGrad.addColorStop(0, '#0b1329');
      skyGrad.addColorStop(1, '#1e293b');
    } else {
      skyGrad.addColorStop(0, '#09152b');
      skyGrad.addColorStop(1, '#1e293b');
    }
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Isometric Center Origin
    const origin = { x: width / 2, y: height / 2 + 55 };

    // 3. Ground Plane Grid
    const gridSize = 320;
    const gridStep = 32;

    const g0 = toIso(-gridSize / 2, -gridSize / 2, 0, origin.x, origin.y);
    const g1 = toIso(gridSize / 2, -gridSize / 2, 0, origin.x, origin.y);
    const g2 = toIso(gridSize / 2, gridSize / 2, 0, origin.x, origin.y);
    const g3 = toIso(-gridSize / 2, gridSize / 2, 0, origin.x, origin.y);

    ctx.fillStyle = '#0f2318';
    ctx.beginPath();
    ctx.moveTo(g0.x, g0.y); ctx.lineTo(g1.x, g1.y);
    ctx.lineTo(g2.x, g2.y); ctx.lineTo(g3.x, g3.y);
    ctx.closePath();
    ctx.fill();

    // Ground Grid Lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let x = -gridSize / 2; x <= gridSize / 2; x += gridStep) {
      const pStart = toIso(x, -gridSize / 2, 0, origin.x, origin.y);
      const pEnd = toIso(x, gridSize / 2, 0, origin.x, origin.y);
      ctx.beginPath(); ctx.moveTo(pStart.x, pStart.y); ctx.lineTo(pEnd.x, pEnd.y); ctx.stroke();
    }
    for (let y = -gridSize / 2; y <= gridSize / 2; y += gridStep) {
      const pStart = toIso(-gridSize / 2, y, 0, origin.x, origin.y);
      const pEnd = toIso(gridSize / 2, y, 0, origin.x, origin.y);
      ctx.beginPath(); ctx.moveTo(pStart.x, pStart.y); ctx.lineTo(pEnd.x, pEnd.y); ctx.stroke();
    }

    // 4. Sun & Rays
    const sunAngleRad = normTime * Math.PI;
    const sunX = width - (normTime * (width - 120));
    const sunY = height - 130 - Math.sin(sunAngleRad) * (height - 180);

    ctx.strokeStyle = 'rgba(245, 158, 11, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(sunX, sunY); ctx.lineTo(origin.x, origin.y - 70);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.shadowBlur = 30;
    ctx.shadowColor = '#f59e0b';
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(sunX, sunY, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // 5. Render House Base + Roof + Panels (Clean Render Order!)
    const pitchH = (roofPitch / 45) * 45;
    drawIsometricHouse(ctx, origin, {
      W: 100, D: 120, H_wall: 60, H_roof: pitchH,
      sunTime: timeOfDay, panelCount, obstacleType
    });

    // 6. Render Trees ON THE SIDES (never hiding house)
    if (obstacleType !== 'none') {
      drawIsoTree(ctx, origin, { x: 120, y: -80, sunTime: timeOfDay });
      drawIsoTree(ctx, origin, { x: -120, y: 80, sunTime: timeOfDay });
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
            จำลองทิศทางแสงแดด มุมเอียงหลังคา เงาตกกระทบ และกำลังการผลิตไฟฟ้าโซลาร์เซลล์ 3D Isometric Engine
          </p>
        </div>
      </div>

      {/* Main Grid Workspace */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* LEFT: 3D Visualizer Canvas & Time Slider */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div className="equipment-card" style={{ padding: '1.25rem', position: 'relative' }}>
            {/* Time Overlay Badge */}
            <div style={{ position: 'absolute', top: 25, left: 25, background: 'rgba(15, 23, 42, 0.85)', padding: '0.5rem 1rem', borderRadius: '50px', border: '1px solid var(--border-color)', color: 'white', fontWeight: 'bold', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', zIndex: 10 }}>
              <Sun size={18} color="#f59e0b" /> เวลา: {Math.floor(timeOfDay).toString().padStart(2, '0')}:{Math.round((timeOfDay % 1) * 60).toString().padStart(2, '0')} น.
            </div>

            <canvas
              ref={canvasRef}
              width={750}
              height={440}
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
