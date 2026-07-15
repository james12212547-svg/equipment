import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FolderGit2, Plus, Trash2, ArrowRight, Calendar, User, Search } from 'lucide-react';
import useStore from '../store/useStore';

const ProjectDashboard = () => {
  const navigate = useNavigate();
  const projects = useStore(state => state.projects || []);
  const addProject = useStore(state => state.addProject);
  const deleteProject = useStore(state => state.deleteProject);

  const [searchTerm, setSearchTerm] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', customerName: '' });

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const handleCreateProject = (e) => {
    e.preventDefault();
    if (!newProject.name.trim()) return;
    
    addProject({
      name: newProject.name,
      customerName: newProject.customerName,
      loadScheduleData: [],
      demandFactor: 100,
      airConData: null
    });
    
    setNewProject({ name: '', customerName: '' });
    setShowNewModal(false);
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`คุณต้องการลบโครงการ "${name}" ใช่หรือไม่? ข้อมูลทั้งหมดในโครงการจะหายไป`)) {
      deleteProject(id);
    }
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>ระบบจัดการโครงการ</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Project Workspace สำหรับบันทึกและจัดการงานวิศวกรรม</p>
        </div>
        
        <button 
          onClick={() => setShowNewModal(true)}
          style={{ background: 'var(--accent-secondary)', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Plus size={20} /> สร้างโครงการใหม่
        </button>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '2rem' }}>
        <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
        <input 
          type="text" 
          placeholder="ค้นหาชื่อโครงการ หรือ ชื่อลูกค้า..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '1rem' }}
        />
      </div>

      {/* Project List */}
      {filteredProjects.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {filteredProjects.map(project => (
            <div key={project.id} className="equipment-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ background: 'rgba(255, 165, 0, 0.1)', padding: '0.75rem', borderRadius: '8px', color: 'var(--accent-secondary)' }}>
                    <FolderGit2 size={24} />
                  </div>
                  <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.25rem' }}>{project.name}</h3>
                </div>
                <button onClick={() => handleDelete(project.id, project.name)} style={{ background: 'transparent', border: 'none', color: '#F44336', cursor: 'pointer', padding: '0.25rem' }}>
                  <Trash2 size={18} />
                </button>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem', flex: 1 }}>
                {project.customerName && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    <User size={16} /> ลูกค้า: {project.customerName}
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                  <Calendar size={16} /> สร้างเมื่อ: {new Date(project.createdAt).toLocaleDateString('th-TH')}
                </div>
              </div>

              <Link 
                to={`/project/${project.id}`} 
                style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', textDecoration: 'none', padding: '0.75rem', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', border: '1px solid var(--border-color)', transition: 'background 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'}
              >
                เปิดโครงการ <ArrowRight size={18} />
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px dashed var(--border-color)' }}>
          <FolderGit2 size={48} color="var(--text-tertiary)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ margin: '0 0 0.5rem', color: 'var(--text-primary)' }}>ยังไม่มีโครงการ</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>กดปุ่มด้านบนเพื่อสร้างโครงการแรกของคุณ</p>
          <button 
            onClick={() => setShowNewModal(true)}
            style={{ background: 'var(--accent-secondary)', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            สร้างโครงการใหม่
          </button>
        </div>
      )}

      {/* New Project Modal */}
      {showNewModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="equipment-card animate-fade-in" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
            <h2 style={{ margin: '0 0 1.5rem', color: 'var(--text-primary)' }}>สร้างโครงการใหม่</h2>
            <form onSubmit={handleCreateProject}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>ชื่อโครงการ *</label>
                <input 
                  type="text" 
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  placeholder="เช่น ปรับปรุงระบบไฟโกดัง A"
                  required
                  autoFocus
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>ชื่อลูกค้า (ตัวเลือก)</label>
                <input 
                  type="text" 
                  value={newProject.customerName}
                  onChange={(e) => setNewProject({ ...newProject, customerName: e.target.value })}
                  placeholder="เช่น บริษัท เอบีซี จำกัด"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="button" onClick={() => setShowNewModal(false)} style={{ flex: 1, padding: '0.75rem', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px', cursor: 'pointer' }}>
                  ยกเลิก
                </button>
                <button type="submit" style={{ flex: 1, padding: '0.75rem', background: 'var(--accent-secondary)', border: 'none', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                  สร้างโครงการ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDashboard;
