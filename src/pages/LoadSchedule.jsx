import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Activity, Save, RotateCcw, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LoadSchedule = () => {
  const navigate = useNavigate();
  // We'll use localStorage to save the schedule list so it persists across sessions
  const [loads, setLoads] = useState(() => {
    const saved = localStorage.getItem('loadSchedule');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [formData, setFormData] = useState({ name: '', current: '', phase: 'L1' });
  const [summary, setSummary] = useState({ L1: 0, L2: 0, L3: 0, unbalance: 0 });

  useEffect(() => {
    localStorage.setItem('loadSchedule', JSON.stringify(loads));
    calculateSummary();
  }, [loads]);

  const addLoad = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.current) return;
    
    const newLoad = {
      id: Date.now(),
      name: formData.name,
      current: parseFloat(formData.current),
      phase: formData.phase
    };
    
    setLoads([...loads, newLoad]);
    setFormData({ name: '', current: '', phase: 'L1' }); // Reset form
  };

  const removeLoad = (id) => {
    setLoads(loads.filter(l => l.id !== id));
  };

  const clearAll = () => {
    if (window.confirm('คุณต้องการลบข้อมูลตารางโหลดทั้งหมดใช่หรือไม่?')) {
      setLoads([]);
    }
  };

  const calculateSummary = () => {
    let L1 = 0, L2 = 0, L3 = 0;
    
    loads.forEach(load => {
      if (load.phase === 'L1') L1 += load.current;
      else if (load.phase === 'L2') L2 += load.current;
      else if (load.phase === 'L3') L3 += load.current;
      else if (load.phase === '3P') {
        // Assume balanced 3-phase load, split current equally
        L1 += load.current / 3;
        L2 += load.current / 3;
        L3 += load.current / 3;
      }
    });

    const avg = (L1 + L2 + L3) / 3;
    let unbalance = 0;
    
    if (avg > 0) {
      const maxDev = Math.max(Math.abs(L1 - avg), Math.abs(L2 - avg), Math.abs(L3 - avg));
      unbalance = (maxDev / avg) * 100;
    }

    setSummary({
      L1: L1.toFixed(1),
      L2: L2.toFixed(1),
      L3: L3.toFixed(1),
      unbalance: unbalance.toFixed(1)
    });
  };

  const exportLoadScheduleToCSV = () => {
    if (loads.length === 0) {
      alert("ไม่มีข้อมูลในตาราง");
      return;
    }
    
    // 1. สร้าง Header
    let csvContent = "ชื่อโหลด,กระแส (A),เฟส(Phase)\n";
    
    // 2. วนลูปข้อมูลในตาราง
    loads.forEach(load => {
      csvContent += `"${load.name}","${load.current}","${load.phase}"\n`;
    });

    // 3. สร้าง Blob สำหรับโหลดไฟล์ (ใส่ BOM \uFEFF เพื่อให้ Excel อ่านภาษาไทยได้ถูกต้อง)
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // 4. สร้างแท็ก <a> จำลองเพื่อกดดาวน์โหลด
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `load_schedule_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '0.5rem' }}>
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-gradient-solar" style={{ marginBottom: 0, fontSize: '2rem' }}>จัดตารางโหลด (Load Schedule)</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Phase Balancing & MDB Load Summary</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        
        {/* Phase Summary Dashboard */}
        <div className="equipment-card" style={{ padding: '2rem', border: summary.unbalance > 15 ? '2px solid #F44336' : '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>สรุปกระแสโหลด (Phase Summary)</h3>
            <div style={{ background: summary.unbalance > 15 ? '#F44336' : '#4CAF50', color: 'white', padding: '0.5rem 1rem', borderRadius: '99px', fontSize: '0.85rem', fontWeight: 'bold' }}>
              Unbalance: {summary.unbalance}% {summary.unbalance > 15 ? '(ควรปรับแก้)' : '(ดีมาก)'}
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', textAlign: 'center' }}>
            <div style={{ background: 'rgba(255,0,0,0.1)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,0,0,0.3)' }}>
              <h4 style={{ margin: '0 0 0.5rem', color: '#ff6b6b' }}>Phase L1 (R)</h4>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>{summary.L1} <span style={{ fontSize: '1rem', fontWeight: 'normal' }}>A</span></p>
            </div>
            <div style={{ background: 'rgba(255,255,0,0.1)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,0,0.3)' }}>
              <h4 style={{ margin: '0 0 0.5rem', color: '#feca57' }}>Phase L2 (S)</h4>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>{summary.L2} <span style={{ fontSize: '1rem', fontWeight: 'normal' }}>A</span></p>
            </div>
            <div style={{ background: 'rgba(0,191,255,0.1)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(0,191,255,0.3)' }}>
              <h4 style={{ margin: '0 0 0.5rem', color: '#48dbfb' }}>Phase L3 (T)</h4>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>{summary.L3} <span style={{ fontSize: '1rem', fontWeight: 'normal' }}>A</span></p>
            </div>
          </div>
        </div>

        {/* Add Load Form */}
        <form onSubmit={addLoad} className="equipment-card" style={{ padding: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end' }}>
          <div style={{ flex: '2 1 200px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>ชื่อโหลด / รายการ</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required placeholder="เช่น แอร์ชั้น 1, แสงสว่าง" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
          </div>
          <div style={{ flex: '1 1 100px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>กระแสโหลด (A)</label>
            <input type="number" step="0.1" value={formData.current} onChange={(e) => setFormData({...formData, current: e.target.value})} required placeholder="เช่น 15" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
          </div>
          <div style={{ flex: '1 1 120px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>เฟส (Phase)</label>
            <select value={formData.phase} onChange={(e) => setFormData({...formData, phase: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
              <option value="L1">L1 (R)</option>
              <option value="L2">L2 (S)</option>
              <option value="L3">L3 (T)</option>
              <option value="3P">3-Phase</option>
            </select>
          </div>
          <button type="submit" style={{ background: 'var(--accent-primary)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={18} /> เพิ่มโหลด
          </button>
        </form>

        {/* Load List Table */}
        <div className="equipment-card" style={{ padding: '1.5rem', overflowX: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>รายการโหลดทั้งหมด</h3>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={exportLoadScheduleToCSV} style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                <Download size={16} /> Export CSV
              </button>
              <button onClick={clearAll} style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                <RotateCcw size={16} /> ล้างตาราง
              </button>
            </div>
          </div>
          
          {loads.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-tertiary)' }}>
              ยังไม่มีรายการโหลดในตาราง
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '1rem 0.5rem' }}>ชื่อโหลด</th>
                  <th style={{ padding: '1rem 0.5rem' }}>กระแส (A)</th>
                  <th style={{ padding: '1rem 0.5rem' }}>เฟสเชื่อมต่อ</th>
                  <th style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {loads.map(load => (
                  <tr key={load.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '1rem 0.5rem', color: 'var(--text-primary)' }}>{load.name}</td>
                    <td style={{ padding: '1rem 0.5rem', color: 'var(--text-primary)' }}>{load.current.toFixed(1)} A</td>
                    <td style={{ padding: '1rem 0.5rem' }}>
                      <span style={{ 
                        padding: '0.25rem 0.75rem', 
                        borderRadius: '99px', 
                        fontSize: '0.75rem', 
                        fontWeight: 'bold',
                        background: load.phase === 'L1' ? 'rgba(255,0,0,0.1)' : load.phase === 'L2' ? 'rgba(255,255,0,0.1)' : load.phase === 'L3' ? 'rgba(0,191,255,0.1)' : 'rgba(255,255,255,0.1)',
                        color: load.phase === 'L1' ? '#ff6b6b' : load.phase === 'L2' ? '#feca57' : load.phase === 'L3' ? '#48dbfb' : 'var(--text-primary)'
                      }}>
                        {load.phase}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>
                      <button onClick={() => removeLoad(load.id)} style={{ background: 'transparent', border: 'none', color: '#F44336', cursor: 'pointer' }}>
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
};

export default LoadSchedule;
