import React, { useState, useEffect } from 'react';
import { Package, Plus, Trash2, Edit3, AlertTriangle, Search, TrendingDown, ShoppingCart, History, X } from 'lucide-react';
import { saveInventoryItemDB, getAllInventoryDB, deleteInventoryItemDB, saveInventoryLogDB, getInventoryLogsDB } from '../utils/db';
import { useAuth } from '../contexts/AuthContext';
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
  
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'history'
  const [logs, setLogs] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutItem, setCheckoutItem] = useState(null);
  const [checkoutData, setCheckoutData] = useState({ qty: 1, purpose: '', notes: '' });
  const { currentUser } = useAuth();

  const fetchData = async () => {
    try {
      const [itemsData, logsData] = await Promise.all([
        getAllInventoryDB(),
        getInventoryLogsDB()
      ]);
      setItems(itemsData);
      
      // Sort logs by date descending
      const sortedLogs = logsData.sort((a, b) => new Date(b.date) - new Date(a.date));
      setLogs(sortedLogs);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
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

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (checkoutData.qty <= 0) {
      toast.error('จำนวนต้องมากกว่า 0');
      return;
    }
    if (checkoutData.qty > checkoutItem.qty) {
      toast.error('จำนวนสต็อกไม่เพียงพอ');
      return;
    }
    if (!checkoutData.purpose.trim()) {
      toast.error('กรุณาระบุงาน / ลูกค้าที่นำไปใช้');
      return;
    }

    try {
      // 1. Update Inventory Qty
      const newQty = Number(checkoutItem.qty) - Number(checkoutData.qty);
      const updatedItem = { ...checkoutItem, qty: newQty, updatedAt: new Date().toISOString() };
      await saveInventoryItemDB(updatedItem);

      // 2. Save Log
      const logEntry = {
        id: `LOG-${Date.now()}`,
        itemId: checkoutItem.id,
        itemName: checkoutItem.name,
        qty: Number(checkoutData.qty),
        purpose: checkoutData.purpose,
        notes: checkoutData.notes,
        date: new Date().toISOString(),
        userEmail: currentUser?.email || 'Unknown User',
        userId: currentUser?.uid || 'Unknown ID'
      };
      await saveInventoryLogDB(logEntry);

      toast.success('บันทึกการเบิกอะไหล่สำเร็จ');
      setShowCheckout(false);
      setCheckoutItem(null);
      setCheckoutData({ qty: 1, purpose: '', notes: '' });
      
      // Refresh
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error('เกิดข้อผิดพลาด');
    }
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
                <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>จุดสั่งซื้อขั้นต่ำ</label>
                <input type="number" value={form.minQty} min="0" onChange={e => setForm(f => ({ ...f, minQty: e.target.value }))}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>ราคาต่อหน่วย</label>
                <input type="number" value={form.unitPrice} min="0" onChange={e => setForm(f => ({ ...f, unitPrice: e.target.value }))}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>หน่วยนับ</label>
                <input type="text" value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                  placeholder="เช่น ชิ้น, ตัว, เมตร" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px' }} />
              </div>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>รายละเอียด/หมายเหตุ</label>
              <input type="text" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
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

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid var(--border-color)', marginBottom: '2rem' }}>
        <button 
          onClick={() => setActiveTab('inventory')}
          style={{ 
            background: 'transparent', border: 'none', padding: '1rem 0', cursor: 'pointer',
            color: activeTab === 'inventory' ? 'var(--accent-primary)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'inventory' ? '2px solid var(--accent-primary)' : '2px solid transparent',
            fontWeight: activeTab === 'inventory' ? '600' : '400',
            display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem'
          }}
        >
          <Package size={20} /> รายการอะไหล่
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          style={{ 
            background: 'transparent', border: 'none', padding: '1rem 0', cursor: 'pointer',
            color: activeTab === 'history' ? 'var(--accent-primary)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'history' ? '2px solid var(--accent-primary)' : '2px solid transparent',
            fontWeight: activeTab === 'history' ? '600' : '400',
            display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem'
          }}
        >
          <History size={20} /> ประวัติการเบิก
        </button>
      </div>

      {activeTab === 'inventory' && (
        <>
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
                        <button onClick={() => { setCheckoutItem(item); setShowCheckout(true); }}
                          style={{ background: 'rgba(16,185,129,0.1)', border: 'none', color: '#10b981', padding: '0.4rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }} title="เบิกอะไหล่"><ShoppingCart size={16} /></button>
                        <button onClick={() => handleEdit(item)}
                          style={{ background: 'rgba(59,130,246,0.1)', border: 'none', color: '#3b82f6', padding: '0.4rem', borderRadius: '6px', cursor: 'pointer' }} title="แก้ไข"><Edit3 size={16} /></button>
                        <button onClick={() => handleDelete(item.id)}
                          style={{ background: 'rgba(239,68,68,0.1)', border: 'none', color: '#ef4444', padding: '0.4rem', borderRadius: '6px', cursor: 'pointer' }} title="ลบ"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      </>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="equipment-card animate-fade-in" style={{ padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: '12px' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
            <History size={24} /> ประวัติการเบิกอะไหล่
          </h2>
          {logs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-tertiary)' }}>
              <History size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <p>ยังไม่มีประวัติการเบิกอะไหล่</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
                    <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>วันที่ / เวลา</th>
                    <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>รายการอะไหล่</th>
                    <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>จำนวนที่เบิก</th>
                    <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>ผู้เบิก</th>
                    <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>นำไปใช้กับ (งาน/ลูกค้า)</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map(log => (
                    <tr key={log.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '1rem', color: 'var(--text-primary)' }}>
                        {new Date(log.date).toLocaleString('th-TH')}
                      </td>
                      <td style={{ padding: '1rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>{log.itemName}</td>
                      <td style={{ padding: '1rem', color: '#ef4444', fontWeight: 'bold' }}>-{log.qty}</td>
                      <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{log.userEmail}</td>
                      <td style={{ padding: '1rem', color: 'var(--text-primary)' }}>
                        {log.purpose}
                        {log.notes && <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>{log.notes}</div>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckout && checkoutItem && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div className="equipment-card animate-fade-in" style={{
            background: 'var(--bg-secondary)', width: '100%', maxWidth: '500px',
            padding: '2rem', borderRadius: '16px', position: 'relative'
          }}>
            <button 
              onClick={() => { setShowCheckout(false); setCheckoutItem(null); }}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
            >
              <X size={24} />
            </button>
            <h2 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShoppingCart size={24} color="var(--accent-primary)" /> เบิกอะไหล่
            </h2>
            <div style={{ padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: '8px', marginBottom: '1.5rem' }}>
              <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>{checkoutItem.name}</strong>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                คงเหลือในคลัง: <strong style={{ color: checkoutItem.qty > 0 ? '#10b981' : '#ef4444' }}>{checkoutItem.qty} {checkoutItem.unit}</strong>
              </div>
            </div>

            <form onSubmit={handleCheckoutSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>จำนวนที่ต้องการเบิก *</label>
                <input 
                  type="number" min="1" max={checkoutItem.qty}
                  value={checkoutData.qty}
                  onChange={e => setCheckoutData(d => ({ ...d, qty: e.target.value }))}
                  style={{ width: '100%', padding: '1rem', borderRadius: '8px', fontSize: '1.1rem', textAlign: 'center' }}
                  required
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>นำไปใช้กับงานอะไร / ลูกค้าคนไหน *</label>
                <input 
                  type="text" 
                  value={checkoutData.purpose}
                  onChange={e => setCheckoutData(d => ({ ...d, purpose: e.target.value }))}
                  placeholder="เช่น ซ่อมแอร์บ้านคุณสมชาย, งานโปรเจกต์ กฟภ."
                  style={{ width: '100%', padding: '1rem', borderRadius: '8px', fontSize: '1rem' }}
                  required
                />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>หมายเหตุ (Optional)</label>
                <input 
                  type="text" 
                  value={checkoutData.notes}
                  onChange={e => setCheckoutData(d => ({ ...d, notes: e.target.value }))}
                  placeholder="รายละเอียดเพิ่มเติม"
                  style={{ width: '100%', padding: '1rem', borderRadius: '8px', fontSize: '1rem' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="button" onClick={() => { setShowCheckout(false); setCheckoutItem(null); }}
                  style={{ flex: 1, padding: '1rem', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px', cursor: 'pointer' }}>
                  ยกเลิก
                </button>
                <button type="submit"
                  style={{ flex: 2, padding: '1rem', background: 'var(--accent-primary)', border: 'none', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                  ยืนยันการเบิกอะไหล่
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
