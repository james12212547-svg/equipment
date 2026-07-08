import { Link } from 'react-router-dom';
import { Calculator, Thermometer, Zap, ShieldAlert, ListChecks } from 'lucide-react';

const CalculatorsHub = () => {
  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>เครื่องมือคำนวณ</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        รวบรวมโปรแกรมคำนวณทางวิศวกรรมไฟฟ้าและเครื่องกลอัตโนมัติ เพื่อให้การทำงานของคุณง่ายขึ้น
      </p>

      <div className="grid-2">
        <Link to="/learning/btu" className="category-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <div style={{ background: 'rgba(0, 240, 255, 0.1)', padding: '1rem', borderRadius: '50%', color: 'var(--accent-ac)' }}>
              <Thermometer size={48} />
            </div>
          </div>
          <div className="category-card-content" style={{ textAlign: 'center' }}>
            <h3 className="text-gradient-ac" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>คำนวณ BTU แอร์</h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem' }}>คำนวณขนาดแอร์ที่เหมาะสมกับขนาดห้องและทิศทางแดด</p>
          </div>
        </Link>

        <Link to="/learning/calculator" className="category-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <div style={{ background: 'rgba(255, 165, 0, 0.1)', padding: '1rem', borderRadius: '50%', color: 'var(--accent-solar)' }}>
              <Calculator size={48} />
            </div>
          </div>
          <div className="category-card-content" style={{ textAlign: 'center' }}>
            <h3 className="text-gradient-solar" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>โซลาร์เซลล์ (ROI)</h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem' }}>คำนวณจำนวนแผงที่ต้องใช้ และระยะเวลาคืนทุน</p>
          </div>
        </Link>

        <Link to="/learning/cable" className="category-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <div style={{ background: 'rgba(255, 165, 0, 0.1)', padding: '1rem', borderRadius: '50%', color: 'var(--accent-solar)' }}>
              <Zap size={48} />
            </div>
          </div>
          <div className="category-card-content" style={{ textAlign: 'center' }}>
            <h3 className="text-gradient-solar" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>คำนวณขนาดสายไฟ</h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem' }}>หาขนาดสายไฟและเบรกเกอร์ตามมาตรฐาน วสท.</p>
          </div>
        </Link>

        <Link to="/learning/pfc" className="category-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <div style={{ background: 'rgba(255, 165, 0, 0.1)', padding: '1rem', borderRadius: '50%', color: 'var(--accent-solar)' }}>
              <Zap size={48} />
            </div>
          </div>
          <div className="category-card-content" style={{ textAlign: 'center' }}>
            <h3 className="text-gradient-solar" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>คำนวณ PFC</h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem' }}>คำนวณขนาด Capacitor Bank เพื่อแก้ค่า Power Factor</p>
          </div>
        </Link>

        <Link to="/learning/voltage-drop" className="category-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <div style={{ background: 'rgba(255, 165, 0, 0.1)', padding: '1rem', borderRadius: '50%', color: 'var(--accent-solar)' }}>
              <ShieldAlert size={48} />
            </div>
          </div>
          <div className="category-card-content" style={{ textAlign: 'center' }}>
            <h3 className="text-gradient-solar" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>คำนวณแรงดันตก</h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem' }}>Voltage Drop Calculator สำหรับการเดินสายไฟระยะไกล</p>
          </div>
        </Link>

        <Link to="/learning/load-schedule" className="category-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <div style={{ background: 'rgba(255, 165, 0, 0.1)', padding: '1rem', borderRadius: '50%', color: 'var(--accent-solar)' }}>
              <ListChecks size={48} />
            </div>
          </div>
          <div className="category-card-content" style={{ textAlign: 'center' }}>
            <h3 className="text-gradient-solar" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>จัดตารางโหลด</h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem' }}>Load Schedule & Phase Balancing สำหรับไฟ 3 เฟส</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default CalculatorsHub;
