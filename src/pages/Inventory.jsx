import React, { useState, useEffect } from 'react';
import { Package, Plus, Trash2, Edit3, AlertTriangle, Search, TrendingDown } from 'lucide-react';
import { saveInventoryItemDB, getAllInventoryDB, deleteInventoryItemDB } from '../utils/db';
import toast from 'react-hot-toast';

const CATEGORIES = ['แอร์ / เครื่องทำความเย็น', 'โซลาร์เซลล์', 'ไฟฟ้าทั่วไป', 'อะไหล่อื่นๆ'];

const emptyItem = () => ({
  id: `INV-${Date.now()}`,
  name: '',
  category: CATEGORIES[0],
  qty: 0,
  minQty: 2,
  unitPrice: 0,
  unit: 'ชิ้น',
  notes: '',
});

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyItem());
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('ทั้งหมด');

  useEffect(() => {
    getAllInventoryDB().then(setItems).catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('กรุณากรอกชื่ออะไหล่'); return; }
    await saveInventoryItemDB({ ...form, updatedAt: new Date().toISOString() });
    const updated = await getAllInventoryDB();
    setItems(updated);
    toast.success(editingId ? 'อัปเดตอะไหล่แล้ว' : 'เพิ่มอะไหล่ใหม่แล้ว');
    setForm(emptyItem());
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (item) => {
    setForm(item);
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('ต้องการลบรายการนี้?')) return;
    await deleteInventoryItemDB(id);
    setItems(prev => prev.filter(i => i.id !== id));
    toast.success('ลบเรียบร้อย');
  };

  const filteredItems = items.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) || item.notes?.toLowerCase().includes(search.toLowerCase());
    const matchCategory = filterCategory === 'ทั้งหมด' || item.category === filterCategory;
    return matchSearch && matchCategory;
  });

  const lowStockItems = items.filter(i => Number(i.qty) <= Number(i.minQty));
  const totalValue = items.reduce((s, i) => s + (Number(i.qty) * Number(i.unitPrice)), 0);

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>คลังอะไหล่</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Parts & Inventory Management</p>
        </div>
        <button onClick={() => { setForm(emptyItem()); setEditingId(null); setShowForm(true); }}
          style={{ background: 'var(--accent-primary)', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '1rem' }}>
          <Plus size={20} /> เพิ่มอะไหล่
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'รายการทั้งหมด', value: `${items.length} รายการ`, color: 'var(--accent-primary)', icon: <Package size={24} /> },
          { label: 'มูลค่าสต็อกรวม', value: `฿${totalValue.toLocaleString()}`, color: 'var(--accent-solar)', icon: <Package size={24} /> },
          { label: 'สต็อกใกล้หมด', value: `${lowStockItems.length} รายการ`, color: lowStockItems.length > 0 ? '#ef4444' : '#10b981', icon: <TrendingDown size={24} /> },
        ].map(card => (
          <div key={card.label} className="equipment-card" style={{ padding: '1.5rem', border: `1px solid ${card.color}33`, display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: `${card.color}22`, color: card.color, padding: '0.75rem', borderRadius: '10px' }}>{card.icon}</div>
            <div>
              <p style={{ margin: '0 0 0.25rem', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>{card.label}</p>
              <strong style={{ color: card.color, fontSize: '1.2rem' }}>{card.value}</strong>
            </div>
          </div>
        ))}
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <AlertTriangle size={20} color="#ef4444" />
          <div>
            <strong style={{ color: '#ef4444' }}>⚠️ สต็อกใกล้หมด {lowStockItems.length} รายการ:</strong>
            <span style={{ color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>
              {lowStockItems.map(i => `${i.name} (${i.qty} ${i.unit})`).join(', ')}
            </span>
          </div>
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="equipment-card animate-fade-in" style={{ padding: '1.5rem', border: '1px solid var(--accent-primary)', marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>{editingId ? '✏️ แก้ไขรายการ' : '➕ เพิ่มอะไหล่ใหม่'}</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>ชื่ออะไหล่ *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="เช่น แผ่นกรองอากาศ 12BTU" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px' }} required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>หมวดหมู่</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px' }}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>จำนวนในสต็อก</label>
                <input type="number" value={form.qty} min="0" onChange={e => setForm(f => ({ ...f, qty: e.target.value }))}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>หน่วย</label>
                <input value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                  placeholder="ชิ้น / อัน / ม้วน" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>ราคาต่อหน่วย (฿)</label>
                <input type="number" value={form.unitPrice} min="0" onChange={e => setForm(f => ({ ...f, unitPrice: e.target.value }))}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>แจ้งเตือนเมื่อเหลือน้อยกว่า</label>
                <input type="number" value={form.minQty} min="0" onChange={e => setForm(f => ({ ...f, minQty: e.target.value }))}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px' }} />
              </div>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>หมายเหตุ</label>
              <input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="รายละเอียดเพิ่มเติม..." style={{ width: '100%', padding: '0.75rem', borderRadius: '8px' }} />
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => { setShowForm(false); setForm(emptyItem()); setEditingId(null); }}
                style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer' }}>ยกเลิก</button>
              <button type="submit" style={{ background: 'var(--accent-primary)', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                {editingId ? 'บันทึกการแก้ไข' : 'เพิ่มอะไหล่'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search and Filter */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div className="search-bar" style={{ flex: 1, minWidth: '200px', margin: 0 }}>
          <Search size={18} color="var(--text-tertiary)" />
          <input type="text" placeholder="ค้นหาอะไหล่..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
          style={{ padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
          <option>ทั้งหมด</option>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      {/* Items Table */}
      {filteredItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--bg-secondary)', borderRadius: '12px', color: 'var(--text-tertiary)' }}>
          <Package size={64} style={{ marginBottom: '1rem', opacity: 0.4 }} />
          <h3>ไม่พบรายการอะไหล่</h3>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                {['ชื่ออะไหล่', 'หมวดหมู่', 'จำนวน', 'ราคา/หน่วย', 'มูลค่ารวม', 'สถานะ', ''].map(h => (
                  <th key={h} style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.9rem' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredItems.map(item => {
                const isLow = Number(item.qty) <= Number(item.minQty);
                return (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '1rem', fontWeight: '500', color: 'var(--text-primary)' }}>
                      {item.name}
                      {item.notes && <div style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>{item.notes}</div>}
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{item.category}</td>
                    <td style={{ padding: '1rem', fontWeight: 'bold', color: isLow ? '#ef4444' : 'var(--text-primary)' }}>
                      {item.qty} {item.unit}
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>฿{Number(item.unitPrice).toLocaleString()}</td>
                    <td style={{ padding: '1rem', fontWeight: 'bold', color: 'var(--accent-solar)' }}>
                      ฿{(Number(item.qty) * Number(item.unitPrice)).toLocaleString()}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 'bold', background: isLow ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', color: isLow ? '#ef4444' : '#10b981' }}>
                        {isLow ? '⚠️ ใกล้หมด' : '✅ ปกติ'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => handleEdit(item)}
                          style={{ background: 'rgba(59,130,246,0.1)', border: 'none', color: '#3b82f6', padding: '0.4rem', borderRadius: '6px', cursor: 'pointer' }}><Edit3 size={16} /></button>
                        <button onClick={() => handleDelete(item.id)}
                          style={{ background: 'rgba(239,68,68,0.1)', border: 'none', color: '#ef4444', padding: '0.4rem', borderRadius: '6px', cursor: 'pointer' }}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Inventory;
