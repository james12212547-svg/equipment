import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Lock, LogIn, ShieldAlert, User, HardHat, Shield, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getLockStatus,
  recordFailedAttempt,
  clearFailedAttempts,
  formatLockTimer,
} from '../utils/security';
import { saveSecurityAlertDB } from '../utils/db';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lockStatus, setLockStatus] = useState({ locked: false, remainingMs: 0, attempts: 0 });
  const [timeDisplay, setTimeDisplay] = useState('');
  const timerRef = useRef(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Countdown timer
  useEffect(() => {
    if (!lockStatus.locked) { setTimeDisplay(''); return; }
    const tick = () => {
      const current = getLockStatus(email);
      if (!current.locked) { setLockStatus(current); clearInterval(timerRef.current); return; }
      setTimeDisplay(formatLockTimer(current.remainingMs));
      setLockStatus(current);
    };
    tick();
    timerRef.current = setInterval(tick, 1000);
    return () => clearInterval(timerRef.current);
  }, [lockStatus.locked, email]);

  const checkLock = (em) => {
    const s = getLockStatus(em || email);
    setLockStatus(s);
    return s.locked;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) { toast.error('กรุณากรอกอีเมลและรหัสผ่าน'); return; }
    if (checkLock(email)) { toast.error('บัญชีถูกล็อค กรุณารอ ' + timeDisplay); return; }

    setIsLoading(true);
    try {
      await login(email, password);
      clearFailedAttempts(email);
      navigate('/');
    } catch (error) {
      const newStatus = recordFailedAttempt(email);
      setLockStatus(newStatus);
      const remaining = 5 - newStatus.attempts;

      if (newStatus.locked) {
        // Alert admin via Firestore
        try {
          await saveSecurityAlertDB({
            message: `⚠️ บัญชี ${email} ถูกล็อคหลังพยายาม Login ผิด 5 ครั้ง`,
            email: email,
            attempts: newStatus.attempts,
          });
        } catch {}
        toast.error('🔒 บัญชีถูกล็อค 15 นาที เนื่องจากพยายาม Login ผิดหลายครั้ง', { duration: 6000 });
      } else if (remaining <= 2) {
        toast.error(`รหัสผ่านไม่ถูกต้อง ⚠️ เหลืออีก ${remaining} ครั้งก่อนถูกล็อค`, { duration: 4000 });
      } else {
        toast.error(`อีเมลหรือรหัสผ่านไม่ถูกต้อง (ครั้งที่ ${newStatus.attempts}/5)`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isLocked = lockStatus.locked;

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-primary)',
      padding: '1rem'
    }}>
      <div className="animate-fade-in equipment-card" style={{
        maxWidth: '400px',
        width: '100%',
        padding: '2.5rem 2rem',
        textAlign: 'center',
        background: 'var(--bg-secondary)',
        border: `1px solid ${isLocked ? 'rgba(239,68,68,0.5)' : 'var(--border-color)'}`,
        borderRadius: '16px',
        boxShadow: isLocked ? '0 10px 40px rgba(239,68,68,0.2)' : '0 10px 40px rgba(0,0,0,0.5)'
      }}>

        <div style={{
          width: '64px',
          height: '64px',
          background: isLocked
            ? 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)'
            : 'linear-gradient(135deg, #00F0FF 0%, #0080FF 100%)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
          color: 'white',
          boxShadow: isLocked ? '0 4px 20px rgba(239,68,68,0.4)' : '0 4px 20px rgba(0, 240, 255, 0.3)',
          transition: 'all 0.5s ease',
        }}>
          {isLocked ? <ShieldAlert size={32} /> : <HardHat size={32} />}
        </div>

        <h1 style={{ margin: '0 0 0.5rem', fontSize: '1.8rem', color: 'var(--text-primary)' }}>
          {isLocked ? 'บัญชีถูกล็อค' : 'Engineer Hub'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          {isLocked ? 'พยายาม Login ผิดเกินกำหนด' : 'ระบบจัดการงานช่างและวิศวกรรม'}
        </p>

        {/* Lockout Warning Banner */}
        {isLocked && (
          <div style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '10px',
            padding: '1rem',
            marginBottom: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            <AlertTriangle size={20} color="#ef4444" />
            <p style={{ color: '#ef4444', fontWeight: 700, margin: 0, fontSize: '0.9rem' }}>
              สามารถลองใหม่ได้ใน
            </p>
            <div style={{
              fontSize: '2.5rem',
              fontWeight: 800,
              color: '#ef4444',
              letterSpacing: '0.1em',
              fontVariantNumeric: 'tabular-nums',
            }}>
              {timeDisplay || '15:00'}
            </div>
            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem', margin: 0 }}>
              ระบบจะส่งแจ้งเตือนหาผู้ดูแลแล้ว
            </p>
          </div>
        )}

        {/* Attempt progress bar */}
        {!isLocked && lockStatus.attempts > 0 && (
          <div style={{ marginBottom: '1rem', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>ความพยายาม Login</span>
              <span style={{ fontSize: '0.78rem', color: lockStatus.attempts >= 4 ? '#ef4444' : '#f59e0b', fontWeight: 700 }}>
                {lockStatus.attempts} / 5
              </span>
            </div>
            <div style={{ background: 'var(--bg-tertiary)', borderRadius: '99px', height: '4px', overflow: 'hidden' }}>
              <div style={{
                width: `${(lockStatus.attempts / 5) * 100}%`,
                height: '100%',
                borderRadius: '99px',
                background: lockStatus.attempts >= 4 ? '#ef4444' : lockStatus.attempts >= 3 ? '#f59e0b' : '#3b82f6',
                transition: 'all 0.4s ease',
              }} />
            </div>
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); checkLock(e.target.value); }}
              placeholder="อีเมล (Email)..."
              disabled={isLocked}
              style={{
                width: '100%',
                padding: '1rem 1rem 1rem 3rem',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                background: isLocked ? 'rgba(239,68,68,0.05)' : 'var(--bg-tertiary)',
                color: 'var(--text-primary)',
                fontSize: '1.1rem',
                outline: 'none',
                transition: 'border 0.3s',
                opacity: isLocked ? 0.5 : 1,
              }}
            />
            <User size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          </div>

          <div style={{ position: 'relative' }}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="รหัสผ่าน (Password)..."
              disabled={isLocked}
              style={{
                width: '100%',
                padding: '1rem 1rem 1rem 3rem',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                background: isLocked ? 'rgba(239,68,68,0.05)' : 'var(--bg-tertiary)',
                color: 'var(--text-primary)',
                fontSize: '1.1rem',
                outline: 'none',
                transition: 'border 0.3s',
                opacity: isLocked ? 0.5 : 1,
              }}
            />
            <Lock size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          </div>

          <button
            type="submit"
            disabled={isLoading || isLocked}
            style={{
              width: '100%',
              padding: '1rem',
              borderRadius: '8px',
              border: 'none',
              background: isLocked
                ? 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)'
                : 'linear-gradient(135deg, #00F0FF 0%, #0080FF 100%)',
              color: 'white',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: (isLoading || isLocked) ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              opacity: (isLoading || isLocked) ? 0.7 : 1,
              marginTop: '0.5rem',
              transition: 'all 0.4s ease',
            }}
          >
            {isLoading ? (
              <div style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            ) : isLocked ? (
              <><ShieldAlert size={20} /> ถูกล็อค</>
            ) : (
              <><LogIn size={20} /> เข้าสู่ระบบ</>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-tertiary)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <Shield size={14} />
          <span>Protected · Max 5 attempts · Auto-lock 15 min</span>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Login;
