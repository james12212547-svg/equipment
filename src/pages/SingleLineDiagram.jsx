import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Zap, Plus, Trash2, Download, Printer, RefreshCw, AlertTriangle, ShieldCheck, FileText, CheckCircle2, ArrowLeft, Move, Layers, Cpu, Compass, Sliders, Table, HelpCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// Component Types Library
const COMPONENT_TYPES = [
  { type: 'grid', name: '⚡ PEA / MEA Grid (การไฟฟ้า)', icon: '⚡', defaultKw: 0, category: 'source', color: '#ff7300' },
  { type: 'transformer', name: '🔌 Transformer (หม้อแปลงไฟฟ้า)', icon: '🌀', defaultKw: 100, category: 'source', color: '#3b82f6' },
  { type: 'solar', name: '☀️ Solar Inverter (อินเวอร์เตอร์)', icon: '☀️', defaultKw: 10, category: 'source', color: '#f59e0b' },
  { type: 'mdb', name: '🏬 Main Distribution Board (MDB)', icon: '🏬', defaultKw: 0, category: 'board', color: '#10b981' },
  { type: 'db', name: '🏢 Sub-DB / Consumer Unit (CU)', icon: '🏢', defaultKw: 0, category: 'board', color: '#00f0ff' },
  { type: 'mccb', name: '🔲 Main MCCB Breaker', icon: '🔲', defaultKw: 0, category: 'protection', color: '#ef4444' },
  { type: 'mcb', name: '🔳 Branch MCB Breaker', icon: '🔳', defaultKw: 0, category: 'protection', color: '#8b5cf6' },
  { type: 'spd', name: '🛡️ Surge Protection (SPD)', icon: '🛡️', defaultKw: 0, category: 'protection', color: '#ec4899' },
  { type: 'aircon', name: '❄️ Air Conditioner Load', icon: '❄️', defaultKw: 3.5, category: 'load', color: '#00f0ff' },
  { type: 'motor', name: '⚙️ 3-Phase Motor / Pump', icon: '⚙️', defaultKw: 7.5, category: 'load', color: '#f59e0b' },
  { type: 'lighting', name: '💡 Lighting & Receptacle', icon: '💡', defaultKw: 2.0, category: 'load', color: '#eab308' },
];

// EIT Cable Resistance Table (Ohm / km for Copper Conductor)
const CABLE_RESISTANCE_OHM_PER_KM = {
  1.5: 14.8,
  2.5: 8.91,
  4: 5.57,
  6: 3.71,
  10: 2.24,
  16: 1.41,
  25: 0.889,
  35: 0.641,
  50: 0.473,
  70: 0.328,
  95: 0.236,
  120: 0.188
};

