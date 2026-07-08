import { useState } from 'react';
import { ArrowLeft, Thermometer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { calculateBtuSizing } from '../utils/engineering/btuCalc';
import GlossaryLink from '../components/GlossaryLink';

const BtuCalculator = () => {
  const navigate = useNavigate();
  const [width, setWidth] = useState('');
  const [length, setLength] = useState('');
  const [height, setHeight] = useState('');
  const [sunExposure, setSunExposure] = useState('normal'); // normal, high
  const [roomType, setRoomType] = useState('bedroom'); // bedroom, living, office
  const [result, setResult] = useState(null);

  const calculateBTU = (e) => {
    e.preventDefault();
    const calculationResult = calculateBtuSizing(width, length, height, roomType, sunExposure);
    if (calculationResult) {
      setResult(calculationResult);
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '0.5rem' }}>
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-gradient-ac" style={{ marginBottom: 0, fontSize: '2rem' }}>โปรแกรมคำนวณ BTU แอร์</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Air Conditioner BTU Calculator</p>
        </div>
      </div>

      <div className="grid-2">
        <div className="equipment-card" style={{ padding: '2rem' }}>
          <form onSubmit={calculateBTU} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>กว้าง (เมตร)</label>
                <input type="number" step="0.1" value={width} onChange={(e) => setWidth(e.target.value)} required style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.2)', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-primary)', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>ยาว (เมตร)</label>
                <input type="number" step="0.1" value={length} onChange={(e) => setLength(e.target.value)} required style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.2)', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-primary)', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>สูง (เมตร) - ตัวเลือก</label>
                <input type="number" step="0.1" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="เช่น 2.8" style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.2)', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-primary)', outline: 'none' }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>ประเภทห้อง</label>
              <select value={roomType} onChange={(e) => setRoomType(e.target.value)} style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.2)', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-primary)', outline: 'none' }}>
                <option value="bedroom">ห้องนอน</option>
                <option value="living">ห้องนั่งเล่น / ห้องรับแขก</option>
                <option value="office">ห้องทำงาน / ออฟฟิศ</option>
                <option value="kitchen">ห้องครัว / ห้องอาหาร (ความร้อนสูง)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>การโดนแดด</label>
              <select value={sunExposure} onChange={(e) => setSunExposure(e.target.value)} style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.2)', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-primary)', outline: 'none' }}>
                <option value="normal">ปกติ (ห้องทิศเหนือ/ตะวันออก ไม่โดนแดดบ่าย)</option>
                <option value="high">โดนแดดจัด (ห้องทิศตะวันตก/ใต้ หรือกระจกเยอะ)</option>
              </select>
            </div>
            
            <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
              <p style={{ margin: '0 0 0.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>ℹ️ เกณฑ์ค่าตัวคูณภาระความร้อน (Cooling Load Factor) โดยประมาณ:</p>
              <ul style={{ margin: 0, paddingLeft: '1.5rem', color: 'var(--text-secondary)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <li>ห้องนอน (ไม่โดนแดด): 700 - 800</li>
                <li>ห้องนอน (โดนแดด): 800 - 900</li>
                <li>ห้องทำงาน/นั่งเล่น (ไม่โดนแดด): 800 - 900</li>
                <li>ห้องทำงาน/นั่งเล่น (โดนแดด): 900 - 1000+</li>
                <li style={{ gridColumn: '1 / -1' }}>ห้องครัว/ห้องอาหาร: 900 - 1000+ (เนื่องจากมีความร้อนสูง)</li>
              </ul>
            </div>
            
            <button type="submit" style={{ background: 'linear-gradient(135deg, #00F0FF 0%, #0080FF 100%)', color: 'white', padding: '1rem', borderRadius: '8px', border: 'none', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <Thermometer size={20} /> คำนวณ BTU
            </button>
          </form>
        </div>

        {result && (
          <div className="equipment-card animate-fade-in" style={{ padding: '2rem', background: 'rgba(0, 240, 255, 0.05)', border: '1px solid rgba(0, 240, 255, 0.2)' }}>
            <h3 className="text-gradient-ac" style={{ marginBottom: '1.5rem' }}>ผลการคำนวณ</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>พื้นที่ห้อง</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{result.area} <span style={{ fontSize: '1rem', fontWeight: 'normal' }}>ตร.ม.</span></p>
                </div>
                {result.volume && (
                  <div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>ปริมาตรห้อง (มิติ 3D)</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: result.isHighCeiling ? 'var(--accent-solar)' : 'inherit' }}>
                      {result.volume} <span style={{ fontSize: '1rem', fontWeight: 'normal' }}>ลบ.ม.</span>
                      {result.isHighCeiling && <span style={{ fontSize: '0.8rem', marginLeft: '0.5rem', background: 'rgba(255, 165, 0, 0.2)', padding: '2px 6px', borderRadius: '4px' }}>เพดานสูง (Double Volume)</span>}
                    </p>
                  </div>
                )}
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>ตัวคูณภาระความร้อน (Cooling Load)</p>
                  <p style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{result.multiplier} <span style={{ fontSize: '0.9rem', fontWeight: 'normal' }}>BTU/ตร.ม.</span></p>
                </div>
                <div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>ค่า <GlossaryLink term="BTU" /> ที่ต้องการ (ตามสูตร)</p>
                  <p style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{result.calculatedBTU.toLocaleString()} <span style={{ fontSize: '0.9rem', fontWeight: 'normal' }}>BTU/hr</span></p>
                </div>
              </div>

              <div style={{ padding: '1.5rem', background: 'var(--bg-primary)', borderRadius: '12px', border: '1px solid var(--accent-ac)' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>ขนาดแอร์ที่แนะนำติดตั้ง</p>
                <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--accent-ac)' }}>
                  {result.recommendedSize.toLocaleString()} <span style={{ fontSize: '1.2rem', fontWeight: 'normal' }}>BTU</span>
                </p>
              </div>
            </div>
            
            <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
              * การคำนวณนี้เป็นเพียงค่าประมาณการเบื้องต้น หากห้องมีเพดานสูงกว่าปกติ หรือมีกระจกจำนวนมาก ควรเผื่อค่า BTU เพิ่มเติม
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BtuCalculator;
