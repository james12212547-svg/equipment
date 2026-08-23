import React, { useState, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { 
  ArrowLeft, Calculator, TrendingUp, Printer, Sun, Zap, Sliders, 
  ShieldAlert, CheckCircle, Leaf, Trees, Compass, CloudSun, Sparkles, 
  Home, Building2, Store, HelpCircle, Layers, Award, DollarSign
} from 'lucide-react';
import { 
  AreaChart, Area, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, Cell 
} from 'recharts';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  calculateSolarRoi, 
  ROOF_ORIENTATIONS, 
  SHADING_CONDITIONS, 
  SOILING_CONDITIONS, 
  SYSTEM_TYPES, 
  LIFESTYLE_PRESETS 
} from '../utils/engineering/solarRoi';

// ─── Info Tooltip ─────────────────────────────────────────────────────────────
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
          background: 'rgba(59, 130, 246, 0.2)', border: '1px solid rgba(59, 130, 246, 0.4)',
          color: '#3b82f6', fontSize: '10px', fontWeight: 'bold',
          cursor: 'help', flexShrink: 0, lineHeight: 1
        }}
      >?
      </span>
      {show && (
        <span style={{
          position: 'absolute', bottom: '120%', left: '50%', transform: 'translateX(-50%)',
          background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
          color: 'var(--text-primary)', padding: '0.6rem 0.8rem',
          borderRadius: '8px', fontSize: '0.8rem', lineHeight: '1.5',
          whiteSpace: 'pre-wrap', width: '250px', zIndex: 9999,
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)', pointerEvents: 'none'
        }}>
          {text}
          <span style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', borderWidth: '5px', borderStyle: 'solid', borderColor: 'var(--border-color) transparent transparent transparent' }} />
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

// ─── Investment Chart Component ───────────────────────────────────────────────
const InvestmentChart = ({ result }) => {
  const [returnRate, setReturnRate] = useState(5);
  const [years, setYears] = useState(25);

  const data = useMemo(() => {
    const arr = [];
    let compounded = 0;
    const rate = returnRate / 100;
    
    for (let y = 0; y <= years; y++) {
      if (y === 0) {
        arr.push({ 
          year: y, 
          "กำไรทบต้น (โซลาร์ + DCA)": 0, 
          "ค่าเสียโอกาส (ลงทุนเงินก้อน)": result.estimatedCost, 
          "เงินลงทุนเริ่มแรก": result.estimatedCost 
        });
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
          <p style={{ margin: '0 0 0.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>ปีที่ {label}</p>
          {payload.map((entry, index) => (
            <p key={`item-${index}`} style={{ color: entry.color, margin: '0.25rem 0', fontSize: '0.85rem' }}>
              {entry.name}: {entry.value.toLocaleString()} ฿
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ marginTop: '1.5rem', padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
            <TrendingUp size={20} color="#10b981" /> กราฟกระแสเงินสด & จุดคุ้มทุน 25 ปี (Opportunity Cost)
          </h3>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
            เปรียบเทียบ "ติดโซลาร์แล้วนำค่าไฟที่ประหยัดไปออมทบต้น (DCA)" VS "ไม่ติดโซลาร์"
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>ผลตอบแทนออม (%/ปี):</label>
          <input 
            type="number" 
            value={returnRate} 
            onChange={e => setReturnRate(Number(e.target.value))}
            style={{ width: '70px', padding: '0.35rem 0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', textAlign: 'center' }}
          />
        </div>
      </div>
      
      <div style={{ width: '100%', height: '300px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 15, left: 0, bottom: 0 }}>
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
            <YAxis stroke="var(--text-tertiary)" tick={{ fill: 'var(--text-tertiary)' }} tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`} width={45} />
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ paddingBottom: '0.75rem', fontSize: '0.8rem' }} />
            <Area type="monotone" dataKey="ค่าเสียโอกาส (ลงทุนเงินก้อน)" stroke="#f59e0b" fillOpacity={1} fill="url(#colorOppCost)" strokeWidth={2} />
            <Area type="monotone" dataKey="กำไรทบต้น (โซลาร์ + DCA)" stroke="#10b981" fillOpacity={1} fill="url(#colorCompounded)" strokeWidth={3} />
            <Line type="monotone" dataKey="เงินลงทุนเริ่มแรก" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// ─── Loss Breakdown Waterfall Component ───────────────────────────────────────
const LossBreakdownView = ({ result }) => {
  const chartData = result.lossBreakdown.map(item => ({
    name: item.name.split(' (')[0],
    percent: item.percent,
    loss: item.loss,
    note: item.note
  }));

  return (
    <div style={{ marginTop: '1.5rem', padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
      <h3 style={{ margin: '0 0 0.5rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
        <Layers size={20} color="#3b82f6" /> แผนภาพแจกแจงการสูญเสียประสิทธิภาพ (Loss Breakdown Waterfall)
      </h3>
      <p style={{ margin: '0 0 1.25rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
        แสดงสเต็ปการสูญเสียจากแสงแดด 100% จนถึงประสิทธิภาพระบบจริง (PR) <strong style={{ color: '#3b82f6' }}>{result.prRate}%</strong>
      </p>

      <div style={{ width: '100%', height: '240px', marginBottom: '1.5rem' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
            <XAxis dataKey="name" stroke="var(--text-tertiary)" tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }} angle={-15} textAnchor="end" height={50} />
            <YAxis stroke="var(--text-tertiary)" domain={[0, 100]} tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }} />
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem' }}>
                      <strong style={{ color: 'var(--text-primary)' }}>{d.name}</strong>
                      <p style={{ margin: '0.25rem 0', color: '#3b82f6' }}>คงเหลือ: {d.percent}%</p>
                      {d.loss > 0 && <p style={{ margin: '0.25rem 0', color: '#ef4444' }}>การสูญเสีย: -{d.loss}%</p>}
                      <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{d.note}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="percent" radius={[6, 6, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#10b981' : index === 0 ? '#f59e0b' : '#3b82f6'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Engineering Financial Metrics Table */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>LCOE (ต้นทุนไฟที่ผลิตเอง)</p>
          <p style={{ margin: '0.25rem 0 0', fontSize: '1.3rem', fontWeight: 'bold', color: '#10b981' }}>
            ฿{result.lcoe} <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>/ kWh</span>
          </p>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>เทียบซื้อการไฟฟ้า ฿4.42/หน่วย</p>
        </div>

        <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>NPV (มูลค่าปัจจุบันสุทธิ 25 ปี)</p>
          <p style={{ margin: '0.25rem 0 0', fontSize: '1.3rem', fontWeight: 'bold', color: '#3b82f6' }}>
            ฿{result.npv.toLocaleString()}
          </p>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>อัตราคิดลด Discount Rate 5%</p>
        </div>

        <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>IRR (ผลตอบแทนภายใน)</p>
          <p style={{ margin: '0.25rem 0 0', fontSize: '1.3rem', fontWeight: 'bold', color: '#f59e0b' }}>
            {result.irr}%
          </p>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>สูงกว่าดอกเบี้ยเงินฝากธนาคาร</p>
        </div>
      </div>
    </div>
  );
};

// ─── Main Solar Calculator Component ──────────────────────────────────────────
const SolarCalculator = ({ projectId, isReadOnly = false }) => {
  const navigate = useNavigate();
  const keyPrefix = projectId ? `solar_${projectId}_` : 'solar_';

  // Basic Inputs
  const [calcMode, setCalcMode] = useLocalStorage(keyPrefix + 'calcMode', 'bill');
  const [inputValue, setInputValue] = useLocalStorage(keyPrefix + 'inputValue', '');
  const [province, setProvince] = useLocalStorage(keyPrefix + 'province', 'กรุงเทพมหานคร');
  const [lifestyle, setLifestyle] = useLocalStorage(keyPrefix + 'lifestyle', 'work_from_home');
  const [customDayRatio, setCustomDayRatio] = useLocalStorage(keyPrefix + 'customDayRatio', 60);

  // Environmental & System Factors
  const [roofOrientation, setRoofOrientation] = useLocalStorage(keyPrefix + 'roofOrientation', 'south');
  const [shading, setShading] = useLocalStorage(keyPrefix + 'shading', 'none');
  const [cleaning, setCleaning] = useLocalStorage(keyPrefix + 'cleaning', 'yearly');
  const [systemType, setSystemType] = useLocalStorage(keyPrefix + 'systemType', 'on_grid');

  // Advanced Mode State
  const [isAdvanced, setIsAdvanced] = useState(false);
  const [customCost, setCustomCost] = useLocalStorage(keyPrefix + 'customCost', '');
  const [inflationRate, setInflationRate] = useLocalStorage(keyPrefix + 'inflationRate', 3.0);
  const [enableFit, setEnableFit] = useLocalStorage(keyPrefix + 'enableFit', true);
  const [activeResultTab, setActiveResultTab] = useState('summary'); // 'summary' | 'engineering' | 'esg'

  const [result, setResult] = useLocalStorage(keyPrefix + 'result', null);

  const selectedPSH = PROVINCE_PSH.find(p => p.label === province)?.psh ?? 4.5;

  const calculateROI = (e) => {
    e.preventDefault();
    const calculationResult = calculateSolarRoi(calcMode, inputValue, {
      lifestyle,
      customDayRatio,
      psh: selectedPSH,
      roofOrientation,
      shading,
      cleaning,
      systemType,
      customCost,
      enableFit,
      inflationRate
    });

    if (!calculationResult) {
      toast.error('กรุณากรอกตัวเลขค่าไฟหรือหน่วยไฟฟ้าให้ถูกต้อง');
      return;
    }
    setResult(calculationResult);
  };

  const inputStyle = {
    width: '100%',
    padding: '0.85rem 1rem',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    background: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    outline: 'none',
    fontSize: '1rem'
  };

  return (
    <div className={`animate-fade-in ${isReadOnly ? 'print-only' : ''}`} style={{ paddingBottom: isReadOnly ? '0' : '2rem' }}>
      
      {!isReadOnly && (
        <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '0.5rem' }}>
            <ArrowLeft size={24} />
          </button>
          <div style={{ flex: 1 }}>
            <h1 style={{ marginBottom: '0.25rem', fontSize: '1.85rem', color: 'var(--text-primary)' }}>
              ประเมินขนาดและจุดคุ้มทุนโซลาร์เซลล์ (Solar ROI Calculator)
            </h1>
            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>
              คำนวณขนาดระบบที่เหมาะสม ผลประหยัดค่าไฟ และระยะเวลาคืนทุนใน 1 นาที (Senior Project Edition)
            </p>
          </div>
          <button onClick={() => window.print()} style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', padding: '0.75rem 1.25rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Printer size={18} /> พิมพ์เป็น PDF
          </button>
        </div>
      )}

      <div className={`print-block ${isReadOnly ? "" : "grid-2"}`} style={{ alignItems: 'flex-start', display: isReadOnly ? 'block' : 'grid', gap: '1.5rem' }}>
        
        {/* ─── INPUT CONTROLS (HUMAN CENTRIC) ───────────────────────────── */}
        {!isReadOnly && (
          <div className="equipment-card no-print" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Mode Switcher */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button 
                onClick={() => { setCalcMode('bill'); setResult(null); setInputValue(''); }}
                style={{
                  flex: 1, minHeight: '80px', padding: '0.75rem', borderRadius: '10px',
                  border: calcMode === 'bill' ? '2px solid #3b82f6' : '1px solid var(--border-color)',
                  background: calcMode === 'bill' ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-tertiary)',
                  color: calcMode === 'bill' ? '#3b82f6' : 'var(--text-primary)', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.2rem',
                  fontWeight: calcMode === 'bill' ? 'bold' : 'normal', transition: 'all 0.2s'
                }}
              >
                <span style={{ fontSize: '1.4rem' }}>⚡</span>
                <span style={{ fontSize: '0.85rem' }}>คำนวณจากค่าไฟ<br/><span style={{ fontSize: '0.8em', color: 'var(--text-secondary)' }}>(บาท/เดือน)</span></span>
              </button>

              <button 
                onClick={() => { setCalcMode('load'); setResult(null); setInputValue(''); }}
                style={{
                  flex: 1, minHeight: '80px', padding: '0.75rem', borderRadius: '10px',
                  border: calcMode === 'load' ? '2px solid #3b82f6' : '1px solid var(--border-color)',
                  background: calcMode === 'load' ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-tertiary)',
                  color: calcMode === 'load' ? '#3b82f6' : 'var(--text-primary)', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.2rem',
                  fontWeight: calcMode === 'load' ? 'bold' : 'normal', transition: 'all 0.2s'
                }}
              >
                <span style={{ fontSize: '1.4rem' }}>☀️</span>
                <span style={{ fontSize: '0.85rem' }}>คำนวณจากหน่วยไฟ<br/><span style={{ fontSize: '0.8em', color: 'var(--text-secondary)' }}>(kWh/วัน)</span></span>
              </button>
            </div>

            <form onSubmit={calculateROI} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Input Value */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label style={{ color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 'bold' }}>
                    {calcMode === 'bill' ? 'ค่าไฟเฉลี่ยต่อเดือน (บาท)' : 'การใช้พลังงานเป้าหมาย (kWh/วัน)'}
                  </label>
                  <Link to="/learning/appliance-cost" style={{ fontSize: '0.8rem', color: '#3b82f6', textDecoration: 'none', fontWeight: 'bold' }}>
                    ⚡ ช่วยคำนวณจากเครื่องใช้ไฟฟ้า →
                  </Link>
                </div>
                <input 
                  type="number" 
                  step={calcMode === 'load' ? '0.01' : '1'}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={calcMode === 'bill' ? 'เช่น 3500' : 'เช่น 25.5'}
                  style={inputStyle}
                  required
                />
              </div>

              {/* ── STEP 1: LIFESTYLE SELECTION ── */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  1. รูปแบบการใช้ชีวิตในบ้าน (Day/Night Ratio)
                  <InfoTooltip text="โซลาร์เซลล์ผลิตไฟได้เฉพาะช่วงกลางวัน ยิ่งใช้ไฟตรงช่วงแดดออกมาก ยิ่งคืนทุนเร็ว" />
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  {Object.entries(LIFESTYLE_PRESETS).map(([key, item]) => {
                    const isSelected = lifestyle === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setLifestyle(key)}
                        style={{
                          padding: '0.65rem', borderRadius: '8px', textAlign: 'left',
                          border: isSelected ? '2px solid #3b82f6' : '1px solid var(--border-color)',
                          background: isSelected ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-primary)',
                          cursor: 'pointer', transition: 'all 0.2s'
                        }}
                      >
                        <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 'bold', color: isSelected ? '#3b82f6' : 'var(--text-primary)' }}>
                          {item.label}
                        </p>
                        <p style={{ margin: '0.2rem 0 0', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                          {key === 'custom' ? `กำหนดเอง (${customDayRatio}%)` : `ใช้ไฟกลางวัน ~${item.dayRatio}%`}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {lifestyle === 'custom' && (
                  <div style={{ marginTop: '0.6rem', padding: '0.75rem', background: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>สัดส่วนไฟกลางวัน:</span>
                      <strong style={{ color: '#3b82f6' }}>{customDayRatio}% (กลางคืน {100 - customDayRatio}%)</strong>
                    </div>
                    <input 
                      type="range" min="10" max="100" step="5"
                      value={customDayRatio} onChange={(e) => setCustomDayRatio(Number(e.target.value))}
                      style={{ width: '100%', accentColor: '#3b82f6', cursor: 'pointer' }}
                    />
                  </div>
                )}
              </div>

              {/* ── STEP 2: ROOF & ENVIRONMENT ── */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  2. สภาพหลังคาและสิ่งแวดล้อม
                </label>

                {/* Roof Orientation */}
                <div style={{ marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                    🧭 ทิศทางของหลังคา (Roof Orientation):
                  </span>
                  <select 
                    value={roofOrientation} 
                    onChange={(e) => setRoofOrientation(e.target.value)} 
                    style={inputStyle}
                  >
                    {Object.entries(ROOF_ORIENTATIONS).map(([key, item]) => (
                      <option key={key} value={key}>{item.label} — {item.desc}</option>
                    ))}
                  </select>
                </div>

                {/* Shading Assessment */}
                <div style={{ marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                    🌳 สิ่งบังแดด / เงาตกกระทบ (Shading Assessment):
                  </span>
                  <select 
                    value={shading} 
                    onChange={(e) => setShading(e.target.value)} 
                    style={inputStyle}
                  >
                    {Object.entries(SHADING_CONDITIONS).map(([key, item]) => (
                      <option key={key} value={key}>{item.label} ({item.loss > 0 ? `ลดทอน -${item.loss * 100}%` : 'ไม่มีเงา'})</option>
                    ))}
                  </select>
                </div>

                {/* Province & PSH */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.75rem', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                      📍 จังหวัดที่ติดตั้ง:
                    </span>
                    <select value={province} onChange={(e) => setProvince(e.target.value)} style={inputStyle}>
                      {PROVINCE_PSH.map((item, i) =>
                        item.disabled
                          ? <option key={i} disabled style={{ color: 'var(--text-tertiary)' }}>{item.region}</option>
                          : <option key={i} value={item.label}>{item.label}</option>
                      )}
                    </select>
                  </div>
                  <div style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.6rem 0.8rem', textAlign: 'center', alignSelf: 'flex-end' }}>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', margin: 0 }}>แดดเฉลี่ย</p>
                    <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#3b82f6', margin: 0 }}>{selectedPSH}h</p>
                  </div>
                </div>
              </div>

              {/* ── STEP 3: SYSTEM TYPE ── */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  3. ประเภทระบบโซลาร์เซลล์ (System Type)
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {Object.entries(SYSTEM_TYPES).map(([key, item]) => {
                    const isSelected = systemType === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setSystemType(key)}
                        style={{
                          padding: '0.65rem 0.85rem', borderRadius: '8px', textAlign: 'left',
                          border: isSelected ? '2px solid #3b82f6' : '1px solid var(--border-color)',
                          background: isSelected ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-primary)',
                          cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}
                      >
                        <div>
                          <strong style={{ fontSize: '0.85rem', color: isSelected ? '#3b82f6' : 'var(--text-primary)' }}>{item.label}</strong>
                          <p style={{ margin: '0.15rem 0 0', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{item.desc}</p>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>~฿{item.costPerKW.toLocaleString()}/kW</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── ADVANCED SETTINGS TOGGLE (ENGINEER MODE) ── */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                <button 
                  type="button" 
                  onClick={() => setIsAdvanced(!isAdvanced)} 
                  style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.4rem', padding: 0 }}
                >
                  <Sliders size={16} /> {isAdvanced ? '▲ ซ่อนตั้งค่าเชิงลึก (Engineer Mode)' : '▼ เปิดตั้งค่าเชิงลึก (ราคาเฉพาะ, การล้างแผง, FIT)'}
                </button>

                {isAdvanced && (
                  <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '0.85rem', background: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>งบประมาณ/ราคาช่างเฉพาะ (บาท) [เว้นว่างเพื่อประเมินอัตโนมัติ]</label>
                      <input type="number" value={customCost} onChange={(e) => setCustomCost(e.target.value)} placeholder="เช่น 150000" style={inputStyle} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>การดูแล/ล้างแผง</label>
                        <select value={cleaning} onChange={(e) => setCleaning(e.target.value)} style={inputStyle}>
                          {Object.entries(SOILING_CONDITIONS).map(([key, item]) => (
                            <option key={key} value={key}>{item.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>เงินเฟ้อค่าไฟ (%/ปี)</label>
                        <input type="number" step="0.1" value={inflationRate} onChange={(e) => setInflationRate(Number(e.target.value))} style={inputStyle} />
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem', background: 'var(--bg-tertiary)', borderRadius: '6px' }}>
                      <div>
                        <strong style={{ fontSize: '0.8rem', display: 'block' }}>ขายไฟคืน (Feed-in Tariff)</strong>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>รับซื้อไฟส่วนเกิน 2.20 บาท/หน่วย</span>
                      </div>
                      <input type="checkbox" checked={enableFit} onChange={(e) => setEnableFit(e.target.checked)} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                style={{ 
                  background: '#3b82f6', 
                  color: 'white', padding: '0.9rem', borderRadius: '8px', border: 'none', 
                  fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                }}
              >
                <Calculator size={20} /> คำนวณขนาดแผงและจุดคุ้มทุน
              </button>
            </form>
          </div>
        )}

        {/* ─── RESULTS DASHBOARD ────────────────────────────────────────── */}
        {result ? (
          <div className="equipment-card animate-fade-in" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            
            {/* Top Result Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.35rem', color: 'var(--text-primary)' }}>ผลการวิเคราะห์ระบบโซลาร์เซลล์</h2>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  ประสิทธิภาพระบบจริง (PR): <strong style={{ color: '#3b82f6' }}>{result.prRate}%</strong> | แดด {result.psh} ชม./วัน
                </p>
              </div>
              <span style={{ padding: '0.35rem 0.85rem', borderRadius: '50px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontWeight: 'bold', fontSize: '0.85rem', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                คืนทุนใน {result.paybackYears} ปี 🚀
              </span>
            </div>

            {/* ── 4 BIG HERO METRICS (FOR GENERAL USERS) ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {/* Cost */}
              <div style={{ background: 'var(--bg-tertiary)', padding: '1.1rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', margin: '0 0 0.25rem' }}>💰 งบประมาณติดตั้งเบื้องต้น</p>
                <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#3b82f6', margin: 0 }}>
                  ฿{result.estimatedCost.toLocaleString()}
                </p>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>รวมอุปกรณ์และค่าแรงติดตั้งมาตรฐาน</p>
              </div>

              {/* Monthly Savings */}
              <div style={{ background: 'var(--bg-tertiary)', padding: '1.1rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', margin: '0 0 0.25rem' }}>📉 ประหยัดค่าไฟต่อเดือน</p>
                <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#10b981', margin: 0 }}>
                  ฿{result.actualSavingsPerMonth.toLocaleString()} <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>/ ด.</span>
                </p>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.72rem', color: '#10b981' }}>ประหยัดได้ ฿{result.actualSavingsPerYear.toLocaleString()} / ปี</p>
              </div>

              {/* System Size & Panels */}
              <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', margin: 0 }}>ขนาดระบบ & แผงที่แนะนำ</p>
                <p style={{ fontSize: '1.35rem', fontWeight: 'bold', margin: '0.2rem 0 0', color: 'var(--text-primary)' }}>
                  {result.recommendedKW} kWp <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>({result.numberOfPanels} แผง)</span>
                </p>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>อินเวอร์เตอร์ {result.inverterSize} kW ({result.inverterPhase})</p>
              </div>

              {/* Roof Area */}
              <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', margin: 0 }}>พื้นที่หลังคาที่ต้องใช้</p>
                <p style={{ fontSize: '1.35rem', fontWeight: 'bold', margin: '0.2rem 0 0', color: 'var(--text-primary)' }}>
                  {result.requiredArea} <span style={{ fontSize: '0.85rem' }}>ตร.ม.</span>
                </p>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>~ ที่จอดรถ {result.parkingSpaceEquivalent} คัน 🚗</p>
              </div>
            </div>

            {/* Lifetime Wealth Summary Card */}
            <div style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)', border: '1px solid rgba(59, 130, 246, 0.25)', borderRadius: '10px', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>💵 ผลประหยัดเงินรวมสุทธิ 25 ปี (หักค่าบำรุงรักษาแล้ว):</p>
                <p style={{ margin: '0.2rem 0 0', fontSize: '1.4rem', fontWeight: 'bold', color: '#10b981' }}>
                  ฿{result.totalLifetimeSavings.toLocaleString()}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>ต้นทุนไฟฟ้าที่ผลิตเอง (LCOE):</span>
                <p style={{ margin: '0.1rem 0 0', fontSize: '1.1rem', fontWeight: 'bold', color: '#3b82f6' }}>
                  ฿{result.lcoe} / หน่วย
                </p>
              </div>
            </div>

            {/* ── RESULT TAB SWITCHER ── */}
            <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setActiveResultTab('summary')}
                style={{
                  background: activeResultTab === 'summary' ? 'var(--bg-tertiary)' : 'transparent',
                  color: activeResultTab === 'summary' ? '#3b82f6' : 'var(--text-secondary)',
                  border: activeResultTab === 'summary' ? '1px solid var(--border-color)' : 'none',
                  padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem'
                }}
              >
                📈 กราฟกระแสเงินสด (Cash Flow)
              </button>

              <button
                type="button"
                onClick={() => setActiveResultTab('engineering')}
                style={{
                  background: activeResultTab === 'engineering' ? 'var(--bg-tertiary)' : 'transparent',
                  color: activeResultTab === 'engineering' ? '#3b82f6' : 'var(--text-secondary)',
                  border: activeResultTab === 'engineering' ? '1px solid var(--border-color)' : 'none',
                  padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem'
                }}
              >
                ⚙️ วิเคราะห์เชิงลึกวิศวกรรม (Loss Waterfall & NPV)
              </button>

              <button
                type="button"
                onClick={() => setActiveResultTab('esg')}
                style={{
                  background: activeResultTab === 'esg' ? 'var(--bg-tertiary)' : 'transparent',
                  color: activeResultTab === 'esg' ? '#3b82f6' : 'var(--text-secondary)',
                  border: activeResultTab === 'esg' ? '1px solid var(--border-color)' : 'none',
                  padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem'
                }}
              >
                🌱 สิ่งแวดล้อม (ESG)
              </button>
            </div>

            {/* TAB CONTENTS */}
            {activeResultTab === 'summary' && <InvestmentChart result={result} />}
            {activeResultTab === 'engineering' && <LossBreakdownView result={result} />}
            {activeResultTab === 'esg' && (
              <div style={{ padding: '1.25rem', background: 'var(--bg-secondary)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <h4 style={{ margin: '0 0 1rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
                  <Leaf size={20} /> ผลกระทบด้านสิ่งแวดล้อม & คาร์บอนเครดิต (ESG Impact)
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--bg-primary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '0.6rem', borderRadius: '50%', color: '#10b981' }}>
                      <Leaf size={24} />
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>ลดการปล่อยก๊าซ CO₂</p>
                      <p style={{ margin: '0.2rem 0 0', fontSize: '1.3rem', fontWeight: 'bold', color: '#10b981' }}>{result.co2ReducedTonsPerYear} <span style={{ fontSize: '0.8rem' }}>ตัน/ปี</span></p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--bg-primary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '0.6rem', borderRadius: '50%', color: '#10b981' }}>
                      <Trees size={24} />
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>เทียบเท่าปลูกต้นไม้</p>
                      <p style={{ margin: '0.2rem 0 0', fontSize: '1.3rem', fontWeight: 'bold', color: '#10b981' }}>{result.treesPlantedEquivalent} <span style={{ fontSize: '0.8rem' }}>ต้น/ปี</span></p>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        ) : (
          /* Empty State Placeholder */
          <div className="equipment-card" style={{ padding: '3rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', border: '2px dashed var(--border-color)', background: 'transparent' }}>
            <Sun size={48} color="var(--text-secondary)" style={{ opacity: 0.5 }} />
            <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>กรอกข้อมูลด้านซ้ายเพื่อเริ่มการประเมิน</h3>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '360px' }}>
              ระบบจะจำลองขนาดแผงที่เหมาะสม ผลประหยัดรายเดือน และวิเคราะห์ความคุ้มค่า 25 ปีให้คุณทันที
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

export default SolarCalculator;
