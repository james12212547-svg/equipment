import React, { useState, useMemo } from 'react';
import { ArrowLeft, Plus, Trash2, ShieldAlert, CheckCircle, GripHorizontal, Printer, AlertTriangle, Layers, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CONDUIT_SPECS, WIRE_AREAS } from '../constants/engineeringConstants';
import Tooltip from '../components/Tooltip';

const CONDUIT_TYPE_NAMES = {
  PVC: 'ท่อ PVC (เหลือง/ขาว อโลหะ)',
  EMT: 'ท่อ EMT (โลหะบาง)',
  IMC: 'ท่อ IMC (โลหะหนาปานกลาง)',
  RSC: 'ท่อ RSC (โลหะหนา)',
  HDPE: 'ท่อ HDPE (โพลีเอทิลีน)',
  FMC: 'ท่อ FMC (โลหะอ่อน Flex)'
};

const ConduitSizing = () => {
  const navigate = useNavigate();
  const [conduitType, setConduitType] = useState('PVC');
  const [wires, setWires] = useState([
    { id: 1, type: 'THW', size: '16', qty: 3 },
    { id: 2, type: 'THW', size: '10', qty: 1 } // Ground
  ]);

  const handleAddWire = () => {
    const newId = wires.length > 0 ? Math.max(...wires.map(w => w.id)) + 1 : 1;
    setWires([...wires, { id: newId, type: 'THW', size: '2.5', qty: 1 }]);
  };

  const handleRemoveWire = (id) => {
    setWires(wires.filter(w => w.id !== id));
  };

  const handleChangeWire = (id, field, value) => {
    setWires(wires.map(w => w.id === id ? { ...w, [field]: value } : w));
  };

  // Calculation Engine
  const result = useMemo(() => {
    if (wires.length === 0) {
      return { totalArea: 0, totalWireCount: 0, allowedFillPercent: 40, recommendedConduit: null, fillPercentage: 0, deratingFactor: 1.0 };
    }

    // 1. Calculate Total Wire Area & Total Wire Count
    let totalArea = 0;
    let totalWireCount = 0;

    wires.forEach(w => {
      const q = parseInt(w.qty) || 0;
      const areaPerWire = WIRE_AREAS[w.type]?.[w.size] || 0;
      totalArea += areaPerWire * q;
      totalWireCount += q;
    });

    // 2. Dynamic Fill Rules per EIT / NEC Rules:
    // 1 Wire: 53% | 2 Wires: 31% | 3+ Wires: 40%
    let allowedFillPercent = 40;
    if (totalWireCount === 1) allowedFillPercent = 53;
    else if (totalWireCount === 2) allowedFillPercent = 31;
    else allowedFillPercent = 40;

    // 3. Find smallest suitable conduit
    const conduitList = CONDUIT_SPECS[conduitType] || CONDUIT_SPECS.PVC;
    let recommended = null;

    for (let i = 0; i < conduitList.length; i++) {
      const maxAllowedArea = conduitList[i].area * (allowedFillPercent / 100);
      if (totalArea <= maxAllowedArea) {
        recommended = {
          ...conduitList[i],
          maxFillArea: maxAllowedArea
        };
        break;
      }
    }

    if (!recommended) {
      const largest = conduitList[conduitList.length - 1];
      recommended = {
        ...largest,
        maxFillArea: largest.area * (allowedFillPercent / 100)
      };
    }

    const fillPercentage = recommended.area > 0 ? (totalArea / recommended.area) * 100 : 0;

    // 4. Derating Adjustment Factor (EIT Table 5-8)
    let deratingFactor = 1.0;
    if (totalWireCount >= 4 && totalWireCount <= 6) deratingFactor = 0.80;
    else if (totalWireCount >= 7 && totalWireCount <= 9) deratingFactor = 0.70;
    else if (totalWireCount >= 10 && totalWireCount <= 20) deratingFactor = 0.50;
    else if (totalWireCount > 20) deratingFactor = 0.45;

    return {
      totalArea,
      totalWireCount,
      allowedFillPercent,
      recommendedConduit: recommended,
      fillPercentage,
      deratingFactor
    };
  }, [wires, conduitType]);

  const isOverfilled = result.fillPercentage > result.allowedFillPercent;

  // Generate Proportional Wire Dots for Cross Section Visualizer
  const visualizerDots = useMemo(() => {
    const dots = [];
    const conduitArea = result.recommendedConduit?.area || 615;
    const conduitDiameter = 2 * Math.sqrt(conduitArea / Math.PI); // inner mm

    wires.forEach(w => {
      const q = parseInt(w.qty) || 0;
      const area = WIRE_AREAS[w.type]?.[w.size] || 10;
      const wireDiameter = 2 * Math.sqrt(area / Math.PI); // wire mm

      // Scale wire diameter relative to 180px visual inner conduit box
      const visualPx = Math.max(10, Math.round((wireDiameter / conduitDiameter) * 180));

      for (let i = 0; i < q; i++) {
        dots.push({
          id: `${w.id}-${i}`,
          sizeSqmm: w.size,
          type: w.type,
          visualPx,
          color: w.type === 'THW' ? '#3b82f6' : w.type === 'NYY' ? '#1e293b' : '#f8fafc'
        });
      }
    });
    return dots;
  }, [wires, result.recommendedConduit]);

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      
      {/* Header */}
      <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '0.5rem' }}>
          <ArrowLeft size={24} />
        </button>
        <div style={{ flex: 1 }}>
          <h1 className="text-gradient-solar" style={{ marginBottom: 0, fontSize: '2rem' }}>คำนวณขนาดท่อร้อยสายไฟ (Conduit Fill Sizing)</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Compliant with EIT / NEC Dynamic Fill Rules (1 Wire 53%, 2 Wires 31%, 3+ Wires 40%)</p>
        </div>
        <button onClick={() => window.print()} style={{ background: 'var(--accent-secondary)', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Printer size={20} /> พิมพ์เป็น PDF
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem', alignItems: 'flex-start' }}>
        
        {/* INPUT FORM SECTION */}
        <div className="equipment-card no-print" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.2rem' }}>สายไฟที่ต้องการร้อย (Wires)</h3>
            <select 
              value={conduitType} 
              onChange={(e) => setConduitType(e.target.value)}
              style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid var(--accent-solar)', background: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent-solar)', fontWeight: 'bold', outline: 'none' }}
            >
              {Object.keys(CONDUIT_SPECS).map(type => (
                <option key={type} value={type}>{CONDUIT_TYPE_NAMES[type] || type}</option>
              ))}
            </select>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {wires.map((wire) => (
              <div key={wire.id} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '0.85rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>ชนิดสาย</label>
                  <select 
                    value={wire.type} 
                    onChange={(e) => handleChangeWire(wire.id, 'type', e.target.value)}
                    style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', outline: 'none' }}
                  >
                    <option value="THW">THW</option>
                    <option value="NYY">NYY</option>
                    <option value="VAF">VAF</option>
                  </select>
                </div>

                <div style={{ flex: 1.5 }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>ขนาด (ตร.มม.)</label>
                  <select 
                    value={wire.size} 
                    onChange={(e) => handleChangeWire(wire.id, 'size', e.target.value)}
                    style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', outline: 'none' }}
                  >
                    {Object.keys(WIRE_AREAS[wire.type] || WIRE_AREAS.THW).map(s => (
                      <option key={s} value={s}>{s} sq.mm</option>
                    ))}
                  </select>
                </div>

                <div style={{ width: '70px' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>จำนวน</label>
                  <input 
                    type="number" min="1" value={wire.qty} 
                    onChange={(e) => handleChangeWire(wire.id, 'qty', parseInt(e.target.value) || 1)}
                    style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', textAlign: 'center', outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-end', paddingTop: '1rem' }}>
                  <button onClick={() => handleRemoveWire(wire.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.4rem' }} title="ลบรายการนี้">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button 
            type="button"
            onClick={handleAddWire}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.85rem', background: 'rgba(255,255,255,0.04)', color: 'var(--text-primary)', border: '1px dashed var(--accent-solar)', borderRadius: '10px', marginTop: '1rem', cursor: 'pointer', fontWeight: 'bold' }}
          >
            <Plus size={18} /> เพิ่มชุดสายไฟ
          </button>
          
          {wires.some(w => w.type === 'VAF') && (
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', color: '#f59e0b', fontSize: '0.8rem', background: 'rgba(245, 158, 11, 0.1)', padding: '0.75rem', borderRadius: '8px' }}>
              <ShieldAlert size={16} style={{ flexShrink: 0 }} />
              <span>หมายเหตุ: มาตรฐาน วสท. ไม่แนะนำให้ร้อยท่อด้วยสาย VAF เนื่องจากเรื่องการระบายความร้อน แต่มีไว้เพื่อเปรียบเทียบขนาดครับ</span>
            </div>
          )}
        </div>

        {/* RESULTS SECTION */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Conduit Recommendation Card */}
          <div className="equipment-card animate-fade-in" style={{ padding: '1.75rem', background: isOverfilled ? 'rgba(239, 68, 68, 0.05)' : 'rgba(255, 165, 0, 0.03)', border: `1px solid ${isOverfilled ? '#ef4444' : 'rgba(255, 165, 0, 0.3)'}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', gap: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ background: isOverfilled ? '#ef4444' : 'var(--accent-solar)', color: 'white', padding: '0.75rem', borderRadius: '50%' }}>
                  {isOverfilled ? <ShieldAlert size={28} /> : <CheckCircle size={28} />}
                </div>
                <div>
                  <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.3rem' }}>ท่อ {conduitType} ที่แนะนำ</h3>
                  <p style={{ margin: 0, color: isOverfilled ? '#ef4444' : 'var(--accent-solar)', fontWeight: 'bold', fontSize: '0.85rem' }}>
                    {isOverfilled ? 'เกินขีดจำกัดท่อใหญ่สุด (ล้นท่อ)' : `อิงตามเกณฑ์ วสท. ${result.allowedFillPercent}% (สำหรับสาย ${result.totalWireCount} เส้น)`}
                  </p>
                </div>
              </div>
            </div>

            <div style={{ fontSize: '3.2rem', fontWeight: 'bold', color: 'white', lineHeight: 1, marginBottom: '0.4rem' }}>
              {result.recommendedConduit?.size || '-'}
            </div>
            
            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              พื้นที่ภายในท่อรวม {result.recommendedConduit?.area} sq.mm (เกณฑ์ {result.allowedFillPercent}% = {result.recommendedConduit?.maxFillArea?.toFixed(0)} sq.mm)
            </p>

            {/* Area & Fill Percentage Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              <div>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>พื้นที่สายไฟรวม</span>
                <p style={{ fontSize: '1.4rem', fontWeight: 'bold', margin: '0.2rem 0 0', color: 'var(--text-primary)' }}>
                  {result.totalArea.toFixed(1)} <span style={{ fontSize: '0.9rem', fontWeight: 'normal' }}>sq.mm</span>
                </p>
              </div>

              <div>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Fill Factor (ใช้งานจริง)</span>
                <p style={{ fontSize: '1.4rem', fontWeight: 'bold', margin: '0.2rem 0 0', color: isOverfilled ? '#ef4444' : '#10b981' }}>
                  {result.fillPercentage.toFixed(1)}%
                </p>
                <div style={{ width: '100%', background: 'var(--bg-primary)', height: '6px', borderRadius: '3px', marginTop: '0.4rem', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(result.fillPercentage, 100)}%`, background: isOverfilled ? '#ef4444' : '#10b981', height: '100%' }} />
                </div>
              </div>
            </div>

            {/* Derating Factor Warning Banner */}
            {result.totalWireCount >= 4 && (
              <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '8px', fontSize: '0.8rem', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle size={18} style={{ flexShrink: 0 }} />
                <span>
                  ⚠️ มีสายตัวนำ <strong>{result.totalWireCount} เส้น</strong> ในท่อเดียว: ต้องคิดตัวคูณลดพิกัดกระแสสายไฟ <strong>(Derating Factor = {result.deratingFactor})</strong> ตามมาตรฐาน วสท.
                </span>
              </div>
            )}
          </div>

          {/* Proportional Cross Section Visualizer */}
          <div className="equipment-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <GripHorizontal size={18} className="text-solar" /> ภาพจำลองหน้าตัดท่อสัดส่วนจริง (Cross Section)
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-solar)', fontWeight: 'bold' }}>
                เกณฑ์สูงสุด {result.allowedFillPercent}%
              </span>
            </div>

            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
              {/* Outer Conduit Circle */}
              <div style={{ 
                width: '210px', height: '210px', borderRadius: '50%', 
                border: `8px solid ${conduitType === 'PVC' ? '#f59e0b' : '#94a3b8'}`, 
                background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
                boxShadow: '0 8px 24px rgba(0,0,0,0.5), inset 0 0 20px rgba(0,0,0,0.8)'
              }}>
                
                {/* Max Fill Circle Line (e.g. 40% area is 63% radius, 53% area is 73% radius) */}
                <div style={{
                  position: 'absolute',
                  width: `${Math.sqrt(result.allowedFillPercent / 100) * 100}%`,
                  height: `${Math.sqrt(result.allowedFillPercent / 100) * 100}%`,
                  borderRadius: '50%',
                  border: '1.5px dashed rgba(245, 158, 11, 0.5)',
                  pointerEvents: 'none'
                }} />
                
                {/* Proportional Inner Wires Cluster */}
                <div style={{ 
                  display: 'flex', flexWrap: 'wrap', alignContent: 'center', justifyContent: 'center', 
                  gap: '5px', padding: '12px', width: '80%', height: '80%', zIndex: 2
                }}>
                  {visualizerDots.length > 0 ? visualizerDots.map(dot => (
                    <div 
                      key={dot.id} 
                      title={`${dot.type} ${dot.sizeSqmm} sq.mm`}
                      style={{ 
                        width: `${dot.visualPx}px`, 
                        height: `${dot.visualPx}px`, 
                        background: dot.color, 
                        borderRadius: dot.type === 'VAF' ? '3px' : '50%',
                        boxShadow: '0 0 6px rgba(0,0,0,0.6), inset -2px -2px 4px rgba(0,0,0,0.5)',
                        border: '1.5px solid #ffffff',
                        flexShrink: 0,
                        transition: 'all 0.2s'
                      }} 
                    />
                  )) : (
                    <span style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>ไม่มีสายไฟ</span>
                  )}
                </div>
              </div>
            </div>

            <p style={{ textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.78rem', margin: '0.5rem 0 0' }}>
              เส้นประแสดงอาณาเขตเกณฑ์สูงสุด ({result.allowedFillPercent}%) ของท่อ {conduitType} <br/>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', background: '#3b82f6', borderRadius: '50%', marginRight: '3px' }}/> THW
              <span style={{ display: 'inline-block', width: '8px', height: '8px', background: '#1e293b', borderRadius: '50%', marginLeft: '10px', marginRight: '3px', border: '1px solid #fff' }}/> NYY
              <span style={{ display: 'inline-block', width: '8px', height: '8px', background: '#f8fafc', borderRadius: '2px', marginLeft: '10px', marginRight: '3px' }}/> VAF
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConduitSizing;
