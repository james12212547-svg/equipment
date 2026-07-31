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

// Draw 3D Isometric Box
const drawIsoBox = (ctx, x, y, z, w, d, h, colors, origin) => {
  const p0 = toIso(x, y, z, origin.x, origin.y);
  const p1 = toIso(x + w, y, z, origin.x, origin.y);
  const p2 = toIso(x + w, y + d, z, origin.x, origin.y);
  const p3 = toIso(x, y + d, z, origin.x, origin.y);

  const p0_top = toIso(x, y, z + h, origin.x, origin.y);
  const p1_top = toIso(x + w, y, z + h, origin.x, origin.y);
  const p2_top = toIso(x + w, y + d, z + h, origin.x, origin.y);
  const p3_top = toIso(x, y + d, z + h, origin.x, origin.y);

  // Top
  ctx.fillStyle = colors.top;
  ctx.beginPath();
  ctx.moveTo(p0_top.x, p0_top.y); ctx.lineTo(p1_top.x, p1_top.y);
  ctx.lineTo(p2_top.x, p2_top.y); ctx.lineTo(p3_top.x, p3_top.y);
  ctx.closePath(); ctx.fill();

  // Left
  ctx.fillStyle = colors.left;
  ctx.beginPath();
  ctx.moveTo(p0.x, p0.y); ctx.lineTo(p3.x, p3.y);
  ctx.lineTo(p3_top.x, p3_top.y); ctx.lineTo(p0_top.x, p0_top.y);
  ctx.closePath(); ctx.fill();

  // Right
  ctx.fillStyle = colors.right;
  ctx.beginPath();
  ctx.moveTo(p3.x, p3.y); ctx.lineTo(p2.x, p2.y);
  ctx.lineTo(p2_top.x, p2_top.y); ctx.lineTo(p3_top.x, p3_top.y);
  ctx.closePath(); ctx.fill();
};