// Presets
const PRESET_TEMPLATES = {
  home_1p: {
    title: '🏠 บ้านพักอาศัย 1-Phase 15(45)A',
    nodes: [
      { id: '1', type: 'grid', label: 'PEA Meter 15(45)A', x: 320, y: 30, kw: 0, demandFactor: 100, breakerAmp: 50, icRating: '10kA', tripCurve: 'C', cableSize: '2x16 sq.mm. + G-1x10 sq.mm.', cableLength: 15, groundType: 'THW Green' },
      { id: '2', type: 'mccb', label: 'Main Breaker 50A 1P', x: 320, y: 120, kw: 0, demandFactor: 100, breakerAmp: 50, icRating: '10kA', tripCurve: 'C', cableSize: '2x16 sq.mm. + G-1x10 sq.mm.', cableLength: 5, groundType: 'THW Green' },
      { id: '3', type: 'spd', label: 'SPD Type 2 (10kA)', x: 150, y: 210, kw: 0, demandFactor: 100, breakerAmp: 20, icRating: '10kA', tripCurve: 'C', cableSize: '1x6 sq.mm. + G-1x6 sq.mm.', cableLength: 2, groundType: 'THW Green', isTapNode: true },
      { id: '4', type: 'db', label: 'Consumer Unit 10 Channels', x: 320, y: 210, kw: 0, demandFactor: 100, breakerAmp: 50, icRating: '10kA', tripCurve: 'C', cableSize: '2x16 sq.mm. + G-1x10 sq.mm.', cableLength: 10, groundType: 'THW Green' },
      { id: '5', type: 'aircon', label: 'Air Con 18,000 BTU', x: 40, y: 330, kw: 2.0, demandFactor: 100, breakerAmp: 20, icRating: '6kA', tripCurve: 'C', cableSize: '2x2.5 sq.mm. + G-1x2.5 sq.mm.', cableLength: 18, groundType: 'THW Green' },
      { id: '6', type: 'aircon', label: 'Air Con 12,000 BTU', x: 180, y: 330, kw: 1.5, demandFactor: 100, breakerAmp: 16, icRating: '6kA', tripCurve: 'C', cableSize: '2x2.5 sq.mm. + G-1x2.5 sq.mm.', cableLength: 12, groundType: 'THW Green' },
      { id: '7', type: 'lighting', label: 'Lighting Circuit Fl.1-2', x: 320, y: 330, kw: 1.2, demandFactor: 80, breakerAmp: 10, icRating: '6kA', tripCurve: 'B', cableSize: '2x1.5 sq.mm. + G-1x1.5 sq.mm.', cableLength: 25, groundType: 'THW Green' },
      { id: '8', type: 'lighting', label: 'Power Receptacles Plugs', x: 460, y: 330, kw: 2.5, demandFactor: 80, breakerAmp: 20, icRating: '6kA', tripCurve: 'C', cableSize: '2x2.5 sq.mm. + G-1x2.5 sq.mm.', cableLength: 20, groundType: 'THW Green' },
    ],
    connections: [
      { from: '1', to: '2' },
      { from: '2', to: '3' },
      { from: '2', to: '4' },
      { from: '4', to: '5' },
      { from: '4', to: '6' },
      { from: '4', to: '7' },
      { from: '4', to: '8' },
    ]
  },
  solar_3p: {
    title: '☀️ อาคารพาณิชย์ 3-Phase + Solar Rooftop 10kW',
    nodes: [
      { id: '1', type: 'grid', label: 'PEA 3-Phase Meter 30(100)A', x: 320, y: 30, kw: 0, demandFactor: 100, breakerAmp: 100, icRating: '25kA', tripCurve: 'C', cableSize: '4x35 sq.mm. + G-1x16 sq.mm.', cableLength: 30, groundType: 'Bare Copper' },
      { id: '2', type: 'mccb', label: 'Main MCCB 100A 3P 25kA', x: 320, y: 120, kw: 0, demandFactor: 100, breakerAmp: 100, icRating: '25kA', tripCurve: 'C', cableSize: '4x35 sq.mm. + G-1x16 sq.mm.', cableLength: 10, groundType: 'Bare Copper' },
      { id: '3', type: 'mdb', label: 'MDB Main Busbar 400V', x: 320, y: 210, kw: 0, demandFactor: 100, breakerAmp: 100, icRating: '25kA', tripCurve: 'C', cableSize: 'Busbar 25x3mm', cableLength: 2, groundType: 'Bare Copper' },
      { id: '3_1', type: 'spd', label: 'AC Solar SPD Type 2 (40kA 4P)', x: 100, y: 210, kw: 0, demandFactor: 100, breakerAmp: 25, icRating: '10kA', tripCurve: 'C', cableSize: '1x6 sq.mm. + G-1x6 sq.mm.', cableLength: 2, groundType: 'THW Green', isTapNode: true },
      { id: '4', type: 'solar', label: 'Solar On-Grid Inverter 10kW', x: 40, y: 330, kw: 10, demandFactor: 100, breakerAmp: 25, icRating: '10kA', tripCurve: 'C', cableSize: '4x6 sq.mm. + G-1x6 sq.mm.', cableLength: 15, groundType: 'THW Green' },
      { id: '5', type: 'motor', label: 'Chiller Pump Motor 7.5kW', x: 180, y: 330, kw: 7.5, demandFactor: 100, breakerAmp: 32, icRating: '10kA', tripCurve: 'D', cableSize: '4x6 sq.mm. + G-1x6 sq.mm.', cableLength: 20, groundType: 'THW Green' },
      { id: '6', type: 'aircon', label: 'VRV Air Con Central 15kW', x: 320, y: 330, kw: 15.0, demandFactor: 100, breakerAmp: 50, icRating: '15kA', tripCurve: 'C', cableSize: '4x16 sq.mm. + G-1x10 sq.mm.', cableLength: 25, groundType: 'THW Green' },
      { id: '7', type: 'lighting', label: 'Sub-DB 1 (Lighting & Sockets 5kW 3P Balanced)', x: 460, y: 330, kw: 5.0, demandFactor: 80, breakerAmp: 25, icRating: '10kA', tripCurve: 'B', cableSize: '4x4 sq.mm. + G-1x4 sq.mm.', cableLength: 35, groundType: 'THW Green' },
    ],
    connections: [
      { from: '1', to: '2' },
      { from: '2', to: '3' },
      { from: '3', to: '3_1' },
      { from: '3', to: '4' },
      { from: '3', to: '5' },
      { from: '3', to: '6' },
      { from: '3', to: '7' },
    ]
  }
};

