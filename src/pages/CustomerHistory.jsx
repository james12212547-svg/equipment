import React, { useState, useEffect, useMemo } from 'react';
import { Search, User, Clock, ClipboardList, CheckCircle, ChevronRight, ArrowLeft, Printer, MapPin, QrCode, X } from 'lucide-react';
import useStore from '../store/useStore';
import { getWorkLogsDB } from '../utils/db';

const CustomerHistory = () => {
  const schedules = useStore(state => state.schedules) || [];
  const [workLogs, setWorkLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showQrModal, setShowQrModal] = useState(null); // customer name

  useEffect(() => {
    getWorkLogsDB().then(logs => {
      setWorkLogs(logs);
    }).catch(console.error);
  }, []);

  // Group data by customer
  const customerData = useMemo(() => {
    const dataMap = new Map();

    // Process Schedules (Appointments)
    schedules.forEach(schedule => {
      const name = schedule.customerName?.trim();
      if (!name) return;
      
      const key = name.toLowerCase();
      if (!dataMap.has(key)) {
        dataMap.set(key, { name: name, schedules: [], workLogs: [], totalSpent: 0 });
      }
      const customer = dataMap.get(key);
      customer.schedules.push(schedule);
      if (schedule.cost) {
        customer.totalSpent += Number(schedule.cost);
      }
    });

    // Process Work Logs (Past Services)
    workLogs.forEach(log => {
      const name = log.customer?.trim();
      if (!name) return;

      const key = name.toLowerCase();
      if (!dataMap.has(key)) {
        dataMap.set(key, { name: name, schedules: [], workLogs: [], totalSpent: 0 });
      }
      const customer = dataMap.get(key);
      customer.workLogs.push(log);
      if (log.cost) {
        customer.totalSpent += Number(log.cost);
      }
    });

    return Array.from(dataMap.values()).sort((a, b) => a.name.localeCompare(b.name, 'th'));
  }, [schedules, workLogs]);

  const filteredCustomers = customerData.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderCustomerList = () => (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>ประวัติลูกค้า</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Customer Service History
          </p>
        </div>
      </div>

      <div className="search-bar" style={{ marginBottom: '2rem' }}>
        <Search size={20} color="var(--text-tertiary)" />
        <input 
          type="text" 
          placeholder="ค้นหาชื่อลูกค้า หรือสถานที่..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {filteredCustomers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--bg-secondary)', borderRadius: '12px', color: 'var(--text-tertiary)' }}>
          <User size={64} style={{ marginBottom: '1rem', opacity: 0.5 }} />
          <h3>ไม่พบข้อมูลลูกค้า</h3>
          <p>ลองค้นหาด้วยคำอื่น หรือต้องมีการบันทึกงาน/ตารางงานก่อน</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {filteredCustomers.map(customer => (
            <div 
              key={customer.name} 
              onClick={() => setSelectedCustomer(customer)}
              className="equipment-card"
              style={{ 
                padding: '1.5rem', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                border: '1px solid var(--border-color)'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = 'var(--accent-primary)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(0, 240, 255, 0.1)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>
                  {customer.name.charAt(0)}
                </div>
                <div>
                  <h3 style={{ margin: '0 0 0.25rem', color: 'var(--text-primary)' }}>{customer.name}</h3>
                  <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    นัดหมาย: {customer.schedules.length} งาน | ประวัติซ่อม: {customer.workLogs.length} งาน
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ display: 'block', color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>ยอดรวม</span>
                  <strong style={{ color: 'var(--accent-solar)' }}>฿{customer.totalSpent.toLocaleString()}</strong>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); setShowQrModal(customer.name); }}
                  title="QR Code"
                  style={{ background: 'rgba(139,92,246,0.1)', border: 'none', color: '#8b5cf6', padding: '0.4rem', borderRadius: '8px', cursor: 'pointer' }}
                >
                  <QrCode size={20} />
                </button>
                <ChevronRight color="var(--text-tertiary)" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // QR Modal
  const renderQrModal = () => {
    if (!showQrModal) return null;
    const qrData = encodeURIComponent(`${window.location.origin}/customer-history?name=${encodeURIComponent(showQrModal)}`);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${qrData}&bgcolor=ffffff&color=1e40af&margin=10`;
    return (
      <div onClick={() => setShowQrModal(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '2rem', maxWidth: '360px', width: '100%', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0 }}>📱 QR Code</h3>
            <button onClick={() => setShowQrModal(null)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={20} /></button>
          </div>
          <img src={qrUrl} alt="QR Code" style={{ width: '200px', height: '200px', borderRadius: '12px', marginBottom: '1rem', border: '4px solid white' }} />
          <p style={{ color: 'var(--text-primary)', fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.5rem' }}>{showQrModal}</p>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>สแกน QR เพื่อดูประวัติการซ่อมของลูกค้ารายนี้</p>
          <a href={qrUrl} download={`QR-${showQrModal}.png`}
            style={{ display: 'inline-block', background: 'var(--accent-primary)', color: 'white', textDecoration: 'none', padding: '0.75rem 1.5rem', borderRadius: '10px', fontWeight: 'bold', fontSize: '0.95rem' }}>
            ⬇️ ดาวน์โหลด QR
          </a>
        </div>
      </div>
    );
  };
  const renderCustomerDetail = () => {
    if (!selectedCustomer) return null;

    const handlePrint = () => window.print();
    
    // Combine both arrays into a single timeline sorted by date
    const timelineEvents = [
      ...selectedCustomer.schedules.map(s => ({
        type: 'schedule',
        id: s.id,
        date: new Date(s.date || Date.now()),
        title: s.equipmentType,
        status: s.status,
        details: s.notes,
        location: s.location,
        beforeImg: s.beforeImg,
        afterImg: s.afterImg,
        cost: s.cost,
        time: s.timeStart ? `${s.timeStart}${s.timeEnd ? ' - ' + s.timeEnd : ''}` : null
      })),
      ...selectedCustomer.workLogs.map(w => ({
        type: 'worklog',
        id: w.id,
        date: new Date(w.date),
        title: w.issue,
        cost: w.cost,
        parts: w.parts,
        beforeImg: w.beforeImg,
        afterImg: w.afterImg
      }))
    ].sort((a, b) => b.date - a.date); // Newest first

    return (
      <div className="animate-fade-in">
        <style>{`@media print { .no-print { display: none !important; } body { background: white !important; } .nav-bar, .chatbot-btn { display: none !important; } }`}</style>
        <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <button 
            onClick={() => setSelectedCustomer(null)}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: 0 }}
          >
            <ArrowLeft size={20} /> กลับไปหน้ารายชื่อ
          </button>
          <button
            onClick={handlePrint}
            style={{ marginLeft: 'auto', background: 'var(--accent-primary)', color: 'white', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}
          >
            <Printer size={16} /> พิมพ์ PDF
          </button>
        </div>

        <div className="equipment-card" style={{ padding: '2rem', marginBottom: '2rem', borderTop: '4px solid var(--accent-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <h1 style={{ margin: '0 0 0.5rem', color: 'var(--text-primary)' }}>{selectedCustomer.name}</h1>
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>ประวัติการรับบริการทั้งหมด</p>
          </div>
          <div style={{ textAlign: 'right', background: 'var(--bg-tertiary)', padding: '1rem 1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <span style={{ display: 'block', color: 'var(--text-tertiary)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>ยอดใช้จ่ายสะสม</span>
            <strong style={{ color: 'var(--accent-solar)', fontSize: '1.5rem' }}>฿{selectedCustomer.totalSpent.toLocaleString()}</strong>
          </div>
        </div>

        <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clock size={20} color="var(--accent-primary)" /> ไทม์ไลน์การบริการ (Timeline)
        </h3>

        <div style={{ position: 'relative', paddingLeft: '1.5rem', borderLeft: '2px solid var(--border-color)', marginLeft: '1rem' }}>
          {timelineEvents.map((event, index) => (
            <div key={`${event.type}-${event.id}-${index}`} style={{ position: 'relative', marginBottom: '2rem' }}>
              {/* Timeline Dot */}
              <div style={{ 
                position: 'absolute', 
                left: '-1.5rem', 
                transform: 'translateX(-50%)', 
                width: '16px', 
                height: '16px', 
                borderRadius: '50%', 
                background: event.type === 'schedule' ? 'var(--bg-primary)' : 'var(--accent-primary)',
                border: `4px solid ${event.type === 'schedule' ? 'var(--text-tertiary)' : 'var(--bg-primary)'}`,
                boxShadow: event.type === 'worklog' ? '0 0 0 2px var(--accent-primary)' : 'none'
              }} />

              <div className="equipment-card" style={{ padding: '1.5rem', border: '1px solid var(--border-color)', background: event.type === 'schedule' && event.status === 'pending' ? 'rgba(0, 240, 255, 0.03)' : 'var(--bg-secondary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <h4 style={{ margin: '0 0 0.25rem', color: 'var(--text-primary)', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {event.type === 'worklog' ? <ClipboardList size={16} color="var(--accent-primary)" /> : <Clock size={16} color="var(--text-secondary)" />}
                      {event.title}
                    </h4>
                    <span style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                      {event.date.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
                      {event.time && ` • ${event.time} น.`}
                    </span>
                  </div>
                  {event.type === 'schedule' && (
                    <span style={{ 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '999px', 
                      fontSize: '0.75rem', 
                      fontWeight: 'bold',
                      background: event.status === 'completed' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                      color: event.status === 'completed' ? '#10b981' : '#f59e0b'
                    }}>
                      {event.status === 'completed' ? 'เสร็จสิ้น' : 'รอคิว'}
                    </span>
                  )}
                  {event.type === 'worklog' && (
                    <span style={{ 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '999px', 
                      fontSize: '0.75rem', 
                      fontWeight: 'bold',
                      background: 'rgba(59, 130, 246, 0.1)',
                      color: '#3b82f6'
                    }}>
                      ประวัติงานเสร็จสิ้น
                    </span>
                  )}
                </div>

                {event.details && <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0 0 1rem', background: 'var(--bg-tertiary)', padding: '0.75rem', borderRadius: '8px' }}>{event.details}</p>}
                
                {/* GPS Link for schedule events */}
                {event.location && (
                  <a
                    href={event.location.startsWith('http') ? event.location : `https://maps.google.com/?q=${encodeURIComponent(event.location)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="no-print"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem', padding: '0.4rem 0.85rem', borderRadius: '8px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', fontSize: '0.82rem', textDecoration: 'none', fontWeight: '500' }}
                  >
                    <MapPin size={13} /> เปิดแผนที่
                  </a>
                )}
                
                {event.type === 'worklog' && (event.parts || event.cost) && (
                  <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                    {event.parts && (
                      <div style={{ flex: 1, minWidth: '150px' }}>
                        <span style={{ display: 'block', color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>อะไหล่</span>
                        <span style={{ color: 'var(--text-primary)' }}>{event.parts}</span>
                      </div>
                    )}
                    {event.cost && (
                      <div>
                        <span style={{ display: 'block', color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>ค่าใช้จ่าย</span>
                        <span style={{ color: 'var(--accent-solar)', fontWeight: 'bold' }}>฿{Number(event.cost).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Schedule cost */}
                {event.type === 'schedule' && event.cost && (
                  <div style={{ marginTop: '0.75rem' }}>
                    <span style={{ display: 'block', color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>ประเมินราคา</span>
                    <span style={{ color: 'var(--accent-solar)', fontWeight: 'bold' }}>฿{Number(event.cost).toLocaleString()}</span>
                  </div>
                )}

                {/* Photos for both worklog and schedule */}
                {(event.beforeImg || event.afterImg) && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
                    {event.beforeImg && (
                      <div>
                        <span style={{ display: 'block', color: 'var(--text-tertiary)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>ก่อนทำ</span>
                        <img src={event.beforeImg} alt="Before" style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
                      </div>
                    )}
                    {event.afterImg && (
                      <div>
                        <span style={{ display: 'block', color: 'var(--text-tertiary)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>หลังทำ</span>
                        <img src={event.afterImg} alt="After" style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div style={{ paddingBottom: '3rem' }}>
      {renderQrModal()}
      {!selectedCustomer ? renderCustomerList() : renderCustomerDetail()}
    </div>
  );
};

export default CustomerHistory;
