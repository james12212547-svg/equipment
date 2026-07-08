import { useState } from 'react';
import { Lock, LogIn, ShieldAlert } from 'lucide-react';

const Login = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === 'jaidum02357') {
      onLogin();
    } else {
      setError(true);
      setPassword('');
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
          <Lock size={32} />
        </div>

        <h1 style={{ margin: '0 0 0.5rem', fontSize: '1.8rem', color: 'var(--text-primary)' }}>ระบบจัดการส่วนตัว</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Private Engineering Hub</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div style={{ position: 'relative' }}>
            <input 
              type="password" 
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              placeholder="รหัสผ่านเข้าใช้งาน..."
              style={{
                width: '100%',
                padding: '1rem 1rem 1rem 3rem',
                borderRadius: '8px',
                border: `1px solid ${error ? '#F44336' : 'var(--border-color)'}`,
                background: 'var(--bg-tertiary)',
                color: 'var(--text-primary)',
                fontSize: '1.1rem',
                outline: 'none',
                transition: 'border 0.3s'
              }}
            />
            <Lock size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: error ? '#F44336' : 'var(--text-tertiary)' }} />
          </div>

          {error && (
            <div className="animate-fade-in" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#F44336', fontSize: '0.9rem', justifyContent: 'center' }}>
              <ShieldAlert size={16} /> รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่
            </div>
          )}

          <button 
            type="submit"
            style={{
              width: '100%',
              padding: '1rem',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(135deg, #00F0FF 0%, #0080FF 100%)',
              color: 'white',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              marginTop: '1rem',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 240, 255, 0.4)'}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
          >
            <LogIn size={20} /> เข้าสู่ระบบ
          </button>
        </form>
        
      </div>
    </div>
  );
};

export default Login;
