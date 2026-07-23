import React from 'react';
import { RefreshCcw, AlertTriangle } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Uncaught Error:', error, errorInfo);
  }

  handleHardReset = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (let registration of registrations) {
          registration.unregister();
        }
      });
    }
    caches.keys().then((names) => {
      for (let name of names) {
        caches.delete(name);
      }
    });
    setTimeout(() => {
      window.location.reload(true);
    }, 300);
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0F172A',
          color: '#F8FAFC',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <AlertTriangle size={64} color="#EF4444" style={{ marginBottom: '1.5rem' }} />
          <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem', color: '#EF4444' }}>
            พบการอัปเดตระบบหรือข้อผิดพลาดชั่วคราว
          </h2>
          <p style={{ color: '#94A3B8', maxWidth: '500px', lineHeight: '1.6', marginBottom: '2rem' }}>
            เกิดการอัปเดตเวอร์ชันใหม่ทำให้ไฟล์ในเบราว์เซอร์เก่าไม่ตรงกัน กรุณากดปุ่มด้านล่างเพื่อล้างแคชและโหลดข้อมูลเวอร์ชันล่าสุด
          </p>
          <button
            onClick={this.handleHardReset}
            style={{
              background: '#0080FF',
              color: 'white',
              border: 'none',
              padding: '1rem 2rem',
              borderRadius: '8px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              boxShadow: '0 4px 14px rgba(0, 128, 255, 0.4)'
            }}
          >
            <RefreshCcw size={20} /> ล้างแคชและอัปเดตระบบทันที (Auto Recovery)
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
