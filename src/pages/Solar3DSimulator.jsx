import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Sun, ShieldCheck, Zap, Compass, RefreshCw, Printer, ArrowLeft, Sliders, Layers, AlertCircle, TrendingUp, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// -------------------------------------------------------------
// Isometric 3D Projection Math Engine (30° Projection)
// -------------------------------------------------------------
const toIso = (x, y, z, originX, originY) => {
  // cos(30°) ≈ 0.866, sin(30°) = 0.5
  const isoX = originX + (x - y) * 0.866;
  const isoY = originY + (x + y) * 0.5 - z;
  return { x: isoX, y: isoY };
};

const drawIsoBox = (ctx, x, y, z, w, d, h, colors, origin) => {
  const p0 = toIso(x, y, z, origin.x, origin.y);
  const p1 = toIso(x + w, y, z, origin.x, origin.y);
  const p2 = toIso(x + w, y + d, z, origin.x, origin.y);
  const p3 = toIso(x, y + d, z, origin.x, origin.y);

  const p0_top = toIso(x, y, z + h, origin.x, origin.y);
  const p1_top = toIso(x + w, y, z + h, origin.x, origin.y);
  const p2_top = toIso(x + w, y + d, z + h, origin.x, origin.y);
  const p3_top = toIso(x, y + d, z + h, origin.x, origin.y);

  // 1. Top Face (Brightest)
  ctx.fillStyle = colors.top;
  ctx.beginPath();
  ctx.moveTo(p0_top.x, p0_top.y);
  ctx.lineTo(p1_top.x, p1_top.y);
  ctx.lineTo(p2_top.x, p2_top.y);
  ctx.lineTo(p3_top.x, p3_top.y);
  ctx.closePath();
  ctx.fill();

  // 2. Left Face (Medium)
  ctx.fillStyle = colors.left;
  ctx.beginPath();
  ctx.moveTo(p0.x, p0.y);
  ctx.lineTo(p3.x, p3.y);
  ctx.lineTo(p3_top.x, p3_top.y);
  ctx.lineTo(p0_top.x, p0_top.y);
  ctx.closePath();
  ctx.fill();

  // 3. Right Face (Darker Shadow)
  ctx.fillStyle = colors.right;
  ctx.beginPath();
  ctx.moveTo(p3.x, p3.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.lineTo(p2_top.x, p2_top.y);
  ctx.lineTo(p3_top.x, p3_top.y);
  ctx.closePath();
  ctx.fill();
};

// Solar Physics Calculation Helpers (Thailand Latitude ~13.75° N)
const calculateSunPosition = (timeHour) => {
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

  // Render Isometric 3D Engine Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear Screen
    ctx.clearRect(0, 0, width, height);

    const normTime = (timeOfDay - 6) / 12;

    // 1. Architectural Dark Mode Sky Background Gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
    if (timeOfDay < 7 || timeOfDay > 17) {
      skyGrad.addColorStop(0, '#090d16');
      skyGrad.addColorStop(1, '#1e1b4b');
    } else if (timeOfDay < 9 || timeOfDay > 15) {
      skyGrad.addColorStop(0, '#0f172a');
      skyGrad.addColorStop(1, '#1e293b');
    } else {
      skyGrad.addColorStop(0, '#09152b');
      skyGrad.addColorStop(1, '#1e293b');
    }
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Isometric Grid Center Origin
    const origin = { x: width / 2, y: height / 2 + 60 };

    // 3. Draw Isometric Ground Plane Grid (Architectural Olive / Slate)
    const gridSize = 300;
    const gridStep = 30;

    const g0 = toIso(-gridSize / 2, -gridSize / 2, 0, origin.x, origin.y);
    const g1 = toIso(gridSize / 2, -gridSize / 2, 0, origin.x, origin.y);
    const g2 = toIso(gridSize / 2, gridSize / 2, 0, origin.x, origin.y);
    const g3 = toIso(-gridSize / 2, gridSize / 2, 0, origin.x, origin.y);

    // Ground Plane Surface
    ctx.fillStyle = '#14281d'; // Architectural Dark Olive Slate
    ctx.beginPath();
    ctx.moveTo(g0.x, g0.y);
    ctx.lineTo(g1.x, g1.y);
    ctx.lineTo(g2.x, g2.y);
    ctx.lineTo(g3.x, g3.y);
    ctx.closePath();
    ctx.fill();

    // Subtle Ground Grid Lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    for (let x = -gridSize / 2; x <= gridSize / 2; x += gridStep) {
      const pStart = toIso(x, -gridSize / 2, 0, origin.x, origin.y);
      const pEnd = toIso(x, gridSize / 2, 0, origin.x, origin.y);
      ctx.beginPath();
      ctx.moveTo(pStart.x, pStart.y);
      ctx.lineTo(pEnd.x, pEnd.y);
      ctx.stroke();
    }
    for (let y = -gridSize / 2; y <= gridSize / 2; y += gridStep) {
      const pStart = toIso(-gridSize / 2, y, 0, origin.x, origin.y);
      const pEnd = toIso(gridSize / 2, y, 0, origin.x, origin.y);
      ctx.beginPath();
      ctx.moveTo(pStart.x, pStart.y);
      ctx.lineTo(pEnd.x, pEnd.y);
      ctx.stroke();
    }

    // 4. Sun position calculation & Glowing Sun Arc
    const sunAngleRad = normTime * Math.PI;
    const sunX = width - (normTime * (width - 120));
    const sunY = height - 140 - Math.sin(sunAngleRad) * (height - 200);

    // Sun Rays
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(sunX, sunY);
    ctx.lineTo(origin.x, origin.y - 70);
    ctx.stroke();
    ctx.setLineDash([]);

    // Glowing Sun Circle
    ctx.shadowBlur = 30;
    ctx.shadowColor = '#f59e0b';
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(sunX, sunY, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // 5. Calculate Dynamic Sun Shadow Polygons on Ground (z = 0)
    // Shadow offset vectors on ground based on time of day
    const shadowLengthMultiplier = Math.max(0.3, Math.abs(Math.cos(sunAngleRad)) * 2.5 + 0.5);
    const shadowDirX = (normTime - 0.5) * 160 * shadowLengthMultiplier;
    const shadowDirY = Math.sin(sunAngleRad) * 40 * shadowLengthMultiplier;

    // House Shadow Polygon on Ground
    const hW = 100;
    const hD = 100;
    const hH = 60;
    const hX = -hW / 2;
    const hY = -hD / 2;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)'; // Dynamic Ground Shadow
    ctx.beginPath();
    const sp0 = toIso(hX + shadowDirX, hY + shadowDirY, 0, origin.x, origin.y);
    const sp1 = toIso(hX + hW + shadowDirX, hY + shadowDirY, 0, origin.x, origin.y);
    const sp2 = toIso(hX + hW + shadowDirX, hY + hD + shadowDirY, 0, origin.x, origin.y);
    const sp3 = toIso(hX + shadowDirX, hY + hD + shadowDirY, 0, origin.x, origin.y);

    const bp0 = toIso(hX, hY, 0, origin.x, origin.y);
    const bp1 = toIso(hX + hW, hY, 0, origin.x, origin.y);
    const bp2 = toIso(hX + hW, hY + hD, 0, origin.x, origin.y);
    const bp3 = toIso(hX, hY + hD, 0, origin.x, origin.y);

    ctx.moveTo(bp0.x, bp0.y);
    ctx.lineTo(sp0.x, sp0.y);
    ctx.lineTo(sp1.x, sp1.y);
    ctx.lineTo(sp2.x, sp2.y);
    ctx.lineTo(sp3.x, sp3.y);
    ctx.lineTo(bp2.x, bp2.y);
    ctx.closePath();
    ctx.fill();

    // 6. Draw Obstacles (Trees / Buildings) & Shading
    if (obstacleType !== 'none') {
      const drawTreeIso = (tx, ty) => {
        // Tree Shadow
        const tsp0 = toIso(tx + shadowDirX * 0.7, ty + shadowDirY * 0.7, 0, origin.x, origin.y);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.arc(tsp0.x, tsp0.y, 30, 0, Math.PI * 2);
        ctx.fill();

        // Trunk Box
        drawIsoBox(ctx, tx - 5, ty - 5, 0, 10, 10, 35, {
          top: '#78350f', left: '#451a03', right: '#311402'
        }, origin);

        // Foliage Crown (Isometric Shaded Sphere / Cube)
        drawIsoBox(ctx, tx - 25, ty - 25, 35, 50, 50, 45, {
          top: '#16a34a', left: '#15803d', right: '#115e59'
        }, origin);
      };

      // Draw East Obstacle (+120, -100) & West Obstacle (-120, 100)
      drawTreeIso(110, -80);
      drawTreeIso(-110, 80);
    }

    // 7. Draw Isometric House Building Walls (Architectural Grade Slate Colors)
    drawIsoBox(ctx, hX, hY, 0, hW, hD, hH, {
      top: '#475569',   // Slate Top
      left: '#334155',  // Slate Left Wall
      right: '#1e293b'  // Darker Slate Right Wall
    }, origin);

    // 8. Draw Roof 3D Pitch
    const pitchH = (roofPitch / 45) * 40;
    const rZ = hH;

    const ridgeP1 = toIso(hX, hY + hD / 2, rZ + pitchH, origin.x, origin.y);
    const ridgeP2 = toIso(hX + hW, hY + hD / 2, rZ + pitchH, origin.x, origin.y);

    const cornerP0 = toIso(hX, hY, rZ, origin.x, origin.y);
    const cornerP1 = toIso(hX + hW, hY, rZ, origin.x, origin.y);
    const cornerP2 = toIso(hX + hW, hY + hD, rZ, origin.x, origin.y);
    const cornerP3 = toIso(hX, hY + hD, rZ, origin.x, origin.y);

    if (roofType === 'gable') {
      // South Roof Slope (Front) - Terracotta/Charcoal
      ctx.fillStyle = '#9a3412';
      ctx.beginPath();
      ctx.moveTo(cornerP3.x, cornerP3.y);
      ctx.lineTo(cornerP2.x, cornerP2.y);
      ctx.lineTo(ridgeP2.x, ridgeP2.y);
      ctx.lineTo(ridgeP1.x, ridgeP1.y);
      ctx.closePath();
      ctx.fill();

      // North Roof Slope (Back)
      ctx.fillStyle = '#7c2d12';
      ctx.beginPath();
      ctx.moveTo(cornerP0.x, cornerP0.y);
      ctx.lineTo(cornerP1.x, cornerP1.y);
      ctx.lineTo(ridgeP2.x, ridgeP2.y);
      ctx.lineTo(ridgeP1.x, ridgeP1.y);
      ctx.closePath();
      ctx.fill();
    } else { // Flat / Hip
      drawIsoBox(ctx, hX, hY, rZ, hW, hD, Math.max(5, pitchH), {
        top: '#0f172a', left: '#1e293b', right: '#334155'
      }, origin);
    }

    // 9. Draw Solar Panels Grid (Isometric Metallic Blue with Specular Reflection)
    const panelRows = 2;
    const panelCols = Math.min(8, Math.ceil(panelCount / 2));
    const pWidth = (hW - 20) / panelCols;
    const pDepth = 30;

    const isMorningShade = timeOfDay < 9.5 && obstacleType !== 'none';
    const isEveningShade = timeOfDay > 15.5 && obstacleType !== 'none';

    for (let r = 0; r < panelRows; r++) {
      for (let c = 0; c < panelCols; c++) {
        const px = hX + 10 + c * pWidth;
        const py = hY + 15 + r * (pDepth + 5);
        const pz = rZ + (r === 0 ? pitchH * 0.4 : pitchH * 0.1) + 2;

        const isShaded = (isMorningShade && c >= panelCols / 2) || (isEveningShade && c < panelCols / 2);

        // Panel quad coordinates
        const pc0 = toIso(px, py, pz, origin.x, origin.y);
        const pc1 = toIso(px + pWidth - 2, py, pz, origin.x, origin.y);
        const pc2 = toIso(px + pWidth - 2, py + pDepth - 2, pz, origin.x, origin.y);
        const pc3 = toIso(px, py + pDepth - 2, pz, origin.x, origin.y);

        // Metallic Blue Fill (Dark Grey if shaded)
        ctx.fillStyle = isShaded ? '#0f172a' : '#1e3a8a';
        ctx.beginPath();
        ctx.moveTo(pc0.x, pc0.y);
        ctx.lineTo(pc1.x, pc1.y);
        ctx.lineTo(pc2.x, pc2.y);
        ctx.lineTo(pc3.x, pc3.y);
        ctx.closePath();
        ctx.fill();

        // Silver Grid Border
        ctx.strokeStyle = isShaded ? '#334155' : '#60a5fa';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Glossy Glass Linear Reflection Overlay
        if (!isShaded) {
          const reflectGrad = ctx.createLinearGradient(pc0.x, pc0.y, pc2.x, pc2.y);
          reflectGrad.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
          reflectGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.05)');
          reflectGrad.addColorStop(1, 'rgba(255, 255, 255, 0.0)');

          ctx.fillStyle = reflectGrad;
          ctx.beginPath();
          ctx.moveTo(pc0.x, pc0.y);
          ctx.lineTo(pc1.x, pc1.y);
          ctx.lineTo(pc2.x, pc2.y);
          ctx.lineTo(pc3.x, pc3.y);
          ctx.closePath();
          ctx.fill();
        }
      }
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
