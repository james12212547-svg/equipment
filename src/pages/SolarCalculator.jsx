import React, { useState, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { ArrowLeft, Calculator, TrendingUp, Printer, Sun, Zap, Sliders, ShieldAlert, CheckCircle, Leaf, Trees } from 'lucide-react';
import { AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { calculateSolarRoi } from '../utils/engineering/solarRoi';

// ─── Tooltip Component ─────────────────────────────────────────────────────────
const InfoTooltip = ({ text }) => {
  const [show, setShow] = useState(false);
  return (
    <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', marginLeft: '0.3rem' }}>
      <span
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: '16px', height: '16px', borderRadius: '50%',
          background: 'rgba(255,165,0,0.2)', border: '1px solid rgba(255,165,0,0.5)',
          color: 'var(--accent-solar)', fontSize: '10px', fontWeight: 'bold',
          cursor: 'help', flexShrink: 0, lineHeight: 1
        }}
      >?
      </span>
      {show && (
        <span style={{
          position: 'absolute', bottom: '120%', left: '50%', transform: 'translateX(-50%)',
          background: '#1a1d24', border: '1px solid rgba(255,165,0,0.3)',
          color: 'var(--text-primary)', padding: '0.6rem 0.8rem',
          borderRadius: '8px', fontSize: '0.8rem', lineHeight: '1.5',
          whiteSpace: 'pre-wrap', width: '240px', zIndex: 9999,
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          pointerEvents: 'none'
        }}>
          {text}
          <span style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', borderWidth: '5px', borderStyle: 'solid', borderColor: 'rgba(255,165,0,0.3) transparent transparent transparent' }} />
        </span>
      )}
    </span>
  );
};

// ─── Province PSH Data ─────────────────────────────────────────────────────────
const PROVINCE_PSH = [
  { region: '── ภาคเหนือ ──', disabled: true },
  { label: 'เชียงใหม่', psh: 4.2 },
  { label: 'เชียงราย', psh: 4.0 },
  { label: 'ลำปาง', psh: 4.1 },
  { label: 'พิษณุโลก', psh: 4.3 },
  { label: 'แม่ฮ่องสอน', psh: 4.3 },
  { region: '── ภาคตะวันออกเฉียงเหนือ ──', disabled: true },
  { label: 'ขอนแก่น', psh: 4.5 },
  { label: 'อุดรธานี', psh: 4.4 },
  { label: 'นครราชสีมา', psh: 4.5 },
  { label: 'อุบลราชธานี', psh: 4.6 },
  { label: 'บึงกาฬ', psh: 4.4 },
  { region: '── ภาคกลาง ──', disabled: true },
  { label: 'กรุงเทพมหานคร', psh: 4.5 },
  { label: 'นนทบุรี', psh: 4.5 },
  { label: 'ปทุมธานี', psh: 4.5 },
  { label: 'นครปฐม', psh: 4.4 },
  { label: 'พระนครศรีอยุธยา', psh: 4.4 },
  { label: 'สระบุรี', psh: 4.4 },
  { region: '── ภาคตะวันออก ──', disabled: true },
  { label: 'ชลบุรี', psh: 4.3 },
  { label: 'ระยอง', psh: 4.4 },
  { label: 'จันทบุรี', psh: 4.2 },
  { label: 'ตราด', psh: 4.1 },
  { region: '── ภาคตะวันตก ──', disabled: true },
  { label: 'กาญจนบุรี', psh: 4.3 },
  { label: 'ตาก', psh: 4.2 },
  { label: 'ราชบุรี', psh: 4.3 },
  { region: '── ภาคใต้ ──', disabled: true },
  { label: 'ชุมพร', psh: 4.2 },
  { label: 'สุราษฎร์ธานี', psh: 4.2 },
  { label: 'นครศรีธรรมราช', psh: 4.1 },
  { label: 'กระบี่', psh: 4.0 },
  { label: 'ภูเก็ต', psh: 4.0 },
  { label: 'สงขลา', psh: 4.1 },
  { label: 'พัทลุง', psh: 4.1 },
  { label: 'ระนอง', psh: 3.8 },
  { label: 'ปัตตานี', psh: 4.0 },
  { label: 'ยะลา', psh: 4.0 },
  { label: 'นราธิวาส', psh: 3.9 },
];

