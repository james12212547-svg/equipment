import { useState, useMemo, useRef } from 'react';
import { Calendar, Plus, CheckCircle, Clock, Trash2, Edit3, Settings, MapPin, Camera, Image } from 'lucide-react';
import useStore from '../store/useStore';
import toast from 'react-hot-toast';

const MaintenanceSchedule = () => {
  const { schedules, addSchedule, updateSchedule, deleteSchedule } = useStore();
  
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
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
    status: 'pending'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.customerName || !formData.date || !formData.timeStart) {
      toast.error('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    if (editingId) {
      updateSchedule(editingId, formData);
      toast.success('อัปเดตตารางงานสำเร็จ!');
    } else {
      addSchedule(formData);
      toast.success('เพิ่มตารางงานใหม่สำเร็จ!');
    }
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({
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
      status: 'pending'
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (schedule) => {
    setFormData({
      customerName: schedule.customerName,
      equipmentType: schedule.equipmentType,
      location: schedule.location || '',
      date: schedule.date || '',
      timeStart: schedule.timeStart || schedule.time || '',
      timeEnd: schedule.timeEnd || '',
      cost: schedule.cost || '',
      notes: schedule.notes || '',
      beforeImg: schedule.beforeImg || '',
      afterImg: schedule.afterImg || '',
      status: schedule.status
    });
    setEditingId(schedule.id);
    setShowForm(true);
  };

  const handleToggleStatus = (id, currentStatus) => {
    const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';
    updateSchedule(id, { status: newStatus });
    toast.success(newStatus === 'completed' ? 'ทำเครื่องหมายว่าเสร็จสิ้นแล้ว' : 'เปลี่ยนสถานะเป็นรอดำเนินการ');
  };

  // Sort by date and time
  const sortedSchedules = useMemo(() => {
    return [...(schedules || [])].sort((a, b) => {
      const dateTimeA = new Date(`${a.date}T${a.time}`);
      const dateTimeB = new Date(`${b.date}T${b.time}`);
      return dateTimeA - dateTimeB;
    });
  }, [schedules]);

  const pendingSchedules = sortedSchedules.filter(s => s.status === 'pending');
  const completedSchedules = sortedSchedules.filter(s => s.status === 'completed');

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>ตารางคิวงาน</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Maintenance Schedule & Appointments
          </p>
        </div>
        {!showForm && (
          <button 
            onClick={() => setShowForm(true)}
            style={{ 
              background: 'linear-gradient(135deg, #00F0FF 0%, #0080FF 100%)', 
              color: 'white', 
              padding: '0.75rem 1.5rem', 
              borderRadius: '8px', 
              border: 'none', 
              fontWeight: 'bold', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 15px rgba(0, 128, 255, 0.4)'
            }}
          >
            <Plus size={20} /> เพิ่มคิวงาน
          </button>
        )}
      </div>

      {showForm && (
        <div className="equipment-card animate-fade-in" style={{ padding: '2rem', marginBottom: '2rem', border: '1px solid var(--accent-primary)' }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={20} color="var(--accent-primary)" />
            {editingId ? 'แก้ไขคิวงาน' : 'บันทึกคิวงานใหม่'}
          </h3>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
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

            {/* Row 1: วันที่นัดหมาย (full width) */}
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

            {/* Row 2: เวลาเริ่ม + เวลาเลิก */}
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

            {/* Location */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <MapPin size={16} /> ที่อยู่ / พิกัด (Optional — ใส่ชื่อสถานที่หรือลิงก์ Google Maps)
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="เช่น บ้านเลขที่ 123 ถนนสุขุมวิท กรุงเทพ หรือวาง Link Google Maps"
                style={{ width: '100%', padding: '1rem', borderRadius: '8px', fontSize: '1rem' }}
              />
            </div>

            {/* Before/After Photos */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              {[['beforeImg', 'รูปก่อนซ่อม 📸'], ['afterImg', 'รูปหลังซ่อม ✅']].map(([field, label]) => (
                <div key={field}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>{label}</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => {
                      const file = e.target.files[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = ev => setFormData(f => ({ ...f, [field]: ev.target.result }));
                      reader.readAsDataURL(file);
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
              />
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

const ScheduleCard = ({ schedule, onToggleStatus, onEdit, onDelete }) => {
  const isCompleted = schedule.status === 'completed';
  
  // Format date to Thai format
  const dateObj = new Date(schedule.date);
  const thaiDate = dateObj.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
  
  const getAccentColor = () => {
    if (schedule.equipmentType.includes('Solar')) return 'var(--accent-solar)';
    if (schedule.equipmentType.includes('Air')) return 'var(--accent-ac)';
    return 'var(--text-primary)';
  };

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
        {/* GPS Map Link */}
        {schedule.location && (
          <a
            href={schedule.location.startsWith('http') ? schedule.location : `https://maps.google.com/?q=${encodeURIComponent(schedule.location)}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', padding: '0.6rem 0.75rem', borderRadius: '8px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', fontSize: '0.85rem', textDecoration: 'none', fontWeight: '500' }}
          >
            <MapPin size={14} /> เปิดแผนที่ Google Maps
          </a>
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