// -------------------------------------------------------------
// 2. Obstacle Renderer (Clean Minimal 3D Tree or Building)
// -------------------------------------------------------------
const drawIsoObstacle = (ctx, origin, options) => {
  const { x = 0, y = 0, type = 'tree', sunTime = 12 } = options;

  const shadowAngle = ((sunTime - 6) / 12) * Math.PI;
  const shadowLen = Math.abs(Math.cos(shadowAngle)) * 100;
  const shadowDir = sunTime < 12 ? -1 : 1;

  if (type === 'building') {
    const bw = 36, bd = 36, bh = 110;
    
    // Building Shadow on Ground
    const sp = toIso(x + shadowLen * shadowDir * 0.5, y + 15, 0, origin.x, origin.y);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(sp.x, sp.y, 35, 15, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();

    // Building Base Structure (Clean Minimal Palette)
    drawIsoBox(ctx, x - bw / 2, y - bd / 2, 0, bw, bd, bh, {
      top: '#475569', left: '#334155', right: '#1e293b'
    }, origin);

    // Minimal Windows Grid
    const pWindow = toIso(x + bw / 2 + 1, y - bd / 4, bh * 0.6, origin.x, origin.y);
    ctx.fillStyle = '#64748b';
    ctx.fillRect(pWindow.x - 4, pWindow.y - 12, 4, 6);
    ctx.fillRect(pWindow.x + 3, pWindow.y - 12, 4, 6);
    ctx.fillRect(pWindow.x - 4, pWindow.y - 25, 4, 6);
    ctx.fillRect(pWindow.x + 3, pWindow.y - 25, 4, 6);
  } else {
    // Clean Minimal 3D Pine Tree
    const sp = toIso(x + shadowLen * shadowDir * 0.5, y + 15, 0, origin.x, origin.y);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(sp.x, sp.y, 25, 12, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();

    // Trunk Base
    const tw = 8, td = 8, th = 28;
    drawIsoBox(ctx, x - tw / 2, y - td / 2, 0, tw, td, th, {
      top: '#52525b', left: '#3f3f46', right: '#27272a'
    }, origin);

    // Minimal Green Foliage Pyramids
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

    drawCanopyPyramid(th, 40, 28, '#1e3a2b', '#14281d');
    drawCanopyPyramid(th + 20, 32, 24, '#274e37', '#1e3a2b');
    drawCanopyPyramid(th + 40, 24, 20, '#346244', '#274e37');
    drawCanopyPyramid(th + 56, 16, 16, '#427854', '#346244');
  }
};

// -------------------------------------------------------------
// 3. Minimal Isometric House + Roof + Solar Panels Engine
// -------------------------------------------------------------
const drawIsometricHouse = (ctx, origin, options) => {
  const { W = 100, D = 110, H_wall = 55, H_roof = 38, sunTime = 12, panelCount = 16, obstacleType = 'tree' } = options;

  // --- A. Draw House Base Shadow on Ground FIRST ---
  const shadowAngle = ((sunTime - 6) / 12) * Math.PI;
  const shadowLen = Math.abs(Math.cos(shadowAngle)) * 110;
  const shadowDir = sunTime < 12 ? -1 : 1;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
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
  const shadowOffY = (1 - Math.sin(shadowAngle)) * 45;

  const s0 = toIso(x0 + shadowOffX, y0 + shadowOffY, 0, origin.x, origin.y);
  const s1 = toIso(x1 + shadowOffX, y0 + shadowOffY, 0, origin.x, origin.y);
  const s2 = toIso(x1 + shadowOffX, y1 + shadowOffY, 0, origin.x, origin.y);
  const s3 = toIso(x0 + shadowOffX, y1 + shadowOffY, 0, origin.x, origin.y);

  ctx.moveTo(b0.x, b0.y);
  ctx.lineTo(s0.x, s0.y); ctx.lineTo(s1.x, s1.y);
  ctx.lineTo(s2.x, s2.y); ctx.lineTo(s3.x, s3.y);
  ctx.lineTo(b2.x, b2.y);
  ctx.closePath();
  ctx.fill();

  // --- B. House Vertices ---
  const w0 = toIso(x0, y0, H_wall, origin.x, origin.y);
  const w1 = toIso(x1, y0, H_wall, origin.x, origin.y);
  const w2 = toIso(x1, y1, H_wall, origin.x, origin.y);
  const w3 = toIso(x0, y1, H_wall, origin.x, origin.y);

  // Gable Ridge 2 points
  const r0 = toIso(0, y0, H_wall + H_roof, origin.x, origin.y);
  const r1 = toIso(0, y1, H_wall + H_roof, origin.x, origin.y);

  // --- C. House Base Walls (Clean Minimal Slate) ---
  // Front-Left Wall
  ctx.fillStyle = '#334155';
  ctx.beginPath();
  ctx.moveTo(b0.x, b0.y); ctx.lineTo(b3.x, b3.y);
  ctx.lineTo(w3.x, w3.y); ctx.lineTo(w0.x, w0.y);
  ctx.closePath(); ctx.fill();

  // Front-Right Wall with Gable Peak
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.moveTo(b3.x, b3.y); ctx.lineTo(b2.x, b2.y);
  ctx.lineTo(w2.x, w2.y); ctx.lineTo(r1.x, r1.y); ctx.lineTo(w3.x, w3.y);
  ctx.closePath(); ctx.fill();

  // --- D. Gable Roof 2 Slopes ---
  // Left Roof Slope
  ctx.fillStyle = '#475569';
  ctx.beginPath();
  ctx.moveTo(w0.x, w0.y); ctx.lineTo(r0.x, r0.y);
  ctx.lineTo(r1.x, r1.y); ctx.lineTo(w3.x, w3.y);
  ctx.closePath(); ctx.fill();

  // Right Roof Slope
  ctx.fillStyle = '#64748b';
  ctx.beginPath();
  ctx.moveTo(r0.x, r0.y); ctx.lineTo(w1.x, w1.y);
  ctx.lineTo(w2.x, w2.y); ctx.lineTo(r1.x, r1.y);
  ctx.closePath(); ctx.fill();

  // Ridge Line Accent (Subtle)
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(r0.x, r0.y); ctx.lineTo(r1.x, r1.y);
  ctx.stroke();

  // --- E. Solar Panels Grid (Clean Matte Blue) ---
  const panelRows = 2;
  const panelCols = Math.min(8, Math.ceil(panelCount / 2));
  const isMorningShade = sunTime < 9.5 && obstacleType !== 'none';
  const isEveningShade = sunTime > 15.5 && obstacleType !== 'none';

  for (let r = 0; r < panelRows; r++) {
    for (let c = 0; c < panelCols; c++) {
      const xSpan = (W / 2 - 10) / panelCols;
      const ySpan = (D - 18) / panelRows;

      const px0 = 4 + c * xSpan;
      const px1 = px0 + xSpan - 2;

      const py0 = y0 + 8 + r * ySpan;
      const py1 = py0 + ySpan - 4;

      const pz0 = H_wall + H_roof * (1 - px0 / (W / 2)) + 2;
      const pz1 = H_wall + H_roof * (1 - px1 / (W / 2)) + 2;

      const isShaded = (isMorningShade && c >= panelCols / 2) || (isEveningShade && c < panelCols / 2);

      const pc0 = toIso(px0, py0, pz0, origin.x, origin.y);
      const pc1 = toIso(px1, py0, pz1, origin.x, origin.y);
      const pc2 = toIso(px1, py1, pz1, origin.x, origin.y);
      const pc3 = toIso(px0, py1, pz0, origin.x, origin.y);

      // Matte Slate Blue Panel (No bright aura)
      ctx.fillStyle = isShaded ? '#0f172a' : '#1e3a8a';
      ctx.beginPath();
      ctx.moveTo(pc0.x, pc0.y); ctx.lineTo(pc1.x, pc1.y);
      ctx.lineTo(pc2.x, pc2.y); ctx.lineTo(pc3.x, pc3.y);
      ctx.closePath(); ctx.fill();

      // Clean Subtle Frame Line (No glow)
      ctx.strokeStyle = isShaded ? '#1e293b' : 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  // --- F. CLEAN MINIMAL SHADOW OVERLAY ON ROOF ---
  if (obstacleType !== 'none') {
    const isMorning = sunTime < 9.5;
    const isEvening = sunTime > 15.5;

    if (isMorning || isEvening) {
      ctx.save();
      // Clip to right sun-facing roof slope
      ctx.beginPath();
      ctx.moveTo(r0.x, r0.y);
      ctx.lineTo(w1.x, w1.y);
      ctx.lineTo(w2.x, w2.y);
      ctx.lineTo(r1.x, r1.y);
      ctx.closePath();
      ctx.clip();

      // Soft Dark Shadow Overlay
      ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
      ctx.beginPath();

      if (isEvening) {
        const pShadow0 = toIso(W / 2, y0, H_wall, origin.x, origin.y);
        const pShadow1 = toIso(W / 4, y0, H_wall + H_roof * 0.5, origin.x, origin.y);
        const pShadow2 = toIso(W / 4, y1, H_wall + H_roof * 0.5, origin.x, origin.y);
        const pShadow3 = toIso(W / 2, y1, H_wall, origin.x, origin.y);

        ctx.moveTo(pShadow0.x, pShadow0.y);
        ctx.lineTo(pShadow1.x, pShadow1.y);
        ctx.lineTo(pShadow2.x, pShadow2.y);
        ctx.lineTo(pShadow3.x, pShadow3.y);
      } else {
        const pShadow0 = toIso(0, y0, H_wall + H_roof, origin.x, origin.y);
        const pShadow1 = toIso(W / 4, y0, H_wall + H_roof * 0.5, origin.x, origin.y);
        const pShadow2 = toIso(W / 4, y1, H_wall + H_roof * 0.5, origin.x, origin.y);
        const pShadow3 = toIso(0, y1, H_wall + H_roof, origin.x, origin.y);

        ctx.moveTo(pShadow0.x, pShadow0.y);
        ctx.lineTo(pShadow1.x, pShadow1.y);
        ctx.lineTo(pShadow2.x, pShadow2.y);
        ctx.lineTo(pShadow3.x, pShadow3.y);
      }

      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Clean Minimal Warning Text
      const textPos = toIso(W / 4, 0, H_wall + H_roof * 0.6, origin.x, origin.y);
      ctx.fillStyle = '#f87171';
      ctx.font = '500 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('เงาบังแผง (Shaded)', textPos.x, textPos.y - 10);
    }
  }
};

// Solar Physics Calculation Helpers
const calculateSunPosition = (timeHour) => {
  const normTime = (timeHour - 6) / 12;
  const elevationRad = Math.sin(normTime * Math.PI) * (Math.PI / 2);
  const elevationDeg = (elevationRad * 180) / Math.PI;
  const azimuthDeg = 90 + normTime * 180;

  return { elevationDeg, azimuthDeg, normTime };
};

const Solar3DSimulator = () => {
  const navigate = useNavigate();
  const [timeOfDay, setTimeOfDay] = useState(12.5); // 12:30 PM Noon Default
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

  // Main Render Pipeline
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear Screen
    ctx.clearRect(0, 0, width, height);

    const normTime = (timeOfDay - 6) / 12;

    // 1. Clean Minimal Sky Background
    const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
    if (timeOfDay < 7 || timeOfDay > 17) {
      skyGrad.addColorStop(0, '#090d16');
      skyGrad.addColorStop(1, '#0f172a');
    } else if (timeOfDay < 9 || timeOfDay > 15) {
      skyGrad.addColorStop(0, '#0f172a');
      skyGrad.addColorStop(1, '#1e293b');
    } else {
      skyGrad.addColorStop(0, '#0f172a');
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

    ctx.fillStyle = '#14241b';
    ctx.beginPath();
    ctx.moveTo(g0.x, g0.y); ctx.lineTo(g1.x, g1.y);
    ctx.lineTo(g2.x, g2.y); ctx.lineTo(g3.x, g3.y);
    ctx.closePath(); ctx.fill();

    // Ground Grid Lines (Subtle)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
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

    // 4. Background Obstacles (Clean & Minimal)
    if (obstacleType !== 'none') {
      drawIsoObstacle(ctx, origin, { x: 105, y: -50, type: obstacleType, sunTime: timeOfDay });
      drawIsoObstacle(ctx, origin, { x: -105, y: -50, type: obstacleType, sunTime: timeOfDay });
    }

    // 5. Sun Circle (Clean Solid Warm Circle - NO BLURRY AURA GLOW)
    const sunAngleRad = normTime * Math.PI;
    const sunX = width - (normTime * (width - 120));
    const sunY = height - 130 - Math.sin(sunAngleRad) * (height - 180);

    // Subtle Sun Rays
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.2)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(sunX, sunY); ctx.lineTo(origin.x, origin.y - 70);
    ctx.stroke();
    ctx.setLineDash([]);

    // Solid Minimal Sun (No shadowBlur / aura)
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(sunX, sunY, 20, 0, Math.PI * 2);
    ctx.fill();

    // 6. Render House Base + Roof + Solar Panels + Roof Shadow Polygon
    const pitchH = (roofPitch / 45) * 45;
    drawIsometricHouse(ctx, origin, {
      W: 100, D: 110, H_wall: 55, H_roof: pitchH,
      sunTime: timeOfDay, panelCount, obstacleType
    });

  }, [timeOfDay, roofType, roofPitch, panelCount, obstacleType]);

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '4rem' }}>
      
      {/* Header (Clean Minimal Typography - No Text Gradient) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Sun color="var(--text-primary)" size={26} />
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: 0 }}>
              3D Solar Roof & Sun Shadow Simulator
            </h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.2rem', fontSize: '0.9rem' }}>
            จำลองทิศทางแสงแดด มุมเอียงหลังคา เงาตกกระทบ และกำลังการผลิตไฟฟ้าโซลาร์เซลล์ 3D Isometric Engine
          </p>
        </div>
      </div>

      {/* Main Grid Workspace */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* LEFT: 3D Visualizer Canvas & Time Slider */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div className="equipment-card" style={{ padding: '1.25rem', position: 'relative' }}>
            {/* Time Overlay Badge (Clean Minimal) */}
            <div style={{ position: 'absolute', top: 25, left: 25, background: 'rgba(15, 23, 42, 0.9)', padding: '0.4rem 0.85rem', borderRadius: '6px', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', zIndex: 10 }}>
              <Sun size={16} color="var(--text-secondary)" /> เวลา: {Math.floor(timeOfDay).toString().padStart(2, '0')}:{Math.round((timeOfDay % 1) * 60).toString().padStart(2, '0')} น.
            </div>

            <canvas
              ref={canvasRef}
              width={750}
              height={440}
              style={{ width: '100%', height: 'auto', borderRadius: '8px', display: 'block' }}
            />

            {/* Time Slider (Clean) */}
            <div style={{ marginTop: '1.25rem', background: 'var(--bg-secondary)', padding: '1rem 1.25rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                <span>🌅 พระอาทิตย์ขึ้น (06:00 น.)</span>
                <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>☀️ ปรับเวลาดวงอาทิตย์</strong>
                <span>🌇 พระอาทิตย์ตก (18:00 น.)</span>
              </div>
              <input
                type="range"
                min="6"
                max="18"
                step="0.25"
                value={timeOfDay}
                onChange={(e) => setTimeOfDay(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--text-primary)', cursor: 'pointer' }}
              />
            </div>
          </div>

          {/* Daily Generation Curve Summary (Clean Minimal Cards) */}
          <div className="equipment-card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 'bold' }}>
              <TrendingUp size={18} color="var(--text-secondary)" /> ผลการวิเคราะห์กำลังการผลิตประจำวัน
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', textAlign: 'center' }}>
              <div style={{ background: 'var(--bg-tertiary)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>ความเข้มแสงแดด (Irradiance)</span>
                <strong style={{ display: 'block', fontSize: '1.15rem', color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                  {solarPhysics.effectiveIrradiance} W/m²
                </strong>
              </div>
              <div style={{ background: 'var(--bg-tertiary)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>กำลังผลิต AC ขณะนี้</span>
                <strong style={{ display: 'block', fontSize: '1.15rem', color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                  {solarPhysics.currentPowerKw} kW
                </strong>
              </div>
              <div style={{ background: 'var(--bg-tertiary)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>ผลิตได้ต่อวัน (Est.)</span>
                <strong style={{ display: 'block', fontSize: '1.15rem', color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                  {solarPhysics.dailyKwh} kWh
                </strong>
              </div>
              <div style={{ background: 'var(--bg-tertiary)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>ประหยัดค่าไฟ/เดือน</span>
                <strong style={{ display: 'block', fontSize: '1.15rem', color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                  ฿{solarPhysics.monthlySavingsThb.toLocaleString()}
                </strong>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT: Controls & Parameters Inspector (Clean Minimal Panel) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div className="equipment-card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 'bold' }}>
              <Sliders size={18} color="var(--text-secondary)" /> ปรับแต่งสเปคหลังคาและโซลาร์
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
                  <strong style={{ color: 'var(--text-primary)' }}>{roofPitch}°</strong>
                </div>
                <input
                  type="range"
                  min="5"
                  max="45"
                  value={roofPitch}
                  onChange={(e) => setRoofPitch(parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--text-primary)' }}
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
                  <strong style={{ color: 'var(--text-primary)' }}>{panelCount} แผง ({solarPhysics.systemCapacityKwp} kWp)</strong>
                </div>
                <input
                  type="range"
                  min="4"
                  max="32"
                  step="2"
                  value={panelCount}
                  onChange={(e) => setPanelCount(parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--text-primary)' }}
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
