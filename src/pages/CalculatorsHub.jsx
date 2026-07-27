import { Link } from 'react-router-dom';
import { Calculator, Thermometer, Zap, ShieldAlert, ListChecks, Lightbulb, Cylinder, Cpu } from 'lucide-react';

const CalculatorsHub = () => {
  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>เครื่องมือคำนวณ</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        รวบรวมโปรแกรมคำนวณทางวิศวกรรมไฟฟ้าและเครื่องกลอัตโนมัติ เพื่อให้การทำงานของคุณง่ายขึ้น
      </p>

      <div className="grid-2">
        {/* BTU Air Con - Cyan / Blue */}
        <Link to="/learning/btu" className="category-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <div style={{ background: 'rgba(0, 240, 255, 0.15)', padding: '1rem', borderRadius: '50%', color: '#00f0ff' }}>
              <Thermometer size={48} />
            </div>
          </div>
          <div className="category-card-content" style={{ textAlign: 'center' }}>
            <h3 className="text-gradient-ac" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>คำนวณ BTU แอร์</h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem' }}>คำนวณขนาดแอร์ที่เหมาะสมกับขนาดห้องและทิศทางแดด</p>
          </div>
        </Link>

        {/* General Appliance Cost - Solar Yellow */}
        <Link to="/learning/appliance-cost" className="category-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <div style={{ background: 'rgba(245, 158, 11, 0.15)', padding: '1rem', borderRadius: '50%', color: '#f59e0b' }}>
              <Zap size={48} />
            </div>
          </div>
          <div className="category-card-content" style={{ textAlign: 'center' }}>
            <h3 className="text-gradient-solar" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>คำนวณค่าไฟอุปกรณ์ทุกชนิด</h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem' }}>คำนวณค่าไฟปั๊มน้ำ, EV, เครื่องทำน้ำอุ่น, ตู้เย็น และอุปกรณ์รวมในบ้าน</p>
          </div>
        </Link>

        {/* Solar ROI - Orange */}
        <Link to="/learning/calculator" className="category-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <div style={{ background: 'rgba(255, 115, 0, 0.15)', padding: '1rem', borderRadius: '50%', color: '#ff7300' }}>
              <Calculator size={48} />
            </div>
          </div>
          <div className="category-card-content" style={{ textAlign: 'center' }}>
            <h3 className="text-gradient-solar" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>โซลาร์เซลล์ (ROI)</h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem' }}>คำนวณจำนวนแผงที่ต้องใช้ และระยะเวลาคืนทุน</p>
          </div>
        </Link>

        {/* Cable Sizing - Orange */}
        <Link to="/learning/cable" className="category-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <div style={{ background: 'rgba(255, 115, 0, 0.15)', padding: '1rem', borderRadius: '50%', color: '#ff7300' }}>
              <Zap size={48} />
            </div>
          </div>
          <div className="category-card-content" style={{ textAlign: 'center' }}>
            <h3 className="text-gradient-solar" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>คำนวณขนาดสายไฟ</h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem' }}>หาขนาดสายไฟและเบรกเกอร์ตามมาตรฐาน วสท.</p>
          </div>
        </Link>

        {/* PFC - Orange */}
        <Link to="/learning/pfc" className="category-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <div style={{ background: 'rgba(255, 115, 0, 0.15)', padding: '1rem', borderRadius: '50%', color: '#ff7300' }}>
              <Zap size={48} />
            </div>
          </div>
          <div className="category-card-content" style={{ textAlign: 'center' }}>
            <h3 className="text-gradient-solar" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>คำนวณ PFC</h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem' }}>คำนวณขนาด Capacitor Bank เพื่อแก้ค่า Power Factor</p>
          </div>
        </Link>

        {/* Voltage Drop - Orange */}
        <Link to="/learning/voltage-drop" className="category-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <div style={{ background: 'rgba(255, 115, 0, 0.15)', padding: '1rem', borderRadius: '50%', color: '#ff7300' }}>
              <ShieldAlert size={48} />
            </div>
          </div>
          <div className="category-card-content" style={{ textAlign: 'center' }}>
            <h3 className="text-gradient-solar" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>คำนวณแรงดันตก</h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem' }}>Voltage Drop Calculator สำหรับการเดินสายไฟระยะไกล</p>
          </div>
        </Link>

        {/* Load Schedule - Orange */}
        <Link to="/learning/load-schedule" className="category-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <div style={{ background: 'rgba(255, 115, 0, 0.15)', padding: '1rem', borderRadius: '50%', color: '#ff7300' }}>
              <ListChecks size={48} />
            </div>
          </div>
          <div className="category-card-content" style={{ textAlign: 'center' }}>
            <h3 className="text-gradient-solar" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>จัดตารางโหลด</h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem' }}>Load Schedule & Phase Balancing สำหรับไฟ 3 เฟส</p>
          </div>
        </Link>

        {/* Lighting - Orange */}
        <Link to="/learning/lighting" className="category-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <div style={{ background: 'rgba(255, 115, 0, 0.15)', padding: '1rem', borderRadius: '50%', color: '#ff7300' }}>
              <Lightbulb size={48} />
            </div>
          </div>
          <div className="category-card-content" style={{ textAlign: 'center' }}>
            <h3 className="text-gradient-solar" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>คำนวณแสงสว่าง</h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem' }}>คำนวณจำนวนหลอดไฟเพื่อความสว่างที่พอดี</p>
          </div>
        </Link>

        {/* Conduit - Orange */}
        <Link to="/learning/conduit" className="category-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <div style={{ background: 'rgba(255, 115, 0, 0.15)', padding: '1rem', borderRadius: '50%', color: '#ff7300' }}>
              <Cylinder size={48} />
            </div>
          </div>
          <div className="category-card-content" style={{ textAlign: 'center' }}>
            <h3 className="text-gradient-solar" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>คำนวณท่อร้อยสาย</h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem' }}>หาขนาดท่อ PVC/EMT ให้พอดีกับจำนวนสายไฟ (Max 40%)</p>
          </div>
        </Link>

        {/* Motor - Orange */}
        <Link to="/learning/motor" className="category-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <div style={{ background: 'rgba(255, 115, 0, 0.15)', padding: '1rem', borderRadius: '50%', color: '#ff7300' }}>
              <Cpu size={48} />
            </div>
          </div>
          <div className="category-card-content" style={{ textAlign: 'center' }}>
            <h3 className="text-gradient-solar" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>คำนวณอุปกรณ์มอเตอร์</h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem' }}>สเปค Breaker, Contactor, OLR, และสายไฟ (DOL / Star-Delta)</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default CalculatorsHub;
