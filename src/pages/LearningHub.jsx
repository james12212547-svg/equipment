import { Link } from 'react-router-dom';
import { Calculator, HelpCircle, Activity, SplitSquareHorizontal, Zap, Thermometer, Book, Box, ShieldAlert, ListChecks, TestTube, Sparkles, Radio } from 'lucide-react';

const LearningHub = () => {
  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>ศูนย์การเรียนรู้</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        พื้นที่สำหรับการเรียนรู้และทดสอบความรู้ทางวิศวกรรมไฟฟ้าและเครื่องกล
      </p>

      <h2 style={{ fontSize: '1.4rem', margin: '2rem 0 1rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>1. หมวดการโต้ตอบ & AI วิเคราะห์ (Interactive & AI)</h2>
      <div className="grid-2">
        <Link to="/ai-diagnostic" className="category-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '50%', color: 'var(--text-primary)' }}>
              <Sparkles size={48} />
            </div>
          </div>
          <div className="category-card-content" style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>AI วิเคราะห์อาการเสีย & Error Code</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>AI Visual & Compressor Audio Diagnostic</p>
          </div>
        </Link>

        <Link to="/learning/sld" className="category-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '50%', color: 'var(--text-primary)' }}>
              <Zap size={48} />
            </div>
          </div>
          <div className="category-card-content" style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>เขียนแบบไฟฟ้า Single Line Diagram (SLD)</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Interactive Electrical SLD Schematic Builder</p>
          </div>
        </Link>

        <Link to="/learning/solar-3d" className="category-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '50%', color: 'var(--text-primary)' }}>
              <Zap size={48} />
            </div>
          </div>
          <div className="category-card-content" style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>จำลองหลังคาโซลาร์ & เงาแสงแดด 3D</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>3D Roof & Sun Shadow Physics Simulator</p>
          </div>
        </Link>

        <Link to="/learning/game-sim" className="category-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '50%', color: 'var(--text-primary)' }}>
              <HelpCircle size={48} />
            </div>
          </div>
          <div className="category-card-content" style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>เกมส์จำลองซ่อมวิศวกรรม & ออกใบประกาศ</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Gamified Simulator & PDF Certificate</p>
          </div>
        </Link>

        <Link to="/learning/schematic" className="category-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '50%', color: 'var(--text-primary)' }}>
              <Activity size={48} />
            </div>
          </div>
          <div className="category-card-content" style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>แผนภาพวัฏจักรความเย็น</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Interactive Refrigeration Cycle</p>
          </div>
        </Link>

        <Link to="/learning/compare" className="category-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '50%', color: 'var(--text-primary)' }}>
              <SplitSquareHorizontal size={48} />
            </div>
          </div>
          <div className="category-card-content" style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>เปรียบเทียบสเปค</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Side-by-side Compare</p>
          </div>
        </Link>
      </div>

      <h2 style={{ fontSize: '1.4rem', margin: '3rem 0 1rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>2. หมวดการทดสอบ (Assessment)</h2>
      <div className="grid-2">
        <Link to="/learning/quiz" className="category-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '50%', color: 'var(--text-primary)' }}>
              <HelpCircle size={48} />
            </div>
          </div>
          <div className="category-card-content" style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>แบบทดสอบความรู้</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Engineering Quizzes</p>
          </div>
        </Link>

        <Link to="/learning/simulator" className="category-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '50%', color: 'var(--text-primary)' }}>
              <Activity size={48} />
            </div>
          </div>
          <div className="category-card-content" style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>จำลองซ่อมบำรุง</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Troubleshooting Sim</p>
          </div>
        </Link>
      </div>

      <h2 style={{ fontSize: '1.4rem', margin: '3rem 0 1rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>3. หมวดข้อมูลเชิงลึก (Deep Dive)</h2>
      <div className="grid-2">
        <Link to="/learning/glossary" className="category-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '50%', color: 'var(--text-primary)' }}>
              <Book size={48} />
            </div>
          </div>
          <div className="category-card-content" style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>พจนานุกรมศัพท์</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Glossary A-Z</p>
          </div>
        </Link>
      </div>

      <h2 style={{ fontSize: '1.4rem', margin: '3rem 0 1rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>4. หมวดเครื่องมือเฉพาะทาง (Specialized Tools)</h2>
      <div className="grid-2">
        <Link to="/learning/lab-logger" className="category-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '50%', color: 'var(--text-primary)' }}>
              <TestTube size={48} />
            </div>
          </div>
          <div className="category-card-content" style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>บันทึกผลการทดลอง</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Lab Experiment Logger</p>
          </div>
        </Link>

        <Link to="/learning/telemetry" className="category-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '50%', color: 'var(--text-primary)' }}>
              <Radio size={48} />
            </div>
          </div>
          <div className="category-card-content" style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>จำลองเซนเซอร์เรียลไทม์</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>IoT & Modbus Telemetry Simulator</p>
          </div>
        </Link>
      </div>

    </div>
  );
};

export default LearningHub;
