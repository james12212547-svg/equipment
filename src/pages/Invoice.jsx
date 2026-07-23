import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, FileText, Printer, Save, CheckCircle, ArrowLeft, Download, Edit3, ShieldAlert, CreditCard, Building2, UserCheck } from 'lucide-react';
import { saveInvoiceDB, getAllInvoicesDB, deleteInvoiceDB, getAllQuotationsDB } from '../utils/db';
import { thaiBahtText } from '../utils/thaiBaht';
import toast from 'react-hot-toast';

const DOC_TYPES = {
  billing_note: { label: 'ใบแจ้งหนี้ / ใบวางบิล', prefix: 'INV', color: '#3b82f6' },
  tax_invoice: { label: 'ใบเสร็จรับเงิน / ใบกำกับภาษี', prefix: 'TAX', color: '#10b981' },
  receipt: { label: 'ใบเสร็จรับเงินอย่างย่อ', prefix: 'RCP', color: '#f59e0b' },
};

const defaultItem = () => ({ id: Date.now(), description: '', qty: 1, unit: 'ชิ้น', unitPrice: 0 });

const emptyForm = (type = 'tax_invoice') => ({
  id: `INV-${Date.now()}`,
  type: type, // 'billing_note' | 'tax_invoice' | 'receipt'
  number: `${DOC_TYPES[type].prefix}-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
  quotationRef: '', // Link to original quotation if converted
  date: new Date().toLocaleDateString('th-TH'),
  dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString('th-TH'),
  customerName: '',
  customerTaxId: '',
  customerBranch: 'สำนักงานใหญ่',
  customerAddress: '',
  customerPhone: '',
  items: [defaultItem()],
  vatEnabled: true,
  withholdingTaxRate: 0, // 0 | 1 | 3
  discount: 0,
  notes: 'ชำระเงินโอนผ่านบัญชีธนาคารเท่านั้น',
  paymentMethod: 'โอนเงินผ่านธนาคาร',
  bankInfo: 'ธนาคารกสิกรไทย 123-4-56789-0 ชื่อบัญชี บริษัท บิ๊กวิศวกรรม จำกัด',
  status: 'paid', // 'pending' | 'paid' | 'cancelled'
  createdAt: new Date().toISOString(),
});

const Invoice = () => {
  const [view, setView] = useState('list'); // 'list' | 'form' | 'preview'
  const [invoices, setInvoices] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [form, setForm] = useState(emptyForm());
  const [editingId, setEditingId] = useState(null);
  const printRef = useRef();

  // Company info from Settings / localStorage
  const companyName = localStorage.getItem('companyName') || 'บริษัท วิศวกรรมไทย จำกัด';
  const companyAddress = localStorage.getItem('companyAddress') || '123/45 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพมหานคร 10110';
  const companyPhone = localStorage.getItem('companyPhone') || '02-123-4567';
  const companyTax = localStorage.getItem('companyTax') || '0105560000000';
  const companyBranch = localStorage.getItem('companyBranch') || 'สำนักงานใหญ่';

  useEffect(() => {
    getAllInvoicesDB().then(setInvoices).catch(console.error);
    getAllQuotationsDB().then(setQuotations).catch(console.error);
  }, []);

  // Calculation helpers
  const subtotal = form.items.reduce((s, i) => s + (Number(i.qty) * Number(i.unitPrice)), 0);
  const discount = Number(form.discount) || 0;
  const afterDiscount = Math.max(0, subtotal - discount);
  const vat = form.vatEnabled ? afterDiscount * 0.07 : 0;
  const grandTotal = afterDiscount + vat;
  const whtAmount = afterDiscount * (Number(form.withholdingTaxRate) / 100);
  const netPayable = grandTotal - whtAmount;

  const handleItemChange = (idx, field, value) => {
    setForm(f => {
      const items = [...f.items];
      items[idx] = { ...items[idx], [field]: value };
      return { ...f, items };
    });
  };

  const addItem = () => setForm(f => ({ ...f, items: [...f.items, defaultItem()] }));
  const removeItem = (idx) => setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));

  // Convert from Quotation
  const handleImportQuotation = (qId) => {
    if (!qId) return;
    const q = quotations.find(item => item.id === qId);
    if (!q) return;

    setForm(f => ({
      ...f,
      quotationRef: q.number,
      customerName: q.customerName || f.customerName,
      customerAddress: q.customerAddress || f.customerAddress,
      customerPhone: q.customerPhone || f.customerPhone,
      items: q.items && q.items.length > 0 ? q.items.map(i => ({ ...i })) : [defaultItem()],
      vatEnabled: q.vatEnabled ?? true,
      discount: q.discount || 0,
      notes: q.notes || f.notes,
    }));
    toast.success(`ดึงข้อมูลจากใบเสนอราคา ${q.number} เรียบร้อยแล้ว!`);
  };

  const handleTypeChange = (type) => {
    setForm(f => ({
      ...f,
      type: type,
      number: `${DOC_TYPES[type].prefix}-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
    }));
  };

  const handleSave = async (status = form.status) => {
    if (!form.customerName.trim()) { toast.error('กรุณากรอกชื่อลูกค้า'); return; }
    const toSave = {
      ...form,
      status,
      subtotal,
      discount,
      vat,
      grandTotal,
      whtAmount,
      netPayable,
      updatedAt: new Date().toISOString(),
    };

    await saveInvoiceDB(toSave);
    const updated = await getAllInvoicesDB();
    setInvoices(updated);
    toast.success('บันทึกเอกสารเรียบร้อยแล้ว!');
    setView('list');
    setForm(emptyForm());
    setEditingId(null);
  };

  const handleEdit = (inv) => {
    setForm(inv);
    setEditingId(inv.id);
    setView('form');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('ต้องการลบเอกสารนี้หรือไม่?')) return;
    await deleteInvoiceDB(id);
    setInvoices(prev => prev.filter(i => i.id !== id));
    toast.success('ลบเอกสารเรียบร้อยแล้ว');
  };

  const handlePrint = () => window.print();

  // ---- LIST VIEW ----
  if (view === 'list') {
    return (
      <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
        <style>{`@media print { .no-print { display: none !important; } .print-area { display: block !important; } }`}</style>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>ระบบออกเอกสารการเงิน</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Billing & Tax Invoice System</p>
          </div>
          <button
            onClick={() => { setForm(emptyForm()); setEditingId(null); setView('form'); }}
            className="primary-btn"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Plus size={20} /> ออกเอกสารใหม่
          </button>
        </div>

        {invoices.length === 0 ? (
          <div className="equipment-card" style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>
            <FileText size={56} style={{ opacity: 0.3, marginBottom: '1rem' }} />
            <h3>ยังไม่มีเอกสารการเงิน</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>เริ่มต้นสร้างใบวางบิล หรือใบเสร็จรับเงิน/ใบกำกับภาษี ได้เลย</p>
            <button
              onClick={() => { setForm(emptyForm()); setEditingId(null); setView('form'); }}
              className="primary-btn"
            >
              + ออกเอกสารแรก
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {invoices.map(inv => {
              const typeInfo = DOC_TYPES[inv.type] || DOC_TYPES.tax_invoice;
              const isPaid = inv.status === 'paid';
              return (
                <div key={inv.id} className="equipment-card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: `${typeInfo.color}20`, border: `1px solid ${typeInfo.color}50`, color: typeInfo.color, padding: '0.75rem', borderRadius: '12px', flexShrink: 0 }}>
                      <FileText size={28} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '99px', background: `${typeInfo.color}20`, color: typeInfo.color }}>
                          {typeInfo.label}
                        </span>
                        <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>{inv.number}</strong>
                        {inv.quotationRef && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>(อ้างอิง {inv.quotationRef})</span>
                        )}
                      </div>
                      <p style={{ margin: '0 0 0.25rem', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                        ลูกค้า: <strong>{inv.customerName}</strong> {inv.customerTaxId && `(เลขผู้เสียภาษี: ${inv.customerTaxId})`}
                      </p>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>วันที่: {inv.date}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
                        ฿{(inv.netPayable || inv.grandTotal || 0).toLocaleString()}
                      </div>
                      <span style={{ fontSize: '0.8rem', color: isPaid ? '#10b981' : '#f59e0b', fontWeight: 600 }}>
                        {isPaid ? '✅ ชำระแล้ว' : '⏳ รอชำระเงิน'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => { setForm(inv); setView('preview'); }}
                        style={{ background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.3)', color: '#3b82f6', padding: '0.5rem 0.9rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem' }}
                      >
                        <Printer size={16} /> ดู/พิมพ์
                      </button>
                      <button
                        onClick={() => handleEdit(inv)}
                        style={{ background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)', color: '#f59e0b', padding: '0.5rem 0.9rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem' }}
                      >
                        <Edit3 size={16} /> แก้ไข
                      </button>
                      <button
                        onClick={() => handleDelete(inv.id)}
                        style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ---- FORM VIEW ----
  if (view === 'form') {
    return (
      <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <button onClick={() => setView('list')} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '0.5rem' }}>
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-gradient" style={{ fontSize: '2rem', marginBottom: 0 }}>
              {editingId ? 'แก้ไขเอกสารการเงิน' : 'ออกเอกสารการเงินใหม่'}
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>เลือกประเภทเอกสาร และกรอกรายละเอียด</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Document Type Selector */}
          <div className="equipment-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem', fontSize: '1.1rem' }}>1. เลือกประเภทเอกสาร</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              {Object.entries(DOC_TYPES).map(([key, info]) => (
                <button
                  key={key}
                  onClick={() => handleTypeChange(key)}
                  style={{
                    padding: '1rem',
                    borderRadius: '12px',
                    border: form.type === key ? `2px solid ${info.color}` : '1px solid var(--border-color)',
                    background: form.type === key ? `${info.color}15` : 'var(--bg-tertiary)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ color: info.color, marginBottom: '0.3rem' }}>{info.label}</div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>รหัส: {info.prefix}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Import from Quotation */}
          {quotations.length > 0 && (
            <div className="equipment-card" style={{ padding: '1.25rem', background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <FileText size={20} color="#3b82f6" />
                <strong style={{ color: '#3b82f6', fontSize: '0.95rem' }}>นำเข้าข้อมูลจากใบเสนอราคา:</strong>
                <select
                  onChange={(e) => handleImportQuotation(e.target.value)}
                  style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #3b82f6', background: 'var(--bg-secondary)', color: 'var(--text-primary)', flex: 1, minWidth: '220px' }}
                >
                  <option value="">-- เลือกใบเสนอราคาเพื่อดึงข้อมูล --</option>
                  {quotations.map(q => (
                    <option key={q.id} value={q.id}>{q.number} - {q.customerName} (฿{Number(q.total || 0).toLocaleString()})</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Form Header Info */}
          <div className="equipment-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem', fontSize: '1.1rem' }}>2. ข้อมูลเอกสาร & ข้อมูลลูกค้า</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>เลขที่เอกสาร</label>
                <input
                  type="text"
                  value={form.number}
                  onChange={(e) => setForm({ ...form, number: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>วันที่ออกเอกสาร</label>
                <input
                  type="text"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>วันครบกำหนดชำระ</label>
                <input
                  type="text"
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>ชื่อลูกค้า / ชื่อบริษัท *</label>
                <input
                  type="text"
                  value={form.customerName}
                  onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                  placeholder="เช่น บริษัท เอสซีจี จำกัด"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>เลขประจำตัวผู้เสียภาษีลูกค้า</label>
                <input
                  type="text"
                  value={form.customerTaxId}
                  onChange={(e) => setForm({ ...form, customerTaxId: e.target.value })}
                  placeholder="เช่น 0105550000000"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>สาขา</label>
                <input
                  type="text"
                  value={form.customerBranch}
                  onChange={(e) => setForm({ ...form, customerBranch: e.target.value })}
                  placeholder="สำนักงานใหญ่ หรือ สาขาที่ 00001"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px' }}
                />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>ที่อยู่ลูกค้า</label>
                <input
                  type="text"
                  value={form.customerAddress}
                  onChange={(e) => setForm({ ...form, customerAddress: e.target.value })}
                  placeholder="ที่อยู่สำหรับออกใบกำกับภาษี"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px' }}
                />
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="equipment-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem', fontSize: '1.1rem' }}>3. รายการสินค้า / ค่าบริการ</h3>
            
            {form.items.map((item, idx) => (
              <div key={item.id} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ color: 'var(--text-tertiary)', width: '20px', textAlign: 'center', fontSize: '0.85rem' }}>{idx + 1}</span>
                <input
                  type="text"
                  placeholder="รายละเอียดสินค้า/งานซ่อม"
                  value={item.description}
                  onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                  style={{ flex: '3 1 200px', padding: '0.6rem', borderRadius: '8px' }}
                />
                <input
                  type="number"
                  placeholder="จำนวน"
                  value={item.qty}
                  onChange={(e) => handleItemChange(idx, 'qty', e.target.value)}
                  style={{ flex: '1 1 70px', padding: '0.6rem', borderRadius: '8px', textAlign: 'center' }}
                />
                <input
                  type="text"
                  placeholder="หน่วย"
                  value={item.unit}
                  onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                  style={{ flex: '1 1 70px', padding: '0.6rem', borderRadius: '8px', textAlign: 'center' }}
                />
                <input
                  type="number"
                  placeholder="ราคา/หน่วย"
                  value={item.unitPrice}
                  onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                  style={{ flex: '1 1 100px', padding: '0.6rem', borderRadius: '8px', textAlign: 'right' }}
                />
                <strong style={{ minWidth: '90px', textAlign: 'right', color: 'var(--accent-primary)', fontSize: '0.95rem' }}>
                  ฿{(Number(item.qty) * Number(item.unitPrice)).toLocaleString()}
                </strong>
                {form.items.length > 1 && (
                  <button onClick={() => removeItem(idx)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.3rem' }}>
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}

            <button onClick={addItem} style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px dashed var(--border-color)', color: 'var(--text-primary)', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', marginTop: '0.5rem' }}>
              + เพิ่มรายการ
            </button>
          </div>

          {/* Taxes & Totals & Payment Info */}
          <div className="equipment-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem', fontSize: '1.1rem' }}>4. ภาษี การชำระเงิน และยอดรวมสุทธิ</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '1rem', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                  <input
                    type="checkbox"
                    checked={form.vatEnabled}
                    onChange={(e) => setForm({ ...form, vatEnabled: e.target.checked })}
                    style={{ width: '18px', height: '18px' }}
                  />
                  คิดภาษีมูลค่าเพิ่ม (VAT 7%)
                </label>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>ภาษีหัก ณ ที่จ่าย (Withholding Tax)</label>
                  <select
                    value={form.withholdingTaxRate}
                    onChange={(e) => setForm({ ...form, withholdingTaxRate: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px' }}
                  >
                    <option value={0}>ไม่หัก ณ ที่จ่าย (0%)</option>
                    <option value={3}>หัก ณ ที่จ่าย 3% (ค่าบริการ / ค่าแรง)</option>
                    <option value={1}>หัก ณ ที่จ่าย 1% (ค่าขนส่ง)</option>
                  </select>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>ส่วนลดท้ายบิล (บาท)</label>
                  <input
                    type="number"
                    value={form.discount}
                    onChange={(e) => setForm({ ...form, discount: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>บัญชีธนาคารสำหรับโอนเงิน</label>
                  <input
                    type="text"
                    value={form.bankInfo}
                    onChange={(e) => setForm({ ...form, bankInfo: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px' }}
                  />
                </div>
              </div>

              {/* Summary Card */}
              <div style={{ background: 'var(--bg-tertiary)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>รวมเป็นเงิน:</span>
                  <strong>฿{subtotal.toLocaleString()}</strong>
                </div>
                {discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#ef4444' }}>
                    <span>หัก ส่วนลด:</span>
                    <span>-฿{discount.toLocaleString()}</span>
                  </div>
                )}
                {form.vatEnabled && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>ภาษีมูลค่าเพิ่ม (VAT 7%):</span>
                    <strong>฿{vat.toLocaleString()}</strong>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.95rem', fontWeight: 'bold', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
                  <span>จำนวนเงินรวมทั้งสิ้น:</span>
                  <strong>฿{grandTotal.toLocaleString()}</strong>
                </div>
                {whtAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#f59e0b' }}>
                    <span>หัก ภาษี ณ ที่จ่าย ({form.withholdingTaxRate}%):</span>
                    <span>-฿{whtAmount.toLocaleString()}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', padding: '1rem', background: 'var(--accent-primary)', color: 'white', borderRadius: '8px' }}>
                  <span style={{ fontWeight: 'bold' }}>ยอดชำระสุทธิ:</span>
                  <strong style={{ fontSize: '1.3rem' }}>฿{netPayable.toLocaleString()}</strong>
                </div>
                <p style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-tertiary)', textAlign: 'center' }}>
                  ({thaiBahtText(netPayable)})
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button onClick={() => setView('list')} style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.75rem 1.5rem', borderRadius: '10px', cursor: 'pointer' }}>
              ยกเลิก
            </button>
            <button onClick={() => setView('preview')} style={{ background: 'rgba(59, 130, 246, 0.15)', border: '1px solid #3b82f6', color: '#3b82f6', padding: '0.75rem 1.5rem', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Printer size={18} /> ดูตัวอย่าง/พิมพ์
            </button>
            <button onClick={() => handleSave('paid')} className="primary-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Save size={18} /> บันทึกเอกสาร
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---- PREVIEW & PRINT VIEW ----
  const typeDetails = DOC_TYPES[form.type] || DOC_TYPES.tax_invoice;

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; color: black !important; }
          .nav-bar, .chatbot-btn { display: none !important; }
          .print-container { padding: 0 !important; border: none !important; box-shadow: none !important; width: 100% !important; max-width: 100% !important; }
        }
      `}</style>

      {/* Control Actions Bar */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <button onClick={() => setView('form')} style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.75rem 1.5rem', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ArrowLeft size={18} /> กลับไปแก้ไข
        </button>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={handlePrint} className="primary-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Printer size={18} /> พิมพ์เป็น PDF / พิมพ์เอกสาร
          </button>
        </div>
      </div>

      {/* Official Thai Tax Invoice Printable Layout */}
      <div
        ref={printRef}
        className="print-container"
        style={{
          background: 'white',
          color: '#000000',
          padding: '3rem',
          maxWidth: '850px',
          margin: '0 auto',
          borderRadius: '8px',
          fontFamily: 'Prompt, sans-serif',
          border: '1px solid #cbd5e1',
          lineHeight: '1.5',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '3px solid #0f172a' }}>
          <div>
            <h2 style={{ margin: '0 0 0.25rem', color: '#0f172a', fontSize: '1.6rem', fontWeight: 800 }}>{companyName}</h2>
            <p style={{ margin: '0', color: '#334155', fontSize: '0.85rem' }}>{companyAddress}</p>
            <p style={{ margin: '0', color: '#334155', fontSize: '0.85rem' }}>
              โทร: {companyPhone} {companyTax && `| เลขประจำตัวผู้เสียภาษี: ${companyTax}`} ({companyBranch})
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h1 style={{ margin: '0 0 0.25rem', color: typeDetails.color, fontSize: '1.8rem', fontWeight: 800, letterSpacing: '1px' }}>
              {typeDetails.label}
            </h1>
            <p style={{ margin: '0', fontWeight: 'bold', fontSize: '1.05rem' }}>เลขที่: {form.number}</p>
            <p style={{ margin: '0', color: '#475569', fontSize: '0.85rem' }}>วันที่: {form.date}</p>
            {form.type === 'billing_note' && <p style={{ margin: '0', color: '#ef4444', fontSize: '0.85rem', fontWeight: 700 }}>ครบกำหนด: {form.dueDate}</p>}
            {form.quotationRef && <p style={{ margin: '0', color: '#64748b', fontSize: '0.8rem' }}>อ้างอิง: {form.quotationRef}</p>}
          </div>
        </div>

        {/* Customer Information */}
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '1rem 1.25rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
          <div>
            <p style={{ margin: '0 0 0.25rem', color: '#64748b', fontSize: '0.8rem', fontWeight: 700 }}>ชื่อและที่อยู่ลูกค้า (Customer):</p>
            <p style={{ margin: '0', fontWeight: 700, fontSize: '1.1rem', color: '#0f172a' }}>{form.customerName || '-'}</p>
            {form.customerAddress && <p style={{ margin: '0.25rem 0 0', color: '#334155', fontSize: '0.85rem' }}>{form.customerAddress}</p>}
            {form.customerPhone && <p style={{ margin: '0.25rem 0 0', color: '#334155', fontSize: '0.85rem' }}>โทร: {form.customerPhone}</p>}
          </div>
          <div>
            <p style={{ margin: '0 0 0.25rem', color: '#64748b', fontSize: '0.8rem', fontWeight: 700 }}>ข้อมูลผู้เสียภาษี:</p>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#334155' }}>
              เลขผู้เสียภาษี: <strong>{form.customerTaxId || '-'}</strong>
            </p>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#334155' }}>
              สาขา: <strong>{form.customerBranch || 'สำนักงานใหญ่'}</strong>
            </p>
          </div>
        </div>

        {/* Items Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ background: '#0f172a', color: 'white' }}>
              <th style={{ padding: '0.6rem', textAlign: 'center', width: '40px' }}>ลำดับ</th>
              <th style={{ padding: '0.6rem', textAlign: 'left' }}>รายการสินค้า / ค่าบริการ</th>
              <th style={{ padding: '0.6rem', textAlign: 'center', width: '60px' }}>จำนวน</th>
              <th style={{ padding: '0.6rem', textAlign: 'center', width: '60px' }}>หน่วย</th>
              <th style={{ padding: '0.6rem', textAlign: 'right', width: '110px' }}>ราคา/หน่วย</th>
              <th style={{ padding: '0.6rem', textAlign: 'right', width: '120px' }}>จำนวนเงิน (บาท)</th>
            </tr>
          </thead>
          <tbody>
            {form.items.map((item, idx) => (
              <tr key={item.id} style={{ background: idx % 2 === 0 ? '#f8fafc' : 'white', borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '0.6rem', textAlign: 'center', color: '#64748b' }}>{idx + 1}</td>
                <td style={{ padding: '0.6rem', color: '#0f172a' }}>{item.description}</td>
                <td style={{ padding: '0.6rem', textAlign: 'center' }}>{item.qty}</td>
                <td style={{ padding: '0.6rem', textAlign: 'center' }}>{item.unit}</td>
                <td style={{ padding: '0.6rem', textAlign: 'right' }}>{Number(item.unitPrice).toLocaleString()}</td>
                <td style={{ padding: '0.6rem', textAlign: 'right', fontWeight: 700 }}>{(Number(item.qty) * Number(item.unitPrice)).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Thai Baht Text & Totals */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1.5rem', marginBottom: '2rem', alignItems: 'flex-start' }}>
          <div>
            <div style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.75rem 1rem', borderRadius: '6px', marginBottom: '1rem', textAlign: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: '#475569' }}>จำนวนเงินตัวอักษร:</span>
              <strong style={{ display: 'block', fontSize: '1rem', color: '#0f172a', marginTop: '0.2rem' }}>
                ( {thaiBahtText(netPayable)} )
              </strong>
            </div>

            {form.bankInfo && (
              <div style={{ fontSize: '0.8rem', color: '#334155', background: '#f8fafc', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <strong style={{ color: '#0f172a' }}>ชำระเงินโดย:</strong> {form.paymentMethod}<br />
                <strong>รายละเอียดบัญชี:</strong> {form.bankInfo}
              </div>
            )}
          </div>

          <div style={{ fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', borderBottom: '1px solid #e2e8f0' }}>
              <span style={{ color: '#475569' }}>รวมเป็นเงิน</span>
              <span>฿{subtotal.toLocaleString()}</span>
            </div>
            {discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', borderBottom: '1px solid #e2e8f0', color: '#ef4444' }}>
                <span>หัก ส่วนลด</span>
                <span>-฿{discount.toLocaleString()}</span>
              </div>
            )}
            {form.vatEnabled && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', borderBottom: '1px solid #e2e8f0' }}>
                <span style={{ color: '#475569' }}>ภาษีมูลค่าเพิ่ม VAT 7%</span>
                <span>฿{vat.toLocaleString()}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #e2e8f0', fontWeight: 700 }}>
              <span>จำนวนเงินรวมทั้งสิ้น</span>
              <span>฿{grandTotal.toLocaleString()}</span>
            </div>
            {whtAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', borderBottom: '1px solid #e2e8f0', color: '#d97706' }}>
                <span>หัก ภาษี ณ ที่จ่าย ({form.withholdingTaxRate}%)</span>
                <span>-฿{whtAmount.toLocaleString()}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.8rem', background: '#0f172a', color: 'white', borderRadius: '6px', marginTop: '0.5rem' }}>
              <strong style={{ fontSize: '0.95rem' }}>ยอดชำระสุทธิ</strong>
              <strong style={{ fontSize: '1.1rem' }}>฿{netPayable.toLocaleString()}</strong>
            </div>
          </div>
        </div>

        {/* Double Signature Section */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid #cbd5e1' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ height: '50px', borderBottom: '1px dashed #000', marginBottom: '0.5rem' }} />
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569' }}>ผู้รับเงิน / ผู้แจ้งหนี้</p>
            <p style={{ margin: '0.2rem 0 0', fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>({companyName})</p>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: '#64748b' }}>วันที่ ..... / ..... / .........</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ height: '50px', borderBottom: '1px dashed #000', marginBottom: '0.5rem' }} />
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569' }}>ผู้มีอำนาจลงนาม / ผู้จ่ายเงิน</p>
            <p style={{ margin: '0.2rem 0 0', fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>({form.customerName || 'ผู้รับเอกสาร'})</p>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: '#64748b' }}>วันที่ ..... / ..... / .........</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoice;
