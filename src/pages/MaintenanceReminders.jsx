import React, { useState, useEffect, useMemo } from 'react';
import { Bell, Plus, Trash2, Edit3, CheckCircle, Search, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const REMINDERS_KEY = 'maintenanceReminders';

const REMINDER_TYPES = [
  { label: '❄️ ล้างแอร์', interval: 6, unit: 'เดือน' },
  { label: '☀️ ล้างแผงโซลาร์', interval: 12, unit: 'เดือน' },
  { label: '⚡ ตรวจระบบไฟฟ้า', interval: 12, unit: 'เดือน' },
  { label: '🔧 บำรุงรักษาทั่วไป', interval: 3, unit: 'เดือน' },
  { label: '🌡️ เติมน้ำยาแอร์', interval: 24, unit: 'เดือน' },
  { label: '📋 อื่นๆ', interval: 6, unit: 'เดือน' },
];

const emptyForm = () => ({
  id: `REM-${Date.now()}`,
  customerName: '',
  customerPhone: '',
  type: REMINDER_TYPES[0].label,
  intervalMonths: REMINDER_TYPES[0].interval,
  lastServiceDate: new Date().toISOString().split('T')[0],
  notes: '',
  notified: false,
});

const addMonths = (dateStr, months) => {
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + months);
  return d;
};