const InvestmentChart = ({ result }) => {
  const [returnRate, setReturnRate] = useState(5);
  const [years, setYears] = useState(25);

  const data = useMemo(() => {
    const arr = [];
    let compounded = 0;
    const rate = returnRate / 100;
    
    for (let y = 0; y <= years; y++) {
      if (y === 0) {
        arr.push({ year: y, "กำไรทบต้น (โซลาร์ + DCA)": 0, "ค่าเสียโอกาส (ลงทุนเงินก้อน)": result.estimatedCost, "เงินลงทุนเริ่มแรก": result.estimatedCost });
      } else {
        const inflationMultiplier = Math.pow(1 + result.elecInflation, y - 1);
        const degradationMultiplier = Math.pow(1 - result.degradationRate, y - 1);
        const currentYearSavings = (result.actualSavingsPerMonth * 12) * inflationMultiplier * degradationMultiplier;
        
        let currentYearCost = result.annualCleaningCost;
        if (y === 10) currentYearCost += result.inverterReplacementCost;
        
        const netCashFlow = currentYearSavings - currentYearCost;
        compounded = (compounded + netCashFlow) * (1 + rate);
        const opportunityCost = result.estimatedCost * Math.pow(1 + rate, y);
        
        arr.push({ 
          year: y, 
          "กำไรทบต้น (โซลาร์ + DCA)": Math.round(compounded),
          "ค่าเสียโอกาส (ลงทุนเงินก้อน)": Math.round(opportunityCost),
          "เงินลงทุนเริ่มแรก": result.estimatedCost 
        });
      }
    }
    return arr;
  }, [result, returnRate, years]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', padding: '1rem', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
          <p style={{ margin: '0 0 0.5rem', fontWeight: 'bold' }}>ปีที่ {label}</p>
          {payload.map((entry, index) => (
            <p key={`item-${index}`} style={{ color: entry.color, margin: '0.25rem 0', fontSize: '0.9rem' }}>
              {entry.name}: {entry.value.toLocaleString()} ฿
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ marginTop: '1.5rem', padding: '1.75rem', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={20} color="var(--accent-solar)" /> กราฟกระแสเงินสด & จุดคุ้มทุน 25 ปี (Opportunity Cost)
          </h3>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            เปรียบเทียบระหว่าง "ติดโซลาร์เซลล์แล้วเอาค่าไฟประหยัดไป DCA" VS "ไม่ติดโซลาร์"
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>ผลตอบแทนลงทุน (%/ปี)</label>
            <input 
              type="number" 
              value={returnRate} 
              onChange={e => setReturnRate(Number(e.target.value))}
              style={{ width: '85px', padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
            />
          </div>
        </div>
      </div>
      
      <div style={{ width: '100%', height: '320px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCompounded" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorOppCost" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
            <XAxis dataKey="year" stroke="var(--text-tertiary)" tick={{ fill: 'var(--text-tertiary)' }} />
            <YAxis stroke="var(--text-tertiary)" tick={{ fill: 'var(--text-tertiary)' }} tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`} width={50} />
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ paddingBottom: '1rem' }} />
            <Area type="monotone" dataKey="ค่าเสียโอกาส (ลงทุนเงินก้อน)" stroke="#f59e0b" fillOpacity={1} fill="url(#colorOppCost)" strokeWidth={2} />
            <Area type="monotone" dataKey="กำไรทบต้น (โซลาร์ + DCA)" stroke="#10b981" fillOpacity={1} fill="url(#colorCompounded)" strokeWidth={3} />
            <Line type="monotone" dataKey="เงินลงทุนเริ่มแรก" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const SolarCalculator = ({ projectId, isReadOnly = false }) => {
  const navigate = useNavigate();
  const keyPrefix = projectId ? `solar_${projectId}_` : 'solar_';

  const [calcMode, setCalcMode] = useLocalStorage(keyPrefix + 'calcMode', 'bill');
  const [inputValue, setInputValue] = useLocalStorage(keyPrefix + 'inputValue', '');
  const [province, setProvince] = useLocalStorage(keyPrefix + 'province', 'กรุงเทพมหานคร');
  const [dayUsageRatio, setDayUsageRatio] = useLocalStorage(keyPrefix + 'dayUsageRatio', 60);
  const [systemType, setSystemType] = useLocalStorage(keyPrefix + 'systemType', 'on_grid');
  
  // Advanced Settings State
  const [isAdvanced, setIsAdvanced] = useState(false);
  const [inflationRate, setInflationRate] = useLocalStorage(keyPrefix + 'inflationRate', 3);
  const [customCost, setCustomCost] = useLocalStorage(keyPrefix + 'customCost', '');
  const [enableFit, setEnableFit] = useLocalStorage(keyPrefix + 'enableFit', true);
  const [fitRate, setFitRate] = useLocalStorage(keyPrefix + 'fitRate', 2.20);
  const [prRate, setPrRate] = useLocalStorage(keyPrefix + 'prRate', 0.80);

  const [result, setResult] = useLocalStorage(keyPrefix + 'result', null);

  const selectedPSH = PROVINCE_PSH.find(p => p.label === province)?.psh ?? 4.5;

  const calculateROI = (e) => {
    e.preventDefault();
    const calculationResult = calculateSolarRoi(calcMode, inputValue, {
      inflationRate,
      psh: selectedPSH,
      dayUsageRatio,
      systemType,
      customCost,
      enableFit,
      fitRate,
      prRate
    });

    if (!calculationResult) {
      toast.error('กรุณากรอกตัวเลขให้ถูกต้อง (มากกว่า 0)');
      return;
    }
    setResult(calculationResult);
  };

  const inputStyle = { width: '100%', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none', fontSize: '1rem' };

  return (
    <div className={`animate-fade-in ${isReadOnly ? 'print-only' : ''}`} style={{ paddingBottom: isReadOnly ? '0' : '2rem' }}>
      
      {!isReadOnly && (
        <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '0.5rem' }}>
            <ArrowLeft size={24} />
          </button>
          <div style={{ flex: 1 }}>
            <h1 className="text-gradient-solar" style={{ marginBottom: 0, fontSize: '2rem' }}>ประเมินจุดคุ้มทุนโซลาร์เซลล์ (Advanced Solar ROI)</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Solar ROI & System Sizing Calculator with Day/Night Load & ESG Carbon Offset</p>
          </div>
          <button onClick={() => window.print()} style={{ background: 'var(--accent-secondary)', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Printer size={20} /> พิมพ์เป็น PDF
          </button>
        </div>
      )}

      <div className={`print-block ${isReadOnly ? "" : "grid-2"}`} style={{ alignItems: 'flex-start', display: isReadOnly ? 'block' : 'grid' }}>
        
        {/* INPUT CONTROLS */}
        {!isReadOnly && (
          <div className="equipment-card no-print" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Mode Switcher Tabs (High-Contrast Active State) */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <button 
                onClick={() => { setCalcMode('bill'); setResult(null); setInputValue(''); }}
                style={{
                  flex: 1, minHeight: '85px', padding: '0.75rem', borderRadius: '10px',
                  border: calcMode === 'bill' ? '2px solid #f59e0b' : '1px solid var(--border-color)',
                  background: calcMode === 'bill' ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.25) 0%, rgba(245, 158, 11, 0.1) 100%)' : 'var(--bg-tertiary)',
                  color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.3rem',
                  boxShadow: calcMode === 'bill' ? '0 0 15px rgba(245, 158, 11, 0.3)' : 'none',
                  fontWeight: calcMode === 'bill' ? 'bold' : 'normal', transition: 'all 0.2s'
                }}
              >
                <span style={{ fontSize: '1.5rem' }}>⚡</span>
                <span style={{ fontSize: '0.9rem' }}>คำนวณจากค่าไฟ<br/><span style={{ fontSize: '0.8em', color: calcMode === 'bill' ? '#f59e0b' : 'var(--text-secondary)' }}>(บาท/เดือน)</span></span>
              </button>

              <button 
                onClick={() => { setCalcMode('load'); setResult(null); setInputValue(''); }}
                style={{
                  flex: 1, minHeight: '85px', padding: '0.75rem', borderRadius: '10px',
                  border: calcMode === 'load' ? '2px solid #f59e0b' : '1px solid var(--border-color)',
                  background: calcMode === 'load' ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.25) 0%, rgba(245, 158, 11, 0.1) 100%)' : 'var(--bg-tertiary)',
                  color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.3rem',
                  boxShadow: calcMode === 'load' ? '0 0 15px rgba(245, 158, 11, 0.3)' : 'none',
                  fontWeight: calcMode === 'load' ? 'bold' : 'normal', transition: 'all 0.2s'
                }}
              >
                <span style={{ fontSize: '1.5rem' }}>☀️</span>
                <span style={{ fontSize: '0.9rem' }}>คำนวณจากโหลด<br/><span style={{ fontSize: '0.8em', color: calcMode === 'load' ? '#f59e0b' : 'var(--text-secondary)' }}>(kWh/วัน)</span></span>
              </button>
            </div>

            <form onSubmit={calculateROI} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label style={{ color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 'bold' }}>
                    {calcMode === 'bill' ? 'ค่าไฟเฉลี่ยต่อเดือน (บาท)' : 'การใช้พลังงานเป้าหมาย (kWh/วัน)'}
                  </label>
                  <Link to="/learning/appliance-cost" style={{ fontSize: '0.8rem', color: 'var(--accent-solar)', textDecoration: 'none', fontWeight: 'bold' }}>
                    ⚡ ช่วยคำนวณโหลดจากอุปกรณ์ →
                  </Link>
                </div>
                <input 
                  type="number" 
                  step={calcMode === 'load' ? '0.01' : '1'}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={calcMode === 'bill' ? 'เช่น 3500' : 'เช่น 53.92'}
                  style={inputStyle}
                  required
                />
              </div>

              {/* Day / Night Ratio Slider */}
              <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>
                    สัดส่วนการใช้ไฟ กลางวัน vs กลางคืน
                    <InfoTooltip text={'ระบบ On-Grid ผลิตไฟได้เฉพาะกลางวัน\nสัดส่วนไฟกลางวันที่ใช้จริงส่งผลต่อผลประหยัด\n- ออฟฟิศ: กลางวัน 80% / กลางคืน 20%\n- บ้านทั่วไป: กลางวัน 50% / กลางคืน 50%'} />
                  </label>
                  <span style={{ fontSize: '0.85rem', color: 'var(--accent-solar)', fontWeight: 'bold' }}>
                    ☀️ กลางวัน {dayUsageRatio}% | 🌙 กลางคืน {100 - dayUsageRatio}%
                  </span>
                </div>
                <input 
                  type="range" min="20" max="100" step="5" 
                  value={dayUsageRatio} onChange={(e) => setDayUsageRatio(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--accent-solar)', cursor: 'pointer' }} 
                />
                <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.6rem' }}>
                  <button type="button" onClick={() => setDayUsageRatio(80)} style={{ flex: 1, padding: '0.3rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: dayUsageRatio === 80 ? 'rgba(245, 158, 11, 0.2)' : 'transparent', color: dayUsageRatio === 80 ? 'var(--accent-solar)' : 'var(--text-secondary)', fontSize: '0.75rem', cursor: 'pointer' }}>🏢 ออฟฟิศ (80/20)</button>
                  <button type="button" onClick={() => setDayUsageRatio(50)} style={{ flex: 1, padding: '0.3rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: dayUsageRatio === 50 ? 'rgba(245, 158, 11, 0.2)' : 'transparent', color: dayUsageRatio === 50 ? 'var(--accent-solar)' : 'var(--text-secondary)', fontSize: '0.75rem', cursor: 'pointer' }}>🏠 บ้านพัก (50/50)</button>
                  <button type="button" onClick={() => setDayUsageRatio(70)} style={{ flex: 1, padding: '0.3rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: dayUsageRatio === 70 ? 'rgba(245, 158, 11, 0.2)' : 'transparent', color: dayUsageRatio === 70 ? 'var(--accent-solar)' : 'var(--text-secondary)', fontSize: '0.75rem', cursor: 'pointer' }}>❄️ ร้านค้า/แอร์ (70/30)</button>
                </div>
              </div>

              {/* Province / PSH Selector */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  📍 จังหวัด / ชั่วโมงแดด (Peak Sun Hours)
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.75rem', alignItems: 'center' }}>
                  <select
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    style={inputStyle}
                  >
                    {PROVINCE_PSH.map((item, i) =>
                      item.disabled
                        ? <option key={i} disabled style={{ color: 'var(--text-tertiary)', fontStyle: 'italic' }}>{item.region}</option>
                        : <option key={i} value={item.label}>{item.label}</option>
                    )}
                  </select>
                  <div style={{ background: 'rgba(255,165,0,0.1)', border: '1px solid rgba(255,165,0,0.4)', borderRadius: '8px', padding: '0.5rem 0.8rem', textAlign: 'center', whiteSpace: 'nowrap' }}>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', margin: 0 }}>PSH</p>
                    <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--accent-solar)', margin: 0 }}>{selectedPSH}</p>
                  </div>
                </div>
              </div>

              {/* System Type Selection */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>รูปแบบระบบ (System Type)</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="button" onClick={() => setSystemType('on_grid')} style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', border: systemType === 'on_grid' ? '2px solid var(--accent-solar)' : '1px solid var(--border-color)', background: systemType === 'on_grid' ? 'rgba(245, 158, 11, 0.15)' : 'var(--bg-primary)', color: systemType === 'on_grid' ? 'var(--accent-solar)' : 'var(--text-secondary)', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.82rem' }}>
                    ☀️ On-Grid (ไม่มีแบต)
                  </button>
                  <button type="button" onClick={() => setSystemType('hybrid')} style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', border: systemType === 'hybrid' ? '2px solid var(--accent-solar)' : '1px solid var(--border-color)', background: systemType === 'hybrid' ? 'rgba(245, 158, 11, 0.15)' : 'var(--bg-primary)', color: systemType === 'hybrid' ? 'var(--accent-solar)' : 'var(--text-secondary)', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.82rem' }}>
                    🔋 Hybrid (มีแบตเตอรี่)
                  </button>
                </div>
              </div>

              {/* Advanced Settings Expandable Toggle */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <button 
                  type="button" 
                  onClick={() => setIsAdvanced(!isAdvanced)} 
                  style={{ background: 'none', border: 'none', color: 'var(--accent-solar)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.4rem', padding: 0 }}
                >
                  <Sliders size={16} /> {isAdvanced ? '▲ ซ่อนตั้งค่าขั้นสูง (Advanced Settings)' : '▼ เปิดตั้งค่าขั้นสูง (PR, FIT, งบประมาณเฉพาะ)'}
                </button>

                {isAdvanced && (
                  <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>งบประมาณ/ราคาติดตั้งจริง (บาท) [เว้นว่างเพื่อประเมินอัตโนมัติ]</label>
                      <input type="number" value={customCost} onChange={(e) => setCustomCost(e.target.value)} placeholder="เช่น 140000" style={inputStyle} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>ประสิทธิภาพระบบ PR (%)</label>
                        <input type="number" step="0.01" value={prRate} onChange={(e) => setPrRate(e.target.value)} placeholder="0.80" style={inputStyle} />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>เงินเฟ้อค่าไฟ (%/ปี)</label>
                        <input type="number" step="0.1" value={inflationRate} onChange={(e) => setInflationRate(Number(e.target.value))} style={inputStyle} />
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--bg-primary)', borderRadius: '8px' }}>
                      <div>
                        <strong style={{ fontSize: '0.85rem', display: 'block' }}>ขายไฟคืน (Feed-in Tariff)</strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>รับซื้อไฟส่วนเกิน 2.20 บาท/หน่วย</span>
                      </div>
                      <input type="checkbox" checked={enableFit} onChange={(e) => setEnableFit(e.target.checked)} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                    </div>
                  </div>
                )}
              </div>
              
              <button 
                type="submit" 
                style={{ 
                  background: 'linear-gradient(135deg, #FFB75E 0%, #ED8F03 100%)', 
                  color: 'white', padding: '1rem', borderRadius: '8px', border: 'none', 
                  fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                }}
              >
                <Calculator size={20} /> ประเมินระบบ & คำนวณความคุ้มค่า
              </button>
            </form>
          </div>
        )}

        {/* RESULTS SECTION */}
        {result && (
          <div className="equipment-card animate-fade-in" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'rgba(255, 165, 0, 0.03)', border: '1px solid rgba(255, 165, 0, 0.2)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="text-gradient-solar" style={{ margin: 0, fontSize: '1.5rem' }}>ผลการประเมินออกแบบระบบโซลาร์เซลล์</h3>
              <span style={{ padding: '0.3rem 0.8rem', borderRadius: '50px', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', fontWeight: 'bold', fontSize: '0.85rem' }}>
                คืนทุนใน {result.paybackYears} ปี 🚀
              </span>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div style={{ background: 'var(--bg-tertiary)', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0 0 0.4rem' }}>ขนาดระบบที่แนะนำ</p>
                <p style={{ fontSize: '2.2rem', fontWeight: 'bold', color: 'var(--accent-solar)', margin: 0 }}>
                  {result.recommendedKW} <span style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>kWp</span>
                </p>
              </div>

              <div style={{ background: 'var(--bg-tertiary)', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0 0 0.4rem' }}>งบประมาณติดตั้งเบื้องต้น</p>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6', margin: 0 }}>
                  ฿{result.estimatedCost.toLocaleString()}
                </p>
              </div>

              <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '8px' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: 0 }}>จำนวนแผง ({result.panelWattage}W)</p>
                <p style={{ fontSize: '1.4rem', fontWeight: 'bold', margin: '0.2rem 0 0' }}>{result.numberOfPanels} <span style={{ fontSize: '0.9rem' }}>แผง</span></p>
              </div>

              <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '8px' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: 0 }}>พื้นที่หลังคาที่ต้องใช้</p>
                <p style={{ fontSize: '1.4rem', fontWeight: 'bold', margin: '0.2rem 0 0' }}>{result.requiredArea} <span style={{ fontSize: '0.9rem' }}>ตร.ม.</span></p>
              </div>

              <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '8px', gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', textAlign: 'center' }}>
                <div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: 0 }}>ประหยัดไฟโดยตรง (กลางวัน)</p>
                  <p style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#10b981', margin: '0.2rem 0 0' }}>฿{result.selfConsumedMonthlySavings.toLocaleString()}/เดือน</p>
                </div>
                <div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: 0 }}>รายได้ขายไฟคืนส่วนเกิน (FIT)</p>
                  <p style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#f59e0b', margin: '0.2rem 0 0' }}>฿{result.fitMonthlyRevenue.toLocaleString()}/เดือน</p>
                </div>
              </div>
            </div>

            {/* 🌱 ESG & Environmental Carbon Offset Card */}
            <div style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '12px', padding: '1.25rem' }}>
              <h4 style={{ margin: '0 0 0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
                <Leaf size={22} /> ผลกระทบด้านสิ่งแวดล้อม & คาร์บอนเครดิต (ESG Impact)
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--bg-primary)', padding: '0.85rem', borderRadius: '8px' }}>
                  <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '0.6rem', borderRadius: '50%', color: '#10b981' }}>
                    <Leaf size={24} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>ลดการปล่อยก๊าซ CO₂</p>
                    <p style={{ margin: '0.2rem 0 0', fontSize: '1.25rem', fontWeight: 'bold', color: '#10b981' }}>{result.co2ReducedTonsPerYear} <span style={{ fontSize: '0.85rem' }}>ตัน/ปี</span></p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--bg-primary)', padding: '0.85rem', borderRadius: '8px' }}>
                  <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '0.6rem', borderRadius: '50%', color: '#10b981' }}>
                    <Trees size={24} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>เทียบเท่าปลูกต้นไม้</p>
                    <p style={{ margin: '0.2rem 0 0', fontSize: '1.25rem', fontWeight: 'bold', color: '#10b981' }}>{result.treesPlantedEquivalent} <span style={{ fontSize: '0.85rem' }}>ต้น/ปี</span></p>
                  </div>
                </div>
              </div>
            </div>

            {/* Investment Opportunity Cost Chart */}
            <InvestmentChart result={result} />
          </div>
        )}
      </div>
    </div>
  );
};

export default SolarCalculator;
