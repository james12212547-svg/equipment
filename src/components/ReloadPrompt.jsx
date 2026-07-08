import React, { useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import toast from 'react-hot-toast';

function ReloadPrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered: ' + r)
    },
    onRegisterError(error) {
      console.log('SW registration error', error)
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  useEffect(() => {
    if (offlineReady) {
      toast.success('แอพนี้พร้อมใช้งานออฟไลน์แล้ว', {
        duration: 4000,
        position: 'bottom-left'
      });
      setOfflineReady(false);
    }
  }, [offlineReady, setOfflineReady]);

  useEffect(() => {
    if (needRefresh) {
      toast(
        (t) => (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span style={{ fontWeight: '500' }}>มีเวอร์ชันใหม่พร้อมใช้งาน</span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                onClick={() => {
                  updateServiceWorker(true);
                  toast.dismiss(t.id);
                }}
                style={{
                  background: 'var(--accent-primary)',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                กดอัปเดต
              </button>
              <button 
                onClick={() => {
                  close();
                  toast.dismiss(t.id);
                }}
                style={{
                  background: 'var(--bg-tertiary)',
                  color: 'var(--text-primary)',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer'
                }}
              >
                ปิด
              </button>
            </div>
          </div>
        ),
        {
          duration: Infinity, // don't auto close
          position: 'bottom-center',
          icon: '🚀',
        }
      );
    }
  }, [needRefresh, updateServiceWorker]);

  return null;
}

export default ReloadPrompt;
