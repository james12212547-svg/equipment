import React, { useState, useMemo } from 'react';
import { ArrowLeft, Zap, Plus, Trash2, Calculator, Printer, CheckCircle, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TARIFF_TYPES } from '../constants/tariffRates';
import { useLocalStorage } from '../hooks/useLocalStorage';

const APPLIANCE_PRESETS = [
  { id: 'water_pump_agri', name: 'ปั๊มน้ำไฟฟ้าการเกษตร 3 แรงม้า (2,200W / 3HP)', watts: 2200, icon: '🌾', category: 'เกษตรกรรม' },
  { id: 'water_pump_home', name: 'ปั๊มน้ำบ้านอัตโนมัติ (400W)', watts: 400, icon: '💧', category: 'ปั๊มน้ำ & เครื่องกล' },
  { id: 'water_heater', name: 'เครื่องทำน้ำอุ่น (4,500W)', watts: 4500, icon: '🚿', category: 'เครื่องใช้ในบ้าน' },
  { id: 'ev_charger', name: 'เครื่องชาร์จรถไฟฟ้า EV Wallbox (7,400W / 7.4kW)', watts: 7400, icon: '🚗', category: 'ยานยนต์ไฟฟ้า' },
  { id: 'fridge', name: 'ตู้เย็น 2 ประตู (180W)', watts: 180, icon: '🧊', category: 'เครื่องใช้ในบ้าน' },
  { id: 'commercial_freezer', name: 'ตู้แช่แข็งสินค้า / ร้านค้า (800W)', watts: 800, icon: '❄️', category: 'ร้านค้า & ธุรกิจ' },
  { id: 'bulb_led', name: 'หลอดไฟ LED (18W)', watts: 18, icon: '💡', category: 'แสงสว่าง' },
  { id: 'fan', name: 'พัดลมตั้งโต๊ะ / แขวน (75W)', watts: 75, icon: '🌀', category: 'เครื่องใช้ในบ้าน' },
  { id: 'computer', name: 'คอมพิวเตอร์ทำงาน / พีซี (350W)', watts: 350, icon: '💻', category: 'ไอที & ออฟฟิศ' },
  { id: 'tv', name: 'สมาร์ททีวี LED (150W)', watts: 150, icon: '📺', category: 'เครื่องใช้ในบ้าน' },
  { id: 'custom', name: '⚙️ กำหนดชื่ออุปกรณ์และวัตต์เอง (Custom)', watts: 1000, icon: '⚙️', category: 'กำหนดเอง' }
];

