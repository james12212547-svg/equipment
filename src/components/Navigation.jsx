import { NavLink } from 'react-router-dom';
import { Home, List, BookOpen, Settings as SettingsIcon, ClipboardList, Heart, Calculator, Calendar, Users, FileText, Package, BarChart2, MessageCircle, Bell, LogOut, CreditCard, Zap, CheckCircle2 } from 'lucide-react';
import useStore from '../store/useStore';
import { useAuth } from '../contexts/AuthContext';

const Navigation = () => {
  const favorites = useStore(state => state.favorites);
  const notifications = useStore(state => state.notifications) || [];
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const { userRole, logout } = useAuth();
  
  return (
    <nav className="nav-bar">
      {/* App Sidebar Logo */}
      <div className="nav-logo">
        <div style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '0.5rem', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Zap size={24} color="#3b82f6" />
        </div>
        <span>Engineering Hub</span>
      </div>

      <NavLink 
        to="/" 
        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        end
      >
        <Home size={22} />
        <span>หน้าแรก</span>
      </NavLink>
      <NavLink 
        to="/calculators" 
        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
      >
        <Calculator size={22} />
        <span>คำนวณ</span>
      </NavLink>
      <NavLink 
        to="/learning" 
        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
      >
        <BookOpen size={22} />
        <span>ความรู้</span>
      </NavLink>

      <NavLink to="/schedule" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Calendar size={22} />
        <span>ตารางงาน</span>
      </NavLink>

      <NavLink to="/work-log" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <ClipboardList size={22} />
        <span>จดงาน</span>
      </NavLink>

      <NavLink to="/inventory" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Package size={22} />
        <span>คลังอะไหล่</span>
      </NavLink>

      {userRole === 'admin' && (
        <>
          <NavLink to="/quotation" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <FileText size={22} />
            <span>ใบเสนอราคา</span>
          </NavLink>

          <NavLink to="/invoice" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <CreditCard size={22} />
            <span>เอกสารการเงิน</span>
          </NavLink>

          <NavLink to="/customer-history" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Users size={22} />
            <span>ประวัติลูกค้า</span>
          </NavLink>

          <NavLink to="/revenue" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <BarChart2 size={22} />
            <span>รายได้</span>
          </NavLink>
        </>
      )}

      <NavLink to="/team-chat" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <MessageCircle size={22} />
        <span>แชททีม</span>
      </NavLink>

      <NavLink to="/notifications" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} style={{ position: 'relative' }}>
        <div style={{ position: 'relative' }}>
          <Bell size={22} />
          {unreadCount > 0 && (
            <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#ef4444', color: 'white', fontSize: '10px', fontWeight: 'bold', width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
        <span>แจ้งเตือน</span>
      </NavLink>

      <NavLink to="/favorites" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} style={{ position: 'relative' }}>
        <Heart size={22} color={favorites.length > 0 ? 'var(--accent-primary)' : 'var(--text-secondary)'} fill={favorites.length > 0 ? 'var(--accent-primary)' : 'none'} />
        <span>โปรด ({favorites.length})</span>
      </NavLink>

      <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <SettingsIcon size={22} />
        <span>ตั้งค่า</span>
      </NavLink>

      <button onClick={logout} className="nav-item" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444' }}>
        <LogOut size={22} />
        <span>ออกจากระบบ</span>
      </button>
    </nav>
  );
};

export default Navigation;
