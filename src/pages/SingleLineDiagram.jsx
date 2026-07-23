import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Zap, Plus, Trash2, Download, Printer, RefreshCw, AlertTriangle, ShieldCheck, FileText, CheckCircle2, ArrowLeft, Move, Layers, Cpu, Compass, Sliders } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// Default Component Library
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

// Presets
const PRESET_TEMPLATES = {
  home_1p: {
    title: '🏠 บ้านพักอาศัย 1-Phase 15(45)A',
    nodes: [
      { id: '1', type: 'grid', label: 'PEA Meter 15(45)A', x: 350, y: 40, kw: 0, breakerAmp: 50, cableSize: '2x16 sq.mm.' },
      { id: '2', type: 'mccb', label: 'Main Breaker 50A 1P', x: 350, y: 130, kw: 0, breakerAmp: 50, cableSize: '2x16 sq.mm.' },
      { id: '3', type: 'spd', label: 'SPD Type 2 (10kA)', x: 180, y: 220, kw: 0, breakerAmp: 20, cableSize: '1x6 sq.mm.' },
      { id: '4', type: 'db', label: 'Consumer Unit 10 Channels', x: 350, y: 220, kw: 0, breakerAmp: 50, cableSize: '2x16 sq.mm.' },
      { id: '5', type: 'aircon', label: 'Air Con 18,000 BTU', x: 150, y: 340, kw: 2.0, breakerAmp: 20, cableSize: '2x2.5 sq.mm.' },
      { id: '6', type: 'aircon', label: 'Air Con 12,000 BTU', x: 290, y: 340, kw: 1.5, breakerAmp: 16, cableSize: '2x2.5 sq.mm.' },
      { id: '7', type: 'lighting', label: 'Lighting Circuit Fl.1-2', x: 430, y: 340, kw: 1.2, breakerAmp: 10, cableSize: '2x1.5 sq.mm.' },
      { id: '8', type: 'lighting', label: 'Power Receptacles Plugs', x: 570, y: 340, kw: 2.5, breakerAmp: 20, cableSize: '2x2.5 sq.mm.' },
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
      { id: '1', type: 'grid', label: 'PEA 3-Phase Meter 30(100)A', x: 350, y: 40, kw: 0, breakerAmp: 100, cableSize: '4x35 sq.mm.' },
      { id: '2', type: 'mccb', label: 'Main MCCB 100A 3P 25kA', x: 350, y: 130, kw: 0, breakerAmp: 100, cableSize: '4x35 sq.mm.' },
      { id: '3', type: 'mdb', label: 'MDB Main Busbar 400V', x: 350, y: 220, kw: 0, breakerAmp: 100, cableSize: 'Busbar 25x3mm' },
      { id: '4', type: 'solar', label: 'Solar On-Grid Inverter 10kW', x: 130, y: 330, kw: 10, breakerAmp: 25, cableSize: '4x6 sq.mm.' },
      { id: '5', type: 'motor', label: 'Chiller Pump Motor 7.5kW', x: 290, y: 330, kw: 7.5, breakerAmp: 32, cableSize: '4x6 sq.mm.' },
      { id: '6', type: 'aircon', label: 'VRV Air Con Central 15kW', x: 450, y: 330, kw: 15.0, breakerAmp: 50, cableSize: '4x16 sq.mm.' },
      { id: '7', type: 'lighting', label: 'Office Lighting & Sockets', x: 610, y: 330, kw: 5.0, breakerAmp: 25, cableSize: '4x4 sq.mm.' },
    ],
    connections: [
      { from: '1', to: '2' },
      { from: '2', to: '3' },
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
  const [activeTab, setActiveTab] = useState('canvas'); // 'canvas' | 'calculations' | 'export'

  // Dragging state
  const [draggingId, setDraggingId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);

  // Connecting mode state
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectStartId, setConnectStartId] = useState(null);

  // Load Preset
  const handleLoadPreset = (key) => {
    const preset = PRESET_TEMPLATES[key];
    if (!preset) return;
    setNodes(preset.nodes);
    setConnections(preset.connections);
    setSystemPhase(key.includes('3p') ? '3P' : '1P');
    setSelectedNodeId(null);
    toast.success(`โหลดแทมเพลต ${preset.title} สำเร็จ!`);
  };

  // Add Component
  const handleAddComponent = (compType) => {
    const preset = COMPONENT_TYPES.find(c => c.type === compType);
    const newId = `node_${Date.now()}`;
    const newNode = {
      id: newId,
      type: compType,
      label: `${preset.name.split(' ')[1]} #${nodes.length + 1}`,
      x: 350 + (Math.random() * 40 - 20),
      y: 250 + (Math.random() * 40 - 20),
      kw: preset.defaultKw,
      breakerAmp: compType === 'aircon' ? 20 : compType === 'motor' ? 32 : 16,
      cableSize: '2x2.5 sq.mm.'
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

  // Handle Node Selection / Dragging
  const handleNodeMouseDown = (id, e) => {
    e.stopPropagation();
    if (isConnecting) {
      if (!connectStartId) {
        setConnectStartId(id);
        toast('เลือกจุดเชื่อมต่อจุดที่ 2...', { icon: '🔌' });
      } else if (connectStartId !== id) {
        // Add connection
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

  const handleMouseMove = (e) => {
    if (!draggingId) return;
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;

    let newX = e.clientX - dragOffset.x;
    let newY = e.clientY - dragOffset.y;

    // Snap to Grid 10px
    newX = Math.round(newX / 10) * 10;
    newY = Math.round(newY / 10) * 10;

    setNodes(prev => prev.map(n => n.id === draggingId ? { ...n, x: newX, y: newY } : n));
  };

  const handleMouseUp = () => {
    setDraggingId(null);
  };

  // Calculations Engine
  const calcResults = useMemo(() => {
    const totalKw = nodes.reduce((sum, n) => sum + (Number(n.kw) || 0), 0);
    const pf = 0.85;
    const voltage = systemPhase === '3P' ? 400 : 230;

    let totalAmps = 0;
    if (systemPhase === '3P') {
      totalAmps = (totalKw * 1000) / (Math.sqrt(3) * voltage * pf);
    } else {
      totalAmps = (totalKw * 1000) / (voltage * pf);
    }

    // Recommended Main Breaker (1.25x Continuous Load)
    const recommendedBreaker = Math.ceil(totalAmps * 1.25);
    
    // Recommended Cable Size (IEC/EIT Standard)
    let recommendedCable = '2x2.5 sq.mm.';
    let groundCable = '1x2.5 sq.mm.';

    if (totalAmps <= 16) { recommendedCable = '2x2.5 sq.mm.'; groundCable = '1x2.5 sq.mm.'; }
    else if (totalAmps <= 25) { recommendedCable = '2x4 sq.mm.'; groundCable = '1x2.5 sq.mm.'; }
    else if (totalAmps <= 35) { recommendedCable = '2x6 sq.mm.'; groundCable = '1x4 sq.mm.'; }
    else if (totalAmps <= 45) { recommendedCable = systemPhase === '3P' ? '4x10 sq.mm.' : '2x10 sq.mm.'; groundCable = '1x6 sq.mm.'; }
    else if (totalAmps <= 65) { recommendedCable = systemPhase === '3P' ? '4x16 sq.mm.' : '2x16 sq.mm.'; groundCable = '1x10 sq.mm.'; }
    else if (totalAmps <= 90) { recommendedCable = systemPhase === '3P' ? '4x25 sq.mm.' : '2x25 sq.mm.'; groundCable = '1x16 sq.mm.'; }
    else if (totalAmps <= 120) { recommendedCable = systemPhase === '3P' ? '4x35 sq.mm.' : '2x35 sq.mm.'; groundCable = '1x16 sq.mm.'; }
    else { recommendedCable = systemPhase === '3P' ? '4x70 sq.mm.' : '2x70 sq.mm.'; groundCable = '1x25 sq.mm.'; }

    // Find Main Breaker Node
    const mainBreakerNode = nodes.find(n => n.type === 'mccb' || n.type === 'grid');
    const actualBreaker = mainBreakerNode ? Number(mainBreakerNode.breakerAmp) || 50 : 50;

    const isOverloaded = totalAmps > actualBreaker;

    return {
      totalKw: totalKw.toFixed(2),
      totalKva: (totalKw / pf).toFixed(2),
      totalAmps: totalAmps.toFixed(1),
      voltage,
      pf,
      recommendedBreaker,
      actualBreaker,
      recommendedCable,
      groundCable,
      isOverloaded
    };
  }, [nodes, systemPhase]);

  const selectedNode = useMemo(() => nodes.find(n => n.id === selectedNodeId), [nodes, selectedNodeId]);

  const handleUpdateSelectedNode = (field, value) => {
    if (!selectedNodeId) return;
    setNodes(prev => prev.map(n => n.id === selectedNodeId ? { ...n, [field]: value } : n));
  };

  const handlePrintDiagram = () => {
    window.print();
  };

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
            style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontWeight: 'bold' }}
          >
            <option value="1P">⚡ 1-Phase 230V (บ้านพักอาศัย)</option>
            <option value="3P">⚡⚡⚡ 3-Phase 400V (อาคาร/โรงงาน)</option>
          </select>

          <button onClick={handlePrintDiagram} className="primary-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem' }}>
            <Printer size={18} /> พิมพ์แบบแผนผัง PDF
          </button>
        </div>
      </div>

      {/* Quick Presets Banner */}
      <div className="no-print" style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center', background: 'var(--bg-secondary)', padding: '0.75rem 1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', fontWeight: 'bold' }}>📁 เลือกแทมเพลตมาตรฐาน:</span>
        <button onClick={() => handleLoadPreset('home_1p')} style={{ background: 'rgba(255, 115, 0, 0.1)', border: '1px solid var(--accent-solar)', color: 'var(--accent-solar)', padding: '0.4rem 0.85rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}>
          🏠 บ้านพัก 1-Phase
        </button>
        <button onClick={() => handleLoadPreset('solar_3p')} style={{ background: 'rgba(0, 240, 255, 0.1)', border: '1px solid var(--accent-ac)', color: 'var(--accent-ac)', padding: '0.4rem 0.85rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}>
          ☀️ อาคาร 3-Phase + โซลาร์ 10kW
        </button>
      </div>

      {/* Main Builder Grid Workspace */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr 300px', gap: '1.25rem', alignItems: 'start' }}>
        
        {/* LEFT PANEL: Component Library Palette */}
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
                border: isConnecting ? '2px solid #10b981' : '1px solid var(--border-color)',
                background: isConnecting ? 'rgba(16,185,129,0.15)' : 'var(--bg-secondary)',
                color: isConnecting ? '#10b981' : 'var(--text-primary)',
                fontWeight: 'bold',
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
              }}
            >
              <Zap size={16} /> {isConnecting ? '🟢 กำลังต่อสาย (คลิกเลือก 2 จุด)' : '🔌 โหมดเดินสายไฟ (Connect Lines)'}
            </button>
          </div>
        </div>

        {/* CENTER: Canvas Workspace & Visual Diagram */}
        <div
          ref={canvasRef}
          className="printable-diagram"
          style={{
            background: '#090d16',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            minHeight: '620px',
            position: 'relative',
            overflow: 'hidden',
            backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 0)',
            backgroundSize: '20px 20px',
            userSelect: 'none',
          }}
        >
          {/* Engineering Title Block Frame for Print */}
          <div style={{ position: 'absolute', top: 15, left: 20, zIndex: 1, pointerEvents: 'none' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>
              SCHEMATIC DIAGRAM: SINGLE LINE DIAGRAM ({systemPhase})
            </span>
          </div>

          {/* SVG Connection Lines */}
          <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 2 }}>
            {connections.map((conn, idx) => {
              const fromNode = nodes.find(n => n.id === conn.from);
              const toNode = nodes.find(n => n.id === conn.to);
              if (!fromNode || !toNode) return null;

              const x1 = fromNode.x + 80;
              const y1 = fromNode.y + 30;
              const x2 = toNode.x + 80;
              const y2 = toNode.y + 30;

              return (
                <g key={idx}>
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={calcResults.isOverloaded ? '#ef4444' : 'var(--accent-solar)'}
                    strokeWidth="3"
                    strokeDasharray={fromNode.type === 'solar' ? '5,5' : 'none'}
                  />
                  {/* Cable Label Badge */}
                  <text
                    x={(x1 + x2) / 2}
                    y={(y1 + y2) / 2 - 6}
                    fill="#94a3b8"
                    fontSize="10"
                    textAnchor="middle"
                    fontWeight="bold"
                  >
                    {toNode.cableSize || '2x2.5 sq.mm.'}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Draggable Component Nodes */}
          {nodes.map(node => {
            const compPreset = COMPONENT_TYPES.find(c => c.type === node.type) || COMPONENT_TYPES[0];
            const isSelected = selectedNodeId === node.id;

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
                  background: isSelected ? 'rgba(15, 23, 42, 0.95)' : 'rgba(15, 23, 42, 0.85)',
                  border: `2px solid ${isSelected ? 'var(--accent-primary)' : compPreset.color}`,
                  boxShadow: isSelected ? '0 0 15px rgba(255, 115, 0, 0.4)' : '0 4px 12px rgba(0,0,0,0.5)',
                  cursor: 'grab',
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
                  {node.breakerAmp && <span>CB: {node.breakerAmp}A</span>}
                  {node.kw > 0 && <span style={{ color: 'var(--accent-ac)', fontWeight: 'bold' }}>{node.kw} kW</span>}
                </div>
              </div>
            );
          })}
        </div>

        {/* RIGHT PANEL: Live Engineering Calculation Engine & Inspector */}
        <div className="no-print" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Engineering Calc Summary Card */}
          <div className="equipment-card" style={{ padding: '1.25rem', border: `1px solid ${calcResults.isOverloaded ? '#ef4444' : 'var(--accent-primary)'}` }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Cpu size={18} color="var(--accent-solar)" /> คำนวณตามมาตรฐาน EIT
            </h3>

            {calcResults.isOverloaded && (
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', padding: '0.6rem 0.8rem', borderRadius: '8px', color: '#ef4444', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <AlertTriangle size={16} /> ⚠️ โหลดรวมเกินพิกัดเบรกเกอร์หลัก!
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>โหลดรวมทั้งหมด (Total Kw):</span>
                <strong style={{ color: 'var(--accent-ac)' }}>{calcResults.totalKw} kW</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>กำลังไฟฟ้าปรากฏ (kVA):</span>
                <strong style={{ color: 'var(--text-primary)' }}>{calcResults.totalKva} kVA</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>กระแสโหลดคำนวณ (Full Load Current):</span>
                <strong style={{ color: 'var(--accent-solar)', fontSize: '0.95rem' }}>{calcResults.totalAmps} A</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>พิกัดเมนเบรกเกอร์แนะนำ:</span>
                <strong style={{ color: '#10b981' }}>{calcResults.recommendedBreaker} A</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>ขนาดสายเมนแนะนำ (THW):</span>
                <strong style={{ color: '#3b82f6' }}>{calcResults.recommendedCable}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>ขนาดสายดินแนะนำ (Ground):</span>
                <strong style={{ color: '#10b981' }}>{calcResults.groundCable}</strong>
              </div>
            </div>
          </div>

          {/* Node Inspector Panel */}
          {selectedNode ? (
            <div className="equipment-card animate-fade-in" style={{ padding: '1.25rem', border: '1px solid var(--accent-solar)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '0.95rem' }}>✏️ แก้ไขข้อมูลอุปกรณ์</h4>
                <button onClick={() => handleDeleteNode(selectedNode.id)} style={{ background: 'rgba(239, 68, 68, 0.15)', border: 'none', color: '#ef4444', padding: '0.35rem 0.6rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}>
                  <Trash2 size={14} /> ลบ
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>ชื่ออุปกรณ์ (Label):</label>
                  <input
                    type="text"
                    value={selectedNode.label}
                    onChange={(e) => handleUpdateSelectedNode('label', e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>ขนาดโหลด (kW):</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={selectedNode.kw}
                    onChange={(e) => handleUpdateSelectedNode('kw', Number(e.target.value))}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>ขนาด Breaker (Amp):</label>
                  <input
                    type="number"
                    min="1"
                    value={selectedNode.breakerAmp}
                    onChange={(e) => handleUpdateSelectedNode('breakerAmp', Number(e.target.value))}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>ขนาดสายไฟ (Cable Size):</label>
                  <input
                    type="text"
                    value={selectedNode.cableSize}
                    onChange={(e) => handleUpdateSelectedNode('cableSize', e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="equipment-card" style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
              <Move size={32} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
              <p style={{ margin: 0 }}>คลิกเลือกอุปกรณ์บนผังเพื่อแก้ไขสเปคและสายไฟ</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default SingleLineDiagram;
