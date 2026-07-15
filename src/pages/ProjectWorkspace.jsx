import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, Routes, Route, useLocation } from 'react-router-dom';
import { ArrowLeft, LayoutDashboard, ListChecks, Thermometer, Printer, FolderGit2 } from 'lucide-react';
import useStore from '../store/useStore';
import LoadSchedule from './LoadSchedule';
import AirConCalculator from './AirConCalculator';

const ProjectWorkspace = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const project = useStore(state => state.projects?.find(p => p.id === id));
  
  if (!project) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <h2>ไม่พบโครงการนี้</h2>
        <button onClick={() => navigate('/projects')} style={{ padding: '0.75rem', background: 'var(--accent-secondary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
          กลับไปหน้ารวมโครงการ
        </button>
      </div>
    );
  }

  const currentTab = location.pathname.split('/').pop();

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      
      {/* Header */}
      <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button onClick={() => navigate('/projects')} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '0.5rem' }}>
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-gradient" style={{ marginBottom: 0, fontSize: '2rem' }}>โครงการ: {project.name}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>ลูกค้า: {project.customerName || 'ไม่ระบุ'} | สร้างเมื่อ {new Date(project.createdAt).toLocaleDateString('th-TH')}</p>
        </div>
      </div>

      <div className="print-only" style={{ marginBottom: '2rem', textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '1rem', display: 'none' }}>
        <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>รายงานวิศวกรรมโครงการ</h1>
        <h2 style={{ margin: '0.5rem 0', fontSize: '1.5rem', color: '#333' }}>{project.name}</h2>
        <p style={{ margin: 0, color: '#666' }}>ลูกค้า: {project.customerName || 'ไม่ระบุ'} | พิมพ์เมื่อ: {new Date().toLocaleDateString('th-TH')}</p>
      </div>

      {/* Tabs */}
      <div className="no-print" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        <Link 
          to={`/project/${id}`} 
          style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', whiteSpace: 'nowrap',
            background: currentTab === id ? 'var(--accent-secondary)' : 'var(--bg-secondary)', 
            color: currentTab === id ? 'white' : 'var(--text-secondary)',
            border: currentTab === id ? 'none' : '1px solid var(--border-color)'
          }}
        >
          <FolderGit2 size={20} /> ภาพรวมโครงการ (Print)
        </Link>
        <Link 
          to={`/project/${id}/load-schedule`} 
          style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', whiteSpace: 'nowrap',
            background: currentTab === 'load-schedule' ? 'var(--accent-primary)' : 'var(--bg-secondary)', 
            color: currentTab === 'load-schedule' ? 'white' : 'var(--text-secondary)',
            border: currentTab === 'load-schedule' ? 'none' : '1px solid var(--border-color)'
          }}
        >
          <ListChecks size={20} /> ตารางโหลด (Load Schedule)
        </Link>
        <Link 
          to={`/project/${id}/aircon`} 
          style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', whiteSpace: 'nowrap',
            background: currentTab === 'aircon' ? 'var(--accent-ac)' : 'var(--bg-secondary)', 
            color: currentTab === 'aircon' ? 'white' : 'var(--text-secondary)',
            border: currentTab === 'aircon' ? 'none' : '1px solid var(--border-color)'
          }}
        >
          <Thermometer size={20} /> คำนวณแอร์ (BTU)
        </Link>
      </div>

      {/* Content Area */}
      <div>
        <Routes>
          <Route path="/" element={<ProjectOverview project={project} />} />
          <Route path="/load-schedule" element={<LoadSchedule projectId={id} />} />
          <Route path="/aircon" element={<AirConCalculator projectId={id} />} />
        </Routes>
      </div>

    </div>
  );
};

const ProjectOverview = ({ project }) => {
  return (
    <div>
      <div className="no-print equipment-card" style={{ padding: '2rem', textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>พิมพ์รายงานรวมเล่ม (Full Project Report)</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>กดปุ่มด้านล่างเพื่อพิมพ์ข้อมูลทั้งหมดของโครงการนี้เป็น PDF ชุดเดียว</p>
        <button 
          onClick={() => window.print()}
          style={{ background: 'var(--accent-secondary)', color: 'white', border: 'none', padding: '1rem 2rem', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.75rem' }}
        >
          <Printer size={24} /> พิมพ์รายงานรวมโครงการ
        </button>
      </div>

      {/* Embedded Views for Printing */}
      <div className="print-page-break">
        <h2 className="print-only" style={{ borderBottom: '2px solid #ccc', paddingBottom: '0.5rem' }}>1. ตารางโหลด (Load Schedule) และ Single Line Diagram</h2>
        <LoadSchedule projectId={project.id} isReadOnly={true} />
      </div>
      
      <div className="print-page-break">
        <h2 className="print-only" style={{ borderBottom: '2px solid #ccc', paddingBottom: '0.5rem', marginTop: '2rem' }}>2. รายการคำนวณเครื่องปรับอากาศ (Air Conditioning)</h2>
        <AirConCalculator projectId={project.id} isReadOnly={true} />
      </div>
    </div>
  );
};

export default ProjectWorkspace;
