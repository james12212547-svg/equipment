import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, FileText, Printer, Save, ChevronDown, ChevronUp, Edit3 } from 'lucide-react';
import { saveQuotationDB, getAllQuotationsDB, deleteQuotationDB } from '../utils/db';
import toast from 'react-hot-toast';

const defaultItem = () => ({ id: Date.now(), description: '', qty: 1, unit: 'ชิ้น', unitPrice: 0 });

const emptyForm = () => ({
  id: `Q-${Date.now()}`,
  number: `QT-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
  date: new Date().toLocaleDateString('th-TH'),
  customerName: '',
  customerAddress: '',
  customerPhone: '',
  items: [defaultItem()],
  vatEnabled: false,
  discount: 0,
  notes: '',
  status: 'draft', // draft | sent | paid
  createdAt: new Date().toISOString(),
});

const Quotation = () => {
  const [view, setView] = useState('list'); // 'list' | 'form' | 'preview'
  const [quotations, setQuotations] = useState([]);
  const [form, setForm] = useState(emptyForm());
  const [editingId, setEditingId] = useState(null);
  const printRef = useRef();

  // Load company info from localStorage
  const companyName = localStorage.getItem('companyName') || 'บริษัท/ร้านของคุณ';
  const companyAddress = localStorage.getItem('companyAddress') || 'ที่อยู่บริษัท';
  const companyPhone = localStorage.getItem('companyPhone') || 'เบอร์โทร';
  const companyTax = localStorage.getItem('companyTax') || '';

  useEffect(() => {
    getAllQuotationsDB().then(setQuotations).catch(console.error);
  }, []);

  const subtotal = form.items.reduce((s, i) => s + (Number(i.qty) * Number(i.unitPrice)), 0);
  const discount = Number(form.discount) || 0;
  const afterDiscount = subtotal - discount;
  const vat = form.vatEnabled ? afterDiscount * 0.07 : 0;
  const total = afterDiscount + vat;

  const handleItemChange = (idx, field, value) => {
    setForm(f => {
      const items = [...f.items];
      items[idx] = { ...items[idx], [field]: value };
      return { ...f, items };
    });
  };

  const addItem = () => setForm(f => ({ ...f, items: [...f.items, defaultItem()] }));
  const removeItem = (idx) => setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));

  const handleSave = async (status = form.status) => {
    if (!form.customerName.trim()) { toast.error('กรุณากรอกชื่อลูกค้า'); return; }
    const toSave = { ...form, status, subtotal, discount, vat, total, updatedAt: new Date().toISOString() };
    await saveQuotationDB(toSave);
    const updated = await getAllQuotationsDB();
    setQuotations(updated);
    toast.success(status === 'sent' ? 'บันทึกและส่งใบเสนอราคาแล้ว!' : 'บันทึกแบบร่างแล้ว');
    setView('list');
    setForm(emptyForm());
    setEditingId(null);
  };

  const handleEdit = (q) => {
    setForm(q);
    setEditingId(q.id);
    setView('form');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('ต้องการลบใบเสนอราคานี้หรือไม่?')) return;
    await deleteQuotationDB(id);
    setQuotations(prev => prev.filter(q => q.id !== id));
    toast.success('ลบเรียบร้อยแล้ว');
  };

  const handlePrint = () => window.print();

  const statusColor = (s) => s === 'paid' ? '#10b981' : s === 'sent' ? '#3b82f6' : '#f59e0b';
  const statusLabel = (s) => s === 'paid' ? '✅ ชำระแล้ว' : s === 'sent' ? '📤 ส่งแล้ว' : '📝 ร่าง';

  // ---- LIST VIEW ----
  if (view === 'list') return (
    <div className="animate-fade-in">
      <style>{`@media print { .no-print { display: none !important; } .print-area { display: block !important; } }`}</style>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>ใบเสนอราคา / ใบแจ้งหนี้</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Quotation & Invoice Management</p>
        </div>
        <button onClick={() => { setForm(emptyForm()); setEditingId(null); setView('form'); }}
          style={{ background: 'var(--accent-primary)', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '1rem' }}>
          <Plus size={20} /> สร้างใบใหม่
        </button>
      </div>

      {quotations.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--bg-secondary)', borderRadius: '12px', color: 'var(--text-tertiary)' }}>
          <FileText size={64} style={{ marginBottom: '1rem', opacity: 0.4 }} />
          <h3>ยังไม่มีใบเสนอราคา</h3>
          <p>กดปุ่ม "สร้างใบใหม่" เพื่อเริ่มต้น</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {[...quotations].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(q => (
            <div key={q.id} className="equipment-card" style={{ padding: '1.5rem', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontSize: '1.1rem' }}>{q.number}</span>
                  <span style={{ padding: '0.2rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 'bold', background: `${statusColor(q.status)}22`, color: statusColor(q.status) }}>
                    {statusLabel(q.status)}
                  </span>
                </div>
                <p style={{ margin: '0 0 0.25rem', color: 'var(--text-secondary)' }}>{q.customerName}</p>
                <p style={{ margin: 0, color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>{q.date}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ display: 'block', color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>ยอดรวม</span>
                  <strong style={{ color: 'var(--accent-solar)', fontSize: '1.2rem' }}>฿{Number(q.total || 0).toLocaleString()}</strong>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => { setForm(q); setView('preview'); }} title="พิมพ์/ดูตัวอย่าง"
                    style={{ background: 'rgba(16,185,129,0.1)', border: 'none', color: '#10b981', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer' }}><Printer size={18} /></button>
                  <button onClick={() => handleEdit(q)} title="แก้ไข"
                    style={{ background: 'rgba(59,130,246,0.1)', border: 'none', color: '#3b82f6', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer' }}><Edit3 size={18} /></button>
                  <button onClick={() => handleDelete(q.id)} title="ลบ"
                    style={{ background: 'rgba(239,68,68,0.1)', border: 'none', color: '#ef4444', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer' }}><Trash2 size={18} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ---- FORM VIEW ----
  if (view === 'form') return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ margin: 0 }}>{editingId ? 'แก้ไขใบเสนอราคา' : 'สร้างใบเสนอราคาใหม่'}</h1>
        <button onClick={() => setView('list')} style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer' }}>ยกเลิก</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="equipment-card" style={{ padding: '1.5rem', border: '1px solid var(--border-color)' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>ข้อมูลลูกค้า</h3>
          {[['customerName', 'ชื่อลูกค้า *', 'text'], ['customerAddress', 'ที่อยู่', 'text'], ['customerPhone', 'เบอร์โทร', 'tel']].map(([name, label]) => (
            <div key={name} style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{label}</label>
              <input value={form[name]} onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', fontSize: '1rem' }} />
            </div>
          ))}
        </div>
        <div className="equipment-card" style={{ padding: '1.5rem', border: '1px solid var(--border-color)' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>ข้อมูลเอกสาร</h3>
          {[['number', 'เลขที่ใบเสนอราคา'], ['date', 'วันที่']].map(([name, label]) => (
            <div key={name} style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{label}</label>
              <input value={form[name]} onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', fontSize: '1rem' }} />
            </div>
          ))}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>สถานะ</label>
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', fontSize: '1rem' }}>
              <option value="draft">📝 ร่าง</option>
              <option value="sent">📤 ส่งแล้ว</option>
              <option value="paid">✅ ชำระแล้ว</option>
            </select>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="equipment-card" style={{ padding: '1.5rem', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>รายการสินค้า / บริการ</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                {['รายการ', 'จำนวน', 'หน่วย', 'ราคาต่อหน่วย (฿)', 'รวม (฿)', ''].map(h => (
                  <th key={h} style={{ padding: '0.75rem', textAlign: h === '' ? 'center' : 'left', color: 'var(--text-secondary)', fontWeight: '600' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {form.items.map((item, idx) => (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.5rem' }}>
                    <input value={item.description} onChange={e => handleItemChange(idx, 'description', e.target.value)}
                      placeholder="ชื่อรายการ / งาน / อะไหล่"
                      style={{ width: '100%', minWidth: '200px', padding: '0.5rem', borderRadius: '6px' }} />
                  </td>
                  <td style={{ padding: '0.5rem' }}>
                    <input type="number" value={item.qty} min="1" onChange={e => handleItemChange(idx, 'qty', e.target.value)}
                      style={{ width: '70px', padding: '0.5rem', borderRadius: '6px' }} />
                  </td>
                  <td style={{ padding: '0.5rem' }}>
                    <input value={item.unit} onChange={e => handleItemChange(idx, 'unit', e.target.value)}
                      style={{ width: '70px', padding: '0.5rem', borderRadius: '6px' }} />
                  </td>
                  <td style={{ padding: '0.5rem' }}>
                    <input type="number" value={item.unitPrice} min="0" onChange={e => handleItemChange(idx, 'unitPrice', e.target.value)}
                      style={{ width: '120px', padding: '0.5rem', borderRadius: '6px' }} />
                  </td>
                  <td style={{ padding: '0.5rem', fontWeight: 'bold', color: 'var(--accent-solar)' }}>
                    {(Number(item.qty) * Number(item.unitPrice)).toLocaleString()}
                  </td>
                  <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                    <button onClick={() => removeItem(idx)} disabled={form.items.length === 1}
                      style={{ background: 'rgba(239,68,68,0.1)', border: 'none', color: '#ef4444', padding: '0.4rem', borderRadius: '6px', cursor: 'pointer' }}><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button onClick={addItem} style={{ marginTop: '1rem', background: 'transparent', border: '1px dashed var(--border-color)', color: 'var(--text-secondary)', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={16} /> เพิ่มรายการ
        </button>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="equipment-card" style={{ padding: '1.5rem', border: '1px solid var(--border-color)' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>หมายเหตุ / เงื่อนไข</label>
          <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            rows="4" placeholder="เช่น ชำระภายใน 30 วัน, รับประกัน 3 เดือน..."
            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', resize: 'vertical' }} />
        </div>
        <div className="equipment-card" style={{ padding: '1.5rem', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>ราคารวม</span>
            <span>฿{subtotal.toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>ส่วนลด (฿)</span>
            <input type="number" value={form.discount} min="0" onChange={e => setForm(f => ({ ...f, discount: e.target.value }))}
              style={{ width: '100px', padding: '0.4rem', borderRadius: '6px', textAlign: 'right' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>VAT 7%</span>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={form.vatEnabled} onChange={e => setForm(f => ({ ...f, vatEnabled: e.target.checked }))} />
              <span style={{ fontSize: '0.85rem' }}>{form.vatEnabled ? `฿${vat.toLocaleString()}` : 'ไม่รวม'}</span>
            </label>
          </div>
          <div style={{ borderTop: '2px solid var(--border-color)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
            <strong style={{ fontSize: '1.1rem' }}>ยอดรวมสุทธิ</strong>
            <strong style={{ color: 'var(--accent-solar)', fontSize: '1.3rem' }}>฿{total.toLocaleString()}</strong>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
        <button onClick={() => handleSave('draft')} style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.75rem 1.5rem', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Save size={18} /> บันทึกร่าง
        </button>
        <button onClick={() => { setForm(f => ({ ...f, subtotal, vat, total })); setView('preview'); }} style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid #10b981', color: '#10b981', padding: '0.75rem 1.5rem', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Printer size={18} /> ดูตัวอย่าง / พิมพ์
        </button>
        <button onClick={() => handleSave('sent')} style={{ background: 'var(--accent-primary)', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileText size={18} /> บันทึกและส่ง
        </button>
      </div>
    </div>
  );

  // ---- PREVIEW / PRINT VIEW ----
  const printSubtotal = form.subtotal ?? subtotal;
  const printVat = form.vat ?? vat;
  const printTotal = form.total ?? total;

  return (
    <div>
      <div className="no-print" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <button onClick={() => setView('form')} style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', padding: '0.75rem 1.5rem', borderRadius: '10px', cursor: 'pointer' }}>← กลับแก้ไข</button>
        <button onClick={handlePrint} style={{ background: 'var(--accent-primary)', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Printer size={18} /> พิมพ์ / บันทึก PDF
        </button>
        <button onClick={() => handleSave(form.status)} style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid #10b981', color: '#10b981', padding: '0.75rem 1.5rem', borderRadius: '10px', cursor: 'pointer' }}>
          <Save size={18} /> บันทึก
        </button>
      </div>

      {/* Printable Document */}
      <div ref={printRef} style={{ background: 'white', color: '#000', padding: '3rem', maxWidth: '800px', margin: '0 auto', borderRadius: '8px', fontFamily: 'Prompt, sans-serif', border: '1px solid #e2e8f0', lineHeight: '1.6' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '3px solid #1e40af' }}>
          <div>
            <h2 style={{ margin: '0 0 0.25rem', color: '#1e40af', fontSize: '1.5rem' }}>{companyName}</h2>
            <p style={{ margin: '0', color: '#64748b', fontSize: '0.9rem' }}>{companyAddress}</p>
            <p style={{ margin: '0', color: '#64748b', fontSize: '0.9rem' }}>โทร: {companyPhone} {companyTax && `| เลขที่ผู้เสียภาษี: ${companyTax}`}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h1 style={{ margin: '0 0 0.5rem', color: '#1e40af', fontSize: '2rem', letterSpacing: '2px' }}>ใบเสนอราคา</h1>
            <p style={{ margin: '0', fontWeight: 'bold' }}>เลขที่: {form.number}</p>
            <p style={{ margin: '0', color: '#64748b' }}>วันที่: {form.date}</p>
          </div>
        </div>

        {/* Customer */}
        <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>
          <h3 style={{ margin: '0 0 0.5rem', color: '#1e40af' }}>เรียน:</h3>
          <p style={{ margin: '0', fontWeight: 'bold', fontSize: '1.1rem' }}>{form.customerName}</p>
          {form.customerAddress && <p style={{ margin: '0', color: '#64748b' }}>{form.customerAddress}</p>}
          {form.customerPhone && <p style={{ margin: '0', color: '#64748b' }}>โทร: {form.customerPhone}</p>}
        </div>

        {/* Items */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
          <thead>
            <tr style={{ background: '#1e40af', color: 'white' }}>
              {['#', 'รายการ', 'จำนวน', 'หน่วย', 'ราคา/หน่วย', 'จำนวนเงิน'].map((h, i) => (
                <th key={i} style={{ padding: '0.75rem', textAlign: i > 1 ? 'center' : 'left', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {form.items.map((item, idx) => (
              <tr key={item.id} style={{ background: idx % 2 === 0 ? '#f8fafc' : 'white', borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '0.6rem', textAlign: 'center', color: '#64748b' }}>{idx + 1}</td>
                <td style={{ padding: '0.6rem' }}>{item.description}</td>
                <td style={{ padding: '0.6rem', textAlign: 'center' }}>{item.qty}</td>
                <td style={{ padding: '0.6rem', textAlign: 'center' }}>{item.unit}</td>
                <td style={{ padding: '0.6rem', textAlign: 'right' }}>{Number(item.unitPrice).toLocaleString()}</td>
                <td style={{ padding: '0.6rem', textAlign: 'right', fontWeight: 'bold' }}>{(Number(item.qty) * Number(item.unitPrice)).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
          <div style={{ width: '280px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #e2e8f0' }}>
              <span style={{ color: '#64748b' }}>ราคารวม</span><span>฿{printSubtotal.toLocaleString()}</span>
            </div>
            {Number(form.discount) > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #e2e8f0' }}>
                <span style={{ color: '#64748b' }}>ส่วนลด</span><span style={{ color: '#ef4444' }}>-฿{Number(form.discount).toLocaleString()}</span>
              </div>
            )}
            {form.vatEnabled && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #e2e8f0' }}>
                <span style={{ color: '#64748b' }}>ภาษีมูลค่าเพิ่ม 7%</span><span>฿{printVat.toLocaleString()}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', background: '#1e40af', color: 'white', borderRadius: '8px', padding: '0.75rem 1rem', marginTop: '0.5rem' }}>
              <strong style={{ fontSize: '1.1rem' }}>ยอดรวมสุทธิ</strong>
              <strong style={{ fontSize: '1.2rem' }}>฿{printTotal.toLocaleString()}</strong>
            </div>
          </div>
        </div>

        {/* Notes */}
        {form.notes && (
          <div style={{ background: '#fef9c3', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #f59e0b' }}>
            <strong>หมายเหตุ:</strong> {form.notes}
          </div>
        )}

        {/* Signature */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid #e2e8f0' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ height: '60px', borderBottom: '1px solid #000', marginBottom: '0.5rem' }} />
            <p style={{ margin: 0, color: '#64748b' }}>ผู้เสนอราคา</p>
            <p style={{ margin: 0, fontWeight: 'bold' }}>{companyName}</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ height: '60px', borderBottom: '1px solid #000', marginBottom: '0.5rem' }} />
            <p style={{ margin: 0, color: '#64748b' }}>ผู้อนุมัติ / ลูกค้า</p>
            <p style={{ margin: 0, fontWeight: 'bold' }}>{form.customerName}</p>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .nav-bar, .chatbot-btn { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default Quotation;
