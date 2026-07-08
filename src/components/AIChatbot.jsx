import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, User, ChevronDown, Trash2 } from 'lucide-react';

const knowledgeBase = [
  {
    keywords: ['ไม่เย็น', 'ลมไม่ออก', 'แอร์พัง', 'ตัน'],
    response: 'หากแอร์ไม่เย็นหรือลมไม่ออก สาเหตุอันดับ 1 มักเกิดจาก "แอร์ตัน" ครับ ลองถอดฟิลเตอร์มาล้างทำความสะอาดดูก่อนนะครับ หากล้างแล้วยังไม่เย็น อาจเกิดจากน้ำยาแอร์รั่ว หรือ Capacitor ของคอมเพรสเซอร์เสียครับ (คุณสามารถเข้าไปเล่นแบบจำลองซ่อมแอร์ในเมนู ศูนย์การเรียนรู้ > จำลองซ่อมบำรุง ได้นะครับ)'
  },
  {
    keywords: ['น้ำยา', 'r32', 'r410', 'เติมน้ำยา'],
    response: 'แอร์บ้านทั่วไปในปัจจุบันมักใช้น้ำยา R32 หรือ R410A ครับ ซึ่งระบบแอร์เป็น "ระบบปิด" ถ้าน้ำยาไม่รั่ว ก็ไม่จำเป็นต้องเติมตลอดอายุการใช้งานครับ! หากช่างบอกให้น้ำยาพร่อง ให้สงสัยไว้ก่อนว่ารั่ว ต้องหาจุดรั่วก่อนเติมครับ'
  },
  {
    keywords: ['โซลาร์', 'ค่าไฟ', 'solar', 'คุ้ม', 'กี่ปี'],
    response: 'การติดตั้งโซลาร์เซลล์จะคุ้มค่าที่สุดเมื่อคุณ "ใช้ไฟตอนกลางวันเยอะ" (ระบบ On-Grid) ระยะเวลาคืนทุนเฉลี่ยอยู่ที่ 4-6 ปีครับ สนใจลองใช้เครื่องมือ "คำนวณจุดคุ้มทุนโซลาร์" ในศูนย์การเรียนรู้ดูไหมครับ?'
  },
  {
    keywords: ['สายไฟ', 'thw', 'vaf', 'ขนาดสาย'],
    response: 'การเลือกขนาดสายไฟต้องอ้างอิงตามกระแสไฟ (Ampere) ของโหลดครับ เช่น แอร์ 9000-12000 BTU ใช้สายเบอร์ 2.5 ตร.มม. (แอร์ 18000+ ใช้เบอร์ 4) ลองเข้าไปที่เมนู "คำนวณขนาดสายไฟ" ในศูนย์การเรียนรู้เพื่อดูรายละเอียดได้เลยครับ'
  },
  {
    keywords: ['เบรกเกอร์', 'cb', 'mcb'],
    response: 'เบรกเกอร์ (Circuit Breaker) มีหน้าที่ตัดไฟเมื่อมีกระแสเกินหรือลัดวงจร การเลือกเบรกเกอร์ต้องเลือกให้ "สอดคล้องกับขนาดสายไฟ" นะครับ ห้ามใส่เบรกเกอร์แอมป์สูงกว่าพิกัดสายไฟเด็ดขาด เพราะสายไฟจะไหม้ก่อนที่เบรกเกอร์จะตัดครับ'
  },
  {
    keywords: ['inverter', 'อินเวอร์เตอร์', 'กินไฟ'],
    response: 'ระบบ Inverter ในแอร์ จะช่วยประหยัดไฟได้ 20-30% โดยการลดรอบคอมเพรสเซอร์แทนการตัดต่อครับ เหมาะกับห้องที่เปิดแอร์นานๆ (8 ชม.ขึ้นไป) เช่น ห้องนอน แต่ถ้าเป็นห้องรับแขกที่เปิดๆ ปิดๆ แอร์ธรรมดา (Fixed Speed) อาจคุ้มกว่าครับ'
  },
  {
    keywords: ['spd', 'ไฟกระชาก', 'ฟ้าผ่า'],
    response: 'SPD (Surge Protective Device) คืออุปกรณ์ป้องกันไฟกระชากหรือฟ้าผ่าครับ Type 1 ติดที่ตู้ MDB หลัก ส่วน Type 2 ติดที่ตู้ย่อย (Consumer Unit) ควรติดตั้งร่วมกับระบบสายดินที่ได้มาตรฐาน (ความต้านทาน < 5 โอห์ม) ครับ'
  },
  {
    keywords: ['สวัสดี', 'ทักทาย', 'หวัดดี', 'hello', 'hi'],
    response: 'สวัสดีครับ! ผมคือ Engineering Bot ผู้ช่วยวิศวกรส่วนตัวของคุณ มีคำถามเรื่องแอร์ โซลาร์เซลล์ หรือระบบไฟฟ้า พิมพ์ถามผมมาได้เลยครับ!'
  },
  {
    keywords: ['ขอบคุณ', 'แต๊ง', 'thank'],
    response: 'ยินดีเสมอครับ! ถ้ามีคำถามอะไรเพิ่มเติม แวะมาถามผมได้ตลอดเลยนะครับ 😊'
  }
];

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: 'สวัสดีครับ! ผมคือ Engineering Bot ผู้ช่วยวิศวกรส่วนตัวของคุณ มีคำถามเรื่องแอร์ โซลาร์เซลล์ หรือระบบไฟฟ้า พิมพ์ถามผมได้เลยครับ! 🤖', sender: 'bot' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, isOpen]);

  const generateResponse = (userText) => {
    const text = userText.toLowerCase();
    
    // Simple Keyword Matching logic
    let bestMatch = null;
    let maxMatches = 0;

    for (const kb of knowledgeBase) {
      let matches = 0;
      for (const keyword of kb.keywords) {
        if (text.includes(keyword)) {
          matches++;
        }
      }
      if (matches > maxMatches) {
        maxMatches = matches;
        bestMatch = kb.response;
      }
    }

    if (bestMatch) return bestMatch;
    
    // Fallback response
    return 'ขออภัยครับ ตอนนี้ผมมีความรู้เฉพาะเรื่องแอร์ โซลาร์เซลล์ และไฟฟ้าเบื้องต้นเท่านั้น ลองถามคำถามเกี่ยวกับการ "แอร์ไม่เย็น", "สายไฟ", หรือ "โซลาร์เซลล์" ดูสิครับ!';
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    // Add user message
    const userMsg = inputText.trim();
    setMessages(prev => [...prev, { text: userMsg, sender: 'user' }]);
    setInputText('');
    setIsTyping(true);

    // Simulate thinking delay
    setTimeout(() => {
      const botResponse = generateResponse(userMsg);
      setMessages(prev => [...prev, { text: botResponse, sender: 'bot' }]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000); // 1-2 seconds delay
  };

  const clearChat = () => {
    setMessages([
      { text: 'สวัสดีครับ! ผมคือ Engineering Bot ผู้ช่วยวิศวกรส่วนตัวของคุณ มีคำถามเรื่องแอร์ โซลาร์เซลล์ หรือระบบไฟฟ้า พิมพ์ถามผมได้เลยครับ! 🤖', sender: 'bot' }
    ]);
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="chatbot-btn animate-fade-in"
        >
          <Bot size={32} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-window animate-fade-in">
          {/* Header */}
          <div style={{ padding: '1rem', background: 'linear-gradient(135deg, #00F0FF 0%, #0080FF 100%)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bot size={24} />
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Engineering AI (Beta)</h3>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <button onClick={clearChat} title="ลบประวัติแชท" style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', display: 'flex' }}>
                <Trash2 size={18} />
              </button>
              <button onClick={() => setIsOpen(false)} title="ซ่อนแชท" style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', display: 'flex' }}>
                <ChevronDown size={20} />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', background: 'var(--bg-primary)' }}>
            {messages.map((msg, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                {msg.sender === 'bot' && (
                  <div style={{ minWidth: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-ac)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black' }}>
                    <Bot size={18} />
                  </div>
                )}
                
                <div style={{ 
                  background: msg.sender === 'user' ? 'var(--accent-ac)' : 'var(--bg-tertiary)', 
                  color: msg.sender === 'user' ? 'black' : 'var(--text-primary)',
                  padding: '0.75rem 1rem', 
                  borderRadius: msg.sender === 'user' ? '16px 16px 0 16px' : '16px 16px 16px 0',
                  fontSize: '0.95rem',
                  lineHeight: '1.5'
                }}>
                  {msg.text}
                </div>

                {msg.sender === 'user' && (
                  <div style={{ minWidth: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                    <User size={18} />
                  </div>
                )}
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div style={{ display: 'flex', gap: '0.5rem', alignSelf: 'flex-start' }}>
                <div style={{ minWidth: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-ac)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black' }}>
                  <Bot size={18} />
                </div>
                <div style={{ background: 'var(--bg-tertiary)', padding: '0.75rem 1rem', borderRadius: '16px 16px 16px 0', display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                  <span className="dot-typing" style={{ animationDelay: '0s' }}>.</span>
                  <span className="dot-typing" style={{ animationDelay: '0.2s' }}>.</span>
                  <span className="dot-typing" style={{ animationDelay: '0.4s' }}>.</span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} style={{ padding: '1rem', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '0.5rem' }}>
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="พิมพ์คำถามของคุณ..." 
              style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: '24px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none' }}
            />
            <button 
              type="submit" 
              disabled={!inputText.trim() || isTyping}
              style={{ width: '40px', height: '40px', borderRadius: '50%', background: inputText.trim() && !isTyping ? 'var(--accent-ac)' : 'var(--bg-tertiary)', color: inputText.trim() && !isTyping ? 'black' : 'var(--text-tertiary)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: inputText.trim() && !isTyping ? 'pointer' : 'default', transition: 'background 0.3s' }}
            >
              <Send size={18} style={{ transform: 'translate(-1px, 1px)' }} />
            </button>
          </form>

        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes blink {
          0% { opacity: .2; }
          20% { opacity: 1; }
          100% { opacity: .2; }
        }
        .dot-typing {
          animation-name: blink;
          animation-duration: 1.4s;
          animation-iteration-count: infinite;
          animation-fill-mode: both;
          font-weight: bold;
          font-size: 1.2rem;
        }
      `}} />
    </>
  );
};

export default AIChatbot;
