import React, { useState, useEffect, useMemo, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, ClipboardList, Calendar, ChevronLeft, ChevronRight, Printer, FileText, CheckCircle, ArrowLeft, Building2 } from 'lucide-react';
import useStore from '../store/useStore';
import { getWorkLogsDB, getAllQuotationsDB, getInventoryLogsDB } from '../utils/db';
import { thaiBahtText } from '../utils/thaiBaht';
import toast from 'react-hot-toast';

const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444'];
const MONTH_NAMES_TH = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
const FULL_MONTH_NAMES_TH = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];

const RevenueDashboard = () => {
  const schedules = useStore(state => state.schedules) || [];
  const [workLogs, setWorkLogs] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [inventoryLogs, setInventoryLogs] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [showExecutiveReport, setShowExecutiveReport] = useState(false);
  const printRef = useRef();

  // Company info from Settings / localStorage
  const companyName = localStorage.getItem('companyName') || 'บริษัท วิศวกรรมไทย จำกัด';
  const companyAddress = localStorage.getItem('companyAddress') || '123/45 ถนนสุขุมวิท กรุงเทพมหานคร 10110';
  const companyPhone = localStorage.getItem('companyPhone') || '02-123-4567';
  const companyTax = localStorage.getItem('companyTax') || '0105560000000';

  useEffect(() => {
    getWorkLogsDB().then(setWorkLogs).catch(console.error);
    getAllQuotationsDB().then(setQuotations).catch(console.error);
    getInventoryLogsDB().then(setInventoryLogs).catch(console.error);
  }, []);

  // Aggregate all revenue sources into monthly buckets
  const monthlyData = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, i) => ({
      month: MONTH_NAMES_TH[i],
      monthNum: i,
      workLog: 0,
      schedule: 0,
      quotation: 0,
      inventoryCost: 0,
      total: 0,
      netProfit: 0,
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
      
      // Calculate parts cost for schedules
      if (s.partsUsed && s.partsUsed.length > 0) {
        s.partsUsed.forEach(part => {
          months[d.getMonth()].inventoryCost += (Number(part.qty) * Number(part.unitPrice));
        });
      }
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
      netProfit: (m.workLog + m.schedule + m.quotation) - m.inventoryCost,
    }));
  }, [workLogs, schedules, quotations, selectedYear]);

  const totalRevenue = monthlyData.reduce((s, m) => s + m.total, 0);
  const totalInventoryCost = monthlyData.reduce((s, m) => s + m.inventoryCost, 0);
  const totalNetProfit = totalRevenue - totalInventoryCost;
  const totalWorkLog = monthlyData.reduce((s, m) => s + m.workLog, 0);
  const totalSchedule = monthlyData.reduce((s, m) => s + m.schedule, 0);
  const totalQuotation = monthlyData.reduce((s, m) => s + m.quotation, 0);
  const currentMonthData = monthlyData[selectedMonth] || monthlyData[new Date().getMonth()];

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

  // Executive Monthly Stats
  const selectedMonthJobs = useMemo(() => {
    return schedules.filter(s => {
      if (!s.date) return false;
      const d = new Date(s.date);
      return !isNaN(d) && d.getFullYear() === selectedYear && d.getMonth() === selectedMonth;
    });
  }, [schedules, selectedYear, selectedMonth]);

  const completedJobsCount = selectedMonthJobs.filter(s => s.status === 'completed').length;
  const pendingJobsCount = selectedMonthJobs.filter(s => s.status !== 'completed').length;

  const handlePrintReport = () => {
    window.print();
  };

  // ---- EXECUTIVE REPORT PRINT VIEW ----
  if (showExecutiveReport) {
    const mData = currentMonthData;
    const profitMargin = mData.total > 0 ? ((mData.netProfit / mData.total) * 100).toFixed(1) : 0;

    return (
      <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
        <style>{`
          @media print {
            .no-print { display: none !important; }
            body { background: white !important; color: black !important; }
            .nav-bar, .chatbot-btn { display: none !important; }
            .report-container { padding: 0 !important; border: none !important; box-shadow: none !important; width: 100% !important; max-width: 100% !important; }
          }
        `}</style>

        {/* Action Controls */}
        <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <button onClick={() => setShowExecutiveReport(false)} style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.75rem 1.5rem', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ArrowLeft size={18} /> กลับแดชบอร์ด
          </button>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
            >
              {FULL_MONTH_NAMES_TH.map((m, i) => <option key={m} value={i}>เดือน {m}</option>)}
            </select>
            <button onClick={handlePrintReport} className="primary-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Printer size={18} /> พิมพ์รายงาน PDF
            </button>
          </div>
        </div>

        {/* Executive Report PDF Layout */}
        <div
          ref={printRef}
          className="report-container"
          style={{
            background: 'white',
            color: '#0f172a',
            padding: '3rem',
            maxWidth: '900px',
            margin: '0 auto',
            borderRadius: '8px',
            fontFamily: 'Prompt, sans-serif',
            border: '1px solid #cbd5e1',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            lineHeight: '1.6',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '3px solid #0f172a' }}>
            <div>
              <h1 style={{ margin: '0 0 0.25rem', color: '#0f172a', fontSize: '1.8rem', fontWeight: 'bold' }}>{companyName}</h1>
              <p style={{ margin: '0', color: '#475569', fontSize: '0.85rem' }}>{companyAddress}</p>
              <p style={{ margin: '0', color: '#475569', fontSize: '0.85rem' }}>โทร: {companyPhone} {companyTax && `| เลขประจำตัวผู้เสียภาษี: ${companyTax}`}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 'bold', padding: '0.2rem 0.6rem', borderRadius: '4px', background: '#0f172a', color: 'white', textTransform: 'uppercase' }}>
                Executive Report
              </span>
              <h2 style={{ margin: '0.5rem 0 0', color: '#0f172a', fontSize: '1.4rem', fontWeight: 'bold' }}>
                รายงานสรุปผลการดำเนินงาน
              </h2>
              <p style={{ margin: '0', color: '#3b82f6', fontWeight: 'bold' }}>
                ประจำเดือน {FULL_MONTH_NAMES_TH[selectedMonth]} {selectedYear + 543}
              </p>
            </div>
          </div>

          {/* KPI Financial Overview Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'bold' }}>รายได้รวมทั้งหมด</span>
              <strong style={{ display: 'block', fontSize: '1.3rem', color: '#2563eb', marginTop: '0.2rem' }}>
                ฿{mData.total.toLocaleString()}
              </strong>
            </div>
            <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'bold' }}>ต้นทุนเบิกอะไหล่</span>
              <strong style={{ display: 'block', fontSize: '1.3rem', color: '#dc2626', marginTop: '0.2rem' }}>
                ฿{mData.inventoryCost.toLocaleString()}
              </strong>
            </div>
            <div style={{ background: '#f8fafc', border: '1px solid #059669', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 'bold' }}>กำไรสุทธิ (Net Profit)</span>
              <strong style={{ display: 'block', fontSize: '1.3rem', color: '#059669', marginTop: '0.2rem' }}>
                ฿{mData.netProfit.toLocaleString()}
              </strong>
            </div>
            <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'bold' }}>อัตรากำไร (Profit Margin)</span>
              <strong style={{ display: 'block', fontSize: '1.3rem', color: '#7c3aed', marginTop: '0.2rem' }}>
                {profitMargin}%
              </strong>
            </div>
          </div>

          {/* Baht Text Banner */}
          <div style={{ background: '#f1f5f9', borderLeft: '4px solid #0f172a', padding: '0.75rem 1rem', borderRadius: '4px', marginBottom: '2rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#475569' }}>มูลค่ากำไรสุทธิตัวอักษร: </span>
            <strong style={{ color: '#0f172a', fontSize: '1rem' }}>( {thaiBahtText(mData.netProfit)} )</strong>
          </div>

          {/* Operations & Performance Breakdown */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
            {/* Revenue Sources Breakdown */}
            <div>
              <h3 style={{ fontSize: '1.1rem', color: '#0f172a', marginBottom: '1rem', paddingBottom: '0.4rem', borderBottom: '2px solid #e2e8f0' }}>
                💰 ที่มารายได้ประจำเดือน
              </h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '0.6rem 0', color: '#475569' }}>งานซ่อม / จดงานทั่วไป</td>
                    <td style={{ padding: '0.6rem 0', textAlign: 'right', fontWeight: 'bold' }}>฿{mData.workLog.toLocaleString()}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '0.6rem 0', color: '#475569' }}>คิวงานบำรุงรักษาประจำ</td>
                    <td style={{ padding: '0.6rem 0', textAlign: 'right', fontWeight: 'bold' }}>฿{mData.schedule.toLocaleString()}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '0.6rem 0', color: '#475569' }}>ใบเสนอราคาที่ชำระแล้ว</td>
                    <td style={{ padding: '0.6rem 0', textAlign: 'right', fontWeight: 'bold' }}>฿{mData.quotation.toLocaleString()}</td>
                  </tr>
                  <tr style={{ background: '#f8fafc', fontWeight: 'bold' }}>
                    <td style={{ padding: '0.75rem 0.5rem', color: '#0f172a' }}>รวมรายได้ทั้งสิ้น</td>
                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: '#2563eb' }}>฿{mData.total.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Work Orders Statistics */}
            <div>
              <h3 style={{ fontSize: '1.1rem', color: '#0f172a', marginBottom: '1rem', paddingBottom: '0.4rem', borderBottom: '2px solid #e2e8f0' }}>
                🛠️ ปริมาณงานซ่อมบำรุง
              </h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '0.6rem 0', color: '#475569' }}>งานทั้งหมดประจำเดือน</td>
                    <td style={{ padding: '0.6rem 0', textAlign: 'right', fontWeight: 'bold' }}>{selectedMonthJobs.length} งาน</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '0.6rem 0', color: '#059669' }}>งานที่ส่งมอบเสร็จสมบูรณ์</td>
                    <td style={{ padding: '0.6rem 0', textAlign: 'right', fontWeight: 'bold', color: '#059669' }}>{completedJobsCount} งาน</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '0.6rem 0', color: '#d97706' }}>งานรอดำเนินการ</td>
                    <td style={{ padding: '0.6rem 0', textAlign: 'right', fontWeight: 'bold', color: '#d97706' }}>{pendingJobsCount} งาน</td>
                  </tr>
                  <tr style={{ background: '#f8fafc', fontWeight: 'bold' }}>
                    <td style={{ padding: '0.75rem 0.5rem', color: '#0f172a' }}>อัตราการส่งมอบงานสำเร็จ (Completion Rate)</td>
                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: '#059669' }}>
                      {selectedMonthJobs.length > 0 ? ((completedJobsCount / selectedMonthJobs.length) * 100).toFixed(0) : 100}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Executive Sign-off Section */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '4rem', paddingTop: '1.5rem', borderTop: '1px solid #cbd5e1' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ height: '50px', borderBottom: '1px dashed #000', marginBottom: '0.5rem' }} />
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569' }}>ผู้จัดทำรายงาน / ฝ่ายบัญชี</p>
              <p style={{ margin: '0.2rem 0 0', fontWeight: 'bold', fontSize: '0.9rem', color: '#0f172a' }}>({companyName})</p>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: '#64748b' }}>วันที่ ..... / ..... / .........</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ height: '50px', borderBottom: '1px dashed #000', marginBottom: '0.5rem' }} />
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569' }}>ผู้อนุมัติ / เจ้าของกิจการ (CEO/Manager)</p>
              <p style={{ margin: '0.2rem 0 0', fontWeight: 'bold', fontSize: '0.9rem', color: '#0f172a' }}>อนุมัติรายงานสรุปประจำเดือน</p>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: '#64748b' }}>วันที่ ..... / ..... / .........</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---- MAIN DASHBOARD VIEW ----
  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>รายงานรายได้และกำไรสุทธิ</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Revenue & Executive Net Profit Dashboard</p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowExecutiveReport(true)}
            className="primary-btn"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Printer size={18} /> พิมพ์รายงานสรุปผู้บริหาร (PDF)
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '0.5rem 1rem' }}>
            <button onClick={() => setSelectedYear(y => y - 1)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.25rem' }}><ChevronLeft size={20} /></button>
            <span style={{ fontWeight: 'bold', color: 'var(--text-primary)', minWidth: '60px', textAlign: 'center' }}>ปี {selectedYear + 543}</span>
            <button onClick={() => setSelectedYear(y => y + 1)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.25rem' }}><ChevronRight size={20} /></button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: `รายได้รวม ปี ${selectedYear + 543}`, value: `฿${totalRevenue.toLocaleString()}`, color: '#3b82f6', icon: <DollarSign size={24} /> },
          { label: `ต้นทุนอะไหล่`, value: `฿${totalInventoryCost.toLocaleString()}`, color: '#ef4444', icon: <TrendingDown size={24} /> },
          { label: `กำไรสุทธิ`, value: `฿${totalNetProfit.toLocaleString()}`, color: '#10b981', icon: <TrendingUp size={24} /> },
          { label: 'เดือนปัจจุบัน (กำไร)', value: `฿${(monthlyData.find(m => m.month === MONTH_NAMES_TH[new Date().getMonth()])?.netProfit || 0).toLocaleString()}`, color: '#8b5cf6', icon: <Calendar size={24} /> },
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
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>📊 รายได้และกำไรรายเดือน (บาท)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="month" tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }} />
              <YAxis tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }} tickFormatter={v => v > 0 ? `฿${(v/1000).toFixed(0)}k` : '0'} />
              <Tooltip formatter={(v) => [`฿${v.toLocaleString()}`, '']} contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }} />
              <Bar dataKey="total" name="รายได้รวม" fill="#3b82f6" radius={[4,4,0,0]} />
              <Bar dataKey="netProfit" name="กำไรสุทธิ" fill="#10b981" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '0.75rem' }}>
            {[['#3b82f6', 'รายได้รวม'], ['#10b981', 'กำไรสุทธิ']].map(([color, label]) => (
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
