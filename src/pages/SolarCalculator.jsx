import { useState, useMemo } from 'react';
import { ArrowLeft, Calculator, Zap, TrendingUp } from 'lucide-react';
import { AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
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
          whiteSpace: 'pre-wrap', width: '220px', zIndex: 9999,
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
  const [returnRate, setReturnRate] = useState(5); // Default 5%
  const [years, setYears] = useState(20);

  // Generate Data
  const data = useMemo(() => {
    const arr = [];
    let compounded = 0;
    const rate = returnRate / 100;
    
    for (let y = 0; y <= years; y++) {
      if (y === 0) {
        arr.push({ year: y, "กำไรทบต้น (โซลาร์ + DCA)": 0, "ค่าเสียโอกาส (ลงทุนเงินก้อน)": result.estimatedCost, "เงินลงทุนเริ่มแรก": result.estimatedCost });
      } else {
        // True savings considering panel degradation and inflation
        const inflationMultiplier = Math.pow(1 + result.elecInflation, y - 1);
        const degradationMultiplier = Math.pow(1 - result.degradationRate, y - 1);
        const currentYearSavings = (result.actualSavingsPerMonth * 12) * inflationMultiplier * degradationMultiplier;
        
        // Operation & Maintenance Costs
        let currentYearCost = result.annualCleaningCost;
        if (y === 10) currentYearCost += result.inverterReplacementCost; // Replace inverter at year 10
        
        const netCashFlow = currentYearSavings - currentYearCost;

        // Scenario A: Solar + DCA savings
        compounded = (compounded + netCashFlow) * (1 + rate);
        
        // Scenario B: Opportunity Cost (investing the system cost upfront instead)
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
    <div style={{ marginTop: '2rem', padding: '2rem', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={20} color="var(--accent-solar)" /> เปรียบเทียบกลยุทธ์การลงทุน (Opportunity Cost)
          </h3>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            เปรียบเทียบ "ติดโซลาร์แล้วเอาค่าไฟไป DCA" VS "ไม่ติดโซลาร์ เอาเงินก้อนไปลงทุน"
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>ผลตอบแทนลงทุน (%/ปี)</label>
            <input 
              type="number" 
              value={returnRate} 
              onChange={e => setReturnRate(Number(e.target.value))}
              style={{ width: '90px', padding: '0.5rem', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.2)', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-primary)', outline: 'none' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>ระยะเวลา (ปี)</label>
            <input 
              type="number" 
              value={years} 
              onChange={e => setYears(Number(e.target.value))}
              style={{ width: '90px', padding: '0.5rem', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.2)', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-primary)', outline: 'none' }}
            />
          </div>
        </div>
      </div>
      
      <div style={{ width: '100%', height: '350px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
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
            <YAxis stroke="var(--text-tertiary)" tick={{ fill: 'var(--text-tertiary)' }} tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} width={60} />
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ paddingBottom: '1rem' }} />
            <Area type="monotone" dataKey="ค่าเสียโอกาส (ลงทุนเงินก้อน)" stroke="#f59e0b" fillOpacity={1} fill="url(#colorOppCost)" strokeWidth={2} />
            <Area type="monotone" dataKey="กำไรทบต้น (โซลาร์ + DCA)" stroke="#10b981" fillOpacity={1} fill="url(#colorCompounded)" strokeWidth={3} />
            <Line type="monotone" dataKey="เงินลงทุนเริ่มแรก" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div style={{ marginTop: '2rem', padding: '1.25rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '8px', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
        <div style={{ background: '#10b981', color: 'white', padding: '0.75rem', borderRadius: '50%', display: 'flex', flexShrink: 0 }}>
          <TrendingUp size={24} />
        </div>
        <div>
          <h4 style={{ margin: 0, color: '#10b981', fontSize: '1.1rem' }}>วิสัยทัศน์ทางธุรกิจและการลงทุน</h4>
          <p style={{ margin: '0.5rem 0 0', color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.5' }}>
            หากคุณไม่ติดโซลาร์เซลล์แล้วนำเงิน <strong>{(result.estimatedCost).toLocaleString()} บาท</strong> ไปลงทุนที่ {returnRate}% ต่อปี จะได้เงิน <strong>{data[data.length - 1]["ค่าเสียโอกาส (ลงทุนเงินก้อน)"].toLocaleString()} บาท</strong> ใน {years} ปี
            <br />
            แต่ถ้าลงทุนติดโซลาร์เซลล์ และนำค่าไฟที่ประหยัดได้ไป <strong>DCA (ถัวเฉลี่ยรายเดือน)</strong> ที่ผลตอบแทนเดียวกัน 
            รวมผลประโยชน์จากอัตราเงินเฟ้อค่าไฟที่เพิ่มขึ้นทุกปี ({(result.elecInflation * 100).toFixed(1)}%/ปี) 
            คุณจะสร้างความมั่งคั่งได้ถึง <strong>{data[data.length - 1]["กำไรทบต้น (โซลาร์ + DCA)"].toLocaleString()} บาท</strong>!
          </p>
        </div>
      </div>
    </div>
  );
};

const SolarCalculator = () => {
  const navigate = useNavigate();
  const [calcMode, setCalcMode] = useState('bill');
  const [inputValue, setInputValue] = useState('');
  const [inflationRate, setInflationRate] = useState(3);
  const [province, setProvince] = useState('กรุงเทพมหานคร');
  const [result, setResult] = useState(null);

  const selectedPSH = PROVINCE_PSH.find(p => p.label === province)?.psh ?? 4.5;

  const calculateROI = (e) => {
    e.preventDefault();
    const calculationResult = calculateSolarRoi(calcMode, inputValue, inflationRate, selectedPSH);
    if (!calculationResult) {
      toast.error('กรุณากรอกตัวเลขให้ถูกต้อง (มากกว่า 0)');
      return;
    }
    setResult(calculationResult);
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button 
          onClick={() => navigate(-1)} 
          style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '0.5rem' }}
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-gradient-solar" style={{ marginBottom: 0, fontSize: '2rem' }}>ประเมินจุดคุ้มทุนโซลาร์เซลล์</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Solar ROI & System Sizing Calculator</p>
        </div>
      </div>

      <div className="grid-2" style={{ alignItems: 'flex-start' }}>
        <div className="equipment-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <button 
              onClick={() => { setCalcMode('bill'); setResult(null); setInputValue(''); }}
              style={{ flex: 1, minHeight: '90px', padding: '0.75rem', borderRadius: '8px', border: calcMode === 'bill' ? '2px solid var(--accent-solar)' : '1px solid var(--border-color)', background: calcMode === 'bill' ? 'rgba(255,165,0,0.1)' : 'var(--bg-tertiary)', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', transition: 'all 0.2s', textAlign: 'center' }}
            >
              <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>⚡</span>
              <span style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>คำนวณจากค่าไฟ<br/><span style={{ fontSize: '0.8em', color: 'var(--text-secondary)' }}>(บาท/เดือน)</span></span>
            </button>
            <button 
              onClick={() => { setCalcMode('load'); setResult(null); setInputValue(''); }}
              style={{ flex: 1, minHeight: '90px', padding: '0.75rem', borderRadius: '8px', border: calcMode === 'load' ? '2px solid var(--accent-solar)' : '1px solid var(--border-color)', background: calcMode === 'load' ? 'rgba(255,165,0,0.1)' : 'var(--bg-tertiary)', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', transition: 'all 0.2s', textAlign: 'center' }}
            >
              <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>☀️</span>
              <span style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>คำนวณจากโหลด<br/><span style={{ fontSize: '0.8em', color: 'var(--text-secondary)' }}>(kWh/วัน)</span></span>
            </button>
          </div>
          
          <form onSubmit={calculateROI} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', alignItems: 'end' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ display: 'flex', alignItems: 'flex-end', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', minHeight: '2.8rem' }}>
                  {calcMode === 'bill' ? 'ค่าไฟเฉลี่ยต่อเดือน (บาท)' : 'การใช้พลังงานเป้าหมาย (kWh/วัน)'}
                </label>
                <input 
                  type="number" 
                  step={calcMode === 'load' ? '0.01' : '1'}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={calcMode === 'bill' ? 'เช่น 3500' : 'เช่น 53.92'}
                  style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.2)', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-primary)', fontSize: '1.1rem', boxSizing: 'border-box', outline: 'none' }}
                  required
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ display: 'flex', alignItems: 'flex-end', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', minHeight: '2.8rem' }}>
                  เงินเฟ้อค่าไฟ (% / ปี)
                  <InfoTooltip text={'ค่าเฉลี่ยที่ไฟฟ้าแพงขึ้นทุกปี\nไทยเฉลี่ยอยู่ที่ ~3%/ปี\nยิ่งเยอะ ยิ่งคุ้มทุนเร็วขึ้น'} />
                </label>
                <input 
                  type="number" 
                  step="0.1"
                  value={inflationRate}
                  onChange={(e) => setInflationRate(Number(e.target.value))}
                  style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.2)', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-primary)', fontSize: '1.1rem', boxSizing: 'border-box', outline: 'none' }}
                  required
                />
              </div>
            </div>

            {/* Province / PSH Selector */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                📍 จังหวัด / ชั่วโมงแดด (Peak Sun Hours)
                <InfoTooltip text={'Peak Sun Hours (PSH) คือจำนวนชั่วโมง\nที่แสงแดดมีความเข้มเพียงพอต่อการผลิตไฟฟ้า\nภาคอีสาน/กลาง ได้ PSH สูงกว่าภาคใต้\nค่ายิ่งสูง = แผงผลิตไฟได้มากกว่า'} />
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.75rem', alignItems: 'center' }}>
                <select
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.2)', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-primary)', fontSize: '1rem', cursor: 'pointer', outline: 'none' }}
                >
                  {PROVINCE_PSH.map((item, i) =>
                    item.disabled
                      ? <option key={i} disabled style={{ color: 'var(--text-tertiary)', fontStyle: 'italic' }}>{item.region}</option>
                      : <option key={i} value={item.label}>{item.label}</option>
                  )}
                </select>
                <div style={{ background: 'rgba(255,165,0,0.1)', border: '1px solid rgba(255,165,0,0.4)', borderRadius: '8px', padding: '0.6rem 1rem', textAlign: 'center', whiteSpace: 'nowrap' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>PSH</p>
                  <p style={{ fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--accent-solar)', margin: 0 }}>{selectedPSH}</p>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', margin: 0 }}>ชม./วัน</p>
                </div>
              </div>
            </div>
            
            <button 
              type="submit" 
              style={{ 
                background: 'linear-gradient(135deg, #FFB75E 0%, #ED8F03 100%)', 
                color: 'white', 
                padding: '1rem', 
                borderRadius: '8px', 
                border: 'none', 
                fontSize: '1.1rem', 
                fontWeight: 'bold', 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <Calculator size={20} /> ประเมินระบบ & คำนวณความคุ้มค่า
            </button>
          </form>
        </div>

        {result && (
          <div className="equipment-card animate-fade-in" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'rgba(255, 165, 0, 0.05)', border: '1px solid rgba(255, 165, 0, 0.2)' }}>
            <h3 className="text-gradient-solar">ผลการประเมินออกแบบระบบ</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'stretch' }}>
              <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', height: '100%' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>ขนาดระบบที่แนะนำ</p>
                <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--accent-solar)' }}>{result.recommendedKW} <span style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>kW</span></p>
              </div>
              <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', height: '100%' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>ขนาดอินเวอร์เตอร์ (ขั้นต่ำ)</p>
                <p style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{result.inverterSize} <span style={{ fontSize: '1rem' }}>kW</span></p>
                <p style={{ fontSize: '0.85rem', color: 'var(--accent-solar)', marginTop: 'auto', fontWeight: 'bold' }}>ระบบ {result.inverterPhase}</p>
              </div>

              <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', height: '100%' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>จำนวนแผงโซลาร์ ({result.panelWattage}W)</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: 'auto' }}>{result.numberOfPanels} <span style={{ fontSize: '1rem' }}>แผง</span></p>
              </div>
              <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', height: '100%' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>พื้นที่หลังคาที่ต้องใช้</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: 'auto' }}>{result.requiredArea} <span style={{ fontSize: '1rem' }}>ตร.ม.</span></p>
              </div>
              
              <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '8px', gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', textAlign: 'center', alignItems: 'center' }}>
                <div style={{ padding: '0.5rem 0' }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>งบประมาณเบื้องต้น</p>
                  <p style={{ fontSize: '1rem', fontWeight: 'bold', lineHeight: '1.3' }}>{(result.estimatedCost).toLocaleString()}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>บาท</p>
                </div>
                <div style={{ borderLeft: '1px solid var(--border-color)', borderRight: '1px solid var(--border-color)', padding: '0.5rem 0' }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>ประหยัดไฟได้</p>
                  <p style={{ fontSize: '1rem', fontWeight: 'bold', color: '#4CAF50', lineHeight: '1.3' }}>{(result.actualSavingsPerMonth).toLocaleString()}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>บาท/เดือน</p>
                </div>
                <div style={{ padding: '0.5rem 0' }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>ระยะเวลาคืนทุน</p>
                  <p style={{ fontSize: '1rem', fontWeight: 'bold', lineHeight: '1.3' }}>{result.paybackYears}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>ปี</p>
                </div>
              </div>
            </div>
            
            <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--text-tertiary)', display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>
                * อ้างอิง Peak Sun Hours (PSH)
                <InfoTooltip text={'PSH = ชั่วโมงที่แดดเต็มที่ต่อวัน\nใช้คำนวณว่าแผงโซลาร์ขนาด 1 kW\nจะผลิตไฟฟ้าได้กี่ kWh ต่อวัน\n(1 kW × PSH = kWh/วัน)'} />
                {' '}: <strong style={{ color: 'var(--accent-solar)' }}>{result?.psh ?? selectedPSH} ชม./วัน</strong>
                {' '}| แผง 550W | ราคาอาจเปลี่ยนแปลงตามหน้างาน
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                อินเวอร์เตอร์
                <InfoTooltip text={'อินเวอร์เตอร์ (Inverter) คืออุปกรณ์\nที่แปลงไฟฟ้ากระแสตรง (DC) จากแผงโซลาร์\nให้เป็นไฟฟ้ากระแสสลับ (AC)\nที่บ้านและอุปกรณ์ไฟฟ้าทั่วไปใช้ได้'} />
                {' '}| 3-Phase ใช้สำหรับระบบ {'>'} 5 kW
              </span>
            </div>
            
            {/* 📈 WOW Factor: Investment Chart */}
            <InvestmentChart result={result} />
          </div>
        )}
      </div>
    </div>
  );
};

export default SolarCalculator;
