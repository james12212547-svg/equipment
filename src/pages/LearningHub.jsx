import { Link } from 'react-router-dom';
import { Calculator, HelpCircle, Activity, SplitSquareHorizontal, Zap, Thermometer, Book, Box, ShieldAlert, ListChecks, TestTube, Sparkles } from 'lucide-react';

const LearningHub = () => {
  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>ศูนย์การเรียนรู้</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        พื้นที่สำหรับการเรียนรู้และทดสอบความรู้ทางวิศวกรรมไฟฟ้าและเครื่องกล
      </p>

      {/* AI Scanner Banner */}
      <Link to="/ai-diagnostic" className="equipment-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem 2rem', marginBottom: '2.5rem', border: '1px solid var(--accent-primary)', background: 'linear-gradient(135deg, rgba(255, 115, 0, 0.15) 0%, rgba(0, 240, 255, 0.1) 100%)', textDecoration: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'var(--accent-primary)', padding: '0.85rem', borderRadius: '12px', color: 'white' }}>
            <Sparkles size={32} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.3rem', color: 'var(--text-primary)' }}>🤖 AI Smart Diagnostic & Trouble Code Scanner</h3>
            <p style={{ margin: '0.2rem 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              วิเคราะห์อาการเสียและ Error Code ด้วย AI รูปภาพถ่าย และคลื่นเสียงคอมเพรสเซอร์
            </p>
          </div>
        </div>
        <span style={{ padding: '0.6rem 1.2rem', borderRadius: '50px', background: 'var(--accent-primary)', color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>
          ลองใช้งานเลย 🚀
        </span>
      </Link>

      <h2 style={{ fontSize: '1.5rem', margin: '2rem 0 1rem', color: 'var(--text-primary)' }}>1. หมวดการโต้ตอบ & AI วิเคราะห์ (Interactive & AI)</h2>
      <div className="grid-2">
        <Link to="/ai-diagnostic" className="category-card" style={{ padding: '2rem', border: '1px solid var(--accent-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <div style={{ background: 'rgba(255, 115, 0, 0.15)', padding: '1rem', borderRadius: '50%', color: 'var(--accent-primary)' }}>
              <Sparkles size={48} />
            </div>
          </div>
          <div className="category-card-content" style={{ textAlign: 'center' }}>
            <h3 className="text-gradient-solar" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>AI วิเคราะห์อาการเสีย & Error Code</h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.85rem' }}>AI Visual & Compressor Audio Diagnostic</p>
          </div>
        </Link>

        <Link to="/learning/sld" className="category-card" style={{ padding: '2rem', border: '1px solid var(--accent-solar)' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <div style={{ background: 'rgba(255, 115, 0, 0.15)', padding: '1rem', borderRadius: '50%', color: 'var(--accent-solar)' }}>
              <Zap size={48} />
            </div>
          </div>
          <div className="category-card-content" style={{ textAlign: 'center' }}>
            <h3 className="text-gradient-solar" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>เขียนแบบไฟฟ้า Single Line Diagram (SLD)</h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.85rem' }}>Interactive Electrical SLD Schematic Builder</p>
          </div>
        </Link>

        <Link to="/learning/solar-3d" className="category-card" style={{ padding: '2rem', border: '1px solid var(--accent-solar)' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <div style={{ background: 'rgba(255, 115, 0, 0.15)', padding: '1rem', borderRadius: '50%', color: 'var(--accent-solar)' }}>
              <Zap size={48} />
            </div>
          </div>
          <div className="category-card-content" style={{ textAlign: 'center' }}>
            <h3 className="text-gradient-solar" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>จำลองหลังคาโซลาร์ & เงาแสงแดด 3D</h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.85rem' }}>3D Roof & Sun Shadow Physics Simulator</p>
          </div>
        </Link>

        <Link to="/learning/game-sim" className="category-card" style={{ padding: '2rem', border: '1px solid #f59e0b' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <div style={{ background: 'rgba(245, 158, 11, 0.15)', padding: '1rem', borderRadius: '50%', color: '#f59e0b' }}>
              <HelpCircle size={48} />
            </div>
          </div>
          <div className="category-card-content" style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#f59e0b' }}>เกมส์จำลองซ่อมวิศวกรรม & ออกใบประกาศ</h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.85rem' }}>Gamified Simulator & PDF Certificate</p>
          </div>
        </Link>

        <Link to="/learning/schematic" className="category-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <div style={{ background: 'rgba(0, 240, 255, 0.1)', padding: '1rem', borderRadius: '50%', color: 'var(--accent-ac)' }}>
              <Activity size={48} />
            </div>
          </div>
          <div className="category-card-content" style={{ textAlign: 'center' }}>
            <h3 className="text-gradient-ac" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>แผนภาพวัฏจักรความเย็น</h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.85rem' }}>Interactive Refrigeration Cycle</p>
          </div>
        </Link>
        <Link to="/learning/compare" className="category-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <div style={{ background: 'rgba(0, 240, 255, 0.1)', padding: '1rem', borderRadius: '50%', color: 'var(--accent-ac)' }}>
              <SplitSquareHorizontal size={48} />
            </div>
          </div>
          <div className="category-card-content" style={{ textAlign: 'center' }}>
            <h3 className="text-gradient-ac" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>เปรียบเทียบสเปค</h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.85rem' }}>Side-by-side Compare</p>
          </div>
        </Link>
      </div>



      <h2 style={{ fontSize: '1.5rem', margin: '3rem 0 1rem', color: 'var(--text-primary)' }}>2. หมวดการทดสอบ (Assessment)</h2>
      <div className="grid-2">
        <Link to="/learning/quiz" className="category-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <div style={{ background: 'rgba(0, 240, 255, 0.1)', padding: '1rem', borderRadius: '50%', color: 'var(--accent-ac)' }}>
              <HelpCircle size={48} />
            </div>
          </div>
          <div className="category-card-content" style={{ textAlign: 'center' }}>
            <h3 className="text-gradient-ac" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>แบบทดสอบความรู้</h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.85rem' }}>Engineering Quizzes</p>
          </div>
        </Link>
        <Link to="/learning/simulator" className="category-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <div style={{ background: 'rgba(255, 165, 0, 0.1)', padding: '1rem', borderRadius: '50%', color: 'var(--accent-solar)' }}>
              <Activity size={48} />
            </div>
          </div>
          <div className="category-card-content" style={{ textAlign: 'center' }}>
            <h3 className="text-gradient-solar" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>จำลองซ่อมบำรุง</h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.85rem' }}>Troubleshooting Sim</p>
          </div>
        </Link>
      </div>

      <h2 style={{ fontSize: '1.5rem', margin: '3rem 0 1rem', color: 'var(--text-primary)' }}>3. หมวดข้อมูลเชิงลึก (Deep Dive)</h2>
      <div className="grid-2">
        <Link to="/learning/glossary" className="category-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <div style={{ background: 'rgba(0, 240, 255, 0.1)', padding: '1rem', borderRadius: '50%', color: 'var(--accent-ac)' }}>
              <Book size={48} />
            </div>
          </div>
          <div className="category-card-content" style={{ textAlign: 'center' }}>
            <h3 className="text-gradient-ac" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>พจนานุกรมศัพท์</h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.85rem' }}>Glossary A-Z</p>
          </div>
        </Link>
        <Link to="/learning/3d" className="category-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <div style={{ background: 'rgba(255, 165, 0, 0.1)', padding: '1rem', borderRadius: '50%', color: 'var(--accent-solar)' }}>
              <Box size={48} />
            </div>
          </div>
          <div className="category-card-content" style={{ textAlign: 'center' }}>
            <h3 className="text-gradient-solar" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>โมเดลจำลอง 3 มิติ</h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.85rem' }}>3D Model Viewer</p>
          </div>
        </Link>
      </div>

      <h2 style={{ fontSize: '1.5rem', margin: '3rem 0 1rem', color: 'var(--text-primary)' }}>4. หมวดเครื่องมือเฉพาะทาง (Specialized Tools)</h2>
      <div className="grid-2">
        <Link to="/learning/lab-logger" className="category-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <div style={{ background: 'rgba(0, 240, 255, 0.1)', padding: '1rem', borderRadius: '50%', color: 'var(--accent-ac)' }}>
              <TestTube size={48} />
            </div>
          </div>
          <div className="category-card-content" style={{ textAlign: 'center' }}>
            <h3 className="text-gradient-ac" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>บันทึกผลการทดลอง</h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.85rem' }}>Lab Experiment Logger</p>
          </div>
        </Link>
      </div>

    </div>
  );
};

export default LearningHub;
