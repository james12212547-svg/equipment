import React from 'react';
import { Bell, CheckCircle, Info, Calendar, ShieldAlert } from 'lucide-react';
import useStore from '../store/useStore';
import { markNotificationReadDB } from '../utils/db';
import { useNavigate } from 'react-router-dom';

const Notifications = () => {
  const notifications = useStore(state => state.notifications) || [];
  const navigate = useNavigate();

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await markNotificationReadDB(notification.id);
    }
    if (notification.type === 'schedule_assigned') navigate('/schedule');
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter(n => !n.isRead);
    for (const n of unread) {
      await markNotificationReadDB(n.id);
    }
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="text-gradient" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>การแจ้งเตือน</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Notifications</p>
        </div>
        {notifications.some(n => !n.isRead) && (
          <button 
            onClick={markAllAsRead}
            style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'var(--text-primary)', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}
          >
            อ่านทั้งหมดแล้ว
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-tertiary)', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <Bell size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
          <h3>ไม่มีการแจ้งเตือนใหม่</h3>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {notifications.map(notification => (
            <div 
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
                          style={{ 
                background: notification.type === 'security_alert' 
                  ? 'rgba(239,68,68,0.08)'
                  : notification.isRead ? 'var(--bg-secondary)' : 'var(--bg-tertiary)',
                border: `1px solid ${notification.type === 'security_alert' ? 'rgba(239,68,68,0.5)' : notification.isRead ? 'var(--border-color)' : 'var(--accent-primary)'}`,
                padding: '1.25rem',
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'flex',
                gap: '1rem',
                alignItems: 'flex-start',
                transition: 'all 0.2s ease',
                opacity: notification.isRead ? 0.7 : 1
              }}
            >
              <div style={{ 
                background: notification.type === 'security_alert'
                  ? 'rgba(239,68,68,0.15)'
                  : notification.type === 'schedule_assigned' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255, 255, 255, 0.1)', 
                color: notification.type === 'security_alert'
                  ? '#ef4444'
                  : notification.type === 'schedule_assigned' ? '#3b82f6' : 'var(--text-primary)',
                padding: '0.75rem', 
                borderRadius: '50%'
              }}>
                {notification.type === 'security_alert' 
                  ? <ShieldAlert size={24} />
                  : notification.type === 'schedule_assigned' ? <Calendar size={24} /> : <Info size={24} />}
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                  <h4 style={{ margin: 0, color: notification.type === 'security_alert' ? '#ef4444' : 'var(--text-primary)', fontSize: '1.05rem' }}>
                    {notification.type === 'security_alert' ? '🔒 Security Alert' : notification.title}
                  </h4>
                  {!notification.isRead && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: notification.type === 'security_alert' ? '#ef4444' : 'var(--accent-primary)', flexShrink: 0, marginTop: '6px' }} />}
                </div>
                <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.4' }}>{notification.message}</p>
                {notification.type === 'security_alert' && notification.email && (
                  <p style={{ margin: '0 0 0.5rem 0', color: '#ef4444', fontSize: '0.8rem' }}>อีเมล: {notification.email} | พยายาม: {notification.attempts} ครั้ง</p>
                )}
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                  {new Date(notification.createdAt).toLocaleString('th-TH')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
