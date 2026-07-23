import React, { useState, useEffect, useRef } from 'react';
import { Award, CheckCircle2, Clock, HelpCircle, Trophy, Zap, AlertTriangle, RefreshCw, Printer, ArrowLeft, ShieldCheck, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { thaiBahtText } from '../utils/thaiBaht';

// Quiz Scenarios
const GAME_LEVELS = [
  {
    level: 1,
    title: '🟢 ระดับที่ 1: ตรวจเช็คระบบไฟฟ้าแอร์เบื้องต้น (Basic Diagnostic)',
    scenarios: [
      {
        question: 'แอร์บ้าน Inverter เปิดไม่ติด ไฟหน้าเครื่องดับหมด ใช้มัลติมิเตอร์วัดไฟที่เต้ารับพบว่ามีไฟ 230V ปกติ แต่เปิดแอร์ไม่ติด ควรตรวจสอบอุปกรณ์ใดเป็นอันดับแรก?',
        options: [
          'A. เปลี่ยนคอมเพรสเซอร์แอร์ทันที',
          'B. ตรวจสอบฟิวส์บนแผงควบคุมหลัก PCB และเบรกเกอร์ย่อย',
          'C. เติมน้ำยาแอร์เพิ่ม 50 PSI',
          'D. เปลี่ยนแผงคอยล์ร้อน'
        ],
        correct: 1,
        explanation: 'หากแรงดันไฟเข้าเต้ารับปกติแต่เครื่องไม่ทำงานเลย ต้องเช็คฟิวส์หลอดบนแผง PCB คอยล์เย็นก่อนว่าขาดหรือไม่'
      },
      {
        question: 'คอมเพรสเซอร์แอร์มีเสียงครางฮึ่มๆ แต่พัดลมไม่หมุน และคอมเพรสเซอร์ตัดดับเพราะความร้อนสูง อาการนี้เกิดจากอะไร?',
        options: [
          'A. คาปาซิเตอร์รัน (Capacitor) เสื่อมสภาพ/ค่าความจุลดลง',
          'B. น้ำยาแอร์เกินพิกัด',
          'C. ท่อแอร์ตัน',
          'D. สวิตช์แรงดันเสีย'
        ],
        correct: 0,
        explanation: 'อาการคอมพัดหมุนไม่ได้ ครางฮึ่มและร้อนตัด เกิดจากคาปาซิเตอร์สตาร์ท/รันเสื่อมสภาพเป็นอันดับ 1'
      }
    ]
  },
  {
    level: 2,
    title: '🟡 ระดับที่ 2: วิเคราะห์วงจรอินเวอร์เตอร์ & Power Factor (Intermediate)',
    scenarios: [
      {
        question: 'แอร์ Inverter ขึ้น Error Code CH21 (DC Peak Current) และวัดความต้านทานขดลวด U-V-W ของคอมเพรสเซอร์ได้เท่ากันทุกคู่ 1.2 โอห์ม ไม่ลัดวงจรลงดิน อุปกรณ์ใดมีโอกาสชำรุดมากที่สุด?',
        options: [
          'A. มอดูล IPM บนแผงควบคุมอินเวอร์เตอร์คอยล์ร้อนลัดวงจร',
          'B. วาล์วฉีดน้ำยาอุดตัน',
          'C. ฟิลเตอร์กรองฝุ่นอุดตัน',
          'D. เซนเซอร์น้ำยาหลุด'
        ],
        correct: 0,
        explanation: 'หากคอมเพรสเซอร์ขดลวดปกติแต่กินกระแส DC Peak เกินพิกัด เกิดจากไอซีมอดูล IPM บนแผงคอยล์ร้อนชำรุด'
      },
      {
        question: 'โรงงานมีค่า Power Factor เท่ากับ 0.72 (ต่ำกว่าเกณฑ์การไฟฟ้า 0.85) ทำให้ถูกปรับค่าพาวเวอร์แฟกเตอร์ วิศวกรควรติดตั้งอุปกรณ์ใด?',
        options: [
          'A. ติดตั้ง Capacitor Bank ร่วมกับ Power Factor Controller',
          'B. ติดตั้งหม้อแปลงเพิ่มอีก 1 ลูก',
          'C. เพิ่มขนาดเบรกเกอร์เมน',
          'D. เปลี่ยนสายไฟเป็น THW'
        ],
        correct: 0,
        explanation: 'การปรับปรุงค่า Power Factor ทำได้โดยการติดตั้งตู้ Capacitor Bank เพื่อจ่ายกำลังไฟฟ้ารีแอกทีฟ (kVAR) ชดเชย'
      }
    ]
  },
  {
    level: 3,
    title: '🔴 ระดับที่ 3: วิศวกรผู้เชี่ยวชาญโซลาร์ไมโครกริด (Master Engineer)',
    scenarios: [
      {
        question: 'ระบบ Solar Rooftop 10kW On-Grid เกิดอาการ Inverter ตัดการทำงานบ่อยครั้งในช่วงเที่ยงวัน วัดแรงดันไฟฝั่ง AC พบสูงถึง 254V (เกินเกณฑ์ PEA 242V) เกิดจากอะไรและแก้ไขอย่างไร?',
        options: [
          'A. เกิด Grid Overvoltage จากสายไฟหม้อแปลงเล็ก/ยาวเกินไป ต้องปรับ tap หม้อแปลง หรือเพิ่มขนาดสายเมน AC',
          'B. แผงโซลาร์เสื่อมสภาพ ต้องเปลี่ยนแผงใหม่',
          'C. อินเวอร์เตอร์ไหม้',
          'D. เติมน้ำยาแอร์คูลลิ่งให้แผง'
        ],
        correct: 0,
        explanation: 'ช่วงเที่ยงโซลาร์ฉีดกระแสเข้าสายเมนสูง หากสายเมนยาวหรือความต้านทานสูง จะทำให้ดันแรงดันดันไฟ AC สูงเกินเกณฑ์ป้องกันของอินเวอร์เตอร์'
      }
    ]
  }
];

const GamifiedSimulator = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [currentScenarioIdx, setCurrentScenarioIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);

  const studentName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'วิศวกรผู้ฝึกหัด';
  const currentLevel = GAME_LEVELS[currentLevelIdx];
  const currentScenario = currentLevel.scenarios[currentScenarioIdx];

  // Countdown Timer
  useEffect(() => {
    if (gameOver || isAnswered) return;
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timer);
          handleAnswer(-1); // Time out
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [currentLevelIdx, currentScenarioIdx, isAnswered, gameOver]);

  const handleAnswer = (optionIdx) => {
    if (isAnswered) return;
    setSelectedOption(optionIdx);
    setIsAnswered(true);

    if (optionIdx === currentScenario.correct) {
      setScore(s => s + 100 + timeLeft * 2);
      toast.success('🎉 ถูกต้อง! +100 คะแนน');
    } else {
      toast.error('❌ ตอบผิด!');
    }
  };

  const handleNext = () => {
    setIsAnswered(false);
    setSelectedOption(null);
    setTimeLeft(60);

    if (currentScenarioIdx < currentLevel.scenarios.length - 1) {
      setCurrentScenarioIdx(s => s + 1);
    } else if (currentLevelIdx < GAME_LEVELS.length - 1) {
      setCurrentLevelIdx(l => l + 1);
      setCurrentScenarioIdx(0);
      toast.success(`👍 ผ่านด่าน! ขึ้นสู่ ${GAME_LEVELS[currentLevelIdx + 1].title}`);
    } else {
      setGameOver(true);
      toast.success('🏆 ยินดีด้วย! คุณทดสอบผ่านครบทุกด่านแล้ว');
    }
  };

  const handlePrintCertificate = () => {
    window.print();
  };

  // CERTIFICATE PRINT VIEW
  if (showCertificate) {
    return (
      <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
        <style>{`
          @media print {
            .no-print { display: none !important; }
            body { background: white !important; color: black !important; }
            .nav-bar, .chatbot-btn { display: none !important; }
            .cert-container { padding: 0 !important; border: 10px solid #b45309 !important; }
          }
        `}</style>

        <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <button onClick={() => setShowCertificate(false)} style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            <ArrowLeft size={18} /> กลับไปที่หน้าเกม
          </button>
          <button onClick={handlePrintCertificate} className="primary-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Printer size={18} /> พิมพ์ใบประกาศนียบัตร (PDF)
          </button>
        </div>

        {/* Certificate Layout */}
        <div
          className="cert-container"
          style={{
            background: 'linear-gradient(135deg, #fffbeb 0%, #ffffff 100%)',
            color: '#0f172a',
            padding: '4rem 3rem',
            maxWidth: '900px',
            margin: '0 auto',
            borderRadius: '12px',
            border: '12px double #b45309',
            boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
            textAlign: 'center',
            fontFamily: 'Prompt, sans-serif',
            position: 'relative',
          }}
        >
          <div style={{ position: 'absolute', top: 20, right: 30, fontSize: '0.8rem', color: '#78350f', fontWeight: 'bold' }}>
            CERT-ID: ENG-2026-MASTER-{Math.floor(1000 + Math.random() * 9000)}
          </div>

          <Award size={70} color="#d97706" style={{ margin: '0 auto 1rem' }} />

          <span style={{ textTransform: 'uppercase', letterSpacing: '4px', fontSize: '0.9rem', color: '#b45309', fontWeight: 800 }}>
            Official Engineering Certification of Excellence
          </span>

          <h1 style={{ fontSize: '2.5rem', color: '#0f172a', margin: '0.5rem 0 1.5rem', fontWeight: 800 }}>
            ใบประกาศนียบัตรความเป็นเลิศทางวิศวกรรม
          </h1>

          <p style={{ fontSize: '1.1rem', color: '#475569', margin: 0 }}>ขอมอบใบประกาศนียบัตรฉบับนี้เพื่อแสดงว่า</p>

          <h2 style={{ fontSize: '2.4rem', color: '#b45309', margin: '1rem 0', fontWeight: 800, textDecoration: 'underline' }}>
            คุณ {studentName}
          </h2>

          <p style={{ fontSize: '1.05rem', color: '#334155', maxWidth: '700px', margin: '0 auto 2rem', lineHeight: 1.7 }}>
            ได้ผ่านการทดสอบจำลองสถานการณ์แก้ไขปัญหาวิศวกรรมไฟฟ้า เครื่องกล และโซลาร์เซลล์ขั้นสูง (Engineering Diagnostic Simulator)
            ด้วยคะแนนประเมินระดับเกียรตินิยม <strong>{score} คะแนน</strong>
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', marginTop: '3rem', paddingTop: '2rem', borderTop: '2px solid #cbd5e1' }}>
            <div>
              <div style={{ height: '45px', borderBottom: '1px solid #000', marginBottom: '0.4rem' }} />
              <p style={{ margin: 0, fontWeight: 'bold', fontSize: '0.95rem' }}>ประธานคณะกรรมการผู้ทรงคุณวุฒิ</p>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>สมาคมวิศวกรรมเทคโนโลยีไทย</p>
            </div>
            <div>
              <div style={{ height: '45px', borderBottom: '1px solid #000', marginBottom: '0.4rem' }} />
              <p style={{ margin: 0, fontWeight: 'bold', fontSize: '0.95rem' }}>หัวหน้าทีมผู้ตรวจการฝึกงาน</p>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>วันที่ออกใบรับรอง: {new Date().toLocaleDateString('th-TH')}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '4rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Trophy color="var(--accent-solar)" size={28} />
            <h1 className="text-gradient-solar" style={{ fontSize: '2.3rem', marginBottom: 0 }}>Gamified Diagnostic Simulator</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            เกมจำลองแก้ปัญหาวิศวกรรมจับเวลา แข่งขันสะสมคะแนน และรับใบประกาศนียบัตร
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ background: 'rgba(245, 158, 11, 0.15)', border: '1px solid #f59e0b', color: '#f59e0b', padding: '0.5rem 1rem', borderRadius: '50px', fontWeight: 'bold' }}>
            🏆 คะแนนสะสม: {score}
          </div>
        </div>
      </div>

      {!gameOver ? (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          
          {/* Level Header Card */}
          <div className="equipment-card" style={{ padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 'bold', color: 'var(--accent-primary)', fontSize: '1rem' }}>{currentLevel.title}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: timeLeft <= 10 ? '#ef4444' : 'var(--text-primary)', fontWeight: 'bold' }}>
              <Clock size={18} /> {timeLeft}s
            </div>
          </div>

          {/* Scenario Question Card */}
          <div className="equipment-card" style={{ padding: '2rem', marginBottom: '1.5rem', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
              โจทย์ข้อที่ {currentScenarioIdx + 1} / {currentLevel.scenarios.length}
            </span>
            <h3 style={{ color: 'var(--text-primary)', marginTop: '0.5rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              {currentScenario.question}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {currentScenario.options.map((opt, idx) => {
                let btnBg = 'var(--bg-secondary)';
                let border = '1px solid var(--border-color)';
                let color = 'var(--text-primary)';

                if (isAnswered) {
                  if (idx === currentScenario.correct) {
                    btnBg = 'rgba(16, 185, 129, 0.2)';
                    border = '2px solid #10b981';
                    color = '#10b981';
                  } else if (idx === selectedOption) {
                    btnBg = 'rgba(239, 68, 68, 0.2)';
                    border = '2px solid #ef4444';
                    color = '#ef4444';
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    disabled={isAnswered}
                    style={{
                      padding: '1rem 1.25rem',
                      borderRadius: '10px',
                      background: btnBg,
                      border: border,
                      color: color,
                      fontWeight: 'bold',
                      textAlign: 'left',
                      cursor: isAnswered ? 'default' : 'pointer',
                      fontSize: '0.95rem',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {/* Explanation Footer */}
            {isAnswered && (
              <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: '8px', borderLeft: '4px solid var(--accent-solar)' }}>
                <strong style={{ color: 'var(--accent-solar)', display: 'block', marginBottom: '0.3rem' }}>💡 คำอธิบายทางวิศวกรรม:</strong>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{currentScenario.explanation}</p>
                
                <button
                  onClick={handleNext}
                  className="primary-btn"
                  style={{ marginTop: '1rem', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                >
                  ลุยโจทย์ข้อถัดไป 🚀
                </button>
              </div>
            )}
          </div>

        </div>
      ) : (
        /* Game Over & Certificate Unlock Screen */
        <div className="equipment-card animate-fade-in" style={{ padding: '3rem', textAlign: 'center', maxWidth: '700px', margin: '0 auto', border: '1px solid var(--accent-solar)' }}>
          <Trophy size={80} color="var(--accent-solar)" style={{ margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '2rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            🎉 ยินดีด้วยคุณ {studentName}!
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', marginBottom: '2rem' }}>
            คุณทดสอบผ่านเกณฑ์ประเมินสถานการณ์วิศวกรรมขั้นสูง ด้วยคะแนนรวม <strong>{score} คะแนน</strong>
          </p>

          <button
            onClick={() => setShowCertificate(true)}
            className="primary-btn"
            style={{ padding: '1rem 2.5rem', fontSize: '1.1rem', display: 'inline-flex', alignItems: 'center', gap: '0.6rem' }}
          >
            📜 รับใบประกาศนียบัตร PDF (Certificate)
          </button>
        </div>
      )}

    </div>
  );
};

export default GamifiedSimulator;