const daysUntil = (date) => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diff = date - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const MaintenanceReminders = () => {
  const [reminders, setReminders] = useState(() => {
    try { return JSON.parse(localStorage.getItem(REMINDERS_KEY)) || []; }
    catch { return []; }
  });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all | due | upcoming | ok

  const save = (data) => {
    setReminders(data);
    localStorage.setItem(REMINDERS_KEY, JSON.stringify(data));
  };

  const handleTypeChange = (label) => {
    const preset = REMINDER_TYPES.find(t => t.label === label);
    setForm(f => ({ ...f, type: label, intervalMonths: preset?.interval || 6 }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.customerName.trim()) { toast.error('กรุณากรอกชื่อลูกค้า'); return; }
    const updated = editingId
      ? reminders.map(r => r.id === editingId ? { ...form } : r)
      : [...reminders, { ...form }];
    save(updated);
    toast.success(editingId ? 'อัปเดตแล้ว!' : 'เพิ่มรีไมนเดอร์แล้ว!');
    setForm(emptyForm());
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (r) => {
    setForm({ ...r });
    setEditingId(r.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (!window.confirm('ต้องการลบรีไมนเดอร์นี้?')) return;
    save(reminders.filter(r => r.id !== id));
    toast.success('ลบแล้ว');
  };

  const markNotified = (id) => {
    const updated = reminders.map(r => r.id === id ? { ...r, lastServiceDate: new Date().toISOString().split('T')[0], notified: false } : r);
    save(updated);
    toast.success('✅ รีเซ็ตวันแจ้งเตือนแล้ว!');
  };

  const enriched = useMemo(() => reminders.map(r => {
    const nextDate = addMonths(r.lastServiceDate, Number(r.intervalMonths));
    const days = daysUntil(nextDate);
    const status = days < 0 ? 'overdue' : days <= 30 ? 'due' : 'ok';
    return { ...r, nextDate, days, status };
  }), [reminders]);

  const filtered = enriched.filter(r => {
    const matchSearch = r.customerName.toLowerCase().includes(search.toLowerCase()) || r.type.includes(search);
    const matchFilter = filter === 'all' || filter === r.status || (filter === 'due' && (r.status === 'due' || r.status === 'overdue'));
    return matchSearch && matchFilter;
  }).sort((a, b) => a.days - b.days);

  const overdueCount = enriched.filter(r => r.status === 'overdue').length;
  const dueCount = enriched.filter(r => r.status === 'due').length;

  const statusStyle = (status) => ({
    overdue: { bg: 'rgba(239,68,68,0.1)', color: '#ef4444', label: '⚠️ เกินกำหนด' },
    due: { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b', label: '🔔 ใกล้ถึงกำหนด' },
    ok: { bg: 'rgba(16,185,129,0.1)', color: '#10b981', label: '✅ ปกติ' },
  }[status]);

  const sendLineMsg = (r) => {
    const msg = encodeURIComponent(`สวัสดีครับ คุณ${r.customerName} 👋\nถึงเวลา ${r.type} แล้วครับ!\nกรุณาติดต่อนัดหมายได้ที่ ${localStorage.getItem('companyPhone') || 'บริษัทของเรา'}`);
    window.open(`https://line.me/R/msg/text/?${msg}`, '_blank');
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>รีไมนเดอร์บำรุงรักษา</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Maintenance Reminder System</p>
        </div>
        <button onClick={() => { setForm(emptyForm()); setEditingId(null); setShowForm(true); }}
          style={{ background: 'var(--accent-primary)', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
          <Plus size={20} /> เพิ่มรีไมนเดอร์
        </button>
      </div>

      {/* Alert banner */}
      {(overdueCount > 0 || dueCount > 0) && (
        <div style={{ background: overdueCount > 0 ? 'rgba(239,68,68,0.08)' : 'rgba(245,158,11,0.08)', border: `1px solid ${overdueCount > 0 ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.3)'}`, borderRadius: '12px', padding: '1rem 1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Bell size={22} color={overdueCount > 0 ? '#ef4444' : '#f59e0b'} />
          <span style={{ color: 'var(--text-primary)' }}>
            {overdueCount > 0 && <strong style={{ color: '#ef4444' }}>เกินกำหนด {overdueCount} ราย </strong>}
            {dueCount > 0 && <strong style={{ color: '#f59e0b' }}>ใกล้ถึงกำหนด {dueCount} ราย</strong>}
            {' — รีบติดต่อลูกค้าด่วน!'}
          </span>
        </div>
      )}

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'ทั้งหมด', count: enriched.length, color: 'var(--accent-primary)', filter: 'all' },
          { label: 'เกินกำหนด', count: overdueCount, color: '#ef4444', filter: 'overdue' },
          { label: 'ใกล้กำหนด', count: dueCount, color: '#f59e0b', filter: 'due' },
          { label: 'ปกติ', count: enriched.filter(r => r.status === 'ok').length, color: '#10b981', filter: 'ok' },
        ].map(card => (
          <button key={card.label} onClick={() => setFilter(card.filter)}
            style={{ background: filter === card.filter ? `${card.color}22` : 'var(--bg-secondary)', border: `1px solid ${filter === card.filter ? card.color : 'var(--border-color)'}`, borderRadius: '12px', padding: '1.25rem', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: card.color }}>{card.count}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{card.label}</div>
          </button>
        ))}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="equipment-card animate-fade-in" style={{ padding: '1.5rem', border: '1px solid var(--accent-primary)', marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>{editingId ? '✏️ แก้ไขรีไมนเดอร์' : '➕ เพิ่มรีไมนเดอร์ใหม่'}</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>ชื่อลูกค้า *</label>
                <input value={form.customerName} onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))} placeholder="ชื่อลูกค้า" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px' }} required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>เบอร์โทร</label>
                <input value={form.customerPhone} onChange={e => setForm(f => ({ ...f, customerPhone: e.target.value }))} placeholder="0812345678" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>ประเภทการบำรุงรักษา</label>
                <select value={form.type} onChange={e => handleTypeChange(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px' }}>
                  {REMINDER_TYPES.map(t => <option key={t.label} value={t.label}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>แจ้งเตือนทุกกี่เดือน</label>
                <input type="number" value={form.intervalMonths} min="1" max="60" onChange={e => setForm(f => ({ ...f, intervalMonths: e.target.value }))} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>วันที่ให้บริการล่าสุด</label>
                <input type="date" value={form.lastServiceDate} onChange={e => setForm(f => ({ ...f, lastServiceDate: e.target.value }))} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>หมายเหตุ</label>
                <input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="เพิ่มเติม..." style={{ width: '100%', padding: '0.75rem', borderRadius: '8px' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => { setShowForm(false); setForm(emptyForm()); setEditingId(null); }}
                style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer' }}>ยกเลิก</button>
              <button type="submit"
                style={{ background: 'var(--accent-primary)', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                {editingId ? 'บันทึกการแก้ไข' : 'เพิ่มรีไมนเดอร์'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div className="search-bar" style={{ margin: 0 }}>
          <Search size={18} color="var(--text-tertiary)" />
          <input type="text" placeholder="ค้นหาลูกค้าหรือประเภทงาน..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Reminders List */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--bg-secondary)', borderRadius: '12px', color: 'var(--text-tertiary)' }}>
          <Bell size={64} style={{ marginBottom: '1rem', opacity: 0.4 }} />
          <h3>ไม่พบรายการ</h3>
          <p>กดปุ่ม "เพิ่มรีไมนเดอร์" เพื่อเริ่มต้น</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {filtered.map(r => {
            const { bg, color, label } = statusStyle(r.status);
            return (
              <div key={r.id} className="equipment-card" style={{ padding: '1.5rem', border: `1px solid ${color}44`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                    <strong style={{ color: 'var(--text-primary)', fontSize: '1.1rem' }}>{r.customerName}</strong>
                    {r.customerPhone && <span style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>📞 {r.customerPhone}</span>}
                    <span style={{ padding: '0.2rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 'bold', background: bg, color }}>{label}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    <span>{r.type}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Clock size={14} />
                      {r.days < 0 ? `เกินมาแล้ว ${Math.abs(r.days)} วัน` : r.days === 0 ? 'วันนี้!' : `อีก ${r.days} วัน`}
                      {' '}({r.nextDate.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })})
                    </span>
                    <span>รอบ {r.intervalMonths} เดือน</span>
                  </div>
                  {r.notes && <div style={{ marginTop: '0.5rem', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>{r.notes}</div>}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {/* Send LINE */}
                  {r.customerPhone && (
                    <button onClick={() => sendLineMsg(r)} title="แจ้งเตือนทาง Line"
                      style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', padding: '0.5rem 0.85rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}>
                      📱 LINE
                    </button>
                  )}
                  {/* Mark done */}
                  <button onClick={() => markNotified(r.id)} title="ทำบริการแล้ว รีเซ็ตวันนับใหม่"
                    style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', color: '#3b82f6', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer' }}>
                    <CheckCircle size={18} />
                  </button>
                  <button onClick={() => handleEdit(r)}
                    style={{ background: 'rgba(245,158,11,0.1)', border: 'none', color: '#f59e0b', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer' }}>
                    <Edit3 size={18} />
                  </button>
                  <button onClick={() => handleDelete(r.id)}
                    style={{ background: 'rgba(239,68,68,0.1)', border: 'none', color: '#ef4444', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer' }}>
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MaintenanceReminders;
