import { useState, useMemo, useEffect } from 'react';
import { Calendar, Plus, CheckCircle, Clock, Trash2, Edit3, MapPin, Camera, User, Package, Navigation, Compass, AlertCircle } from 'lucide-react';
import useStore from '../store/useStore';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { getTechniciansDB, uploadImageToStorage, saveNotificationDB, getAllInventoryDB, saveInventoryItemDB, saveInventoryLogDB } from '../utils/db';
import { compressImage } from '../utils/imageUtils';

const initialFormState = {
  customerName: '',
  equipmentType: 'Air Conditioner',
  location: '',
  date: '',
  timeStart: '',
  timeEnd: '',
  cost: '',
  notes: '',
  beforeImg: '',
  afterImg: '',
  status: 'pending',
  assignedTo: '',
  partsUsed: [], // Array of { id, name, qty, unitPrice }
  checkInInfo: null, // { time, lat, lng, technicianEmail }
};

const MaintenanceSchedule = () => {
  const { schedules, addSchedule, updateSchedule, deleteSchedule } = useStore();
  const { currentUser, userRole } = useAuth();
  
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [technicians, setTechnicians] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gettingGps, setGettingGps] = useState(false);

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (userRole === 'admin') {
      getTechniciansDB().then(setTechnicians).catch(console.error);
    }
    getAllInventoryDB().then(setInventoryItems).catch(console.error);
  }, [userRole]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Helper to fetch current GPS location in form
  const handleFetchGpsLocation = () => {
    if (!navigator.geolocation) {
      toast.error('อุปกรณ์นี้ไม่รองรับ GPS');
      return;
    }
    setGettingGps(true);
    const toastId = toast.loading('กำลังค้นหาพิกัด GPS...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
        setFormData(prev => ({ ...prev, location: mapsUrl }));
        setGettingGps(false);
        toast.success('ปักหมุดพิกัด GPS สำเร็จ!', { id: toastId });
      },
      (error) => {
        setGettingGps(false);
        toast.error('ไม่สามารถดึงพิกัด GPS ได้ กรุณาเปิด Location Service', { id: toastId });
        console.error(error);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!formData.customerName || !formData.date || !formData.timeStart) {
      toast.error('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน');
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading(editingId ? 'กำลังอัปเดตข้อมูลและรูปภาพ...' : 'กำลังบันทึกข้อมูลและอัปโหลดรูปภาพ...');
    
    try {
      let finalBeforeImg = formData.beforeImg;
      let finalAfterImg = formData.afterImg;
      const timestamp = Date.now();

      if (formData.beforeImg && formData.beforeImg.startsWith('data:image/')) {
        finalBeforeImg = await uploadImageToStorage(formData.beforeImg, `schedules/before_${timestamp}_${Math.random().toString(36).substring(7)}.jpg`) || formData.beforeImg;
      }
      if (formData.afterImg && formData.afterImg.startsWith('data:image/')) {
        finalAfterImg = await uploadImageToStorage(formData.afterImg, `schedules/after_${timestamp}_${Math.random().toString(36).substring(7)}.jpg`) || formData.afterImg;
      }

      const scheduleData = {
        ...formData,
        beforeImg: finalBeforeImg,
        afterImg: finalAfterImg
      };

      if (editingId) {
        await updateSchedule(editingId, scheduleData);
        toast.success('อัปเดตข้อมูลสำเร็จ', { id: toastId });
        
        const oldSchedule = schedules.find(s => s.id === editingId);
        if (scheduleData.assignedTo && scheduleData.assignedTo !== oldSchedule?.assignedTo) {
          await saveNotificationDB({
            id: `NOTIF-${Date.now()}`,
            userEmail: scheduleData.assignedTo,
            title: 'มีการมอบหมายงานใหม่ (อัปเดต)',
            message: `แอดมินได้แก้ไขและมอบหมายงาน "${scheduleData.customerName}" ให้คุณ`,
            type: 'schedule_assigned',
            isRead: false,
            createdAt: new Date().toISOString()
          });
        }
      } else {
        await addSchedule(scheduleData);
        toast.success('บันทึกคิวงานสำเร็จ', { id: toastId });
        
        if (scheduleData.assignedTo) {
          await saveNotificationDB({
            id: `NOTIF-${Date.now()}`,
            userEmail: scheduleData.assignedTo,
            title: 'มีการมอบหมายงานใหม่ 🛠️',
            message: `คุณได้รับมอบหมายงานใหม่ "${scheduleData.customerName}" (${scheduleData.equipmentType})`,
            type: 'schedule_assigned',
            isRead: false,
            createdAt: new Date().toISOString()
          });
        }
      }

      resetForm();
    } catch (error) {
      console.error(error);
      toast.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (schedule) => {
    setFormData({
      customerName: schedule.customerName || '',
      equipmentType: schedule.equipmentType || 'Air Conditioner',
      location: schedule.location || '',
      date: schedule.date || '',
      timeStart: schedule.timeStart || schedule.time || '',
      timeEnd: schedule.timeEnd || '',
      cost: schedule.cost || '',
      notes: schedule.notes || '',
      beforeImg: schedule.beforeImg || '',
      afterImg: schedule.afterImg || '',
      status: schedule.status || 'pending',
      assignedTo: schedule.assignedTo || '',
      partsUsed: schedule.partsUsed || [],
      checkInInfo: schedule.checkInInfo || null,
    });
    setEditingId(schedule.id);
    setShowForm(true);
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    await updateSchedule(id, { status: nextStatus });
    toast.success(nextStatus === 'completed' ? 'ทำเครื่องหมายว่าเสร็จสิ้นแล้ว 🎉' : 'เปลี่ยนสถานะเป็นรอดำเนินการ');
  };

  // Technician GPS Check-in
  const handleTechnicianCheckIn = async (schedule) => {
    if (!navigator.geolocation) {
      toast.error('อุปกรณ์นี้ไม่รองรับ GPS');
      return;
    }

    const toastId = toast.loading('กำลังเช็คอินพิกัดหน้างาน...');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const checkInInfo = {
          time: new Date().toISOString(),
          lat: latitude,
          lng: longitude,
          technicianEmail: currentUser?.email || 'ช่างผู้ปฏิบัติงาน',
        };

        await updateSchedule(schedule.id, { checkInInfo });

        // Alert admin about technician check-in
        await saveNotificationDB({
          id: `NOTIF-CHECKIN-${Date.now()}`,
          userEmail: 'admin',
          title: '📍 ช่างเช็คอินถึงหน้างานแล้ว!',
          message: `ช่าง ${checkInInfo.technicianEmail} ถึงหน้างาน "${schedule.customerName}" แล้วเมื่อ ${new Date().toLocaleTimeString('th-TH')} น.`,
          type: 'technician_checkin',
          isRead: false,
          createdAt: new Date().toISOString(),
        });

        toast.success('📍 เช็คอินถึงหน้างานสำเร็จเรียบร้อย!', { id: toastId });
      },
      (error) => {
        toast.error('ไม่สามารถเช็คอินได้ กรุณาเปิด Location (GPS)', { id: toastId });
        console.error(error);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const pendingSchedules = useMemo(() => schedules.filter(s => s.status !== 'completed'), [schedules]);
  const completedSchedules = useMemo(() => schedules.filter(s => s.status === 'completed'), [schedules]);

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>ตารางงานซ่อมบำรุง</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Maintenance Schedule & Technician GPS Tracking</p>
        </div>
        
        <button 
          onClick={() => {
            if (showForm) resetForm();
            else setShowForm(true);
          }}
          className="primary-btn"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          {showForm ? 'ปิดฟอร์ม' : <><Plus size={20} /> เพิ่มคิวงานใหม่</>}
        </button>
      </div>

      {/* Form Section */}
      {showForm && (
        <div className="equipment-card" style={{ padding: '2rem', marginBottom: '2rem', border: '1px solid var(--accent-primary)' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
            {editingId ? 'แก้ไขข้อมูลคิวงาน' : 'เพิ่มคิวงานใหม่'}
          </h2>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>ชื่อลูกค้า / สถานที่</label>
                <input 
                  type="text" 
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  placeholder="เช่น บ้านคุณสมชาย, บริษัท ABC"
                  required
                  style={{ width: '100%', padding: '1rem', borderRadius: '8px' }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>ประเภทงาน</label>
                <input
                  list="job-type-list"
                  name="equipmentType"
                  value={formData.equipmentType}
                  onChange={handleInputChange}
                  placeholder="พิมพ์หรือเลือกประเภทงาน..."
                  style={{ width: '100%', padding: '1rem', borderRadius: '8px', cursor: 'text' }}
                />
                <datalist id="job-type-list">
                  <option value="ล้างแอร์ / ซ่อมแอร์" />
                  <option value="เช็คระบบโซลาร์เซลล์ / ล้างแผง" />
                  <option value="ระบบไฟฟ้าทั่วไป" />
                  <option value="ซ่อมคอมเพรสเซอร์" />
                  <option value="เติมน้ำยาแอร์" />
                  <option value="ตรวจสอบระบบ Inverter" />
                  <option value="ติดตั้งอุปกรณ์ใหม่" />
                  <option value="บำรุงรักษาตามกำหนด" />
                  <option value="อื่นๆ" />
                </datalist>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>วันที่นัดหมาย</label>
                <input
                  type="text"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  placeholder="เช่น 7/6/2025 หรือ 07-06-2025"
                  required
                  style={{ width: '100%', padding: '1rem', borderRadius: '8px', fontSize: '1rem' }}
                />
              </div>
              {userRole === 'admin' && (
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>มอบหมายให้ (Assigned To)</label>
                  <select
                    name="assignedTo"
                    value={formData.assignedTo}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '1rem', borderRadius: '8px', fontSize: '1rem', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
                  >
                    <option value="">-- ไม่ระบุ (เห็นทุกคน) --</option>
                    {technicians.map(tech => (
                      <option key={tech.id} value={tech.email || tech.id}>
                        {tech.email}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>เวลาเริ่ม <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  type="text"
                  name="timeStart"
                  value={formData.timeStart}
                  onChange={handleInputChange}
                  placeholder="เช่น 08:00"
                  required
                  style={{ width: '100%', padding: '1rem', borderRadius: '8px', fontSize: '1rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>เวลาเลิก <span style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>(ไม่บังคับ)</span></label>
                <input
                  type="text"
                  name="timeEnd"
                  value={formData.timeEnd}
                  onChange={handleInputChange}
                  placeholder="เช่น 17:00"
                  style={{ width: '100%', padding: '1rem', borderRadius: '8px', fontSize: '1rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>รายละเอียดเพิ่มเติม (Optional)</label>
                <textarea 
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="เช่น อาการเสีย, จุดสังเกต, เบอร์โทรติดต่อ"
                  rows="3"
                  style={{ width: '100%', padding: '1rem', borderRadius: '8px', resize: 'vertical' }}
                ></textarea>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>ประเมินราคา / ค่าใช้จ่าย (บาท)</label>
                <input
                  type="number"
                  name="cost"
                  value={formData.cost}
                  onChange={handleInputChange}
                  placeholder="เช่น 1500"
                  style={{ width: '100%', padding: '1rem', borderRadius: '8px', fontSize: '1rem' }}
                />
              </div>
            </div>

            {/* GPS Location Input & Pin Button */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <MapPin size={16} /> ที่อยู่ / ลิงก์ Google Maps / พิกัด GPS
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="เช่น บ้านเลขที่ 123 กรุงเทพ หรือวาง ลิงก์ Google Maps"
                  style={{ flex: 1, padding: '1rem', borderRadius: '8px', fontSize: '1rem' }}
                />
                <button
                  type="button"
                  onClick={handleFetchGpsLocation}
                  disabled={gettingGps}
                  style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#10b981', padding: '0.75rem 1rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', fontWeight: 'bold' }}
                >
                  <Compass size={18} /> {gettingGps ? 'กำลังปักหมุด...' : '📍 ดึงพิกัด GPS'}
                </button>
              </div>
            </div>

            {/* Before/After Images */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              {[['beforeImg', 'รูปก่อนซ่อม 📸'], ['afterImg', 'รูปหลังซ่อม ✅']].map(([field, label]) => (
                <div key={field}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>{label}</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      toast.loading('กำลังประมวลผลรูปภาพ...', { id: 'compressing' });
                      try {
                        const compressedBase64 = await compressImage(file, 800, 800, 0.7);
                        setFormData(f => ({ ...f, [field]: compressedBase64 }));
                        toast.success('เตรียมรูปภาพสำเร็จ', { id: 'compressing' });
                      } catch (err) {
                        toast.error('ไม่สามารถประมวลผลรูปภาพได้', { id: 'compressing' });
                        console.error(err);
                      }
                    }}
                    style={{ display: 'none' }}
                    id={`img-${field}`}
                  />
                  <label htmlFor={`img-${field}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px dashed var(--border-color)', cursor: 'pointer', color: 'var(--text-secondary)', background: 'var(--bg-tertiary)', transition: 'border-color 0.2s' }}>
                    <Camera size={18} /> เลือกรูป
                  </label>
                  {formData[field] && (
                    <div style={{ position: 'relative', marginTop: '0.5rem' }}>
                      <img src={formData[field]} alt={label} style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
                      <button type="button" onClick={() => setFormData(f => ({ ...f, [field]: '' }))} style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.6)', border: 'none', color: 'white', borderRadius: '50%', width: '22px', height: '22px', cursor: 'pointer', fontSize: '14px', lineHeight: 1 }}>×</button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Inventory Checkout section */}
            <div style={{ padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                <Package size={20} /> เบิกอะไหล่สำหรับงานนี้
              </h3>
              
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <select id="partSelect" style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
                  <option value="">-- เลือกอะไหล่ --</option>
                  {inventoryItems.map(item => (
                    <option key={item.id} value={item.id} disabled={Number(item.qty) <= 0}>
                      {item.name} (คงเหลือ: {item.qty}) - ฿{item.unitPrice}
                    </option>
                  ))}
                </select>
                <input id="partQty" type="number" min="1" defaultValue="1" style={{ width: '80px', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
                <button type="button" onClick={() => {
                  const select = document.getElementById('partSelect');
                  const qtyInput = document.getElementById('partQty');
                  const selectedId = select.value;
                  const qty = Number(qtyInput.value);
                  if (!selectedId || qty <= 0) return;
                  
                  const item = inventoryItems.find(i => i.id === selectedId);
                  if (!item) return;

                  if (qty > Number(item.qty)) {
                    toast.error(`จำนวนในสต็อกไม่พอ (เหลือ ${item.qty})`);
                    return;
                  }

                  setFormData(prev => {
                    const existingIdx = prev.partsUsed.findIndex(p => p.id === item.id);
                    let newParts = [...prev.partsUsed];
                    if (existingIdx >= 0) {
                      newParts[existingIdx].qty += qty;
                    } else {
                      newParts.push({ id: item.id, name: item.name, qty, unitPrice: item.unitPrice });
                    }
                    return { ...prev, partsUsed: newParts };
                  });
                  toast.success(`เพิ่ม ${item.name} x${qty} แล้ว`);
                }} style={{ background: 'var(--accent-primary)', border: 'none', color: 'white', padding: '0.75rem 1.25rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                  + เพิ่ม
                </button>
              </div>

              {/* Parts Table */}
              {formData.partsUsed.length > 0 && (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-tertiary)' }}>
                      <th style={{ textAlign: 'left', padding: '0.5rem' }}>รายการ</th>
                      <th style={{ textAlign: 'center', padding: '0.5rem' }}>จำนวน</th>
                      <th style={{ textAlign: 'right', padding: '0.5rem' }}>รวม</th>
                      <th style={{ textAlign: 'center', padding: '0.5rem' }}>ลบ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.partsUsed.map((part, idx) => (
                      <tr key={part.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '0.5rem' }}>{part.name}</td>
                        <td style={{ textAlign: 'center', padding: '0.5rem' }}>{part.qty}</td>
                        <td style={{ textAlign: 'right', padding: '0.5rem' }}>฿{(part.qty * Number(part.unitPrice)).toLocaleString()}</td>
                        <td style={{ textAlign: 'center', padding: '0.5rem' }}>
                          <button type="button" onClick={() => setFormData(p => ({ ...p, partsUsed: p.partsUsed.filter((_, i) => i !== idx) }))} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="2" style={{ textAlign: 'right', padding: '0.5rem', fontWeight: 'bold' }}>ยอดรวมค่าอะไหล่:</td>
                      <td style={{ textAlign: 'right', padding: '0.5rem', fontWeight: 'bold', color: 'var(--accent-solar)' }}>
                        ฿{formData.partsUsed.reduce((sum, part) => sum + (part.qty * Number(part.unitPrice)), 0).toLocaleString()}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              )}
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button 
                type="button" 
                onClick={resetForm}
                style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer' }}
              >
                ยกเลิก
              </button>
              <button 
                type="submit" 
                style={{ background: 'var(--accent-primary)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
              >
                {editingId ? 'บันทึกการแก้ไข' : 'บันทึกคิวงาน'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- Schedule List --- */}
      
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clock color="var(--accent-secondary)" /> รอดำเนินการ ({pendingSchedules.length})
        </h2>
        
        {pendingSchedules.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px dashed var(--border-color)', color: 'var(--text-tertiary)' }}>
            ไม่มีคิวงานที่รอดำเนินการ 🎉
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {pendingSchedules.map(schedule => (
              <ScheduleCard 
                key={schedule.id} 
                schedule={schedule} 
                onToggleStatus={() => handleToggleStatus(schedule.id, schedule.status)}
                onEdit={() => handleEdit(schedule)}
                onDelete={() => deleteSchedule(schedule.id)}
                onCheckIn={() => handleTechnicianCheckIn(schedule)}
              />
            ))}
          </div>
        )}
      </div>

      {completedSchedules.length > 0 && (
        <div>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.8 }}>
            <CheckCircle color="#10b981" /> เสร็จสิ้นแล้ว ({completedSchedules.length})
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', opacity: 0.6 }}>
            {completedSchedules.map(schedule => (
              <ScheduleCard 
                key={schedule.id} 
                schedule={schedule} 
                onToggleStatus={() => handleToggleStatus(schedule.id, schedule.status)}
                onEdit={() => handleEdit(schedule)}
                onDelete={() => deleteSchedule(schedule.id)}
                onCheckIn={() => handleTechnicianCheckIn(schedule)}
              />
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

const ScheduleCard = ({ schedule, onToggleStatus, onEdit, onDelete, onCheckIn }) => {
  const isCompleted = schedule.status === 'completed';
  
  let dateObj = new Date(schedule.date);
  if (isNaN(dateObj)) {
    const parts = schedule.date.split(/[\/\-]/);
    if (parts.length === 3) {
      dateObj = new Date(`${parts[2]}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}`);
    }
  }
  const thaiDate = isNaN(dateObj) ? schedule.date : dateObj.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
  
  const getAccentColor = () => {
    if (schedule.equipmentType.includes('Solar')) return 'var(--accent-solar)';
    if (schedule.equipmentType.includes('Air')) return 'var(--accent-ac)';
    return 'var(--accent-primary)';
  };

  const navUrl = schedule.location
    ? schedule.location.startsWith('http')
      ? schedule.location
      : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(schedule.location)}`
    : null;

  const checkIn = schedule.checkInInfo;

  return (
    <div className="equipment-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%', position: 'relative', overflow: 'hidden' }}>
      {isCompleted && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.1)', zIndex: 1, pointerEvents: 'none' }}></div>
      )}
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', zIndex: 2 }}>
        <div>
          <h3 style={{ margin: '0 0 0.25rem', color: isCompleted ? 'var(--text-secondary)' : 'var(--text-primary)', textDecoration: isCompleted ? 'line-through' : 'none' }}>
            {schedule.customerName}
          </h3>
          <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', color: getAccentColor(), border: `1px solid ${getAccentColor()}` }}>
            {schedule.equipmentType}
          </span>
        </div>
        <button 
          onClick={onToggleStatus}
          style={{ 
            background: 'transparent', 
            border: 'none', 
            cursor: 'pointer', 
            color: isCompleted ? '#10b981' : 'var(--text-tertiary)',
            transition: 'color 0.2s',
            padding: '0.2rem'
          }}
          title={isCompleted ? "Mark as Pending" : "Mark as Completed"}
        >
          <CheckCircle size={24} />
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', zIndex: 2 }}>
        {schedule.assignedTo && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-primary)' }}>
            <User size={16} /> <span>ช่างที่รับผิดชอบ: <strong>{schedule.assignedTo}</strong></span>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar size={16} /> <span>{thaiDate}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clock size={16} />
          <span>
            {schedule.timeStart || schedule.time || '-'} น.
            {schedule.timeEnd ? ` – ${schedule.timeEnd} น.` : ''}
          </span>
        </div>
        {schedule.notes && (
          <div style={{ background: 'var(--bg-primary)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem', marginTop: '0.5rem', fontStyle: 'italic', borderLeft: `2px solid ${getAccentColor()}` }}>
            {schedule.notes}
          </div>
        )}
        {schedule.cost && (
          <div style={{ background: 'var(--bg-primary)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.9rem', marginTop: '0.25rem', fontWeight: 'bold', borderLeft: `2px solid var(--accent-solar)`, display: 'flex', justifyContent: 'space-between' }}>
            <span>ประเมินราคา / ค่าใช้จ่าย:</span>
            <span style={{ color: 'var(--accent-solar)' }}>฿{Number(schedule.cost).toLocaleString()}</span>
          </div>
        )}

        {/* GPS Google Maps Navigation Button */}
        {navUrl && (
          <a
            href={navUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              marginTop: '0.5rem',
              padding: '0.7rem 0.9rem',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              fontSize: '0.9rem',
              textDecoration: 'none',
              fontWeight: 'bold',
              boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
              transition: 'all 0.2s',
            }}
          >
            <Navigation size={18} /> 🧭 เปิดนำทาง Google Maps ไปบ้านลูกค้า
          </a>
        )}

        {/* Technician GPS Check-in Section */}
        {!isCompleted && (
          <div style={{ marginTop: '0.5rem' }}>
            {checkIn ? (
              <div style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(16,185,129,0.15)', border: '1px solid #10b981', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <MapPin size={16} /> ✅ ช่างเช็คอินถึงหน้างานแล้ว
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  โดย: {checkIn.technicianEmail} | {new Date(checkIn.time).toLocaleString('th-TH')}
                </span>
                <a
                  href={`https://www.google.com/maps?q=${checkIn.lat},${checkIn.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#10b981', fontSize: '0.78rem', textDecoration: 'underline', marginTop: '0.2rem' }}
                >
                  📍 ดูพิกัดปักหมุดจริงบนแผนที่ ({checkIn.lat?.toFixed(4)}, {checkIn.lng?.toFixed(4)})
                </a>
              </div>
            ) : (
              <button
                type="button"
                onClick={onCheckIn}
                style={{
                  width: '100%',
                  padding: '0.7rem 0.9rem',
                  borderRadius: '8px',
                  background: 'rgba(245,158,11,0.15)',
                  border: '1px solid #f59e0b',
                  color: '#f59e0b',
                  fontSize: '0.85rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  transition: 'all 0.2s',
                }}
              >
                <Compass size={18} /> 📍 กดเช็คอินเมื่อถึงหน้างานลูกค้า (GPS Check-in)
              </button>
            )}
          </div>
        )}

        {/* Before/After images */}
        {(schedule.beforeImg || schedule.afterImg) && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.75rem' }}>
            {schedule.beforeImg && (
              <div>
                <span style={{ display: 'block', color: 'var(--text-tertiary)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>ก่อนซ่อม</span>
                <img src={schedule.beforeImg} alt="Before" style={{ width: '100%', height: '90px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
              </div>
            )}
            {schedule.afterImg && (
              <div>
                <span style={{ display: 'block', color: 'var(--text-tertiary)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>หลังซ่อม</span>
                <img src={schedule.afterImg} alt="After" style={{ width: '100%', height: '90px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: 'auto', zIndex: 2, borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
        <button 
          onClick={onEdit}
          style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'var(--text-secondary)', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem' }}
        >
          <Edit3 size={14} /> แก้ไข
        </button>
        <button 
          onClick={() => {
            if (window.confirm('คุณต้องการลบคิวงานนี้ใช่หรือไม่?')) {
              onDelete();
            }
          }}
          style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#ef4444', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem' }}
        >
          <Trash2 size={14} /> ลบ
        </button>
      </div>
    </div>
  );
};

export default MaintenanceSchedule;
