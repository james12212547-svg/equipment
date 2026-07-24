// TeamChat Component - Real-time chat with Firebase
import React, { useState, useEffect, useRef } from 'react';
import { Send, Trash2, MessageCircle, X, Camera, Bell, BellOff } from 'lucide-react';
import { rtdb } from '../utils/firebase';
import { ref, push, onValue, remove, serverTimestamp, query, limitToLast } from 'firebase/database';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const AVATARS = ['👷', '🔧', '⚡', '❄️', '☀️', '🛠️', '🔌', '🧰', '🏗️', '⚙️', '🔑', '💡', '🧲', '🌡️', '🔋', '🪛'];
const AVATAR_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#f97316', '#84cc16', '#ec4899', '#14b8a6', '#a855f7', '#f43f5e'];

const getStoredAvatar = () => {
  const stored = localStorage.getItem('chatAvatar');
  if (stored) return JSON.parse(stored);
  const idx = Math.floor(Math.random() * AVATARS.length);
  const av = { emoji: AVATARS[idx], color: AVATAR_COLORS[idx], customImg: null };
  localStorage.setItem('chatAvatar', JSON.stringify(av));
  return av;
};

const AvatarDisplay = ({ av, size = 36 }) => {
  if (av?.customImg) {
    return <img src={av.customImg} alt="avatar" style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />;
  }
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: av?.color || '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.55, flexShrink: 0 }}>
      {av?.emoji || '👷'}
    </div>
  );
};

