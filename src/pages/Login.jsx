import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Lock, LogIn, ShieldAlert, User, HardHat, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('กรุณากรอกอีเมลและรหัสผ่าน');
      return;
    }
    
    setIsLoading(true);
    try {
      await login(email, password);
      // Let the protected routes handle redirection, but we can explicitly push to / here
      navigate('/');
    } catch (error) {
      // Error toast is handled in AuthContext
    } finally {
      setIsLoading(false);
    }
  };

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
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
      }}>
        
        <div style={{
          width: '64px',
          height: '64px',
          background: 'linear-gradient(135deg, #00F0FF 0%, #0080FF 100%)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
          color: 'white',
          boxShadow: '0 4px 20px rgba(0, 240, 255, 0.3)'
        }}>
          <HardHat size={32} />
        </div>

        <h1 style={{ margin: '0 0 0.5rem', fontSize: '1.8rem', color: 'var(--text-primary)' }}>Engineer Hub</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>ระบบจัดการงานช่างและวิศวกรรม</p>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          
          <div style={{ position: 'relative' }}>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="อีเมล (Email)..."
              style={{
                width: '100%',
                padding: '1rem 1rem 1rem 3rem',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-tertiary)',
                color: 'var(--text-primary)',
                fontSize: '1.1rem',
                outline: 'none',
                transition: 'border 0.3s'
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
              style={{
                width: '100%',
                padding: '1rem 1rem 1rem 3rem',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-tertiary)',
                color: 'var(--text-primary)',
                fontSize: '1.1rem',
                outline: 'none',
                transition: 'border 0.3s'
              }}
            />
            <Lock size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '1rem',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(135deg, #00F0FF 0%, #0080FF 100%)',
              color: 'white',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              opacity: isLoading ? 0.7 : 1,
              marginTop: '0.5rem'
            }}
          >
            {isLoading ? (
               <div style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            ) : (
              <>
                <LogIn size={20} />
                เข้าสู่ระบบ
              </>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-tertiary)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <Shield size={14} />
          <span>Secured by Firebase</span>
        </div>
      </div>
      
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Login;
