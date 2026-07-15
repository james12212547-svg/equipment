import { useState, useMemo } from 'react';
import { ArrowLeft, Wind, Sun, Users, Calculator, Printer, CheckCircle, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TARIFF_TYPES } from '../constants/tariffRates';

const ROOM_TYPES = {
  bedroom: { name: 'ห้องนอน (ปกติ)', btuPerSqm: 750 },
  living: { name: 'ห้องนั่งเล่น', btuPerSqm: 850 },
  office: { name: 'ออฟฟิศ/สำนักงาน', btuPerSqm: 950 },
  restaurant: { name: 'ร้านอาหาร/ร้านค้า', btuPerSqm: 1100 }
};

const AC_SIZES = [9000, 12000, 15000, 18000, 24000, 30000, 36000, 42000, 48000, 60000];

const AirConCalculator = () => {
  const navigate = useNavigate();

  // Room details
  const [width, setWidth] = useState('');
  const [length, setLength] = useState('');
  const [roomType, setRoomType] = useState('bedroom');
  const [sunExposure, setSunExposure] = useState(false);
  const [extraPeople, setExtraPeople] = useState(0);

  // AC specs
  const [isInverter, setIsInverter] = useState(true);

  // Usage and Tariff
  const [userTypeId, setUserTypeId] = useState(1);
  const [rateType, setRateType] = useState('normal'); // 'normal', 'tou', 'tod'
  const [hoursNormal, setHoursNormal] = useState(8);
  const [hoursOnPeak, setHoursOnPeak] = useState(0);
  const [hoursOffPeak, setHoursOffPeak] = useState(8);
  const [hoursPartial, setHoursPartial] = useState(0);

  const selectedTariff = TARIFF_TYPES.find(t => t.id === userTypeId) || TARIFF_TYPES[0];

  // Logic calculation
  const result = useMemo(() => {
    const w = parseFloat(width) || 0;
    const l = parseFloat(length) || 0;
    const area = w * l;

    if (area <= 0) return null;

    let baseBtu = area * ROOM_TYPES[roomType].btuPerSqm;
    
    // Add 15% if heavy sun exposure (e.g. West facing or direct roof)
    if (sunExposure) baseBtu *= 1.15;
    
    // Add 600 BTU per extra person
    if (extraPeople > 0) baseBtu += (extraPeople * 600);

    const recommendedAcSize = AC_SIZES.find(size => size >= baseBtu) || Math.ceil(baseBtu);

    // Energy calculation
    // Power (kW) = BTU / (SEER * 3412) -- simplified assumption
    // Typical SEER: Inverter ~ 18, Non-Inverter ~ 13
    const seer = isInverter ? 18 : 13;
    const powerKw = recommendedAcSize / (seer * 3.412) / 1000; // kW (approx)
    
    // Actually a simpler thumb rule for Power: BTU / 12000 = Tons. 1 Ton ≈ 1.2 kW (Non-inverter) or 0.8-1.0 kW (Inverter)
    // Let's use a standard approximation: Input Power (kW) = Recommended AC Size (BTU) / (SEER * 3.412) -> wait, SEER = BTU/W-hr. So W = BTU/SEER. kW = BTU/(SEER * 1000)
    const kw = recommendedAcSize / (seer * 1000); 

    let monthlyCost = 0;
    const daysInMonth = 30;

    if (rateType === 'normal') {
      const unitsPerMonth = kw * hoursNormal * daysInMonth;
      monthlyCost = unitsPerMonth * selectedTariff.rates.normal;
    } else if (rateType === 'tou') {
      const peakUnits = kw * hoursOnPeak * daysInMonth;
      const offPeakUnits = kw * hoursOffPeak * daysInMonth;
      monthlyCost = (peakUnits * selectedTariff.rates.tou.onPeak) + (offPeakUnits * selectedTariff.rates.tou.offPeak);
    } else if (rateType === 'tod' && selectedTariff.rates.tod) {
      const peakUnits = kw * hoursOnPeak * daysInMonth;
      const partialUnits = kw * hoursPartial * daysInMonth;
      const offPeakUnits = kw * hoursOffPeak * daysInMonth;
      monthlyCost = (peakUnits * selectedTariff.rates.tod.onPeak) + 
                    (partialUnits * selectedTariff.rates.tod.partialPeak) + 
                    (offPeakUnits * selectedTariff.rates.tod.offPeak);
    }

    return {
      area: area.toFixed(2),
      calculatedBtu: Math.round(baseBtu),
      recommendedAcSize,
      kw: kw.toFixed(2),
      monthlyCost: monthlyCost.toFixed(2)
    };
  }, [width, length, roomType, sunExposure, extraPeople, isInverter, userTypeId, rateType, hoursNormal, hoursOnPeak, hoursOffPeak, hoursPartial, selectedTariff]);

  const handleUserTypeChange = (e) => {
    const id = parseInt(e.target.value);
    setUserTypeId(id);
    const tariff = TARIFF_TYPES.find(t => t.id === id);
    // Reset rateType if the new user type doesn't support it
    if (rateType === 'tod' && !tariff.rates.tod) setRateType('tou');
    if (rateType === 'tou' && !tariff.rates.tou) setRateType('normal');
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button onClick={() => navigate(-1)} className="no-print" style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '0.5rem' }}>
          <ArrowLeft size={24} />
        </button>
        <div style={{ flex: 1 }}>
          <h1 className="text-gradient-ac" style={{ marginBottom: 0, fontSize: '2rem' }}>โปรแกรมคำนวณขนาดแอร์และค่าไฟ</h1>
          <p style={{ color: 'var(--text-secondary)' }}>BTU Calculator & Energy Cost (TOU/TOD)</p>
        </div>
        <button 
          className="no-print"
          onClick={() => window.print()} 
          style={{ background: 'var(--accent-secondary)', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Printer size={20} /> พิมพ์เป็น PDF
        </button>
      </div>

      <div className="print-only" style={{ marginBottom: '2rem', textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '1rem', display: 'none' }}>
        <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>รายงานการคำนวณเครื่องปรับอากาศ (BTU)</h2>
        <p style={{ margin: '0.5rem 0 0', color: '#666' }}>คำนวณโดยระบบ Engineering Toolkit (สร้างเมื่อ {new Date().toLocaleDateString('th-TH')})</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        
        {/* INPUT SECTION */}
        <div className="equipment-card no-print" style={{ padding: '2rem' }}>
          <h3 style={{ margin: '0 0 1.5rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Wind size={20} className="text-ac" /> ขนาดห้องและการใช้งาน
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>ความกว้าง (เมตร)</label>
              <input type="number" value={width} onChange={(e) => setWidth(e.target.value)} placeholder="เช่น 4" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>ความยาว (เมตร)</label>
              <input type="number" value={length} onChange={(e) => setLength(e.target.value)} placeholder="เช่น 5" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>ประเภทห้อง</label>
            <select value={roomType} onChange={(e) => setRoomType(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
              {Object.keys(ROOM_TYPES).map(key => (
                <option key={key} value={key}>{ROOM_TYPES[key].name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'rgba(255, 183, 94, 0.1)', borderRadius: '8px', border: '1px solid rgba(255, 183, 94, 0.3)', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Sun size={20} color="#FFB75E" />
              <div>
                <strong style={{ color: 'var(--text-primary)', display: 'block' }}>ห้องโดนแดดจัด</strong>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>ทิศตะวันตก, ใต้ หรือติดหลังคา</span>
              </div>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" checked={sunExposure} onChange={(e) => setSunExposure(e.target.checked)} />
              <span className="slider"></span>
            </label>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.3)', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Users size={20} color="#3B82F6" />
              <div>
                <strong style={{ color: 'var(--text-primary)', display: 'block' }}>คนใช้งานมากกว่าปกติ</strong>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>ระบุจำนวนคนที่เกินมาตรฐาน</span>
              </div>
            </div>
            <input type="number" min="0" value={extraPeople} onChange={(e) => setExtraPeople(parseInt(e.target.value) || 0)} style={{ width: '60px', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', textAlign: 'center' }} />
          </div>

          <h3 style={{ margin: '0 0 1.5rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calculator size={20} className="text-solar" /> ข้อมูลผู้ใช้ไฟฟ้าและการประเมินค่าไฟ
          </h3>

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
            <button 
              onClick={() => setIsInverter(true)}
              style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: `1px solid ${isInverter ? '#4CAF50' : 'var(--border-color)'}`, background: isInverter ? 'rgba(76, 175, 80, 0.1)' : 'var(--bg-primary)', color: isInverter ? '#4CAF50' : 'var(--text-secondary)', fontWeight: isInverter ? 'bold' : 'normal', cursor: 'pointer' }}
            >
              Inverter (ประหยัดไฟ)
            </button>
            <button 
              onClick={() => setIsInverter(false)}
              style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: `1px solid ${!isInverter ? 'var(--accent-primary)' : 'var(--border-color)'}`, background: !isInverter ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg-primary)', color: !isInverter ? 'var(--accent-primary)' : 'var(--text-secondary)', fontWeight: !isInverter ? 'bold' : 'normal', cursor: 'pointer' }}
            >
              Non-Inverter (ระบบธรรมดา)
            </button>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>ประเภทผู้ใช้ไฟ (PEA/MEA)</label>
            <select value={userTypeId} onChange={handleUserTypeChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
              {TARIFF_TYPES.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>ลักษณะมิเตอร์ (Meter Type)</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => setRateType('normal')} style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: rateType === 'normal' ? '2px solid var(--accent-secondary)' : '1px solid var(--border-color)', background: rateType === 'normal' ? 'rgba(255, 183, 94, 0.1)' : 'var(--bg-primary)', color: rateType === 'normal' ? 'var(--accent-secondary)' : 'var(--text-secondary)', cursor: 'pointer' }}>
                อัตราปกติ
              </button>
              {selectedTariff.rates.tou && (
                <button onClick={() => setRateType('tou')} style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: rateType === 'tou' ? '2px solid var(--accent-secondary)' : '1px solid var(--border-color)', background: rateType === 'tou' ? 'rgba(255, 183, 94, 0.1)' : 'var(--bg-primary)', color: rateType === 'tou' ? 'var(--accent-secondary)' : 'var(--text-secondary)', cursor: 'pointer' }}>
                  TOU
                </button>
              )}
              {selectedTariff.rates.tod && (
                <button onClick={() => setRateType('tod')} style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: rateType === 'tod' ? '2px solid var(--accent-secondary)' : '1px solid var(--border-color)', background: rateType === 'tod' ? 'rgba(255, 183, 94, 0.1)' : 'var(--bg-primary)', color: rateType === 'tod' ? 'var(--accent-secondary)' : 'var(--text-secondary)', cursor: 'pointer' }}>
                  TOD
                </button>
              )}
            </div>
          </div>

          {/* Usage Hours Inputs Based on Rate Type */}
          {rateType === 'normal' && (
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>ชั่วโมงการใช้งานต่อวัน (ชม.)</label>
              <input type="number" min="0" max="24" value={hoursNormal} onChange={(e) => setHoursNormal(Number(e.target.value))} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
            </div>
          )}
          
          {rateType === 'tou' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>On-Peak (ชม./วัน)</label>
                <input type="number" min="0" max="24" value={hoursOnPeak} onChange={(e) => setHoursOnPeak(Number(e.target.value))} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Off-Peak (ชม./วัน)</label>
                <input type="number" min="0" max="24" value={hoursOffPeak} onChange={(e) => setHoursOffPeak(Number(e.target.value))} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
              </div>
            </div>
          )}

          {rateType === 'tod' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>On-Peak (ชม.)</label>
                <input type="number" min="0" max="24" value={hoursOnPeak} onChange={(e) => setHoursOnPeak(Number(e.target.value))} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Partial (ชม.)</label>
                <input type="number" min="0" max="24" value={hoursPartial} onChange={(e) => setHoursPartial(Number(e.target.value))} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Off-Peak (ชม.)</label>
                <input type="number" min="0" max="24" value={hoursOffPeak} onChange={(e) => setHoursOffPeak(Number(e.target.value))} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
              </div>
            </div>
          )}

        </div>

        {/* RESULTS SECTION */}
        {result && (
          <div className="equipment-card animate-fade-in" style={{ padding: '2rem', border: '2px solid var(--accent-primary)', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: 'var(--accent-primary)' }}>
                <CheckCircle size={28} />
                <h3 style={{ margin: 0, fontSize: '1.5rem' }}>ผลการคำนวณขนาดแอร์</h3>
              </div>
              
              <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '12px', textAlign: 'center', marginBottom: '1rem' }}>
                <p style={{ margin: '0 0 0.5rem', color: 'var(--text-secondary)' }}>ขนาดทำความเย็นที่แนะนำ (Recommended Size)</p>
                <p style={{ margin: 0, fontSize: '3rem', fontWeight: 'bold', color: 'var(--text-primary)', textShadow: '0 2px 10px rgba(59, 130, 246, 0.3)' }}>
                  {result.recommendedAcSize.toLocaleString()} <span style={{ fontSize: '1.5rem', fontWeight: 'normal', color: 'var(--text-secondary)' }}>BTU/hr</span>
                </p>
                <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem', color: 'var(--text-tertiary)' }}>
                  (จากการคำนวณโหลดจริง: {result.calculatedBtu.toLocaleString()} BTU)
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>พื้นที่ห้อง</p>
                  <p style={{ margin: '0.25rem 0 0', fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{result.area} ตร.ม.</p>
                </div>
                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>กำลังไฟฟ้าที่ใช้ (โดยประมาณ)</p>
                  <p style={{ margin: '0.25rem 0 0', fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{result.kw} kW</p>
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: 'var(--accent-secondary)' }}>
                <Zap size={28} />
                <h3 style={{ margin: 0, fontSize: '1.5rem' }}>ประเมินค่าไฟรายเดือน</h3>
              </div>
              
              <div style={{ background: 'linear-gradient(135deg, rgba(255, 183, 94, 0.1) 0%, rgba(237, 143, 3, 0.1) 100%)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255, 183, 94, 0.3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div>
                    <p style={{ margin: '0 0 0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>ค่าไฟแอร์โดยประมาณ (30 วัน)</p>
                    <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--accent-secondary)' }}>
                      ฿ {Number(result.monthlyCost).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px dashed rgba(255, 255, 255, 0.2)' }}>
                  <p style={{ margin: '0 0 0.25rem', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                    อ้างอิง: {selectedTariff.name} ({rateType.toUpperCase()})
                  </p>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                    * คำนวณเบื้องต้นจากการใช้ไฟคงที่ และไม่รวมค่า Ft, ภาษีมูลค่าเพิ่ม หรือค่าบริการรายเดือน
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default AirConCalculator;