const TeamChat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sender, setSender] = useState(localStorage.getItem('chatSender') || '');
  const [senderSet, setSenderSet] = useState(!!localStorage.getItem('chatSender'));
  const [avatar, setAvatar] = useState(getStoredAvatar);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [selectedColor, setSelectedColor] = useState(avatar?.color || AVATAR_COLORS[0]);
  const imgInputRef = useRef();
  const bottomRef = useRef();
  const lastMsgCountRef = useRef(0);
  const [notifPermission, setNotifPermission] = useState(Notification?.permission || 'default');
  const [notifMuted, setNotifMuted] = useState(() => localStorage.getItem('chatNotifMuted') === 'true');

  const requestNotif = async () => {
    if (!('Notification' in window)) return toast.error('เบราว์เซอร์ไม่รองรับการแจ้งเตือน');
    if (Notification.permission === 'denied') {
      toast(
        '🔒 ถูกปิดกั้นไว้\n→ กดไอออน 🔒 หน้า URL → Site settings → Notifications → Allow',
        { duration: 5000 }
      );
      return;
    }
    if (Notification.permission === 'granted') {
      toast.success('เปิดการแจ้งเตือนอยู่แล้วครับ!');
      return;
    }
    const result = await Notification.requestPermission();
    setNotifPermission(result);
    if (result === 'granted') toast.success('เปิดการแจ้งเตือนสำเร็จ!');
    else toast('🔒 ถูกปิดกั้น → เปิดใน Site Settings → Notifications → Allow', { duration: 5000 });
  };

  const saveAvatar = (newAv) => {
    setAvatar(newAv);
    localStorage.setItem('chatAvatar', JSON.stringify(newAv));
  };

  useEffect(() => {
    if (!senderSet) return;
    const messagesRef = query(ref(rtdb, 'teamchat'), limitToLast(100));
    let firstLoad = true;
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.entries(data).map(([id, val]) => ({ id, ...val }));
        // Check for new messages from others
        if (!firstLoad) {
          const newCount = list.length;
          const prevCount = lastMsgCountRef.current;
          if (newCount > prevCount) {
            const newMsgs = list.slice(prevCount);
            newMsgs.forEach(msg => {
              if (msg.sender !== sender) {
                // Show notification if tab not focused
                if (document.hidden && Notification?.permission === 'granted' && !notifMuted) {
                  new Notification(`💬 ${msg.sender}`, {
                    body: msg.text,
                    icon: '/icon.svg',
                    badge: '/icon.svg',
                    tag: 'teamchat',
                    renotify: true,
                  });
                }
                // Always play a soft sound via Web Audio
                try {
                  const ctx = new (window.AudioContext || window.webkitAudioContext)();
                  const osc = ctx.createOscillator();
                  const gain = ctx.createGain();
                  osc.connect(gain); gain.connect(ctx.destination);
                  osc.frequency.value = 880;
                  gain.gain.setValueAtTime(0.15, ctx.currentTime);
                  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
                  osc.start(); osc.stop(ctx.currentTime + 0.3);
                } catch {}
              }
            });
          }
          lastMsgCountRef.current = newCount;
        } else {
          lastMsgCountRef.current = list.length;
          firstLoad = false;
        }
        setMessages(list);
      } else {
        setMessages([]);
        firstLoad = false;
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [senderSet, sender, notifMuted]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSetSender = (e) => {
    e.preventDefault();
    if (!sender.trim()) return;
    localStorage.setItem('chatSender', sender.trim());
    setSenderSet(true);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const msg = {
      text: input.trim(),
      sender,
      avatarEmoji: avatar.emoji,
      avatarColor: avatar.color,
      avatarImg: avatar.customImg || null,
      timestamp: serverTimestamp(),
    };
    try {
      await push(ref(rtdb, 'teamchat'), msg);
      setInput('');
    } catch {
      toast.error('ส่งข้อความไม่สำเร็จ');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('ลบข้อความนี้?')) {
      try {
        await remove(ref(rtdb, `teamchat/${id}`));
        toast.success('ลบข้อความแล้ว');
      } catch {
        toast.error('ลบไม่สำเร็จ');
      }
    }
  };

  const handleUploadImg = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 1024 * 1024) { toast.error('รูปต้องเล็กกว่า 1MB'); return; }
    const reader = new FileReader();
    reader.onload = ev => {
      saveAvatar({ ...avatar, customImg: ev.target.result });
      toast.success('เปลี่ยนรูปโปรไฟล์แล้ว!');
    };
    reader.readAsDataURL(file);
  };

  const formatTime = (ts) => {
    if (!ts) return '';
    const d = new Date(ts);
    return d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) +
      ' · ' + d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
  };

  const isMine = (msg) => msg.sender === sender;

  const getMsgAvatar = (msg) => ({
    emoji: msg.avatarEmoji,
    color: msg.avatarColor,
    customImg: msg.avatarImg || null,
  });

  // Avatar Picker Modal
  const renderAvatarPicker = () => (
    <div onClick={() => setShowAvatarPicker(false)}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div onClick={e => e.stopPropagation()}
        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '1.75rem', maxWidth: '380px', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: 0 }}>✏️ เปลี่ยนรูปโปรไฟล์</h3>
          <button onClick={() => setShowAvatarPicker(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={20} /></button>
        </div>

        {/* Current preview */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <AvatarDisplay av={avatar} size={72} />
        </div>

        {/* Upload custom photo */}
        <input ref={imgInputRef} type="file" accept="image/*" onChange={handleUploadImg} style={{ display: 'none' }} />
        <button onClick={() => imgInputRef.current.click()}
          style={{ width: '100%', padding: '0.75rem', marginBottom: '1.25rem', background: 'rgba(59,130,246,0.1)', border: '1px dashed rgba(59,130,246,0.5)', color: '#3b82f6', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <Camera size={18} /> อัปโหลดรูปจากเครื่อง
        </button>

        {/* OR divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
          <span style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>หรือเลือก Emoji</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
        </div>

        {/* Emoji grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '0.4rem', marginBottom: '1.25rem' }}>
          {AVATARS.map(em => (
            <button key={em} onClick={() => saveAvatar({ emoji: em, color: selectedColor, customImg: null })}
              style={{ fontSize: '1.4rem', padding: '0.3rem', borderRadius: '8px', border: avatar.emoji === em && !avatar.customImg ? '2px solid var(--accent-primary)' : '2px solid transparent', background: avatar.emoji === em && !avatar.customImg ? 'rgba(59,130,246,0.15)' : 'var(--bg-tertiary)', cursor: 'pointer', transition: 'all 0.15s' }}>
              {em}
            </button>
          ))}
        </div>

        {/* Color picker */}
        <div style={{ marginBottom: '1.25rem' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.6rem' }}>สีพื้นหลัง</p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {AVATAR_COLORS.map(c => (
              <button key={c} onClick={() => { setSelectedColor(c); saveAvatar({ ...avatar, color: c, customImg: null }); }}
                style={{ width: '28px', height: '28px', borderRadius: '50%', background: c, border: selectedColor === c ? '3px solid white' : '3px solid transparent', cursor: 'pointer', boxShadow: selectedColor === c ? `0 0 0 2px ${c}` : 'none', transition: 'all 0.15s' }} />
            ))}
          </div>
        </div>

        <button onClick={() => { saveAvatar({ ...avatar, customImg: null }); toast.success('รีเซ็ตรูปแล้ว'); }}
          style={{ width: '100%', padding: '0.65rem', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-tertiary)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
          รีเซ็ตเป็น Emoji
        </button>
      </div>
    </div>
  );

  const { currentUser } = useAuth();

  const handleSyncAccountName = () => {
    if (currentUser?.email) {
      const name = currentUser.displayName || currentUser.email.split('@')[0];
      setSender(name);
      localStorage.setItem('chatSender', name);
      setSenderSet(true);
      toast.success(`ซิงค์ชื่อแชทเป็น "${name}" แล้ว`);
    }
  };

  // Name setup screen
  if (!senderSet) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div className="equipment-card" style={{ padding: '2.5rem', maxWidth: '420px', width: '100%', border: '1px solid var(--accent-primary)', textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>💬</div>
        <h2 style={{ marginBottom: '0.5rem' }}>ตั้งค่าชื่อในแชททีม</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          ชื่อแชทถูกบันทึกแยกไว้ในเครื่องนี้ หากเปลี่ยนบัญชีผู้ใช้ สามารถกดซิงค์ชื่อตามอีเมลใหม่ได้ทันที
        </p>
        <form onSubmit={handleSetSender}>
          <input value={sender} onChange={e => setSender(e.target.value)} placeholder={currentUser?.email ? currentUser.email.split('@')[0] : "ชื่อช่างหรือชื่อเล่น..."} autoFocus
            style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '10px', marginBottom: '1rem', fontSize: '1rem', textAlign: 'center' }} />
          
          <button type="submit"
            style={{ width: '100%', padding: '0.85rem', background: 'var(--accent-primary)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem', marginBottom: '0.8rem' }}>
            ยืนยันชื่อนี้ เข้าสู่ห้องแชท →
          </button>
        </form>

        {currentUser?.email && (
          <button onClick={handleSyncAccountName}
            style={{ background: 'transparent', border: '1px dashed var(--accent-primary)', color: 'var(--accent-primary)', padding: '0.6rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', width: '100%', fontWeight: 'bold' }}>
            ⚡ ซิงค์กับชื่อบัญชีปัจจุบัน ({currentUser.displayName || currentUser.email.split('@')[0]})
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 8rem)', maxWidth: '800px', margin: '0 auto' }}>
      {showAvatarPicker && renderAvatarPicker()}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Clickable avatar to open picker */}
          <button onClick={() => setShowAvatarPicker(true)} title="เปลี่ยนรูปโปรไฟล์"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, position: 'relative' }}>
            <AvatarDisplay av={avatar} size={44} />
            <div style={{ position: 'absolute', bottom: -2, right: -2, width: 16, height: 16, borderRadius: '50%', background: 'var(--accent-primary)', border: '2px solid var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Camera size={8} color="white" />
            </div>
          </button>
          <div>
            <h1 className="text-gradient" style={{ fontSize: '1.6rem', marginBottom: '0.05rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MessageCircle size={26} /> แชททีมช่าง
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: 0 }}>
              <strong style={{ color: 'var(--accent-primary)' }}>{sender}</strong>
              <button onClick={() => { localStorage.removeItem('chatSender'); setSenderSet(false); }}
                style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', fontSize: '0.75rem', marginLeft: '0.4rem' }}>
                เปลี่ยนชื่อ
              </button>
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' }} />
          <span style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: 'bold' }}>Real-time</span>
          {/* Notification toggle */}
          {notifPermission === 'granted' ? (
            <button onClick={() => {
              const next = !notifMuted;
              setNotifMuted(next);
              localStorage.setItem('chatNotifMuted', String(next));
              toast(next ? '🔇 ปิดเสียงแจ้งเตือนแล้ว' : '🔔 เปิดเสียงแจ้งเตือนแล้ว');
            }}
              style={{ background: notifMuted ? 'rgba(107,114,128,0.15)' : 'rgba(16,185,129,0.15)', border: 'none', borderRadius: '8px', padding: '0.35rem 0.6rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', color: notifMuted ? '#6b7280' : '#10b981', fontSize: '0.78rem', fontWeight: 'bold' }}>
              {notifMuted ? <BellOff size={14} /> : <Bell size={14} />}
              {notifMuted ? 'ปิดเสียงอยู่' : 'แจ้งเตือนเปิด'}
            </button>
          ) : (
            <button onClick={requestNotif}
              style={{ background: 'rgba(245,158,11,0.15)', border: 'none', borderRadius: '8px', padding: '0.35rem 0.6rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#f59e0b', fontSize: '0.78rem', fontWeight: 'bold' }}>
              <BellOff size={14} /> เปิดแจ้งเตือน
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-secondary)', borderRadius: '16px', border: '1px solid var(--border-color)', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1rem' }}>
        {loading ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' }}>⏳ กำลังโหลด...</div>
        ) : messages.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', gap: '0.5rem' }}>
            <MessageCircle size={48} style={{ opacity: 0.3 }} />
            <p>ยังไม่มีข้อความ เริ่มคุยกันได้เลย!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const mine = isMine(msg);
            return (
              <div key={msg.id} style={{ display: 'flex', flexDirection: mine ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: '0.6rem' }}>
                <AvatarDisplay av={getMsgAvatar(msg)} size={34} />
                <div style={{ maxWidth: '70%' }}>
                  {!mine && <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '0.25rem', paddingLeft: '0.5rem' }}>{msg.sender}</div>}
                  <div style={{
                    background: mine ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                    color: mine ? 'white' : 'var(--text-primary)',
                    padding: '0.65rem 0.95rem',
                    borderRadius: mine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    fontSize: '0.95rem', lineHeight: '1.5',
                    border: mine ? 'none' : '1px solid var(--border-color)',
                    wordBreak: 'break-word'
                  }}>
                    {msg.text}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: '0.25rem', textAlign: mine ? 'right' : 'left', paddingLeft: mine ? 0 : '0.5rem', paddingRight: mine ? '0.5rem' : 0 }}>
                    {formatTime(msg.timestamp)}
                    {mine && (
                      <button onClick={() => handleDelete(msg.id)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', marginLeft: '0.4rem', padding: 0, verticalAlign: 'middle' }}>
                        <Trash2 size={11} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <input value={input} onChange={e => setInput(e.target.value)} placeholder="พิมพ์ข้อความ..."
          style={{ flex: 1, padding: '0.9rem 1.25rem', borderRadius: '12px', fontSize: '1rem' }} autoFocus />
        <button type="submit" disabled={!input.trim()}
          style={{ background: input.trim() ? 'var(--accent-primary)' : 'var(--bg-tertiary)', color: input.trim() ? 'white' : 'var(--text-tertiary)', border: 'none', padding: '0.9rem 1.25rem', borderRadius: '12px', cursor: input.trim() ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 'bold', transition: 'all 0.2s' }}>
          <Send size={18} /> ส่ง
        </button>
      </form>
    </div>
  );
};

export default TeamChat;
