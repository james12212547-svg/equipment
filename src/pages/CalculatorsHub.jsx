import { Link } from 'react-router-dom';
import { Calculator, Thermometer, Zap, ShieldAlert, ListChecks, Lightbulb, Cylinder, Cpu } from 'lucide-react';

const CalculatorsHub = () => {
  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>เครื่องมือคำนวณ</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        รวบรวมโปรแกรมคำนวณทางวิศวกรรมไฟฟ้าและเครื่องกลอัตโนมัติ เพื่อให้การทำงานของคุณง่ายขึ้น
      </p>

      <div className="grid-2">
        {/* BTU Air Con */}
        <Link to="/learning/btu" className="category-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '50%', color: 'var(--text-primary)' }}>
              <Thermometer size={48} />
            </div>
          </div>
          <div className="category-card-content" style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>คำนวณ BTU แอร์</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>คำนวณขนาดแอร์ที่เหมาะสมกับขนาดห้องและทิศทางแดด</p>
          </div>
        </Link>

        {/* General Appliance Cost */}
        <Link to="/learning/appliance-cost" className="category-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '50%', color: 'var(--text-primary)' }}>
              <Zap size={48} />
            </div>
          </div>
          <div className="category-card-content" style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>คำนวณค่าไฟอุปกรณ์ทุกชนิด</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>คำนวณค่าไฟปั๊มน้ำ, EV, เครื่องทำน้ำอุ่น, ตู้เย็น และอุปกรณ์รวมในบ้าน</p>
          </div>
        </Link>

        {/* Solar ROI */}
        <Link to="/learning/calculator" className="category-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '50%', color: 'var(--text-primary)' }}>
              <Calculator size={48} />
            </div>
          </div>
          <div className="category-card-content" style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>โซลาร์เซลล์ (ROI)</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>คำนวณจำนวนแผงที่ต้องใช้ และระยะเวลาคืนทุน</p>
          </div>
        </Link>

        {/* Cable Sizing */}
        <Link to="/learning/cable" className="category-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '50%', color: 'var(--text-primary)' }}>
              <Zap size={48} />
            </div>
          </div>
          <div className="category-card-content" style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>คำนวณขนาดสายไฟ</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>หาขนาดสายไฟและเบรกเกอร์ตามมาตรฐาน วสท.</p>
          </div>
        </Link>

        {/* PFC */}
        <Link to="/learning/pfc" className="category-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '50%', color: 'var(--text-primary)' }}>
              <Zap size={48} />
            </div>
          </div>
          <div className="category-card-content" style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>คำนวณ PFC</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>คำนวณขนาด Capacitor Bank เพื่อแก้ค่า Power Factor</p>
          </div>
        </Link>

        {/* Voltage Drop */}
        <Link to="/learning/voltage-drop" className="category-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '50%', color: 'var(--text-primary)' }}>
              <ShieldAlert size={48} />
            </div>
          </div>
          <div className="category-card-content" style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>คำนวณแรงดันตก</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Voltage Drop Calculator สำหรับการเดินสายไฟระยะไกล</p>
          </div>
        </Link>

        {/* Load Schedule */}
        <Link to="/learning/load-schedule" className="category-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '50%', color: 'var(--text-primary)' }}>
              <ListChecks size={48} />
            </div>
          </div>
          <div className="category-card-content" style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>จัดตารางโหลด</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Load Schedule & Phase Balancing สำหรับไฟ 3 เฟส</p>
          </div>
        </Link>

        {/* Lighting */}
        <Link to="/learning/lighting" className="category-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '50%', color: 'var(--text-primary)' }}>
              <Lightbulb size={48} />
            </div>
          </div>
          <div className="category-card-content" style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>คำนวณแสงสว่าง</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>คำนวณจำนวนหลอดไฟเพื่อความสว่างที่พอดี</p>
          </div>
        </Link>

        {/* Conduit */}
        <Link to="/learning/conduit" className="category-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '50%', color: 'var(--text-primary)' }}>
              <Cylinder size={48} />
            </div>
          </div>
          <div className="category-card-content" style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>คำนวณท่อร้อยสาย</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>หาขนาดท่อ PVC/EMT ให้พอดีกับจำนวนสายไฟ (Max 40%)</p>
          </div>
        </Link>

        {/* Motor */}
        <Link to="/learning/motor" className="category-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '50%', color: 'var(--text-primary)' }}>
              <Cpu size={48} />
            </div>
          </div>
          <div className="category-card-content" style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>คำนวณอุปกรณ์มอเตอร์</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>สเปค Breaker, Contactor, OLR, และสายไฟ (DOL / Star-Delta)</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default CalculatorsHub;
