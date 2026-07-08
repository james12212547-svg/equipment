import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUp, DollarSign, ClipboardList, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import useStore from '../store/useStore';
import { getWorkLogsDB, getAllQuotationsDB } from '../utils/db';

const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444'];

const MONTH_NAMES_TH = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

const RevenueDashboard = () => {
  const schedules = useStore(state => state.schedules) || [];
  const [workLogs, setWorkLogs] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    getWorkLogsDB().then(setWorkLogs).catch(console.error);
    getAllQuotationsDB().then(setQuotations).catch(console.error);
  }, []);

  // Aggregate all revenue sources into monthly buckets
  const monthlyData = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, i) => ({
      month: MONTH_NAMES_TH[i],
      monthNum: i,
      workLog: 0,
      schedule: 0,
      quotation: 0,
      total: 0,
    }));

    // Work logs
    workLogs.forEach(log => {
      if (!log.cost || !log.date) return;
      const d = new Date(log.date);
      if (d.getFullYear() !== selectedYear) return;
      months[d.getMonth()].workLog += Number(log.cost);
    });

    // Schedules with cost
    schedules.forEach(s => {
      if (!s.cost || !s.date) return;
      const d = new Date(s.date);
      if (isNaN(d) || d.getFullYear() !== selectedYear) return;
      months[d.getMonth()].schedule += Number(s.cost);
    });

    // Paid quotations
    quotations.filter(q => q.status === 'paid').forEach(q => {
      if (!q.total || !q.createdAt) return;
      const d = new Date(q.createdAt);
      if (d.getFullYear() !== selectedYear) return;
      months[d.getMonth()].quotation += Number(q.total);
    });

    return months.map(m => ({
      ...m,
      total: m.workLog + m.schedule + m.quotation,
    }));
  }, [workLogs, schedules, quotations, selectedYear]);

  const totalRevenue = monthlyData.reduce((s, m) => s + m.total, 0);
  const totalWorkLog = monthlyData.reduce((s, m) => s + m.workLog, 0);
  const totalSchedule = monthlyData.reduce((s, m) => s + m.schedule, 0);
  const totalQuotation = monthlyData.reduce((s, m) => s + m.quotation, 0);
  const bestMonth = monthlyData.reduce((a, b) => a.total > b.total ? a : b);
  const currentMonth = MONTH_NAMES_TH[new Date().getMonth()];

  const pieData = [
    { name: 'จดงาน', value: totalWorkLog },
    { name: 'คิวงาน', value: totalSchedule },
    { name: 'ใบเสนอราคา', value: totalQuotation },
  ].filter(d => d.value > 0);

  // Recent transactions (all sources combined)
  const recentTransactions = useMemo(() => {
    const all = [
      ...workLogs.filter(l => l.cost).map(l => ({ date: l.date, label: l.issue || 'งานซ่อม', amount: Number(l.cost), source: 'จดงาน', customer: l.customer })),
      ...schedules.filter(s => s.cost).map(s => ({ date: s.date, label: s.equipmentType, amount: Number(s.cost), source: 'คิวงาน', customer: s.customerName })),
      ...quotations.filter(q => q.status === 'paid').map(q => ({ date: q.createdAt?.split('T')[0], label: q.number, amount: Number(q.total), source: 'ใบเสนอราคา', customer: q.customerName })),
    ];
    return all.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 15);
  }, [workLogs, schedules, quotations]);

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>รายงานรายได้</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Revenue Dashboard</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '0.5rem 1rem' }}>
          <button onClick={() => setSelectedYear(y => y - 1)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.25rem' }}><ChevronLeft size={20} /></button>
          <span style={{ fontWeight: 'bold', color: 'var(--text-primary)', minWidth: '60px', textAlign: 'center' }}>ปี {selectedYear + 543}</span>
          <button onClick={() => setSelectedYear(y => y + 1)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.25rem' }}><ChevronRight size={20} /></button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: `รายได้รวม ปี ${selectedYear + 543}`, value: `฿${totalRevenue.toLocaleString()}`, color: '#3b82f6', icon: <DollarSign size={24} /> },
          { label: 'เดือนที่ดีที่สุด', value: bestMonth.total > 0 ? `${bestMonth.month} (฿${bestMonth.total.toLocaleString()})` : '-', color: '#10b981', icon: <TrendingUp size={24} /> },
          { label: 'รายการทั้งหมด', value: `${recentTransactions.length} งาน`, color: '#f59e0b', icon: <ClipboardList size={24} /> },
          { label: 'เดือนปัจจุบัน', value: `฿${(monthlyData.find(m => m.month === currentMonth)?.total || 0).toLocaleString()}`, color: '#8b5cf6', icon: <Calendar size={24} /> },
        ].map(card => (
          <div key={card.label} className="equipment-card" style={{ padding: '1.5rem', border: `1px solid ${card.color}33`, display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: `${card.color}22`, color: card.color, padding: '0.75rem', borderRadius: '10px', flexShrink: 0 }}>{card.icon}</div>
            <div>
              <p style={{ margin: '0 0 0.25rem', color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>{card.label}</p>
              <strong style={{ color: card.color, fontSize: '1.1rem' }}>{card.value}</strong>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Bar Chart */}
        <div className="equipment-card" style={{ padding: '1.5rem', border: '1px solid var(--border-color)' }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>📊 รายได้รายเดือน (บาท)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="month" tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }} />
              <YAxis tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }} tickFormatter={v => v > 0 ? `฿${(v/1000).toFixed(0)}k` : '0'} />
              <Tooltip formatter={(v) => [`฿${v.toLocaleString()}`, '']} contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }} />
              <Bar dataKey="workLog" name="จดงาน" stackId="a" fill="#3b82f6" radius={[0,0,0,0]} />
              <Bar dataKey="schedule" name="คิวงาน" stackId="a" fill="#f59e0b" />
              <Bar dataKey="quotation" name="ใบเสนอราคา" stackId="a" fill="#10b981" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '0.75rem' }}>
            {[['#3b82f6', 'จดงาน'], ['#f59e0b', 'คิวงาน'], ['#10b981', 'ใบเสนอราคา']].map(([color, label]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: color }} />
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Pie Chart */}
        <div className="equipment-card" style={{ padding: '1.5rem', border: '1px solid var(--border-color)' }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>🥧 สัดส่วนรายได้</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                  {pieData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => `฿${v.toLocaleString()}`} contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', flexDirection: 'column', gap: '0.5rem' }}>
              <DollarSign size={40} style={{ opacity: 0.3 }} />
              <span>ยังไม่มีข้อมูลรายได้</span>
            </div>
          )}
        </div>
      </div>

      {/* Source Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'รายได้จากจดงาน', value: totalWorkLog, color: '#3b82f6' },
          { label: 'รายได้จากคิวงาน', value: totalSchedule, color: '#f59e0b' },
          { label: 'รายได้จากใบเสนอราคา', value: totalQuotation, color: '#10b981' },
        ].map(s => (
          <div key={s.label} className="equipment-card" style={{ padding: '1.25rem', border: `1px solid ${s.color}33`, textAlign: 'center' }}>
            <p style={{ margin: '0 0 0.5rem', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>{s.label}</p>
            <strong style={{ color: s.color, fontSize: '1.3rem' }}>฿{s.value.toLocaleString()}</strong>
            {totalRevenue > 0 && <div style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem', marginTop: '0.25rem' }}>{((s.value / totalRevenue) * 100).toFixed(1)}%</div>}
          </div>
        ))}
      </div>

      {/* Recent Transactions */}
      <div className="equipment-card" style={{ padding: '1.5rem', border: '1px solid var(--border-color)' }}>
        <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>📋 รายการรายได้ล่าสุด</h3>
        {recentTransactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-tertiary)' }}>ยังไม่มีรายการที่มีการบันทึกราคา</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                  {['วันที่', 'รายการ', 'ลูกค้า', 'แหล่งที่มา', 'จำนวนเงิน'].map(h => (
                    <th key={h} style={{ padding: '0.75rem', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.9rem' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((t, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{t.date}</td>
                    <td style={{ padding: '0.75rem', color: 'var(--text-primary)' }}>{t.label}</td>
                    <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>{t.customer || '-'}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{ padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 'bold',
                        background: t.source === 'จดงาน' ? 'rgba(59,130,246,0.1)' : t.source === 'คิวงาน' ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)',
                        color: t.source === 'จดงาน' ? '#3b82f6' : t.source === 'คิวงาน' ? '#f59e0b' : '#10b981' }}>
                        {t.source}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem', fontWeight: 'bold', color: 'var(--accent-solar)' }}>฿{t.amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RevenueDashboard;