const SingleLineDiagram = () => {
  const navigate = useNavigate();
  const [nodes, setNodes] = useState(PRESET_TEMPLATES.home_1p.nodes);
  const [connections, setConnections] = useState(PRESET_TEMPLATES.home_1p.connections);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [systemPhase, setSystemPhase] = useState('1P'); // '1P' (230V) or '3P' (400V)
  const [installationGroup, setInstallationGroup] = useState('group2'); // 'group2' | 'group5'
  const [showLoadScheduleView, setShowLoadScheduleView] = useState(false);

  // Dragging state
  const [draggingId, setDraggingId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);

  // Connecting mode state
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectStartId, setConnectStartId] = useState(null);

  // Keyboard Esc Listener to Cancel Connection Mode
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsConnecting(false);
        setConnectStartId(null);
        toast('ยกเลิกโหมดเชื่อมสายไฟแล้ว', { icon: '✖️' });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Load Preset
  const handleLoadPreset = (key) => {
    const preset = PRESET_TEMPLATES[key];
    if (!preset) return;
    setNodes(preset.nodes);
    setConnections(preset.connections);
    setSystemPhase(key.includes('3p') ? '3P' : '1P');
    setSelectedNodeId(null);
    setIsConnecting(false);
    setConnectStartId(null);
    toast.success(`โหลดแทมเพลต ${preset.title} สำเร็จ!`);
  };

  // Auto Align Layout
  const handleAutoAlignLayout = () => {
    const presetKey = systemPhase === '3P' ? 'solar_3p' : 'home_1p';
    handleLoadPreset(presetKey);
    toast.success('จัดระเบียบตำแหน่งอุปกรณ์ใหม่อัตโนมัติเรียบร้อย!');
  };

  // Add Component
  const handleAddComponent = (compType) => {
    const preset = COMPONENT_TYPES.find(c => c.type === compType);
    const newId = `node_${Date.now()}`;
    const newNode = {
      id: newId,
      type: compType,
      label: `${preset.name.split(' ')[1]} #${nodes.length + 1}`,
      x: 200 + (Math.random() * 100),
      y: 200 + (Math.random() * 100),
      kw: preset.defaultKw,
      demandFactor: compType === 'lighting' ? 80 : 100,
      breakerAmp: compType === 'aircon' ? 20 : compType === 'motor' ? 32 : 16,
      icRating: '10kA',
      tripCurve: compType === 'motor' ? 'D' : 'C',
      cableSize: '2x2.5 sq.mm.',
      cableLength: 15,
      groundType: 'THW Green',
    };
    setNodes(prev => [...prev, newNode]);
    setSelectedNodeId(newId);
    toast.success(`เพิ่มอุปกรณ์ ${preset.name} แล้ว!`);
  };

  // Delete Component
  const handleDeleteNode = (id) => {
    setNodes(prev => prev.filter(n => n.id !== id));
    setConnections(prev => prev.filter(c => c.from !== id && c.to !== id));
    if (selectedNodeId === id) setSelectedNodeId(null);
    toast.success('ลบอุปกรณ์แล้ว');
  };

  // Delete Specific Connection Wire
  const handleDeleteConnection = (fromId, toId, e) => {
    if (e) e.stopPropagation();
    if (window.confirm('ต้องการลบสายเชื่อมต่อเส้นนี้ใช่หรือไม่?')) {
      setConnections(prev => prev.filter(c => !(c.from === fromId && c.to === toId) && !(c.from === toId && c.to === fromId)));
      toast.success('ลบสายเชื่อมต่อเรียบร้อย!');
    }
  };

  // Handle Node Mouse Events
  const handleNodeMouseDown = (id, e) => {
    e.stopPropagation();
    if (isConnecting) {
      if (!connectStartId) {
        setConnectStartId(id);
        toast('คลิกเลือกอุปกรณ์จุดที่ 2 เพื่อต่อสาย...', { icon: '🔌' });
      } else if (connectStartId !== id) {
        const exists = connections.some(c => (c.from === connectStartId && c.to === id) || (c.from === id && c.to === connectStartId));
        if (!exists) {
          setConnections(prev => [...prev, { from: connectStartId, to: id }]);
          toast.success('เชื่อมต่อสายไฟฟ้าเรียบร้อย!');
        }
        setConnectStartId(null);
        setIsConnecting(false);
      }
      return;
    }

    setSelectedNodeId(id);
    setDraggingId(id);
    const node = nodes.find(n => n.id === id);
    if (node) {
      setDragOffset({ x: e.clientX - node.x, y: e.clientY - node.y });
    }
  };

  // Mouse Move with Bounding Constraints Clamping!
  const handleMouseMove = (e) => {
    if (!draggingId || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    let newX = e.clientX - dragOffset.x;
    let newY = e.clientY - dragOffset.y;

    const maxX = Math.max(50, rect.width - 170);
    const maxY = Math.max(50, rect.height - 75);

    newX = Math.max(10, Math.min(maxX, newX));
    newY = Math.max(10, Math.min(maxY, newY));

    newX = Math.round(newX / 10) * 10;
    newY = Math.round(newY / 10) * 10;

    setNodes(prev => prev.map(n => n.id === draggingId ? { ...n, x: newX, y: newY } : n));
  };

  const handleMouseUp = () => setDraggingId(null);

  // EIT Engineering Calculation Engine
  const calcResults = useMemo(() => {
    let totalConnectedKw = 0;
    let totalDemandKw = 0;

    nodes.forEach(n => {
      const kw = Number(n.kw) || 0;
      const df = (Number(n.demandFactor) || 100) / 100;
      totalConnectedKw += kw;
      totalDemandKw += (kw * df);
    });

    const pf = 0.85;
    const voltage = systemPhase === '3P' ? 400 : 230;

    let totalAmps = 0;
    if (systemPhase === '3P') {
      totalAmps = (totalDemandKw * 1000) / (Math.sqrt(3) * voltage * pf);
    } else {
      totalAmps = (totalDemandKw * 1000) / (voltage * pf);
    }

    const mainBreakerNode = nodes.find(n => n.type === 'mccb' || n.type === 'grid');
    const actualMainBreaker = mainBreakerNode ? Number(mainBreakerNode.breakerAmp) || 50 : 50;

    const cableSizingAmps = Math.max(totalAmps * 1.25, actualMainBreaker);
    const recommendedBreaker = Math.ceil(totalAmps * 1.25);
    
    let recommendedCable = '2x2.5 sq.mm.';
    let groundCable = '1x2.5 sq.mm.';

    if (installationGroup === 'group2') {
      if (cableSizingAmps <= 16) { recommendedCable = '2x2.5 sq.mm.'; groundCable = '1x2.5 sq.mm.'; }
      else if (cableSizingAmps <= 22) { recommendedCable = '2x4 sq.mm.'; groundCable = '1x2.5 sq.mm.'; }
      else if (cableSizingAmps <= 31) { recommendedCable = '2x6 sq.mm.'; groundCable = '1x4 sq.mm.'; }
      else if (cableSizingAmps <= 43) { recommendedCable = systemPhase === '3P' ? '4x10 sq.mm.' : '2x10 sq.mm.'; groundCable = '1x6 sq.mm.'; }
      else if (cableSizingAmps <= 53) { recommendedCable = systemPhase === '3P' ? '4x16 sq.mm.' : '2x16 sq.mm.'; groundCable = '1x10 sq.mm.'; }
      else if (cableSizingAmps <= 72) { recommendedCable = systemPhase === '3P' ? '4x25 sq.mm.' : '2x25 sq.mm.'; groundCable = '1x16 sq.mm.'; }
      else if (cableSizingAmps <= 89) { recommendedCable = systemPhase === '3P' ? '4x35 sq.mm.' : '2x35 sq.mm.'; groundCable = '1x16 sq.mm.'; }
      else if (cableSizingAmps <= 110) { recommendedCable = systemPhase === '3P' ? '4x50 sq.mm.' : '2x50 sq.mm.'; groundCable = '1x25 sq.mm.'; }
      else { recommendedCable = systemPhase === '3P' ? '4x70 sq.mm.' : '2x70 sq.mm.'; groundCable = '1x25 sq.mm.'; }
    } else {
      if (cableSizingAmps <= 22) { recommendedCable = '2x2.5 sq.mm.'; groundCable = '1x2.5 sq.mm.'; }
      else if (cableSizingAmps <= 30) { recommendedCable = '2x4 sq.mm.'; groundCable = '1x2.5 sq.mm.'; }
      else if (cableSizingAmps <= 40) { recommendedCable = '2x6 sq.mm.'; groundCable = '1x4 sq.mm.'; }
      else if (cableSizingAmps <= 55) { recommendedCable = systemPhase === '3P' ? '4x10 sq.mm.' : '2x10 sq.mm.'; groundCable = '1x6 sq.mm.'; }
      else if (cableSizingAmps <= 75) { recommendedCable = systemPhase === '3P' ? '4x16 sq.mm.' : '2x16 sq.mm.'; groundCable = '1x10 sq.mm.'; }
      else if (cableSizingAmps <= 100) { recommendedCable = systemPhase === '3P' ? '4x25 sq.mm.' : '2x25 sq.mm.'; groundCable = '1x16 sq.mm.'; }
      else { recommendedCable = systemPhase === '3P' ? '4x35 sq.mm.' : '2x35 sq.mm.'; groundCable = '1x16 sq.mm.'; }
    }

    const isOverloaded = totalAmps > actualMainBreaker;

    return {
      totalConnectedKw: totalConnectedKw.toFixed(2),
      totalDemandKw: totalDemandKw.toFixed(2),
      totalKva: (totalDemandKw / pf).toFixed(2),
      totalAmps: totalAmps.toFixed(1),
      voltage,
      pf,
      recommendedBreaker,
      actualMainBreaker,
      recommendedCable,
      groundCable,
      isOverloaded
    };
  }, [nodes, systemPhase, installationGroup]);

  const selectedNode = useMemo(() => nodes.find(n => n.id === selectedNodeId), [nodes, selectedNodeId]);

  const handleUpdateSelectedNode = (field, value) => {
    if (!selectedNodeId) return;
    setNodes(prev => prev.map(n => n.id === selectedNodeId ? { ...n, [field]: value } : n));
  };

  // Node Voltage Drop (%VD) Calculation
  const getNodeVoltageDrop = (node) => {
    if (!node.kw || node.kw <= 0 || !node.cableLength) return 0;
    const len = Number(node.cableLength) || 10;
    const kw = Number(node.kw) || 1;
    const pf = 0.85;
    const v = systemPhase === '3P' ? 400 : 230;

    let current = 0;
    if (systemPhase === '3P') {
      current = (kw * 1000) / (Math.sqrt(3) * v * pf);
    } else {
      current = (kw * 1000) / (v * pf);
    }

    const match = (node.cableSize || '2.5').match(/(\d+(\.\d+)?)/g);
    const sqmm = match && match.length > 1 ? parseFloat(match[1]) : 2.5;
    const resistance = CABLE_RESISTANCE_OHM_PER_KM[sqmm] || 8.91;

    let vdVolts = 0;
    if (systemPhase === '3P') {
      vdVolts = (Math.sqrt(3) * len * current * (resistance / 1000));
    } else {
      vdVolts = (2 * len * current * (resistance / 1000));
    }

    return ((vdVolts / v) * 100).toFixed(2);
  };

  // Multi-Threshold Voltage Drop Warning Status (Green / Orange / Red)
  const getVoltageDropStatus = (node, vdVal) => {
    const numVd = Number(vdVal);
    if (!numVd || numVd <= 0) return { color: '#10b981', label: '', border: null, isWarning: false, isCritical: false };

    const isMotor = node.type === 'motor';
    const warningThreshold = isMotor ? 3.0 : 2.0;
    const criticalThreshold = isMotor ? 5.0 : 3.0;

    if (numVd > criticalThreshold) {
      return {
        color: '#ef4444', // Neon Red
        bgColor: 'rgba(239, 68, 68, 0.25)',
        label: `⚠️ เกินมาตรฐาน (${numVd}% > ${criticalThreshold}%)`,
        border: '2px solid #ef4444',
        boxShadow: '0 0 15px rgba(239, 68, 68, 0.8)',
        isWarning: true,
        isCritical: true,
        badgeText: `🔴 VD: ${numVd}% (เกินเกณฑ์แนะนำเพิ่มสาย!)`
      };
    } else if (numVd > warningThreshold) {
      return {
        color: '#f59e0b', // Amber/Orange
        bgColor: 'rgba(245, 158, 11, 0.2)',
        label: `⚡ เตือนแรงดันตกสูง (${numVd}%)`,
        border: '1.5px solid #f59e0b',
        boxShadow: '0 0 10px rgba(245, 158, 11, 0.5)',
        isWarning: true,
        isCritical: false,
        badgeText: `🍊 VD: ${numVd}% (เฝ้าระวัง)`
      };
    } else {
      return {
        color: '#10b981', // Emerald Green
        bgColor: 'transparent',
        label: 'ปกติ',
        border: null,
        boxShadow: null,
        isWarning: false,
        isCritical: false,
        badgeText: `🟢 VD: ${numVd}%`
      };
    }
  };

  const handlePrintDiagram = () => window.print();

  // ==================== PANELBOARD LOAD SCHEDULE VIEW ====================
  if (showLoadScheduleView) {
    return (
      <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
        <style>{`
          @media print {
            .no-print { display: none !important; }
            body { background: white !important; color: black !important; }
            .nav-bar, .chatbot-btn { display: none !important; }
            .load-schedule-container { padding: 0 !important; border: none !important; }
          }
        `}</style>

        <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <button onClick={() => setShowLoadScheduleView(false)} style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 'bold' }}>
            <ArrowLeft size={18} /> กลับไปที่ SLD Builder
          </button>

          <button onClick={handlePrintDiagram} className="primary-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Printer size={18} /> พิมพ์ตารางตู้โหลด (PDF)
          </button>
        </div>

        {/* Panelboard Schedule Printable Layout */}
        <div
          className="load-schedule-container"
          style={{
            background: 'white',
            color: '#0f172a',
            padding: '2.5rem',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            fontFamily: 'Prompt, sans-serif',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '1.5rem', borderBottom: '2px solid #0f172a', paddingBottom: '1rem' }}>
            <h2 style={{ margin: '0 0 0.25rem', color: '#0f172a', fontSize: '1.6rem', fontWeight: 800 }}>
              ตารางตู้โหลดไฟฟ้า (PANELBOARD LOAD SCHEDULE)
            </h2>
            <p style={{ margin: 0, color: '#475569', fontSize: '0.9rem' }}>
              ระบบไฟ: {systemPhase === '3P' ? '3-Phase 4-Wire 400/230V 50Hz' : '1-Phase 2-Wire 230V 50Hz'} | มาตรฐาน วสท. (EIT Standard)
            </p>
          </div>

          {/* Panel Info Box */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}>
            <div><strong>ชื่อตู้ไฟ (Panel Name):</strong> MDB-01 / Consumer Unit</div>
            <div><strong>พิกัดเมนเบรกเกอร์ (Main Breaker):</strong> {calcResults.actualMainBreaker}A ({calcResults.voltage}V)</div>
            <div><strong>ขนาดสายเมน (Main Feeder):</strong> {calcResults.recommendedCable} + G-{calcResults.groundCable}</div>
          </div>

          {/* Circuits Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            <thead>
              <tr style={{ background: '#0f172a', color: 'white', borderBottom: '2px solid #0f172a' }}>
                <th style={{ padding: '0.6rem', textAlign: 'center' }}>วงจรที่</th>
                <th style={{ padding: '0.6rem', textAlign: 'left' }}>รายการโหลด (Circuit Description)</th>
                <th style={{ padding: '0.6rem', textAlign: 'center' }}>โหลด (kW)</th>
                <th style={{ padding: '0.6rem', textAlign: 'center' }}>D.F. (%)</th>
                <th style={{ padding: '0.6rem', textAlign: 'center' }}>กระแส (A)</th>
                <th style={{ padding: '0.6rem', textAlign: 'center' }}>Breaker (A / IC / Curve)</th>
                <th style={{ padding: '0.6rem', textAlign: 'center' }}>ขนาดสายไฟ (Cable Size)</th>
                <th style={{ padding: '0.6rem', textAlign: 'center' }}>ระยะทาง (m)</th>
                <th style={{ padding: '0.6rem', textAlign: 'center' }}>%VD</th>
              </tr>
            </thead>
            <tbody>
              {nodes
                .filter(n => !['grid', 'transformer', 'mccb', 'db', 'mdb'].includes(n.type))
                .map((n, i) => {
                  const vd = getNodeVoltageDrop(n);
                  const status = getVoltageDropStatus(n, vd);
                  const kw = Number(n.kw) || 0;
                  const df = Number(n.demandFactor) || 100;
                  const amps = systemPhase === '3P' ? (kw * 1000 * (df/100)) / (Math.sqrt(3)*400*0.85) : (kw * 1000 * (df/100)) / (230*0.85);

                return (
                  <tr key={n.id} style={{ borderBottom: '1px solid #e2e8f0', background: i % 2 === 0 ? 'white' : '#f8fafc' }}>
                    <td style={{ padding: '0.55rem', textAlign: 'center', fontWeight: 'bold' }}>CKT-{i + 1}</td>
                    <td style={{ padding: '0.55rem', fontWeight: 600 }}>{n.label}</td>
                    <td style={{ padding: '0.55rem', textAlign: 'center', color: '#2563eb', fontWeight: 'bold' }}>{kw > 0 ? kw.toFixed(2) : '-'}</td>
                    <td style={{ padding: '0.55rem', textAlign: 'center' }}>{df}%</td>
                    <td style={{ padding: '0.55rem', textAlign: 'center', fontWeight: 'bold' }}>{amps > 0 ? amps.toFixed(1) : '-'}</td>
                    <td style={{ padding: '0.55rem', textAlign: 'center' }}>{n.breakerAmp}A ({n.icRating || '10kA'}/{n.tripCurve || 'C'})</td>
                    <td style={{ padding: '0.55rem', textAlign: 'center' }}>{n.cableSize || '2x2.5 sq.mm.'}</td>
                    <td style={{ padding: '0.55rem', textAlign: 'center' }}>{n.cableLength || 10} m</td>
                    <td style={{ padding: '0.55rem', textAlign: 'center', fontWeight: 'bold' }}>
                      {vd > 0 ? (
                        <span style={{
                          color: status.color,
                          background: status.isCritical ? '#fee2e2' : status.isWarning ? '#fef3c7' : '#d1fae5',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          border: status.isCritical ? '1px solid #ef4444' : status.isWarning ? '1px solid #f59e0b' : '1px solid #10b981'
                        }}>
                          {vd}% {status.isCritical ? '⚠️ (เกินเกณฑ์)' : status.isWarning ? '⚡ (เตือน)' : ''}
                        </span>
                      ) : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Load Summary Footer */}
          <div style={{ background: '#f1f5f9', padding: '1rem', borderRadius: '6px', borderLeft: '4px solid #0f172a', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', fontSize: '0.85rem' }}>
            <div>โหลดติดตั้งรวม: <strong>{calcResults.totalConnectedKw} kW</strong></div>
            <div>โหลดยอดสูงสุด (Demand): <strong>{calcResults.totalDemandKw} kW</strong></div>
            <div>กระแสรวมคำนวณ: <strong style={{ color: '#2563eb' }}>{calcResults.totalAmps} A</strong></div>
            <div>กำลังไฟฟ้า kVA: <strong>{calcResults.totalKva} kVA</strong></div>
          </div>

          {/* Official Engineering Signature & Approval Block */}
          <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '2px dashed #94a3b8', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', fontSize: '0.85rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ height: '40px', borderBottom: '1px solid #0f172a', marginBottom: '0.4rem' }}></div>
              <p style={{ margin: 0, fontWeight: 'bold', color: '#0f172a' }}>ผู้เขียนแบบ / ผู้คำนวณ (Prepared By)</p>
              <p style={{ margin: '0.2rem 0 0', color: '#64748b', fontSize: '0.8rem' }}>วันที่: {new Date().toLocaleDateString('th-TH')}</p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ height: '40px', borderBottom: '1px solid #0f172a', marginBottom: '0.4rem' }}></div>
              <p style={{ margin: 0, fontWeight: 'bold', color: '#0f172a' }}>วิศวกรไฟฟ้าผู้ตรวจทานและรับรอง (Approved By)</p>
              <p style={{ margin: '0.2rem 0 0', color: '#64748b', fontSize: '0.8rem' }}>เลขที่ใบอนุญาต ภฟ./สฟ./ภก.: ...........................................</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==================== MAIN SLD BUILDER CANVAS VIEW ====================
  return (
    <div className="animate-fade-in" style={{ paddingBottom: '4rem' }} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; color: black !important; }
          .nav-bar, .chatbot-btn { display: none !important; }
          .printable-diagram { padding: 0 !important; border: 2px solid black !important; background: white !important; }
        }
      `}</style>

      {/* Header */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Zap color="var(--accent-solar)" size={28} />
            <h1 className="text-gradient-solar" style={{ fontSize: '2.3rem', marginBottom: 0 }}>Single Line Diagram (SLD) Builder</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            โปรแกรมเขียนแบบวงจรไฟฟ้าเส้นเดียวและคำนวณมาตรฐานวิศวกรรมไฟฟ้า (EIT Standard)
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            value={systemPhase}
            onChange={(e) => setSystemPhase(e.target.value)}
            style={{ padding: '0.69rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontWeight: 'bold' }}
          >
            <option value="1P">⚡ 1-Phase 230V (บ้านพักอาศัย)</option>
            <option value="3P">⚡⚡⚡ 3-Phase 400V (อาคาร/โรงงาน)</option>
          </select>

          <button onClick={() => setShowLoadScheduleView(true)} style={{ background: 'rgba(59, 130, 246, 0.15)', border: '1px solid #3b82f6', color: '#3b82f6', padding: '0.65rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem' }}>
            <Table size={18} /> ตารางตู้โหลด (Load Schedule)
          </button>

          <button onClick={handlePrintDiagram} className="primary-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem' }}>
            <Printer size={18} /> พิมพ์แบบแผนผัง PDF
          </button>
        </div>
      </div>

      {/* Presets, Align & Installation Group Selector */}
      <div className="no-print" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center', background: 'var(--bg-secondary)', padding: '0.85rem 1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', fontWeight: 'bold' }}>📁 แทมเพลต:</span>
          <button onClick={() => handleLoadPreset('home_1p')} style={{ background: 'rgba(255, 115, 0, 0.1)', border: '1px solid var(--accent-solar)', color: 'var(--accent-solar)', padding: '0.4rem 0.85rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}>
            🏠 บ้านพัก 1-Phase
          </button>
          <button onClick={() => handleLoadPreset('solar_3p')} style={{ background: 'rgba(0, 240, 255, 0.1)', border: '1px solid var(--accent-ac)', color: 'var(--accent-ac)', padding: '0.4rem 0.85rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}>
            ☀️ อาคาร 3-Phase + โซลาร์ 10kW
          </button>

          <button onClick={handleAutoAlignLayout} style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#10b981', padding: '0.4rem 0.85rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <RefreshCw size={14} /> 🧹 จัดระเบียบผังอัตโนมัติ
          </button>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', fontWeight: 'bold' }}>🛣️ การเดินสาย (EIT Group):</span>
          <select
            value={installationGroup}
            onChange={(e) => setInstallationGroup(e.target.value)}
            style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
          >
            <option value="group2">กลุ่ม 2 (เดินในท่อร้อยสายในอากาศ)</option>
            <option value="group5">กลุ่ม 5 (เดินลอยในอากาศ Free Air Tray)</option>
          </select>
        </div>
      </div>

      {/* Main Builder Grid Workspace */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr 320px', gap: '1.25rem', alignItems: 'start' }}>
        
        {/* LEFT PANEL: Component Palette */}
        <div className="equipment-card no-print" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Plus size={18} color="var(--accent-primary)" /> อุปกรณ์ไฟฟ้า (Palette)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {COMPONENT_TYPES.map(comp => (
              <button
                key={comp.type}
                onClick={() => handleAddComponent(comp.type)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = comp.color}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
              >
                <span style={{ fontSize: '1.2rem' }}>{comp.icon}</span>
                <span>{comp.name}</span>
              </button>
            ))}
          </div>

          <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <button
              onClick={() => { setIsConnecting(!isConnecting); setConnectStartId(null); }}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: isConnecting ? '2px solid #ef4444' : '1px solid var(--border-color)',
                background: isConnecting ? 'rgba(239, 68, 68, 0.15)' : 'var(--bg-secondary)',
                color: isConnecting ? '#ef4444' : 'var(--text-primary)',
                fontWeight: 'bold',
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
              }}
            >
              <Zap size={16} /> {isConnecting ? '❌ ยกเลิกเชื่อมสายไฟ (Esc)' : '🔌 โหมดเดินสายไฟ (Connect Lines)'}
            </button>
          </div>
        </div>

        {/* CENTER: Interactive SVG Diagram Canvas */}
        <div
          ref={canvasRef}
          className="printable-diagram"
          style={{
            background: '#090d16',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            minHeight: '640px',
            position: 'relative',
            overflow: 'hidden',
            backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 0)',
            backgroundSize: '20px 20px',
            userSelect: 'none',
          }}
        >
          {/* Engineering Title Block Header */}
          <div style={{ position: 'absolute', top: 15, left: 20, zIndex: 1, pointerEvents: 'none' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>
              SCHEMATIC DIAGRAM: SINGLE LINE DIAGRAM ({systemPhase})
            </span>
          </div>

          {/* Floating Connecting Overlay Badge with Cancel Option */}
          {isConnecting && (
            <div style={{ position: 'absolute', top: 12, right: 15, zIndex: 10, background: 'rgba(239, 68, 68, 0.95)', color: 'white', padding: '0.5rem 1rem', borderRadius: '50px', fontWeight: 'bold', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.6rem', boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)' }}>
              <span>🔌 กำลังเชื่อมสาย: {connectStartId ? 'เลือกจุดที่ 2...' : 'เลือกจุดเริ่มต้น...'}</span>
              <button onClick={() => { setIsConnecting(false); setConnectStartId(null); }} style={{ background: 'white', color: '#ef4444', border: 'none', padding: '0.25rem 0.6rem', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.75rem' }}>
                ❌ ยกเลิก (Esc)
              </button>
            </div>
          )}

          {/* SVG Connection Lines & Junction Dots */}
          <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'all', zIndex: 2 }}>
            {connections.map((conn, idx) => {
              const fromNode = nodes.find(n => n.id === conn.from);
              const toNode = nodes.find(n => n.id === conn.to);
              if (!fromNode || !toNode) return null;

              const x1 = fromNode.x + 80;
              const y1 = fromNode.y + 30;
              const x2 = toNode.x + 80;
              const y2 = toNode.y + 30;

              const isTap = toNode.type === 'spd' || toNode.isTapNode;
              const vd = getNodeVoltageDrop(toNode);
              const status = getVoltageDropStatus(toNode, vd);

              // Calculate staggered position along the line to prevent any label overlapping!
              const t = 0.3 + ((idx % 4) * 0.18); 
              const labelX = x1 + (x2 - x1) * t;
              const labelY = y1 + (y2 - y1) * t;

              const labelText = toNode.cableSize || (systemPhase === '3P' ? '4x4 sq.mm.' : '2x2.5 sq.mm.');
              const badgeWidth = Math.max(100, labelText.length * 6.2 + 14);

              return (
                <g key={idx} style={{ cursor: 'pointer' }} onClick={(e) => handleDeleteConnection(conn.from, conn.to, e)}>
                  {/* Thick Neon Connection Line */}
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={status.isCritical ? '#ef4444' : status.isWarning ? '#f59e0b' : calcResults.isOverloaded ? '#ef4444' : '#00f0ff'}
                    strokeWidth="4"
                    strokeDasharray={fromNode.type === 'solar' ? '6,6' : 'none'}
                    style={{ filter: status.isCritical ? 'drop-shadow(0 0 10px rgba(239, 68, 68, 0.9))' : 'drop-shadow(0 0 6px rgba(0, 240, 255, 0.5))' }}
                  />

                  {/* Junction Solid Dot for Parallel Tap Connections */}
                  {isTap && (
                    <circle cx={x1} cy={y1} r="6" fill="#ff7300" stroke="#ffffff" strokeWidth="2" />
                  )}

                  {/* Cable Size Badge (Staggered & Auto-width to prevent overlap) */}
                  <g>
                    <rect
                      x={labelX - badgeWidth / 2}
                      y={labelY - 10}
                      width={badgeWidth}
                      height="20"
                      rx="5"
                      fill="#020617"
                      stroke={status.isCritical ? '#ef4444' : status.isWarning ? '#f59e0b' : '#00f0ff'}
                      strokeWidth="1.5"
                      style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.8))' }}
                    />
                    <text
                      x={labelX}
                      y={labelY + 4}
                      fill={status.isCritical ? '#fca5a5' : status.isWarning ? '#fde047' : '#ffffff'}
                      fontSize="10"
                      textAnchor="middle"
                      fontWeight="bold"
                    >
                      {labelText}
                    </text>
                  </g>
                </g>
              );
            })}
          </svg>

          {/* Component Nodes (Bounded inside Canvas) */}
          {nodes.map(node => {
            const compPreset = COMPONENT_TYPES.find(c => c.type === node.type) || COMPONENT_TYPES[0];
            const isSelected = selectedNodeId === node.id;
            const isConnectTarget = connectStartId === node.id;
            const vd = getNodeVoltageDrop(node);
            const status = getVoltageDropStatus(node, vd);

            return (
              <div
                key={node.id}
                onMouseDown={(e) => handleNodeMouseDown(node.id, e)}
                style={{
                  position: 'absolute',
                  left: node.x,
                  top: node.y,
                  width: '160px',
                  padding: '0.6rem 0.8rem',
                  borderRadius: '10px',
                  background: isConnectTarget ? 'rgba(239, 68, 68, 0.25)' : isSelected ? 'rgba(15, 23, 42, 0.95)' : 'rgba(15, 23, 42, 0.85)',
                  border: status.isCritical ? '2px solid #ef4444' : status.isWarning ? '2px solid #f59e0b' : isConnectTarget ? '#ef4444' : isSelected ? 'var(--accent-primary)' : compPreset.color,
                  boxShadow: status.isCritical ? '0 0 20px rgba(239, 68, 68, 0.9)' : status.isWarning ? '0 0 12px rgba(245, 158, 11, 0.7)' : isSelected ? '0 0 18px rgba(255, 115, 0, 0.5)' : '0 4px 12px rgba(0,0,0,0.5)',
                  cursor: isConnecting ? 'crosshair' : 'grab',
                  zIndex: 3,
                  transition: 'border 0.2s, box-shadow 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                  <span style={{ fontSize: '1.2rem' }}>{compPreset.icon}</span>
                  <strong style={{ fontSize: '0.8rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>
                    {node.label}
                  </strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>
                  {node.breakerAmp && <span>CB: {node.breakerAmp}A ({node.icRating || '10kA'})</span>}
                  {node.kw > 0 && <span style={{ color: 'var(--accent-ac)', fontWeight: 'bold' }}>{node.kw} kW</span>}
                </div>

                {/* Multi-Threshold Voltage Drop Badge */}
                {vd > 0 && (
                  <div style={{
                    fontSize: '0.68rem',
                    color: status.color,
                    fontWeight: 'bold',
                    marginTop: '0.3rem',
                    padding: status.isWarning ? '0.2rem 0.35rem' : '0',
                    borderRadius: '4px',
                    background: status.bgColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <span>{status.badgeText}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* RIGHT PANEL: Calculations & Node Inspector */}
        <div className="no-print" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Engineering Calc Summary Card */}
          <div className="equipment-card" style={{ padding: '1.25rem', border: `1px solid ${calcResults.isOverloaded ? '#ef4444' : 'var(--accent-primary)'}` }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Cpu size={18} color="var(--accent-solar)" /> คำนวณตามมาตรฐาน วสท.
            </h3>

            {calcResults.isOverloaded && (
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', padding: '0.6rem 0.8rem', borderRadius: '8px', color: '#ef4444', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <AlertTriangle size={16} /> ⚠️ โหลดรวมเกินพิกัดเบรกเกอร์หลัก!
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>โหลดติดตั้งรวม (Connected Load):</span>
                <strong style={{ color: 'var(--text-primary)' }}>{calcResults.totalConnectedKw} kW</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>โหลดยอดสูงสุด (Max Demand):</span>
                <strong style={{ color: 'var(--accent-ac)' }}>{calcResults.totalDemandKw} kW</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>กระแสโหลดคำนวณ (Demand Current):</span>
                <strong style={{ color: 'var(--accent-solar)', fontSize: '0.95rem' }}>{calcResults.totalAmps} A</strong>
              </div>

              {/* Recommended Main Breaker (Cyan Color UX Fix) */}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>พิกัดเมนเบรกเกอร์แนะนำ:</span>
                <strong style={{ color: '#00f0ff', fontSize: '0.95rem' }}>{calcResults.recommendedBreaker} A</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>ขนาดสายเมนแนะนำ (THW):</span>
                <strong style={{ color: '#10b981' }}>{calcResults.recommendedCable}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>ขนาดสายดินแนะนำ (Ground):</span>
                <strong style={{ color: '#10b981' }}>{calcResults.groundCable}</strong>
              </div>
            </div>
          </div>

          {/* Node Inspector Panel with Increased Spacing & Rich Specs */}
          {selectedNode ? (
            <div className="equipment-card animate-fade-in" style={{ padding: '1.25rem', border: '1px solid var(--accent-solar)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                <h4 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '0.95rem' }}>✏️ แก้ไขข้อมูลและสเปคอุปกรณ์</h4>
                <button onClick={() => handleDeleteNode(selectedNode.id)} style={{ background: 'rgba(239, 68, 68, 0.15)', border: 'none', color: '#ef4444', padding: '0.35rem 0.6rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}>
                  <Trash2 size={14} /> ลบ
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', fontSize: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>ชื่ออุปกรณ์ (Label):</label>
                  <input
                    type="text"
                    value={selectedNode.label}
                    onChange={(e) => handleUpdateSelectedNode('label', e.target.value)}
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>โหลด (kW):</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={selectedNode.kw}
                      onChange={(e) => handleUpdateSelectedNode('kw', Number(e.target.value))}
                      style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Demand Factor (%):</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={selectedNode.demandFactor || 100}
                      onChange={(e) => handleUpdateSelectedNode('demandFactor', Number(e.target.value))}
                      style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Breaker (Amp):</label>
                    <input
                      type="number"
                      min="1"
                      value={selectedNode.breakerAmp}
                      onChange={(e) => handleUpdateSelectedNode('breakerAmp', Number(e.target.value))}
                      style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>พิกัด IC (kA):</label>
                    <select
                      value={selectedNode.icRating || '10kA'}
                      onChange={(e) => handleUpdateSelectedNode('icRating', e.target.value)}
                      style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                    >
                      <option value="6kA">6 kA</option>
                      <option value="10kA">10 kA</option>
                      <option value="15kA">15 kA</option>
                      <option value="25kA">25 kA</option>
                      <option value="36kA">36 kA</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Trip Curve:</label>
                    <select
                      value={selectedNode.tripCurve || 'C'}
                      onChange={(e) => handleUpdateSelectedNode('tripCurve', e.target.value)}
                      style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                    >
                      <option value="B">Curve B (Resistive)</option>
                      <option value="C">Curve C (General/HVAC)</option>
                      <option value="D">Curve D (Motor Inrush)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>ระยะทางสาย (เมตร):</label>
                    <input
                      type="number"
                      min="1"
                      value={selectedNode.cableLength || 10}
                      onChange={(e) => handleUpdateSelectedNode('cableLength', Number(e.target.value))}
                      style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>ขนาดสายไฟ (Cable Size):</label>
                  <input
                    type="text"
                    value={selectedNode.cableSize}
                    onChange={(e) => handleUpdateSelectedNode('cableSize', e.target.value)}
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="equipment-card" style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
              <Move size={32} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
              <p style={{ margin: 0 }}>คลิกเลือกอุปกรณ์บนผังเพื่อแก้ไขสเปค IC, Trip Curve และระยะทางสาย</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default SingleLineDiagram;
