import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Save, Trash2, Download, TestTube } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useLabStore } from '../store/useLabStore';

const LabLogger = () => {
  const navigate = useNavigate();
  const { experiments, loadExperiments, addExperiment, updateExperiment, deleteExperiment } = useLabStore();
  
  const [newExpForm, setNewExpForm] = useState({ name: '', power: '', conditions: '' });

  useEffect(() => {
    loadExperiments();
  }, [loadExperiments]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newExpForm.name || !newExpForm.power) {
      toast.error('กรุณากรอกชื่อการทดลองและกำลังไฟ');
      return;
    }
    
    try {
      await addExperiment({
        name: newExpForm.name,
        power: parseFloat(newExpForm.power),
        conditions: newExpForm.conditions,
        result: 0,
        notes: ''
      });
      setNewExpForm({ name: '', power: '', conditions: '' });
      toast.success('เพิ่มการทดลองสำเร็จ');
    } catch (error) {
      toast.error('ไม่สามารถเพิ่มการทดลองได้');
    }
  };

  const handleUpdate = (id, field, value) => {
    updateExperiment(id, { [field]: value });
  };

  const handleDelete = (id) => {
    if (window.confirm('คุณแน่ใจหรือไม่ที่จะลบการทดลองนี้?')) {
      deleteExperiment(id);
      toast.success('ลบสำเร็จ');
    }
  };

  const exportCSV = () => {
    if (experiments.length === 0) {
      toast.error('ไม่มีข้อมูลให้ Export');
      return;
    }
    
    const headers = ['ID', 'ชื่อการทดลอง', 'เงื่อนไข', 'กำลังไฟ (W)', 'ผลลัพธ์', 'บันทึกเพิ่มเติม', 'วันที่สร้าง'];
    const csvContent = [
      headers.join(','),
      ...experiments.map(exp => 
        `"${exp.id}","${exp.name}","${exp.conditions}","${exp.power}","${exp.result}","${exp.notes}","${new Date(exp.createdAt).toLocaleString('th-TH')}"`
      )
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `lab_experiments_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Export ไฟล์ CSV สำเร็จ');
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button 
          onClick={() => navigate(-1)} 
          style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem', borderRadius: '50%' }}
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 style={{ marginBottom: 0, fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TestTube size={32} color="var(--accent-primary)" /> บันทึกผลการทดลอง
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Lab Experiment Logger - เก็บข้อมูลการทดลองวิศวกรรม (Offline)</p>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>เพิ่มการทดลองใหม่</h2>
        <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>ชื่อการทดลอง *</label>
            <input 
              type="text" 
              value={newExpForm.name} 
              onChange={e => setNewExpForm({...newExpForm, name: e.target.value})}
              placeholder="เช่น ทดสอบปั๊มน้ำ #1"
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>พารามิเตอร์กำลังไฟ (W) *</label>
            <input 
              type="number" 
              value={newExpForm.power} 
              onChange={e => setNewExpForm({...newExpForm, power: e.target.value})}
              placeholder="เช่น 95"
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>เงื่อนไข (Conditions)</label>
            <input 
              type="text" 
              value={newExpForm.conditions} 
              onChange={e => setNewExpForm({...newExpForm, conditions: e.target.value})}
              placeholder="เช่น อุณหภูมิ 25 องศา"
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
            />
          </div>
          <button 
            type="submit"
            style={{ padding: '0.75rem', background: 'var(--accent-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: '500' }}
          >
            <Plus size={20} /> เพิ่มข้อมูล
          </button>
        </form>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem' }}>รายการบันทึกผล ({experiments.length})</h2>
        <button 
          onClick={exportCSV}
          style={{ padding: '0.5rem 1rem', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Download size={18} /> Export CSV
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {experiments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-color)' }}>
            <p style={{ color: 'var(--text-tertiary)' }}>ยังไม่มีข้อมูลการทดลอง เริ่มเพิ่มข้อมูลด้านบนเลย</p>
          </div>
        ) : (
          experiments.map(exp => (
            <div key={exp.id} className="glass-panel animate-fade-in" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem', color: 'var(--accent-primary)' }}>{exp.name}</h3>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', display: 'flex', gap: '1rem' }}>
                    <span>เงื่อนไข: {exp.conditions || '-'}</span>
                    <span>บันทึกเมื่อ: {new Date(exp.createdAt).toLocaleString('th-TH')}</span>
                  </div>
                </div>
                <button 
                  onClick={() => handleDelete(exp.id)}
                  style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.25rem' }}
                >
                  <Trash2 size={20} />
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', background: 'var(--bg-primary)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>กำลังไฟ (W)</label>
                  <input 
                    type="number" 
                    value={exp.power} 
                    onChange={e => handleUpdate(exp.id, 'power', parseFloat(e.target.value) || 0)}
                    style={{ width: '100%', padding: '0.5rem', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>ผลลัพธ์ (Result)</label>
                  <input 
                    type="number" 
                    value={exp.result} 
                    onChange={e => handleUpdate(exp.id, 'result', parseFloat(e.target.value) || 0)}
                    style={{ width: '100%', padding: '0.5rem', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '4px' }}
                  />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>บันทึกเพิ่มเติม</label>
                  <input 
                    type="text" 
                    value={exp.notes || ''} 
                    onChange={e => handleUpdate(exp.id, 'notes', e.target.value)}
                    placeholder="เช่น พบความร้อนสะสม..."
                    style={{ width: '100%', padding: '0.5rem', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '4px' }}
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default LabLogger;
