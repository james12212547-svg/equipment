import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Database, Sun, Moon, Info, HardDrive, MessageSquarePlus, Building2, Bell } from 'lucide-react';
import useStore from '../store/useStore';
import toast from 'react-hot-toast';
import { requestNotificationPermission } from '../utils/notifications';

const Settings = () => {
  const theme = useStore(state => state.theme);
  const toggleTheme = useStore(state => state.toggleTheme);
  const [storageInfo, setStorageInfo] = useState(null);
  
  // Tab state
  const [activeTab, setActiveTab] = useState('general'); // 'general' or 'feedback'
  
  // Feedback state
  const [feedback, setFeedback] = useState('');
  const [type, setType] = useState('feedback');

  // Company info (persisted to localStorage)
  const [company, setCompany] = useState({
    name: localStorage.getItem('companyName') || '',
    address: localStorage.getItem('companyAddress') || '',
    phone: localStorage.getItem('companyPhone') || '',
    tax: localStorage.getItem('companyTax') || '',
  });

  const [notifPermission, setNotifPermission] = useState(Notification?.permission || 'default');

  const saveCompanyInfo = () => {
    localStorage.setItem('companyName', company.name);
    localStorage.setItem('companyAddress', company.address);
    localStorage.setItem('companyPhone', company.phone);
    localStorage.setItem('companyTax', company.tax);
    toast.success('บันทึกข้อมูลบริษัทแล้ว!');
  };

  const handleRequestNotif = async () => {
    const result = await requestNotificationPermission();
    setNotifPermission(result);
    if (result === 'granted') toast.success('เปิดการแจ้งเตือนสำเร็จ!');
    else if (result === 'denied') toast.error('คุณปิดกั้นการแจ้งเตือนไว้ กรุณาเปิดในการตั้งค่าเบราว์เซอร์');
  };

  useEffect(() => {
    const checkStorage = async () => {
      if (navigator.storage && navigator.storage.estimate) {
        try {
          const estimate = await navigator.storage.estimate();
          setStorageInfo({
            usage: estimate.usage,
            quota: estimate.quota,
            percentage: ((estimate.usage / estimate.quota) * 100).toFixed(2)
          });
        } catch (error) {
          console.error("Storage estimation failed:", error);
        }
      }
    };
    checkStorage();
  }, []);

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    
    // Simulate sending feedback
    setTimeout(() => {
      toast.success('ขอบคุณสำหรับข้อเสนอแนะ! เราจะนำไปพัฒนาต่อครับ');
      setFeedback('');
    }, 500);
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <SettingsIcon size={32} color="var(--accent-primary)" />
        <h1 style={{ margin: 0, fontSize: '2rem', color: 'var(--text-primary)' }}>การตั้งค่า (Settings)</h1>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)', marginBottom: '2rem' }}>
        <button 
          onClick={() => setActiveTab('general')}
          style={{ 
            background: 'transparent', 
            border: 'none', 
            padding: '1rem 0', 
            color: activeTab === 'general' ? 'var(--accent-primary)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'general' ? '2px solid var(--accent-primary)' : '2px solid transparent',
            fontWeight: activeTab === 'general' ? '600' : '400',
            cursor: 'pointer',
            fontSize: '1.1rem',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <SettingsIcon size={20} />
          ทั่วไป
        </button>
        <button 
          onClick={() => setActiveTab('feedback')}
          style={{ 
            background: 'transparent', 
            border: 'none', 
            padding: '1rem 0', 
            color: activeTab === 'feedback' ? 'var(--accent-primary)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'feedback' ? '2px solid var(--accent-primary)' : '2px solid transparent',
            fontWeight: activeTab === 'feedback' ? '600' : '400',
            cursor: 'pointer',
            fontSize: '1.1rem',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <MessageSquarePlus size={20} />
          เสนอแนะ/แจ้งปัญหา
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {activeTab === 'general' && (
          <>
            {/* Company Info */}
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
                <Building2 size={24} /> ข้อมูลบริษัท / ร้าน
              </h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>ข้อมูลนี้จะแสดงบนใบเสนอราคาและใบแจ้งหนี้ที่คุณออก</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                {[
                  ['name', 'ชื่อบริษัท / ชื่อร้าน'],
                  ['phone', 'เบอร์โทรศัพท์'],
                  ['tax', 'เลขที่ผู้เสียภาษี (ถ้ามี)'],
                ].map(([key, label]) => (
                  <div key={key}>
                    <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{label}</label>
                    <input value={company[key]} onChange={e => setCompany(c => ({ ...c, [key]: e.target.value }))}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px' }} />
                  </div>
                ))}
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>ที่อยู่</label>
                  <input value={company.address} onChange={e => setCompany(c => ({ ...c, address: e.target.value }))}
                    placeholder="เลขที่ ถนน ตำบล อำเภอ จังหวัด" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px' }} />
                </div>
              </div>
              <button onClick={saveCompanyInfo}
                style={{ background: 'var(--accent-primary)', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                💾 บันทึกข้อมูลบริษัท
              </button>
            </div>

            {/* Notification Settings */}
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
                <Bell size={24} /> การแจ้งเตือนนัดหมาย
              </h2>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: '0 0 0.5rem', color: 'var(--text-secondary)' }}>แจ้งเตือนล่วงหน้าก่อนถึงงาน</h3>
                  <p style={{ margin: 0, color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>
                    สถานะ: <strong style={{ color: notifPermission === 'granted' ? '#10b981' : '#ef4444' }}>
                      {notifPermission === 'granted' ? '✅ เปิดใช้งานแล้ว' : notifPermission === 'denied' ? '❌ ถูกปิดกั้น' : '⏸ ยังไม่ได้เปิด'}
                    </strong>
                  </p>
                </div>
                {notifPermission !== 'granted' && (
                  <button onClick={handleRequestNotif}
                    style={{ background: 'var(--accent-primary)', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                    🔔 เปิดการแจ้งเตือน
                  </button>
                )}
              </div>
            </div>

            {/* Theme Settings */}
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
                {theme === 'dark' ? <Moon size={24} /> : <Sun size={24} />}
                ธีมแอปพลิเคชัน
              </h2>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: '0 0 0.5rem', color: 'var(--text-secondary)' }}>โหมดมืด / สว่าง</h3>
                  <p style={{ margin: 0, color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>ปรับสีแอปให้เหมาะสมกับสภาพแวดล้อมของคุณ</p>
                </div>
                <button 
                  onClick={toggleTheme}
                  style={{
                    background: 'var(--bg-tertiary)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-color)',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontWeight: 'bold',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {theme === 'dark' ? 'เปลี่ยนเป็นสว่าง' : 'เปลี่ยนเป็นมืด'}
                </button>
              </div>
            </div>

            {/* Storage Quota */}
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
                <HardDrive size={24} />
                พื้นที่เก็บข้อมูลออฟไลน์ (Storage Quota)
              </h2>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ margin: '0 0 1rem', color: 'var(--text-secondary)' }}>
                  แอปพลิเคชันนี้ทำงานแบบออฟไลน์ 100% ข้อมูลและรูปภาพจะถูกเก็บไว้ในอุปกรณ์ของคุณ
                </p>
                {storageInfo ? (
                  <div style={{ background: 'var(--bg-tertiary)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span>ใช้ไป: <strong>{formatBytes(storageInfo.usage)}</strong></span>
                      <span>ความจุทั้งหมด: <strong>{formatBytes(storageInfo.quota)}</strong></span>
                    </div>
                    
                    {/* Progress bar */}
                    <div style={{ width: '100%', height: '12px', background: 'var(--bg-primary)', borderRadius: '6px', overflow: 'hidden', marginBottom: '0.5rem' }}>
                      <div style={{ 
                        width: `${Math.min(100, storageInfo.percentage)}%`, 
                        height: '100%', 
                        background: storageInfo.percentage > 90 ? '#ef4444' : storageInfo.percentage > 70 ? '#f59e0b' : '#10b981',
                        transition: 'width 0.5s ease'
                      }}></div>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
                      ใช้พื้นที่ไปแล้ว {storageInfo.percentage}%
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', color: 'var(--text-tertiary)' }}>
                    กำลังคำนวณพื้นที่... หรือเบราว์เซอร์นี้ไม่รองรับการเช็คพื้นที่
                  </div>
                )}
              </div>

              <div style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: '8px', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <Info size={20} color="var(--accent-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-tertiary)', lineHeight: '1.6' }}>
                  <strong>ระบบบีบอัดรูปภาพอัตโนมัติเปิดใช้งานแล้ว:</strong> ทุกครั้งที่คุณอัปโหลดรูป ระบบจะทำการลดขนาดและแปลงเป็นรูปแบบ <code>.webp</code> ก่อนบันทึกเข้าเครื่องเสมอ ช่วยให้คุณเก็บรูปได้มากขึ้นถึง 5 เท่า!
                </p>
              </div>
            </div>
          </>
        )}

        {activeTab === 'feedback' && (
          <div className="glass-panel animate-fade-in" style={{ padding: '2rem' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
              <MessageSquarePlus size={24} />
              ส่งข้อเสนอแนะ (User Feedback)
            </h2>
            <form onSubmit={handleFeedbackSubmit}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '1rem' }}>ประเภท</label>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <button type="button" onClick={() => setType('feedback')} style={{ flex: '1 1 120px', padding: '0.75rem', borderRadius: '8px', border: `1px solid ${type === 'feedback' ? 'var(--accent-primary)' : 'var(--border-color)'}`, background: type === 'feedback' ? 'rgba(59, 130, 246, 0.1)' : 'transparent', color: 'var(--text-primary)', cursor: 'pointer', transition: 'all 0.2s', fontSize: '1rem' }}>
                    💡 เสนอแนะ
                  </button>
                  <button type="button" onClick={() => setType('feature')} style={{ flex: '1 1 120px', padding: '0.75rem', borderRadius: '8px', border: `1px solid ${type === 'feature' ? '#f59e0b' : 'var(--border-color)'}`, background: type === 'feature' ? 'rgba(245, 158, 11, 0.1)' : 'transparent', color: 'var(--text-primary)', cursor: 'pointer', transition: 'all 0.2s', fontSize: '1rem' }}>
                    ✨ ขอฟีเจอร์
                  </button>
                  <button type="button" onClick={() => setType('bug')} style={{ flex: '1 1 120px', padding: '0.75rem', borderRadius: '8px', border: `1px solid ${type === 'bug' ? '#ef4444' : 'var(--border-color)'}`, background: type === 'bug' ? 'rgba(239, 68, 68, 0.1)' : 'transparent', color: 'var(--text-primary)', cursor: 'pointer', transition: 'all 0.2s', fontSize: '1rem' }}>
                    🐛 แจ้งปัญหา
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '1rem' }}>รายละเอียด</label>
                <textarea 
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder={type === 'bug' ? "พบปัญหาตรงไหน อธิบายได้เลย..." : type === 'feature' ? "อยากให้มีฟังก์ชันอะไรเพิ่ม (เช่น ปุ่ม Export PDF)..." : "ติชม หรือแนะนำการใช้งานเพื่อให้เว็บดีขึ้น..."}
                  style={{ width: '100%', minHeight: '150px', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'inherit', resize: 'vertical', outline: 'none', fontSize: '1rem' }}
                  required
                />
              </div>

              <button type="submit" style={{ width: '100%', padding: '1rem', background: 'var(--accent-primary)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', gap: '0.5rem', transition: 'opacity 0.2s', fontSize: '1.1rem' }} onMouseOver={e => e.target.style.opacity = 0.9} onMouseOut={e => e.target.style.opacity = 1}>
                ส่งข้อมูล
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};

export default Settings;