const ApplianceCostCalculator = ({ projectId, isReadOnly = false }) => {
  const navigate = useNavigate();
  const keyPrefix = projectId ? `applianceCost_${projectId}_` : 'applianceCost_';

  const [items, setItems] = useLocalStorage(keyPrefix + 'items', [
    { id: 1, name: 'ปั๊มน้ำไฟฟ้าการเกษตร 3HP', watts: 2200, qty: 1, hours: 6, presetId: 'water_pump_agri' },
    { id: 2, name: 'หลอดไฟ LED ส่องสว่าง', watts: 18, qty: 10, hours: 10, presetId: 'bulb_led' }
  ]);

  const [addMode, setAddMode] = useState('preset'); // 'preset' or 'custom'
  const [selectedPreset, setSelectedPreset] = useState('water_pump_agri');
  const [customName, setCustomName] = useState('');
  const [customWatts, setCustomWatts] = useState(1000);
  const [powerUnit, setPowerUnit] = useState('W');
  const [customQty, setCustomQty] = useState(1);
  const [customHours, setCustomHours] = useState(8);

  const [userTypeId, setUserTypeId] = useLocalStorage(keyPrefix + 'userTypeId', 2);
  const [rateType, setRateType] = useLocalStorage(keyPrefix + 'rateType', 'normal');
  const [hoursOnPeak, setHoursOnPeak] = useState(4);
  const [hoursOffPeak, setHoursOffPeak] = useState(4);

  const selectedTariff = TARIFF_TYPES.find(t => t.id === Number(userTypeId)) || TARIFF_TYPES[0];

  const handleAddPreset = () => {
    let newItem;
    if (addMode === 'custom') {
      const w = powerUnit === 'kW' ? (Number(customWatts) || 1) * 1000 : (Number(customWatts) || 100);
      newItem = {
        id: Date.now(),
        name: customName.trim() || 'อุปกรณ์ไฟฟ้าทั่วไป',
        watts: Math.round(w),
        qty: Math.max(1, Number(customQty) || 1),
        hours: Math.max(0.1, Number(customHours) || 1),
        presetId: 'custom'
      };
    } else {
      const preset = APPLIANCE_PRESETS.find(p => p.id === selectedPreset);
      if (!preset) return;
      newItem = {
        id: Date.now(),
        name: preset.name,
        watts: preset.watts,
        qty: Math.max(1, Number(customQty) || 1),
        hours: Math.max(0.1, Number(customHours) || 1),
        presetId: preset.id
      };
    }

    setItems([...items, newItem]);
    if (addMode === 'custom') {
      setCustomName('');
    }
  };

  const handleRemoveItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleUpdateItem = (id, field, value) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const summary = useMemo(() => {
    const daysInMonth = 30;

    let totalDailyKwh = 0;
    const itemBreakdown = items.map(item => {
      const dailyKwh = (item.watts * item.qty * item.hours) / 1000;
      const monthlyKwh = dailyKwh * daysInMonth;
      totalDailyKwh += dailyKwh;

      let estimatedCostMonthly = 0;
      if (rateType === 'normal') {
        estimatedCostMonthly = monthlyKwh * (selectedTariff.rates.normal || 4.42);
      } else if (rateType === 'tou' && selectedTariff.rates.tou) {
        const totalHours = Math.max(1, item.hours);
        const onPeakRatio = Math.min(1, hoursOnPeak / totalHours);
        const offPeakRatio = 1 - onPeakRatio;
        const avgRate = (selectedTariff.rates.tou.onPeak * onPeakRatio) + (selectedTariff.rates.tou.offPeak * offPeakRatio);
        estimatedCostMonthly = monthlyKwh * avgRate;
      }

      return {
        ...item,
        dailyKwh: dailyKwh.toFixed(2),
        monthlyKwh: monthlyKwh.toFixed(2),
        estimatedCostMonthly: estimatedCostMonthly.toFixed(2)
      };
    });

    const totalMonthlyKwh = totalDailyKwh * daysInMonth;
    let totalMonthlyCost = 0;

    if (rateType === 'normal') {
      totalMonthlyCost = totalMonthlyKwh * (selectedTariff.rates.normal || 4.42);
    } else if (rateType === 'tou' && selectedTariff.rates.tou) {
      const onPeakKwh = (totalMonthlyKwh * (hoursOnPeak / Math.max(1, hoursOnPeak + hoursOffPeak)));
      const offPeakKwh = (totalMonthlyKwh * (hoursOffPeak / Math.max(1, hoursOnPeak + hoursOffPeak)));
      totalMonthlyCost = (onPeakKwh * selectedTariff.rates.tou.onPeak) + (offPeakKwh * selectedTariff.rates.tou.offPeak);
    }

    return {
      totalDailyKwh: totalDailyKwh.toFixed(2),
      totalMonthlyKwh: totalMonthlyKwh.toFixed(2),
      totalMonthlyCost: totalMonthlyCost.toFixed(2),
      totalYearlyCost: (totalMonthlyCost * 12).toFixed(2),
      itemBreakdown
    };
  }, [items, selectedTariff, rateType, hoursOnPeak, hoursOffPeak]);

  const inputStyle = { width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: isReadOnly ? '0' : '3rem' }}>
      
      {/* Header */}
      {!isReadOnly && (
        <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '0.5rem' }}>
            <ArrowLeft size={24} />
          </button>
          <div style={{ flex: 1 }}>
            <h1 className="text-gradient-solar" style={{ marginBottom: 0, fontSize: '2rem' }}>โปรแกรมคำนวณค่าไฟฟ้าอุปกรณ์ทุกชนิด</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Universal Electrical Appliance Energy & Cost Calculator (PEA/MEA Tariffs)</p>
          </div>
          <button onClick={() => window.print()} style={{ background: 'var(--accent-secondary)', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Printer size={20} /> พิมพ์ใบรายงาน PDF
          </button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem' }}>
        
        {/* LEFT COLUMN: CONTROLS & ADD ITEM */}
        <div className="equipment-card no-print" style={{ padding: '1.75rem' }}>
          <h3 style={{ margin: '0 0 1.25rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Zap size={22} className="text-solar" /> เลือกประเภทผู้ใช้ไฟฟ้า & อัตราค่าไฟ
          </h3>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>ประเภทผู้ใช้ไฟ (PEA/MEA)</label>
            <select value={userTypeId} onChange={(e) => setUserTypeId(Number(e.target.value))} style={inputStyle}>
              {TARIFF_TYPES.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>ลักษณะมิเตอร์ (Meter Rate)</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => setRateType('normal')} style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', border: rateType === 'normal' ? '2px solid var(--accent-solar)' : '1px solid var(--border-color)', background: rateType === 'normal' ? 'rgba(245, 158, 11, 0.15)' : 'var(--bg-primary)', color: rateType === 'normal' ? 'var(--accent-solar)' : 'var(--text-secondary)', fontWeight: 'bold', cursor: 'pointer' }}>
                อัตราปกติ (~฿{selectedTariff.rates.normal}/หน่วย)
              </button>
              {selectedTariff.rates.tou && (
                <button onClick={() => setRateType('tou')} style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', border: rateType === 'tou' ? '2px solid var(--accent-solar)' : '1px solid var(--border-color)', background: rateType === 'tou' ? 'rgba(245, 158, 11, 0.15)' : 'var(--bg-primary)', color: rateType === 'tou' ? 'var(--accent-solar)' : 'var(--text-secondary)', fontWeight: 'bold', cursor: 'pointer' }}>
                  อัตรา TOU
                </button>
              )}
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', marginBottom: '1.25rem' }}>
            <h4 style={{ margin: '0 0 1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Plus size={18} className="text-solar" /> เพิ่มอุปกรณ์ไฟฟ้าเข้าตารางคำนวณ
            </h4>

            {/* Mode Switcher Buttons */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <button 
                onClick={() => setAddMode('preset')} 
                style={{ 
                  flex: 1, 
                  padding: '0.6rem 0.5rem', 
                  borderRadius: '8px', 
                  border: addMode === 'preset' ? '2px solid var(--accent-solar)' : '1px solid var(--border-color)', 
                  background: addMode === 'preset' ? 'rgba(245, 158, 11, 0.15)' : 'var(--bg-primary)', 
                  color: addMode === 'preset' ? 'var(--accent-solar)' : 'var(--text-secondary)', 
                  fontWeight: addMode === 'preset' ? 'bold' : 'normal', 
                  cursor: 'pointer',
                  fontSize: '0.85rem'
                }}
              >
                📦 เลือกจากสำเร็จรูป
              </button>
              <button 
                onClick={() => setAddMode('custom')} 
                style={{ 
                  flex: 1, 
                  padding: '0.6rem 0.5rem', 
                  borderRadius: '8px', 
                  border: addMode === 'custom' ? '2px solid var(--accent-solar)' : '1px solid var(--border-color)', 
                  background: addMode === 'custom' ? 'rgba(245, 158, 11, 0.15)' : 'var(--bg-primary)', 
                  color: addMode === 'custom' ? 'var(--accent-solar)' : 'var(--text-secondary)', 
                  fontWeight: addMode === 'custom' ? 'bold' : 'normal', 
                  cursor: 'pointer',
                  fontSize: '0.85rem'
                }}
              >
                ✍️ กรอกอุปกรณ์ใหม่เอง
              </button>
            </div>

            {addMode === 'preset' ? (
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>เลือกรายการอุปกรณ์สำเร็จรูป</label>
                <select value={selectedPreset} onChange={(e) => setSelectedPreset(e.target.value)} style={inputStyle}>
                  {APPLIANCE_PRESETS.filter(p => p.id !== 'custom').map(p => (
                    <option key={p.id} value={p.id}>{p.icon} {p.name}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ marginBottom: '0.85rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>ชื่ออุปกรณ์ไฟฟ้าที่คุณต้องการเพิ่ม</label>
                  <input value={customName} onChange={(e) => setCustomName(e.target.value)} placeholder="เช่น เครื่องปั่นผลไม้, มอเตอร์ 5 แรง, ตู้เชื่อม" style={inputStyle} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '0.5rem', marginBottom: '0.85rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>กำลังไฟฟ้า</label>
                    <input type="number" min="1" value={customWatts} onChange={(e) => setCustomWatts(e.target.value)} placeholder="เช่น 1500" style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>หน่วยกำลังไฟ</label>
                    <select value={powerUnit} onChange={(e) => setPowerUnit(e.target.value)} style={inputStyle}>
                      <option value="W">วัตต์ (W)</option>
                      <option value="kW">กิโลวัตต์ (kW)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>จำนวน (เครื่อง/ดวง)</label>
                <input type="number" min="1" value={customQty} onChange={(e) => setCustomQty(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>เปิดใช้งาน (ชม./วัน)</label>
                <input type="number" min="0.5" max="24" step="0.5" value={customHours} onChange={(e) => setCustomHours(e.target.value)} style={inputStyle} />
              </div>
            </div>

            <button onClick={handleAddPreset} style={{ width: '100%', padding: '0.8rem', background: 'var(--accent-solar)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
              <Plus size={18} /> {addMode === 'preset' ? 'เพิ่มอุปกรณ์เข้าตาราง' : '➕ เพิ่มอุปกรณ์ใหม่เข้าตารางคำนวณ'}
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: APPLIANCE LIST & COST SUMMARY */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* TOTAL COST GRAND SUMMARY CARD */}
          <div className="equipment-card" style={{ padding: '1.75rem', border: '2px solid var(--accent-solar)', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Calculator size={18} className="text-solar" /> สรุปค่าไฟฟ้าอุปกรณ์รวมทั้งหมด ({summary.itemBreakdown.length} รายการ)
              </span>
              <span style={{ padding: '0.3rem 0.75rem', borderRadius: '50px', background: 'rgba(245, 158, 11, 0.2)', color: 'var(--accent-solar)', fontSize: '0.8rem', fontWeight: 'bold' }}>
                {selectedTariff.name}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', textAlign: 'center' }}>
              <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>ค่าไฟประมาณการ / เดือน</p>
                <p style={{ margin: '0.3rem 0 0', fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent-solar)' }}>
                  ฿{Number(summary.totalMonthlyCost).toLocaleString()}
                </p>
              </div>

              <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>หน่วยไฟฟ้า / เดือน (kWh)</p>
                <p style={{ margin: '0.3rem 0 0', fontSize: '1.6rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                  {summary.totalMonthlyKwh} <span style={{ fontSize: '0.9rem', color: 'var(--text-tertiary)' }}>หน่วย</span>
                </p>
              </div>

              <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>ค่าไฟประมาณการ / ปี</p>
                <p style={{ margin: '0.3rem 0 0', fontSize: '1.6rem', fontWeight: 'bold', color: '#10b981' }}>
                  ฿{Number(summary.totalYearlyCost).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* ITEM LIST TABLE */}
          <div className="equipment-card" style={{ padding: '1.5rem' }}>
            <h4 style={{ margin: '0 0 1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle size={20} color="#10b981" /> รายการอุปกรณ์ไฟฟ้าที่คำนวณ
            </h4>

            {summary.itemBreakdown.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-tertiary)' }}>
                <Info size={36} style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
                <p style={{ margin: 0 }}>ยังไม่มีรายการอุปกรณ์ กรุณาเพิ่มอุปกรณ์จากเมนูด้านซ้าย</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                      <th style={{ padding: '0.6rem 0.5rem' }}>อุปกรณ์</th>
                      <th style={{ padding: '0.6rem 0.5rem', textAlign: 'center' }}>กำลังไฟ</th>
                      <th style={{ padding: '0.6rem 0.5rem', textAlign: 'center' }}>จำนวน</th>
                      <th style={{ padding: '0.6rem 0.5rem', textAlign: 'center' }}>ชม./วัน</th>
                      <th style={{ padding: '0.6rem 0.5rem', textAlign: 'right' }}>หน่วย/เดือน</th>
                      <th style={{ padding: '0.6rem 0.5rem', textAlign: 'right' }}>ค่าไฟ/เดือน</th>
                      <th style={{ padding: '0.6rem 0.5rem', textAlign: 'center' }} className="no-print">ลบ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.itemBreakdown.map((item) => (
                      <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '0.75rem 0.5rem', fontWeight: 'bold' }}>{item.name}</td>
                        <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>{item.watts} W</td>
                        <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>
                          <input type="number" min="1" value={item.qty} onChange={(e) => handleUpdateItem(item.id, 'qty', Number(e.target.value))} style={{ width: '45px', textAlign: 'center', padding: '0.2rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
                        </td>
                        <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>
                          <input type="number" min="0.5" max="24" step="0.5" value={item.hours} onChange={(e) => handleUpdateItem(item.id, 'hours', Number(e.target.value))} style={{ width: '50px', textAlign: 'center', padding: '0.2rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
                        </td>
                        <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: 'var(--text-secondary)' }}>{item.monthlyKwh} kWh</td>
                        <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', fontWeight: 'bold', color: 'var(--accent-solar)' }}>฿{Number(item.estimatedCostMonthly).toLocaleString()}</td>
                        <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }} className="no-print">
                          <button onClick={() => handleRemoveItem(item.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.2rem' }}>
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default ApplianceCostCalculator;
