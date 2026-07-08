import { useState, useEffect, useRef } from 'react';
import { Camera, Image as ImageIcon, Save, Trash2, Plus, X, ClipboardList, Printer, Search, Database, Download, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAllImages, saveMultipleImages } from '../utils/db';
import { compressImage } from '../utils/imageUtils';

// --- IndexedDB Utility Functions ---
const DB_NAME = 'EngineeringWorkLogDB';
const STORE_NAME = 'worklogs';

const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const getLogs = async () => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result.reverse()); // Newest first
    request.onerror = () => reject(request.error);
  });
};

const addLog = async (log) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.add({ ...log, date: new Date().toISOString() });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const deleteLog = async (id) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

const restoreLogs = async (logs) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    
    logs.forEach(log => {
      // Use put to overwrite or add without throwing error on duplicate IDs
      store.put(log);
    });
    
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

// --- Main Component ---
const WorkLog = () => {
  const [logs, setLogs] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activePrintLog, setActivePrintLog] = useState(null);

  const [formErrors, setFormErrors] = useState({});

  const [formData, setFormData] = useState({ 
    customer: '', 
    issue: '', 
    parts: '', 
    cost: '', 
    beforeImg: null, 
    afterImg: null 
  });
  const [preview, setPreview] = useState({ before: null, after: null });

  const fileInputRefBefore = useRef(null);
  const fileInputRefAfter = useRef(null);

  const fetchLogs = async () => {
    try {
      const data = await getLogs();
      setLogs(data);
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleImageChange = async (e, type) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const compressedBase64 = await compressImage(file);
        setFormData(prev => ({ ...prev, [type]: compressedBase64 }));
        setPreview(prev => ({ ...prev, [type.replace('Img', '')]: compressedBase64 }));
      } catch (error) {
        console.error("Compression error:", error);
        toast.error('ไม่สามารถประมวลผลรูปภาพได้');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const errors = {};
    if (!formData.customer.trim()) {
      errors.customer = 'กรุณากรอกชื่อลูกค้า / สถานที่';
    }
    if (!formData.issue.trim()) {
      errors.issue = 'กรุณากรอกอาการที่พบ / งานที่ทำ';
    }
    if (!formData.beforeImg && !formData.afterImg) {
      errors.images = 'กรุณาแนบรูปภาพอย่างน้อย 1 รูป (ก่อนทำ หรือ หลังทำ)';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return; // Stop submission
    }

    await addLog(formData);
    await fetchLogs();
    toast.success('บันทึกงานสำเร็จ!');
    
    // Reset Form
    setIsAdding(false);
    setFormErrors({});
    setFormData({ customer: '', issue: '', parts: '', cost: '', beforeImg: null, afterImg: null });
    setPreview({ before: null, after: null });
  };

  const handleDelete = async (id) => {
    if (window.confirm('คุณต้องการลบบันทึกนี้ใช่หรือไม่?')) {
      await deleteLog(id);
      await fetchLogs();
    }
  };

  const handleExport = async () => {
    try {
      const allImages = await getAllImages();
      const backupData = {
        timestamp: new Date().toISOString(),
        logs: logs,
        images: allImages
      };
      
      const blob = new Blob([JSON.stringify(backupData)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `worklog_backup_${new Date().toISOString().slice(0,10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('ดาวน์โหลดไฟล์ Backup สำเร็จ!');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('เกิดข้อผิดพลาดในการ Backup ข้อมูล');
    }
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (!data.logs || !data.images) {
          throw new Error('Invalid backup format');
        }

        await saveMultipleImages(data.images);
        await restoreLogs(data.logs);
        
        await fetchLogs();
        toast.success(`นำเข้าข้อมูลสำเร็จ! จำนวน ${data.logs.length} รายการ`);
      } catch (error) {
        console.error('Import failed:', error);
        toast.error('ไฟล์ไม่ถูกต้อง หรือเกิดข้อผิดพลาดในการนำเข้าข้อมูล');
      }
    };
    reader.readAsText(file);
    e.target.value = null; // reset input
  };

  const handlePrint = (log) => {
    setActivePrintLog(log);
    setTimeout(() => {
      window.print();
      setActivePrintLog(null); // Reset after printing dialogue opens
    }, 500);
  };

  // Filter logs based on search query
  const filteredLogs = logs.filter(log => 
    log.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.issue.toLowerCase().includes(searchQuery.toLowerCase()) ||
    new Date(log.date).toLocaleDateString('th-TH').includes(searchQuery)
  );

  return (
    <>
      {/* --- Normal Screen View --- */}
      <div className="animate-fade-in no-print">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="text-gradient" style={{ marginBottom: 0, fontSize: '2rem' }}>สมุดจดงานหน้างาน</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Work Log & Service Report</p>
          </div>
          {!isAdding && (
            <button onClick={() => setIsAdding(true)} style={{ background: 'var(--accent-primary)', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
              <Plus size={20} /> เพิ่มงานใหม่
            </button>
          )}
        </div>

        {/* Search Bar */}
        {!isAdding && (
          <div className="search-bar" style={{ marginBottom: '2rem' }}>
            <Search size={20} color="var(--text-tertiary)" />
            <input 
              type="text" 
              placeholder="ค้นหาประวัติ: ชื่อลูกค้า, อาการ, วันที่..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}

        {/* Add Form */}
        {isAdding && (
          <div className="equipment-card animate-fade-in" style={{ padding: '2rem', marginBottom: '2rem', border: '2px solid var(--accent-primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, color: 'var(--accent-primary)' }}>บันทึกงานใหม่</h2>
              <button onClick={() => setIsAdding(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>ชื่อลูกค้า / สถานที่ <span style={{ color: '#ef4444' }}>*</span></label>
                  <input type="text" value={formData.customer} onChange={(e) => { setFormData({...formData, customer: e.target.value}); setFormErrors({...formErrors, customer: null}) }} style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: formErrors.customer ? '1px solid #ef4444' : '1px solid var(--border-color)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }} placeholder="เช่น บ้านคุณสมชาย หมู่บ้าน..." />
                  {formErrors.customer && <span style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.5rem', display: 'block' }}>{formErrors.customer}</span>}
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>อาการที่พบ / งานที่ทำ <span style={{ color: '#ef4444' }}>*</span></label>
                  <input type="text" value={formData.issue} onChange={(e) => { setFormData({...formData, issue: e.target.value}); setFormErrors({...formErrors, issue: null}) }} style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: formErrors.issue ? '1px solid #ef4444' : '1px solid var(--border-color)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }} placeholder="เช่น แอร์ตัน น้ำหยด ล้างใหญ่" />
                  {formErrors.issue && <span style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.5rem', display: 'block' }}>{formErrors.issue}</span>}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>อะไหล่ที่เปลี่ยน/ใช้ไป (ถ้ามี)</label>
                  <input type="text" value={formData.parts} onChange={(e) => setFormData({...formData, parts: e.target.value})} style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }} placeholder="เช่น แคปทิ้ว, น้ำยา R32, เบรกเกอร์" />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>สรุปค่าใช้จ่ายรวม (บาท)</label>
                  <input type="number" value={formData.cost} onChange={(e) => setFormData({...formData, cost: e.target.value})} style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }} placeholder="เช่น 1500" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                {/* Before Image */}
                <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '8px', textAlign: 'center', border: '1px dashed var(--border-color)' }}>
                  <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>รูปภาพ <strong>ก่อนทำ (Before)</strong></p>
                  {preview.before ? (
                    <img src={preview.before} alt="Before" style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px', marginBottom: '1rem' }} />
                  ) : (
                    <div style={{ width: '100%', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', borderRadius: '8px', marginBottom: '1rem', color: 'var(--text-tertiary)' }}>
                      <ImageIcon size={48} />
                    </div>
                  )}
                  <input type="file" accept="image/*" ref={fileInputRefBefore} onChange={(e) => handleImageChange(e, 'beforeImg')} style={{ display: 'none' }} />
                  <button type="button" onClick={() => fileInputRefBefore.current.click()} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Camera size={16} /> {preview.before ? 'เปลี่ยนรูป' : 'ถ่ายรูป / เลือกรูป'}
                  </button>
                </div>

                {/* After Image */}
                <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '8px', textAlign: 'center', border: '1px dashed var(--border-color)' }}>
                  <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>รูปภาพ <strong>หลังทำ (After)</strong></p>
                  {preview.after ? (
                    <img src={preview.after} alt="After" style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px', marginBottom: '1rem' }} />
                  ) : (
                    <div style={{ width: '100%', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', borderRadius: '8px', marginBottom: '1rem', color: 'var(--text-tertiary)' }}>
                      <ImageIcon size={48} />
                    </div>
                  )}
                  <input type="file" accept="image/*" ref={fileInputRefAfter} onChange={(e) => handleImageChange(e, 'afterImg')} style={{ display: 'none' }} />
                  <button type="button" onClick={() => fileInputRefAfter.current.click()} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Camera size={16} /> {preview.after ? 'เปลี่ยนรูป' : 'ถ่ายรูป / เลือกรูป'}
                  </button>
                </div>
              </div>

              {formErrors.images && (
                <div style={{ color: '#ef4444', fontSize: '0.9rem', textAlign: 'center', background: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                  {formErrors.images}
                </div>
              )}

              <button type="submit" style={{ background: 'var(--accent-primary)', color: 'white', border: 'none', padding: '1rem', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <Save size={20} /> บันทึกงาน
              </button>
            </form>
          </div>
        )}

        {/* Log List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {filteredLogs.length === 0 && !isAdding ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--bg-secondary)', borderRadius: '12px', color: 'var(--text-tertiary)' }}>
              <ClipboardList size={64} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <h3>{searchQuery ? 'ไม่พบข้อมูลที่ค้นหา' : 'ยังไม่มีบันทึกงาน'}</h3>
              <p>{searchQuery ? 'ลองค้นหาด้วยคำอื่น' : 'กดปุ่ม "เพิ่มงานใหม่" เพื่อเริ่มต้นบันทึกการทำงานของคุณ'}</p>
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} className="equipment-card animate-fade-in" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ margin: '0 0 0.25rem', color: 'var(--text-primary)' }}>{log.customer}</h3>
                    <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{log.issue}</p>
                    <small style={{ color: 'var(--text-tertiary)' }}>{new Date(log.date).toLocaleString('th-TH')}</small>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => handlePrint(log)} style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', color: '#3b82f6', cursor: 'pointer', padding: '0.5rem 1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
                      <Printer size={18} /> ออกใบรายงาน PDF
                    </button>
                    <button onClick={() => handleDelete(log.id)} style={{ background: 'transparent', border: 'none', color: '#F44336', cursor: 'pointer', padding: '0.5rem' }}>
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>

                {(log.parts || log.cost) && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'var(--bg-primary)', padding: '1rem', borderRadius: '8px', border: '1px dashed var(--border-color)' }}>
                    {log.parts && (
                      <div>
                        <small style={{ color: 'var(--text-tertiary)', display: 'block' }}>อะไหล่ที่เปลี่ยน:</small>
                        <span>{log.parts}</span>
                      </div>
                    )}
                    {log.cost && (
                      <div>
                        <small style={{ color: 'var(--text-tertiary)', display: 'block' }}>ค่าใช้จ่ายรวม:</small>
                        <strong style={{ color: 'var(--accent-solar)' }}>{Number(log.cost).toLocaleString()} บาท</strong>
                      </div>
                    )}
                  </div>
                )}

                {(log.beforeImg || log.afterImg) && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                    {log.beforeImg && (
                      <div style={{ position: 'relative' }}>
                        <div style={{ position: 'absolute', top: '0.5rem', left: '0.5rem', background: 'rgba(0,0,0,0.7)', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>Before</div>
                        <img src={log.beforeImg} alt="Before" style={{ width: '100%', height: '250px', objectFit: 'cover', borderRadius: '8px' }} />
                      </div>
                    )}
                    {log.afterImg && (
                      <div style={{ position: 'relative' }}>
                        <div style={{ position: 'absolute', top: '0.5rem', left: '0.5rem', background: 'rgba(0,0,0,0.7)', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>After</div>
                        <img src={log.afterImg} alt="After" style={{ width: '100%', height: '250px', objectFit: 'cover', borderRadius: '8px' }} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Database Management Section */}
        <div className="no-print" style={{ marginTop: '4rem', padding: '2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)' }}>
            <Database size={24} />
            <h3 style={{ margin: 0, fontSize: '1.2rem' }}>จัดการฐานข้อมูลออฟไลน์ (Backup)</h3>
          </div>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem', maxWidth: '500px' }}>
            ข้อมูลสมุดจดและรูปภาพทั้งหมดถูกเก็บไว้ในเครื่องนี้ (Offline) หากคุณต้องการย้ายข้อมูลไปเครื่องอื่น หรือคอมพิวเตอร์ สามารถกดปุ่มด้านล่างเพื่อดาวน์โหลดไฟล์สำรองและนำไป Import ได้ครับ
          </p>
          
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button 
              onClick={handleExport}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '1rem', transition: 'all 0.2s' }}
            >
              <Download size={20} color="var(--accent-primary)" />
              Export ข้อมูล (ดาวน์โหลด)
            </button>
            
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '1rem', transition: 'all 0.2s' }}>
              <Upload size={20} color="var(--accent-secondary)" />
              Import ข้อมูล (นำเข้า)
              <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
            </label>
          </div>
        </div>
      </div>

      {/* --- Print View Section (Hidden normally, shown when printing) --- */}
      {activePrintLog && (
        <div className="print-only" style={{ padding: '40px', background: 'white', color: 'black', minHeight: '100vh', fontFamily: 'sans-serif' }}>
          
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #000', paddingBottom: '20px', marginBottom: '30px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ background: '#3b82f6', color: 'white', padding: '10px', borderRadius: '8px' }}>
                <ClipboardList size={32} />
              </div>
              <div>
                <h1 style={{ margin: 0, fontSize: '24px', color: '#000' }}>SERVICE REPORT</h1>
                <p style={{ margin: 0, color: '#666' }}>ใบรายงานการปฏิบัติงาน / แจ้งซ่อม</p>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: 0, fontWeight: 'bold' }}>วันที่: {new Date(activePrintLog.date).toLocaleDateString('th-TH')}</p>
              <p style={{ margin: 0, color: '#666' }}>Ref: #{activePrintLog.id}</p>
            </div>
          </div>

          {/* Customer Info */}
          <div style={{ marginBottom: '30px', padding: '20px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <table style={{ width: '100%', textAlign: 'left' }}>
              <tbody>
                <tr>
                  <th style={{ width: '30%', paddingBottom: '10px' }}>ชื่อลูกค้า / สถานที่:</th>
                  <td style={{ paddingBottom: '10px', fontWeight: 'bold' }}>{activePrintLog.customer}</td>
                </tr>
                <tr>
                  <th style={{ paddingBottom: '10px' }}>อาการที่พบ / งานที่ทำ:</th>
                  <td style={{ paddingBottom: '10px' }}>{activePrintLog.issue}</td>
                </tr>
                <tr>
                  <th style={{ paddingBottom: '10px' }}>อะไหล่ที่เปลี่ยน/ใช้ไป:</th>
                  <td style={{ paddingBottom: '10px' }}>{activePrintLog.parts || '-'}</td>
                </tr>
                <tr>
                  <th>สรุปค่าใช้จ่ายรวม:</th>
                  <td><strong>{activePrintLog.cost ? `${Number(activePrintLog.cost).toLocaleString()} บาท` : '-'}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Images */}
          <div style={{ marginBottom: '40px' }}>
            <h3 style={{ borderBottom: '1px solid #ccc', paddingBottom: '10px', marginBottom: '20px' }}>ภาพประกอบ (Before / After)</h3>
            <div style={{ display: 'flex', gap: '20px' }}>
              {activePrintLog.beforeImg ? (
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 'bold', marginBottom: '10px', textAlign: 'center' }}>ภาพก่อนทำ (Before)</p>
                  <img src={activePrintLog.beforeImg} alt="Before" style={{ width: '100%', height: '300px', objectFit: 'contain', border: '1px solid #ccc', borderRadius: '4px' }} />
                </div>
              ) : (
                <div style={{ flex: 1, height: '300px', border: '1px dashed #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>ไม่มีภาพ Before</div>
              )}
              
              {activePrintLog.afterImg ? (
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 'bold', marginBottom: '10px', textAlign: 'center' }}>ภาพหลังทำ (After)</p>
                  <img src={activePrintLog.afterImg} alt="After" style={{ width: '100%', height: '300px', objectFit: 'contain', border: '1px solid #ccc', borderRadius: '4px' }} />
                </div>
              ) : (
                <div style={{ flex: 1, height: '300px', border: '1px dashed #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>ไม่มีภาพ After</div>
              )}
            </div>
          </div>

          {/* Signatures */}
          <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '80px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ borderBottom: '1px solid #000', width: '200px', height: '40px', margin: '0 auto 10px' }}></div>
              <p style={{ margin: 0 }}>( ..................................................... )</p>
              <p style={{ margin: '5px 0 0', fontWeight: 'bold' }}>ผู้ปฏิบัติงาน / ช่าง</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ borderBottom: '1px solid #000', width: '200px', height: '40px', margin: '0 auto 10px' }}></div>
              <p style={{ margin: 0 }}>( ..................................................... )</p>
              <p style={{ margin: '5px 0 0', fontWeight: 'bold' }}>ลูกค้า / ผู้รับมอบงาน</p>
            </div>
          </div>

          <div style={{ marginTop: '50px', textAlign: 'center', color: '#666', fontSize: '12px' }}>
            <p>เอกสารฉบับนี้ถูกสร้างขึ้นอัตโนมัติจากแอปพลิเคชัน Engineering Learning Hub</p>
          </div>
          
        </div>
      )}
    </>
  );
};

export default WorkLog;
