import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Activity, Save, RotateCcw, Download, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BREAKER_SIZES } from '../constants/engineeringConstants';
import { useLocalStorage } from '../hooks/useLocalStorage';

const LoadSchedule = () => {
  const navigate = useNavigate();
  const [loads, setLoads] = useLocalStorage('loadSchedule', []);
  
  const [formData, setFormData] = useState({ name: '', current: '', phase: 'L1' });
  const [summary, setSummary] = useState({ L1: 0, L2: 0, L3: 0, unbalance: 0, maxPhase: 0 });
  const [mainBreaker, setMainBreaker] = useState(0);

  useEffect(() => {
    calculateSummary(loads);
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
    setFormData({ name: '', current: '', phase: 'L1' });
  };

  const removeLoad = (id) => {
    setLoads(loads.filter(l => l.id !== id));
  };

  const clearAll = () => {
    if (window.confirm('คุณต้องการลบข้อมูลตารางโหลดทั้งหมดใช่หรือไม่?')) {
      setLoads([]);
    }
  };

  const autoBalance = () => {
    if (loads.length === 0) return;
    
    // 1. Separate 3P loads (which can't be moved) and 1P loads
    const loads3P = loads.filter(l => l.phase === '3P');
    const loads1P = loads.filter(l => l.phase !== '3P');
    
    // 2. Sort 1P loads by current descending (Greedy approach)
    loads1P.sort((a, b) => b.current - a.current);
    
    // 3. Initialize phase sums with 3P contributions
    let sumL1 = 0, sumL2 = 0, sumL3 = 0;
    loads3P.forEach(l => {
      const split = l.current / 3;
      sumL1 += split;
      sumL2 += split;
      sumL3 += split;
    });
    
    // 4. Distribute 1P loads to the phase with the minimum sum
    const balanced1P = loads1P.map(load => {
      const minSum = Math.min(sumL1, sumL2, sumL3);
      let newPhase = 'L1';
      if (minSum === sumL1) {
        newPhase = 'L1';
        sumL1 += load.current;
      } else if (minSum === sumL2) {
        newPhase = 'L2';
        sumL2 += load.current;
      } else {
        newPhase = 'L3';
        sumL3 += load.current;
      }
      return { ...load, phase: newPhase };
    });
    
    // 5. Update state
    setLoads([...loads3P, ...balanced1P]);
    
    // Let the user know it ran, especially if the optimal state is the same as before
    setTimeout(() => alert('ดำเนินการจัดสมดุล (Auto-Balance) เรียบร้อยแล้ว!'), 100);
  };

  const calculateSummary = (currentLoads) => {
    let L1 = 0, L2 = 0, L3 = 0;
    
    currentLoads.forEach(load => {
      if (load.phase === 'L1') L1 += load.current;
      else if (load.phase === 'L2') L2 += load.current;
      else if (load.phase === 'L3') L3 += load.current;
      else if (load.phase === '3P') {
        L1 += load.current / 3;
        L2 += load.current / 3;
        L3 += load.current / 3;
      }
    });

    const avg = (L1 + L2 + L3) / 3;
    let unbalance = 0;
    const maxPhase = Math.max(L1, L2, L3);
    
    if (avg > 0) {
      const maxDev = Math.max(Math.abs(L1 - avg), Math.abs(L2 - avg), Math.abs(L3 - avg));
      unbalance = (maxDev / avg) * 100;
    }

    setSummary({
      L1: L1.toFixed(1),
      L2: L2.toFixed(1),
      L3: L3.toFixed(1),
      unbalance: unbalance.toFixed(1),
      maxPhase
    });

    // Calculate Main Breaker (Max Phase * 1.25)
    const requiredBreaker = maxPhase * 1.25;
    const recommended = BREAKER_SIZES.find(size => size >= requiredBreaker) || BREAKER_SIZES[BREAKER_SIZES.length - 1];
    setMainBreaker(recommended);
  };

  const exportLoadScheduleToCSV = () => {
    if (loads.length === 0) {
      alert("ไม่มีข้อมูลในตาราง");
      return;
    }
    
    let csvContent = "ชื่อโหลด,กระแส (A),เฟส(Phase)\n";
    loads.forEach(load => {
      csvContent += `"${load.name}","${load.current}","${load.phase}"\n`;
    });

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `load_schedule_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>สรุปกระแสโหลด (Phase Summary)</h3>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <button onClick={autoBalance} style={{ background: 'var(--accent-secondary)', color: 'white', padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity size={16} /> Auto-Balance
              </button>
              <div style={{ background: summary.unbalance > 15 ? '#F44336' : '#4CAF50', color: 'white', padding: '0.5rem 1rem', borderRadius: '99px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                Unbalance: {summary.unbalance}% {summary.unbalance > 15 ? '(ควรปรับแก้)' : '(ดีมาก)'}
              </div>
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{ background: 'rgba(255,0,0,0.05)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,0,0,0.2)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', background: 'rgba(255, 107, 107, 0.15)', width: `${summary.maxPhase > 0 ? (parseFloat(summary.L1) / summary.maxPhase) * 100 : 0}%`, transition: 'width 0.5s ease', zIndex: 0 }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <h4 style={{ margin: '0 0 0.5rem', color: '#ff6b6b' }}>Phase L1 (R)</h4>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>{summary.L1} <span style={{ fontSize: '1rem', fontWeight: 'normal' }}>A</span></p>
              </div>
            </div>
            <div style={{ background: 'rgba(255,255,0,0.05)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,0,0.2)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', background: 'rgba(254, 202, 87, 0.15)', width: `${summary.maxPhase > 0 ? (parseFloat(summary.L2) / summary.maxPhase) * 100 : 0}%`, transition: 'width 0.5s ease', zIndex: 0 }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <h4 style={{ margin: '0 0 0.5rem', color: '#feca57' }}>Phase L2 (S)</h4>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>{summary.L2} <span style={{ fontSize: '1rem', fontWeight: 'normal' }}>A</span></p>
              </div>
            </div>
            <div style={{ background: 'rgba(0,191,255,0.05)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(0,191,255,0.2)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', background: 'rgba(72, 219, 251, 0.15)', width: `${summary.maxPhase > 0 ? (parseFloat(summary.L3) / summary.maxPhase) * 100 : 0}%`, transition: 'width 0.5s ease', zIndex: 0 }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <h4 style={{ margin: '0 0 0.5rem', color: '#48dbfb' }}>Phase L3 (T)</h4>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>{summary.L3} <span style={{ fontSize: '1rem', fontWeight: 'normal' }}>A</span></p>
              </div>
            </div>
          </div>

          <div style={{ background: 'var(--bg-primary)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h4 style={{ margin: '0 0 0.25rem', color: 'var(--text-secondary)' }}>ขนาด Main Breaker ที่แนะนำ (3-Phase)</h4>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>คำนวณจากเฟสสูงสุด ({summary.maxPhase > 0 ? summary.maxPhase.toFixed(1) : 0}A) × เผื่อโหลด 25%</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255,255,255,0.05)', padding: '0.75rem 1.5rem', borderRadius: '8px' }}>
              <Zap size={24} color="var(--accent-secondary)" />
              <span style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{mainBreaker} <span style={{ fontSize: '1rem', fontWeight: 'normal', color: 'var(--text-secondary)' }}>AT</span></span>
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
