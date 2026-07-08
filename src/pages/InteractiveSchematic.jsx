import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const InteractiveSchematic = () => {
  const navigate = useNavigate();
  const [activePart, setActivePart] = useState(null);

  const partsInfo = {
    compressor: {
      title: 'คอมเพรสเซอร์ (Compressor)',
      desc: 'หัวใจของระบบ ทำหน้าที่ดูดไอสารทำความเย็น (ความดันต่ำ/อุณหภูมิต่ำ) แล้วอัดให้เป็นไอ (ความดันสูง/อุณหภูมิสูง) ส่งต่อไปยังคอนเดนเซอร์',
      color: '#F44336'
    },
    condenser: {
      title: 'คอยล์ร้อน (Condenser)',
      desc: 'ระบายความร้อนออกจากสารทำความเย็น ทำให้สารทำความเย็นเปลี่ยนสถานะจากไอ (แก๊ส) กลายเป็นของเหลวที่มีความดันสูง',
      color: '#FF9800'
    },
    expansion: {
      title: 'เอ็กซ์แพนชันวาล์ว (Expansion Valve)',
      desc: 'ลดความดันของสารทำความเย็นเหลว ทำให้เดือดและเปลี่ยนสถานะเป็นส่วนผสมของเหลวและไอ อุณหภูมิจะลดลงอย่างรวดเร็ว',
      color: '#9C27B0'
    },
    evaporator: {
      title: 'คอยล์เย็น (Evaporator)',
      desc: 'สารทำความเย็นดูดซับความร้อนจากอากาศในห้อง ทำให้ระเหยกลายเป็นไอ (ความดันต่ำ) อากาศที่ผ่านคอยล์จึงเย็นลง',
      color: '#2196F3'
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '0.5rem' }}>
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-gradient-ac" style={{ marginBottom: 0, fontSize: '2rem' }}>แผนภาพวัฏจักรความเย็น</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Interactive Refrigeration Cycle</p>
        </div>
      </div>

      <div className="equipment-card" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)' }}>
          คลิกที่ส่วนประกอบในแผนภาพเพื่อดูข้อมูลการทำงาน (Click on components)
        </p>

        {/* CSS-based Schematic Diagram */}
        <div style={{ position: 'relative', width: '100%', height: '400px', background: 'var(--bg-tertiary)', borderRadius: '12px', padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          
          {/* Evaporator (Top) */}
          <div 
            onClick={() => setActivePart('evaporator')}
            style={{ margin: '0 auto', width: '200px', padding: '1rem', background: '#2196F3', color: 'white', borderRadius: '8px', cursor: 'pointer', border: activePart === 'evaporator' ? '3px solid white' : 'none', zIndex: 2, position: 'relative' }}
          >
            <strong>คอยล์เย็น (Evaporator)</strong>
            <div style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>ดูดความร้อน (ในห้อง)</div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', position: 'relative', zIndex: 2 }}>
            {/* Expansion Valve (Left) */}
            <div 
              onClick={() => setActivePart('expansion')}
              style={{ width: '150px', padding: '1rem', background: '#9C27B0', color: 'white', borderRadius: '8px', cursor: 'pointer', border: activePart === 'expansion' ? '3px solid white' : 'none' }}
            >
              <strong>Expansion Valve</strong>
              <div style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>ลดความดัน</div>
            </div>

            {/* Compressor (Right) */}
            <div 
              onClick={() => setActivePart('compressor')}
              style={{ width: '150px', padding: '1rem', background: '#F44336', color: 'white', borderRadius: '8px', cursor: 'pointer', border: activePart === 'compressor' ? '3px solid white' : 'none' }}
            >
              <strong>Compressor</strong>
              <div style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>อัดความดัน</div>
            </div>
          </div>

          {/* Condenser (Bottom) */}
          <div 
            onClick={() => setActivePart('condenser')}
            style={{ margin: '0 auto', width: '200px', padding: '1rem', background: '#FF9800', color: 'white', borderRadius: '8px', cursor: 'pointer', border: activePart === 'condenser' ? '3px solid white' : 'none', zIndex: 2, position: 'relative' }}
          >
            <strong>คอยล์ร้อน (Condenser)</strong>
            <div style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>ระบายความร้อน (นอกห้อง)</div>
          </div>

          {/* Connecting Lines */}
          <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1, pointerEvents: 'none' }}>
            <path d="M 400 60 L 600 60 L 600 200" stroke="#F44336" strokeWidth="4" fill="none" strokeDasharray="5,5" />
            <path d="M 600 200 L 600 340 L 400 340" stroke="#FF9800" strokeWidth="4" fill="none" />
            <path d="M 400 340 L 200 340 L 200 200" stroke="#9C27B0" strokeWidth="4" fill="none" />
            <path d="M 200 200 L 200 60 L 400 60" stroke="#2196F3" strokeWidth="4" fill="none" strokeDasharray="5,5" />
          </svg>
        </div>

        {activePart && (
          <div className="animate-fade-in" style={{ marginTop: '2rem', padding: '1.5rem', background: 'var(--bg-secondary)', borderLeft: `5px solid ${partsInfo[activePart].color}`, borderRadius: '8px', textAlign: 'left' }}>
            <h3 style={{ color: partsInfo[activePart].color, marginBottom: '0.5rem' }}>{partsInfo[activePart].title}</h3>
            <p style={{ color: 'var(--text-primary)', lineHeight: '1.6' }}>{partsInfo[activePart].desc}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InteractiveSchematic;
