import { useState } from 'react';
import { ArrowLeft, GitCompare, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { equipmentData } from '../data/equipment';

const CompareTool = () => {
  const navigate = useNavigate();
  const [item1, setItem1] = useState('ac-fixed-speed');
  const [item2, setItem2] = useState('ac-inverter');

  const eq1 = equipmentData.find(e => e.id === item1);
  const eq2 = equipmentData.find(e => e.id === item2);

  // Helper to extract a spec value by label, if it exists
  const getSpecValue = (eq, label) => {
    const spec = eq.specs.find(s => s.label === label);
    return spec ? spec.value : '-';
  };

  // Combine all unique spec labels from both equipments
  const allSpecLabels = Array.from(new Set([
    ...(eq1?.specs.map(s => s.label) || []),
    ...(eq2?.specs.map(s => s.label) || [])
  ]));

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '0.5rem' }}>
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-gradient-ac" style={{ marginBottom: 0, fontSize: '2rem' }}>เปรียบเทียบสเปค</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Side-by-side Compare Tool</p>
        </div>
      </div>

      <div className="equipment-card" style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto', overflowX: 'auto' }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px 1fr', gap: '1rem', alignItems: 'center', marginBottom: '2rem', minWidth: '600px' }}>
          <div>
            <select 
              value={item1} 
              onChange={(e) => setItem1(e.target.value)}
              style={{ width: '100%', padding: '1rem', borderRadius: '8px', background: 'var(--bg-tertiary)', color: 'var(--accent-primary)', border: '2px solid var(--accent-primary)', fontSize: '1rem', fontWeight: 'bold' }}
            >
              {equipmentData.map(eq => (
                <option key={eq.id} value={eq.id}>{eq.name}</option>
              ))}
            </select>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--text-tertiary)' }}>
            <GitCompare size={32} />
          </div>

          <div>
            <select 
              value={item2} 
              onChange={(e) => setItem2(e.target.value)}
              style={{ width: '100%', padding: '1rem', borderRadius: '8px', background: 'var(--bg-tertiary)', color: 'var(--accent-secondary)', border: '2px solid var(--accent-secondary)', fontSize: '1rem', fontWeight: 'bold' }}
            >
              {equipmentData.map(eq => (
                <option key={eq.id} value={eq.id}>{eq.name}</option>
              ))}
            </select>
          </div>
        </div>

        {eq1 && eq2 && (
          <div style={{ minWidth: '600px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr>
                  <th style={{ width: '20%', padding: '1rem', borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)' }}>หัวข้อเปรียบเทียบ</th>
                  <th style={{ width: '40%', padding: '1rem', borderBottom: '2px solid var(--border-color)', color: 'var(--accent-primary)', fontSize: '1.2rem' }}>{eq1.name}</th>
                  <th style={{ width: '40%', padding: '1rem', borderBottom: '2px solid var(--border-color)', color: 'var(--accent-secondary)', fontSize: '1.2rem' }}>{eq2.name}</th>
                </tr>
              </thead>
              <tbody>
                {/* Core Features */}
                <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <td style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', fontWeight: 'bold', color: 'var(--text-secondary)' }}>การทำงาน (Function)</td>
                  <td style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', fontSize: '0.95rem' }}>{eq1.function}</td>
                  <td style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', fontSize: '0.95rem' }}>{eq2.function}</td>
                </tr>
                <tr>
                  <td style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', fontWeight: 'bold', color: 'var(--text-secondary)' }}>หลักการ (Principle)</td>
                  <td style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', fontSize: '0.95rem' }}>{eq1.principle}</td>
                  <td style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', fontSize: '0.95rem' }}>{eq2.principle}</td>
                </tr>
                
                {/* Dynamic Specs */}
                {allSpecLabels.length > 0 && (
                  <tr>
                    <td colSpan="3" style={{ padding: '1.5rem 1rem 0.5rem 1rem', fontWeight: 'bold', color: 'var(--text-primary)', fontSize: '1.1rem', background: 'rgba(255,255,255,0.05)' }}>
                      ข้อมูลเชิงลึก (Specifications)
                    </td>
                  </tr>
                )}
                
                {allSpecLabels.map((label, index) => (
                  <tr key={index} style={{ background: index % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                    <td style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>{label}</td>
                    <td style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>{getSpecValue(eq1, label)}</td>
                    <td style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>{getSpecValue(eq2, label)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompareTool;
