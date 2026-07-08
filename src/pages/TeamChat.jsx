import React, { useState, useEffect, useRef } from 'react';
import { Send, Trash2, MessageCircle } from 'lucide-react';
import { db } from '../utils/firebase';
import { ref, push, onValue, remove, serverTimestamp, query, limitToLast } from 'firebase/database';
import toast from 'react-hot-toast';

const AVATARS = ['👷', '🔧', '⚡', '❄️', '☀️', '🛠️', '🔌', '🧰'];
const AVATAR_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#f97316', '#84cc16'];

const TeamChat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sender, setSender] = useState(localStorage.getItem('chatSender') || '');
  const [senderSet, setSenderSet] = useState(!!localStorage.getItem('chatSender'));
  const [avatar] = useState(() => {
    const stored = localStorage.getItem('chatAvatar');
    if (stored) return JSON.parse(stored);
    const idx = Math.floor(Math.random() * AVATARS.length);
    const av = { emoji: AVATARS[idx], color: AVATAR_COLORS[idx] };
    localStorage.setItem('chatAvatar', JSON.stringify(av));
    return av;
  });
  const bottomRef = useRef();

  useEffect(() => {
    if (!senderSet) return;
    // Listen to last 100 messages in real-time
    const messagesRef = query(ref(db, 'teamchat'), limitToLast(100));
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.entries(data).map(([id, val]) => ({ id, ...val }));
        setMessages(list);
      } else {
        setMessages([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [senderSet]);

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
      timestamp: serverTimestamp(),
    };
    try {
      await push(ref(db, 'teamchat'), msg);
      setInput('');
    } catch (err) {
      toast.error('ส่งข้อความไม่สำเร็จ กรุณาตรวจสอบการเชื่อมต่อ');
    }
  };

  const handleDelete = async (id) => {
    try {
      await remove(ref(db, `teamchat/${id}`));
      toast.success('ลบข้อความแล้ว');
    } catch {
      toast.error('ลบไม่สำเร็จ');
    }
  };

  const formatTime = (ts) => {
    if (!ts) return '';
    const d = new Date(ts);
    return d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) +
      ' · ' + d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
  };

  const isMine = (msg) => msg.sender === sender;

  // --- Name setup screen ---
  if (!senderSet) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div className="equipment-card" style={{ padding: '2.5rem', maxWidth: '400px', width: '100%', border: '1px solid var(--accent-primary)', textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>💬</div>
        <h2 style={{ marginBottom: '0.5rem' }}>ยินดีต้อนรับสู่แชททีม</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>กรุณากรอกชื่อของคุณก่อนเข้าห้องแชท</p>
        <form onSubmit={handleSetSender}>
          <input
            value={sender}
            onChange={e => setSender(e.target.value)}
            placeholder="ชื่อช่างหรือชื่อเล่น..."
            autoFocus
            style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '10px', marginBottom: '1rem', fontSize: '1rem', textAlign: 'center' }}
          />
          <button type="submit"
            style={{ width: '100%', padding: '0.85rem', background: 'var(--accent-primary)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}>
            เข้าสู่ห้องแชท →
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 8rem)', maxWidth: '800px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h1 className="text-gradient" style={{ fontSize: '1.8rem', marginBottom: '0.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MessageCircle size={28} /> แชททีมช่าง
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
            เข้าในชื่อ <strong style={{ color: 'var(--accent-primary)' }}>{avatar.emoji} {sender}</strong>
            <button onClick={() => { localStorage.removeItem('chatSender'); setSenderSet(false); }}
              style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', fontSize: '0.78rem', marginLeft: '0.5rem' }}>
              เปลี่ยนชื่อ
            </button>
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' }} />
          <span style={{ color: '#10b981', fontSize: '0.82rem', fontWeight: 'bold' }}>Real-time • Firebase</span>
        </div>
      </div>

      {/* Messages area */}
      <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-secondary)', borderRadius: '16px', border: '1px solid var(--border-color)', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1rem' }}>
        {loading ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' }}>
            <div>⏳ กำลังโหลด...</div>
          </div>
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
                {/* Avatar */}
                <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: msg.avatarColor || '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>
                  {msg.avatarEmoji || '👷'}
                </div>
                <div style={{ maxWidth: '70%' }}>
                  {!mine && <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '0.25rem', paddingLeft: '0.5rem' }}>{msg.sender}</div>}
                  <div style={{
                    background: mine ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                    color: mine ? 'white' : 'var(--text-primary)',
                    padding: '0.65rem 0.95rem',
                    borderRadius: mine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    fontSize: '0.95rem',
                    lineHeight: '1.5',
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

      {/* Input bar */}
      <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="พิมพ์ข้อความ..."
          style={{ flex: 1, padding: '0.9rem 1.25rem', borderRadius: '12px', fontSize: '1rem' }}
          autoFocus
        />
        <button type="submit" disabled={!input.trim()}
          style={{ background: input.trim() ? 'var(--accent-primary)' : 'var(--bg-tertiary)', color: input.trim() ? 'white' : 'var(--text-tertiary)', border: 'none', padding: '0.9rem 1.25rem', borderRadius: '12px', cursor: input.trim() ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 'bold', transition: 'all 0.2s' }}>
          <Send size={18} /> ส่ง
        </button>
      </form>
    </div>
  );
};

export default TeamChat;
