import { useState, useMemo } from 'react';
import { ArrowLeft, Plus, Trash2, ShieldAlert, CheckCircle, GripHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CONDUIT_SPECS, WIRE_AREAS } from '../constants/engineeringConstants';

const ConduitSizing = () => {
  const navigate = useNavigate();
  const [conduitType, setConduitType] = useState('PVC'); // PVC or EMT
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

  // Process Calculation
  const result = useMemo(() => {
    if (wires.length === 0) return { totalArea: 0, recommendedConduit: null, fillPercentage: 0 };

    // Calculate total wire cross-sectional area
    let totalArea = 0;
    wires.forEach(w => {
      const areaPerWire = WIRE_AREAS[w.type][w.size] || 0;
      totalArea += areaPerWire * w.qty;
    });

    // Find the smallest conduit that can fit this area (< 40% max fill)
    const conduitList = CONDUIT_SPECS[conduitType];
    let recommended = null;
    let fillPercentage = 0;

    for (let i = 0; i < conduitList.length; i++) {
      if (totalArea <= conduitList[i].maxFill) {
        recommended = conduitList[i];
        break;
      }
    }

    // If all are too small, just pick the largest and it will show > 40%
    if (!recommended) {
      recommended = conduitList[conduitList.length - 1];
    }

    fillPercentage = (totalArea / recommended.area) * 100;

    return { totalArea, recommendedConduit: recommended, fillPercentage };
  }, [wires, conduitType]);

  const isOverfilled = result.fillPercentage > 40;

  // Generate dots for the visualizer
  const visualizerDots = [];
  wires.forEach(w => {
    for (let i = 0; i < w.qty; i++) {
      visualizerDots.push({
        id: `${w.id}-${i}`,
        size: parseFloat(w.size),
        type: w.type,
        color: w.type === 'THW' ? '#3b82f6' : w.type === 'NYY' ? '#000000' : '#f8fafc' // THW=Blue, NYY=Black, VAF=White
      });
    }
  });

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '0.5rem' }}>
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-gradient-ac" style={{ marginBottom: 0, fontSize: '2rem' }}>คำนวณขนาดท่อร้อยสายไฟ</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Conduit Fill Calculator (Max 40%)</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        {/* Input Form */}
        <div className="equipment-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>สายไฟที่ต้องการร้อย (Wires)</h3>
            <select 
              value={conduitType} 
              onChange={(e) => setConduitType(e.target.value)}
              style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--accent-primary)', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-primary)', fontWeight: 'bold' }}
            >
              <option value="PVC">ท่อ PVC (เหลือง/ขาว)</option>
              <option value="EMT">ท่อ EMT (ท่อเหล็กบาง)</option>
            </select>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
            {wires.map((wire, index) => (
              <div key={wire.id} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>ชนิด</label>
                  <select 
                    value={wire.type} 
                    onChange={(e) => handleChangeWire(wire.id, 'type', e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
                  >
                    <option value="THW">THW</option>
                    <option value="NYY">NYY</option>
                    <option value="VAF">VAF</option>
                  </select>
                </div>
                <div style={{ flex: 1.5 }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>ขนาด (ตร.มม.)</label>
                  <select 
                    value={wire.size} 
                    onChange={(e) => handleChangeWire(wire.id, 'size', e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
                  >
                    {Object.keys(WIRE_AREAS[wire.type]).map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div style={{ width: '70px' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>จำนวน</label>
                  <input 
                    type="number" min="1" value={wire.qty} 
                    onChange={(e) => handleChangeWire(wire.id, 'qty', parseInt(e.target.value) || 1)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', textAlign: 'center' }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', height: '100%', paddingTop: '1.25rem' }}>
                  <button onClick={() => handleRemoveWire(wire.id)} style={{ background: 'transparent', border: 'none', color: '#ff6b6b', cursor: 'pointer', padding: '0.5rem' }}>
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={handleAddWire}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', border: '1px dashed var(--text-secondary)', borderRadius: '12px', marginTop: '1rem', cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
          >
            <Plus size={20} /> เพิ่มชุดสายไฟ
          </button>
          
          {wires.some(w => w.type === 'VAF') && (
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', color: '#feca57', fontSize: '0.85rem', background: 'rgba(254, 202, 87, 0.1)', padding: '0.75rem', borderRadius: '8px' }}>
              <ShieldAlert size={16} style={{ flexShrink: 0 }} />
              <span>หมายเหตุ: มาตรฐาน วสท. ไม่แนะนำให้ร้อยท่อด้วยสาย VAF เนื่องจากเรื่องการระบายความร้อน แต่มีให้คำนวณไว้เพื่อการอ้างอิงครับ</span>
            </div>
          )}
        </div>

        {/* Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="equipment-card" style={{ padding: '2rem', background: isOverfilled ? 'linear-gradient(135deg, var(--bg-secondary) 0%, rgba(244, 67, 54, 0.1) 100%)' : 'linear-gradient(135deg, var(--bg-secondary) 0%, rgba(59, 130, 246, 0.05) 100%)', border: `1px solid ${isOverfilled ? '#F44336' : 'var(--accent-primary)'}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ background: isOverfilled ? '#F44336' : 'var(--accent-primary)', color: 'white', padding: '1rem', borderRadius: '50%' }}>
                {isOverfilled ? <ShieldAlert size={32} /> : <CheckCircle size={32} />}
              </div>
              <div>
                <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>ท่อ {conduitType} ที่แนะนำ</h3>
                <p style={{ margin: 0, color: isOverfilled ? '#F44336' : 'var(--accent-primary)', fontWeight: 'bold' }}>
                  {isOverfilled ? 'เกินขีดจำกัดท่อใหญ่สุด (ล้น)' : 'อิงตามมาตรฐาน 40% วสท.'}
                </p>
              </div>
            </div>
            
            <div style={{ fontSize: '4rem', fontWeight: 'bold', color: 'var(--text-primary)', lineHeight: 1, marginBottom: '0.5rem' }}>
              {result.recommendedConduit?.size || '-'} 
            </div>
            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              พื้นที่ว่างหน้าตัดท่อ {result.recommendedConduit?.area} sq.mm (40% = {result.recommendedConduit?.maxFill} sq.mm)
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>พื้นที่สายไฟรวม</div>
                <div style={{ color: 'var(--text-primary)', fontSize: '1.5rem', fontWeight: 'bold' }}>
                  {result.totalArea.toFixed(1)} <span style={{ fontSize: '1rem', fontWeight: 'normal' }}>sq.mm</span>
                </div>
              </div>
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Fill Factor (ใช้ไปแล้ว)</div>
                <div style={{ color: isOverfilled ? '#F44336' : '#4CAF50', fontSize: '1.5rem', fontWeight: 'bold' }}>
                  {result.fillPercentage.toFixed(1)}% 
                </div>
                <div style={{ width: '100%', background: 'rgba(255,255,255,0.1)', height: '6px', borderRadius: '3px', marginTop: '0.5rem', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(result.fillPercentage, 100)}%`, background: isOverfilled ? '#F44336' : '#4CAF50', height: '100%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Pipe Visualizer */}
          <div className="equipment-card" style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <GripHorizontal size={20} color="var(--accent-primary)" />
              <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>ภาพจำลองหน้าตัดท่อ (Cross Section)</h3>
            </div>
            
            <div style={{ 
              flex: 1, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              position: 'relative'
            }}>
              {/* Outer Pipe */}
              <div style={{ 
                width: '200px', 
                height: '200px', 
                borderRadius: '50%', 
                border: `8px solid ${conduitType === 'PVC' ? '#feca57' : '#94a3b8'}`, // Yellow for PVC, Gray for EMT
                background: 'rgba(0,0,0,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)'
              }}>
                {/* Max Fill Line (40% visual representation -> 40% area is approx 63% radius) */}
                <div style={{
                  position: 'absolute',
                  width: '63%',
                  height: '63%',
                  borderRadius: '50%',
                  border: '1px dashed rgba(255,255,255,0.2)',
                  pointerEvents: 'none'
                }} />
                
                {/* Inner Wires - simple flex wrap clustering */}
                <div style={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  alignContent: 'center', 
                  justifyContent: 'center', 
                  gap: '4px',
                  padding: '10px',
                  width: '70%',
                  height: '70%'
                }}>
                  {visualizerDots.length > 0 ? visualizerDots.map(dot => {
                    // Map physical wire size to visual size loosely
                    const baseSize = 8;
                    const scaleFactor = Math.sqrt(dot.size) * 1.5; 
                    const dotSize = Math.max(baseSize, baseSize + scaleFactor);
                    
                    return (
                      <div key={dot.id} style={{ 
                        width: `${dotSize}px`, 
                        height: `${dotSize}px`, 
                        background: dot.color, 
                        borderRadius: dot.type === 'VAF' ? '4px' : '50%', // VAF is somewhat flat
                        boxShadow: 'inset -2px -2px 4px rgba(0,0,0,0.5)',
                        border: '1px solid rgba(255,255,255,0.3)',
                        flexShrink: 0
                      }} title={`${dot.type} ${dot.size}`} />
                    );
                  }) : (
                    <span style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>ไม่มีสายไฟ</span>
                  )}
                </div>
              </div>
            </div>
            
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '1rem' }}>
              เส้นประแสดงอาณาเขต 40% ของท่อ <br/>
              <span style={{ display: 'inline-block', width: '10px', height: '10px', background: '#3b82f6', borderRadius: '50%', marginRight: '4px' }}/> THW
              <span style={{ display: 'inline-block', width: '10px', height: '10px', background: '#000000', borderRadius: '50%', marginLeft: '12px', marginRight: '4px', border: '1px solid #fff' }}/> NYY
              <span style={{ display: 'inline-block', width: '10px', height: '10px', background: '#f8fafc', borderRadius: '2px', marginLeft: '12px', marginRight: '4px' }}/> VAF
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConduitSizing;
